import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {homeMemberMenu,homeInformationMarkup,homeEditorCopy,homeRoomBrowser} from '../home-editor-ui.js';

const home={id:'home-test',name:'A & B',kind:'일반 주거',beautyLevel:'보기 좋음',ownerKind:'캐릭터',townId:'town',rooms:{living:{name:'거실',type:'living',floor:1}},pets:[{id:'pet',name:'Pet'}],cars:[{id:'car',name:'Car'}]};
const character={id:'person',name:'<Person>',icon:'portrait.png'};
for(const lang of ['ko','en','ja']){
  const copy=homeEditorCopy(lang),markup=homeMemberMenu(home,[character],lang);
  for(const kind of ['resident','pet','car']){
    assert.equal((markup.match(new RegExp(`data-member-add="${kind}"`,'g'))||[]).length,1);
    assert.equal((markup.match(new RegExp(`data-member-edit="${kind}"`,'g'))||[]).length,1);
  }
  assert.ok(markup.includes(copy.members)&&markup.includes(copy.pets)&&markup.includes(copy.cars));
  assert.ok(!markup.includes('data-open-home-feature'),'no nested member submenus');
  assert.ok(markup.includes('&lt;Person&gt;')&&markup.includes('portrait.png'));
  assert.deepEqual(Object.keys(copy).sort(),Object.keys(homeEditorCopy('ko')).sort());
  const info=homeInformationMarkup(home,'shared-exterior.png',{uiLanguage:lang,towns:[{id:'town',name:'Town',terrain:'평야'}],order:['person'],characters:{person:character}},v=>v);
  assert.ok(info.includes('src="shared-exterior.png"')&&info.includes('data-home-building-shape="home-test"'));
  for(const field of ['townId','kind','ownershipType','exteriorStyle','beautyLevel','ownerKind','ownerCharacterId','ownerName'])assert.ok(info.includes(`data-home-field="${field}"`));
  assert.ok(info.includes('value="보기 좋음" selected'),'town beauty value is preserved');
  assert.ok(info.includes('A &amp; B'));
  const rooms=homeRoomBrowser(home,lang);
  assert.ok(rooms.includes(copy.back)&&rooms.includes('data-add-room'));
}
const read=file=>readFile(new URL('../'+file,import.meta.url),'utf8');
const [app,css,views,gradle]=await Promise.all(['app.js','home-editor-ui.css','views.js','android/app/build.gradle'].map(read));
const roomEditor=app.match(/function openRoomEditor[\s\S]*?(?=function openBedAssignmentDialog)/)[0];
for(const name of ['titleTone','size','floor'])assert.ok(!roomEditor.includes(`name="${name}"`),`removed ${name} control`);
assert.ok(!roomEditor.includes('titleTone:')&&!roomEditor.includes('size:')&&!roomEditor.includes('floor:'),'hidden geometry and title values are not overwritten');
for(const name of ['cleanliness','ownerCharacterIds','accessCharacterIds','usePhoto','usage'])assert.ok((roomEditor+await read('room-permissions.js')).includes(name));
assert.ok(app.includes('$$("[data-member-edit]").forEach'));
assert.ok(app.includes('showHomeFeature(\'members\')')&&app.includes('showHomeFeature("members")'));
assert.ok(app.includes('refreshHomeMemberEditor()'));
assert.ok(views.includes('homeInformationMarkup(h,homeExteriorSource(h),state,t)'));
assert.ok(css.includes('.home-native-bottom .home-native-pill{position:relative!important'));
assert.ok(css.includes('building-info-wood.png')&&css.includes('town.webp'));
assert.match(gradle,/versionCode\s+212/);assert.match(gradle,/versionName\s+"1\.0\.197"/);
console.log('PASS home design 210: three member sections/add/edit, shared home state/photo, escaped data, removed controls preserve metadata, three-language key parity, navigation and version.');
