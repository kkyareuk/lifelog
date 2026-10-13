// This panel must work even when state.js cannot be imported.
export function mountStorageRecovery(card,language='ko'){
 if(card.querySelector('[data-boot-recovery]'))return;
 const text=(ko,en,ja)=>language.startsWith('ja')?ja:language.startsWith('en')?en:ko;
 const panel=document.createElement('section');panel.dataset.bootRecovery='';
 const help=document.createElement('p');help.textContent=text('백업 JSON 파일이 있다면 여기서 복구할 수 있어요. 현재 저장본은 별도로 보관한 뒤 불러옵니다.','Restore a backup JSON file here. The current saved copy is retained separately.','バックアップJSONから復元できます。現在の保存内容は別に保持します。');
 const button=document.createElement('button');button.type='button';button.textContent=text('백업 파일로 복구','Restore backup file','バックアップから復元');
 const status=document.createElement('p');status.setAttribute('role','status');
 button.onclick=()=>{
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';
  const owner=localStorage.getItem('drawer-village-active-data-owner-v1')||'guest';
  input.onchange=async()=>{
   if(!input.files?.[0])return;button.disabled=true;
   try{
    const parsed=JSON.parse(await input.files[0].text()),raw=['drawer-village-backup','parallel-city-backup'].includes(parsed?.format)?parsed.gameState:parsed;
    if(!raw||typeof raw!=='object'||!raw.characters||typeof raw.characters!=='object'||!Object.keys(raw.characters).length)throw Error('invalid-backup');
    const {accountStorage:storage}=await import('./account-storage.js?v=20260909dev305');
    if(storage.scope!==owner)throw Error('account-changed');
    const {prepareBackupRestore}=await import('./backup-restore.js');
    const {imported}=await prepareBackupRestore(parsed,{},storage);
    if(storage.scope!==owner)throw Error('account-changed');
    storage.copyItem('drawer-village-game-v1','drawer-village-unreadable-primary-v1:'+Date.now());
    imported.lastSaved=Date.now();
    if(!await storage.setItemAsync('drawer-village-game-v1',JSON.stringify(imported),()=>storage.scope===owner))throw Error('account-changed');
    location.reload();
   }catch{status.textContent=text('복구하지 못했어요. 캐릭터가 들어 있는 백업 파일과 기기 여유 공간을 확인해 주세요. 기존 저장본은 보관되어 있어요.','Could not restore. Check the backup contains characters and the device has free space. The previous saved copy is retained.','復元できませんでした。キャラクターを含むバックアップと空き容量を確認してください。以前の保存内容は保持されています。');button.disabled=false;}
  };input.click();
 };
 panel.append(help,button,status);card.append(panel);
}
