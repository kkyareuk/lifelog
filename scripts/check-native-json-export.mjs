import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../native-json-export.js',import.meta.url),'utf8');
const {exportNativeJson}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const data=JSON.stringify({text:('가나다😀'.repeat(16000)+'x'.repeat(32767)+'😀').repeat(40)});
let chunks=[],bytes=0,final;
const native={appendJsonChunk:async args=>{assert(args.data.length<=32768);assert.equal(args.offset,bytes);const chunk=Buffer.from(args.data);chunks.push(chunk);bytes+=chunk.length;return {backupToken:'test',offset:bytes}},saveJson:async args=>{final=args;return {uri:'test'}},cancelJsonExport:async()=>{throw Error('unexpected cleanup')}};
await exportNativeJson(native,'backup.json',data,'android');assert.equal(Buffer.concat(chunks).toString('utf8'),data);assert.equal(final.data,undefined);assert.equal(final.backupToken,'test');
bytes=0;let cancelled=false;await assert.rejects(exportNativeJson({...native,saveJson:async()=>{throw Error('cancelled')},cancelJsonExport:async()=>{cancelled=true}},'b.json','abc','android'));assert(cancelled);
let legacy;await exportNativeJson({saveJson:async args=>legacy=args},'b.json','abc','ios');assert.equal(legacy.data,'abc');
console.log('PASS Unicode payload byte equality, bounded Android chunks, token-only picker, failure cleanup, iOS compatibility');

