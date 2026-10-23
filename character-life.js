import {lifeStories,secretStories,rankStories} from './character-life-copy.js';
import {knownSecrets} from './character-secrets.js';
import {relationMetrics} from './relationship-metrics.js';
const hour=3600000;
const hash=s=>[...String(s)].reduce((a,x)=>(Math.imul(a,31)+x.charCodeAt(0))>>>0,7);
const select=(pool,key,index)=>pool[(hash(key)+index)%pool.length];
export const storyTitles={ko:'마음에 남은 생각',en:'A lingering thought',ja:'心に残った思い'};
const copy=(row,lang,name='')=>row[({ko:0,en:1,ja:2}[lang]??0)].replaceAll('{name}',name);
const townFor=(world,c)=>{const id=c.townId||world.homes?.[c.homeId]?.townId||world.activeTownId;return id===world.activeTownId?world.world:world.towns?.find(t=>t.id===id)};
const safeSecret=(c,e)=>knownSecrets(c).find(s=>s.id===e.secretId&&s.knowledgeVersion===e.secretVersion&&s.dailyInfluence!=='off');
const eligible=scene=>scene&&!scene.sleeping&&scene.mood!=='수면'&&!scene.transit&&!scene.manualDirective&&!scene.routineId&&!scene.secretSharing&&!scene.traumaReaction&&!scene.remote&&!scene.remoteContact;
export function characterLifeScene(world,c,scene,now,lang=world.uiLanguage||'ko'){
 if(scene?.lifeStory)scene={...scene,desc:scene.lifeStoryBaseDesc,lifeStory:false};
 if(world.sharedContext?.groupId||!eligible(scene)||!Number.isFinite(now))return {scene,changed:false,record:null};
 const life=c.storyLife||{},target=world.characters?.[scene.withId],hasCompany=Boolean(scene.withId||scene.withIds?.length);
 const valid=e=>e&&now>=e.at&&now<e.until&&(!e.secretId||safeSecret(c,e))&&(!e.targetId||world.characters?.[e.targetId])&&(!e.rankId||(townFor(world,c)?.courtTheme==='court'&&c.courtRankId===e.rankId));
 let episode=valid(life.active)?life.active:null,record=null,changed=false;
 if(!episode&&(!life.lastAt||now-life.lastAt>=4*hour)){
  const count=(Number(life.count)||0)+1,turn=count%3,secrets=knownSecrets(c).filter(s=>s.dailyInfluence!=='off');let category='quiet',pool=lifeStories.quiet,secret=null,rankId=null,targetId=null;
  // Reflections never disclose secret contents or silently teach another character a secret.
  if(!hasCompany&&secrets.length&&turn===1){secret=secrets[Math.floor((count-1)/3)%secrets.length];category='secret:'+secret.kind;pool=secretStories[secret.kind];}
  else if(!hasCompany&&townFor(world,c)?.courtTheme==='court'&&rankStories[c.courtRankId]&&turn===2){rankId=c.courtRankId;category='rank:'+rankId;pool=rankStories[rankId];}
  else if(target&&(scene.withIds||[]).length<=1&&/talk|chat|대화|이야기|話/.test([scene.kind,scene.title,scene.activityFamily].join(' '))){
   const m=relationMetrics(world,c.id,target.id),r=Object.values(world.relationships||{}).find(r=>r.temporalStatus!=='past'&&[r.a,r.b].includes(c.id)&&[r.a,r.b].includes(target.id));
   category=m.tension>=40?'tension':m.comfort<25?'boundary':m.affection>=50&&/연인|부부|짝사랑/.test(r?.type||'')?'shy':m.trust>=60?'trust':m.closeness>=30?'warm':'boundary';pool=lifeStories[category];targetId=target.id;
  }else if(!hasCompany){
   const prior=[...(life.history||[])].reverse().find(e=>['warm','trust','shy'].includes(e.category)&&world.characters?.[e.targetId]&&now>=e.at&&now-e.at<48*hour);
   if(prior){category='memory';targetId=prior.targetId;pool=lifeStories.memory;}
   else if(c.secretLife?.lastSharedAt&&now>=c.secretLife.lastSharedAt&&now-c.secretLife.lastSharedAt<24*hour){category='relief';pool=lifeStories.relief;}
  }
  if(hasCompany&&!targetId)return {scene,changed:false,record:null};
  const row=select(pool,c.id+category,count),duration=secret?({brief:2,normal:8,lasting:24}[secret.afterglow]||8):['shy','memory','relief'].includes(category)?12:6;
  episode={id:'life:'+c.id+':'+now+':'+count,category,row,at:now,until:now+duration*hour,targetId,secretId:secret?.id||null,secretVersion:secret?.knowledgeVersion??null,rankId};
  c.storyLife={count,lastAt:now,active:episode,history:[...(life.history||[]),episode].slice(-24)};changed=true;
  record={storyReflection:true,interactionId:episode.id,kind:'reflection',title:storyTitles[lang]||storyTitles.ko,desc:copy(row,lang,world.characters?.[targetId]?.name),minute:new Date(now).getHours()*60+new Date(now).getMinutes(),holdMinutes:0,localizedCopy:true};
 }
 if(!episode)return {scene,changed,record};
 // A secret/rank reflection is private; relationship echoes never mention an unrelated companion.
 const soloMemory=!hasCompany&&episode.targetId&&['warm','trust','shy','memory'].includes(episode.category);
 const show=(!episode.secretId&&!episode.rankId||!hasCompany)&&(!episode.targetId||soloMemory||scene.withId===episode.targetId)&&!(episode.category==='memory'&&hasCompany);
 if((['quiet','relief'].includes(episode.category)&&hasCompany)||!show)return {scene,changed,record};
 return {scene:{...scene,lifeStory:true,lifeStoryBaseDesc:scene.desc||'',lifeStoryId:episode.id,desc:(scene.desc||'')+' '+copy(soloMemory?select(lifeStories.memory,episode.id,0):episode.row,lang,world.characters?.[episode.targetId]?.name)},changed,record};
}
