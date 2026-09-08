# 서랍마을 개발판 1.0.246 (279)

2026-09-08 · 이전 제공 개발판278 이후 변경사항. 운영main274 유지.

## 한국어

🔧 개선 사항
- 생활 장면이 바뀌는 시각에 맞춰 멀티 계산을 요청하고, 설정 화면과 우편의 불필요한 반복 조회를 줄였습니다. 이동 경로의 애니메이션은 기기에서 계산합니다.
- 개인 마을과 멀티 마을에서 같은 계정의 우편을 확인합니다. 다른 그룹에서 온 제안에도 우편함에서 답변할 수 있습니다.
- 캐릭터·유저의 발신 사진, 받는 이 종류 선택, 관계 제안과 답변 제목·본문·설정 표를 정리했습니다.
- 우편함의 하단 여백을 맞추고, 받은 우편은 화면 높이에 따라 페이지로 나누었습니다. 긴 작성 양식은 종이 영역 안에서 스크롤합니다.
- 멀티 마을 관리에 새 마을 추가를 넣었습니다. 남은 마을 슬롯과 관리 권한이 필요합니다.

💕 캐릭터 생활
- 둘만의 시간을 보내는 홈 화면의 분홍·붉은 애정 연출을 강화했습니다.
- 두 캐릭터의 접촉 허용 단계를 모두 확인합니다. 원하지 않는 접촉을 요청하면 걸어가 대화한 뒤 접촉 없이 마무리합니다.
- 성인 연인은 설정과 성향에 따라 드물게 스스로 둘만의 시간을 제안합니다.
- 커플 침대에 도착하면 기존 침대·이불 안에 두 캐릭터를 배치하고 좌우 순서를 유지합니다.
- 사적인 시간이나 씻는 중인 방에 들어온 캐릭터가 놀라 자리를 피하는 반응을 추가했습니다. 함께 설정된 다인 연인 관계는 예외이며, 연인의 다른 관계를 목격하면 질투 설정을 따릅니다.

🐛 오류 수정
- 산책 중인 인물이나 문자로 연락하는 상대가 옆에 있는 것처럼 나타나던 표시를 수정했습니다.
- 같은 대화의 상대 화면에서 다른 이야기를 새로 고르는 문제를 수정했습니다.
- 욕조 같은 가구를 자기 쪽으로 옮겼다고 표현하던 문장을 수정했습니다.

## English
- Shared life updates follow upcoming scene boundaries; unnecessary management-screen requests and mail subscriptions are reduced. Movement animation remains local.
- Account mail is available across personal and multiplayer worlds, with cross-group proposal responses, sender portraits, recipient categories and clearer proposal tables.
- Inbox pages adapt to screen height with balanced bottom spacing. Long compose forms scroll inside the paper.
- Managers can add a town when town capacity is available.
- Stronger pink/red romance presentation; both characters’ touch limits are respected. Declined contact becomes a walking approach and a respectful conversation.
- Adult partners may occasionally initiate private time according to their preferences. Arrived double-bed occupants use the existing blanket layers and configured side order.
- Private-room interruptions cause a startled exit; acknowledged multi-partner relationships are exempt, and jealousy follows relationship settings.
- Fixed remote or absent characters appearing physically together, inconsistent counterpart stories, and awkward furniture-moving wording.

## 日本語
- 生活場面の切り替わりに合わせてマルチの計算を行い、管理画面の不要な呼び出しと手紙の常時購読を減らしました。移動アニメーションは端末で計算します。
- 個人の村とマルチの村で同じアカウントの手紙を確認できます。別グループの提案への返答、差出人の画像、宛先の種類、提案内容の表を整えました。
- 受信一覧は画面の高さに合わせてページ分けし、下の余白をそろえました。長い作成フォームは便箋内でスクロールします。
- 村の空き枠と管理権限がある場合、マルチの村を追加できます。
- ピンク・赤の恋愛演出を強め、双方の触れ合いの許容範囲を確認します。望まない接触は、歩いて会いに行った後の丁寧な会話で終わります。
- 成人の恋人は設定や性格に応じて、時折自分から二人の時間を提案します。ダブルベッドでは布団の内側に入り、左右の設定を保ちます。
- 私的な時間や入浴への割り込みで驚いて部屋を出る反応を追加しました。合意された複数人の恋人関係は例外とし、嫉妬は関係設定に従います。
- 遠隔連絡や別の場所にいる人物の同席表示、相手側で食い違う話題、不自然な家具移動の文章を修正しました。

## 検証・검증 범위
브라우저 UI·서버 서비스·계정 격리·접촉 허용/거절·침대 위치·사생활 퇴실/다인 예외·집 생활70항목 검사 통과. 실제 두 기기의 푸시·발소리·발열과 Firebase 청구액 비교는 미실측입니다. iOS 서명 빌드 및 Play Console 업로드는 하지 않았습니다.
