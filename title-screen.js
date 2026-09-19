const labels={ko:['Google 로그인','Apple 로그인','게스트','탭하여 서랍 열기','계정과 저장 데이터를 확인하는 중…','다시 시도'],en:['Sign in with Google','Sign in with Apple','Guest','Tap to open your drawer','Checking your account and saved data…','Try again'],ja:['Googleでログイン','Appleでログイン','ゲスト','タップして引き出しを開く','アカウントと保存データを確認中…','再試行']};
export function mountTitleScreen({getState,onEnter}){
 const root=document.createElement('section');root.className='drawer-title';root.setAttribute('aria-label','Drawer Village');
 const stage=document.createElement('div');stage.className='drawer-title-stage';
 const art=document.createElement('img');art.src='./assets/title/title-art.svg';art.alt='';art.className='drawer-title-art';
 const version=document.createElement('span');version.className='drawer-title-version';version.textContent='Version: '+(window.DRAWER_VILLAGE_APP_VERSION||'web');
 const copyright=document.createElement('span');copyright.className='drawer-title-copyright';copyright.textContent='© Kkyareuk.';
 const actions=document.createElement('div');actions.className='drawer-title-actions';
 const status=document.createElement('p');status.className='drawer-title-status';status.setAttribute('aria-live','polite');
 const progress=document.createElement('progress');progress.className='drawer-title-progress';progress.max=2;progress.value=0;
 stage.append(art,version,copyright,actions,status,progress);root.append(stage);document.body.append(root);
 document.documentElement.classList.add('title-visible');
 let entered=false,last='',working=false;
 const finish=()=>{if(working||entered)return;const auth=window.ParallelCityAuth?.getInfo?.();if(auth&&!auth.ready||auth?.startupSyncing||auth?.startupError)return;entered=true;root.remove();document.documentElement.classList.remove('title-visible');clearInterval(timer);window.removeEventListener('drawer-village-auth-busy',update);onEnter();window.dispatchEvent(new Event('drawer-ads-update'));};
 const button=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;actions.append(b)};
 const update=()=>{
  const state=getState(),copy=labels[state.uiLanguage]||labels.ko,auth=window.ParallelCityAuth?.getInfo?.(),configured=!!window.PARALLEL_CITY_FIREBASE?.apiKey;
  const failed=auth?.startupError||window.DrawerVillageAuthStartupError,ready=!configured||auth?.ready&&!auth.startupSyncing;
  const returning=!!auth?.user||!!state.order?.length,key=[ready,returning,failed,working,state.uiLanguage].join(':');
  if(key===last)return;last=key;actions.replaceChildren();progress.value=ready?2:1;progress.hidden=ready&&!returning;status.textContent=ready?'':copy[4];
  if(failed){status.textContent=String(failed);button(copy[5],()=>location.reload());return}
  if(!ready||working)return;
  if(returning){actions.classList.add('returning');button(copy[3],finish);return}
  actions.classList.remove('returning');
  const login=async provider=>{working=true;update();try{await window.ParallelCityAuth?.login?.(provider)}finally{working=false;update()}};
  button(copy[0],()=>login('google'));
  button(copy[1],()=>login('apple'));
  // Apple native login is only available in the iOS build.
  const apple=actions.lastElementChild;apple.disabled=window.Capacitor?.getPlatform?.()!=='ios';
  button(copy[2],finish);
 };
 const timer=setInterval(update,500);window.addEventListener('drawer-village-auth-busy',update);update();
 return root;
}
