(()=>{
  const allowed=new Set(["system","dangam","dohyeon","corncorn","haeong","aggro","griun"]);
  let selected="system";
  try{
    const saved=JSON.parse(localStorage.getItem("drawer-village-game-v1")||"null");
    if(allowed.has(saved?.uiFont))selected=saved.uiFont;
  }catch(error){console.warn("저장된 글꼴 설정을 읽지 못했습니다.",error)}
  document.documentElement.dataset.uiFont=selected;
})();
