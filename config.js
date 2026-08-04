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
})();
