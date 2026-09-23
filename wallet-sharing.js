const accounts=new WeakMap();
export const moneyAccount=wallet=>accounts.get(wallet)||wallet;
export const walletBalance=wallet=>moneyAccount(wallet)?.balance||0;
export function bindWalletAccounts(world){for(const c of Object.values(world.characters||{})){if(!c.wallet)continue;const pool=world.walletSharing?.pools?.[c.wallet.poolId];if(pool?.members?.includes(c.id)&&!pool.closed)accounts.set(c.wallet,pool);else accounts.delete(c.wallet)}return world}
const owner=c=>c.ownerUid||'local';
const fail=code=>{throw Error(code)};
const fingerprint=(world,ids)=>JSON.stringify(ids.map(id=>{const c=world.characters[id],w=c?.wallet;if(!w)return [id,'missing'];const a=moneyAccount(w);return [id,owner(c),w.poolId||'',a.balance,a.revision||0]}));
export function sharingAction(world,uid,input,now=Date.now()){
 bindWalletAccounts(world);const sharing=world.walletSharing??={pools:{},requests:[]};sharing.pools??={};sharing.requests??=[];
 const source=world.characters[input.id];if(!source||!source.wallet||owner(source)!==uid)fail('money-owner-required');
 const pool=sharing.pools[source.wallet.poolId];
 if(input.action==='decline'||input.action==='accept'){
  const request=sharing.requests.find(r=>r.id===input.requestId&&r.status==='pending');if(!request||!request.owners.includes(uid)||!request.members.includes(source.id))fail('money-request-missing');
  if(input.action==='decline'){request.status='declined';return sharing}
  if(request.fingerprint!==fingerprint(world,request.members))fail('money-sharing-changed');
  request.accepted=[...new Set([...request.accepted,uid])];if(!request.owners.every(id=>request.accepted.includes(id)))return sharing;
  complete(request);return sharing;
 }
 let members,amounts;
 if(input.action==='share'){
  const target=world.characters[input.targetId];if(!target||target.id===source.id)fail('money-target-invalid');const other=sharing.pools[target.wallet.poolId];
  members=[...new Set([...(pool?.members||[source.id]),...(other?.members||[target.id])])].sort();if(pool&&pool===other)return sharing;
 }else if(input.action==='split'){
  if(!pool||pool.closed)fail('money-sharing-missing');members=[...pool.members].sort();amounts=input.amounts;
  if(!amounts||Object.keys(amounts).length!==members.length||members.some(id=>!Number.isSafeInteger(amounts[id])||amounts[id]<0)||members.reduce((n,id)=>n+amounts[id],0)!==pool.balance)fail('money-split-invalid');
 }else fail('money-invalid-action');
 if(members.length>20||members.some(id=>!world.characters[id]?.wallet))fail('money-target-invalid');
 const owners=[...new Set(members.map(id=>owner(world.characters[id])))];
 const request={id:crypto.randomUUID(),kind:input.action,members,owners,accepted:[uid],fingerprint:fingerprint(world,members),amounts:amounts||null,status:'pending',createdAt:now};
 // Keep every active agreement; replace an earlier proposal for exactly these members.
 for(const old of sharing.requests)if(old.status==='pending'&&old.members.join('|')===members.join('|'))old.status='superseded';
 const active=sharing.requests.filter(r=>r.status==='pending');if(active.length>=50)fail('money-sharing-limit');
 sharing.requests=[...sharing.requests.filter(r=>r.status!=='pending'&&r.createdAt>now-30*86400000).slice(-49),...active,request];
 if(owners.length===1)complete(request);return sharing;
 function complete(request){
  const oldPools=new Set(request.members.map(id=>world.characters[id].wallet.poolId).filter(Boolean));
  if(request.kind==='share'){
   const unique=new Set(request.members.map(id=>moneyAccount(world.characters[id].wallet))),balance=[...unique].reduce((n,a)=>n+a.balance,0);if(!Number.isSafeInteger(balance))fail('money-invalid-amount');
   const id='pool-'+request.id;sharing.pools[id]={id,balance,members:request.members,revision:1};
   for(const member of request.members){const w=world.characters[member].wallet;w.balance=0;w.poolId=id;w.revision=(w.revision||0)+1;}
  }else for(const member of request.members){const w=world.characters[member].wallet;w.balance=request.amounts[member];delete w.poolId;w.revision=(w.revision||0)+1;}
  for(const id of oldPools){sharing.pools[id].closed=true;sharing.pools[id].balance=0;}
  request.status='completed';request.completedAt=now;bindWalletAccounts(world);
 }
}
