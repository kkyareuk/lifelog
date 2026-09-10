import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const {accountStorage}=await import('../account-storage.js?v=20260909dev305');const mail=await import('../mail-read-state.js');
for(const malformed of ['null','[]','42','"oops"','{broken']){accountStorage.setItem('drawer-mail-read-v1',malformed);const item={id:malformed};assert.equal(mail.mailWasRead(item),false);mail.markMailRead(item);assert.equal(mail.mailWasRead(item),true)}
accountStorage.setItem('drawer-mail-read-v1','{}');const write=accountStorage.setItem;accountStorage.setItem=()=>{throw Error('full')};mail.markMailRead({id:'quota'});assert.equal(mail.mailWasRead({id:'quota'}),true);accountStorage.setItem=write;
const source=await readFile('app.js','utf8'),fn=source.slice(source.indexOf('async function explicitSave('),source.indexOf('\nfunction openCharacterDeleteDialog'));
for(const lang of ['ko','en','ja']){const toasts=[],context={state:{uiLanguage:lang},save:()=>false,showToast:x=>toasts.push(x),saveSharedCharacter:()=>null,queueCharacterNotificationSchedule:()=>assert.fail('failed save scheduled notification'),render:()=>assert.fail('failed save claimed success'),window:{},requestAnimationFrame:fn=>fn()};const run=vm.runInNewContext(fn+';explicitSave',context);assert.equal(await run('settings'),false);assert.equal(await run('캐릭터 저장',{alreadySaved:true}),false);assert.equal(toasts.length,2)}
console.log('PASS malformed read markers, full-storage session reads, and actual explicit save failure paths in KO/EN/JA');
