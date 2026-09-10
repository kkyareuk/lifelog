// Keep long full-setting pages scrollable without folding their fields.
export function bindCharacterFolds(root=document){
 for(const grid of root.querySelectorAll('.character-book-form-page .book-form-grid')){
  grid.dataset.flatFields='true';
  const controls=grid.parentElement.querySelector('.book-section-controls');
  if(controls&&controls.offsetTop>grid.offsetTop)grid.style.maxHeight=Math.max(80,controls.offsetTop-grid.offsetTop-12)+'px';
 }
}
