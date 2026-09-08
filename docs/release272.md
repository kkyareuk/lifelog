# 서랍마을 개발판 272 · 1.0.241

## 한국어 업데이트
- 사진 포함 캐릭터 코드 공유에서 선택한 캐릭터와 사진만 처리하도록 바꿨습니다. 다른 캐릭터·마을까지 올리고 다시 불러오는 대기를 줄였습니다.
- 재접속 시 서버 저장본에 변경이 없다면 같은 캐릭터 설정을 다시 내려받지 않습니다. 다른 기기에서 바꾼 설정과 직접 누른 불러오기는 계속 확인합니다. 새 사진의 첫 업로드와 새 기기의 첫 다운로드에는 네트워크 시간이 필요합니다.
- 멀티 집의 그리드 이동·크기 조절과 방 사이 가구 이동을 연결했습니다. 가구창에 가려지는 아래쪽 편집 영역을 스크롤할 수 있고, 공유 가구의 좌우반전도 수정했습니다.
- 마을 편집 권한이 없으면 편집 버튼이 흐리게 표시됩니다.
- 함께 하는 행동을 시키거나 캐릭터가 선물을 보내면 상대가 있는 장소로 걸어갑니다. 집 안의 방과 층, 집 밖과 마을을 거쳐 만납니다. 상대는 있던 곳에서 기다립니다.
- 이동 모습은 기기에서 재생하며 걸음마다 위치를 서버에 저장하지 않습니다. 선물의 보유 물품 지급과 우편 기록은 유지합니다. 선물을 직접 전달하게 하려면 보내는 캐릭터를 선택해 주세요.
- 일반 구성원은 자기 캐릭터를 기준으로 관계·시선·일정을 설정하거나 제안합니다. 자기 캐릭터끼리의 일정은 ‘설정하기’, 다른 유저가 포함되면 ‘일정 제안하기’로 표시됩니다.
- 방장·스태프는 그룹의 관계·시선·일정을 승인 대기 없이 등록·수정할 수 있습니다.
- 일정·관계 제안 알림을 누르면 우편함의 해당 내용을 바로 엽니다.
- 멀티 상세의 중복 건물 정보/추가 메뉴를 제거했습니다. 건물 편집은 마을 탭에서 합니다.
- 멀티 그룹 대표 사진을 방장·스태프가 등록할 수 있습니다. 전체 구성원 공지와 같은 그룹 유저에게 보내는 우편을 추가했습니다.

## English
- Character sharing codes now process only the selected character and their photos, avoiding a full-account upload and download.
- Reopening the app skips redundant character downloads when the cloud revision is unchanged. Changes from another device and manual restore still fetch cloud data. New photos and a new device still need an initial network transfer.
- Fixed multiplayer room grid movement/resizing, furniture transfer between rooms and horizontal flipping. The lower editing area can be scrolled clear of the furniture drawer.
- Town editing buttons are dimmed when you do not have permission.
- Directed shared activities and character-to-character gifts now approach the recipient at their current location, crossing rooms, floors, houses and the town as needed. The recipient waits in place.
- Movement is animated on each device without saving every step to the server. Gift inventory delivery and mail records remain available. Select a sending character for personal delivery.
- Members edit or propose settings through their own characters. Schedules containing only their own characters are saved directly; schedules involving other owners are proposed.
- Group owners and staff can directly create and edit relationships, viewpoints and schedules.
- Tapping a relationship or schedule notification opens its details in the mailbox.
- Removed duplicate building controls from multiplayer details; manage buildings in the Town tab.
- Added group cover photos, owner/staff announcements to all members and mail between users in the same group.

