const DB_NAME="drawer-village-local-media-v1";
const STORE_NAME="media";
const REF_PREFIX="local-media://";
const dataToRef=new Map();
const refToData=new Map();
// Rendering only: keep base64 payloads out of repeatedly parsed HTML. Original
// state and exports continue to contain the durable image data, never blob URLs.
const displayImages=new Map();
const displayOriginals=new Map();
// Retry the durable source if this WebView cannot decode a display-only blob.
globalThis.document?.addEventListener("error",event=>{const image=event.target;if(image?.tagName!=="IMG")return;const original=displayOriginals.get(image.currentSrc||image.src);if(original){event.stopImmediatePropagation();image.src=original}},true);
let displayImageBytes=0;
const DISPLAY_IMAGE_LIMIT=32*1024*1024;
export function displayImageSource(value){
  if(typeof value!=="string"||!value.startsWith("data:image/"))return value;
  if(displayImages.has(value))return displayImages.get(value);
  if(displayImages.size>=128||displayImageBytes+value.length>DISPLAY_IMAGE_LIMIT)return value;
  const match=/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(value);
  if(!match||typeof URL.createObjectURL!=="function")return value;
  try{
    const decoded=atob(match[2]),bytes=new Uint8Array(decoded.length);
    for(let i=0;i<decoded.length;i++)bytes[i]=decoded.charCodeAt(i);
    const url=URL.createObjectURL(new Blob([bytes],{type:match[1]}));
    displayImages.set(value,url);displayOriginals.set(url,value);displayImageBytes+=value.length;
    return url;
  }catch{return value}
}
const OPERATION_TIMEOUT_MS=5000;

const isData=value=>typeof value==="string"&&value.startsWith("data:image/");
const isLocalRef=value=>typeof value==="string"&&value.startsWith(REF_PREFIX);
const isRemoteImage=value=>typeof value==="string"&&/^(https?:|blob:)/.test(value);
const isOldCloudPhoto=value=>typeof value==="string"&&/firebasestorage\.googleapis\.com|firebasestorage\.app|storage\.googleapis\.com/.test(value);
const clone=value=>JSON.parse(JSON.stringify(value));
const withTimeout=(promise,label)=>new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error(`${label}-timeout`)),OPERATION_TIMEOUT_MS);
  Promise.resolve(promise).then(
    value=>{clearTimeout(timer);resolve(value)},
    error=>{clearTimeout(timer);reject(error)}
  );
});

const openDb=()=>new Promise((resolve,reject)=>{
  if(!globalThis.indexedDB){reject(new Error("indexeddb-unavailable"));return}
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>{
    const db=request.result;
    if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:"id"});
  };
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error("indexeddb-open-failed"));
  request.onblocked=()=>reject(new Error("indexeddb-open-blocked"));
});

const transaction=(mode,action)=>openDb().then(db=>new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE_NAME,mode),store=tx.objectStore(STORE_NAME);
  let result;
  try{result=action(store)}catch(error){db.close();reject(error);return}
  tx.oncomplete=()=>{db.close();resolve(result)};
  tx.onerror=()=>{db.close();reject(tx.error||new Error("indexeddb-transaction-failed"))};
}));

const dataUrlToBlob=async dataUrl=>(await fetch(dataUrl)).blob();
const blobToDataUrl=blob=>new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>resolve(String(reader.result||""));
  reader.onerror=()=>reject(reader.error||new Error("file-reader-failed"));
  reader.readAsDataURL(blob);
});
const digest=async blob=>{
  if(crypto.subtle){
    const bytes=await crypto.subtle.digest("SHA-256",await blob.arrayBuffer());
    return [...new Uint8Array(bytes)].map(value=>value.toString(16).padStart(2,"0")).join("");
  }
  return crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
};

export async function persistLocalImage(dataUrl){
  if(!isData(dataUrl))return dataUrl;
  if(dataToRef.has(dataUrl))return dataUrl;
  try{
    const blob=await dataUrlToBlob(dataUrl),id=await digest(blob),ref=`${REF_PREFIX}${id}`;
    await withTimeout(transaction("readwrite",store=>store.put({id,blob,type:blob.type||"image/webp",size:blob.size,updatedAt:Date.now()})),"indexeddb-write");
    dataToRef.set(dataUrl,ref);refToData.set(ref,dataUrl);
    return dataUrl;
  }catch(error){
    console.warn("사진을 기기 전용 저장소에 보관하지 못했습니다",error);
    return dataUrl;
  }
}

