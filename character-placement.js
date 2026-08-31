export const PLACEMENTS=[['always-left','반드시 왼쪽에 배치','Always on the left','必ず左側に配置'],['prefer-left','되도록 왼쪽에 배치','Prefer the left','できるだけ左側に配置'],['random','무작위 배치','Random placement','ランダム配置'],['prefer-right','되도록 오른쪽에 배치','Prefer the right','できるだけ右側に配置'],['always-right','반드시 오른쪽에 배치','Always on the right','必ず右側に配置']];
export function characterPlacement(character,relationships={}){
  if(PLACEMENTS.some(([id])=>id===character?.animationPlacement))return character.animationPlacement;
  // Preserve earlier relationship preferences until this character chooses a value.
  const old=Object.values(relationships).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).find(r=>r.animationPlacement?.[character?.id]&&r.animationPlacement[character.id]!=='random');
  return old?.animationPlacement[character?.id]||'random';
}
export function orderAnimationCharacters(ids,characters,relationships={},seed=''){
  const unique=[...new Set(ids)].filter(id=>characters[id]),weights={'always-left':-20,'prefer-left':-10,random:0,'prefer-right':10,'always-right':20};
  const rank=id=>{let n=2166136261;for(const c of seed+id)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0};
  return unique.slice().sort((a,b)=>{const left=characterPlacement(characters[a],relationships),right=characterPlacement(characters[b],relationships);return weights[left]-weights[right]||(left==='random'&&right==='random'?rank(a)-rank(b):unique.indexOf(a)-unique.indexOf(b))});
}
