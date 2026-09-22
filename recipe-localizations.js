// Complete recipe translations are maintained alongside the source steps.
import {koreanRecipes} from './recipe-korean-copy.js';
import {japaneseRecipes} from './recipe-japanese-copy.js';
import {americanRecipes} from './recipe-american-copy.js';
import {italianRecipes} from './recipe-italian-copy.js';
import {medievalRecipes} from './recipe-medieval-copy.js';
export const RECIPE_LOCALIZATIONS={...koreanRecipes,...japaneseRecipes,...americanRecipes,...italianRecipes,...medievalRecipes};
export function recipeName(recipe,language='ko'){return RECIPE_LOCALIZATIONS[recipe.id]?.[language]?.name||(language==='ko'?recipe.name:recipe.orig||recipe.name)}
export function recipeStep(recipe,index,language='ko'){return RECIPE_LOCALIZATIONS[recipe.id]?.[language]?.steps?.[index]||recipe.steps[index]?.[1]||''}
export function recipeIngredients(recipe,language='ko'){return RECIPE_LOCALIZATIONS[recipe.id]?.[language]?.ingredients||recipe.ing}
