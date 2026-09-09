import assert from 'node:assert/strict';
import {proposalCopy} from '../proposal-copy.js';
const base={senderDisplayName:'네리네악개',responderDisplayName:'꺄륵',sourceName:'새 캐릭터',targetName:'연습용',kind:'admission'};
const ko=(k,e,j)=>k;
assert.equal(proposalCopy(base,ko).body,'네리네악개님이 새 캐릭터의 연습용 입주를 신청했습니다.');
assert.equal(proposalCopy({...base,asResponse:true,status:'declined',reason:'정원이 찼어요'},ko).body,'꺄륵님이 새 캐릭터의 입주 신청을 ‘정원이 찼어요’라는 이유로 거절했습니다.');
assert.ok(!proposalCopy({...base,asResponse:true,status:'declined',reason:'  '},ko).body.includes('이유'));
for(const t of [ko,(k,e,j)=>e,(k,e,j)=>j])for(const kind of ['admission','cohabitation','schedule','characterGroup','relationship'])for(const status of ['accepted','declined']){
 const copy=proposalCopy({...base,kind,status,asResponse:true,reason:'reason'},t);
 assert.ok(copy.body.includes('새 캐릭터'));assert.ok(!copy.body.includes('undefined'));
}
assert.match(proposalCopy({...base,kind:'relationship',patch:{name:'별명',type:'친구',stage:'편한 친구'}},ko).body,/친구\(편한 친구\)/);
assert.match(proposalCopy({...base,kind:'characterGroup',patch:{name:'독서회'}},ko).body,/캐릭터 그룹 「독서회」의 구성원/);
assert.match(proposalCopy({...base,appliedByAuthority:true},ko).body,/입주를 완료/);
console.log('PASS explicit proposal subjects, inline optional refusal reason, all five kinds in KO/EN/JA');
