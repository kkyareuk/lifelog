const {createHash}=require('node:crypto');
const RECIPIENT='kkyaareuk@gmail.com';
const reasons={harassment:'괴롭힘·불쾌한 행동',sexual:'부적절한 성적 콘텐츠',violence:'폭력적인 콘텐츠',hate:'혐오·차별',spam:'스팸·사기',other:'기타'};
function message(reportId,report,projectId){
 const link=`https://console.firebase.google.com/project/${encodeURIComponent(projectId)}/firestore/databases/-default-/data/~2FmoderationReports~2F${encodeURIComponent(reportId)}`;
 return {to:[RECIPIENT],subject:'[서랍마을] 새로운 유저 신고가 접수됐어요',text:[
  '새로운 신고가 접수되었습니다. 신고 내용은 아직 확인되지 않은 제보입니다.',
  `신고 번호: ${reportId}`,`대상: ${String(report.targetName||'').slice(0,80)}`,
  `사유: ${reasons[report.reason]||'기타'}`,`추가 설명: ${String(report.details||'없음').slice(0,500)}`,
  '',`Firebase에서 확인: ${link}`,'신고 당시 자료는 Firebase의 evidence 항목에서 확인할 수 있습니다.',
  '이 알림은 계정을 자동 정지하거나 신고를 처리 완료로 변경하지 않습니다.'
 ].join('\n')};
}
function createHandler({config,fetcher=fetch,clock=Date.now,projectId='lifelog-98fff',compose=message,prefix='moderation'}){
 return async event=>{
  if(!event.data)return;
  const ref=event.data.ref,current=await ref.get();
  if(!current.exists||current.data()?.emailNotification?.status==='sent')return;
  const reportId=event.params.reportId,report=event.data.data();
  // Provider deduplication lasts 24 hours. Stop automatic retries before that
  // expires rather than risk delivering the same report again after an outage.
  const started=Date.parse(event.time);
  if(!Number.isFinite(started)||clock()-started>=23*3600000){
   await ref.update({emailNotification:{status:'needs-attention',reason:'retry-window-ended',updatedAt:clock()}});return;
  }
  const settings=config();
  if(!settings?.apiKey||!settings?.from||/[\r\n]/.test(settings.from))throw Error('moderation-email-not-configured');
  const response=await fetcher('https://api.resend.com/emails',{
   method:'POST',headers:{Authorization:`Bearer ${settings.apiKey}`,'Content-Type':'application/json',
    'Idempotency-Key':prefix+'-'+createHash('sha256').update(reportId).digest('hex')},
   body:JSON.stringify({from:settings.from,...compose(reportId,report,projectId)}),signal:AbortSignal.timeout(15000)
  });
  if(!response.ok){
   await ref.update({emailNotification:{status:'retrying',httpStatus:response.status,updatedAt:clock()}});
   throw Error('moderation-email-send-failed');
  }
  const result=await response.json();if(!result.id)throw Error('moderation-email-missing-receipt');
  await ref.update({emailNotification:{status:'sent',providerId:result.id,sentAt:clock()}});
 };
}
module.exports={createHandler,message,RECIPIENT};
