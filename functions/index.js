const crypto=require("node:crypto");
const express=require("express");
const {onRequest}=require("firebase-functions/v2/https");
const {defineSecret}=require("firebase-functions/params");
const {initializeApp}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const {FieldValue,getFirestore}=require("firebase-admin/firestore");
const {google}=require("googleapis");

initializeApp();
const db=getFirestore();
const app=express();
app.use(express.json({limit:"32kb"}));

const PACKAGE_NAME="com.drawervillage.app";
const PRODUCTS=new Set(["character_slots_5","town_slot_1","storage_50mb","green_tea"]);
const WEB_PRODUCTS=Object.freeze({
  character_slots_5:{name:"캐릭터 슬롯 5개 추가",amount:1200},
  town_slot_1:{name:"마을 슬롯 1개 추가",amount:1900},
  storage_50mb:{name:"사진 저장 공간 50MB 추가",amount:2900},
  green_tea:{name:"개발자에게 녹차 사주기",amount:1500}
});
const TOSS_MID="drawerg8ht";
const TOSS_SECRET_KEY=defineSecret("TOSS_SECRET_KEY");
const WEB_GAME_PAYMENT_LIMIT=50000;

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

function webCart(rawItems){
  if(!Array.isArray(rawItems)||!rawItems.length||rawItems.length>4){
    throw Object.assign(new Error("장바구니 상품을 확인해 주세요."),{status:400});
  }
  const seen=new Set();
  return rawItems.map(raw=>{
    const packageId=String(raw?.packageId||"");
    const quantity=Number(raw?.quantity);
    if(!WEB_PRODUCTS[packageId]||seen.has(packageId)||!Number.isInteger(quantity)||quantity<1||quantity>20){
      throw Object.assign(new Error("장바구니 상품 또는 수량이 올바르지 않습니다."),{status:400});
    }
    if(packageId==="storage_50mb"&&quantity!==1){
      throw Object.assign(new Error("사진 저장 공간 상품은 한 번에 하나만 구매할 수 있습니다."),{status:400});
    }
    seen.add(packageId);
    return {packageId,quantity,name:WEB_PRODUCTS[packageId].name,unitAmount:WEB_PRODUCTS[packageId].amount};
  });
}

function orderSummary(items){
  const amount=items.reduce((sum,item)=>sum+item.unitAmount*item.quantity,0);
  const count=items.reduce((sum,item)=>sum+item.quantity,0);
  const first=items[0]?.name||"서랍마을 상품";
  return {amount,count,orderName:items.length===1&&items[0].quantity===1?first:`${first} 외 ${Math.max(1,count-1)}건`};
}

