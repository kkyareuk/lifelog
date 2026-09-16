export function meetingControls({root,g,p,cards,choose,describe,claimText,t,e,name}){
 const tools=root.querySelector('.mp-tools'),world=root.querySelector('.mp-world'),notebook=root.querySelector('.mp-notebook');
 const own=g.phase==='discussion'||g.phase==='finalSpeech'&&g.currentClaim?.speaker===p?.id;
 const active=p?.alive&&g.status==='playing';
 root.classList.add('mp-meeting-v2');tools.replaceChildren();
 const panel=document.createElement('section');panel.className='mp-meeting-choices';panel.hidden=true;root.append(panel);
 const show=(title,items)=>{panel.replaceChildren();panel.hidden=false;const h=document.createElement('b');h.textContent=title;panel.append(h);for(const item of items){const b=document.createElement('button');b.textContent=item.text;b.classList.toggle('is-fabricated',!!item.forge);b.onclick=item.run;panel.append(b)}const back=document.createElement('button');back.textContent=t('닫기','Close','閉じる');back.onclick=()=>panel.hidden=true;panel.append(back)};
 const evidence=(kind,targetId)=>{
  const options=[{text:t('근거 없이','Without evidence','根拠なし'),run:()=>choose({kind,targetId})},...cards.filter(c=>!targetId||c.subject===targetId||c.witnesses?.includes(targetId)).map(c=>({text:describe(c),run:()=>choose({kind,targetId,cardId:c.id})}))];
  if(g.canForge)for(const c of cards.filter(c=>!targetId||c.subject===targetId).slice(-2)){const elsewhere=g.locations.find(l=>l.id!==c.place);if(elsewhere)options.push({forge:true,text:t('위증 · ','Fabricated · ','偽証・')+describe({...c,place:elsewhere.id}),run:()=>choose({kind,targetId,cardId:c.id,forge:true,forgePlace:elsewhere.id})})}
  show(t('어떤 근거로 말할까요?','Choose your grounds','どの根拠で話しますか？'),options);
 };
 const targets=kind=>show(t('누구에게 말할까요?','Choose a person','誰に話しますか？'),g.players.filter(q=>q.alive&&q.id!==p?.id).map(q=>({text:q.name,run:()=>kind==='request'?show(t('언제의 행적을 물을까요?','Ask about which time?','いつの行動を聞きますか？'),[t('아침','Morning','朝'),t('점심','Afternoon','昼'),t('저녁','Evening','夕方'),t('밤','Night','夜')].map((text,period)=>({text,run:()=>choose({kind,targetId:q.id,period})}))):evidence(kind,q.id)})));
 const button=(kind,label,run,disabled=false)=>{const b=document.createElement('button');b.dataset.meetingAction=kind;b.textContent=label;b.disabled=!active||disabled;b.onclick=run;tools.append(b)};
 if(g.phase==='reply'&&g.replyTo===p?.id){for(const c of g.alibiOptions||[])button('alibi',claimText(c),()=>choose({kind:'alibi',optionId:c.id}));}
 else if(own){
  button('accuse',t('의심하기','Suspect','疑う'),()=>targets('accuse'));
  button('defend',t('변호하기','Defend','弁護する'),()=>targets('defend'));
  if(g.phase!=='finalSpeech'){
   button('request',t('진술 요구하기','Ask for an account','説明を求める'),()=>targets('request'));
   button('changeTopic',t('주제 바꾸기','Change topic','話題を変える'),()=>choose({kind:'changeTopic'}));
  }
  button('pass',t('넘기기','Pass','パス'),()=>choose({kind:'pass'}));
 }else if(['claim','rebuttal'].includes(g.phase)){
  const disabled=!!g.challengeOwner||g.currentClaim?.speaker===p?.id;
  button('oppose',t('반박하기','Rebut','反論する')+' · '+cards.length,()=>evidence('oppose'),disabled);
  button('agree',t('동조하기','Agree','同調する'),()=>choose({kind:'agree'}),disabled);
  button('pass',t('넘기기','Pass','パス'),()=>choose({kind:'pass'}),g.currentClaim?.speaker===p?.id);
 }
 const records=g.history.filter(h=>['accuse','defend','request','changeTopic','oppose','agree','claim'].includes(h.kind));
 const ledger=document.createElement('section');ledger.className='mp-public-record';ledger.setAttribute('aria-label',t('회의 기록','Meeting record','会議記録'));
 const recent=records.slice(-4);ledger.innerHTML=recent.length?recent.map(h=>`<p><b>${e(name(h.speaker))}</b> · ${e(claimText(h))}</p>`).join(''):`<p>${t('회의에서 나온 말이 여기에 기록됩니다.','Statements will appear here as the meeting progresses.','会議の発言がここに記録されます。')}</p>`;
 if(records.length>4){const older=document.createElement('details');older.innerHTML=`<summary>${t('이전 기록','Earlier records','以前の記録')}</summary>`+records.slice(0,-4).map(h=>`<p>${e(name(h.speaker))} · ${e(claimText(h))}</p>`).join('');ledger.prepend(older)}
 const reports=notebook?.querySelector('.mp-notebook-pages');if(reports){const scene=reports.querySelector('h3');if(scene){const heading=document.createElement('b');heading.textContent=scene.textContent;const details=document.createElement('details');const summary=document.createElement('summary');summary.append(heading);details.append(summary);let next=scene.nextElementSibling;while(next&&next.tagName!=='H3'){details.append(next.cloneNode(true));next=next.nextElementSibling}ledger.prepend(details)}}
 notebook?.remove();root.append(ledger);
 for(const ally of g.allies||[]){const b=world.querySelector('[data-person="'+CSS.escape(ally.id)+'"]');if(b)b.title=t('동료 압박: ','Ally pressure: ','仲間の圧迫度：')+ally.pressure;}
 world.querySelectorAll('[data-person]').forEach(b=>{b.classList.toggle('is-speaking',b.dataset.person===g.currentClaim?.speaker);b.classList.toggle('is-pressured',(g.pressure?.[b.dataset.person]||0)>=6);if(g.phase!=='vote')b.onclick=()=>show(name(b.dataset.person),cards.filter(c=>c.subject===b.dataset.person).map(c=>({text:describe(c),run:()=>{}})))});
}
