// Account-scoped durable answer deltas; cleared only after a full save succeeds.
const KEY='drawer-village-answer-journal-v1';
const WORLD_KEY='drawer-village-choice-journal-v1';
export function writeChoiceDelta(storage,world,at=Date.now()){
 storage.setItem(WORLD_KEY,JSON.stringify({at,dailyQuestion:world.dailyQuestion,scheduledChoices:world.scheduledChoices||[]}));
}

export function writeAnswerDelta(storage,id,patch,at=Date.now()){
 const pending=JSON.parse(storage.getItem(KEY)||'{}');
 pending[id]={at,patch:{...pending[id]?.patch,...patch}};
 storage.setItem(KEY,JSON.stringify(pending));
}
export function replayAnswerDeltas(storage,world){
 try{const pending=JSON.parse(storage.getItem(KEY)||'{}');for(const [id,item] of Object.entries(pending)){
  if(world?.characters?.[id]&&item.at>=Number(world.lastSaved||0)&&item.at>Number(world.gameResetAt||0))Object.assign(world.characters[id],item.patch);
 }}catch{}
 try{const item=JSON.parse(storage.getItem(WORLD_KEY)||'null');if(item&&item.at>=Number(world.lastSaved||0)&&item.at>Number(world.gameResetAt||0)){world.dailyQuestion=item.dailyQuestion;world.scheduledChoices=(item.scheduledChoices||[]).filter(x=>world.characters?.[x.characterId]);}}catch{}return world;
}
export function clearAnswerDeltas(storage){try{storage.removeItem(KEY);storage.removeItem(WORLD_KEY)}catch{}}
