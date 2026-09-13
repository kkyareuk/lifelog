// User-driven walkthrough. No timers advance a step or perform game actions.
let dispose=null;
export const introTourActive=()=>Boolean(dispose);
const copies={
 ko:{title:'서랍마을 첫걸음',next:'확인',skip:'건너뛰기',cancel:'계속하기',confirm:'안내를 건너뛸까요? 설정 > 도움말에서 다시 시작할 수 있어요.',create:'이름만 정하면 시작할 수 있어요. 사진과 나머지 설정은 나중에 채워도 괜찮아요.',made:'첫 주민을 만든 뒤 눌러 주세요',start:'첫 주민 만들기',steps:['캐릭터는 알아서 생활해요. 현재 행동과 장소, 기분을 살펴보세요.','할 일 정하기를 눌러 행동 메뉴를 열어 보세요.','분류를 열고 원하는 행동을 하나 골라 보세요.','질문 아이콘을 눌러 캐릭터에 대해 알아가 보세요.','정답은 없어요. 답을 고르면 성향에 반영돼요. 지금은 넘겨도 괜찮아요.','전체설정에서는 성향을 직접 정하고 자물쇠로 고정할 수 있어요. 사전과 멀티는 메뉴에서, 익명 문의는 설정 첫 화면에서 찾을 수 있어요.'],done:'시작하기'},
 en:{title:'First steps in Drawer Village',next:'Got it',skip:'Skip',cancel:'Continue',confirm:'Skip the tour? Restart it from Settings > Help.',create:'A name is enough to start. Photos and other settings can wait.',made:'Tap after creating your resident',start:'Create a resident',steps:['Characters live on their own. Check their current activity, location and mood.','Open Choose an activity to see the activity menu.','Open a category and choose an activity.','Tap the question icon to learn about your character.','There are no right answers. Choices influence their traits. You can also skip this question.','Set traits directly and lock them in Full settings. Find Dictionary and Multiplayer in the menu, and Anonymous feedback on the Settings home screen.'],done:'Start playing'},
 ja:{title:'村でのはじめの一歩',next:'確認',skip:'スキップ',cancel:'続ける',confirm:'案内をスキップしますか？設定 > ヘルプから再開できます。',create:'名前だけで始められます。写真や他の設定は後からで大丈夫です。',made:'住民を作成したら押してください',start:'最初の住民を作る',steps:['キャラクターは自分で生活します。現在の行動・場所・気分を見てみましょう。','やることを決めるボタンから行動メニューを開きましょう。','分類を開いて好きな行動を選んでみましょう。','質問アイコンを押してキャラクターを知りましょう。','正解はありません。選んだ答えが性格に反映されます。今は見送っても大丈夫です。','詳細設定では性格を直接決めて固定できます。辞典とマルチはメニューから、匿名お問い合わせは設定の最初の画面から開けます。'],done:'遊び始める'}
};
export function startIntroTour({language='ko',hasCharacter,go}){
 dispose?.();const copy=copies[language]||copies.ko;
 let step=hasCharacter()?0:-1,confirming=false,frame=0,lastTarget=null;
 const card=document.createElement('aside');card.className='intro-tour';card.setAttribute('aria-label',copy.title);card.setAttribute('popover','manual');
 const heading=document.createElement('b'),text=document.createElement('p'),progress=document.createElement('small'),actions=document.createElement('nav');heading.textContent=copy.title;card.append(heading,text,progress,actions);document.body.append(card);
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;actions.append(b);return b};
 const finish=()=>{try{localStorage.setItem('drawer-village-help-intro','done')}catch{}dispose?.()};
 function paint(){
  text.textContent=confirming?copy.confirm:step<0?copy.create:copy.steps[step];progress.textContent=confirming?'':`${Math.min(4,Math.max(1,Math.ceil((step+1)/2)))} / 4`;actions.replaceChildren();
  if(confirming){button(copy.cancel,()=>{confirming=false;paint()});button(copy.skip,finish);return}
  if(step<0){button(copy.start,()=>go('character'));button(copy.made,()=>{if(hasCharacter()){step=0;go('observe');paint()}})}
  else if(step===0)button(copy.next,()=>{step=1;paint()});
  else if(step===5)button(copy.done,finish);
  button(copy.skip,()=>{confirming=true;paint()});schedule();
 }
 const targetForStep=()=>document.querySelector(step===0?'[data-game-hud-moment],.life-log':step===1?'[data-character-command]':step===2?'.direct-command-dialog[open] [data-direct-command]':step===3?'.discovery-rail-button':step===4?'.character-discovery-dialog[open]':':not(*)');
 function position(){
  frame=0;const target=targetForStep();if(lastTarget!==target){lastTarget?.classList.remove('intro-tour-target');target?.classList.add('intro-tour-target');lastTarget=target}
  const r=target?.getBoundingClientRect(),height=card.offsetHeight,vh=window.visualViewport?.height||innerHeight;
  card.style.top=`${Math.max(8,r&&r.top>height+24?r.top-height-12:vh-height-12)}px`;
  if(card.showPopover&&!card.matches(':popover-open'))card.showPopover();
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(position)}
 // Observe successful dialog transitions, never treat a failed command/save as completion.
 function inspect(){
  if(!confirming){
   if(step===1&&document.querySelector('.direct-command-dialog[open]')){step=2;paint()}
   else if(step===2&&!document.querySelector('.direct-command-dialog[open]')){step=3;paint()}
   else if(step===3&&document.querySelector('.character-discovery-dialog[open]')){step=4;paint()}
   else if(step===4&&!document.querySelector('.character-discovery-dialog[open]')){step=5;paint()}
  }schedule();
 }
 const observer=new MutationObserver(records=>{if(records.some(r=>!card.contains(r.target)))inspect()});
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['open','hidden']});
 window.addEventListener('resize',schedule);document.addEventListener('scroll',schedule,true);
 dispose=()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',schedule);document.removeEventListener('scroll',schedule,true);lastTarget?.classList.remove('intro-tour-target');card.remove();dispose=null};
 go(hasCharacter()?'observe':'character');paint();return dispose;
}
