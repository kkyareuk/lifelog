import {contextActions,contextGroups,recommendedContextActions} from './context-actions.js?v=20260909dev305';
const words={ko:{actor:'행동할 캐릭터',close:'닫기',more:'다른 행동',busy:'이동·행동을 준비하고 있어요…',failed:'지금은 실행할 수 없어요. 행동 조건이나 사용 중인 자리를 확인해 주세요.',empty:'이 마을에서 조작할 내 캐릭터가 없어요.'},en:{actor:'Acting character',close:'Close',more:'Other activities',busy:'Preparing the activity…',failed:'Unavailable now. Check activity requirements and occupied furniture.',empty:'You have no controllable character here.'},ja:{actor:'行動するキャラクター',close:'閉じる',more:'ほかの行動',busy:'行動を準備しています…',failed:'今は実行できません。行動の条件や使用中の家具を確認してください。',empty:'この村に操作できるキャラクターがいません。'}};
export function installContextMenu({world,execute,enabled,openHome}){
 let menu=null,start=null;const close=()=>{menu?.close();menu?.remove();menu=null};
 document.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY}},true);
 document.addEventListener('click',e=>{
  if(!enabled()||e.target.closest('dialog,aside,header,nav,[data-context-menu]'))return;
  if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>12)return;
  const el=e.target.closest('[data-furniture-placement],[data-home-occupant="character"],[data-home-person],[data-person],.room[data-room-key],[data-place],[data-home-map]');if(!el)return;
  if(e.target.closest('button')&&e.target.closest('button')!==el)return;
  const info=world(),w=info.state,lang=w.uiLanguage||'ko',copy=words[lang]||words.ko;
  let target,title;
  if(el.dataset.furniturePlacement){const homeId=el.dataset.homeId,room=el.dataset.roomKey,item=w.homes[homeId]?.rooms?.[room]?.furniturePlacements?.find(p=>p.id===el.dataset.furniturePlacement);if(!item)return;target={type:'furniture',homeId,room,id:item.id,item:item.item};title=item.item;}
  else if(el.dataset.homeOccupant||el.dataset.homePerson||el.dataset.person){const id=el.dataset.characterId||el.dataset.homePerson||el.dataset.person;if(!w.characters[id])return;target={type:'person',id};title=w.characters[id].name;}
  else if(el.dataset.place){target={type:'place',id:el.dataset.place};title=w.world.places.find(p=>p.id===target.id)?.name;}
  else {const homeId=el.dataset.homeId||el.dataset.homeMap,home=w.homes[homeId],room=el.dataset.roomKey||Object.keys(home?.rooms||{})[0];if(!home?.rooms?.[room])return;target={type:'room',homeId,room};title=home.rooms[room].name;}
  e.preventDefault();e.stopImmediatePropagation();close();
  const buildingHome=el.dataset.homeMap;
  const d=document.createElement('dialog');menu=d;d.className='context-action-menu';d.dataset.contextMenu='';const h=document.createElement('h2');h.textContent=title||'';const x=document.createElement('button');x.textContent='×';x.setAttribute('aria-label',copy.close);x.onclick=close;d.append(x,h);
  const actors=w.order.map(id=>w.characters[id]).filter(c=>c&&(!info.uid||c.ownerUid===info.uid)&&(!w.activeTownId||c.townId===w.activeTownId));
  const select=document.createElement('select');select.setAttribute('aria-label',copy.actor);for(const c of actors){const o=document.createElement('option');o.value=c.id;o.textContent=c.name;select.append(o)}select.value=actors.some(c=>c.id===w.activeId)?w.activeId:actors[0]?.id||'';d.append(select);
  const status=document.createElement('p');status.setAttribute('role','status');if(!actors.length)status.textContent=copy.empty;
  const list=document.createElement('div');list.className='context-action-list';d.append(list,status);
  const fit=()=>{if(!d.open)return;const r=d.getBoundingClientRect();d.style.top=Math.max(8,Math.min(parseFloat(d.style.top)||8,innerHeight-r.height-8))+'px'};const observer=new ResizeObserver(fit);observer.observe(list);d.addEventListener('close',()=>observer.disconnect(),{once:true});
  const paint=(actions,back)=>{list.replaceChildren();status.textContent='';if(back){const b=document.createElement('button');b.textContent=({ko:'‹ 뒤로',en:'‹ Back',ja:'‹ 戻る'})[lang];b.onclick=back;list.append(b)}for(const action of actions){const b=document.createElement('button');b.textContent=action.label[lang]||action.label.ko;b.disabled=!actors.length;b.onclick=async()=>{d.querySelectorAll('button,select').forEach(b=>{if(b!==x)b.disabled=true});status.textContent=copy.busy;await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));try{if(menu!==d)return;const self=target.type==='person'&&target.id===select.value;if(!await execute(select.value,action,self?{type:'self',id:target.id}:target,info)){status.textContent=copy.failed;return}close()}catch(error){status.textContent=error?.message||copy.failed}finally{d.querySelectorAll('button,select').forEach(b=>b.disabled=false)}};list.append(b)}};
  const categories=()=>{list.replaceChildren();const back=document.createElement('button');back.textContent=({ko:'‹ 추천 행동',en:'‹ Suggested actions',ja:'‹ おすすめの行動'})[lang];back.onclick=initial;list.append(back);for(const group of contextGroups(target,actors.find(c=>c.id===select.value))){const b=document.createElement('button');b.textContent=group.label[lang]||group.label.ko;b.onclick=()=>paint(group.actions,categories);list.append(b)}};
  const initial=()=>{paint(recommendedContextActions(target,w,actors.find(c=>c.id===select.value)));const heading=document.createElement('small');heading.textContent=({ko:'추천 행동',en:'Suggested actions',ja:'おすすめの行動'})[lang]||'추천 행동';list.prepend(heading);if(buildingHome&&openHome){const enter=document.createElement('button');enter.textContent=({ko:'들어가기',en:'Enter home',ja:'家に入る'})[lang]||'들어가기';enter.dataset.enterHome=buildingHome;enter.onclick=()=>{close();openHome(buildingHome,info)};list.prepend(enter)}const extra=document.createElement('button');extra.textContent=copy.more;extra.disabled=!actors.length;extra.onclick=categories;list.append(extra)};select.onchange=initial;initial();
  document.body.append(d);d.showModal();const box=el.getBoundingClientRect(),size=d.getBoundingClientRect();d.style.left=Math.max(8,Math.min(innerWidth-size.width-8,box.left))+'px';d.style.top=Math.max(8,Math.min(innerHeight-size.height-8,box.bottom+6))+'px';d.onclose=()=>{d.remove();if(menu===d)menu=null};d.addEventListener('click',event=>{if(event.target!==d)return;const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()});
 },true);
 window.addEventListener('pagehide',close);window.addEventListener('resize',close);
 return close;
}
