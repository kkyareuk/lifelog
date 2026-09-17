// Standing conversations use artwork widths, not a fixed room-edge margin.
// Seated partners and movement retain their existing furniture/path anchors.
export function positionConversationPartners(labels){
 const groups=new Map();
 for(const label of labels){
  const id=label.status.dataset.interactionId,p=label.person;
  if(!id||!p?.matches('.home-person')||p.dataset.seatId||p.dataset.coupleBedId||p.matches('.home-life-walking,.is-approaching-conversation,.is-hugging,.is-affection'))continue;
  let room=groups.get(label.scene);if(!room)groups.set(label.scene,room=new Map());
  const peers=room.get(id)||[];peers.push(p);room.set(id,peers);
 }
 for(const [scene,room] of groups)for(const peers of room.values()){
  if(peers.length!==2)continue;
  peers.sort((a,b)=>Number(a.classList.contains('conversation-slot-2'))-Number(b.classList.contains('conversation-slot-2'))||(a.dataset.characterId||'').localeCompare(b.dataset.characterId||''));
  const rect=scene.getBoundingClientRect(),visuals=peers.map(p=>p.querySelector('.home-person-visual'));
  if(visuals.some(v=>!v)||rect.width<24)continue;
  const widths=visuals.map(v=>v.getBoundingClientRect().width/(parseFloat(v.style.scale)||1)),gap=8,total=widths[0]+widths[1]+gap;
  const scale=Math.min(1,(rect.width-12)/total),span=total*scale;
  const center=peers.reduce((n,p)=>n+(parseFloat(p.style.getPropertyValue('--life-x'))||50),0)/2;
  const x=Math.max(rect.left+6+span/2,Math.min(rect.right-6-span/2,rect.left+rect.width*center/100));
  const y=peers.reduce((n,p)=>n+(parseFloat(p.style.getPropertyValue('--life-y'))||50),0)/2;
  peers.forEach((p,i)=>{
   const parent=p.offsetParent?.getBoundingClientRect()||rect;
   p.style.left=(x-span/2+(i?widths[0]*scale+gap*scale:0)+widths[i]*scale/2-parent.left)/parent.width*100+'%';
   p.style.top=y+'%';visuals[i].style.scale=String(scale);visuals[i].style.transformOrigin='50% 100%';
  });
 }
}
