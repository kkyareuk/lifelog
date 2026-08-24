export const HOME_SURFACE_KEYS=Object.freeze(["apricot","natural","cream","charcoal","walnut"]);
export const HOME_WALL_KEYS=Object.freeze(["cream-panel","cream-plain","stone-panel","taupe-panel","sky-tile","navy-tile","amber-tile"]);

const SURFACE_IMAGES=Object.freeze({
  apricot:"./assets/home-surfaces/apricot-planks.png",
  natural:"./assets/home-surfaces/natural-planks.png",
  cream:"./assets/home-surfaces/cream-planks.png",
  charcoal:"./assets/home-surfaces/charcoal-planks.png",
  walnut:"./assets/home-surfaces/walnut-planks.png"
});
const WALL_IMAGES=Object.freeze({
  "cream-panel":"./assets/home-walls/cream-panel.png",
  "cream-plain":"./assets/home-walls/cream-plain.png",
  "stone-panel":"./assets/home-walls/stone-panel.png",
  "taupe-panel":"./assets/home-walls/taupe-panel.png",
  "sky-tile":"./assets/home-walls/sky-tile.png",
  "navy-tile":"./assets/home-walls/navy-tile.png",
  "amber-tile":"./assets/home-walls/amber-tile.png"
});
const DEFAULT_WALL="cream-panel";

const SURFACE_LABELS=Object.freeze({
  ko:{apricot:"살구빛 목재",natural:"내추럴 목재",cream:"크림 목재",charcoal:"차콜 목재",walnut:"월넛 목재",custom:"직접 그린 바닥",same:"크림 몰딩 벽", "cream-panel":"크림 몰딩 벽","cream-plain":"크림 기본 벽","stone-panel":"회백색 몰딩 벽","taupe-panel":"토프 몰딩 벽","sky-tile":"하늘빛 타일 벽","navy-tile":"남색 타일 벽","amber-tile":"호박빛 타일 벽"},
  en:{apricot:"Apricot wood",natural:"Natural wood",cream:"Cream wood",charcoal:"Charcoal wood",walnut:"Walnut wood",custom:"Custom floor",same:"Cream paneled wall","cream-panel":"Cream paneled wall","cream-plain":"Plain cream wall","stone-panel":"Stone paneled wall","taupe-panel":"Taupe paneled wall","sky-tile":"Sky-blue tile wall","navy-tile":"Navy tile wall","amber-tile":"Amber tile wall"},
  ja:{apricot:"アプリコット材",natural:"ナチュラル材",cream:"クリーム材",charcoal:"チャコール材",walnut:"ウォールナット材",custom:"自作の床",same:"クリームの腰壁","cream-panel":"クリームの腰壁","cream-plain":"クリームの無地壁","stone-panel":"灰白色の腰壁","taupe-panel":"トープの腰壁","sky-tile":"空色タイル壁","navy-tile":"紺色タイル壁","amber-tile":"琥珀色タイル壁"}
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
  if(!raw||raw==="same"||HOME_SURFACE_KEYS.includes(raw)||raw==="custom")return DEFAULT_WALL;
  return HOME_WALL_KEYS.includes(raw)?raw:DEFAULT_WALL;
}

export function homeSurfaceImage(material,customImage="",roomType="other"){
  const normalized=normalizeHomeSurface(material,roomType,{allowCustom:true,customImage});
  return normalized==="custom"&&customImage?customImage:SURFACE_IMAGES[normalized]||SURFACE_IMAGES[defaultHomeSurfaceForRoom(roomType)];
}

export function wallSurfaceImage(wallMaterial,floorMaterial,floorImage="",roomType="other"){
  const normalizedWall=normalizeWallSurface(wallMaterial,floorMaterial,roomType);
  return WALL_IMAGES[normalizedWall]||WALL_IMAGES[DEFAULT_WALL];
}

export function homeSurfaceLabel(material,locale="ko"){
  return SURFACE_LABELS[locale]?.[material]||SURFACE_LABELS.ko[material]||String(material||"");
}
