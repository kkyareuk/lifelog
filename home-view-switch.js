export function bindHomeViewSwitch({tab,language='ko',navigate,root=document}){
 if(!['observe','town','home'].includes(tab))return;
 const host=root.querySelector('.game-observe-hud,.standard-observe-view,.mobile-town-shell,.home-native-page');if(!host||host.querySelector('.home-view-switch'))return;
 const nav=document.createElement('nav');nav.className='home-view-switch';nav.setAttribute('aria-label',({ko:'홈 화면 전환',en:'Home view',ja:'ホーム画面の切り替え'})[language]||'홈 화면 전환');
 for(const [key,ko,en,ja] of [['observe','관찰','Observe','観察'],['town','마을','Village','村']]){const b=document.createElement('button');b.type='button';b.textContent=({ko,en,ja}[language]||ko);b.setAttribute('aria-pressed',String(key==='observe'?tab==='observe':tab!=='observe'));b.onclick=()=>navigate(key);nav.append(b)}host.append(nav);
}
