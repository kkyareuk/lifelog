// iOS adapter. The existing shop interface is shared; Google Play is never called here.
(function(){
 if(!window.Capacitor?.isNativePlatform?.()||window.Capacitor.getPlatform()!=='ios')return;
 const bridge=window.Capacitor.Plugins.AppleBilling,config=()=>window.PARALLEL_CITY_CONFIG?.appleBilling||{};
 const messages={
 LOGIN_REQUIRED:['서랍마을 계정에 로그인한 뒤 구매해 주세요.','Sign in to your Drawer Village account before purchasing.','購入前にひきだし村アカウントでログインしてください。'],
 PURCHASE_CANCELLED:['구매를 취소했어요.','Purchase cancelled.','購入をキャンセルしました。'],
 PURCHASE_PENDING:['Apple에서 구매 승인 대기 중이에요. 승인되면 구매 내역을 다시 확인해 주세요.','The purchase is awaiting Apple approval. Check purchases after approval.','Appleで購入の承認を待っています。承認後に購入履歴を確認してください。'],
 APPLE_NOT_CONFIGURED:['Apple 결제 연결을 준비 중이에요. 아직 결제는 시작되지 않았어요.','Apple billing setup is pending. No purchase has been started.','Apple決済の接続を準備中です。購入は開始していません。'],
 APPLE_ACCOUNT_MISMATCH:['이 구매에 연결된 서랍마을 계정으로 로그인해 주세요.','Sign in to the Drawer Village account linked to this purchase.','この購入に紐づくひきだし村アカウントでログインしてください。'],
 APPLE_REVOKED:['취소되거나 환불된 구매입니다.','This purchase was cancelled or refunded.','キャンセルまたは返金済みの購入です。'],
 BUSY:['다른 구매를 확인 중이에요. 잠시 기다려 주세요.','Another purchase is being checked. Please wait.','別の購入を確認しています。しばらくお待ちください。'],
 FAILED:['구매 확인을 끝내지 못했어요. 다시 결제하지 말고 구매 내역 복원을 눌러 주세요.','Purchase verification is incomplete. Restore purchases instead of paying again.','購入確認を完了できませんでした。再購入せず、購入の復元をお試しください。']
 };
 const error=code=>{const index=String(document.documentElement.lang).startsWith('en')?1:String(document.documentElement.lang).startsWith('ja')?2:0;return Object.assign(new Error((messages[code]||messages.FAILED)[index]),{code})};
 let busy=false,backgroundRestore=null,phase='idle';
 const phaseText={restoring:['구매 내역 확인 중…','Checking purchases…','購入履歴を確認中…'],account:['계정 확인 중…','Checking account…','アカウントを確認中…'],product:['Apple 상품 확인 중…','Loading Apple product…','Apple商品を確認中…'],payment:['Apple 결제창 응답 대기 중…','Waiting for Apple payment…','Apple決済の応答を待機中…'],verifying:['구매 지급 확인 중…','Verifying purchase…','購入を確認中…']};
 const getState=()=>({busy,phase,label:(phaseText[phase]||[])[String(document.documentElement.lang).startsWith('en')?1:String(document.documentElement.lang).startsWith('ja')?2:0]||''});
 const setPhase=value=>{phase=value;window.dispatchEvent?.(new CustomEvent('drawer-village-billing-state',{detail:getState()}))};
 const bounded=(work,ms=25000)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(error('FAILED')),ms);Promise.resolve(work).then(resolve,reject).finally(()=>clearTimeout(timer))});
 const refreshAccount=()=>{void Promise.resolve().then(()=>window.ParallelCityAuth?.download?.({automatic:false})).catch(()=>{})};
 async function token(){const value=await bounded(window.ParallelCityAuth?.getIdToken?.());if(!value)throw error('LOGIN_REQUIRED');return value}
 async function request(path,body,auth){
  const backend=String(config().backendUrl||'').replace(/\/$/,'');if(!backend)throw error('APPLE_NOT_CONFIGURED');
  let response;try{response=await fetch(backend+'/apple-billing/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)})}catch{throw error('FAILED')}
  const result=await bounded(response.json()).catch(()=>{throw error('FAILED')});if(!response.ok)throw error(result.code||'FAILED');return result;
 }
 async function settle(purchase,auth){
  const result=await request('verify',{transactionId:purchase.transactionId,signedTransaction:purchase.signedTransaction},auth);
  if(result.verified!==true||result.entitlementApplied!==true)throw error('FAILED');
  // StoreKit retains unfinished transactions across restarts until the server commits.
  await bounded(bridge.finishPurchase({transactionId:purchase.transactionId}));
  if(result.environment==="Sandbox")window.ParallelCityAuth?.setAppleSandboxEntitlements?.(result.entitlements);
  return result;
 }
 async function exclusive(run){if(busy)throw error('BUSY');busy=true;try{return await run()}catch(e){if(messages[e.code])throw error(e.code);throw error('FAILED')}finally{busy=false;setPhase('idle')}}
 async function restorePurchases(interactive=true){
  if(backgroundRestore)await backgroundRestore;
  const result=await exclusive(async()=>{
   setPhase('restoring');
   // A quiet login check must not download the whole save or block on an empty history.
   const result=await bounded(bridge.restorePurchases({interactive}));
   if(!(result.purchases||[]).length)return {restored:0,failed:0};
   const auth=await token();await request('prepare',{},auth);let restored=0,failed=0;
   for(const purchase of result.purchases||[]){try{await settle(purchase,auth);restored++}catch{failed++}}
   if(restored)refreshAccount();if(failed)throw error('FAILED');return {restored,failed};
  });return result;
 }
 function restoreInBackground(){
  if(busy||backgroundRestore)return;
  backgroundRestore=restorePurchases(false).catch(()=>{}).finally(()=>{backgroundRestore=null});
 }
 window.DrawerVillagePlayBilling={
  getState,
  enabled:()=>Boolean(bridge&&config().enabled),configured:()=>Boolean(config().backendUrl),
  loadProducts:async()=>bridge?bridge.getProducts({productIds:Object.values(config().products||{})}).then(result=>({products:(result.products||[]).map(p=>({...p,storeProductId:p.productId,productId:Object.keys(config().products||{}).find(key=>config().products[key]===p.productId)||p.productId}))})):({products:[]}),
  purchase:async id=>{if(backgroundRestore)await backgroundRestore;return exclusive(async()=>{
   if(!bridge||!config().enabled||!config().products?.[id])throw error('APPLE_NOT_CONFIGURED');
   setPhase('account');
   const auth=await token(),prepared=await request('prepare',{},auth),productId=config().products[id];
   if(prepared.products?.[productId]!==id||!prepared.appAccountToken)throw error('APPLE_NOT_CONFIGURED');
   setPhase('product');
   const products=await bounded(bridge.getProducts({productIds:[productId]}));
   if(!(products.products||[]).some(p=>p.productId===productId))throw error('APPLE_NOT_CONFIGURED');
   setPhase('payment');
   const purchase=await bridge.purchase({productId,appAccountToken:prepared.appAccountToken});
   setPhase('verifying');
   await settle(purchase,auth);refreshAccount();return purchase;
  })},restorePurchases
 };
 bridge?.addListener('transactionUpdated',restoreInBackground);
 let restoredUid='';
 window.addEventListener('drawer-village-cloud-loaded',()=>{const uid=window.ParallelCityAuth?.getInfo?.().user?.uid;if(!busy&&uid&&uid!==restoredUid){restoredUid=uid;restoreInBackground()}});
})();
