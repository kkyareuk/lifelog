import assert from 'node:assert/strict';
import {advanceSharedLife} from '../server-life.mjs';
const now=Date.now(),profile={name:'Reader',ageGroup:'성인',wake:'00:00',sleep:'23:59',createdAt:1,lifeNeeds:{hunger:80,sleep:90,updatedAt:now}};
let snapshot={group:{id:'g',towns:[{id:'t',name:'Town',places:[{id:'l',name:'Library',type:'도서관'}]}]},residents:[{id:'a',ownerUid:'u',townId:'t',name:'Reader',sharedHomeId:'h',profileJson:JSON.stringify(profile),scheduleJson:'{}'}],homes:[{id:'h',ownerUid:'u',townId:'t',layoutJson:JSON.stringify({rooms:{study:{type:'study',furniturePlacements:[{id:'b',item:'책장'}]},kitchen:{type:'kitchen',furniturePlacements:[{id:'f',item:'냉장고'}]}}})}],catalog:[]};
function command(cmd,time=now){let rows=advanceSharedLife(snapshot,time,cmd);snapshot.residents[0].lifeJson=rows[0].lifeJson;return JSON.parse(rows[0].lifeJson)}
let life=command({kind:'library',characterId:'a',bookId:'library-mystery',action:'borrow'});assert.equal(life.library.loans.length,1);
life=command({kind:'library',characterId:'a',bookId:'library-mystery',action:'read'});assert.equal(life.library.active.bookId,'library-mystery');assert.match(life.scene.title,/닫힌 방/);
life=command({kind:'library',characterId:'a',bookId:'library-mystery',action:'return'});assert(life.library.loans[0].returnedAt);assert(!life.library.active);
life.cooking={dishes:[{id:'meal',recipeId:'kimchi_jjigae',homeId:'h',room:'kitchen',storage:'fridge',createdAt:now,updatedAt:now,remaining:64800000}],inventory:{}};life.lifeNeeds={hunger:0,sleep:90,updatedAt:now};snapshot.residents[0].lifeJson=JSON.stringify(life);
life=command({kind:'food',characterId:'a',dishId:'meal',action:'eat'});assert.equal(life.household.active.action,'eat');assert.equal(life.cooking.dishes.length,0);assert.equal(life.scene.activityEndsAt,now+30000);
console.log('PASS staged shared engine loan/read/return, food reservation, timed meal, serialized state');
