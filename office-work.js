// A deterministic work deck: stable across reloads, with no repeated task until
// the role's deck is exhausted. Rendering never writes to the save or payroll.
const hash=s=>[...s].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
const row=(ko,en,ja,meeting=false)=>({ko,en,ja,meeting});
const junior=[
 row('받은 요청의 마감일을 확인하고 처리 순서를 정하고 있어요.','Checking request deadlines and ordering the work.','依頼の締切を確認し、作業の順番を決めています。'),
 row('자료의 숫자를 원본과 대조하며 입력 오류를 고치고 있어요.','Comparing figures with source records and correcting entry errors.','資料の数字を原本と照合し、入力ミスを直しています。'),
 row('보고서 초안에 근거 자료의 출처를 붙이고 있어요.','Adding source references to a draft report.','報告書の下書きに根拠資料の出典を添えています。'),
 row('수정 요청을 읽고 문서에서 바뀐 부분을 표시하고 있어요.','Reading revision requests and marking changes in a document.','修正依頼を読み、文書の変更箇所に印をつけています。'),
 row('누락된 첨부 파일을 확인하고 담당자에게 요청하고 있어요.','Checking missing attachments and requesting them from the person responsible.','不足している添付資料を確認し、担当者に依頼しています。'),
 row('회의에서 결정한 일과 담당자, 기한을 기록하고 있어요.','Recording meeting decisions, owners and deadlines.','会議の決定事項、担当者、期限を記録しています。',true),
 row('답변 초안을 작성하고 보내기 전에 받는 사람을 확인하고 있어요.','Drafting a reply and checking its recipients before sending.','返信の下書きを作り、送信前に宛先を確認しています。'),
 row('공유 폴더의 문서 제목과 버전을 정리하고 있어요.','Organizing document names and versions in the shared folder.','共有フォルダの文書名と版を整理しています。'),
 row('진행표에 완료한 항목과 아직 확인이 필요한 항목을 구분하고 있어요.','Separating completed tasks from items still awaiting confirmation.','進捗表で完了した項目と確認待ちの項目を分けています。'),
 row('선배에게 막힌 부분을 보여 주고 해결 방법을 메모하고 있어요.','Showing a colleague where the work is blocked and noting their advice.','先輩に行き詰まった箇所を見せ、解決方法をメモしています。'),
 row('회의 자료를 순서대로 묶고 빠진 페이지가 없는지 살피고 있어요.','Putting meeting materials in order and checking for missing pages.','会議資料を順にまとめ、抜けたページがないか確認しています。'),
 row('업무 지침을 읽으며 제출 양식의 필수 항목을 채우고 있어요.','Reading the procedure and filling in the required form fields.','業務手順を読みながら提出書式の必須項目を埋めています。')
];
const lead=[
 row('팀원의 업무량과 마감일을 비교하며 담당 업무를 조정하고 있어요.','Balancing team assignments against workloads and deadlines.','チームの作業量と締切を比べ、担当業務を調整しています。'),
 row('제출된 보고서의 수치와 결론이 맞는지 검토하고 있어요.','Checking that a submitted report’s conclusions match its figures.','提出された報告書の数字と結論が合っているか確認しています。'),
 row('지연된 업무의 원인을 듣고 필요한 지원을 정하고 있어요.','Reviewing a delay and deciding what support is needed.','業務が遅れた原因を聞き、必要な支援を決めています。',true),
 row('다른 부서와 일정이 겹치는 부분을 조율하고 있어요.','Coordinating conflicting schedules with another department.','他部署と日程が重なる部分を調整しています。',true),
 row('팀 회의에서 쟁점을 정리하고 다음 담당자와 기한을 확인하고 있어요.','Clarifying issues, task owners and deadlines in a team meeting.','チーム会議で論点を整理し、次の担当者と期限を確認しています。',true),
 row('결재 요청의 증빙과 비용 내역을 대조하고 있어요.','Comparing an approval request with its supporting cost records.','決裁申請の証拠資料と費用の内訳を照合しています。'),
 row('신입이 만든 초안을 함께 보며 수정 이유를 설명하고 있어요.','Reviewing a new colleague’s draft and explaining the revisions.','新人の下書きを一緒に見て、修正する理由を説明しています。'),
 row('상부에 보고할 진행 상황과 위험 요소를 추리고 있어요.','Selecting progress updates and risks for management reporting.','上司に報告する進捗とリスクを絞り込んでいます。'),
 row('재작업이 생긴 과정을 살피고 점검 항목을 보완하고 있어요.','Reviewing why rework was needed and improving the checklist.','手戻りが起きた工程を調べ、確認項目を補っています。'),
 row('이번 주 목표와 실제 진행률의 차이를 확인하고 있어요.','Comparing this week’s targets with actual progress.','今週の目標と実際の進捗との差を確認しています。'),
 row('휴가와 부재 일정을 살피며 업무 공백을 메우고 있어요.','Arranging coverage around planned absences.','休暇や不在の予定を見て、業務の空白を埋めています。'),
 row('회의 안건에서 결정할 사항과 공유할 사항을 나누고 있어요.','Separating decisions from updates in the meeting agenda.','会議の議題を決定事項と共有事項に分けています。')
];
const executive=[
 row('부서별 실적과 비용을 대조하며 차이가 난 이유를 묻고 있어요.','Comparing departmental results and costs and asking about variances.','部署別の実績と費用を比べ、差が出た理由を尋ねています。',true),
 row('신규 사업의 예상 수익과 손실 가능성을 검토하고 있어요.','Reviewing a proposed business’s expected returns and downside risks.','新規事業の予想収益と損失の可能性を検討しています。'),
 row('인력 요청을 검토하며 채용과 내부 배치의 우선순위를 정하고 있어요.','Reviewing staffing requests and prioritizing hiring or reassignment.','人員の要請を検討し、採用と社内配置の優先順位を決めています。'),
 row('부서 간 의견이 갈린 사안의 판단 근거를 듣고 있어요.','Hearing the reasons behind conflicting departmental proposals.','部署間で意見が分かれた案件の判断根拠を聞いています。',true),
 row('계약의 책임 범위와 위험 조항을 담당 부서와 확인하고 있어요.','Reviewing contractual responsibilities and risk clauses with the relevant team.','契約の責任範囲とリスク条項を担当部署と確認しています。',true),
 row('예산 집행 현황을 살피고 조정이 필요한 항목을 표시하고 있어요.','Reviewing budget spending and flagging items needing adjustment.','予算の執行状況を見て、調整が必要な項目に印をつけています。'),
 row('장기 목표에 맞춰 이번 분기의 핵심 과제를 추리고 있어요.','Choosing quarterly priorities that support long-term goals.','長期目標に合わせて今期の重点課題を絞っています。'),
 row('현장 책임자의 보고를 듣고 추가 확인할 질문을 정리하고 있어요.','Listening to operational reports and preparing follow-up questions.','現場責任者の報告を聞き、追加で確認する質問を整理しています。',true),
 row('사업 계획의 낙관적인 가정을 짚고 대안도 함께 검토하고 있어요.','Challenging optimistic assumptions in a business plan and reviewing alternatives.','事業計画の楽観的な前提を指摘し、代替案も検討しています。'),
 row('결정된 방침을 부서장에게 전달할 설명 자료를 다듬고 있어요.','Refining briefing notes explaining decisions to department heads.','決定した方針を部門長に伝える説明資料を整えています。'),
 row('주요 거래처와 협의할 조건과 양보 가능한 범위를 정하고 있어요.','Setting negotiation terms and acceptable concessions for a key client.','主要取引先との交渉条件と譲歩できる範囲を決めています。'),
 row('지난 회의의 후속 조치가 실행됐는지 책임자와 점검하고 있어요.','Checking follow-up actions from the previous meeting with their owners.','前回の会議の対応事項が実行されたか責任者と確認しています。',true)
];
const decks={junior,lead,executive};
const titles={
 junior:[['요청 우선순위를 정하는 중','Prioritizing requests','依頼の優先順位を整理中'],['입력 자료를 대조하는 중','Checking data entries','入力資料を照合中'],['보고서 출처를 정리하는 중','Adding report references','報告書の出典を整理中'],['문서 수정 사항을 반영하는 중','Revising a document','文書の修正を反映中'],['누락된 자료를 요청하는 중','Requesting missing files','不足資料を依頼中'],['회의록을 작성하는 중','Taking meeting minutes','議事録を作成中'],['업무 답변을 작성하는 중','Drafting a work reply','業務の返信を作成中'],['공유 문서를 정리하는 중','Organizing shared documents','共有文書を整理中'],['업무 진행표를 갱신하는 중','Updating the task tracker','進捗表を更新中'],['선배에게 업무를 확인하는 중','Checking a task with a colleague','先輩に業務を確認中'],['회의 자료를 준비하는 중','Preparing meeting materials','会議資料を準備中'],['제출 양식을 작성하는 중','Completing a submission form','提出書式を記入中']],
 lead:[['팀 업무를 배분하는 중','Assigning team work','チームの業務を配分中'],['보고서를 검토하는 중','Reviewing a report','報告書を確認中'],['지연 업무를 점검하는 중','Reviewing delayed work','遅れている業務を確認中'],['부서 간 일정을 조율하는 중','Coordinating department schedules','部署間の日程を調整中'],['팀 회의를 진행하는 중','Leading a team meeting','チーム会議を進行中'],['결재 증빙을 확인하는 중','Checking approval documents','決裁の証拠資料を確認中'],['신입의 초안을 검토하는 중','Reviewing a junior colleague’s draft','新人の下書きを確認中'],['진행 상황을 보고하는 중','Preparing a progress report','進捗報告を準備中'],['업무 절차를 개선하는 중','Improving a work process','業務手順を改善中'],['주간 목표를 점검하는 중','Checking weekly targets','週間目標を確認中'],['부재 중 업무를 조정하는 중','Arranging absence cover','不在時の業務を調整中'],['회의 안건을 정리하는 중','Preparing a meeting agenda','会議の議題を整理中']],
 executive:[['부서별 실적을 검토하는 중','Reviewing department results','部署別の実績を検討中'],['신규 사업을 검토하는 중','Reviewing a proposed business','新規事業を検討中'],['인력 계획을 검토하는 중','Reviewing staffing plans','人員計画を検討中'],['부서 간 쟁점을 조율하는 중','Resolving departmental issues','部署間の論点を調整中'],['계약 위험을 검토하는 중','Reviewing contract risks','契約リスクを検討中'],['예산 집행을 점검하는 중','Reviewing budget spending','予算の執行を確認中'],['분기 전략을 정리하는 중','Setting quarterly priorities','今期の重点課題を整理中'],['현장 보고를 듣는 중','Hearing operational reports','現場報告を聞いているところ'],['사업 계획의 가정을 검토하는 중','Testing business assumptions','事業計画の前提を検討中'],['경영 방침을 전달하는 중','Preparing a management briefing','経営方針の説明を準備中'],['거래처 협상 조건을 정하는 중','Preparing negotiation terms','取引先との交渉条件を整理中'],['경영 회의 후속 조치를 확인하는 중','Checking management follow-ups','経営会議の対応事項を確認中']]
};
export function officeEmployment(c,id=''){
 const jobs=c.wallet?.employments||[c.wallet?.employment].filter(Boolean);
 const e=id?jobs.find(e=>e.id===id):jobs[0];
 if(e)return e.jobId==='builtin-office'?e:null;
 return !jobs.length&&['회사원','CEO'].includes(c.job)?{id:'legacy-builtin-office',jobId:'builtin-office',rankId:c.job==='CEO'?'ceo-rank-1':'rank-1'}:null;
}
export function officeDuty(c,date,start,end,language='ko',employmentId=''){
 const e=officeEmployment(c,employmentId);if(!e)return null;
 const minute=date.getHours()*60+date.getMinutes()+date.getSeconds()/60;
 if(minute<start||minute>=end)return null;
 const role=/director|executive|president|ceo/.test(e.rankId)?'executive':/^rank-[345]/.test(e.rankId)?'lead':'junior';
 const pool=decks[role].map((v,i)=>({...v,id:role+'-'+i}));
 let seed=hash(c.id+':'+e.id+':'+role);for(let i=pool.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}
 // Global slots ensure the recent sequence survives reloading and midnight.
 const slot=Math.floor(date.getTime()/2700000),task=pool[((slot%pool.length)+pool.length)%pool.length];
 const copy=(ko,en,ja)=>({ko,en,ja}[language]||ko);
 const arriving=minute-start<10,leaving=end-minute<=10;
 const desc=arriving?copy('자리에 앉아 일정과 전달 사항을 확인하고 오늘 처리할 일을 준비하고 있어요.','Settling in, checking the schedule and handover notes, and preparing today’s work.','席につき、予定と引継ぎ事項を確認して今日の仕事を準備しています。'):leaving?copy('진행 상황을 남기고 미완료 업무의 다음 순서를 정리하며 퇴근을 준비하고 있어요.','Recording progress and next steps for unfinished tasks before leaving.','進捗と未完了の仕事の次の手順を残し、退勤の準備をしています。'):task[language]||task.ko;
 const title=arriving?copy('출근해 업무를 준비하는 중','Preparing for the workday','出勤して仕事の準備中'):leaving?copy('업무를 마감하는 중','Wrapping up the workday','仕事を締めくくっているところ'):copy(...titles[role][Number(task.id.split('-').at(-1))]);
 return {title,desc,officeTaskId:arriving?'arrival':leaving?'closing':task.id,officeRole:role,officeRoom:!arriving&&!leaving&&task.meeting?'meeting':'workspace',economyWork:true};
}