app.post("/payments/orders",async(request,response)=>{
  try{
    const identity=await signedInUser(request);
    const items=webCart(request.body?.items);
    const {amount,count,orderName}=orderSummary(items);
    if(amount<100||amount>=WEB_GAME_PAYMENT_LIMIT)throw Object.assign(new Error("게임 상품은 한 번에 5만원 미만으로만 결제할 수 있습니다."),{status:400});
    const orderId=`dv_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
    const customerKey=`DV_${crypto.createHash("sha256").update(identity.uid).digest("hex").slice(0,40)}`;
    const order={
      uid:identity.uid,
      orderId,
      amount,
      count,
      orderName:orderName.slice(0,100),
      items:items.map(({packageId,quantity,unitAmount})=>({packageId,quantity,unitAmount})),
      status:"CREATED",
      paymentEnvironment:"test",
      mid:TOSS_MID,
      createdAt:FieldValue.serverTimestamp(),
      updatedAt:FieldValue.serverTimestamp()
    };
    await db.collection("paymentOrders").doc(orderId).set(order);
    response.json({
      orderId,
      amount,
      orderName:order.orderName,
      customerKey,
      customerEmail:String(identity.email||"").slice(0,100),
      customerName:String(identity.name||"서랍마을 이용자").slice(0,100)
    });
  }catch(error){
    console.error("Toss order creation failed",error);
    response.status(Number(error.status)||500).json({message:Number(error.status)?error.message:"주문을 만들지 못했습니다."});
  }
});

app.post("/payments/confirm",async(request,response)=>{
  try{
    const identity=await signedInUser(request);
    const paymentKey=String(request.body?.paymentKey||"");
    const orderId=String(request.body?.orderId||"");
    const amount=Number(request.body?.amount);
    if(!paymentKey||paymentKey.length>200||!/^[A-Za-z0-9_-]{6,64}$/.test(orderId)||!Number.isInteger(amount)){
      throw Object.assign(new Error("결제 승인 정보가 올바르지 않습니다."),{status:400});
    }
    const orderRef=db.collection("paymentOrders").doc(orderId);
    const orderSnapshot=await orderRef.get();
    if(!orderSnapshot.exists)throw Object.assign(new Error("서버에 저장된 주문을 찾지 못했습니다."),{status:404});
    const order=orderSnapshot.data()||{};
    if(order.uid!==identity.uid)throw Object.assign(new Error("다른 계정의 주문은 승인할 수 없습니다."),{status:403});
    if(Number(order.amount)!==amount)throw Object.assign(new Error("주문금액이 달라 결제를 중단했습니다."),{status:409});
    if(order.status==="DONE")return response.json({approved:true,alreadyApplied:true,productName:order.orderName,message:"이미 완료된 구매입니다."});

    const secretKey=String(TOSS_SECRET_KEY.value()||"").trim();
    if(!/^(test|live)_sk_/.test(secretKey))throw new Error("토스페이먼츠 시크릿 키가 서버에 설정되지 않았습니다.");
    const tossResponse=await fetch("https://api.tosspayments.com/v1/payments/confirm",{
      method:"POST",
      headers:{
        "Authorization":`Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
        "Content-Type":"application/json",
        "Idempotency-Key":`drawer-village-${orderId}`
      },
      body:JSON.stringify({paymentKey,orderId,amount})
    });
    const payment=await tossResponse.json().catch(()=>({}));
    if(!tossResponse.ok){
      const tossError=Object.assign(new Error(payment.message||"토스페이먼츠 결제 승인에 실패했습니다."),{status:400});
      tossError.code=payment.code||"TOSS_CONFIRM_FAILED";
      throw tossError;
    }
    if(payment.orderId!==orderId||Number(payment.totalAmount)!==amount||payment.status!=="DONE"){
      throw Object.assign(new Error("승인된 결제 정보가 저장된 주문과 일치하지 않습니다."),{status:409});
    }
    if(payment.mId&&payment.mId!==TOSS_MID){
      throw Object.assign(new Error("승인된 결제의 상점아이디가 계약 MID와 다릅니다."),{status:409});
    }

    let alreadyApplied=false;
    await db.runTransaction(async transaction=>{
      const [freshOrder,user]=await Promise.all([transaction.get(orderRef),transaction.get(db.collection("users").doc(identity.uid))]);
      const currentOrder=freshOrder.data()||{};
      if(currentOrder.status==="DONE"){alreadyApplied=true;return}
      let entitlements=user.data()?.entitlements||{};
      for(const item of currentOrder.items||[])entitlements=nextEntitlements(entitlements,item.packageId,item.quantity);
      transaction.set(db.collection("users").doc(identity.uid),{entitlements,updatedAt:FieldValue.serverTimestamp()},{merge:true});
      transaction.set(orderRef,{
        status:"DONE",
        paymentKeyHash:crypto.createHash("sha256").update(paymentKey).digest("hex"),
        method:payment.method||"",
        approvedAt:payment.approvedAt||"",
        receiptUrl:payment.receipt?.url||"",
        updatedAt:FieldValue.serverTimestamp()
      },{merge:true});
    });
    response.json({approved:true,alreadyApplied,productName:order.orderName,message:alreadyApplied?"이미 완료된 구매입니다.":`${order.orderName} 구매가 계정에 적용됐습니다.`});
  }catch(error){
    console.error("Toss payment confirmation failed",error);
    response.status(Number(error.status)||500).json({code:error.code||"PAYMENT_CONFIRM_FAILED",message:Number(error.status)?error.message:"결제를 승인하지 못했습니다."});
  }
});

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

exports.api=onRequest({region:"asia-northeast3",timeoutSeconds:30,memory:"256MiB",secrets:[TOSS_SECRET_KEY]},app);
