export function preparationControls({g,p,root,world,tools,choose,menu,t,e,portrait,place,name}){
 const s=g.preparation;if(!s)return;
 const toolName=kind=>({crowbar:t('빠루','Crowbar','バール'),masterKey:t('마스터키','Master key','マスターキー'),lockKit:t('잠금 보강 도구','Lock kit','補強工具')}[kind]||kind);
 if(g.phase==='act'&&p?.alive){
  for(const [i,item] of s.tools.entries()){const b=document.createElement('button');b.className='mp-loose-tool';b.style.left=(18+i*27)+'%';b.style.top='63%';b.innerHTML=`<span>${item.type==='masterKey'?'🗝️':item.type==='crowbar'?'🔧':'🔒'}</span><b>${e(toolName(item.type))}</b>`;b.disabled=s.inventory.length>=2;b.onclick=()=>choose({kind:'takeTool',toolId:item.id});world.append(b);}
  const b=document.createElement('button');b.textContent=t('낮 준비','Day preparations','昼の準備');tools.append(b);b.onclick=()=>menu(b,[
   {text:t('흔적·부검 조사 · 노출 높음','Investigate / autopsy · high exposure','痕跡・検視・露出高'),action:{kind:'investigate'}},
   {text:t('안전하게 쉬기 · 정보 없음','Rest safely · no information','安全に休む・情報なし'),action:{kind:'stay'}},
   ...(s.canScout?[{text:t('잠자리·출입구 살피기 · 노출 매우 높음','Scout sleeping places / entrances · very exposed','寝室と入口を調べる・露出大'),action:{kind:'scoutHome'}}]:[]),
   ...(s.canSecure?[{text:t('오늘 잘 집 잠금 보강','Reinforce tonight’s home','今夜の家を補強'),action:{kind:'secureHome'}}]:[]),
   ...(g.occupants||[]).filter(q=>q.id!==p.id).flatMap(q=>[
    ...(!s.allianceUsed?[{text:t(`${q.name}에게 동맹 제안 · 판당 1회`,`Offer ${q.name} an alliance · once per game`,`${q.name}に同盟を提案・1ゲーム1回`),action:{kind:'alliance',targetId:q.id}}]:[]),
    {text:t(`${q.name}의 집에서 자기 · 빈 침대 필요`,`Sleep at ${q.name}’s home · needs a spare bed`,`${q.name}の家に泊まる・空きベッドが必要`),action:{kind:'sleepover',targetId:q.id}}
   ]),
   ...(g.bodies||[]).filter(b=>!s.mourning.includes(b.id)).map(b=>({text:t(`${name(b.id)}을 애도하기 · 목격자에게만 영향`,`Mourn ${name(b.id)} · affects witnesses only`,`${name(b.id)}を悼む・目撃者にのみ影響`),action:{kind:'mourn',targetId:b.id}}))
  ]);
 }
 if(['move','walk','act','perform'].includes(g.phase)&&p?.alive){
  const info=document.createElement('aside');info.className='mp-preparation';info.innerHTML=`<b>${t('오늘 밤 준비','Tonight’s preparations','今夜の準備')}</b><p>${e(t('잠자리','Sleeping at','寝る場所'))}: ${e(place(s.sleepAt)?.name||'')}</p><p>${e(s.inventory.map(x=>toolName(x.type)).join(' · ')||t('소지 도구 없음','No tools','道具なし'))}</p>${p.role==='mafia'?`<small>${t('잠자리를 살펴봐야 밤에 노릴 수 있어요. 잠긴 집은 도구가 필요해요.','Scout a sleeping place before targeting it. Locked houses require a tool.','寝る場所を調べてから狙えます。施錠された家には道具が必要です。')}</small>`:''}${s.results.slice(-1).map(r=>`<small>${e(name(r.target))} · ${r.accepted?t('동맹 수락','Alliance accepted','同盟成立'):t('동맹 거절','Alliance declined','同盟拒否')}</small>`).join('')}`;
  for(const id of s.offers){const row=document.createElement('p');row.textContent=t(`${name(id)}의 동맹 제안`,`${name(id)} offers an alliance`,`${name(id)}からの同盟の提案`);for(const accept of [true,false]){const b=document.createElement('button');b.textContent=accept?t('수락','Accept','受け入れる'):t('거절','Decline','断る');b.onclick=()=>choose({kind:'allianceReply',targetId:id,accept});row.append(b)}info.append(row)}root.append(info);
 }
 if(['night','dawn'].includes(g.phase)){
  const scene=world.querySelector('.night-scene');if(!scene)return;
  if(g.phase==='night'){const bed=document.createElement('div');bed.className='night-sleeper';bed.innerHTML=`<img class="night-bed-base" src="./assets/furniture/wood/single-bed-front-base.png" alt=""><div class="night-sleeping-person">${portrait(p)}</div><img class="night-bed-quilt" src="./assets/furniture/wood/single-bed-front-quilt.png" alt=""><img class="night-bed-foot" src="./assets/furniture/wood/single-bed-front-footboard.png" alt=""><span class="night-shadow"></span>`;scene.prepend(bed);const note=document.createElement('small');note.textContent=t('그림자는 분위기 연출이며 목격 증거가 아니에요.','The shadow is atmospheric, not witness evidence.','影は演出であり、目撃証拠ではありません。');scene.append(note);if(p?.role==='mafia'&&!g.nightTargets.length){const msg=document.createElement('p');msg.textContent=t('접근할 수 있는 표적이 없어요. 낮에 잠자리와 도구를 준비하세요.','No accessible targets. Scout homes and obtain tools during the day.','狙える相手がいません。昼に寝室と道具を準備しましょう。');scene.append(msg)}}
  else for(const n of s.notices){const row=document.createElement('p');row.textContent=t(`${place(n.place)?.name}의 ${toolName(n.type)}가 사라졌어요. 가져간 사람은 알 수 없어요.`,`${toolName(n.type)} is missing from ${place(n.place)?.name}. Its taker is unknown.`,`${place(n.place)?.name}の${toolName(n.type)}がなくなりました。持ち主は不明です。`);scene.append(row)}
 }
}
