// Arkenwald is a fictional blend of fifteenth-century France and England.
// Its setting controls ambience and everyday tools, never a food blacklist.
export const TOWN_BACKGROUNDS={
 drawer:{name:['서랍마을','Drawer Village','引き出し村'],description:['자유로운 상상으로 채우는 나만의 마을.','A village shaped by your imagination.','自由な想像でつくる、自分だけの村。']},
 arkenwald:{dlc:'medieval',priceKRW:7900,name:['아르켄발트','Arkenwald','アーケンヴァルト'],description:['성벽과 장터, 촛불이 어우러진 중세의 일상.','Medieval life among castle walls, markets and candlelight.','城壁と市場、ろうそくの灯りが彩る中世の暮らし。']}
};
export const townBackground=town=>town?.backgroundSetting==='arkenwald'?'arkenwald':'drawer';
export const backgroundCopy=(key,field,language='ko')=>TOWN_BACKGROUNDS[key][field][{ko:0,en:1,ja:2}[language]||0];
export const townMusic=town=>['drawer','arkenwald'].includes(town?.backgroundMusic)?town.backgroundMusic:townBackground(town);
export function backgroundMusicPlaylist(town,screen='observe'){
 if(townMusic(town)!=='arkenwald')return ['./assets/audio/main-theme.mp3'];
 if(screen==='home')return ['./assets/audio/arkenwald-home.mp3'];
 if(screen==='town')return ['./assets/audio/arkenwald-town.mp3'];
 return ['./assets/audio/arkenwald-tavern.mp3','./assets/audio/arkenwald-waltz.mp3'];
}
export const backgroundMusicSource=(town,screen='observe')=>backgroundMusicPlaylist(town,screen)[0];
export const hasMedievalDlc=()=>globalThis.window?.ParallelCityAuth?.getInfo?.()?.entitlements?.dlcPacks?.includes('medieval')===true;
export function townBackgroundFields(town,language='ko'){
 const selected=townBackground(town),title=({ko:'마을 배경',en:'Village setting',ja:'村の背景設定'})[language]||'마을 배경';
 return `<label><b>${title}</b><select data-world-background-setting>${Object.keys(TOWN_BACKGROUNDS).map(key=>`<option value="${key}" ${selected===key?'selected':''}>${backgroundCopy(key,'name',language)}${TOWN_BACKGROUNDS[key].dlc?' · DLC':''}</option>`).join('')}</select></label><label><b>${({ko:'마을 배경음',en:'Village music',ja:'村のBGM'})[language]||'마을 배경음'}</b><select data-world-background-music>${Object.keys(TOWN_BACKGROUNDS).map(key=>`<option value="${key}" ${townMusic(town)===key?'selected':''}>${backgroundCopy(key,'name',language)}${key==='arkenwald'?' · DLC':''}</option>`).join('')}</select></label>`;
}
export function bindTownBackgroundPicker(root,language='ko'){
 for(const select of root.querySelectorAll('[data-world-background-setting]')){
  if(select.dataset.backgroundPicker)continue;select.dataset.backgroundPicker='1';
  const trigger=document.createElement('button');trigger.type='button';trigger.className='speech-picker-trigger';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-label',({ko:'마을 배경 선택',en:'Choose village setting',ja:'村の背景を選択'})[language]);
  const update=()=>trigger.textContent=(select.selectedOptions[0]?.textContent||'')+' ▾';update();select.hidden=true;select.style.setProperty('display','none','important');select.after(trigger);
  trigger.onclick=()=>{const d=document.createElement('dialog');d.className='speech-picker-dialog';const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.textContent=({ko:'마을 배경',en:'Village setting',ja:'村の背景設定'})[language];close.textContent='×';close.type='button';close.onclick=()=>d.close();header.append(title,close);d.append(header);const list=document.createElement('div');list.className='speech-picker-options';
   for(const key of Object.keys(TOWN_BACKGROUNDS)){const button=document.createElement('button'),name=document.createElement('b'),desc=document.createElement('small');button.type='button';button.setAttribute('aria-pressed',String(select.value===key));name.textContent=backgroundCopy(key,'name',language)+(key==='arkenwald'?' · DLC':'');desc.textContent=backgroundCopy(key,'description',language);button.append(name,desc);button.onclick=()=>{select.value=key;update();d.close();select.dispatchEvent(new Event('change',{bubbles:true}))};list.append(button)}d.append(list);d.addEventListener('close',()=>d.remove(),{once:true});document.body.append(d);d.showModal();};
 }
}
