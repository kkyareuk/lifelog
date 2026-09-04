const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const ROOM_PERMISSION_COPY={
 ko:{owners:"방 주인",all:"구성원 전체",selected:"직접 지정",none:"선택 안 함",access:"출입 허용",everyone:"모두",ownersOnly:"방 주인만",residents:"집 구성원",outsiders:"외부인",delivery:"배달원",repair:"수리기사",pets:"반려생물",cats:"고양이",characters:"캐릭터 지정",petList:"반려생물 지정",custom:"그 밖의 대상",customHint:"대상을 한 줄에 하나씩 입력",empty:"이 집에 구성원이 없어요."},
 en:{owners:"Room owners",all:"All household members",selected:"Choose individually",none:"None selected",access:"Room access",everyone:"Everyone",ownersOnly:"Owners only",residents:"Household members",outsiders:"Visitors",delivery:"Delivery workers",repair:"Repair technicians",pets:"Pets",cats:"Cats",characters:"Choose characters",petList:"Choose pets",custom:"Other allowed visitors",customHint:"Enter one per line",empty:"This home has no members."},
 ja:{owners:"部屋の持ち主",all:"家のメンバー全員",selected:"個別に指定",none:"未選択",access:"入室できる対象",everyone:"誰でも",ownersOnly:"持ち主のみ",residents:"家のメンバー",outsiders:"外部の人",delivery:"配達員",repair:"修理業者",pets:"ペット",cats:"猫",characters:"キャラクターを指定",petList:"ペットを指定",custom:"その他の対象",customHint:"1行に1つずつ入力",empty:"この家にはメンバーがいません。"}
};
export const roomResidents=(state,homeId)=>(state.order||[]).map(id=>state.characters[id]).filter(c=>c?.residences?.some(r=>r.homeId===homeId));
export function roomPermissionMarkup(home,room,state){
 const c=ROOM_PERMISSION_COPY[state.uiLanguage]||ROOM_PERMISSION_COPY.ko;
 const check=(key,value,label,on)=>`<label class="check"><input type="checkbox" name="${key}" value="${esc(value)}" ${on?"checked":""}>${esc(label)}</label>`;
 const residents=roomResidents(state,home.id);
 const ownerMode=room.ownerMode==="all"?"all":"selected",mode=room.accessMode||((room.accessCharacterIds||[]).length?"selected":"everyone");
 return `<fieldset class="room-permissions wide"><legend>${c.owners}</legend><label class="check"><input type="checkbox" name="ownerAll" ${ownerMode==="all"?"checked":""}>${c.all}</label><div data-room-owner-list>${residents.map(p=>check("ownerCharacterIds",p.id,p.name,(room.ownerCharacterIds||[]).includes(p.id))).join("")||`<p>${c.empty}</p>`}</div></fieldset>
 <fieldset class="room-permissions wide"><legend>${c.access}</legend><select name="accessMode" aria-label="${c.access}">${[["everyone",c.everyone],["owners",c.ownersOnly],["selected",c.selected]].map(([v,l])=>`<option value="${v}" ${mode===v?"selected":""}>${l}</option>`).join("")}</select><div data-room-access-options>
 <div class="room-permission-options">${["residents","outsiders","delivery","repair","pets","cats"].map(group=>check("accessGroups",group,c[group],room.accessGroups?.includes(group))).join("")}</div>
 <details><summary>${c.characters}</summary>${(state.order||[]).map(id=>state.characters[id]).filter(Boolean).map(p=>check("accessCharacterIds",p.id,p.name,room.accessCharacterIds?.includes(p.id))).join("")}</details>
 <details><summary>${c.petList}</summary>${(home.pets||[]).map(p=>check("accessPetIds",p.id,p.name,room.accessPetIds?.includes(p.id))).join("")}</details>
 <label>${c.custom}<textarea name="accessCustom" maxlength="1000" placeholder="${c.customHint}">${esc((room.accessCustom||[]).join("\n"))}</textarea></label>
 </div></fieldset>`;
}
export function bindRoomPermissionEditor(root){
 const refresh=()=>{
  const all=root.querySelector('[name="ownerAll"]').checked;
  root.querySelectorAll('[name="ownerCharacterIds"]').forEach(input=>{input.disabled=all});
  root.querySelector("[data-room-access-options]").hidden=root.querySelector('[name="accessMode"]').value!=="selected";
 };
 root.querySelector('[name="ownerAll"]').addEventListener("change",refresh);
 root.querySelector('[name="accessMode"]').addEventListener("change",refresh);refresh();
}
export function readRoomPermissionEditor(root){
 const values=name=>[...root.querySelectorAll(`[name="${name}"]:checked`)].map(input=>input.value);
 return {ownerMode:root.querySelector('[name="ownerAll"]').checked?"all":"selected",ownerCharacterIds:values("ownerCharacterIds"),accessMode:root.querySelector('[name="accessMode"]').value,accessGroups:values("accessGroups"),accessCharacterIds:values("accessCharacterIds"),accessPetIds:values("accessPetIds"),accessCustom:[...new Set(root.querySelector('[name="accessCustom"]').value.split(/\r?\n/).map(v=>v.trim()).filter(Boolean))].slice(0,40)};
}
