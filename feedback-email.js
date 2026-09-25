const address='kkyaareuk@gmail.com';
const copies={
 ko:{title:'이메일로 오류 제보',hint:'메일 앱에서 내용을 확인하고 스크린샷을 첨부한 뒤 보내 주세요. 버전·기기 정보·로그인 중인 계정 UID가 포함되며, 보내신 이메일로 답변받을 수 있어요.',prompt:'어떤 상황에서 문제가 발생했나요?\n\n',diagnostics:'진단 정보 (인증 자료 아님)',copy:'제보 내용 복사',copied:'복사했어요. 메일 앱에 붙여 넣어 보내 주세요.',fallback:'복사할 내용을 선택해 주세요.'},
 en:{title:'Report a bug by email',hint:'Review the draft in your email app, attach screenshots, and send it. It includes your app version, device details and signed-in account UID. Replies can be sent to your email address.',prompt:'What happened, and when did it happen?\n\n',diagnostics:'Diagnostics (not proof of identity)',copy:'Copy report',copied:'Copied. Paste it into your email app to send.',fallback:'Select the report text to copy it.'},
 ja:{title:'メールで不具合を報告',hint:'メールアプリで内容を確認し、スクリーンショットを添付して送信してください。バージョン・端末情報・ログイン中のUIDを含み、送信元のメールアドレスに返信できます。',prompt:'どのような状況で問題が発生しましたか？\n\n',diagnostics:'診断情報（本人確認資料ではありません）',copy:'報告内容をコピー',copied:'コピーしました。メールアプリに貼り付けて送信してください。',fallback:'報告内容を選択してコピーしてください。'}
};
export function feedbackEmail(diagnostics,language,message=''){
 const t=copies[language]||copies.ko;
 const subject=`[Drawer Village] ${t.title}`;
 const body=`${message.trim()||t.prompt}\n\n--- ${t.diagnostics} ---\n${diagnostics}`;
 return {subject,body,url:`mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`};
}
export function addFeedbackEmail(parent,diagnostics,language,getMessage=()=> ''){
 const t=copies[language]||copies.ko,section=document.createElement('section');
 const link=document.createElement('a');link.className='primary';link.textContent=t.title;
 const refresh=()=>{link.href=feedbackEmail(diagnostics,language,getMessage()).url};refresh();link.addEventListener('click',refresh);
 const hint=document.createElement('p');hint.textContent=t.hint;
 const copy=document.createElement('button');copy.type='button';copy.textContent=t.copy;
 const status=document.createElement('p');status.setAttribute('role','status');
 copy.onclick=async()=>{const {subject,body}=feedbackEmail(diagnostics,language,getMessage()),text=`To: ${address}\nSubject: ${subject}\n\n${body}`;try{await navigator.clipboard.writeText(text);status.textContent=t.copied}catch{let area=section.querySelector('textarea');if(!area){area=document.createElement('textarea');area.readOnly=true;area.rows=8;area.setAttribute('aria-label',t.copy);section.append(area)}area.value=text;area.focus();area.select();status.textContent=t.fallback}};
 section.append(link,hint,copy,status);parent.append(section);
}
