import assert from 'node:assert/strict';
import {normalizeSecrets,secretSentence,traumaScene,shareSecret} from '../character-secrets.js';
const a={id:'a',name:'가람'},b={id:'b',name:'나래'},world={characters:{a,b},relationships:{ab:{a:'a',b:'b',metrics:{trust:90,comfort:90,tension:0}}}};
for(const [kind,fields,parts] of [
 ['trauma',{event:'custom:달의 붕괴',frame:'memory'},['달의 붕괴']],
 ['relationship',{target:'custom:시간의 여행자',relation:'custom:동행자'},['시간의 여행자','동행자']],
 ['identity',{role:'custom:별의 기록자'},['별의 기록자']],
 ['goal',{goal:'custom:돌아갈 문을 찾고 싶다'},['돌아갈 문을 찾고 싶다']],
 ['preference',{taste:'custom',tasteLabel:'별빛 사탕'},['별빛 사탕']]
]){
 const [s]=normalizeSecrets([{id:kind,kind,...fields}]);assert.deepEqual(normalizeSecrets(JSON.parse(JSON.stringify([s]))),[s]);
 a.secrets=[s];a.secretLife={};const copy=shareSecret(world,a,b,kind,Date.now());
 for(const lang of ['ko','en','ja'])for(const part of parts){assert(secretSentence(world,a,s,lang).includes(part));assert(copy[lang].desc.includes(part));}
 if(kind==='trauma'){assert.equal(s.frame,'past');assert.equal(secretSentence(world,a,s),'가람은 예전에 달의 붕괴를 겪었다.');}
}
a.secrets=normalizeSecrets([{id:'t',kind:'trauma',event:'fire',triggers:['fire']}]);a.secretLife={};const now=Date.now(),scene={title:'불길',desc:'장면',withId:'b'};const reaction=traumaScene(a,scene,now);assert(reaction.traumaReaction);
a.secrets[0].triggers=[];assert.equal(traumaScene(a,reaction,now+1).desc,'장면');assert(!traumaScene(a,scene,now+1000).traumaReaction);
assert.deepEqual(normalizeSecrets([{id:'t',kind:'trauma',triggers:['custom:아무것']}])[0].triggers,[]);
console.log('PASS505 custom values survive save and shared logs in all languages; fixed trauma frame; no triggers stops existing reaction; trigger allowlist retained');
