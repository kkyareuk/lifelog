import {furnitureImage,furnitureFootprint} from './furniture-layout.js?v=20260909dev305';
// Cropped original pixels; directional art is selected without image processing.
const ROOT='assets/furniture/wood/';
export function furnitureSprite(placement={}){
 if(furnitureImage(placement.image))return {src:placement.image,kind:'custom',direction:'front',width:placement.imageWidth||512,height:placement.imageHeight||512,scale:527*furnitureFootprint(placement.item).columns/(2*(placement.imageWidth||512)),flip:placement.flipped?-1:1};
  const kind=({'책상':'desk','작은 책상':'desk','욕조':'bathtub','소파':'sofa','의자':'chair','식탁':'table','침대':'single-bed','1인 침대':'single-bed','TV':'tv','화분':'plant','책장':'bookcase','화분 2':'plant-flower','협탁':'nightstand','카운터':'counter','냉장고':'fridge','인덕션':'induction'})[placement.item];
  if(!kind)return null;
  const turn=((Math.round((Number(placement.rotation)||0)/90)%4)+4)%4;
  const direction=turn===0?(placement.facing||'front'):['front','right','rear','left'][turn];
  const side=direction==='left'||direction==='right';
  const variant=kind==='counter'?('front'):side&&['single-bed','tv','bookcase','sofa','chair','fridge','desk'].includes(kind)?'side':direction==='rear'&&['chair','sofa','desk'].includes(kind)?'back':'front';
  const composite=kind==='chair'&&variant==='back';
  const dimensions={desk:{front:[455,420],side:[260,495],back:[460,388]},bathtub:{front:[690,460]},'plant-flower':{front:[139,239]},nightstand:{front:[155,190]},counter:{front:[275,372],side:[248,245],back:[242,372]},fridge:{front:[359,556],side:[229,561]},induction:{front:[264,239]},'single-bed':{front:[280,567],side:[550,412]},tv:{front:[303,222],side:[49,342]},plant:{front:[225,287]},bookcase:{front:[391,560],side:[186,563]},bed:{front:[527,567],side:[550,604]},sofa:{front:[448,257],side:[232,447],back:[443,227]},chair:{front:[176,313],side:[160,307],back:[195,327]},table:{front:[375,440]}}[kind][variant];
  return {src:ROOT+(composite?'chair-seat':kind==='counter'?({front:'counter-front',side:'counter-side',back:'counter-back'})[variant]:`${kind}-${variant}`)+'.png',frame:composite?ROOT+'chair-frame.png':kind==='desk'&&variant!=='front'?ROOT+'desk-'+variant+'-frame.png':null,kind,direction,
    width:dimensions[0]*(kind==='counter'?Number(placement.counterSpan)||1:1),height:dimensions[1]*(kind==='counter'?Number(placement.counterDepth)||1:1),scale:kind==='desk'?1.4:kind==='bathtub'?1.2:kind==='tv'?1.7:kind==='chair'?1.8:kind==='sofa'?1.9:kind==='table'?1.5:kind==='fridge'?1.4:['plant','plant-flower','bookcase'].includes(kind)?1.2:kind.startsWith('counter')?1.6:kind==='nightstand'?2:1,
    flip:(direction==='right'?-1:1)*(placement.flipped?-1:1)};
}
