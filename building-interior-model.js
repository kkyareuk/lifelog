export function buildingInterior(place,townId){
  const saved=place.interior&&typeof place.interior==='object'?structuredClone(place.interior):{};
  return {...saved,id:'place-interior:'+townId+':'+place.id,placeId:place.id,townId,name:place.name,kind:place.type,canvasColumns:saved.canvasColumns||12,canvasRows:saved.canvasRows||16,canvasFitVersion:1,floorCount:saved.floorCount||1,activeFloor:saved.activeFloor||1,
    rooms:saved.rooms||{main:{name:place.name,type:'living',floor:1,size:'넓은 방',furniture:[],furniturePlacements:[],...(place.interiorImage?{image:place.interiorImage,floorImage:place.interiorImage,usePhoto:true,floorMaterial:'custom'}:{})}}};
}
