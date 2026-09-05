import assert from "node:assert/strict";
import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const app=read("app.js"),state=read("state.js"),css=read("app.css"),gradle=read("android/app/build.gradle");

assert.match(app,/class="official-legal-registration" hidden/);
assert.match(app,/name="legalRegistration" value="registered"/);
assert.match(app,/name="legalRegistration" value="unregistered"/);
assert.match(app,/legallyRegisterable=\["부부","부모·자녀","형제·자매"\]\.includes/);
assert.match(app,/f\.querySelector\("\.official-legal-registration"\)\.hidden=!legallyRegisterable/);
assert.match(app,/const officialValues=\["관계를 따로 명명하지 않음","당사자끼리만 관계를 인정함","가까운 사람에게만 알림","누구에게나 공개함"\]/);
assert.doesNotMatch(app,/const officialValues=.*법적으로 관계가 등록됨/);
assert.match(state,/normalizeLegalRegistration/);
assert.match(state,/relation\.legalRegistration=normalizeLegalRegistration/);

assert.match(app,/data-official-order-list/);
assert.match(app,/selectedMemberIds\.map\(\(cid,index\)=>/);
assert.match(app,/data-move-official-member="up"/);
assert.match(app,/data-move-official-member="down"/);
assert.match(app,/\[selectedMemberIds\[index\],selectedMemberIds\[next\]\]=\[selectedMemberIds\[next\],selectedMemberIds\[index\]\]/);
assert.doesNotMatch(app,/앞의 두 캐릭터 위치 바꾸기/);
assert.doesNotMatch(app,/data-swap-official-pair/);

assert.match(css,/\.official-member-section\{position:static/);
assert.match(css,/\.official-relation-fields\{position:static!important/);
assert.match(css,/\.official-order-list\{display:grid!important/);
assert.match(css,/\.official-member-picker\{[^}]*max-height:188px[^}]*overflow-y:auto/);
assert.match(css,/\.relation-editor-dialog\.relationship-fullscreen-dialog>form\{[^}]*overflow-y:auto/);
assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=217);
assert.ok(Number(gradle.match(/versionName\s+"1\.0\.(\d+)"/)?.[1]||0)>=202);

console.log("PASS relationship editor: flowing cards, all-member ordering, and separate family registration");
