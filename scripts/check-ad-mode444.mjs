import assert from 'node:assert/strict';
globalThis.window={DRAWER_VILLAGE_PLAZA_ENABLED:true,PARALLEL_CITY_CONFIG:{ads:{testing:false}},Capacitor:{getPlatform:()=> 'android'}};
const ads=await import('../native-ads.js');assert.equal(ads.adsTesting(),false);assert.equal(ads.adOptions('banner').isTesting,false);assert.match(ads.adOptions('banner').adId,/2970618408876751/);window.PARALLEL_CITY_CONFIG.ads.testing=true;assert.equal(ads.adsTesting(),true);console.log('PASS444 real IDs independent of plaza, explicit QA toggle retained');
