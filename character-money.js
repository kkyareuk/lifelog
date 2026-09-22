import {settleSalary,employmentOffer} from './salary.js';
import {applyWorldCurrency} from './career-world.js';
export const BASE_MEAL=10000;
export const INITIAL_MONEY=Object.freeze({'형편이 어려움':50000,'평범한 형편':500000,'설정하지 않음':500000,'여유 있는 편':3000000,'부유함':30000000,'대부호':300000000});
const integer=n=>Number.isSafeInteger(n)&&n>=0;
export function ensureWallet(character,now=Date.now()){
 if(!character.wallet||character.wallet.version!==1)character.wallet={version:1,revision:1,balance:INITIAL_MONEY[character.wealth]??500000,startedAt:now,updatedAt:now,entries:[],receipts:[],settings:{unit:'원',mealPrice:10000,wage:100000,datePayment:'split',datePayFrequency:50}};
 return character.wallet;
}
export function moneySettings(character){return {unit:'원',mealPrice:10000,wage:100000,datePayment:'split',datePayFrequency:50,...character.wallet?.settings}}
export function displayMoney(amount,character,language='ko'){
 const s=moneySettings(character),value=amount/BASE_MEAL*s.mealPrice;return new Intl.NumberFormat(({ko:'ko-KR',en:'en-US',ja:'ja-JP'})[language]||'ko-KR',{maximumFractionDigits:8}).format(value)+' '+s.unit;
}
export function moneyFromDisplay(value,character){const n=Math.round(Number(value)*BASE_MEAL/moneySettings(character).mealPrice);if(!integer(n)||n>1e12)throw Error('money-invalid-amount');return n}
export function updateMoneySettings(character,patch,now=Date.now()){
 const wallet=ensureWallet(character,now),next={...moneySettings(character),...patch};
 if(typeof next.unit!=='string'||!next.unit.trim()||next.unit.length>20||!Number.isFinite(next.mealPrice)||next.mealPrice<0.0001||next.mealPrice>1e9||!integer(next.wage)||next.wage>1e10||!['split','treat','request'].includes(next.datePayment)||!Number.isFinite(next.datePayFrequency)||next.datePayFrequency<0||next.datePayFrequency>100)throw Error('money-invalid-settings');
 if(patch.wealth!==undefined&&!Object.hasOwn(INITIAL_MONEY,patch.wealth))throw Error('money-invalid-settings');
 if(patch.income!==undefined&&!["절약 우선","필요한 만큼 소비","취향에는 아끼지 않음","품질 우선","가격을 거의 신경 쓰지 않음"].includes(patch.income))throw Error('money-invalid-settings');
 wallet.settings={unit:next.unit.trim(),mealPrice:next.mealPrice,wage:next.wage,datePayment:next.datePayment,datePayFrequency:next.datePayFrequency};
 if(patch.wealth!==undefined)character.wealth=patch.wealth;
 if(patch.income!==undefined)character.income=patch.income;
 wallet.updatedAt=now;
}
export function moneyEntry(wallet,amount,key,kind,now,label=''){
 if(wallet.receipts.includes(key))return false;
 if(!Number.isSafeInteger(amount)||!integer(wallet.balance+amount))throw Error('money-insufficient');
 wallet.balance+=amount;wallet.revision=(wallet.revision||0)+1;wallet.updatedAt=now;wallet.receipts=[...wallet.receipts,key].slice(-500);wallet.entries=[{key,kind,amount,at:now,label},...wallet.entries].slice(0,100);return true;
}
export function activityPrice(place,activity={}){
 if(!place||activity.transit||activity.home)return 0;
 const kind=activity.kind||activity.meetingKind||activity.actionKind||activity.activityFamily||'',task=activity.lifeTask||activity.lifeTaskId||'',text=[kind,task,activity.baseTitle||activity.title||''].join(' ');
 if(/talk|gossip|walk|대화|산책|이동/.test(text)&&!(/tea|dine|drink|식사|음료/.test(text)))return 0;
 const base=place.type==='카페'&&/cafe|tea|drink|meal|eat|coffee|카페|커피|음료|차를|마시/.test(text)?5000:place.type==='음식점'&&/dine|meal|eat|food|식사|음식|점심|저녁|먹는/.test(text)?10000:place.type==='병원'&&/hospital|medical|treat|진료|치료|검진/.test(text)?20000:place.type==='공연장'&&/music|perform|concert|watch|공연|관람/.test(text)?30000:['상점','옷가게','쇼핑몰'].includes(place.type)&&/shop|grocer|buy|쇼핑|장보기|구매/.test(text)?20000:0;
 return Math.round(base*({'저렴':.7,'보통':1,'고급':2,'명품':4}[place.priceRange]||1));
}
export function sharedWallet(home){return home.commonWallet??={version:1,balance:0,members:[],entries:[],receipts:[]}}
export function setWalletSharing(world,characterId,homeId,enabled){
 const c=world.characters[characterId],h=world.homes[homeId];if(!c||!h||!(c.homeId===homeId||c.residences?.some(r=>r.homeId===homeId)))throw Error('money-household-required');
 const wallet=sharedWallet(h);wallet.members=wallet.members.filter(id=>id!==characterId);if(enabled)wallet.members.push(characterId);return wallet;
}
export function moveCommonMoney(world,characterId,homeId,amount,kind,key,now=Date.now()){
 if(!['deposit','withdraw'].includes(kind))throw Error('money-invalid-action');
 if(!integer(amount)||amount<=0)throw Error('money-invalid-amount');
 const c=world.characters[characterId],home=world.homes[homeId];if(!c||!home)throw Error('money-household-required');
 const common=sharedWallet(home),personal=ensureWallet(c,now);if(!common.members.includes(characterId)||!(c.homeId===homeId||c.residences?.some(r=>r.homeId===homeId)))throw Error('money-household-required');
 if(common.receipts.includes(key))return false;
 const source=kind==='deposit'?personal:common,target=kind==='deposit'?common:personal;if(source.balance<amount)throw Error('money-insufficient');
 moneyEntry(source,-amount,key,kind,now,c.name);moneyEntry(target,amount,key,kind,now,c.name);return true;
}
export function payActivity(world,characterIds,amount,key,now,payment='split'){
 if(!amount)return true;const ids=[...new Set(characterIds)].filter(id=>world.characters[id]);
 // Existing multiplayer residents opt in through the new wallet endpoint.
 if(world.sharedContext&&ids.some(id=>!world.characters[id].wallet))return true;
 const payers=payment==='treat'?[{id:ids[0],amount:amount*ids.length}]:payment==='request'&&ids.length>1?[{id:ids[1],amount:amount*ids.length}]:ids.map(id=>({id,amount}));
 const plans=[],available=new Map();
 for(const p of payers){const c=world.characters[p.id],personal=ensureWallet(c,now),receipt=key+':'+p.id;if(personal.receipts.includes(receipt))continue;
  const home=Object.values(world.homes||{}).find(h=>h.commonWallet?.members?.includes(c.id)&&(c.homeId===h.id||c.residences?.some(r=>r.homeId===h.id))),common=home?.commonWallet;
  const left=common?(available.get(common)??common.balance):0,together=Math.min(left,p.amount),own=p.amount-together;
  if(personal.balance<own)return false;if(common)available.set(common,left-together);plans.push({personal,common,together,own,receipt});
 }
 for(const p of plans){if(p.together)moneyEntry(p.common,-p.together,p.receipt,'expense',now);moneyEntry(p.personal,-p.own,p.receipt,'expense',now)}return true;
}
export function settleEmployment(world,c,now=Date.now(),force=false){
 const wallet=c.wallet,employment=wallet?.employment;if(!employment)return false;
 applyWorldCurrency(world,c);
 if(!force&&now-employment.lastAt<60000)return false;
 const before=employment.lastAt;settleSalary(wallet,employment,now,moneyEntry);
 try{const offer=employmentOffer(world,employment.jobId,employment.rankId);Object.assign(employment,offer)}catch{}
 if(employment.lastAt!==before){wallet.revision=(wallet.revision||0)+1;wallet.updatedAt=now;return true}return false;
}
// Called only for live scenes. Historical log rendering must never move money.
export function settleMoneyScene(world,c,scene,now){
 if(world.sharedContext&&!c.wallet)return scene;
 settleEmployment(world,c,now);
 const wallet=ensureWallet(c,now),day=Math.floor(now/86400000),work=!scene.transit&&!scene.meetingJourney&&!scene.meetingWaiting&&!scene.routineReturned&&(scene.economyWork||scene.kind==='work'||scene.actionKind==='work'||scene.meetingKind==='work'||['업무','출근','근무'].includes(scene.routineType));
 const workKey='work:'+(scene.economyActivityId||day+':'+(scene.routineId||scene.placeId||'job'));
 if(!wallet.employment&&wallet.work&&(!work||wallet.work.key!==workKey)){
  if(now>=wallet.work.startedAt&&(!wallet.work.endsAt||now>=wallet.work.endsAt)&&c.job&&!['무직','학생'].includes(c.job))moneyEntry(wallet,moneySettings(c).wage,wallet.work.key,'wage',now,c.jobTitle||c.job);
  delete wallet.work;wallet.revision=(wallet.revision||0)+1;
 }
 if(!wallet.employment&&work&&!wallet.receipts.includes(workKey)&&!wallet.work){
  const end=new Date(now);end.setHours(0,Number(scene.routineEndMinute)||0,0,0);
  wallet.work={key:workKey,startedAt:now,endsAt:scene.economyEndsAt||(scene.routineId?end.getTime():0)};wallet.revision=(wallet.revision||0)+1;
 }
 if(scene.manualDirective||work)return scene;
 const place=world.world?.places?.find(p=>p.id===scene.placeId)||world.towns?.flatMap(t=>t.places||[]).find(p=>p.id===scene.placeId),cost=activityPrice(place,scene);
 if(!cost)return scene;const key='activity:'+day+':'+(scene.interactionId||scene.routineId||[scene.placeId,scene.minute,scene.kind||scene.actionKind].join(':'));
 const ids=scene.dateGroup?[...new Set([c.id,scene.withId,...(scene.withIds||[])].filter(id=>world.characters[id]))].sort():[c.id];
 const payer=world.characters[ids[0]],settings=moneySettings(payer);let roll=0;for(const ch of key+ids[0])roll=(roll*31+ch.charCodeAt(0))>>>0;
 const payment=ids.length>1?(roll%100<settings.datePayFrequency?'treat':settings.datePayment==='request'?'request':'split'):'split';
 if(payActivity(world,ids,cost,key,now,payment))return scene;
 const language=world.uiLanguage||'ko',copy={ko:['잔액을 확인하는 중','이용료가 부족해 유료 활동을 시작하지 않았어요.'],en:['Checking their balance','They could not start the activity because of insufficient funds.'],ja:['残高を確認中','残高不足のため有料の行動を始められませんでした。']}[language];
 return {...scene,title:copy[0],desc:copy[1],baseTitle:copy[0],baseDesc:copy[1],kind:'rest',actionKind:'rest',spendingBlocked:true,withId:null,withIds:[],groupInteraction:false};
}
