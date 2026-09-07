const crypto=require('node:crypto');
const fs=require('node:fs');
const {SignedDataVerifier,AppStoreServerAPIClient,Environment}=require('@apple/app-store-server-library');
const bundleId='com.drawervillage.app';
const productMap=Object.freeze({
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
function appleServices(privateKey){
 const environment=process.env.APPLE_IAP_ENVIRONMENT,appId=Number(process.env.APPLE_APP_ID);
 if(process.env.APPLE_BILLING_ENABLED!=='true'||![Environment.PRODUCTION,Environment.SANDBOX].includes(environment)||!process.env.APPLE_IAP_KEY_ID||!process.env.APPLE_IAP_ISSUER_ID||!privateKey||environment===Environment.PRODUCTION&&(!Number.isSafeInteger(appId)||appId<=0))throw fail('APPLE_NOT_CONFIGURED',503);
 const verifier=new SignedDataVerifier([fs.readFileSync(__dirname+'/certificates/AppleRootCA-G3.cer')],true,environment,bundleId,environment===Environment.PRODUCTION?appId:undefined);
 const api=new AppStoreServerAPIClient(privateKey,process.env.APPLE_IAP_KEY_ID,process.env.APPLE_IAP_ISSUER_ID,bundleId,environment);
 return {environment,verifier,api};
}
function installAppleBilling(app,{db,signedInUser,nextEntitlements,serverTimestamp,privateKey,services=()=>appleServices(privateKey())}){
 const handle=fn=>async(req,res)=>{try{await fn(req,res)}catch(e){res.status(Number.isInteger(e.status)&&e.status>=400&&e.status<=599?e.status:503).json({verified:false,entitlementApplied:false,code:e.code||'APPLE_VERIFICATION_FAILED'})}};
 app.post('/apple-billing/prepare',handle(async(req,res)=>{const identity=await signedInUser(req),service=services();res.json({appAccountToken:accountToken(identity.uid),environment:service.environment,products:productMap})}));
 app.post('/apple-billing/verify',handle(async(req,res)=>{
  const identity=await signedInUser(req),id=String(req.body?.transactionId||'');if(!/^\d{1,30}$/.test(id))throw fail('APPLE_INVALID_TRANSACTION',400);
  const service=services();
  // Query Apple's current signed state, never trust a client-decoded receipt.
  const result=await service.api.getTransactionInfo(id);const purchase=await service.verifier.verifyAndDecodeTransaction(result.signedTransactionInfo);
  const {productId,quantity}=validatePurchase(purchase,identity.uid,service.environment,id);
  const ref=db.collection('applePurchases').doc(service.environment+'-'+id),userRef=db.collection('users').doc(identity.uid);
  const field=service.environment===Environment.SANDBOX?'appleSandboxEntitlements':'entitlements';let alreadyApplied=false;
  await db.runTransaction(async tx=>{
   const [receipt,user]=await Promise.all([tx.get(ref),tx.get(userRef)]);
   if(receipt.exists){const saved=receipt.data();if(saved.uid!==identity.uid||saved.productId!==productId)throw fail('APPLE_ACCOUNT_MISMATCH');if(saved.revoked)throw fail('APPLE_REVOKED');alreadyApplied=true;return}
   tx.set(ref,{uid:identity.uid,productId,storeProductId:purchase.productId,quantity,environment:service.environment,createdAt:serverTimestamp(),revoked:false});
   tx.set(userRef,{[field]:nextEntitlements(user.data()?.[field],productId,quantity),updatedAt:serverTimestamp()},{merge:true});
  });
  res.json({verified:true,entitlementApplied:true,alreadyApplied,productId,quantity,environment:service.environment});
 }));
 // A refund arriving before verification leaves a tombstone, so replay cannot grant it.
 app.post('/apple-billing/notifications',handle(async(req,res)=>{
  const service=services();const notice=await service.verifier.verifyAndDecodeNotification(String(req.body?.signedPayload||''));
  if(!['REFUND','REVOKE'].includes(notice.notificationType)){res.json({received:true});return}
  const purchase=await service.verifier.verifyAndDecodeTransaction(notice.data?.signedTransactionInfo||'');
  if(purchase.bundleId!==bundleId||purchase.environment!==service.environment||!productMap[purchase.productId]||!/^\d{1,30}$/.test(purchase.transactionId||''))throw fail('APPLE_INVALID_TRANSACTION');
  const ref=db.collection('applePurchases').doc(service.environment+'-'+purchase.transactionId);
  await db.runTransaction(async tx=>{
   const receipt=await tx.get(ref),saved=receipt.data();if(saved?.revoked)return;
   if(saved?.uid){
    const userRef=db.collection('users').doc(saved.uid),user=await tx.get(userRef),field=service.environment===Environment.SANDBOX?'appleSandboxEntitlements':'entitlements';
    const ent={...(user.data()?.[field]||{})},key={character_slots_5:'characterSlotPacks',town_slot_1:'townSlotPacks',green_tea:'teaSupportCount'}[saved.productId];
    if(key)ent[key]=Math.max(0,(Number(ent[key])||0)-saved.quantity);
    tx.set(userRef,{[field]:ent,updatedAt:serverTimestamp()},{merge:true});
   }
   tx.set(ref,{revoked:true,revokedAt:serverTimestamp()},{merge:true});
  });res.json({received:true});
 }));
}
module.exports={productMap,accountToken,validatePurchase,installAppleBilling};
