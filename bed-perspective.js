// Slot zero is the character's saved left place, not always screen-left.
export function bedPerspective(placement={}){
 const rotation=((Number(placement.rotation)||0)%360+360)%360;
 const side=rotation>=45&&rotation<135||rotation>=225&&rotation<315;
 const direction=(rotation<180?1:-1)*(placement.flipped?-1:1);
 return {side,direction,artRotation:side?0:Number(placement.rotation)||0,artFlip:side?direction:placement.flipped?-1:1,characterRotation:side?90*direction:Number(placement.rotation)||0};
}
export function bedPillowPoint(perspective,slot,underCover=true){
 if(perspective.side){const far=perspective.direction===1?slot===0:slot===1;return {x:(underCover?.235:.275)*perspective.direction,y:far?-.238:.048,depth:far?1:2}}
 return {x:(slot===0?-.18:.18)*perspective.artFlip,y:underCover?-.225:-.29,depth:1};
}
