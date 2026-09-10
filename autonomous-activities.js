export const AUTONOMOUS_ACTIVITIES={
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
 const patterns=[['talk',/생각을 나누|대화|토론|이야기를 나누|exchanging.*views|exchanging.*thought|conversation|discuss|互いの考え|話し合|会話/i],['games',/게임|game|ゲーム/i],['cleaning',/청소|쓸고|먼지를 닦|정리하는|정돈하는|cleaning|tidying|掃除|整理|片づけ/i],['reading',/책을 읽|독서|reading|読書|本を読/i],['music',/음악을 듣|연주|music|音楽|演奏/i],['exercise',/운동|달리기|스트레칭|exercis|workout|stretch|運動|ストレッチ/i],['cooking',/요리|조리|cooking|料理|調理/i]];
 return patterns.find(([,pattern])=>pattern.test(title))?.[0]||null;
}
export const autonomousAllowed=(character,scene)=>!character?.autonomousActivityBlocks?.includes(autonomousActivity(scene));
export function applyAutonomousPolicy(character,scene,characters={},language='ko'){
 const participants=[character,...[...(scene.withIds||[]),scene.withId].filter(Boolean).map(id=>characters[id]).filter(Boolean)];
 if(participants.every(person=>autonomousAllowed(person,scene)))return scene;
 const copy={ko:['잠시 쉬는 중','하던 일을 멈추고 자기 자리에서 잠시 숨을 돌리고 있어요.'],en:['Taking a short break','They stop what they were doing and take a moment in their own space.'],ja:['少し休憩しているところ','していたことをやめ、自分の場所でひと息ついています。']}[language]||['잠시 쉬는 중','하던 일을 멈추고 잠시 쉬고 있어요.'];
 return {...scene,title:copy[0],desc:copy[1],baseTitle:copy[0],baseDesc:copy[1],activityFamily:null,groupInteraction:false,withId:undefined,withIds:[],participantOrder:[],interactionId:undefined,sharedPerspectives:undefined,sharedCanonicalTitle:undefined,sharedCanonicalDesc:undefined,autonomyAdjusted:true};
}
