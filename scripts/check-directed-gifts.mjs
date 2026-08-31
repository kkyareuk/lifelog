import assert from 'node:assert/strict';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260831village183');
const sim=await import('../simulation.js?v=20260831village183');
const date=new Date();date.setHours(13,6,0,0);
game.resetAll();const first=game.createCharacter(),second=game.createCharacter();
const {state}=game,a=state.characters[first],b=state.characters[second];
Object.assign(a,{name:'네리네',createdAt:1,wake:'07:00',sleep:'23:00'});Object.assign(b,{name:'크로',createdAt:1,wake:'07:00',sleep:'23:00'});
state.catalog.perfume.push({id:'gift-test',name:'데 로스 산토스',kind:'perfume',category:'우디'});
b.favorites={perfume:['gift-test']};game.updateCharacterView(second,first,'overall','깊이 사랑함');
// Existing unrelated histories and a different room must not steal this event.
sim.eventFor(a,new Date(date.getTime()-30*60000));sim.eventFor(b,new Date(date.getTime()-30*60000));
const choice=game.scheduleCharacterChoice({kind:'gift',characterId:first,targetId:second,itemKind:'perfume',itemId:'gift-test',buyAt:date.getTime()-60*60000,giveAt:date.getTime()-6*60000});
assert(choice);assert.equal(game.scheduleCharacterChoice({kind:'gift',characterId:first,targetId:first}),null);
for(const order of [[b,a],[a,b],[b,a]]){
  const scenes=order.map(c=>sim.eventFor(c,date));
  assert.equal(scenes[0].interactionId,scenes[1].interactionId);
  assert.equal(scenes[0].visitHomeId,scenes[1].visitHomeId);assert.equal(scenes[0].room,scenes[1].room);
  const giver=scenes.find(x=>x.giftRole==='giver'),receiver=scenes.find(x=>x.giftRole==='receiver');
  assert.match(giver.title,/크로에게 데 로스 산토스를 건네/);assert.match(receiver.title,/네리네에게서 데 로스 산토스를 받/);
  assert.match(receiver.desc,/평소 좋아하던/);assert.match(receiver.desc,/다정하게/);
  assert.equal(giver.withId,second);assert.equal(receiver.withId,first);
}
for(const c of [a,b])assert.equal(sim.visibleTimeline(c,date).filter(x=>x.interactionId===`choice:${choice}:give`).length,1,'One shared gift, no repeated logs');
game.settleScheduledChoices(date.getTime());game.settleScheduledChoices(date.getTime());
assert.deepEqual(b.inventory.perfume,['gift-test']);assert(!(a.inventory.perfume||[]).includes('gift-test'));
game.updateCharacterView(second,first,'trust','의심함');
assert.match(sim.eventFor(b,date).desc,/경계/,'Recipient-to-giver distrust outweighs romance');
b.favorites={};b.favoriteScentNotes=['우디'];assert.match(sim.eventFor(b,date).desc,/평소 좋아하던/);
b.favoriteScentNotes=[];assert.match(sim.eventFor(b,date).desc,/취향에 맞을지/);
for(const language of ['en','ja']){state.uiLanguage=language;assert(!/[가-힣]/.test(sim.eventFor(b,date).desc.replaceAll(a.name,'').replaceAll(b.name,'').replaceAll('데 로스 산토스','')))}
state.uiLanguage='ko';assert(!sim.eventFor(a,new Date(date.getTime()+25*60000)).giftExchange,'Gift does not trap the rest of the day');
// Direct gifts use the same direction contract, with no invalid self-gifts.
state.scheduledChoices=[];state.interactions=[{id:'direct',type:'gift',actorId:first,targetId:second,itemKind:'perfume',itemId:'gift-test',createdAt:date.getTime()}];
assert.equal(sim.eventFor(b,date).giftRole,'receiver');assert.equal(sim.eventFor(a,date).giftRole,'giver');
state.interactions[0].targetId=first;assert(!sim.eventFor(a,date).giftExchange,'Invalid legacy self-gift is not played');
console.log('PASS directed gifts in both view orders, shared location/time, favorites/scent/relationship reactions, multilingual copy, inventory once, expiry and invalid self-gifts');
