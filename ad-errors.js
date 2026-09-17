// Keep diagnostics local and limited to SDK stage/code; never include reward tickets or account data.
export async function adStep(stage,operation){
 try{return await operation()}catch(error){const failure=new Error(error?.message||'ads-error');failure.adStage=error?.adStage||stage;failure.code=error?.code;throw failure;}
}
export function adErrorText(error,language=document.documentElement.lang){
 const t=(ko,en,ja)=>language?.startsWith('ja')?ja:language?.startsWith('en')?en:ko;
 const stage=error?.adStage||'request';
 const labels={consent:t('광고 동의 확인','Consent check','広告同意の確認'),initialize:t('광고 SDK 초기화','SDK initialization','SDKの初期化'),banner:t('배너 불러오기','Banner loading','バナー読み込み'),reward:t('보상형 광고 불러오기','Rewarded ad loading','リワード広告の読み込み')};
 const code=String(error?.code??'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,48);
 const message=String(error?.message||'');
 const reason=/no form|publisher misconfig|no.*message.*configured/i.test(message)?t('AdMob 동의 메시지 설정을 확인해야 해요.','Check the consent message configuration in AdMob.','AdMobの同意メッセージ設定を確認してください.'):/timeout/i.test(message)?t('연결 시간이 초과됐어요.','The connection timed out.','接続がタイムアウトしました.'):t('잠시 후 다시 시도해 주세요.','Please try again later.','しばらくしてから再試行してください。');
 return `${labels[stage]||t('광고 요청','Ad request','広告リクエスト')} ${t('실패','failed','失敗')}${code?` (${code})`:''}. ${reason}`;
}
