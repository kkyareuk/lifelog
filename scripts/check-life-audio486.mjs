import assert from 'node:assert/strict';
let host={dataset:{observedCharacter:'a',lifeSound:'eat'},querySelector:()=>null},created=[];
globalThis.localStorage={getItem:()=>null};globalThis.window={addEventListener(){},Capacitor:{isNativePlatform:()=>true}};globalThis.document={hidden:false,querySelector:()=>host,addEventListener(){}};
globalThis.Audio=class {constructor(src){this.src=src;this.stopped=false;created.push(this)}play(){return Promise.resolve()}pause(){this.stopped=true}removeAttribute(){}load(){}};
const {lifeSound,syncLifeSound}=await import('../life-audio.js');
for(const [title,sound] of [['샤워하는 중','shower'],['설거지하는 중','dishes'],['커피를 마시는 중','drink'],['점심을 먹는 중','eat'],['Showering','shower'],['Washing dishes','dishes'],['Sipping tea','drink'],['Eating a meal','eat'],['シャワー中','shower'],['食器を洗っている','dishes'],['お茶を飲んでいる','drink'],['食事中','eat'],['요리를 만드는 중','']])assert.equal(lifeSound({title}),sound,title);
const s={soundEffectsVolume:45};syncLifeSound(s);syncLifeSound(s);assert.equal(created.length,1);assert.equal(created[0].volume,.45);host.dataset.lifeSound='drink';syncLifeSound(s);assert(created[0].stopped);assert.equal(created.length,2);document.hidden=true;syncLifeSound(s);assert(created[1].stopped);document.hidden=false;syncLifeSound({...s,soundMuted:true});assert.equal(created.length,2);host=null;syncLifeSound(s);assert.equal(created.length,2);
console.log('PASS life audio classification KO/EN/JA, single channel, no render restart, volume/mute, hidden and screen exit');
