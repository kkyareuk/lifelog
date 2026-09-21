import {restoreWardrobe,withWardrobe} from './shared-wardrobe.js?v=20260909dev305';
import {state,active,endCharacterEditor,characterEditorActive,createCharacter,updateCharacter,save} from './state.js?v=20260909dev305';
const excluded=new Set(['id','ownerUid','homeId','townId','residences','sleepRoomId','workplaceId','days','createdAt','timelineResetAt','inventory','coffeeInventory','favorites','dislikes','wallet','money','balance','lastSaved','sharedScene','sharedContext','sourceCharacterId','revision']);
export async function importCodeCharacter(character,limit){
 const clean=(v,depth=0)=>{if(depth>20)throw Error('Invalid character');if(Array.isArray(v))return v.map(x=>clean(x,depth+1));if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).filter(([k])=>!['__proto__','constructor','prototype'].includes(k)).map(([k,x])=>[k,clean(x,depth+1)]));return v};
 if(!character||typeof character.name!=='string')throw Error('Invalid character');
if(characterEditorActive()){
 const world=state,id=world.activeId,uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid,api=window.DrawerVillageGroups,snapshot=api?.getSnapshot?.(),target=world.characters[id];
 if(!uid||!snapshot?.activeGroupId||!target||target.ownerUid!==uid||!snapshot.residents?.some(r=>r.id===id&&r.ownerUid===uid))throw Error('Character owner required');
 const groupId=snapshot.activeGroupId,catalog=structuredClone(world.catalog),profile=clean(Object.fromEntries(Object.entries(character).filter(([key])=>!excluded.has(key))));
 const restored=restoreWardrobe({...profile,inventory:{fashion:character.inventory?.fashion||[]}},id,catalog);
 const next={...target,...restored,id,inventory:{...target.inventory,fashion:restored.inventory.fashion}};
 await api.saveResident({groupId,id,profile:withWardrobe(next,catalog)});
 if(window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid)throw Error('Account changed');
 // Keep the captured editor draft consistent even if the user navigated away.
 world.characters[id]=next;world.catalog=catalog;
 return id;
}
 const owner=state,previousSelection={activeId:state.activeId,activeHomeId:state.activeHomeId},profile=clean(Object.fromEntries(Object.entries(character).filter(([key])=>!excluded.has(key))));
 if(owner.order.length>=limit)throw Error(({ko:`캐릭터 슬롯 ${owner.order.length}/${limit}개를 사용 중이에요. 빈 슬롯이 1개 필요해요.`,en:`Character slots: ${owner.order.length}/${limit}. One free slot is required.`,ja:`キャラクター枠は${owner.order.length}/${limit}です。空き枠が1つ必要です。`})[state.uiLanguage]||'빈 캐릭터 슬롯이 필요해요.');
 let id;
 try{
  id=createCharacter(limit);if(!id)throw Error('No character slots remaining');
  const restored=restoreWardrobe({...profile,inventory:{fashion:character.inventory?.fashion||[]}},id,state.catalog);
  const owned=new Set(restored.wardrobeItems.map(item=>item.id));restored.inventory.fashion=restored.inventory.fashion.filter(item=>owned.has(item));
  updateCharacter(id,{...restored,discovery:profile.discovery||{version:0,locks:{}}},false);
  if(!await save(true))throw Error(({ko:'불러온 캐릭터를 저장하지 못했어요. 기존 캐릭터는 유지됩니다. 다시 시도해 주세요.',en:'Could not save the imported character. Existing characters are kept. Please retry.',ja:'読み込んだ人物を保存できませんでした。既存の人物は保持されます。再試行してください。'})[owner.uiLanguage]);
  return id;
 }catch(error){
  // Remove only this unfinished import; never overwrite concurrent edits or another account.
  if(id&&state===owner){delete owner.characters[id];delete owner.homes[id];delete owner.routines[id];delete owner.monthlyRoutines[id];owner.order=owner.order.filter(value=>value!==id);owner.catalog.fashion=owner.catalog.fashion.filter(item=>item.ownerId!==id);if(owner.activeId===id)owner.activeId=previousSelection.activeId;if(owner.activeHomeId===id)owner.activeHomeId=previousSelection.activeHomeId;}
  throw error;
 }
}
export async function characterCodeDialog(mode,limit,render,toast){
 const importWorld=state,importId=state.activeId,importShared=characterEditorActive();
 const text=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko),api=window.DrawerVillageGroups?.readCharacterCode?window.DrawerVillageGroups:window.ParallelCityAuth,d=document.createElement('dialog');d.className='character-code-dialog';
 const h=document.createElement('h2');h.textContent=text('캐릭터 공유 코드','Character sharing code','キャラクター共有コード');const close=document.createElement('button');close.textContent=text('닫기','Close','閉じる');close.onclick=()=>d.close();d.append(h,close);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
 const info=document.createElement('p');info.textContent=importShared?text('선택한 멀티 캐릭터에 사진과 프로필을 적용해요. 집과 생활 기록은 유지돼요.','Apply photos and profile to the selected multiplayer character. Their home and life history are kept.','選択中のマルチのキャラクターに写真とプロフィールを適用します。家と生活記録は保持されます。'):text('코드를 아는 사람은 사진과 설정을 불러올 수 있어요. 불러온 캐릭터는 원본과 별개로 편집돼요. 받는 계정의 빈 캐릭터 슬롯 1개가 필요해요.','Anyone with the code can import photos and settings. Imported characters are edited independently and need one free slot on the receiving account.','コードを知っている人は写真と設定を読み込めます。読み込んだ人物は元の人物とは別に編集でき、受け取るアカウントに空き枠が1つ必要です。');d.append(info);
 const errorText=error=>{const code=String(error?.code||error?.message||'');if(/invalid-character-code/.test(code))return text('공유 코드는 영문 A~F와 숫자로 된 18자리예요. 복사한 코드를 확인해 주세요.','Sharing codes contain 18 letters A–F and digits. Please check the copied code.','共有コードはA〜Fと数字の18文字です。コピーしたコードをご確認ください。');if(/character-code-missing/.test(code))return text('코드를 찾을 수 없어요. 사용 중지된 코드인지 확인해 주세요.','This code was not found. Check whether it was revoked.','コードが見つかりません。無効化されていないかご確認ください。');if(/login-required/.test(code))return text('로그인한 뒤 공유코드를 다시 열어 주세요.','Sign in and reopen the sharing code.','ログインして共有コードを開き直してください。');return error?.message||text('불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.','Could not import. Check your connection and retry.','読み込めませんでした。接続を確認して再試行してください。')};
 const account=window.ParallelCityAuth?.getInfo?.().user?.uid;const sameAccount=()=>{if(account!==window.ParallelCityAuth?.getInfo?.().user?.uid)throw Error(text('계정이 바뀌었어요. 다시 열어 주세요.','Account changed. Please reopen.','アカウントが変わりました。開き直してください。'))};
 try{if(mode==='character-code-export'){
 const result=await api.publishCharacterCode(active().id);sameAccount();if(!d.isConnected)return;
 const code=document.createElement('input');code.readOnly=true;code.value=result.code.match(/.{1,6}/g).join('-');code.setAttribute('aria-label',text('캐릭터 코드','Character code','キャラクターコード'));const copy=document.createElement('button');copy.textContent=text('코드 복사','Copy code','コードをコピー');copy.onclick=async()=>{try{await navigator.clipboard.writeText(code.value)}catch{code.select()}};
 const revoke=document.createElement('button');revoke.textContent=text('이 코드 사용 중지','Revoke code','コードを無効化');revoke.onclick=async()=>{revoke.disabled=true;try{sameAccount();await api.revokeCharacterCode(result.code);d.close()}catch(e){toast(errorText(e));revoke.disabled=false}};d.append(code,copy,revoke);
 }else{
 const input=document.createElement('input');input.placeholder='ABCDEF-123456-ABCDEF';input.maxLength=24;input.autocapitalize='characters';const lookup=document.createElement('button');lookup.textContent=text('캐릭터 확인','Preview character','キャラクターを確認');const preview=document.createElement('section');d.append(input,lookup,preview);
 lookup.onclick=async()=>{lookup.disabled=true;preview.replaceChildren();try{sameAccount();const result=await api.readCharacterCode(input.value.normalize('NFKC').toUpperCase().replace(/[\s‐‑‒–—−-]/g,''));sameAccount();if(!d.isConnected)return;const c=result.character,name=document.createElement('h3');name.textContent=c.name;preview.append(name);const src=c.photo||c.icon||c.ldImage;if(/^https:\/\//.test(src||'')){const img=document.createElement('img');img.src=src;img.alt=c.name;preview.append(img)}const add=document.createElement('button');add.textContent=text('불러오기','Import','読み込む');preview.append(add);add.onclick=async()=>{add.disabled=true;try{sameAccount();if(state!==importWorld||characterEditorActive()!==importShared||(importShared&&state.activeId!==importId))throw Error(text('선택한 캐릭터가 바뀌었어요. 공유 코드를 다시 열어 주세요.','The selected character changed. Reopen the sharing code.','選択中のキャラクターが変わりました。共有コードを開き直してください。'));await importCodeCharacter(c,limit());sameAccount();document.querySelectorAll('dialog[open]').forEach(x=>x.close());render();toast(text('캐릭터와 사진을 불러왔어요.','Character and photos imported.','キャラクターと写真を読み込みました。'))}catch(e){toast(errorText(e));add.disabled=false}}}catch(e){toast(errorText(e))}finally{lookup.disabled=false}};
 }}catch(e){info.textContent=errorText(e)}
}
