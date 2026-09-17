// A semantic action selects one effect; generic clicks never accompany it.
export function interactionSound(control,state={}){
 if(control.matches('[data-close-full-character-settings]'))return 'book-close';
 if(control.closest('[data-character-full-ui-version],.desktop-character-editor')&&[...control.attributes].some(a=>/^data-character-.*(?:pane|overview-target)$/.test(a.name)))return 'book-page';
 if(control.matches('[data-tab="observe"]'))return 'drawer-close';
 const dialog=control.closest('.home-social-dialog');if(dialog&&control.parentElement===dialog.querySelector(':scope > header'))return 'drawer-close';
 if(control.matches('[data-home-social],[data-drawer-route]'))return 'drawer-open';
 if(control.matches('[data-tab]')&&control.dataset.tab!==state.activeTab)return 'drawer-open';
 return 'ui-select';
}
