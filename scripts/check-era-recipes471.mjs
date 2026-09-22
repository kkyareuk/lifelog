import assert from 'node:assert/strict';
import {normalizeTownSetting,townActivityAllowed,adaptTownActivity,TOWN_ERAS,TOWN_CULTURES} from '../town-setting.js';
import {normalizeTownProfile} from '../town-profile.js';
import {RECIPES} from '../recipes.js';
import {RECIPE_LOCALIZATIONS} from '../recipe-localizations.js';
import {recipeDurations,cookingStepAt} from '../cooking-timing.js';
assert.deepEqual(normalizeTownSetting({}),{era:'modern',culture:'mixed'});
for(const era of Object.keys(TOWN_ERAS))for(const culture of Object.keys(TOWN_CULTURES)){const town=normalizeTownProfile({era,culture});assert.equal(town.era,era);assert.equal(town.culture,culture);}
const c={id:'c',townId:'t'},world={towns:[{id:'t',era:'medieval',culture:'korea'}]};
for(const language of ['ko','en','ja']){world.uiLanguage=language;const old={lifeTaskId:'phone',title:'휴대폰 보기',desc:'동영상을 보고 있어요',sharedCanonicalTitle:'TV',sharedPerspectives:{c:{title:'TV'}},kind:'relax'};const scene=adaptTownActivity(world,c,old);assert(townActivityAllowed(world.towns[0],scene));assert(!JSON.stringify(scene).includes('TV'));assert.equal(old.title,'휴대폰 보기');}
assert(!townActivityAllowed(world.towns[0],{id:'sns'}));assert(townActivityAllowed({era:'modern'},{id:'sns'}));assert(townActivityAllowed(world.towns[0],{id:'read',labels:['책 읽기','Read','読書']}));
for(const r of RECIPES){const durations=recipeDurations(r);assert(durations.every(n=>n>=2000&&n<=7000));let at=100;const job={startedAt:100,stepDurations:durations};for(let i=0;i<r.steps.length;i++){assert.equal(cookingStepAt(job,r,at).step,i);assert.equal(cookingStepAt(job,r,at+durations[i]-1).step,i);at+=durations[i]}
 for(const lang of ['en','ja']){const v=RECIPE_LOCALIZATIONS[r.id][lang];assert.equal(v.steps.length,r.steps.length);assert.equal(v.ingredients.length,r.ing.length);assert([v.name,...v.steps,...v.ingredients].every(s=>s&&!/[가-힣]/.test(s)));}}
assert.equal(cookingStepAt({startedAt:0},RECIPES[0],3000).step,1);
console.log('PASS 42 era/culture combinations, electronic exclusion, clean localized replacements, unchanged modern, 100 recipe translations, all variable duration boundaries and legacy clocks');
