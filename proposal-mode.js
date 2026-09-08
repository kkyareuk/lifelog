export function chooseProposalMode(kind){
 const t=(ko,en,ja)=>({ko,en,ja}[document.documentElement.lang]||ko);
 return new Promise(resolve=>{const d=document.createElement('dialog');d.className='directory-create-dialog';
 d.innerHTML=`<form method="dialog"><h2>${t('어떻게 저장할까요?','How would you like to save?','保存方法を選んでください')}</h2><p>${t('제안하면 참여자의 답변을 기다립니다. 관리자 권한으로 적용하면 바로 반영됩니다.','A proposal waits for participants. Applying as an administrator takes effect immediately.','提案は参加者の返答を待ちます。管理者権限で適用するとすぐに反映されます。')}</p><button value="propose">${kind==='schedule'?t('일정 제안하기','Propose schedule','予定を提案'):t('관계 제의하기','Propose relationship','関係を提案')}</button><button value="apply">${t('관리자 권한으로 적용하기','Apply as administrator','管理者権限で適用')}</button><button value="cancel">${t('취소','Cancel','キャンセル')}</button></form>`;
 document.body.append(d);d.onclose=()=>{const value=d.returnValue;d.remove();resolve(value==='apply'?'apply':value==='propose'?'propose':null)};d.showModal();
 });
}
