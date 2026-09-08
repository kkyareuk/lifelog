// Hearing is derived from the shared directive and actual location, without writes.
export function overheardGossip(world,character,scene,now,language='ko'){
 if(!scene||scene.meetingJourney||scene.meetingWaiting||/자는|수면|sleep|寝て/.test(scene.title||''))return scene;
 const directive=Object.values(world.characterDirectives||{}).find(d=>d.kind==='gossip'&&d.subjectId===character.id&&d.endsAt>now&&d.journey?.arrivesAt<=now);
 if(!directive)return scene;
 const place=directive.journey.to;
 if(!place)return scene;
 const same=scene.home?place.homeId===(scene.visitHomeId||character.homeId)&&place.room===scene.room:!place.homeId&&!!scene.placeId&&scene.placeId===place.placeId&&scene.townId===place.townId;
 if(!same)return scene;
 const traits=JSON.stringify([character.personalityTypes,character.conflictStyle,character.angerResponse,character.emotionalExpression]);
 const shy=/소심|수줍|내향|회피|불안|조심/.test(traits),calm=!shy&&/차분|침착|절제|이성|무덤덤/.test(traits);
 const actor=world.characters[directive.journey.actorId]?.name||'',tone=shy?'surprised':calm?'cold':'angry';
 const variants={
 angry:[['자신의 뒷담화를 듣고 화가 난 상태','목소리를 낮추려 했지만 표정이 굳었어요. 자기 이야기를 하고 있었는지 상대에게 직접 물었어요.'],['들려온 뒷담화에 불쾌함을 드러내는 중','자신을 두고 하는 말을 듣고 미간을 찌푸렸어요. 그런 이야기는 앞에서 해 달라고 분명히 말했어요.']],
 surprised:[['자신의 이야기를 듣고 당황하는 중','뜻밖에 자기 이름이 들리자 말을 잃었어요. 시선을 피하며 방금 들은 말을 되짚고 있어요.'],['뒷담화를 듣고 어쩔 줄 모르는 중','자신에 관한 말에 얼굴이 굳었어요. 바로 끼어들지 못하고 잠시 거리를 두었어요.']],
 cold:[['들려온 뒷담화에 차갑게 반응하는 중','말을 끝까지 들은 뒤 시선을 돌렸어요. 자신에 대한 평가는 직접 이야기해 달라고 차분하게 말했어요.'],['자신의 뒷담화를 듣고 거리를 두는 중','목소리를 높이지는 않았지만 표정이 싸늘해졌어요. 한발 물러서서 대화를 지켜보고 있어요.']]};
 const index=[...String(directive.id)].reduce((n,c)=>n+c.charCodeAt(0),0)%2,[title,desc]=variants[tone][index];
 const translated={en:shy?['Flustered by overheard gossip',`Hearing ${actor} talk about them came as a shock. They look away, unsure how to respond.`]:calm?['Reacting coolly to overheard gossip',`They hear ${actor} discussing them and calmly ask to be addressed directly.`]:['Angry about overheard gossip',`Hearing ${actor} discuss them makes their expression harden. They ask for the remarks to be made to their face.`],ja:shy?['自分のうわさを聞いて戸惑っている',`${actor}が自分について話すのを聞き、言葉を失いました。視線をそらし、どう返すか迷っています。`]:calm?['自分のうわさに冷ややかに反応している',`${actor}の話を聞き、自分への意見は直接伝えてほしいと静かに話しました。`]:['自分の陰口を聞いて怒っている',`${actor}の言葉に表情が険しくなりました。そういう話は直接してほしいとはっきり伝えました。`]};
 const copy=translated[language]||[title,desc];return {...scene,title:copy[0],desc:copy[1],gossipReaction:tone,mood:shy?'당황':calm?'불쾌':'분노',withId:undefined,withIds:[],groupInteraction:false,participantOrder:[]};
}
