# 서랍마을 개발판 291 · 1.0.258

## 한국어
- 마지막 개인 캐릭터가 멀티로 이사한 뒤 홈 아이콘이 크게 늘어나거나 일정·사전 화면이 깨지는 오류를 수정했습니다. 빈 캐릭터 목록에서도 마을/그룹을 다시 선택할 수 있습니다.
- 캐릭터 공유 메뉴를 공유 코드 만들기, 공유 코드로 불러오기, PNG 증명서, PDF 증명서로 정리했습니다.
- 집 정보에서 집 공유 코드를 만들 수 있습니다. 집 정보·방 정보·가구·인테리어 배치를 함께 가져옵니다.
- 설정의 ‘공유 코드 · 마을 이전’에서 집, 관계, 마을 전체의 공유 코드를 만들거나 불러올 수 있습니다. 관계 화면에서도 관계 공유를 열 수 있습니다.
- 마을 전체 코드는 캐릭터·집·내부 관계·일정·마을 정보와 배치를 새 사본으로 가져옵니다. 새 캐릭터/마을 슬롯과 사전 한도가 적용됩니다.
- 관계만 불러올 때는 상대 캐릭터를 직접 연결합니다. 이미 존재하는 관계는 덮어쓰지 않습니다. 캐릭터 하나의 공유 코드를 불러오는 것만으로 다른 인물과의 관계가 자동 복제되지는 않습니다.
- 선택한 개인 마을을 자신이 방장인 그룹의 빈 멀티 마을로 함께 이사시킬 수 있습니다. 목적지 마을은 미리 만들어 두어야 합니다. 캐릭터·집·해당 마을 내부 관계를 함께 이동하며 원래 개인 마을의 빈 지도는 귀환 장소로 남습니다. 마을 밖 캐릭터와의 관계는 이전 대상에서 제외되며 확인 화면에서 안내합니다.
- 사진 업로드 실패·슬롯 부족·비어 있지 않은 목적지는 이전을 중단합니다. 같은 이사 요청을 재시도해도 중복으로 생성하지 않습니다.

## English
- Fixed oversized home icons and broken schedule/catalog layouts after the last personal character moves to multiplayer. Empty character lists keep the town/group selector available.
- Simplified character sharing to Create sharing code, Import using sharing code, PNG certificate and PDF certificate.
- Added home codes containing home and room settings, furnishings and interior placement.
- Added home, relationship and whole-town sharing under Settings. Relationship sharing is also available on the Relationships screen.
- Whole-town codes import a new copy with characters, homes, internal relationships, schedules and town layout. Character/town slots and the catalog limit apply.
- Relationship-only imports require explicit character matching and never overwrite an existing relationship. A single-character code does not automatically copy relationships with other characters.
- Move a personal town into an existing empty multiplayer town in a group you own. Characters, homes and internal relationships move together; the original empty personal map remains as a return location. Relationships with characters outside the selected town are excluded and identified in the confirmation.
- Failed photo uploads, insufficient slots and occupied destinations stop the transfer. Retrying the same move does not create duplicates.

## 日本語
- 個人の最後のキャラクターがマルチへ引っ越した後、ホームのアイコンが巨大化し、予定・図鑑の表示が崩れる不具合を修正しました。空のキャラクター一覧でも村やグループを選び直せます。
- キャラクター共有メニューを共有コード作成、共有コードで読み込み、PNG証明書、PDF証明書に整理しました。
- 家・部屋の情報、家具と内装配置を含む家の共有コードを追加しました。
- 設定から家・関係・村全体の共有コードを作成、読み込みできます。関係画面からも関係の共有を開けます。
- 村全体のコードはキャラクター・家・村内の関係・予定・村情報と配置を新しいコピーとして読み込みます。キャラクター・村の枠数と図鑑の上限が適用されます。
- 関係のみの読み込みでは対象キャラクターを指定します。既存の関係は上書きしません。キャラクター単体のコードでは他の人物との関係を自動複製しません。
- 自分がオーナーのグループにある、事前に作成した空のマルチ村へ個人の村をまとめて移せます。キャラクター・家・村内の関係を移し、元の空の個人マップは帰還先として残します。村外の人物との関係は対象外で、確認画面に表示します。
- 写真のアップロード失敗、枠不足、使用中の移動先では処理を中止します。同じ引っ越しの再試行でも重複作成しません。
