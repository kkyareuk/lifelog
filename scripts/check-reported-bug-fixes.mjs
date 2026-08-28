import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js"),app=read("app.js"),state=read("state.js"),css=read("app.css");
const checks=[
  [views.includes('class="home-native-empty-delete danger"')&&views.includes('data-delete-home="${esc(homeId)}"'),"빈집을 집 전환 목록에서 직접 삭제할 수 있다"],
  [state.includes("export function deleteHome(homeId)")&&state.includes("delete state.homes[homeId]")&&state.includes("item.homeId!==homeId"),"집 삭제 시 캐릭터 주거 연결도 안전하게 정리한다"],
  [views.includes('profileAvatar(c,"resident-character-image")')&&views.includes("DrawerVillageAvatarFallback"),"집 구성원 이미지는 공통 복구·대체 이미지 경로를 사용한다"],
  [css.includes('.resident-profile>.resident-character-image')&&css.includes('object-fit:contain!important'),"구성원 이미지를 잘리지 않게 표시한다"],
  [app.includes('characterSaving:"캐릭터 저장 중…"')&&app.includes('showToast(characterSave?copy.characterDone')&&app.includes('Promise.resolve(auth.upload'),"캐릭터 저장 상태를 즉시 알리고 계정 동기화는 배경에서 진행한다"],
  [app.includes('{alreadySaved=false,renderAfter=true}')&&app.includes('button.closest(".character-book-v8")')&&app.includes('{renderAfter:!fullBook}'),"전체설정 저장에서 거대한 책 화면의 불필요한 재렌더링을 제거한다"],
  [css.includes('#mini-toast{')&&css.includes('z-index:2147483647'),"전체설정 책보다 저장 알림을 앞쪽 레이어에 표시한다"],
  [!css.match(/\.relationship-stage\{[^}]*relationship-mosaic/s)&&css.includes('background-color:#fff8eb!important'),"관계 설정과 메인 화면에서 반복 체크무늬를 제거한다"],
  [css.includes('.relationship-viewpoint-dialog .relationship-all-fields')&&css.includes('background:transparent!important')&&css.includes('height:max(100dvh,917px)')&&css.includes('.relationship-viewpoint-dialog .relationship-view-field select')&&css.includes('color-scheme:light!important'),"시선 설정 흰 판을 제거하고 선택상자를 밝게 유지하며 마지막 충동 단계까지 볼 수 있다"],
  [css.includes('-webkit-text-stroke:2.7px #000')&&css.includes('.relationship-editor-pair figure>b')&&css.includes('-webkit-text-stroke:2.1px #000'),"관계 문구와 두 캐릭터 이름의 검은 외곽선을 강화한다"],
  [app.includes('mobileCharacterDialog.returnValue!=="save"')&&app.includes('mobileCharacterDraftDirty=false;mobileCharacterEditorPane=""'),"저장 후 닫기 이벤트가 같은 초안을 다시 저장하지 않는다"],
  [views.includes('data-open-official-relations')&&views.includes('relationship-list-create-card')&&app.includes('button.closest("[data-official-relation-dialog]")?.close()'),"공식 관계 목록을 거쳐 새 관계 설정 화면으로 이동한다"],
  [app.includes('explicitSave("관계 저장",{alreadySaved:true,renderAfter:false})'),"관계 저장 때 직렬화와 전체 렌더를 중복 실행하지 않는다"]
];
const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);
console.log(`\nPASS ${checks.length} reported bug regression checks.`);
