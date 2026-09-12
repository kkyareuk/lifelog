const {createHash}=require('node:crypto');
const types=new Set(['bug','suggestion','purchase','other']);
function validate(body){
 const type=String(body?.type||''),message=String(body?.message||'').trim(),diagnostics=String(body?.diagnostics||''),requestId=String(body?.requestId||'');
 if(!types.has(type)||message.length<5||message.length>5000||diagnostics.length>5000||!/^[-a-f0-9]{36}$/i.test(requestId))throw Object.assign(Error('invalid-feedback'),{status:400});
 return {type,message,diagnostics,requestId};
}
function createService(db,clock=Date.now){return async(ip,body)=>{
 const data=validate(body),now=clock(),bucket=Math.floor(now/3600000),rateId=createHash('sha256').update(String(ip)+':'+bucket).digest('hex');
 const report=db.collection('playerFeedback').doc(data.requestId),rate=db.collection('feedbackRateLimits').doc(rateId);
 return db.runTransaction(async tx=>{const [existing,count]=await Promise.all([tx.get(report),tx.get(rate)]);if(existing.exists)return {received:true,id:report.id};if((count.data()?.count||0)>=20)throw Object.assign(Error('feedback-rate-limit'),{status:429});tx.set(rate,{count:(count.data()?.count||0)+1,expiresAt:new Date(now+86400000)});tx.create(report,{...data,createdAt:now,status:'new'});return {received:true,id:report.id}});
}}
module.exports={validate,createService};
