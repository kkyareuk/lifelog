import {courtWorldData} from './court-world-data.js';
import {courtEncounterCopy} from './court-encounter-copy.js';
import {relationMetrics} from './relationship-metrics.js';
const hour=3600000;
const hash=s=>[...s].reduce((n,c)=>(Math.imul(n,31)+c.charCodeAt(0))>>>0,17);
const eligible=s=>s&&!s.sleeping&&s.mood!=='수면'&&!s.transit&&!s.manualDirective&&!s.routineId&&!s.secretSharing&&!s.traumaReaction&&!s.remote&&!s.remoteContact&&!s.dateGroup&&!s.giftExchange&&!/argue|fight|거절|싸움|다툼|拒否|喧嘩/.test([s.kind,s.title].join(' '))&&(s.withIds||[]).length<=1&&/talk|chat|대화|이야기|話/.test([s.kind,s.title,s.activityFamily].join(' '));
const ranks=c=>courtWorldData.ranks.find(r=>r.id===c?.courtRankId);
const awareness=c=>Number.isFinite(Number(c.courtAwareness))?Math.max(0,Math.min(100,Number(c.courtAwareness))):50;
export function courtEncounter(world,c,scene,otherScene,now,lang=world.uiLanguage||'ko'){
 if(scene?.courtEncounter)scene={...scene,desc:scene.courtBaseDesc,courtEncounter:false};
 const empty=()=>({scene,changed:false,records:[]}),b=world.characters?.[scene?.withId];
 if(world.sharedContext?.groupId||!c||!b||c.id===b.id||!Number.isFinite(now)||!eligible(scene)||!eligible(otherScene)||otherScene.withId!==c.id)return empty();
 const town=c.townId===world.activeTownId?world.world:world.towns?.find(t=>t.id===c.townId);
 if(!c.townId||c.townId!==b.townId||town?.courtTheme!=='court'||!ranks(c)||!ranks(b))return empty();
 // Both live scenes must refer to the same actual location, not merely name a partner.
 const loc=(s,actor)=>s.home?'home:'+(s.visitHomeId||actor.homeId||'')+':'+(s.room||''):'place:'+(s.placeId||'');
 if(!scene.home&&!scene.placeId||!otherScene.home&&!otherScene.placeId||loc(scene,c)!==loc(otherScene,b))return empty();
 const participants=[c,b].sort((x,y)=>ranks(y).level-ranks(x).level||x.id.localeCompare(y.id)),[high,low]=participants;
 const key=participants.map(x=>x.id+':'+x.courtRankId+':'+awareness(x)+':'+(x.courtFaction||'neutral')).join('|');
 let active=[c.courtLife?.active,b.courtLife?.active].find(e=>e?.key===key&&now>=e.at&&now<e.until),changed=false,records=[];
 if(!active){
  const recent=[...(c.courtLife?.history||[]),...(b.courtLife?.history||[])].filter(e=>e.members?.includes(c.id)&&e.members?.includes(b.id));
  if(recent.some(e=>now<e.at||now-e.at<6*hour))return empty();
  const x=relationMetrics(world,high.id,low.id),y=relationMetrics(world,low.id,high.id),close=Math.min(x.closeness,y.closeness),tension=Math.max(x.tension,y.tension),aware=Math.max(awareness(high),awareness(low));
  const hostile=['crown','reform'].includes(high.courtFaction)&&['crown','reform'].includes(low.courtFaction)&&high.courtFaction!==low.courtFaction;
  const category=hostile||tension>=40?'rivalry':close>=60?'close':aware<=25?'candid':ranks(high).level===ranks(low).level?'equal':high.courtRankId==='sovereign'?'audience':Math.min(x.comfort,y.comfort)<25?'reassurance':low.courtRankId==='commoner'&&aware<75?'practical':'formal';
  const count=Math.max(c.courtLife?.count||0,b.courtLife?.count||0)+1,row=(hash(key)+count)%courtEncounterCopy[category].length;
  active={id:'court:'+key+':'+now,key,at:now,until:now+6*hour,members:participants.map(p=>p.id),names:participants.map(p=>p.name),category,row};
  for(const actor of participants){actor.courtLife={count,active,history:[...(actor.courtLife?.history||[]),active].slice(-24)};const index=participants.indexOf(actor),name=participants[1-index].name;
   records.push({characterId:actor.id,item:{storyReflection:true,courtInteraction:true,interactionId:active.id,kind:'reflection',title:({ko:'신분 사이의 대화',en:'A conversation across ranks',ja:'身分をめぐる会話'})[lang]||'신분 사이의 대화',desc:courtEncounterCopy[category][row][index][{ko:0,en:1,ja:2}[lang]??0].replaceAll('{name}',name),minute:new Date(now).getHours()*60+new Date(now).getMinutes(),holdMinutes:0,localizedCopy:true}});
  }
  changed=true;
 }
 const index=active.members.indexOf(c.id),text=courtEncounterCopy[active.category]?.[active.row]?.[index]?.[{ko:0,en:1,ja:2}[lang]??0];
 if(!text)return empty();
 return {scene:{...scene,courtEncounter:true,courtBaseDesc:scene.desc||'',desc:(scene.desc||'')+' '+text.replaceAll('{name}',b.name)},changed,records};
}