import {initializeLocalMediaState,preserveDevicePhotos} from './local-media.js?v=20260909dev305';
import {mergeImportedBackupState} from './sync-merge.js?v=20260909dev305';

export async function prepareBackupRestore(parsed,current,storage){
 const raw=['drawer-village-backup','parallel-city-backup'].includes(parsed?.format)?parsed.gameState:parsed;
 if(!raw||typeof raw!=='object'||!raw.characters)throw Error('invalid-backup');
 let incoming=structuredClone(raw);
 const byId=value=>Array.isArray(value)?Object.fromEntries(value.filter(item=>item?.id!=null).map(item=>[String(item.id),item])):value;
 incoming.characters=byId(incoming.characters);incoming.homes=byId(incoming.homes);
 const incomingCount=Array.isArray(incoming.characters)?incoming.characters.filter(Boolean).length:Object.keys(incoming.characters).length;
 if(!incomingCount)throw Error('empty-backup');
 // Older information-only files need their original device photos. Exact
 // object IDs link those photos; unrelated guest characters are never imported.
 // Actual embedded backup images are kept, instead of being stripped at import.
 await initializeLocalMediaState(incoming);
 for(const key of ['drawer-village-game-v1','drawer-village-last-nonempty-state-v1','drawer-village-recovery-before-cloud']){
  let guest;try{guest=JSON.parse(storage.getGuestSnapshot(key)||'null')}catch{continue}
  if(!guest)continue;
  const donor={};
  for(const field of ['characters','homes']){
   const records=byId(guest[field]);
   donor[field]=Object.fromEntries(Object.keys(incoming[field]||{}).filter(id=>records?.[id]).map(id=>[id,records[id]]));
  }
  await initializeLocalMediaState(donor);
  incoming=preserveDevicePhotos(donor,incoming,{onlyMissing:true});
 }
 const imported=mergeImportedBackupState(current,incoming);
 if(Object.keys(imported.characters||{}).length<incomingCount)throw Error('incomplete-backup-merge');
 const media=await initializeLocalMediaState(imported);
 return {imported,incomingCount,media};
}
