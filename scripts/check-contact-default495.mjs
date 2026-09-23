import assert from 'node:assert/strict';
import '../server-life.mjs';
const game=await import('../state.js?v=20260909dev305');
const a=game.createCharacter(5),b=game.createCharacter(5),adult='성인 간 친밀한 접촉까지';
for(const type of ['연인','약혼','부부']){
 game.state.relationships={r:{id:'r',a,b,type,temporalStatus:'current'}};game.state.characterViews={};
 assert.equal(game.characterViewFor(a,b).touchIntensity,adult);assert.equal(game.characterViewFor(b,a).touchIntensity,adult);
 game.updateCharacterView(a,b,'touchIntensity','신체 접촉 없음');assert.equal(game.characterViewFor(a,b).touchIntensity,'신체 접촉 없음');assert.equal(game.characterViewFor(b,a).touchIntensity,adult);
 game.state.characterViews={};game.state.characters[b].ageGroup='청소년';assert.notEqual(game.characterViewFor(a,b).touchIntensity,adult);game.state.characters[b].ageGroup='성인';
 game.state.relationships.r.temporalStatus='past';assert.notEqual(game.characterViewFor(a,b).touchIntensity,adult);
}
game.state.relationships={r:{a,b,type:'연인'}};game.state.characterViews={[a]:{[b]:game.relationshipViewDefaults('연인')}};assert.equal(game.characterViewFor(a,b).touchIntensity,adult,'legacy generated preset inherits new age-aware default');
game.state.characterViews[a][b]._editedFields=['touchIntensity'];assert.equal(game.characterViewFor(a,b).touchIntensity,'포옹·기대기까지','explicitly edited prior default remains');
game.state.relationships.r.type='친구';game.state.characterViews={};assert.notEqual(game.characterViewFor(a,b).touchIntensity,adult);
console.log('PASS adult lovers/engaged/married defaults, directional manual limits, minors, past/friends, generated legacy preset and explicit prior-default preservation');
