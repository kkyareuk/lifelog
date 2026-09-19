// Keep long full-setting pages scrollable without folding their fields.
export function bindCharacterFolds(root=document){
 for(const grid of root.querySelectorAll('.character-book-form-page .book-form-grid')){
  grid.dataset.flatFields='true';
  const controls=grid.parentElement.querySelector('.book-section-controls');
  const bottom=controls&&controls.offsetTop>grid.offsetTop?controls.offsetTop:grid.parentElement.clientHeight*.84;
  grid.style.maxHeight=Math.max(80,bottom-grid.offsetTop-12)+'px';
  grid.style.pointerEvents='auto';
  grid.style.touchAction='pan-y';
 }
}
