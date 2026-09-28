const duties=[
 ['항해 지도를 검토하는 중','책상에 지도를 펼쳐 다음 항로와 들를 항구를 살피고 있어요.','Reviewing navigation charts','They spread charts across the desk and plan their next route and ports.','航海図を検討中','机に地図を広げ、次の航路と寄港地を検討しています。'],
 ['항해일지를 정리하는 중','지난 항해의 기록을 읽고 빠뜨린 내용을 집에서 정리하고 있어요.','Organizing the ship’s log','At home, they review past voyages and fill in missing notes.','航海日誌を整理中','家で過去の航海記録を読み、書き残した内容を整理しています。'],
 ['보급품 목록을 만드는 중','다음 출항에 필요한 식량과 식수의 수량을 계산하고 있어요.','Planning supplies','They calculate the food and water needed for the next voyage.','補給品の一覧を作成中','次の出航に必要な食料と飲み水の量を計算しています。'],
 ['선원에게 보낼 편지를 쓰는 중','함께 항해할 동료에게 일정과 준비할 일을 적어 보내려 해요.','Writing to the crew','They write to their shipmates about the schedule and preparations.','船員への手紙を書いているところ','仲間に日程と準備することを手紙で伝えようとしています。'],
 ['수입과 지출을 계산하는 중','집에서 장부를 펴고 지난 항해의 수입과 수리비를 정리하고 있어요.','Balancing the voyage accounts','At home, they review voyage earnings and repair costs in their ledger.','航海の収支を計算中','家で帳簿を開き、前の航海の収入と修理費を整理しています。'],
 ['항해 자료를 읽는 중','책상에서 해류와 계절풍에 관한 자료를 읽고 중요한 내용을 적고 있어요.','Reading sailing references','At the desk, they read about currents and seasonal winds and take notes.','航海資料を読んでいるところ','机で海流や季節風の資料を読み、大切な内容を書き留めています。']
];
export function pirateHomeDuty(c,date,start,end,language='ko'){
 const day=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime(),minute=(date.getTime()-day)/60000;
 const slot=Math.floor((minute-start)/30),seed=[...c.id].reduce((n,ch)=>n+ch.charCodeAt(0),0),index=(slot+seed)%duties.length,row=duties[index];
 const localizedCopy=Object.fromEntries(['ko','en','ja'].map((lang,i)=>[lang,{title:row[i*2],desc:row[i*2+1]}]));
 return {...(localizedCopy[language]||localizedCopy.ko),localizedCopy,jobLogId:`pirate:home:${index}`,jobLogPhase:'work',jobLogStartsAt:day+(start+slot*30)*60000,jobLogEndsAt:day+Math.min(end,start+(slot+1)*30)*60000,officeTaskId:`job:pirate:home:${index}`,officeRole:'builtin-pirate',officeRoom:'workspace',economyWork:true};
}
