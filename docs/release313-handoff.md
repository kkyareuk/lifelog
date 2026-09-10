# 313 / 1.0.280

Android 앱 매니페스트에 AD_ID 권한을 직접 선언했습니다. SDK 자동 병합에 의존하지 않습니다. 312 기능을 모두 유지하며 출시노트는 같은 사용자 체감 변경을 포함합니다. dev 작업, 운영 main 유지. 웹/iOS 기능 변경 없음, IPA 빌드 없음.

중요: 전달한312와313 AAB의 protobuf 매니페스트를 구조로 읽어 uses-permission name=com.google.android.gms.permission.AD_ID가 각각1개이고 maxSdkVersion 제한이 없는 것을 확인했습니다. 따라서 권한 직접 선언은 방어적 보강이며, Console의312 오류 원인을 확정하거나 해결했다고 주장하지 않습니다. 업로드된 파일의 매니페스트와 로컬 전달본 비교가 필요합니다.313 업로드/검토는 미실행입니다.

Android release 빌드 성공, 앱 준비75모듈, AAB277자산 전체 바이트 일치. 해시는 release313-build.json 참고. 영어76.0%·일본어76.0%, 새 번역 문구 없음.
