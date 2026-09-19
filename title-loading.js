// Observe requests the opening screen already made; do not download the catalog.
export function trackTitleImages(root,onChange){
 const images=[...new Set([root.querySelector('.drawer-title-art'),...document.querySelectorAll('#app img:not([loading="lazy"])')].filter(img=>img?.getAttribute('src')))];
 const settled=new Set();
 const settle=img=>{if(settled.has(img))return;settled.add(img);onChange(settled.size,images.length)};
 for(const img of images){if(img.complete)settle(img);else{img.addEventListener('load',()=>settle(img),{once:true});img.addEventListener('error',()=>settle(img),{once:true})}}
 onChange(settled.size,images.length);
}
