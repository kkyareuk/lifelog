// Nine slices preserve the drawn rim, sides and wooden base on both axes.
export function counterArt(sprite,span=1,depth=1){
 const xs=[0,.12,.88,1],ys=[0,.08,.60,1];
 const pieces=[];
 for(let y=0;y<3;y++)for(let x=0;x<3;x++){const w=xs[x+1]-xs[x],h=ys[y+1]-ys[y];pieces.push(`<span class="counter-slice"><img src="${sprite.src}" alt="" style="width:${100/w}%;height:${100/h}%;left:${-xs[x]/w*100}%;top:${-ys[y]/h*100}%"></span>`)}
 return `<span class="furniture-sprite counter-stretch" style="--counter-cap:${12/span}%;--counter-top:${8/depth}%;--counter-bottom:${40/depth}%">${pieces.join('')}</span>`;
}
