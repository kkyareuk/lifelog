// One request per action. Failed actions are retried only by the user.
const active=new Map();
const text=(ko,en,ja)=>({ko,en,ja}[document.documentElement.lang]||ko);
export function runBackgroundAction(key,operation){
 if(active.has(key))return active.get(key);
 const notice=document.createElement('aside');notice.className='background-action-notice';notice.setAttribute('role','status');
 let dismissed=false;const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='×';dismiss.setAttribute('aria-label',text('알림 닫기','Dismiss notification','通知を閉じる'));dismiss.onclick=()=>{dismissed=true;if(!retry.hidden)active.delete(key);notice.remove()};
 const message=document.createElement('span'),retry=document.createElement('button');retry.type='button';retry.hidden=true;retry.textContent=text('다시 시도','Retry','再試行');notice.append(message,retry,dismiss);let tray=document.querySelector('.background-action-tray');if(!tray){tray=document.createElement('div');tray.className='background-action-tray';document.body.append(tray)}tray.append(notice);
 const run=async()=>{retry.hidden=true;message.textContent=text('전송 중…','Sending…','送信中…');
  try{await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));await operation();message.textContent=text('완료했어요.','Done.','完了しました。');active.delete(key);setTimeout(()=>notice.remove(),2000)}
  catch(error){if(dismissed)active.delete(key);message.textContent=text('전송하지 못했어요. ','Could not send. ','送信できませんでした。')+(error?.message||'');retry.hidden=false}
 };
 retry.onclick=()=>{if(!retry.hidden)void run()};const task=run();active.set(key,task);return task;
}
