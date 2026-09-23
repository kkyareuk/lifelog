import {defaultBuildingRooms} from './building-interior-presets.js';
export function buildingInterior(place,townId,language='ko'){
  const saved=place.interior&&typeof place.interior==='object'?structuredClone(place.interior):{};
  const home={...saved,id:'place-interior:'+townId+':'+place.id,placeId:place.id,townId,name:place.name,kind:place.type,canvasColumns:saved.canvasColumns||12,canvasRows:saved.canvasRows||16,canvasFitVersion:1,floorCount:saved.floorCount||1,activeFloor:saved.activeFloor||1,
    rooms:saved.rooms||defaultBuildingRooms(place,language)};
  // Building rooms use editable surfaces. Keep saved images, but never paint a
  // building-wide photo over the room's walls/floor and furniture.
  for(const room of Object.values(home.rooms)){if(room.usePhoto)room.usePhoto=false;if(room.floorMaterial==='custom')room.floorMaterial='natural'}
  return home;
}
