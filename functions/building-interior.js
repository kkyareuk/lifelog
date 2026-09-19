'use strict';
function validateBuildingInterior(value){
 const fail=()=>{throw Object.assign(Error('invalid-building-interior'),{status:400})};
 if(!value||typeof value!=='object'||Array.isArray(value)||!value.rooms||Array.isArray(value.rooms)||Object.keys(value.rooms).length>50||JSON.stringify(value).length>180000)fail();
 const visit=(item,depth=0)=>{if(depth>16)fail();if(typeof item==='number'&&!Number.isFinite(item))fail();if(typeof item==='string'&&(item.length>20000||/^(data:|blob:)/i.test(item)))fail();if(item&&typeof item==='object')for(const [key,child] of Object.entries(item)){if(['__proto__','constructor','prototype'].includes(key))fail();visit(child,depth+1)}};visit(value);
 for(const room of Object.values(value.rooms)){if(!room||typeof room!=='object'||Array.isArray(room)||!Array.isArray(room.furniturePlacements||[])||(room.furniturePlacements||[]).length>200)fail();if(room.layout){const r=room.layout;if(!['x','y','w','h'].every(k=>Number.isFinite(r[k]))||r.x<0||r.y<0||r.w<=0||r.h<=0||r.x+r.w>100.0001||r.y+r.h>100.0001)fail()}}
 return {rooms:value.rooms,deletedRoomKeys:(Array.isArray(value.deletedRoomKeys)?value.deletedRoomKeys:[]).filter(k=>typeof k==='string').slice(-100),floorCount:Math.max(1,Math.min(5,Number(value.floorCount)||1)),activeFloor:Math.max(1,Math.min(5,Number(value.activeFloor)||1)),canvasColumns:Math.max(12,Math.min(64,Number(value.canvasColumns)||12)),canvasRows:Math.max(16,Math.min(64,Number(value.canvasRows)||16)),canvasFitVersion:1};
}
module.exports={validateBuildingInterior};
