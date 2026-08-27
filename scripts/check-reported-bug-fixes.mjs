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
  [app.includes('showToast(label==="캐릭터 저장"?"캐릭터 저장 완료"')&&app.includes('Promise.resolve(auth.upload'),"캐릭터 저장 완료를 즉시 알리고 계정 동기화는 배경에서 진행한다"],
  [app.includes('{alreadySaved=false,renderAfter=true}')&&app.includes('{alreadySaved:true,renderAfter:false}'),"모바일 캐릭터 저장에서 중복 저장·렌더링을 제거한다"],
  [app.includes('mobileCharacterDialog.returnValue!=="save"')&&app.includes('mobileCharacterDraftDirty=false;mobileCharacterEditorPane=""'),"저장 후 닫기 이벤트가 같은 초안을 다시 저장하지 않는다"],
  [app.includes('const officialListButton=f.querySelector("[data-open-official-list-from-editor]")')&&app.includes('if(officialListButton)officialListButton.onclick'),"SVG 개편 뒤 선택 요소가 없어도 공식 관계 편집기가 중단되지 않는다"]
];
const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);
console.log(`\nPASS ${checks.length} reported bug regression checks.`);
