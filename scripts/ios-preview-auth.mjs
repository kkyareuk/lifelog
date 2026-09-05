// Packaged as auth.js ONLY in the local iOS preview. No network SDK, cloud
// account switch, data deletion, entitlement grant or simulated sign-in.
const messages = {
  ko:'iOS 준비 버전은 로그인·동기화 연결 전이에요. 기기 안에서 플레이할 수 있어요.',
  en:'Login and sync are not connected in this iOS preview. You can play locally.',
  ja:'iOS版のログインと同期は準備中です。端末内でのプレイは利用できます。'
};
const unavailable = async () => {
  const lang = window.ParallelCity?.getState?.()?.uiLanguage || document.documentElement.lang || 'ko';
  const message = messages[lang.slice(0,2)] || messages.ko;
  if (window.ParallelCity?.toast) window.ParallelCity.toast(message);
  else window.alert(message);
  return false;
};
const seen = new Set();
window.ParallelCityAuth = {
  login:unavailable, upload:unavailable, download:unavailable,
  submitFeedback:async()=>false,
  logout:async()=>false, getIdToken:async()=>null,
  markGuideSeen:async id=>{seen.add(id);}, resetGuides:async()=>{seen.clear();},
  getInfo:()=>({ready:true, user:null, busy:false,
    entitlements:{backgroundPacks:[],iconPacks:[],dlcPacks:[],purchases:[],characterSlotPacks:0,townSlotPacks:0,storage50:false},
    storageUsage:{count:0,bytes:0,maxCount:0,maxBytes:0,unlimited:false},
    guideState:{loaded:true,seen:[...seen]}
  })
};
window.dispatchEvent(new Event('drawer-village-auth-busy'));
