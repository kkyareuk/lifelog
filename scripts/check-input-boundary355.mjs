import assert from 'node:assert/strict';
import {createInputBoundary} from '../input-boundary.js';
let clock=10;const g=createInputBoundary(()=>clock);assert(!g.stale(5));clock=6010;g.commit();assert(g.stale(3000));assert(g.stale(6000));assert(!g.stale(6011));clock=9000;assert(!g.stale(9000));assert(!g.stale(0));console.log('PASS queued pre-transition input rejected; fresh input never locked');
