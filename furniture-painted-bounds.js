// object-fit:contain leaves empty letterbox space inside an image element.
export function furniturePaintedBounds(art){
 const rect=art.getBoundingClientRect();
 if(!art.naturalWidth||!art.naturalHeight||getComputedStyle(art).objectFit!=='contain')return rect;
 const scale=Math.min(rect.width/art.naturalWidth,rect.height/art.naturalHeight),width=art.naturalWidth*scale,height=art.naturalHeight*scale;
 const left=rect.left+(rect.width-width)/2,top=rect.top+(rect.height-height)/2;
 return {left,top,right:left+width,bottom:top+height,width,height,x:left,y:top};
}
