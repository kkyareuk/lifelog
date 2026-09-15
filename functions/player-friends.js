const {randomBytes}=require('node:crypto');
const {allowContact}=require('./user-safety');
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const valid=v=>{if(typeof v!=='string'||!v||v.length>180||/[\/\\\x00-\x1f]/.test(v))fail('invalid-id');return v};
module.exports=({db,clock=Date.now})=>{
 const book=uid=>db.collection('playerFriends').doc(valid(uid));
 const codeRef=code=>db.collection('playerFriendCodes').doc(code);
 const profile=async(tx,uid)=>{const p=(await tx.get(db.collection('users').doc(uid))).data()?.profile;return {uid,name:String(p?.name||'').slice(0,80)}};
 async function ensure(uid){return db.runTransaction(async tx=>{const ref=book(uid),old=await tx.get(ref);if(old.exists)return old.data();const code=randomBytes(8).toString('hex').toUpperCase(),index=codeRef(code);if((await tx.get(index)).exists)fail('try-again',409);const data={code,friends:[],incoming:[],outgoing:[],times:[]};tx.create(index,{uid});tx.create(ref,data);return data})}
 return {
  readFriends:async uid=>{const data=await ensure(uid);return {code:data.code,friends:data.friends,incoming:data.incoming,outgoing:data.outgoing}},
  findFriend:async(uid,input)=>{const code=String(input.code||'').replace(/[\s-]/g,'').toUpperCase();if(!/^[A-F0-9]{16}$/.test(code))fail('friend-code-invalid');return db.runTransaction(async tx=>{const found=await tx.get(codeRef(code));if(!found.exists)fail('friend-not-found',404);const target=found.data().uid;if(target===uid)fail('friend-self');await allowContact(db,tx,uid,target);return profile(tx,target)})},
  requestFriend:async(uid,input)=>{await ensure(uid);return db.runTransaction(async tx=>{const other=valid(input.targetUid);if(other===uid)fail('friend-self');const a=book(uid),b=book(other),[one,two]=await Promise.all([tx.get(a),tx.get(b)]);if(!two.exists)fail('friend-not-found',404);await allowContact(db,tx,uid,other);const x=one.data(),y=two.data();if(x.friends.some(p=>p.uid===other)||x.outgoing.some(p=>p.uid===other))return {sent:true};if(x.incoming.some(p=>p.uid===other))fail('friend-request-received',409);const times=x.times.filter(t=>t>clock()-86400000);if(times.length>=30)fail('friend-rate-limit',429);if(x.friends.length>=100||y.friends.length>=100||x.outgoing.length>=50||y.incoming.length>=50)fail('friend-limit',409);const [sender,recipient]=await Promise.all([profile(tx,uid),profile(tx,other)]);tx.update(a,{outgoing:[...x.outgoing,{...recipient,at:clock()}],times:[...times,clock()]});tx.update(b,{incoming:[...y.incoming,{...sender,at:clock()}]});return {sent:true}})},
  respondFriend:async(uid,input)=>db.runTransaction(async tx=>{const other=valid(input.targetUid),action=input.action;if(other===uid||!['accept','decline','cancel','remove'].includes(action))fail('invalid-action');const a=book(uid),b=book(other),[one,two]=await Promise.all([tx.get(a),tx.get(b)]);if(!one.exists||!two.exists)fail('friend-not-found',404);const x=one.data(),y=two.data(),without=list=>list.filter(p=>p.uid!==other),otherWithout=list=>list.filter(p=>p.uid!==uid);
   if(action==='accept'||action==='decline'){if(!x.incoming.some(p=>p.uid===other)||!y.outgoing.some(p=>p.uid===uid))fail('friend-request-missing',409);if(action==='accept'){await allowContact(db,tx,uid,other);if(x.friends.length>=100||y.friends.length>=100)fail('friend-limit',409)}const [me,them]=action==='accept'?await Promise.all([profile(tx,uid),profile(tx,other)]):[null,null];tx.update(a,{incoming:without(x.incoming),...(them?{friends:[...without(x.friends),them]}:{})});tx.update(b,{outgoing:otherWithout(y.outgoing),...(me?{friends:[...otherWithout(y.friends),me]}:{})});}
   else if(action==='cancel'){tx.update(a,{outgoing:without(x.outgoing)});tx.update(b,{incoming:otherWithout(y.incoming)});}
   else{tx.update(a,{friends:without(x.friends)});tx.update(b,{friends:otherWithout(y.friends)});}return {saved:true};
  })
 };
};
