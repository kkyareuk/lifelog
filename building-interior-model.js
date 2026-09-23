import {defaultBuildingRooms} from './building-interior-presets.js';
export function buildingInterior(place,townId,language='ko'){
  const saved=place.interior&&typeof place.interior==='object'?structuredClone(place.interior):{};
  const home={...saved,id:'place-interior:'+townId+':'+place.id,placeId:place.id,townId,name:place.name,kind:place.type,canvasColumns:saved.canvasColumns||12,canvasRows:saved.canvasRows||16,canvasFitVersion:1,floorCount:saved.floorCount||1,activeFloor:saved.activeFloor||1,
    rooms:saved.rooms||defaultBuildingRooms(place,language)};
  if(!saved.rooms&&place.interiorImage){const room=Object.values(home.rooms)[0];Object.assign(room,{image:place.interiorImage,floorImage:place.interiorImage,usePhoto:true,floorMaterial:'custom'})}
  return home;
}
