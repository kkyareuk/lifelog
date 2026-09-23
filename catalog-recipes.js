// Dictionary food choices are resolved in the current world, including on the server.
// Never accept a recipe or a price supplied in a cooking command.
const choice=(options,key,fallback)=>Object.hasOwn(options,key)?options[key]:fallback;
const categoryPrices={'한식':10000,'일식':14000,'중식':12000,'이탈리아 음식':18000,'양식':18000,'분식':6000,'패스트푸드':7000,'디저트':6500,'빵':4000,'간식':3000};
const subtypeFactors={'국물':1,'면':.9,'밥':.9,'구이':1.4,'튀김':1.2,'샐러드':.8,'케이크':1.3,'쿠키':.7};
const priceFactors={'매우 저렴':.45,'저렴':.7,'보통':1,'비쌈':2.5,'매우 비쌈':7};
export function catalogFoodCost(item={}){
 const base=choice(categoryPrices,item.category,10000),factor=choice(subtypeFactors,item.subtype,1);
 const out=Math.min(110000,Math.max(1000,Math.round(base*factor*(choice(priceFactors,item.price,1))/100)*100));
 const home=Math.max(500,Math.round(out*.45/100)*100);
 return {home:home/10000,out:out/10000};
}
const methods={
 '국물':['cook','재료를 넣고 국물을 끓이고 있어요'],
 '면':['cook','면을 익히고 곁들일 재료를 준비하고 있어요'],
 '밥':['cook','밥과 곁들일 재료를 익히고 있어요'],
 '구이':['cook','불의 세기를 조절하며 재료를 굽고 있어요'],
 '튀김':['cook','기름 온도를 살피며 재료를 튀기고 있어요'],
 '샐러드':['mix','손질한 재료를 가볍게 섞고 있어요'],
 '케이크':['cook','반죽을 오븐에 넣고 굽고 있어요'],
 '쿠키':['cook','반죽을 나누어 모양을 잡고 굽고 있어요']
};
export function catalogRecipe(item){
 if(!item||typeof item.id!=='string'||!item.id||typeof item.name!=='string'||!item.name.trim())return null;
 const subtype=item.subtype||choice({'빵':'쿠키','디저트':'케이크'},item.category,'');
 return {id:'catalog-food:'+item.id,custom:true,name:item.name.trim().slice(0,160),
  cuisine:choice({'한식':'korean','일식':'japanese','중식':'chinese','이탈리아 음식':'italian','양식':'american','분식':'quick','패스트푸드':'quick','간식':'quick','디저트':'dessert','빵':'dessert'},item.category,'other'),
  level:['케이크','구이','튀김'].includes(subtype)?2:1,ing:[],cost:catalogFoodCost(item),
  steps:[['prep','요리에 필요한 재료를 준비하고 있어요'],['prep','재료를 손질하고 양을 맞추고 있어요'],choice(methods,subtype,['cook','재료의 상태를 살피며 요리를 만들고 있어요']),['plate','완성한 음식을 그릇에 담고 있어요']]};
}
export const catalogRecipes=world=>(Array.isArray(world?.catalog?.food)?world.catalog.food:[]).map(catalogRecipe).filter(Boolean);
export function sortCookingRecipes(recipes,sort='level'){
 return [...recipes].sort((a,b)=>Number(!!b.custom)-Number(!!a.custom)||(sort==='price'?a.cost.home-b.cost.home||a.level-b.level:a.level-b.level||a.cost.home-b.cost.home));
}
