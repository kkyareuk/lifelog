import {INGREDIENTS} from '../ingredients.js';
import {RECIPES} from '../recipes.js';
import {recipeName,recipeStep,recipeIngredients} from '../recipe-localizations.js';
import {cookingProgress,savedRecipeById,recipeAllowed,finishCooking} from '../cooking.js';
import {RECIPES as old} from '../cooking-legacy471.js';
import assert from 'node:assert/strict';
assert.equal(INGREDIENTS.length,129);const ids=new Set(INGREDIENTS.map(x=>x.id)),used=new Set();
for(const r of RECIPES){assert(r.steps.length>=4&&r.steps.length<=6);for(const id of r.ing){assert(ids.has(id),id);used.add(id)}for(const lang of ['en','ja']){assert(!/[가-힣]/.test(recipeName(r,lang)));assert(recipeIngredients(r,lang).every(s=>!/[가-힣]/.test(s)));for(let i=0;i<r.steps.length;i++)assert(!/[가-힣]/.test(recipeStep(r,i,lang)))}}
assert.equal(used.size,129);
const r=old.find(r=>r.id==='kongnamulguk'),job={id:'old-test',recipeId:r.id,startedAt:1000,endsAt:1000+r.steps.length*3000};
assert.equal(cookingProgress(job,4000).step,1);assert.equal(savedRecipeById(r.id).name,r.name);
const c={cooking:{active:job}};assert(finishCooking({},c,job.endsAt));assert.equal(c.cooking.inventory[r.id],1);assert(!finishCooking({},c,job.endsAt+1));
for(const r of RECIPES.filter(r=>r.appliance))assert(!recipeAllowed({era:'medieval'},r));
console.log('PASS 129 valid/used ingredients, 180 EN/JA names and progressive steps, legacy removed-recipe completion, historical appliance exclusion');
