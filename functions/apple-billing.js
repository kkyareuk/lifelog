const crypto=require('node:crypto');
const fs=require('node:fs');
const {SignedDataVerifier,AppStoreServerAPIClient,Environment,VerificationStatus}=require('@apple/app-store-server-library');
const bundleId='com.drawervillage.app';
const productMap=Object.freeze({
 'com.drawervillage.app.diamonds_100':'diamonds_100',
 'com.drawervillage.app.character_slot_1':'character_slot_1',
 'com.drawervillage.app.character_slots_5':'character_slots_5',
 'com.drawervillage.app.town_slot_1':'town_slot_1',
 'com.drawervillage.app.green_tea':'green_tea'
});
function fail(code,status=409){return Object.assign(new Error(code),{code,status})}
function accountToken(uid){
 const b=crypto.createHash('sha256').update('drawer-village.apple-account.v1:'+uid).digest().subarray(0,16);b[6]=(b[6]&15)|80;b[8]=(b[8]&63)|128;
 const h=b.toString('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
function validatePurchase(p,uid,environment,transactionId){
 const productId=productMap[p.productId];
 if(!productId||p.bundleId!==bundleId||p.environment!==environment||p.type!=='Consumable')throw fail('APPLE_INVALID_TRANSACTION');
 if(p.transactionId!==transactionId||!/^\d{1,30}$/.test(p.transactionId||''))throw fail('APPLE_INVALID_TRANSACTION');
 if(String(p.appAccountToken||'').toLowerCase()!==accountToken(uid))throw fail('APPLE_ACCOUNT_MISMATCH');
 if(p.revocationDate||p.inAppOwnershipType==='FAMILY_SHARED')throw fail('APPLE_REVOKED');
 if(!Number.isSafeInteger(p.quantity)||p.quantity<1||p.quantity>100)throw fail('APPLE_INVALID_TRANSACTION');
 return {productId,quantity:p.quantity};
}
function appleServices(privateKey,environment=process.env.APPLE_IAP_ENVIRONMENT){
 const appId=Number(process.env.APPLE_APP_ID);
 if(process.env.APPLE_BILLING_ENABLED!=='true'||![Environment.PRODUCTION,Environment.SANDBOX].includes(environment)||!process.env.APPLE_IAP_KEY_ID||!process.env.APPLE_IAP_ISSUER_ID||!privateKey||environment===Environment.PRODUCTION&&(!Number.isSafeInteger(appId)||appId<=0))throw fail('APPLE_NOT_CONFIGURED',503);
 const verifier=new SignedDataVerifier([fs.readFileSync(__dirname+'/certificates/AppleRootCA-G3.cer')],true,environment,bundleId,environment===Environment.PRODUCTION?appId:undefined);
 const api=new AppStoreServerAPIClient(privateKey,process.env.APPLE_IAP_KEY_ID,process.env.APPLE_IAP_ISSUER_ID,bundleId,environment);
 return {environment,verifier,api};
}
function installAppleBilling(app,{db,signedInUser,nextEntitlements,serverTimestamp,privateKey,services=environment=>appleServices(privateKey(),environment)}){
 const handle=fn=>async(req,res)=>{try{await fn(req,res)}catch(e){res.status(Number.isInteger(e.status)&&e.status>=400&&e.status<=599?e.status:503).json({verified:false,entitlementApplied:false,code:e.code||'APPLE_VERIFICATION_FAILED'})}};
 // Read-only recovery of already verified test purchases; never writes production grants.
 app.post('/apple-billing/entitlements',handle(async(req,res)=>{const identity=await signedInUser(req);const snapshot=await db.collection('appleSandboxAccounts').doc(identity.uid).get();res.json({uid:identity.uid,sandboxEntitlements:snapshot.data()?.appleSandboxEntitlements||{}})}));
 app.post('/apple-billing/prepare',handle(async(req,res)=>{const identity=await signedInUser(req),service=services();res.json({appAccountToken:accountToken(identity.uid),environment:service.environment,products:productMap})}));
 app.post('/apple-billing/verify',handle(async(req,res)=>{
  const identity=await signedInUser(req),id=String(req.body?.transactionId||'');if(!/^\d{1,30}$/.test(id))throw fail('APPLE_INVALID_TRANSACTION',400);
  let service=services();
  // Route using a verified Apple JWS, never a client environment flag. This
  // also supports review transactions before Production recognizes a new app.
  if(req.body?.signedTransaction){
   const jws=req.body.signedTransaction;
   if(typeof jws!=='string'||jws.length>24000)throw fail('APPLE_INVALID_TRANSACTION',400);
   let hinted;
   try{hinted=JSON.parse(Buffer.from(jws.split('.')[1]||'', 'base64url').toString()).environment}catch{throw fail('APPLE_INVALID_TRANSACTION',400)}
   if(![Environment.PRODUCTION,Environment.SANDBOX].includes(hinted))throw fail('APPLE_INVALID_TRANSACTION',400);
   service=services(hinted);
   const signed=await service.verifier.verifyAndDecodeTransaction(jws);
   validatePurchase(signed,identity.uid,service.environment,id);
  }
  // Query Apple's current signed state, never trust a client-decoded receipt.
  let result;
  try{result=await service.api.getTransactionInfo(id)}catch(error){
   if(service.environment!==Environment.PRODUCTION||error.apiError!==4040010)throw error;
   service=services(Environment.SANDBOX);result=await service.api.getTransactionInfo(id);
  }
  const purchase=await service.verifier.verifyAndDecodeTransaction(result.signedTransactionInfo);
  const {productId,quantity}=validatePurchase(purchase,identity.uid,service.environment,id);
  const ref=db.collection('applePurchases').doc(service.environment+'-'+id),userRef=db.collection(service.environment===Environment.SANDBOX?'appleSandboxAccounts':'users').doc(identity.uid);
  const field=service.environment===Environment.SANDBOX?'appleSandboxEntitlements':'entitlements';let alreadyApplied=false,grantedEntitlements;
  await db.runTransaction(async tx=>{
   const [receipt,user]=await Promise.all([tx.get(ref),tx.get(userRef)]);
   if(receipt.exists){const saved=receipt.data();if(saved.uid!==identity.uid||saved.productId!==productId)throw fail('APPLE_ACCOUNT_MISMATCH');if(saved.revoked)throw fail('APPLE_REVOKED');alreadyApplied=true;grantedEntitlements=user.data()?.[field];return}
   tx.set(ref,{uid:identity.uid,productId,storeProductId:purchase.productId,quantity,environment:service.environment,createdAt:serverTimestamp(),revoked:false});
   grantedEntitlements=nextEntitlements(user.data()?.[field],productId,quantity);
   tx.set(userRef,{[field]:grantedEntitlements,updatedAt:serverTimestamp()},{merge:true});
  });
  res.json({uid:identity.uid,verified:true,entitlementApplied:true,alreadyApplied,productId,quantity,environment:service.environment,entitlements:grantedEntitlements});
 }));
 // A refund arriving before verification leaves a tombstone, so replay cannot grant it.
 app.post('/apple-billing/notifications',handle(async(req,res)=>{
  const signedPayload=String(req.body?.signedPayload||'');
  if(!signedPayload||signedPayload.length>100000)throw fail('APPLE_INVALID_NOTIFICATION',400);
  // Sandbox TEST notices omit appAppleId. Select a verifier before its app-ID
  // check; the untrusted hint never authorizes a notice or a database write.
  let payload;
  try{payload=JSON.parse(Buffer.from(signedPayload.split('.')[1]||'','base64url').toString())}catch{throw fail('APPLE_INVALID_NOTIFICATION',400)}
  const hinted=payload.data?.environment??payload.summary?.environment??payload.appData?.environment;
  if(![Environment.PRODUCTION,Environment.SANDBOX].includes(hinted))throw fail('APPLE_INVALID_NOTIFICATION',400);
  const service=services(hinted),notice=await service.verifier.verifyAndDecodeNotification(signedPayload);
  if(!['REFUND','REVOKE'].includes(notice.notificationType)){res.json({received:true});return}
  const purchase=await service.verifier.verifyAndDecodeTransaction(notice.data?.signedTransactionInfo||'');
  if(purchase.bundleId!==bundleId||purchase.environment!==service.environment||!productMap[purchase.productId]||!/^\d{1,30}$/.test(purchase.transactionId||''))throw fail('APPLE_INVALID_TRANSACTION');
  const ref=db.collection('applePurchases').doc(service.environment+'-'+purchase.transactionId);
  await db.runTransaction(async tx=>{
   const receipt=await tx.get(ref),saved=receipt.data();if(saved?.revoked)return;
   if(saved?.uid){
    const userRef=db.collection(service.environment===Environment.SANDBOX?'appleSandboxAccounts':'users').doc(saved.uid),user=await tx.get(userRef),field=service.environment===Environment.SANDBOX?'appleSandboxEntitlements':'entitlements';
    const ent={...(user.data()?.[field]||{})},key={character_slot_1:'characterSingleSlots',character_slots_5:'characterSlotPacks',town_slot_1:'townSlotPacks',green_tea:'teaSupportCount'}[saved.productId];
    if(saved.productId==='diamonds_100')ent.diamondPaid=(Number(ent.diamondPaid)||0)-saved.quantity*100;
    if(key)ent[key]=Math.max(0,(Number(ent[key])||0)-saved.quantity);
    const deleted=await tx.get(db.collection("deletedAccounts").doc(saved.uid));
    if(!deleted.exists)tx.set(userRef,{[field]:ent,updatedAt:serverTimestamp()},{merge:true});
   }
   tx.set(ref,{revoked:true,revokedAt:serverTimestamp()},{merge:true});
  });res.json({received:true});
 }));
}
module.exports={productMap,accountToken,validatePurchase,installAppleBilling};
