// Keep disclosure state in this session, separate from synced character settings.
const opened=new Map();
export function bindCharacterFolds(root=document){
 for(const grid of root.querySelectorAll('.character-book-form-page .book-form-grid:not([data-folded])')){
  const fields=[...grid.children];if(fields.length<6)continue;
  grid.dataset.folded='true';
  const page=grid.closest('[data-book-page]'),key=(page?.dataset.bookPage||'')+':'+grid.parentElement.className;
  for(let i=0;i<fields.length;i+=4){const chunk=fields.slice(i,i+4),d=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('div');
   d.className='character-field-fold';body.className='character-field-fold-body';
   const label=e=>e.querySelector('b,span')?.textContent?.trim()||'';
   summary.textContent=label(chunk[0])+(chunk.length>1?' · '+label(chunk.at(-1)):'');
   const id=key+':'+i;d.open=opened.get(id)??false;d.ontoggle=()=>opened.set(id,d.open);
   body.append(...chunk);d.append(summary,body);grid.append(d);
  }
  const controls=grid.parentElement.querySelector('.book-section-controls');
  if(controls&&controls.offsetTop>grid.offsetTop)grid.style.maxHeight=Math.max(80,controls.offsetTop-grid.offsetTop-12)+'px';
 }
}
