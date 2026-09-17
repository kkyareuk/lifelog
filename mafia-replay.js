const actions=new Set(['takeTool','hideTool','watchTool','autopsy','mourn','coverBody','scoutHome','secureHome','nightAttack']);
const observations=new Set(['autopsy','foundBody','nightWitness','entryTrace','tool','missingTool','contradiction']);
export function importantReplay(rows=[]){
 const seen=new Set();return rows.filter(row=>{
  const c=row.card;
  const allowed=row.kind==='belief'||row.kind==='action'&&actions.has(row.action)||row.kind==='observation'&&c&&!c.forged&&(observations.has(c.kind)||['witness','behavior'].includes(c.kind)&&actions.has(c.action));
  if(!allowed)return false;const key=JSON.stringify([row.day,row.period,row.kind,row.observer||row.subject,row.target,row.place||c?.place,row.action||c?.action,c?.subject,c?.kind]);if(seen.has(key))return false;seen.add(key);return true;
 });
}
