const DB_NAME="drawer-village-local-media-v1";
const STORE_NAME="media";
const REF_PREFIX="local-media://";
const dataToRef=new Map();
const refToData=new Map();
const OPERATION_TIMEOUT_MS=5000;

const isData=value=>typeof value==="string"&&value.startsWith("data:image/");
const isLocalRef=value=>typeof value==="string"&&value.startsWith(REF_PREFIX);
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

export async function initializeLocalMediaState(root){
  navigator.storage?.persist?.().catch(()=>{});
  const jobs=[];
  const walk=node=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      const value=node[key];
      if(isLocalRef(value))jobs.push(async()=>{node[key]=await resolveLocalRef(value)});
      else if(isData(value))jobs.push(async()=>{await persistLocalImage(value)});
      else if(value&&typeof value==="object")walk(value);
    });
  };
  walk(root);
  // 사진 한 장의 IndexedDB 응답이 늦어도 나머지 사진 복원을 막지 않는다.
  // 동시에 너무 많은 Blob을 Data URL로 바꾸지 않도록 작은 작업자 묶음으로 처리한다.
  let cursor=0;
  const workers=Array.from({length:Math.min(4,jobs.length)},async()=>{
    while(cursor<jobs.length){
      const job=jobs[cursor++];
      await job();
    }
  });
  await Promise.allSettled(workers);
  return jobs.length;
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
    Object.keys(local).forEach(key=>{
      const value=local[key];
      if(isData(value)||isLocalRef(value))remote[key]=value;
      else if(value&&typeof value==="object"&&remote[key]&&typeof remote[key]==="object")walk(value,remote[key]);
    });
  };
  walk(deviceState,next);return next;
}

export async function localMediaUsage(){
  try{
    const records=await new Promise((resolve,reject)=>openDb().then(db=>{
      const request=db.transaction(STORE_NAME,"readonly").objectStore(STORE_NAME).getAll();
      request.onsuccess=()=>{db.close();resolve(request.result||[])};
      request.onerror=()=>{db.close();reject(request.error)};
    },reject));
    return{count:records.length,bytes:records.reduce((sum,item)=>sum+(Number(item.size)||0),0)};
  }catch{return{count:0,bytes:0}}
}

globalThis.DrawerVillageLocalMedia={
  persistLocalImage,initializeLocalMediaState,serializeLocalMediaState,
  informationOnlyState,preserveDevicePhotos,localMediaUsage
};
