const key='drawer-village-log-order';
export function logOrder(){try{return localStorage.getItem(key)==='oldest'?'oldest':'latest'}catch{return 'latest'}}
export const sortLogEntries=(entries,order=logOrder())=>[...entries].sort((a,b)=>(Number(a.minute)-Number(b.minute))*(order==='oldest'?1:-1));
export function logOrderControl(language='ko'){
 const [label,latest,oldest]=({ko:['기록 순서','최신순','오래된순'],en:['Log order','Newest first','Oldest first'],ja:['記録の順序','新しい順','古い順']})[language]||['기록 순서','최신순','오래된순'];
 return `<label class="log-order-control">${label} <select data-log-order><option value="latest" ${logOrder()==='latest'?'selected':''}>${latest}</option><option value="oldest" ${logOrder()==='oldest'?'selected':''}>${oldest}</option></select></label>`;
}
const installed=new WeakSet();
export function installLogOrder(root){
 if(installed.has(root))return;installed.add(root);
 root.addEventListener('change',event=>{
  if(!event.target.matches('[data-log-order]'))return;
  const order=event.target.value==='oldest'?'oldest':'latest';try{localStorage.setItem(key,order)}catch{}
  root.querySelectorAll('[data-log-order]').forEach(select=>select.value=order);
  root.querySelectorAll('[data-log-entries]').forEach(list=>{
   const children=[...list.children];children.sort((a,b)=>(Number(a.dataset.logMinute)-Number(b.dataset.logMinute))*(order==='oldest'?1:-1));
   list.append(...children);
  });
 });
}