## 日本語
- キャラクター共有コードでは、選択したキャラクターと写真だけを処理します。アカウント全体の再送信・再読み込みによる待ち時間を減らしました。
- 再起動時、クラウドの保存内容が変わっていなければ同じ設定を再取得しません。別端末での変更と手動の読み込みには引き続き対応します。新しい写真と新しい端末での初回転送には通信時間が必要です。
- マルチの部屋のグリッド移動・サイズ変更、部屋をまたぐ家具移動、左右反転を修正しました。家具一覧に隠れる下側の編集領域もスクロールできます。
- 村の編集権限がない場合、編集ボタンを薄く表示します。
- 一緒に行う行動の指示やキャラクターからの贈り物では、相手がいる場所へ歩いて向かいます。必要に応じて部屋・階・家・村を移動し、相手はその場で待ちます。
- 移動は端末で再生し、一歩ごとの位置をサーバーへ保存しません。贈り物の所持品への追加と手紙の記録は維持します。直接届ける場合は差出人のキャラクターを選んでください。
- 一般メンバーは自分のキャラクターを基準に設定・提案します。自分のキャラクターだけの予定は直接設定し、ほかのユーザーが参加する予定は提案します。
- グループのオーナー・スタッフは関係・視線・予定を承認待ちなしで登録・変更できます。
- 関係・予定の通知をタップすると、郵便箱の該当内容を開きます。
- マルチ詳細の重複した建物メニューを削除しました。建物は村タブで管理します。
- グループ代表写真、オーナー・スタッフから全メンバーへのお知らせ、同じグループのユーザー間の手紙を追加しました。

## 검증 및 범위
- 서버 트랜잭션 검사: 권한·기존 제안/거절·전원 수락·일정·우편·선물 중복 지급 방지·배치 충돌. 실제 공유 엔진으로 선물 전달 경로 생성도 검사했습니다.
- 공유 코드 처리에서 계정 전체 전송 0회, 선택한 사진 처리, 다른 사진 목록 보존 및 업로드 실패 시 불완전한 코드 발행 차단을 검사했습니다.
- 자동 재접속의 동일 저장본 재사용, 변경된 저장본과 수동 복원, 계정 전환·기기 용량 부족·게스트 데이터 보존을 검사했습니다.
- Chrome 화면 검사: 그리드 조절/가구 방 이동, 권한에 따른 버튼·일정 문구, 공지·유저 우편, 알림의 해당 우편 열기, 이동 중 상대 대기·기기에서 도착 전환·추가 공유 API 호출 없음.
- 순수 이동 경로를 수천 프레임 조회해도 저장 상태가 바뀌지 않으며, 집 → 마을 → 다른 집 및 층 이동을 검사했습니다.
- 200명 공유 생활 계산과 기존 선물의 취향·관계 반응, KO/EN/JA 화면 검사를 포함합니다. 실제 두 Android 기기의 FCM 수신, 장시간 발열과 사용자 계정의 체감 속도는 실기기 확인이 남습니다.
- 최종 APK/AAB의 실행 자산 237개가 준비된 소스와 모두 일치합니다. APK 서명(v1/v2), versionCode 272 / versionName 1.0.241, 추출한 APK의 오프라인 첫 실행·캐릭터 저장·재실행 검사를 통과했습니다.
- sharedTownApi 최종 배포 완료. Play Console 업로드는 수행하지 않았습니다.
- 정적 UI 번역률: EN 2183/2871 (76.0%), JA 2182/2871 (76.0%). 이번 신규 문구는 각 기능의 KO/EN/JA 문구를 함께 제공합니다.
- Android 개발판 및 공통 웹 소스 대상입니다. 운영 main264와 운영 iOS14 출시는 분리 유지합니다. 개발 저장소의 iOS 메타데이터는 아직 266이므로 iOS/Android 버전 일치 검사는 통과하지 않습니다. 새 IPA·TestFlight·App Store 제출은 하지 않았습니다.

## 서버비에 관한 정확한 범위
걷기 애니메이션은 좌표를 프레임마다 저장하지 않습니다. 처음 행동을 지정하는 요청, 실제 생활 결과·우편·선물 저장, 실시간 수신, 사진 전송과 서버 실행 비용은 남습니다. 앱 전체가 무료로 운영된다는 뜻이나 실제 청구액 절감률은 아닙니다. 271의 중복 저장·요청·구독 방지 작업은 유지하며, 생활/설정/과거 로그 전송 분리와 실사용량 측정은 작업판의 후속 과제로 남깁니다.
