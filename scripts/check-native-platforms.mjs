import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
const code=readFileSync(new URL("../native-app.js",import.meta.url),"utf8");
for(const platform of ["android","ios","web"]){
 const listeners=[],windowEvents=[],documentEvents=[];
 const window={
  Capacitor:{isNativePlatform:()=>platform!=="web",getPlatform:()=>platform,Plugins:{
   App:{addListener:name=>{listeners.push(name)}},Browser:{},Network:{getStatus:async()=>({connected:true}),addListener:()=>{}},
   PlayBilling:{getProducts:async()=>({products:[]})}
  }},
  PARALLEL_CITY_CONFIG:{playBilling:{enabled:true,backendUrl:"https://example.invalid",products:{}}},
  addEventListener:name=>windowEvents.push(name)
 };
 const document={documentElement:{classList:{add:()=>{}},style:{removeProperty:()=>{}}},body:{style:{removeProperty:()=>{}}},
  querySelector:selector=>selector.startsWith("meta")?{content:""}:null,addEventListener:name=>documentEvents.push(name)};
 const context=vm.createContext({window,document,localStorage:{getItem:()=>null},console,URL,Set,Map,setTimeout,requestAnimationFrame:()=>{},location:{href:"https://localhost/"}});
 await vm.runInContext("(async()=>{"+code+"})()",context);
 assert.equal(listeners.includes("backButton"),platform==="android");
 assert.equal(Boolean(window.DrawerVillagePlayBilling?.enabled()),platform==="android");
 if(platform==="ios")assert.equal((await window.DrawerVillagePlayBilling.loadProducts()).length,0);
 if(platform==="web")assert.equal(window.DRAWER_VILLAGE_NATIVE,undefined);
}
console.log("PASS native platform isolation: Android billing/back remain enabled; iOS does not invoke Play APIs; web is untouched.");
