import {careerAssignments,workScheduleFor,validWorkSchedule} from './career-work.js';
import {careersFor} from './career-world.js';
import {careerLabel} from './career-catalog.js';
import {save,touchCharacterTimelines} from './state.js?v=20260909dev305';
export function openWorkSchedule(world,c,snapshot,onSaved){
 const language=world.uiLanguage||'ko',t=(ko,en,ja)=>({ko,en,ja}[language]||ko),dialog=document.createElement('dialog');dialog.className='career-dialog';
 const body=document.createElement('section');body.className='career-body';const heading=document.createElement('h2');heading.textContent=t('근무 일정 직접 정하기','Set work schedule','勤務予定を設定');body.append(heading);
 const inputs=[];
 for(const entry of careerAssignments(world,c)){
  const job=careersFor(world).find(j=>j.id===entry.jobId),rank=job?.ranks.find(r=>r.id===entry.rankId),section=document.createElement('section');section.className='career-rank';const title=document.createElement('h3');title.textContent=[careerLabel(job,language),careerLabel(rank,language)].filter(Boolean).join(' · ');section.append(title);
  const value=workScheduleFor(c,entry),checks=[],days=document.createElement('div');days.className='career-weekdays';
  t('일 월 화 수 목 금 토','Sun Mon Tue Wed Thu Fri Sat','日 月 火 水 木 金 土').split(' ').forEach((name,day)=>{const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=value.days.includes(day);label.append(input,document.createTextNode(name));days.append(label);checks.push(input)});section.append(days);
  const time=(name,v)=>{const label=document.createElement('label'),input=document.createElement('input');label.textContent=name;input.type='time';input.required=true;input.value=v;label.append(input);section.append(label);return input};
  const start=time(t('출근 시각','Shift starts','出勤時刻'),value.start),end=time(t('퇴근 시각','Shift ends','退勤時刻'),value.end);inputs.push({entry,checks,start,end});body.append(section);
 }
 const status=document.createElement('p');status.setAttribute('role','status');body.append(status);
 const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;body.append(b);return b};
 const persist=async reset=>{
  const next=reset?Object.fromEntries(careerAssignments(world,c).map(e=>[e.id,'default'])):{...c.careerSchedules};if(!reset)for(const row of inputs){const value={days:row.checks.flatMap((v,i)=>v.checked?[i]:[]),start:row.start.value,end:row.end.value};if(!validWorkSchedule(value)){status.textContent=t('근무 요일과 서로 다른 시작·종료 시각을 확인해 주세요.','Check workdays and distinct start/end times.','勤務曜日と異なる開始・終了時刻を確認してください。');return}next[row.entry.id]=value}
  const controls=[...body.querySelectorAll('input,button')];controls.forEach(n=>n.disabled=true);status.textContent=t('관공서에 서류 제출하는 중…','Submitting paperwork at the municipal office…','役所に書類を提出しています…');
  const previous=c.careerSchedules;
  try{if(snapshot){const api=window.DrawerVillageGroups,live=api.getSnapshot();if(live.activeGroupId!==snapshot.activeGroupId)throw Error('context');const record=live.residents.find(r=>r.id===c.id);if(record?.ownerUid!==window.ParallelCityAuth?.getInfo?.()?.user?.uid)throw Error('owner');const profile=JSON.parse(record.profileJson||'{}');await api.saveResident({groupId:snapshot.activeGroupId,id:c.id,profile:{...profile,careerSchedules:next}});record.profileJson=JSON.stringify({...profile,careerSchedules:next});c.careerSchedules=next}else{c.careerSchedules=next;touchCharacterTimelines([c.id]);if(!await save(true))throw Error('save')}
   dialog.close();onSaved?.();
  }catch{c.careerSchedules=previous;status.textContent=t('저장하지 못했어요. 다시 시도해 주세요.','Could not save. Please retry.','保存できませんでした。再試行してください。');controls.forEach(n=>n.disabled=false)}
 };
 button(t('저장','Save','保存'),()=>persist(false)).disabled=!inputs.length;
 button(t('직업 기본 일정 사용','Use career defaults','職業の標準予定に戻す'),()=>persist(true));button(t('닫기','Close','閉じる'),()=>dialog.close());dialog.append(body);dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();return dialog;
}
