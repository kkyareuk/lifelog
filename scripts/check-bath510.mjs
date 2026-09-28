import assert from 'node:assert/strict';
import {bathPairKind} from '../bath-permissions.js';
import {contextDestination} from '../context-actions.js';
import {jobLogDuty} from '../job-log-runtime.js';
import {isSurface,snapToSurface} from '../furniture-surfaces.js';
const a={id:'a',ageGroup:'성인'},b={id:'b',ageGroup:'청년'},w={characters:{a,b},relationships:{r:{a:'a',b:'b',type:'부부'}},characterViews:{}};
assert.equal(bathPairKind(w,a,b),'adults');
w.characterViews.b={a:{touchIntensity:'포옹·기대기까지'}};assert.equal(bathPairKind(w,a,b),'');
w.relationships={};w.characterViews={a:{b:{touchIntensity:'성인 간 친밀한 접촉까지'}},b:{a:{touchIntensity:'성인 간 친밀한 접촉까지'}}};assert.equal(bathPairKind(w,a,b),'adults');
b.ageGroup='청소년';assert.equal(bathPairKind(w,a,b),'');b.ageGroup='어린이';assert.equal(bathPairKind(w,a,b),'');
w.relationships={r:{a:'a',b:'b',type:'부모·자녀',parentId:'a'}};assert.equal(bathPairKind(w,a,b),'family');assert.equal(bathPairKind(w,b,a),'family');
w.relationships.r.temporalStatus='past';assert.equal(bathPairKind(w,a,b),'');delete w.relationships.r.temporalStatus;
b.ageGroup='청소년';assert.equal(bathPairKind(w,a,b),'');b.ageGroup='성인';w.characterViews={};w.relationships.r.type='부부';
const tub={id:'tub',item:'욕조',x:50,y:50};w.homes={h:{id:'h',rooms:{bath:{type:'bath',furniturePlacements:[tub]}}}};
const now=Date.now(),target={type:'furniture',homeId:'h',room:'bath',id:'tub'};a.homeId=b.homeId='h';
w.characterDirectives={b:{lifeTask:'bath',homeId:'h',room:'bath',furniture:tub,endsAt:now+1000}};
assert(contextDestination(w,a,target,'wash',now,'bath'));
w.characterViews.b={a:{touchIntensity:'신체 접촉 없음'}};assert.equal(contextDestination(w,a,target,'wash',now,'bath'),null);
w.characterViews={};w.characterDirectives.c={...w.characterDirectives.b};assert.equal(contextDestination(w,a,target,'wash',now,'bath'),null);
const pirate={id:'pirate',job:'해적'};let navigation=false;
for(const lang of ['ko','en','ja'])for(let minute=540;minute<1080;minute++){
 const date=new Date(2026,8,28,0,minute),home=jobLogDuty(pirate,date,540,1080,lang,'',{home:true});
 assert(home.jobLogId.startsWith('pirate:home:'));assert(home.localizedCopy[lang].title);assert(home.jobLogEndsAt>date.getTime());
 if(jobLogDuty(pirate,date,540,1080,'ko','',{home:false}).title.includes('별로 위치'))navigation=true;
}
assert(navigation,'outdoor navigation retained');
for(const rotation of [0,90,180,270]){const desk={id:'desk',item:'책상',rotation};assert(isSurface(desk));assert(snapToSurface({x:50,y:40},{id:'pc',item:'컴퓨터'},[{placement:desk,box:{left:0,top:0,width:100,height:100}}],[]));}
console.log('PASS 510: two-way adult boundaries, parent/child exception, teen/stranger/past/third-person denial, all-day localized home pirate duties, outdoor navigation, four desk directions');
