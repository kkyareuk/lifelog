import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const assertions=[
  [app.includes('touchTabClickGuard={until:performance.now()+900'),"터치 pointerup 뒤 합성 click 차단 구간"],
  [app.includes('Math.hypot(event.clientX-touchTabClickGuard.x,event.clientY-touchTabClickGuard.y)<=32'),"동일 터치 좌표의 지연 click 식별"],
  [app.includes('event.stopImmediatePropagation();\n  touchTabClickGuard=')&&app.includes('event.stopImmediatePropagation();\n  navigateToTab(tab);'),"하나의 입력에서 하나의 탭 전환만 허용"],
  [!app.includes("pendingTabFallback")&&!app.includes("setTimeout(()=>{\n    pendingTabFallback"),"화면 교체 전 지연 타이머 제거"]
];

let failed=0;
for(const [passed,label] of assertions){
  console.log(`${passed?"PASS":"FAIL"} ${label}`);
  if(!passed)failed++;
}
if(failed)process.exitCode=1;
else console.log(`\nPASS ${assertions.length} navigation event boundary checks.`);
