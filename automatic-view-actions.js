import {viewSignals} from './relationship-context.js?v=20260909dev305';
import {roomActivityAllowed} from './room-activities.js?v=20260909dev305';
export function viewExpressionAction(actor,other,view,reverse,room){
 const signal=viewSignals(view),back=viewSignals(reverse);
 let kind=signal.guarded||signal.afraid||signal.uncomfortable?'request_space':signal.romantic||signal.caring?'compliment':null;
 if(!kind)return null;
 if(signal.romantic&&back.romantic&&!back.guarded&&!back.afraid&&[view,reverse].every(v=>/포옹·기대기까지|입맞춤까지|성인 간 친밀한/.test(v.touchIntensity||'')))kind='hug';
 const group=kind==='request_space'?'talk':'affection';
 if([actor,other].some(c=>c.autonomousActivityBlocks?.includes(group)||c.autonomousActivityBlocks?.includes('talk'))||!roomActivityAllowed(room,{kind}))return null;
 return kind;
}
export function sameExpressionPlace(a,b,actor,other){
 if(!a?.home||!b?.home||a.transit||b.transit||a.meetingJourney||b.meetingJourney||!a.room||a.room!==b.room)return false;
 return (a.visitHomeId||actor.homeId)===(b.visitHomeId||other.homeId);
}
