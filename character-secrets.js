import {SECRET_TYPES,SECRET_TRIGGERS,TRAUMA_EVENTS,SECRET_ROLES,SECRET_RELATIONS,SECRET_GOALS,SECRET_TASTES,label,words} from './secret-catalog.js';
import {relationMetrics} from './relationship-metrics.js';
const find=(pool,id)=>pool.find(x=>x.id===id),pick=(pool,id)=>find(pool,id)?.id||pool[0].id;
const text=value=>typeof value==='string'?value.slice(0,2000):'';
const particle=(name,pair)=>{const code=String(name).charCodeAt(String(name).length-1)-44032;return name+(code>=0&&code<11172?(code%28?pair[0]:pair[1]):pair[0]);};
export function normalizeSecrets(value){
 if(!Array.isArray(value))return [];
 const seen=new Set();return value.filter(s=>s&&typeof s==='object'&&typeof s.id==='string'&&s.id&&!seen.has(s.id)&&seen.add(s.id)).slice(0,100).map(s=>({
  id:s.id.slice(0,100),kind:pick(SECRET_TYPES,s.kind),text:text(s.text),event:pick(TRAUMA_EVENTS,s.event),triggers:[...new Set((Array.isArray(s.triggers)?s.triggers:[]).filter(id=>find(SECRET_TRIGGERS,id)))],intensity:['mild','moderate','strong'].includes(s.intensity)?s.intensity:'moderate',
  frame:['past','memory','aftermath'].includes(s.frame)?s.frame:'past',target:text(s.target),relation:pick(SECRET_RELATIONS,s.relation),role:pick(SECRET_ROLES,s.role),goal:pick(SECRET_GOALS,s.goal),taste:text(s.taste),tasteLabel:text(s.tasteLabel),preference:s.preference==='dislike'?'dislike':'like',
  disclosure:['never','trusted','easy'].includes(s.disclosure)?s.disclosure:'trusted',knowledgeVersion:Number.isSafeInteger(s.knowledgeVersion)?Math.max(0,s.knowledgeVersion):0,knownBy:[...new Set((Array.isArray(s.knownBy)?s.knownBy:[]).filter(x=>typeof x==='string'))].slice(0,300)
 }));
}
export function secretSentence(world,c,s,lang='ko'){
 const tr=(ko,en,ja)=>words(ko,en,ja)[lang]||ko,who=c.name||'',name=world.characters?.[s.target]?.name||label(find(SECRET_ROLES,s.target.replace(/^role:/,'')),lang)||tr('알 수 없는 인물','an unknown person','不明な人物');
 if(s.kind==='custom')return s.text.trim();
 if(s.kind==='relationship'){const rel=label(find(SECRET_RELATIONS,s.relation),lang);return tr(`${particle(who,['은','는'])} 사실 ${name}의 ${rel}이다.`,`${who} is secretly ${name}'s ${rel.toLowerCase()}.`,`${who}は実は${name}の${rel}だ。`)}
 if(s.kind==='identity'){const role=label(find(SECRET_ROLES,s.role),lang);return tr(`${who}의 숨겨진 정체는 ${role}이다.`,`${who}'s hidden identity is: ${role}.`,`${who}の隠された正体は${role}だ。`)}
 if(s.kind==='goal'){const goal=label(find(SECRET_GOALS,s.goal),lang);return tr(`${particle(who,['은','는'])} 속으로 ${goal}.`,`${who}: ${goal}.`,`${who}は密かに${goal}。`)}
 if(s.kind==='preference'){
  const item=s.taste.startsWith('catalog:')?Object.values(world.catalog||{}).flat().find(x=>'catalog:'+x.id===s.taste):null;
  const taste=item?.name||label(find(SECRET_TASTES,s.taste),lang)||s.tasteLabel||tr('아직 고르지 않은 대상','an unselected subject','未選択の対象');
  return s.preference==='dislike'?tr(`${particle(who,['은','는'])} 사실 ${particle(taste,['을','를'])} 좋아하지 않는다.`,`${who} secretly dislikes ${taste}.`,`${who}は実は${taste}が苦手だ。`):tr(`${particle(who,['은','는'])} 사실 ${particle(taste,['을','를'])} 좋아한다.`,`${who} secretly likes ${taste}.`,`${who}は実は${taste}が好きだ。`);
 }
 const event=label(find(TRAUMA_EVENTS,s.event),lang),triggers=s.triggers.map(id=>label(find(SECRET_TRIGGERS,id),lang)).join(', ');
 const first=s.frame==='memory'?tr(`${who}에게는 ${event}의 기억이 남아 있다.`,`${who} carries memories of ${event.toLowerCase()}.`,`${who}には${event}の記憶が残っている。`):s.frame==='aftermath'?tr(`${particle(who,['은','는'])} ${event} 이후 조심스러워졌다.`,`${who} became cautious after ${event.toLowerCase()}.`,`${who}は${event}の後、慎重になった。`):tr(`${particle(who,['은','는'])} 예전에 ${particle(event,['을','를'])} 겪었다.`,`${who} once experienced ${event.toLowerCase()}.`,`${who}は過去に${event}を経験した。`);
 return first+(triggers?tr(` 그래서 ${triggers} 상황을 꺼린다.`,` They therefore avoid: ${triggers}.`,` そのため、${triggers}を避けている。`):'');
}
export function canShareSecret(world,c,target,s){
 if(!target||target.id===c.id||s.disclosure==='never'||s.knownBy.includes(target.id)||runtimeKnowledge(c,s).includes(target.id)||!secretSentence(world,c,s).trim())return false;
 const m=relationMetrics(world,c.id,target.id);return m.tension<40&&m.trust>=(s.disclosure==='easy'?20:60)&&m.comfort>=(s.disclosure==='easy'?15:40);
}
export function nextSecret(world,c,target,now){
 if(now-(c.secretLife?.lastSharedAt||0)<30*60000)return null;
 return normalizeSecrets(c.secrets).find(s=>canShareSecret(world,c,target,s))||null;
}
const reactionSets={
 trauma:[words('말을 재촉하지 않고, 어떤 상황을 피하면 좋을지 조심스럽게 물었어요.','They let the story unfold and gently asked what situations to avoid.','話を急かさず、どんな場面を避ければよいかそっと尋ねました。'),words('이야기해 줘서 고맙다고 말하고, 지금 필요한 것이 있는지 물었어요.','They thanked them for sharing and asked what they needed now.','話してくれたことに感謝し、今必要なことを尋ねました。'),words('함부로 해결책을 내놓지 않고, 편한 거리에서 끝까지 들었어요.','They listened at a comfortable distance without rushing to offer a solution.','安易に解決策を出さず、心地よい距離で最後まで聞きました。')],
 relationship:[words('알고 있던 관계와 달라 잠시 놀랐지만, 어떻게 이어진 인연인지 물었어요.','Surprised by the connection, they asked how it had begun.','意外なつながりに驚き、どんな縁だったのか尋ねました。'),words('두 사람을 떠올리며 말을 골랐어요. 남에게 전하지 않겠다고 답했어요.','They considered both people and promised not to pass it on.','二人を思い浮かべて言葉を選び、他言しないと答えました。'),words('무엇부터 물을지 망설이다, 그 관계가 지금 어떤 의미인지 물었어요.','After hesitating, they asked what the relationship meant now.','ためらった後、その関係が今どんな意味を持つのか尋ねました。')],
 preference:[words('의외의 취향에 웃으며, 언제부터 좋아하거나 꺼리게 됐는지 물었어요.','Smiling at the unexpected preference, they asked how it had started.','意外な好みに微笑み、いつからそうなったのか尋ねました。'),words('기억해 두겠다며 고개를 끄덕이고, 자신의 취향도 하나 알려 줬어요.','They nodded, said they would remember, and shared a preference of their own.','覚えておくとうなずき、自分の好みも一つ教えました。'),words('남들의 평가보다 본인의 취향이 중요하다며 이야기를 이어 갔어요.','They continued the conversation, saying personal taste mattered more than others’ opinions.','周りの評価より本人の好みが大切だと話を続けました。')],
 identity:[words('잠시 말문이 막혔지만, 지금까지 혼자 숨겨 온 이유를 물었어요.','Briefly speechless, they asked why it had been kept hidden.','一瞬言葉を失い、これまで隠してきた理由を尋ねました。'),words('다시 얼굴을 바라봤어요. 그동안 달리 보였던 일들을 조심스럽게 되짚었어요.','They looked at them anew and carefully reconsidered past moments.','改めて顔を見て、これまでの出来事を静かに振り返りました。'),words('당장 모든 것을 이해하진 못해도 이야기를 더 듣겠다고 했어요.','They admitted they did not understand everything yet, but wanted to listen.','すぐにすべては理解できなくても、話をもっと聞きたいと伝えました。')],
 goal:[words('왜 그 일이 중요한지 묻고, 지금 할 수 있는 작은 일부터 함께 생각했어요.','They asked why it mattered and considered a small first step together.','なぜ大切なのか尋ね、今できる小さな一歩を一緒に考えました。'),words('쉽게 약속하지는 않았지만, 진지한 마음을 알아줬어요.','They made no easy promises, but took the wish seriously.','軽く約束はせず、真剣な思いを受け止めました。'),words('자신과 생각이 다른 부분도 솔직히 말하며 오래 이야기를 나눴어요.','They spoke honestly about their differences and talked at length.','考えの違いも率直に伝えながら、長く話し合いました。')],
 custom:[words('말을 끊지 않고 듣다가, 이야기해 줘서 고맙다고 답했어요.','They listened without interrupting and thanked them for sharing.','遮らずに聞き、話してくれたことに感謝しました。'),words('잠시 생각을 정리한 뒤, 더 이야기하고 싶은지 조심스럽게 물었어요.','After a pause, they gently asked whether there was more to say.','少し考えてから、もっと話したいかそっと尋ねました。'),words('가볍게 넘기지 않고, 상대가 말을 마칠 때까지 곁에 있었어요.','They took the words seriously and stayed until the story was finished.','軽く流さず、話し終わるまでそばにいました。')]
};
export function shareSecret(world,c,target,secretId,now){
 const s=normalizeSecrets(c.secrets).find(s=>s.id===secretId);if(!s||!canShareSecret(world,c,target,s))return null;
 const life=c.secretLife||{},count=Number(life.shareCount)||0,traits=[target.socialStyle,target.emotionalExpression,target.decisionStyle,...(target.personalityTypes||[])].join(' '),offset=/논리|해결|이성/.test(traits)?0:/내향|과묵|절제/.test(traits)?2:1;
 const reaction=reactionSets[s.kind][(count+offset)%3],copy=Object.fromEntries(['ko','en','ja'].map(lang=>{const tr=(ko,en,ja)=>words(ko,en,ja)[lang],sentence=secretSentence(world,c,s,lang);return [lang,{title:tr(`${target.name}에게 비밀을 털어놓는 중`,`Sharing a secret with ${target.name}`,`${target.name}に秘密を打ち明けるところ`),desc:tr(`${particle(c.name,["은","는"])} “${sentence}”라는 비밀을 공유했어요. ${target.name}: `,`${c.name} shared a secret: “${sentence}” ${target.name}: `,`${c.name}は「${sentence}」という秘密を打ち明けました。${target.name}：`)+reaction[lang]}]}));
 c.secretLife={...life,lastSharedAt:now,shareCount:count+1,knowledgeVersions:{...(life.knowledgeVersions||{}),[s.id]:s.knowledgeVersion},knowledge:{...(life.knowledge||{}),[s.id]:[...new Set([...runtimeKnowledge(c,s),target.id])]},memories:[...(life.memories||[]),{secretId:s.id,targetId:target.id,at:now,knowledgeVersion:s.knowledgeVersion}].slice(-100)};
 return copy;
}
const runtimeKnowledge=(c,s)=>(c.secretLife?.knowledgeVersions?.[s.id]||0)===(s.knowledgeVersion||0)&&Array.isArray(c.secretLife?.knowledge?.[s.id])?c.secretLife.knowledge[s.id]:[];
export function knownSecrets(c){return normalizeSecrets(c.secrets).map(s=>({...s,knownBy:[...new Set([...s.knownBy,...runtimeKnowledge(c,s)])]}))}
export function followupSecret(c,target,now,world){
 if(!target||now-(c.secretLife?.followups?.[target.id]||0)<24*3600000)return null;
 if(world){const metrics=relationMetrics(world,c.id,target.id);if(metrics.tension>=40||metrics.comfort<40||metrics.trust<40)return null;}
 const memory=[...(c.secretLife?.memories||[])].reverse().find(m=>m.targetId===target.id&&now-m.at>=12*3600000);
 return memory&&knownSecrets(c).find(s=>s.id===memory.secretId&&(s.knowledgeVersion||0)===(memory.knowledgeVersion||0)&&s.disclosure!=='never'&&s.knownBy.includes(target.id))||null;
}
export function rememberSecretFollowup(world,c,target,s,now){
 const copy=Object.fromEntries(['ko','en','ja'].map(lang=>{const t=(ko,en,ja)=>words(ko,en,ja)[lang];return [lang,{title:t(`${target.name}와 지난 이야기를 이어 가는 중`,`Following up with ${target.name}`,`${target.name}と前の話を続けるところ`),desc:t(`${particle(target.name,["은","는"])} 지난번 들었던 이야기를 기억하고, 그 뒤로 마음이 어떤지 물었어요. ${particle(c.name,["은","는"])} “${secretSentence(world,c,s,lang)}”라는 이야기를 다시 꺼내며 지금의 생각을 나눴어요.`,`${target.name} remembered their earlier conversation and asked how things had been since. ${c.name} revisited “${secretSentence(world,c,s,lang)}” and shared their current thoughts.`,`${target.name}は前に聞いた話を覚えていて、その後の気持ちを尋ねました。${c.name}は「${secretSentence(world,c,s,lang)}」という話を振り返り、今の思いを伝えました。`)}]}));
 c.secretLife={...c.secretLife,followups:{...(c.secretLife?.followups||{}),[target.id]:now}};return copy;
}
// Only explicit scene evidence activates a trigger. The event itself never runs again.
export function sceneTriggers(scene){
 const found=new Set(Array.isArray(scene.secretTriggers)?scene.secretTriggers:[]),kind=scene.kind||scene.directiveKind||'',source=[scene.title,scene.baseTitle,scene.topic,scene.placeName,scene.weather].join(' ');
 const tests={dark:/어두운|암흑|dark room|暗い/,crowd:/붐비|인파|crowded|人混み/,confined:/밀실|좁은 방|confined|閉鎖/,height:/옥상|절벽|rooftop|cliff|屋上/,water:/수영|물가|바닷가|swim|waterside|水辺|泳/,fire:/불길|화재|fireplace|焚き火/,storm:/천둥|폭풍|thunder|storm|雷|嵐/,loud:/폭음|큰 소리|loud noise|大きな音/,shouting:/고함|소리치|shouting|怒鳴/,hospital:/병원|치료|hospital|treatment|病院|治療/,illness:/투병|질병|illness|病気/,money:/빚|돈 이야기|debt|借金/,animal:/동물.*다가|animal approaches|動物が近/,family:/가족 이야기|family conversation|家族の話/,romance:/고백|confession|告白/,evaluation:/시험|평가|exam|evaluation|試験|評価/,competition:/승부|대회|competition|大会/,accusation:/추궁|누명|accus|追及/,loss:/사별|잃어버린|bereavement|死別/,magic:/마법|저주|magic|curse|魔法|呪い/,memory:/과거 이야기|지난 과거|past memories|過去の話/,promise:/약속을 정|promise|約束/,separation:/작별|farewell|別れ/};
 for(const [id,re] of Object.entries(tests))if(re.test(source))found.add(id);
 if(['argue','fight','insult','taunt'].includes(kind))found.add('conflict');
 if(['hug','kiss','handhold','lean','affection'].includes(kind))found.add('touch');
 if(scene.transit)found.add('travel');if(kind==='gift')found.add('gift');
 if(scene.secretSharing)found.add('secret');if(scene.needKey==='hunger')found.add('hunger');
 const extra={waiting:/기다리|waiting|待って/,attention:/시선.*집중|주목받|center of attention|注目/,mistake:/실수|실패|mistake|failure|失敗/,authority:/권위적|명령을 받|authority|権威/,home:/귀가|집으로 돌아|returning home|帰宅/,secret:/비밀.*이야기|secret conversation|秘密の話/,silence:/대화.*끊|말이 끊|sudden silence|会話が途切/};
 for(const [id,re] of Object.entries(extra))if(re.test(source))found.add(id);
 if(!scene.withId&&!scene.withIds?.length&&!scene.sleeping)found.add('alone');
 return found;
}
export function traumaScene(c,scene,now,lang='ko'){
 if(!scene)return scene;
 if(scene.traumaReaction)scene={...scene,desc:scene.traumaBaseDesc??scene.desc,traumaReaction:false};
 if(!c.secrets?.length||scene.sleeping||scene.secretSharing)return scene;
 const life=c.secretLife||{},active=life.reaction;
 if(active&&now>=active.at&&now<active.until&&sceneTriggers(scene).has(active.trigger))return {...scene,traumaBaseDesc:scene.desc,desc:scene.desc+' '+active.copy[lang],traumaReaction:true};
 if(now-(life.lastReactionAt||0)<90*60000)return scene;
 const triggers=sceneTriggers(scene),s=knownSecrets(c).find(s=>s.kind==='trauma'&&s.triggers.some(id=>triggers.has(id)));if(!s)return scene;
 const id=s.triggers.find(id=>triggers.has(id)),count=Number(life.reactionCount)||0;
 const variants={mild:[words('잠시 말을 고르며 호흡을 가다듬고, 자신의 속도로 하던 일을 이어 가요.','They pause to steady their breathing, then continue at their own pace.','少し呼吸を整え、自分のペースで続けています。'),words('조금 긴장해 주변을 살핀 뒤, 편한 자리를 찾아요.','A little tense, they look around for a comfortable spot.','少し緊張して周囲を見回し、落ち着ける場所を探しています。')],moderate:[words('마음이 불편해져 잠시 쉬고 싶다고 표현해요. 무리하지 않고 거리를 조절해요.','They say they need a pause and adjust their distance without pushing themselves.','少し休みたいと伝え、無理せず距離を調整しています。'),words('말수가 줄었어요. 마음이 가라앉을 때까지 조용한 틈을 가져요.','They grow quiet and take a moment to settle.','口数が減り、落ち着くまで静かな時間を取っています。')],strong:[words('지금 상황이 버거워 더 이어 가기 어렵다고 표현해요. 안정될 시간을 필요로 해요.','They express that the situation feels overwhelming and that they need time to settle.','今の状況はつらいと伝え、落ち着く時間を必要としています。'),words('긴장이 크게 올라와 잠시 멈추고 싶다고 말해요. 익숙하고 편안한 것을 찾으려 해요.','Feeling very tense, they ask to pause and seek something familiar and comforting.','緊張が高まり、いったん止めたいと伝えて慣れた安心できるものを探しています。')]};
 const reaction=variants[s.intensity][count%2],copy=Object.fromEntries(['ko','en','ja'].map(l=>[l,words(`${label(find(SECRET_TRIGGERS,id),l)} 상황에 ${reaction[l]}`,`In this situation (${label(find(SECRET_TRIGGERS,id),l)}), ${reaction[l]}`,`${label(find(SECRET_TRIGGERS,id),l)}の場面で、${reaction[l]}`)[l]]));
 c.secretLife={...life,lastReactionAt:now,reactionCount:count+1,reaction:{secretId:s.id,trigger:id,at:now,until:now+2*60000,copy}};
 return {...scene,traumaBaseDesc:scene.desc,desc:scene.desc+' '+copy[lang],traumaReaction:true};
}
