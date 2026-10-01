// Scheduled returns have a fixed destination and deadline, including old saves.
export function returnArrivalMinute(scene){
 if(!scene?.transit||!scene.returningHome)return Infinity;
 const start=Number(scene.minute);if(!Number.isFinite(start))return Infinity;
 return Math.min(Number(scene.returnArrivalMinute)||start+2,start+2);
}
export function returnRoute(world,c,scene,now=Date.now()){
 if(!scene?.transit||!scene.returningHome)return null;
 const home=world.homes?.[scene.destinationHomeId||c.homeId];if(!home)return null;
 const place=(world.towns||[world.world].filter(Boolean)).flatMap(t=>t.places||[]).find(p=>p.id===scene.returnFromPlaceId);
 const fromHome=world.homes?.[scene.returnFromHomeId];
 const point=(x,y)=>({x:Math.max(0,Math.min(100,Number.isFinite(Number(x))?Number(x):50)),y:Math.max(0,Math.min(100,Number.isFinite(Number(y))?Number(y):50))});
 const to=point(home.mapX,home.mapY),from=place?point(place.x,place.y):fromHome?point(fromHome.mapX,fromHome.mapY):point(to.x-15,to.y+10);
 const d=new Date(now),day=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
 return {surface:'town',from,to,start:day+Number(scene.minute)*60000,end:day+returnArrivalMinute(scene)*60000};
}
