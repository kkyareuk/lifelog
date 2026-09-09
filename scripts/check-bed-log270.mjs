import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('simulation.js','utf8'),start=source.indexOf('function viewDrivenInteraction('),end=source.indexOf('\nfunction ',start+1),code=source.slice(start,end);
const context={state:{uiLanguage:'ko'},explicitCharacterViewFor:()=>({overall:'조금 귀찮음'}),hash:()=>7,interactionInitiator:first=>first,dayKey:()=> '2026-09-07',togetherWith:n=>n+'와',subject:n=>n+'가'};
vm.createContext(context);vm.runInContext(code+';globalThis.sceneForTest=viewDrivenInteraction;',context);
for(const lang of ['ko','en','ja']){context.state.uiLanguage=lang;const scene=context.sceneForTest({id:'bedroom',type:'bedroom',name:'침실'},{id:'a',name:'리바이'},{id:'b',name:'안테'},new Date());assert.ok(scene.title);assert.doesNotMatch(JSON.stringify(scene),/물건을 둘|찻잔|툭툭 받아|undefined/);console.log(lang,scene.title)}
console.log('PASS bedroom annoyance scene respects resting location in all three languages');
