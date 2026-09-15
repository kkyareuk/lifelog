import {state} from './state.js?v=20260909dev305';
const t=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderMafiaRecruitment(body,g,data,{owner,run,back}){
 const mine=g.players.find(p=>p.ownerUid===owner&&!p.delegated);
 body.innerHTML=`<section class="mafia-recruitment"><div class="mr-heading"><button data-back>‹ ${t('광장','Plaza','広場')}</button><span>${t('마피아 게임','Mafia game','マフィアゲーム')}</span></div><h2>${esc(g.name)}</h2><p>${t('함께할 친구를 기다리고 있어요','Waiting for the other players','参加者を待っています')}</p><strong>${g.players.length} / ${g.capacity}</strong><div class="mr-seats">${Array.from({length:g.capacity},(_,i)=>{const p=g.players[i],src=p?.photo;return `<article>${src&&/^(https?:|data:image\/|\.\/)/.test(src)?`<img src="${esc(src)}" alt="">`:`<span>${p?'♟':'＋'}</span>`}<b>${esc(p?.name||t('빈자리','Open seat','空席'))}</b><small>${p?.delegated?'NPC':p?t('참가 중','Joined','参加中'):''}</small></article>`}).join('')}</div><div class="mr-actions">${!mine?`<label>${t('참가할 캐릭터','Your character','参加するキャラクター')}<select>${data.characters.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><button data-join>${t('참가하기','Join','参加する')}</button>`:''}${data.manager?`<button data-start>${t('NPC 채워서 바로 시작','Fill NPC seats and start now','NPCを補充して今すぐ開始')}</button>`:''}${mine?`<button data-leave>${t('참가 취소','Leave','参加を取り消す')}</button>`:''}${data.manager?`<button data-cancel>${t('게임 취소','Cancel game','ゲームを中止')}</button>`:''}</div><p role="status" data-game-status></p></section>`;
 body.querySelector('[data-back]').onclick=back;
 body.querySelector('[data-start]')?.addEventListener('click',()=>run('startGame',{gameId:g.id}));
 body.querySelector('[data-join]')?.addEventListener('click',()=>run('joinGame',{gameId:g.id,characterId:body.querySelector('select').value}));
 body.querySelector('[data-leave]')?.addEventListener('click',()=>run('leaveGame',{gameId:g.id}));
 body.querySelector('[data-cancel]')?.addEventListener('click',()=>run('cancelGame',{gameId:g.id}));
}
