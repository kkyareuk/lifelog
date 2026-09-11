// iOS adapter. The existing shop interface is shared; Google Play is never called here.
(function(){
 if(!window.Capacitor?.isNativePlatform?.()||window.Capacitor.getPlatform()!=='ios')return;
 const bridge=window.Capacitor.Plugins.AppleBilling,config=()=>window.PARALLEL_CITY_CONFIG?.appleBilling||{};
 const messages={
 RESTORE_FAILED:["Apple 구매 내역 동기화를 완료하지 못했어요.","Apple purchase history could not be synced.","Appleの購入履歴を同期できませんでした。"],
 NETWORK_UNAVAILABLE:["구매 서버에 연결하지 못했어요. 잠시 후 구매 내역 복원을 다시 눌러 주세요.","Could not reach the purchase server. Try restoring purchases again shortly.","購入サーバーに接続できませんでした。しばらくしてから購入の復元をお試しください。"],
 AUTH_REQUIRED:["게임 계정의 로그인을 다시 확인해 주세요.","Please check your game account sign-in.","ゲームアカウントのログインをご確認ください。"],
 ACCOUNT_DELETION_IN_PROGRESS:["계정 삭제가 진행 중이어서 구매 내역을 불러올 수 없어요.","Purchases cannot be loaded while account deletion is in progress.","アカウント削除中のため購入履歴を読み込めません。"],
 APPLE_WINDOW_UNAVAILABLE:['결제창을 연결할 앱 화면을 찾지 못했어요. 앱을 다시 열어 주세요.','The app window for payment is unavailable. Reopen the app.','決済画面に接続できません。アプリを開き直してください。'],
 RESTORE_REQUIRED:['이전 구매를 확인하지 못했어요. 구매 내역 복원에서 먼저 확인해 주세요.','An earlier purchase could not be verified. Restore purchases first.','前の購入を確認できません。先に購入を復元してください。'],
 LOGIN_REQUIRED:['서랍마을 계정에 로그인한 뒤 구매해 주세요.','Sign in to your Drawer Village account before purchasing.','購入前にひきだし村アカウントでログインしてください。'],
 PURCHASE_CANCELLED:['구매를 취소했어요.','Purchase cancelled.','購入をキャンセルしました。'],
 PURCHASE_PENDING:['Apple에서 구매 승인 대기 중이에요. 승인되면 구매 내역을 다시 확인해 주세요.','The purchase is awaiting Apple approval. Check purchases after approval.','Appleで購入の承認を待っています。承認後に購入履歴を確認してください。'],
 APPLE_NOT_CONFIGURED:['Apple 결제 연결을 준비 중이에요. 아직 결제는 시작되지 않았어요.','Apple billing setup is pending. No purchase has been started.','Apple決済の接続を準備中です。購入は開始していません。'],
 APPLE_ACCOUNT_MISMATCH:['이 구매에 연결된 서랍마을 계정으로 로그인해 주세요.','Sign in to the Drawer Village account linked to this purchase.','この購入に紐づくひきだし村アカウントでログインしてください。'],
 APPLE_REVOKED:['취소되거나 환불된 구매입니다.','This purchase was cancelled or refunded.','キャンセルまたは返金済みの購入です。'],
 BUSY:['다른 구매를 확인 중이에요. 잠시 기다려 주세요.','Another purchase is being checked. Please wait.','別の購入を確認しています。しばらくお待ちください。'],
 FAILED:['구매 확인을 끝내지 못했어요. 다시 결제하지 말고 구매 내역 복원을 눌러 주세요.','Purchase verification is incomplete. Restore purchases instead of paying again.','購入確認を完了できませんでした。再購入せず、購入の復元をお試しください。']
 };
 const error=(code,stage='')=>{const index=String(document.documentElement.lang).startsWith('en')?1:String(document.documentElement.lang).startsWith('ja')?2:0;return Object.assign(new Error((messages[code]||messages.FAILED)[index]),{code,stage})};
 let lastFailure=null;
 const explain=e=>{const code=String(e?.code||'FAILED').replace(/[^a-zA-Z0-9_/-]/g,'').slice(0,72),stage=String(e?.stage||phase).replace(/[^a-zA-Z0-9_-]/g,'').slice(0,32);lastFailure={code,stage};const result=error(code,stage);result.message+=` (${stage}: ${code})`;return result};
 let busy=false,backgroundRestore=null,backgroundRestoreError=null,phase='idle',paymentRecovery=null,recoveredDuringPayment=false;
 const phaseText={recovered:['구매 상품을 반영했어요. Apple 결제창이 닫힐 때까지 다시 구매하지 마세요.','Purchase applied. Do not buy again while Apple closes the payment window.','購入を反映しました。Appleの決済画面が閉じるまで再購入しないでください。'],paymentDelayed:['구매를 확인하고 있어요. 완료된 구매는 자동으로 반영돼요.','Checking your purchase. Completed purchases are applied automatically.','購入を確認しています。完了した購入は自動で反映されます。'],restoring:['구매 내역 확인 중…','Checking purchases…','購入履歴を確認中…'],account:['계정 확인 중…','Checking account…','アカウントを確認中…'],product:['Apple 상품 확인 중…','Loading Apple product…','Apple商品を確認中…'],payment:['Apple에서 구매 진행 중…','Purchase in progress with Apple…','Appleで購入手続き中…'],verifying:['구매 지급 확인 중…','Verifying purchase…','購入を確認中…']};
 const getState=()=>({busy,phase,lastFailure,label:(phaseText[phase]||[])[String(document.documentElement.lang).startsWith('en')?1:String(document.documentElement.lang).startsWith('ja')?2:0]||''});
 const setPhase=value=>{phase=value;window.dispatchEvent?.(new CustomEvent('drawer-village-billing-state',{detail:getState()}))};
 const bounded=(work,ms=25000)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(error('FAILED')),ms);Promise.resolve(work).then(resolve,reject).finally(()=>clearTimeout(timer))});
 const refreshAccount=()=>{void Promise.resolve().then(()=>window.ParallelCityAuth?.refreshEntitlements?.()).catch(()=>{})};
 async function token(){const value=await bounded(window.ParallelCityAuth?.getIdToken?.());if(!value)throw error('LOGIN_REQUIRED');return value}
 async function request(path,body,auth){
  const backend=String(config().backendUrl||'').replace(/\/$/,'');if(!backend)throw error('APPLE_NOT_CONFIGURED');
  let response;try{response=await fetch(backend+'/apple-billing/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)})}catch{throw error('FAILED')}
  const result=await bounded(response.json()).catch(()=>{throw error('FAILED')});if(!response.ok)throw error(result.code||'FAILED',path);return result;
 }
 async function settle(purchase,auth){
  const result=await request('verify',{transactionId:purchase.transactionId,signedTransaction:purchase.signedTransaction},auth);
  if(result.verified!==true||result.entitlementApplied!==true)throw error('FAILED');
  // StoreKit retains unfinished transactions across restarts until the server commits.
  await bounded(bridge.finishPurchase({transactionId:purchase.transactionId}));
  if(result.productId==="diamonds_100")window.dispatchEvent?.(new CustomEvent("drawer-village-diamonds-charged",{detail:result}));
  if(result.environment==="Sandbox")window.ParallelCityAuth?.setAppleSandboxEntitlements?.(result.entitlements,result.uid);
  return result;
 }
 async function exclusive(run){if(busy)throw error('BUSY');busy=true;lastFailure=null;try{return await run()}catch(e){throw e?.reported?e:explain(e)}finally{busy=false;setPhase('idle')}}
 async function restorePurchases(interactive=true){
  if(backgroundRestore)await backgroundRestore;
  const result=await exclusive(async()=>{
   setPhase('account');
   const uid=window.ParallelCityAuth?.getInfo?.().user?.uid;let accountChecked=false,savedPurchases=false;
   const diagnostics=await bounded(bridge.getDiagnostics()).catch(()=>({}));
   // Finished consumables are absent from StoreKit.currentEntitlements. Recover
   // the server-verified account ledger before attempting interactive Apple sync.
   if(uid&&diagnostics.sandboxReceipt){
    const saved=await request('entitlements',{},await token());
    if(saved.uid!==uid||window.ParallelCityAuth?.getInfo?.().user?.uid!==uid)throw error('APPLE_ACCOUNT_MISMATCH','entitlements');
    window.ParallelCityAuth?.setAppleSandboxEntitlements?.(saved.sandboxEntitlements,uid);accountChecked=true;
    savedPurchases=['characterSlotPacks','characterSingleSlots','townSlotPacks','teaSupportCount'].some(key=>Number(saved.sandboxEntitlements?.[key])>0);
   }
   refreshAccount();setPhase('restoring');
   let result,appleError;
   try{result=await bounded(bridge.restorePurchases({interactive}));if(result.syncError)appleError=error('RESTORE_FAILED','apple-sync')}
   catch(e){appleError=e;result=await bounded(bridge.restorePurchases({interactive:false})).catch(()=>({purchases:[]}))}
   let restored=0,failed=0,firstError=null;
   if((result.purchases||[]).length){
    const auth=await token();await request('prepare',{},auth);
    for(const purchase of result.purchases){try{await settle(purchase,auth);restored++}catch(e){failed++;firstError??=e}}
   }
   if(restored)refreshAccount();if(failed)throw firstError;
   if(appleError){
    const failure=explain(appleError),nativeCode=String(result.syncError||'').replace(/[^a-zA-Z0-9_.:-]/g,'').slice(0,100);
    failure.reported=true;if(nativeCode)failure.message+=' ['+nativeCode+']';
    if(!savedPurchases&&!restored)throw failure;
    const lang=String(document.documentElement.lang),index=lang.startsWith('en')?1:lang.startsWith('ja')?2:0;
    return {restored,failed:0,accountChecked,appleCheckFailed:true,warning:["확인된 구매는 반영했어요. Apple의 추가 구매 내역 확인은 완료하지 못했어요.","Verified purchases were applied. Apple's additional purchase history check did not finish.","確認済みの購入は反映しました。Appleの追加購入履歴の確認は完了していません。"][index]+' ('+(nativeCode||'RESTORE_FAILED')+')'};
   }
   return {restored,failed:0,accountChecked};
  });backgroundRestoreError=null;return result;
 }
 async function recoverPayment(){
  if(paymentRecovery)return paymentRecovery;
  if(!busy||!['payment','paymentDelayed','recovered'].includes(phase))return getState();
  paymentRecovery=(async()=>{
   const history=await bounded(bridge.restorePurchases({interactive:false}));
   if((history.purchases||[]).length){const auth=await token();for(const purchase of history.purchases)await settle(purchase,auth);recoveredDuringPayment=true;refreshAccount();setPhase('recovered')}
   return getState();
  })().finally(()=>{paymentRecovery=null});return paymentRecovery;
 }
 function restoreInBackground(){
  if(busy){void recoverPayment().catch(()=>{});return}if(backgroundRestore)return;
  backgroundRestore=restorePurchases(false).catch(e=>{backgroundRestoreError=e}).finally(()=>{backgroundRestore=null});
 }
 window.DrawerVillagePlayBilling={
  getState,diagnostics:async()=>{await recoverPayment();return getState()},
  enabled:()=>Boolean(bridge&&config().enabled),configured:()=>Boolean(config().backendUrl),
  loadProducts:async()=>bridge?bridge.getProducts({productIds:Object.values(config().products||{})}).then(result=>({products:(result.products||[]).map(p=>({...p,storeProductId:p.productId,productId:Object.keys(config().products||{}).find(key=>config().products[key]===p.productId)||p.productId}))})):({products:[]}),
  purchase:async id=>{if(backgroundRestore)await backgroundRestore;// Recheck unfinished transactions below; a past optional read failure is not a payment lock.
return exclusive(async()=>{
   if(!bridge||!config().enabled||!config().products?.[id])throw error('APPLE_NOT_CONFIGURED');
   setPhase('account');
   const auth=await token(),prepared=await request('prepare',{},auth),productId=config().products[id];
   if(prepared.products?.[productId]!==id||!prepared.appAccountToken)throw error('APPLE_NOT_CONFIGURED');
   setPhase('restoring');
   const outstanding=await bounded(bridge.restorePurchases({interactive:false}));
   for(const previous of outstanding.purchases||[]){try{await settle(previous,auth)}catch(e){throw e}}
   if((outstanding.purchases||[]).length){refreshAccount();return {recovered:true}}
   setPhase('product');
   const products=await bounded(bridge.getProducts({productIds:[productId]}));
   if(!(products.products||[]).some(p=>p.productId===productId))throw error('APPLE_NOT_CONFIGURED');
   recoveredDuringPayment=false;setPhase('payment');
   const slow=setTimeout(()=>{if(!recoveredDuringPayment)setPhase('paymentDelayed')},30000);let purchase;
   try{purchase=await bridge.purchase({productId,appAccountToken:prepared.appAccountToken})}finally{clearTimeout(slow)}
   setPhase('verifying');
   try{if(paymentRecovery)await paymentRecovery;await settle(purchase,auth)}catch(e){backgroundRestoreError=e;throw e}refreshAccount();return purchase;
  })},restorePurchases
 };
 bridge?.addListener('transactionUpdated',restoreInBackground);
 let restoredUid='';
 window.addEventListener('drawer-village-cloud-loaded',()=>{const uid=window.ParallelCityAuth?.getInfo?.().user?.uid;if(!busy&&uid&&uid!==restoredUid){restoredUid=uid;restoreInBackground()}});
})();
