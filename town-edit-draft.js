// A draft belongs to a group/town and survives snapshot refreshes.
const drafts=new Map();
const key=s=>`${globalThis.window?.ParallelCityAuth?.getInfo?.()?.user?.uid||'guest'}:${s.activeGroupId}:${s.selectedTownId||s.group?.towns?.[0]?.id}`;
export const townEditDraft=s=>drafts.get(key(s));
export const discardTownEdit=s=>!townEditDraft(s)?.saving&&drafts.delete(key(s));
export function stageTownEdit(s,action,input){
 let draft=townEditDraft(s);if(draft?.saving)throw Error('edit-saving');
 if(!draft){draft={revision:Number(s.group.buildingRevision)||0,town:structuredClone(s.group.towns.find(t=>t.id===(s.selectedTownId||s.group.towns[0].id))),homes:structuredClone(s.homes||[]),operations:new Map(),created:new Set()};drafts.set(key(s),draft)}
 const identity=action+':'+(input.id||''),previous=draft.operations.get(identity);
 const combined={...previous,...input,patch:{...previous?.patch,...input.patch}};draft.operations.set(identity,combined);
 if(action==='saveTown')Object.assign(draft.town,input.patch);
 else {
  const list=action==='saveHomePlacement'?draft.homes:(draft.town[action==='saveBuilding'?'places':'decorations']??=[]),index=list.findIndex(i=>i.id===input.id);
  if(input.remove){if(index>=0)list.splice(index,1);if(draft.created.has(identity)){draft.operations.delete(identity);draft.created.delete(identity)}}else {const item={...(index>=0?list[index]:{id:input.id,x:50,y:50,mapX:50,mapY:50,townId:draft.town.id}),...Object.fromEntries(Object.entries(input).filter(([k])=>['name','type','x','y'].includes(k))),...input.patch};if(index>=0)list[index]=item;else {list.push(item);draft.created.add(identity)}}
 }
 return draft;
}
export function withTownEditDraft(s){const d=s&&townEditDraft(s);return d?{...s,group:{...s.group,towns:s.group.towns.map(t=>t.id===d.town.id?d.town:t)},homes:d.homes}:s}
export async function commitTownEdit(s,api){const d=townEditDraft(s);if(!d)return null;if(d.saving)throw Error('edit-saving');if(!d.operations.size){drafts.delete(key(s));return null}d.saving=true;try{const result=await api.saveTownEdit({townId:d.town.id,revision:d.revision,operations:[...d.operations].map(([key,input])=>({action:key.split(':')[0],input}))});drafts.delete(key(s));return result}finally{d.saving=false}}
