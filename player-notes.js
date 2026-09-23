const text=(lang,ko,en,ja)=>({ko,en,ja}[lang]||ko);
export function enqueuePlayerNote(c,note){
 if(!c||!note?.id||note.sourceId||!Number.isFinite(Number(note.createdAt)))return false;
 c.playerNotes=Array.isArray(c.playerNotes)?c.playerNotes:[];
 if(c.playerNotes.some(n=>n.id===note.id))return false;
 c.playerNotes.push({id:String(note.id),createdAt:Number(note.createdAt),homeId:note.homeId||c.homeId||''});
 c.playerNotes=c.playerNotes.slice(-300);return true;
}
const sleeping=s=>s.actionKind==='sleep'||/자는|잠든|수면|낮잠|sleep|nap|眠|寝/.test((s.title||'').toLowerCase());
const available=s=>s?.home&&!s.transit&&!s.manualDirective&&!s.routineId&&!s.withId&&!s.groupInteraction&&!sleeping(s)&&!s.lifeTaskId&&!s.economyWork&&!s.cooking&&!['meal','eat','wash','toilet','bath'].includes(s.actionKind)&&!/요리|조리|식사|용변|씻|목욕|cooking|料理/.test(s.title||'');
export function advancePlayerNotes(c,scene,now=Date.now()){
 if(!c?.playerNotes?.length)return false;
 c.noteReceipts??={};let changed=false;
 const active=c.playerNotes.find(n=>c.noteReceipts[n.id]?.startedAt&&!c.noteReceipts[n.id]?.readAt);
 if(active){const r=c.noteReceipts[active.id];
  if(r.endsAt&&now>=r.endsAt){r.readAt=r.endsAt;changed=true;}
  else if(!available(scene)){if(r.endsAt){r.remainingMs=r.endsAt-now;r.endsAt=0;return true}return false;}
  else {if(!r.endsAt){r.endsAt=now+(r.remainingMs||60000);r.homeId=scene.visitHomeId||c.homeId;r.room=scene.room||'living';return true}return false;}
 }
 const last=Math.max(0,...Object.values(c.noteReceipts).map(r=>Number(r.readAt)||0));
 if(now<last+1000||!available(scene))return changed;
 const note=c.playerNotes.find(n=>n.createdAt<=now&&!c.noteReceipts[n.id]);
 if(note){c.noteReceipts[note.id]={startedAt:now,endsAt:now+60000,readAt:0,homeId:scene.visitHomeId||c.homeId,room:scene.room||'living'};changed=true;}
 const ids=new Set(c.playerNotes.map(n=>n.id));c.noteReceipts=Object.fromEntries(Object.entries(c.noteReceipts).filter(([id])=>ids.has(id)));return changed;
}
export function playerNoteScene(c,scene,now=Date.now(),lang='ko'){
 const note=c?.playerNotes?.find(n=>{const r=c.noteReceipts?.[n.id];return r&&r.startedAt<=now&&now<r.endsAt&&!r.readAt;});
 if(!note||!available(scene))return scene;
 const r=c.noteReceipts[note.id],d=new Date(r.startedAt),minute=d.getHours()*60+d.getMinutes();
 return {...scene,home:true,visitHomeId:r.homeId,room:r.room,placeId:'',title:text(lang,'사용자가 보낸 쪽지를 읽는 중','Reading your note','ユーザーからの手紙を読んでいます'),desc:text(lang,'도착한 쪽지를 펼쳐 한 줄씩 읽고 있어요. 마지막 줄까지 읽은 뒤 잘 접어 간직해요.','They unfold your note and read it line by line, then fold it carefully to keep.','届いた手紙を広げて一行ずつ読み、最後まで読んでから丁寧に畳んでしまいます。'),kind:'read',actionKind:'read',playerNoteId:note.id,interactionId:'player-note:'+note.id,recoveryEndsAt:r.endsAt,minute,time:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),withId:'',withIds:[],groupInteraction:false,copy:Object.fromEntries(['en','ja'].map(l=>[l,{title:text(l,'사용자가 보낸 쪽지를 읽는 중','Reading your note','ユーザーからの手紙を読んでいます'),desc:text(l,'','They unfold your note and read it line by line, then fold it carefully to keep.','届いた手紙を広げて一行ずつ読み、最後まで読んでから丁寧に畳んでしまいます。')}])),localizedCopy:undefined};
}
export function playerNoteLogs(c,now=Date.now(),lang='ko'){
 const day=new Date(now).toDateString(),rows=[];
 for(const n of c.playerNotes||[]){const r=c.noteReceipts?.[n.id];for(const [kind,at,homeId,room] of [['arrival',n.createdAt,n.homeId,'entry'],['read',r?.startedAt,r?.homeId,r?.room]]){if(!at||at>now||new Date(at).toDateString()!==day)continue;const d=new Date(at),reading=kind==='read';rows.push({home:true,visitHomeId:homeId,room,minute:d.getHours()*60+d.getMinutes(),time:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),playerNoteId:n.id,noteEvent:kind,interactionId:'player-note:'+n.id+':'+kind,important:true,title:reading?text(lang,'사용자가 보낸 쪽지를 읽는 중','Reading your note','ユーザーの手紙を読む'):text(lang,'사용자의 쪽지가 도착했어요','Your note arrived','ユーザーから手紙が届きました'),desc:reading?text(lang,'쪽지를 펼쳐 한 줄씩 읽고 있어요.','They unfold your note and read it line by line.','手紙を広げて一行ずつ読んでいます。'):text(lang,`${c.name} 앞으로 보낸 쪽지가 집 우편함에 도착했어요.`,`A note addressed to ${c.name} arrived in the home mailbox.`,`${c.name}宛ての手紙が家の郵便受けに届きました。`)});}}
 return rows;
}
let cachedKey,cachedRaw,cachedRows=[];
export function syncLocalPlayerNotes(world,c){
 if(world.sharedContext||typeof localStorage==='undefined')return false;
 const key='drawer-player-mail:'+(globalThis.window?.ParallelCityAuth?.getInfo?.()?.user?.uid||'guest');let raw;try{raw=localStorage.getItem(key)||'[]';}catch{return false;}
 if(key!==cachedKey||raw!==cachedRaw){cachedKey=key;cachedRaw=raw;try{const parsed=JSON.parse(raw);cachedRows=Array.isArray(parsed)?parsed:[]}catch{cachedRows=[];}}
 let changed=false;for(const n of cachedRows)if(n.targetId===c.id&&!n.sourceId)changed=enqueuePlayerNote(c,n)||changed;return changed;
}
