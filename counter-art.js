// Three independently clipped regions. End widths track the unstretched art.
export function counterArt(sprite,span=1){
 const cap=12/Math.max(1,Number(span)||1);
 return `<span class="furniture-sprite counter-stretch" style="--counter-cap:${cap}%">${['left','middle','right'].map(side=>`<span class="counter-slice counter-${side}"><img src="${sprite.src}" alt=""></span>`).join('')}</span>`;
}
