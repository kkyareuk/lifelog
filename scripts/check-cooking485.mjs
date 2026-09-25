import assert from 'node:assert/strict';
import {adErrorText} from '../ad-errors.js';
import {readFileSync} from 'node:fs';
for(const lang of ['ko','en','ja']){const ios=adErrorText({adStage:'banner',code:1},lang,'ios'),android=adErrorText({adStage:'banner',code:3},lang,'android');assert.equal(ios,android);assert.notEqual(ios,adErrorText({adStage:'banner',code:0},lang,'ios'));assert.notEqual(ios,adErrorText({adStage:'banner',code:3},lang,'ios'));}
const patch=readFileSync(new URL('../patches/@capacitor-community+admob+7.2.0.patch',import.meta.url),'utf8');assert(patch.includes('+            "code": (error as NSError).code'));assert(patch.includes('view.layoutIfNeeded()'));assert(patch.includes('viewWidth.isFinite'));
console.log('PASS485 platform-correct no-fill vs request/server errors and persisted native patch');
