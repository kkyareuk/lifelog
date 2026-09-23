import assert from 'node:assert/strict';
import {cookingVisual,cookingAnimationMarkup} from '../cooking-animation.js';
import {adErrorText} from '../ad-errors.js';
import {readFileSync} from 'node:fs';
const recipe={name:'Soup',ing:['carrot','onion','milk'],steps:[['cut','당근을 썰고 있어요'],['mix','우유를 섞고 있어요'],['cook','손질한 재료를 끓이고 있어요']]};
assert.deepEqual(cookingVisual(recipe,0).ingredients.map(i=>i.id),['carrot']);assert.deepEqual(cookingVisual(recipe,1).ingredients.map(i=>i.id),['milk']);assert.equal(cookingVisual(recipe,2).ingredients.length,3);
assert.equal(cookingVisual(recipe,0,'en').ingredients[0].name,'Carrot');assert(cookingVisual(recipe,0,'ja').ingredients[0].name);
assert.equal(cookingVisual({...recipe,steps:[['mix','달걀 거품을 내고 있어요']]},0).motion,'whip');assert.equal(cookingVisual({...recipe,steps:[['plate','크림으로 장식하고 있어요']]},0).motion,'decorate');
assert.equal(cookingVisual({...recipe,ing:[]},0).ingredients.length,0);assert(!cookingAnimationMarkup({...recipe,ing:[]},0).includes('당근'));
for(const lang of ['ko','en','ja']){const ios=adErrorText({adStage:'banner',code:1},lang,'ios'),android=adErrorText({adStage:'banner',code:3},lang,'android');assert.equal(ios,android);assert.notEqual(ios,adErrorText({adStage:'banner',code:0},lang,'ios'));assert.notEqual(ios,adErrorText({adStage:'banner',code:3},lang,'ios'));}
const patch=readFileSync(new URL('../patches/@capacitor-community+admob+7.2.0.patch',import.meta.url),'utf8');assert(patch.includes('+            "code": (error as NSError).code'));assert(patch.includes('view.layoutIfNeeded()'));assert(patch.includes('viewWidth.isFinite'));
console.log('PASS485 recipe-matched ingredients, no invented custom ingredients, motion selection, KO/EN/JA, platform-correct no-fill vs request/server errors and persisted native patch');
