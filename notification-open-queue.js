// One pending tap. Deliver only after the ready screen has had a paint opportunity.
export function createNotificationOpenQueue({ready,open,frame=requestAnimationFrame}){
 let pending=null,scheduled=false;
 const flush=()=>{
  if(scheduled||!pending||!ready())return;
  scheduled=true;
  frame(()=>frame(()=>{scheduled=false;if(!pending||!ready())return;const value=pending;pending=null;open(value)}));
 };
 return {push(value){pending=value;flush()},flush,get pending(){return !!pending}};
}
