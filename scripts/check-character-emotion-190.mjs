import fs from "node:fs";
import assert from "node:assert/strict";
import {characterMood} from "../character-mood.js";
import {localizeLifeLog} from "../life-log-localization.js";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),state=read("state.js"),css=read("character-book.css"),townCss=read("app.css"),gradle=read("android/app/build.gradle"),sw=read("sw.js");
const checks=[
  [views.includes('data-character-personality-pane="emotion"')&&views.includes("personalityEmotionPane"),"8쪽과 기존 9쪽 사이 정서 성향 페이지"],
  [views.includes("bookPageControls(9,'data-character-personality-pane=\"core\"','data-character-personality-pane=\"details\"')"),"정서 성향 9쪽 페이지 이동"],
  [views.includes("bookPageControls(10,'data-character-personality-pane=\"emotion\"'")&&views.includes("bookPageControls(12,'data-character-pane=\"taste\"'"),"뒤쪽 페이지 10~12 재번호"],
  [state.includes('"emotionalBaseline"')&&state.includes('"moodRecoveryStyle"')&&state.includes('["core","emotion","details"]'),"정서 데이터 저장·복원"],
  [app.includes('["core","emotion","details"].includes'),"정서 페이지 이동 이벤트"],
  [views.includes("character-editor-full-only")&&views.includes("if(fixedBookMode)return")&&views.includes("fullBookDialogs"),"전체설정 중복 DOM 제거"],
  [css.includes("personality-emotion-grid")&&css.includes("tactile raised control language"),"정서 페이지 및 입체형 버튼"],
  [views.includes("building-dress-code-dialog")&&views.includes("data-open-place-dress"),"건물 드레스코드 전용 팝업"],
  [townCss.includes("grid-template-columns:repeat(3,minmax(0,1fr))")&&townCss.includes("building-dress-code-dialog"),"드레스코드 3열 선택"],
  [/versionCode\s+19\d/.test(gradle)&&/versionName\s+"1\.0\.1[78]\d"/.test(gradle),"개발 빌드 190대 / 1.0.17x~1.0.18x"],
  [/drawer-village-v2026090[12]-(?:emotion-190|statistics-191|taste-scroll-194)/.test(sw)&&sw.includes("life-log-localization.js"),"새 캐시 및 생활 로그 번역 모듈"]
];
checks.forEach(([ok,label])=>assert.ok(ok,label));

const world={uiLanguage:"ko",homes:{},towns:[{id:"town",name:"서랍마을",reputation:"대체로 무난한 평판",places:[]}],world:{id:"town"},characters:{},relationships:{}};
const nerine={id:"nerine",townId:"town",personalityTypes:["낙천적이고 다정함"],emotionalBaseline:"낙천적인 편",moodVolatility:"안정적인 편",positiveMoodResponse:"미소와 말로 표현함",stressMoodResponse:"잠시 거리를 둠",moodRecoveryStyle:"혼자 정리하며 회복"};
const ordinary=characterMood(nerine,{title:"창가에서 차를 마시는 중",desc:"조용히 쉬고 있어요.",date:"2026-09-01",minute:600},world);
const conflict=characterMood(nerine,{title:"의견이 맞지 않아 다투는 중",desc:"불편한 점을 차분히 이야기했어요.",date:"2026-09-01",minute:700},world);
assert.notEqual(ordinary.label,"무덤덤함","낙천 성향이 무덤덤함으로 무작위 치환되면 안 됨");
assert.notEqual(conflict.label,"화남","화를 먼저 내지 않는 성향을 갈등만으로 화남 처리하면 안 됨");

const translatedWorld={characters:{a:{id:"a",name:"네리네"},b:{id:"b",name:"크로"}},homes:{},towns:[{id:"town",name:"서랍마을",places:[{id:"cafe",name:"까륵 카페"}]}],catalog:{}};
for(const language of ["en","ja"]){
  const localized=localizeLifeLog({title:"까륵 카페에서 차를 고르는 중",desc:"크로와 메뉴를 살펴보고 있어요.",townId:"town",placeId:"cafe",withId:"b"},language,translatedWorld,"a");
  assert.equal(localized.localizedFallback,true,`${language} 미번역 생활 로그 fallback`);
  assert.ok(localized.title&&localized.desc,`${language} 생활 로그 제목·본문`);
}
console.log("v1.0.177 / 190 캐릭터 성능·정서·드레스코드·로그 번역 검증 완료");
