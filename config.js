/*
 * 평행도시 운영 설정
 * googleMapsApiKey 값만 본인의 Google Maps API 키로 바꾼 뒤 배포하세요.
 * 브라우저용 키는 방문자에게 보이므로 Google Cloud에서 반드시
 * "웹사이트" 제한과 GitHub Pages 주소 제한을 설정해야 합니다.
 */
window.PARALLEL_CITY_CONFIG = {
  googleMapsApiKey: 'AIzaSyD64oi3UtFZLk0VdTQi1JErDZLMSpR4MSg',
  dailyFreePlaceSearches: 20,
  minPlaceSearchIntervalMs: 30000,

  /*
   * 토스페이먼츠의 "클라이언트 키"만 입력할 수 있습니다.
   * 시크릿 키는 절대로 이 파일이나 GitHub에 넣지 마세요.
   */
  tossPaymentsClientKey: '',
  paymentBackendUrl: '',

  /*
   * Firebase 콘솔 → 프로젝트 설정 → 내 앱 → 웹 앱의 firebaseConfig를
   * 아래 항목에 옮겨 적으세요. 이 설정값은 웹용 식별 정보라 공개될 수
   * 있지만 Firestore 보안 규칙은 반드시 로그인 사용자 기준으로 설정해야 합니다.
   */
  firebase: {
    apiKey: 'AIzaSyAC9QuqnZK48KA4IzcsqPxAGvHeaX2IqTs',
    authDomain: 'lifelog-98fff.firebaseapp.com',
    projectId: 'lifelog-98fff',
    storageBucket: 'lifelog-98fff.firebasestorage.app',
    messagingSenderId: '115165634004',
    appId: '1:115165634004:web:2cd1e788a55b511643ca41'
  }
};
