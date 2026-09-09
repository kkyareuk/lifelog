// Korean midnight. Store SKU identity never changes the grant of old receipts.
export const SLOT_SALE_AT=Date.parse('2026-09-14T00:00:00+09:00');
export const characterSlotProduct=(now=Date.now())=>now<SLOT_SALE_AT?'character_slots_5':'character_slot_1';
export const saleAllows=(id,now=Date.now())=>!['character_slots_5','character_slot_1'].includes(id)||id===characterSlotProduct(now);
export const saleChangedMessage=lang=>({ko:'판매 구성이 변경됐어요. 상점에서 상품을 다시 확인해 주세요.',en:'The offer has changed. Please check the product in the shop again.',ja:'販売内容が変更されました。ショップで商品をもう一度ご確認ください。'})[lang]||saleChangedMessage('ko');
