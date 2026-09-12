export const AUTONOMOUS_ACTIVITIES={
 art:['그림·창작','Art and crafts','絵・創作'],shopping:['쇼핑','Shopping','買い物'],grooming:['몸단장','Grooming','身支度'],gardening:['식물 돌보기','Gardening','植物の手入れ'],collecting:['수집·전시','Collecting','収集'],digital:['전자기기 만지기','Using devices','電子機器を使う'],conflict:['다툼 시작하기','Starting arguments','喧嘩を始める'],affection:['애정 표현','Affection','愛情表現'],care:['남을 챙기는 활동','Caring for others','人を気遣う'],
 talk:['서로의 생각을 나누는 활동','Exchanging thoughts','互いの考えを話す活動'],
 games:['게임하는 활동','Playing games','ゲームをする活動'],
 cleaning:['청소·정리하는 활동','Cleaning and tidying','掃除・整理する活動'],
 reading:['책을 읽는 활동','Reading','読書する活動'],
 music:['음악을 듣거나 연주하는 활동','Listening to or playing music','音楽を聴く・演奏する活動'],
 exercise:['운동하는 활동','Exercising','運動する活動'],
 cooking:['요리하는 활동','Cooking','料理する活動']
};
export const activityLabel=(key,language='ko')=>AUTONOMOUS_ACTIVITIES[key]?.[{ko:0,en:1,ja:2}[language]||0]||key;
export function autonomousActivity(scene={}){
 const title=String(scene.title||'');
 if(scene.manualDirective||scene.routineId||scene.transit||/수면|잠자|자는 중|잠든|기상|식사|먹는 중|치료|복약|sleep|asleep|waking|eating|treatment|眠|食事|治療/i.test(title))return null;
 if(AUTONOMOUS_ACTIVITIES[scene.activityFamily])return scene.activityFamily;
 const patterns=[['art',/그림|스케치|색칠|만들기|공예|painting|sketch|craft|描|工作/i],['shopping',/쇼핑|구매|shopping|買い物/i],['grooming',/머리.*손질|화장|몸단장|groom|髪.*整/i],['gardening',/화분|식물.*돌|물.*주|gardening|植物/i],['collecting',/수집|진열|collect|収集/i],['digital',/전자기기|휴대폰|사진첩|device|phone|スマホ/i],['conflict',/다투|싸우|언쟁|arguing|fighting|喧嘩/i],['affection',/포옹|키스|손.*잡|hug|kiss|抱きしめ|キス/i],['care',/챙겨|위로|달래|comfort|気遣|慰め/i],['talk',/생각을 나누|대화|토론|이야기를 나누|exchanging.*views|exchanging.*thought|conversation|discuss|互いの考え|話し合|会話/i],['games',/게임|game|ゲーム/i],['cleaning',/청소|쓸고|먼지를 닦|정리하는|정돈하는|cleaning|tidying|掃除|整理|片づけ/i],['reading',/책을 읽|독서|reading|読書|本を読/i],['music',/음악을 듣|연주|music|音楽|演奏/i],['exercise',/운동|달리기|스트레칭|exercis|workout|stretch|運動|ストレッチ/i],['cooking',/요리|조리|cooking|料理|調理/i]];
 return patterns.find(([,pattern])=>pattern.test(title))?.[0]||null;
}
export const autonomousAllowed=(character,scene)=>!character?.autonomousActivityBlocks?.includes(autonomousActivity(scene));
export function applyAutonomousPolicy(character,scene,characters={},language='ko'){
 const participants=[character,...[...(scene.withIds||[]),scene.withId].filter(Boolean).map(id=>characters[id]).filter(Boolean)];
 if(participants.every(person=>autonomousAllowed(person,scene)))return scene;
 const copy={ko:['잠시 쉬는 중','하던 일을 멈추고 자기 자리에서 잠시 숨을 돌리고 있어요.'],en:['Taking a short break','They stop what they were doing and take a moment in their own space.'],ja:['少し休憩しているところ','していたことをやめ、自分の場所でひと息ついています。']}[language]||['잠시 쉬는 중','하던 일을 멈추고 잠시 쉬고 있어요.'];
 return {...scene,title:copy[0],desc:copy[1],baseTitle:copy[0],baseDesc:copy[1],activityFamily:null,groupInteraction:false,withId:undefined,withIds:[],participantOrder:[],interactionId:undefined,sharedPerspectives:undefined,sharedCanonicalTitle:undefined,sharedCanonicalDesc:undefined,autonomyAdjusted:true};
}

export function applyEatingSleepSetting(c,scene,language='ko'){
 const title=scene.baseTitle||scene.title||'';
 const sleepless=c.sleepHabit==='잠을 전혀 이루지 못함'&&(/자는 중|잠드는 중|수면|잠들어|깊이 잠|기상/.test(title)||scene.sleeping===true);
 const meal=/식사|먹는 중|아침을 먹|점심을 먹|저녁을 먹/.test(title);
 const skipped=meal&&(c.foodHabit==='먹지 않음'||c.foodHabit==='거의 먹지 않음'&&[...String(c.id)+':'+String(scene.minute||0)].reduce((n,ch)=>n+ch.charCodeAt(0),0)%4!==0);
 if(!sleepless&&!skipped)return scene;
 const copies=sleepless?{ko:['잠을 이루지 못하는 중','잠이 오지 않아 뒤척이다가 조용히 쉬고 있어요.'],en:['Unable to fall asleep','They cannot fall asleep and are resting quietly after tossing and turning.'],ja:['眠れずにいるところ','寝つけず寝返りを打ったあと、静かに休んでいます。']}:{ko:['식사 시간에 쉬는 중','음식을 먹는 대신 잠시 자기 시간을 보내고 있어요.'],en:['Taking a break at mealtime','They are taking some time for themselves instead of eating.'],ja:['食事の時間に休んでいるところ','食べる代わりに、自分の時間を過ごしています。']};
 const [name,desc]=copies[language]||copies.ko;
 return {...scene,title:name,desc,baseTitle:name,baseDesc:desc,mood:sleepless?'피곤함':'평온',sleeping:false,groupInteraction:false,withId:undefined,withIds:[],sharedPerspectives:undefined,sharedCanonicalTitle:undefined,sharedCanonicalDesc:undefined};
}
