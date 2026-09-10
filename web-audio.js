const KEY='drawer-village-web-audio';
export const isWebAudio=()=>!globalThis.window?.Capacitor?.isNativePlatform?.();
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
export const webMuted=()=>isWebAudio()&&read().muted===true;
export function audioSettings(state){if(!isWebAudio())return state;const local=read();return {...state,...local,backgroundMusicMuted:local.muted||local.backgroundMusicMuted===true,soundMuted:local.muted||local.soundMuted===true};}
export function setAudioSetting(state,key,value){if(!isWebAudio()){state[key]=value;return false}localStorage.setItem(KEY,JSON.stringify({...read(),[key]:value}));return true;}
