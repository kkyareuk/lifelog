import assert from 'node:assert/strict';
await import('../server-life.mjs');
const {state,runIsolatedWorld,personalState}=await import('../state.js?v=20260909dev298');
const {moveCandidates}=await import('../shared-residents.js');
state.characters={a:{id:'a',name:'개인1',townId:'one'},b:{id:'b',name:'개인2',townId:'two'},c:{id:'c',name:'이미 입주'},d:{id:'d',ownerUid:'other'}};state.order=['a','b','c','d'];state.towns=[{id:'one',name:'내 마을'},{id:'two',name:'두 번째 마을'}];
const snap={residents:[{id:'remote-c',sourceCharacterId:'c',ownerUid:'me'}]};
const shared={characters:{remote:{id:'remote',name:'안테'}},order:['remote']};
runIsolatedWorld(shared,()=>{assert.equal(personalState(),state);const rows=moveCandidates(snap,'me');assert.deepEqual(rows.map(c=>c.id),['a','b']);assert.deepEqual(rows.map(c=>c.originName),['내 마을','두 번째 마을']);runIsolatedWorld({},()=>assert.deepEqual(moveCandidates(snap,'me').map(c=>c.id),['a','b']))});
assert.equal(personalState(),state);console.log('PASS isolated multiplayer rendering uses all personal towns, excludes existing/foreign residents and restores context');
