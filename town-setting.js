export const TOWN_ERAS={modern:['현대','Modern','現代'],medieval:['중세','Medieval','中世'],joseon:['조선 시대','Joseon period','朝鮮時代'],rococo:['로코코 시대','Rococo period','ロココ時代'],victorian:['빅토리안 시대','Victorian period','ヴィクトリア朝時代'],cyberpunk:['사이버펑크','Cyberpunk','サイバーパンク']};
export const TOWN_CULTURES={mixed:['자유·혼합','Mixed','自由・混合'],europe:['유럽','Europe','ヨーロッパ'],korea:['한국','Korea','韓国'],japan:['일본','Japan','日本'],china:['중국','China','中国'],usa:['미국','United States','アメリカ'],italy:['이탈리아','Italy','イタリア']};
export const settingLabel=(map,key,language='ko')=>(map[key]||Object.values(map)[0])[{ko:0,en:1,ja:2}[language]||0];
export function normalizeTownSetting(town={}){return {era:Object.hasOwn(TOWN_ERAS,town.era)?town.era:'modern',culture:Object.hasOwn(TOWN_CULTURES,town.culture)?town.culture:'mixed'}}
export const historicalTown=town=>!['modern','cyberpunk'].includes(normalizeTownSetting(town).era);
export function characterTown(world,character={},scene={}){const id=scene.townId||world.homes?.[scene.visitHomeId]?.townId||character.townId||world.homes?.[character.homeId]?.townId;return world.towns?.find(t=>t.id===id)||world.world||{}}
const electronic=/게임기|전기(?:기기|레인지|밥솥|포트|주전자|히터|제품|면도기)|자판기|자동차|버스|지하철|이메일|앱을|스마트폰|휴대폰|핸드폰|컴퓨터|노트북|태블릿|텔레비전|\bTV\b|전자레인지|전기밥솥|냉장고|에어컨|청소기|세탁기|드라이어|커피머신|에스프레소|캡슐\s*커피|온라인|인터넷|소셜\s*미디어|SNS|유튜브|스트리밍|비디오\s*게임|콘솔\s*게임|영상\s*통화|충전|키보드|마우스|smartphone|cellphone|computer|laptop|tablet|television|microwave|refrigerator|washing machine|hair dryer|coffee machine|espresso|capsule coffee|online|internet|social media|streaming|video game|charging|keyboard|スマホ|携帯|パソコン|タブレット|テレビ|電子レンジ|冷蔵庫|洗濯機|ドライヤー|コーヒーメーカー|オンライン|インターネット|動画|充電/i;
const electronicTasks=new Set(['sns','phone','phone_call','message','remote_checkin','tv','video','computer','online_game','social_media','coffee_capsule','coffee_espresso','coffee_americano','coffee_iced','coffee_whipped_milk','coffee_latte','coffee_cappuccino']);
export function townActivityAllowed(town,item={}){if(!historicalTown(town))return true;return !electronicTasks.has(item.lifeTask||item.lifeTaskId||item.id||item.kind)&&!electronic.test([item.item,item.title,item.desc,item.baseTitle,item.baseDesc,...(item.labels||[]),...(item.details||[])].filter(Boolean).join(' '))}
const alternatives={
 reading:[['책갈피를 옮기는 중','읽던 대목을 다시 살피고 기억하고 싶은 문장에 책갈피를 끼워 두었어요.'],['Moving a bookmark','They reread a passage and mark a sentence they want to remember.'],['しおりを移しています','読んでいた箇所を読み返し、覚えておきたい文章にしおりを挟みました。']],
 rest:[['창밖을 바라보는 중','창가에 앉아 길을 오가는 사람들과 구름의 움직임을 천천히 바라보고 있어요.'],['Watching through the window','They sit by the window, watching passersby and drifting clouds.'],['窓の外を眺めています','窓辺に座り、道を行き交う人や流れる雲をゆっくり眺めています。']],
 work:[['기록을 정리하는 중','종이에 남긴 기록을 차례로 펼쳐 누락된 항목을 확인하고 있어요.'],['Organizing records','They lay out paper records and check for missing entries.'],['記録を整理しています','紙の記録を順に広げ、抜けている項目を確認しています。']],
 social:[['소식을 나누는 중','함께 있는 사람과 오늘 있었던 일을 하나씩 이야기하고 있어요.'],['Sharing news','They take turns talking about their day with the people beside them.'],['近況を話しています','そばにいる人と今日あった出来事を順番に話しています。']]
};
export function adaptTownActivity(world,character,item){
 const town=characterTown(world,character,item);if(!item||townActivityAllowed(town,item))return item;
 const group=item.groupInteraction&&!item.remote&&!item.remoteContact,key=group?'social':item.kind==='work'||item.routineType==='업무'?'work':/read|book|책|読/.test([item.kind,item.lifeTaskId,item.title].join(' '))?'reading':'rest';
 const [title,desc]=alternatives[key][{ko:0,en:1,ja:2}[world.uiLanguage]||0],kind=key==='social'?'talk':key==='reading'?'read':key;
 return {...item,title,desc,baseTitle:title,baseDesc:desc,sharedCanonicalTitle:title,sharedCanonicalDesc:desc,sharedPerspectives:undefined,sharedActionText:undefined,baseScene:undefined,localizedCopy:true,kind,actionKind:kind,activityFamily:key,lifeTaskId:'',lifeTask:'',furniture:null,furnitureKey:'',remote:false,remoteContact:false,...(!group?{groupInteraction:false,withId:null,withIds:[],participantOrder:[]}:{}),eraAdapted:true};
}
export function townSettingFields(town,language='ko'){
 const value=normalizeTownSetting(town),l={ko:['시대','국가·문화권','시대에 맞는 생활 행동을 사용해요. 국가·문화권은 음식과 생활 소재의 기준이에요.'],en:['Era','Country and culture','Activities follow the era. Country and culture guide food and everyday themes.'],ja:['時代','国・文化圏','時代に合った行動を使います。国・文化圏は料理や暮らしの題材の基準になります。']}[language]||['시대','국가·문화권',''];
 return `<fieldset class="town-setting-fields"><legend>${l[0]} · ${l[1]}</legend><label>${l[0]}<select data-world-era>${Object.keys(TOWN_ERAS).map(key=>`<option value="${key}" ${value.era===key?'selected':''}>${settingLabel(TOWN_ERAS,key,language)}</option>`).join('')}</select></label><label>${l[1]}<select data-world-culture>${Object.keys(TOWN_CULTURES).map(key=>`<option value="${key}" ${value.culture===key?'selected':''}>${settingLabel(TOWN_CULTURES,key,language)}</option>`).join('')}</select></label><small>${l[2]}</small></fieldset>`;
}
