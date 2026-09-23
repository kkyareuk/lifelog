export function isDrinkingCoffee(scene){
 return scene?.coffeeRecovery===true||scene?.lifeTaskId==='coffee'||scene?.actionKind==='coffee-drinking'||/커피.{0,15}마시|마시.{0,15}커피|drinking.{0,15}coffee|coffee.{0,15}drinking|コーヒーを飲/i.test([scene?.title,scene?.baseTitle].join(' '));
}
export const coffeeCopy=['커피를 마시며 잠을 깨는 중','따뜻한 커피를 마시며 졸음을 덜고 있어요.','Waking up with coffee','Drinking warm coffee to feel more alert.','コーヒーで目を覚ましているところ','温かいコーヒーを飲んで眠気を和らげています。'];

export const COFFEE_DRINK_MS=20000;
export const COFFEE_BREW_MS=15000;
export const COFFEE_SLEEP_GAIN=30;
export const coffeeEpisode=scene=>String(scene?.manualDirectiveId||scene?.recoveryStartedAt||[scene?.dateKey||'',scene?.minute,scene?.baseTitle||scene?.title].join(':'));
