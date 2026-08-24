import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const ok=(condition,message)=>{if(!condition)throw new Error(message);console.log(`✓ ${message}`)};
const layout=await import(`../furniture-layout.js?test=${Date.now()}`);
const source=fs.readFileSync(path.join(root,"app.js"),"utf8");
const viewSource=fs.readFileSync(path.join(root,"views.js"),"utf8");

const catalogItems=[...new Set(Object.values(layout.FURNITURE_CATALOG).flat())];
for(const item of catalogItems){
  const sprite=layout.furnitureSprite(item).replace(/^\.\//,"");
  const spritePath=path.join(root,sprite);
  ok(fs.existsSync(spritePath),`${item} 투명 스프라이트 연결`);
  ok(fs.readFileSync(spritePath)[25]===6,`${item} PNG 알파 채널 포함`);
  const size=layout.furnitureFootprint(item);
  ok(size.columns>=1&&size.rows>=1,`${item} 점유 칸 설정`);
  ok(Boolean(layout.furnitureLabel(item,"en"))&&Boolean(layout.furnitureLabel(item,"ja")),`${item} 영어·일본어 이름`);
}

ok(layout.furnitureFootprint("소파").columns===3,"소파는 3×1 칸");
ok(layout.furnitureFootprint("커플 침대").columns===3&&layout.furnitureFootprint("커플 침대").rows===2,"커플 침대는 3×2 칸");
ok(layout.furnitureFootprint("냉장고").columns===1&&layout.furnitureFootprint("냉장고").rows===2,"냉장고는 1×2 칸");
const edge=layout.snapFurniturePosition(100,100,{columns:6,rows:8},layout.furnitureFootprint("소파"));
ok(edge.x<100&&edge.y<100,"큰 가구가 방 격자 밖으로 넘지 않음");
ok(viewSource.includes('class="room-furniture-art" aria-hidden="true"><img src='),"집 화면은 이모지 대신 PNG 스프라이트 사용");
ok(source.includes('dismiss.dataset.homeOccupantDismiss=""')&&source.includes("dismiss.onclick=close"),"캐릭터 로그 바깥 탭 닫기");
ok(source.includes('if(tab!=="home")closeHomeOccupantSheet()'),"홈 이탈 시 캐릭터 로그 닫기");
ok(source.includes('`interaction:${interactionId}`'),"같은 대화 화면 재진입 이동 반복 방지");

console.log(`Furniture sprite checks passed · ${catalogItems.length} catalog items`);
