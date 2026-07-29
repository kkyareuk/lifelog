# LIFELOG: Parallel City

현실 지도 위에서 창작 캐릭터들이 자율적으로 생활하는 관찰형 시뮬레이터의 GitHub Pages/PWA 버전입니다.

## GitHub Pages에 올리는 방법

1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더 안의 파일과 `icons` 폴더를 저장소 최상단에 전부 업로드합니다.
3. 저장소의 **Settings → Pages**로 이동합니다.
4. **Build and deployment**에서 `Deploy from a branch`를 선택합니다.
5. Branch를 `main`, 폴더를 `/(root)`로 설정하고 저장합니다.
6. 잠시 뒤 표시되는 Pages 주소로 접속합니다.

## 앱처럼 설치하기

- Android Chrome: 사이트 접속 → 메뉴 → **홈 화면에 추가** 또는 **앱 설치**
- iPhone Safari: 공유 버튼 → **홈 화면에 추가**
- PC Chrome/Edge: 주소창의 설치 아이콘 선택

## 파일 구성

- `index.html`: 앱 본체
- `manifest.webmanifest`: 앱 이름, 아이콘, 설치 설정
- `sw.js`: 앱 셸 캐시 및 설치 지원
- `icons/`: 앱 아이콘
- `.nojekyll`: GitHub Pages가 파일을 그대로 배포하도록 설정

## 참고

API 키는 필요하지 않습니다. 지도 타일과 지역 검색은 인터넷 연결이 필요하며, 외부 공개 서버 상태에 따라 일부 검색이 느리거나 실패할 수 있습니다. 캐릭터·관계·루틴·테마 설정은 브라우저 저장소에 저장되므로 브라우저 데이터 삭제 시 초기화될 수 있습니다.
