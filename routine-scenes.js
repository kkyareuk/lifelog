// Pure projection: schedule progress needs no extra database writes or random calls.
const hash=s=>[...s].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
const text=(language,ko,en,ja)=>({ko,en,ja}[language]||ko);
export function routineScene(scene,character,world,now=Date.now(),language='ko'){
 if(!scene?.routineId||scene.routineReturned||scene.returningHome||scene.transit||scene.manualDirective)return scene;
 const date=new Date(now),minute=date.getHours()*60+date.getMinutes()+date.getSeconds()/60,start=Number(scene.routineStartMinute),end=Number(scene.routineEndMinute);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||minute<start||minute>=end)return scene;
 const progress=(minute-start)/(end-start),phase=progress<.15?0:progress<.48?1:progress<.85?2:3;
 const routine=(Array.isArray(world.routines)?world.routines:[]).find(r=>r.id===scene.routineId);
 const seed=hash(`${scene.routineId}:${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`),kind=scene.routineType||routine?.type||'',name=scene.routineTitle||routine?.title||scene.title||'';
 const people=(scene.participantOrder||[character.id]).map(id=>world.characters?.[id]).filter(Boolean),company=people.length>1;
 let title,desc;
 if(/병원|진료|검사|치료|hospital|medical/i.test(kind)){
  const variants=[['접수하고 진료 순서를 기다리는 중','예약과 접수 내용을 확인하고 안내받은 자리에서 차례를 기다려요.','Checking in for the appointment','They check the appointment details and wait to be called.','受付をして順番を待っているところ','予約と受付内容を確認し、案内された場所で順番を待っています。'],['의사와 상담하는 중','불편했던 점과 최근 상태를 차근차근 이야기하고 설명을 듣고 있어요.','Talking with the doctor','They explain recent symptoms and listen to the doctor.','医師と相談しているところ','最近の状態や気になることを順に伝え、説明を聞いています。'],seed%2?['안내받은 검사를 진행하는 중','검사 순서에 맞춰 준비하고 직원의 안내를 따라요.','Undergoing the scheduled tests','They prepare for each test and follow the staff’s guidance.','案内された検査を受けているところ','検査の順番に合わせて準備し、職員の案内に従っています。']:['진료 후 설명을 듣는 중','생활에서 주의할 점을 확인하고 궁금했던 것을 물어봐요.','Reviewing the care instructions','They check the advice for daily life and ask questions.','診察後の説明を聞いているところ','日常で気をつける点を確認し、疑問を質問しています。'],['수납하고 다음 안내를 확인하는 중','수납을 마치고 다음 예약과 안내 사항을 챙겨요.','Checking out after the appointment','They finish payment and check the next appointment and instructions.','会計と次の案内を確認しているところ','会計を済ませ、次の予約と案内を確認しています。']];
  const v=variants[phase];title=text(language,v[0],v[2],v[4]);desc=text(language,v[1],v[3],v[5]);
 }else if(/운동|스포츠|훈련|exercise|sport/i.test(kind)){
  const skilled=people.filter(p=>(p.skills||[]).some(s=>/운동|체력|스포츠|축구|농구|수영|달리기|격투|athlet|sport/i.test(String(s)))),lead=skilled[seed%Math.max(1,skilled.length)],novice=people.find(p=>!skilled.includes(p));
  title=[text(language,company?'모여서 준비 운동하는 중':'준비 운동하는 중','Warming up','準備運動をしているところ'),text(language,'동작을 맞춰 연습하는 중','Practicing the movements','動きを合わせて練習中'),text(language,seed%2?'속도를 높여 운동하는 중':'잠깐 쉬며 자세를 고치는 중',seed%2?'Picking up the pace':'Taking a break to adjust technique',seed%2?'ペースを上げて運動中':'休憩してフォームを直しているところ'),text(language,'마무리 운동과 정리하는 중','Cooling down and tidying up','整理運動と片づけ中')][phase];
  desc=phase===0?text(language,'몸 상태를 확인하고 천천히 관절을 풀어요.','They check how they feel and gently loosen up.','体調を確認し、ゆっくり体をほぐしています。'):phase===3?text(language,'호흡을 고르고 쓴 도구를 정리한 뒤 물을 마셔요.','They catch their breath, put away the equipment and drink some water.','呼吸を整えて道具を片づけ、水を飲んでいます。'):lead?text(language,`${lead.name}이 익숙한 동작으로 흐름을 잡아요.${novice?` ${novice.name}은 박자를 놓쳐 웃으며 다시 맞춰 봐요.`:''}`,`${lead.name} sets a steady rhythm.${novice?` ${novice.name} misses a beat, laughs and tries again.`:''}`,`${lead.name}が慣れた動きで流れを作っています。${novice?`${novice.name}はタイミングを外し、笑いながらやり直しています。`:''}`):text(language,'동작이 어색해 속도를 낮추고, 잘 안 되는 부분을 다시 연습해요.','They slow down and practice the unfamiliar movements again.','慣れない動きでペースを落とし、難しい部分をもう一度練習しています。');
 }else{
  const activity=/식사|meal/i.test(kind)?['메뉴를 고르는 중','식사를 즐기는 중','음료와 함께 쉬는 중','식사를 마무리하는 중','Choosing a meal','Enjoying the meal','Resting over a drink','Finishing the meal','料理を選んでいるところ','食事を楽しんでいるところ','飲み物で一息ついているところ','食事を終えるところ']:/공부|학습|study/i.test(kind)?['공부할 자료를 펼치는 중','집중해서 문제를 푸는 중','틀린 부분을 다시 살피는 중','배운 내용을 정리하는 중','Preparing study materials','Working through problems','Reviewing mistakes','Summarizing what was learned','勉強の資料を広げているところ','問題に集中しているところ','間違いを見直しているところ','学んだ内容を整理中']:['약속한 일을 준비하는 중','정해 둔 일을 진행하는 중','진행 상황을 확인하는 중','마무리하고 정리하는 중','Preparing for the plan','Following the plan','Checking progress','Wrapping up','予定の準備中','予定を進めているところ','進み具合を確認中','終わりの片づけ中'];
  const offset=language==='en'?4:language==='ja'?8:0;title=activity[offset+phase];desc=text(language,`「${name}」${company?' 일행과 함께':''} ${phase===0?'필요한 것을 챙기고 시작할 준비를 해요.':phase===3?'하던 일을 마치고 뒷정리를 해요.':'한 가지씩 진행하며 잠깐씩 쉬어 가요.'}`,`“${name}” — ${phase===0?'getting ready':phase===3?'finishing and tidying up':'making progress with short breaks'}${company?' together':''}.`,`「${name}」${company?'を一緒に':'を'}${phase===0?'始める準備をしています。':phase===3?'終えて片づけています。':'少しずつ進め、合間に休んでいます。'}`);
 }
 return {...scene,title,desc,routinePhase:phase,routineTitle:name};
}

export function nextRoutinePhaseAt(scene,now=Date.now()){
 if(!scene?.routineId||scene.routineReturned||scene.returningHome)return Infinity;
 const date=new Date(now),day=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime(),start=Number(scene.routineStartMinute),end=Number(scene.routineEndMinute);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)return Infinity;
 return [.15,.48,.85,1].map(p=>day+Math.ceil(start+(end-start)*p)*60000).find(at=>at>now)||Infinity;
}
