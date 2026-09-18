// Older saved letters can outlive the option schema or their target character.
// Keep the immutable letter readable and regenerate choices if none remain usable.
export function usableMailOptions(options,characters){
 if(!Array.isArray(options))return [];
 return options.filter(option=>option&&typeof option==='object'&&option.label&&
  (typeof option.label==='string'||typeof option.label==='object'&&Object.values(option.label).some(value=>typeof value==='string'&&value.trim()))&&
  (option.kind!=='gift'||characters[option.targetId])).map(option=>({...option,label:typeof option.label==='string'?{ko:option.label,en:option.label,ja:option.label}:option.label}));
}
