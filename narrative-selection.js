// Selection reads committed character history; rendering never advances a random state.
export const narrativeHash=value=>[...String(value)].reduce((h,c)=>(Math.imul(h,31)+c.charCodeAt(0))>>>0,0);
const dayNumber=key=>{const [y,m,d]=String(key).split("-").map(Number);return Date.UTC(y,m-1,d);};
export function recentNarrativeEntries(character,day='',minute=Infinity,limit=5){
 return Object.entries(character?.days||{}).filter(([key])=>Number.isFinite(dayNumber(key))&&(!day||dayNumber(key)<=dayNumber(day))).sort(([a],[b])=>dayNumber(b)-dayNumber(a)).slice(0,3).flatMap(([key,value])=>(value?.entries||[]).filter(e=>dayNumber(key)!==dayNumber(day)||Number(e.minute)<minute).slice().sort((a,b)=>Number(b.minute)-Number(a.minute))).slice(0,limit);
}
export function pickNarrative(pool,recent,seed,key=x=>x.id,matches=(entry,item)=>entry.narrativeKey===key(item)){
 if(!pool.length)return null;
 // Least recently used fallback: exhausting a small pool must not repeat the last item.
 const age=item=>{const index=recent.findIndex(entry=>matches(entry,item));return index<0?Infinity:index;};
 const best=Math.max(...pool.map(age)),available=pool.filter(item=>age(item)===best);
 return available[narrativeHash(seed)%available.length];
}
export const homeNarrativeKey=script=>typeof script[3]==='string'?script[3]:'home:'+narrativeHash(script[0]+'|'+script[1]);
export function pickHomeNarrative(scripts,recent,seed,preferred=null){
 const matches=(entry,script)=>entry.narrativeKey===homeNarrativeKey(script)||[entry.desc,entry.baseDesc].some(text=>typeof text==='string'&&text.includes(script[1]));
 const unique=[...new Map(scripts.map(script=>[homeNarrativeKey(script),script])).values()];
 if(preferred&&!recent.some(entry=>matches(entry,preferred)))return preferred;
 return pickNarrative(unique,recent,seed,homeNarrativeKey,matches);
}

export function mayFollowUp(last,script){return Boolean(script&&!last?.homeFollowup&&![last?.title,last?.baseTitle].includes(script[0]));}
