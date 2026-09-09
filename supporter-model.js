export const TEXT_EFFECTS=['plain','gradient','neon','comic','pop','shine'];
export const BACKGROUND_EFFECTS=['none','fireflies','starlight'];
export const CREDIT_FONTS=['default','book','round'];
export function supportBenefits(amount){
  const n=Math.max(0,Math.min(1e9,Number(amount)||0)),points=[[0,18],[50000,20],[100000,24],[200000,28],[300000,32],[500000,36]];
  let size=36;for(let i=1;i<points.length;i++)if(n<=points[i][0]){const [a,x]=points[i-1],[b,y]=points[i];size=x+(y-x)*(n-a)/(b-a);break}
  return {color:n>=50000,all:n>=100000,size:Math.round(size*10)/10,weight:n>=500000?2:n>=300000?1.6:n>=200000?1.3:1,seconds:n>=500000?8:n>=300000?7:n>=200000?6:5};
}
const pick=(x,options,fallback)=>options.includes(x)?x:fallback;
const color=(x,fallback)=>/^#[a-f\d]{6}$/i.test(String(x))?x:fallback;
export function normalizeSupporterStyle(value={},amount=0){
  const v=value&&typeof value==='object'?value:{},b=supportBenefits(amount);
  return {name:String(v.name||'').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,'').trim().slice(0,40),visibility:pick(v.visibility,['named','anonymous','hidden'],'named'),color:b.color?color(v.color,'#ad438d'):'#594b3f',color2:b.all?color(v.color2,'#527ebc'):'#594b3f',font:b.all?pick(v.font,CREDIT_FONTS,'default'):'default',effect:b.all?pick(v.effect,TEXT_EFFECTS,'plain'):'plain',background:b.all?pick(v.background,BACKGROUND_EFFECTS,'none'):'none',animate:b.all&&v.animate!==false};
}
export function approveSupporterRequest(request,verifiedAmount,id){
  if(request?.format!=='drawer-supporter-request'||request.version!==1)throw Error('Invalid supporter request');
  if(!Number.isFinite(verifiedAmount)||verifiedAmount<=0)throw Error('Verified support amount required');
  if(!/^[a-zA-Z0-9_-]{6,80}$/.test(id))throw Error('Public entry ID required');
  const style=normalizeSupporterStyle(request.style,verifiedAmount),benefits=supportBenefits(verifiedAmount);
  if(style.visibility==='named'&&!style.name)throw Error('Display name required');
  return {id,...style,name:style.visibility==='anonymous'?'':style.name,size:benefits.size,weight:benefits.weight,seconds:benefits.seconds};
}
export function publicSupporterEntries(entries){
  const seen=new Set();return (Array.isArray(entries)?entries:[]).filter(v=>v&&typeof v.id==='string'&&!seen.has(v.id)&&seen.add(v.id)&&v.visibility!=='hidden').map(v=>({...normalizeSupporterStyle(v,100000),id:v.id,size:Math.min(36,Math.max(18,Number(v.size)||18)),weight:Math.min(2,Math.max(1,Number(v.weight)||1)),seconds:Math.min(8,Math.max(5,Number(v.seconds)||5))}));
}
export function nextSupporter(entries,scores,lastId){
  const items=publicSupporterEntries(entries);if(!items.length)return null;
  let total=0;for(const e of items){total+=e.weight;scores[e.id]=(scores[e.id]||0)+e.weight}
  const pool=items.length>1?items.filter(e=>e.id!==lastId):items;
  const next=pool.reduce((best,e)=>!best||scores[e.id]>scores[best.id]?e:best,null);scores[next.id]-=total;return next;
}
