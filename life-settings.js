import {needsAt,NEEDS,needLabel} from './life-needs.js';
export function lifeSettingsFields(c,language='ko'){
 const tr=(ko,en,ja)=>({ko,en,ja}[language]||ko),root=document.createElement('section');root.className='life-settings-fields';
 const title=document.createElement('h3');title.textContent=tr('욕구','Needs','欲求');root.append(title);
 const help=document.createElement('p');help.textContent=tr('100이면 충분히 충족된 상태예요. 고정하면 현재 수치를 유지해요.','100 means fully satisfied. Freeze keeps the current values.','100は十分に満たされた状態です。固定すると現在の値を維持します。');root.append(help);
 const values=needsAt(c),grid=document.createElement('div');grid.className='life-needs-grid';
 for(const key of Object.keys(NEEDS)){const label=document.createElement('label'),meter=document.createElement('meter'),value=document.createElement('b');label.textContent=needLabel(key,language);meter.min=0;meter.max=100;meter.value=values[key];meter.setAttribute('aria-label',label.textContent);value.textContent=Math.round(values[key])+'/100';label.append(meter,value);grid.append(label)}root.append(grid);
 const row=document.createElement('label'),fixed=document.createElement('input');row.className='discovery-group-lock';fixed.type='checkbox';fixed.dataset.needsFixed='';fixed.checked=!!c.needsFixed;row.append(fixed,document.createTextNode(tr('욕구 고정','Freeze needs','欲求を固定')));root.append(row);
 return {root,patch:current=>({needsFixed:fixed.checked,lifeNeeds:{...current.lifeNeeds,...needsAt(current),updatedAt:Date.now()}})};
}
