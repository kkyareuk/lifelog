// Keep paths stable while the home is visible; bound cache to current pets.
const paths=new Map();
export function retainPetPaths(keys){const keep=new Set(keys);for(const key of paths.keys())if(!keep.has(key))paths.delete(key)}
export function petMotionPath(key,seed,occupied,now,sleeping=false){
  let path=paths.get(key);
  if(!path){
    let x=24+seed%49,y=34+Math.floor(seed/7)%38;
    for(let i=0;i<7&&occupied.some(p=>Math.hypot(p.x-x,p.y-y)<20);i++){x=20+(seed+i*23)%60;y=30+(seed+i*17)%45}
    path={x,y,dx:x>50?-18:18,dy:y>55?-12:12,duration:13+seed%6};paths.set(key,path);
  }
  return {...path,dx:sleeping?0:path.dx,dy:sleeping?0:path.dy,delay:-((now/1000+seed%97)%(path.duration*2)),sleeping,motion:["sniff","look","stretch","pounce"][seed%4]};
}
