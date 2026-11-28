// Growth is derived from saved milestones, never from rendering or opening a guide.
export const growthCopy={
 ko:{heading:'지금 할 일',action:'캐릭터의 첫 행동 정하기',answer:'첫 질문에 답하고 캐릭터 알아가기',routine:'캐릭터의 일정 저장하기',more:'질문에 답하며 캐릭터 알아가기',hint:'이름만으로 시작해도 괜찮아요. 질문에 답하며 설정을 하나씩 채워요.',go:'하러 가기',level:'캐릭터 레벨',next:'다음 레벨',unit:'개',wait:'다음 질문을 준비하고 있어요. 오른쪽 자아만들기의 남은 시간을 확인해 주세요.'},
 en:{heading:'Next task',action:'Choose your character’s first activity',answer:'Answer a first question about your character',routine:'Save a schedule for your character',more:'Get to know your character through questions',hint:'A name is enough to start. Build their details one answer at a time.',go:'Start task',level:'Character level',next:'Next level',unit:'answers',wait:'The next question is getting ready. Check the Self-discovery timer on the right.'},
 ja:{heading:'今やること',action:'キャラクターの最初の行動を決める',answer:'最初の質問に答えてキャラクターを知る',routine:'キャラクターの予定を保存する',more:'質問に答えてキャラクターを知る',hint:'名前だけで始めても大丈夫。質問に答えながら設定を少しずつ作りましょう。',go:'やってみる',level:'キャラクターレベル',next:'次のレベル',unit:'問',wait:'次の質問を準備中です。右の自分づくりの残り時間をご確認ください。'}
};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function characterGrowth(c){
 const answered=new Set([...(Array.isArray(c?.discovery?.answered)?c.discovery.answered:[]),...(Array.isArray(c?.discovery?.recent)?c.discovery.recent:[])].filter(id=>typeof id==='string'&&id));
 const milestones=c?.discovery?.growthCompleted||{};
 const count=answered.size,xp=count*20+(milestones.action===true?20:0)+(milestones.routine===true?20:0);
 const task=milestones.action!==true?'action':!count?'answer':milestones.routine!==true?'routine':'more';
 return {level:1+Math.floor(xp/100),xp,progress:xp%100,task,count,target:count?Math.floor(count/5)*5+5:1};
}
export function growthBadge(c,language='ko'){
 const {level}=characterGrowth(c),text=growthCopy[language]||growthCopy.ko;
 return `<span class="character-level-badge" aria-label="${text.level} ${level}">Lv. ${level}</span>`;
}
export function growthCard(c,language='ko'){
 const g=characterGrowth(c),text=growthCopy[language]||growthCopy.ko;
 return `<section class="character-growth-card" data-growth-character="${esc(c.id)}" aria-label="${text.heading}"><div class="character-growth-heading"><small>${text.heading} · Lv. ${g.level}</small><small>${text.next} ${g.progress}/100</small></div><div class="character-growth-task"><b>${text[g.task]}${g.task==='more'?` (${g.count}/${g.target})`:''}</b><button type="button" data-growth-task="${g.task}" data-growth-id="${esc(c.id)}">${text.go} ›</button></div><progress max="100" value="${g.progress}" aria-label="${text.next}"></progress><small class="character-growth-hint">${text.hint}</small></section>`;
}
