const positions=new Map();
export function bindEditorPosition(root,homeId,language='ko'){
 const host=root.matches?.('.home-page')?root:root.querySelector('.home-page');if(!host)return;
 const visibility=host.querySelector('.home-edit-visibility'),toolbar=host.querySelector('.furniture-edit-toolbar'),catalog=host.querySelector('.home-furniture-drawer');if(!visibility||!toolbar||!catalog)return;
 if(host.querySelector('.home-editor-dock'))return;
 const t=(ko,en,ja)=>({ko,en,ja}[language]||ko),dock=document.createElement('section');dock.className='home-editor-dock';host.append(dock);
 const header=document.createElement('nav');header.className='home-tools-header';const make=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;header.append(b);return b};
 const handle=make('⠿',()=>{});handle.className='home-tools-grip';handle.setAttribute('aria-label',t('도구창 끌어서 이동','Drag tools','ツールをドラッグ'));
 const add=make(t('가구 추가','Add','家具追加'),()=>show(mode==='catalog'?'': 'catalog'));
 add.dataset.homeToolsAdd='';
 const view=make(t('보기','View','表示'),()=>show(mode==='view'?'':'view'));
 const done=make(t('편집 완료','Finish','編集完了'),()=>host.querySelector('[data-home-edit]')?.click());
 done.dataset.homeToolsDone='';
 const fold=make('−',()=>show(''));fold.setAttribute('aria-label',t('도구 접기','Collapse tools','ツールを閉じる'));
 const side=host.querySelector('.home-native-side');
 if(side){for(const original of side.querySelectorAll('[data-open-home-feature]')){const b=document.createElement('button');b.textContent=original.textContent;b.onclick=()=>original.click();visibility.append(b)}side.hidden=true;side.style.display='none';}
 const floors=host.querySelector('.home-native-elevator');
 if(floors){floors.className='home-editor-floors';header.append(floors)}
 dock.append(header,visibility,toolbar,catalog);
 let mode='';const show=next=>{mode=next;dock.dataset.panel=mode;visibility.hidden=mode!=='view';catalog.hidden=mode!=='catalog';toolbar.hidden=mode!=='furniture';add.setAttribute('aria-pressed',String(mode==='catalog'));view.setAttribute('aria-pressed',String(mode==='view'));fold.hidden=!mode;if(mode==='catalog'){catalog.classList.remove('is-collapsed');catalog.querySelector('.home-drawer-content')?.removeAttribute('inert')}clamp()};
 for(const control of [visibility,toolbar,catalog])Object.assign(control.style,{position:'relative',inset:'auto',transform:'none',width:'100%',maxWidth:'none'});
 const visibleBounds=()=>{
  const v=window.visualViewport,style=getComputedStyle(dock),x=v?.offsetLeft||0,y=v?.offsetTop||0;
  let left=x+4,top=y+(parseFloat(style.getPropertyValue('--editor-safe-top'))||0)+4,right=x+(v?.width||innerWidth)-4,bottom=y+(v?.height||innerHeight)-(parseFloat(style.getPropertyValue('--editor-safe-bottom'))||0)-4;
  for(let n=host;n&&n!==document.body;n=n.parentElement){const cs=getComputedStyle(n),r=n.getBoundingClientRect();if(/hidden|clip|auto|scroll/.test(cs.overflowX)){left=Math.max(left,r.left+4);right=Math.min(right,r.right-4)}if(/hidden|clip|auto|scroll/.test(cs.overflowY)){top=Math.max(top,r.top+4);bottom=Math.min(bottom,r.bottom-4)}}
  for(const n of host.querySelectorAll('.home-native-header,.home-native-header .home-native-back')){const r=n.getBoundingClientRect();if(r.width&&r.height&&r.bottom>top&&r.top<bottom)top=Math.max(top,r.bottom+4)}
  return {left,top,right,bottom};
 };
 const clamp=()=>{const p=positions.get(homeId),b=visibleBounds();
  dock.style.maxHeight=Math.max(48,b.bottom-b.top)+'px';dock.style.maxWidth=Math.max(80,b.right-b.left)+'px';
  // Convert viewport coordinates to the fixed containing block's coordinates.
  // The advertising wrapper can translate that block away from the viewport origin.
  dock.style.left='0px';dock.style.top='0px';const origin=dock.getBoundingClientRect();
  const x=Math.max(b.left,Math.min(p?.x??b.left+4,b.right-origin.width)),y=Math.max(b.top,Math.min(p?.y??b.bottom-origin.height-8,b.bottom-origin.height));
  dock.style.left=(x-origin.left)+'px';dock.style.top=(y-origin.top)+'px';
 };
 const position=visibility.querySelector('[data-home-tools-position]');if(position){position.textContent=t('위/아래로 이동','Move up/down','上下へ移動');position.onclick=()=>{const r=dock.getBoundingClientRect(),b=visibleBounds();positions.set(homeId,{x:r.x,y:r.y>(b.top+b.bottom-r.height)/2?b.top:b.bottom});dock.scrollTop=0;clamp()}}
 let drag=null;handle.onpointerdown=e=>{e.preventDefault();const r=dock.getBoundingClientRect();drag={x:e.clientX-r.x,y:e.clientY-r.y};handle.setPointerCapture(e.pointerId)};handle.onpointermove=e=>{if(!drag)return;e.preventDefault();positions.set(homeId,{x:e.clientX-drag.x,y:e.clientY-drag.y});clamp()};handle.onpointerup=handle.onpointercancel=()=>drag=null;
 handle.onkeydown=e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const r=dock.getBoundingClientRect();positions.set(homeId,{x:r.x+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0),y:r.y+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0)});clamp()};
 host.addEventListener('furniture-selection',()=>show('furniture'));
 const observer=new MutationObserver(()=>{if(mode==='furniture'&&toolbar.hidden)show('')});observer.observe(toolbar,{attributes:true,attributeFilter:['hidden']});
 const controller=new AbortController();root.addEventListener('scroll',clamp,{signal:controller.signal,capture:true});window.addEventListener('resize',clamp,{signal:controller.signal});window.visualViewport?.addEventListener('resize',clamp,{signal:controller.signal});window.visualViewport?.addEventListener('scroll',clamp,{signal:controller.signal});
 const sizes=new ResizeObserver(clamp);sizes.observe(dock);sizes.observe(host);
 // The next bind owns cleanup; detached editor nodes must not retain window listeners.
 bindEditorPosition.cleanup?.();bindEditorPosition.cleanup=()=>{observer.disconnect();sizes.disconnect();controller.abort()};show('');
}
