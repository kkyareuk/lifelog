// One request per action. Dismissing a notice never cancels the save.
const active=new Map();
const text=(ko,en,ja)=>({ko,en,ja}[document.documentElement.lang]||ko);
export function runBackgroundAction(key,operation){
 if(active.has(key))return active.get(key);
 const notice=document.createElement('aside');notice.className='background-action-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
 const icon=document.createElement('span');icon.className='background-action-icon';icon.setAttribute('aria-hidden','true');
 const content=document.createElement('div');content.className='background-action-copy';
 const title=document.createElement('strong'),message=document.createElement('span');content.append(title,message);
 const retry=document.createElement('button');retry.className='background-action-retry';retry.type='button';retry.hidden=true;retry.textContent=text('다시 시도','Retry','再試行');
 const dismiss=document.createElement('button');dismiss.className='background-action-dismiss';dismiss.type='button';dismiss.textContent='×';dismiss.setAttribute('aria-label',text('알림 닫기','Dismiss notification','通知を閉じる'));
 let dismissed=false;dismiss.onclick=()=>{dismissed=true;if(notice.dataset.state==='error')active.delete(key);notice.remove()};
 notice.append(icon,content,retry,dismiss);
 let tray=document.querySelector('.background-action-tray');if(!tray){tray=document.createElement('div');tray.className='background-action-tray';document.body.append(tray)}tray.append(notice);
 const run=async()=>{
  notice.dataset.state='sending';icon.textContent='↗';retry.hidden=true;title.textContent=text('소식을 전하고 있어요','Sending your update','変更を送信しています');message.textContent=text('계속 둘러보셔도 괜찮아요.','You can keep exploring.','そのまま操作できます。');
  try{
   await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));await operation();notice.dataset.state='success';icon.textContent='✓';title.textContent=text('잘 전달했어요','Update delivered','送信しました');message.textContent=text('변경 사항이 저장됐어요.','Your changes have been saved.','変更を保存しました。');active.delete(key);setTimeout(()=>notice.remove(),2400);
  }catch(error){
   notice.dataset.state='error';icon.textContent='!';if(dismissed)active.delete(key);title.textContent=text('아직 전달하지 못했어요','Update not delivered','まだ送信できていません');message.textContent=text('다시 시도해 주세요. ','Please try again. ','もう一度お試しください。')+(error?.message||'');retry.hidden=false;
  }
 };
 retry.onclick=()=>{if(!retry.hidden){const task=run();active.set(key,task)}};
 const task=run();active.set(key,task);return task;
}
