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
  window.PARALLEL_CITY_CONFIG.beta={enabled:false,label:"",message:""};
  // 브라우저에 공개되는 테스트 클라이언트 키만 여기에 넣습니다.
  // test_sk/live_sk 시크릿 키는 절대로 이 파일이나 GitHub에 넣지 마세요.
  const tossPaymentsClientKey="test_ck_DnyRpQWGrNqxjN6wLAGBVKwv1M9E";
  window.PARALLEL_CITY_CONFIG.tossPaymentsClientKey=tossPaymentsClientKey;
  window.PARALLEL_CITY_CONFIG.paymentBackendUrl="https://asia-northeast3-lifelog-98fff.cloudfunctions.net/api";
  window.PARALLEL_CITY_CONFIG.paymentMid="drawerg8ht";
  window.PARALLEL_CITY_CONFIG.paymentEnvironment=tossPaymentsClientKey.startsWith("test_ck_")?"test":tossPaymentsClientKey.startsWith("live_ck_")?"live":"disabled";
  window.PARALLEL_CITY_CONFIG.paymentsEnabled=Boolean(tossPaymentsClientKey);
  window.PARALLEL_CITY_CONFIG.playBilling=window.PARALLEL_CITY_CONFIG.playBilling||{
    enabled:true,
    backendUrl:"https://asia-northeast3-lifelog-98fff.cloudfunctions.net/api",
    packageName:"com.drawervillage.app",
    products:{
      character_slots_5:"character_slots_5",
      town_slot_1:"town_slot_1",
      storage_50mb:"storage_50mb",
      green_tea:"green_tea"
    }
  };
  window.PARALLEL_CITY_CONFIG.maintenance=window.PARALLEL_CITY_CONFIG.maintenance||{
    enabled:false,
    title:"서랍마을을 잠시 점검하고 있어요",
    message:"예상치 못한 문제를 확인하고 있습니다. 저장된 캐릭터와 마을 데이터는 삭제하지 않아요.",
    eta:"점검이 끝나는 대로 다시 열어둘게요."
  };
})();
