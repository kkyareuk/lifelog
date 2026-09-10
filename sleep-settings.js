const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sleepSettingsMarkup(r,cid,hid,lang='ko'){
 const c={ko:['가끔 다른 곳에서 자기','다른 곳에서 자는 빈도','드물게 · 5%','가끔 · 15%','자주 · 35%','출입 가능한 거실이나 휴식 공간에서 자요. 끄면 지정한 방에서 자요.'],en:['Sometimes sleep elsewhere','Frequency','Rarely · 5%','Sometimes · 15%','Often · 35%','Use an accessible living or rest area. Turn off to use the assigned room.'],ja:['時々ほかの場所で寝る','頻度','まれに · 5%','時々 · 15%','よく · 35%','入室できる居間や休憩室を使います。オフなら指定の部屋で寝ます。']}[lang]||[];
 const attr=`data-character-id="${esc(cid)}" data-home-id="${esc(hid)}"`;
 return `<fieldset class="sleep-settings"><label class="check"><input type="checkbox" data-residence-field="sleepElsewhere" ${attr} ${r.sleepElsewhere===true?'checked':''}>${c[0]}</label><label>${c[1]}<select data-residence-field="sleepElsewhereFrequency" ${attr}>${['rare','sometimes','often'].map((v,i)=>`<option value="${v}" ${(r.sleepElsewhereFrequency||'rare')===v?'selected':''}>${c[i+2]}</option>`).join('')}</select></label><small>${c[5]}</small></fieldset>`;
}
