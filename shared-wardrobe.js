// Clothing definitions travel with the character, independently of the group dictionary.
export function withWardrobe(profile,catalog={}){
 const ids=new Set([...(profile.inventory?.fashion||[]),...(profile.savedOutfits||[]).flatMap(o=>o.itemIds||[])]);
 const items=new Map((profile.wardrobeItems||[]).map(i=>[i.id,i]));
 for(const item of catalog.fashion||[])if(ids.has(item.id)||item.ownerId===profile.id)items.set(item.id,item);
 return {...profile,wardrobeItems:[...items.values()].filter(i=>ids.has(i.id)||i.ownerId===profile.id)};
}
export function restoreWardrobe(profile,residentId,catalog){
 catalog.fashion??=[];
 const map=new Map();for(const item of profile.wardrobeItems||[]){
  const source=item.wardrobeSourceId||item.id,id=residentId+'::'+source;map.set(item.id,id);
  const value={...item,id,wardrobeSourceId:source,ownerId:residentId};
  const index=catalog.fashion.findIndex(i=>i.id===id);if(index<0)catalog.fashion.push(value);else catalog.fashion[index]=value;
 }
 return {...profile,inventory:{...profile.inventory,fashion:(profile.inventory?.fashion||[]).map(id=>map.get(id)||id)},savedOutfits:(profile.savedOutfits||[]).map(o=>({...o,itemIds:(o.itemIds||[]).map(id=>map.get(id)||id)})),wardrobeItems:(profile.wardrobeItems||[]).map(i=>({...i,id:map.get(i.id)||i.id,wardrobeSourceId:i.wardrobeSourceId||i.id,ownerId:residentId}))};
}
