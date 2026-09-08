// Simulator-only navigation: no authentication, prices or StoreKit responses are mocked.
import fs from 'node:fs';
if(process.platform!=='darwin'||process.env.GITHUB_REF!=='refs/heads/codex/ios-production264')throw Error('Disposable CI simulator only');
const root='ios/App/App/public/';
const code=`(async()=>{while(!window.ParallelCity||!window.ParallelCityAuth?.getInfo?.().ready)await new Promise(r=>setTimeout(r,100));const g=await import('./state.js?v=20260908hotfix274');if(!g.state.order.length){const id=g.createCharacter(5);g.state.characters[id].name='하루';g.save(true)}await window.ParallelCityAuth.markGuideSeen('observe');location.hash='tab=shop';setTimeout(()=>{location.hash='tab=observe'},30000)})()`;
fs.writeFileSync(root+'qa-review-navigation.js',code);fs.appendFileSync(root+'index.html','\n<script type="module" src="./qa-review-navigation.js"></script>\n');
console.log('Prepared guest simulator navigation only; release archive assets are untouched.');
