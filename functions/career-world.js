'use strict';
module.exports=({db,model=()=>import('./runtime/career-world.js')})=>async(uid,input)=>{
 const fail=(code,status=400)=>{throw Object.assign(Error(code),{status})};
 if(typeof input.groupId!=='string'||!input.groupId||input.groupId.length>180||input.groupId.includes('/'))fail('invalid-id');
 const m=await model();return db.runTransaction(async tx=>{const ref=db.collection('groups').doc(input.groupId),[group,member]=await Promise.all([tx.get(ref),tx.get(ref.collection('members').doc(uid))]);if(!group.exists||!member.exists)fail('group-membership-required',403);
 const g=group.data(),manager=g.ownerUid===uid||['manager','operator'].includes(member.data().role),world={economy:g.economy};
 if(input.action==='read')return {economy:m.economyFor(world),canManage:manager,canCreate:manager||g.rules?.allowMemberCareerAdd===true};
 if(input.revision!==m.economyFor(world).revision)fail('career-conflict',409);
 try{if(input.action==='save')m.saveCareer(world,input.career,uid,manager,g.rules?.allowMemberCareerAdd===true);else if(input.action==='archive')m.archiveCareer(world,input.id,uid,manager);else if(input.action==='currency'){if(!manager)fail('career-permission',403);m.updateWorldCurrency(world,input.unit,input.mealPrice)}else fail('invalid-action')}catch(e){if(!e.status)e.status=e.message==='career-permission'?403:400;throw e}
 if(JSON.stringify(world.economy).length>200000)fail('career-limit');
 tx.update(ref,{economy:world.economy,lifeUpdatedAt:0});return {economy:world.economy,canManage:manager,canCreate:manager||g.rules?.allowMemberCareerAdd===true};
 });
};
