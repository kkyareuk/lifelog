import assert from 'node:assert/strict';
import {advanceSharedLife} from '../server-life.mjs';
import {createCharacter,state} from '../state.js?v=20260909dev305';
const id=createCharacter(),profile=structuredClone(state.characters[id]),before=JSON.stringify(state),town={id:'t',name:'Town',places:[{id:'cafe',type:'cafe',name:'Cafe'},{id:'venue',type:'concert',name:'공연장'}]};
const snap={group:{id:'g',towns:[town]},residents:['a','b'].map(id=>({id,name:id,ownerUid:'u',townId:'t',sharedHomeId:'h',profileJson:JSON.stringify({...profile,id,ageGroup:'성인'})})),homes:[{id:'h',ownerUid:'u',townId:'t',layoutJson:JSON.stringify({rooms:{living:{name:'Living',type:'living',accessMode:'everyone',furniture:[],furniturePlacements:[{id:'audio',item:'오디오',x:50,y:50}]}}})}]};
const now=Date.now();
for(const lifeTask of ['cafe_favorite','cafe_new','venue_performance']){const place=lifeTask.startsWith('cafe')?'cafe':'venue',result=advanceSharedLife(snap,now,{characterId:'a',kind:'rest',lifeTask,contextTarget:{type:'place',id:place}});const life=JSON.parse(result.find(r=>r.id==='a').lifeJson);assert.equal(life.directive.placeId,place);assert.equal(life.directive.lifeTask,lifeTask)}
const together=advanceSharedLife(snap,now,{characterId:'a',kind:'hangout',targetId:'b',contextTarget:{type:'place',id:'cafe'}}).map(r=>JSON.parse(r.lifeJson).directive);assert(together.every(d=>d.placeId==='cafe'));assert.equal(together[0].journey.arrivesAt,together[1].journey.arrivesAt);
assert.throws(()=>advanceSharedLife(snap,now,{characterId:'a',kind:'rest',lifeTask:'cafe_new',contextTarget:{type:'place',id:'venue'}}),/activity-location-required/);
assert.equal(JSON.stringify(state),before);console.log('PASS431 shared: cafe/performance, companion arrival, inappropriate-place rejection, private state unchanged');
