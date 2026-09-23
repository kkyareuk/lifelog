// First visit stays on the observation surface. Progress follows successful game events.
let dispose=null;
export const introTourActive=()=>Boolean(dispose);
const KEY='drawer-village-intro-v2';
export function introProgress(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return {}}}
export const tutorialEvent=(name)=>window.dispatchEvent(new CustomEvent('drawer-tutorial',{detail:{name}}));
const texts={
ko:{title:'서랍마을 첫걸음',next:'확인',skip:'안내 그만 보기',done:'시작하기',create:'첫 주민 만들기',name:'이름',keywords:'성격 키워드 · 선택 사항',make:'만들기',retry:'다시 눌러볼까요?',steps:{1:'첫 주민을 만나 볼까요? 이름만 정해도 시작할 수 있어요.',2:'주민의 이름을 정해 주세요.',3:'어떤 성격인가요? 한두 개를 골라도, 그냥 넘어가도 좋아요.',4:'준비됐어요. 만들기를 누르면 주민의 하루가 시작돼요.',5:'이 카드에서 지금 하는 일과 장소, 기분을 볼 수 있어요. 천천히 읽어 보세요.',6:'캐릭터를 눌러 볼까요? 직접 할 일을 정해 줄 수 있어요.',7:'추천 행동을 눌러 보세요. 다른 활동을 열어서 골라도 괜찮아요.',8:'신분증 모양의 질문 아이콘을 눌러 캐릭터를 알아가 보세요.',9:'캐릭터다운 답을 골라 주세요. 지금은 넘겨도 괜찮아요.',10:'이제 주민의 하루를 지켜보세요! 전체설정에서 성향을 바꾸고 자물쇠로 잠글 수도 있어요.'},traits:['조용한','사교적인','계획적인','즉흥적인']},
en:{title:'First steps in Drawer Village',next:'Got it',skip:'End guide',done:'Start playing',create:'Create a resident',name:'Name',keywords:'Personality keywords · optional',make:'Create',retry:'Try tapping again?',steps:{1:'Meet your first resident. A name is enough to begin.',2:'Choose a name for your resident.',3:'Choose one or two traits, or continue without them.',4:'Ready! Create your resident to start their day.',5:'This card shows their activity, location and mood. Take a moment to read it.',6:'Tap your character to choose something for them to do.',7:'Try the suggested activity, or browse and choose another.',8:'Tap the ID-shaped question icon to learn about your character.',9:'Choose an answer that fits. You can also skip for now.',10:'Enjoy watching their day! Full settings lets you change traits and lock them with the padlock.'},traits:['Quiet','Sociable','Organized','Spontaneous']},
ja:{title:'村でのはじめの一歩',next:'確認',skip:'案内を終了',done:'遊び始める',create:'最初の住民を作る',name:'名前',keywords:'性格キーワード・任意',make:'作成',retry:'もう一度押してみましょう',steps:{1:'最初の住民に会いましょう。名前だけでも始められます。',2:'住民の名前を決めてください。',3:'性格を一つか二つ選べます。選ばず進んでも大丈夫です。',4:'準備完了！作成を押すと住民の一日が始まります。',5:'このカードで今の行動・場所・気分が分かります。ゆっくり読んでみましょう。',6:'キャラクターを押して、してほしいことを選びましょう。',7:'おすすめの行動を押すか、他の活動から選んでみましょう。',8:'身分証の形の質問アイコンを押して、キャラクターを知りましょう。',9:'その人らしい答えを選びましょう。今は見送っても大丈夫です。',10:'住民の一日を見守りましょう！詳細設定で性格を変え、鍵で固定することもできます。'},traits:['静か','社交的','計画的','自由気まま']}
};
export function startIntroTour({language='ko',hasCharacter,go,create,restart=false}){
 dispose?.();const copy=texts[language]||texts.ko;let progress=restart?{}:introProgress();
 let step=Number(progress.step)||(hasCharacter()?5:1),frame=0,wasOpen=false,closed=Number(progress.closed)||0,retry=false;
 if(step===7)step=6;if(step===9)step=8;if(hasCharacter()&&step<5)step=5;if(!hasCharacter()&&step>=5)step=1;
 const card=document.createElement('aside');card.className='intro-tour';card.setAttribute('popover','manual');card.setAttribute('aria-label',copy.title);
 const heading=document.createElement('b'),text=document.createElement('p'),body=document.createElement('div'),actions=document.createElement('nav');card.append(heading,text,body,actions);document.body.append(card);
 const shade=document.createElement('div');shade.className='intro-tour-shade';shade.setAttribute('popover','manual');shade.setAttribute('aria-hidden','true');const panels=Array.from({length:4},()=>{const e=document.createElement('i');shade.append(e);return e});document.body.append(shade);
 const persist=()=>{progress={...progress,step,closed};localStorage.setItem(KEY,JSON.stringify(progress))};
 const finish=()=>{progress.done=true;progress.step_10=true;persist();localStorage.setItem('drawer-village-help-intro','done');dispose?.()};
 const next=n=>{progress['step_'+String(step).padStart(2,'0')]=true;step=n;wasOpen=false;persist();paint()};
 const btn=(parent,label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;parent.append(b);return b};
 function paint(){
  heading.textContent=copy.title;text.textContent=retry&&step===6?copy.retry:copy.steps[step];body.replaceChildren();actions.replaceChildren();card.dataset.step=String(step);
  if(step===1)btn(actions,copy.create,()=>next(2));
  if(step===2){const label=document.createElement('label');label.textContent=copy.name;const input=document.createElement('input');input.dataset.tutorialName='';input.maxLength=60;input.value=progress.name||'';input.oninput=()=>{progress.name=input.value;persist()};label.append(input);body.append(label);btn(actions,copy.next,()=>{if(input.value.trim())next(3);else input.focus()})}
  if(step===3){const label=document.createElement('small');label.textContent=copy.keywords;body.append(label);copy.traits.forEach((name,i)=>{const b=btn(body,name,()=>{const selected=new Set(progress.traits||[]);if(selected.has(i))selected.delete(i);else if(selected.size<2){selected.delete(i^1);selected.add(i)}progress.traits=[...selected];persist();paint()});b.setAttribute('aria-pressed',String((progress.traits||[]).includes(i)))});btn(actions,copy.next,()=>next(4))}
  if(step===4)btn(actions,copy.make,async()=>{const b=actions.firstElementChild;b.disabled=true;try{if(hasCharacter()||await create?.({name:progress.name,traits:progress.traits||[]})){next(5);go('observe')}}finally{if(b.isConnected)b.disabled=false}});
  if(step===5)btn(actions,copy.next,()=>next(6));
  if(step===10)btn(actions,copy.done,finish);else btn(actions,copy.skip,finish);
  card.dataset.mode=[1,2,3,4,10].includes(step)?'card':step===5?'bar':'spotlight';persist();
 }
 const visible=selector=>[...document.querySelectorAll(selector)].find(e=>!e.closest('[hidden]')&&e.getBoundingClientRect().width>0);
 function target(){return step===6?visible('.game-observe-hud .native-main-character,.native-character-stage,[data-character-command]'):step===7?visible('.direct-command-dialog[open] .command-menu-page:not([hidden]) [data-direct-simple-action],.direct-command-dialog[open] .command-menu-page:not([hidden]) button'):step===8?visible('.discovery-rail-button'):step===9?visible('.character-discovery-dialog[open] .discovery-choices'):null}
 let geometry='',layerDialog=null;
 function position(){
  const menu=!!document.querySelector('.direct-command-dialog[open]'),question=!!document.querySelector('.character-discovery-dialog[open]');
  if(step===6&&menu){next(7);wasOpen=true}else if(step===7){if(menu)wasOpen=true;else if(wasOpen){closed++;retry=true;next(closed>=2?8:6)}}
  if(step===8&&question)next(9);else if(step===9&&!question)next(8);
  const r=target()?.getBoundingClientRect(),w=innerWidth,h=window.visualViewport?.height||innerHeight,ch=card.offsetHeight;
  const box=r?{x:Math.max(0,r.left-6),y:Math.max(0,r.top-6),right:Math.min(w,r.right+6),bottom:Math.min(h,r.bottom+6)}:null;
  const nextGeometry=JSON.stringify([step,box,w,h,ch]);
  if(nextGeometry!==geometry){geometry=nextGeometry;const spotlight=[6,7,8,9].includes(step)&&box;
   shade.hidden=step===5||!box&&![1,2,3,4,10].includes(step);
   const rects=spotlight?[[0,0,w,box.y],[0,box.bottom,w,h-box.bottom],[0,box.y,box.x,box.bottom-box.y],[box.right,box.y,w-box.right,box.bottom-box.y]]:[[0,0,w,h],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
   panels.forEach((p,i)=>{const [x,y,width,height]=rects[i];p.style.cssText=`left:${x}px;top:${y}px;width:${width}px;height:${height}px`});
   const top=[7,9].includes(step)?8:step===5?h-ch-14:!box?(h-ch)/2:box.y>ch+24?box.y-ch-12:box.bottom+12;
   card.style.top=`${Math.max(8,Math.min(h-ch-8,top))}px`;
  }
  const topDialog=[...document.querySelectorAll('dialog[open]')].at(-1)||null;if(topDialog!==layerDialog){layerDialog=topDialog;if(card.matches(':popover-open'))card.hidePopover();if(shade.matches(':popover-open'))shade.hidePopover()}
  if(!shade.hidden&&shade.showPopover&&!shade.matches(':popover-open')){shade.showPopover();if(card.matches(':popover-open'))card.hidePopover()}if(shade.hidden&&shade.matches(':popover-open'))shade.hidePopover();
  if(card.showPopover&&!card.matches(':popover-open'))card.showPopover();
  frame=requestAnimationFrame(position);
 }
 const signal=e=>{if(e.detail?.name==='action-success'&&[6,7].includes(step))next(8);if(['question-success','question-skip'].includes(e.detail?.name)&&[8,9].includes(step))next(10)};
 window.addEventListener('drawer-tutorial',signal);
 dispose=()=>{cancelAnimationFrame(frame);window.removeEventListener('drawer-tutorial',signal);card.remove();shade.remove();dispose=null};
 document.querySelectorAll('.page-guide[open]').forEach(d=>d.close());if(hasCharacter())go('observe');paint();frame=requestAnimationFrame(position);return dispose;
}
