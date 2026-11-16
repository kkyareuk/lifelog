const copy={
 ko:{help:'도움말',close:'도움말 닫기',mood:['기분 태그는 무엇인가요?','이 옷에 어울리는 기분을 표시해요. ‘슬픔’을 선택해도 캐릭터가 슬퍼지지는 않아요. 여러 기분을 함께 고를 수 있어요.','홈 사진은 감정·상황별 사진 설정을 따르고, 해당 사진이 없으면 기본 캐릭터 사진을 사용해요.'],occasion:['입는 상황은 무엇인가요?','옷에 어울리는 상황을 표시해요. ‘출근복’을 선택해도 일정을 만들거나 캐릭터를 출근시키지는 않아요. 여러 상황을 함께 고를 수 있어요.','상황 태그만 선택한다고 홈의 캐릭터 사진이 바뀌는 것은 아니에요.'],image:['캐릭터 사진은 어떻게 표시되나요?','홈에서는 감정·상황별 사진을 사용해요. 해당 사진이 비어 있으면 유저가 등록한 기본 캐릭터 사진을 보여줘요.','옷장 SD·LD는 옷의 이미지로 보관돼요. 옷 태그를 고르는 것만으로 홈 사진을 덮어쓰지 않아요.']},
 en:{help:'Help',close:'Close help',mood:['What are mood tags?','These describe moods that suit this outfit. Selecting “Sad” does not make the character sad. You can select several moods.','Home uses your emotion and situation images. An empty slot uses your default character image.'],occasion:['What are situation tags?','These describe situations that suit the outfit. Selecting workwear does not create a schedule or send the character to work. You can select several situations.','Selecting a situation tag alone does not change the character image on Home.'],image:['How are character images displayed?','Home uses your emotion and situation images. If the matching slot is empty, it shows the default character image you uploaded.','Wardrobe SD and LD images are stored as outfit images. Selecting outfit tags does not overwrite the Home image.']},
 ja:{help:'ヘルプ',close:'ヘルプを閉じる',mood:['気分タグとは？','この服に似合う気分を表します。「悲しみ」を選んでもキャラクターが悲しくなるわけではありません。複数の気分を選べます。','ホームは感情・状況別の画像設定に従います。該当する画像がなければ、登録した基本画像を使います。'],occasion:['着用状況とは？','この服に似合う場面を表します。仕事着を選んでも予定が作られたり、出勤したりするわけではありません。複数選択できます。','状況タグを選ぶだけでは、ホームの画像は変わりません。'],image:['キャラクター画像の表示について','ホームでは感情・状況別の画像を使います。該当する画像が空欄なら、ユーザーが登録した基本画像を表示します。','クローゼットのSD・LD画像は服の画像として保存されます。服のタグを選んでもホームの画像を上書きしません。']}
};
export function clothingHelpMarkup(topic,language='ko'){
 const t=copy[language]||copy.ko,[title,...body]=t[topic],id=`clothing-help-${topic}`;
 return `<span class="clothing-help" translate="no"><button type="button" class="clothing-help-trigger" data-clothing-help aria-label="${title} — ${t.help}" aria-expanded="false" aria-controls="${id}"><span aria-hidden="true">ⓘ</span></button><span id="${id}" class="clothing-help-panel" role="region" aria-label="${title}" hidden><b>${title}</b><button type="button" class="clothing-help-close" data-clothing-help-close aria-label="${t.close}">×</button>${body.map(text=>`<span class="clothing-help-paragraph">${text}</span>`).join('')}</span></span>`;
}
export function bindClothingHelp(dialog){
 let current=null;
 const close=(focus=false)=>{if(!current)return;const trigger=current.querySelector('[data-clothing-help]');current.querySelector('.clothing-help-panel').hidden=true;trigger.setAttribute('aria-expanded','false');current=null;if(focus)trigger.focus()};
 dialog.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-clothing-help]');
  if(trigger){const holder=trigger.closest('.clothing-help'),wasOpen=current===holder;close();if(!wasOpen){current=holder;holder.querySelector('.clothing-help-panel').hidden=false;trigger.setAttribute('aria-expanded','true')}return}
  if(event.target.closest('[data-clothing-help-close]')){close(true);return}
  if(!event.target.closest('.clothing-help'))close();
 });
 dialog.addEventListener('keydown',event=>{if(event.key==='Escape'&&current){event.preventDefault();event.stopPropagation();close(true)}});
 dialog.addEventListener('cancel',event=>{if(current){event.preventDefault();close(true)}});
}
