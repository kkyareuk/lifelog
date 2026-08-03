window.PARALLEL_CITY_FIREBASE = window.PARALLEL_CITY_FIREBASE || {
  apiKey: "AIzaSyAC9QuqnZK48KA4IzcsqPxAGvHeaX2IqTs",
  authDomain: "lifelog-98fff.firebaseapp.com",
  projectId: "lifelog-98fff",
  storageBucket: "lifelog-98fff.firebasestorage.app",
  messagingSenderId: "115165634004",
  appId: "1:115165634004:web:2cd1e788a55b511643ca41"
};
window.PARALLEL_CITY_CONFIG = {
  ...(window.PARALLEL_CITY_CONFIG || {}),

  // 토스페이먼츠 개발자센터의 API 개별 연동 클라이언트 키
  tossPaymentsClientKey: "test_ck_DnyRpQWGrNqxjN6wLAGBVKwv1M9E",

  // 아직 결제 승인 서버를 만들기 전이므로 비워 둠
  paymentBackendUrl: "",

  // 승인 서버가 완성될 때까지 반드시 false
  paymentsEnabled: false
};
