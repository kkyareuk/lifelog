import assert from 'node:assert/strict';
import {normalizeFamilyArchive,copyFamilyArchive,pasteFamilyArchive,displayPersonalName,familyLegacyLine} from '../family-archive.js';
import {relationshipMemory} from '../relationship-memories.js';
const archive={clanName:'Holstein',heritages:[{label:'Silver compass',kind:'object',successorId:'b'}],roleLinks:[{from:'a',to:'b',role:'child',blood:true},{from:'a',to:'x',role:'child',blood:true}]};
const norm=normalizeFamilyArchive(archive,['a','b']);assert.equal(norm.roleLinks.length,1);
assert.equal(normalizeFamilyArchive({...archive,roleLinks:[{from:'a',to:'b',role:'bogus',blood:true}]},['a','b']).roleLinks.length,0);
const pasted=pasteFamilyArchive(copyFamilyArchive(norm,['a','b']),['x','y']);assert.equal(pasted.heritages[0].successorId,'y');assert.equal(pasted.roleLinks[0].to,'y');assert.throws(()=>pasteFamilyArchive(copyFamilyArchive(norm,['a','b']),['x']));
assert.equal(displayPersonalName({given:'Nerine',middle:'A',family:'Holstein',order:'family-first'}),'Holstein Nerine A');
const a={id:'a',name:'A'},b={id:'b',name:'B'},r={type:'가족',a:'a',b:'b',familyArchive:norm};
for(const language of ['ko','en','ja']){assert.match(familyLegacyLine(r,a,b,language),/Silver compass/);assert.match(relationshipMemory(a,b,r,{}, {language}).text,/Silver compass/);}
assert.equal(familyLegacyLine({...r,familyArchive:{heritages:[]}},a,b),null);
for(let origin=0;origin<9;origin++)assert(relationshipMemory(a,b,{type:'부부',a:'a',b:'b',details:{origin:String(origin)}},{},{language:'en'}).text.length>30);
console.log('PASS archive validation, name order, member/successor remap, localized heritage logs, nine marriage origins');
