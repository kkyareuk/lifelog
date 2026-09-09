// Some native SDK calls resolve only on reward, so also handle early dismissal.
export async function showRewardedAd(ad,{timeoutMs=180000}={}){
 const handles=[];let timer,earned=false,resolve,reject;
 const finished=new Promise((yes,no)=>{resolve=yes;reject=no});
 try{
  handles.push(await ad.addListener('onRewardedVideoAdReward',()=>{earned=true}));
  handles.push(await ad.addListener('onRewardedVideoAdDismissed',()=>resolve(earned)));
  handles.push(await ad.addListener('onRewardedVideoAdFailedToShow',()=>reject(Error('ads-failed'))));
  timer=setTimeout(()=>reject(Error('ads-timeout')),timeoutMs);
  Promise.resolve(ad.showRewardVideoAd()).then(result=>{if(Number(result?.amount)>0)earned=true},reject);
  return await finished;
 }finally{clearTimeout(timer);await Promise.allSettled(handles.map(h=>h.remove()))}
}
