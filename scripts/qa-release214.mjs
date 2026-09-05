import assert from 'node:assert/strict';
import {resolve} from 'node:path';

export async function checkFirstCharacter214(page,output,width){
 const language=width===1024?'en':width===820?'ja':'ko';
 if(language!=='ko')await page.locator(`[data-welcome-language="${language}"]`).click();
 await page.locator('[data-welcome-create]').click();
 const hub=page.locator('.mobile-character-dashboard:visible');
 await hub.waitFor({state:'visible'});
 assert.equal(await page.locator('.character-book-v8').count(),0,'new characters open the character hub without building full settings');
 await hub.locator('[data-open-quick-character-settings]').click();
 const dialog=page.locator('.character-quick-settings-dialog');
 await dialog.waitFor({state:'visible'});
 assert.equal(await dialog.locator('.character-quick-paper').count(),0);
 const box=await dialog.boundingBox();assert.ok(box.width<=600&&box.x>=0);
 const nameLabel=await dialog.locator('label').filter({has:page.locator('[data-field="name"]')}).textContent();
 assert.ok(nameLabel.includes({ko:'이름',en:'Name',ja:'名前'}[language]),'translated first-character form');
 assert.ok(await dialog.locator('.character-quick-back:visible').count(),'quick settings has a visible back button');
 assert.ok(await dialog.locator('.character-quick-save:visible').count(),'quick settings has a visible save button');
 await dialog.locator('[data-field="name"]').fill('첫 캐릭터 테스트');
 await page.screenshot({path:resolve(output,`first-character-${width}.png`)});
 await dialog.locator('[data-save-mobile-character-editor]').click();
 await page.waitForFunction(()=>!document.querySelector('.character-quick-settings-dialog[open]'));
 const name=await page.evaluate(async()=>{const m=await import(performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name);return m.state.characters[m.state.activeId].name});
 assert.equal(name,'첫 캐릭터 테스트');
}

