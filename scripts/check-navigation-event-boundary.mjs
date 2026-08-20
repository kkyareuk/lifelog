import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const moduleSources=["app.js","auth.js","state.js","simulation.js","views.js"].map(file=>fs.readFileSync(path.join(root,file),"utf8"));
const moduleVersions=[...moduleSources.join("\n").matchAll(/(?:from\s+|import\()["'][^"']+\?v=([^"']+)/g)].map(match=>match[1]);
const assertions=[
  [!app.includes("captureTabPointerUp")&&!app.includes("touchTabClickGuard"),"pointerup 재렌더와 지연 click 좌표 가드 제거"],
  [app.includes('document.addEventListener("click",captureTabClick,true)')&&app.includes('if(tab==="settings"&&button.dataset.settingsPane)')&&app.includes('event.stopImmediatePropagation();')&&app.includes('navigateToTab(tab);'),"확정 click에서 일반 탭과 설정 하위 메뉴를 한 번만 처리"],
  [app.includes('const startupHashTab=new URLSearchParams(location.hash.replace(/^#/,""))')&&app.includes('const nativeStartup=Boolean(window.DRAWER_VILLAGE_NATIVE'),"사이트 URL 탭과 앱 시작 화면을 분리"],
  [app.includes('let navigationTabIntent=""')&&app.includes('if(navigationTabIntent&&state.activeTab!==navigationTabIntent)state.activeTab=navigationTabIntent'),"늦은 초기화보다 마지막 사용자 화면 전환을 우선"],
  [app.includes('if(document.documentElement.dataset.drawerRendered!=="1")setNavigationTabIntent(startupTab);'),"사용자가 누른 뒤의 활성 탭을 부팅 코드가 덮어쓰지 않음"],
  [app.includes('window.addEventListener("hashchange"')&&app.includes('if(APP_TABS.includes(tab))navigateToTab(tab,{recordHistory:false})'),"사이트 해시 주소와 설정 하위 메뉴를 같은 문서에서도 실제 화면과 동기화"],
  [!app.includes('state.activeTab="wardrobe"'),"옷 관련 버튼의 존재하지 않는 탭 이동 제거"],
  [moduleVersions.length>0&&new Set(moduleVersions).size===1,"화면·이벤트·저장 모듈이 같은 상태 인스턴스를 공유"],
  [!app.includes("pendingTabFallback")&&!app.includes("setTimeout(()=>{\n    pendingTabFallback"),"화면 교체 전 지연 타이머 제거"]
];

let failed=0;
for(const [passed,label] of assertions){
  console.log(`${passed?"PASS":"FAIL"} ${label}`);
  if(!passed)failed++;
}
if(failed)process.exitCode=1;
else console.log(`\nPASS ${assertions.length} navigation event boundary checks.`);
