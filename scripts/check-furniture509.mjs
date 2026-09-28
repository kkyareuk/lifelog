import assert from 'node:assert/strict';
import {normalizeFurniturePlacement} from '../furniture-layout.js';
import {counterResizePatch} from '../counter-resize.js';
import {furnitureSprite} from '../furniture-sprites.js';
import {homeSurfaceImage,wallSurfaceImage,normalizeWallSurface} from '../home-surfaces.js';
import {washingFoam} from '../washing-foam.js';
const p=normalizeFurniturePlacement({id:'x',item:'카운터',x:50,y:50,counterSpan:2,counterDepth:3});
assert.equal(p.counterDepth,3);assert.equal(furnitureSprite(p).height,1116);
for(const edge of ['left','right','top','bottom']){const sign=['left','top'].includes(edge)?-1:1,r=counterResizePatch(p,edge,sign*30,{width:200,height:300},{width:1000,height:1000}),horizontal=['left','right'].includes(edge),key=horizontal?'counterSpan':'counterDepth';assert.equal(r[key],p[key]+.3);assert(Math.abs(r[horizontal?'x':'y']-(50+sign*1.5))<1e-8)}
assert.equal(normalizeWallSurface('checker-tile'),'checker-tile');assert.equal(wallSurfaceImage('customWall','customTile','floor','bath','wall'),'wall');assert.equal(homeSurfaceImage('customTile','floor'),'floor');
for(const dir of [0,90,180,270])assert(furnitureSprite({item:'책상',rotation:dir}));
const foam=washingFoam('one');assert.equal(foam,washingFoam('one'));assert.notEqual(foam,washingFoam('two'));assert.equal((foam.match(/<i /g)||[]).length,8);
console.log('PASS 509: four anchored edges, persisted depth, independent wall/floor, checker wallpaper, directional desk, varied stable foam');
