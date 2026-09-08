const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cache=new Map();
window.addEventListener('drawer-village-mail-targets-changed',()=>cache.clear());
export function bindMailRecipients(form,s,mt,onChange,initial=''){
 const kind=form.elements.recipientKind,target=form.elements.targetId,groups=s.groups||[],characters=[...target.options].filter(o=>!o.value.startsWith('user:')&&o.value!=='announcement').map(o=>({value:o.value,text:o.textContent}));
 const options=rows=>rows.map(o=>`<option value="${esc(o.value)}">${esc(o.text)}</option>`).join('');
 kind.innerHTML=options([{value:'character',text:mt('캐릭터 선택','Choose a character','キャラクターを選ぶ')},{value:'user',text:mt('유저 선택','Choose a user','ユーザーを選ぶ')},...groups.map(g=>({value:'group:'+g.id,text:g.name}))]);
 const uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 const directory=async g=>{const key=uid+':'+g.id,old=cache.get(key);if(old&&Date.now()-old.at<300000)return old.data;const data=await window.DrawerVillageGroups.readMailTargets({groupId:g.id});cache.set(key,{at:Date.now(),data});return data};
 let generation=0;
 kind.onchange=async()=>{
  const current=++generation;target.disabled=true;target.innerHTML=options([{value:'',text:mt('불러오는 중…','Loading…','読み込み中…')}]);onChange();
  try{
   let rows=characters;
   if(kind.value==='user'){
    const all=await Promise.all(groups.map(async g=>({g,data:await directory(g)}))),seen=new Set();rows=[];
    for(const {g,data} of all)for(const m of data.members)if(m.uid!==uid&&!seen.has(m.uid)){seen.add(m.uid);rows.push({value:`user:${g.id}:${m.uid}`,text:m.displayName||mt('구성원','Member','メンバー')})}
   }else if(kind.value.startsWith('group:')){
    const g=groups.find(g=>'group:'+g.id===kind.value),data=await directory(g);
    rows=[{value:'announcement',text:mt('전체 구성원에게 공지','All members','全メンバーにお知らせ')},...['owner','manager','operator','member'].map((role,i)=>({value:'role:'+role,text:mt(['방장에게','관리자에게','운영자에게','일반 멤버에게'][i],['Hosts','Managers','Operators','Members'][i],['ホスト宛','管理者宛','運営者宛','一般メンバー宛'][i])})),...data.memberGroups.map(g=>({value:'subgroup:'+g.id,text:mt(g.name+'에게',g.name+' members',g.name+'宛')}))];
   }
   if(current!==generation||!form.isConnected)return;
   target.innerHTML=options(rows.length?rows:[{value:'',text:mt('받을 대상이 없어요','No recipients','宛先がありません')}]);target.disabled=!rows.length;onChange();
  }catch(error){if(current===generation){target.innerHTML=options([{value:'',text:mt('대상을 불러오지 못했어요. 다시 선택해 주세요.','Could not load recipients. Select again.','宛先を読み込めませんでした。選び直してください。')}]);onChange()}}
 };
 if(initial==='announcement'&&s.activeGroupId)kind.value='group:'+s.activeGroupId;
 else kind.value=initial.startsWith('user:')?'user':'character';
 void kind.onchange();
}
