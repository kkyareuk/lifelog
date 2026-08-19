import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const app=await readFile(new URL("../app.js",import.meta.url),"utf8");
const views=await readFile(new URL("../views.js",import.meta.url),"utf8");
const prepare=await readFile(new URL("./prepare-app.mjs",import.meta.url),"utf8");

assert(!views.includes("locationBackground||c.photo"),"프로필 사진을 장면 배경으로 쓰면 안 됩니다.");
assert(views.includes("locationBackground||sceneTown?.bg||state.world?.bg||TOWN_BACKGROUND"),"장소·마을·기본 배경 순서가 유지되어야 합니다.");
assert(!app.includes("function renderPreservingCharacterEditorScroll"),"다중 선택 시 편집창 전체를 다시 그리면 안 됩니다.");

for(const marker of ['$$("[data-chip]")','$$("[data-favorite-kind]")','$$("[data-owned-kind]")']){
  const start=app.indexOf(marker);
  assert(start>=0,`${marker} 핸들러가 있어야 합니다.`);
  const handler=app.slice(start,app.indexOf("});",start)+3);
  assert(!/\brender\s*\(/.test(handler),`${marker} 핸들러는 전체 렌더를 호출하면 안 됩니다.`);
}

assert(views.includes("DRAWER_VILLAGE_APP_VERSION"),"설정 화면에서 앱 버전을 표시해야 합니다.");
assert(prepare.includes("window.DRAWER_VILLAGE_APP_VERSION"),"Android 앱에 버전 이름을 주입해야 합니다.");
assert(prepare.includes("window.DRAWER_VILLAGE_VERSION_CODE"),"Android 앱에 빌드 번호를 주입해야 합니다.");

console.log("캐릭터 편집 스크롤·마을 배경·버전 표시 회귀 검사를 통과했습니다.");
