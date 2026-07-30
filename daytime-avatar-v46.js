/* 평행도시 v46 — 낮 일정 보강 + 캐릭터별 아바타/테마 분리 */
(()=>{
 const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
 const todayKey=()=>new Date().toLocaleDateString('sv-SE');
 const hm=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
 const minutes=v=>{const [h,m]=String(v||'0:0').split(':').map(Number);return h*60+m};
 const hash=v=>[...String(v)].reduce((n,c)=>(n*33+c.charCodeAt(0))>>>0,23);
 const themeOf=c=>typeof ensureCharTheme==='function'?ensureCharTheme(c):{accent:c?.theme?.accent||c?.theme||'#6f7cff',secondary:c?.theme?.secondary||c?.theme?.accent||'#6f7cff'};

 function isHomeEvent(event){
  return !event||event.home||event.kind==='home'||/집|귀가|취침|기상|하루 정리/.test(`${event.title||''} ${event.detail||''}`);
 }
 function isHomebody(c){
  const hobbies=c.hobbies||[];
  return hobbies.includes('외출 안 함')||hobbies.includes('집에서 뒹굴기')||hobbies.includes('히키코모리');
 }
 function addDaytimeLife(c){
  if(!c?.today?.length)return false;
  const date=todayKey(), day=(new Date().getDay()+6)%7;
  if(c.daytimeLifeDate===date&&c.daytimeLifeVersion===46&&c.today.some(e=>e.v46Daytime))return false;
  c.today=c.today.filter(e=>!e.v46Daytime);
  const events=c.today, hasOutside=events.some(e=>!isHomeEvent(e)&&minutes(e.time)>=480&&minutes(e.time)<720);
  if(hasOutside){c.daytimeLifeDate=date;c.daytimeLifeVersion=46;return false}
  const sleeping=window.ParallelCityHome?.sleepState?.(c,12*60)?.sleeping;
  if(sleeping){c.daytimeLifeDate=date;c.daytimeLifeVersion=46;return false}
  const routines=(c.routines?.[day]||[]), workRoutine=routines.find(r=>/출근|근무|수업|학교|회사/.test(r.title||''));
  const hasWork=Boolean(c.workBuildingId)||(!/무직|없음/.test(c.job||'')&&String(c.job||'').trim());
  let event;
  if(workRoutine){
   event={time:workRoutine.time,title:workRoutine.title,detail:'요일별 고정 일정에 따라 외출함',category:/학교|수업/.test(workRoutine.title)?'school':'company',kind:'routine',v46Daytime:true};
  }else if(hasWork){
   const start=8*60+35+(hash(`${c.id}-${date}-work`)%46);
   event={time:hm(start),title:/학생|학교|대학/.test(c.job||'')?'학교에서 수업 중':'직장에서 일하는 중',detail:`${c.job||'등록한 직업'}의 평일 생활을 보내는 중`,category:/학생|학교|대학/.test(c.job||'')?'school':'company',kind:'work',v46Daytime:true};
  }else if(!isHomebody(c)&&(Number(c.settings?.exploreCount??3)>0)){
   const start=10*60+10+(hash(`${c.id}-${date}-outing`)%91), categories=['park','cafe','bookstore','market','library'];
   const category=categories[hash(`${c.id}-${date}-category`)%categories.length];
   event={time:hm(start),title:'동네에 외출함',detail:'특별한 고정 일정은 없지만 가까운 곳에 잠시 나옴',category,kind:'explore',v46Daytime:true};
  }
  if(event){
   window.ParallelCityVillage?.assignEvent?.(c,event,events.filter(e=>minutes(e.time)<=minutes(event.time)).length);
   events.push(event);events.sort((a,b)=>String(a.time).localeCompare(String(b.time)));
  }
  c.daytimeLifeDate=date;c.daytimeLifeVersion=46;return Boolean(event);
 }
 async function ensureDaytimeForAll(){
  let changed=false;
  for(const c of state.characters||[])changed=addDaytimeLife(c)||changed;
  if(changed){state.pendingCloudSave=true;save?.();window.queueParallelCityCloudSync?.()}
  renderObserve?.();window.ParallelCityVillage?.render?.();
 }

 function avatarClass(c){return c.photo?(c.avatarMode==='cutout'?'avatar-cutout':'avatar-photo'):'avatar-initial'}
 function decorateAvatar(el,c){
  if(!el||!c)return;
  el.classList.remove('avatar-photo','avatar-cutout','avatar-initial');
  el.classList.add(avatarClass(c));
  const t=themeOf(c);
  el.style.setProperty('--own-accent',t.accent);
  el.style.setProperty('--char-ring',t.accent);
  el.style.setProperty('--card-accent',t.accent);
  if(c.photo){
   el.style.border='0';
   el.style.background='transparent';
  }else{
   el.style.border=`3px solid ${t.accent}`;
   el.style.background=t.accent;
  }
 }
 function decorateSurfaces(){
  const characters=state.characters||[];
  $$('#characterList .char-item').forEach((row,i)=>{
   const c=characters[i];if(!c)return;
   row.style.setProperty('--own-accent',themeOf(c).accent);
   decorateAvatar($('.avatar',row),c);
  });
  $$('#observeCharacterPicker .observe-character-card').forEach((row,i)=>{
   const c=characters[i];if(!c)return;
   row.style.setProperty('--card-accent',themeOf(c).accent);
   decorateAvatar($('.avatar',row),c);
  });
  $$('.world-character').forEach(el=>{
   const c=characters.find(x=>x.id===el.dataset.character);
   decorateAvatar($('img,span',el)?.closest('img,span'),c);
   if(c)el.style.setProperty('--person',themeOf(c).accent);
  });
 }
 function selectThemeNow(id){
  const c=(state.characters||[]).find(x=>x.id===id);if(!c)return;
  state.activeId=id;applyActiveCharacterTheme?.();decorateSurfaces();
 }

 const readFile=file=>new Promise((ok,fail)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=fail;r.readAsDataURL(file)});
 const loadImage=src=>new Promise((ok,fail)=>{const image=new Image();image.onload=()=>ok(image);image.onerror=fail;image.src=src});
 function drawCrop(image,mode,x,y,zoom){
  const size=512,canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext('2d'),base=Math.max(size/image.naturalWidth,size/image.naturalHeight)*zoom;
  const w=image.naturalWidth*base,h=image.naturalHeight*base;
  ctx.clearRect(0,0,size,size);ctx.drawImage(image,(size-w)*(x/100),(size-h)*(y/100),w,h);
  if(mode==='cutout'){
   const pixels=ctx.getImageData(0,0,size,size),d=pixels.data;
   const corners=[[0,0],[size-1,0],[0,size-1],[size-1,size-1]].map(([cx,cy])=>{const i=(cy*size+cx)*4;return[d[i],d[i+1],d[i+2]]});
   const bg=corners.reduce((a,v)=>a.map((n,i)=>n+v[i]/4),[0,0,0]);
   for(let i=0;i<d.length;i+=4){
    const distance=Math.hypot(d[i]-bg[0],d[i+1]-bg[1],d[i+2]-bg[2]);
    if(distance<42)d[i+3]=0;else if(distance<78)d[i+3]=Math.round(255*(distance-42)/36);
   }
   ctx.putImageData(pixels,0,0);
   return canvas.toDataURL('image/png');
  }
  return canvas.toDataURL('image/jpeg',.82);
 }
 function cropDialog(src){
  return new Promise(async resolve=>{
   const image=await loadImage(src),modal=document.createElement('div');modal.className='avatar-crop-modal';
   modal.innerHTML=`<div class="avatar-crop-dialog"><h3>캐릭터 사진 만들기</h3><p>사진을 끌어 맞춘 뒤 표시 방식을 골라 주세요.</p>
    <div class="avatar-crop-stage"><img alt=""></div>
    <div class="avatar-crop-controls"><label>확대 <input data-zoom type="range" min="1" max="3" step=".01" value="1"></label><label>가로 위치 <input data-x type="range" min="0" max="100" value="50"></label><label>세로 위치 <input data-y type="range" min="0" max="100" value="50"></label></div>
    <div class="avatar-mode-picks"><button data-mode="profile" class="active">동그란 프로필 사진</button><button data-mode="cutout">배경 투명화 아이콘</button></div>
    <small>배경 투명화는 단색 배경 그림에 가장 잘 맞아요.</small>
    <div class="actions"><button class="btn secondary" data-cancel>취소</button><button class="btn" data-apply>적용</button></div></div>`;
   document.body.append(modal);const preview=$('img',modal);preview.src=src;let mode='profile';
   const update=()=>{const z=+$('[data-zoom]',modal).value,x=+$('[data-x]',modal).value,y=+$('[data-y]',modal).value;preview.style.width=`${100*z}%`;preview.style.height=`${100*z}%`;preview.style.left=`${(50-x)*(z-1)}%`;preview.style.top=`${(50-y)*(z-1)}%`;$('.avatar-crop-stage',modal).classList.toggle('cutout',mode==='cutout')};
   $$('input',modal).forEach(i=>i.oninput=update);
   $$('[data-mode]',modal).forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$$('[data-mode]',modal).forEach(x=>x.classList.toggle('active',x===b));update()});
   $('[data-cancel]',modal).onclick=()=>{modal.remove();resolve(null)};
   $('[data-apply]',modal).onclick=()=>{const data=drawCrop(image,mode,+$('[data-x]',modal).value,+$('[data-y]',modal).value,+$('[data-zoom]',modal).value);modal.remove();resolve({data,mode})};
   update();
  });
 }
 function bindUploader(){
  let input=$('#charPhoto');if(!input||input.dataset.v46)return;
  const clean=input.cloneNode(true);input.replaceWith(clean);input=clean;input.dataset.v46='1';
  input.addEventListener('change',async event=>{
   event.stopImmediatePropagation();const file=input.files?.[0],id=active?.().id;if(!file||!id)return;
   try{
    const result=await cropDialog(await readFile(file));if(!result)return;
    const c=state.characters.find(x=>x.id===id);if(!c)return;
    c.photo=result.data;c.avatarMode=result.mode;c.photoPosition={x:50,y:50};state.pendingCloudSave=true;
    save?.();applyActiveCharacterTheme?.();renderAll?.();decorateSurfaces();await window.pushParallelCityCloudState?.();
    toast?.(result.mode==='cutout'?'배경 투명화 아이콘으로 저장했어요.':'프로필 사진으로 저장했어요.');
   }catch(error){console.error(error);toast?.(`사진을 저장하지 못했어요: ${error.message}`)}
   finally{input.value=''}
  },true);
 }
 function install(){
  bindUploader();decorateSurfaces();
  const c=active?.();if(c)applyActiveCharacterTheme?.();
 }
 document.addEventListener('pointerdown',event=>{
  const row=event.target.closest('#characterList .char-item,#observeCharacterPicker .observe-character-card');
  if(!row)return;
  const collection=row.parentElement.id==='characterList'?$$('#characterList .char-item'):$$('#observeCharacterPicker .observe-character-card');
  const index=collection.indexOf(row),c=state.characters?.[index];if(c)selectThemeNow(c.id);
 },true);
 document.addEventListener('change',event=>{if(event.target.id==='quickChar'){selectThemeNow(event.target.value);setTimeout(()=>{applyActiveCharacterTheme?.();decorateSurfaces()},0)}},true);
 const observer=new MutationObserver(()=>requestAnimationFrame(install));
 addEventListener('DOMContentLoaded',()=>{
  observer.observe(document.body,{subtree:true,childList:true});
  install();setTimeout(ensureDaytimeForAll,500);
 },{once:true});
 addEventListener('pageshow',()=>{install();setTimeout(ensureDaytimeForAll,250)});
 setInterval(ensureDaytimeForAll,60000);
 window.ParallelCityAvatarV46={decorate:decorateSurfaces,crop:cropDialog};
})();
