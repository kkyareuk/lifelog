export const FIT_REASONS=[
 ['too-kind','너무 착하거나 양보해요','Too kind or yielding','優しすぎる・譲りすぎる'],
 ['too-harsh','너무 거칠거나 공격적이에요','Too harsh or aggressive','乱暴すぎる・攻撃的すぎる'],
 ['too-passive','너무 소극적이에요','Too passive','消極的すぎる'],
 ['too-bold','너무 적극적이거나 충동적이에요','Too bold or impulsive','積極的・衝動的すぎる'],
 ['tone','말투나 감정 표현이 안 맞아요','The tone or emotion does not fit','口調や感情表現が合わない'],
 ['context','관계나 캐릭터 설정과 안 맞아요','The relationship or character context does not fit','関係やキャラクター設定に合わない'],
 ['missing-action','하고 싶은 행동이 없어요','The action I want is missing','させたい行動がない'],
 ['other','그 밖의 이유','Other reason','その他']
];
export function fitFeedbackPanel({button,question,answers,language,selectedOption,valid,submit,status}){
 const lang=language==='en'?2:language==='ja'?3:1,t=(ko,en,ja)=>[ko,en,ja][lang-1];
 button.onclick=()=>{
  if(!valid()||button.nextElementSibling?.matches('[data-fit-panel]'))return;
  const panel=document.createElement('section');panel.dataset.fitPanel='';
  const node=(tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;panel.append(el);return el};
  node('h3',t('어떤 점이 캐릭터답지 않나요?','What does not fit your character?','どんなところがキャラらしくないですか？'));
  node('p',t('여러 개 골라도 돼요. 이 의견은 캐릭터 설정을 바꾸지 않아요.','Choose any that apply. Feedback does not change your character.','複数選べます。意見を送ってもキャラクター設定は変わりません。'));
  const reasons=new Set(),closest=new Set();
  const toggle=(label,key,set,attribute)=>{const b=node('button',label);b.type='button';b.setAttribute(attribute,key);b.setAttribute('aria-pressed','false');b.onclick=()=>{set.has(key)?set.delete(key):set.add(key);b.setAttribute('aria-pressed',String(set.has(key)));send.disabled=!reasons.size};return b};
  for(const [id,...labels] of FIT_REASONS)toggle(labels[lang-1],id,reasons,'data-fit-reason');
  node('h4',t('그나마 가까운 답이 있나요? (선택)','Any answers come close? (optional)','比較的近い回答はありますか？（任意）'));
  answers.forEach((text,i)=>toggle(text,String(i),closest,'data-fit-answer'));
  const note=node('textarea');note.rows=3;note.maxLength=300;note.placeholder=t('원하는 반응을 덧붙여 주세요. (선택)','Describe the response you want (optional).','希望する反応を記入してください（任意）。');note.setAttribute('aria-label',note.placeholder);
  const send=node('button',t('의견 보내기','Send feedback','意見を送る'));send.type='button';send.dataset.fitSend='';send.disabled=true;
  const cancel=node('button',t('취소','Cancel','キャンセル'));cancel.type='button';cancel.onclick=()=>panel.remove();
  send.onclick=async()=>{if(!valid())return;const controls=[...panel.querySelectorAll('button,textarea')];controls.forEach(b=>b.disabled=true);
   const data={schemaVersion:2,questionId:question.id,prompt:question.question[language]||question.question.ko,choices:answers.map((text,index)=>({index,text})),reasonIds:[...reasons],closestAnswerIndices:[...closest].map(Number),note:note.value.trim(),selectedOption:selectedOption?.()||null,language};
   try{await submit(data);panel.remove();button.disabled=true;status.textContent=t('질문·답변과 함께 의견을 저장했어요. 답변은 계속 고를 수 있어요.','Saved with the question and answers. You can still choose an answer.','質問・回答と一緒に保存しました。引き続き回答を選べます。')}catch{controls.forEach(b=>b.disabled=false);status.textContent=t('보내지 못했어요. 내용을 유지했으니 다시 시도해 주세요.','Could not send. Your selections are kept; please retry.','送信できませんでした。内容は残っています。再試行してください。')}
  };
  button.after(panel);
 };
}
