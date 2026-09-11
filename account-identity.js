export function accountIdentity(user,lang='ko'){
 const labels={ko:{none:'로그인되지 않음',linked:'연결된 로그인'},en:{none:'Not signed in',linked:'Linked sign-in'},ja:{none:'未ログイン',linked:'連携中のログイン'}}[lang]||{none:'로그인되지 않음',linked:'연결된 로그인'};
 if(!user)return labels.none;
 const names=[...new Set((user.providerData||[]).map(p=>({'apple.com':'Apple','google.com':'Google','password':'Email'}[p.providerId])).filter(Boolean))];
 return names.length?`${labels.linked}: ${names.join(' · ')}`:({ko:'로그인됨',en:'Signed in',ja:'ログイン中'}[lang]||'로그인됨');
}
