import {watchDiscoveryAd,discoveryRemaining,refreshDiscoveryAccess} from './discovery-access.js';

export function showDiscoveryAdChoice(language,onReady){
 const t=(ko,en,ja)=>({ko,en,ja}[language]||ko);
 const dialog=document.createElement('dialog');dialog.className='character-discovery-dialog';
 const title=document.createElement('h2');title.textContent=t('다음 질문 기다리기','Your next question','次の質問を待つ');
 const status=document.createElement('p');status.setAttribute('role','status');
 status.textContent=t('대기시간이 끝나면 무료로 질문을 받을 수 있어요. 광고를 끝까지 보면 바로 한 번 이용할 수 있어요.','Wait for a free question, or finish an ad to receive one question now.','待ち時間が終わると無料で質問を受けられます。広告を最後まで見ると、すぐに1回利用できます。');
 const watch=document.createElement('button');watch.type='button';watch.textContent=t('광고 보고 질문받기','Watch an ad for a question','広告を見て質問を受ける');
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent=t('기다릴게요','I’ll wait','待ちます');cancel.onclick=()=>dialog.close();
 let timer,watching=false;
 const account=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 const valid=()=>dialog.isConnected&&account===window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 const finish=()=>{if(!valid())return;dialog.close();onReady()};
 watch.onclick=async()=>{
  watching=true;watch.disabled=true;status.textContent=t('광고를 준비하고 있어요…','Preparing an ad…','広告を準備しています…');
  try{const result=await watchDiscoveryAd();if(!valid())return;
   if(result==='ready'){finish();return;}
   status.textContent=result==='test'?t('테스트 광고 시청 완료. 테스트 광고는 실제 이용권을 지급하지 않아요.','Test ad completed. Sample ads do not grant a real credit.','テスト広告の視聴完了。テスト広告では実際の利用権は付与されません。'):result==='cancelled'?t('시청을 취소했어요. 무료 대기시간은 그대로예요.','Ad cancelled. Your free countdown is unchanged.','視聴を中止しました。無料の待ち時間は変わりません。'):t('보상을 확인하고 있어요. 확인되면 질문을 열어 드릴게요.','Verifying your reward. Your question will open when confirmed.','報酬を確認しています。確認でき次第、質問を開きます。');
   if(result==='pending'){watch.disabled=true;timer=setInterval(async()=>{try{await refreshDiscoveryAccess();if(!valid()){dialog.close();return;}if(!discoveryRemaining())finish();}catch{}},16000);}
   else watch.disabled=false;
  }catch{if(valid())status.textContent=t('광고를 불러오지 못했어요. 기다리거나 잠시 후 다시 시도해 주세요.','Could not load an ad. Wait for a free question or try again later.','広告を読み込めませんでした。無料の質問を待つか、後ほどお試しください。');watch.disabled=false;}
  finally{watching=false;}
 };
 dialog.addEventListener('cancel',event=>{if(watching)event.preventDefault()});
 dialog.onclose=()=>{clearInterval(timer);dialog.remove()};
 dialog.append(title,status,watch,cancel);document.body.append(dialog);dialog.showModal();
}
