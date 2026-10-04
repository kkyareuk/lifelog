// Display precision is independent from sub-minute simulation timestamps.
export function minuteClock(value){
 const n=Number(value);if(!Number.isFinite(n))return '';
 const total=((Math.floor(n)%1440)+1440)%1440;
 return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}
export function logTime(entry){
 if(entry?.minute!==null&&entry?.minute!==undefined&&Number.isFinite(Number(entry.minute)))return minuteClock(entry.minute);
 const raw=String(entry?.time||''),match=/^(\d{1,2}):(\d{1,2}(?:\.\d+)?)$/.exec(raw);
 return match?minuteClock(Number(match[1])*60+Number(match[2])):raw;
}
