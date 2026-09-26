import assert from 'node:assert/strict';
import {SECRET_TRIGGERS,TRAUMA_EVENTS,SECRET_TYPES,SECRET_ROLES,SECRET_RELATIONS,SECRET_TASTES,SECRET_GOALS} from '../secret-catalog.js';
import {normalizeSecrets,secretSentence,nextSecret,shareSecret,knownSecrets,traumaScene,followupSecret,rememberSecretFollowup} from '../character-secrets.js';
import {variedContact,rememberContact} from '../contact-variations.js';
for(const pool of [SECRET_TRIGGERS,TRAUMA_EVENTS,SECRET_TYPES,SECRET_ROLES,SECRET_RELATIONS,SECRET_TASTES,SECRET_GOALS]){assert.equal(new Set(pool.map(x=>x.id)).size,pool.length);for(const x of pool)for(const lang of ['ko','en','ja'])assert(x.label[lang]);}
for(const e of TRAUMA_EVENTS)for(const t of e.recommendations)assert(SECRET_TRIGGERS.some(x=>x.id===t));
const a={id:'a',name:'가람',secrets:normalizeSecrets([{id:'one',kind:'custom',text:'<script>소중한 비밀</script>'},{id:'two',kind:'relationship',target:'b',relation:'child'},{id:'three',kind:'trauma',event:'fire',triggers:['fire'],intensity:'strong'}])},b={id:'b',name:'나래'},d={id:'d',name:'다른 사람'};
const w={characters:{a,b,d},relationships:{ab:{a:'a',b:'b',metrics:{trust:80,comfort:80,tension:0}}}},now=Date.now();
assert.equal(nextSecret(w,a,d,now),null);assert.equal(nextSecret(w,a,b,now).id,'one');
const copy=shareSecret(w,a,b,'one',now);assert(copy.ko.desc.includes(a.secrets[0].text));assert.equal(shareSecret(w,a,b,'one',now+1),null);assert.deepEqual(knownSecrets(a)[0].knownBy,['b']);assert.equal(nextSecret(w,a,b,now+100),null);
assert.equal(nextSecret(w,JSON.parse(JSON.stringify(a)),b,now+7*3600000).id,'two');
assert.equal(followupSecret(a,d,now+86400000),null);assert.equal(followupSecret(a,b,now+86400000).id,'one');rememberSecretFollowup(w,a,b,a.secrets[0],now+86400000);assert.equal(followupSecret(a,b,now+86400001),null);
assert(secretSentence(w,a,a.secrets[1]).includes('나래'));assert(!a.secrets[1].knownBy.includes('d'));assert.equal(w.relationships.ab.type,undefined,'Hidden relationship must not overwrite official relationships');
const quiet={title:'읽는 중',desc:'책을 읽어요.',kind:'read',withId:'b'};assert.strictEqual(traumaScene(a,quiet,now),quiet);
const reaction=traumaScene(a,{...quiet,secretTriggers:['fire']},now);assert(reaction.traumaReaction);assert(!reaction.desc.includes('화재을'),'Reactions must not reveal hidden backstory');assert.equal(traumaScene(a,reaction,now+1000).desc,reaction.desc);assert.equal(traumaScene(a,quiet,now+1000).desc,quiet.desc);assert.strictEqual(traumaScene(a,quiet,now+3*60000),quiet);
assert.strictEqual(traumaScene(a,{...quiet,sleeping:true,secretTriggers:['fire']},now+2*3600000).sleeping,true);
for(const kind of ['hug','kiss'])for(const style of ['shy','reserved','lively','gentle']){const c={id:'test'},options={[style]:true,initiator:true,signals:{romantic:kind==='kiss'},relation:{intimacy:80}};const lines=[];for(let i=0;i<6;i++){const line=variedContact(c,b,kind,options,['base','base','base']);assert.deepEqual(line,variedContact(c,b,kind,options,['base','base','base']),'Repaint must be stable');lines.push(line[0]);rememberContact(c,b.id,kind);}assert.equal(new Set(lines.slice(0,3)).size,3);for(let i=1;i<6;i++)assert.notEqual(lines[i],lines[i-1]);}
await import('../server-life.mjs');const g=await import('../state.js?v=20260909dev305');const ids=[g.createCharacter(),g.createCharacter()];const [x,y]=ids.map(id=>g.state.characters[id]);Object.assign(y,{homeId:x.homeId,residences:structuredClone(x.residences)});g.state.relationships.ab={a:x.id,b:y.id,type:'친구',metrics:{trust:80,comfort:80,tension:0}};x.secrets=normalizeSecrets([{id:'secret',kind:'goal',goal:'home'}]);
const scenes=Object.fromEntries(ids.map(id=>[id,{home:true,visitHomeId:x.homeId,room:'living',townId:x.townId}]));
assert(g.directCharacterActivity(x.id,'talk',{targetId:y.id,secretId:'secret',now,scenes}));assert(g.state.characterDirectives[x.id].secretSharing);assert(g.state.characterDirectives[y.id].copy.ko.desc.includes('돌아갈'));assert.equal(g.state.characterDirectives[x.id].endsAt-Math.max(now,g.state.characterDirectives[x.id].journey.arrivesAt),5*60000);
assert(g.directCharacterActivity(x.id,'wake',{now:now+600000,scenes}));const wake=g.state.characterDirectives[x.id];assert.equal(wake.endsAt-Math.max(wake.startedAt,wake.journey.arrivesAt),3*60000);
console.log(`PASS503 ${TRAUMA_EVENTS.length} events, ${SECRET_TRIGGERS.length} triggers; all 3 languages; knowledge/cooldown/privacy; stable varied contact; real two-sided secret directive; 3-minute morning preparation`);
const {advanceSharedLife}=await import('../server-life.mjs');
const profiles=[x,y].map(c=>structuredClone(c));profiles[0].secretLife={};profiles[0].secrets=normalizeSecrets([{id:'shared',kind:'custom',text:'비밀 편지를 보관한다.'}]);
const snapshot={group:{id:'group',towns:[{id:'town',name:'Town',places:[]}]},homes:[{id:'home',ownerUid:'owner',sourceHomeId:x.homeId,townId:'town',layoutJson:JSON.stringify(g.state.homes[x.homeId])}],residents:profiles.map((c,i)=>({id:i?'peer':'owner',ownerUid:'owner',name:c.name,townId:'town',sourceCharacterId:c.id,sharedHomeId:'home',profileJson:JSON.stringify(c),scheduleJson:'{}'})),relationships:[{id:'pair',a:'owner',b:'peer',type:'친구',metrics:{trust:80,comfort:80,tension:0}}]};
const before=JSON.stringify(g.state),result=advanceSharedLife(snapshot,now,{characterId:'owner',kind:'talk',targetId:'peer'}),owner=result.find(x=>x.id==='owner');
assert(JSON.parse(owner.lifeJson).secretLife.knowledge.shared.includes('peer'));
for(const row of snapshot.residents)row.lifeJson=result.find(r=>r.id===row.id).lifeJson;
const restored=advanceSharedLife(snapshot,now+1000);assert.equal(JSON.parse(restored.find(x=>x.id==='owner').lifeJson).secretLife.shareCount,1);assert.equal(JSON.stringify(g.state),before);
console.log('PASS503 shared server knowledge persistence, no repeated reveal, isolated personal world');
g.updateCharacterView(x.id,y.id,'touchIntensity','성인 간 친밀한 접촉까지');g.updateCharacterView(y.id,x.id,'touchIntensity','신체 접촉 없음');x.ageGroup=y.ageGroup='성인';
const contactBefore=JSON.stringify(x.contactHistory||{}),attempt=g.directCharacterActivity(x.id,'kiss',{targetId:y.id,now:now+1000000,scenes});
if(attempt){assert(g.state.characterDirectives[x.id].contactRejected);assert.equal(g.state.characterDirectives[x.id].copy.ko.contactTone,'declined');}
assert.equal(JSON.stringify(x.contactHistory||{}),contactBefore,'Rejected contact must not rotate accepted-contact text');
console.log('PASS503 contact rejection retains its own narrative and never records accepted contact');

const overridden=JSON.parse(JSON.stringify(a));overridden.secrets[0].knownBy=[];overridden.secrets[0].knowledgeVersion=now+10;assert(!knownSecrets(overridden)[0].knownBy.includes('b'));assert.equal(followupSecret(overridden,b,now+2*86400000),null);assert(shareSecret(w,overridden,b,'one',now+2*86400000));assert(knownSecrets(overridden)[0].knownBy.includes('b'));console.log('PASS504 explicit knowledge override defeats older server memory; new disclosure remembers the latest version');
