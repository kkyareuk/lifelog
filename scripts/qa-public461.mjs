import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{chromium,webkit}=require('C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=process.cwd();
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname,f=resolve(root,'.'+(p==='/'?'/index.html':p));const b=await readFile(p==='/auth.js'?resolve('scripts/ios-preview-auth.mjs'):f);res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[extname(f)]||'application/octet-stream');res.end(b)}catch{res.writeHead(404).end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin=`http://127.0.0.1:${server.address().port}`,browser=await (process.argv.includes('--webkit')?webkit.launch({headless:true}):chromium.launch({channel:'chrome',headless:true}));
import assert from 'node:assert/strict';
try{
 const p=await browser.newPage({viewport:{width:384,height:832},serviceWorkers:'block'}),errors=[];
 await p.clock.setFixedTime(new Date('2026-09-20T02:00:00'));p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());await p.goto(origin+'/?native-preview=1');await p.waitForFunction(()=>window.ParallelCity);
 await p.evaluate(async()=>{window.g=await import('/state.js?v=20260909dev305');const id=g.createCharacter(10);window.c=g.state.characters[id];c.sleep='23:00';c.wake='07:00';c.icon='./assets/home-ui/phone.png';window.h=g.state.homes[c.homeId];c.sleepRoomId='bedroom';c.residences=[{homeId:h.id,isPrimary:true,sleepRoomId:'bedroom',stayPattern:'상시 거주'}];h.rooms={bedroom:{name:'침실',type:'침실',floor:1,furniturePlacements:[{id:'bed',item:'1인 침대',x:70,y:30,scale:1,rotation:0,assignedCharacterIds:[id]}]}};g.state.activeHomeId=h.id;for(const tab of ['observe','home'])localStorage.setItem('drawer-village-guide-'+tab,'1');document.querySelectorAll('dialog[open]').forEach(d=>d.close());window.DrawerVillageNavigation.go('home')});
 if(await p.locator('.drawer-title').count())await p.getByRole('button',{name:'탭하여 서랍 열기',exact:true}).click();
 const checkBed=async label=>{await p.waitForFunction(()=>{const b=document.querySelector('.couple-bed-base'),a=document.querySelector('.is-using-couple-bed');if(!b?.complete||!a)return false;const br=b.getBoundingClientRect(),ar=a.getBoundingClientRect(),x=ar.x+ar.width/2,y=ar.y+ar.height/2;return x>=br.left&&x<=br.right&&y>=br.top&&y<=br.bottom});console.log('PASS',label)};
 await checkBed('personal sleeper inside bed');
 await p.evaluate(()=>{window.ParallelCityAuth.getInfo=()=>({ready:true,user:{uid:'me',displayName:'Apple supplied name',providerData:[{providerId:'apple.com'}]}});window.snap={activeGroupId:'g',group:{id:'g',towns:[{id:'t',name:'마을'}]},residents:[{id:'r',sourceCharacterId:c.id,ownerUid:'me',townId:'t',sharedHomeId:'h',lifeJson:JSON.stringify({scene:{title:'자는 중',home:true,room:'bedroom',sleeping:true,actionKind:'sleep',minute:0}}),name:'Shared sleeper',profileJson:JSON.stringify(c)}],homes:[{id:'h',ownerUid:'me',layoutJson:JSON.stringify(h)}],loadedCollections:['group','residents','homes']};window.DrawerVillageGroups={getSnapshot:()=>snap};window.ParallelCity.mediaChanged()});
 await checkBed('shared sleeper with remapped assigned bed');
 for(const [x,y,rotation] of [[25,65,90],[75,25,270],[50,40,0]]){
  await p.evaluate(([x,y,rotation])=>{const layout=JSON.parse(snap.homes[0].layoutJson);Object.assign(layout.rooms.bedroom.furniturePlacements[0],{x,y,rotation});snap.homes[0].layoutJson=JSON.stringify(layout);window.ParallelCity.mediaChanged()},[x,y,rotation]);await checkBed('moved/rotated shared bed '+rotation);
 }
 // Sign-in completion never opens a mandatory registration dialog. Explicit
 // Settings editing still opens and pre-fills the supplied provider identity.
 await p.evaluate(()=>window.dispatchEvent(new Event('drawer-village-auth-busy')));
 assert.equal(await p.locator('[data-user-profile-dialog]').count(),0);
 await p.evaluate(async()=>{const m=await import('/user-profile.js');m.openUserProfile()});
 assert.equal(await p.locator('[data-user-profile-dialog] input[name=name]').inputValue(),'Apple supplied name');
 await p.evaluate(()=>document.querySelector('[data-user-profile-dialog]').close());
 console.log('PASS Apple completion without profile gate; optional edit prefilled');
 await p.evaluate(()=>{snap={...snap,activeGroupId:'other',residents:[{id:'remote',icon:'./assets/home-ui/home.png'}],incomingMail:[{id:'letter',groupId:'origin',sourceId:'remote',sourceName:'Sender',senderUid:'sender',recipientUid:'me',subject:'Cross-village letter',body:'Fixture',createdAt:Date.now()}],outgoingMail:[],incomingProposals:[],outgoingProposals:[]};window.DrawerVillageGroups.refreshMailbox=()=>new Promise(resolve=>{window.finishMailbox=()=>{snap.incomingMail=snap.incomingMail.map(m=>({...m,senderPhoto:'./assets/home-ui/phone.png'}));resolve()}});window.DrawerVillageNavigation.go('mailbox')});
 await p.locator('[data-mail-folder=inbox]').click();await p.locator('[data-mail-open=letter]').click();
 assert.equal(await p.locator('.mail-reader .mail-watermark').count(),0,'must not show same-ID portrait from another village');
 await p.waitForFunction(()=>window.finishMailbox);await p.evaluate(()=>finishMailbox());
 await p.waitForFunction(()=>document.querySelector('.mail-reader .mail-watermark')?.naturalWidth>0);
 assert((await p.locator('.mail-reader .mail-watermark').getAttribute('src')).endsWith('phone.png'));
 assert.equal(await p.evaluate(()=>snap.activeGroupId),'other');
 console.log('PASS cross-village letter portrait after delayed account fetch without selecting sender village');
 assert.deepEqual(errors,[]);
 await p.screenshot({path:'tmp/qa461-mail.png'});
 const cid=await p.evaluate(()=>{g.setCharacterBodyChoices(c.id,'appearance.eyeFeatures',['역안']);g.updateCharacter(c.id,{bodyProfile:{...c.bodyProfile,tattoos:[{name:'문신',location:'등',type:'이레즈미'}]}});return c.id});
 await p.reload();await p.waitForFunction(()=>window.ParallelCity);
 const body=await p.evaluate(id=>window.ParallelCity.getState().characters[id].bodyProfile,cid);
 assert.deepEqual(body.appearance.eyeFeatures,['역안']);assert.equal(body.tattoos[0].type,'이레즈미');
 const viewSource=await readFile('views.js','utf8');assert(viewSource.includes('EYE_FEATURE_OPTIONS=["역안"'));assert(viewSource.includes('TATTOO_TYPE_OPTIONS=["설정하지 않음","이레즈미"'));
 console.log('PASS existing black sclera and Irezumi choices survive saved reload');
}finally{await browser.close();server.closeAllConnections();server.close()}

