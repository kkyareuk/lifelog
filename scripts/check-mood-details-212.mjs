import assert from "node:assert/strict";
import {observedMoodEvents} from "../mood-event-causes.js";
import {characterMood} from "../character-mood.js";
const title="서재에서 읽을 책을 고르는 중";
const desc="지금 집중할 수 있는 길이와 주제를 생각해 몇 권의 첫 페이지를 읽고 한 권을 골랐어요. 예정 밖의 변화가 생기자 다른 사람보다 먼저 세부 순서를 다시 정해 알려 주었어요.";
const world={characters:{},homes:{},towns:[],routines:{},monthlyRoutines:{},catalog:{}};
const c={id:"a",planningStyle:"계획적",moodVolatility:"거의 흔들리지 않음"};
assert.equal(observedMoodEvents(title+" "+desc).angry,undefined);
for(const neutral of ["대화가 잘 이어졌어요.","영화가 끝났어요.","문화가 다른 곳을 둘러봤어요.","변화가 생기자 순서를 정했어요.","They updated the schedule."]){
 assert.equal(observedMoodEvents(neutral).angry,undefined,neutral);
}
for(const language of ["ko","en","ja"]){
 const mood=characterMood(c,{title,desc,date:"2026-09-04",minute:700},world,language);
 assert.ok(!mood.reasons.some(r=>r.value===-28));
 assert.ok(mood.reasons.some(r=>r.value===-7),"planning preference creates the actual adjustment burden");
 assert.ok(mood.reasons.every(r=>!r.text.includes(title)&&!r.text.includes(desc)),"no quoted log in mood reasons");
 if(language!=="ko")assert.ok(mood.reasons.every(r=>!/[가-힣]/.test(r.text)));
 const conflict=characterMood(c,{title:"말다툼 중",desc:"의견이 달라 크게 다투었어요.",date:"2026-09-04",minute:700},world,language);
 assert.ok(conflict.reasons.some(r=>r.value===-28),"real conflict still affects mood");
}
for(const copy of ["갈등이 없었어요.","다투지 않고 책을 읽었어요.","They are not angry.","怒っていない。"]){
 assert.equal(observedMoodEvents(copy).angry,undefined);
}
assert.ok(observedMoodEvents("갈등은 없었어요. 하지만 모욕을 당했어요.").angry,"negation in a different sentence does not erase real harm");
assert.ok(observedMoodEvents("They laughed together.").positive);
assert.ok(observedMoodEvents("仕事に失敗してがっかりした。").sad);
console.log("PASS mood details 212: neutral 변화가/대화가/영화가, real conflict, local negation, planning burden and independent ko/en/ja reasons.");
