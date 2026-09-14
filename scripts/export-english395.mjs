import {relationshipMailRows} from '../relationship-letters.js';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {ENGLISH_PUSH_DRAFTS,ENGLISH_PUSH_NAMES,ENGLISH_PUSH_STYLE_MAP} from '../speech-english394.js';
import {PUSH_KEYS,LETTER_KEYS,REVIEWED_PUSH,reviewedPush,relationshipLetterCopy} from '../speech-reviewed.js';
import {SPEECH_STYLE_OPTIONS,effectiveSpeechStyle,characterQuestionPrompt,characterPlanSpeech,characterContactSpeech,speechStyleExample} from '../speech-styles.js';
const paths=process.argv.slice(2);assert.equal(paths.length,3,'Pass the three original English draft paths.');
const originals={};
for(const path of paths){const source=await readFile(path,'utf8');for(const m of source.matchAll(/^## `([^`]+)` ([^\n]+)\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)){
 const [_,id,name,body]=m;const rows=body.split(/\r?\n/).flatMap(line=>/^- (Now|Afternoon|Evening|Weekend|Food|Work|Morning|Midday) — /.test(line)?[line.split(' — ').slice(1).join(' — ')]:/^\d+\. /.test(line)?[line.replace(/^\d+\. /,'')]:[]);assert.equal(rows.length,22,id);originals[id]={name:name.trim(),rows};
}}
assert.equal(Object.keys(originals).length,37);
const tokens={language:'en',target:'{상대}',item:'{물건}',food:'{음식}',drink:'{음료}'};
const groups=Object.entries(originals).map(([id,source])=>{const style=ENGLISH_PUSH_STYLE_MAP[id],current=ENGLISH_PUSH_DRAFTS[id];assert.equal(current.length,22);return {id,name:ENGLISH_PUSH_NAMES[id],sourceName:source.name,style:style||null,active:!!style,rows:PUSH_KEYS.map((key,i)=>{const text=style?reviewedPush({speechStyle:style},key,tokens):current[i];return {key,original:source.rows[i],text,changed:source.rows[i]!==text}})};});
const active=groups.filter(x=>x.active),pending=groups.filter(x=>!x.active),changes=active.flatMap(g=>g.rows.filter(r=>r.changed).map(r=>({id:g.id,name:g.name,...r})));
// Enumerate runtime relationship templates and finite UI samples, not all game English.
const voices=SPEECH_STYLE_OPTIONS.filter(s=>s!==SPEECH_STYLE_OPTIONS[0]).map(style=>{
 const c={speechStyle:style},copy=kind=>relationshipMailRows({uiLanguage:'en',characters:{a:{...c,id:'a',name:'{화자}'},b:{id:'b',name:'{상대}'}},relationshipDevelopment:{pair:{letters:[{a:'a',b:'b',kind,status:'pending'}]}}})[0].body;
 return {style,name:ENGLISH_PUSH_NAMES[Object.keys(ENGLISH_PUSH_STYLE_MAP).find(k=>ENGLISH_PUSH_STYLE_MAP[k]===style)]||style,letters:LETTER_KEYS.map(kind=>({kind,text:copy(kind)})),examples:[['Question',characterQuestionPrompt(c,{language:'en',kind:'weekend'})],['Chooser example',speechStyleExample(c,{language:'en',kind:'weekend'})],['Plan',characterPlanSpeech(c,'en')],['Contact wrapper example',characterContactSpeech(c,'{기본 문장}',{language:'en'})]]};
});
const otherPush=Object.keys(REVIEWED_PUSH).filter(style=>!Object.values(ENGLISH_PUSH_STYLE_MAP).includes(style)&&SPEECH_STYLE_OPTIONS.includes(style)).map(style=>({style,rows:PUSH_KEYS.map(key=>({key,text:reviewedPush({speechStyle:style},key,tokens)}))}));
const data={version:'1.0.343 (395)',baseline:'English content from 394; 395 changes layout only',summary:{originalVoices:37,originalMessages:814,activeVoices:active.length,activeMessages:active.length*22,unchanged:active.length*22-changes.length,changed:changes.length,pendingVoices:pending.length,pendingMessages:pending.length*22,relationshipTemplates:voices.length*LETTER_KEYS.length},groups,changes,voices,otherPush};
const out=resolve('output/pdf');await mkdir(out,{recursive:true});await writeFile(resolve(out,'english-dialogue-395.json'),JSON.stringify(data,null,2));
const lines=['# 서랍마을 영어 대사 모음 · 395','', '395에서는 영어 대사를 새로 바꾸지 않았습니다. 394에 반영된 문구를 실제 코드에서 추출했습니다.', '', '범위: 첨부 영어 푸시 원고37종 전체, 기존 선택지의 관계편지 템플릿, 말투 선택/질문/계획/연락 예시. 앱 전체 영어 UI나 모든 생활 로그를 뜻하지 않습니다.', '', '자리표시자 {상대}/{물건}/{음식}/{음료}는 이름 삽입 전 원형입니다. 개별 캐릭터 자칭과 문맥에 따라 실제 화면은 달라질 수 있습니다. 예시는 발송 이력이 아닙니다.', '', `원고814개 중 적용${data.summary.activeMessages}개: 그대로${data.summary.unchanged}개 / 수정${changes.length}개. 미연결${pending.length*22}개.`, '', '## 원고와 달라진 문장', ''];
for(const c of changes)lines.push(`### ${c.name} · ${c.key}`,'','원문: '+c.original,'','적용: '+c.text,'');
for(const [title,list] of [['적용된 영어 푸시 원고',active],['아직 연결하지 않은 원고',pending]]){lines.push('## '+title,'');for(const g of list){lines.push(`### ${g.name} · ${g.id}`,g.style?'한국어 선택지: '+g.style:'상태: 아직 선택지에 연결되지 않음','');g.rows.forEach((r,i)=>lines.push(`${i+1}. **${r.key}** — ${r.text}`));lines.push('');}}
lines.push('## 별도 유지 중인 영어 푸시','');for(const g of otherPush){lines.push('### '+g.style,'');g.rows.forEach((r,i)=>lines.push(`${i+1}. **${r.key}** — ${r.text}`));lines.push('');}
lines.push('## 기존 선택지별 관계 편지와 예시','');for(const v of voices){lines.push(`### ${v.style} · ${v.name}`,'');v.letters.forEach(r=>lines.push(`- **${r.kind}** — ${r.text}`));v.examples.forEach(([k,v])=>lines.push(`- **${k}** — ${v}`));lines.push('');}
const md=lines.join('\n');await writeFile(resolve(out,'english-dialogue-395.md'),md);await writeFile(resolve(out,'english-dialogue-395.txt'),md);
console.log(JSON.stringify(data.summary));console.log(JSON.stringify(changes));
