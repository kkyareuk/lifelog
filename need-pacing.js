const clamp=(value,lo,hi,fallback)=>Number.isFinite(Number(value))?Math.max(lo,Math.min(hi,Number(value))):fallback;
export function needFrequency(c,key){return clamp(c.needSettings?.frequency?.[key],.25,2,1)}
export function needVariation(c,key){let n=2166136261;for(const ch of `${c.id}:${key}`)n=Math.imul(n^ch.charCodeAt(0),16777619)>>>0;return .85+(n%301)/1000}
export function needDuration(c,key){const seconds={toilet:7+(Math.round((needVariation(c,"toilet")-.85)*1000)%9),hunger:30,hygiene:60,social:120,sleep:600}[key]||60;return seconds*1000*(['toilet','hunger'].includes(key)?1:clamp(c.needSettings?.duration,.5,2,1))}
export function directedNeed(task,kind){if(task==='toilet')return 'toilet';if(task==='meal'||!task&&kind==='meal')return 'hunger';if(['shower','bath','wash','face','teeth','hair_wash','hands'].includes(task)||!task&&kind==='wash')return 'hygiene';return ''}
