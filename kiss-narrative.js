import {relationshipBetween,viewSignals} from './relationship-context.js?v=20260909dev305';
export function kissNarrative(world,actor,target,view={},otherView={},now=Date.now()){
 const relation=relationshipBetween(world,actor.id,target.id),a=viewSignals(view),b=viewSignals(otherView);
 const history=(world.interactions||[]).filter(e=>((e.actorId===actor.id&&e.targetId===target.id)||(e.actorId===target.id&&e.targetId===actor.id))&&now-e.createdAt>=0&&now-e.createdAt<6*3600000);
 const conflict=history.findLastIndex(e=>['argue','fight','insult','taunt'].includes(e.type));
 const repaired=conflict>=0&&history.slice(conflict+1).some(e=>['reconcile','apologize','apology_accepted'].includes(e.type));
 const safe=!a.hostile&&!b.hostile&&!a.guarded&&!b.guarded&&!a.afraid&&!b.afraid&&!a.distrust&&!b.distrust;
 const previous=world.characterDirectives?.[actor.id],recentConflict=previous?.targetId===target.id&&['argue','fight','insult','taunt'].includes(previous.kind)&&now-previous.startedAt>=0&&now-previous.startedAt<6*3600000;
 const reconciliation=(repaired||recentConflict&&(relation?.conflict??100)<40)&&safe&&a.romantic&&b.romantic;
 const cautious=!safe||!a.romantic||!b.romantic||(relation?.intimacy??0)<60;
 const lines=reconciliation?['다툼 뒤 남은 어색함에 잠시 눈을 피했다가, 서로 가까이 다가와 짧은 입맞춤으로 거리를 줄이고 있어요.','Still a little awkward after the disagreement, they briefly look away, then move toward each other for a short kiss.','言い争いの後の気まずさに一度目をそらし、互いに近づいて短い口づけで距離を縮めています。']:cautious?['곧바로 거리를 좁히지 않고 반응을 살피다가, 상대가 다가오는 만큼만 가까워져 짧게 입을 맞추고 있어요.','They watch the other’s response and move only as close as the other does before sharing a brief kiss.','すぐには距離を詰めず相手の反応を見て、近づいてくれた分だけ寄り、短く口づけしています。']:['익숙하게 눈을 맞추다 자연스럽게 거리를 좁히고, 잠깐 입을 맞춘 뒤에도 가까운 곳에서 시선을 나누고 있어요.','They meet each other’s familiar gaze, move closer for a kiss, and linger nearby afterward.','なじんだまなざしを交わして自然に近づき、口づけの後もそばで見つめ合っています。'];
 return Object.fromEntries(['ko','en','ja'].map((lang,i)=>[lang,{title:[`${target.name}와 키스하는 중`,`Kissing ${target.name}`,`${target.name}とキスしているところ`][i],desc:lines[i],relationshipCue:reconciliation?'kiss-reconciled':cautious?'kiss-cautious':'kiss-familiar'}]));
}
