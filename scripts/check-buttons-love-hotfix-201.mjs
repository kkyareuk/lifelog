import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {characterMood} from "../character-mood.js";

const root=new URL("../",import.meta.url);
const marker="20260906hotfix231";
const imports=source=>{
  const found=[];
  const pattern=/(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g;
  let match;
  while((match=pattern.exec(source)))found.push(match[1]);
  return found;
};

const queue=["app.js"],visited=new Set();
while(queue.length){
  const name=queue.shift();
  if(visited.has(name))continue;
  visited.add(name);
  const moduleUrl=new URL(name,root),source=await readFile(moduleUrl,"utf8");
  for(const specifier of imports(source)){
    const dependencyUrl=new URL(specifier,moduleUrl);
    if(!dependencyUrl.pathname.endsWith(".js"))continue;
    assert.equal(dependencyUrl.searchParams.get("v"),marker,`${name} -> ${specifier} 캐시 키`);
    dependencyUrl.search="";dependencyUrl.hash="";
    queue.push(dependencyUrl.pathname.split("/").pop());
  }
}
assert.ok(visited.has("views.js")&&visited.has("state.js")&&visited.has("dictionary.js"),"화면·상태·사전 모듈 그래프를 검사한다");

const world={
  uiLanguage:"ko",world:{id:"town",name:"서랍마을",reputation:"지정 안 함",places:[]},towns:[],homes:{},catalog:{},routines:{},monthlyRoutines:{},
  characters:{nerine:{id:"nerine",name:"네리네"},kro:{id:"kro",name:"크로"}},
  relationships:{love:{id:"love",a:"nerine",b:"kro",type:"연인",temporalStatus:"current"}},
  characterViews:{nerine:{kro:{overall:"깊이 사랑함",trust:"전적으로 믿음",conflictIntensity:"갈등이 거의 없음"}}}
};
const nerine={
  id:"nerine",name:"네리네",townId:"town",personalityTypes:["다정함"],characterTraits:[],interests:[],hobbies:[],inventory:{},favorites:{},dislikes:{},
  emotionalBaseline:"다정한 편",moodVolatility:"안정적인 편",stressMoodResponse:"화부터 남",angerResponse:"목소리가 커짐",emotionalSensitivity:"보통",emotionalContagion:"상황에 따라 물듦"
};
const scene=(title,desc)=>({date:"2026-09-02",minute:720,title,desc,withId:"kro"});
const caring=characterMood(nerine,scene("크로를 챙기는 중","크로가 불편하지 않도록 의자를 당겨 주었어요."),world);
assert.notEqual(caring.tone,"angry","배려 문장의 '불편하지 않도록'을 분노로 오인하지 않는다");
assert.ok(caring.reasons.some(reason=>reason.text.includes("사랑")&&reason.text.includes("크로")),"a/b 관계와 깊은 사랑 설정을 감정 완충에 반영한다");

const disagreement=characterMood(nerine,scene("크로와 저녁 약속을 두고 다투는 중","늦은 연락 때문에 갈등이 생겨 어떤 점이 속상했는지 이야기했어요."),world);
assert.equal(disagreement.label,"서운함","사랑하는 상대와의 가벼운 갈등을 격분으로 과장하지 않는다");
assert.equal(disagreement.tone,"sad","가벼운 연인 갈등은 관계를 미워하는 분노가 아니라 서운함으로 연결한다");
assert.ok(disagreement.reasons.some(reason=>reason.text.includes("크로")&&reason.text.includes("다툼")&&reason.text.includes("애정")),"기분 이유는 로그 인용 대신 갈등과 애정의 완충 영향을 함께 표시한다");
assert.ok(disagreement.reasons.every(reason=>!reason.text.includes("불편하거나 화가 남")),"모호한 분노 사유 문구를 만들지 않는다");

const severe=characterMood(nerine,scene("크로의 배신을 알게 된 중","크로가 심한 거짓말로 신뢰를 깨뜨린 사실 때문에 크게 다투고 화가 났어요."),world);
assert.ok(["angry","furious"].includes(severe.tone),"폭력·배신 같은 중대한 사건은 사랑 관계여도 실제 분노로 남긴다");

for(const language of ["en","ja"]){
  const localized=characterMood(nerine,scene("크로와 약속 문제로 다투는 중","늦은 연락 때문에 갈등이 생겼어요."),{...world,uiLanguage:language},language);
  assert.notEqual(localized.label,"서운함",`${language} 감정 이름을 번역한다`);
  assert.ok(localized.reasons.every(reason=>!reason.text.includes("불편하거나 화가 남")),`${language}에서도 구체적인 사건 이유를 사용한다`);
}

const [gradle,serviceWorker,index]=await Promise.all([
  readFile(new URL("android/app/build.gradle",root),"utf8"),readFile(new URL("sw.js",root),"utf8"),readFile(new URL("index.html",root),"utf8")
]);
assert.match(gradle,/versionCode\s+213/);
assert.match(gradle,/versionName\s+"1\.0\.198"/);
assert.ok(serviceWorker.includes("drawer-village-v20260905-home-android-dev-214"));
assert.ok(index.includes(marker));

console.log(`v1.0.188 / 202 버튼 상태·애정 관계 감정 회귀 검증 완료 (${visited.size} modules)`);
