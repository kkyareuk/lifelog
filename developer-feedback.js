const copy={
 ko:['Kkyareuk에게 건의하기','개발자에게 직접 보낼 건의 내용을 적어 주세요. 로그인 계정과 함께 접수됩니다.','로그인 후 건의를 보낼 수 있어요. 로그인 없이 보내려면 익명 문의를 이용해 주세요.','이메일 답장 허용','보내기','닫기','보내는 중…','건의를 보냈어요. 감사합니다!','보내지 못했어요. 내용을 남겨 두었으니 다시 시도해 주세요.'],
 en:['Send feedback to Kkyareuk','Write your suggestion to the developer. It will be submitted with your account.','Sign in to send a suggestion, or use anonymous feedback without signing in.','Allow an email reply','Send','Close','Sending…','Your suggestion was sent. Thank you!','Could not send. Your message is kept; please try again.'],
 ja:['Kkyareukに要望を送る','開発者に送る要望を書いてください。ログイン中のアカウントとともに受け付けます。','ログインして送信するか、匿名お問い合わせをご利用ください。','メールでの返信を許可','送信','閉じる','送信中…','要望を送りました。ありがとうございます！','送信できませんでした。内容は残っています。再度お試しください。']
};
export function addDeveloperFeedback(card,language){
 const t=copy[language]||copy.ko,button=document.createElement('button');button.type='button';button.dataset.developerFeedback='';button.textContent=t[0];card.append(button);
 button.onclick=()=>{
  const dialog=document.createElement('dialog');dialog.className='mail-reader';const form=document.createElement('form'),title=document.createElement('h2'),intro=document.createElement('p'),message=document.createElement('textarea'),reply=document.createElement('label'),checkbox=document.createElement('input'),send=document.createElement('button'),close=document.createElement('button'),status=document.createElement('p');
  const auth=window.ParallelCityAuth,signedIn=!!auth?.getInfo?.()?.user;
  title.textContent=t[0];intro.textContent=t[signedIn?1:2];message.required=true;message.minLength=5;message.maxLength=3000;message.rows=8;message.setAttribute('aria-label',t[1]);checkbox.type='checkbox';reply.append(checkbox,document.createTextNode(t[3]));send.type='submit';send.textContent=t[4];close.type='button';close.textContent=t[5];status.setAttribute('role','status');form.append(title,intro);if(signedIn)form.append(message,reply,send);form.append(close,status);dialog.append(form);document.body.append(dialog);dialog.onclose=()=>dialog.remove();close.onclick=()=>dialog.close();
  form.onsubmit=async event=>{event.preventDefault();if(!signedIn||send.disabled||message.value.trim().length<5)return;send.disabled=true;message.disabled=true;checkbox.disabled=true;status.textContent=t[6];try{const sent=await auth.submitFeedback({category:'건의',message:message.value,allowReply:checkbox.checked});if(sent!==true)throw Error('not-sent');status.textContent=t[7];send.remove()}catch{status.textContent=t[8];send.disabled=false;message.disabled=false;checkbox.disabled=false}};
  dialog.showModal();
 };
}
