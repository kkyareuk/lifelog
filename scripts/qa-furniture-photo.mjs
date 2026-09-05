import assert from 'node:assert/strict';
export async function checkFurnitureAndPhoto(page,navigate,width){
 const fixture=await page.evaluate(async()=>{
  const mod=await import(performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name);
  window.furnitureTest=mod;
  const c=mod.state.characters[mod.state.activeId],h=mod.state.homes[c.homeId],keys=Object.keys(h.rooms);
  const id=mod.addFurniturePlacement(h.id,keys[0],'책상');
  mod.addFurnitureProp(h.id,keys[0],id,'책');
  mod.updateFurniturePlacement(h.id,keys[0],id,{x:45,y:65,flipped:true,scale:.75,facing:'left'});
  mod.setActiveHome(h.id);mod.setHomeEditMode(true);mod.save(true);
  return {home:h.id,from:keys[0],to:keys[1],id};
 });
 await navigate('observe');await navigate('home');
 await page.evaluate(()=>{window.furnitureTest.setHomeEditMode(true);window.ParallelCity.mediaChanged()});
 await page.locator('[data-home-drawer-toggle]').click();
 const source=page.locator(`[data-furniture-placement="${fixture.id}"]`);
 const box=await source.boundingBox(),room=await page.locator(`.room[data-room-key="${fixture.to}"]`).boundingBox();
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 await page.mouse.move(room.x+room.width*.35,room.y+room.height*.65,{steps:12});
 assert.equal(await page.locator(`.room[data-room-key="${fixture.to}"] .furniture-drag-preview`).count(),1,`${width}: cross-room drag preview`);
 await page.mouse.up();
 assert.equal(await page.locator(`.room[data-room-key="${fixture.to}"] [data-furniture-placement="${fixture.id}"]`).count(),1,`${width}: cross-room drop`);
 const result=await page.evaluate(f=>{
  const {state,moveFurniturePlacement,addFurniturePlacement,updateFurniturePlacement}=window.furnitureTest,h=state.homes[f.home];
  const moved=h.rooms[f.to].furniturePlacements.find(p=>p.id===f.id);
  const before=JSON.stringify(h.rooms);const invalid=moveFurniturePlacement(f.home,f.to,'missing-room',f.id);
  const intact=before===JSON.stringify(h.rooms);
  const bed=addFurniturePlacement(f.home,f.from,'커플 침대');
  updateFurniturePlacement(f.home,f.from,bed,{assignedCharacterIds:[state.activeId],rotation:12,scale:1.25});
  h.lifeSimulation={reservations:{[bed]:{characterId:state.activeId}},agents:{[state.activeId]:{furnitureId:bed,phase:'using',item:'커플 침대'}}};
  const transferred=moveFurniturePlacement(f.home,f.from,f.to,bed,{x:50,y:55});
  const result={moved,invalid,intact,sourceRemoved:!h.rooms[f.from].furniturePlacements.some(p=>p.id===f.id),
   sourceCacheRemoved:!h.rooms[f.from].furniture.includes('책상'),targetCache:h.rooms[f.to].furniture.includes('책상'),
   bedAssigned:transferred.assignedCharacterIds.includes(state.activeId),rotation:transferred.rotation,scale:transferred.scale,
   released:!h.lifeSimulation.reservations[bed]&&h.lifeSimulation.agents[state.activeId].furnitureId===''};
  window.furnitureTest.deleteFurniturePlacement(f.home,f.to,bed);
  return result;
 },fixture);
 assert.equal(result.moved.props[0].item,'책');assert.equal(result.moved.flipped,true);assert.equal(result.moved.facing,'left');assert.equal(result.moved.scale,.75);
 for(const key of ['intact','sourceRemoved','sourceCacheRemoved','targetCache','bedAssigned','released'])assert.equal(result[key],true,key);
 assert.equal(result.invalid,false);assert.equal(result.rotation,12);assert.equal(result.scale,1.25);
 // Cancelled pointer capture must not save a new position or leave a ghost.
 const saved=await page.evaluate(f=>JSON.stringify(window.furnitureTest.state.homes[f.home].rooms[f.to].furniturePlacements.find(p=>p.id===f.id)),fixture);
 const current=await source.boundingBox();
 await page.mouse.move(current.x+current.width/2,current.y+current.height/2);await page.mouse.down();
 await page.mouse.move(current.x+current.width/2+12,current.y+current.height/2+12,{steps:3});
 await source.dispatchEvent('pointercancel',{pointerId:1,bubbles:true});await page.mouse.up();
 assert.equal(await page.locator('.furniture-drag-preview,.furniture-drag-source').count(),0);
 assert.equal(await page.evaluate(f=>JSON.stringify(window.furnitureTest.state.homes[f.home].rooms[f.to].furniturePlacements.find(p=>p.id===f.id)),fixture),saved);
 // A room on another floor is also a valid installation/move destination.
 await page.evaluate(f=>{const m=window.furnitureTest,h=m.state.homes[f.home];h.floorCount=2;h.rooms[f.from].floor=2;m.save(true);window.ParallelCity.mediaChanged()},fixture);
 await source.click();await page.locator('[data-furniture-move-room]').selectOption(fixture.from);
 assert.equal(await page.evaluate(f=>window.furnitureTest.state.homes[f.home].activeFloor,fixture),2);
 assert.equal(await page.locator(`.room[data-room-key="${fixture.from}"] [data-furniture-placement="${fixture.id}"]`).count(),1);
 await page.screenshot({path:`ios/build/tablet-qa/furniture-move-${width}.png`});
 await page.locator('[data-furniture-command="done"]').click();
 const toggle=page.locator('[data-home-drawer-toggle]');if(await toggle.getAttribute('aria-expanded')==='false')await toggle.click();
 await page.evaluate(f=>{window.furnitureTest.setActiveHomeFloor(f.home,1);window.ParallelCity.mediaChanged()},fixture);
 assert.equal(await page.locator('[data-home-furniture-room],[data-home-furniture-category]').count(),0);
 await page.locator('[data-home-furniture-type="beds"]').click();
 const catalog=await page.locator('[data-home-add-furniture="침대"]').boundingBox();
 const destination=await page.locator(`.room[data-room-key="${fixture.to}"]`).boundingBox();
 await page.mouse.move(catalog.x+catalog.width/2,catalog.y+catalog.height/2);await page.mouse.down();
 await page.mouse.move(destination.x+destination.width*.5,destination.y+destination.height*.55,{steps:12});
 assert.equal(await page.locator('.furniture-catalog-drag-preview').count(),1);
 await page.mouse.up();
 assert.equal(await page.locator('.furniture-catalog-drag-preview').count(),0);
 assert.equal(await page.evaluate(f=>window.furnitureTest.state.homes[f.home].activeFloor,fixture),1);
 assert.ok(await page.evaluate(f=>window.furnitureTest.state.homes[f.home].rooms[f.to].furniturePlacements.some(p=>p.item==='침대'),fixture));
 await page.evaluate(()=>{const m=window.furnitureTest;m.setHomeEditMode(false);m.state.uiLanguage='ko';const c=m.state.characters[m.state.activeId];c.icon='';c.ldImage='';m.state.homeVisualMode='sd';m.save(true)});
 await navigate('observe');
 const photo=page.locator('.native-character-stage img.profile-photo-fallback').first();
 assert.ok(await photo.isVisible(),`${width}: photo source marker`);
 const style=await photo.evaluate(el=>({fit:getComputedStyle(el).objectFit,clip:getComputedStyle(el).clipPath}));
 assert.equal(style.fit,'cover');assert.ok(style.clip.startsWith('circle('));
 await page.screenshot({path:`ios/build/tablet-qa/profile-circle-${width}.png`});
 await page.evaluate(()=>{const m=window.furnitureTest,c=m.state.characters[m.state.activeId];c.icon=c.photo;m.save(true);window.ParallelCity.mediaChanged()});
 assert.equal(await page.locator('.native-character-stage img.profile-photo-fallback').count(),0,'Explicit SD icon must win even with same URL');
 assert.equal(await page.locator('.native-character-stage img.sprite').first().evaluate(el=>getComputedStyle(el).clipPath),'none');
 // iOS can browse every shop section, but there must be no Play/web payment hooks.
 await page.evaluate(()=>{window.PARALLEL_CITY_CONFIG.iosPreview=true});
 for(const language of ['ko','en','ja']){
  await page.evaluate(language=>{window.furnitureTest.state.uiLanguage=language},language);
  await navigate('home');await navigate('shop');
  await page.locator('[data-drawer-shop-tab="base"]').click();
  assert.equal(await page.locator('[data-drawer-shop-tab="base"]').evaluate(el=>getComputedStyle(el).textShadow),'none');
  assert.equal(await page.locator('.drawer-shop-product').count(),4);
  assert.equal(await page.locator('.drawer-shop-shell [data-play-purchase],.drawer-shop-shell [data-play-restore],.drawer-shop-shell [data-cart-add],.drawer-shop-shell a[href*="payment"]').count(),0);
  assert.equal(await page.locator('.drawer-shop-purchase:disabled').count(),4);
  assert.ok(await page.locator('.drawer-shop-preview-notice').isVisible());
  if(language==='ko')await page.screenshot({path:`ios/build/tablet-qa/shop-preview-${width}.png`});
  for(const tab of ['skin','bundle','expansion']){
   await page.locator(`[data-drawer-shop-tab="${tab}"]`).click();
   assert.ok(await page.locator('.drawer-shop-coming').isVisible());
  }
  await page.locator('.drawer-shop-back').click();
  await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='observe');
 }
 await page.evaluate(()=>window.furnitureTest.save(true));await page.reload();
 await page.waitForFunction(()=>window.ParallelCity);
 const restored=await page.evaluate(async f=>{
  const m=await import(performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name),h=m.state.homes[f.home];
  const all=Object.values(h.rooms).flatMap(r=>r.furniturePlacements||[]).filter(p=>p.id===f.id);
  return {count:all.length,room:h.rooms[f.from].furniturePlacements.some(p=>p.id===f.id),prop:all[0]?.props[0]?.item};
 },fixture);
 assert.deepEqual(restored,{count:1,room:true,prop:'책'});
 return {crossRoom:true,crossFloor:true,cancelSafe:true,propsAndBedPreserved:true,persisted:true,profileCircle:true,iconUncropped:true,iosShopBrowseOnly:true};
}
