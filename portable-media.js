import {initializeLocalMediaState,isPendingLocalImage} from './local-media.js?v=20260909dev305';
// A portable export must fail explicitly rather than silently lose a photo.
export async function portableMedia(source,language='ko'){
 const error=()=>Error(({ko:'사진을 모두 담지 못했어요. 사진 로딩과 연결 상태를 확인하고, 항목이 많다면 나눠서 내보내 주세요.',en:'Could not include every photo. Check loading and connectivity, or export fewer items at a time.',ja:'すべての写真を含められませんでした。読み込みと接続を確認し、項目が多い場合は分けて書き出してください。'})[language]||'Photo export failed');
 const data=structuredClone(source),restored=await initializeLocalMediaState(data);if(restored.pending)throw error();
 const cached=new Map();let total=0;
 async function walk(node,parentKey=''){if(!node||typeof node!=='object')return;for(const key of Object.keys(node)){const v=node[key];if(typeof v==='string'){
 if(isPendingLocalImage(v))throw error();
 if(/^(https?:|blob:)/.test(v)&&/image|photo|icon|portrait|illustration/i.test(key+' '+parentKey)){
 if(!cached.has(v)){const r=await fetch(v,{signal:AbortSignal.timeout(20000)});if(!r.ok)throw error();const blob=await r.blob();if(!blob.type.startsWith('image/'))throw error();const value=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)});cached.set(v,value)}node[key]=cached.get(v);
 }if(/^data:image\//.test(node[key])){total+=node[key].length;if(total>140*1024*1024)throw error();}
 }else await walk(v,key)}}await walk(data);return data;
}
