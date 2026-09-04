import {state,addCatalogItem,updateCatalogItem,deleteCatalogItem,save} from './state.js?v=20260904home209';

const esc=(x='')=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const itemEffects={none:'없음',glow:'은은한 빛',sparkle:'반짝임',float:'둥실둥실',sway:'살랑살랑'};
export const normalizeRating=value=>Math.round(Math.max(0,Math.min(5,Number(value)||0))*2)/2;
export function itemArt(item,icon='📦'){
  const effect=Object.hasOwn(itemEffects,item.animation)?item.animation:'none';
  const source=item.imageSource==='app'?'app':'photo';
  return `<span class="dictionary-art" data-image-kind="${source}" data-item-effect="${effect}">${item.image?`<img src="${esc(item.image)}" alt="" loading="lazy" decoding="async" draggable="false">`:`<span>${icon}</span>`}<i aria-hidden="true">✦</i></span>`;
}
export function ratingStars(value){
  const rating=normalizeRating(value);
  return `<span class="dictionary-stars" role="img" aria-label="${rating} / 5">${Array.from({length:5},(_,i)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#d2d2d2"/><path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#efb34f" stroke="#7b5324" stroke-width=".8" style="clip-path:inset(0 ${100-Math.max(0,Math.min(1,rating-i))*100}% 0 0)"/></svg>`).join('')}</span>`;
}
const ui={kind:'',place:'',search:'',sort:'default',limit:30,editing:null,draft:null,scroll:0};
let cfg,actions,owner;
const tr=s=>cfg?.translate?.(s,s)||s;
function entries(){return Object.entries(state.catalog||{}).flatMap(([kind,items])=>items.map(item=>({...item,kind})))}
export function filterDictionary(items,{kind='',search='',sort='default',allowed=null}={}){
  const query=search.trim().toLocaleLowerCase();
  const result=items.filter(item=>(!kind||item.kind===kind)&&(!allowed||allowed.has(item.id))&&(!query||[item.name,item.category,item.subtype,...(item.tags||[])].join(' ').toLocaleLowerCase().includes(query)));
  if(sort==='name')result.sort((a,b)=>a.name.localeCompare(b.name));
  if(sort==='rating')result.sort((a,b)=>normalizeRating(b.rating)-normalizeRating(a.rating));
  if(sort==='new')result.reverse();
  return result;
}
function matches(){
  let allowed=null;
  if(ui.place==='집')allowed=new Set(Object.values(state.characters||{}).flatMap(c=>Object.values(c.inventory||{}).flat()));
  else if(ui.place)allowed=new Set((state.world.places||[]).filter(p=>p.type===ui.place).flatMap(p=>p.stock||[]));
  return filterDictionary(entries(),{...ui,allowed});
}
function tile(item){return `<button type="button" class="dictionary-tile" data-dict-open="${esc(item.id)}" data-kind="${item.kind}">${itemArt(item,cfg.icons[item.kind])}<b>${esc(item.name)}</b>${ratingStars(item.rating)}</button>`}
function results(){
  const items=matches();
  return `${items.slice(0,ui.limit).map(tile).join('')}<button type="button" class="dictionary-tile dictionary-add" data-dict-add><span>＋</span><b>${tr('물품 추가하기')}</b></button>${items.length>ui.limit?`<button type="button" class="dictionary-more" data-dict-more>${tr('더 보기')} (${ui.limit} / ${items.length})</button>`:''}${!items.length?`<p class="dictionary-no-results">${tr('해당하는 물품이 없어요.')}</p>`:''}`;
}
function options(values,value){
  // Keep existing/custom values until the user explicitly picks a replacement.
  if(value!==''&&value!=null&&!values.some(v=>String(Array.isArray(v)?v[0]:v)===String(value)))values=[value,...values];
  return values.map(v=>{const [key,label]=Array.isArray(v)?v:[v,v];return `<option value="${esc(key)}" ${String(key)===String(value)?'selected':''}>${esc(tr(label))}</option>`}).join('');
}
function list(){
  const places=[...new Set(['집','사무실','음식점','카페','병원',...(state.world.places||[]).map(p=>p.type).filter(Boolean)])];
  const filter=(key,label,type)=>`<button type="button" data-dict-${type}="${esc(key)}" aria-current="${ui[type]===key?'true':'false'}">${esc(tr(label))}</button>`;
  return `<div class="dictionary-toolbar"><button class="dictionary-back" type="button" data-dict-home aria-label="${tr('메인 화면으로 돌아가기')}" ><img src="./assets/dictionary/back.webp" alt=""></button><input type="search" data-dict-search value="${esc(ui.search)}" placeholder="${tr('검색')}" aria-label="${tr('사전 검색')}"><nav class="dictionary-kinds" aria-label="${tr('카테고리')}">${filter('','전체','kind')}${Object.entries(cfg.labels).map(([k,v])=>filter(k,v,'kind')).join('')}</nav><nav class="dictionary-places" aria-label="${tr('이용 장소')}">${filter('','전체','place')}${places.map(p=>filter(p,p,'place')).join('')}</nav></div><section class="dictionary-frame"><div class="dictionary-paper"><div class="dictionary-count"><span data-dict-count>${tr('총')} ${matches().length} / ${entries().length}</span><select data-dict-sort aria-label="${tr('정렬')}">${options([['default','기본순'],['name','이름순'],['rating','별점순'],['new','최근 추가순']],ui.sort)}</select></div><div class="dictionary-results" data-dict-results>${results()}</div></div></section>`;
}
function editor(){
  const d=ui.draft,kind=ui.editing.kind;
  const select=(field,label,values)=>`<label>${tr(label)}<select data-dict-field="${field}">${options(values,d[field]??'')}</select></label>`;
  const field=(key,label)=>`<label>${tr(label)}<input data-dict-field="${key}" value="${esc(d[key]||'')}" maxlength="160"></label>`;
  const cats=cfg.categories[kind]||[];
  const categories=d.category&&!cats.includes(d.category)?[d.category,...cats]:cats;
  const details=cfg.subtypes(kind,d.category),level=[['0','없음'],['1','아주 약함'],['2','약함'],['3','보통'],['4','강함'],['5','아주 강함']];
  const tags=(d.tags||[]).map((tag,index)=>`<button type="button" data-dict-remove-tag="${index}" aria-label="${esc(tag)} ${tr('태그 삭제')}">#${esc(tag)} ×</button>`).join('');
  return `<div class="dictionary-book" aria-label="${tr('물품 설정')}"><img class="dictionary-book-layer" src="./assets/dictionary/book.webp" alt=""><button type="button" class="dictionary-back" data-dict-close aria-label="${tr('사전 목록으로 돌아가기')}"><img src="./assets/dictionary/back.webp" alt=""></button><div class="dictionary-book-actions"><button type="button" data-dict-delete>${tr('삭제')}</button><button type="button" data-dict-copy>${tr('복제')}</button></div><form class="dictionary-editor-fields"><div class="dictionary-name">${field('name','이름')}</div><div class="dictionary-identity"><button type="button" class="dictionary-photo" data-dict-photo aria-label="${tr('사진 선택')}">${itemArt(d,cfg.icons[kind])}<small>${tr('사진 선택')}</small></button><div>${select('category','카테고리',categories)}${details.length?select('subtype','세부 유형',['',...details]):''}<label class="dictionary-rating">${ratingStars(d.rating)}<span><input type="range" min="0" max="5" step="0.5" value="${normalizeRating(d.rating)}" data-dict-field="rating" aria-label="${tr('별점')}"><output>${normalizeRating(d.rating)}</output></span></label></div></div>${select('price','가격',['정하지 않음','매우 저렴','저렴','보통','비쌈','매우 비쌈'])}${select('appeal','대중적인 호감도',['정하지 않음','호불호가 매우 갈림','호불호가 갈림','무난함','대체로 좋아함','폭넓게 사랑받음'])}<div class="dictionary-specific">${['food','ingredient','drink'].includes(kind)?select('spicy','맵기',level)+select('sweet','달기',level):''}${kind==='perfume'?`<fieldset><legend>${tr('향 계열')}</legend>${cfg.subtypes(kind,d.category).map(v=>`<label><input type="checkbox" data-dict-keyword="${esc(v)}" ${(d.keywords||[]).includes(v)?'checked':''}>${tr(v)}</label>`).join('')}</fieldset>`:''}${['music','idol','movie','book','game'].includes(kind)?field('creator','아티스트·제작자'):''}</div>${select('animation','애니메이션 유형',Object.entries(itemEffects))}<label>${tr('메모')}<textarea data-dict-field="memo" maxlength="3000">${esc(d.memo||'')}</textarea></label><label>${tr('태그')}<span class="dictionary-tags">${tags}<button type="button" data-dict-tag-add aria-label="${tr('태그 추가')}">＋</button></span></label></form><button type="button" class="dictionary-save" data-dict-save><img src="./assets/dictionary/ink.webp" alt=""><span>${tr('저장')}</span></button></div>`;
}
export function renderDictionary(config){
  cfg=config;
  if(owner!==state.characters){owner=state.characters;ui.editing=null;ui.draft=null;ui.kind='';ui.place='';ui.search='';ui.limit=30}
  if(ui.editing&&!state.catalog[ui.editing.kind]?.some(i=>i.id===ui.editing.id)){ui.editing=null;ui.draft=null}
  return `<section class="dictionary-shell" data-dictionary>${ui.editing?editor():list()}</section>`;
}
function redraw(){const shell=document.querySelector('[data-dictionary]');if(!shell)return;shell.innerHTML=ui.editing?editor():list();bindFields(shell);actions?.translate?.(shell)}
function collect(){document.querySelectorAll('[data-dict-field]').forEach(el=>{ui.draft[el.dataset.dictField]=el.dataset.dictField==='rating'?normalizeRating(el.value):['spicy','sweet'].includes(el.dataset.dictField)?Number(el.value):el.value})}
function commit(){collect();updateCatalogItem(ui.editing.kind,ui.editing.id,ui.draft);return save(true)}
function open(kind,id){const item=state.catalog[kind]?.find(i=>i.id===id);if(!item)return;ui.scroll=document.querySelector('.dictionary-results')?.scrollTop||0;ui.editing={kind,id};ui.draft=structuredClone(item);redraw()}
export function refreshDictionaryImage(kind,id){if(ui.editing?.kind!==kind||ui.editing?.id!==id)return;const item=state.catalog[kind]?.find(i=>i.id===id);if(!item)return;collect();ui.draft.image=item.image;ui.draft.imageSource=item.imageSource;redraw()}
function popup(title,body){const d=document.createElement('dialog');d.className='dictionary-picker';d.innerHTML=`<form method="dialog"><header><h2>${tr(title)}</h2><button aria-label="${tr('닫기')}">×</button></header>${body}</form>`;d.onclose=()=>d.remove();document.body.append(d);actions?.translate?.(d);d.showModal();return d}
function bindFields(shell){
  const input=shell.querySelector('[data-dict-search]');if(input)input.oninput=()=>{ui.search=input.value;ui.limit=30;refreshResults()};
  shell.querySelector('[data-dict-sort]')?.addEventListener('change',e=>{ui.sort=e.target.value;refreshResults()});
  shell.querySelectorAll('[data-dict-field]').forEach(el=>el.addEventListener('input',()=>{
    collect();
    if(el.dataset.dictField==='rating'){el.closest('label').querySelector('.dictionary-stars').outerHTML=ratingStars(el.value);el.nextElementSibling.value=normalizeRating(el.value)}
    if(el.dataset.dictField==='animation')shell.querySelector('.dictionary-photo .dictionary-art').dataset.itemEffect=ui.draft.animation;
  }));
  shell.querySelector('[data-dict-field="category"]')?.addEventListener('change',()=>{ui.draft.subtype='';redraw()});
  shell.querySelectorAll('[data-dict-keyword]').forEach(el=>el.onchange=()=>{ui.draft.keywords=[...shell.querySelectorAll('[data-dict-keyword]:checked')].map(e=>e.dataset.dictKeyword)});
  shell.querySelector('form.dictionary-editor-fields')?.addEventListener('submit',e=>e.preventDefault());
}
function refreshResults(){const r=document.querySelector('[data-dict-results]');if(!r)return;r.innerHTML=results();document.querySelector('[data-dict-count]').textContent=`${tr('총')} ${matches().length} / ${entries().length}`;actions?.translate?.(r)}
export function mountDictionary(callbacks){
  actions=callbacks;const shell=document.querySelector('[data-dictionary]');if(!shell)return;bindFields(shell);
  shell.addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-dict-home')){actions.home();return}
    if(b.hasAttribute('data-dict-kind')||b.hasAttribute('data-dict-place')){const key=b.hasAttribute('data-dict-kind')?'kind':'place';ui[key]=b.dataset[key==='kind'?'dictKind':'dictPlace'];ui.limit=30;b.parentElement.querySelectorAll('button').forEach(e=>e.setAttribute('aria-current',String(e===b)));refreshResults()}
    if(b.dataset.dictOpen)open(b.dataset.kind,b.dataset.dictOpen);
    if(b.hasAttribute('data-dict-more')){ui.limit+=30;refreshResults()}
    if(b.hasAttribute('data-dict-add')){
      const add=kind=>open(kind,addCatalogItem(kind,{name:tr('새 항목'),category:cfg.categories[kind]?.[0]||'기타'}));
      if(ui.kind)add(ui.kind);else{const d=popup('카테고리 선택',`<div class="dictionary-category-choices">${Object.entries(cfg.labels).map(([k,v])=>`<button type="button" data-kind="${k}">${cfg.icons[k]} ${tr(v)}</button>`).join('')}</div>`);d.querySelectorAll('[data-kind]').forEach(e=>e.onclick=()=>{d.close();add(e.dataset.kind)})}
    }
    if(b.hasAttribute('data-dict-close')||b.hasAttribute('data-dict-save')){if(!commit()){actions.toast('저장 공간을 확인해 주세요');return}ui.editing=null;ui.draft=null;redraw();document.querySelector('.dictionary-results').scrollTop=ui.scroll;actions.toast('기기에 저장됨')}
    if(b.hasAttribute('data-dict-delete')&&confirm(tr('이 항목을 삭제할까요?'))){deleteCatalogItem(ui.editing.kind,ui.editing.id);ui.editing=null;ui.draft=null;redraw()}
    if(b.hasAttribute('data-dict-copy')){collect();const {id,...copy}=ui.draft;open(ui.editing.kind,addCatalogItem(ui.editing.kind,{...copy,name:`${copy.name} (${tr('복제')})`}))}
    if(b.hasAttribute('data-dict-tag-add')){collect();const d=popup('태그 추가',`<input maxlength="40" aria-label="${tr('태그')}" autofocus><button type="button" data-add>${tr('추가')}</button>`);d.querySelector('[data-add]').onclick=()=>{const tag=d.querySelector('input').value.trim().replace(/^#+/,'');if(tag)ui.draft.tags=[...new Set([...(ui.draft.tags||[]),tag])];d.close();redraw()}}
    if(b.hasAttribute('data-dict-remove-tag')){collect();ui.draft.tags.splice(Number(b.dataset.dictRemoveTag),1);redraw()}
    if(b.hasAttribute('data-dict-photo')){
      collect();const d=popup('사진 선택',`<div class="dictionary-image-choices"><button type="button" data-source="app">${tr('인게임 일러스트')}</button><button type="button" data-source="link">${tr('이미지 링크')}</button><button type="button" data-source="device">${tr('기기에서 업로드')}</button></div>`);
      d.querySelectorAll('[data-source]').forEach(e=>e.onclick=()=>{
        d.close();const {kind,id}=ui.editing;
        if(e.dataset.source==='link'){const url=popup('이미지 링크',`<input type="url" placeholder="https://…" aria-label="${tr('이미지 링크')}"><p role="status"></p><button type="button" data-apply>${tr('적용')}</button>`);url.querySelector('[data-apply]').onclick=()=>{const value=url.querySelector('input').value.trim();if(!/^https?:\/\//i.test(value)){url.querySelector('[role=status]').textContent=tr('http 또는 https 이미지 링크를 넣어 주세요.');return}ui.draft.image=value;ui.draft.imageSource='user';url.close();redraw()}}
        else{
          updateCatalogItem(kind,id,ui.draft);
          e.dataset.source==='app'?actions.illustration(id,kind):actions.upload('catalogImage',id,kind);
        }
      });
    }
  });
}
