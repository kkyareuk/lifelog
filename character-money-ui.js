import {openEmployment,openCareerWorld} from './career-ui.js';
import {applyWorldCurrency} from './career-world.js';
import {economyAvailable} from './economy-access.js';
import {displayImageSource} from './local-media.js?v=20260909dev305';
import {state,save} from './state.js?v=20260909dev305';
import {ensureWallet,moneySettings,displayMoney,moneyFromDisplay,updateMoneySettings,setWalletSharing,moveCommonMoney} from './character-money.js';
import {buildSharedWorld} from './shared-world.js?v=20260909dev305';

const walletLoads=new Map();
const words=(language,ko,en,ja)=>({ko,en,ja}[language]||ko);
function context(){const snapshot=window.DrawerVillageGroups?.getSnapshot?.(),shared=snapshot?.activeGroupId&&snapshot.group,world=shared?buildSharedWorld(snapshot,state.uiLanguage):state;const id=document.querySelector('[data-observed-character]')?.dataset.observedCharacter||world.activeId;return {world,c:world.characters[id],snapshot:shared?snapshot:null}}
const errorText=(error,lang)=>error.message==='money-insufficient'?words(lang,'잔액이 부족해요.','Insufficient funds.','残高が不足しています。'):error.message;
export function openCharacterMoney(pane='wallet',characterId=null,homeId=null){
 const info=context(),{world,snapshot}=info,c=characterId?world.characters[characterId]:info.c;if(!c)return;
 if(!economyAvailable()){
  const d=document.createElement('dialog'),title=document.createElement('h2'),message=document.createElement('p'),close=document.createElement('button');d.className='character-money-coming';title.id='money-coming-title';title.textContent=pane==='work'?words(world.uiLanguage,'직장','Work','仕事'):words(world.uiLanguage,'지갑','Wallet','財布');d.setAttribute('aria-labelledby',title.id);message.textContent=words(world.uiLanguage,'준비 중입니다.','Coming soon.','準備中です。');close.textContent=words(world.uiLanguage,'닫기','Close','閉じる');close.onclick=()=>d.close();d.onclose=()=>d.remove();d.append(title,message,close);document.body.append(d);d.showModal();return d;
 }

 if(pane==='work')return openEmployment(world,c,snapshot);
 applyWorldCurrency(world,c);
 const tr=(ko,en,ja)=>words(world.uiLanguage,ko,en,ja),uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid||'',canEdit=!snapshot||c.ownerUid===uid,accountState=state;
 if(economyAvailable()&&!c.wallet&&!snapshot){ensureWallet(c);applyWorldCurrency(world,c);save(true)}
 const d=document.createElement('dialog');d.className='character-money-dialog';const isWork=pane==='work';d.dataset.moneyScreen=isWork?'work':'wallet';let page=pane,busy=false;
 const valid=()=>state===accountState&&(window.ParallelCityAuth?.getInfo?.()?.user?.uid||'')===uid&&(!snapshot||window.DrawerVillageGroups?.getSnapshot?.()?.activeGroupId===snapshot.activeGroupId);
 const mutate=async(action,payload={})=>{
  if(busy||!canEdit||!valid())return;busy=true;
  try{
   if(snapshot){const result=await window.DrawerVillageGroups.characterMoney({id:c.id,action,...payload});if(!valid())return;c.wallet=result.wallet;const record=snapshot.residents.find(r=>r.id===c.id);if(record)record.lifeJson=JSON.stringify({...JSON.parse(record.lifeJson||'{}'),wallet:result.wallet});if(payload.homeId&&result.commonWallet){world.homes[payload.homeId].commonWallet=result.commonWallet;const h=snapshot.homes.find(h=>h.id===payload.homeId);if(h)h.commonWallet=result.commonWallet}}
   else{if(action==='settings')updateMoneySettings(c,payload.patch);else if(action==='share')setWalletSharing(world,c.id,payload.homeId,payload.enabled);else if(['deposit','withdraw'].includes(action))moveCommonMoney(world,c.id,payload.homeId,payload.amount,action,payload.requestId);if(!await save(true))throw Error(tr('저장하지 못했어요.','Could not save.','保存できませんでした。'))}
   draw();
  }catch(error){const p=d.querySelector('[role=status]');if(p)p.textContent=errorText(error,world.uiLanguage)}finally{busy=false}
 };
 function draw(){
  d.replaceChildren();const head=document.createElement('header'),title=document.createElement('h2');title.textContent=c.name+' · '+(isWork?tr('직장','Work','仕事'):tr('지갑','Wallet','財布'));const close=document.createElement('button');close.textContent='×';close.onclick=()=>d.close();head.append(title,close);d.append(head);
  const nav=document.createElement('nav');for(const [key,ko,en,ja] of (isWork?[]:[['wallet','재화','Money','お金'],['settings','설정','Settings','設定']])){const b=document.createElement('button');b.textContent=tr(ko,en,ja);b.setAttribute('aria-pressed',String(page===key));b.onclick=()=>{page=key;draw()};nav.append(b)}if(!isWork)d.append(nav);
  const balance=document.createElement('h3');balance.textContent=displayMoney(c.wallet?.balance||0,c,world.uiLanguage);if(!isWork)d.append(balance);const content=document.createElement('section');d.append(content);
  const field=(label,type,value)=>{const l=document.createElement('label');l.append(document.createTextNode(label));const input=document.createElement('input');input.type=type;input.value=value;input.disabled=!canEdit;l.append(input);content.append(l);return input};
  const action=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=!canEdit;b.onclick=fn;content.append(b);return b};
  if(page==='settings'){
   const s=moneySettings(c);action(tr('세계관 화폐 설정 열기','Open world currency settings','世界の通貨設定を開く'),()=>{d.close();openCareerWorld('currency')});
   const payment=document.createElement('select');payment.disabled=!canEdit;payment.setAttribute('aria-label',tr('데이트 계산 방식','Date payment preference','デートの支払い方'));for(const [v,ko,en,ja] of [['split','각자 계산','Split','割り勘'],['treat','내가 계산','My treat','自分が払う'],['request','상대에게 부탁','Ask companion','相手にお願いする']])payment.add(new Option(tr(ko,en,ja),v,false,s.datePayment===v));content.append(payment);
   const frequency=field(tr('데이트에서 내가 계산하는 빈도 (%)','How often I pay on dates (%)','デートで自分が払う頻度（%）'),'number',s.datePayFrequency);frequency.min='0';frequency.max='100';
   const choice=(label,values,current)=>{const l=document.createElement('label'),select=document.createElement('select');l.textContent=label;select.disabled=!canEdit;for(const [ko,en,ja] of values)select.add(new Option(tr(ko,en,ja),ko,false,ko===current));l.append(select);content.append(l);return select};
   const wealth=choice(tr('재산 유형','Wealth','資産の種類'),[['설정하지 않음','Unspecified','未設定'],['형편이 어려움','Struggling','生活が苦しい'],['평범한 형편','Average','普通'],['여유 있는 편','Comfortable','余裕がある'],['부유함','Wealthy','裕福'],['대부호','Very wealthy','大富豪']],c.wealth||'평범한 형편');
   const spending=choice(tr('소비 유형','Spending style','消費傾向'),[['절약 우선','Save first','節約優先'],['필요한 만큼 소비','Spend as needed','必要な分だけ使う'],['취향에는 아끼지 않음','Spend on favorites','好みには惜しまない'],['품질 우선','Quality first','品質優先'],['가격을 거의 신경 쓰지 않음','Rarely mind the price','価格をほぼ気にしない']],c.income||'필요한 만큼 소비');
   action(tr('저장','Save','保存'),()=>mutate('settings',{patch:{datePayment:payment.value,datePayFrequency:Number(frequency.value),wealth:wealth.value,income:spending.value}}));
  }else{
   const homes=Object.values(world.homes).filter(h=>c.homeId===h.id||c.residences?.some(r=>r.homeId===h.id));
   for(const home of homes.filter(h=>!homeId||homeId===h.id)){
    const row=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.disabled=!canEdit;check.checked=home.commonWallet?.members?.includes(c.id)||false;check.onchange=()=>mutate('share',{homeId:home.id,enabled:check.checked});row.append(check,document.createTextNode(home.name+' · '+tr('현재 동거인과 재산 공유','Share with housemates','同居人と資産を共有')));content.append(row);
    const amount=document.createElement('p');amount.textContent=tr('공동지갑: ','Shared wallet: ','共同財布：')+displayMoney(home.commonWallet?.balance||0,c,world.uiLanguage);content.append(amount);
    if(check.checked){const input=field(tr('입금 / 출금 금액','Deposit / withdraw amount','入金・出金額'),'number','');input.min='0';input.step='any';for(const [kind,ko,en,ja] of [['deposit','넣기','Deposit','入金'],['withdraw','꺼내기','Withdraw','出金']])action(tr(ko,en,ja),()=>{try{void mutate(kind,{homeId:home.id,amount:moneyFromDisplay(input.value,c),requestId:crypto.randomUUID()})}catch(e){d.querySelector('[role=status]').textContent=errorText(e,world.uiLanguage)}})}
   }
   const history=document.createElement('ol');for(const entry of c.wallet?.entries||[]){const li=document.createElement('li');const label=['wage','salary'].includes(entry.kind)?tr('급여','Wages','給与'):entry.kind==='expense'?tr('이용료','Expense','利用料'):tr('공동지갑 이체','Shared-wallet transfer','共同財布への振替');li.textContent=label+' · '+displayMoney(entry.amount,c,world.uiLanguage);history.append(li)}content.append(history);
  }
  const status=document.createElement('p');status.setAttribute('role','status');d.append(status);
 }
 d.onclose=()=>{d.remove();window.dispatchEvent(new Event('drawer-money-updated'))};document.body.append(d);draw();d.showModal();if(snapshot&&canEdit)void mutate('read');return d;
}
export function bindCharacterMoney(){
 const {world,c,snapshot}=context();if(!c)return;applyWorldCurrency(world,c);
 if(economyAvailable()&&snapshot&&!c.wallet&&c.ownerUid===window.ParallelCityAuth?.getInfo?.()?.user?.uid){
  const key=snapshot.activeGroupId+':'+c.id;
  if(!walletLoads.has(key)){
   const uid=c.ownerUid;
   walletLoads.set(key,window.DrawerVillageGroups.characterMoney({id:c.id,action:'read'}).then(result=>{
    if(window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid||window.DrawerVillageGroups.getSnapshot()?.activeGroupId!==snapshot.activeGroupId)return;
    const current=window.DrawerVillageGroups.getSnapshot().residents.find(r=>r.id===c.id);
    if(current){current.lifeJson=JSON.stringify({...JSON.parse(current.lifeJson||'{}'),wallet:result.wallet});window.dispatchEvent(new Event('drawer-money-updated'));}
   }).catch(()=>{}));
  }
 }
 if(economyAvailable()&&!c.wallet&&!snapshot){ensureWallet(c);applyWorldCurrency(world,c);save(true)}
 const hud=document.querySelector('.game-observe-hud,.standard-observe-view');
 if(hud&&!hud.querySelector('.character-money-shortcuts')){
  const balance=document.createElement('button');balance.type='button';balance.dataset.characterBalance='';balance.className='character-money-balance';balance.textContent=c.wallet?displayMoney(c.wallet.balance,c,world.uiLanguage):'—';balance.title=balance.textContent;balance.onclick=()=>openCharacterMoney();if(economyAvailable())hud.append(balance);
  const nav=document.createElement('nav');nav.className='character-money-shortcuts';for(const [key,ko,en,ja] of [['wallet','재산','Wealth','資産'],['work','직업','Career','職業']]){const b=document.createElement('button');b.type='button';const art=document.createElement('span'),label=document.createElement('small');art.setAttribute('aria-hidden','true');const img=document.createElement('img');img.src='./assets/home-ui/profile-placeholder.png';img.alt='';art.append(img);label.textContent=words(world.uiLanguage,ko,en,ja);b.append(art,label);b.setAttribute('aria-label',label.textContent);b.onclick=()=>openCharacterMoney(key);nav.append(b)}hud.append(nav);
 }
 document.querySelectorAll('[data-character-money-settings]').forEach(b=>b.onclick=()=>openCharacterMoney('settings',b.dataset.characterMoneySettings));
 const panel=document.querySelector('[data-home-feature="members"],[data-home-feature="residents"]');if(economyAvailable()&&panel&&!panel.querySelector('[data-household-wallet]')){const b=document.createElement('button');b.dataset.householdWallet='';b.textContent=words(world.uiLanguage,'동거인 공동지갑 설정','Household wallet settings','同居人の共同財布設定');b.onclick=()=>openCharacterMoney('wallet',c.id,world.activeHomeId);panel.append(b)}
}
