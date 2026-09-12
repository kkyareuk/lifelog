// Cropped original pixels; directional art is selected without image processing.
const ROOT='assets/furniture/wood/';
export function furnitureSprite(placement={}){
  const kind=({'소파':'sofa','의자':'chair','식탁':'table','침대':'bed'})[placement.item];
  if(!kind)return null;
  const turn=((Math.round((Number(placement.rotation)||0)/90)%4)+4)%4;
  const direction=turn===0?(placement.facing||'front'):['front','right','rear','left'][turn];
  const side=direction==='left'||direction==='right';
  const variant=side&&kind!=='table'?'side':direction==='rear'&&['chair','sofa'].includes(kind)?'back':'front';
  const composite=kind==='chair'&&variant==='back';
  const dimensions={bed:{front:[527,567],side:[550,604]},sofa:{front:[448,257],side:[232,447],back:[443,227]},chair:{front:[176,313],side:[160,307],back:[195,327]},table:{front:[375,440]}}[kind][variant];
  return {src:ROOT+(composite?'chair-seat':`${kind}-${variant}`)+'.png',frame:composite?ROOT+'chair-frame.png':null,kind,direction,
    width:dimensions[0],height:dimensions[1],scale:kind==='chair'?1.8:kind==='sofa'?1.6:kind==='table'?1.5:1,
    flip:(direction==='right'?-1:1)*(placement.flipped?-1:1)};
}
