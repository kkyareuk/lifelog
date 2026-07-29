/*
 * 평행도시 운영 설정
 * googleMapsApiKey 값만 본인의 Google Maps API 키로 바꾼 뒤 배포하세요.
 * 브라우저용 키는 방문자에게 보이므로 Google Cloud에서 반드시
 * "웹사이트" 제한과 GitHub Pages 주소 제한을 설정해야 합니다.
 */
window.PARALLEL_CITY_CONFIG = {
  googleMapsApiKey: '여기에_본인_API_키를_입력하세요',
  dailyFreePlaceSearches: 20,
  minPlaceSearchIntervalMs: 30000
};
