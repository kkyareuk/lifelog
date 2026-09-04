import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {snapFurniturePosition,furnitureFootprint,normalizeFurniturePlacement,HOUSE_FURNITURE_GRID} from '../furniture-layout.js';
import {homeEditorCopy,homeFurnitureDrawer,homeRoomBrowser,fitFurnitureSelection} from '../home-editor-ui.js';
import {orderAnimationCharacters} from '../character-placement.js';

assert.equal(HOUSE_FURNITURE_GRID.subdivisions,4);
assert.deepEqual(furnitureFootprint('커플 침대'),{columns:3,rows:4});
const grid={columns:12,rows:24},bed=furnitureFootprint('커플 침대');
const positions=Array.from({length:101},(_,x)=>snapFurniturePosition(x,50,grid,bed));
assert.ok(new Set(positions.map(p=>p.x)).size>30,'fine placement without shrinking furniture');
for(const p of positions){assert.ok(p.x>=12.5&&p.x<=87.5);assert.equal((p.column*4)%1,0)}
for(const facing of ['front','left','right']){
  const p=normalizeFurniturePlacement({id:'bed',item:'커플 침대',x:44,y:60,scale:1.6,rotation:15,facing,flipped:true});
  assert.equal(p.facing,facing);assert.equal(p.flipped,true);assert.equal(p.rotation,15);assert.equal(p.scale,1.6);
  assert.deepEqual(normalizeFurniturePlacement(JSON.parse(JSON.stringify(p))),p);
}
const legacy=normalizeFurniturePlacement({item:'소파',x:50,y:50});assert.equal(legacy.facing,'front');assert.equal(legacy.flipped,false);
const chars={a:{id:'a',animationPlacement:'always-right'},b:{id:'b',animationPlacement:'always-left'}};
assert.deepEqual(orderAnimationCharacters(['a','b'],chars,{},'town:home:test'),['b','a']);
const home={id:'test',activeFloor:1,floorCount:2,rooms:{a:{name:'침실',type:'bedroom',floor:1},b:{name:'<script>',type:'study',floor:2}}};
for(const locale of ['ko','en','ja']){
  const copy=homeEditorCopy(locale),drawer=homeFurnitureDrawer(home,locale),rooms=homeRoomBrowser(home,locale);
  assert.deepEqual(Object.keys(copy).sort(),Object.keys(homeEditorCopy('ko')).sort());
  assert.ok(drawer.includes(copy.searchFurniture));assert.ok(rooms.includes(copy.searchRooms));assert.ok(rooms.includes('&lt;script&gt;'));
  if(locale!=='ko')assert.ok(!/[가-힣]/.test(Object.values(copy).filter(x=>typeof x==='string').join('')));
}
const values={};fitFurnitureSelection({clientWidth:100,clientHeight:200,querySelector:()=>({naturalWidth:100,naturalHeight:100}),style:{setProperty:(k,v)=>values[k]=v}});
assert.equal(values['--selection-inset-y'],'47.5px');assert.equal(values['--selection-inset-x'],'0px');
const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');
const [views,app,css,gradle,index]=await Promise.all(['views.js','app.js','character-book.css','android/app/build.gradle','index.html'].map(read));
assert.ok(views.includes('data-lazy-home-log')&&!views.includes('${homeDailyLog(chars,h)}</div>'),'hidden logs are lazy');
assert.ok(views.includes('const charactersAtPlace=')&&!views.includes('simulateVisibleTimeline,charactersAtPlace'),'town cards use cached scene reads');
assert.ok(app.includes('||state.homeEditMode){liveSceneRefreshTimer=0;return}'),'scene refresh pauses in edit mode');
assert.ok(css.includes('top:53cqw;bottom:49cqw'),'closet ends above pagination');
assert.ok(index.includes('home-editor-ui.css?v=20260904home209'));
assert.match(gradle,/versionCode\s+209/);assert.match(gradle,/versionName\s+"1\.0\.194"/);
console.log('PASS home editor 209: snap precision, size preservation, orientation round-trip, placement order, three locales, selection bounds, lazy work, wardrobe and version.');