export async function checkRelease214(page,navigate,output,width){
 await page.evaluate(async()=>{for(const tab of ['observe','home','character','relationship','town','shop'])await window.ParallelCityAuth.markGuideSeen(tab);document.querySelectorAll('dialog.page-guide[open]').forEach(dialog=>dialog.close())});
 await page.evaluate(async()=>{window.qa214=await import(performance.getEntriesByType('resource').find(r=>/\/state\.js\?/.test(r.name)).name);window.qa214.state.uiLanguage='ko'});
 await navigate('home');
 const icon=page.locator('.home-native-house-name>img');
 await icon.evaluate(el=>el.decode());assert.ok((await icon.boundingBox()).width>=24);
 await navigate('character');
 const characterHub=page.locator('.mobile-character-dashboard:visible');
 await characterHub.waitFor({state:'visible'});
 assert.equal(await page.locator('.character-book-v8').count(),0,`${width}: hidden full settings must not be built on the hub`);
 await characterHub.locator('[data-open-full-character-settings]').click();
 await page.locator('.character-book-v8:visible').waitFor({state:'visible'});
 assert.equal(await page.locator('.character-quick-settings-dialog').count(),0,`${width}: quick settings must not be nested in full settings`);
 const book=page.locator('.character-book-v8-book');
 const paper=await book.evaluate(el=>{const b=el.getBoundingClientRect(),s=getComputedStyle(el);return {top:b.top+parseFloat(s.borderTopWidth),bottom:b.bottom-parseFloat(s.borderBottomWidth),left:b.left,right:b.right}});
 // The visual-page navigation lives inside the illustration's paper, not its edge.
 const controls=page.locator('.character-book-v8 :is(.character-book-page-controls,.character-book-cover-controls,.character-overview-page-controls):visible').first();
 const nav=await controls.boundingBox();assert.ok(nav&&nav.y>=paper.top&&nav.y+nav.height<=paper.bottom+1,`${width}: pagination outside book paper`);
 await page.screenshot({path:resolve(output,`book-${width}.png`)});
 await page.locator('.character-book-v8-back:visible').click();
 await page.waitForFunction(()=>Boolean(document.querySelector('.mobile-character-dashboard')));
 await page.locator('.character-draft-back:visible').click();
 await page.waitForFunction(()=>document.documentElement.dataset.activeTab==='observe');
 await page.evaluate(()=>{const m=window.qa214,first=m.state.activeId;m.createCharacter();const second=m.state.activeId;m.addRelationship({a:first,b:second,type:'연인',stage:'연애 중'});m.save(true)});
 await navigate('relationship');
 if(await page.locator('dialog.page-guide[open]').count())await page.keyboard.press('Escape');
 await page.locator('[data-open-official-relations]').click();
 const cards=page.locator('[data-official-card]:visible');assert.ok(await cards.count());
 const cardBox=await cards.first().boundingBox();assert.ok(cardBox.width>=230&&cardBox.x>=0&&cardBox.x+cardBox.width<=width);
 await page.screenshot({path:resolve(output,`official-relations-${width}.png`)});
 await page.keyboard.press('Escape');
 // A deterministic visual fixture uses the same live bed DOM, CSS and layout
 // function; it isolates image geometry from random daily simulation events.
 await page.evaluate(()=>{const m=window.qa214,h=m.state.homes[m.state.characters[m.state.activeId].homeId];m.setActiveHome(h.id);m.setActiveHomeFloor(h.id,1);m.setHomeEditMode(false);const key=Object.keys(h.rooms)[0];h.rooms[key].floor=1;const id=m.addFurniturePlacement(h.id,key,'커플 침대');m.updateFurniturePlacement(h.id,key,id,{x:50,y:60,scale:1.2,rotation:0});window.qa214Bed=id;m.save(true)});
 await navigate('home');
 const bed=page.locator('[data-furniture-placement]').filter({has:page.locator('.couple-bed-base')}).first();
 await bed.locator('.couple-bed-base').evaluate(el=>el.decode());
 const fixture=await bed.evaluate(async bed=>{
  const room=bed.closest('.room'),people=room.querySelector('.room-people');people.classList.add('has-home-life');people.replaceChildren();
  for(let slot=0;slot<2;slot++){
   const person=document.createElement('div');person.className='home-person home-life-person home-life-using scene-action-sleep is-sleeping is-couple-bed-user is-using-couple-bed is-under-cover';person.dataset.coupleBedId=bed.dataset.furniturePlacement;person.dataset.bedSlot=slot;person.dataset.sleepStyle='tidy';
   person.innerHTML=`<span class="home-person-visual"><span class="avatar" style="background:${slot?'#a9cdad':'#e7b6b0'};border-radius:50%;color:#30251e;display:grid;place-items:center;font-size:16px">${slot?'B':'A'}</span></span>`;people.append(person);
  }
  bed.querySelector('.couple-bed-quilt')?.remove();
  const overlay=document.createElement('div');overlay.className='room-furniture-overlay-layer';overlay.innerHTML=`<span class="room-couple-bed-overlay" style="${bed.getAttribute('style')}"><img class="couple-bed-layer couple-bed-quilt" src="assets/furniture/couple-bed/couple-bed-quilt.png"><img class="couple-bed-layer couple-bed-footboard" src="assets/furniture/couple-bed/couple-bed-footboard.png"></span>`;room.append(overlay);
  const editor=await import(performance.getEntriesByType('resource').find(r=>/\/home-editor-ui\.js\?/.test(r.name)).name);editor.fitCoupleBedOccupants(document);
  return {id:bed.dataset.furniturePlacement};
 });
 const faces=page.locator(`[data-couple-bed-id="${fixture.id}"] .avatar`);assert.equal(await faces.count(),2);
 const a=await faces.nth(0).boundingBox(),b=await faces.nth(1).boundingBox(),bedBox=await bed.boundingBox();
 assert.ok(a.width>=20&&b.width>=20&&a.x+a.width<=b.x,`${width}: bed faces overlap`);
 const covered=await faces.evaluateAll(async faces=>{
  const quilt=faces[0].closest('.room').querySelector('.room-furniture-overlay-layer .couple-bed-quilt');await quilt.decode();
  const canvas=document.createElement('canvas');canvas.width=quilt.naturalWidth;canvas.height=quilt.naturalHeight;const ctx=canvas.getContext('2d');ctx.drawImage(quilt,0,0);
  const rect=quilt.getBoundingClientRect(),scale=Math.min(rect.width/canvas.width,rect.height/canvas.height),left=rect.x+(rect.width-canvas.width*scale)/2,top=rect.y+(rect.height-canvas.height*scale)/2;
  const alpha=(x,y)=>ctx.getImageData(Math.floor((x-left)/scale),Math.floor((y-top)/scale),1,1).data[3];
  return faces.map(face=>{const f=face.getBoundingClientRect();return {upper:alpha(f.x+f.width/2,f.y+f.height*.15),lower:alpha(f.x+f.width/2,f.y+f.height*.85),front:Number(getComputedStyle(quilt.closest('.room-furniture-overlay-layer')).zIndex)>Number(getComputedStyle(face.closest('.room-people')).zIndex)}});
 });
 for(const face of covered){assert.ok(face.upper<30,`${width}: face must remain visible above quilt`);assert.ok(face.lower>220&&face.front,`${width}: lower character must be underneath opaque foreground quilt`)}
 const person=faces.first().locator('..').locator('..');
 for(const style of ['tidy','kick','curl','stretch','hug','talk','restless','still','light','snore']){
  await person.evaluate((el,style)=>el.dataset.sleepStyle=style,style);
  assert.equal(await person.locator('.home-person-visual').evaluate(el=>getComputedStyle(el).animationName),`sleep-${style}`,`${width}: habit ${style}`);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await person.locator('.home-person-visual').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.emulateMedia({reducedMotion:'no-preference'});
 await person.evaluate(el=>el.dataset.sleepStyle='tidy');
 await bed.locator('..').locator('..').screenshot({path:resolve(output,`bed-faces-${width}.png`)});
 return {homeIcon:true,bookPaginationInsidePaper:true,officialCards:true,twoBedFaces:true,firstCharacterSaved:true};
}
