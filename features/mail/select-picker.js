// Keep native selects as the form's source of truth (including async recipients).
export function bindMailSelectPicker(select,{title,search,close},root){
 if(!select)return;
 const button=document.createElement('button');button.type='button';button.className='mail-address-picker';
 select.hidden=true;select.after(button);
 const paint=()=>{button.disabled=select.disabled;button.textContent=title+(select.selectedOptions[0]?' · '+select.selectedOptions[0].textContent:'')};
 select.addEventListener('change',paint);
 const observer=new MutationObserver(paint);observer.observe(select,{childList:true,subtree:true,attributes:true});
 // The observer observes only its own detached select and can be collected with it.
 button.onclick=()=>{
  const dialog=document.createElement('dialog');dialog.className='mail-select-dialog';
  const heading=document.createElement('h2');heading.textContent=title;
  const input=document.createElement('input');input.type='search';input.placeholder=search;input.setAttribute('aria-label',search);
  const grid=document.createElement('div');grid.className='mail-select-grid';
  const done=document.createElement('button');done.type='button';done.textContent=close;done.onclick=()=>dialog.close();
  const render=()=>{grid.replaceChildren();for(const option of select.options){if(option.disabled||!option.textContent.toLocaleLowerCase().includes(input.value.toLocaleLowerCase()))continue;const pick=document.createElement('button');pick.type='button';pick.textContent=option.textContent;pick.setAttribute('aria-pressed',String(option.selected));pick.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));paint();dialog.close()};grid.append(pick)}};
  input.oninput=render;dialog.append(heading,input,grid,done);root.append(dialog);render();dialog.showModal();dialog.addEventListener('close',()=>{dialog.remove();button.focus()},{once:true});
 };
 paint();
}
