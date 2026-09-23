import {readFileSync,writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';
const current=readFileSync('scene-depth.js','utf8'),old=execFileSync('git',['show','d4650371:scene-depth.js'],{encoding:'utf8'});
const fn=s=>new Function(s.slice(s.indexOf('export function placeSceneLabel')).replace('export function','return function'))();
const a=fn(old),b=fn(current);let seed=495;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
for(let n=0;n<500;n++){const area={left:0,top:0,right:100+rnd()*500,bottom:100+rnd()*500},anchor={left:rnd()*200,top:rnd()*200};anchor.right=anchor.left+40;anchor.bottom=anchor.top+40;const card={width:30+rnd()*140,height:20+rnd()*60},occupied=Array.from({length:n%16},()=>{const left=rnd()*area.right,top=rnd()*area.bottom;return{left,top,right:left+50,bottom:top+80}});const score=r=>occupied.reduce((s,o)=>s+Math.max(0,Math.min(r.right,o.right)-Math.max(r.left,o.left))*Math.max(0,Math.min(r.bottom,o.bottom)-Math.max(r.top,o.top)),0)*100000+Math.hypot(r.left-(anchor.left+anchor.right-card.width)/2,r.top-anchor.bottom-6);assert.ok(Math.abs(score(a(anchor,card,area,occupied))-score(b(anchor,card,area,occupied)))<1e-5)}
console.log('PASS 500 label-placement cases: optimized search preserves best overlap/distance score');

