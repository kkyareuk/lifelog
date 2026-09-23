// Arkenwald is a fictional blend of fifteenth-century France and England.
// Its setting controls ambience and everyday tools, never a food blacklist.
export const TOWN_BACKGROUNDS={
 drawer:{name:['서랍마을','Drawer Village','引き出し村'],description:['시대와 문화가 자유롭게 어우러지는 마을이에요.','A village where eras and cultures freely mingle.','時代と文化が自由に混ざり合う村です。']},
 arkenwald:{dlc:'medieval',name:['아르켄발트 (Arkenwald)','Arkenwald','アーケンヴァルト (Arkenwald)'],description:['1400년대 프랑스와 잉글랜드의 생활을 바탕으로 한 가상 국가예요. 시대에 맞는 도구·생활과 선술집 배경음을 사용해요. 음식 선택은 제한하지 않아요.','A fictional realm inspired by fifteenth-century France and England, with period everyday tools and tavern ambience. Food choices remain unrestricted.','1400年代のフランスとイングランドの暮らしを基にした架空の国です。時代に合った道具・生活と酒場の環境音を使います。料理の選択は制限しません。']}
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
 return `<fieldset class="town-setting-fields"><legend>${title}</legend><label>${title}<select data-world-background-setting>${Object.keys(TOWN_BACKGROUNDS).map(key=>`<option value="${key}" ${selected===key?'selected':''}>${backgroundCopy(key,'name',language)}${TOWN_BACKGROUNDS[key].dlc?' · DLC':''}</option>`).join('')}</select></label>${Object.keys(TOWN_BACKGROUNDS).map(key=>`<small><b>${backgroundCopy(key,'name',language)}</b> — ${backgroundCopy(key,'description',language)}</small>`).join('')}<label>${({ko:'마을 배경음',en:'Village music',ja:'村のBGM'})[language]||'마을 배경음'}<select data-world-background-music>${Object.keys(TOWN_BACKGROUNDS).map(key=>`<option value="${key}" ${townMusic(town)===key?'selected':''}>${backgroundCopy(key,'name',language)}${key==='arkenwald'?' · DLC':''}</option>`).join('')}</select></label><small>${({ko:'배경 설정과 별개로 음악을 선택할 수 있어요. 아르켄발트 음악은 집·마을·기본 화면에 따라 달라져요.',en:'Choose music independently of the setting. Arkenwald has different music for homes, villages and other screens.',ja:'背景設定とは別に音楽を選べます。アーケンヴァルトでは家・村・その他の画面で曲が変わります。'})[language]}</small></fieldset>`;
}
