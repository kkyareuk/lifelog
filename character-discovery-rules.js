import {DISCOVERY_TRAITS} from './discovery-traits.js?v=20260909dev305';
import {DISCOVERY_EVENTS} from './discovery-events.js?v=20260909dev305';
export const DISCOVERY_SCENES=DISCOVERY_EVENTS;
const numeric={socialStyle:'socialEnergy',perceptionStyle:'sensingIntuition',decisionStyle:'thinkingFeeling',planningStyle:'perceivingJudging'};
export const DISCOVERY_AXES=Object.fromEntries(Object.entries(DISCOVERY_TRAITS).map(([field,axis])=>[field,{...axis,numeric:numeric[field]}]));
export const DISCOVERY_FIELDS=Object.keys(DISCOVERY_AXES);
const clamp=v=>Math.max(0,Math.min(100,v));
const ORIGINAL_FIELDS=new Set(['socialStyle','neatness','energyRhythm','perceptionStyle','planningStyle','decisionStyle','interference']);
export const discoveryLocked=(c,field)=>c.discovery?.locks?.[field]??!(c.discovery?.version>=2||c.discovery?.version===1&&ORIGINAL_FIELDS.has(field));
export function discoveryScore(c,field){const axis=DISCOVERY_AXES[field],saved=c.discovery?.scores?.[field];if(Number.isFinite(saved))return clamp(saved);const i=axis.values.indexOf(c[field]);if(i>=0)return i/(axis.values.length-1)*100;return axis.numeric&&Number.isFinite(c[axis.numeric])?clamp(c[axis.numeric]/6*100):50;}
export function manualDiscoveryPatch(c,patch){
 const aliases=Object.fromEntries(Object.entries(numeric).map(([f,n])=>[n,f])),fields=Object.keys(patch).map(k=>aliases[k]||k).filter(k=>DISCOVERY_FIELDS.includes(k));if(!fields.length)return patch;
 const scores={...c.discovery?.scores},affinities={...c.discovery?.affinities},result={...patch};
 for(const field of fields){const axis=DISCOVERY_AXES[field];let score;
 if(axis.numeric&&Object.hasOwn(patch,axis.numeric)){score=clamp(Number(patch[axis.numeric])/6*100);result[field]=axis.values[Math.round(score/100*(axis.values.length-1))];}
 else{const i=axis.values.indexOf(patch[field]);score=i<0?50:i/(axis.values.length-1)*100;if(axis.numeric)result[axis.numeric]=Math.round(score/100*6);}
 scores[field]=score;delete affinities[field];}
 return {...result,discovery:{...c.discovery,version:c.discovery?.version||0,scores,affinities,locks:{...c.discovery?.locks,...Object.fromEntries(fields.map(f=>[f,true]))}}};
}
export function discoveryCandidates(c,scene){
 if(!scene||scene.sceneUnavailable||scene.remote||/수면|잠을 자|자는 중|sleeping|asleep|睡眠|眠って/.test([scene.title,scene.kind].join(' ')))return [];
 const recent=c.discovery?.recent||[];
 return DISCOVERY_EVENTS.filter(q=>!recent.includes(q.id)&&q.choices.some(o=>Object.keys(o.effects).some(f=>!discoveryLocked(c,f))));
}
export function discoveryAnswer(c,q,index,now=Date.now()){
 if(!DISCOVERY_EVENTS.includes(q)||!Number.isInteger(index)||!q.choices[index])return null;
 const patch={},scores={...c.discovery?.scores},affinities={...c.discovery?.affinities};
 for(const [field,effect] of Object.entries(q.choices[index].effects)){
  if(discoveryLocked(c,field))continue;const axis=DISCOVERY_AXES[field];
  if(typeof effect==='number'){const score=clamp(discoveryScore(c,field)+effect);scores[field]=score;patch[field]=axis.values[Math.round(score/100*(axis.values.length-1))];if(axis.numeric)patch[axis.numeric]=Math.round(score/100*6);}
  else{const current=axis.values.indexOf(c[field]),old=affinities[field]||axis.values.map((_,i)=>i===current?5:0);const values=axis.values.map((_,i)=>Math.max(0,Math.min(20,(old[i]||0)+(i===effect.toward?effect.weight:-.15))));affinities[field]=values;let winner=current<0?effect.toward:current;for(let i=0;i<values.length;i++)if(values[i]>values[winner])winner=i;patch[field]=axis.values[winner];delete scores[field];}
 }
 if(!Object.keys(patch).length)return null;
 patch.discovery={...c.discovery,version:c.discovery?.version||0,scores,affinities,lastPromptAt:now,recent:[...(c.discovery?.recent||[]).filter(id=>id!==q.id),q.id].slice(-6),answerCount:(c.discovery?.answerCount||0)+1};return patch;
}
export function createDiscoverySession(random=Math.random){let seen=new Map(),nextAt=0;return {reset(){seen.clear();nextAt=0;},offer(c,scene,{now=Date.now(),blocked=false}={}){const key=[new Date(now).toDateString(),scene?.minute,scene?.interactionId,scene?.title].join('|'),previous=seen.get(c.id);seen.set(c.id,key);if(seen.size>100)seen.delete(seen.keys().next().value);if(previous===undefined||previous===key||blocked||now<nextAt||now-Number(c.discovery?.lastPromptAt||0)<180000)return null;const choices=discoveryCandidates(c,scene);if(!choices.length||random()>.35)return null;nextAt=now+180000+random()*300000;return choices[Math.floor(random()*choices.length)]||null;}};}
