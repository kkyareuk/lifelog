import {buildSharedWorld} from './shared-world.js?v=20260909dev305';
import {state,personalState,cloneState,replaceState,save} from './state.js?v=20260909dev305';
const scalar=new Set('id a b teacherId parentId childId sourceId targetId characterId homeId sharedHomeId sourceHomeId townId workplaceId placeId visitHomeId ownerCharacterId partnerId'.split(' '));
const arrays=new Set('memberIds groupMembers participantIds withIds displayOrder ownerCharacterIds ownerIds characterIds assignedCharacterIds allowedCharacterIds'.split(' '));
export function mapPackageIds(v,map,key=''){
 if(Array.isArray(v))return v.map(x=>typeof x==='string'&&arrays.has(key)?map[x]??x:mapPackageIds(x,map)).filter(x=>x!=='');
 if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([k])=>!['__proto__','constructor','prototype'].includes(k)).map(([k,x])=>[['characters','homes','relationships','characterViews','routines','monthlyRoutines','view-row'].includes(key)?map[k]||k:k,mapPackageIds(x,map,key==='characterViews'?'view-row':k)]));
 return typeof v==='string'&&scalar.has(key)?map[v]??v:v;
}
const participants=r=>r.groupMembers?.length?r.groupMembers:r.memberIds?.length?r.memberIds:[r.a,r.b].filter(Boolean);
export function makeWorldPackage(world,kind,selection){
 const town=world.towns.find(t=>t.id===selection)||world.world,home=world.homes[selection];if(kind==='town'&&!world.towns.some(t=>t.id===selection))throw Error('town-missing');
 const chars=Object.values(world.characters).filter(c=>kind==='home'?true:kind==='relationships'?true:c.townId===town.id),ids=new Set(chars.map(c=>c.id));
 const all=Object.entries(world.relationships||{}),relationships=kind==='home'?{}:Object.fromEntries(all.filter(([,r])=>participants(r).length&&participants(r).every(id=>ids.has(id))));
 const homes=kind==='relationships'?{}:kind==='home'?{[selection]:home}:Object.fromEntries(Object.entries(world.homes).filter(([,h])=>h.townId===town.id));
 if(kind==='home'&&!home)throw Error('home-missing');
 for(const [id,h] of Object.entries(homes)){const {lifeSimulation,...layout}=h;homes[id]=layout}
 const profiles=Object.fromEntries(chars.map(c=>{const {days,sharedScene,sharedContext,ownerUid,...profile}=c;return [c.id,kind==='town'?profile:{id:c.id,name:c.name}]}));
 return structuredClone({version:1,kind,name:kind==='home'?home.name:kind==='relationships'?'관계':town.name,town:kind==='town'?town:null,characters:profiles,homes,relationships,characterGroups:kind==='home'?[]:(world.characterGroups||[]).filter(g=>(g.memberIds||[]).length&&g.memberIds.every(id=>ids.has(id))),characterViews:kind==='home'?{}:Object.fromEntries([...ids].map(a=>[a,Object.fromEntries(Object.entries(world.characterViews?.[a]||{}).filter(([b])=>ids.has(b)))])),routines:kind==='town'?Object.fromEntries([...ids].map(id=>[id,world.routines?.[id]||[]])):{},monthlyRoutines:kind==='town'?Object.fromEntries([...ids].map(id=>[id,world.monthlyRoutines?.[id]||[]])):{},catalog:kind==='town'?world.catalog:{},excludedRelationships:kind==='town'?all.filter(([,r])=>participants(r).some(id=>ids.has(id))&&!participants(r).every(id=>ids.has(id))).length:0});
}
export function importWorldPackage(pack,{mapping={},characterLimit=5,townLimit=2}={}){
 if(state.sharedContext||state!==personalState())throw Error('personal-world-required');
 if(pack.version!==1||!['town','home','relationships'].includes(pack.kind))throw Error('invalid-package');
 const before=cloneState(),next=structuredClone(before),map={...mapping},newId=()=>crypto.randomUUID(),ids=Object.keys(pack.characters||{});
 if(pack.kind==='town'){
  if(ids.some(id=>pack.characters[id].homeId&&!pack.homes[pack.characters[id].homeId]))throw Error('unmapped-home');
  if(next.order.length+ids.length>characterLimit)throw Error('character-slot-required');
  if(next.towns.length>=townLimit)throw Error('town-slot-required');
  for(const id of ids)map[id]=newId();map[pack.town.id]=newId();
 }else{
  if(pack.kind==='relationships'&&(ids.some(id=>!next.characters[map[id]])||new Set(ids.map(id=>map[id])).size!==ids.length))throw Error('choose-distinct-characters');
  for(const id of ids)if(!next.characters[map[id]])map[id]='';
 }
 for(const id of [...Object.keys(pack.homes||{}),...Object.keys(pack.relationships||{}),...(pack.characterGroups||[]).map(g=>g.id),...(pack.town?.places||[]).map(x=>x.id),...(pack.town?.decorations||[]).map(x=>x.id)])map[id]||=newId();
 const copy=mapPackageIds(pack,map),townId=pack.kind==='town'?map[pack.town.id]:next.activeTownId;
 if(pack.kind==='town'){
  next.towns.push({...copy.town,id:townId});next.activeTownId=townId;next.world={...copy.town,id:townId};
  for(const [id,c] of Object.entries(copy.characters)){next.characters[id]={...c,id,townId,days:{},createdAt:Date.now(),timelineResetAt:Date.now()};next.order.push(id)}
  next.activeId=map[ids[0]]||next.activeId;Object.assign(next.routines,copy.routines);Object.assign(next.monthlyRoutines,copy.monthlyRoutines);
  const count=Object.values(next.catalog).reduce((n,rows)=>n+rows.length,0);let added=0;
  for(const [kind,rows] of Object.entries(copy.catalog||{})){next.catalog[kind]||=[];for(const item of rows){const old=next.catalog[kind].find(x=>x.id===item.id);if(old&&JSON.stringify(old)!==JSON.stringify(item))throw Error('catalog-id-conflict');if(!old){next.catalog[kind].push(item);added++}}}if(count+added>80)throw Error('catalog-limit');
 }
 for(const [sourceId,original] of Object.entries(pack.homes)){const id=map[sourceId],h=pack.kind==='home'?mapPackageIds(original,{...map,...Object.fromEntries(ids.map(cid=>[cid,mapping[cid]||'']))}):copy.homes[id];next.homes[id]={...h,id,townId};next.activeHomeId=id}
 // Keep existing relations untouched: previews map to characters, never overwrite a pair silently.
 if(pack.kind==='relationships')for(const r of Object.values(copy.relationships)){const key=participants(r).slice().sort().join('|');if(Object.values(next.relationships).some(old=>participants(old).slice().sort().join('|')===key))throw Error('relationship-already-exists')}
 Object.assign(next.relationships,copy.relationships);next.characterGroups.push(...copy.characterGroups);
 for(const [id,views] of Object.entries(copy.characterViews||{}))next.characterViews[id]={...next.characterViews[id],...views};
 try{replaceState(next);if(!save(true))throw Error('save-failed')}catch(e){replaceState(before);throw e}
 return copy;
}
const text=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
export async function worldTransferDialog({homeId='',townId='',kind='town',render,toast,limits}){
 const api=window.DrawerVillageGroups,snapshot=api?.getSnapshot?.()||{},source=structuredClone(homeId&& !personalState().homes[homeId]&&snapshot.activeGroupId?buildSharedWorld(snapshot,state.uiLanguage):personalState()),account=window.ParallelCityAuth?.getInfo?.().user?.uid;
 const same=()=>{if(account!==window.ParallelCityAuth?.getInfo?.().user?.uid)throw Error('account-changed')};
 const d=document.createElement('dialog');d.className='world-transfer-dialog';d.onclose=()=>d.remove();
 const node=(tag,value,parent=d)=>{const e=document.createElement(tag);if(value)e.textContent=value;parent.append(e);return e};
 const scope=homeId?'home':kind;
 node('h2',scope==='home'?text('집 · 방 · 인테리어 공유','Share home, rooms and interior','家・部屋・インテリアの共有'):scope==='relationships'?text('관계 공유 코드','Relationship sharing code','関係の共有コード'):text('마을 공유 · 멀티로 이전','Town sharing · Move to multiplayer','村の共有・マルチへ移転')); const close=node('button',text('닫기','Close','閉じる'));close.onclick=()=>d.close();
 const mode=node('select');for(const [id,label] of [['home',text('집 · 방 · 인테리어','Home, rooms and interior','家・部屋・インテリア')],['relationships',text('관계 전체','All relationships','関係全体')],['town',text('마을 전체','Entire town','村全体')]]){const option=node('option',label,mode);option.value=id}mode.value=scope;mode.hidden=true;
 const select=node('select'),fill=()=>{select.replaceChildren();for(const item of mode.value==='home'?Object.values(source.homes):source.towns){const option=node('option',item.name,select);option.value=item.id}select.hidden=mode.value==='relationships'};fill();if(homeId)select.value=homeId;if(townId)select.value=townId;mode.onchange=fill;
 const info=node('p',scope==='home'?text('집 정보, 방 정보와 인테리어 배치를 공유해요.','Share home and room settings with interior placement.','家と部屋の情報、インテリア配置を共有します。'):scope==='relationships'?text('불러올 관계의 캐릭터를 직접 연결해 주세요.','Match the characters when importing relationships.','関係を読み込む際に人物を指定してください。'):text('마을 전체를 새 사본으로 불러오거나 내 마을을 멀티로 옮겨요.','Import a copy of an entire town or move your personal town to multiplayer.','村全体をコピーとして読み込むか、自分の村をマルチへ移転します。'));
 const status=node('p');status.setAttribute('role','status');const panel=node('section');
 const task=async(button,run)=>{button.disabled=true;status.textContent=text('처리 중… 창을 닫아도 서버 처리는 계속됩니다.','Processing… Server operations continue if you close this window.','処理中…画面を閉じてもサーバーの処理は続きます。');try{same();await run();if(d.isConnected)status.textContent=text('완료했어요.','Done.','完了しました。')}catch(e){status.textContent=errorText(e.message);toast(status.textContent)}finally{button.disabled=false}};
 const publish=node('button',text('공유 코드 만들기','Create sharing code','共有コードを作成'));publish.onclick=()=>task(publish,async()=>{const pack=makeWorldPackage(source,mode.value,select.value),result=await api.publishWorldCode(pack);same();panel.replaceChildren();const code=node('input','',panel);code.readOnly=true;code.value=result.code.match(/.{1,6}/g).join('-');const copy=node('button',text('코드 복사','Copy code','コードをコピー'),panel);copy.onclick=()=>navigator.clipboard.writeText(code.value).catch(()=>code.select());const revoke=node('button',text('코드 사용 중지','Revoke code','コードを無効化'),panel);revoke.onclick=()=>task(revoke,async()=>{await api.revokeWorldCode(result.code);panel.replaceChildren()})});
 const code=node('input');code.placeholder=text('공유 코드 입력','Enter sharing code','共有コードを入力');code.maxLength=24;const read=node('button',text('공유 코드로 불러오기','Import by sharing code','共有コードで読み込む'));
 read.onclick=()=>task(read,async()=>{const result=await api.readWorldCode(code.value);same();const pack=result.package;if(pack.kind!==scope)throw Error('wrong-sharing-kind');panel.replaceChildren();node('h3',pack.name,panel);node('p',counts(pack),panel);const mapping={};
  if(pack.kind!=='town')for(const [id,c] of Object.entries(pack.characters)){const label=node('label',c.name,panel),target=node('select','',label);const empty=node('option',text('연결할 캐릭터 선택','Choose a character','接続する人物を選択'),target);empty.value='';for(const char of Object.values(personalState().characters)){const o=node('option',char.name,target);o.value=char.id}target.onchange=()=>mapping[id]=target.value}
  const apply=node('button',text('새 사본으로 가져오기','Import a new copy','新しいコピーとして読み込む'),panel);apply.onclick=()=>task(apply,async()=>{same();importWorldPackage(pack,{mapping,...limits()});api?.select('');render();d.close()});
 });
 const move=node('button',text('선택한 내 마을을 멀티로 옮기기','Move selected personal town to multiplayer','選んだ自分の村をマルチへ移転'));
 move.hidden=scope!=='town';
 move.onclick=()=>{if(mode.value!=='town'){status.textContent=text('마을 전체를 선택해 주세요.','Select Entire town.','村全体を選択してください。');return}panel.replaceChildren();const pack=makeWorldPackage(source,'town',select.value);node('h3',pack.name,panel);node('p',counts(pack),panel);node('p',text('내가 방장인 멀티의 빈 마을로 옮깁니다. 대상 마을의 정보·배치는 교체됩니다. 캐릭터·관계·집은 내 마을에서 떠납니다. 원래 마을의 빈 지도는 돌아올 자리로 남습니다. 다른 마을 인물과의 관계는 이전하지 않습니다.','Move into an empty town in a group you own. Its town settings/layout are replaced. Characters, relations and homes leave your personal town; the empty original map remains for returns. Relations to characters outside this town are not transferred.','自分がオーナーの空のマルチ村へ移転します。移転先の村情報・配置を置き換え、人物・関係・家は元の村から移動します。元の空の地図は帰還用に残ります。村外の人物との関係は移転しません。'),panel);
  const dest=node('select','',panel),snapshot=api.getSnapshot();for(const group of snapshot.groups||[]){if(group.ownerUid!==account)continue;for(const town of group.towns||[]){const o=node('option',group.name+' · '+town.name,dest);o.value=group.id+'|'+town.id}}
  const requestId=crypto.randomUUID(),confirm=node('button',text('확인하고 이전하기','Confirm transfer','確認して移転'),panel);confirm.disabled=!dest.options.length;confirm.onclick=()=>task(confirm,async()=>{const [groupId,townId]=dest.value.split('|');await api.migrateTown({groupId,townId,requestId,sourceTownId:select.value,expectedCharacterIds:Object.keys(pack.characters)});same();render();d.close()});
 };
 document.body.append(d);d.showModal();
}
function counts(p){return text(`캐릭터 ${Object.keys(p.characters).length}명 · 집 ${Object.keys(p.homes).length}개 · 관계 ${Object.keys(p.relationships).length}개${p.excludedRelationships?' · 마을 밖 관계 '+p.excludedRelationships+'개 제외':''}`,`${Object.keys(p.characters).length} characters · ${Object.keys(p.homes).length} homes · ${Object.keys(p.relationships).length} relationships · ${p.excludedRelationships||0} external relationships excluded`,`${Object.keys(p.characters).length}人・家${Object.keys(p.homes).length}軒・関係${Object.keys(p.relationships).length}件・村外の関係${p.excludedRelationships||0}件を除外`)}
function errorText(message){const errors={'wrong-sharing-kind':['이 화면에서 다루는 종류의 공유 코드를 입력해 주세요.','Enter a sharing code matching this screen.','この画面の種類に合う共有コードを入力してください。'],'destination-town-not-empty':['대상 멀티 마을이 비어 있어야 해요.','The destination town must be empty.','移転先は空の村を選んでください。'],'choose-distinct-characters':['서로 다른 캐릭터를 모두 연결해 주세요.','Match every person to a different character.','全員を異なる人物に接続してください。'],'relationship-already-exists':['이미 관계가 있는 인물 조합이에요. 기존 관계를 확인해 주세요.','A relationship already exists for this set of characters.','この人物の組み合わせには既に関係があります。'],'character-slot-required':['캐릭터 슬롯이 부족해요.','Not enough character slots.','キャラクター枠が足りません。'],'town-slot-required':['마을 슬롯이 부족해요.','Not enough town slots.','村の枠が足りません。'],'catalog-limit':['사전은 전체 80개까지예요.','The dictionary is limited to 80 items total.','辞典は合計80件までです。'],'catalog-id-conflict':['같은 ID의 사전 물품 내용이 달라요. 먼저 사전을 확인해 주세요.','A dictionary ID conflicts with an existing item.','同じIDの辞典項目の内容が異なります。'],'personal-world-required':['내 마을에서 불러와 주세요.','Import from your personal world.','自分の村で読み込んでください。']};return errors[message]?text(...errors[message]):text('처리하지 못했어요. 다시 확인해 주세요.','Could not complete the operation. Please check and retry.','処理できませんでした。確認して再試行してください。')+' ('+message+')'}
