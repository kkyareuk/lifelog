export function medievalCookingAccess(world,c){
 if(world.recipeEntitlements)return world.recipeEntitlements[c.id]?.includes('medieval')===true;
 const auth=globalThis.window?.ParallelCityAuth?.getInfo?.();return auth?.entitlements?.dlcPacks?.includes('medieval')===true&&(!world.sharedContext||c.ownerUid===auth.user?.uid);
}
export const recipeUnlocked=(world,c,recipe)=>!!recipe&&recipe.cuisine!=='fantasy'&&(recipe.cuisine!=='medieval'||medievalCookingAccess(world,c));
