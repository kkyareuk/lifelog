import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync, existsSync, readFileSync, copyFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

export function selectDevices(list) {
  const runtime = list.runtimes.filter(r => r.isAvailable && r.identifier.includes('.iOS-'))
    .sort((a,b) => b.version.localeCompare(a.version, 'en', {numeric:true}))[0];
  if (!runtime) throw new Error('No installed iOS simulator runtime');
  const devices = (list.devices[runtime.identifier] || []).filter(d => d.isAvailable);
  return ['iPhone', 'iPad'].map(family => {
    const device = devices.find(d => d.name.startsWith(family));
    if (!device) throw new Error(`No installed ${family} simulator for ${runtime.version}`);
    return {family, udid:device.udid, name:device.name, runtime:runtime.version};
  });
}

async function main() {
  if (process.platform !== 'darwin') throw new Error('Simulator launch requires macOS/Xcode');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const reports = `${root}ios/build/reports`;
  const app = `${root}ios/build/DerivedData/Build/Products/Debug-iphonesimulator/App.app`;
  if (!existsSync(app)) throw new Error('Build the simulator App.app first');
  mkdirSync(reports, {recursive:true});
  const simctl = (args, timeout = 180_000) => {
    console.log(`simctl ${args[0]} ${args[1] || ''}`);
    return execFileSync('xcrun', ['simctl', ...args], {
      encoding:'utf8', timeout, killSignal:'SIGKILL', maxBuffer:8*1024*1024
    }).trim();
  };
  const request = JSON.parse(readFileSync(`${root}.github/ios-preview-request.json`, 'utf8'));
  if (request.deviceFamily && !['iPhone', 'iPad'].includes(request.deviceFamily)) throw new Error('Invalid simulator family');
  const devices = selectDevices(JSON.parse(simctl(['list', '--json'])))
    .filter(device => !request.deviceFamily || device.family === request.deviceFamily);
  const results = [];
  for (const device of devices) {
    console.log(`Launch smoke: ${device.name} / iOS ${device.runtime}`);
    try {
      // CI owns these disposable simulators; never target an attached device.
      simctl(['boot', device.udid]);
      simctl(['bootstatus', device.udid, '-b']);
      simctl(['install', device.udid, app]);
      const launch = simctl(['launch', device.udid, 'com.drawervillage.app']);
      if (!/com\.drawervillage\.app:\s*\d+/.test(launch)) throw new Error(`Unexpected launch: ${launch}`);
      const container = simctl(['get_app_container',device.udid,'com.drawervillage.app','data']);
      const probe = `${container}/Documents/drawer-startup-check.json`;
      let startup=null;
      for(let attempt=0;attempt<45;attempt++){
        await new Promise(resolve=>setTimeout(resolve,2000));
        if(existsSync(probe)){try{startup=JSON.parse(readFileSync(probe,'utf8'))}catch{}}
        if(startup?.dom?.appChildren>0&&startup.dom.textLength>50&&startup.dom.buttons>0)break;
      }
      writeFileSync(`${reports}/${device.family}-startup.json`,JSON.stringify(startup,null,2));
      const scene=`${container}/Documents/drawer-scene-check.json`;
      if(existsSync(scene))copyFileSync(scene,`${reports}/${device.family}-scene.json`);

      simctl(['io', device.udid, 'screenshot', `${reports}/${device.family}.png`]);
      if(!(startup?.dom?.appChildren>0&&startup.dom.textLength>50&&startup.dom.buttons>0))throw new Error('WebView did not render game UI; inspect startup and scene reports');
      // A screenshot alone can be SpringBoard after a crash; verify a live app PID.
      const processList = simctl(['spawn', device.udid, 'launchctl', 'list']);
      const running = processList.split('\n').some(line =>
        /^\d+\s/.test(line) && line.includes('com.drawervillage.app'));
      if (!running) throw new Error('App exited before the launch screenshot');
      results.push({...device, launch, running, startup, screenshot:`${device.family}.png`});
    } catch (error) {
      // Launch can time out before the normal probe path. Keep evidence instead
      // of confusing a simulator command failure with an app crash.
      try {
        const container = simctl(['get_app_container', device.udid, 'com.drawervillage.app', 'data'], 30_000);
        for (const name of ['startup', 'scene']) {
          const source = `${container}/Documents/drawer-${name}-check.json`;
          if (existsSync(source)) copyFileSync(source, `${reports}/${device.family}-${name}.json`);
        }
        simctl(['io', device.udid, 'screenshot', `${reports}/${device.family}-failure.png`], 30_000);
      } catch (captureError) { console.error('Failure evidence unavailable:', captureError.message); }
      results.push({...device, error:error.message, passed:false});
      throw error;
    } finally {
      try { simctl(['shutdown', device.udid], 30_000); } catch { /* preserve original error */ }
      writeFileSync(`${reports}/launch-results.json`, JSON.stringify({
        commit:process.env.GITHUB_SHA || null, results,
        scope:'Native launch, game DOM and process check; screenshots require visual review. Not full functional, signing, TestFlight or physical device QA.'
      }, null, 2));
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
