import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const run=(c,a)=>execFileSync(c,a,{encoding:'utf8',timeout:240000,maxBuffer:8*1024*1024});
const list=JSON.parse(run('xcrun',['simctl','list','--json']));const runtime=list.runtimes.filter(r=>r.isAvailable&&r.identifier.includes('.iOS-')).sort((a,b)=>b.version.localeCompare(a.version,'en',{numeric:true}))[0];
const device=(list.devices[runtime.identifier]||[]).find(d=>d.isAvailable&&d.name.startsWith('iPad'));assert.ok(device);
fs.mkdirSync('ios/build/scene28',{recursive:true});
try{
 run('xcrun',['simctl','boot',device.udid]);run('xcrun',['simctl','bootstatus',device.udid,'-b']);
 run('xcrun',['simctl','install',device.udid,'ios/build/DerivedData/Build/Products/Debug-iphonesimulator/App.app']);
 run('xcrun',['simctl','launch',device.udid,'com.drawervillage.app']);
 await new Promise(r=>setTimeout(r,20000));
 const data=run('xcrun',['simctl','get_app_container',device.udid,'com.drawervillage.app','data']).trim();
 const result=JSON.parse(fs.readFileSync(data+'/Documents/drawer-scene-check.json','utf8'));assert.deepEqual(result,{sceneActive:true,hasWindow:true,hasRoot:true});
 const running=run('xcrun',['simctl','spawn',device.udid,'launchctl','list']);assert.ok(running.split('\n').some(line=>/^\d+\s/.test(line)&&line.includes('com.drawervillage.app')));
 run('xcrun',['simctl','io',device.udid,'screenshot','ios/build/scene28/iPad.png']);
 fs.writeFileSync('ios/build/scene28/result.json',JSON.stringify({...result,device:device.name,runtime:runtime.version,scope:'UIKit scene launch only; no real StoreKit purchase tested'}));console.log('PASS active iPad window scene and Capacitor root');
}finally{try{run('xcrun',['simctl','shutdown',device.udid])}catch{}}
