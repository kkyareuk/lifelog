import assert from 'node:assert/strict';
import {advanceSharedLife} from '../server-life.mjs';
const g=await import('../state.js?v=20260909dev305');const id=g.createCharacter(),profile=structuredClone(g.state.characters[id]),home=structuredClone(g.state.homes[profile.homeId]);
const realNow=Date.now;let clock=realNow();Date.now=()=>clock;
const initial={group:{id:'qa',towns:[{id:'town',name:'QA',places:[]}]},residents:[{id:'r',sourceCharacterId:id,ownerUid:'u',name:'QA',townId:'town',sharedHomeId:'h',profileJson:JSON.stringify({...profile,createdAt:1,lifeNeeds:{sleep:20,hunger:20,toilet:20,hygiene:20,social:80,updatedAt:clock}}),scheduleJson:'{}'}],homes:[{id:'h',ownerUid:'u',townId:'town',layoutJson:JSON.stringify(home)}]};
try{
 for(const [kind,task,key] of [['wash','toilet','toilet']]){
  let snapshot=structuredClone(initial);const run=command=>{const out=advanceSharedLife(snapshot,clock,command);snapshot.residents[0].lifeJson=out[0].lifeJson;return JSON.parse(out[0].lifeJson)};
  let life=run({characterId:'r',kind,lifeTask:task});clock=Math.max(clock,life.directive.journey.arrivesAt)+1000;life=run();const before=life.lifeNeeds[key];const episode=life.toiletEpisode;assert(episode);assert(episode.end-episode.start>=7000&&episode.end-episode.start<=15000);clock+=2000;life=run();assert.deepEqual(life.toiletEpisode,episode);clock=episode.end;life=run();assert.ok(life.lifeNeeds[key]>before,JSON.stringify({kind,before,after:life.lifeNeeds}));
 }
 console.log('PASS shared toilet persisted clock and realtime recovery across requests.');
}finally{Date.now=realNow}
