// Bed artwork follows room geometry, but a face still needs a readable floor.
export function bedFaceSize(naturalSize,minimum=32,maximum=76,screenScale=1){
 const min=[0,24,32,40].includes(Number(minimum))?Number(minimum):32;
 const scale=Number.isFinite(screenScale)&&screenScale>0?screenScale:1;
 return Math.max(min/scale,Math.min(maximum,Number(naturalSize)||10));
}
