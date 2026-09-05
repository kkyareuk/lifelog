// The OS notification and inbox share one immutable envelope. Kept per account
// and per device: future local notifications are not imported from another phone.
export function mailEnvelope(item,owner){
  const at=new Date(item.at||item.extra?.scheduledAt).getTime();
  const id=`${item.id}:${at}`;
  return {...item,extra:{...item.extra,mailId:id,mailOwner:owner,mailTitle:String(item.title||''),mailBody:String(item.body||''),scheduledAt:new Date(at).toISOString()}};
}
export function createContactMailbox(storage){
  const key='drawer-village-contact-mail-v1',deletedKey='drawer-village-contact-mail-deleted-v1';let cachedOwner,cached=[];
  function read(){cachedOwner=storage.scope;try{cached=JSON.parse(storage.getItem(key)||'[]')}catch{cached=[]}if(!Array.isArray(cached))cached=[];return cached}
  function write(messages){storage.setItem(key,JSON.stringify(messages));cached=messages;cachedOwner=storage.scope;return messages}
  function readDeleted(){let deleted;try{deleted=JSON.parse(storage.getItem(deletedKey)||'[]')}catch{deleted=[]}return Array.isArray(deleted)?deleted.filter(Boolean).map(String):[]}
  function writeDeleted(ids){const next=[...new Set(ids.map(String))].slice(-500);storage.setItem(deletedKey,JSON.stringify(next));return next}
  function record(items,{replaceFuture=false,now=Date.now()}={}){
    const existing=read(),deleted=new Set(readDeleted()),past=existing.filter(m=>!replaceFuture||m.at<=now),map=new Map(past.filter(m=>!deleted.has(String(m.id))).map(m=>[m.id,m]));
    for(const item of items){const e=item.extra||{};if(e.mailOwner!==storage.scope||!e.mailId||deleted.has(String(e.mailId)))continue;const prior=existing.find(m=>m.id===e.mailId);if(prior&&prior.at<=now){map.set(prior.id,prior);continue}map.set(e.mailId,{id:e.mailId,title:e.mailTitle,body:e.mailBody,at:Date.parse(e.scheduledAt),extra:e,read:false,answered:false})}
    const all=[...map.values()].sort((a,b)=>a.at-b.at),received=all.filter(m=>m.at<=now).slice(-180),future=all.filter(m=>m.at>now).slice(0,500);
    return write([...received,...future]);
  }
  function removeMany(ids){
    const targets=new Set((ids||[]).map(String).filter(Boolean));
    if(!targets.size)return 0;
    const messages=read(),removed=messages.filter(m=>targets.has(String(m.id))).length;
    write(messages.filter(m=>!targets.has(String(m.id))));
    writeDeleted([...readDeleted(),...targets]);
    return removed;
  }
  return {record,
    due:(characters,now=Date.now())=>read().filter(m=>m.at<=now&&characters[m.extra?.characterId]).sort((a,b)=>b.at-a.at),
    get:id=>read().find(m=>m.id===id),
    nextAt:(now=Date.now())=>read().filter(m=>m.at>now).reduce((next,m)=>Math.min(next,m.at),Infinity),
    mark:(id,patch)=>write(read().map(m=>m.id===id?{...m,...patch}:m)),
    remove:id=>removeMany([id]),
    removeMany,
    accept(extra){if(extra.mailOwner!==storage.scope||!extra.mailId)return null;let m=read().find(m=>m.id===extra.mailId);if(!m&&extra.mailBody){record([{extra}]);m=read().find(m=>m.id===extra.mailId)}return m||null}
  };
}
