(() => {
  'use strict';
  const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone=v=>JSON.parse(JSON.stringify(v));
  const find=id=>(state.characters||[]).find(c=>c.id===id);
  let selectedId=find(state.activeId)?.id||state.characters?.[0]?.id||'', editingRelationId='';

  function normalize(c){
    if(!c)return c;
    c.tastes=clone(Array.isArray(c.tastes)?c.tastes:[]);
    c.interests=clone(Array.isArray(c.interests)?c.interests:[]);
    c.hobbies=clone(Array.isArray(c.hobbies)?c.hobbies:[]);
    const raw=typeof c.theme==='string'?{accent:c.theme}:clone(c.theme||{});
    c.theme={accent:raw.accent||'#6f7cff',secondary:raw.secondary||raw.accent||'#6f7cff',useSecondary:!!raw.useSecondary};
    return c;
  }
  state.characters.forEach(normalize);
  const current=()=>find(selectedId)||find(state.activeId)||state.characters[0];
  function persist(){
    state.activeId=selectedId;state.pendingCloudSave=true;
    state.cloudRevision=Number(state.cloudRevision||0)+1;state.cloudUpdatedAt=Date.now();
    localStorage.setItem('parallelCityV2',JSON.stringify(state));window.queueParallelCityCloudSync?.();
  }
  function applyTheme(c=current()){
    if(!c)return;const t=normalize(c).theme,s=t.useSecondary?t.secondary:t.accent,root=document.documentElement;
    root.style.setProperty('--accent',t.accent);root.style.setProperty('--accent2',s);root.style.setProperty('--char-ring',t.accent);
    $('meta[name="theme-color"]')?.setAttribute('content',t.accent);
  }
  function repairRows(){
    $$('#characterList .char-item').forEach((row,i)=>{const c=state.characters[i];if(!c)return;row.dataset.characterId=c.id;row.classList.toggle('active',c.id===selectedId);row.style.setProperty('--char-ring',normalize(c).theme.accent)});
    $$('#observeCharacterPicker .observe-character-card').forEach((row,i)=>{const c=state.characters[i];if(!c)return;row.dataset.characterId=c.id;row.classList.toggle('active',c.id===selectedId);row.style.setProperty('--card-accent',normalize(c).theme.accent);row.style.setProperty('--card-ring',c.theme.accent)});
    if($('#quickChar'))$('#quickChar').value=selectedId;
  }
  function fill(){
    const c=normalize(current());if(!c)return;
    const set=(id,v)=>{if($(id))$(id).value=v??''};
    set('#charName',c.name);set('#charJob',c.job);set('#charMood',c.mood||'평온함');set('#charIncome',c.income||'mid');
    set('#charSpending',c.spending||'normal');set('#charRhythm',c.rhythm||'보통');set('#charTransport',c.transport||'도보 + 대중교통');
    set('#charHomeType',c.homeType||'apartment');set('#charPet',c.pet||'none');set('#photoPositionX',c.photoPosition?.x??50);set('#photoPositionY',c.photoPosition?.y??50);
    set('#charAccent',c.theme.accent);set('#charSecondary',c.theme.secondary);
    if($('#charUseSecondary'))$('#charUseSecondary').checked=c.theme.useSecondary;
    if($('#charSecondaryWrap'))$('#charSecondaryWrap').style.display=c.theme.useSecondary?'block':'none';
    [['tasteChips','tastes'],['interestChips','interests'],['hobbyChips','hobbies']].forEach(([id,key])=>$$(`#${id} .chip`).forEach(chip=>chip.classList.toggle('selected',c[key].includes(chip.textContent.trim()))));
    applyTheme(c);repairRows();
  }
  function collect(){
    const c=normalize(current()),v=id=>$(id)?.value??'';if(!c)return null;
    c.name=v('#charName').trim()||c.name||'이름 없음';c.job=v('#charJob').trim();c.mood=v('#charMood')||c.mood;
    c.income=v('#charIncome')||c.income;c.spending=v('#charSpending')||c.spending;c.rhythm=v('#charRhythm')||c.rhythm;c.transport=v('#charTransport')||c.transport;
    c.homeType=v('#charHomeType')||c.homeType;c.pet=v('#charPet')||c.pet;c.photoPosition={x:+v('#photoPositionX')||50,y:+v('#photoPositionY')||50};
    c.theme={accent:v('#charAccent')||c.theme.accent,secondary:v('#charSecondary')||c.theme.secondary,useSecondary:!!$('#charUseSecondary')?.checked};
    persist();applyTheme(c);return c;
  }
  function select(c,editor){
    if(!c)return;selectedId=c.id;state.activeId=c.id;applyTheme(c);persist();
    if(editor){
      $$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view==='characters'));
      $$('.view').forEach(x=>x.classList.toggle('active',x.id==='view-characters'));
      window.renderCharacters?.();fill();
    }else{
      const b=window.ParallelCityVillage?.currentBuilding?.(c);
      if(b&&state.worlds){state.worlds.activeWorldId=b.worldId;state.worlds.activeDistrictId=b.districtId;state.worlds.activeNeighborhoodId=b.neighborhoodId}
      window.renderAll?.();applyTheme(c);window.ParallelCityVillage?.render?.();
    }
    repairRows();
  }
  function toggleChip(chip){
    const c=normalize(current()),box=chip.closest('.chips');if(!c||!box)return;
    const key=box.id==='tasteChips'?'tastes':box.id==='interestChips'?'interests':'hobbies',value=chip.textContent.trim(),set=new Set(c[key]);
    set.has(value)?set.delete(value):set.add(value);c[key]=[...set];chip.classList.toggle('selected',set.has(value));persist();
  }
  function removeReality(){
    ['#charHome','#charWork'].forEach(id=>$(id)?.parentElement?.remove());$$('.location-privacy-help').forEach(x=>x.remove());
  }
  const gradient=r=>`linear-gradient(90deg,${normalize(find(r.a))?.theme.accent||'#6f7cff'},${normalize(find(r.b))?.theme.accent||'#b36cff'})`;
  function loadRelation(r){
    editingRelationId=r.id;
    const set=(id,v)=>{if($('#'+id))$('#'+id).value=v};
    ['A','B','Type','Close','Conflict','Cohabit','Distance','PickupChance','SoloChance','Memo'].forEach(key=>set('rel'+key,({A:r.a,B:r.b,Type:r.type,Close:r.close,Conflict:r.conflict,Cohabit:r.cohabit,Distance:r.maxDistance??8,PickupChance:r.pickupChance??70,SoloChance:r.soloChance??15,Memo:r.memo||''})[key]));
    Object.entries({relCohabitTogether:'cohabitTogether',relPickupOvertime:'pickupOvertime',relPickupRain:'pickupRain',relMeetAfterWork:'meetAfterWork',relSharedMeal:'sharedMeal',relHospital:'hospital',relCheckHome:'checkHome'}).forEach(([id,key])=>{if($('#'+id))$('#'+id).checked=!!r.behaviors?.[key]});
    $('#addRelation').textContent='관계 수정 저장';
  }
  function renderRelations54(){
    ['relA','relB'].forEach(id=>{if($('#'+id))$('#'+id).innerHTML=state.characters.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')});
    const box=$('#relationList');if(!box)return;box.innerHTML=state.relations?.length?'':'<div class="empty">관계를 추가해 주세요.</div>';
    (state.relations||[]).forEach(r=>{const a=find(r.a),b=find(r.b);if(!a||!b)return;const card=document.createElement('div');card.className='relation-card';card.style.setProperty('--relation-gradient',gradient(r));
      card.innerHTML=`<strong>${esc(a.name)} ${r.type==='짝사랑'?'→':'×'} ${esc(b.name)}</strong><span>${esc(r.type)} · ${r.cohabit==='yes'?'함께 거주':'따로 거주'}<br>친밀도 ${r.close} · 갈등도 ${r.conflict}</span><div class="meter"><i style="width:${r.close}%"></i></div><div class="relation-actions"><button class="icon-btn edit">편집</button><button class="icon-btn remove">삭제</button></div>`;
      card.querySelector('.edit').onclick=()=>loadRelation(r);card.querySelector('.remove').onclick=()=>{state.relations=state.relations.filter(x=>x.id!==r.id);persist();renderRelations54()};box.appendChild(card)});
  }
  function saveEdit(){
    const r=state.relations.find(x=>x.id===editingRelationId);if(!r)return false;const v=id=>$('#'+id)?.value;
    Object.assign(r,{a:v('relA'),b:v('relB'),type:v('relType'),close:+v('relClose'),conflict:+v('relConflict'),cohabit:v('relCohabit'),maxDistance:+v('relDistance'),pickupChance:+v('relPickupChance'),soloChance:+v('relSoloChance'),memo:v('relMemo')?.trim()||''});
    r.behaviors={cohabitTogether:$('#relCohabitTogether').checked,pickupOvertime:$('#relPickupOvertime').checked,pickupRain:$('#relPickupRain').checked,meetAfterWork:$('#relMeetAfterWork').checked,sharedMeal:$('#relSharedMeal').checked,hospital:$('#relHospital').checked,checkHome:$('#relCheckHome').checked};
    editingRelationId='';$('#addRelation').textContent='관계 저장';persist();renderRelations54();toast?.('관계를 수정했습니다.');return true;
  }
  function stack(){
    const map=$('#map .world-map');if(!map)return;const groups=new Map();
    $$('.world-character',map).forEach(x=>{const key=x.style.getPropertyValue('--x')+'|'+x.style.getPropertyValue('--y');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(x)});
    groups.forEach(list=>{if(list.length<2)return;const wrap=document.createElement('div');wrap.className='world-character-stack';wrap.style.setProperty('--x',list[0].style.getPropertyValue('--x'));wrap.style.setProperty('--y',list[0].style.getPropertyValue('--y'));list[0].before(wrap);list.forEach(x=>wrap.appendChild(x))});
  }
  window.renderRelations=renderRelations54;
  const oldRender=window.ParallelCityVillage?.render;if(window.ParallelCityVillage)window.ParallelCityVillage.render=()=>{oldRender?.();setTimeout(stack,0)};
  addEventListener('pointerdown',e=>{
    const row=e.target.closest('#characterList .char-item');if(row){e.preventDefault();e.stopImmediatePropagation();select(find(row.dataset.characterId)||state.characters[$$('#characterList .char-item').indexOf(row)],true);return}
    const obs=e.target.closest('#observeCharacterPicker .observe-character-card');if(obs){e.preventDefault();e.stopImmediatePropagation();select(find(obs.dataset.characterId)||state.characters[$$('#observeCharacterPicker .observe-character-card').indexOf(obs)],false);return}
    if(e.target.closest('#map .world-building'))e.stopImmediatePropagation();
  },true);
  addEventListener('click',e=>{
    const chip=e.target.closest('#tasteChips .chip,#interestChips .chip,#hobbyChips .chip');if(chip){e.preventDefault();e.stopImmediatePropagation();toggleChip(chip);return}
    if(e.target.closest('#saveChar')){e.preventDefault();e.stopImmediatePropagation();const c=collect();window.renderAll?.();selectedId=c.id;state.activeId=c.id;fill();window.pushParallelCityCloudState?.();toast?.('캐릭터별 설정을 저장했습니다.');return}
    if(e.target.closest('#addRelation')&&editingRelationId){e.preventDefault();e.stopImmediatePropagation();saveEdit()}
  },true);
  addEventListener('input',e=>{if(!['charAccent','charSecondary','charUseSecondary'].includes(e.target.id))return;const c=current();c.theme={accent:$('#charAccent').value,secondary:$('#charSecondary').value,useSecondary:$('#charUseSecondary').checked};if($('#charSecondaryWrap'))$('#charSecondaryWrap').style.display=c.theme.useSecondary?'block':'none';applyTheme(c)},true);
  function boot(){removeReality();selectedId=find(state.activeId)?.id||state.characters[0]?.id||'';window.renderAll?.();fill();renderRelations54();window.ParallelCityVillage?.render?.();setTimeout(stack,80)}
  addEventListener('DOMContentLoaded',boot,{once:true});if(document.readyState!=='loading')boot();addEventListener('pageshow',()=>setTimeout(()=>{removeReality();fill();repairRows();stack()},100));
})();
