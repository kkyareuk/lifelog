// The fitted house uses the original 12×16 visual scale. Legacy expanded
// canvas dimensions describe saved room positions, not smaller furniture art.
export function furnitureDisplayGrid(layout={}){
  return {columns:Math.max(1,(Number(layout.w)||100)*12/100),rows:Math.max(1,(Number(layout.h)||100)*16/100)};
}
