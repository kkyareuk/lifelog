import assert from 'node:assert/strict';
import {applyCharacterTransfers} from '../character-transfers.js';
import {mergeDeviceAndCloudState,mergeCloudRestoreState,mergeImportedBackupState} from '../sync-merge.js';
const before={characters:{n:{id:'n',name:'네리네'},other:{id:'other',name:'네리네'}},order:['n','other'],activeId:'n',towns:[{id:'town'}],activeTownId:'town',homes:{},lastSaved:100};
const moved=applyCharacterTransfers(structuredClone(before),[{personalId:'n',location:'group',revision:1}]);
for(const merge of [mergeDeviceAndCloudState,mergeCloudRestoreState,mergeImportedBackupState]){
  for(const [a,b] of [[moved,before],[before,moved]]){
    const result=merge(a,b);assert.equal(result.characters.n,undefined);assert.ok(result.characters.other);assert.ok(!result.order.includes('n'));
  }
}
const returned=applyCharacterTransfers(structuredClone(moved),[{personalId:'n',location:'personal',revision:2,profile:{name:'돌아온 네리네'},homeTownId:'town'}]);
assert.equal(returned.characters.n.name,'돌아온 네리네');
applyCharacterTransfers(returned,[{personalId:'n',location:'group',revision:1}]);assert.ok(returned.characters.n);
const mergedReturn=mergeDeviceAndCloudState(moved,returned);assert.ok(mergedReturn.characters.n);assert.equal(mergedReturn.characterTransferLocations.n.location,'personal');
applyCharacterTransfers(mergedReturn,[{personalId:'n',location:'group',revision:3}]);assert.equal(mergedReturn.characters.n,undefined);
console.log('PASS moves survive cloud/backup merge, same-name characters remain, newer returns win and stale receipts cannot undo them');
