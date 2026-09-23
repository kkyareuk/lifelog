import {audioSettings} from './web-audio.js?v=20260909dev305';

export function lifeSound(scene={}){
 if(scene.transit||scene.sleeping||scene.cooking)return '';
 const title=String(scene.title||'');
 if(/설거지|그릇.*씻|냄비.*씻|washing dishes|wash.*pot|食器.*洗|皿.*洗/i.test(title))return 'dishes';
 if(/샤워|목욕|몸을 씻|씻는 중|shower|bathing|taking a bath|シャワー|入浴|体を洗/i.test(title))return 'shower';
 if(/마시는|마시기|마시며|한 모금|drinking|sipping|飲ん|飲む/i.test(title))return 'drink';
 if(/먹는|먹기|먹으며|식사|eating|having a meal|食事|食べ/i.test(title)||scene.actionKind==='eating'&&!/요리|만들|내리|cooking|brewing|料理|淹れ/i.test(title))return 'eat';
 return '';
}

export const lifeSoundEpisode=scene=>String(scene?.manualDirectiveId||scene?.recoveryStartedAt||[scene?.dateKey||'',scene?.minute,scene?.baseTitle||scene?.title].join(':'));
const playedDrinks=new Set();
let audio=null,key='',lastState=null;
export function stopLifeSound(){if(audio){audio.pause();audio.removeAttribute('src');audio.load()}audio=null;key=''}
export function syncLifeSound(state){
 lastState=state;
 const host=document.querySelector('[data-observed-character][data-life-sound]'),next=host?.dataset.lifeSound||'',settings=audioSettings(state);
 const volume=settings.soundMuted?0:Math.max(0,Math.min(1,(Number(settings.soundEffectsVolume??45))/100));
 if(!next||document.hidden||!volume||host?.querySelector('[data-cooking-active]'))return stopLifeSound();
 const nextKey=host.dataset.observedCharacter+':'+next+':'+(host.dataset.lifeSoundEvent||'');
 if(key===nextKey&&audio){audio.volume=volume;return}
 stopLifeSound();key=nextKey;
 if(next==='drink'&&playedDrinks.has(nextKey))return;
 audio=new Audio('./assets/audio/life/'+next+'.mp3');audio.loop=next!=='drink';audio.volume=volume;
 const playingKey=nextKey;audio.play().then(()=>{if(next==='drink'){playedDrinks.add(playingKey);if(playedDrinks.size>200)playedDrinks.delete(playedDrinks.values().next().value)}}).catch(()=>{});
}
if(globalThis.document){document.addEventListener('visibilitychange',()=>{if(document.hidden)stopLifeSound();else if(lastState)syncLifeSound(lastState)});globalThis.window?.addEventListener('pagehide',stopLifeSound)}
