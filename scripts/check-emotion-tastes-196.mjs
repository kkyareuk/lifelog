import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {characterMood} from "../character-mood.js";

let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks+=1};
const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks+=1};
const [views,css,app,state,simulation,gradle,sw]=await Promise.all([
  "../views.js","../character-book.css","../app.js","../state.js","../simulation.js","../android/app/build.gradle","../sw.js"
].map(path=>readFile(new URL(path,import.meta.url),"utf8")));

for(const option of ["매우 낙천적임","유혹적인 편","까칠한 편","침울한 편","분노를 품은 편"]){
  ok(views.includes(`\"${option}\"`),`평소 정서에 ${option} 선택지를 제공한다`);
}
for(const field of ["emotionalSensitivity","emotionalContagion"]){
  ok(views.includes(`\"${field}\"`)&&state.includes(field)&&simulation.includes(field),`${field}가 화면·저장·생활 로그에 연결된다`);
}
ok(css.includes("row-gap:3.15cqw")&&css.includes("font-size:2.72cqw"),"9페이지 선택지 사이 간격과 제목 글자 크기를 키운다");
ok(views.includes('data-open-taste-group="favorites"')&&views.includes('data-open-taste-group="dislikes"'),"11페이지에 좋아하는 것과 싫어하는 것 진입점을 나란히 둔다");
ok(!views.includes('data-open-taste-group="catalog"'),"좋아하는 것 사전은 별도 진입점이 아니라 좋아하는 것 안에 합친다");
ok(views.includes('catalogSelectionButton(label,kind,"favorites")')&&views.includes('catalogSelectionButton(label.replace("좋아하는","싫어하는"),kind,"dislikes")'),"좋아함·싫어함 양쪽에서 사전 항목을 고른다");
ok(views.includes('<button type="submit" value="apply">${t("선택 완료","선택 완료")}</button>'),"하위 선택 완료를 명시적인 apply 값으로 반환한다");
ok(app.includes('dialog.returnValue==="apply"&&mode')&&app.includes('dialog.returnValue==="apply"&&group'),"하위 선택 완료 뒤 원래 좋아함·싫어함 창을 다시 연다");
ok(state.includes("export function toggleDislike")&&state.includes("c.dislikes"),"사전 싫어요 선택을 별도 데이터로 저장한다");

const world={uiLanguage:"ko",world:{id:"town",name:"마을",reputation:"지정 안 함",places:[]},towns:[],homes:{},characters:{other:{id:"other",name:"상대"}},relationships:{},catalog:{food:[{id:"cake",name:"초콜릿 케이크"}]},routines:{},monthlyRoutines:{}};
const base={id:"c",name:"테스터",townId:"town",personalityTypes:[],characterTraits:[],interests:[],hobbies:[],inventory:{},favorites:{food:["cake"]},dislikes:{},emotionalBaseline:"현실적인 편",moodVolatility:"상황에 따라 달라짐",positiveMoodResponse:"기쁨이 크게 드러남",stressMoodResponse:"화부터 남",moodRecoveryStyle:"혼자 정리하며 회복",emotionalSensitivity:"보통",emotionalContagion:"상황에 따라 물듦",flirtResponse:"직접 호응함"};
const scene=(title,desc,extra={})=>({date:"2026-09-02",minute:700,title,desc,...extra});
const liked=characterMood(base,scene("선물을 받는 중","좋아하는 초콜릿 케이크 선물을 받고 웃었어요."),world);
const neutral=characterMood({...base,favorites:{}},scene("선물을 받는 중","선물을 받고 웃었어요."),world);
ok(liked.score>neutral.score&&liked.reasons.some(reason=>reason.text.includes("초콜릿 케이크")),"좋아하는 항목을 실제 기분 점수와 이유에 반영한다");
const disliked=characterMood({...base,dislikedScentNotes:["매캐한 향"]},scene("향을 맡은 중","싫어하는 매캐한 향과 역겨운 냄새가 났어요."),world);
equal(disliked.label,"혐오감","싫어하는 항목과 사건 내용에 맞는 구체적인 감정을 표시한다");
const dull=characterMood({...base,emotionalSensitivity:"매우 둔감함"},scene("다투는 중","무시당해 크게 다투고 화가 났어요."),world);
const sensitive=characterMood({...base,emotionalSensitivity:"매우 예민함"},scene("다투는 중","무시당해 크게 다투고 화가 났어요."),world);
ok(sensitive.score<dull.score,"감정 자극 민감도가 같은 사건의 실제 기분 강도를 바꾼다");
equal(characterMood({...base,emotionalBaseline:"유혹적인 편"},scene("눈빛을 주고받는 중","호감 신호를 보내며 유혹했고 직접 호응했어요."),world).label,"유혹적임","유혹 성향과 반응이 유혹적 감정·행동을 만든다");
equal(characterMood({...base,emotionalBaseline:"분노를 품은 편",impulseControl:"쉽게 욱함"},scene("말다툼 중","무시당해 크게 다투고 화가 났어요."),world).label,"격분함","분노 성향과 충동 조절이 강한 분노 감정을 만든다");
for(const tone of ["furious","irritated","disgusted","flirty","curious","excited"]){
  ok(simulation.includes(`${tone}:{`),`${tone} 감정은 배지만 바뀌지 않고 다음 행동을 실제로 바꾼다`);
}
ok(simulation.includes('"preference-liked"')&&simulation.includes('"preference-disliked"'),"좋아함·싫어함에 맞춘 생활 행동과 로그를 생성한다");
ok(/versionCode\s+(?:19[6-9]|20[01])/.test(gradle)&&/versionName\s+"1\.0\.18[3-7](?:\.\d+)?"/.test(gradle),"Android 버전은 1.0.183 / 196 이상이다");
ok(/drawer-village-v20260902-(?:emotion-tastes-196|bed-buildings-197|life-assets-198|character-settings-199|bed-buildings-statistics-200|buttons-love-hotfix-201)/.test(sw),"서비스워커 캐시가 새 빌드로 분리된다");

console.log(`v1.0.183 / 196 emotion and taste checks passed: ${checks}`);
