export const iosAppleAvailable=()=>window.Capacitor?.isNativePlatform?.()&&window.Capacitor?.getPlatform?.()==='ios'&&!!window.Capacitor?.Plugins?.FirebaseAuthentication?.signInWithApple;
const copy={ko:{title:'로그인 방식 선택',apple:'Apple로 로그인',google:'Google로 로그인',cancel:'취소',help:'기존 계정과 구매 내역을 유지하려면 기존 로그인 방식으로 먼저 로그인한 뒤 설정에서 Apple 계정을 연결하세요.',linked:'Apple 계정을 연결했어요.',failed:'Apple 인증에 실패했어요. 잠시 후 다시 시도해 주세요.',conflict:'다른 계정에 연결된 Apple 계정이에요. 기존 계정으로 로그인해 주세요.',link:'Apple 계정 연결',confirm:'현재 계정에 Apple 로그인을 추가합니다. 계정과 구매 내역은 그대로 유지됩니다. 연결할까요?'},en:{title:'Choose sign-in method',apple:'Sign in with Apple',google:'Sign in with Google',cancel:'Cancel',help:'To keep an existing account and purchases, sign in the usual way first, then link Apple in Settings.',linked:'Apple account linked.',failed:'Apple authentication failed. Please try again later.',conflict:'This Apple account is linked to another account. Sign in to that account instead.',link:'Link Apple account',confirm:'Add Apple sign-in to this account while keeping its data and purchases. Continue?'},ja:{title:'ログイン方法を選択',apple:'Appleでログイン',google:'Googleでログイン',cancel:'キャンセル',help:'既存のアカウントと購入内容を維持するには、今までの方法でログインしてから設定でAppleを連携してください。',linked:'Appleアカウントを連携しました。',failed:'Apple認証に失敗しました。しばらくしてから再試行してください。',conflict:'このAppleアカウントは別のアカウントに連携済みです。そちらにログインしてください。',link:'Appleアカウントを連携',confirm:'データと購入内容を維持したまま、このアカウントにAppleログインを追加します。続けますか？'}};
export const appleCopy=()=>copy[document.documentElement.lang]||copy.ko;
export function chooseSignInProvider(){
 const c=appleCopy(),d=document.createElement('dialog');d.className='apple-login-dialog';d.setAttribute('aria-label',c.title);
 const h=document.createElement('h2');h.textContent=c.title;d.append(h);
 const p=document.createElement('p');p.textContent=c.help;d.append(p);
 return new Promise(resolve=>{let selected=null;for(const [value,label] of [['apple',c.apple],['google',c.google],['',c.cancel]]){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.provider=value;b.onclick=()=>{selected=value||null;d.close()};d.append(b)}d.addEventListener('close',()=>{d.remove();resolve(selected)},{once:true});document.body.append(d);d.showModal()});
}
// Linking never signs into another UID and never grants or copies entitlements.
export async function authenticateApple({auth,native,credential,signIn,link,linking=false}){
 const previous=auth.currentUser;
 if(linking&&!previous)throw Error('auth/no-current-user');
 const result=await native.signInWithApple({skipNativeAuth:true,scopes:['email','name']});
 if(auth.currentUser!==previous)throw Error('auth/account-changed');
 const c=result?.credential;if(!c?.idToken||!c?.nonce)throw Error('auth/missing-apple-credential');
 const value=credential({idToken:c.idToken,rawNonce:c.nonce});
 return linking?link(previous,value):signIn(auth,value);
}
