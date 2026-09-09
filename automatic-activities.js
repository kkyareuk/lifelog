export const seededChoice=seed=>{let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}};
const values=v=>Array.isArray(v)?v.filter(x=>typeof x==='string'&&x.trim()):[];
export function ignoresOthers(c){return /무관심|남.*관심.*없|관여하지|무심하고 독립적/.test([c.interference,c.socialStyle,...values(c.personalityTypes)].join(' '))}
export function dislikesPerson(world,c,other){const view=world.characterViews?.[c.id]?.[other.id];if(view?.overall&&!/설정|선택|정하지/.test(view.overall))return /싫어|증오|혐오|반감|경멸/.test(view.overall);return /피곤|성가/.test(view?.annoyance||'')&&!/전혀|않음/.test(view?.annoyance||'')||Object.values(world.relationships||{}).some(r=>r.temporalStatus!=='past'&&[r.a,r.b].includes(c.id)&&[r.a,r.b].includes(other.id)&&['혐관','원수'].includes(r.type))}
export function automaticConversation(world,c,target,kind,seed){
 const random=seededChoice(seed),pick=a=>a[Math.floor(random()*a.length)],others=Object.values(world.characters||{}).filter(x=>x.id!==c.id&&x.id!==target.id&&x.townId===c.townId),disliked=others.filter(x=>dislikesPerson(world,c,x));
 if(!ignoresOthers(c)&&disliked.length&&(kind==='gossip'||kind==='talk'&&random()<.25)){const subject=pick(disliked);return {kind:'gossip',subjectId:subject.id,topic:subject.name}}
 const catalog=Object.values(world.catalog||{}).flat().filter(x=>x&&typeof x.name==='string');const liked=new Set(Object.values(c.favorites||{}).flat());const preferred=catalog.filter(x=>liked.has(x.id));
 const themes=[...values(c.hobbies),...values(c.interests),...(preferred.length?preferred:catalog).map(x=>x.name)];
 if(!ignoresOthers(c))for(const other of others){themes.push(other.name+'에 대한 생각')}
 return {kind:kind==='gossip'?'talk':kind,subjectId:'',topic:themes.length?pick(themes):'오늘 하루'};
}
export function hobbyNames(world,c){return [...new Set([...values(c?.hobbies),...(world?.catalog?.hobby||[]).filter(item=>(c?.favorites?.hobby||[]).includes(item.id)).map(item=>item.name)].filter(name=>typeof name==='string'&&name.trim()).map(name=>name.trim()))]}
export function hobbyChoice(world,c,seed){const random=seededChoice(seed),list=hobbyNames(world,c);if(!list.length)return null;const name=list[Math.floor(random()*list.length)],kind=/요리|제빵|베이킹/.test(name)?'meal':/원예|식물|정원|수집/.test(name)?'chores':/독서|책|만화/.test(name)?'read':/음악|노래|악기|연주/.test(name)?'music':/게임/.test(name)?'game':/운동|수영|요가|축구|농구|헬스/.test(name)?'exercise':/산책|여행|등산/.test(name)?'walk':'art';return {id:'hobby_auto',kind,room:kind==='meal'?'kitchen':kind==='exercise'||/원예|식물|정원/.test(name)?'living':'study',minutes:60,labels:[name,name,name],hobby:true}}
export function personalChoices(world,c){const choices=[],adult=['성인','노인'].includes(c.ageGroup),traits=[...values(c.personalityTypes),c.neatness,c.interference,c.conflictStyle,c.activityTempo,c.humorStyle].join(' '),others=Object.values(world.characters||{}).filter(x=>x.id!==c.id&&x.townId===c.townId);
 if(adult&&['가끔 흡연','전자담배 사용','흡연'].includes(c.smokingStatus))choices.push({id:'smoke',kind:'relax',lifeTask:'smoke',labels:['흡연하기','Smoke','喫煙する']});
 if(!ignoresOthers(c)&&/통제|완고|간섭|바로 따짐/.test(traits)){const target=others.find(x=>dislikesPerson(world,c,x));if(target)choices.push({kind:'taunt',targetId:target.id,labels:[`${target.name}에게 한마디하기`,`Confront ${target.name}`,`${target.name}に一言言う`]})}
 if(/다정|세심|챙기/.test(traits)&&others.length)choices.push({kind:'comfort',targetId:others[0].id,labels:[`${others[0].name} 챙겨주기`,`Check on ${others[0].name}`,`${others[0].name}を気遣う`]});
 if(/깔끔|청결|철두철미/.test(traits))choices.push({kind:'chores',lifeTask:'tidy',labels:['주변 정돈하기','Put things in order','身の回りを整える']});
 if(hobbyChoice(world,c,0))choices.push({kind:'relax',lifeTask:'hobby_auto',labels:['내 취미 즐기기','Enjoy my hobby','自分の趣味を楽しむ']});
 if(/느긋|무심|차분/.test(traits)||!choices.length)choices.push({kind:'relax',lifeTask:'daydream',labels:['혼자 생각 정리하기','Have a quiet moment','一人で考えを整理する']});return choices;
}

// Reasons are selected from the speaker's directional view, never from a job label.
export function gossipReasons(view, subject){
 const reasons=[];
 if(/믿지|불신/.test(view.trust||''))reasons.push([`${subject.name}의 말을 믿기 어렵다며 속마음을 털어놓고 있어요.`,`They admit that they find it hard to trust ${subject.name}.`,`${subject.name}の言葉を信じにくいと本音を漏らしています。`]);
 if(/피곤|성가|귀찮/.test(view.annoyance||'')&&!/전혀|않음/.test(view.annoyance||''))reasons.push([`${subject.name}와 얽히면 피곤하다며 거리를 두고 싶다고 말하고 있어요.`,`They say dealing with ${subject.name} is tiring and they want some distance.`,`${subject.name}と関わると疲れるので距離を置きたいと話しています。`]);
 if(/불편|통하지/.test(view.comfort||''))reasons.push([`${subject.name}와는 대화가 잘 통하지 않아 함께 있기가 불편하다고 말하고 있어요.`,`They say conversation with ${subject.name} is difficult and being together feels uncomfortable.`,`${subject.name}とは話がかみ合わず、一緒にいると落ち着かないと話しています。`]);
 if(/싫어|증오|혐오|반감|경멸/.test(view.overall||'')){
 const traits=(subject.personalityTypes||[]).join(' ');
 if(/통제|완고/.test(traits))reasons.push([`${subject.name}의 자기 뜻을 고집하는 면이 마음에 들지 않는다고 말하고 있어요.`,`They complain that ${subject.name} insists on having things their own way.`,`${subject.name}の自分の考えを押し通すところが気に入らないと話しています。`]);
 if(/냉정|무심/.test(traits))reasons.push([`${subject.name}의 무심한 태도가 마음에 들지 않는다며 불만을 털어놓고 있어요.`,`They complain that they dislike ${subject.name}’s detached manner.`,`${subject.name}のそっけない態度が気に入らないと不満をこぼしています。`]);
 if(!reasons.length)reasons.push([`${subject.name}에게 호감이 가지 않아 가까이 지내고 싶지 않다고 말하고 있어요.`,`They say they do not feel fond of ${subject.name} and do not want to become close.`,`${subject.name}に好感を持てず、親しくしたくないと話しています。`]);
 }
 return reasons;
}
