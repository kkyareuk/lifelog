import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const gradle=read("android/app/build.gradle"),index=read("index.html"),app=read("app.js"),sw=read("sw.js");
const views=read("views.js"),auth=read("auth.js"),groups=read("groups.js"),rules=read("firestore.rules");
const book=read("character-book.css"),styles=["app.css","interface-system.css","home-scene-layout.css","theme.css","town-fit.css"].map(read);

assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=235);
assert.ok(Number(gradle.match(/versionName\s+"1\.0\.(\d+)"/)?.[1]||0)>=217);
assert.match(index,/app\.js\?v=20260906dev237/);
assert.match(index,/groups\.css\?v=20260906dev237/);
assert.match(app,/auth\.js\?v=20260906dev237/);
assert.match(sw,/drawer-village-v20260906-dev-237/);

assert.match(views,/renderGroups/);
assert.ok(views.includes('["groups",t("groups","그룹"),"♧"]'));
assert.match(app,/APP_TABS=.*"groups"/s);
assert.match(app,/data-group-create/);
assert.match(auth,/window\.DrawerVillageGroups/);
assert.match(auth,/memberCharacterLimit:20/);
assert.match(auth,/operatorCharacterLimit:100/);
assert.match(auth,/managerCharacterLimit:100/);
assert.match(auth,/원본 characterId의 개인 저장 데이터는 건드리지 않는다/);
assert.doesNotMatch(auth,/updateGroupMemberRole[\s\S]*?batch\.set\(groupIndexRef\(uid/);

for(const text of ["Build shared towns","Characters per member","Removing an item here never deletes","友だちとキャラクター","メンバー1人のキャラクター数","元キャラクターや家は削除されません"]){
  assert.ok(groups.includes(text),`missing group translation: ${text}`);
}

for(const source of styles){
  assert.doesNotMatch(source,/\(min-width:721px\) and \(max-width:900px\) and \(orientation:portrait\)/);
}
assert.match(read("app.css"),/@media\(max-width:1200px\),\(orientation:portrait\)/);
assert.match(book,/@media\(min-width:721px\) and \(orientation:landscape\)/);
assert.match(book,/Portrait tablets use the\s+phone hub and phone book/s);
assert.match(views,/if\(nativeApp&&state\.characterSettingsView!=="full"\)return nativeCharacterHub\(c\)/);

for(const path of ["/groups/{groupId}","/members/{memberId}","/residents/{residentId}","/homes/{homeId}","/groupInvites/{inviteCode}"]){
  assert.ok(rules.includes(`match ${path}`),`missing Firestore rule ${path}`);
}
assert.match(rules,/request\.resource\.data\.ownerUid == resource\.data\.ownerUid/);
assert.match(rules,/allow list: if false/);

console.log("PASS dev235: group multiplayer MVP and phone-equivalent tablet portrait layouts");
