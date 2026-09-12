const reasons={'too-kind':'너무 착하거나 양보함','too-harsh':'너무 거칠거나 공격적','too-passive':'너무 소극적','too-bold':'너무 적극적·충동적',tone:'말투·감정 표현',context:'관계·캐릭터 설정', 'missing-action':'원하는 행동 없음',other:'기타'};
function formatFitReport(report){
 let data;try{data=JSON.parse(report.message)}catch{return '기존 형식의 의견: '+String(report.message||'').slice(0,3000)}
 const choices=(data.choices||[]).map((value,index)=>typeof value==='string'?{index,text:value}:value);
 return [`질문 ID: ${data.questionId||'미상'}`,`질문: ${data.prompt||''}`,'당시 답변:',...choices.map(c=>`${Number(c.index)+1}. ${c.text}`),`요구: ${(data.reasonIds||[]).map(id=>reasons[id]||id).join(' / ')||'이유 선택 없는 이전 버전'}`,`가까운 답변: ${(data.closestAnswerIndices||[]).map(i=>`${Number(i)+1}. ${choices.find(c=>c.index===i)?.text||''}`).join(' / ')||'선택 없음'}`,`추가 설명: ${data.note||'없음'}`,data.selectedOption?`질문 안에서 고른 항목: ${data.selectedOption.text}`:'',`언어: ${data.language||'미상'} / 빌드: ${data.build||'미상'}`].filter(Boolean).join('\n');
}
module.exports={formatFitReport};
