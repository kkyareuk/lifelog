// Character settings keep their full canvas. Other tabs share the banner slot.
export function bannerScreenAllowed(doc){
 if(doc.querySelector('.routine-sheet-backdrop,.mafia-playback,.is-account-loading,.is-welcome'))return false;
 if(doc.querySelector('.character-money-dialog[open]'))return true;
 return !!doc.documentElement.dataset.activeTab&&doc.documentElement.dataset.activeTab!=='character';
}
