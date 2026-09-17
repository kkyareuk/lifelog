// One label for an interaction, retaining its specific topic instead of a generic duplicate.
export function groupSceneLabels(labels){
 const interactionKeys=new Map();
 for(const label of labels){const seat=label.furniture;label.groupKey=seat&&['chair','sofa'].includes(seat.dataset.furnitureKind)?(seat.dataset.tableId?'table:'+seat.dataset.tableId:seat.dataset.furniturePlacement):label.status.dataset.sharedFurniture;const interaction=label.status.dataset.interactionId;if(interaction&&label.groupKey)interactionKeys.set(interaction,label.groupKey);}
 for(const label of labels){const id=label.status.dataset.interactionId;if(id&&interactionKeys.has(id))label.groupKey=interactionKeys.get(id);}
 return labels;
}
export function sharedSeatActivity(peers,language){
 const originals=peers.map(p=>p.status.dataset.soloActivity||p.status.querySelector('small')?.textContent||'');
 const specific=originals.find(text=>/고민|대해|about |について|悩み/.test(text));
 if(specific)return specific;
 return ({ko:'함께 앉아 대화하는 중',en:'Sitting and talking together',ja:'一緒に座って話している'}[language]||originals[0]);
}
