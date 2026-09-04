import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync, existsSync} from 'node:fs';
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
  const devices = selectDevices(JSON.parse(simctl(['list', '--json'])));
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
      await new Promise(resolve => setTimeout(resolve, 15_000));
      simctl(['io', device.udid, 'screenshot', `${reports}/${device.family}.png`]);
      // A screenshot alone can be SpringBoard after a crash; verify a live app PID.
      const processList = simctl(['spawn', device.udid, 'launchctl', 'list']);
      const running = processList.split('\n').some(line =>
        /^\d+\s/.test(line) && line.includes('com.drawervillage.app'));
      if (!running) throw new Error('App exited before the launch screenshot');
      results.push({...device, launch, running, screenshot:`${device.family}.png`});
    } finally {
      try { simctl(['shutdown', device.udid], 30_000); } catch { /* preserve original error */ }
      writeFileSync(`${reports}/launch-results.json`, JSON.stringify({
        commit:process.env.GITHUB_SHA || null, results,
        scope:'Launch/process check only; screenshots require visual review. Not functional, signing, TestFlight or device QA.'
      }, null, 2));
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch(error => { console.error(error); process.exitCode = 1; });
}
