(()=>{
  const firebase=window.PARALLEL_CITY_FIREBASE||window.PARALLEL_CITY_CONFIG?.firebase||{
    apiKey:"AIzaSyAC9QuqnZK48KA4IzcsqPxAGvHeaX2IqTs",
    authDomain:"lifelog-98fff.firebaseapp.com",
    projectId:"lifelog-98fff",
    storageBucket:"lifelog-98fff.firebasestorage.app",
    messagingSenderId:"115165634004",
    appId:"1:115165634004:web:2cd1e788a55b511643ca41"
  };
  window.PARALLEL_CITY_FIREBASE=firebase;
  window.PARALLEL_CITY_CONFIG=window.PARALLEL_CITY_CONFIG||{};
  window.PARALLEL_CITY_CONFIG.firebase=firebase;
  window.PARALLEL_CITY_CONFIG.maintenance=window.PARALLEL_CITY_CONFIG.maintenance||{
    enabled:false,
    title:"서랍마을을 잠시 점검하고 있어요",
    message:"예상치 못한 문제를 확인하고 있습니다. 저장된 캐릭터와 마을 데이터는 삭제하지 않아요.",
    eta:"점검이 끝나는 대로 다시 열어둘게요."
  };
})();
