import {bedPillowPoint} from './bed-perspective.js?v=20260909dev305';
export function positionBedOccupants(root){
  const people=[...root.querySelectorAll('.is-using-couple-bed[data-couple-bed-id]')],statuses=[...root.querySelectorAll('.home-bed-foreground-status[data-bed-status-for]')];
  const layout=()=>people.forEach(person=>{
    if(!person.isConnected)return;
    const room=person.closest('.room'),bed=room?.querySelector(`[data-furniture-placement="${CSS.escape(person.dataset.coupleBedId)}"]`),image=bed?.querySelector('.couple-bed-base');
    if(!image?.naturalWidth||!bed.clientWidth||!bed.clientHeight)return;
    const width=bed.clientWidth,height=bed.clientHeight,ratio=image.naturalWidth/image.naturalHeight;
    const paintedWidth=Math.min(width,height*ratio),paintedHeight=paintedWidth/ratio;
    const style=getComputedStyle(bed),flip=Number(style.getPropertyValue('--furniture-flip'))||1;
    // Sleeping occupants sit across the quilt edge: the upper part stays on
    // the pillow and the lower part is actually covered by the foreground quilt.
    const underCover=person.classList.contains('is-under-cover');
    const pillow=bedPillowPoint({side:bed.dataset.bedSide==='true',direction:Number(bed.dataset.bedDirection)||1,artFlip:flip},Number(person.dataset.bedSlot),underCover);
    if(bed.dataset.bedSingle==='true'){if(bed.dataset.bedSide==='true'){pillow.x=.235*(Number(bed.dataset.bedDirection)||1);pillow.y=0}else{pillow.x=0;pillow.y=-.20}}
    const x=width/2+pillow.x*paintedWidth*1.05,y=height/2+pillow.y*paintedHeight*1.05;
    person.style.zIndex=String(pillow.depth);
    const [ox,oy]=style.transformOrigin.split(' ').map(parseFloat);
    const point=new DOMMatrix(style.transform).transformPoint(new DOMPoint(x-ox,y-oy));
    const parent=person.offsetParent,layer=bed.offsetParent;if(!parent||!layer)return;
    const br=bed.getBoundingClientRect(),pr=parent.getBoundingClientRect(),lr=layer.getBoundingClientRect();
    const sx=lr.width/layer.offsetWidth||1,sy=lr.height/layer.offsetHeight||1,px=pr.width/parent.offsetWidth||1,py=pr.height/parent.offsetHeight||1;
    const matrix=new DOMMatrix(style.transform),corners=[[0,0],[width,0],[width,height],[0,height]].map(([cx,cy])=>matrix.transformPoint(new DOMPoint(cx-ox,cy-oy)));
    const vx=br.left+(point.x-Math.min(...corners.map(p=>p.x)))*sx,vy=br.top+(point.y-Math.min(...corners.map(p=>p.y)))*sy;
    const lifeX=(vx-pr.left)/px-parent.clientLeft,lifeY=(vy-pr.top)/py-parent.clientTop;
    person.style.removeProperty('left');person.style.removeProperty('top');
    person.style.setProperty('--life-x',`${lifeX}px`);
    person.style.setProperty('--life-y',`${lifeY}px`);
    const side=bed.dataset.bedSide==='true',faceSize=side?Math.max(12,Math.min(56,paintedHeight*.29*(Number(style.getPropertyValue('--furniture-scale'))||1))):Math.max(10,Math.min(underCover?64:56,paintedWidth*(bed.dataset.bedSingle==='true'?.56:underCover?.30:.28)*(Number(style.getPropertyValue('--furniture-scale'))||1)));
    person.style.setProperty('--bed-face-size',`${faceSize}px`);
  });
  const layoutStatuses=()=>statuses.forEach(status=>{
    if(!status.isConnected)return;
    const room=status.closest('.room'),bed=room?.querySelector(`[data-furniture-placement="${CSS.escape(status.dataset.bedStatusFor)}"]`),image=bed?.querySelector('.couple-bed-base');
    if(!image?.naturalWidth||!bed.clientWidth||!bed.clientHeight)return;
    // Place the shared label below the complete painted bed, including its
    // transformed footboard, rather than inside the quilt/footboard rectangle.
    const painted=bed.querySelector('.room-furniture-art')||image,rect=painted.getBoundingClientRect();
    const parent=status.offsetParent,parentRect=parent.getBoundingClientRect();
    const scaleX=parentRect.width/parent.clientWidth||1,scaleY=parentRect.height/parent.clientHeight||1;
    const half=Math.min(75,parent.clientWidth*.43),x=(rect.left+rect.width/2-parentRect.left)/scaleX;
    status.style.setProperty('--bed-status-x',`${Math.max(half,Math.min(parent.clientWidth-half,x))}px`);
    status.style.setProperty('--bed-status-y',`${(rect.bottom-parentRect.top)/scaleY+8}px`);
  });
  layout();layoutStatuses();
}
