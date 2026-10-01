import {walkingGait} from './walking-gaits.js?v=20260909dev305';
// Map coordinates are percentages. A natural gait covers 30 map units/second.
export function mapTravelSeconds(c,from,to){return Math.hypot(to.x-from.x,to.y-from.y)/30*walkingGait(c?.walkingStyle).routeDurationFactor;}
export function returnArrivalMinute(scene,world,c){
 if(!scene?.transit||!scene.returningHome)return Infinity;
 const start=Number(scene.minute);if(!Number.isFinite(start))return Infinity;
 if(world&&c)return returnRoute(world,c,scene,Date.now())?.arrivalMinute??start;
 return Number.isFinite(scene.returnTravelSeconds)?start+scene.returnTravelSeconds/60:start;
}
export function returnRoute(world,c,scene,now=Date.now()){
 if(!scene?.transit||!scene.returningHome)return null;
 const home=world.homes?.[scene.destinationHomeId||c.homeId];if(!home)return null;
 const place=(world.towns||[world.world].filter(Boolean)).flatMap(t=>t.places||[]).find(p=>p.id===scene.returnFromPlaceId);
 const fromHome=world.homes?.[scene.returnFromHomeId];
 const point=(x,y)=>({x:Math.max(0,Math.min(100,Number.isFinite(Number(x))?Number(x):50)),y:Math.max(0,Math.min(100,Number.isFinite(Number(y))?Number(y):50))});
 const to=point(home.mapX,home.mapY),from=place?point(place.x,place.y):fromHome?point(fromHome.mapX,fromHome.mapY):point(to.x-15,to.y+10);
 const d=new Date(now),day=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
 const seconds=mapTravelSeconds(c,from,to),arrivalMinute=Number(scene.minute)+seconds/60;
 return {surface:'town',from,to,start:day+Number(scene.minute)*60000,end:day+arrivalMinute*60000,arrivalMinute,seconds};
}
