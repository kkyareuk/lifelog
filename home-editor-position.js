const positions=new Map();
export function bindEditorPosition(root,homeId,language='ko'){
 const host=root.matches?.('.home-page')?root:root.querySelector('.home-page');if(!host)return;
 const visibility=host.querySelector('.home-edit-visibility'),toolbar=host.querySelector('.furniture-edit-toolbar'),catalog=host.querySelector('.home-furniture-drawer');if(!visibility||!toolbar||!catalog)return;
 if(host.querySelector('.home-editor-dock'))return;
 const t=(ko,en,ja)=>({ko,en,ja}[language]||ko),dock=document.createElement('section');dock.className='home-editor-dock';host.append(dock);
 const header=document.createElement('nav');header.className='home-tools-header';const make=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;header.append(b);return b};
 const handle=make('⠿',()=>{});handle.className='home-tools-grip';handle.setAttribute('aria-label',t('도구창 끌어서 이동','Drag tools','ツールをドラッグ'));
 const add=make(t('가구 추가','Add','家具追加'),()=>show(mode==='catalog'?'': 'catalog'));
 const view=make(t('보기','View','表示'),()=>show(mode==='view'?'':'view'));
 const done=make(t('편집 완료','Finish','編集完了'),()=>host.querySelector('[data-home-edit]')?.click());
 const fold=make('−',()=>show(''));fold.setAttribute('aria-label',t('도구 접기','Collapse tools','ツールを閉じる'));
 const side=host.querySelector('.home-native-side');
 if(side){for(const original of side.querySelectorAll('[data-open-home-feature]')){const b=document.createElement('button');b.textContent=original.textContent;b.onclick=()=>original.click();visibility.append(b)}side.hidden=true;side.style.display='none';}
 const floors=host.querySelector('.home-native-elevator');
 if(floors){floors.className='home-editor-floors';header.append(floors)}
 dock.append(header,visibility,toolbar,catalog);
 let mode='';const show=next=>{mode=next;dock.dataset.panel=mode;visibility.hidden=mode!=='view';catalog.hidden=mode!=='catalog';toolbar.hidden=mode!=='furniture';add.setAttribute('aria-pressed',String(mode==='catalog'));view.setAttribute('aria-pressed',String(mode==='view'));fold.hidden=!mode;if(mode==='catalog'){catalog.classList.remove('is-collapsed');catalog.querySelector('.home-drawer-content')?.removeAttribute('inert')}clamp()};
 for(const control of [visibility,toolbar,catalog])Object.assign(control.style,{position:'relative',inset:'auto',transform:'none',width:'100%',maxWidth:'none'});
 const clamp=()=>{const p=positions.get(homeId),v=window.visualViewport,x=v?.offsetLeft||0,y=v?.offsetTop||0,w=v?.width||innerWidth,h=v?.height||innerHeight;
 dock.style.maxHeight=Math.max(48,h-16)+'px';dock.style.maxWidth=Math.max(80,w-16)+'px';
 const r=dock.getBoundingClientRect();dock.style.left=Math.max(x+4,Math.min(p?.x??x+8,x+w-r.width-4))+'px';dock.style.top=Math.max(y+4,Math.min(p?.y??y+h-r.height-12,y+h-r.height-4))+'px'};
 const position=visibility.querySelector('[data-home-tools-position]');if(position){position.textContent=t('위/아래로 이동','Move up/down','上下へ移動');position.onclick=()=>{const r=dock.getBoundingClientRect();positions.set(homeId,{x:r.x,y:r.y>innerHeight/2?8:innerHeight});clamp()}}
 let drag=null;handle.onpointerdown=e=>{e.preventDefault();const r=dock.getBoundingClientRect();drag={x:e.clientX-r.x,y:e.clientY-r.y};handle.setPointerCapture(e.pointerId)};handle.onpointermove=e=>{if(!drag)return;e.preventDefault();positions.set(homeId,{x:e.clientX-drag.x,y:e.clientY-drag.y});clamp()};handle.onpointerup=handle.onpointercancel=()=>drag=null;
 handle.onkeydown=e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const r=dock.getBoundingClientRect();positions.set(homeId,{x:r.x+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0),y:r.y+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0)});clamp()};
 host.addEventListener('furniture-selection',()=>show('furniture'));
 const observer=new MutationObserver(()=>{if(mode==='furniture'&&toolbar.hidden)show('')});observer.observe(toolbar,{attributes:true,attributeFilter:['hidden']});
 const controller=new AbortController();window.addEventListener('resize',clamp,{signal:controller.signal});window.visualViewport?.addEventListener('resize',clamp,{signal:controller.signal});window.visualViewport?.addEventListener('scroll',clamp,{signal:controller.signal});
 const sizes=new ResizeObserver(clamp);sizes.observe(dock);
 // The next bind owns cleanup; detached editor nodes must not retain window listeners.
 bindEditorPosition.cleanup?.();bindEditorPosition.cleanup=()=>{observer.disconnect();sizes.disconnect();controller.abort()};show('');
}