async function resolveLocalRef(ref){
  if(refToData.has(ref))return refToData.get(ref);
  try{
    const id=ref.slice(REF_PREFIX.length);
    const record=await withTimeout(new Promise((resolve,reject)=>openDb().then(db=>{
      const tx=db.transaction(STORE_NAME,"readonly"),request=tx.objectStore(STORE_NAME).get(id);
      request.onsuccess=()=>{db.close();resolve(request.result)};
      request.onerror=()=>{db.close();reject(request.error)};
    },reject)),"indexeddb-read");
    if(!record?.blob)return ref;
    const data=await blobToDataUrl(record.blob);
    refToData.set(ref,data);dataToRef.set(data,ref);
    return data;
  }catch(error){
    // 일시적인 잠금·시간초과 때 참조를 빈 문자열로 덮어쓰면 다음 실행에서
    // 다시 복원할 기회까지 사라진다. 원래 참조를 유지해 재시도할 수 있게 한다.
    console.warn("기기에 저장된 사진을 불러오지 못했습니다",error);
    return ref;
  }
}

export const isPendingLocalImage=value=>isLocalRef(value);

export async function initializeLocalMediaState(root){
  navigator.storage?.persist?.().catch(()=>{});
  const jobs=[];
  let found=0;
  const walk=node=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      const value=node[key];
      if(isLocalRef(value)){
        found+=1;
        jobs.push(async()=>{
        const resolved=await resolveLocalRef(value);
        if(isData(resolved))node[key]=resolved;
        return isData(resolved);
        });
      }
      // A data URL is already usable. Keep its IndexedDB copy current without
      // reporting it as a newly restored image or repainting the active editor.
      else if(isData(value))jobs.push(async()=>{await persistLocalImage(value);return false});
      else if(value&&typeof value==="object")walk(value);
    });
  };
  walk(root);
  // 사진 한 장의 IndexedDB 응답이 늦어도 나머지 사진 복원을 막지 않는다.
  // 동시에 너무 많은 Blob을 Data URL로 바꾸지 않도록 작은 작업자 묶음으로 처리한다.
  let cursor=0,resolved=0;
  const workers=Array.from({length:Math.min(4,jobs.length)},async()=>{
    while(cursor<jobs.length){
      const job=jobs[cursor++];
      if(await job())resolved+=1;
    }
  });
  await Promise.allSettled(workers);
  return {found,resolved,pending:Math.max(0,found-resolved)};
}

export function serializeLocalMediaState(root){
  const next=clone(root);
  const walk=node=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      const value=node[key];
      if(isData(value)&&dataToRef.has(value))node[key]=dataToRef.get(value);
      else if(value&&typeof value==="object")walk(value);
    });
  };
  walk(next);return next;
}

// Device saves used to clone the complete village and then stringify that
// clone.  Large timelines and photos made every save allocate the state twice,
// which produced visible pauses and heat on Android.  A JSON replacer performs
// the same local-media reference substitution in a single traversal without
// mutating the live state.
export function stringifyLocalMediaState(root,overrides=null){
  return JSON.stringify(root,(key,value)=>{
    if(overrides&&Object.prototype.hasOwnProperty.call(overrides,key))return overrides[key];
    return isData(value)&&dataToRef.has(value)?dataToRef.get(value):value;
  });
}

export function informationOnlyState(root){
  const next=clone(root);
  const walk=node=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      const value=node[key];
      if(isData(value)||isLocalRef(value)||isOldCloudPhoto(value))node[key]="";
      else if(value&&typeof value==="object")walk(value);
    });
  };
  walk(next);return next;
}

