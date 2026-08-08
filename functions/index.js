const crypto=require("node:crypto");
const express=require("express");
const {onRequest}=require("firebase-functions/v2/https");
const {onDocumentCreated}=require("firebase-functions/v2/firestore");
const {defineSecret}=require("firebase-functions/params");
const {initializeApp}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const {FieldValue,getFirestore}=require("firebase-admin/firestore");
const {google}=require("googleapis");
const nodemailer=require("nodemailer");

initializeApp();
const db=getFirestore();
const app=express();
app.use(express.json({limit:"32kb"}));

const PACKAGE_NAME="com.drawervillage.app";
const PRODUCTS=new Set(["character_slots_5","town_slot_1","storage_50mb","green_tea"]);
const FEEDBACK_EMAIL="kkyareuk@gmail.com";
const FEEDBACK_GMAIL_APP_PASSWORD=defineSecret("FEEDBACK_GMAIL_APP_PASSWORD");

app.use((request,response,next)=>{
  response.set("Access-Control-Allow-Origin",request.get("Origin")||"*");
  response.set("Vary","Origin");
  response.set("Access-Control-Allow-Headers","Authorization, Content-Type");
  response.set("Access-Control-Allow-Methods","POST, OPTIONS");
  if(request.method==="OPTIONS")return response.status(204).end();
  next();
});

async function signedInUser(request){
  const authorization=String(request.get("Authorization")||"");
  if(!authorization.startsWith("Bearer "))throw Object.assign(new Error("Google 로그인이 필요합니다."),{status:401});
  return getAuth().verifyIdToken(authorization.slice(7),true);
}

async function playPurchase(productId,purchaseToken){
  const auth=new google.auth.GoogleAuth({scopes:["https://www.googleapis.com/auth/androidpublisher"]});
  const publisher=google.androidpublisher({version:"v3",auth});
  const result=await publisher.purchases.products.get({
    packageName:PACKAGE_NAME,
    productId,
    token:purchaseToken
  });
  return result.data||{};
}

function nextEntitlements(current,productId,quantity){
  const count=Math.max(1,Math.min(100,Number(quantity)||1));
  const purchases=Array.from(new Set([...(Array.isArray(current?.purchases)?current.purchases:[]),productId]));
  const next={...(current||{}),purchases};
  if(productId==="character_slots_5")next.characterSlotPacks=(Number(current?.characterSlotPacks)||0)+count;
  if(productId==="town_slot_1")next.townSlotPacks=(Number(current?.townSlotPacks)||0)+count;
  if(productId==="storage_50mb")next.storage50=true;
  if(productId==="green_tea")next.teaSupportCount=(Number(current?.teaSupportCount)||0)+count;
  return next;
}

app.post("/play-billing/verify",async(request,response)=>{
  try{
    const identity=await signedInUser(request);
    const packageName=String(request.body?.packageName||"");
    const productId=String(request.body?.productId||"");
    const purchaseToken=String(request.body?.purchaseToken||"");
    if(packageName!==PACKAGE_NAME)throw Object.assign(new Error("앱 패키지 정보가 일치하지 않습니다."),{status:400});
    if(!PRODUCTS.has(productId))throw Object.assign(new Error("등록되지 않은 상품입니다."),{status:400});
    if(!purchaseToken||purchaseToken.length>4096)throw Object.assign(new Error("구매 토큰이 올바르지 않습니다."),{status:400});

    const purchase=await playPurchase(productId,purchaseToken);
    if(Number(purchase.purchaseState)!==0)throw Object.assign(new Error("Google Play에서 완료된 구매가 아닙니다."),{status:409});
    if(request.body?.orderId&&purchase.orderId&&request.body.orderId!==purchase.orderId){
      throw Object.assign(new Error("주문번호가 일치하지 않습니다."),{status:409});
    }
    const quantity=Math.max(1,Number(purchase.quantity)||Number(request.body?.quantity)||1);
    const receiptId=crypto.createHash("sha256").update(`${PACKAGE_NAME}:${productId}:${purchaseToken}`).digest("hex");
    const receiptRef=db.collection("playPurchases").doc(receiptId);
    const userRef=db.collection("users").doc(identity.uid);
    let alreadyApplied=false;

    await db.runTransaction(async transaction=>{
      const [receipt,user]=await Promise.all([
        transaction.get(receiptRef),
        transaction.get(userRef)
      ]);
      if(receipt.exists){
        const saved=receipt.data()||{};
        if(saved.uid!==identity.uid||saved.productId!==productId){
          throw Object.assign(new Error("이미 다른 계정에서 처리된 구매입니다."),{status:409});
        }
        alreadyApplied=true;
        return;
      }
      transaction.set(receiptRef,{
        uid:identity.uid,
        productId,
        packageName:PACKAGE_NAME,
        orderId:purchase.orderId||String(request.body?.orderId||""),
        quantity,
        purchaseTimeMillis:Number(purchase.purchaseTimeMillis)||0,
        createdAt:FieldValue.serverTimestamp()
      });
      transaction.set(userRef,{
        entitlements:nextEntitlements(user.data()?.entitlements,productId,quantity),
        updatedAt:FieldValue.serverTimestamp()
      },{merge:true});
    });

    response.json({verified:true,entitlementApplied:true,alreadyApplied,productId,quantity});
  }catch(error){
    console.error("Play Billing verification failed",error);
    response.status(Number(error.status)||500).json({
      verified:false,
      entitlementApplied:false,
      message:Number(error.status)?error.message:"Google Play 구매를 검증하지 못했습니다."
    });
  }
});

exports.api=onRequest({region:"asia-northeast3",timeoutSeconds:30,memory:"256MiB"},app);

function cleanMailLine(value,maximum=3000){
  return String(value||"")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"")
    .trim()
    .slice(0,maximum);
}

exports.feedbackEmail=onDocumentCreated({
  document:"feedback/{feedbackId}",
  region:"asia-northeast3",
  timeoutSeconds:30,
  memory:"256MiB",
  secrets:[FEEDBACK_GMAIL_APP_PASSWORD],
  retry:true
},async event=>{
  const snapshot=event.data;
  if(!snapshot)return;
  const data=snapshot.data()||{};
  if(data.mailSentAt)return;

  const category=cleanMailLine(data.category,40)||"기타";
  const message=cleanMailLine(data.message,3000);
  const replyEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.replyEmail||""))
    ?String(data.replyEmail)
    :"";
  if(!message){
    await snapshot.ref.set({status:"mail-skipped",mailError:"내용 없음"},{merge:true});
    return;
  }

  const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{user:FEEDBACK_EMAIL,pass:FEEDBACK_GMAIL_APP_PASSWORD.value()}
  });
  const lines=[
    `[분류] ${category}`,
    `[계정 UID] ${cleanMailLine(data.uid,160)}`,
    `[페이지] ${cleanMailLine(data.page,500)}`,
    `[브라우저] ${cleanMailLine(data.userAgent,500)}`,
    replyEmail?`[답장 주소] ${replyEmail}`:"[답장 주소] 받지 않음",
    "",
    message
  ];
  await transporter.sendMail({
    from:`서랍마을 피드백 <${FEEDBACK_EMAIL}>`,
    to:FEEDBACK_EMAIL,
    replyTo:replyEmail||undefined,
    subject:`[서랍마을 피드백] ${category}`,
    text:lines.join("\n")
  });
  await snapshot.ref.set({status:"mail-sent",mailSentAt:FieldValue.serverTimestamp()},{merge:true});
});
