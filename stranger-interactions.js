import {viewSignals} from './relationship-context.js?v=20260909dev305';

// Relationship status is a separate tier, not a bonus that another score can erase.
export function interactionPriority(relation,...views){
 if(relation&&relation.temporalStatus!=='past')return 2;
 return views.some(view=>{const s=viewSignals(view);return !s.afraid&&!s.guarded&&!s.hostile&&!s.annoyed&&!s.uncomfortable&&(s.romantic||s.caring||['믿음','깊이 믿음','절대적으로 믿음'].includes(view?.trust));})?1:0;
}
const copies={
 ko:[
  ['처음 말을 건네는 중','서로 길을 비켜 주려다 같은 쪽으로 움직이자, 한발 물러서서 먼저 지나가라고 말했어요.','길을 양보받고 짧게 감사 인사를 건넨 뒤 지나갔어요.'],
  ['짧게 인사를 나누는 중','곁에 있던 사람에게 가볍게 인사를 건넸어요. 아직 서로를 잘 몰라 사적인 질문까지 꺼내지는 않았어요.','처음 듣는 인사에 짧게 답하고, 하던 일로 돌아갔어요.'],
  ['주변을 함께 확인하는 중','주변을 두리번거리다 곁에 있던 사람에게 지금 몇 시인지 물었어요.','시간을 묻는 말을 듣고 시각을 확인해 알려 주었어요. 긴 대화로 이어지지는 않았어요.'],
  ['서로 자리를 비켜 주는 중','상대가 지나갈 공간을 남겨 두고 옆으로 비켜섰어요. 별다른 말을 붙이지는 않았어요.','비켜 준 틈으로 지나가며 짧게 고개를 숙였어요.']
 ],
 en:[
  ['Speaking for the first time','They both stepped the same way while making room, so they stepped back and offered to let the other person pass first.','They briefly thanked the stranger for making room and passed by.'],
  ['Exchanging a brief greeting','They offered a light greeting to the person nearby, without asking personal questions of someone they barely knew.','They returned the unfamiliar greeting briefly, then went back to what they were doing.'],
  ['Checking the time','After looking around, they asked the person nearby what time it was.','They checked the time and answered. It did not turn into a long conversation.'],
  ['Making room for each other','They stepped aside to leave enough room for the other person to pass, without starting a conversation.','They passed through the space with a brief nod of thanks.']
 ],
 ja:[
  ['初めて声をかけるところ','道を譲ろうとして同じ方へ動いてしまい、一歩下がって先にどうぞと声をかけました。','道を譲ってもらい、短くお礼を伝えて通り過ぎました。'],
  ['短く挨拶するところ','そばにいた人に軽く挨拶しました。まだよく知らない相手なので、私的な質問はしませんでした。','初めて聞く挨拶に短く答え、していたことに戻りました。'],
  ['時刻を確かめるところ','辺りを見回してから、そばにいた人に今何時か尋ねました。','時刻を尋ねられて確認し、伝えました。長い会話にはなりませんでした。'],
  ['互いに場所を譲るところ','相手が通れるだけの隙間を残して横へよけました。それ以上は話しかけませんでした。','空けてもらった場所を通りながら、軽く会釈しました。']
 ]
};
export function strangerScene(first,second,seed=0,language='ko'){
 const bank=copies[language]||copies.ko,copy=bank[Math.abs(seed)%bank.length];
 return {title:copy[0],firstTitle:copy[0],secondTitle:copy[0],first:copy[1],second:copy[2],relationshipContext:true};
}
