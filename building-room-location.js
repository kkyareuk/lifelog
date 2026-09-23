export function buildingRoomKey(home,scene={}){
 if(home.rooms?.[scene.room])return scene.room;
 const keys=Object.keys(home.rooms||{}),type=({bath:'bathroom',toilet:'bathroom',music:'hobby'})[scene.room]||scene.room;
 if(['toilet','bath','shower','clean'].includes(scene.lifeTaskId||scene.lifeTask)||/화장실|변기|restroom|toilet|トイレ/.test(scene.title||''))return keys.find(k=>home.rooms[k].type==='bathroom')||keys[0];
 if(scene.officeRole==='builtin-singer'||scene.officeRole==='builtin-idol')return keys.find(k=>home.rooms[k].type===(scene.officeRoom==='backstage'?'bedroom':'hobby'))||keys[0];
 return keys.find(k=>home.rooms[k].type===type)||keys[0];
}
