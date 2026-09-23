import assert from 'node:assert/strict';
import {displayMoney} from '../character-money.js';
import {buildingInterior} from '../building-interior-model.js';
import {RECIPES} from '../recipes.js';
import {furniturePatternForScene} from '../home-simulation.js';
import {contextActions} from '../context-actions.js';
import {canUseCoffeeTool} from '../coffee-crafting.js';
assert.equal(displayMoney(150000000,{}),'1억 5000만 원');assert.equal(displayMoney(100000005,{}),'1억 5 원');assert.equal(displayMoney(6800,{}),'6,800 원');
assert.equal(displayMoney(150000000,{},'en'),'150,000,000 원');
const recipe=RECIPES.find(r=>r.id==='gourmet_10');assert.equal(recipe.cost.home,4.8);assert.equal(recipe.cost.out,11);assert.equal(RECIPES.find(r=>r.id==='gourmet_01').cost.out,11);assert.equal(RECIPES.find(r=>r.id==='gourmet_01').cost.home,5.5);assert(recipe.cost.out>recipe.cost.home);
for(const type of ['병원','카페','학교','사무실','숙박','도서관','음식점','옷가게','상점','공연장','공원','관공서']){const h=buildingInterior({id:'p',name:type,type},'t');assert.equal(Object.keys(h.rooms).length,4);for(const room of Object.values(h.rooms)){assert(room.furniturePlacements.length);assert(room.layout.x+room.layout.w<=100)}}
const saved={rooms:{custom:{name:'사용자 방',furniturePlacements:[]}}};assert.deepEqual(buildingInterior({id:'p',interior:saved},'t').rooms,saved.rooms);
assert(furniturePatternForScene({title:'커피 내리기에 몰두하는 중'}).test('커피포트'));
assert(!furniturePatternForScene({title:'커피 내리기에 몰두하는 중'}).test('식탁'));
assert(contextActions({type:'furniture',item:'커피포트'}).some(a=>a.lifeTask==='coffee_drip'));assert(canUseCoffeeTool('커피포트','coffee_drip'));assert(!canUseCoffeeTool('커피포트','coffee_capsule'));
console.log('PASS479 money units, prices, interior preservation, coffee routing');

assert(RECIPES.every(r=>r.cost.home<=11&&r.cost.out<=11));
