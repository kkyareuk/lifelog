// Retry only authenticated server reads, never grant access from local receipts.
export function purchaseAccessRefresh({uid,read,publish,storage,schedule=setTimeout,cancel=clearTimeout}){
 let timer=null,inflight=null,attempt=0;const key=id=>'drawer-village.purchase-access-pending:'+id;
 const pending=id=>{try{return storage.getItem(key(id))==='1'}catch{return false}};
 const mark=(id,value)=>{try{value?storage.setItem(key(id),'1'):storage.removeItem(key(id))}catch{}};
 async function refresh(){
  const account=uid();if(!account)throw Error('account-required');
  if(inflight?.account===account)return inflight.promise;
  mark(account,true);
  const promise=(async()=>{try{const value=await read(account);if(uid()!==account)throw Error('account-changed');publish(value);mark(account,false);attempt=0;if(timer)cancel(timer);timer=null;return true}catch(e){if(uid()===account){if(timer)cancel(timer);timer=schedule(()=>{timer=null;if(uid()===account)void refresh().catch(()=>{})},Math.min(60000,2000*2**Math.min(attempt++,5)))}throw e}finally{if(inflight?.account===account)inflight=null}})();
  inflight={account,promise};return promise;
 }
 return {refresh,resume(){const account=uid();if(account&&pending(account))void refresh().catch(()=>{})}};
}
