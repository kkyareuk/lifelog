import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {homeMemberMenu,homeRoomBrowser,homeFurnitureDrawer,homeEditorCopy} from '../home-editor-ui.js';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const css=read('home-editor-ui.css'),appCss=read('app.css'),book=read('character-book.css'),views=read('views.js');
const home={id:'test',activeFloor:1,rooms:{living:{name:'Living',type:'living',floor:1,image:'https://example.com/room.jpg'}},pets:[],cars:[{id:'car',name:'Car',image:'🚙'}]};
for(const locale of ['ko','en','ja']){
  const members=homeMemberMenu(home,[],locale),rooms=homeRoomBrowser(home,locale),drawer=homeFurnitureDrawer(home,locale),copy=homeEditorCopy(locale);
  assert.ok(!members.includes('src="🚙"'),'emoji is not used as an image URL');
  assert.ok(members.includes('home-catalog-photo'));
  assert.ok(rooms.includes('home-catalog-paper')&&rooms.includes(copy.addRoom));
  assert.ok(drawer.includes('data-home-furniture-type')&&!drawer.includes('furnitureTheme'));
}
assert.ok(book.includes('height:187cqw')&&book.includes('border-image:')&&book.includes('120 50 150 65 fill stretch'));
assert.ok(appCss.includes('.room-furniture-layer:has(.is-dragging)::before'));
assert.ok(appCss.includes('.rooms:has(.room-dragging)::before'));
assert.ok(!appCss.includes('.home.is-editing .rooms::before'));
assert.ok(!appCss.includes('.home.is-editing .room-furniture-layer::before'));
assert.ok(css.includes('grid-template-rows:36px 34px 34px 94px')&&css.includes('height:var(--home-drawer-height)'));
for(const part of ['left','middle','right'])assert.ok(appCss.includes('--home-ui-pill-'+part));
assert.ok(css.includes('.home-journal-page>.home-journal-content')&&css.includes('overflow-wrap:anywhere!important'));
assert.ok(views.includes('home-journal-content" data-lazy-home-log'));
assert.match(read('android/app/build.gradle'),/versionCode\s+213/);
console.log('PASS home polish 211: book extension, rounded photo cards, fixed drawer height, three-slice menu, drag-only grids, journal scroll owner, three locales and version.');
