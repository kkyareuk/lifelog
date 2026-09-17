const topic=q=>q.id.startsWith('story:home:')?'home':q.id.startsWith('story:cooking:')?'cooking':q.story?'conflict':q.id;
export function variedDiscoveryPool(character,events,ordinary){
 const recent=character.discovery?.recent||[],last=recent.at(-1),lastTopic=last?topic({id:last,story:last.startsWith('story:')}):'';
 // Story memories are alternatives to ordinary questions, not an absolute
 // priority that repeatedly crowds out every other part of a character.
 const pool=[...ordinary,...events].filter(q=>!recent.includes(q.id)&&topic(q)!==lastTopic);
 return pool.length?pool:[...ordinary,...events].filter(q=>q.id!==last);
}
