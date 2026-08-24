export const HOME_SURFACE_KEYS=Object.freeze(["apricot","natural","cream","charcoal","walnut"]);

const SURFACE_IMAGES=Object.freeze({
  apricot:"./assets/home-surfaces/apricot-planks.png",
  natural:"./assets/home-surfaces/natural-planks.png",
  cream:"./assets/home-surfaces/cream-planks.png",
  charcoal:"./assets/home-surfaces/charcoal-planks.png",
  walnut:"./assets/home-surfaces/walnut-planks.png"
});

const SURFACE_LABELS=Object.freeze({
  ko:{apricot:"살구빛 목재",natural:"내추럴 목재",cream:"크림 목재",charcoal:"차콜 목재",walnut:"월넛 목재",custom:"직접 그린 바닥",same:"바닥과 같은 벽"},
  en:{apricot:"Apricot wood",natural:"Natural wood",cream:"Cream wood",charcoal:"Charcoal wood",walnut:"Walnut wood",custom:"Custom floor",same:"Match the floor"},
  ja:{apricot:"アプリコット材",natural:"ナチュラル材",cream:"クリーム材",charcoal:"チャコール材",walnut:"ウォールナット材",custom:"自作の床",same:"床と同じ壁"}
});

export const defaultHomeSurfaceForRoom=roomType=>["entry","bath"].includes(String(roomType||""))?"cream":"natural";

export function normalizeHomeSurface(value,roomType,{allowCustom=false,customImage=""}={}){
  const raw=String(value||"").trim();
  if(raw==="wood")return "natural";
  if(raw==="tile")return "cream";
  if(allowCustom&&raw==="custom"&&customImage)return "custom";
  return HOME_SURFACE_KEYS.includes(raw)?raw:defaultHomeSurfaceForRoom(roomType);
}

export function normalizeWallSurface(value,floorMaterial,roomType){
  const raw=String(value||"").trim();
  if(!raw||raw==="same")return "same";
  return normalizeHomeSurface(raw,roomType)==="custom"?(HOME_SURFACE_KEYS.includes(floorMaterial)?floorMaterial:defaultHomeSurfaceForRoom(roomType)):normalizeHomeSurface(raw,roomType);
}

export function homeSurfaceImage(material,customImage="",roomType="other"){
  const normalized=normalizeHomeSurface(material,roomType,{allowCustom:true,customImage});
  return normalized==="custom"&&customImage?customImage:SURFACE_IMAGES[normalized]||SURFACE_IMAGES[defaultHomeSurfaceForRoom(roomType)];
}

export function wallSurfaceImage(wallMaterial,floorMaterial,floorImage="",roomType="other"){
  const normalizedWall=normalizeWallSurface(wallMaterial,floorMaterial,roomType);
  if(normalizedWall==="same")return homeSurfaceImage(floorMaterial,floorImage,roomType);
  return homeSurfaceImage(normalizedWall,"",roomType);
}

export function homeSurfaceLabel(material,locale="ko"){
  return SURFACE_LABELS[locale]?.[material]||SURFACE_LABELS.ko[material]||String(material||"");
}
