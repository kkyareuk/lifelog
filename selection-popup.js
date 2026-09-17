import {playSelectionSound} from './interaction-feedback.js';
const text=()=>({ko:['선택하기','검색','닫기','일치하는 항목이 없어요.'],en:['Choose an option','Search','Close','No matching options.'],ja:['選択する','検索','閉じる','該当する項目がありません。']}[window.ParallelCity?.getInteractionSettings?.()?.uiLanguage]||['선택하기','검색','닫기','일치하는 항목이 없어요.']);
let current=null;
export function openSelectionPopup(select){
 if(current||!select.isConnected||select.disabled||select.multiple||select.size>1||select.dataset.nativeSelect!==undefined)return;
 const copy=text(),dialog=document.createElement('dialog');current=dialog;dialog.className='selection-popup';
 const heading=document.createElement('h2'),label=select.labels?.[0];
 heading.id='selection-popup-title';heading.textContent=select.getAttribute('aria-label')||label?.querySelector('b,.field-title')?.textContent||[...(label?.childNodes||[])].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim()||copy[0];dialog.setAttribute('aria-labelledby',heading.id);
 const header=document.createElement('header'),close=document.createElement('button');close.type='button';close.textContent=copy[2];close.onclick=()=>{current=null;dialog.close()};header.append(heading,close);dialog.append(header);
 const search=document.createElement('input');search.type='search';search.placeholder=copy[1];search.setAttribute('aria-label',copy[1]);if(select.options.length>8)dialog.append(search);
 const list=document.createElement('div');list.className='selection-popup-options';const empty=document.createElement('p');empty.textContent=copy[3];empty.hidden=true;
 const rows=[];
 for(const option of select.options){if(option.hidden)continue;const button=document.createElement('button');button.type='button';button.textContent=(option.parentElement.tagName==='OPTGROUP'?option.parentElement.label+' · ':'')+option.text;button.disabled=option.disabled||option.parentElement.disabled===true;button.setAttribute('aria-pressed',String(option.selected));rows.push(button);button.onclick=()=>{
  if(!select.isConnected||select.disabled||!option.isConnected||option.disabled)return dialog.close();
  const changed=select.selectedIndex!==option.index;select.selectedIndex=option.index;current=null;dialog.close();dialog.remove();
  if(changed){select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));}
 };list.append(button);}
 search.oninput=()=>{let visible=0;for(const b of rows){b.hidden=!b.textContent.toLocaleLowerCase().includes(search.value.toLocaleLowerCase());if(!b.hidden)visible++;}empty.hidden=visible>0};dialog.append(list,empty);
 dialog.onclose=()=>{if(current===dialog)current=null;dialog.remove();if(select.isConnected&&!document.querySelector('dialog[open]'))select.focus({preventScroll:true});};
 document.body.append(dialog);dialog.showModal();(list.querySelector('[aria-pressed="true"]:not(:disabled)')||close).focus();playSelectionSound();
}
const eligible=target=>target?.closest?.('select:not([multiple]):not([data-native-select])');
// Open after release; consume only the compatibility click from that gesture.
// Opening on pointerdown can retarget release to an option in the new dialog.
let gesture=null,suppressClick=false;
document.addEventListener('pointerdown',e=>{
 suppressClick=false;gesture=null;const select=eligible(e.target);
 if(select&&!select.disabled&&select.size<=1&&e.button===0){e.preventDefault();e.stopImmediatePropagation();gesture={select,id:e.pointerId,x:e.clientX,y:e.clientY}}
},true);
document.addEventListener('pointerup',e=>{
 if(!gesture||e.pointerId!==gesture.id)return;
 const g=gesture;gesture=null;e.preventDefault();e.stopImmediatePropagation();suppressClick=true;
 if(Math.hypot(e.clientX-g.x,e.clientY-g.y)<12)openSelectionPopup(g.select);
},true);
document.addEventListener('pointercancel',()=>{gesture=null;suppressClick=false},true);
document.addEventListener('click',e=>{
 if(suppressClick){suppressClick=false;e.preventDefault();e.stopImmediatePropagation();return}
 const select=eligible(e.target);if(select&&!select.disabled&&select.size<=1){e.preventDefault();e.stopImmediatePropagation();openSelectionPopup(select)}
},true);
document.addEventListener('keydown',e=>{suppressClick=false;const select=eligible(e.target);if(select&&!select.disabled&&select.size<=1&&['Enter',' ','ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();openSelectionPopup(select)}},true);
