(()=>{
  const allowed=new Set(["system","noto","nanum","gothica1","gowundodum","gowunbatang","jua","dangam","dohyeon","corncorn","haeong","aggro"]);
  let selected="system";
  try{
    const saved=JSON.parse(localStorage.getItem("drawer-village-game-v1")||"null");
    if(Number(saved?.schema)<14&&saved?.uiFont==="dangam")selected="system";
    else if(allowed.has(saved?.uiFont))selected=saved.uiFont;
  }catch(error){console.warn("저장된 글꼴 설정을 읽지 못했습니다.",error)}
  document.documentElement.dataset.uiFont=selected;
})();
