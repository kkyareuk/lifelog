const tri=(ko,en,ja)=>({ko,en,ja});
const option=(value,ko,en,ja)=>({value,text:tri(ko,en,ja)});
export const DISCOVERY_SCENES=[
 {id:'company',field:'socialStyle',icon:'☕',animation:'talk',match:/대화|이야기|담소|talk|chat|conversation|会話|話し/i,question:tri('이야기가 이어지는 동안, 이 캐릭터는 어떻게 어울릴까요?','As the conversation continues, how do they join in?','会話が続く中、この人はどう過ごすでしょう？'),choices:[option('혼자가 편함','짧게 인사를 나누고 혼자 있을 시간을 찾는다','Exchange a few words, then seek some time alone','少し言葉を交わしてから、一人の時間を探す'),option('조용히 어울림','곁에서 이야기를 듣다가 가끔 한마디를 보탠다','Listen nearby and add a few words now and then','そばで聞きながら、時々言葉を添える'),option('먼저 다가감','궁금한 것을 물으며 먼저 이야기를 이어 간다','Ask a question and keep the conversation going','気になることを尋ね、自分から話を続ける')]},
 {id:'tidy',field:'neatness',icon:'✦',animation:'tidy',match:/정리|청소|chores|tidy|clean|整理|掃除/i,question:tri('주변을 정리할 때, 어디까지 손을 댈까요?','While tidying, how far do they go?','片づける時、どこまで手をかけるでしょう？'),choices:[option('조금 느슨함','지금 필요한 자리가 생기면 그만둔다','Stop once there is enough space for now','今必要な場所が空いたら終える'),option('정돈을 좋아함','자주 쓰는 물건부터 제자리에 놓는다','Return the things they use often to their places','よく使う物から元の場所に戻す'),option('흐트러짐을 못 참음','비뚤어진 물건까지 가지런히 맞춘다','Straighten even the slightly crooked objects','少し曲がった物まできちんとそろえる')]},
 {id:'rest',field:'energyRhythm',icon:'☁',animation:'rest',match:/쉬|휴식|rest|relax|休憩|休む/i,question:tri('잠깐 쉬는 시간이 생겼어요. 어떤 시간이 편할까요?','There is time for a short break. What feels comfortable?','少し休む時間です。どんな過ごし方が心地よいでしょう？'),choices:[option('집에서 충전','익숙한 자리에서 조용히 숨을 돌린다','Unwind quietly in a familiar spot','慣れた場所で静かに一息つく'),option('느긋한 편','서두르지 않고 한동안 느긋하게 머문다','Linger for a while without rushing','急がず、しばらくのんびり過ごす'),option('활동적인 편','조금 쉬고 나면 다시 몸을 움직이고 싶어진다','After a short rest, feel ready to move again','少し休むと、また体を動かしたくなる')]},
 {id:'reading',field:'perceptionStyle',icon:'▤',animation:'read',match:/독서|읽|read|book|読書|読む/i,question:tri('읽고 있는 내용에서 무엇이 더 눈에 들어올까요?','What draws their attention in what they are reading?','読んでいる内容の、どこに目が留まるでしょう？'),choices:[option('구체적인 편','눈앞에 그려질 만큼 자세한 묘사를 따라간다','Follow the descriptions they can picture clearly','目に浮かぶほど具体的な描写を追う'),option('균형형','적힌 내용과 그 뒤에 있을 뜻을 함께 생각한다','Consider both the words and what lies behind them','書かれたことと、その奥の意味を考える'),option('직관과 상상 중시','글에 적히지 않은 장면까지 상상해 본다','Imagine scenes beyond what is written','書かれていない場面まで想像する')]},
 {id:'work',field:'planningStyle',icon:'▦',animation:'plan',match:/업무|작업|일하는|work|study|연구|공부|仕事|作業|勉強|研究/i,question:tri('할 일을 앞에 두고, 무엇부터 시작할까요?','With a task ahead, where do they begin?','やることを前に、何から始めるでしょう？'),choices:[option('즉흥적','지금 손이 가는 부분부터 시작한다','Start with whichever part catches their interest','今手をつけたい部分から始める'),option('유연한 편','큰 흐름만 잡고 하면서 순서를 바꾼다','Set a broad direction and adjust along the way','大まかな流れを決め、進めながら順序を変える'),option('계획적','순서와 끝낼 지점을 먼저 정한다','Decide the order and a stopping point first','順序と終える地点を先に決める')]},
 {id:'discuss',field:'decisionStyle',icon:'…',animation:'talk',match:/토론|의견|debate|discuss|議論|意見/i,question:tri('의견을 나눌 때, 판단의 기준은 어디에 둘까요?','When exchanging views, what guides their judgment?','意見を交わす時、何を判断の基準にするでしょう？'),choices:[option('논리 우선','주장의 근거가 서로 맞는지 먼저 살핀다','First check whether the reasons hold together','まず主張の根拠が筋道立っているか確かめる'),option('균형형','이유와 각자의 사정을 함께 따져 본다','Weigh the reasons alongside everyone’s circumstances','理由とそれぞれの事情を一緒に考える'),option('공감 우선','그 말을 꺼내기까지의 마음을 먼저 헤아린다','First consider the feelings behind the words','その言葉を口にするまでの気持ちを考える')]}
];
export const DISCOVERY_AXES={
 socialStyle:{values:['혼자가 편함','낯을 가림','조용히 어울림','먼저 다가감','무리의 중심'],numeric:'socialEnergy'},
 neatness:{values:['어질러도 편함','조금 느슨함','보통','정돈을 좋아함','흐트러짐을 못 참음']},
 energyRhythm:{values:['집에서 충전','느긋한 편','상황에 따라','활동적인 편','가만히 못 있음']},
 perceptionStyle:{values:['눈앞의 현실 중시','구체적인 편','균형형','가능성 중시','직관과 상상 중시'],numeric:'sensingIntuition'},
 planningStyle:{values:['즉흥적','유연한 편','상황에 따라','미리 정리함','계획적'],numeric:'perceivingJudging'},
 decisionStyle:{values:['논리 우선','이성적인 편','균형형','마음을 살핌','공감 우선'],numeric:'thinkingFeeling'},
 interference:{values:['방관자','요청할 때만 도움','적당히 관여','챙기고 확인함','강하게 간섭함','통제광']}
};
DISCOVERY_SCENES.push({id:'involvement',field:'interference',icon:'…',animation:'talk',match:/대화|이야기|토론|talk|chat|discuss|会話|話し|議論/i,question:tri('함께 할 일의 순서를 정하고 있어요. 이 캐릭터는 어떻게 할까요?','They are deciding how to approach a shared task. What do they do?','一緒にすることの順序を決めています。この人はどうするでしょう？'),choices:[option('방관자','상대가 정할 때까지 기다렸다가 그 순서에 맞춘다','Wait for the other person to decide and follow their order','相手が決めるのを待ち、その順序に合わせる'),option('적당히 관여','각자 원하는 순서를 묻고 함께 조율한다','Ask what each person prefers and decide together','それぞれの希望を聞き、一緒に調整する'),option('통제광','먼저 순서를 정하고 상대에게 그대로 해 달라고 말한다','Set the order first and ask the other person to follow it','先に順序を決め、相手にそのとおり進めてほしいと伝える')]});
export const DISCOVERY_FIELDS=Object.keys(DISCOVERY_AXES);
const clamp=v=>Math.max(0,Math.min(100,v));
export const discoveryLocked=(c,field)=>c.discovery?.locks?.[field]??c.discovery?.version!==1;
export function discoveryScore(c,field){
 const axis=DISCOVERY_AXES[field],saved=c.discovery?.scores?.[field];
 if(Number.isFinite(saved))return clamp(saved);
 const i=axis.values.indexOf(c[field]);
 if(i>=0)return i/(axis.values.length-1)*100;
 return axis.numeric&&Number.isFinite(c[axis.numeric])?clamp(c[axis.numeric]/6*100):50;
}
export function manualDiscoveryPatch(c,patch){
 const aliases=Object.fromEntries(Object.entries(DISCOVERY_AXES).filter(([,a])=>a.numeric).map(([f,a])=>[a.numeric,f]));
 const fields=Object.keys(patch).map(k=>aliases[k]||k).filter(k=>DISCOVERY_FIELDS.includes(k));if(!fields.length)return patch;
 const scores={...c.discovery?.scores},result={...patch};
 for(const field of fields){const axis=DISCOVERY_AXES[field];let value;
  if(axis.numeric&&Object.hasOwn(patch,axis.numeric)){value=clamp(Number(patch[axis.numeric])/6*100);result[field]=axis.values[Math.round(value/100*(axis.values.length-1))];}
  else {const i=axis.values.indexOf(patch[field]);value=i<0?50:i/(axis.values.length-1)*100;if(axis.numeric)result[axis.numeric]=Math.round(value/100*6);}
  scores[field]=value;
 }
 return {...result,discovery:{...c.discovery,version:c.discovery?.version||0,scores,locks:{...c.discovery?.locks,...Object.fromEntries(fields.map(f=>[f,true]))}}};
}
export function discoveryCandidates(c,scene){if(!scene||scene.sceneUnavailable||scene.remote)return [];const text=[scene.title,scene.desc,scene.kind].filter(Boolean).join(' ');return DISCOVERY_SCENES.filter(s=>s.match.test(text)&&!discoveryLocked(c,s.field));}
export function discoveryAnswer(c,question,index,now=Date.now()){
 if(!DISCOVERY_SCENES.includes(question)||!Number.isInteger(index)||!question.choices[index]||discoveryLocked(c,question.field))return null;
 const field=question.field,axis=DISCOVERY_AXES[field],before=discoveryScore(c,field),target=index*50;
 // Each answer nudges the existing tendency by at most four points; it never replaces it.
 const score=clamp(before+Math.max(-4,Math.min(4,(target-before)*.16))),value=axis.values[Math.round(score/100*(axis.values.length-1))];
 return {[field]:value,...(axis.numeric?{[axis.numeric]:Math.round(score/100*6)}:{}),discovery:{...c.discovery,version:c.discovery?.version||0,scores:{...c.discovery?.scores,[field]:score},answers:{...c.discovery?.answers,[field]:{question:question.id,value,at:now,count:(c.discovery?.answers?.[field]?.count||0)+1}},lastPromptAt:now}};
}
export function createDiscoverySession(random=Math.random){let seen=new Map(),nextAt=0;return {reset(){seen.clear();nextAt=0;},offer(c,scene,{now=Date.now(),blocked=false}={}){const key=[new Date(now).toDateString(),scene?.minute,scene?.interactionId,scene?.title].join('|'),previous=seen.get(c.id);seen.set(c.id,key);if(seen.size>100)seen.delete(seen.keys().next().value);if(previous===undefined||previous===key||blocked||now<nextAt||now-Number(c.discovery?.lastPromptAt||0)<180000)return null;const choices=discoveryCandidates(c,scene);if(!choices.length||random()>.55)return null;nextAt=now+180000+random()*300000;return choices[Math.floor(random()*choices.length)]||null;}};}
