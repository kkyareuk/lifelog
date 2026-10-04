import assert from 'node:assert/strict';
import {minuteClock,logTime} from '../log-time.js';
import {cleanSameMinuteEntries} from '../simulation-timeline-cleanup.js';
for(const [minute,want] of [[874.45433333335,'14:34'],[1187.3521499999994,'19:47'],[1439.999999,'23:59'],[1440.1,'00:00'],[0,'00:00']])assert.equal(minuteClock(minute),want);
assert.equal(logTime({time:'19:41.2034166667'}),'19:41');
const original=[{minute:874.45433333335,time:'14:34.45433333335',title:'a'},{minute:874.71833333,time:'14:34.71833333',title:'b'}];
const cleaned=cleanSameMinuteEntries(original);assert.equal(cleaned.length,2);assert.deepEqual(cleaned.map(x=>x.minute),original.map(x=>x.minute));assert(cleaned.every(x=>x.time==='14:34'));
assert.equal(original[0].time,'14:34.45433333335');console.log('PASS fractional timestamp display, midnight, legacy strings, precise order and distinct same-minute events preserved');
