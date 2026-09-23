import {state,save} from './state.js?v=20260909dev305';
import {buildSharedWorld} from './shared-world.js?v=20260909dev305';
import {preparedFoods,foodSpoiled,actOnFood} from './prepared-food.js';
import {openPreparedFood} from './prepared-food-ui.js';
import {savedRecipeById} from './cooking.js';
import {recipeName} from './recipe-localizations.js';
import {recipeIcon} from './cooking-display.js';
import {libraryBooks,ownedBooks,bookName,bookAction} from './library-life.js';
const tr=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
function context(){const s=window.DrawerVillageGroups?.getSnapshot?.(),snapshot=s?.activeGroupId&&s.group?s:null;return {world:snapshot?buildSharedWorld(snapshot,state.uiLanguage):state,snapshot};}
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
function modal(title){const d=el('dialog',null,'career-dialog storage-browser'),h=el('header'),x=el('button','×');x.onclick=()=>d.close();h.append(el('h2',title),x);const body=el('section',null,'career-body');d.append(h,body);d.onclose=()=>d.remove();document.body.append(d);d.showModal();return {d,body};}
async function command(kind,actorId,id,action,options,initial){
 const fresh=context(),uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 if((fresh.snapshot?.activeGroupId||'')!==initial.group||uid!==initial.uid)throw Error('context-changed');
 if(fresh.snapshot)return window.DrawerVillageGroups.command({kind,characterId:actorId,...(kind==='library'?{bookId:id}:{dishId:id}),action,options});
 const backup=structuredClone(fresh.world.characters),directives=structuredClone(fresh.world.characterDirectives);
 try{if(kind==='library')bookAction(fresh.world,actorId,id,action);else actOnFood(fresh.world,actorId,id,action,options);if(!await save(true))throw Error('save-failed');}
 catch(e){fresh.world.characters=backup;fresh.world.characterDirectives=directives;throw e;}
 window.dispatchEvent(new Event('drawer-money-updated'));
}
export function appendStorageActions(list,target,actorId,close,world){
 const button=(label,fn)=>{const b=el('button',label);b.type='button';b.disabled=!actorId;b.onclick=()=>{close();fn()};list.prepend(b)};
 if(target.type==='furniture'&&/냉장고|fridge|refrigerator/i.test(target.item)){
  const spoiled=preparedFoods(world).some(x=>x.dish.homeId===target.homeId&&x.dish.storage==='fridge'&&foodSpoiled(x.dish));
  if(spoiled)button(tr('상한 음식 치우기','Clear spoiled food','傷んだ料理を片付ける'),()=>openFridge(target,actorId,true));
  button(tr('음식 가져가기','Take food','料理を取り出す'),()=>openFridge(target,actorId));
 }
 if(target.type==='furniture'&&/책장|책 선반|bookcase|bookshelf/i.test(target.item))button(tr('책장 열기','Open bookcase','本棚を開く'),()=>openBooks(actorId,'shelf'));
 if(target.type==='place'&&/도서관|library/i.test([target.place?.type,target.place?.name].join(' ')))button(tr('도서 대출·반납','Borrow / return books','本の貸出・返却'),()=>openBooks(actorId,'library'));
}
export function openFridge(target,actorId,clear=false){
 const {world,snapshot}=context(),initial={group:snapshot?.activeGroupId||'',uid:window.ParallelCityAuth?.getInfo?.()?.user?.uid},ui=modal(tr('냉장고','Refrigerator','冷蔵庫'));
 const status=el('p'),grid=el('div',null,'storage-grid');ui.body.append(grid,status);
 const draw=()=>{grid.replaceChildren();const foods=preparedFoods(context().world).filter(x=>x.dish.homeId===target.homeId&&(x.dish.storage==='fridge'||x.dish.storage==='lunchbox'&&x.dish.holderId===actorId));
  if(!foods.length)status.textContent=tr('냉장고가 비어 있어요.','The refrigerator is empty.','冷蔵庫は空です。');
  for(const {dish}of foods){const recipe=savedRecipeById(dish.recipeId,world,dish),b=el('button',null,'storage-card');b.append(el('span',recipeIcon(recipe||{}),'storage-icon'),el('b',recipe?recipeName(recipe,state.uiLanguage):dish.recipeId),el('small','★'.repeat(Math.max(1,Math.min(5,dish.rating||3)))));
   if(dish.storage==='lunchbox')b.append(el('small',tr('내 도시락','My lunchbox','自分のお弁当')));if(foodSpoiled(dish)){b.classList.add('is-spoiled');b.append(el('small',tr('상함','Spoiled','傷んでいます')));}b.onclick=()=>{ui.d.close();openPreparedFood(dish.id,actorId)};grid.append(b);}
 };
 draw();
 if(clear){const b=el('button',tr('상한 음식 모두 치우기','Clear all spoiled food','傷んだ料理をすべて片付ける'));b.onclick=async()=>{b.disabled=true;try{await command('food',actorId,'','clearSpoiled',{homeId:target.homeId},initial);draw();b.remove()}catch{status.textContent=tr('지금은 치울 수 없어요. 다시 시도해 주세요.','Unable to clear food now. Please retry.','今は片付けられません。再試行してください。');b.disabled=false}};ui.body.prepend(b);}
 return ui.d;
}
export function openBooks(actorId,mode='shelf'){
 const initialContext=context(),initial={group:initialContext.snapshot?.activeGroupId||'',uid:window.ParallelCityAuth?.getInfo?.()?.user?.uid},ui=modal(tr('책장','Bookcase','本棚'));
 const nav=el('nav'),grid=el('div',null,'storage-grid'),detail=el('section',null,'storage-detail'),status=el('p');
 let tab=mode,busy=false;
 const run=async(book,action)=>{if(busy)return;busy=true;detail.querySelectorAll('button').forEach(b=>b.disabled=true);try{await command('library',actorId,book.id,action,{},initial);if(action==='read'){ui.d.close();return;}detail.replaceChildren();draw();}catch(e){status.textContent=e.message==='money-insufficient'?tr('잔액이 부족해요.','Insufficient funds.','残高が不足しています。'):tr('지금은 실행할 수 없어요.','Unavailable right now.','今は実行できません。');}finally{busy=false;detail.querySelectorAll('button').forEach(b=>b.disabled=false);}};
 const draw=()=>{const {world}=context(),c=world.characters[actorId];if(!c){ui.d.close();return;}grid.replaceChildren();status.textContent='';nav.replaceChildren();
  const hasLibrary=(world.world?.places||[]).some(p=>/도서관|library/i.test([p.type,p.name].join(' ')));
  for(const [key,label]of [['shelf',tr('내 책','My books','自分の本')],['shop',tr('책 구매','Buy books','本を購入')],...(mode==='library'&&hasLibrary?[['library',tr('대출','Borrow','借りる')]]:[])]){const b=el('button',label);b.setAttribute('aria-pressed',String(tab===key));b.onclick=()=>{tab=key;detail.replaceChildren();draw()};nav.append(b);}
  const books=tab==='shelf'?ownedBooks(world,c):libraryBooks(world);
  for(const book of books){const b=el('button',null,'storage-card');b.append(el('span','📚','storage-icon'),el('b',bookName(book,state.uiLanguage)));const loan=c.library?.loans?.find(l=>l.bookId===book.id&&!l.returnedAt);if(loan)b.append(el('small',tr('반납일 ','Due ','返却日 ')+new Date(loan.dueAt).toLocaleDateString()));if(tab==='shop')b.append(el('small',book.price.toLocaleString()+' '+tr('원','KRW','ウォン')));b.onclick=()=>{detail.replaceChildren(el('h3',bookName(book,state.uiLanguage)));const owned=ownedBooks(world,c).some(x=>x.id===book.id);for(const [action,label]of [...(owned?[['read',tr('읽기','Read','読む')]]:tab==='library'?[['borrow',tr('14일 대출','Borrow for 14 days','14日間借りる')]]:[['buy',tr('구매','Buy','購入')]]),...(loan?[['return',tr('반납','Return','返却')]]:[])]){const a=el('button',label);a.onclick=()=>run(book,action);detail.append(a)}};grid.append(b);}
 };ui.body.append(nav,grid,detail,status);draw();return ui.d;
}
