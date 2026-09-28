// Only creation defaults belong here. Existing profiles are never rewritten.
export const personalityPresets = [
 {id:'balanced',label:['천천히 알아가기','Find their personality','少しずつ知っていく'],description:['균형 잡힌 성격으로 시작해요.','Start with balanced traits.','バランスのよい性格で始めます。'],values:{socialEnergy:3,thinkingFeeling:3,perceivingJudging:3}},
 {id:'warm',label:['다정한 사교가','Warm and sociable','親しみやすい社交家'],description:['사람들과 어울리고 마음을 나누는 편이에요.','Enjoys company and sharing feelings.','人と交流し、気持ちを分かち合います。'],values:{socialEnergy:5,thinkingFeeling:5,perceivingJudging:3}},
 {id:'quiet',label:['차분한 계획가','Quiet planner','落ち着いた計画家'],description:['혼자 충전하고 차근차근 계획해요.','Recharges alone and plans ahead.','一人で充電し、着実に計画します。'],values:{socialEnergy:2,thinkingFeeling:2,perceivingJudging:5}},
 {id:'curious',label:['자유로운 탐험가','Curious explorer','自由な探検家'],description:['호기심이 많고 즉흥적인 선택을 즐겨요.','Curious and happy to improvise.','好奇心旺盛で、その場の選択を楽しみます。'],values:{socialEnergy:4,sensingIntuition:5,perceivingJudging:1}}
];
export const lifestylePresets = [
 {id:'regular',label:['보통의 하루','Regular day','いつもの一日'],values:{wake:'07:30',sleep:'23:30'}},
 {id:'early',label:['아침형 생활','Early bird','朝型の生活'],values:{wake:'06:00',sleep:'22:00'}},
 {id:'late',label:['느긋한 밤형','Night owl','ゆったり夜型'],values:{wake:'10:00',sleep:'02:00'}}
];
export function starterValues(personality,lifestyle){
 const p=personalityPresets.find(p=>p.id===personality),l=lifestylePresets.find(p=>p.id===lifestyle);
 if(!p||!l)throw new Error('Unknown starter preset');
 const values={...p.values,...l.values};
 values.socialStyle=['혼자가 편함','낯을 가림','조용히 어울림','먼저 다가감','무리의 중심'][values.socialEnergy-1];
 values.perceptionStyle=['눈앞의 현실 중시','구체적인 편','균형형','가능성 중시','직관과 상상 중시'][(values.sensingIntuition||3)-1];
 values.decisionStyle=['논리 우선','이성적인 편','균형형','마음을 살핌','공감 우선'][(values.thinkingFeeling||3)-1];
 values.planningStyle=['즉흥적','유연한 편','상황에 따라','미리 정리함','계획적'][values.perceivingJudging-1];
 return values;
}
export function chooseStarterPresets(language='ko'){
 const n=({ko:0,en:1,ja:2})[language]??0,t=(ko,en,ja)=>[ko,en,ja][n];
 const dialog=document.createElement('dialog');dialog.className='starter-preset-dialog';
 dialog.innerHTML=`<form method="dialog"><h2>${t('어떤 캐릭터로 시작할까요?','How would you like to begin?','どんなキャラクターで始めますか？')}</h2><p>${t('성격과 생활을 골라 가볍게 시작해요. 나중에 모두 바꿀 수 있어요.','Choose a personality and daily rhythm. You can change everything later.','性格と生活リズムを選んで始めましょう。後から自由に変更できます。')}</p><fieldset><legend>${t('성격','Personality','性格')}</legend>${personalityPresets.map((p,i)=>`<label><input type="radio" name="personality" value="${p.id}" ${i?'':'checked'}><span><b>${p.label[n]}</b><small>${p.description[n]}</small></span></label>`).join('')}</fieldset><fieldset><legend>${t('생활 리듬','Daily rhythm','生活リズム')}</legend>${lifestylePresets.map((p,i)=>`<label><input type="radio" name="lifestyle" value="${p.id}" ${i?'':'checked'}><span><b>${p.label[n]}</b><small>${p.values.wake} ~ ${p.values.sleep}</small></span></label>`).join('')}</fieldset><footer><button value="cancel">${t('취소','Cancel','キャンセル')}</button><button value="create" class="primary">${t('이 설정으로 만들기','Create with these settings','この設定で作成')}</button></footer></form>`;
 document.body.append(dialog);dialog.showModal();
 return new Promise(resolve=>dialog.addEventListener('close',()=>{const f=dialog.querySelector('form');const values=dialog.returnValue==='create'?starterValues(f.elements.personality.value,f.elements.lifestyle.value):null;dialog.remove();resolve(values)},{once:true}));
}
