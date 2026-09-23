import assert from 'node:assert/strict';
import {BUILTIN_CAREERS} from '../career-catalog.js';
import {careersFor,saveCareer,archiveCareer} from '../career-world.js';
import {assignEmployment,settleSalary,nextSalaryPayout} from '../salary.js';
import {ensureWallet,moneyEntry,settleEmployment} from '../character-money.js';
process.env.TZ='Asia/Seoul';
const at=(y,m,d)=>new Date(y,m-1,d).getTime();
assert.equal(BUILTIN_CAREERS.length,22);
for(const [year,month]of [[2026,1],[2026,2],[2024,2],[2026,4]]){
 const end=month===12?at(year+1,1,25):at(year,month+1,25),start=at(year,month,25),balances=[];
 for(const frequency of ['daily','weekly','monthly']){const c={job:'회사원'},world={};ensureWallet(c,start);c.wallet.balance=0;assignEmployment(world,c,'builtin-office','rank-1',start,moneyEntry,{frequency,department:'개발부',specialty:'플랫폼'});for(let t=start+86400000;t<=end;t+=86400000)settleSalary(c.wallet,c.wallet.employment,t,moneyEntry);assert.equal(c.wallet.balance,2500000);assert(c.wallet.entries.every(e=>e.amount%1000===0));const before=c.wallet.balance;settleSalary(c.wallet,c.wallet.employment,end,moneyEntry);assert.equal(c.wallet.balance,before);balances.push(before)}assert.equal(new Set(balances).size,1);
}
const w={},c={job:'의사'};ensureWallet(c,at(2026,1,25));c.wallet.balance=0;assignEmployment(w,c,'builtin-doctor','rank-1',at(2026,1,25),moneyEntry,{frequency:'daily'});settleSalary(c.wallet,c.wallet.employment,at(2026,2,5),moneyEntry);const before=c.wallet.balance;assignEmployment(w,c,'builtin-doctor','rank-3',at(2026,2,5),moneyEntry,{frequency:'weekly'});assert.equal(c.wallet.balance,before);settleSalary(c.wallet,c.wallet.employment,at(2026,2,25),moneyEntry);assert(c.wallet.balance<8500000&&c.wallet.balance>3000000);
const custom={id:'custom-test',name:'마법사',payDay:31,departments:['불꽃부'],ranks:[{id:'a',name:'견습',salaryMeals:250,duties:[{name:'주문 연습','description':'화염 주문을 연습하고 있어요.'}]}]};assert.throws(()=>saveCareer(w,custom,'member',false,false));saveCareer(w,custom,'member',false,true);assert.throws(()=>saveCareer(w,custom,'other',false,true));archiveCareer(w,custom.id,'member',false);assert(careersFor(w).find(j=>j.id===custom.id).archived);
assert.throws(()=>assignEmployment(w,c,'builtin-doctor','rank-1',at(2026,3,1),moneyEntry,{frequency:'hourly'}));
console.log('PASS473 salary equality in 28/29/30/31-day periods, clean payouts, no duplicate settlement, mid-period rank change, custom career permissions and archive');
