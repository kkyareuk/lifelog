import {isFamily} from './relationship-roles.js?v=20260909dev305';
import {effectiveSpeechStyle,characterContactSpeech} from './speech-styles.js?v=20260909dev305';
import {REVIEWED_LETTERS,reviewedStyle} from './speech-reviewed.js';
import {relationshipPolicy} from './life-needs.js';
import {relationMetrics} from './relationship-metrics.js';
import {isAdultAge} from './age-groups.js?v=20260909dev305';
import {relationshipLetterCopy} from './speech-reviewed.js';
const pair=(a,b)=>[a,b].sort().join('~');
const current=(w,a,b)=>Object.values(w.relationships||{}).find(r=>r.temporalStatus!=='past'&&pair(r.a,r.b)===pair(a,b));
const family=r=>isFamily(r?.type);
const romantic=new Set(['교제','약혼','결혼','재결합']);
export const RELATION_LETTER_KINDS=['친구','단짝','교제','동거','약혼','결혼','동거해소','결별','이혼','절교','절연','화해','재결합','거리두기','라이벌','가족 맞이'];
export function relationshipLetterCandidate(w,a,b){
 const x=w.characters[a],y=w.characters[b];if(!x||!y||a===b||w.sharedContext||relationshipPolicy([x,y])!=='dynamic')return '';
 const r=current(w,a,b),m=relationMetrics(w,a,b),adult=isAdultAge(x.ageGroup)&&isAdultAge(y.ageGroup),past=Object.values(w.relationships||{}).find(r=>r.temporalStatus==='past'&&pair(r.a,r.b)===pair(a,b));
 if(r&&m.tension>=75&&m.trust<=25)return r.cohabit?'동거해소':r.type==='부부'?'이혼':r.type==='연인'?'결별':family(r)?'절연':'절교';
 if(r&&m.tension>=55&&r.stage!=='잠시 거리두기')return '거리두기';
 if(r?.stage==='잠시 거리두기'&&m.tension<=20&&m.trust>=35)return '화해';
 if(!r&&adult&&past&&/연인|부부/.test(past.type)&&m.affection>=60&&m.trust>=45)return '재결합';
 if(!r)return m.closeness>=4?'친구':'';
 if(adult&&!family(r)&&m.affection>=60&&m.trust>=40&&r.type==='친구')return '교제';
 if(r.type==='친구'&&m.closeness>=45&&m.trust>=55&&r.stage!=='단짝')return '단짝';
 if(adult&&r.type==='연인'&&m.affection>=80&&m.trust>=70&&r.stage!=='약혼')return '약혼';
 if(adult&&r.type==='연인'&&r.stage==='약혼'&&m.affection>=90&&m.trust>=85)return '결혼';
 return '';
}
export function queueRelationshipLetter(w,a,b,now=Date.now()){
 const kind=relationshipLetterCandidate(w,a,b);if(!kind)return false;
 const key=pair(a,b),record=w.relationshipDevelopment[key];if(!record)return false;
 const letters=record.letters||(record.letters=[]);
 if(letters.some(p=>p.status==='pending')||letters.some(p=>p.kind===kind&&now-(p.respondedAt||p.createdAt)<7*86400000))return false;
 const r=current(w,a,b);letters.push({id:'rel-'+key+'-'+now,a,b,kind,createdAt:now,status:'pending',relationId:r?.id||'',relationType:r?.type||'',relationStage:r?.stage||''});record.letters=letters.slice(-40);return true;
}
export function relationshipLetters(w){
 return Object.values(w.relationshipDevelopment||{}).flatMap(r=>r.letters||[]).filter(p=>w.characters[p.a]&&w.characters[p.b]);
}
export function respondRelationshipLetter(w,id,choice,now=Date.now()){
 const p=relationshipLetters(w).find(p=>p.id===id);if(!p||p.status!=='pending'||!['accept','later','decline'].includes(choice))return {ok:false};
 const a=w.characters[p.a],b=w.characters[p.b],r=current(w,p.a,p.b);
 if(choice==='later'){p.snoozedUntil=now+86400000;return {ok:true}}
 if(choice==='decline'){p.status='declined';p.respondedAt=now;return {ok:true}}
 if(relationshipPolicy([a,b])!=='dynamic')return {ok:false,reason:'locked'};
 if((r?.id||'')!==p.relationId||(r?.type||'')!==p.relationType||(r?.stage||'')!==p.relationStage){p.status='stale';p.respondedAt=now;return {ok:false,reason:'stale'}}
 if(romantic.has(p.kind)&&(!isAdultAge(a.ageGroup)||!isAdultAge(b.ageGroup)||Object.values(w.relationships||{}).some(edge=>pair(edge.a,edge.b)===pair(p.a,p.b)&&family(edge))))return {ok:false,reason:'unavailable'};
 // Consent to a proposal is separate from scores. No housing or legal records
 // are silently rewritten; those proposals open the existing relationship editor.
 if(['동거','동거해소','가족 맞이'].includes(p.kind))return {ok:false,reason:'editor'};
 const m=relationMetrics(w,p.a,p.b);
 if(romantic.has(p.kind)&&(m.affection<50||m.trust<30||m.tension>45))return {ok:false,reason:'unavailable'};
 let target=r;
 if(!target){const rid='letter-'+id;target={id:rid,a:p.a,b:p.b,type:'친구',stage:'아는 사이',temporalStatus:'current',cohabit:false,stayTogether:false,interactions:[],tags:[]};w.relationships[rid]=target}
 if(['결별','이혼','절교','절연'].includes(p.kind)){target.temporalStatus='past';target.endedAt=now;target.stayTogether=false;}
 else if(p.kind==='거리두기'){target.beforeDistanceStage=target.stage;target.stage='잠시 거리두기';target.stayTogether=false;}
 else if(p.kind==='화해'){target.stage=target.beforeDistanceStage||'아는 사이';delete target.beforeDistanceStage;}
 else if(p.kind==='단짝')target.stage='단짝';
 else if(['교제','재결합'].includes(p.kind)){target.type='연인';target.stage='교제 중';}
 else if(p.kind==='약혼')target.stage='약혼';
 else if(p.kind==='결혼'){target.type='부부';target.stage='결혼';target.legalRegistration='unregistered';}
 else if(p.kind==='라이벌'){target.type='라이벌';target.stage='경쟁 상대';}
 target.autoManagedStage=false;target.metrics={...m};target.intimacy=m.closeness;target.conflict=m.tension;
 p.status='accepted';p.respondedAt=now;return {ok:true,changed:true};
}
export function relationshipMailRows(w,now=Date.now()){
 const lang=w.uiLanguage||'ko';return relationshipLetters(w).filter(p=>!p.snoozedUntil||p.snoozedUntil<=now).map(p=>({...p,relationshipLetter:true,sourceId:p.a,sourceName:w.characters[p.a].name,subject:({ko:'관계에 관해 하고 싶은 말',en:'About our relationship',ja:'二人の関係について'})[lang],body:letterText(w.characters[p.a],p.kind,w.characters[p.b].name,lang),answered:p.status!=='pending'}));
}

function letterText(c,kind,target,lang){const style=effectiveSpeechStyle(c),copy=relationshipLetterCopy({...c,speechStyle:style},kind,target,lang);return lang==='ko'||REVIEWED_LETTERS[reviewedStyle(style)]||['인터넷소설 감성체','스타트업 업무체','과묵한 직설체','거칠고 상스러운 말투'].includes(style)?copy:characterContactSpeech({...c,speechStyle:style},copy,{language:lang})}
