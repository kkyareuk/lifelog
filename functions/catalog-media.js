const local=value=>typeof value==='string'&&/^(?:local-media:|blob:|data:|file:|content:|capacitor:)/i.test(value);
function validateCatalogMedia(node){
 if(local(node))throw Object.assign(Error('catalog-photo-upload-required'),{status:400});
 if(node&&typeof node==='object')for(const value of Object.values(node))validateCatalogMedia(value);
}
function mergeCatalogItems(existing,incoming,kind,allowRepair=true){
 const merged=new Map(existing.map(item=>[item.id,item]));
 for(const item of incoming){
  validateCatalogMedia(item);
  const old=merged.get(item.id);
  if(old){if(old.name.trim().normalize('NFKC')!==item.name.trim().normalize('NFKC'))throw Object.assign(Error('catalog-id-conflict'),{status:409});if(allowRepair&&(!old.image||local(old.image))&&typeof item.image==='string'&&/^https:\/\//.test(item.image))merged.set(item.id,{...old,image:item.image});continue}
  if(![...merged.values()].some(old=>old.name.trim().normalize('NFKC').toLocaleLowerCase()===item.name.trim().normalize('NFKC').toLocaleLowerCase()))merged.set(item.id,{...item,kind});
 }
 return [...merged.values()];
}
module.exports={validateCatalogMedia,mergeCatalogItems};
