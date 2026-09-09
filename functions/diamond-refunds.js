'use strict';
const crypto=require('node:crypto');
async function playRefund(db,item){
 if(!item.orderId||!item.voidedTimeMillis)return;
 const matches=await db.collection('playPurchases').where('orderId','==',item.orderId||'').get();
 for(const record of matches.docs){if(record.data().productId!=='diamonds_100')continue;const event=db.collection('playDiamondRefunds').doc(crypto.createHash('sha256').update(record.id+':'+item.voidedTimeMillis+':'+(item.voidedQuantity||'full')).digest('hex'));
  await db.runTransaction(async tx=>{const [prior,receipt]=await Promise.all([tx.get(event),tx.get(record.ref)]);if(prior.exists)return;const saved=receipt.data(),root=db.collection('users').doc(saved.uid),[u,deleted]=await Promise.all([tx.get(root),tx.get(db.collection('deletedAccounts').doc(saved.uid))]),already=Number(saved.refundedQuantity)||0,total=Number(saved.quantity)||1,quantity=Math.max(0,Math.min(total-already,Number(item.voidedQuantity)||total-already));
   const ent=u.data()?.entitlements||{};if(!deleted.exists)tx.set(root,{entitlements:{...ent,diamondPaid:(Number(ent.diamondPaid)||0)-quantity*100}},{merge:true});tx.update(record.ref,{refundedQuantity:already+quantity,revoked:already+quantity>=total});tx.create(event,{receiptId:record.id,quantity,createdAt:Date.now()});
  });
 }
}
async function tossRefund(db,orderId,payment){
 const ref=db.collection('paymentOrders').doc(orderId);
 return db.runTransaction(async tx=>{const order=await tx.get(ref);if(!order.exists)return;const value=order.data(),items=value.items||[];if(!items.length||items.some(i=>i.packageId!=='diamonds_100')||value.status!=='DONE'||payment.orderId!==orderId||Number(payment.totalAmount)!==Number(value.amount))return;
 const refund=(payment.cancels||[]).filter(c=>!c.cancelStatus||c.cancelStatus==='DONE').reduce((sum,c)=>sum+Math.max(0,Number(c.cancelAmount)||0),0),credited=items.reduce((n,i)=>n+i.quantity*100,0),target=Math.min(credited,Math.ceil(refund/10)),delta=target-(Number(value.refundedDiamonds)||0);if(delta<=0)return;const root=db.collection('users').doc(value.uid),[u,deleted]=await Promise.all([tx.get(root),tx.get(db.collection('deletedAccounts').doc(value.uid))]),ent=u.data()?.entitlements||{};if(!deleted.exists)tx.set(root,{entitlements:{...ent,diamondPaid:(Number(ent.diamondPaid)||0)-delta}},{merge:true});tx.update(ref,{refundedDiamonds:target});
 });
}
module.exports={playRefund,tossRefund};
