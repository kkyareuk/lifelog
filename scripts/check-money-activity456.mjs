import assert from 'node:assert/strict';
import '../server-life.mjs';
import {state,createCharacter,directCharacterActivity} from '../state.js?v=20260909dev305';
import {eventFor} from '../simulation.js?v=20260909dev305';
import {ensureWallet} from '../character-money.js';
const realNow=Date.now;let now=+new Date(2026,8,21,10);Date.now=()=>now;
try{
 const id=createCharacter(),c=state.characters[id];c.job='회사원';c.workplaceId=state.world.places.find(p=>p.type==='사무실').id;c.wake='07:00';c.sleep='23:00';ensureWallet(c,now);
 assert(directCharacterActivity(id,'work',{now}));
 const directive=state.characterDirectives[id];now=directive.journey.arrivesAt+1000;eventFor(c,new Date(now));assert(c.wallet.work,'actual work scene starts a shift');const before=c.wallet.balance;
 now=directive.endsAt+1000;eventFor(c,new Date(now));assert.equal(c.wallet.balance,before+100000,'completed work pays once');eventFor(c,new Date(now));assert.equal(c.wallet.balance,before+100000);
 const cafe=state.world.places.find(p=>p.type==='카페');c.wallet.balance=0;
 assert.equal(directCharacterActivity(id,'rest',{now,lifeTask:'cafe_favorite',contextTarget:{type:'place',id:cafe.id}}),false,'paid activity blocked without money');
 c.wallet.balance=500000;assert(directCharacterActivity(id,'rest',{now,lifeTask:'cafe_favorite',contextTarget:{type:'place',id:cafe.id}}));assert.equal(c.wallet.balance,495000);
 console.log('PASS real activity flow: completed shift credited once, zero-balance cafe blocked, drink charged');
}finally{Date.now=realNow}
