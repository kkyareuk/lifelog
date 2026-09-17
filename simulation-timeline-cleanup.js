const clock=n=>`${String(Math.floor(n/60)%24).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;
const entryMomentKey=item=>{
  const minute=Number(item?.minute);
  return String(item?.time||(Number.isFinite(minute)?clock(minute):""));
};
function mergeImmutableEntries(kept,generated){
  const merged=[...kept],seen=new Set(kept.map(item=>`${entryMomentKey(item)}|${item.title}|${item.placeId||""}|${item.room||""}`));
  generated.forEach(item=>{
    const id=`${entryMomentKey(item)}|${item.title}|${item.placeId||""}|${item.room||""}`;
    if(!seen.has(id)){seen.add(id);merged.push(item)}
  });
  return merged.sort((a,b)=>a.minute-b.minute);
}
function cleanExactRepeatedEntries(entries){
  const kept=[];
  const normalized=new WeakMap();
  const details=item=>{let d=normalized.get(item);if(!d){const title=String(item.title||'').replace(/\s+/g,' ').trim(),desc=String(item.desc||'').replace(/\s+/g,' ').trim();d={title,desc,parts:[...new Set(title.split(' · ').map(p=>p.trim()).filter(Boolean))]};normalized.set(item,d)}return d};
  [...entries].sort((a,b)=>a.minute-b.minute).forEach(item=>{
    const current=details(item),itemParts=current.parts;
    const repeatedIndex=kept.findIndex(previous=>{
      const gap=Math.abs(Number(previous.minute)-Number(item.minute));
      if(!Number.isFinite(gap))return false;
      const prior=details(previous),previousParts=prior.parts;
      const titleOverlap=itemParts.some(part=>previousParts.includes(part));
      const samePlace=(previous.visitHomeId||previous.homeId||"")===(item.visitHomeId||item.homeId||"")
        &&(previous.placeId||"")===(item.placeId||"");
      const previousDesc=prior.desc;
      const itemDesc=current.desc;
      const sameStory=previousDesc===itemDesc||previousDesc.includes(itemDesc)||itemDesc.includes(previousDesc);
      const exactTitle=prior.title===current.title;
      const exactStory=previousDesc===itemDesc;
      const sameDateGroup=Boolean(previous.dateGroup&&item.dateGroup&&previous.dateGroup===item.dateGroup);
      if(samePlace&&exactTitle&&exactStory&&gap<=180)return true;
      if(sameDateGroup&&exactTitle&&exactStory&&gap<=240)return true;
      if(gap>15)return false;
      return samePlace&&titleOverlap&&(sameStory||exactTitle);
    });
    if(repeatedIndex<0){kept.push(item);return}
    const previous=kept[repeatedIndex];
    const itemScore=(item.groupInteraction?8:0)+(item.dateGroup?4:0)+String(item.title||"").length+String(item.desc||"").length/100;
    const previousScore=(previous.groupInteraction?8:0)+(previous.dateGroup?4:0)+String(previous.title||"").length+String(previous.desc||"").length/100;
    if(itemScore>previousScore)kept[repeatedIndex]=item;
  });
  return kept;
}
const MAJOR_CLEANUP_PATTERN=/대청소|집 전체.{0,12}(?:청소|정리)|방 전체.{0,12}(?:청소|정리)|창고.{0,12}(?:청소|정리)|다락.{0,12}(?:청소|정리)|지하실.{0,12}(?:청소|정리)|이사 짐|짐을 대대적으로 정리|옷장 전체|서재 전체|묵은 (?:물건|짐)|계절.{0,8}(?:정리|옷)/;
function cleanRoutineCleanupRest(entries){
  const sorted=[...entries].sort((a,b)=>Number(a.minute)-Number(b.minute));
  return sorted.filter((item,index)=>{
    if(String(item?.title||"")!=="정리를 마치고 잠깐 쉬는 중")return true;
    const previous=sorted.slice(0,index).reverse().find(candidate=>Number(item.minute)-Number(candidate.minute)<=150);
    return Boolean(previous&&MAJOR_CLEANUP_PATTERN.test(`${previous.title||""} ${previous.desc||""}`));
  });
}
function cleanSameMinuteEntries(entries){
  const byMinute=new Map();
  [...entries].sort((a,b)=>a.minute-b.minute).forEach(item=>{
    const minute=Number(item.minute);
    if(!Number.isFinite(minute))return;
    const moment=entryMomentKey(item);
    const previous=byMinute.get(moment);
    if(!previous||item.groupInteraction||!previous.groupInteraction)byMinute.set(moment,{...item,time:clock(minute)});
  });
  return [...byMinute.values()].sort((a,b)=>a.minute-b.minute);
}
function cleanShadowedBaseEntries(entries){
  const kept=[];
  const sameLocation=(a,b)=>Boolean(a&&b&&
    (a.visitHomeId||a.homeId||"")===(b.visitHomeId||b.homeId||"")&&
    (a.placeId||"")===(b.placeId||"")&&
    (a.room||"")===(b.room||""));
  [...entries].sort((a,b)=>Number(a.minute)-Number(b.minute)).forEach(item=>{
    const previous=kept.at(-1);
    const shadowsPrevious=Boolean(previous&&item?.groupInteraction&&
      Number(item.minute)>=Number(previous.minute)&&
      Number(item.minute)-Number(previous.minute)<=15&&
      sameLocation(previous,item)&&
      (String(item.baseTitle||"")===String(previous.title||"")||
        String(item.title||"").split(" · ").includes(String(previous.title||""))));
    if(shadowsPrevious)kept.pop();
    kept.push(item);
  });
  return kept;
}

export {MAJOR_CLEANUP_PATTERN,entryMomentKey,mergeImmutableEntries,cleanExactRepeatedEntries,cleanRoutineCleanupRest,cleanSameMinuteEntries,cleanShadowedBaseEntries};