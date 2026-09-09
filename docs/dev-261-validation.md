# 261 검증 기록

- Android: 1.0.232 / versionCode 261, signed release APK 및 AAB, debug APK 빌드 성공.
- APK 서명 검사 성공. AAB의 웹 자산 223개가 준비된 www와 바이트 단위 일치.
- release APK SHA256: 2CFD15BE469C7319A205978432B90974570BEC04FB953BB5637B3EC45B8925C3
- release AAB SHA256: EC5D14A3C8E0B4B03D0FD26D2886147133D1F656A3A0E90708DC721CC344C206
- qa-features261: 총평 즉시 반영/재실행, 침실 소유와 자는 방 양방향 변경/해제, 캐릭터 설정 왕복, 사전 중복 재가져오기 및 80개 제한, 실제 사전/전체 JSON 다운로드, 음료 입력, 멀티 검색/내 그룹/정렬 배치/슬롯 창, 384px와 412px 화면 통과. 멀티 서버는 목업이며 실서버 제의·푸시는 검증 범위 밖.
- qa-hotfix259: 저장 성공/용량 오류/뒤로 가기/초안 재실행/재시도/일정 종료 통과.
- check-population-cache: 계산 일치, 시간 변경, 배치 정리, 직접 행동, 언어 캐시 무효화 통과.
- check-character-editor-ui-stability 통과.
- check-media-home-routine-features는 10개 기존 검사 실패. 동일 스크립트를 수정 전 d88b7e6의 독립 압축본과 현재에서 실행하여 FAIL 목록이 바이트 단위 동일함을 확인. 가구 격자·커플 침대·오래된 화면 문자열 검사가 포함되어 있으며 이번 수정으로 증가하지 않음. 전체 검사가 통과했다고 주장하지 않는다.
- 웹 build 및 native module closure/Android assets 검사 통과.
- 실제 휴대폰 설치/장시간 발열/Play Console 업로드는 수행하지 않음.
- 사용자 SVG에서 나무·화살표와 예시 초상을 추출했다. QA 이미지의 주민/그룹/초상은 샘플이며 실제 사용자 데이터를 사용하지 않았다. 실제 목록은 그룹의 저장된 미리보기를 사용한다.
- 원격 dev에 반영하고 운영 main은 259에 유지한다. 미완성 dev258 작업 파일은 포함하지 않는다.
