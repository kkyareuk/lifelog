import {writeFile,readFile} from 'node:fs/promises';
import {DISCOVERY_SCENES as events,DISCOVERY_AXES} from '../character-discovery-rules.js';
const prior=await readFile('docs/release325-discovery-weights.md','utf8');
const guide=prior.slice(prior.indexOf('## 읽는 방법'),prior.indexOf('## 상황별 전체 목록'));
let text='# 서랍마을 326 · 돌발 상황 / 선택지 / 가중치 전체 목록\n\n37개 상황: 기존 행동 상황 24개(각 8개 후보 중 무작위 5개) + 정보 질문 13개. 기존 120개 행동 보존, 새 행동 72개 추가. 타투 첫 질문 5개 행동, 나머지 정보 질문 12개는 드롭다운과 확인 버튼.\n\n'+guide;
text+='## 진행 방식\n\n- 답한 질문 ID는 캐릭터별로 계속 저장합니다. 다음 접속과 내보내기에도 캐릭터 데이터에 포함됩니다. 이전 버전의 최근 6개 이력도 가져오지만, 이미 사라진 과거 답변은 복원할 수 없습니다.\n- 넘기기는 답변이 아니므로 나중에 다시 나올 수 있습니다. 미접속 질문은 쌓이지 않습니다.\n- 나이·성별·신체정보는 가중치로 추정하지 않습니다. 드롭다운에서 선택한 실제 값이 설정에 저장됩니다. 같은 정보의 다른 질문 변형도 답변 후 제외합니다.\n- 타투 질문의 첫 두 행동만 타투 존재와 태도를 설정합니다. 나머지 행동은 타투를 생성하지 않습니다. 타투가 있어야 위치 질문, 위치 답변 후 문양 질문이 무작위 후보에 추가됩니다. 즉시 연달아 강제로 띄우지 않습니다. 타투가 여러 개면 이 흐름은 첫 번째 타투를 다룹니다.\n- 직접 수정하거나 잠근 항목은 질문으로 덮어쓰지 않습니다. 기존 v1/구형 캐릭터의 새 정보 항목은 잠금 상태를 확인한 후 풀어 주세요.\n- 각 질문의 애니메이션은 로그 장면과 같은 움직임을 사용합니다. 움직임 줄이기/끄기 설정을 따릅니다.\n\n';
for(const [i,q] of events.entries()){
 text+=`## ${i+1}. ${q.question.ko}\n\nID: ${q.id} · 애니메이션: ${q.animation}\n\n`;
 if(q.requires)text+='해금 조건: '+(q.requires.tattoo?'타투가 실제로 있음':q.requires.answered?'다음 질문에 답변함: '+q.requires.answered:'다음 정보가 있음: '+q.requires.known)+'\n\n';
 if(q.options){text+='저장 필드: `'+q.field+'`\n\n드롭다운: '+(q.options.length>30?q.options[0].value+' ~ '+q.options.at(-1).value+' (1 단위)':q.options.map(o=>o.text.ko).join(' / '))+'\n\n';}
 text+='| 선택 후보 | 적용 내용 |\n|---|---|\n';
 for(const choice of q.choices){let effects=Object.entries(choice.effects).map(([f,w])=>`${f==='impulseControl'?'충동성':DISCOVERY_AXES[f].label} ${typeof w==='number'?(w>0?'+':'')+w:'→ '+DISCOVERY_AXES[f].values[w.toward]+' +'+w.weight}`);if(choice.tattoo)effects.push('타투 있음 · 태도: '+choice.tattoo);if(q.field)effects.push('선택한 정보를 직접 저장');text+=`| ${choice.text.ko} | ${effects.join(' / ')} |\n`;}
 text+='\n';
}
await writeFile('docs/release326-discovery-weights.md',text);
await writeFile('../앱 전달/서랍마을-326-돌발상황-선택지-가중치.md',text);
console.log('Exported',events.length,'scenes');
