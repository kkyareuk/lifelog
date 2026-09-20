// Authored, deterministic scenes. Free-form biographies never become executable rules.
const line=(ko,en,ja)=>({ko,en,ja});
const roles={royal:line('왕족','Royal','王族'),noble:line('귀족','Noble','貴族'),knight:line('기사','Knight','騎士'),official:line('관료','Official','官僚'),mage:line('궁정 마법사','Court mage','宮廷魔術師'),attendant:line('시종','Attendant','侍従')};
const factions={crown:line('왕실파','Royalists','王室派'),reform:line('개혁파','Reformists','改革派'),neutral:line('중립','Independent','中立')};
const traits={courtesy:line('예의를 중시함','Values courtesy','礼儀を重んじる'),honesty:line('솔직함을 좋아함','Values honesty','率直さを好む'),warmth:line('다정함을 좋아함','Values warmth','優しさを好む'),privacy:line('혼자만의 여유가 필요함','Needs personal space','一人の時間が必要')};
const choice=(id,text,style,effect)=>({id,text,style,effect});
const scenes=[
 {id:'greeting',title:line('정원에서의 인사','A garden greeting','庭園での挨拶'),formal:false,
  prompt:line('정원 길에서 눈이 마주쳤다. 상대가 걸음을 늦추며 인사를 기다린다.','Your eyes meet on the garden path. They slow down, waiting for your greeting.','庭園の小道で目が合った。相手は歩みを緩め、挨拶を待っている。'),
  speech:line('산책 중이셨나요?','Were you taking a walk?','お散歩中でしたか？'),choices:[
   choice('bow',line('“좋은 오후입니다.” 예의를 갖춰 인사한다.','“Good afternoon.” Offer a courteous greeting.','「良い午後ですね」礼儀正しく挨拶する。'),'courtesy',{trust:2,closeness:1}),
   choice('welcome',line('“만나서 반가워요.” 사람들이 보는 앞에서 친근하게 다가간다.','“It is lovely to see you.” Approach warmly in front of others.','「会えて嬉しいです」人前で親しげに近づく。'),'warmth',{affection:2,closeness:1}),
   choice('space',line('“혼자 걷고 싶으면 편히 말씀하세요.”','“Please tell me if you would rather walk alone.”','「一人で歩きたければ、遠慮なく言ってください」'),'privacy',{comfort:2,trust:1})]},
 {id:'rest',title:line('연회가 끝난 뒤','After the banquet','宴のあと'),formal:false,
  prompt:line('연회가 끝난 정원. 상대가 장갑을 벗으며 길게 숨을 내쉰다.','In the garden after the banquet, they remove their gloves and let out a long breath.','宴のあとの庭園。相手は手袋を外し、長く息を吐いた。'),speech:line('오늘은 유난히 긴 하루였네요.','Today felt unusually long.','今日はずいぶん長い一日でしたね。'),choices:[
   choice('praise',line('“오늘 맡은 일을 훌륭히 해내셨더군요.”','“You handled your duties admirably today.”','「今日のお役目、見事でしたね」'),'courtesy',{trust:2,affection:1}),
   choice('ask',line('“무슨 일이 있었는지 들어도 될까요?”','“May I ask what happened?”','「何があったか、聞いてもいいですか？」'),'honesty',{trust:2,closeness:2}),
   choice('quiet',line('“말하지 않아도 괜찮아요. 잠깐 쉬어요.”','“You do not have to talk. Let us rest a while.”','「話さなくても大丈夫。少し休みましょう」'),'privacy',{comfort:3,tension:-1})]},
 {id:'taste',title:line('찻잔 너머의 취향','Over a cup of tea','お茶を挟んで'),formal:false,
  prompt:line('작은 찻상에 서로 다른 향의 차가 놓였다.','Teas with different aromas are set on the small table.','小さなテーブルに、香りの異なるお茶が並んだ。'),speech:line('궁정에서는 취향 하나에도 의미를 붙이더군요.','At court, even a preference can be given a hidden meaning.','宮廷では、好みにまで意味をつけられますね。'),choices:[
   choice('sincere',line('“그래도 좋아하는 건 좋아한다고 말하고 싶어요.”','“Even so, I want to be honest about what I enjoy.”','「それでも、好きなものは好きと言いたいです」'),'honesty',{trust:2,closeness:1}),
   choice('share',line('“당신이 좋아하는 차를 같이 맛보고 싶어요.”','“I would like to try your favorite tea with you.”','「あなたの好きなお茶を一緒に味わいたいです」'),'warmth',{affection:2,comfort:1}),
   choice('respect',line('“취향까지 설명할 의무는 없지요.”','“You owe nobody an explanation of your tastes.”','「好みまで説明する義務はありませんね」'),'privacy',{comfort:2,trust:1})]},
 {id:'favor',title:line('작은 부탁','A small favor','小さな頼みごと'),formal:true,
  prompt:line('공식 접견을 앞두고 상대가 흩어진 서류를 정리하고 있다.','Before a formal audience, they are gathering scattered papers.','正式な謁見の前、相手は散らばった書類をまとめている。'),speech:line('순서가 뒤섞였네요. 잠깐 도와주실 수 있나요?','The order is mixed up. Could you help for a moment?','順番が混ざってしまいました。少し手伝っていただけますか？'),choices:[
   choice('ask',line('“어떤 순서인지 알려주시겠어요?”','“Would you tell me the intended order?”','「どの順番か教えていただけますか？」'),'courtesy',{trust:3,comfort:1}),
   choice('admit',line('“이 서류에는 익숙하지 않지만 함께 살펴볼게요.”','“I am unfamiliar with these papers, but I can look with you.”','「詳しくはありませんが、一緒に見てみます」'),'honesty',{trust:2,closeness:1}),
   choice('takeover',line('“제게 전부 맡기세요.” 설명을 듣기 전에 가져간다.','“Leave it all to me.” Take the papers before hearing an explanation.','「全部任せてください」説明を聞く前に書類を受け取る。'),'intrusive',{trust:-2,comfort:-2,tension:2})]},
 {id:'opinion',title:line('서로 다른 생각','A difference of opinion','異なる考え'),formal:true,
  prompt:line('궁정 모임에서 의견이 갈렸다. 상대가 당신의 생각을 묻는다.','Opinions differ at a court gathering. They ask what you think.','宮廷の集まりで意見が分かれ、相手があなたの考えを尋ねた。'),speech:line('모두가 같은 생각일 수는 없겠지요. 당신은 어떤가요?','We cannot all think alike. What do you think?','皆が同じ考えではありませんよね。あなたはどうですか？'),choices:[
   choice('listen',line('“먼저 당신의 이유를 듣고 싶어요.”','“I would like to hear your reasons first.”','「まず、あなたの理由を聞きたいです」'),'courtesy',{trust:2,comfort:1,tension:-1}),
   choice('honest',line('“제 생각은 달라요. 솔직히 이야기해도 될까요?”','“I see it differently. May I speak honestly?”','「私は違う考えです。率直に話してもいいですか？」'),'honesty',{trust:2,tension:1}),
   choice('dismiss',line('“그건 틀린 생각이에요.” 말을 끊는다.','“That is wrong.” Cut them off.','「それは間違っています」話を遮る。'),'intrusive',{trust:-2,comfort:-2,tension:3})]}
];
const responses={
 pleased:line('“그렇게 말씀해 주셔서 기뻐요.” 표정이 한결 부드러워졌다.','“I am glad you said that.” Their expression softens.','「そう言っていただけて嬉しいです」表情が和らいだ。'),
 close:line('“역시 당신 앞에서는 마음이 놓여요.” 긴장했던 어깨가 풀렸다.','“I feel at ease with you.” Their tense shoulders relax.','「やはり、あなたの前では安心できます」肩の力が抜けた。'),
 publicBarrier:line('“반가워요. 다만 지금은 보는 눈이 많네요.” 친근한 인사를 받으면서도 주변을 살폈다.','“It is good to see you, but many eyes are watching.” They welcome you while glancing around.','「会えて嬉しいですが、今は人目が多いですね」親しげな挨拶に応えながらも周囲を気にした。'),
 guarded:line('“아직 그 이야기까지 할 준비는 안 됐어요.” 조심스럽게 선을 그었다.','“I am not ready to talk about that yet.” They gently set a boundary.','「まだ、その話をする心の準備ができていません」そっと一線を引いた。'),
 hurt:line('“제 이야기도 끝까지 들어주셨으면 해요.” 목소리가 굳어졌다.','“I would like you to hear me out.” Their voice stiffens.','「最後まで話を聞いてほしいです」声が硬くなった。'),
 neutral:line('“그렇군요. 말씀은 고마워요.” 잠시 생각에 잠겼다.','“I see. Thank you for saying so.” They pause to think.','「そうですか。ありがとうございます」少し考え込んだ。')
};
const metricKeys=['closeness','affection','trust','comfort','tension'];
const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
function distance(a,b,ranks=require('./court-world-content').ranks){if(a.rankId&&b.rankId){const x=ranks.find(r=>r.id===a.rankId),y=ranks.find(r=>r.id===b.rankId);if(x&&y)return clamp(Math.abs(x.level-y.level)*0.55+(a.faction===b.faction?0:a.faction==='neutral'||b.faction==='neutral'?15:45));}const rank={royal:3,noble:2,knight:1,official:1,mage:1,attendant:0};return clamp(Math.abs(rank[a.role]-rank[b.role])*15+(a.faction===b.faction?0:a.faction==='neutral'||b.faction==='neutral'?15:45));}
function resolve(scene,choiceId,profile,metrics,socialDistance=0){
 const selected=scene.choices.find(c=>c.id===choiceId);if(!selected)throw Object.assign(Error('court-invalid-choice'),{status:400});
 let reaction='neutral',delta={...selected.effect};
 if(selected.style==='intrusive')reaction='hurt';
 else if(scene.id==='rest'&&selected.id==='ask'&&profile.trait==='privacy'&&metrics.trust<50){reaction='guarded';delta={comfort:-2,tension:1};}
 else if(selected.style===profile.trait){reaction=metrics.comfort>=60?'close':'pleased';delta.comfort=(delta.comfort||0)+1;}
 if(scene.id==='greeting'&&selected.id==='welcome'&&socialDistance>=60&&(profile.awareness??50)>=50){reaction='publicBarrier';delta.comfort=-1;}
 const next=Object.fromEntries(metricKeys.map(k=>[k,clamp(metrics[k]+(delta[k]||0))]));
 return {reaction,metrics:next,delta:Object.fromEntries(metricKeys.map(k=>[k,next[k]-metrics[k]]))};
}
module.exports={line,roles,factions,traits,scenes,responses,metricKeys,clamp,distance,resolve};
