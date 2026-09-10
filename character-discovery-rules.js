import {recordFormPatch} from './discovery-records.js?v=20260909dev305';
import {PROFILE_FIELDS,profileValue} from './discovery-profile.js?v=20260909dev305';
import {DISCOVERY_TRAITS} from './discovery-traits.js?v=20260909dev305';
import {DISCOVERY_EVENTS} from './discovery-events.js?v=20260909dev305';
export const DISCOVERY_SCENES=DISCOVERY_EVENTS;
const numeric={socialStyle:'socialEnergy',perceptionStyle:'sensingIntuition',decisionStyle:'thinkingFeeling',planningStyle:'perceivingJudging'};
export const DISCOVERY_AXES=Object.fromEntries(Object.entries(DISCOVERY_TRAITS).map(([field,axis])=>[field,{...axis,numeric:numeric[field]}]));
export const DISCOVERY_FIELDS=[...Object.keys(DISCOVERY_AXES),...PROFILE_FIELDS];
const clamp=v=>Math.max(0,Math.min(100,v));
const ORIGINAL_FIELDS=new Set(['socialStyle','neatness','energyRhythm','perceptionStyle','planningStyle','decisionStyle','interference']);
export const discoveryLocked=(c,field)=>c.discovery?.locks?.[field]??!(c.discovery?.version>=2||c.discovery?.version===1&&ORIGINAL_FIELDS.has(field));
export function discoveryScore(c,field){const axis=DISCOVERY_AXES[field],saved=c.discovery?.scores?.[field];if(Number.isFinite(saved))return clamp(saved);const i=axis.values.indexOf(c[field]);if(i>=0)return i/(axis.values.length-1)*100;if(field==='aggressionLevel'&&!c[field])return 0;return axis.numeric&&Number.isFinite(c[axis.numeric])?clamp(c[axis.numeric]/6*100):50;}
export function manualDiscoveryPatch(c,patch){
 const profileLocks={};for(const field of PROFILE_FIELDS){const root=field.split('.')[0];if(Object.hasOwn(patch,root)&&JSON.stringify(profileValue(c,field))!==JSON.stringify(profileValue({...c,...patch},field)))profileLocks[field]=true;}
 if(Object.keys(profileLocks).length)patch={...patch,discovery:{...c.discovery,...patch.discovery,locks:{...c.discovery?.locks,...patch.discovery?.locks,...profileLocks}}};
 const aliases=Object.fromEntries(Object.entries(numeric).map(([f,n])=>[n,f])),fields=Object.keys(patch).filter(k=>JSON.stringify(patch[k])!==JSON.stringify(c[k])).map(k=>aliases[k]||k).filter(k=>Object.hasOwn(DISCOVERY_AXES,k));if(!fields.length)return patch;
 const scores={...c.discovery?.scores},affinities={...c.discovery?.affinities},result={...patch};
 for(const field of fields){const axis=DISCOVERY_AXES[field];let score;
 if(axis.numeric&&Object.hasOwn(patch,axis.numeric)){score=clamp(Number(patch[axis.numeric])/6*100);result[field]=axis.values[Math.round(score/100*(axis.values.length-1))];}
 else{const i=axis.values.indexOf(patch[field]);score=i<0?50:i/(axis.values.length-1)*100;if(axis.numeric)result[axis.numeric]=Math.round(score/100*6);}
 scores[field]=score;delete affinities[field];}
 return {...result,discovery:{...c.discovery,version:c.discovery?.version||0,scores,affinities,locks:{...c.discovery?.locks,...profileLocks,...Object.fromEntries(fields.map(f=>[f,true]))}}};
}
export function discoveryAnswered(c){return [...new Set([...(c.discovery?.answered||[]),...(c.discovery?.recent||[])])];}
export function discoveryEligible(c,q){
 if(discoveryAnswered(c).includes(q.id))return false;
 if(q.fields&&q.fields.every(f=>discoveryLocked(c,f)))return false;
 if(['height','weight','medications','hospital'].includes(q.form)&&q.fields.some(f=>c.discovery?.known?.[f]))return false;
 if(q.field&&(discoveryLocked(c,q.field)||c.discovery?.known?.[q.field]&&q.field!=='bodyProfile.tattoos'))return false;
 if(q.requires?.tattoo&&!c.bodyProfile?.tattoos?.length)return false;
 if(q.requires?.answered&&!discoveryAnswered(c).includes(q.requires.answered))return false;
 if(q.requires?.known&&(!profileValue(c,q.requires.known)||profileValue(c,q.requires.known)==='설정하지 않음'))return false;
 return true;
}
export function discoveryChoices(c,q,random=Math.random){
 const available=q.choices.map((choice,index)=>({choice,index})).filter(({choice})=>(!choice.tattoo||!discoveryLocked(c,'bodyProfile.tattoos'))&&(!choice.preference||!discoveryLocked(c,'attractionTraits')&&!discoveryLocked(c,'dislikedAttractionTraits')));
 for(let i=available.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[available[i],available[j]]=[available[j],available[i]];}
 if(q.choices.length===8&&available.filter(o=>o.choice.stance).length>=2&&available.filter(o=>!o.choice.stance).length>=3){const mixed=[...available.filter(o=>o.choice.stance).slice(0,2),...available.filter(o=>!o.choice.stance).slice(0,3)];for(let i=mixed.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[mixed[i],mixed[j]]=[mixed[j],mixed[i]];}return mixed;}
 return available.slice(0,5);
}
export function discoveryCandidates(c,scene){
 if(!scene||scene.sceneUnavailable||scene.remote||/수면|잠을 자|자는 중|sleeping|asleep|睡眠|眠って/.test([scene.title,scene.kind].join(' ')))return [];

 return DISCOVERY_EVENTS.filter(q=>discoveryEligible(c,q)&&(q.form||q.field||q.choices.some(o=>(o.tattoo&&!discoveryLocked(c,'bodyProfile.tattoos'))||(o.preference&&!discoveryLocked(c,'attractionTraits')&&!discoveryLocked(c,'dislikedAttractionTraits'))||Object.keys(o.effects).some(f=>!discoveryLocked(c,f)))));
}
export function discoveryAnswer(c,q,index,now=Date.now(),selectedValue){
 if(!discoveryEligible(c,q)||!DISCOVERY_EVENTS.includes(q)||!Number.isInteger(index)||!q.choices[index])return null;
 const choice=q.choices[index];if(choice.tattoo&&discoveryLocked(c,'bodyProfile.tattoos'))return null;
 const patch={},known={...c.discovery?.known},scores={...c.discovery?.scores},affinities={...c.discovery?.affinities};
 for(const [field,effect] of Object.entries(q.choices[index].effects)){
  if(discoveryLocked(c,field))continue;const axis=DISCOVERY_AXES[field];
  if(typeof effect==='number'){const score=clamp(discoveryScore(c,field)+effect);scores[field]=score;patch[field]=axis.values[Math.round(score/100*(axis.values.length-1))];if(axis.numeric)patch[axis.numeric]=Math.round(score/100*6);}
  else{const current=axis.values.indexOf(c[field]),old=affinities[field]||axis.values.map((_,i)=>i===current?5:0);const values=axis.values.map((_,i)=>Math.max(0,Math.min(20,(old[i]||0)+(i===effect.toward?effect.weight:-.15))));affinities[field]=values;let winner=current<0?effect.toward:current;for(let i=0;i<values.length;i++)if(values[i]>values[winner])winner=i;patch[field]=axis.values[winner];delete scores[field];}
 }
 if(choice.preference){if(discoveryLocked(c,'attractionTraits')||discoveryLocked(c,'dislikedAttractionTraits'))return null;const opposite=choice.preference==='attractionTraits'?'dislikedAttractionTraits':'attractionTraits';patch[choice.preference]=[...new Set([...(c[choice.preference]||[]),'문신이 있음'])];patch[opposite]=(c[opposite]||[]).filter(v=>v!=='문신이 있음');}
 if(q.form){const values=recordFormPatch(c,q.form,selectedValue,discoveryLocked);if(values===null)return null;Object.assign(patch,values);for(const key of [...Object.keys(selectedValue.values||{}),...Object.keys(selectedValue.records||{})]){const f='bodyProfile.'+key;if(!discoveryLocked(c,f))known[f]=true;}}
 if(q.field){
  if(!q.options.some(o=>o.value===selectedValue))return null;
  if(q.field==='bodyProfile.tattoos'){
   if(!c.bodyProfile?.tattoos?.length)return null;
   const marks=c.bodyProfile.tattoos.map(m=>({...m}));const target=c.discovery?.tattooIndex??0;if(!marks[target])return null;
   marks[target][q.id==='profile-tattoo-design'?'type':'location']=selectedValue;
   patch.bodyProfile={...c.bodyProfile,tattoos:marks};
  }else if(q.field.startsWith('bodyProfile.')){
   const body=structuredClone(c.bodyProfile||{}),keys=q.field.split('.').slice(1);let node=body;for(const k of keys.slice(0,-1))node=node[k]??={};node[keys.at(-1)]=selectedValue;patch.bodyProfile=body;
  }else patch[q.field]=selectedValue;
  known[q.field]=true;
 }
 let tattooIndex=c.discovery?.tattooIndex;
 if(choice.tattoo){
  const marks=(c.bodyProfile?.tattoos||[]).map(m=>({...m}));
  tattooIndex=0;if(!marks.length)marks.push({name:'문신 1',location:'기타 위치',type:'설정하지 않음',attitude:choice.tattoo});else marks[0].attitude=choice.tattoo;
  patch.bodyProfile={...c.bodyProfile,tattoos:marks};known['bodyProfile.tattoos']=true;
 }
 if(!Object.keys(patch).length&&!q.form)return null;
 patch.discovery={...c.discovery,version:c.discovery?.version||0,scores,affinities,known,tattooIndex,answered:[...discoveryAnswered(c),q.id],lastPromptAt:now,recent:[...(c.discovery?.recent||[]).filter(id=>id!==q.id),q.id].slice(-6),answerCount:(c.discovery?.answerCount||0)+1};return patch;
}
export function createDiscoverySession(random=Math.random){
 let seen=new Map(),nextAt=0,startupPending=true;
 return {reset(){seen.clear();},offer(c,scene,{now=Date.now(),blocked=false}={}){
  if(!c||!scene||blocked)return null;
  const key=[new Date(now).toDateString(),scene.minute,scene.interactionId,scene.title].join('|'),previous=seen.get(c.id);
  seen.set(c.id,key);if(seen.size>100)seen.delete(seen.keys().next().value);
  const choices=discoveryCandidates(c,scene);
  if(!choices.length)return null;
  if(startupPending){startupPending=false;nextAt=now+180000+random()*300000;return choices[Math.floor(random()*choices.length)]||null;}
  if(previous===undefined||previous===key||now<nextAt||now-Number(c.discovery?.lastPromptAt||0)<180000||random()>.35)return null;
  nextAt=now+180000+random()*300000;return choices[Math.floor(random()*choices.length)]||null;
 }};
}
