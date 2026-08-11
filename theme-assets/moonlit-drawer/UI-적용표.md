# 달빛 서랍 극장 UI 적용표

`ui-atlas.svg`는 그림을 그리는 원본 판이고, 앱은 같은 모양을 잘라 둔 SVG 조각을 사용합니다. 좌표와 크기는 기존 `ui-sprite-atlas-manifest.json`과 같습니다.

| 아틀라스 칸 | 실제 적용 위치 | 앱에서 쓰는 조각 |
|---|---|---|
| PANEL_MAIN | 설정·캐릭터·관계·상점 등 큰 화면 묶음 | `panel-main.svg` |
| PANEL_DIALOG | 테마 선택창과 각종 팝업 | `panel-dialog.svg` |
| TOAST | 저장·오류 등 짧은 안내 | 아틀라스 원본의 남색 안내 칸 |
| CARD | 캐릭터 카드·오늘의 기록·설정 카드 | `card.svg` |
| LARGE/MEDIUM BUTTON | 저장·열기·추가 같은 일반 버튼 | `button-default.svg`, `button-selected.svg` |
| TAB | 상단 메뉴·캐릭터 설정 안쪽 탭 | `tab-default.svg`, `tab-selected.svg` |
| ICON BUTTON | 닫기·뒤로·추가·삭제 같은 원형 버튼 | `icon-button.svg` |
| CHECK/RADIO/TOGGLE | 설정의 체크·단일 선택·켜기/끄기 | 테마 CSS의 같은 색·테두리 규칙 |
| PROGRESS/SLIDER | 관계 수치·크기 조절·진행 표시 | 테마 CSS의 금색 트랙과 남색 손잡이 |
| ICON GRID | 홈·캐릭터·관계·마을·설정 메뉴 그림을 바꿀 자리 | 112×112 고정 셀 · 이번 샘플은 앞 8칸만 예시 그림 |
| ORNAMENT DIVIDER | 화면 제목과 설정 구역 사이 장식선 | `divider.svg` |

새 그림을 만들 때는 각 칸의 바깥 크기와 모서리 여백을 유지하고 내부 장식만 바꾸면 됩니다. 테마마다 이 폴더를 복제해 별도의 조각 세트를 둘 수 있습니다.
