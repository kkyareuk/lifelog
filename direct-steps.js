import {SOCIAL_SECTIONS,workTasks} from './social-activities.js?v=20260909dev296';
export function installDirectSteps(command,copy,character){
 command.classList.add('direct-step-flow');
 const lang=document.documentElement.lang==='en'?1:document.documentElement.lang==='ja'?2:0;
 const text=(ko,en,ja)=>[ko,en,ja][lang];
 command.querySelector('h3')?.remove();
 const nav=command.querySelector('.direct-category-tabs');
 const social=command.querySelector('[data-direct-panel="social"]');
 const grid=social.querySelector('.direct-action-grid'),buttons=[...grid.children];if(grid.previousElementSibling?.tagName==='H4')grid.previousElementSibling.remove();grid.replaceChildren();
 const tabs=document.createElement('nav');tabs.className='direct-social-sections';grid.append(tabs);
 const panels=[];
 const heading=(node,label)=>{const h=document.createElement('h4');h.className='direct-subheading';h.textContent=label;node.append(h)};
 for(const section of SOCIAL_SECTIONS){
  const b=document.createElement('button');b.type='button';b.dataset.socialSection=section.id;b.textContent=section.labels[lang];tabs.append(b);
  const panel=document.createElement('div');panel.className='direct-action-grid';panels.push(panel);grid.append(panel);
  for(const kind of section.actions){if(section.id==='friendly'&&kind==='talk')heading(panel,text('일반 상호작용','Everyday interaction','普段の交流'));if(kind==='hangout')heading(panel,text('마음 나누기','Sharing feelings','気持ちの交流'));if(kind==='dine')heading(panel,text('함께 보내는 시간','Time together','一緒に過ごす時間'));const item=buttons.find(x=>x.dataset.directSocialAction===kind);if(item)panel.append(item)}
  b.onclick=()=>{panels.forEach(p=>p.hidden=p!==panel);tabs.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))};
 }
 tabs.firstElementChild.click();
 const refresh=()=>{const kind=command.dataset.directSocialAction;social.querySelector('[data-direct-social-submit]').disabled=!kind||!command.dataset.directTarget;const topics=['talk','gossip','debate','custom_social','argue','taunt','insult','fight'].includes(kind);for(const selector of ['.direct-topic-grid','[data-direct-custom-topic]']){const node=social.querySelector(selector);node.hidden=!topics;if(node.previousElementSibling?.tagName==='H4')node.previousElementSibling.hidden=!topics}social.querySelector('[data-direct-payment-field]').hidden=!['dine','tea','drinks'].includes(kind)};
 social.addEventListener('click',refresh);refresh();
 for(const [category,groups] of Object.entries({needs:[[['위생','Hygiene','清潔'],['wash']],[['허기','Hunger','空腹'],['meal']],[['휴식','Rest','休憩'],['relax']],[['수면','Sleep','睡眠'],['nap','wake']]],hobby:[[['독서','Reading','読書'],['read']],[['음악','Music','音楽'],['music']],[['게임','Games','ゲーム'],['game']],[['창작','Creativity','創作'],['art']],[['운동·산책','Exercise and walks','運動・散歩'],['exercise','walk']]]})){
  const panel=command.querySelector(`[data-direct-panel="${category}"] .direct-action-grid`),items=[...panel.children];panel.replaceChildren();for(const [labels,kinds] of groups){heading(panel,labels[lang]);for(const kind of kinds)panel.append(items.find(b=>b.dataset.directSimpleAction===kind))}
 }
 const work=command.querySelector('[data-direct-panel="work"] .direct-action-grid');work.replaceChildren();heading(work,character.jobTitle||character.job||text('진로·일상 업무','Career and daily tasks','進路・日常の仕事'));for(const task of workTasks(character)){const b=document.createElement('button');b.type='button';b.dataset.directSimpleAction='work';b.dataset.workTask=task.id;b.textContent=task.labels[lang];work.append(b)}
 command.querySelectorAll('[data-direct-category]').forEach(b=>b.addEventListener('click',()=>{command.querySelectorAll('[data-direct-panel]').forEach(p=>p.hidden=p.dataset.directPanel!==b.dataset.directCategory);nav.querySelectorAll('button').forEach(x=>x.setAttribute('aria-expanded',String(x===b)))}));
 command.querySelector('[data-direct-category="needs"]').click();
}
