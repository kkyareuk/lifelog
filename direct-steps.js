import {SOCIAL_SECTIONS} from './social-activities.js?v=20260909dev293';
// Keep one live dialog and preserve form nodes while moving between choices.
export function installDirectSteps(command,copy){
 command.classList.add('direct-step-flow');
 const nav=command.querySelector('.direct-category-tabs'),heading=command.querySelector('h3');
 const back=document.createElement('button');back.type='button';back.className='direct-step-back';
 back.textContent=({ko:'‹ 뒤로',en:'‹ Back',ja:'‹ 戻る'}[document.documentElement.lang]||'‹ 뒤로');back.hidden=true;command.prepend(back);
 let active=null,child=null;
 const home=()=>{command.querySelectorAll('[data-direct-panel]').forEach(p=>p.hidden=true);nav.hidden=false;heading.hidden=false;back.hidden=true;active=null;child=null};
 const social=command.querySelector('[data-direct-panel="social"]');
 const lang=document.documentElement.lang==='en'?1:document.documentElement.lang==='ja'?2:0;
 const actionGrid=social?.querySelector('.direct-action-grid');
 if(actionGrid){const buttons=[...actionGrid.children];actionGrid.replaceChildren();const categories=document.createElement('nav');categories.className='direct-social-sections';actionGrid.append(categories);const panels=[];
 for(const section of SOCIAL_SECTIONS){const button=document.createElement('button');button.type='button';button.textContent=section.labels[lang];button.dataset.socialSection=section.id;categories.append(button);const panel=document.createElement('div');panel.className='direct-action-grid';panel.hidden=true;actionGrid.append(panel);panels.push(panel);for(const kind of section.actions){const item=buttons.find(b=>b.dataset.directSocialAction===kind);if(item)panel.append(item)}button.onclick=()=>{panels.forEach(p=>p.hidden=p!==panel);categories.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));panel.hidden=false}}}
 const groups=[['[data-direct-target-list]',copy.target],['.direct-action-grid',copy.command],['.direct-gossip-subject',copy.subject],['.direct-topic-grid',copy.topic]];
 const sections=[];
 for(const [selector,label] of groups){const node=social?.querySelector(selector);if(!node)continue;
  const title=node.previousElementSibling;if(title?.tagName==='H4')title.remove();
  const open=document.createElement('button');open.type='button';open.className='direct-step-choice';open.textContent=label;
  node.before(open);node.hidden=true;sections.push({node,open,label});
  open.onclick=()=>{child=node;[...social.children].forEach(n=>n.hidden=n!==node);node.hidden=false;const payment=social.querySelector('[data-direct-payment-field]');if(payment)payment.hidden=!['dine','tea','drinks'].includes(command.dataset.directSocialAction);social.scrollTop=0};
  node.addEventListener('click',event=>{const b=event.target.closest('button');if(!b||b.dataset.socialSection)return;open.textContent=label+' · '+b.textContent;restore()});
 }
 const restore=()=>{child=null;if(!social)return;[...social.children].forEach(n=>n.hidden=true);for(const section of sections)section.open.hidden=false;const submit=social.querySelector('[data-direct-social-submit]');if(submit){submit.hidden=false;submit.disabled=!command.dataset.directTarget||!command.dataset.directSocialAction}const custom=social.querySelector('[data-direct-custom-topic]');if(custom)custom.hidden=!['talk','gossip','debate','custom_social','argue','taunt','insult','fight'].includes(command.dataset.directSocialAction);for(const section of sections){section.node.hidden=true;section.open.hidden=section.node.matches('.direct-gossip-subject')?command.dataset.directSocialAction!=='gossip':section.node.matches('.direct-topic-grid')?!['talk','gossip','debate','custom_social','argue','taunt','insult','fight'].includes(command.dataset.directSocialAction):false}const payment=social.querySelector('[data-direct-payment-field]');if(payment)payment.hidden=!['dine','tea','drinks'].includes(command.dataset.directSocialAction);social.scrollTop=0};
 command.querySelectorAll('[data-direct-category]').forEach(b=>b.addEventListener('click',()=>{active=command.querySelector(`[data-direct-panel="${b.dataset.directCategory}"]`);command.querySelectorAll('[data-direct-panel]').forEach(p=>p.hidden=p!==active);nav.hidden=true;heading.hidden=true;back.hidden=false;if(active===social)restore();command.scrollTop=0}));
 back.onclick=()=>child?restore():home();
 command.closest('dialog')?.addEventListener('cancel',event=>{if(active){event.preventDefault();back.click()}});
}
