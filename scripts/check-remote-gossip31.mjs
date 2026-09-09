import assert from 'node:assert/strict';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260909dev305');

const {gossipReasons,dislikesPerson,automaticConversation}=await import('../automatic-activities.js?v=20260909dev305');
const sim=await import('../simulation.js?v=20260909dev305');
for(const kind of ['message','remote_checkin','phone_call']){
 game.resetAll();const a=game.createCharacter(),b=game.createCharacter(),s=game.state,now=Date.now();
 const sleeping={id:'sleep-test',kind:'nap',startedAt:now-1000,endsAt:now+600000};s.characterDirectives[b]=sleeping;
 const source={home:true,room:'living',visitHomeId:s.characters[a].homeId,townId:s.characters[a].townId};
 assert.equal(game.directCharacterActivity(a,kind,{targetId:b,now,scenes:{[a]:source}}),true);
 assert.equal(s.characterDirectives[b],sleeping,'recipient activity is untouched');
 assert.equal(s.characterDirectives[a].journey,undefined);
 const scene=sim.eventFor(s.characters[a],new Date(now+10));
 assert.equal(scene.groupInteraction,false);assert.deepEqual(scene.withIds,[]);assert.equal(scene.remote,true);assert.equal(scene.room,'living');
}
const subject={id:'subject',name:'젠할린',job:'무직',personalityTypes:['무심하고 독립적']};
const reasons=gossipReasons({overall:'매우 싫어함',trust:'전혀 믿지 않음'},subject);
assert.ok(reasons.some(r=>r[0].includes('믿기 어렵')));assert.ok(reasons.every(r=>!r[0].includes('무직')));
assert.deepEqual(gossipReasons({overall:'소중하게 여김',annoyance:'전혀 귀찮거나 성가시지 않음'},subject),[]);
const world={characters:{a:{id:'a'},b:{id:'b'},subject},characterViews:{a:{subject:{overall:'소중하게 여김'}}},relationships:{r:{a:'a',b:'subject',type:'원수'}}};
assert.equal(dislikesPerson(world,world.characters.a,subject),false,'explicit view overrides relationship fallback');
assert.notEqual(automaticConversation(world,{id:'a',personalityTypes:['무심하고 독립적']},{id:'b'},'gossip','test').kind,'gossip');
console.log('PASS remote sender-only scenes, sleeping recipient, directional gossip and no job-label topic');
