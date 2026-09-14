import {needsAt,NEEDS,needLabel} from './life-needs.js';
export function lifeSettingsFields(c,language='ko'){
 const tr=(ko,en,ja)=>({ko,en,ja}[language]||ko),root=document.createElement('section');root.className='life-settings-fields';
 const title=document.createElement('h3');title.textContent=tr('욕구와 관계','Needs and relationships','欲求と関係');root.append(title);
 const help=document.createElement('p');help.textContent=tr('100이면 충분히 충족된 상태예요. 고정하면 현재 수치를 유지해요.','100 means fully satisfied. Freeze keeps the current values.','100は十分に満たされた状態です。固定すると現在の値を維持します。');root.append(help);
 const values=needsAt(c),grid=document.createElement('div');grid.className='life-needs-grid';
 for(const key of Object.keys(NEEDS)){const label=document.createElement('label'),meter=document.createElement('meter'),value=document.createElement('b');label.textContent=needLabel(key,language);meter.min=0;meter.max=100;meter.value=values[key];meter.setAttribute('aria-label',label.textContent);value.textContent=Math.round(values[key])+'/100';label.append(meter,value);grid.append(label)}root.append(grid);
 const row=document.createElement('label'),fixed=document.createElement('input');row.className='discovery-group-lock';fixed.type='checkbox';fixed.dataset.needsFixed='';fixed.checked=!!c.needsFixed;row.append(fixed,document.createTextNode(tr('욕구 고정','Freeze needs','欲求を固定')));root.append(row);
 const relation=document.createElement('label');relation.textContent=tr('이 캐릭터의 관계 변화','Relationship changes for this character','このキャラクターの関係変化');const select=document.createElement('select');select.dataset.relationshipChangeMode='';
 const options=[['fixed',tr('점수·관계 모두 고정','Freeze scores and relationships','スコア・関係をすべて固定')],['score',tr('점수만 변화 · 관계 고정','Change scores · freeze relationships','スコアのみ変化・関係は固定')],['dynamic',tr('점수 변화 · 관계는 우편으로 결정','Change scores · decide relationships by letter','スコアは変化・関係は手紙で決定')]];
 for(const [key,text] of options){const option=document.createElement('option');option.value=key;option.textContent=text;select.append(option)}select.value=c.relationshipChangeMode||'dynamic';relation.append(select);root.append(relation);
 const hint=document.createElement('small');hint.textContent=tr('상대가 고정한 경우에도 그 설정을 지켜요. 직접 편집은 가능해요.','A partner’s freeze setting is also respected. Manual editing remains available.','相手の固定設定も守ります。直接編集は可能です。');root.append(hint);
 return {root,patch:current=>({needsFixed:fixed.checked,lifeNeeds:{...current.lifeNeeds,...needsAt(current),updatedAt:Date.now()},relationshipChangeMode:select.value})};
}
