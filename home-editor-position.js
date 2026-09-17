const positions=new Map();
export function bindEditorPosition(root,homeId,language='ko'){
 const host=root.matches?.('.home-page')?root:root.querySelector('.home-page');if(!host)return;
 const button=host.querySelector('[data-home-tools-position]');if(!button)return;
 let dock=host.querySelector('.home-editor-dock');if(!dock){dock=document.createElement('section');dock.className='home-editor-dock';host.append(dock);}
 for(const selector of ['.home-edit-visibility','.furniture-edit-toolbar','.home-furniture-drawer']){const control=host.querySelector(selector);if(control){dock.append(control);Object.assign(control.style,{position:'relative',top:'auto',bottom:'auto',left:'auto',right:'auto',transform:'none',width:'100%',maxWidth:'none'});}}
 const apply=()=>{const top=positions.get(homeId)||false;host.classList.toggle('home-tools-top',top);dock.dataset.position=top?'top':'bottom';button.textContent=({ko:top?'아래로 옮기기':'위로 옮기기',en:top?'Move tools down':'Move tools up',ja:top?'下へ移動':'上へ移動'}[language]||'위로 옮기기');button.setAttribute('aria-pressed',String(top));};
 button.onclick=()=>{positions.set(homeId,!positions.get(homeId));apply()};apply();
}
