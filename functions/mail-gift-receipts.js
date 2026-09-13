const crypto=require('node:crypto');
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status,code:message})};
const kinds=['food','drink','flower','misc','fashion','perfume','book','toy','idol','hobby'];
const day=now=>new Date(now+9*3600000).toISOString().slice(0,10);
const array=v=>Array.isArray(v)?v:v?.__drawerVillageArrayV1||[];
function giftValue(gift,senderName){
 if(!kinds.includes(gift?.kind)||typeof gift.item?.name!=='string'||!gift.item.name.trim())fail('invalid-gift');
 const details={};for(const key of ['category','subtype','creator','memo','price','appeal','animation','spicy','sweet','acidity','carbonation','caffeine','alcohol','temperature'])if(typeof gift.item[key]==='string')details[key]=gift.item[key].slice(0,key==='memo'?3000:120);
 for(const key of ['tags','keywords'])if(Array.isArray(gift.item[key]))details[key]=gift.item[key].filter(v=>typeof v==='string').slice(0,30).map(v=>v.slice(0,80));
 if(Number.isFinite(gift.item.rating))details.rating=Math.max(0,Math.min(5,gift.item.rating));
 return {kind:gift.kind,item:{...details,id:crypto.randomUUID(),name:gift.item.name.trim().slice(0,80),giftFrom:String(senderName||'').slice(0,80),image:/^https:\/\//.test(gift.item.image||'')?gift.item.image.slice(0,2000):''},status:'pending'};
}
async function reserve(db,tx,uid,now){
 const ref=db.collection('users').doc(uid).collection('mailGiftLimits').doc('outgoing'),snap=await tx.get(ref);
 if(snap.data()?.day===day(now))fail('gift-daily-limit',409);
 return ()=>tx.set(ref,{day:day(now),sentAt:now});
}
function create({db,clock=Date.now,id}){return async(uid,input)=>db.runTransaction(async tx=>{
 const ref=db.collection('groups').doc(id(input.groupId)).collection('mail').doc(id(input.mailId));
 const snap=await tx.get(ref),mail=snap.data();
 if(!snap.exists||mail.recipientUid!==uid)fail('mail-access-required',403);
 if(!mail.gift||!['pending','accepted','declined'].includes(mail.gift.status))fail('gift-not-pending',409);
 if(mail.gift.status!=='pending')return {status:mail.gift.status,gift:mail.gift};
 if(input.accept!==true){tx.update(ref,{'gift':{...mail.gift,status:'declined',respondedAt:clock()}});return {status:'declined'}}
 const core=db.collection('users').doc(uid).collection('sync').doc('core'),coreSnap=await tx.get(core);
 if(!coreSnap.exists)fail('gift-sync-required',409);
 const state=coreSnap.data().state||{},catalog=state.catalog||{},kind=mail.gift.kind;
 const count=Object.entries(catalog).reduce((n,[k,v])=>n+array(v).filter(i=>k!=='fashion'||!i.ownerId).length,0);
 if(count>=80)fail('gift-catalog-full',409);
 const item={...mail.gift.item,kind};
 const encode=v=>Array.isArray(v)?{__drawerVillageArrayV1:v.map(encode)}:v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,encode(x)])):v;
 const next={...catalog,[kind]:{__drawerVillageArrayV1:[...array(catalog[kind]),encode(item)]}};
 tx.update(core,{'state.catalog':next});
 tx.update(ref,{gift:{...mail.gift,status:'accepted',respondedAt:clock()}});
 return {status:'accepted',gift:{...mail.gift,item,status:'accepted'}};
})}
module.exports={giftValue,reserve,create,day};
