import fs from "node:fs";
import vm from "node:vm";
import {dictionaryCopy} from "../dictionary-copy.js";

const source=fs.readFileSync(new URL("../views.js",import.meta.url),"utf8");
const mapStart=source.indexOf("const UI_TEXT=");
const dynamicStart=source.indexOf("const UI_DYNAMIC_TEXT=");
const prelude=source.slice(mapStart,dynamicStart)
  .replace("const UI_TEXT=","UI_TEXT=")
  .replace("const UI_TEXT_MORE=","UI_TEXT_MORE=");
const context=vm.createContext({UI_TEXT:undefined,UI_TEXT_MORE:undefined,I18N:undefined,dictionaryCopy});
// The direct t() dictionary and the DOM translation dictionary are both used
// at runtime. Counting only UI_TEXT falsely reports translated labels missing.
const directEnd=source.indexOf("const t=");
vm.runInContext(source.slice(source.indexOf("const I18N="),directEnd).replace("const I18N=","I18N="),context);
for(const match of source.slice(directEnd).matchAll(/Object\.assign\(I18N\.(?:en|ja),\{[\s\S]*?\}\);/g))vm.runInContext(match[0],context);
vm.runInContext(`${prelude}\nObject.assign(UI_TEXT.en,UI_TEXT_MORE.en);Object.assign(UI_TEXT.ja,UI_TEXT_MORE.ja);`,context);
for(const match of source.slice(dynamicStart).matchAll(/Object\.assign\(UI_TEXT\.(?:en|ja),\{[\s\S]*?\}\);/g)){
  vm.runInContext(match[0],context);
}

let runtimeSource=source.slice(dynamicStart)+"\n"+fs.readFileSync(new URL("../dictionary.js",import.meta.url),"utf8");
runtimeSource=runtimeSource.replace(/Object\.assign\(UI_TEXT\.(?:en|ja),\{[\s\S]*?\}\);/g,"");
runtimeSource=runtimeSource.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"");
const candidates=new Set();
const add=value=>{
  const text=String(value||"").replace(/&[a-z]+;/gi," ").replace(/\s+/g," ").trim();
  if(text.length>1&&/[가-힣]/.test(text)&&
    !/^(?:[.#\[]|https?:|data:)/.test(text)&&
    !/[{}]|=>|\|\||\.replace\(|\.test\(|<\/?[a-z]/i.test(text))candidates.add(text);
};
let cursor=0;
const addTemplateText=value=>{
  if(!value.includes("<"))return;
  for(const match of value.matchAll(/(?:aria-label|placeholder|title)="([^"]+)"/g))add(match[1]);
  value.split(">").forEach((part,index)=>{
    if(index===0&&/[=<]/.test(part))return;
    add(part.split("<")[0]);
  });
};
function scanQuoted(quote){
  cursor++;
  let value="";
  while(cursor<runtimeSource.length){
    const character=runtimeSource[cursor++];
    if(character==="\\"){
      if(cursor<runtimeSource.length)value+=runtimeSource[cursor++];
      continue;
    }
    if(character===quote)break;
    value+=character;
  }
  add(value);
}
function scanTemplate(){
  cursor++;
  let raw="";
  while(cursor<runtimeSource.length){
    const character=runtimeSource[cursor++];
    if(character==="\\"){
      if(cursor<runtimeSource.length)raw+=runtimeSource[cursor++];
      continue;
    }
    if(character==="`"){addTemplateText(raw);return}
    if(character==="$"&&runtimeSource[cursor]==="{"){
      addTemplateText(raw);raw="";cursor++;scanCode("}");continue;
    }
    raw+=character;
  }
}
function scanCode(end=""){
  while(cursor<runtimeSource.length){
    const character=runtimeSource[cursor];
    if(end&&character===end){cursor++;return}
    if(character==='"'||character==="'"){scanQuoted(character);continue}
    if(character==="`"){scanTemplate();continue}
    if(character==="/"&&runtimeSource[cursor+1]==="/"){
      cursor=runtimeSource.indexOf("\n",cursor+2);
      if(cursor<0){cursor=runtimeSource.length;return}
      continue;
    }
    if(character==="/"&&runtimeSource[cursor+1]==="*"){
      const close=runtimeSource.indexOf("*/",cursor+2);
      cursor=close<0?runtimeSource.length:close+2;
      continue;
    }
    if(character==="{"){cursor++;scanCode("}");continue}
    cursor++;
  }
}
scanCode();
// Include the independently loaded dictionary module's exact UI labels.
Object.keys(dictionaryCopy.en).forEach(add);
const translations={en:{...context.UI_TEXT.en,...context.I18N.en},ja:{...context.UI_TEXT.ja,...context.I18N.ja}};
for(const language of ["en","ja"]){
  const translated=[...candidates].filter(text=>translations[language][text]);
  const missing=[...candidates].filter(text=>!translations[language][text]).sort((a,b)=>a.localeCompare(b,"ko"));
  const percent=candidates.size?translated.length/candidates.size*100:100;
  console.log(`${language.toUpperCase()} ${translated.length}/${candidates.size} (${percent.toFixed(1)}%)`);
  const sampleLimit=process.argv.includes("--all")?missing.length:20;
  console.log(`missing sample: ${missing.slice(0,sampleLimit).join(" | ")}`);
}
