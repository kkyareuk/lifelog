import {INGREDIENT_BY_ID} from './ingredients.js';
import {cookingMotion,recipeIcon} from './cooking-display.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={rice:'🍚',glutinous:'🍚',flour:'🌾',wheat:'🌾',cornmeal:'🌽',bread:'🍞',breadcrumb:'🍞',biscuit:'🍪',pasta:'🍝',noodle:'🍜',glassnoodle:'🍜',ricecake:'🍡',egg:'🥚',milk:'🥛',cream:'🥛',butter:'🧈',cheese:'🧀',hardcheese:'🧀',beef:'🥩',pork:'🥩',lamb:'🥩',chicken:'🍗',duck:'🍗',bacon:'🥓',ham:'🍖',fish:'🐟',salmon:'🐟',tuna:'🐟',shrimp:'🦐',crab:'🦀',lobster:'🦞',squid:'🦑',octopus:'🐙',clam:'🦪',mussel:'🦪',oyster:'🦪',carrot:'🥕',onion:'🧅',garlic:'🧄',potato:'🥔',tomato:'🍅',cabbage:'🥬',lettuce:'🥬',cucumber:'🥒',eggplant:'🍆',pumpkin:'🎃',mushroom:'🍄',corn:'🌽',pea:'🫛',bean:'🫘',apple:'🍎',pear:'🍐',lemon:'🍋',strawberry:'🍓',banana:'🍌',cherry:'🍒',grape:'🍇',honey:'🍯',chocolate:'🍫',herb:'🌿',salt:'🧂',pepper:'🧂',sugar:'🍚',oil:'🫗',water:'💧'};
const aliases={egg:['계란','달걀','노른자','흰자'],cream:['크림','생크림'],beef:['소고기','쇠고기'],pork:['돼지고기'],milk:['우유'],flour:['밀가루'],rice:['밥','쌀']};
export function cookingVisual(recipe,step,lang='ko'){
 const current=recipe.steps?.[step]||[],description=current[1]||'';
 let motion=/휘핑|거품.*내|거품.*올/.test(description)?'whip':/데코|장식|크림.*짜|크림.*올/.test(description)?'decorate':cookingMotion(current);
 if(motion==='saute'&&/웍/.test(description))motion='wok';
 const ingredients=(recipe.ing||[]).map(id=>INGREDIENT_BY_ID[id]).filter(Boolean);
 const mentioned=ingredients.filter(i=>[i.name,...(aliases[i.id]||[])].some(n=>description.includes(n)));
 const selected=mentioned.length?mentioned:ingredients;
 return {motion,ingredients:selected.map(i=>({id:i.id,name:i.names?.[lang]||i.name,icon:icons[i.id]||({vegetable:'🥬',fruit:'🍎',meat:'🥩',seafood:'🐟',grain:'🌾',dairy:'🥛',spice:'🧂',seaweed:'🌿'}[i.cat])||'●'})),dish:recipeIcon(recipe)};
}
const vessel=motion=>['cut','grind','prep','add'].includes(motion)?'board':['saute','wok','fry','bake'].includes(motion)?'pan':['boil','cook'].includes(motion)?'pot':['plate','decorate'].includes(motion)?'plate':'bowl';
const tool=motion=>['cut','grind'].includes(motion)?'knife':['whip'].includes(motion)?'whisk':['mix','stir','knead'].includes(motion)?'spoon':motion==='decorate'?'pipe':'';
const toolArt={knife:'<path fill="#73452d" d="M4 12h36v12H4z"/><path fill="#eef3f4" stroke="#52636d" stroke-width="2" d="M40 10h74v12q-22 14-74 7z"/>',spoon:'<path stroke="#a57543" stroke-width="10" stroke-linecap="round" d="M16 5l54 53"/><ellipse cx="77" cy="67" rx="14" ry="20" fill="#bf935b" transform="rotate(-40 77 67)"/>',whisk:'<path stroke="#765038" stroke-width="10" stroke-linecap="round" d="M15 5l40 37"/><g fill="none" stroke="#d6e4e7" stroke-width="3"><ellipse cx="72" cy="59" rx="14" ry="28" transform="rotate(-45 72 59)"/><ellipse cx="72" cy="59" rx="7" ry="28" transform="rotate(-45 72 59)"/></g>',pipe:'<path fill="#f5e6cf" stroke="#8d6548" stroke-width="2" d="M30 0l54 20-27 44-12-5z"/><path fill="#adb8bd" d="M45 59l12 5-19 17z"/>'};
export function cookingAnimationMarkup(recipe,step,lang='ko'){
 const v=cookingVisual(recipe,step,lang),type=vessel(v.motion),implement=tool(v.motion),label=({ko:'요리 과정',en:'Cooking in progress',ja:'調理の様子'})[lang]||'요리 과정';
 const labels=v.ingredients.map(i=>i.name).join(' · ');
 const ingredients=v.ingredients.slice(0,8).map((i,n)=>`<span class="cook-ingredient" style="--i:${n};--x:${25+(n%4)*17}%;--y:${n<4?40:55}%" title="${esc(i.name)}"><span class="cook-whole">${esc(i.icon)}</span><span class="cook-piece piece-a">${esc(i.icon)}</span><span class="cook-piece piece-b">${esc(i.icon)}</span></span>`).join('');
 return `<div class="cooking-animation motion-${v.motion}" role="img" aria-label="${esc(label+(labels?': '+labels:''))}" data-cooking-motion="${v.motion}"><div class="cook-worktop"><div class="cook-vessel vessel-${type}"><div class="cook-surface"></div></div><div class="cook-food">${ingredients||`<span class="cook-unknown">${esc(v.dish)}</span>`}</div>${['whip','decorate'].includes(v.motion)?'<div class="cook-cream">☁</div>':''}<div class="cook-vessel-rim rim-${type}"></div>${implement?`<svg class="cook-tool tool-${implement}" viewBox="0 0 120 90" aria-hidden="true">${toolArt[implement]}</svg>`:''}<div class="cook-bubbles" aria-hidden="true">${Array.from({length:6},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div><div class="cook-steam" aria-hidden="true"><i></i><i></i><i></i></div></div>${labels?`<div class="cook-ingredient-names">${esc(labels)}</div>`:''}</div>`;
}
export function syncCookingAnimation(host,progress,lang='ko',jobId=''){
 let node=host.querySelector('.cooking-animation');
 if(!progress||progress.waiting||progress.complete){node?.remove();return;}
 const key=jobId+':'+progress.recipe.id+':'+progress.step+':'+lang;
 if(node?.dataset.frameKey===key)return;
 const template=document.createElement('template');template.innerHTML=cookingAnimationMarkup(progress.recipe,progress.step,lang);const next=template.content.firstElementChild;next.dataset.frameKey=key;
 if(node)node.replaceWith(next);else host.prepend(next);
}
if(globalThis.document)document.addEventListener('visibilitychange',()=>document.querySelectorAll('.cooking-animation').forEach(n=>n.classList.toggle('is-paused',document.hidden)));
