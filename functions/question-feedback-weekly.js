const {onSchedule}=require('firebase-functions/v2/scheduler');
const {defineSecret}=require('firebase-functions/params');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {formatFitReport}=require('./question-feedback-format');
const settings=defineSecret('MODERATION_EMAIL_CONFIG');
const mail=require('./moderation-email').createHandler({config:()=>JSON.parse(settings.value()),prefix:'question-weekly',compose:(id,r)=>({to:['kkyaareuk@gmail.com'],subject:'[서랍마을] 주간 질문 개선 의견 '+r.period+' ('+r.part+')',text:r.message})});
exports.weekly=onSchedule({schedule:'0 9 * * 0',timeZone:'Asia/Seoul',region:'asia-northeast3',timeoutSeconds:540,memory:'256MiB',retryCount:3,secrets:[settings]},async event=>{
 const db=getFirestore(),end=new Date(event.scheduleTime),start=new Date(+end-7*86400000),period=start.toISOString().slice(0,10)+' ~ '+end.toISOString().slice(0,10);
 let cursor=null,part=0,buffer=[];
 const deliver=async()=>{if(!buffer.length)return;const id=end.toISOString().slice(0,10)+'-'+(++part),ref=db.collection('questionFeedbackDigests').doc(id);let snap=await ref.get();if(!snap.exists){await ref.create({period,part,message:buffer.join('\n\n--------------------\n\n'),createdAt:Date.now()});snap=await ref.get()}await mail({params:{reportId:id},time:end.toISOString(),data:{ref,data:()=>snap.data()}});buffer=[]};
 // A timestamp-only query uses the standard single-field index. Read only this
 // week's reports, in pages, and keep at most 50 relevant reports in memory.
 for(;;){let q=db.collection('feedback').where('createdAt','>=',Timestamp.fromDate(start)).where('createdAt','<',Timestamp.fromDate(end)).orderBy('createdAt').limit(100);if(cursor)q=q.startAfter(cursor);const page=await q.get();if(page.empty)break;for(const doc of page.docs){if(doc.data().category!=='discovery-answer-fit')continue;buffer.push(formatFitReport(doc.data()));if(buffer.length===50)await deliver()}cursor=page.docs.at(-1);if(page.size<100)break}await deliver();
});
