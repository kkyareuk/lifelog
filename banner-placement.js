// Keep banners on requested browsing screens, but hide them during play and purchases.
export function bannerScreenAllowed(doc){
 if(doc.querySelector('.routine-sheet-backdrop,.mafia-playback,.is-account-loading,.is-welcome'))return false;
 const dialogs=[...doc.querySelectorAll('dialog[open]')];
 const allowed='.plaza-games-dialog,.building-detail-dialog,.room-editor-dialog';
 if(dialogs.some(d=>!d.matches(allowed)))return false;
 return dialogs.length>0||['observe','town','home','plaza','shop','groups'].includes(doc.documentElement.dataset.activeTab);
}
