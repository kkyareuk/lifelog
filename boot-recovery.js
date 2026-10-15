import {searchLocalRecovery,verifyRecoverySelection} from './local-save-recovery.js';
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
 const searchButton=document.createElement('button');searchButton.type='button';searchButton.dataset.findLocalSaves='';searchButton.textContent=text('앱 안의 저장본 찾기','Find saves in this app','アプリ内の保存を探す');
 const results=document.createElement('div');results.dataset.localSaveResults='';
 searchButton.onclick=async()=>{
  searchButton.disabled=true;results.replaceChildren();status.textContent=text('저장본을 찾고 있어요. 기존 데이터는 변경하지 않아요.','Searching without changing existing data.','既存のデータを変更せずに探しています。');
  try{
   const search=await searchLocalRecovery();
   const report=search.report;
   status.textContent=search.candidates.length?text('복구할 저장본을 확인하고 선택해 주세요. 이전 시점의 기록일 수 있어요.','Check and choose a save. It may contain older progress.','内容を確認して保存を選んでください。以前の記録の場合があります。'):text('현재 계정에서 읽을 수 있는 저장본을 찾지 못했어요. 데이터가 모두 삭제됐다는 뜻은 아니에요. 앱을 지우지 말고 아래 결과를 개발자에게 알려 주세요.','No readable save was found for this account. This does not prove all data was deleted. Keep the app and share the results below with the developer.','現在のアカウントで読める保存が見つかりませんでした。すべて消えたと断定はできません。アプリを削除せず、以下の結果を開発者に伝えてください。');
   const diagnostic=document.createElement('p');diagnostic.textContent=text('확인 / 본문 없음 / 읽기 실패 / 해석 불가 / 변경됨','Checked / Missing / Read failed / Invalid / Changed','確認 / 本文なし / 読込失敗 / 解析不可 / 変更あり')+': '+[report.checked,report.missing,report.unreadable,report.invalid,report.changed].join(' / ')+(report.limited?text(' · 일부만 검색했어요.',' · Partial search.',' · 一部のみ検索しました。'):'');results.append(diagnostic);
   for(const candidate of search.candidates){
    const entry=document.createElement('div'),description=document.createElement('p'),select=document.createElement('button');select.type='button';select.dataset.restoreLocalSave='';
    const date=candidate.saved>0&&Number.isFinite(new Date(candidate.saved).getTime())?new Date(candidate.saved).toLocaleString(language):text('날짜 정보 없음','Date unavailable','日時不明');
    description.textContent=date+' · '+text('캐릭터','Characters','キャラクター')+' '+candidate.count+' · '+candidate.names.join(', ');
    select.textContent=text('이 저장본 선택','Choose this save','この保存を選ぶ');
    select.onclick=()=>{
     results.replaceChildren(entry);select.remove();
     const confirm=document.createElement('button'),cancel=document.createElement('button');confirm.type=cancel.type='button';
     confirm.dataset.confirmLocalRestore='';confirm.textContent=text('확인한 저장본으로 복구','Restore selected save','選んだ保存から復元');cancel.textContent=text('다시 찾기','Search again','もう一度探す');cancel.onclick=()=>searchButton.click();entry.append(confirm,cancel);
     confirm.onclick=async()=>{
      confirm.disabled=cancel.disabled=searchButton.disabled=button.disabled=true;
      try{
       verifyRecoverySelection(localStorage,search,candidate);
       const {accountStorage:storage}=await import('./account-storage.js?v=20260909dev305');
       const {prepareBackupRestore}=await import('./backup-restore.js');
       if(storage.scope!==search.owner)throw Error('account-changed');
       const {imported}=await prepareBackupRestore(candidate.value,{},storage);
       verifyRecoverySelection(localStorage,search,candidate);
       storage.copyItem('drawer-village-game-v1','drawer-village-unreadable-primary-v1:'+Date.now());
       imported.lastSaved=Date.now();
       if(!await storage.setItemAsync('drawer-village-game-v1',JSON.stringify(imported),()=>storage.scope===search.owner&&localStorage.getItem(search.primaryKey)===search.primary))throw Error('save-changed');
       location.reload();
      }catch{status.textContent=text('복구하지 못했어요. 계정·저장본 변경 또는 저장 공간을 확인하고 다시 찾아 주세요. 원본은 삭제하지 않았어요.','Restore failed. Check account/save changes and free space, then search again. Original saves were not deleted.','復元できませんでした。アカウント・保存の変更や空き容量を確認し、もう一度探してください。元の保存は削除していません。');confirm.disabled=cancel.disabled=searchButton.disabled=button.disabled=false;}
     };
    };entry.append(description,select);results.append(entry);
   }
  }catch{status.textContent=text('검색을 완료하지 못했어요. 계정과 저장소 상태를 확인한 뒤 다시 시도해 주세요.','Search could not finish. Check the account and storage, then retry.','検索を完了できませんでした。アカウントと保存領域を確認し、再試行してください。');}
  finally{searchButton.disabled=false;}
 };
 panel.append(searchButton,status,results,help,button);card.append(panel);
}
