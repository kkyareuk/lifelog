export function contactPickerMarkup(content,language='ko'){
 const t=(ko,en,ja)=>({ko,en,ja}[language]||ko);
 return `<button type="button" data-open-contact-picker>${t('연락받을 캐릭터 선택하기','Choose contact characters','連絡を受け取るキャラクターを選ぶ')}</button><dialog class="contact-picker-dialog" data-contact-picker><header><h2>${t('연락받을 캐릭터','Contact characters','連絡を受け取るキャラクター')}</h2><button type="button" data-close-contact-picker aria-label="${t('닫기','Close','閉じる')}">×</button></header><button type="button" data-notification-select-all>${t('캐릭터 전체 선택','Select all characters','すべて選択')}</button><div class="notification-character-grid">${content}</div><button type="button" class="primary" data-close-contact-picker>${t('선택 완료','Done','選択完了')}</button></dialog>`;
}
export function bindContactPicker(root=document){
 const dialog=root.querySelector('[data-contact-picker]');if(!dialog)return;
 root.querySelector('[data-open-contact-picker]')?.addEventListener('click',()=>dialog.showModal());
 dialog.querySelectorAll('[data-close-contact-picker]').forEach(b=>b.onclick=()=>dialog.close());
}
