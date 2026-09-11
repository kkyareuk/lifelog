const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const admin=identity=>{if(identity.email_verified!==true||identity.email!=='kkyaareuk@gmail.com')fail('관리자 계정으로 로그인해 주세요.',403)};
const clean=input=>{
 const id=String(input.id||'');if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id))fail('초안 ID를 확인해 주세요.');
 const subject=String(input.subject||'').trim(),body=String(input.body||'').trim();
 if(!subject||subject.length>120||!body||body.length>8000)fail('제목과 내용을 확인해 주세요.');
 return {id,subject,body};
};
exports.createService=({db,clock=Date.now})=>({
 async list(identity){admin(identity);const rows=await db.collection('noticeDrafts').orderBy('updatedAt','desc').limit(50).get();return {drafts:rows.docs.map(d=>({id:d.id,...d.data()}))};},
 async save(identity,input){admin(identity);const value=clean(input),ref=db.collection('noticeDrafts').doc(value.id);return db.runTransaction(async tx=>{const old=await tx.get(ref);if(old.data()?.publishedAt)fail('발송한 초안은 수정할 수 없어요.',409);const revision=(old.data()?.revision||0)+1;tx.set(ref,{...value,revision,updatedAt:clock(),updatedBy:identity.uid,publishedAt:0});return {...value,revision};});},
 async publish(identity,input){admin(identity);if(input.confirm!==true)fail('발송 내용을 확인해 주세요.');const value=clean(input),ref=db.collection('noticeDrafts').doc(value.id),sent=db.collection('villageAnnouncements').doc(value.id);return db.runTransaction(async tx=>{const [draft,existing]=await Promise.all([tx.get(ref),tx.get(sent)]);if(existing.exists)return {published:true,alreadyPublished:true};const d=draft.data();if(!d||d.revision!==input.revision||d.subject!==value.subject||d.body!==value.body)fail('초안이 변경됐어요. 다시 저장하고 확인해 주세요.',409);const now=clock();tx.create(sent,{subject:d.subject,body:d.body,announcement:true,dispatchId:value.id,senderDisplayName:'서랍마을',senderKind:'user',createdAt:now,expiresAt:now+30*86400000});tx.update(ref,{publishedAt:now,updatedAt:now,publishedBy:identity.uid});return {published:true};});}
});
