import {characterCodeDialog} from "./character-code.js?v=20260909dev287";
import {state,active,endCharacterEditor,characterEditorActive,createCharacter,updateCharacter,save,cloneState,replaceState} from './state.js?v=20260909dev287';
import {informationOnlyState} from './local-media.js?v=20260909dev287';

const kinds=['food','ingredient','drink','fashion','music','idol','book','movie','game','perfume','hobby','electronics','weapon','animal','flower','misc'];
const excluded=new Set(['id','ownerUid','homeId','townId','residences','sleepRoomId','workplaceId','days','createdAt','timelineResetAt','inventory','favorites','dislikes','wallet','money','balance','lastSaved','sceneImages','photo','icon','image','sharedScene']);
function clean(value,depth=0){
  if(depth>20)throw Error('Invalid file');
  if(Array.isArray(value)){if(value.length>1000)throw Error('Invalid file');return value.map(v=>clean(v,depth+1))}
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!['__proto__','constructor','prototype'].includes(k)).map(([k,v])=>[k,clean(v,depth+1)]));
  if(typeof value==='string'&&value.length>100000)throw Error('Invalid file');
  return value;
}
export function characterSettingsFile(character){
  return {format:'drawer-village-character',version:1,mediaPolicy:'settings-only',character:clean(Object.fromEntries(Object.entries(informationOnlyState(character)).filter(([key])=>!excluded.has(key))))};
}
export function readSettingsFile(text){
  if(text.length>10*1024*1024)throw Error('파일이 너무 커요.');
  const file=clean(JSON.parse(text));
  if(file.version!==1||!['drawer-village-character','drawer-village-catalog'].includes(file.format))throw Error('서랍마을 설정 파일을 선택해 주세요.');
  if(file.format==='drawer-village-character'&&(!file.character||typeof file.character.name!=='string'))throw Error('서랍마을 설정 파일을 선택해 주세요.');
  if(file.format==='drawer-village-catalog'){
    if(!file.catalog||typeof file.catalog!=='object'||Array.isArray(file.catalog))throw Error('서랍마을 설정 파일을 선택해 주세요.');
    for(const [kind,items] of Object.entries(file.catalog))if(!kinds.includes(kind)||!Array.isArray(items)||items.length>80||items.some(x=>!x||typeof x.name!=='string'))throw Error('사전은 전체 80개까지 불러올 수 있어요.');
  }
  return file;
}
export function importCharacterSettings(file,limit){
if(characterEditorActive()){endCharacterEditor();window.DrawerVillageGroups?.select('');state.activeTab='character'}
  const settings=characterSettingsFile(file.character).character,before=cloneState();
  const id=createCharacter(limit);if(!id)throw Error('남은 캐릭터 슬롯이 없어요.');
  try{updateCharacter(id,settings,false);if(!save(true))throw Error('저장하지 못했어요.');return id}
  catch(error){replaceState(before);throw error}
}
export function mergeCatalogFile(file){
  const next=structuredClone(state.catalog),before=cloneState();
  for(const [kind,items] of Object.entries(file.catalog)){
    next[kind]??=[];
    for(const source of items){
      // Re-importing the same exported entry updates that entry, not a copy.
      const existing=next[kind].find(x=>source.id&&(x.id===source.id||x.importSourceId===source.id));
      const item={...source,id:existing?.id||crypto.randomUUID(),importSourceId:source.id||source.importSourceId,kind};
      if(existing)Object.assign(existing,item);else{if(Object.entries(next).reduce((n,[k,items])=>n+items.filter(i=>k!=='fashion'||!i.ownerId).length,0)>=80)throw Error('사전은 전체 80개까지 불러올 수 있어요.');next[kind].push(item)}
    }
  }
  state.catalog=next;if(!save(true)){replaceState(before);throw Error('저장하지 못했어요.')}
}
export async function downloadSettings(file,name){
  const data=JSON.stringify(file,null,2),filename=name.replace(/[\\/:*?"<>|]/g,'_')+'.json';
  const native=window.Capacitor?.Plugins?.ProfileExport;
  if(window.Capacitor?.isNativePlatform?.()&&native?.saveJson){await native.saveJson({filename,data});return}
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const catalogCopy={ko:['물품 선택','검색','전체 선택','선택 해제','취소','선택한 물품 저장','선택한 물품 추가','선택한 물품 다운로드'],en:['Choose items','Search','Select all','Clear selection','Cancel','Save selected items','Add selected items','Download selected items'],ja:['品物を選択','検索','すべて選択','選択解除','キャンセル','選んだ品物を保存','選んだ品物を追加','選んだ品物をダウンロード']};
export function selectedCatalog(catalog,keys){return Object.fromEntries(Object.entries(catalog).map(([kind,items])=>[kind,items.filter((item,index)=>keys.has(kind+':'+index))]).filter(([,items])=>items.length))}
export function chooseCatalog(catalog,importing=false,{single=false}={}){return new Promise(resolve=>{
 const copy=catalogCopy[state.uiLanguage]||catalogCopy.ko,d=document.createElement('dialog');d.className='directory-create-dialog catalog-selection-dialog';
 const title=document.createElement('h2');title.textContent=copy[0];const search=document.createElement('input');search.type='search';search.placeholder=copy[1];const list=document.createElement('div');list.className='catalog-selection-grid';
 const rows=[];for(const [kind,items] of Object.entries(catalog))items.forEach((item,index)=>{const label=document.createElement('label'),check=document.createElement('input'),span=document.createElement('span');check.type='checkbox';check.value=kind+':'+index;span.textContent=item.name;label.className='catalog-selection-card';const art=document.createElement('span');art.className='catalog-selection-art';if(item.image){const img=document.createElement('img');img.src=item.image;img.alt='';img.loading='lazy';art.append(img)}else art.textContent=item.emoji||'◇';label.append(check,art,span);list.append(label);rows.push({label,check,name:String(item.name).toLocaleLowerCase()})});
 const controls=document.createElement('div');controls.className='catalog-selection-controls';const addButton=(text,run)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=run;controls.append(b);return b};
 addButton(copy[2],()=>{rows.filter(r=>!r.label.hidden).slice(0,single?1:rows.length).forEach(r=>r.check.checked=true);update()});addButton(copy[3],()=>{rows.forEach(r=>r.check.checked=false);update()});addButton(copy[4],()=>d.close());
 const submit=addButton(copy[importing?6:5],()=>{const result=selectedCatalog(catalog,new Set(rows.filter(r=>r.check.checked).map(r=>r.check.value)));resolve(result);d.close()});
 const update=()=>{const n=rows.filter(r=>r.check.checked).length;submit.disabled=!n;submit.textContent=copy[importing?6:5]+' ('+n+')'};
 list.onchange=event=>{if(single&&event.target.checked)rows.forEach(r=>{if(r.check!==event.target)r.check.checked=false});update()};search.oninput=()=>rows.forEach(r=>r.label.hidden=!r.name.includes(search.value.toLocaleLowerCase()));d.append(title,search,list,controls);d.onclose=()=>{d.remove();resolve(null)};document.body.append(d);update();d.showModal();
})}
export function installSettingsTransfer({translate,toast,render,limit}){
  const t=translate;
  document.addEventListener('click',async event=>{
    const button=event.target.closest('[data-settings-transfer]');if(!button)return;
    const mode=button.dataset.settingsTransfer;
    try{
      if(mode==='character-code-export'||mode==='character-code-import'){await characterCodeDialog(mode,limit,render,toast);return}
      if(mode==='character-export'){if(active())await downloadSettings(characterSettingsFile(active()),active().name+'-설정');return}
      if(mode==='all-export'){await downloadSettings({format:'drawer-village-backup',version:2,mediaPolicy:'device-only',exportedAt:new Date().toISOString(),gameState:informationOnlyState(cloneState())},'서랍마을-전체백업');return}
      if(mode==='catalog-export'){const catalog=await chooseCatalog(state.catalog);if(catalog)await downloadSettings({format:'drawer-village-catalog',version:1,catalog:informationOnlyState(catalog)},'서랍마을-선택물품');return}
      const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;document.body.append(input);
      input.oncancel=()=>input.remove();
      input.onchange=async()=>{
        try{
          const selected=input.files?.[0];if(!selected)return;if(selected.size>10*1024*1024)throw Error('파일이 너무 커요.');
          const file=readSettingsFile(await selected.text());
          if(mode==='character-import'&&file.format!=='drawer-village-character'||mode==='catalog-import'&&file.format!=='drawer-village-catalog')throw Error('서랍마을 설정 파일을 선택해 주세요.');
          if(file.format==='drawer-village-catalog'){const catalog=await chooseCatalog(file.catalog,true);if(!catalog)return;file.catalog=catalog}
          if(file.format==='drawer-village-character'&&!confirm(t(file.format==='drawer-village-character'?'설정을 새 캐릭터로 불러올까요? 사진·생활 로그·관계는 포함하지 않아요.':'사전을 가져올까요? 같은 항목은 갱신하고 새 항목은 추가해요. 자동으로 동기화하지 않아요.')))return;
          if(file.format==='drawer-village-character')importCharacterSettings(file,limit());else mergeCatalogFile(file);
          document.querySelectorAll('dialog[open]').forEach(d=>d.close());render();toast('기기에 저장됨');
        }catch(error){toast(t(error.message))}finally{input.remove()}
      };input.click();
    }catch(error){toast(t(error.message))}
  });
}
