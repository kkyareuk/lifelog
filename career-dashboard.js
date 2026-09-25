import {careerAvailable} from './economy-access.js';
import {careerWeeklyRoutines,careerAssignments,workScheduleFor} from './career-work.js';
import {openWorkSchedule} from './career-work-ui.js';
import {employmentsFor,salaryPreview,careerCaption,todayCareerDuty} from './salary.js';
import {careersFor,applyWorldCurrency} from './career-world.js';
import {careerLabel} from './career-catalog.js';
import {displayMoney} from './character-money.js';
import {displayImageSource} from './local-media.js?v=20260909dev305';
import {openEmployment} from './career-ui.js';

const work=r=>['업무','work'].includes(r.type);
const timeValue=s=>/^\d{2}:\d{2}$/.test(s||'')?Number(s.slice(0,2))*60+Number(s.slice(3)):null;
export function careerSchedule(world,c,now=Date.now()){
 const weekly=careerWeeklyRoutines(world,c),monthly=(world.monthlyRoutines?.[c.id]||[]).filter(work),current=new Date(now),shifts=[];
 for(let offset=-1;offset<=370;offset++){
  const day=new Date(current.getFullYear(),current.getMonth(),current.getDate()+offset),key=`${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}`;
  for(const r of [...weekly.filter(r=>Number(r.day)===day.getDay()),...monthly.filter(r=>r.date===key)]){
   const a=timeValue(r.start),b=timeValue(r.end);if(a===null||b===null)continue;
   const start=new Date(day.getFullYear(),day.getMonth(),day.getDate(),Math.floor(a/60),a%60).getTime(),end=new Date(day.getFullYear(),day.getMonth(),day.getDate()+(b<=a?1:0),Math.floor(b/60),b%60).getTime();
   if(end>now)shifts.push({start,end,routine:r});
  }
  if(shifts.length)break;
 }
 shifts.sort((a,b)=>a.start-b.start);
 return {days:[...new Set(weekly.map(r=>Number(r.day)))],next:shifts[0]||null};
}
export function careerCoworkers(world,c){return c.workplaceId&&c.workplaceId!=='home'?Object.values(world.characters||{}).filter(other=>other.id!==c.id&&other.workplaceId===c.workplaceId):[]}
function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n}
export function openCareerDashboard(world,c,snapshot=null){
 if(!careerAvailable())return;
 const lang=world.uiLanguage||'ko',tr=(ko,en,ja)=>({ko,en,ja}[lang]||ko),dialog=el('dialog',null,'career-dialog career-dashboard'),header=el('header'),close=el('button','×'),body=el('section',null,'career-body');
 close.type='button';close.setAttribute('aria-label',tr('닫기','Close','閉じる'));close.onclick=()=>dialog.close();header.append(el('h2',c.name+' · '+tr('직업','Career','職業')),close);dialog.append(header,body);dialog.onclose=()=>dialog.remove();
 applyWorldCurrency(world,c);
 const promotions=[];const jobs=employmentsFor(c);body.append(el('h3',careerCaption(world,c)||tr('등록한 직업이 없어요.','No career registered.','登録した職業はありません。')));
 for(const entry of jobs){const card=el('section',null,'career-rank'),job=careersFor(world).find(j=>j.id===entry.jobId),rank=job?.ranks.find(r=>r.id===entry.rankId),frequency=entry.frequency||'monthly',pay=salaryPreview(entry);card.append(el('h3',careerLabel(job,lang)||entry.jobName),el('p',[entry.department,careerLabel(rank,lang)||entry.rankName].filter(Boolean).join(' · ')),el('b',tr('다음 ','Next ','次回の')+({daily:tr('일급','daily pay','日給'),weekly:tr('주급','weekly pay','週給'),monthly:tr('월급','monthly pay','月給')})[frequency]+' · '+displayMoney(pay.amount,c,lang)),el('small',new Date(pay.at).toLocaleDateString(lang)));
  const next=job?.ranks[job.ranks.findIndex(r=>r.id===entry.rankId)+1];
  if(next){const promotion=el('section',null,'career-rank');promotion.append(el('h4',tr('승진에 유리한 조건','Factors that help promotion','昇進に有利な条件')));const list=el('ul');for(const copy of [[ '성과 · 맡은 업무를 꾸준히 마치기','Performance · consistently complete assigned duties','成果・担当業務を継続して完了する'],['승진 역량 · 다음 직급의 업무에 필요한 능력 기르기','Readiness · develop skills for the next rank','昇進能力・次の職階の業務に必要な力を養う'],['사내정치 · 동료·상사와 신뢰 쌓기','Workplace relationships · build trust with colleagues and supervisors','社内関係・同僚や上司との信頼を築く']])list.append(el('li',tr(...copy)));promotion.append(list,el('small',tr('다음 직급: ','Next rank: ','次の職階：')+careerLabel(next,lang)+tr(' · 현재 직급 변경은 전체설정에서 해요.',' · Change rank in full settings.','・現在の職階変更は全体設定で行えます。')));promotions.push(promotion)}body.append(card);
 }
 for(const entry of careerAssignments(world,c)){const job=careersFor(world).find(j=>j.id===entry.jobId),rank=job?.ranks.find(r=>r.id===entry.rankId),details=el('section',null,'career-rank'),schedule=workScheduleFor(c,entry);details.append(el('h3',[careerLabel(job,lang),careerLabel(rank,lang)].filter(Boolean).join(' · ')),el('small',tr('업무와 근무 시간','Duties and working hours','業務と勤務時間')),el('p',schedule.start+' – '+schedule.end));for(const duty of rank?.duties||[]){const copy=duty.copy?.[lang]||duty;details.append(el('b',copy.name),el('p',copy.description))}body.append(details)}
 const duty=todayCareerDuty(world,c);if(duty)body.append(el('h3',tr('오늘의 업무','Today’s duty','今日の業務')),el('b',duty.name),el('p',duty.description));
 const schedule=careerSchedule(world,c),section=el('section',null,'career-rank');section.append(el('h3',tr('출근 일정','Work schedule','勤務予定')));
 const weekdays=el('div',null,'career-weekdays');tr('일 월 화 수 목 금 토','Sun Mon Tue Wed Thu Fri Sat','日 月 火 水 木 金 土').split(' ').forEach((day,i)=>{const n=el('span',day,schedule.days.includes(i)?'scheduled':'');n.setAttribute('aria-label',day+' '+(schedule.days.includes(i)?tr('출근','Workday','勤務日'):tr('정기 근무 없음','No weekly shift','定期勤務なし')));weekdays.append(n)});section.append(weekdays);
 if(schedule.next){const {start,end}=schedule.next,now=Date.now(),today=new Date(),date=new Date(start),days=Math.round((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(today.getFullYear(),today.getMonth(),today.getDate()))/86400000),clock=stamp=>new Date(stamp).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',hour12:true});section.append(el('b',start<=now?tr('지금 근무 중','Working now','勤務中'):days===0?tr('오늘 출근','Work today','今日出勤'):tr(`${days}일 후 출근`,`Work in ${days} days`,`${days}日後に出勤`)),el('p',clock(start)+' – '+clock(end)))}else section.append(el('p',tr('등록된 근무 일정이 없어요. 일정에서 업무 시간을 정해 주세요.','No work shift registered. Add work hours in Schedule.','勤務予定がありません。予定で業務時間を設定してください。')));const customize=el('button',tr('직접 정하기','Set my schedule','自分で設定'));customize.type='button';customize.onclick=()=>{dialog.close();openWorkSchedule(world,c,snapshot,()=>openCareerDashboard(world,c,snapshot))};customize.disabled=!!snapshot&&c.ownerUid!==window.ParallelCityAuth?.getInfo?.()?.user?.uid;section.append(customize);body.append(section);
 body.append(el('h3',tr('동료 관계','Coworkers','同僚関係')));const grid=el('div',null,'career-coworkers');for(const other of careerCoworkers(world,c)){const item=el('article'),img=el('img');img.alt='';img.src=displayImageSource(other.photo||other.icon||'')||'./assets/home-ui/profile-placeholder.png';img.onerror=()=>{img.onerror=null;img.src='./assets/home-ui/profile-placeholder.png'};const rel=Object.values(world.relationships||{}).find(r=>{const ids=r.groupMembers?.length?r.groupMembers:[r.a,r.b];return ids.includes(c.id)&&ids.includes(other.id)});item.append(img,el('b',other.name),el('small',careerCaption(world,other)),el('small',rel?.name||rel?.type||tr('동료','Coworker','同僚')));grid.append(item)}body.append(grid);if(!grid.children.length)body.append(el('p',tr('같은 출근 장소에 등록된 동료가 없어요.','No coworkers share this workplace yet.','同じ勤務先に登録された同僚はいません。')));
 body.append(...promotions);
 const settings=el('button',tr('직업 설정 · 전체설정 3페이지','Career settings · page 3','職業設定・全体設定3ページ'));settings.onclick=()=>{dialog.close();openEmployment(world,c,snapshot)};body.append(settings);document.body.append(dialog);dialog.showModal();return dialog;
}
