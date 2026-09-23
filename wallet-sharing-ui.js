import {sharingAction,bindWalletAccounts,walletBalance} from './wallet-sharing.js';
import {ensureWallet,displayMoney,moneyFromDisplay,moneySettings,BASE_MEAL} from './character-money.js';
export function renderWalletSharing({container,world,c,snapshot,uid,canEdit,save,valid,onUpdate}){
 const tr=(ko,en,ja)=>({ko,en,ja}[world.uiLanguage]||ko),localUid=snapshot?uid:'local';
 const errors={
  'money-sharing-changed':tr('잔액이나 공유 상태가 바뀌었어요. 현재 금액으로 다시 제안해 주세요.','The balance or sharing status changed. Please make a new proposal.','残高または共有状態が変わりました。現在の金額で再提案してください。'),
  'money-split-invalid':tr('나눌 금액의 합계가 현재 잔액과 같아야 해요.','The amounts must add up to the current balance.','分配金額の合計を現在の残高と一致させてください。'),
  'money-request-missing':tr('이미 처리된 제안이에요. 다시 열어 주세요.','This proposal has already been handled. Please reopen.','処理済みの提案です。開き直してください。')};
 bindWalletAccounts(world);
 const title=document.createElement('h3');title.textContent=tr('선택한 캐릭터와 재산 공유','Share money with selected characters','選んだキャラクターと資産を共有');container.append(title);
 const status=document.createElement('p');status.setAttribute('role','status');let busy=false;
 const run=async input=>{if(busy||!canEdit||!valid())return;busy=true;const fields=[...container.querySelectorAll('button,select,input')].map(e=>[e,e.disabled]);fields.forEach(([e])=>e.disabled=true);
  try{
   if(snapshot){const result=await window.DrawerVillageGroups.walletSharing({id:c.id,...input});if(!valid())return;world.walletSharing=result.walletSharing;snapshot.group.walletSharing=result.walletSharing;for(const [id,wallet] of Object.entries(result.wallets)){if(world.characters[id])world.characters[id].wallet=wallet;const r=snapshot.residents.find(r=>r.id===id);if(r)r.lifeJson=JSON.stringify({...JSON.parse(r.lifeJson||'{}'),wallet});}}
   else{for(const person of Object.values(world.characters))ensureWallet(person);sharingAction(world,localUid,{id:c.id,...input});if(!await save(true))throw Error(tr('저장하지 못했어요.','Could not save.','保存できませんでした。'));}
   bindWalletAccounts(world);onUpdate();
  }catch(e){status.textContent=errors[e.message]||e.message;fields.forEach(([e,disabled])=>e.disabled=disabled);}finally{busy=false}
 };
 const pool=world.walletSharing?.pools?.[c.wallet?.poolId],members=pool?.members||[c.id];
 const select=document.createElement('select');select.setAttribute('aria-label',title.textContent);select.add(new Option(tr('캐릭터 선택','Select a character','キャラクターを選択'),''));select.disabled=!canEdit;
 for(const person of Object.values(world.characters).filter(p=>!members.includes(p.id)))select.add(new Option(person.name,person.id));
 select.onchange=()=>{if(select.value)void run({action:'share',targetId:select.value})};container.append(select);
 const help=document.createElement('p');help.textContent=tr('내 캐릭터끼리는 바로 합쳐져요. 다른 유저와는 모두 수락한 뒤 합쳐져요.','Your own characters merge immediately. Other owners must all accept first.','自分のキャラクター同士はすぐに合算します。他のユーザーとは全員の承認後に合算します。');container.append(help);
 if(pool&&!pool.closed){
  const names=document.createElement('p');names.textContent=members.map(id=>world.characters[id]?.name||id).join(' · ');container.append(names);
  const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=tr('공유 해제 금액 조정','Adjust amounts to end sharing','共有解除時の金額を調整');details.append(summary);container.append(details);
  const balance=walletBalance(c.wallet),base=Math.floor(balance/members.length),inputs=new Map();let remainder=balance-base*members.length;
  for(const id of members){const label=document.createElement('label'),input=document.createElement('input');label.textContent=world.characters[id]?.name||id;input.type='number';input.min='0';input.step='any';input.disabled=!canEdit;input.value=(base+(remainder-->0?1:0))/BASE_MEAL*moneySettings(c).mealPrice;label.append(input);details.append(label);inputs.set(id,input);}
  const total=document.createElement('p');total.textContent=tr('합계: ','Total: ','合計：')+displayMoney(balance,c,world.uiLanguage);details.append(total);
  const button=document.createElement('button');button.type='button';button.disabled=!canEdit;button.textContent=tr('이 금액으로 공유 해제 제안','Propose these amounts','この金額で共有解除を提案');button.onclick=()=>{try{void run({action:'split',amounts:Object.fromEntries([...inputs].map(([id,input])=>[id,moneyFromDisplay(input.value,c)]))})}catch(e){status.textContent=errors[e.message]||e.message}};details.append(button);
 }
 for(const request of world.walletSharing?.requests||[]){if(request.status!=='pending'||!request.owners.includes(localUid)||!request.members.includes(c.id))continue;
  const section=document.createElement('section'),heading=document.createElement('h4');heading.textContent=request.kind==='split'?tr('공유 해제 제안','Proposal to end sharing','共有解除の提案'):tr('재산 공유 제안','Money sharing proposal','資産共有の提案');section.append(heading);
  const people=document.createElement('p');people.textContent=request.members.map(id=>(world.characters[id]?.name||id)+(request.amounts?' · '+displayMoney(request.amounts[id],c,world.uiLanguage):'')).join('\n');people.style.whiteSpace='pre-line';section.append(people);
  const progress=document.createElement('p');progress.textContent=tr('수락한 유저 ','Owners accepted: ','承認済みユーザー：')+request.accepted.length+' / '+request.owners.length;section.append(progress);
  for(const [action,label] of [['accept',tr('수락','Accept','承認')],['decline',tr('거절 / 취소','Decline / cancel','拒否・取り消し')]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!canEdit||(action==='accept'&&request.accepted.includes(localUid));b.onclick=()=>void run({action,requestId:request.id});section.append(b);}container.append(section);
 }
 container.append(status);
}
