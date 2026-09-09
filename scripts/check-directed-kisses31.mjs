import assert from 'node:assert/strict';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260909dev304');
for(const kind of ['kiss','kiss_cautious','kiss_reconcile']){
 game.resetAll();const a=game.createCharacter(),b=game.createCharacter(),s=game.state;
 for(const id of [a,b])s.characters[id].ageGroup='성인';
 game.updateCharacterView(a,b,'touchIntensity','성인 간 친밀한 접촉까지');
 game.updateCharacterView(b,a,'touchIntensity','성인 간 합의된 친밀한 접촉까지');
 assert.equal(game.directCharacterActivity(a,kind,{targetId:b}),true,kind+' without a predefined romantic label');
 assert.equal(s.characterDirectives[a].kind,kind);
 s.characters[b].ageGroup='청소년';assert.equal(game.directCharacterActivity(a,kind,{targetId:b}),false);
 s.characters[b].ageGroup='성인';game.updateCharacterView(b,a,'touchIntensity','신체 접촉 없음');
 assert.equal(game.directCharacterActivity(a,kind,{targetId:b}),false,'one-sided permission must not allow contact');
}
console.log('PASS all three directed kisses with mutual adult permission; legacy level normalized; age and one-sided settings remain enforced');
