import assert from 'node:assert/strict';
import {routineScene,nextRoutinePhaseAt} from '../routine-scenes.js';
process.env.TZ='Asia/Seoul';
const a={id:'a',name:'안테',skills:['운동']},b={id:'b',name:'짭바이',skills:[]},world={characters:{a,b}},base={routineId:'r',routineStartMinute:600,routineEndMinute:660,routineType:'병원',routineTitle:'정기 진료',participantOrder:['a','b']},at=m=>new Date(2026,8,9,10,m).getTime();
for(const lang of ['ko','en','ja']){const phases=[0,20,40,55].map(m=>routineScene(base,a,world,at(m),lang));assert.deepEqual(phases.map(p=>p.routinePhase),[0,1,2,3]);assert.equal(new Set(phases.map(p=>p.title)).size,4);assert.deepEqual(routineScene(base,a,world,at(40),lang),phases[2]);}
assert.match(routineScene(base,a,world,at(0)).title,/접수/);assert.match(routineScene(base,a,world,at(55)).title,/수납/);assert.equal(nextRoutinePhaseAt(base,at(0)),at(9));assert.equal(routineScene(base,a,world,at(60)),base);
const exercise={...base,routineType:'운동'};const sa=routineScene(exercise,a,world,at(20)),sb=routineScene(exercise,b,world,at(20));assert.equal(sa.desc,sb.desc);assert.match(sa.desc,/안테.*익숙/);assert.match(sa.desc,/짭바이.*놓쳐/);assert.equal(base.routinePhase,undefined);
console.log('PASS deterministic multilingual schedule phases, boundaries and skill-based shared perspective');
