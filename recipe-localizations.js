import {RECIPE_NAMES} from './recipe-names.js';
import {INGREDIENT_BY_ID,ingredientName} from './ingredients.js';
import {cookingMotion} from './cooking-display.js';
export function recipeName(recipe,language='ko'){return language==='ko'?recipe.name:recipe.names?.[language]||RECIPE_NAMES[recipe.id]?.[language]||recipe.name}
const actions={
 prep:['Preparing the ingredients.','材料を準備しています。'],cut:['Cutting the ingredients into suitable pieces.','材料を食べやすく切っています。'],grind:['Grinding the ingredients.','材料をすりつぶしています。'],knead:['Kneading the dough.','生地をこねています。'],stir:['Stirring the ingredients together.','材料をかき混ぜています。'],mix:['Mixing the ingredients and adjusting the flavor.','材料を混ぜて味を調えています。'],fry:['Frying the ingredients in hot oil.','材料を油で揚げています。'],saute:['Sautéing the ingredients in a pan.','材料をフライパンで炒めています。'],bake:['Baking while keeping an eye on the heat.','火加減を見ながら焼いています。'],boil:['Simmering the ingredients and watching the pot.','鍋の様子を見ながら煮ています。'],cook:['Cooking the ingredients over a steady heat.','火加減を調整して材料に火を通しています。'],cool:['Cooling the dish until it is ready.','仕上げに向けて料理を冷ましています。'],rest:['Letting the ingredients rest.','材料を休ませています。'],microwave:['Warming the food in the microwave.','電子レンジで料理を温めています。'],add:['Adding the ingredients to the dish.','料理に材料を加えています。'],plate:['Arranging the finished food on a dish.','できた料理を器に盛り付けています。']};
export function recipeStep(recipe,index,language='ko'){
 const step=recipe.steps[index];if(!step)return '';
 if(language==='ko')return /[。.!?]$/.test(step[1])?step[1]:step[1]+'.';
 const motion=cookingMotion(step),mentioned=recipe.ing.filter(id=>INGREDIENT_BY_ID[id]&&step[1].includes(INGREDIENT_BY_ID[id].name)).slice(0,3).map(id=>ingredientName(id,language));
 const verbs={prep:['Preparing','準備しています'],cut:['Cutting','切っています'],grind:['Grinding','すりつぶしています'],knead:['Kneading','こねています'],stir:['Stirring','かき混ぜています'],mix:['Mixing','混ぜています'],fry:['Frying','揚げています'],saute:['Sautéing','炒めています'],bake:['Baking','焼いています'],boil:['Simmering','煮ています'],cook:['Cooking','調理しています'],cool:['Cooling','冷ましています'],rest:['Resting','休ませています'],microwave:['Microwaving','電子レンジで温めています'],add:['Adding','加えています'],plate:['Plating','盛り付けています']};
 if(mentioned.length&&verbs[motion])return language==='ja'?mentioned.join('・')+'を'+verbs[motion][1]+'。':verbs[motion][0]+' '+mentioned.join(', ').toLocaleLowerCase()+'.';
 return (actions[motion]||actions.prep)[language==='ja'?1:0];
}
export function recipeIngredients(recipe,language='ko'){return recipe.ing.map(id=>ingredientName(id,language))}
