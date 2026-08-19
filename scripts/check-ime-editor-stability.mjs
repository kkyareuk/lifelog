import assert from "node:assert/strict";
import fs from "node:fs";

const app=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const state=fs.readFileSync(new URL("../state.js",import.meta.url),"utf8");

const section=(source,start,end)=>{
  const from=source.indexOf(start);
  const to=source.indexOf(end,from+start.length);
  assert.ok(from>=0&&to>from,`검사 구간을 찾지 못했습니다: ${start}`);
  return source.slice(from,to);
};

const mobileDraft=section(app,"function markMobileCharacterDraft","const numericCharacterFields");
assert.equal(mobileDraft.includes("setTimeout"),false,"모바일 캐릭터 입력 중 타이머 저장을 다시 추가하면 안 됩니다.");
assert.equal(mobileDraft.includes("save("),false,"모바일 캐릭터 입력 이벤트에서 즉시 저장하면 안 됩니다.");

const personality=section(app,'$$("[data-personality-field]")','$$ ("[data-personality-type]")'.replace("$$ (","$$("));
assert.equal(personality.includes("render("),false,"성격 선택 하나마다 편집 화면 전체를 다시 그리면 안 됩니다.");

const bodyList=section(app,'$$("[data-body-list]")','$$ ("[data-field]")'.replace("$$ (","$$("));
assert.equal(bodyList.includes("render("),false,"신체 특성 선택 하나마다 고급 설정을 닫으면 안 됩니다.");

assert.match(state,/if\(!immediate&&editingText\)/,"텍스트 입력 포커스 중 자동저장 지연 장치가 필요합니다.");
assert.match(app,/advancedClass:\[\.\.\.details\.classList\]/,"불가피한 재렌더에서도 열린 고급 설정을 복원해야 합니다.");

console.log("IME 입력 안정성 및 고급 설정 유지 검사 통과");
