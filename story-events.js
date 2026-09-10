const txt=(ko,en,ja)=>({ko,en,ja});
const day=now=>{const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function rememberScene(c,scene,now=Date.now()){
 if(!c||!scene||scene.sceneUnavailable||scene.remote)return false;
 const date=day(now),key=[date,scene.interactionId||scene.minute||'',scene.kind||'',scene.title||''].join('|');
 if(c.storyLastScene===key)return false;
 const title=String(scene.title||''),kind=scene.kind||scene.actionKind||'',other=scene.withId||scene.withIds?.find(id=>id!==c.id)||'';
 const type=other&&(/fight|argue|insult|taunt/i.test(kind)||/다투|싸우|언쟁|arguing|argument|fighting|言い争|喧嘩/i.test(title))?'conflict':/cook/i.test(kind)||/요리|조리|cooking|料理|調理/i.test(title)?'cooking':null;
 c.storyDays={...(c.storyDays||{}),[date]:{...c.storyDays?.[date],home:!!scene.home||!!c.storyDays?.[date]?.home,outside:scene.home===false||!!c.storyDays?.[date]?.outside}};
 c.storyDays=Object.fromEntries(Object.entries(c.storyDays).sort().slice(-30));
 c.storyMemory=(c.storyMemory||[]).filter(e=>e.at<=now&&now-e.at<60*86400000).slice(-119);
 if(type&&!c.storyMemory.some(e=>e.id===key))c.storyMemory.push({id:key,at:now,date,type,targetId:other,title:title.slice(0,160),desc:String(scene.desc||'').slice(0,400)});
 c.storyLastScene=key;return true;
}
const option=(text,targets,intent)=>({text,targets,effects:{},intent});
export function storyQuestions(c,characters={},now=Date.now()){
 const answered=new Set(c.discovery?.answered||[]),events=(c.storyMemory||[]).filter(e=>now-e.at<7*86400000&&e.at<=now),questions=[];
 const conflict=[...events].reverse().find(e=>e.type==='conflict'&&characters[e.targetId]&&!answered.has('story:'+e.id));
 if(conflict){const name=characters[conflict.targetId].name;questions.push({id:'story:'+conflict.id,story:true,eventId:conflict.id,targetId:conflict.targetId,icon:'💬',animation:'think',question:txt(`${name}와 다툰 뒤, 아직 못 한 말이 떠올랐어요. 어떻게 할까요?`,`After the argument with ${name}, something remains unsaid. What now?`,`${name}と言い争ったあと、言えなかったことが浮かびました。どうしますか？`),choices:[
 option(txt('내가 심했던 부분부터 인정한다.','Admit where I went too far.','自分が言いすぎたところから認める。'),{decisionStyle:73,aggressionLevel:12},'apology'),
 option(txt('사과는 아직 싫다. 그래도 상대 이야기는 들어본다.','Not ready to apologize, but willing to listen.','まだ謝りたくない。でも話は聞いてみる。'),{decisionStyle:61,aggressionLevel:31},'listen'),
 option(txt('아무렇지 않은 척 간식을 하나 더 놓아둔다.','Leave an extra snack as if nothing happened.','何でもないふりでお菓子を一つ多く置く。'),{decisionStyle:67,socialStyle:34},'care'),
 option(txt('다음에는 밀리지 않겠다며 반박할 말을 준비한다.','Prepare a rebuttal for next time.','次は負けないと反論を用意する。'),{planningStyle:86,aggressionLevel:77},'defend'),
 option(txt('지금 말하면 또 싸울 것 같다. 혼자 식힌다.','Cool off alone before another argument starts.','今話すとまた喧嘩になりそう。一人で頭を冷やす。'),{socialStyle:19,aggressionLevel:38},'distance') ]});}
 const cooking=events.filter(e=>e.type==='cooking');if(cooking.length>=3){const e=cooking.at(-1);questions.push({id:'story:cooking:'+e.id,story:true,eventId:e.id,icon:'🍳',animation:'happy',question:txt('요리한 날들이 쌓였어요. 익숙해진 손놀림으로 다음엔 무엇을 해볼까요?','Cooking is becoming familiar. What would you try next?','料理を重ね、手つきも慣れてきました。次はどうしますか？'),choices:[
 option(txt('누군가에게 대접할 한 접시를 연습한다.','Practice a dish to serve someone.','誰かに振る舞う一皿を練習する。'),{decisionStyle:78,planningStyle:71},'share'),option(txt('레시피는 치운다. 오늘은 감으로 해본다.','Put the recipe away and improvise.','レシピを閉じ、今日は勘で作る。'),{planningStyle:18},'improvise'),option(txt('같은 메뉴를 다시 만든다. 이번엔 더 정확하게.','Repeat the dish and refine it.','同じ料理をもう一度、もっと正確に。'),{planningStyle:89,neatness:81},'practice'),option(txt('먹는 건 좋지만 설거지는 남에게 미루고 싶다.','Enjoy the meal and wish someone else would wash up.','食べるのは好き。でも洗い物は誰かに任せたい。'),{neatness:17},'relax'),option(txt('실패한 맛이 억울해서 될 때까지 덤빈다.','Keep trying until that failed dish works.','失敗した味が悔しくて、できるまで挑む。'),{planningStyle:62,aggressionLevel:46},'persist') ]});}
 const recentDays=Object.entries(c.storyDays||{}).filter(([d])=>new Date(d+'T00:00:00').getTime()>=now-4*86400000).sort().slice(-3);if(recentDays.length===3&&recentDays.every(([,v])=>v.home&&!v.outside)){const id='story:home:'+day(now);questions.push({id,story:true,eventId:id,icon:'🚪',animation:'think',question:txt('최근 기록에는 집에서 보낸 날이 이어져요. 오늘은 어떻게 보내고 싶나요?','Your recent days were spent at home. What would you like today?','最近の記録は家で過ごす日が続いています。今日はどうしたいですか？'),choices:[option(txt('가까운 길부터 천천히 걸어본다.','Take a short walk nearby.','近くの道をゆっくり歩く。'),{socialStyle:44},'walk'),option(txt('사람이 북적이는 곳으로 간다.','Go somewhere lively.','人で賑わう場所へ行く。'),{socialStyle:88},'visit'),option(txt('집이 좋은데 굳이? 내 공간을 더 편하게 만든다.','Why leave? Make my space more comfortable.','家が好きなのに？もっと居心地よくする。'),{socialStyle:14,neatness:72},'stay'),option(txt('친한 사람 한 명에게 같이 나가자고 묻는다.','Ask one close friend to come along.','親しい人を一人誘ってみる。'),{socialStyle:55,decisionStyle:68},'invite'),option(txt('어디로 갈지 정하지 않고 문부터 연다.','Open the door without a destination in mind.','行き先を決めずにまず扉を開く。'),{planningStyle:9},'spontaneous') ]});}
 return questions.filter(q=>!answered.has(q.id));
}

export function reflectStory(c,scene,now,language='ko'){
 if(!scene?.withId||scene.manualDirective||scene.homeEncounter&&!scene.homeEncounter.arrived||!/talk|chat|대화|이야기|話/.test([scene.kind,scene.title].join(' ')))return scene;
 const r=[...(c.storyResponses||[])].reverse().find(r=>r.targetId===scene.withId&&r.at<=now&&now-r.at<7*86400000);if(!r)return scene;
 const lines={apology:txt('지난번 말이 거칠었던 건 미안했다며, 이번에는 먼저 자신의 잘못을 꺼내요.','They begin by apologizing for their harsh words last time.','前に言いすぎたことを謝り、先に自分の非を認めています。'),listen:txt('반박이 떠올라도 잠시 삼키고, 지난번 못다 들은 말을 끝까지 기다려요.','They hold back their rebuttal and hear out what was left unfinished.','反論を飲み込み、前に聞ききれなかった話を最後まで待っています。'),distance:txt('지난 다툼이 떠올라 말을 고르며, 잠시 거리를 두고 마음을 가라앉혀요.','Remembering the argument, they choose their words and give themselves space.','前の喧嘩を思い出し、言葉を選びながら少し距離を置いています。'),defend:txt('이번에는 자기 입장도 끝까지 설명하고 싶어, 준비했던 말을 차례로 꺼내요.','Wanting their side heard, they lay out the points they prepared.','今度は自分の立場も聞いてほしくて、用意した言葉を順に口にしています。')};
 const extra=lines[r.intent];return extra?{...scene,desc:scene.desc+' '+(extra[language]||extra.ko)}:scene;
}
