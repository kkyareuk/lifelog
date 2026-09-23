import {BUILTIN_CAREERS} from './career-catalog.js';
export const careersFor=world=>[...BUILTIN_CAREERS,...(world.economy?.careers||[])];
export const economyFor=world=>({version:1,revision:0,unit:'원',mealPrice:10000,careers:[],overrides:{},...world.economy});
export function validateCareer(raw){
 const fail=()=>{throw Error('career-invalid')},text=(s,n)=>typeof s==='string'&&s.trim()&&s.length<=n;
 if(!raw||!text(raw.name,60)||!/^[-a-zA-Z0-9_]{1,100}$/.test(raw.id)||!Number.isInteger(raw.payDay)||raw.payDay<1||raw.payDay>31||!Array.isArray(raw.ranks)||!raw.ranks.length||raw.ranks.length>30)fail();
 const ids=new Set();
 const ranks=raw.ranks.map(r=>{if(!r||!/^[-a-zA-Z0-9_]{1,100}$/.test(r.id)||ids.has(r.id)||!text(r.name,60)||!Number.isFinite(r.salaryMeals)||r.salaryMeals<0||r.salaryMeals>1000000||!Array.isArray(r.duties)||r.duties.length>20)fail();ids.add(r.id);return {id:r.id,name:r.name.trim(),salaryMeals:Math.round(r.salaryMeals*10000)/10000,duties:r.duties.map(d=>{if(!text(d.name,80)||!text(d.description,500))fail();return {name:d.name.trim(),description:d.description.trim()}})}});
 const departments=raw.departments||[];if(!Array.isArray(departments)||departments.length>40||departments.some(s=>!text(s,60)))fail();
 return {id:raw.id,name:raw.name.trim(),payDay:raw.payDay,ranks,departments:[...new Set(departments.map(s=>s.trim()))]};
}
export function saveCareer(world,raw,uid='',manager=true,allowCreate=false){
 const e=economyFor(world),all=careersFor(world),old=all.find(j=>j.id===raw?.id),job=validateCareer(raw);
 if(old?.builtin)throw Error('career-builtin-readonly');
 if(old?!manager&&old.ownerUid!==uid:!manager&&!allowCreate)throw Error('career-permission');
 if(!old&&job.id.startsWith('builtin-'))throw Error('career-invalid');
 if(!old&&e.careers.length>=100)throw Error('career-limit');
 const next={...job,builtin:!!old?.builtin,ownerUid:old?.ownerUid||uid};
 e.careers=[...e.careers.filter(j=>j.id!==job.id),next];
 world.economy={...e,revision:e.revision+1};return next;
}
export function archiveCareer(world,id,uid='',manager=true){const e=economyFor(world),old=e.careers.find(j=>j.id===id);if(!old||!manager&&old.ownerUid!==uid)throw Error('career-permission');e.careers=e.careers.map(j=>j.id===id?{...j,archived:true}:j);world.economy={...e,revision:e.revision+1}}
export function updateWorldCurrency(world,unit,mealPrice){if(typeof unit!=='string'||!unit.trim()||unit.length>20||!Number.isFinite(mealPrice)||mealPrice<.0001||mealPrice>1e9)throw Error('money-invalid-settings');const e=economyFor(world);world.economy={...e,unit:unit.trim(),mealPrice,revision:e.revision+1}}
export function applyWorldCurrency(world,c){if(world.economy&&c.wallet)c.wallet.settings={...c.wallet.settings,unit:world.economy.unit,mealPrice:world.economy.mealPrice}}
