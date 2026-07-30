(()=>{
  'use strict';
  const $=(q,r=document)=>r.querySelector(q);
  const $$=(q,r=document)=>[...r.querySelectorAll(q)];
  const copy=v=>JSON.parse(JSON.stringify(v));
  const byId=id=>state.characters.find(c=>c.id===id);
  const selected=()=>byId(state.activeId)||state.characters[0];
  let chosenId=state.activeId;

  function isolate(c){
    if(!c)return;
    c.tastes=copy(c.tastes||[]);
    c.interests=copy(c.interests||[]);
    c.hobbies=copy(c.hobbies||[]);
    c.settings=copy(c.settings||{});
    c.routines=copy(c.routines||Array.from({length:7},()=>[]));
    const raw=typeof c.theme==='string'?{accent:c.theme}:copy(c.theme||{});
    c.theme={
      accent:raw.accent||'#6f7cff',
      secondary:raw.secondary||raw.accent||'#6f7cff',
      ring:raw.accent||'#6f7cff',
      useSecondary:Boolean(raw.useSecondary)
    };
  }
  state.characters.forEach(isolate);

  function characterFromRow(row,selector){
    if(!row)return null;
    if(row.dataset.characterId&&byId(row.dataset.characterId))return byId(row.dataset.characterId);
    const rows=$$(selector);
    return state.characters[rows.indexOf(row)]||null;
  }
  function setTheme(c){
    if(!c)return;
    isolate(c);
    const t=c.theme,second=t.useSecondary?t.secondary:t.accent,root=document.documentElement;
    root.style.setProperty('--accent',t.accent);
    root.style.setProperty('--accent2',second);
    root.style.setProperty('--char-accent',t.accent);
    root.style.setProperty('--char-secondary',second);
    root.style.setProperty('--char-ring',t.accent);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',t.accent);
  }
  function chooseForEditing(c){
    if(!c)return;
    chosenId=c.id;
    state.activeId=c.id;
    setTheme(c);
    save?.();
    renderAll?.();
    document.querySelector('.tab[data-view="characters"]')?.click();
    setTheme(c);
  }
  function chooseForObservation(c,index){
    if(!c)return;
    chosenId=c.id;
    state.activeId=c.id;
    setTheme(c);
    save?.();
    const minute=new Date().getHours()*60+new Date().getMinutes();
    const event=typeof currentEvent==='function'?currentEvent(c,minute):null;
    const home=!event||event.home||event.kind==='home'||/집|귀가|취침|기상|하루 정리/.test(`${event.title||''} ${event.detail||''}`);
    if(home)document.querySelector('.tab[data-view="home"]')?.click();
    else{
      const building=window.ParallelCityVillage?.currentBuilding?.(c);
      if(building&&state.worlds){
        state.worlds.activeWorldId=building.worldId;
        state.worlds.activeDistrictId=building.districtId;
        state.worlds.activeNeighborhoodId=building.neighborhoodId;
      }
      document.querySelector('.tab[data-view="observe"]')?.click();
      renderAll?.();
      window.ParallelCityVillage?.render?.();
    }
    setTheme(c);
    repairRows();
  }

  document.addEventListener('pointerdown',event=>{
    const editRow=event.target.closest('#characterList .char-item');
    if(editRow&&!event.target.closest('.char-order')){
      const c=characterFromRow(editRow,'#characterList .char-item');
      if(c){event.preventDefault();event.stopImmediatePropagation();chooseForEditing(c)}
      return;
    }
    const observeRow=event.target.closest('#observeCharacterPicker .observe-character-card');
    if(observeRow){
      const rows=$$('#observeCharacterPicker .observe-character-card');
      const c=characterFromRow(observeRow,'#observeCharacterPicker .observe-character-card');
      if(c){event.preventDefault();event.stopImmediatePropagation();chooseForObservation(c,rows.indexOf(observeRow))}
    }
  },true);

  document.addEventListener('click',event=>{
    const editRow=event.target.closest('#characterList .char-item');
    const observeRow=event.target.closest('#observeCharacterPicker .observe-character-card');
    if((editRow&&!event.target.closest('.char-order'))||observeRow){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);

  document.addEventListener('click',event=>{
    const chip=event.target.closest('#tasteChips .chip,#interestChips .chip,#hobbyChips .chip');
    if(!chip)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const c=selected();
    if(!c)return;
    isolate(c);
    const box=chip.closest('.chips');
    const key=box.id==='tasteChips'?'tastes':box.id==='interestChips'?'interests':'hobbies';
    const value=chip.textContent.trim();
    const next=[...c[key]],at=next.indexOf(value);
    if(at>=0)next.splice(at,1);else next.push(value);
    c[key]=next;
    chip.classList.toggle('selected',at<0);
    save?.();
  },true);

  document.addEventListener('change',event=>{
    if(event.target.id!=='quickChar')return;
    const c=byId(event.target.value);
    if(!c)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    chooseForObservation(c,state.characters.indexOf(c));
  },true);

  function repairRows(){
    if(chosenId&&byId(chosenId)&&state.activeId!==chosenId)state.activeId=chosenId;
    const current=selected();
    $$('#characterList .char-item').forEach((row,i)=>{
      const c=state.characters[i];
      if(c){row.dataset.characterId=c.id;row.classList.toggle('active',c.id===current?.id)}
    });
    $$('#observeCharacterPicker .observe-character-card').forEach((row,i)=>{
      const c=state.characters[i];
      if(c){row.dataset.characterId=c.id;row.classList.toggle('active',c.id===current?.id)}
    });
    if($('#quickChar'))$('#quickChar').value=current?.id||'';
    setTheme(current);
  }
  let timer;
  new MutationObserver(()=>{
    clearTimeout(timer);
    timer=setTimeout(repairRows,30);
  }).observe(document.documentElement,{subtree:true,childList:true});
  addEventListener('DOMContentLoaded',repairRows,{once:true});
  addEventListener('pageshow',repairRows);
  setInterval(repairRows,1000);
})();
