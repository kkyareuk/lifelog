import {careerAvailable} from './economy-access.js';
import {careersFor,applyWorldCurrency} from './career-world.js';
import {careerLabel} from './career-catalog.js';
import {assignEmployment,employmentsFor} from './salary.js';
import {INITIAL_MONEY,ensureWallet,moneyEntry,updateMoneySettings,displayMoney} from './character-money.js';
import {bindWalletAccounts} from './wallet-sharing.js';
import {state,save} from './state.js?v=20260909dev305';
const words=(lang,ko,en,ja)=>({ko,en,ja}[lang]||ko);
const wealth=[['설정하지 않음','Unspecified','未設定'],['형편이 어려움','Struggling','生活が苦しい'],['평범한 형편','Average','普通'],['여유 있는 편','Comfortable','余裕がある'],['부유함','Wealthy','裕福'],['대부호','Very wealthy','大富豪']];
const spending=[['절약 우선','Save first','節約優先'],['필요한 만큼 소비','Spend as needed','必要な分だけ使う'],['취향에는 아끼지 않음','Spend on favorites','好みには惜しまない'],['품질 우선','Quality first','品質優先'],['가격을 거의 신경 쓰지 않음','Rarely mind the price','価格をほぼ気にしない']];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function quickEconomyMarkup(world,c){
 const tr=(...text)=>words(world.uiLanguage,...text),jobs=careersFor(world).filter(j=>!j.archived),selected=employmentsFor(c)[0]?.jobId||jobs.find(j=>j.name===c.job)?.id||'builtin-none';
 const select=(key,label,items,value)=>'<label>'+label+'<select data-quick-economy="'+key+'">'+items.map(([id,name])=>'<option value="'+esc(id)+'"'+(id===value?' selected':'')+'>'+esc(name)+'</option>').join('')+'</select></label>';
 return '<div data-quick-economy-fields="'+esc(c.id)+'">'+(careerAvailable()?select('job',tr('직업','Career','職業'),jobs.map(j=>[j.id,careerLabel(j,world.uiLanguage)]),selected):'')+select('wealth',tr('재산 유형','Wealth','資産の種類'),wealth.map(row=>[row[0],tr(...row)]),c.wealth||'평범한 형편')+select('income',tr('소비 유형','Spending style','消費傾向'),spending.map(row=>[row[0],tr(...row)]),c.income||'필요한 만큼 소비')+'<p role="status" hidden></p></div>';
}
// Stable IDs/canonical names are stored; translated option labels are display only.
export function quickCareerChange(world,c,jobId,now=Date.now()){
 const job=careersFor(world).find(j=>j.id===jobId&&!j.archived);if(!job)throw Error('career-missing');
 const previous=employmentsFor(c)[0];if(previous?.jobId===jobId)return;
 ensureWallet(c);applyWorldCurrency(world,c);bindWalletAccounts(world);
 assignEmployment(world,c,job.id,job.ranks[0].id,now,moneyEntry,{frequency:previous?.frequency||'monthly'});
 c.jobTitle='';c.timelineResetAt=now;
}
export function bindQuickEconomy(root,world,snapshot){
 for(const fields of root.querySelectorAll('[data-quick-economy-fields]')){
  if(fields.dataset.bound)return;fields.dataset.bound='1';const c=world.characters[fields.dataset.quickEconomyFields];if(!c)continue;
  const uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid,account=state,lang=world.uiLanguage,tr=(...text)=>words(lang,...text),status=fields.querySelector('[role=status]');let busy=false;
  const valid=()=>fields.isConnected&&state===account&&(!snapshot||window.ParallelCityAuth?.getInfo?.()?.user?.uid===uid&&window.DrawerVillageGroups?.getSnapshot?.()?.activeGroupId===snapshot.activeGroupId);
  const sync=()=>{const job=fields.querySelector('[data-quick-economy=job]');if(job)job.value=employmentsFor(c)[0]?.jobId||careersFor(world).find(j=>j.name===c.job)?.id||'builtin-none';fields.querySelector('[data-quick-economy=wealth]').value=c.wealth||'평범한 형편';fields.querySelector('[data-quick-economy=income]').value=c.income||'필요한 만큼 소비';for(const el of fields.querySelectorAll('select'))el.disabled=busy||!!snapshot&&c.ownerUid!==uid||el.dataset.quickEconomy==='wealth'&&!!c.wallet?.poolId;};
  sync();
  for(const el of fields.querySelectorAll('select'))el.onchange=async()=>{
   if(busy||!valid()){sync();return}const key=el.dataset.quickEconomy,value=el.value;
   if(key==='wealth'&&value!==c.wealth&&!window.confirm(tr('재산 유형을 바꾸면 현재 잔액이 다음 금액으로 바뀝니다: ','Changing wealth type replaces the current balance with: ','資産の種類を変更すると、現在の残高が次の金額に変わります：')+displayMoney(INITIAL_MONEY[value],c,lang))){sync();return}
   busy=true;for(const input of fields.querySelectorAll('select'))input.disabled=true;status.hidden=false;status.textContent=tr('관공서에 서류 제출하는 중…','Submitting paperwork at the municipal office…','役所に書類を提出しています…');
   try{
    if(snapshot){
     const job=key==='job'?careersFor(world).find(j=>j.id===value):null,previous=employmentsFor(c)[0];
     const payload=job?{action:'employment',jobId:job.id,rankId:job.ranks[0].id,jobTitle:'',frequency:previous?.frequency||'monthly',employmentId:previous?.id}:{action:'settings',patch:{[key]:value,...(key==='wealth'?{confirmWealthReset:true}:{})}};
     const result=await window.DrawerVillageGroups.characterMoney({id:c.id,...payload});if(!valid())return;
     c.wallet=result.wallet;for(const k of ['job','jobTitle','wealth','income'])if(result[k]!==undefined)c[k]=result[k];if(result.walletSharing){world.walletSharing=result.walletSharing;snapshot.group.walletSharing=result.walletSharing;bindWalletAccounts(world)}
     const record=window.DrawerVillageGroups.getSnapshot().residents.find(r=>r.id===c.id);if(record){record.lifeJson=JSON.stringify({...JSON.parse(record.lifeJson||'{}'),wallet:c.wallet});record.profileJson=JSON.stringify({...JSON.parse(record.profileJson||'{}'),job:c.job,jobTitle:c.jobTitle,wealth:c.wealth,income:c.income});}
    }else{if(key==='job')quickCareerChange(world,c,value);else updateMoneySettings(c,{[key]:value,...(key==='wealth'?{confirmWealthReset:true}:{})});if(!await save(true))throw Error('save-failed')}
    status.hidden=true;
   }catch(error){status.textContent=tr('저장하지 못했어요. 다시 선택해 주세요.','Could not save. Please select again.','保存できませんでした。もう一度選択してください。');}
   finally{busy=false;if(valid())sync()}
  };
 }
}
