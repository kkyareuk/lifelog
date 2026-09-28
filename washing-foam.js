export function washingFoam(seed=''){
 let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.charCodeAt(0),16777619);
 const random=()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return (n>>>0)/4294967296};
 return `<span class="washing-foam" aria-hidden="true">${Array.from({length:8},()=>`<i style="left:${12+random()*72}%;top:${5+random()*78}%;--bubble-size:${8+random()*10}px;--bubble-duration:${2.1+random()*3.4}s;--bubble-delay:-${random()*6}s;--bubble-drift:${-3+random()*6}px"></i>`).join('')}</span>`;
}
