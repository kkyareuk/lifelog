export const RELATION_METRICS={closeness:['친밀도','Closeness','親密度'],affection:['애정도','Affection','愛情度'],trust:['신뢰','Trust','信頼'],comfort:['편안함','Comfort','安心感'],tension:['갈등도','Tension','葛藤度'],socialDistance:['사회적 거리 · 고정','Social distance · fixed','社会的距離・固定']};
const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
export function socialDistance(world,a,b){
 const pair=(world.courtPairs||[]).find(p=>p.members?.includes(a)&&p.members?.includes(b));
 if(Number.isInteger(pair?.distance))return clamp(pair.distance);
 const x=world.courtProfiles?.find(p=>p.id===a),y=world.courtProfiles?.find(p=>p.id===b);
 if(!x||!y)return 0;
 const rank={royal:3,noble:2,knight:1,official:1,mage:1,attendant:0};
 return clamp(Math.abs(rank[x.role]-rank[y.role])*15+(x.faction===y.faction?0:x.faction==='neutral'||y.faction==='neutral'?15:45));
}
export function relationMetrics(world,a,b){
 const key=[a,b].sort().join('~'),r=Object.values(world.relationships||{}).find(r=>r.temporalStatus!=='past'&&[r.a,r.b].includes(a)&&[r.a,r.b].includes(b));
 const saved=world.courtTheme==='court'&&world.characterViews?.[b]?.[a]?.courtMetrics||world.relationshipDevelopment?.[key]?.metrics||r?.metrics||{};
 const defaults={closeness:r?.intimacy??0,affection:/연인|부부/.test(r?.type||'')?60:0,trust:r?40:10,comfort:r?40:10,tension:r?.conflict??0};
 return Object.fromEntries(Object.keys(RELATION_METRICS).filter(k=>k!=='socialDistance'||world.courtTheme==='court').map(k=>[k,k==='socialDistance'?socialDistance(world,a,b):clamp(saved[k]??defaults[k])]));
}
export function changeRelationMetrics(values,kind='talk',points=1){
 const next={...values},negative=points<0||['argue','fight','insult','taunt'].includes(kind);
 const changes=negative?{closeness:-1,trust:-2,comfort:-2,tension:3}:['kiss','hug','affection','handhold','lean'].includes(kind)?{closeness:1,affection:2,comfort:1,tension:-1}:['comfort','compliment','gift'].includes(kind)?{closeness:1,affection:1,trust:2,comfort:2,tension:-1}:{closeness:1,trust:1,comfort:1,tension:-1};
 for(const [key,delta] of Object.entries(changes))next[key]=clamp((next[key]||0)+delta);return next;
}
