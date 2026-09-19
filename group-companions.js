import {GROUP_ACTIVITY_KINDS} from './group-activity.js';
export function companionPicker(host,world,actorId,firstId,kind){
 if(!GROUP_ACTIVITY_KINDS.includes(kind))return ()=>[];
 const lang=world.uiLanguage||'ko',field=document.createElement('fieldset'),legend=document.createElement('legend');
 field.className='group-companions';legend.textContent=({ko:'함께할 사람 더 고르기 (최대 6명)',en:'Invite more companions (up to 6)',ja:'一緒に過ごす人を追加（最大6人）'})[lang]||'함께할 사람 더 고르기 (최대 6명)';field.append(legend);
 for(const c of Object.values(world.characters||{})){
  if(c.id===actorId||c.id===firstId||c.townId!==world.characters[actorId]?.townId)continue;
  const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=c.id;label.append(input,document.createTextNode(c.name));field.append(label);
 }
 if(field.children.length>1)host.append(field);
 field.addEventListener('change',()=>{const full=field.querySelectorAll('input:checked').length>=6;for(const input of field.querySelectorAll('input'))input.disabled=full&&!input.checked});
 return ()=>[...field.querySelectorAll('input:checked')].map(x=>x.value);
}
