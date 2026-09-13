let failure=null;const recent=[];
export function recordSaveFailure(error,stage='snapshot'){
 const name=String(error?.name||'Error'),code=['QuotaExceededError','NS_ERROR_DOM_QUOTA_REACHED'].includes(name)||[22,1014].includes(error?.code)?'STORAGE_QUOTA':name==='SecurityError'?'STORAGE_UNAVAILABLE':'SAVE_FAILED';
 failure={code,stage,name,at:Date.now()};recent.push(failure);if(recent.length>5)recent.shift();return failure;
}
export const clearSaveFailure=()=>{failure=null};
export const saveFailureDiagnostic=()=>recent.length?recent.map(item=>`${item.code} / ${item.stage} / ${item.name}`).join('; '):'none';
export function saveFailureMessage(language='ko'){
 const copy={ko:{STORAGE_QUOTA:'앱의 기기 저장 한도에 도달했어요. 먼저 백업을 내보내 주세요. 휴대폰 전체 여유 공간과는 다를 수 있어요.',STORAGE_UNAVAILABLE:'기기 저장소에 접근하지 못했어요. 작성한 내용은 현재 화면에 남아 있어요.',SAVE_FAILED:'저장을 완료하지 못했어요. 작성한 내용은 유지됩니다. 다시 저장하거나 익명 문의로 알려 주세요.'},en:{STORAGE_QUOTA:'The app storage quota was reached. Export a backup first. This can differ from the phone’s free space.',STORAGE_UNAVAILABLE:'Device storage is unavailable. Your edits remain on this screen.',SAVE_FAILED:'Saving could not finish. Your edits are kept. Try again or send anonymous feedback.'},ja:{STORAGE_QUOTA:'アプリの保存上限に達しました。まずバックアップを書き出してください。端末全体の空き容量とは異なる場合があります。',STORAGE_UNAVAILABLE:'端末の保存領域にアクセスできません。編集内容は画面に残っています。',SAVE_FAILED:'保存を完了できませんでした。編集内容は保持されています。再試行するか匿名でお問い合わせください。'}};
 return (copy[language]||copy.ko)[failure?.code||'SAVE_FAILED'];
}
