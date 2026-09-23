// A guided tour of the real home UI. Only the player changes furniture or data.
export function startHomeTour(state,onStop){
 const key='drawer-village-home-tour-v3',lang={ko:0,en:1,ja:2}[state.uiLanguage]||0;
 if(localStorage.getItem(key)==='done')return ()=>{};
 let step=0,frame=0,target=null,topDialog=null,stopped=false,sofaId='',sofaPressed=false,knownSofas=new Set();
 const home=()=>state.homes[state.activeHomeId],living=()=>Object.entries(home()?.rooms||{}).find(([k,r])=>(r.type||k)==='living')?.[0]||Object.keys(home()?.rooms||{})[0];
 const resident=()=>state.order.map(id=>state.characters[id]).find(c=>c&&(c.homeId===home()?.id||c.residences?.some(r=>r.homeId===home()?.id)));
 const esc=v=>CSS.escape(String(v||'')),panelBack=name=>`[data-home-feature="${name}"].open [data-close-home-feature]`;
 const steps=[
 ['info','', ['이곳은 집입니다. 캐릭터들은 이곳에서 살아갈 거예요.','This is home, where your characters will live.','ここは家です。キャラクターたちはここで暮らします。']],
 ['click','[data-open-home-feature="house-info"]',['집 정보를 눌러 보세요.','Open Home information.','家の情報を押してみましょう。']],
 ['info','[data-home-feature="house-info"].open',['이곳에서 집 이름과 집 정보를 편집할 수 있어요.','Edit the home’s name and information here.','ここで家の名前や情報を編集できます。']],
 ['click',()=>panelBack('house-info'),['뒤로가기를 눌러 주세요.','Go back.','戻るを押してください。']],
 ['click','[data-open-home-feature="room-info"]',['방 정보를 눌러 보세요.','Open Rooms.','部屋情報を押してみましょう。']],
 ['click',()=>`[data-room-info-edit="${esc(living())}"]`,['거실을 눌러 보세요.','Select the living room.','リビングを押してみましょう。']],
 ['info','.room-editor-dialog[open]',['이곳에서 방 이름, 벽지와 바닥 등 방의 모습을 편집할 수 있어요.','Edit the room’s name, wallpaper, floor and other details here.','ここで部屋名、壁紙や床などを編集できます。']],
 ['click','.room-editor-dialog[open] .home-design-back',['뒤로가기를 눌러 주세요.','Go back.','戻るを押してください。']],
 ['click','[data-open-home-feature="members"]',['구성원을 눌러 보세요.','Open Members.','メンバーを押してみましょう。']],
 ['info','[data-home-feature="members"].open',['이곳에서 구성원과 반려생물, 차를 등록할 수 있어요.','Register residents, pets and cars here.','ここで住人、ペット、車を登録できます。']],
 ['click',()=>`[data-member-edit="resident"][data-member-id="${esc(resident()?.id)}"]`,()=>[`${resident()?.name||'캐릭터'}를 눌러 보세요.`,`Select ${resident()?.name||'your character'}.`,`${resident()?.name||'キャラクター'}を押してみましょう。`]],
 ['info','.home-member-editor[open]',['이 집이 캐릭터의 주거지인지, 본가나 별장인지 정할 수 있어요.','Choose whether this is their main home, family home or holiday home.','この家を住居、実家、別荘などに設定できます。']],
 ['click','.home-member-editor[open] .home-design-back',['뒤로가기를 눌러 주세요.','Go back.','戻るを押してください。']],
 ['click',()=>panelBack('members'),['한 번 더 뒤로가기를 눌러 주세요.','Go back once more.','もう一度戻るを押してください。']],
 ['click','[data-home-edit]',['편집모드를 눌러 보세요.','Enter Edit mode.','編集モードを押してみましょう。']],
 ['click','[data-home-tools-add]',['가구 추가를 눌러 보세요.','Select Add furniture.','家具追加を押してみましょう。']],
 ['place','[data-home-add-furniture="소파"]',['소파를 거실로 끌어 놓아 보세요.','Drag a sofa into the living room.','ソファをリビングへドラッグして置きましょう。']],
 ['click','[data-home-tools-done]',['편집 완료를 눌러 보세요.','Finish editing.','編集完了を押してみましょう。']],
 ['click',()=>`[data-furniture-placement="${esc(sofaId)}"]`,['방금 놓은 소파를 눌러 보세요.','Select the sofa you just placed.','置いたソファを押してみましょう。']],
 ['info','.context-action-menu[open]',['가구를 누르면 이곳에서 할 행동을 고를 수 있어요. 이제 나만의 생활을 이어 가 보세요!','Tap furniture to choose an activity there. Enjoy life in your home!','家具を押すと、そこで行う行動を選べます。これから暮らしを楽しんでください！']]
 ];
 const card=document.createElement('aside');card.className='intro-tour home-tour';card.setAttribute('popover','manual');card.setAttribute('aria-label',['집 안내','Home guide','家の案内'][lang]);const text=document.createElement('p'),hint=document.createElement('small'),nav=document.createElement('nav'),skip=document.createElement('button');skip.textContent=['안내 그만 보기','End guide','案内を終了'][lang];nav.append(skip);card.append(text,hint,nav);document.body.append(card);
 const finish=()=>{localStorage.setItem(key,'done');cleanup();onStop?.()};skip.onclick=finish;
 const selector=()=>typeof steps[step][1]==='function'?steps[step][1]():steps[step][1];
 function paint(){card.dataset.homeTourStep=String(step);const copy=steps[step][2];text.textContent=(typeof copy==='function'?copy():copy)[lang];hint.textContent=steps[step][0]==='info'?['아무 곳이나 터치하면 계속해요.','Tap anywhere to continue.','どこかをタップして進みます。'][lang]:'';if(step===16)knownSofas=new Set((home()?.rooms[living()]?.furniturePlacements||[]).map(p=>p.id));}
 function next(){if(stopped)return;if(++step>=steps.length)return finish();paint()}
 const click=e=>{if(stopped||e.target.closest('.home-tour nav'))return;if(steps[step][0]==='info'){e.preventDefault();e.stopImmediatePropagation();next();return}if(steps[step][0]==='click'&&e.target.closest?.(selector())){const clicked=step;setTimeout(()=>{if(step===clicked)next()},0)}};
 const pointer=e=>{if(steps[step][0]==='info'&&!e.target.closest('.home-tour nav')){e.preventDefault();e.stopImmediatePropagation();return}if(step===18&&e.target.closest?.(selector()))sofaPressed=true};
 function tick(){if(stopped)return;const sel=selector(),el=sel?[...document.querySelectorAll(sel)].find(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[hidden]')):null;if(el!==target){target?.classList.remove('intro-tour-target');target=el;target?.classList.add('intro-tour-target')}
 if(step===16){const added=(home()?.rooms[living()]?.furniturePlacements||[]).find(p=>p.item==='소파'&&!knownSofas.has(p.id));if(added){sofaId=added.id;next()}}
 if(step===18&&sofaPressed&&document.querySelector('.context-action-menu[open]'))next();
 const d=[...document.querySelectorAll('dialog[open]')].at(-1)||null;if(d!==topDialog){topDialog=d;if(card.matches(':popover-open'))card.hidePopover();(d||document.body).append(card)}if(card.showPopover&&!card.matches(':popover-open'))card.showPopover();const rect=target?.getBoundingClientRect(),height=visualViewport?.height||innerHeight,ch=card.offsetHeight;card.style.top=Math.max(8,Math.min(height-ch-8,rect&&rect.top>ch+24?rect.top-ch-12:rect&&rect.bottom+ch+24<height?rect.bottom+12:height-ch-12))+'px';frame=requestAnimationFrame(tick)}
 function cleanup(){stopped=true;cancelAnimationFrame(frame);document.removeEventListener('click',click,true);document.removeEventListener('pointerdown',pointer,true);target?.classList.remove('intro-tour-target');card.remove()}
 document.addEventListener('click',click,true);document.addEventListener('pointerdown',pointer,true);paint();tick();return cleanup;
}