export function preserveDevicePhotos(deviceState,incomingState){
  const next=clone(incomingState);
  const walk=(local,remote)=>{
    if(!local||!remote||typeof local!=="object"||typeof remote!=="object")return;
    if(Array.isArray(local)&&Array.isArray(remote)){
      const remoteById=new Map(remote.filter(item=>item&&typeof item==="object"&&item.id!=null).map(item=>[String(item.id),item]));
      local.forEach((item,index)=>{
        const match=item&&typeof item==="object"&&item.id!=null?remoteById.get(String(item.id)):remote[index];
        if(match)walk(item,match);
      });
      return;
    }
    Object.keys(local).forEach(key=>{
      const value=local[key];
      // A local-media reference is only useful on the device whose IndexedDB
      // record still exists.  It must never replace a downloadable cloud URL:
      // after WebView storage loss that used to turn a successful cloud restore
      // back into dozens of unresolved local-media:// placeholders.
      if(isData(value)||(isLocalRef(value)&&!isData(remote[key])&&!isRemoteImage(remote[key])))remote[key]=value;
      else if(value&&typeof value==="object"&&remote[key]&&typeof remote[key]==="object")walk(value,remote[key]);
    });
  };
  walk(deviceState,next);return next;
}

const estimatedDataUrlBytes=value=>{
  const body=String(value||"").split(",",2)[1]||"";
  return Math.max(0,Math.floor(body.length*3/4)-(body.endsWith("==")?2:body.endsWith("=")?1:0));
};

export async function localMediaUsage(root){
  let records=[];
  try{
    records=await new Promise((resolve,reject)=>openDb().then(db=>{
      const request=db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).getAll();
      request.onsuccess=()=>{db.close();resolve(request.result||[])};
      request.onerror=()=>{db.close();reject(request.error)};
    },reject));
  }catch(error){console.warn("기기 사진 저장소 용량을 읽지 못해 현재 화면의 사진만 계산합니다",error)}
  const storedIds=new Set(records.map(item=>String(item.id))),legacy=new Set(),cloud=new Set();
  const walk=node=>{
    if(typeof node==="string"){
      if(isData(node)){
        const ref=dataToRef.get(node),id=ref?.slice(REF_PREFIX.length);
        if(!id||!storedIds.has(id))legacy.add(node);
      }else if(isOldCloudPhoto(node))cloud.add(node);
      return;
    }
    if(!node||typeof node!=="object")return;
    Object.values(node).forEach(walk);
  };
  walk(root);
  return{
    count:records.length+legacy.size,
    bytes:records.reduce((sum,item)=>sum+(Number(item.size)||0),0)+[...legacy].reduce((sum,value)=>sum+estimatedDataUrlBytes(value),0),
    cloudCount:cloud.size,
    indexedCount:records.length,
    legacyCount:legacy.size
  };
}

globalThis.DrawerVillageLocalMedia={
  persistLocalImage,initializeLocalMediaState,serializeLocalMediaState,stringifyLocalMediaState,
  informationOnlyState,preserveDevicePhotos,localMediaUsage,isPendingLocalImage
};

// Delete only blobs referenced by this account, preserving identical images used by another account.
export async function purgeLocalImageRefs(removed,preserved=[]){
 const refs=new Set(),keep=new Set();
 const collect=async(value,target)=>{if(typeof value==='string'){if(isLocalRef(value))target.add(value.slice(REF_PREFIX.length));else if(isData(value))target.add(await digest(await dataUrlToBlob(value)));else if(value.startsWith('{')){try{await collect(JSON.parse(value),target)}catch{}}}else if(value&&typeof value==='object')for(const child of Object.values(value))await collect(child,target)};
 await collect(removed,refs);await collect(preserved,keep);
 if(refs.size)await withTimeout(transaction('readwrite',store=>{for(const id of refs)if(!keep.has(id))store.delete(id)}),'image-delete');
 for(const ref of refToData.keys())if(refs.has(ref.slice(REF_PREFIX.length))&&!keep.has(ref.slice(REF_PREFIX.length)))refToData.delete(ref);
 for(const [data,ref] of dataToRef)if(refs.has(ref.slice(REF_PREFIX.length))&&!keep.has(ref.slice(REF_PREFIX.length))){dataToRef.delete(data);refToData.delete(ref)}
}
