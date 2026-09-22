import {characterTown,townActivityAllowed} from './town-setting.js';
import {LIFE_TASKS} from './life-tasks.js?v=20260909dev305';
import {SOCIAL_ACTIVITIES,workTasks} from './social-activities.js?v=20260909dev305';
import {personalChoices} from './automatic-activities.js?v=20260909dev305';
import {personalSceneChoicesFor} from './state.js?v=20260909dev305';
const label=a=>Object.fromEntries(['ko','en','ja'].map((k,i)=>[k,a[i]]));
const simple=(kind,...labels)=>({kind,label:label(labels),unbound:true});
const basics=[['wake','일어나기','Wake up','起きる'],['wash','씻기','Wash','洗う'],['meal','식사하기','Eat','食事する'],['relax','쉬기','Relax','休む'],['nap','잠깐 자기','Nap','仮眠する'],['read','책 읽기','Read','読書'],['music','음악 듣기','Listen to music','音楽を聴く'],['game','게임하기','Play a game','ゲーム'],['art','창작하기','Create','創作'],['exercise','운동하기','Exercise','運動'],['walk','산책하기','Walk','散歩'],['work','일하기','Work','仕事'],['study','공부하기','Study','勉強'],['chores','집안일','Chores','家事'],['research','조사하기','Research','調査']];
const social=[['talk','대화하기','Talk','話す'],['hangout','함께 시간 보내기','Spend time together','一緒に過ごす'],['comfort','위로하기','Comfort','慰める'],['compliment','칭찬하기','Compliment','褒める'],['hug','포옹하기','Hug','抱きしめる'],['handhold','손잡기','Hold hands','手をつなぐ'],['lean','기대기','Lean on their shoulder','寄り添う'],['kiss','키스하기','Kiss','キス'],['kiss_cautious','조심스럽게 키스하기','Kiss gently','そっとキス'],['kiss_reconcile','화해의 키스','Make-up kiss','仲直りのキス'],['affection','스킨십하기','Physical affection','スキンシップ'],['gossip','다른 사람 이야기','Talk about someone','誰かの話']];
export function allContextGroups(world,actor){
 const task=t=>({kind:t.kind,lifeTask:t.id,label:label(t.labels),unbound:true});
 return [
  {label:label(['생활·휴식','Daily life and rest','生活・休息']),actions:basics.slice(0,5).map(a=>simple(...a))},
  ...[...new Set(LIFE_TASKS.map(t=>t.group))].map(group=>({label:label(({food:['식사·요리','Food and cooking','食事・料理'],hygiene:['위생','Hygiene','清潔'],rest:['휴식','Rest','休息'],groom:['몸단장','Grooming','身支度'],chores:['집안일','Household chores','家事'],sleep:['수면','Sleep','睡眠']})[group]||['생활·취미','Daily activities','生活・趣味']),actions:LIFE_TASKS.filter(t=>t.group===group).map(task)})),
  {label:label(['취미·이동','Hobbies and movement','趣味・移動']),actions:basics.slice(5,11).map(a=>simple(...a))},
  {label:label(['일·학업','Work and study','仕事・学業']),actions:[...basics.slice(11).map(a=>simple(...a)),...workTasks(actor).map(t=>({kind:'work',workTask:t.id,label:label(t.labels),unbound:true}))]},
  {label:label(['교류·상호작용','Social interactions','交流']),actions:[...social.filter(a=>!SOCIAL_ACTIVITIES[a[0]]).map(a=>simple(...a)),...Object.entries(SOCIAL_ACTIVITIES).map(([kind,a])=>({kind,label:label(a.labels),unbound:true}))].map(a=>({...a,companion:true,details:true}))},
  {label:label(['선물','Gifts','贈り物']),actions:[simple('mailbox','우편함에서 선물 보내기','Send a gift from the mailbox','郵便箱から贈り物を送る')]},
  {label:label(['나답게','Personal time','自分らしく']),actions:[...personalSceneChoicesFor(actor).map(task),...personalChoices(world,actor).map(t=>({...t,label:label(t.labels),companionId:t.targetId,unbound:true}))]}
 ].map(g=>({...g,actions:g.actions.filter(a=>townActivityAllowed(characterTown(world,actor),{...a,labels:Object.values(a.label||{})}))})).filter(g=>g.actions.length);
}
