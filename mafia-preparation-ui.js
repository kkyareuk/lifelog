export function preparationControls({g,p,root,world,tools,choose,menu,t,e,portrait,place,name}){
 const s=g.preparation;if(!s)return;
 const toolName=kind=>({crowbar:t('빠루','Crowbar','バール'),masterKey:t('마스터키','Master key','マスターキー'),lockKit:t('잠금 보강 도구','Lock kit','補強工具')}[kind]||kind);
 if(g.phase==='act'&&p?.alive){
  for(const [i,item] of s.tools.entries()){const b=document.createElement('button');b.className='mp-loose-tool';b.style.left=(18+i*27)+'%';b.style.top='63%';b.innerHTML=`<span>${item.type==='masterKey'?'🗝️':item.type==='crowbar'?'🔧':'🔒'}</span><b>${e(toolName(item.type))}</b>`;b.onclick=()=>menu(b,[{text:t('예의주시하기','Watch closely','注意深く見る'),action:{kind:'watchTool',toolId:item.id}},{text:t('가져가기','Take','持っていく'),disabled:s.inventory.length>=2,action:{kind:'takeTool',toolId:item.id}},{text:t('숨겨버리기','Hide','隠す'),action:{kind:'hideTool',toolId:item.id}}]);world.append(b);}

 }
 if(['move','walk','act','perform'].includes(g.phase)&&p?.alive){
  const info=document.createElement('aside');info.className='mp-preparation';info.innerHTML=`<b>${t('오늘 밤 준비','Tonight’s preparations','今夜の準備')}</b><p>${e(t('잠자리','Sleeping at','寝る場所'))}: ${e(place(s.sleepAt)?.name||'')}</p><p>${e(s.inventory.map(x=>toolName(x.type)).join(' · ')||t('소지 도구 없음','No tools','道具なし'))}</p>${p.role==='mafia'?`<small>${t('밤에 표적을 직접 골라요. 도구를 준비하면 잠긴 집 침입에 유리해요.','Choose a target at night. Tools improve entry into locked homes.','夜に標的を選びます。道具があると施錠された家への侵入が有利です。')}</small>`:''}${s.results.slice(-1).map(r=>`<small>${e(name(r.target))} · ${r.accepted?t('동맹 수락','Alliance accepted','同盟成立'):t('동맹 거절','Alliance declined','同盟拒否')}</small>`).join('')}`;
  for(const id of s.offers){const row=document.createElement('p');row.textContent=t(`${name(id)}의 동맹 제안`,`${name(id)} offers an alliance`,`${name(id)}からの同盟の提案`);for(const accept of [true,false]){const b=document.createElement('button');b.textContent=accept?t('수락','Accept','受け入れる'):t('거절','Decline','断る');b.onclick=()=>choose({kind:'allianceReply',targetId:id,accept});row.append(b)}info.append(row)}if(p.role==='mafia'&&g.allies?.length){const team=document.createElement('p');team.textContent=t('마피아 동료: ','Mafia partners: ','マフィアの仲間: ')+g.allies.map(q=>name(q.id)).join(', ');info.append(team)}root.append(info);
 }
 if(['night','dawn'].includes(g.phase)){
  const scene=world.querySelector('.night-scene');if(!scene)return;
  if(g.phase==='night'){const bed=document.createElement('div');bed.className='night-sleeper';bed.innerHTML=`<img class="night-bed-base" src="./assets/furniture/wood/single-bed-front-base.png" alt=""><div class="night-sleeping-person">${portrait(p)}</div><img class="night-bed-quilt" src="./assets/furniture/wood/single-bed-front-quilt.png" alt=""><img class="night-bed-foot" src="./assets/furniture/wood/single-bed-front-footboard.png" alt=""><span class="night-shadow"></span>`;scene.prepend(bed);const note=document.createElement('small');note.textContent=t('그림자는 분위기 연출이며 목격 증거가 아니에요.','The shadow is atmospheric, not witness evidence.','影は演出であり、目撃証拠ではありません。');scene.append(note);if(p?.role==='mafia'&&!g.nightTargets.length){const msg=document.createElement('p');msg.textContent=t('접근할 수 있는 표적이 없어요. 낮에 잠자리와 도구를 준비하세요.','No accessible targets. Scout homes and obtain tools during the day.','狙える相手がいません。昼に寝室と道具を準備しましょう。');scene.append(msg)}}

 }
}
