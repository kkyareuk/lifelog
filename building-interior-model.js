import {defaultBuildingRooms,legacyBuildingRooms} from './building-interior-presets.js';
export function buildingInterior(place,townId,language='ko'){
  const saved=place.interior&&typeof place.interior==='object'?structuredClone(place.interior):{};
  const home={...saved,id:'place-interior:'+townId+':'+place.id,placeId:place.id,townId,name:place.name,kind:place.type,canvasColumns:saved.canvasColumns||12,canvasRows:saved.canvasRows||16,canvasFitVersion:1,floorCount:saved.floorCount||1,activeFloor:saved.activeFloor||1,
    rooms:saved.rooms||defaultBuildingRooms(place,language)};
  // Upgrade untouched equal-quarter defaults only; never replace custom layouts.
  if(saved.rooms){const options=[legacyBuildingRooms(place,language),defaultBuildingRooms(place,language,false)];for(const old of options){const keys=Object.keys(old);if(Object.keys(saved.rooms).length===keys.length&&keys.every(k=>{const a=saved.rooms[k],b=old[k];return a&&a.name===b.name&&a.type===b.type&&a.floor===b.floor&&!a.image&&!a.floorImage&&!a.hideFurniture&&!a.ownerCharacterIds?.length&&a.floorMaterial===b.floorMaterial&&a.wallMaterial===b.wallMaterial&&JSON.stringify(a.layout)===JSON.stringify(b.layout)&&JSON.stringify(a.furniture)===JSON.stringify(b.furniture)&&a.furniturePlacements?.every((p,i)=>p.id===b.furniturePlacements[i]?.id&&p.x===b.furniturePlacements[i]?.x&&p.y===b.furniturePlacements[i]?.y)}))home.rooms=defaultBuildingRooms(place,language);}}
  // Building rooms use editable surfaces. Keep saved images, but never paint a
  // building-wide photo over the room's walls/floor and furniture.
  for(const room of Object.values(home.rooms)){if(room.usePhoto)room.usePhoto=false;if(room.floorMaterial==='custom')room.floorMaterial='natural'}
  return home;
}
