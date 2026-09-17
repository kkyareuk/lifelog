const configuredAppearanceValue=value=>value&&!["설정하지 않음","하지 않음"].includes(value)?String(value):"";
const hairColorText=value=>({
  "검은색":"검은","짙은 갈색":"짙은 갈색","갈색":"갈색","밝은 갈색":"밝은 갈색","금발":"금빛","백발·은발":"백색·은색","회색":"회색","청회색":"청회색","빨간색":"붉은","주황색":"주황색","분홍색":"분홍색","보라색":"보라색","파란색":"파란색","청록색":"청록색","초록색":"초록색","여러 색":"여러 색"
}[value]||configuredAppearanceValue(value));
const eyeColorText=value=>({
  "검은색":"검은","짙은 갈색":"짙은 갈색","갈색":"갈색","연갈색":"연갈색","호박색":"호박색","금색":"금색","초록색":"초록색","청록색":"청록색","파란색":"파란색","청회색":"청회색","회색":"회색","보라색":"보라색","분홍색":"분홍색","빨간색":"붉은","백색":"백색","여러 색":"여러 색"
}[value]||configuredAppearanceValue(value));
const appearanceProfile=c=>c?.bodyProfile?.appearance||{};
const hairLookPhrase=c=>{
  const a=appearanceProfile(c),color=hairColorText(a.hairColor),texture=configuredAppearanceValue(a.hairTexture);
  const textureText={"약한 반곱슬":"반곱슬","강한 반곱슬":"짙은 반곱슬","곱슬":"곱슬","강한 곱슬":"강한 곱슬","직모":"곧은"}[texture]||"";
  return [color,textureText].filter(Boolean).join(" ")+(color||textureText?"머리":"");
};
const eyeLookPhrase=c=>{
  const a=appearanceProfile(c),left=eyeColorText(a.leftEyeColor),right=eyeColorText(a.rightEyeColor);
  if(left&&right&&left!==right)return `왼쪽은 ${left}, 오른쪽은 ${right}인 눈`;
  const color=left||right;
  return color?`${color} 눈`:"";
};
const appearanceTraitTags=c=>{
  const a=appearanceProfile(c),tags=[],hairColor=hairColorText(a.hairColor),eyeColor=eyeColorText(a.leftEyeColor===a.rightEyeColor?a.leftEyeColor:"");
  const hairTags={"검은":"검은 머리","갈색":"갈색 머리","짙은 갈색":"갈색 머리","밝은 갈색":"갈색 머리","금빛":"금발","백색·은색":"백발·은발","붉은":"빨간 머리","분홍색":"분홍 머리","보라색":"보라 머리","파란색":"파란 머리","청록색":"청록 머리","초록색":"초록 머리"};
  const eyeTags={"검은":"검은 눈","갈색":"갈색 눈","짙은 갈색":"갈색 눈","연갈색":"갈색 눈","호박색":"호박색 눈","금색":"금색 눈","초록색":"초록색 눈","파란색":"파란색 눈","청회색":"청회색 눈","회색":"회색 눈","보라색":"보라색 눈"};
  if(c.bodyProfile?.tattoos?.length)tags.push("문신이 있음");
  if(hairTags[hairColor])tags.push(hairTags[hairColor]);
  if(eyeTags[eyeColor])tags.push(eyeTags[eyeColor]);
  if(a.leftEyeColor&&a.rightEyeColor&&a.leftEyeColor!==a.rightEyeColor)tags.push("오드아이");
  if(/곱슬/.test(a.hairTexture||""))tags.push("곱슬머리");
  if(/웨이브/.test((a.hairStyles||[]).join(" ")))tags.push("웨이브머리");
  if(["가슴 길이","허리 길이","허리보다 김"].includes(a.hairLength))tags.push("장발");
  if(a.hairLength==="단발")tags.push("단발");
  if(["삭발·매우 짧음","귀 위 길이","숏컷"].includes(a.hairLength))tags.push("숏컷");
  (a.hairStyles||[]).forEach(style=>tags.push(style,style.replace(" 스타일링","머리").replace("번 헤어","올림머리")));
  return [...new Set(tags.filter(Boolean))];
};

export {configuredAppearanceValue,hairColorText,eyeColorText,appearanceProfile,hairLookPhrase,eyeLookPhrase,appearanceTraitTags};
