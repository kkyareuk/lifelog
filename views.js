import {state,active,characterViewFor,explicitCharacterViewFor} from "./state.js?v=20260815av";
import {eventFor as simulateEventFor,visibleTimeline as simulateVisibleTimeline,charactersAtPlace,homeGroups} from "./simulation.js?v=20260815av";
// Cache-busted state module is imported above; this comment intentionally keeps the view bundle versioned.
const esc=(x="")=>String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const I18N={
  en:{brandName:"Drawer Village",observe:"Observe",home:"Home",character:"Characters",catalog:"Collection",relationship:"Relationships",routine:"Weekly routine",statistics:"Statistics",town:"Town",shop:"Shop",settings:"Settings",saved:"Saved on this device",brandTagline:"Character life observation game",currentMoment:"Current moment",todayLog:"Today's log",expand:"Expand",collapse:"Collapse",viewAll:"View all",viewHome:"View home",language:"Language",languageHelp:"English covers the main interface, and more life scenes and relationship text are translated with every update.",languageNote:"English Beta · Interface and selected life scenes translated; coverage keeps expanding."},
  ja:{brandName:"ひきだし村",observe:"観察",home:"家",character:"キャラクター",catalog:"好み図鑑",relationship:"関係",routine:"週間ルーティン",statistics:"統計",town:"村",shop:"ショップ",settings:"設定",saved:"端末に保存済み",brandTagline:"引き出しの中のキャラクター生活観察ゲーム",currentMoment:"今この瞬間",todayLog:"今日の記録",expand:"開く",collapse:"閉じる",viewAll:"すべて見る",viewHome:"家を見る",language:"言語",languageHelp:"日本語は基本画面に対応し、生活シーンや関係文もアップデートごとに翻訳を増やしています。",languageNote:"日本語ベータ・基本画面と一部の生活シーンに対応。翻訳範囲を継続して拡大します。"}
};
const t=(key,fallback)=>I18N[state.uiLanguage]?.[key]||fallback;
const uiLocale=()=>({en:"en-US",ja:"ja-JP"}[state.uiLanguage]||"ko-KR");
const UI_TEXT={
  en:{
    "캐릭터 목록":"Character list","첫 캐릭터를 만들어 주세요":"Create your first character","+ 캐릭터 만들기":"+ Create character","+ 생성":"+ Create","프로필":"Profile","신체":"Body","성격":"Personality","취향 선택":"Preferences","세계관 선호":"Worldview","사진·SD·LD·테마":"Images · SD · LD · Theme","프로필 내보내기":"Export profile","캐릭터 저장":"Save character","캐릭터 삭제":"Delete character","기본 생활 마을":"Home town","캐릭터 이름":"Character name","나이대":"Age group","직업 종류":"Occupation","표기할 직업명":"Displayed job title","출근할 건물":"Workplace","소비 유형":"Spending style","기상 시각":"Wake-up time","취침 시각":"Bedtime","투명 SD 아이콘":"Transparent SD icon","홈화면 LD 일러스트":"Home-screen LD illustration","홈화면 기본 표현":"Default home visual","홈화면 캐릭터 크기":"Home character size","테마색 설정":"Theme colors","기본":"Neutral","기쁨":"Joy","슬픔":"Sad","화남":"Angry","피곤":"Tired","파일":"File","링크":"Link","지우기":"Clear","화면 모드":"Display mode","화이트 모드":"Light mode","다크 모드":"Dark mode","전체 색상 테마":"Color theme","글자와 화면 크기":"Text and display size","글자 크기":"Text size","사용할 글꼴":"Font","마을 지도 표시":"Town map display","건물 표기 방식":"Building labels","지도 위 캐릭터 표기":"Character labels on map","Google 계정과 데이터":"Google account and data","Google 로그인 / 로그아웃":"Google sign in / out","동기화":"Sync","불러오기":"Load","브라우저 백업 파일":"Browser backup file","백업 파일 내보내기":"Export backup","백업 파일 불러오기":"Import backup","개발자에게 피드백 보내기":"Send feedback to the developer","피드백 보내기":"Send feedback","페이지 안내":"Page guides","모든 페이지 안내 다시 보기":"Show all page guides again","모든 데이터 초기화":"Reset all data","상점":"Shop","장바구니":"Cart","장바구니에 담기":"Add to cart","출시 준비 중":"Coming soon","직업 확장팩":"Occupation Expansion","더 넓은 직업의 하루":"More careers, richer daily lives","가격 미정":"Price TBD","테마 DLC":"Theme DLC","구매 복원":"Restore purchases","관계":"Relationships","주간 루틴":"Weekly routine","마을":"Town","취향 사전":"Collection","캐릭터":"Characters","현재 시각":"Current time","관찰 중":"Observing","현재 장면":"Current scene","오늘의 생활 로그":"Today's life log","아직 기록이 없어요":"No entries yet","조금 뒤 새로운 생활 장면이 나타납니다.":"A new life scene will appear shortly.","눌러서 펼쳐 보기 ↗":"Tap to expand ↗","전체 보기":"View all","집 보기":"View home","저장":"Save","삭제":"Delete","완료":"Done","편집":"Edit","이름만 표시":"Names only","아무 글자도 표시하지 않기":"Hide all labels","캐릭터 아이콘만 표시":"Icons only","아이콘 아래 이름 표시":"Names below icons","작게":"Small","보통":"Medium","크게":"Large","아주 크게":"Extra large","기기·브라우저 기본 글꼴":"Device / browser default","SD · 아이콘":"SD · Icon","LD · 전신 일러스트":"LD · Full-body illustration","한국어":"한국어","현재 마을 삭제":"Delete current town","+ 마을 추가":"+ Add town","편집 모드":"Edit mode","편집 완료":"Finish editing","집 설정":"Home settings","방 추가·구성":"Add / arrange rooms","구성원":"Residents","반려생물":"Pets","자동차":"Cars","로그":"Log"
  },
  ja:{
    "캐릭터 목록":"キャラクター一覧","첫 캐릭터를 만들어 주세요":"最初のキャラクターを作ってください","+ 캐릭터 만들기":"＋キャラクター作成","+ 생성":"＋作成","프로필":"プロフィール","신체":"身体","성격":"性格","취향 선택":"好み","세계관 선호":"世界観","사진·SD·LD·테마":"画像・SD・LD・テーマ","프로필 내보내기":"プロフィールを書き出す","캐릭터 저장":"キャラクターを保存","캐릭터 삭제":"キャラクターを削除","기본 생활 마을":"生活する村","캐릭터 이름":"キャラクター名","나이대":"年齢層","직업 종류":"職業","표기할 직업명":"表示する職業名","출근할 건물":"勤務先","소비 유형":"消費スタイル","기상 시각":"起床時刻","취침 시각":"就寝時刻","투명 SD 아이콘":"透過SDアイコン","홈화면 LD 일러스트":"ホーム画面のLDイラスト","홈화면 기본 표현":"ホーム画面の基本表示","홈화면 캐릭터 크기":"ホーム画面のキャラクターサイズ","테마색 설정":"テーマカラー","기본":"通常","기쁨":"喜び","슬픔":"悲しみ","화남":"怒り","피곤":"疲れ","파일":"ファイル","링크":"リンク","지우기":"消去","화면 모드":"画面モード","화이트 모드":"ライトモード","다크 모드":"ダークモード","전체 색상 테마":"全体カラーテーマ","글자와 화면 크기":"文字と画面サイズ","글자 크기":"文字サイズ","사용할 글꼴":"フォント","마을 지도 표시":"村マップ表示","건물 표기 방식":"建物ラベル","지도 위 캐릭터 표기":"マップ上のキャラクター表示","Google 계정과 데이터":"Googleアカウントとデータ","Google 로그인 / 로그아웃":"Googleログイン／ログアウト","동기화":"同期","불러오기":"読み込む","브라우저 백업 파일":"ブラウザのバックアップ","백업 파일 내보내기":"バックアップを書き出す","백업 파일 불러오기":"バックアップを読み込む","개발자에게 피드백 보내기":"開発者へフィードバック","피드백 보내기":"フィードバックを送る","페이지 안내":"ページガイド","모든 페이지 안내 다시 보기":"すべてのページガイドを再表示","모든 데이터 초기화":"すべてのデータを初期化","상점":"ショップ","장바구니":"カート","장바구니에 담기":"カートに追加","출시 준비 중":"リリース準備中","직업 확장팩":"職業拡張パック","더 넓은 직업의 하루":"もっと多彩な職業生活","가격 미정":"価格未定","테마 DLC":"テーマDLC","구매 복원":"購入を復元","관계":"関係","주간 루틴":"週間ルーティン","마을":"村","취향 사전":"好み図鑑","캐릭터":"キャラクター","현재 시각":"現在時刻","관찰 중":"観察中","현재 장면":"現在のシーン","오늘의 생활 로그":"今日の生活ログ","아직 기록이 없어요":"まだ記録がありません","조금 뒤 새로운 생활 장면이 나타납니다.":"しばらくすると新しい生活シーンが表示されます。","눌러서 펼쳐 보기 ↗":"タップして開く ↗","전체 보기":"すべて見る","집 보기":"家を見る","저장":"保存","삭제":"削除","완료":"完了","편집":"編集","이름만 표시":"名前のみ表示","아무 글자도 표시하지 않기":"ラベルを表示しない","캐릭터 아이콘만 표시":"アイコンのみ","아이콘 아래 이름 표시":"アイコンの下に名前","작게":"小","보통":"標準","크게":"大","아주 크게":"特大","기기·브라우저 기본 글꼴":"端末・ブラウザの標準フォント","SD · 아이콘":"SD・アイコン","LD · 전신 일러스트":"LD・全身イラスト","한국어":"한국어","현재 마을 삭제":"現在の村を削除","+ 마을 추가":"＋村を追加","편집 모드":"編集モード","편집 완료":"編集完了","집 설정":"家の設定","방 추가·구성":"部屋の追加・配置","구성원":"住人","반려생물":"ペット","자동차":"車","로그":"ログ"
  }
};
const UI_TEXT_MORE={
  en:{
    "로그인 전에는 예시 캐릭터나 실제 지역이 표시되지 않아요.":"No sample characters or real-world locations are shown before you sign in.",
    "이 마을에 사는 캐릭터가 없어요":"No characters live in this town yet",
    "캐릭터 화면에서 생활하는 마을을 지정해 주세요.":"Choose a home town from the Characters screen.",
    "캐릭터 설정 열기":"Open character settings","이 화면의 일부 데이터를 읽지 못했어요":"Some data on this screen could not be loaded",
    "저장 데이터는 지우거나 바꾸지 않았습니다. 다른 화면은 계속 사용할 수 있어요.":"Your saved data was not deleted or changed. You can keep using the other screens.",
    "관찰 화면으로 이동":"Go to Observe","설정 열기":"Open Settings","현재 장면 새로고침":"Refresh current scene",
    "생활 중":"Living their day","이동 중":"In transit","외출 중":"Out and about","집 안":"Inside the home",
    "모든 인물이 자고 있습니다":"Everyone is asleep","마을은 조용해졌어요. 집에서 인물들의 수면 상태를 볼 수 있어요.":"The town has gone quiet. Open Home to see how everyone is sleeping.",
    "관찰할 마을":"Town to observe","관찰 캐릭터 선택":"Choose a character to observe","오늘의 기록 전체 보기":"Open today's full log",
    "닫기":"Close","생활 로그":"Life log","관찰과 집에서 같은 기록을 보여줘요":"Observe and Home show the same entries.",
    "프로필 사진":"Profile photo","사진 파일":"Photo file","사진 링크":"Photo link","SD PNG 파일":"SD PNG file","SD 링크":"SD link",
    "프로필 자리에서만 여백 없이 동그랗게 보여요. SD 아이콘으로 복사되지 않습니다.":"Shown as a full-bleed circle only in profile slots. It is never copied to the SD icon.",
    "별도로 등록했을 때만 사용해요. 투명 PNG 전체가 잘리지 않도록 원본 비율을 유지합니다.":"Used only when uploaded separately. Transparent PNGs keep their full aspect ratio without cropping.",
    "SD와 LD가 모두 있으면 홈화면에서도 바로 전환할 수 있어요.":"When both SD and LD are available, you can switch between them on the home screen.",
    "버튼 색을 고르거나 색상 선택기와 HEX 값으로 직접 입력할 수 있어요.":"Choose a preset or enter a color directly with the picker or HEX value.",
    "대표 테마색":"Primary theme color","그라데이션 보조색":"Gradient secondary color","보조색으로 그라데이션 사용":"Use a gradient with the secondary color",
    "캐릭터 삭제 전 경고를 확인한 뒤 이 캐릭터와 연결된 기록을 정리해요.":"Review the warning before removing this character and their linked records.",
    "관계인 캐릭터별 시선":"Each character's point of view","두 이름을 눌러 누구의 마음이 누구에게 향하는지 고르세요.":"Choose two names to decide whose feelings are directed at whom.",
    "선택한 방향의 마음":"Selected point of view","이 시선 편집하기":"Edit this point of view","+ 공식 관계 설정":"+ Add official relationship","공식 관계 목록":"Official relationships","관계도 보기":"View relationship map",
    "전체적인 감정":"Overall feelings","중요도":"Importance","감정 자각":"Awareness of feelings","상대의 마음을 아는 정도":"Awareness of the other's feelings",
    "신뢰":"Trust","정서적 친밀감":"Emotional closeness","함께 있을 때의 편안함과 대화 호흡":"Comfort and conversational chemistry","성가심":"Annoyance",
    "챙기고 신경 쓰는 정도":"Attention and care","질투·독점욕":"Jealousy and possessiveness","갈등 강도":"Conflict intensity","관계에 대한 기대":"Expectations for the relationship",
    "허용하고 표현하는 스킨십 범위":"Comfortable physical affection","공격·위해 충동":"Aggressive impulses","충동을 실제로 표현하는 단계":"How impulses are acted on",
    "이 시선 초기화":"Reset this point of view","편집 완료":"Finish editing","공식 관계 없음 · 이방인":"No official relationship · Strangers",
    "밝은 화면과 어두운 화면 중 읽기 편한 쪽을 고르세요.":"Choose the light or dark display that is easiest for you to read.",
    "화이트·다크 모드는 밝기를, 색상 테마는 버튼과 강조색을 정해요.":"Light and dark modes control brightness; the color theme controls buttons and accents.",
    "같은 건물에 있는 캐릭터는 지도에서 한 묶음으로 표시됩니다.":"Characters in the same building are grouped together on the map.",
    "동기화와 불러오기는 필요할 때만 설정에서 사용해요.":"Use Sync or Load here whenever you need them.",
    "Firebase가 막혀도 현재 데이터와 사진을 파일 하나로 보관할 수 있어요.":"Keep your current data and images in one backup file even when cloud sync is unavailable.",
    "버튼을 누르면 기기의 메일 앱에서 개발자 이메일로 바로 작성할 수 있어요. 사이트의 별도 피드백함에는 저장하지 않습니다.":"Open your device's mail app and write directly to the developer. Nothing is stored in a separate site inbox.",
    "이메일로 피드백 보내기":"Send feedback by email","받는 주소":"Recipient","마을 편집":"Edit town","마을 이름":"Town name","마을 시대":"Town era",
    "현대":"Modern","중세":"Medieval","기본 배경":"Default background","제공한 손그림 마을":"Provided hand-drawn town","+ 건물 추가":"+ Add building",
    "마을을 만드는 순서":"How to build a town","마을 이름과 배경을 고르세요.":"Choose a town name and background.","건물을 추가하고 유형을 고르세요.":"Add buildings and choose their types.","지도에서 건물을 끌어 위치를 정하세요.":"Drag buildings on the map to place them.",
    "마을 설정":"Town settings","+ 건물":"+ Building","편집 종료":"Stop editing","건물 편집":"Edit building","현재 마을":"Current town"
  },
  ja:{
    "로그인 전에는 예시 캐릭터나 실제 지역이 표시되지 않아요.":"ログイン前はサンプルキャラクターや実在の地域を表示しません。",
    "이 마을에 사는 캐릭터가 없어요":"この村にはまだキャラクターが住んでいません","캐릭터 화면에서 생활하는 마을을 지정해 주세요.":"キャラクター画面で生活する村を選んでください。",
    "캐릭터 설정 열기":"キャラクター設定を開く","이 화면의 일부 데이터를 읽지 못했어요":"この画面の一部のデータを読み込めませんでした",
    "저장 데이터는 지우거나 바꾸지 않았습니다. 다른 화면은 계속 사용할 수 있어요.":"保存データは削除・変更されていません。他の画面は引き続き利用できます。",
    "관찰 화면으로 이동":"観察画面へ","설정 열기":"設定を開く","현재 장면 새로고침":"現在のシーンを更新","생활 중":"生活中","이동 중":"移動中","외출 중":"外出中","집 안":"家の中",
    "모든 인물이 자고 있습니다":"全員が眠っています","마을은 조용해졌어요. 집에서 인물들의 수면 상태를 볼 수 있어요.":"村は静かになりました。家でみんなの睡眠状態を確認できます。",
    "관찰할 마을":"観察する村","관찰 캐릭터 선택":"観察するキャラクターを選択","오늘의 기록 전체 보기":"今日の記録をすべて見る","닫기":"閉じる","생활 로그":"生活ログ","관찰과 집에서 같은 기록을 보여줘요":"観察と家では同じ記録を表示します。",
    "프로필 사진":"プロフィール写真","사진 파일":"写真ファイル","사진 링크":"写真リンク","SD PNG 파일":"SD PNGファイル","SD 링크":"SDリンク",
    "프로필 자리에서만 여백 없이 동그랗게 보여요. SD 아이콘으로 복사되지 않습니다.":"プロフィール欄だけで余白のない円形表示になります。SDアイコンにはコピーされません。",
    "별도로 등록했을 때만 사용해요. 투명 PNG 전체가 잘리지 않도록 원본 비율을 유지합니다.":"別途登録した場合のみ使用します。透過PNGは切れないよう元の比率を保ちます。",
    "SD와 LD가 모두 있으면 홈화면에서도 바로 전환할 수 있어요.":"SDとLDの両方がある場合、ホーム画面ですぐに切り替えられます。",
    "버튼 색을 고르거나 색상 선택기와 HEX 값으로 직접 입력할 수 있어요.":"プリセットを選ぶか、カラーピッカーやHEX値で直接入力できます。",
    "대표 테마색":"メインテーマカラー","그라데이션 보조색":"グラデーション補助色","보조색으로 그라데이션 사용":"補助色でグラデーションを使用",
    "관계인 캐릭터별 시선":"キャラクターごとの視点","두 이름을 눌러 누구의 마음이 누구에게 향하는지 고르세요.":"2人の名前を押して、誰の気持ちが誰に向いているか選んでください。",
    "선택한 방향의 마음":"選択した方向の気持ち","이 시선 편집하기":"この視点を編集","+ 공식 관계 설정":"＋公式関係を設定","공식 관계 목록":"公式関係一覧","관계도 보기":"関係図を見る",
    "전체적인 감정":"全体的な感情","중요도":"重要度","감정 자각":"感情の自覚","상대의 마음을 아는 정도":"相手の気持ちの理解","신뢰":"信頼","정서적 친밀감":"心の親密さ",
    "함께 있을 때의 편안함과 대화 호흡":"一緒にいる時の安心感と会話の相性","성가심":"煩わしさ","챙기고 신경 쓰는 정도":"気にかける度合い","질투·독점욕":"嫉妬・独占欲","갈등 강도":"対立の強さ","관계에 대한 기대":"関係への期待",
    "허용하고 표현하는 스킨십 범위":"許容・表現するスキンシップ","공격·위해 충동":"攻撃・加害衝動","충동을 실제로 표현하는 단계":"衝動を実際に表す段階","이 시선 초기화":"この視点をリセット","편집 완료":"編集完了","공식 관계 없음 · 이방인":"公式関係なし・他人",
    "밝은 화면과 어두운 화면 중 읽기 편한 쪽을 고르세요.":"ライトとダークから読みやすい表示を選んでください。","화이트·다크 모드는 밝기를, 색상 테마는 버튼과 강조색을 정해요.":"ライト・ダークは明るさを、カラーテーマはボタンと強調色を設定します。",
    "같은 건물에 있는 캐릭터는 지도에서 한 묶음으로 표시됩니다.":"同じ建物にいるキャラクターはマップ上でまとめて表示されます。","동기화와 불러오기는 필요할 때만 설정에서 사용해요.":"同期と読み込みは必要な時に設定から利用できます。",
    "Firebase가 막혀도 현재 데이터와 사진을 파일 하나로 보관할 수 있어요.":"クラウド同期が使えない時も、現在のデータと写真を1つのファイルに保存できます。",
    "버튼을 누르면 기기의 메일 앱에서 개발자 이메일로 바로 작성할 수 있어요. 사이트의 별도 피드백함에는 저장하지 않습니다.":"ボタンを押すと端末のメールアプリから開発者へ直接送信できます。サイト内の別の受信箱には保存されません。","이메일로 피드백 보내기":"メールでフィードバック","받는 주소":"宛先",
    "마을 편집":"村を編集","마을 이름":"村の名前","마을 시대":"村の時代","현대":"現代","중세":"中世","기본 배경":"基本背景","제공한 손그림 마을":"提供された手描きの村","+ 건물 추가":"＋建物を追加","마을을 만드는 순서":"村の作り方","마을 이름과 배경을 고르세요.":"村の名前と背景を選びます。","건물을 추가하고 유형을 고르세요.":"建物を追加して種類を選びます。","지도에서 건물을 끌어 위치를 정하세요.":"マップ上で建物をドラッグして配置します。","마을 설정":"村の設定","+ 건물":"＋建物","편집 종료":"編集を終了","건물 편집":"建物を編集","현재 마을":"現在の村"
  }
};
Object.entries(UI_TEXT_MORE).forEach(([locale,copy])=>Object.assign(UI_TEXT[locale],copy));
Object.assign(UI_TEXT.en,{
  "건물 정보 보기":"View building details","유형 미설정":"Type not set","내부 이미지가 아직 없어요":"No interior image yet","마을 편집에서 내부 사진을 등록할 수 있어요.":"Add an interior image from Town editing.",
  "건물 유형":"Building type","가격대":"Price range","주요 이용층":"Main visitors","지금 안에 있는 인물":"Characters inside now","이곳에서 이용할 수 있는 것":"Available here",
  "현재 이 건물 안에 있는 캐릭터가 없어요.":"No characters are inside this building right now.","등록된 판매 상품이나 이용 항목이 없어요.":"No products or services have been added yet.","유형 미설정":"Type not set","설정하지 않음":"Not set"
});
Object.assign(UI_TEXT.ja,{
  "건물 정보 보기":"建物情報を見る","유형 미설정":"種類未設定","내부 이미지가 아직 없어요":"内観画像はまだありません","마을 편집에서 내부 사진을 등록할 수 있어요.":"村の編集画面から内観画像を登録できます。",
  "건물 유형":"建物の種類","가격대":"価格帯","주요 이용층":"主な利用者","지금 안에 있는 인물":"現在中にいるキャラクター","이곳에서 이용할 수 있는 것":"ここで利用できるもの",
  "현재 이 건물 안에 있는 캐릭터가 없어요.":"現在この建物の中にいるキャラクターはいません。","등록된 판매 상품이나 이용 항목이 없어요.":"販売商品や利用項目はまだ登録されていません。","유형 미설정":"種類未設定","설정하지 않음":"未設定"
});
Object.assign(UI_TEXT.en,{
  "이미지·표현·파일":"Images · Visuals · Files",
  "어린이":"Child","청소년":"Teen","성인":"Adult","노년":"Older adult","설정하지 않음":"Not set","무직":"Unemployed","학생":"Student","회사원":"Office worker","의사":"Doctor","간호사":"Nurse","교사":"Teacher","교수":"Professor","정치인":"Politician","기자":"Journalist","요리사":"Cook / chef","프로그래머":"Programmer","연구원":"Researcher","가수":"Singer","아이돌":"Idol","예술가":"Artist","해적":"Pirate","군인":"Soldier","범죄자":"Criminal","환경미화원":"Sanitation worker","여관주인":"Innkeeper","자영업·직접 입력":"Self-employed / custom",
  "정하지 않음":"Not set","낯선 사람으로 여김":"Sees them as a stranger","매우 싫어함":"Strongly dislikes them","미워함":"Hates them","경계함":"Is wary of them","불편해함":"Feels uncomfortable around them","부담스러워함":"Feels pressured by them","경쟁심을 느낌":"Feels competitive","애증을 느낌":"Feels love and hate","그저 그런 사람":"Feels neutral about them","흥미롭게 여김":"Finds them intriguing","인간적인 호감이 있음":"Likes them as a person","친구로 좋아함":"Likes them as a friend","존경함":"Respects them","동경함":"Admires them","안쓰럽게 여김":"Feels protective of them","소중하게 여김":"Treasures them","연애 감정이 싹틈":"Romantic feelings are beginning","연애 감정으로 좋아함":"Likes them romantically","깊이 사랑함":"Loves them deeply","없어서는 안 될 사람":"Cannot imagine life without them",
  "연인":"Partners","부부":"Married couple","친구":"Friends","소꿉친구":"Childhood friends","부모·자녀":"Parent and child","형제·자매":"Siblings","동거인":"Housemates","혐관":"Hostile relationship","짝사랑":"One-sided love","현재":"Current","과거":"Past",
  "사진·SD·LD":"Images · SD · LD","사진·기본 정보·생활 습관":"Photo · Profile · Lifestyle","이미지·표현·테마·파일":"Images · Visuals · Theme · Files","프로필 사진 첨부":"Add profile photo","사진 파일 선택":"Choose photo file","사진 지우기":"Remove photo","운전·흡연·주량":"Driving · Smoking · Alcohol","운전면허·운전 경험":"Driver's license and experience","흡연 여부":"Smoking status","주량":"Alcohol tolerance","면허 없음":"No license","면허만 있음 · 운전하지 않음":"Licensed · Does not drive","초보운전":"Beginner driver","가끔 운전함":"Drives occasionally","운전에 익숙함":"Experienced driver","장거리·야간 운전도 익숙함":"Experienced with long-distance and night driving","비흡연":"Non-smoker","금연 중":"Quit smoking","가끔 흡연":"Occasional smoker","전자담배 사용":"Uses e-cigarettes","흡연":"Smoker","마시지 않음":"Does not drink","한두 모금":"A sip or two","매우 약함":"Very low tolerance","약한 편":"Low tolerance","강한 편":"High tolerance","매우 강함":"Very high tolerance"
});
Object.assign(UI_TEXT.ja,{
  "이미지·표현·파일":"画像・表示・ファイル",
  "어린이":"子ども","청소년":"青少年","성인":"成人","노년":"高齢","설정하지 않음":"未設定","무직":"無職","학생":"学生","회사원":"会社員","의사":"医師","간호사":"看護師","교사":"教師","교수":"教授","정치인":"政治家","기자":"記者","요리사":"料理人","프로그래머":"プログラマー","연구원":"研究員","가수":"歌手","아이돌":"アイドル","예술가":"芸術家","해적":"海賊","군인":"軍人","범죄자":"犯罪者","환경미화원":"清掃員","여관주인":"宿屋の主人","자영업·직접 입력":"自営業・自由入力",
  "정하지 않음":"未設定","낯선 사람으로 여김":"他人だと思う","매우 싫어함":"とても嫌っている","미워함":"憎んでいる","경계함":"警戒している","불편해함":"居心地が悪い","부담스러워함":"重荷に感じる","경쟁심을 느낌":"競争心を感じる","애증을 느낌":"愛憎を抱く","그저 그런 사람":"特に何も感じない","흥미롭게 여김":"興味深く思う","인간적인 호감이 있음":"人として好感を持つ","친구로 좋아함":"友人として好き","존경함":"尊敬している","동경함":"憧れている","안쓰럽게 여김":"気の毒に思う","소중하게 여김":"大切に思う","연애 감정이 싹틈":"恋愛感情が芽生える","연애 감정으로 좋아함":"恋愛対象として好き","깊이 사랑함":"深く愛している","없어서는 안 될 사람":"かけがえのない人",
  "연인":"恋人","부부":"夫婦","친구":"友人","소꿉친구":"幼なじみ","부모·자녀":"親子","형제·자매":"きょうだい","동거인":"同居人","혐관":"険悪な関係","짝사랑":"片思い","현재":"現在","과거":"過去",
  "사진·SD·LD":"画像・SD・LD","사진·기본 정보·생활 습관":"写真・基本情報・生活習慣","이미지·표현·테마·파일":"画像・表示・テーマ・ファイル","프로필 사진 첨부":"プロフィール写真を追加","사진 파일 선택":"写真ファイルを選択","사진 지우기":"写真を削除","운전·흡연·주량":"運転・喫煙・酒量","운전면허·운전 경험":"運転免許・運転経験","흡연 여부":"喫煙状況","주량":"お酒の強さ","면허 없음":"免許なし","면허만 있음 · 운전하지 않음":"免許あり・運転しない","초보운전":"初心者ドライバー","가끔 운전함":"時々運転する","운전에 익숙함":"運転に慣れている","장거리·야간 운전도 익숙함":"長距離・夜間運転にも慣れている","비흡연":"非喫煙","금연 중":"禁煙中","가끔 흡연":"時々喫煙","전자담배 사용":"電子タバコを使用","흡연":"喫煙","마시지 않음":"飲まない","한두 모금":"一口か二口","매우 약함":"とても弱い","약한 편":"弱い","강한 편":"強い","매우 강함":"とても強い"
});
Object.assign(UI_TEXT.en,{
  "진주 장식과 앤티크 실크를 닮은 로코코 블러시 핑크":"A rococo blush pink inspired by pearls and antique silk",
  "현재 선택한 테마":"Current theme","현재 선택":"Selected","테마 선택하기":"Choose a theme",
  "미리보기에서 원하는 색을 고르면 바로 적용돼요.":"Choose a color preview to apply it instantly."
});
Object.assign(UI_TEXT.ja,{
  "진주 장식과 앤티크 실크를 닮은 로코코 블러시 핑크":"真珠の装飾とアンティークシルクを思わせるロココ調のブラッシュピンク",
  "현재 선택한 테마":"現在のテーマ","현재 선택":"選択中","테마 선택하기":"テーマを選ぶ",
  "미리보기에서 원하는 색을 고르면 바로 적용돼요.":"プレビューから色を選ぶとすぐに適用されます。"
});
Object.assign(UI_TEXT.en,{
  "흑백":"Monochrome","가장 또렷한 기본 테마":"The clearest default theme","세이지":"Sage","편안하지만 탁하지 않은 초록빛":"A comfortable green that stays clear","오션":"Ocean","맑고 깊은 바다의 푸른빛":"Clear, deep ocean blue","라벤더":"Lavender","선명하면서 부드러운 보랏빛":"A vivid yet gentle violet",
  "글꼴 정의는 모든 화면이 같은 파일 하나를 사용합니다. 선택한 글꼴은 아래 미리보기에 즉시 반영돼요.":"Every screen uses the same font definition. Your choice appears in the preview immediately.",
  "서랍마을의 오늘":"Today in Drawer Village","캐릭터들이 각자의 하루를 보내고 있어요. 긴 생활 로그도 편안하게 읽어 보세요.":"Your characters are living their own days. Long life logs should stay comfortable to read.",
  "동기화 표시 이름":"Sync display name","Google 계정 이름 대신 백업과 동기화 화면에 표시할 이름이에요.":"This name appears in backup and sync screens instead of your Google account name.","어떻게 불러드릴까요?":"What should we call you?",
  "이름과 건물 유형 표시":"Names and building types","Google 로그인 안 됨":"Not signed in to Google","사진 저장 공간":"Image storage","각 페이지를 처음 열었을 때 나오는 안내를 다시 볼 수 있어요.":"Show the guides that normally appear the first time you open each page.",
  "이미지 링크는 이 용량을 사용하지 않아요.":"Linked images do not use this storage."
});
Object.assign(UI_TEXT.ja,{
  "흑백":"モノクロ","가장 또렷한 기본 테마":"最も見やすい基本テーマ","세이지":"セージ","편안하지만 탁하지 않은 초록빛":"落ち着きがありながら濁らない緑","오션":"オーシャン","맑고 깊은 바다의 푸른빛":"澄んだ深い海の青","라벤더":"ラベンダー","선명하면서 부드러운 보랏빛":"鮮やかでやわらかな紫",
  "글꼴 정의는 모든 화면이 같은 파일 하나를 사용합니다. 선택한 글꼴은 아래 미리보기에 즉시 반영돼요.":"すべての画面で同じフォント定義を使用します。選んだフォントは下のプレビューにすぐ反映されます。",
  "서랍마을의 오늘":"ひきだし村の今日","캐릭터들이 각자의 하루를 보내고 있어요. 긴 생활 로그도 편안하게 읽어 보세요.":"キャラクターたちはそれぞれの一日を過ごしています。長い生活ログも読みやすく表示します。",
  "동기화 표시 이름":"同期表示名","Google 계정 이름 대신 백업과 동기화 화면에 표시할 이름이에요.":"Googleアカウント名の代わりにバックアップと同期画面へ表示する名前です。","어떻게 불러드릴까요?":"何とお呼びしましょうか？",
  "이름과 건물 유형 표시":"名前と建物タイプを表示","Google 로그인 안 됨":"Googleに未ログイン","사진 저장 공간":"画像ストレージ","각 페이지를 처음 열었을 때 나오는 안내를 다시 볼 수 있어요.":"各ページを初めて開いた時に表示されるガイドをもう一度確認できます。",
  "이미지 링크는 이 용량을 사용하지 않아요.":"画像リンクはこの容量を使用しません。"
});
Object.assign(UI_TEXT.en,{
  "LD 미등록":"LD not added","LD 일러스트":"LD illustration","전신 또는 무릎 위 이미지 한 장":"One full-body or knee-up image","LD 파일":"LD file","LD 링크":"LD link",
  "LD 일러스트는 캐릭터마다 한 장만 등록합니다. 감정은 장면의 배경 효과로 표현해요.":"Add one LD illustration per character. Emotions are shown through scene background effects.",
  "투명 SD 아이콘과 단일 LD 일러스트는 ‘사진·SD·LD’ 탭에서 따로 등록해요.":"Add a transparent SD icon and one LD illustration separately in Images · SD · LD.",
  "프로필 사진, 투명 SD 아이콘, 전신 LD 일러스트는 전부 별도 파일입니다. 등록하지 않은 칸은 기존 표현을 그대로 사용해요.":"Profile photos, transparent SD icons, and LD illustrations are separate files. Any empty slot keeps the existing visual.",
  "현재 장면 새로고침":"Refresh current scene","홈 캐릭터 표현 전환":"Switch home character visual","지금 사용 중인 취향 사전 항목":"Collection items currently in use"
});
Object.assign(UI_TEXT.ja,{
  "LD 미등록":"LD未登録","LD 일러스트":"LDイラスト","전신 또는 무릎 위 이미지 한 장":"全身または膝上の画像1枚","LD 파일":"LDファイル","LD 링크":"LDリンク",
  "LD 일러스트는 캐릭터마다 한 장만 등록합니다. 감정은 장면의 배경 효과로 표현해요.":"LDイラストはキャラクターごとに1枚だけ登録します。感情はシーンの背景エフェクトで表現します。",
  "투명 SD 아이콘과 단일 LD 일러스트는 ‘사진·SD·LD’ 탭에서 따로 등록해요.":"透過SDアイコンと1枚のLDイラストは「画像・SD・LD」タブで別々に登録します。",
  "프로필 사진, 투명 SD 아이콘, 전신 LD 일러스트는 전부 별도 파일입니다. 등록하지 않은 칸은 기존 표현을 그대로 사용해요.":"プロフィール写真・透過SDアイコン・LDイラストはすべて別ファイルです。未登録の欄は既存の表示を使用します。",
  "현재 장면 새로고침":"現在のシーンを更新","홈 캐릭터 표현 전환":"ホームのキャラクター表示を切り替える","지금 사용 중인 취향 사전 항목":"現在使用中の好み図鑑アイテム"
});
Object.assign(UI_TEXT.en,{
  "크림":"Cream","포근하고 환한 아이보리빛":"Warm, bright ivory","피치":"Peach","생기 있는 복숭앗빛":"Lively peach","민트":"Mint","산뜻하고 밝은 민트빛":"Fresh, bright mint","선샤인":"Sunshine","따뜻하고 명랑한 노랑빛":"Warm, cheerful yellow",
  "수면 습관":"Sleep style","자는 중":"Sleeping","자는 중 현재 장면에 반영돼요. 수면 중인 내용은 생활 로그에 기록하지 않아요.":"Used for the current sleeping scene. Sleep-only details are not added to the life log.",
  "이불을 단정히 덮고 잠":"Sleeps with the blanket neatly arranged","이불을 걷어차며 잠":"Kicks off the blanket","옆으로 웅크려 잠":"Sleeps curled up on their side","팔다리를 뻗고 잠":"Sleeps sprawled out","베개를 끌어안고 잠":"Hugs a pillow while sleeping","잠꼬대를 자주 함":"Often talks in their sleep","뒤척임이 많음":"Tosses and turns often","아주 얌전히 잠":"Sleeps very still","새벽에 자주 깸":"Wakes often before dawn","코를 골며 깊이 잠":"Sleeps deeply and snores",
  "동기화와 불러오기는 필요할 때만 설정에서 사용해요.":"Use sync and download from Settings whenever you need them.","Firebase가 막혀도 현재 데이터와 사진을 파일 하나로 보관할 수 있어요.":"Keep your current data and images in one file even when Firebase is unavailable.","같은 건물에 있는 캐릭터는 지도에서 한 묶음으로 표시됩니다.":"Characters in the same building are grouped together on the map."
});
Object.assign(UI_TEXT.ja,{
  "크림":"クリーム","포근하고 환한 아이보리빛":"あたたかく明るいアイボリー","피치":"ピーチ","생기 있는 복숭앗빛":"明るく華やかなピーチ","민트":"ミント","산뜻하고 밝은 민트빛":"爽やかで明るいミント","선샤인":"サンシャイン","따뜻하고 명랑한 노랑빛":"あたたかく楽しいイエロー",
  "수면 습관":"睡眠の癖","자는 중":"睡眠中","자는 중 현재 장면에 반영돼요. 수면 중인 내용은 생활 로그에 기록하지 않아요.":"睡眠中の現在シーンに反映されます。睡眠中だけの内容は生活ログには記録されません。",
  "이불을 단정히 덮고 잠":"布団をきちんとかけて眠る","이불을 걷어차며 잠":"布団を蹴って眠る","옆으로 웅크려 잠":"横向きに丸まって眠る","팔다리를 뻗고 잠":"手足を伸ばして眠る","베개를 끌어안고 잠":"枕を抱いて眠る","잠꼬대를 자주 함":"寝言が多い","뒤척임이 많음":"寝返りが多い","아주 얌전히 잠":"ほとんど動かず眠る","새벽에 자주 깸":"明け方によく目を覚ます","코를 골며 깊이 잠":"いびきをかいて深く眠る",
  "동기화와 불러오기는 필요할 때만 설정에서 사용해요.":"必要な時に設定から同期と読み込みを使用できます。","Firebase가 막혀도 현재 데이터와 사진을 파일 하나로 보관할 수 있어요.":"Firebaseが利用できない時も、現在のデータと画像を1つのファイルに保存できます。","같은 건물에 있는 캐릭터는 지도에서 한 묶음으로 표시됩니다.":"同じ建物にいるキャラクターはマップ上でまとめて表示されます。"
});
Object.assign(UI_TEXT.en,{
  "사진":"Photo","미등록":"Not added","SD 미등록":"SD not added","사용자 설정":"Custom","HEX 값":"HEX value","대표 테마색 HEX 값":"Primary theme color HEX value","그라데이션 보조색 HEX 값":"Secondary gradient color HEX value",
  "삭제 전 경고를 확인한 뒤 이 캐릭터와 연결된 기록을 정리해요.":"Review the warning before deleting this character and their linked records.",
  "프로필 사진, 투명 SD 아이콘, 전신 LD 일러스트는 전부 별도 파일입니다. 등록하지 않은 칸은 기존 표현을 그대로 사용해요.":"The profile photo, transparent SD icon, and LD illustration are three separate files. Empty slots keep the existing display.",
  "프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.":"Profile photos are displayed as circles and remain separate from SD icons.",
  "여기서 바로 사진을 등록할 수 있어요. 프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.":"Add a photo here. It appears as a circle and is kept separate from the SD icon.",
  "홈화면 기본 표현":"Default home visual","홈화면 캐릭터 크기":"Home character size","대표 테마색":"Primary theme color","그라데이션 보조색":"Secondary gradient color",
  "관계와 캐릭터별 시선":"Relationships and points of view","마음을 보는 사람":"Point-of-view character","마음의 대상":"Target character","선택한 방향의 마음":"Feelings in the selected direction",
  "공식 관계 없음 · 이방인":"No official relationship · Strangers","공식 관계 없음":"No official relationship","이방인":"Strangers","이 시선 편집하기":"Edit this point of view","이 시선 초기화":"Reset this point of view",
  "선택하지 않음":"Not selected","자기 감정을 분명히 자각함":"Clearly recognizes their own feelings","감정을 어렴풋이 느낌":"Vaguely senses their feelings","감정을 우정으로 착각함":"Mistakes the feeling for friendship","감정을 경쟁심으로 착각함":"Mistakes the feeling for rivalry","감정을 불편함으로 착각함":"Mistakes the feeling for discomfort","자기 감정을 전혀 모름":"Does not recognize their own feelings","느끼는 감정을 부정함":"Denies the feelings",
  "상대의 마음을 전혀 모름":"Does not know the other's feelings","상대의 마음을 어렴풋이 눈치챔":"Vaguely notices the other's feelings","상대가 느끼는 감정을 알고 있음":"Knows how the other person feels","서로의 마음을 확인함":"They have confirmed each other's feelings","상대의 마음을 오해하고 있음":"Misunderstands the other's feelings",
  "전혀 믿지 않음":"Does not trust them at all","의심함":"Suspicious","조심스럽게 지켜봄":"Watches cautiously","어느 정도 믿음":"Trusts them somewhat","깊이 신뢰함":"Trusts them deeply","전적으로 의지함":"Relies on them completely",
  "남보다도 멂":"More distant than strangers","낯선 사이":"Strangers","거리감 있음":"Feels distant","편한 사이":"Comfortable relationship","가까운 사이":"Close relationship","가장 가까운 사람":"Closest person",
  "함께 있으면 매우 불편하고 대화도 전혀 통하지 않음":"Very uncomfortable together; conversation does not flow at all","같은 공간에서는 숨 막히지만 농담과 장난은 잘 통함":"Sharing a space feels stifling, but their jokes click","공간 공유는 불편하지만 대화는 편안함":"Sharing a space is uncomfortable, but conversation is easy","긴장하고 대화도 조심스러움":"Tense and careful in conversation","어색하지만 필요한 대화는 무난함":"Awkward, but practical conversation is manageable","함께 있는 건 편하지만 대화 호흡은 평범함":"Comfortable together with ordinary conversational chemistry","편안하고 농담과 장난이 잘 통함":"Comfortable, with great playful chemistry","말없이 함께 있어도 편안함":"Comfortable even in silence","공간도 대화도 완벽하게 편안함":"Completely at ease in both space and conversation",
  "전혀 귀찮거나 성가시지 않음":"Not bothersome at all","전혀 귀찮거나 성가시지 않지만 성가시다고 말함":"Not actually bothered, but says they are","가끔 성가심":"Occasionally bothersome","종종 귀찮음":"Often bothersome","많이 귀찮고 성가심":"Very bothersome","보기만 해도 피곤함":"Tired just seeing them",
  "관심 없음":"No interest","필요할 때만 봄":"Only pays attention when needed","종종 신경 씀":"Sometimes checks on them","자주 살핌":"Often checks on them","늘 최우선으로 챙김":"Always puts them first",
  "질투하지 않음":"Not jealous","가끔 신경 쓰임":"Occasionally bothered","은근히 질투함":"Quietly jealous","질투가 심함":"Very jealous","독점하고 싶어 함":"Wants them all to themselves",
  "갈등이 거의 없음":"Almost no conflict","가끔 부딪힘":"Occasional clashes","자주 충돌함":"Frequent conflict","격렬하게 충돌함":"Intense conflict","파국적인 충돌을 반복함":"Repeated destructive conflict",
  "언제든 끝날 수 있다고 생각함":"Thinks it could end anytime","곧 헤어질 거라고 예상함":"Expects the relationship to end soon","당분간 이어질 거라 생각함":"Expects it to continue for a while","오래 함께할 거라 기대함":"Expects to stay together for a long time","평생 이어질 관계라고 믿음":"Believes it will last a lifetime",
  "신체 접촉 없음":"No physical contact","인사·부축 같은 의례적 접촉만":"Only formal contact such as greetings or assistance","손잡기·팔짱까지":"Up to holding hands or linking arms","포옹·기대기까지":"Up to hugging or leaning together","가벼운 입맞춤까지":"Up to light kisses","깊은 입맞춤까지":"Up to deep kisses","성인 간 친밀한 접촉까지":"Up to intimate contact between adults",
  "공격 충동 없음":"No aggressive impulses","거친 말을 하고 싶은 충동":"Urge to use harsh words","몸으로 밀어내고 싶은 충동":"Urge to push them away","해치고 싶은 충동":"Urge to hurt them","죽이고 싶을 만큼 격한 충동":"Extremely violent impulse",
  "행동으로 옮기지 않음":"Does not act on the impulse","대부분 참지만 가끔 거친 말이 나옴":"Usually holds back, but sometimes speaks harshly","거친 말로만 표출함":"Expresses it only through harsh words","물건이나 벽에 화풀이할 수 있음":"May take it out on objects or walls","상대를 때릴 수 있음":"May hit the other person","실제로 때릴 수 있음":"Can actually hit the other person","심한 폭력을 행사할 수 있음":"May commit severe violence"
});
Object.assign(UI_TEXT.ja,{
  "사진":"写真","미등록":"未登録","SD 미등록":"SD未登録","사용자 설정":"カスタム","HEX 값":"HEX値","대표 테마색 HEX 값":"メインテーマカラーのHEX値","그라데이션 보조색 HEX 값":"補助色のHEX値",
  "삭제 전 경고를 확인한 뒤 이 캐릭터와 연결된 기록을 정리해요.":"警告を確認してから、このキャラクターと関連する記録を整理して削除します。",
  "프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.":"プロフィール写真は円形で表示され、SDアイコンとは別に保存されます。",
  "여기서 바로 사진을 등록할 수 있어요. 프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.":"ここから写真を登録できます。円形で表示され、SDアイコンとは別に保存されます。",
  "마음을 보는 사람":"気持ちを見る人","마음의 대상":"気持ちの相手","관계와 캐릭터별 시선":"関係とキャラクター別の視点",
  "선택하지 않음":"未選択","자기 감정을 분명히 자각함":"自分の感情をはっきり自覚している","감정을 어렴풋이 느낌":"感情をなんとなく感じている","감정을 우정으로 착각함":"友情だと勘違いしている","감정을 경쟁심으로 착각함":"競争心だと勘違いしている","감정을 불편함으로 착각함":"居心地の悪さだと勘違いしている","자기 감정을 전혀 모름":"自分の感情にまったく気づいていない","느끼는 감정을 부정함":"感じている気持ちを否定している",
  "상대의 마음을 전혀 모름":"相手の気持ちをまったく知らない","상대의 마음을 어렴풋이 눈치챔":"相手の気持ちにうっすら気づいている","상대가 느끼는 감정을 알고 있음":"相手の気持ちを知っている","서로의 마음을 확인함":"お互いの気持ちを確認している","상대의 마음을 오해하고 있음":"相手の気持ちを誤解している",
  "전혀 믿지 않음":"まったく信じていない","의심함":"疑っている","조심스럽게 지켜봄":"慎重に見守っている","어느 정도 믿음":"ある程度信じている","깊이 신뢰함":"深く信頼している","전적으로 의지함":"全面的に頼っている",
  "남보다도 멂":"他人よりも遠い","낯선 사이":"見知らぬ間柄","거리감 있음":"距離を感じる","편한 사이":"気楽な間柄","가까운 사이":"親しい間柄","가장 가까운 사람":"最も近い人",
  "관심 없음":"関心がない","필요할 때만 봄":"必要な時だけ気にする","종종 신경 씀":"時々気にかける","자주 살핌":"よく気にかける","늘 최우선으로 챙김":"いつも最優先にする",
  "질투하지 않음":"嫉妬しない","가끔 신경 쓰임":"時々気になる","은근히 질투함":"ひそかに嫉妬する","질투가 심함":"嫉妬が強い","독점하고 싶어 함":"独占したがる",
  "갈등이 거의 없음":"対立はほとんどない","가끔 부딪힘":"時々ぶつかる","자주 충돌함":"よく衝突する","격렬하게 충돌함":"激しく衝突する","파국적인 충돌을 반복함":"破滅的な衝突を繰り返す",
  "언제든 끝날 수 있다고 생각함":"いつ終わってもおかしくないと思う","곧 헤어질 거라고 예상함":"もうすぐ別れると思っている","당분간 이어질 거라 생각함":"しばらく続くと思っている","오래 함께할 거라 기대함":"長く一緒にいると期待している","평생 이어질 관계라고 믿음":"一生続く関係だと信じている",
  "신체 접촉 없음":"身体的接触なし","인사·부축 같은 의례적 접촉만":"挨拶・介助など儀礼的な接触のみ","손잡기·팔짱까지":"手つなぎ・腕組みまで","포옹·기대기까지":"ハグ・寄りかかりまで","가벼운 입맞춤까지":"軽いキスまで","깊은 입맞춤까지":"深いキスまで","성인 간 친밀한 접촉까지":"成人同士の親密な接触まで",
  "공격 충동 없음":"攻撃衝動なし","거친 말을 하고 싶은 충동":"きつい言葉を言いたい衝動","몸으로 밀어내고 싶은 충동":"身体で押しのけたい衝動","해치고 싶은 충동":"傷つけたい衝動","죽이고 싶을 만큼 격한 충동":"非常に激しい加害衝動",
  "행동으로 옮기지 않음":"行動には移さない","대부분 참지만 가끔 거친 말이 나옴":"ほとんど我慢するが時々きつい言葉が出る","거친 말로만 표출함":"きつい言葉だけで表す","물건이나 벽에 화풀이할 수 있음":"物や壁に八つ当たりすることがある","상대를 때릴 수 있음":"相手を叩くことがある","실제로 때릴 수 있음":"実際に叩くことがある","심한 폭력을 행사할 수 있음":"激しい暴力に及ぶことがある"
});
Object.assign(UI_TEXT.en,{
  "홈 화면 도구":"Home screen tools","화면 편집":"Edit display","부탁하기":"Make a request","통계":"Statistics",
  "홈 화면 편집":"Edit home display","SD와 LD 크기는 서로 따로 저장돼요.":"SD and LD sizes are saved separately.",
  "SD 이미지 크기":"SD image size","LD 이미지 크기":"LD image size",
  "두 명이 함께 나올 때도 각 LD의 높이와 크기는 한 명일 때와 같고, 위치만 왼쪽과 오른쪽으로 나뉩니다.":"When two characters appear together, each LD keeps the same height and size as the one-character view; only the positions split left and right.",
  "캐릭터에게 부탁하기":"Ask a character to do something","부탁은 바로 생활 장면과 오늘의 기록에 반영돼요. 캐릭터는 성격과 말투에 맞춰 자기 방식으로 행동합니다.":"Requests appear immediately in the life scene and today's log. Each character handles them in a way that fits their personality and speech style.",
  "부탁할 캐릭터":"Character","부탁 유형":"Request type","무엇을 부탁할까요?":"What would you like them to do?",
  "예: 커피 내리기, 산책하기":"For example: make coffee or take a walk","부탁의 내용과 방문 빈도는 나중에 캐릭터가 사용자를 어떻게 생각하는지 판단하는 데 활용됩니다.":"The request type and your visit frequency will later help shape what the character thinks about you.",
  "부탁 보내기":"Send request","생활":"Daily life","정리":"Tidying","요리":"Cooking","외출":"Going out","운동":"Exercise","휴식":"Rest","대화":"Conversation","기타":"Other",
  "내 캐릭터 분포":"My character distribution","저장된 캐릭터":"Saved characters","성별":"Gender","직업":"Occupation","성격 유형":"Personality types","생활 마을":"Home town","홈 기본 표현":"Default home visual","기타 성별":"Another gender",
  "철두철미함":"Meticulous","차분하고 신중함":"Calm and cautious","냉정하고 논리적":"Cool and logical","다정하고 세심함":"Kind and attentive","수줍고 내향적":"Shy and introverted","활발하고 사교적":"Lively and sociable","즉흥적이고 자유로움":"Spontaneous and free-spirited","호기심 많고 창의적":"Curious and creative","완고하고 통제적":"Stubborn and controlling","무심하고 독립적":"Detached and independent","감정적이고 충동적":"Emotional and impulsive","장난기 많음":"Playful",
  "아직 표시할 캐릭터가 없어요.":"There are no characters to chart yet.","마을 미지정":"No town selected","설정하지 않음":"Not set","무직":"Unemployed",
  "LD 일러스트":"LD illustration","SD 아이콘":"SD icon","표시 크기는 홈 화면의 ‘화면 편집’에서 조절합니다.":"Adjust display size from Edit display on the home screen.",
  "홈 캐릭터 표현 전환":"Switch home character display","완료":"Done"
});
Object.assign(UI_TEXT.ja,{
  "홈 화면 도구":"ホーム画面ツール","화면 편집":"表示編集","부탁하기":"お願い","통계":"統計",
  "홈 화면 편집":"ホーム画面の表示編集","SD와 LD 크기는 서로 따로 저장돼요.":"SDとLDのサイズは別々に保存されます。",
  "SD 이미지 크기":"SD画像サイズ","LD 이미지 크기":"LD画像サイズ",
  "두 명이 함께 나올 때도 각 LD의 높이와 크기는 한 명일 때와 같고, 위치만 왼쪽과 오른쪽으로 나뉩니다.":"2人で表示する場合も、各LDの高さと大きさは1人表示と同じまま、位置だけ左右に分かれます。",
  "캐릭터에게 부탁하기":"キャラクターにお願いする","부탁은 바로 생활 장면과 오늘의 기록에 반영돼요. 캐릭터는 성격과 말투에 맞춰 자기 방식으로 행동합니다.":"お願いはすぐ生活シーンと今日の記録に反映されます。キャラクターは性格と話し方に合う自分なりの方法で行動します。",
  "부탁할 캐릭터":"お願いするキャラクター","부탁 유형":"お願いの種類","무엇을 부탁할까요?":"何をお願いしますか？",
  "예: 커피 내리기, 산책하기":"例：コーヒーを淹れる、散歩する","부탁의 내용과 방문 빈도는 나중에 캐릭터가 사용자를 어떻게 생각하는지 판단하는 데 활용됩니다.":"お願いの内容と訪問頻度は、後でキャラクターがユーザーをどう思うか判断する材料になります。",
  "부탁 보내기":"お願いを送る","생활":"日常","정리":"片付け","요리":"料理","외출":"外出","운동":"運動","휴식":"休憩","대화":"会話","기타":"その他",
  "내 캐릭터 분포":"キャラクター分布","저장된 캐릭터":"保存済みキャラクター","성별":"性別","직업":"職業","성격 유형":"性格タイプ","생활 마을":"生活する村","홈 기본 표현":"ホームの基本表示","기타 성별":"その他の性別",
  "철두철미함":"几帳面","차분하고 신중함":"落ち着いて慎重","냉정하고 논리적":"冷静で論理的","다정하고 세심함":"優しく気配り上手","수줍고 내향적":"内気で内向的","활발하고 사교적":"活発で社交的","즉흥적이고 자유로움":"即興的で自由","호기심 많고 창의적":"好奇心旺盛で創造的","완고하고 통제적":"頑固で支配的","무심하고 독립적":"淡々として自立的","감정적이고 충동적":"感情的で衝動的","장난기 많음":"いたずら好き",
  "아직 표시할 캐릭터가 없어요.":"集計できるキャラクターがまだいません。","마을 미지정":"村未設定","설정하지 않음":"未設定","무직":"無職",
  "LD 일러스트":"LDイラスト","SD 아이콘":"SDアイコン","표시 크기는 홈 화면의 ‘화면 편집’에서 조절합니다.":"表示サイズはホーム画面の「表示編集」で調整します。",
  "홈 캐릭터 표현 전환":"ホームのキャラクター表示切替","완료":"完了"
});
Object.assign(UI_TEXT.en,{
  "집 정보 보기":"View home details","집 유형":"Home type","외관 분위기":"Exterior style","방 수":"Rooms","거주자로 연결된 캐릭터":"Linked residents","연결된 거주자 없음":"No linked residents","지금 집 안에 있는 캐릭터":"Characters currently inside","현재 이 집 안에 있는 캐릭터가 없어요.":"No characters are currently inside this home.","대표 실내 이미지가 아직 없어요":"No main interior image yet","집 화면에서 집이나 방 사진을 등록할 수 있어요.":"Add a home or room image from the Home screen.","집 메모":"Home notes","일반 주거":"Residential home","집이나 방 사진":"Home or room image","지도 위 건물과 집을 직접 끌어 위치를 정하세요.":"Drag buildings and homes directly on the map to place them.","건물과 집은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.":"Drag buildings and homes on this screen on both desktop and mobile.",
  "내 캐릭터 통계 보고서":"My Character Statistics Report","현재 저장된":"Settings from","명의 설정을 항목별 비율과 평균으로 모아 보여줘요.":"saved characters are summarized as ratios and averages.","평균 기상 시각":"Average wake-up time","평균 취침 시각":"Average bedtime","운전면허 보유 비율":"Licensed drivers","흡연자 비율":"Smokers","운전면허 보유":"Licensed drivers","흡연 캐릭터":"Characters who smoke","신체 설정 반영":"Body details configured","보조기기·접근성 설정":"Assistive and accessibility settings","체형":"Body type","신체 특징":"Physical traits","머리색":"Hair color","머리 길이":"Hair length","머리 질감":"Hair texture","눈동자 색":"Eye color","화장 정도":"Makeup level","화장 스타일":"Makeup style","건강 상태":"Health conditions","휠체어 사용":"Wheelchair use","의수 사용":"Prosthetic arm","의족 사용":"Prosthetic leg","청각 상태":"Hearing","시각 상태":"Vision","접근성 선호":"Accessibility preferences","보고서 다운로드":"Download report"
});
Object.assign(UI_TEXT.ja,{
  "집 정보 보기":"家の詳細を見る","집 유형":"住居タイプ","외관 분위기":"外観の雰囲気","방 수":"部屋数","거주자로 연결된 캐릭터":"居住者として登録されたキャラクター","연결된 거주자 없음":"登録された居住者なし","지금 집 안에 있는 캐릭터":"現在家の中にいるキャラクター","현재 이 집 안에 있는 캐릭터가 없어요.":"現在この家の中にいるキャラクターはいません。","대표 실내 이미지가 아직 없어요":"代表室内画像はまだありません","집 화면에서 집이나 방 사진을 등록할 수 있어요.":"家画面で家や部屋の画像を登録できます。","집 메모":"家のメモ","일반 주거":"一般住宅","집이나 방 사진":"家または部屋の画像","지도 위 건물과 집을 직접 끌어 위치를 정하세요.":"地図上の建物と家を直接ドラッグして配置してください。","건물과 집은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.":"PCとモバイルの両方で、この画面から建物と家をドラッグできます。",
  "내 캐릭터 통계 보고서":"マイキャラクター統計レポート","현재 저장된":"保存中の","명의 설정을 항목별 비율과 평균으로 모아 보여줘요.":"人分の設定を比率と平均でまとめて表示します。","평균 기상 시각":"平均起床時刻","평균 취침 시각":"平均就寝時刻","운전면허 보유 비율":"運転免許保有率","흡연자 비율":"喫煙者率","운전면허 보유":"運転免許あり","흡연 캐릭터":"喫煙するキャラクター","신체 설정 반영":"身体設定済み","보조기기·접근성 설정":"補助機器・アクセシビリティ設定","체형":"体型","신체 특징":"身体的特徴","머리색":"髪色","머리 길이":"髪の長さ","머리 질감":"髪質","눈동자 색":"瞳の色","화장 정도":"メイクの程度","화장 스타일":"メイクスタイル","건강 상태":"健康状態","휠체어 사용":"車いすの使用","의수 사용":"義手","의족 사용":"義足","청각 상태":"聴覚","시각 상태":"視覚","접근성 선호":"アクセシビリティの希望","보고서 다운로드":"レポートをダウンロード"
});
Object.assign(UI_TEXT.en,{
  "사용하지 않음":"Not used","전동 휠체어":"Power wheelchair","수동 휠체어":"Manual wheelchair","오른쪽":"Right","왼쪽":"Left","양쪽":"Both sides","당뇨병":"Diabetes","도움 전에 먼저 물어보기":"Ask before helping","대화로 해결":"Talk it through","행동으로 표현":"Expresses through actions","필요한 만큼 소비":"Spends as needed","평범한 형편":"Average means","알람을 듣고 천천히 일어남":"Wakes slowly after the alarm","면허 없음":"No license","하지 않음":"None"
});
Object.assign(UI_TEXT.ja,{
  "사용하지 않음":"使用しない","전동 휠체어":"電動車いす","수동 휠체어":"手動車いす","오른쪽":"右","왼쪽":"左","양쪽":"両側","당뇨병":"糖尿病","도움 전에 먼저 물어보기":"手助けの前に確認する","대화로 해결":"話し合いで解決","행동으로 표현":"行動で表す","필요한 만큼 소비":"必要な分だけ使う","평범한 형편":"平均的な暮らし","알람을 듣고 천천히 일어남":"アラームを聞いてゆっくり起きる","면허 없음":"免許なし","하지 않음":"なし"
});
const UI_DYNAMIC_TEXT={
  en:[
    [/^(.+)의 프로필·SD·LD$/,(name)=>`${name}'s profile · SD · LD`],
    [/^(.+)의 생활 로그$/,(name)=>`${name}'s life log`],
    [/^(\d+)명 저장됨 · 한도 (\d+)명$/,(saved,limit)=>`${saved} saved · limit ${limit}`],
    [/^([\d.]+)MB 사용 · ([\d.]+)MB 남음$/,(used,left)=>`${used}MB used · ${left}MB remaining`],
    [/^현재 총 ([\d.]+)MB · 캐릭터 (\d+)명 · 마을 (\d+)개 · 이미지 링크는 이 용량을 사용하지 않아요\.$/,(total,characters,towns)=>`${total}MB total · ${characters} characters · ${towns} towns · Linked images do not use this storage.`],
    [/^(.+)의 지금 이 순간$/,(name)=>`${name}'s current moment`],
    [/^(.+) · 자는 중$/,(name)=>`${name} · Sleeping`],
    [/^(.+)에서 자는 중$/,(place)=>`Sleeping in ${place}`],
    [/^현재 저장된 (\d+)명의 설정을 항목별로 모아 보여줘요\.$/,(count)=>`A breakdown of the settings for ${count} saved characters.`],
    [/^현재 저장된 (\d+)명의 설정을 항목별 비율과 평균으로 모아 보여줘요\.$/,(count)=>`Ratios and averages from ${count} saved characters.`],
    [/^(\d+)명$/,(count)=>`${count}`],
    [/^(\d+)명 · (\d+)%$/,(count,percent)=>`${count} · ${percent}%`],
    [/^(.+)의 SD와 LD 크기는 서로 따로 저장돼요\.$/,(name)=>`${name}'s SD and LD sizes are saved separately.`]
  ],
  ja:[
    [/^(.+)의 프로필·SD·LD$/,(name)=>`${name}のプロフィール・SD・LD`],
    [/^(.+)의 생활 로그$/,(name)=>`${name}の生活ログ`],
    [/^(\d+)명 저장됨 · 한도 (\d+)명$/,(saved,limit)=>`${saved}人保存済み・上限${limit}人`],
    [/^([\d.]+)MB 사용 · ([\d.]+)MB 남음$/,(used,left)=>`${used}MB使用・残り${left}MB`],
    [/^현재 총 ([\d.]+)MB · 캐릭터 (\d+)명 · 마을 (\d+)개 · 이미지 링크는 이 용량을 사용하지 않아요\.$/,(total,characters,towns)=>`合計${total}MB・キャラクター${characters}人・村${towns}個・画像リンクはこの容量を使用しません。`],
    [/^(.+)의 지금 이 순간$/,(name)=>`${name}の今この瞬間`],
    [/^(.+) · 자는 중$/,(name)=>`${name}・睡眠中`],
    [/^(.+)에서 자는 중$/,(place)=>`${place}で睡眠中`],
    [/^현재 저장된 (\d+)명의 설정을 항목별로 모아 보여줘요\.$/,(count)=>`保存された${count}人の設定を項目別に集計します。`],
    [/^현재 저장된 (\d+)명의 설정을 항목별 비율과 평균으로 모아 보여줘요\.$/,(count)=>`保存された${count}人の設定を比率と平均で集計します。`],
    [/^(\d+)명$/,(count)=>`${count}人`],
    [/^(\d+)명 · (\d+)%$/,(count,percent)=>`${count}人・${percent}%`],
    [/^(.+)의 SD와 LD 크기는 서로 따로 저장돼요\.$/,(name)=>`${name}のSDとLDサイズは別々に保存されます。`]
  ]
};
Object.assign(UI_TEXT.en,{
  "이 기기에만 보관하는 사진":"Photo storage and sync",
  "기기 사용량 확인 중…":"Checking this device…",
  "사진 원본은 이 브라우저에 남고 Google 동기화와 백업 파일에는 정보만 들어가요.":"Photos are synced to your Google-linked account. Browser backup files contain information only.",
  "사진":"Photo","장":"items","이 기기에서":"on this device","사용":"used",
  "정보를 불러왔습니다 · 이 기기의 기존 사진은 유지했습니다":"Data and cloud photos loaded",
  "사진 없이 정보만 내보냅니다":"Export information without photos",
  "LD 일러스트는 자르지 않고 원본 비율 전체를 사용해요.":"LD illustrations keep their full original aspect ratio without cropping.",
  "동기화에는 캐릭터·관계·생활 정보만 저장돼요. 사진은 이 기기의 브라우저 저장소에 남습니다.":"Sync stores character, relationship, life data, and photos in your Google-linked account.",
  "브라우저 데이터나 앱 데이터를 지우면 기기에 보관한 사진도 삭제됩니다.":"Cloud-synced photos can be loaded again after browser or app data is cleared.",
  "오늘의 기록":"Today's log","눌러서 펼쳐 보기 ↗":"Click to expand ↗","전체 보기":"View all","집 보기":"View home",
  "달빛 서랍 극장":"Moonlit Drawer Theater","남색 벨벳과 크림 종이, 금빛 프레임으로 만든 게임 UI 샘플":"A game UI of navy velvet, cream paper, and golden frames"
  ,"사진 없이 정보만 내보냅니다. 불러올 때도 이 기기의 기존 사진은 그대로 유지해요.":"Browser backup files export information only. Google Sync separately stores photos.",
  "사진 원본은 이 브라우저에 남고 Google 동기화와 백업 파일에는 정보만 들어가요.":"Photos are synced to your Google-linked account. Browser backup files contain information only."
});
Object.assign(UI_TEXT.ja,{
  "이 기기에만 보관하는 사진":"写真の保存と同期",
  "기기 사용량 확인 중…":"端末の使用量を確認中…",
  "사진 원본은 이 브라우저에 남고 Google 동기화와 백업 파일에는 정보만 들어가요.":"写真はGoogle連携アカウントへ同期されます。ブラウザのバックアップファイルには情報だけが入ります。",
  "사진":"写真","장":"枚","이 기기에서":"この端末で","사용":"使用",
  "정보를 불러왔습니다 · 이 기기의 기존 사진은 유지했습니다":"データとクラウド写真を読み込みました",
  "사진 없이 정보만 내보냅니다":"写真を除き、情報だけを書き出します",
  "LD 일러스트는 자르지 않고 원본 비율 전체를 사용해요.":"LDイラストは切り抜かず、元の縦横比のまま全体を使用します。",
  "동기화에는 캐릭터·관계·생활 정보만 저장돼요. 사진은 이 기기의 브라우저 저장소에 남습니다.":"キャラクター・関係・生活情報と写真をGoogle連携アカウントへ同期します。",
  "브라우저 데이터나 앱 데이터를 지우면 기기에 보관한 사진도 삭제됩니다.":"ブラウザやアプリのデータを消去しても、同期済みの写真は再読み込みできます。",
  "오늘의 기록":"今日の記録","눌러서 펼쳐 보기 ↗":"タップして開く ↗","전체 보기":"すべて表示","집 보기":"家を見る",
  "달빛 서랍 극장":"月明かりの引き出し劇場","남색 벨벳과 크림 종이, 금빛 프레임으로 만든 게임 UI 샘플":"紺のベルベット、クリーム色の紙、金色の枠で仕立てたゲームUI"
  ,"사진 없이 정보만 내보냅니다. 불러올 때도 이 기기의 기존 사진은 그대로 유지해요.":"ブラウザのバックアップは情報だけを書き出し、写真はGoogle同期で別に保存します。",
  "사진 원본은 이 브라우저에 남고 Google 동기화와 백업 파일에는 정보만 들어가요.":"写真はGoogle連携アカウントへ同期されます。ブラウザのバックアップファイルには情報だけが入ります。"
});
// 생활 장면 번역을 한 묶음 더 확장한다. 캐릭터 이름처럼 사용자가 만든
// 고유명사는 그대로 두고, 반복해서 노출되는 행동과 설명만 번역한다.
Object.assign(UI_TEXT.en,{
  "주방에서 식탁을 차리는 중":"Setting the table in the kitchen",
  "먹을 사람 수에 맞춰 접시와 수저를 놓고 뜨거운 그릇이 닿지 않게 자리를 비워 두었어요. 정돈된 상태를 유지하며 시작과 마무리의 경계를 분명하게 지켰어요.":"They set out plates and cutlery for everyone, leaving safe space for hot dishes. They kept the table orderly and clearly marked the beginning and end of the task.",
  "침실에서 외투를 정리하는 중":"Putting away outerwear in the bedroom",
  "주머니 속 물건을 비우고 먼지를 가볍게 턴 뒤 옷걸이에 형태가 무너지지 않게 걸었어요. 정돈된 상태를 유지하며 시작과 마무리의 경계를 분명하게 지켰어요.":"They emptied the pockets, brushed away dust, and hung each coat carefully so it would keep its shape.",
  "욕실에서 화장품을 정리하는 중":"Organizing cosmetics in the bathroom",
  "주방에서 차갑게 식힌 디저트를 꺼내는 중":"Taking a chilled dessert out in the kitchen",
  "정보만 Google에 동기화":"Sync information to Google only",
  "원본 사진은 이 기기에 유지":"Keep original photos on this device"
  ,"캐릭터 정보와 사진을 함께 Google 계정에 동기화합니다.":"Sync character data and photos together with your Google account."
  ,"LD는 자르지 않고 원본 비율을 유지하며, 큰 사진은 저장용 사본만 비율대로 축소해요.":"LD art is never cropped. Large images are proportionally reduced only for the cloud copy."
  ,"마을을 만드는 순서":"How to build a town","마을 이름과 배경을 고르세요.":"Choose the town name and background.","건물을 추가하고 유형을 고르세요.":"Add buildings and choose their types.","지도에서 건물을 끌어 위치를 정하세요.":"Drag buildings on the map to position them."
  ,"화면 편집":"Display editor","통계":"Statistics","홈 화면 도구":"Home display tools","홈 화면 편집":"Edit home display","완료":"Done","현재 장면":"Current scene","관찰 중":"Observing"
});
Object.assign(UI_TEXT.ja,{
  "주방에서 식탁을 차리는 중":"キッチンで食卓を整えている",
  "먹을 사람 수에 맞춰 접시와 수저를 놓고 뜨거운 그릇이 닿지 않게 자리를 비워 두었어요. 정돈된 상태를 유지하며 시작과 마무리의 경계를 분명하게 지켰어요.":"食べる人数に合わせて皿とカトラリーを並べ、熱い器を置く場所も空けました。整った状態を保ち、作業の始まりと終わりをはっきり区切りました。",
  "침실에서 외투를 정리하는 중":"寝室で上着を片付けている",
  "주머니 속 물건을 비우고 먼지를 가볍게 턴 뒤 옷걸이에 형태가 무너지지 않게 걸었어요. 정돈된 상태를 유지하며 시작과 마무리의 경계를 분명하게 지켰어요.":"ポケットの中身を出してほこりを軽く払い、形が崩れないよう丁寧にハンガーへ掛けました。",
  "욕실에서 화장품을 정리하는 중":"浴室で化粧品を整理している",
  "주방에서 차갑게 식힌 디저트를 꺼내는 중":"キッチンで冷やしたデザートを取り出している",
  "정보만 Google에 동기화":"情報だけをGoogleに同期",
  "원본 사진은 이 기기에 유지":"写真の原本はこの端末に保持"
  ,"캐릭터 정보와 사진을 함께 Google 계정에 동기화합니다.":"キャラクター情報と写真をGoogleアカウントにまとめて同期します。"
  ,"LD는 자르지 않고 원본 비율을 유지하며, 큰 사진은 저장용 사본만 비율대로 축소해요.":"LDは切り抜かず元の比率を保ち、大きな画像は保存用コピーだけを比率どおり縮小します。"
  ,"마을을 만드는 순서":"村を作る手順","마을 이름과 배경을 고르세요.":"村の名前と背景を選びます。","건물을 추가하고 유형을 고르세요.":"建物を追加し、種類を選びます。","지도에서 건물을 끌어 위치를 정하세요.":"地図上で建物をドラッグして配置します。"
  ,"화면 편집":"画面編集","통계":"統計","홈 화면 도구":"ホーム画面ツール","홈 화면 편집":"ホーム画面を編集","완료":"完了","현재 장면":"現在のシーン","관찰 중":"観察中"
});
UI_DYNAMIC_TEXT.en.push(
  [/^(.+) · 주방에서 식탁을 차리는 중$/,(name)=>`${name} · Setting the table in the kitchen`],
  [/^(.+) · 침실에서 외투를 정리하는 중$/,(name)=>`${name} · Putting away outerwear in the bedroom`],
  [/^(.+) · 욕실에서 화장품을 정리하는 중$/,(name)=>`${name} · Organizing cosmetics in the bathroom`]
);
UI_DYNAMIC_TEXT.ja.push(
  [/^(.+) · 주방에서 식탁을 차리는 중$/,(name)=>`${name}・キッチンで食卓を整えている`],
  [/^(.+) · 침실에서 외투를 정리하는 중$/,(name)=>`${name}・寝室で上着を片付けている`],
  [/^(.+) · 욕실에서 화장품을 정리하는 중$/,(name)=>`${name}・浴室で化粧品を整理している`]
);

function translatedUiText(value){
  const raw=String(value||""),trimmed=raw.trim(),compact=trimmed.replace(/\s+/g," "),copy=UI_TEXT[state.uiLanguage];
  if(!copy)return raw;
  if(copy[trimmed])return raw.replace(trimmed,copy[trimmed]);
  if(copy[compact])return raw.replace(trimmed,copy[compact]);
  for(const [pattern,format] of UI_DYNAMIC_TEXT[state.uiLanguage]||[]){
    const match=trimmed.match(pattern);
    if(match)return raw.replace(trimmed,format(...match.slice(1)));
  }
  return raw;
}
function translateInterface(root){
  const copy=UI_TEXT[state.uiLanguage];
  if(!root||!copy)return;
  // Options without an explicit value normally use their visible label as the
  // submitted value. Translating that label used to turn saved Korean enum
  // keys into English/Japanese text, which the state normalizer then treated
  // as unknown and reset to "설정하지 않음". Freeze the data value first.
  root.querySelectorAll("option:not([value])").forEach(option=>option.setAttribute("value",option.textContent.trim()));
  root.querySelectorAll("button,h1,h2,h3,h4,label,legend,option,small,p,b,strong,em,span,a,i,li,dt,dd,div,time").forEach(element=>{
    [...element.childNodes].filter(node=>node.nodeType===Node.TEXT_NODE).forEach(node=>{
      const raw=node.nodeValue||"";
      const trimmed=raw.trim();
      node.nodeValue=translatedUiText(raw);
    });
  });
  root.querySelectorAll("[placeholder],[title],[aria-label]").forEach(element=>{
    for(const attribute of ["placeholder","title","aria-label"]){
      if(element.hasAttribute(attribute))element.setAttribute(attribute,translatedUiText(element.getAttribute(attribute)));
    }
  });
}
// app.js adds a few profile controls after the main view has rendered.
// Run the same translator once more for those late-added controls so a
// language change never leaves the gender/speech fields in Korean.
export function translateDynamicInterface(root=document){
  translateInterface(root);
}
function localizeLanguageSelector(root){
  const select=root?.querySelector('[data-setting="uiLanguage"]');
  if(!select)return;
  select.innerHTML=`<option value="ko">한국어</option><option value="en">English (Beta)</option><option value="ja">日本語（ベータ）</option>`;
  select.value=["ko","en","ja"].includes(state.uiLanguage)?state.uiLanguage:"ko";
  const card=select.closest(".language-setting-card");
  const heading=card?.querySelector("h2");
  const description=card?.querySelector("p");
  const note=card?.querySelector("small");
  if(heading)heading.textContent=t("language","언어 · Language · 言語");
  if(description)description.textContent=t("languageHelp","영어와 일본어 베타는 메뉴, 캐릭터 편집, 상점, 설정, 관찰 화면에 적용됩니다. 자동 생성 생활 장면은 아직 한국어로 표시돼요.");
  if(note)note.textContent=t("languageNote","English / 日本語 Beta · 주요 화면 번역, 생활 장면은 추후 지원");
}
const hasBatchim=value=>{
  const code=[...String(value||"").trim()].at(-1)?.charCodeAt(0);
  return Number.isFinite(code)&&code>=0xac00&&code<=0xd7a3&&(code-0xac00)%28!==0;
};
const withParticle=(value,batchim,noBatchim)=>`${value||""}${hasBatchim(value)?batchim:noBatchim}`;
const subjectText=value=>withParticle(value,"이","가");
const objectText=value=>withParticle(value,"을","를");
const togetherText=value=>withParticle(value,"과","와");
const regexEscape=value=>String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const displayEntityNames=()=>[
  ...Object.values(state.characters||{}).map(item=>item?.name),
  ...Object.values(state.homes||{}).flatMap(home=>[home?.name,...Object.values(home?.rooms||{}).map(room=>room?.name),...(home?.pets||[]).map(pet=>pet?.name)]),
  ...(state.towns||[]).flatMap(town=>[town?.name,...(town?.places||[]).map(place=>place?.name)]),
  ...Object.values(state.catalog||{}).flatMap(items=>(items||[]).map(item=>item?.name))
].filter(Boolean).map(String).sort((a,b)=>b.length-a.length);
function resolveDisplayParticles(text){
  let result=String(text||"")
    .replace(/([가-힣A-Za-z0-9_]+)은\(는\)/g,(_,word)=>withParticle(word,"은","는"))
    .replace(/([가-힣A-Za-z0-9_]+)이\(가\)/g,(_,word)=>subjectText(word))
    .replace(/([가-힣A-Za-z0-9_]+)을\(를\)/g,(_,word)=>objectText(word))
    .replace(/([가-힣A-Za-z0-9_]+)과\(와\)/g,(_,word)=>togetherText(word));
  displayEntityNames().forEach(name=>{
    const pattern=new RegExp(`${regexEscape(name)}(은|는|이|가|을|를|과|와)(?=[\\s,.!?·'\"’”)]|$)`,"g");
    result=result.replace(pattern,(_,particle)=>{
      if(["은","는"].includes(particle))return withParticle(name,"은","는");
      if(["이","가"].includes(particle))return subjectText(name);
      if(["을","를"].includes(particle))return objectText(name);
      return togetherText(name);
    });
  });
  return result;
}
function normalizeDisplayedParticles(root){
  if(!root||typeof document.createTreeWalker!=="function")return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const next=resolveDisplayParticles(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next});
}
const sceneFailureIds=new Set();
const fallbackEvent=c=>{
  const roomKeys=Object.keys(state.homes?.[c?.homeId]?.rooms||{});
  return {minute:new Date().getHours()*60+new Date().getMinutes(),title:"생활 장면을 다시 계산하는 중",desc:"저장된 설정은 그대로 두고 현재 장면만 안전하게 다시 계산하고 있어요.",home:true,room:c?.sleepRoomId||roomKeys[0]||"",townId:c?.townId||state.activeTownId,mood:"대기"};
};
const eventFor=(c,date=new Date())=>{
  try{return simulateEventFor(c,date)||fallbackEvent(c)}
  catch(error){
    if(!sceneFailureIds.has(c?.id)){sceneFailureIds.add(c?.id);console.error(`캐릭터 장면 계산 실패 · ${c?.id||"unknown"}`,error)}
    return fallbackEvent(c);
  }
};
const visibleTimeline=(c,date=new Date())=>{
  try{const entries=simulateVisibleTimeline(c,date);return Array.isArray(entries)?entries:[]}
  catch(error){
    if(!sceneFailureIds.has(c?.id)){sceneFailureIds.add(c?.id);console.error(`캐릭터 생활 로그 계산 실패 · ${c?.id||"unknown"}`,error)}
    return[];
  }
};
const JOBS=["무직","학생","회사원","CEO","의사","간호사","교사","교수","정치인","기자","요리사","프로그래머","연구원","가수","아이돌","예술가","해적","군인","범죄자","환경미화원","여관주인","자영업·직접 입력"];
const TASTES=["아재 입맛","어린이 입맛","한식파","면 요리 선호","디저트광","커피 못 마심","신상 맛집파"];
const INTERESTS=["향수","애니메이션","만화","게임","패션","미술","음악","영화","드라마","예능","문구","인테리어","역사","기계","자동차","오토바이","철도","항공","천문학","우주","과학","의학","심리학","철학","정치","경제","법률","언어","외국어","여행","지도","지리","건축","사진","영상 편집","글쓰기","소설","시","요리","베이킹","커피","차","와인","반려동물","식물","원예","자연","환경","캠핑","등산","러닝","헬스","요가","축구","야구","농구","e스포츠","보드게임","퍼즐","마술","공예","뜨개질","재봉","목공","도예","수집","빈티지","전자기기","프로그래밍","로봇","인공지능","오컬트","신화","종교","범죄 사건","추리","밀리터리","무기"];
const HOBBIES=["취미 없음","집에서 뒹굴기","외출 안 함","인터넷 서핑","커뮤니티 눈팅","영상 정주행","낮잠","덕질","독서","웹소설 읽기","만화 보기","글쓰기","일기 쓰기","필사","외국어 공부","카페 탐방","맛집 탐방","쇼핑","빈티지 숍 구경","패션 코디","향수 시향","요리","베이킹","커피 내리기","차 우리기","칵테일 만들기","청소","정리 정돈","인테리어 꾸미기","식물 돌보기","원예","반려동물과 놀기","산책","러닝","등산","캠핑","자전거","수영","헬스","요가","필라테스","축구","야구","농구","사진 촬영","영상 촬영","영상 편집","그림 그리기","디지털 드로잉","전시 관람","공연 관람","영화 감상","음악 감상","악기 연주","노래 부르기","춤추기","공방 체험","도예","뜨개질","재봉","자수","목공","가죽 공예","프라모델 조립","피규어 수집","우표 수집","레코드 수집","보드게임","퍼즐","방탈출","게임","e스포츠 시청","코딩","전자기기 만지기","자동차 관리","드라이브","천체 관측","여행 계획","지도 보기","역사 탐방","봉사활동"];
const INCOMES=["절약 우선","가성비 중시","필요한 만큼 소비","취향에는 아끼지 않음","품질 우선","가격을 거의 신경 쓰지 않음"];
const MUSIC=["발라드","인디","재즈","클래식","록","힙합","R&B","K-POP","J-POP","OST","전자음악","트로트"];
const FOODS=["한식","일식","중식","양식","분식","고기","해산물","면 요리","디저트","매운 음식","채식"];
const FOOD_PREFERENCES=[...TASTES,...FOODS];
const DRINKS=["아메리카노","카페라테","바닐라 라테","아인슈페너","밀크티","말차 라테","차","탄산음료","주스","핫초코"];
const SPICE_LEVELS=["안 매움","살짝 매콤","순한맛","보통 라면 맵기","매운맛","아주 매운맛"];
const SWEET_LEVELS=["안 달음","은은한 단맛","적당히 달콤","달콤함","아주 달콤함","극강의 단맛"];
const PERSONALITY_LEVELS={
  socialEnergy:["사람이 버거움","혼자가 편함","수줍음","상황에 따라 다름","먼저 어울림","인싸","무리의 중심"],
  sensingIntuition:["눈앞의 현실 중시","매우 현실적","구체적인 편","균형형","가능성을 봄","직관적","상상의 세계"],
  thinkingFeeling:["논리 최우선","이성적","차분한 판단","균형형","마음을 살핌","공감형","감정에 깊이 공명"],
  perceivingJudging:["완전 즉흥적","흐름에 맡김","유연한 편","균형형","미리 정리함","계획적","철저한 계획형"]
};
const personalityRange=(c,field,title,left,right)=>`<label class="personality-range"><span class="personality-title">${title}<b data-range-label="${field}">${PERSONALITY_LEVELS[field][c[field]??3]}</b></span><span class="range-poles"><small>${left}</small><small>${right}</small></span><input type="range" min="0" max="6" data-field="${field}" data-levels="${field}" value="${c[field]??3}"></label>`;
const townAssignment=c=>`<section class="setting-card character-town"><h2>기본 생활 마을</h2><select data-field="townId">${state.towns.map(t=>`<option value="${t.id}" ${t.id===c.townId?"selected":""}>${esc(t.name)}</option>`).join("")}</select><small>집마다 다른 마을을 지정했다면 실제로 머무는 집의 마을이 우선합니다.</small></section>`;
const PLACE_TYPES={
  "카페":["","로스터리 카페","디저트 카페","테마 카페","찻집"],
  "음식점":["","한식당","중식당","일식당","이탈리아 식당","분식집","패스트푸드점","디저트 가게"],
  "병원":["","종합병원","내과","외과","이비인후과","정형외과","피부과","치과","안과","한의원"],
  "공연장":["","콘서트홀","라이브 클럽","뮤지컬 극장","연극 극장","야외 공연장"],
  "옷가게":["","스포츠 브랜드","캐주얼 브랜드","정장 브랜드","빈티지 숍","디자이너 브랜드","신발 가게","액세서리 숍"],
  "사무실":["","일반 회사","IT 회사","연구소","방송국","출판사","디자인 스튜디오"],
  "학교":["","초등학교","중학교","고등학교","대학교","학원"],
  "공원":["","근린공원","수목원","놀이공원","반려동물 공원"],
  "도서관":["","공공도서관","대학도서관","전문도서관"],
  "쇼핑몰":["","백화점","아울렛","복합 쇼핑몰"],
  "숙박":["","호텔","여관","리조트","게스트하우스"],
  "관공서":["","시청","주민센터","경찰서","소방서"],
  "기타":[""]
};
const CATALOG_LABELS={food:"음식",drink:"음료",fashion:"옷·패션",music:"음악",idol:"아이돌·밴드",book:"책·작품",movie:"영화·영상",game:"게임",perfume:"향수",hobby:"취미 물품",electronics:"전자기기",weapon:"무기"};
const CATALOG_CATEGORIES={food:["한식","일식","중식","이탈리아 음식","양식","분식","패스트푸드","디저트","빵","간식"],drink:["커피","차","라테","탄산음료","주스","술","기타 음료"],fashion:["상의","하의","아우터","원피스","신발","가방","액세서리"],music:["노래","앨범","플레이리스트","악기"],idol:["솔로 가수","아이돌","밴드","가상 아티스트"],book:["소설","만화","잡지","에세이","전문서적"],movie:["영화","드라마","애니메이션","예능","유튜브·웹영상"],game:["PC 게임","콘솔 게임","모바일 게임","보드게임"],perfume:["향수","디퓨저","캔들","바디 제품"],hobby:["미술 도구","수집품","운동 용품","공예 도구","반려동물 용품"],electronics:["휴대기기","컴퓨터","게임기","음향기기","카메라","생활가전"],weapon:["총기","검·도검","활·석궁","둔기","창·장병기","방어구","판타지 무기"]};
const BLADE_SUBTYPES=["단검","나이프","쇼트소드","아밍소드","롱소드","바스타드소드","대검","클레이모어","레이피어","에페","세이버","커틀러스","샴시르","시미터","카타나","타치","와키자시","노다치","쌍검","검지팡이","의장검"];
const WEAPON_SUBTYPES={총기:["권총","리볼버","기관단총","돌격소총","소총","저격소총","산탄총","기관총"],"검·도검":BLADE_SUBTYPES,도검:BLADE_SUBTYPES,검:BLADE_SUBTYPES,"활·석궁":["단궁","장궁","복합궁","컴파운드 보우","석궁"],둔기:["곤봉","메이스","철퇴","전투망치"],"창·장병기":["창","장창","할버드","언월도","삼지창"],방어구:["방패","경갑","중갑","투구"],"판타지 무기":["마법봉","지팡이","마도서","마검","에너지 무기"]};
const DETAIL_OPTIONS={food:["국물","면","밥","구이","튀김","샐러드","케이크","쿠키"],drink:["따뜻하게","차갑게","무카페인","카페인","무알코올","알코올"],fashion:["캐주얼","정장","스포츠","빈티지","스트리트","럭셔리"],music:["보컬곡","연주곡","라이브","기타","피아노","바이올린","드럼","베이스","관악기"],idol:["보컬","댄스","밴드","버추얼","솔로","그룹"],book:["로맨스","판타지","추리","공포","SF","역사","교양"],game:["MOBA","MMORPG","액션 RPG","턴제 RPG","FPS","TPS","배틀로얄","RTS","전략","시뮬레이션","샌드박스","서바이벌","어드벤처","퍼즐","리듬","격투","레이싱","스포츠","공포","소셜·파티"],hobby:["입문용","전문가용","휴대용","수집용","실내용","야외용"],electronics:["스마트폰","태블릿","노트북","데스크톱","콘솔","헤드폰","스피커","카메라","스마트워치"],weapon:[]};
const PERFUME_NOTES=["우디","플로럴","시트러스","머스크","앰버","아쿠아","그린","파우더리","프루티","스파이시","구르망","레더"];
const VIDEO_GENRES={
  "영화":["로맨스","코미디","액션","스릴러","공포","판타지","SF","다큐멘터리"],
  "드라마":["로맨스","가족","법정","의학","범죄","사극","판타지","청춘"],
  "애니메이션":["일상","판타지","액션","로맨스","스포츠","SF","아동"],
  "예능":["연애 예능","여행 예능","음악 예능","관찰 예능","게임 예능","토크쇼","서바이벌","코미디"],
  "유튜브·웹영상":["브이로그","게임 방송","먹방","리뷰","교육","숏폼","웹예능","웹드라마"]
};
const catalogItems=()=>Object.entries(state.catalog||{}).flatMap(([kind,items])=>(items||[]).map(item=>({...item,kind})));
const levelOptions=(labels,value)=>labels.map((label,index)=>`<option value="${index}" ${Number(value)===index?"selected":""}>${label}</option>`).join("");
const placeTypeOptions=place=>Object.keys(PLACE_TYPES).map(type=>`<option ${place.type===type?"selected":""}>${type}</option>`).join("");
const placeSubtypeOptions=place=>(PLACE_TYPES[place.type]||[""]).map(type=>`<option value="${type}" ${place.subtype===type?"selected":""}>${type||"지정 안 함 · 해당 유형 전체 취급"}</option>`).join("");
const CATALOG_ICONS={food:"🍽️",drink:"🥤",fashion:"👗",music:"🎵",idol:"🎤",book:"📚",movie:"🎬",game:"🎮",perfume:"🧴",hobby:"🎨",electronics:"💻",weapon:"⚔️"};
const roomClasses={living:"living",kitchen:"kitchen",entry:"entry",bath:"bath",bedroom:"bedroom",study:"study"};
const FURNITURE={
  living:["소파","TV","책장","오디오","안마의자","게임기","캣타워","턴테이블","보드게임장","홈시어터","프로젝터","악기 진열장","수집품 진열장","독서 의자","반려동물 장난감","러닝머신"],
  kitchen:["냉장고","조리대","식탁","오븐","커피머신","식기세척기","에스프레소 머신","티 세트","제빵 도구","칵테일 바","와인 냉장고","향신료 선반","요리책 선반"],
  entry:["신발장","전신거울","우산꽂이","반려동물 산책용품","자전거 보관대","운동 장비 선반","캠핑 장비"],
  bath:["샤워부스","욕조","세면대","세탁기","건조기","입욕제 선반","향수 선반","스킨케어 선반"],
  bedroom:["침대","옷장","화장대","협탁","빔프로젝터","독서등","향수 진열대","레코드 플레이어","작은 게임기","봉제인형","수집품 진열장"],
  study:["책상","컴퓨터","피아노","기타","그림 도구","재봉틀","운동기구","디지털 드로잉 장비","촬영 장비","보드게임 선반","공예 도구","뜨개 도구","프라모델 작업대","천체망원경","악기"],
  dining:["식탁","의자","찬장","티 테이블","와인장"],
  nursery:["아기 침대","수납장","놀이 매트","책장","기저귀 교환대"],
  guest:["침대","협탁","옷걸이","작은 책상","전신거울"],
  hobby:["작업대","수납장","그림 도구","재봉틀","악기","운동기구","디지털 드로잉 장비","촬영 장비","보드게임 선반","공예 도구","뜨개 도구","프라모델 작업대","천체망원경"],
  balcony:["화분","야외 의자","작은 테이블","빨래 건조대","원예 도구","캠핑 의자","천체망원경"],
  storage:["수납장","선반","보관 상자","옷걸이","캠핑 장비","운동 장비","수집품 상자"],
  other:["수납장","의자","작은 테이블","책장","오디오"]
};
const ROOM_TYPES={living:"거실",kitchen:"주방",entry:"현관",bath:"욕실",bedroom:"침실",study:"서재·취미방",dining:"다이닝룸",nursery:"아이방",guest:"손님방",hobby:"취미방",balcony:"베란다",storage:"창고",other:"기타 방"};
const roomTypeOptions=room=>Object.entries(ROOM_TYPES).map(([value,label])=>`<option value="${value}" ${(room.type||"other")===value?"selected":""}>${label}</option>`).join("");
let accountText="Google 로그인 안 됨";
let accountEntitlements={backgroundPacks:[],iconPacks:[],dlcPacks:[],purchases:[],characterSlotPacks:0,townSlotPacks:0,storage50:false};
const previewConfig=()=>window.PARALLEL_CITY_CONFIG?.beta||{};
const previewMode=()=>Boolean(previewConfig().enabled);
const characterLimit=()=>5+(Math.max(0,Number(accountEntitlements.characterSlotPacks)||0)*5);
const townLimit=()=>2+Math.max(0,Number(accountEntitlements.townSlotPacks)||0);
const hasBackground=id=>(accountEntitlements.backgroundPacks||[]).includes(id);
const hasDlc=id=>(accountEntitlements.dlcPacks||[]).includes(id);
const backgroundOptions=()=>`<option value="world-assets/cozy-town.png?v=20260811y" selected>기본 마을 손그림</option>`;
const TOWN_BACKGROUND="world-assets/cozy-town.png?v=20260811y";
const BUILDING_ICONS=[["cafe","카페"],["restaurant","식당"],["office","사무실"],["hospital","병원"],["park","공원"],["school","학교"],["clothing","옷가게"],["theater","공연장"],["hotel","호텔"],["department","백화점"],["library","도서관"],["shop","상점"]];
const buildingIconOptions=p=>BUILDING_ICONS.map(([id,label])=>`<option value="${id}" ${p.iconPreset===id?"selected":""}>${label}</option>`).join("");
const visibleTownId=c=>eventFor(c)?.townId||c.townId;

function avatar(c,cls=""){
  if(c.icon)return `<img class="sprite ${cls}" src="${c.icon}" alt="">`;
  if(c.photo)return `<img class="avatar profile-photo-fallback ${cls}" src="${c.photo}" alt="">`;
  return `<span class="avatar ${cls}">${esc((c.name||"새").slice(0,1))}</span>`;
}
// Old emotion-specific LD fields are migrated once in state.js. The renderer
// deliberately knows about only one LD image, so the retired UI cannot return.
const ldArtSource=c=>c?.ldImage||"";
const hasLdArt=c=>Boolean(ldArtSource(c));
const hasSdArt=c=>Boolean(c?.icon||c?.photo);
const homeSceneLayoutFor=(c,mode)=>{
  const source=c?.homeSceneLayout?.[mode]||{};
  const number=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  return {
    x:number(source.x),y:number(source.y),scale:number(source.scale,1),
    actionX:number(source.actionX),actionY:number(source.actionY)
  };
};
const sceneLayoutVars=(c,mode)=>{
  const layout=homeSceneLayoutFor(c,mode);
  const globalScale=Math.max(70,Math.min(150,Number(mode==="ld"?state.homeLdScale:state.homeSdScale)||100))/100;
  return `--character-art-x:${layout.x}%;--character-art-y:${layout.y}%;--character-art-scale:${layout.scale};--character-render-scale:${globalScale*layout.scale};--character-action-x:${layout.actionX}%;--character-action-y:${layout.actionY}%`;
};
function sceneAvatar(c,cls="",tone="neutral",mode="sd"){
  if(mode==="ld"&&hasLdArt(c)){
    const src=ldArtSource(c);
    return `<img class="sprite scene-ld-art ${cls}" src="${esc(src)}" alt="${esc(c.name)} LD 일러스트">`;
  }
  if(!c.icon&&!c.photo)return `<span class="scene-default-silhouette ${cls}" role="img" aria-label="${esc(c.name)} 기본 실루엣"></span>`;
  return avatar(c,cls);
}
function header(){
  const tabs=[["observe",t("observe","관찰"),"◉"],["home",t("home","집"),"⌂"],["character",t("character","캐릭터"),"♙"],["catalog",t("catalog","취향 사전"),"◇"],["relationship",t("relationship","관계"),"∞"],["routine",t("routine","주간 루틴"),"▦"],["statistics",t("statistics","통계"),"▥"],["town",t("town","마을"),"▧"],["shop",t("shop","상점"),"♢"],["settings",t("settings","설정"),"⚙"]];
  const current=tabs.find(([key])=>key===state.activeTab)||tabs[0];
  const nativeBar=state.activeTab==="observe"?"":`<div class="native-sub-header"><button type="button" data-tab="observe" aria-label="${esc(t("메인 화면으로 돌아가기","메인 화면으로 돌아가기"))}">‹</button><b>${current[1]}</b><span>${esc(t("brandName","서랍마을"))}</span></div>`;
  return `<header><div class="brand"><span class="logo"><img src="./icons/drawer-village-logo.png" alt="${esc(t("brandName","서랍마을"))}"></span><div><h1>${t("brandName","서랍마을")}</h1><small>${t("brandTagline","서랍 속 캐릭터 생활 관찰 게임")}</small></div>${previewMode()?`<span class="preview-badge">${esc(previewConfig().label||"사전 체험")}</span>`:""}</div><nav>${tabs.map(([k,n,icon])=>`<button data-tab="${k}" class="${state.activeTab===k?"on":""}"><span class="tab-icon tab-icon-${k}" data-menu-icon="${k}" aria-hidden="true">${icon}</span><span>${n}</span></button>`).join("")}</nav><span id="save-state">${t("saved","기기에 저장됨")}</span></header>${nativeBar}`;
}
const NATIVE_MENU_TABS=[["home","home","집","⌂"],["character","character","캐릭터","♙"],["catalog","catalog","취향 사전","◇"],["relationship","relationship","관계","∞"],["routine","routine","주간 루틴","▦"],["town","town","마을","▧"],["shop","shop","상점","♢"],["settings","settings","설정","⚙"]];
let mobileTownEditing=false;
let mobileTownPanel="";
export function setMobileTownEditing(value){
  mobileTownEditing=Boolean(value);
  if(!mobileTownEditing)mobileTownPanel="";
}
export function setMobileTownPanel(value=""){mobileTownPanel=String(value||"")}
function nativeGameMenu(){
  return `<nav class="native-game-menu" aria-label="앱 메뉴">${NATIVE_MENU_TABS.map(([key,labelKey,label,icon],index)=>`<button type="button" data-tab="${key}" class="${index<4?"native-menu-left":"native-menu-right"}" style="--native-menu-row:${index%4}"><span class="native-menu-icon native-menu-icon-${key}" data-menu-icon="${key}" aria-hidden="true">${icon}</span><small>${t(labelKey,label)}</small></button>`).join("")}</nav>`;
}
function rosterSummary(entry){
  const title=String(entry?.title||"생활 중").split(" · ")[0].trim();
  return title.length>24?`${title.slice(0,23)}…`:title;
}
function roster(){
  return `<div class="roster">${state.order.map(id=>{const c=state.characters[id],e=eventFor(c),away=visibleTownId(c)!==state.activeTownId,summary=rosterSummary(e);return `<button class="roster-card ${id===state.activeId?"on":""} ${away?"away":""}" data-roster="${id}" title="${esc(c.name)} · ${esc(e.title)}">${avatar(c)}<span class="roster-info"><b>${esc(c.name)}</b><small>${esc(summary)}</small></span></button>`}).join("")}</div>`;
}
function placeCard(p){
  const mode=state.buildingLabelMode||"full";
  const labelX=Math.max(8,Math.min(92,p.x)),labelY=Math.max(13,Math.min(92,p.y));
  const label=mode==="none"?"":`<span class="map-place-label" style="left:${labelX}%;top:${labelY}%"><b>${esc(p.name)}</b>${mode==="full"?`<small>${esc(p.subtype?`${p.type} · ${p.subtype}`:p.type)}</small>`:""}</span>`;
  const presetSources={"type-generic":"world-assets/building-types/generic.png","type-cafe":"world-assets/building-types/cafe.png","type-restaurant":"world-assets/building-types/restaurant.png","type-hospital":"world-assets/building-types/hospital.png","type-office":"world-assets/building-types/office.png","type-shop":"world-assets/building-types/shop.png","type-school":"world-assets/building-types/school.png","type-lodging":"world-assets/building-types/lodging.png","type-library":"world-assets/building-types/library.png","type-theater":"world-assets/building-types/theater.png","type-park":"world-assets/building-types/park.png","type-home":"world-assets/building-types/home.png","drawer-building":"world-assets/drawer-building.png","drawer-home":"world-assets/drawer-home.png","medieval-castle":"world-assets/medieval-castle.svg","medieval-tavern":"world-assets/medieval-tavern.svg","medieval-market":"world-assets/medieval-market.svg"};
  const preset=presetSources[p.iconPreset]||presetSources["drawer-building"];
  return `<button type="button" class="place has-art" style="left:${p.x}%;top:${p.y}%;--place:${p.color};--place-scale:${p.imageScale||1}" data-place="${p.id}" data-building-detail-open="${p.id}" aria-label="${esc(p.name)} 건물 정보 보기"><img class="building-preset-image" src="${preset}" alt=""></button>${label}`;
}
function townHomes(){
  return Object.values(state.homes||{}).filter(home=>home&&home.townId===state.activeTownId);
}
function homeMapCard(home){
  const mode=state.buildingLabelMode||"full";
  const label=mode==="none"?"":`<span class="map-place-label home-map-label" style="left:${home.mapX}%;top:${home.mapY}%"><b>${esc(home.name)}</b>${mode==="full"?`<small>${esc(home.kind||"일반 주거")}</small>`:""}</span>`;
  return `<button type="button" class="place has-art home-map-place" style="left:${home.mapX}%;top:${home.mapY}%;--place-scale:${home.mapScale||1.08}" data-home-map="${home.id}" data-building-detail-open="home:${home.id}" aria-label="${esc(home.name)} 집 정보 보기"><img class="building-preset-image" src="world-assets/drawer-home.png" alt=""></button>${label}`;
}
function charactersInsideHome(homeId){
  return state.order.map(id=>state.characters[id]).filter(Boolean).filter(character=>{
    const entry=eventFor(character);
    return Boolean(entry?.home&&(entry.visitHomeId||character.homeId)===homeId);
  });
}
function catalogItem(id){return catalogItems().find(item=>item.id===id)}
function townForEntry(entry){return state.towns.find(t=>t.id===entry.townId)||state.towns.find(t=>t.places?.some(p=>p.id===entry.placeId))||state.world}
function placeForEntry(entry){return townForEntry(entry)?.places?.find(p=>p.id===entry.placeId)}
function sceneImage(c,entry){
  if(entry.home)return state.homes[entry.visitHomeId||c.homeId]?.rooms?.[entry.room]?.image||"";
  const place=placeForEntry(entry);
  return catalogItem(entry.itemId)?.image||place?.interiorImage||place?.image||"";
}
const PET_SCENE_EMOJI={강아지:"🐶",고양이:"🐱",새:"🐦",거북이:"🐢",호랑이:"🐯",인공지능:"🤖",식물:"🪴",드래곤:"🐉",기타:"✨"};
function nativePetForScene(c,entry){
  const preferredHome=state.homes?.[entry?.visitHomeId||c?.homeId];
  const pets=[...(preferredHome?.pets||[])];
  Object.values(state.homes||{}).forEach(home=>(home?.pets||[]).forEach(pet=>{
    if(!pets.some(item=>item.id===pet.id))pets.push(pet);
  }));
  if(!pets.length)return null;
  const text=`${entry?.title||""} ${entry?.desc||""}`;
  let pet=entry?.petId?pets.find(item=>item.id===entry.petId):pets.find(item=>item.name&&text.includes(item.name));
  if(!pet&&/캣타워|고양이/.test(text))pet=pets.find(item=>item.species==="고양이");
  if(!pet&&/강아지|반려견/.test(text))pet=pets.find(item=>item.species==="강아지");
  if(!pet&&/반려동물|함께 사는 존재/.test(text))pet=pets[0];
  if(!pet||(!entry?.petId&&!/놀아|놀기|장난감|산책|돌보|빗질|간식|캣타워|반려/.test(text)))return null;
  return pet;
}
function nativeVisualSeed(value){
  let seed=2166136261;
  for(const char of String(value||"scene")){
    seed^=char.charCodeAt(0);
    seed=Math.imul(seed,16777619);
  }
  return seed>>>0;
}
function nativeSceneItemScore(person,item,entry){
  if(!person||!item)return -9999;
  const favoriteIds=[
    ...(person.favorites?.[item.kind]||[]),
    ...(person.favorites?.[`${item.kind}s`]||[])
  ];
  const preferenceText=[
    ...(person.foodPreferences||person.foodTypes||[]),
    ...(person.drinks||person.drinkTypes||[]),
    ...(person.interests||[])
  ].join(" ");
  const itemText=`${item.name||""} ${item.category||""} ${item.subtype||""} ${item.details||""}`;
  let score=nativeVisualSeed(`${person.id}:${item.id}:${entry?.minute||entry?.title||"scene"}`)%13;
  if(favoriteIds.includes(item.id))score+=90;
  for(const preference of preferenceText.split(/[,·\s]+/).filter(Boolean)){
    if(itemText.includes(preference)||preference.includes(item.category||"__"))score+=18;
  }
  if(item.kind==="food"){
    score-=Math.max(0,Number(item.spicy||0)-Number(person.spiceTolerance??2))*10;
    score-=Math.abs(Number(item.sweet||0)-Number(person.sweetPreference??2))*3;
  }
  const entryItem=catalogItem(entry?.itemId);
  if(entryItem?.id===item.id)score+=favoriteIds.includes(item.id)?36:12;
  if(entryItem?.category&&entryItem.category===item.category)score+=9;
  return score;
}
function nativeSceneFoodItem(person,entry,text){
  const available=catalogItems().filter(item=>item.kind==="food"||item.kind==="drink");
  if(!available.length)return null;
  const drinkScene=/(?:차|음료|커피|주스|탄산|술|칵테일|물)(?:을|를)?\s*(?:마시|마셔|따르|우리|내리)|한\s*잔|마실\s*(?:것|거리)/.test(text);
  const mealScene=/(?:음식|밥|식사|메뉴|디저트|간식|초밥|아침|점심|저녁)(?:을|를)?\s*(?:먹|맛보|고르|주문|나누)|먹는\s*중|먹고\s*있는|식사하는/.test(text);
  if(!drinkScene&&!mealScene)return null;
  // 장면에 실제로 적힌 음식이나 itemId만 보여 준다. 취향 점수만으로 전혀 다른
  // 초밥·파스타를 손에 들려 주면 행동 설명과 그림이 서로 어긋난다.
  const explicit=catalogItem(entry?.itemId)||available.find(item=>item.name&&text.includes(item.name));
  if(explicit)return explicit;
  return null;
}
function nativeFoodSymbol(item,text){
  const value=`${item?.name||""} ${item?.category||""} ${item?.subtype||""} ${text}`;
  if(/초밥|스시|회/.test(value))return "🍣";
  if(/파스타|스파게티|까르보나라/.test(value))return "🍝";
  if(/피자/.test(value))return "🍕";
  if(/치킨|닭튀김|후라이드|양념치킨/.test(value))return "🍗";
  if(/찌개|국물|수프|스프|전골|마라탕|훠궈/.test(value))return "🍲";
  if(/라면|국수|우동|소바|냉면/.test(value))return "🍜";
  if(/빵|베이커리|크루아상/.test(value))return "🥐";
  if(/샐러드|채식|야채/.test(value))return "🥗";
  if(/컵케이크|머핀/.test(value))return "🧁";
  if(/도넛|도너츠/.test(value))return "🍩";
  if(/쿠키|비스킷/.test(value))return "🍪";
  if(/케이크|디저트/.test(value))return "🍰";
  if(/초콜릿|초코/.test(value))return "🍫";
  if(/사탕|캔디/.test(value))return "🍬";
  if(/고기|스테이크|구이/.test(value))return "🥩";
  if(/과일|사과/.test(value))return "🍎";
  if(/버블티|밀크티|타피오카/.test(value))return "🧋";
  if(/맥주|에일|라거/.test(value))return "🍺";
  if(/샴페인|스파클링 와인/.test(value))return "🍾";
  if(/와인/.test(value))return "🍷";
  if(/마티니|위스키|브랜디/.test(value))return "🍸";
  if(/칵테일|하이볼/.test(value))return "🍹";
  if(/우유|라테|라떼/.test(value))return "🥛";
  if(/분유|젖병/.test(value))return "🍼";
  if(/커피/.test(value))return "☕";
  if(/차|티백|홍차|녹차/.test(value))return "🍵";
  if(/주스/.test(value))return "🧃";
  if(/탄산|콜라/.test(value))return "🥤";
  if(/음료|에이드|스무디/.test(value))return "🥤";
  if(/젓가락/.test(value))return "🥢";
  if(/포크/.test(value))return "🍴";
  if(/접시|식탁|식사/.test(value))return "🍽️";
  return "🥄";
}
function stableSceneChoice(person,text,values){
  const list=Array.isArray(values)&&values.length?values:[""];
  return list[nativeVisualSeed(`${person?.id||person?.name||"character"}:${text}`)%list.length];
}
function clothingOrganizingSymbol(person,text){
  const gender=String(person?.gender||"");
  const choices=gender==="남성"
    ?["👖","👕","🩳","👔","🧥","🥼"]
    :gender==="여성"
      ?["👖","👕","🩳","🧥","🥼","👗","👚"]
      :["👖","👕","🩳","👔","🧥","🥼","👗","👚"];
  return stableSceneChoice(person,text,choices);
}
function nativeOrganizingSymbol(person,text){
  if(/사진|앨범|이미지|포토/.test(text))return stableSceneChoice(person,text,["🗂️","🖼️"]);
  if(/문서|서류|파일|자료|원고/.test(text))return stableSceneChoice(person,text,["📁","📄"]);
  if(/원두|커피콩/.test(text))return "🫘";
  if(/꽃|꽃다발|화병/.test(text))return "💐";
  if(/차를 우리는|차를 우려|차를 내리|찻물을|차 한 잔|차를 마시|티백/.test(text))return "🍵";
  if(/식물|화분|허브|찻잎|나뭇잎/.test(text))return "🍃";
  if(/옷|의류|옷장|서랍장|빨래|상의|하의|바지|셔츠|재킷|코트|가운|원피스|블라우스/.test(text))return clothingOrganizingSymbol(person,text);
  if(/줄자|자를 (?:대|꺼내)|자로 (?:재|확인)|치수|길이|재단|도면/.test(text))return "📏";
  if(/보관함|수납함|아카이브|서류함|카드함|자료함|파일함/.test(text))return "🗃️";
  if(/통계|그래프|차트|매출|성과|분석|보고서/.test(text))return "📈";
  if(/업무|회사|출근|사무|사업|회의 자료/.test(text))return "💼";
  if(/책|책장|서가|잡지/.test(text))return "📚";
  if(/수건|침구|이불|담요/.test(text))return "🧺";
  if(/화장품|스킨케어|세면도구/.test(text))return "🧴";
  if(/냉장고|식재료|채소|과일/.test(text))return "🥕";
  if(/메모|기록|영수증|가계부|일정/.test(text))return "📝";
  if(/가방|백팩/.test(text))return "🎒";
  if(/카드|보드게임/.test(text))return "🎲";
  if(/택배|소포|포장|상자/.test(text))return "📦";
  if(/쿠션|소파/.test(text))return "🛋️";
  return "";
}
function nativeSceneActionProp(person,entry,actionKind,text,individual=false){
  let symbol="";
  let item=null;
  const teaAction=/차를 우리는|차를 우려|차를 내리|찻물을|차 한 잔|차를 마시|티백|홍차|녹차|보이차|말차/.test(text);
  if(actionKind==="tea"||teaAction)symbol="🍵";
  else if(actionKind==="eating"){
    item=nativeSceneFoodItem(person,entry,text);
    symbol=nativeFoodSymbol(item,text);
  }else if(actionKind==="coffee-drinking"||actionKind==="coffee-brewing")symbol="☕";
  else if(actionKind==="washing-up"){
    symbol=/양치|이를 닦|칫솔|치약/.test(text)?"🪥":/면도/.test(text)?"🪒":/샴푸|머리를 감|스킨케어|로션|기초화장/.test(text)?"🧴":/비누|손을 씻|몸을 씻|샤워|목욕|세수|세안/.test(text)?"🧼":"🫧";
  }
  else if(actionKind==="beans-organizing")symbol="🫘";
  else if(actionKind==="pet-care")symbol="🧶";
  else if(actionKind==="sweeping")symbol="🧹";
  else if(actionKind==="shoe-care")symbol="👞";
  else if(actionKind==="dishwashing"||actionKind==="wiping")symbol="🧽";
  else if(actionKind==="laundry")symbol="🧺";
  else if(actionKind==="spice-organizing")symbol="🧂";
  else if(actionKind==="accessory-organizing")symbol="💍";
  else if(actionKind==="assistive-check")symbol="⚙️";
  else if(actionKind==="organizing")symbol=nativeOrganizingSymbol(person,text);
  else if(actionKind==="gaming")symbol="🎮";
  else if(actionKind==="cooking")symbol=/탕|찌개|국|수프|끓/.test(text)?"🍲":/파스타|스파게티|면 요리/.test(text)?"🍝":"🍳";
  else if(actionKind==="reading")symbol="📖";
  else if(actionKind==="writing")symbol="📝";
  else if(actionKind==="music")symbol="🎵";
  else if(actionKind==="exercise")symbol="🏋️";
  else if(actionKind==="grooming")symbol=/향수|향을 고르/.test(text)?"🧴":"💄";
  else if(actionKind==="repair")symbol="🛠️";
  else if(actionKind==="gardening")symbol="🪴";
  else if(actionKind==="mail")symbol="✉️";
  if(!symbol)return "";
  const propVariant=symbol==="🪥"?" action-prop-toothbrush":symbol==="🧼"?" action-prop-soap":symbol==="👞"?" action-prop-shoe":"";
  const image=item?.image?`<img src="${esc(item.image)}" alt="">`:esc(symbol);
  const title=item?.name?`${person?.name||"캐릭터"} · ${item.name}`:`${person?.name||"캐릭터"} · ${symbol}`;
  return `<span class="${individual?"native-person-action-prop":"native-scene-action-prop"} action-prop-${actionKind}${propVariant}" title="${esc(title)}" aria-hidden="true">${image}</span>`;
}
function isRomanticCharacterView(view){
  const overall=String(view?.overall||"").trim();
  if(!overall||/친구로|가족|인간적인 호감|소중하게|존경|동경|안쓰럽/.test(overall))return false;
  return /연애|사랑|연심|없어서는 안 될|로맨틱/.test(overall);
}
function recognizesRomanticFeeling(view){
  if(!isRomanticCharacterView(view))return false;
  return !/우정으로 착각|경쟁심으로 착각|불편함으로 착각|자기 감정을 전혀 모름|느끼는 감정을 부정/.test(String(view?.awareness||""));
}
function relationshipForPair(firstId,secondId){
  return Object.values(state.relationships||{}).find(relation=>
    relation?.temporalStatus!=="past"
    &&((relation.a===firstId&&relation.b===secondId)||(relation.a===secondId&&relation.b===firstId))
  )||null;
}
function pairHasRomanticFeeling(firstId,secondId){
  return isRomanticCharacterView(explicitCharacterViewFor(firstId,secondId))
    ||isRomanticCharacterView(explicitCharacterViewFor(secondId,firstId));
}
function sceneEmotionScores(value){
  const text=String(value||"");
  const scores={shock:0,anger:0,sad:0,fear:0,romance:0,playful:0,warm:0};
  const add=(emotion,pattern,weight=1)=>{if(pattern.test(text))scores[emotion]+=weight};
  add("shock",/큰 충격|충격을 받|충격적|경악|믿기지 않|머리가 하얘|말문이 막|얼어붙었|청천벽력|아연실색|깜짝 놀라|예상하지 못|사고가 나|깨져 버|떨어뜨렸|들켜 버|폭로|비명/,4);
  add("anger",/분노|격분|화가 나|화를 냈|싸움|싸우|말다툼|언성을 높|신경전|맞받아|짜증|성질을 내|비난|항의/,3);
  add("sad",/우울|슬픔|상실|이별|헤어지|침울|낙담|기운이 없|울적|눈물|울음을|마음이 무거|속상|서럽|비참|외로|실망|후회|그리움|기분(?:이|은)?\s*안\s*좋|마음이 가라앉/,3);
  add("fear",/두려|무서|겁이|공포|위협|불안|긴장|경계|피하고 싶|숨이 막|손이 떨|초조|눈치를 보/,2);
  add("romance",/사랑|연애|데이트|입맞춤|키스|고백|연인|포옹|껴안|손을 잡|설렘|두근|애정|다정|낭만|좋아하는 상대|보고 싶었|깊이 아끼/,3);
  add("playful",/장난|농담|놀리|웃음|웃었|깔깔|게임|내기|재잘|신나|즐거|축하|춤을 추|노래를 부|티격태격/,2);
  add("warm",/편안|안심|여유|휴식|쉬는 중|산책|햇볕|차를 마|함께 식사|대화|이야기|도와주|챙기|나누|건네|안부|곁을 지|보살피/,1);
  return scores;
}
function strongestSceneEmotion(scores){
  // 같은 점수면 화면을 더 강하게 바꾸는 감정을 먼저 고른다.
  let best="neutral",bestScore=0;
  for(const key of ["shock","anger","sad","fear","romance","playful","warm"]){
    if((scores[key]||0)>bestScore){best=key;bestScore=scores[key]||0}
  }
  return best;
}
function nativeScenePresentation(c,entry,visualMode="sd"){
  const text=`${entry?.title||""} ${entry?.desc||""} ${entry?.mood||""}`;
  const sleeping=/자는 중|잠든|수면/.test(text);
  const drowsy=!sleeping&&/졸리|졸린|졸음|조는 중|꾸벅|눈꺼풀이|잠깐 눈을 감|하품/.test(text);
  // 공동 장면은 어느 캐릭터 탭에서 보더라도 같은 두 사람을 보여야 한다.
  // 상대 쪽 이벤트에만 withId가 남아 있는 예전 저장 데이터도 현재 시각·장소와
  // 상호 참조를 확인해 양방향으로 복원한다.
  const mirroredPartnerIds=state.order.filter(id=>{
    if(id===c.id||!state.characters?.[id])return false;
    const other=state.characters[id];
    const otherEntry=eventFor(other);
    const otherText=`${otherEntry?.title||""} ${otherEntry?.desc||""} ${otherEntry?.mood||""}`;
    const otherSleeping=/자는 중|잠든|수면/.test(otherText);
    if(sleeping!==otherSleeping)return false;
    const otherIds=[...(otherEntry?.participantOrder||[]),...(otherEntry?.withIds||[]),otherEntry?.withId].filter(Boolean);
    const sameMinute=Number.isFinite(Number(entry?.minute))&&Number(entry.minute)===Number(otherEntry?.minute);
    const sameInteraction=Boolean(entry?.interactionId&&entry.interactionId===otherEntry?.interactionId);
    const sameDate=Boolean(entry?.dateGroup&&entry.dateGroup===otherEntry?.dateGroup);
    const reciprocal=otherIds.includes(c.id);
    const thisHomeId=entry?.visitHomeId||c.homeId;
    const otherHomeId=otherEntry?.visitHomeId||other.homeId;
    const samePlace=entry?.home&&otherEntry?.home
      ?Boolean(thisHomeId&&thisHomeId===otherHomeId&&(!entry?.room||!otherEntry?.room||entry.room===otherEntry.room))
      :Boolean(!entry?.home&&!otherEntry?.home&&entry?.placeId&&entry.placeId===otherEntry?.placeId);
    const namesEachOther=String(otherEntry?.title||"").includes(c.name||"\u0000")||String(otherEntry?.desc||"").includes(c.name||"\u0000");
    const romanticConnection=samePlace&&pairHasRomanticFeeling(c.id,other.id);
    return sameMinute&&(sameInteraction||sameDate||(samePlace&&(reciprocal||namesEachOther||romanticConnection)));
  });
  const namedPartnerIds=state.order.filter(id=>id!==c.id&&id!==entry?.thoughtOfId&&state.characters?.[id]?.name&&text.includes(state.characters[id].name));
  const rawPartnerIds=[...new Set([...(entry?.participantOrder||[]),...(entry?.withIds||[]),entry?.withId,...namedPartnerIds,...mirroredPartnerIds].filter(id=>{
    if(!id||id===c.id||!state.characters?.[id])return false;
    const otherEntry=eventFor(state.characters[id]);
    const otherSleeping=/자는 중|잠든|수면/.test(`${otherEntry?.title||""} ${otherEntry?.desc||""} ${otherEntry?.mood||""}`);
    return sleeping===otherSleeping;
  }))];
  const dateParticipantIds=entry?.dateGroup
    ?state.order.filter(id=>String(entry.dateGroup).includes(id))
    :[];
  const validDate=Boolean(
    entry?.dateGroup
    &&entry?.datePurpose
    &&dateParticipantIds.length>=2
    &&dateParticipantIds.includes(c.id)
  );
  const explicitPartnerScene=Boolean(
    validDate
    ||entry?.groupInteraction
    ||mirroredPartnerIds.length
    ||rawPartnerIds.some(id=>text.includes(state.characters?.[id]?.name||"\u0000"))
    ||(/함께|서로|둘이|대화|이야기|말을 주고받|도와주|건네|놀리|장난|싸우|말다툼|데이트/.test(text)&&rawPartnerIds.length)
  );
  const orderedPartnerIds=validDate
    ?[...new Set([...(entry?.participantOrder||[]),entry?.withId,...dateParticipantIds].filter(id=>id&&id!==c.id&&dateParticipantIds.includes(id)))].slice(0,1)
    :explicitPartnerScene?rawPartnerIds:[];
  const partners=orderedPartnerIds.map(id=>state.characters?.[id]).filter(Boolean);
  const partner=partners[0]||null;
  const dating=Boolean(partner&&validDate);
  const fighting=Boolean(/싸움|싸우|말다툼|신경전|격렬|충돌|맞받아|목소리.{0,8}높|날카롭게|분노|화가 나|화를 냈/.test(text));
  const ownView=partner?characterViewFor(c.id,partner.id):{};
  const reverseView=partner?characterViewFor(partner.id,c.id):{};
  const viewText=`${ownView.overall||""} ${ownView.comfort||""} ${ownView.trust||""} ${ownView.fear||""} ${ownView.annoyance||""} ${ownView.conflictIntensity||""}`;
  const relationshipPressure=(()=>{
    let score=0;
    const overall=String(ownView.overall||"");
    const comfort=String(ownView.comfort||"");
    const trust=String(ownView.trust||"");
    const annoyance=String(ownView.annoyance||"");
    const conflict=String(ownView.conflictIntensity||"");
    if(/경계|싫어|미워|두려|적대|불신|부담/.test(overall))score+=2;
    if(/불편|긴장|숨 막|거리를 두|편하지 않/.test(comfort))score+=1;
    if(/믿지 않|불신|의심|신뢰하지 않/.test(trust))score+=1;
    if(/성가시|귀찮/.test(annoyance)&&!/않|아니|전혀|없/.test(annoyance))score+=1;
    if(/강한|격렬|잦|자주|심함/.test(conflict))score+=1;
    if(/편안|안심/.test(comfort))score-=1;
    if(/깊이 믿|매우 신뢰|완전히 믿/.test(trust))score-=1;
    return score;
  })();
  const overwhelmed=Boolean(dating&&relationshipPressure>=2);
  // 인간적인 호감이나 소중함은 연애 감정이 아니다. 하트·짝사랑 연출은
  // 캐릭터가 명시적으로 연애 감정을 설정한 경우에만 사용한다.
  const ownExplicitView=partner?explicitCharacterViewFor(c.id,partner.id):{};
  const reverseExplicitView=partner?explicitCharacterViewFor(partner.id,c.id):{};
  const ownRomanticFeeling=Boolean(partner&&isRomanticCharacterView(ownExplicitView));
  const reverseRomanticFeeling=Boolean(partner&&isRomanticCharacterView(reverseExplicitView));
  const ownRomanceInterest=Boolean(partner&&recognizesRomanticFeeling(ownExplicitView));
  const reverseRomanceInterest=Boolean(partner&&recognizesRomanticFeeling(reverseExplicitView));
  // 데이트 일정뿐 아니라, 함께 있는 상대를 이 캐릭터가 실제로 사랑한다고
  // 설정했다면 어느 캐릭터 탭에서 보더라도 그 방향의 분홍빛 연출을 사용한다.
  const ownRomance=Boolean(partner&&ownRomanceInterest&&!fighting);
  const failedDate=Boolean(dating&&!fighting&&(/망한|실패|거절|불편|어색|서먹|냉랭|잘라 말|비효율|말을 아끼|거리.{0,8}두|기분.{0,8}상/.test(text)||(!ownRomance&&overwhelmed)));
  const coldFight=fighting&&/냉랭|차갑|침묵|무시|거리.{0,8}두|서먹|얼음/.test(text);
  const playfulInteraction=Boolean(partner&&!dating&&!fighting&&/티격태격|장난|농담|놀리|웃음|웃었|게임|내기|재잘/.test(text));
  const tenseInteraction=Boolean(partner&&!dating&&!fighting&&!playfulInteraction&&/경계|불편|신경전|성가시|못마땅|퉁명|날 선|거리.{0,8}두/.test(`${text} ${viewText}`));
  const warmInteraction=Boolean(partner&&!dating&&!fighting&&!tenseInteraction&&/함께|대화|이야기|도와|챙기|나누|맞춰|건넸|안부|곁/.test(text));
  const actionKind=sleeping?"sleep"
    :drowsy?"drowsy"
    :/차를 우리는|차를 우려|차를 내리|찻물을|차 한 잔|차를 마시|티백|홍차|녹차|보이차|말차/.test(text)?"tea"
    :/빗자루|바닥.{0,12}(쓸|청소)|쓸고|쓸어/.test(text)?"sweeping"
      :/세수|세안|이를 닦|양치|칫솔|치약|샤워|목욕|머리를 감|몸을 씻|손을 씻|면도/.test(text)?"washing-up"
      :/설거지|그릇.{0,12}(씻|닦)|식기.{0,12}(씻|닦)|접시.{0,12}(씻|닦)|컵.{0,12}(씻|닦)|도구.{0,12}(씻|닦)|물뿌리개.{0,12}(씻|닦)|세척/.test(text)?"dishwashing"
        :/(?:신발|구두|운동화|부츠).{0,18}(?:손질|닦|솔질|광|먼지|얼룩)|(?:손질|닦|솔질|광).{0,18}(?:신발|구두|운동화|부츠)/.test(text)?"shoe-care"
        :/(?:사진|앨범|이미지|포토).{0,28}(?:정리|정돈|분류|고르|이름|폴더|파일|붙이)|(?:정리|정돈|분류|폴더|파일).{0,28}(?:사진|앨범|이미지|포토)/.test(text)?"organizing"
          :/(?:문서|서류|자료|원고|파일).{0,28}(?:정리|정돈|분류|고르|이름|폴더|붙이)|(?:정리|정돈|분류|폴더).{0,28}(?:문서|서류|자료|원고|파일)/.test(text)?"organizing"
          :/(?:빨래|옷|의류).{0,20}(?:정리|정돈|접|개|분류|옷장|서랍)/.test(text)?"organizing"
          :/세탁|빨래/.test(text)?"laundry"
          :/커피.{0,16}(마시|한 모금|맛보)|(?:마시|한 모금|맛보).{0,16}커피/.test(text)?"coffee-drinking"
            :/커피.{0,18}(내리|추출|드립|머신)|(?:내리|추출|드립).{0,18}커피|원두.{0,12}(갈|분쇄|추출)/.test(text)?"coffee-brewing"
              :/원두.{0,18}(정리|정돈|분류|고르|배치|밀봉|옮기|담)|(?:정리|정돈|분류|고르|배치|밀봉|옮기|담).{0,18}원두/.test(text)?"beans-organizing"
                :/게임|한 판|콘솔|컨트롤러|플레이|보드게임/.test(text)&&!/게임.{0,10}(기록|메모).{0,10}(정리|분류)/.test(text)?"gaming"
                  :/향신료.{0,18}(정리|분류|고르|배치)|(?:정리|분류|고르|배치).{0,18}향신료/.test(text)?"spice-organizing"
            :/(?:액세서리|악세서리|장신구).{0,18}(정리|분류|고르|배치)|(?:정리|분류|고르|배치).{0,18}(?:액세서리|악세서리|장신구)/.test(text)?"accessory-organizing"
              :/(?:의수|의족|휠체어|보조기기).{0,28}(?:점검|확인|상태|조절|배터리|소켓|브레이크|타이어)|(?:점검|확인|상태|조절).{0,28}(?:의수|의족|휠체어|보조기기)/.test(text)?"assistive-check"
                :/정리|정돈|분류|배치|제자리/.test(text)?"organizing"
                :/청소|먼지|닦/.test(text)?"wiping"
                  :/요리|굽|끓이|볶|레시피|조리/.test(text)?"cooking"
                    :/반려동물|함께 사는 존재|캣타워|고양이|강아지|반려견|놀아 주는|놀아주는|먹이/.test(text)?"pet-care"
                      :/먹는 중|먹고|먹으며|식사|디저트|간식|차를 마|음료를 마|초밥을 먹|메뉴.{0,12}(먹|맛보|고르)/.test(text)?"eating"
                        :/책을 읽|독서|읽는 중/.test(text)?"reading"
                          :/글을 쓰|초안|메모|기록하는 중/.test(text)?"writing"
                            :/음악|노래|연주|턴테이블/.test(text)?"music"
                              :/운동|훈련|스트레칭/.test(text)?"exercise"
                                :/화장|향수|향을 고르|머리를 정돈/.test(text)?"grooming"
                                  :/수리|고치|정비/.test(text)?"repair"
                                    :/식물|화분|원예/.test(text)?"gardening"
                                      :/우편|편지/.test(text)?"mail"
                                        :/두려|무서|겁이|공포|위협|피하고 싶/.test(`${text} ${viewText}`)?"fear"
                                          :fighting?"fighting":"idle";
  // 화면효과는 관계 설정이 아니라 현재 행동의 내용에서 먼저 감정을 읽는다.
  // 관계 시선은 함께 있는 사회적 장면의 동점·약한 신호만 보정한다.
  const emotionScores=sceneEmotionScores(text);
  if(fighting)emotionScores.anger+=5;
  if(failedDate){emotionScores.sad+=3;emotionScores.fear+=1}
  const explicitEmotion=strongestSceneEmotion(emotionScores);
  const explicitScore=emotionScores[explicitEmotion]||0;
  const explicitNegative=["shock","anger","sad","fear"].includes(explicitEmotion)&&explicitScore>=2;
  const socialAction=Boolean(partner&&/함께|서로|둘이|대화|이야기|데이트|산책|식사|마시|놀|게임|도와|챙기|나누|건네|곁|포옹|손을 잡/.test(text));
  if(!explicitNegative&&socialAction){
    // 분홍빛은 현재 보고 있는 캐릭터가 상대에게 느끼는 감정을 기준으로 한다.
    // 상대만 사랑하는 경우에는 상대 탭에서만 분홍빛이 보인다.
    if(ownRomanceInterest)emotionScores.romance+=2;
    if(relationshipPressure>=2)emotionScores.fear+=2;
  }
  if(playfulInteraction)emotionScores.playful+=2;
  if(warmInteraction)emotionScores.warm+=1;
  if(tenseInteraction)emotionScores.fear+=2;
  const sceneEmotion=explicitNegative?explicitEmotion:strongestSceneEmotion(emotionScores);
  const sceneEmotionScore=emotionScores[sceneEmotion]||0;
  const tone=sleeping?"sleep"
    :drowsy?"drowsy"
      :sceneEmotion==="shock"&&sceneEmotionScore>=2?"shock"
        :sceneEmotion==="anger"&&sceneEmotionScore>=2?(coldFight?"fight-ice":"fight-fire")
          :sceneEmotion==="sad"&&sceneEmotionScore>=2?"sad"
            :sceneEmotion==="fear"&&sceneEmotionScore>=2?"interaction-tense"
              :sceneEmotion==="romance"&&sceneEmotionScore>=2&&ownRomanceInterest
                ?(dating?"date-romantic":ownRomanceInterest&&reverseRomanceInterest?"crush-mutual":"crush-one-sided")
                :sceneEmotion==="playful"&&sceneEmotionScore>=2?"interaction-playful"
                  :sceneEmotion==="warm"&&sceneEmotionScore>=1?"interaction-warm"
                    :dating?"date-neutral":partner&&entry?.groupInteraction?"interaction-neutral":"neutral";
  const homeId=entry?.visitHomeId||c.homeId;
  const coResidentConversation=Boolean(
    partner
    &&entry?.home
    &&!dating
    &&!fighting
    &&/대화|이야기|말을 건|말을 나누|묻|대답|수다|상의|안부|농담|재잘|주고받/.test(text)
    &&partners.every(person=>
      person.homeId===homeId
      ||(person.residences||[]).some(residence=>residence.homeId===homeId)
    )
  );
  const companions=partner&&(entry?.groupInteraction||dating||fighting||ownRomanticFeeling||reverseRomanticFeeling||mirroredPartnerIds.length||partners.length>1||coResidentConversation)?partners:[];
  const pet=nativePetForScene(c,entry);
  const petVisual=pet?(pet.icon?`<img src="${esc(pet.icon)}" alt="${esc(pet.name)}">`:pet.photo?`<img class="photo" src="${esc(pet.photo)}" alt="${esc(pet.name)}">`:`<span>${PET_SCENE_EMOJI[pet.species]||PET_SCENE_EMOJI.기타}</span>`):"";
  const effectSymbol=tone==="sleep"
    ?""
    :tone==="shock"?"⚡"
    :tone==="date-romantic"||tone==="date-overwhelmed"||tone==="crush-mutual"||tone==="crush-one-sided"
    ?"♥"
    :tone==="date-broken"?"💔"
      :tone==="sad"?"•"
        :tone==="interaction-playful"?"♪"
          :tone==="interaction-warm"?"✦"
            :tone==="interaction-tense"?""
              :tone.startsWith("fight-")?"✦":"";
  const effectCount=tone==="sleep"?6:tone==="sad"?12:10;
  const effectSeed=nativeVisualSeed(`${entry?.interactionId||entry?.dateGroup||entry?.title}:${entry?.minute||""}:${c.id}`);
  const effects=effectSymbol?`<span class="native-scene-effects" aria-hidden="true">${Array.from({length:effectCount},(_,index)=>{
    const seed=nativeVisualSeed(`${effectSeed}:${index}`);
    const x=4+(seed%91);
    const y=8+((seed>>>7)%65);
    const delay=((seed>>>15)%520)/100;
    const duration=2.8+((seed>>>23)%230)/100;
    const scale=.72+((seed>>>4)%56)/100;
    const tilt=-18+((seed>>>12)%37);
    return `<i style="--fx-index:${index};--fx-x:${x}%;--fx-y:${y}%;--fx-delay:${delay}s;--fx-duration:${duration}s;--fx-scale:${scale};--fx-tilt:${tilt}deg">${effectSymbol}</i>`;
  }).join("")}</span>`:"";
  const sceneIds=new Set([c.id,...partners.map(person=>person.id)]);
  const configuredRelation=partner?Object.values(state.relationships||{}).find(relation=>
    Array.isArray(relation.displayOrder)
    &&relation.displayOrder.includes(c.id)
    &&relation.displayOrder.includes(partner.id)
  ):null;
  const configuredOrder=Array.isArray(entry?.participantOrder)&&entry.participantOrder.length
    ?entry.participantOrder
    :Array.isArray(configuredRelation?.displayOrder)?configuredRelation.displayOrder:[];
  const sceneParticipantIds=[...new Set([
    ...configuredOrder.filter(id=>sceneIds.has(id)),
    c.id,
    ...partners.map(person=>person.id)
  ])];
  const sceneParticipants=sceneParticipantIds.map(id=>state.characters?.[id]).filter(Boolean);
  const lineupHtml=companions.length?`<span class="native-scene-lineup ${coResidentConversation?"is-conversation":""} ${sceneParticipants.length===2?"is-pair":""}" style="--scene-count:${sceneParticipants.length}" aria-label="${esc(sceneParticipants.map(person=>person.name).join(", "))}">${sceneParticipants.map((person,index)=>{
    const personSeed=nativeVisualSeed(`${entry?.interactionId||entry?.dateGroup||entry?.title}:${entry?.minute||""}:${person.id}:${index}`);
    const delay=((personSeed>>>15)%120)/100,duration=3.4+((personSeed>>>22)%120)/100;
    const actionProp=nativeSceneActionProp(person,entry,actionKind,text,true);
    const personEntry=person.id===c.id?entry:eventFor(person);
    const personText=`${personEntry?.title||""} ${personEntry?.desc||""} ${personEntry?.mood||""}`;
    const personSleeping=/자는 중|잠든|수면/.test(personText);
    const personDrowsy=!personSleeping&&/졸리|졸린|졸음|조는 중|꾸벅|눈꺼풀이|잠깐 눈을 감|하품/.test(personText);
    const sleepBadge=personSleeping?'<b class="native-character-sleep-mark" aria-hidden="true">ZZ</b>':personDrowsy?'<b class="native-character-drowsy-mark" aria-hidden="true">z</b>':"";
    const personVisualScale=Math.max(70,Math.min(150,Number(visualMode==="ld"?state.homeLdScale:state.homeSdScale)||100))/100;
    const pairSlot=sceneParticipants.length===2?(index===0?"pair-slot-left":"pair-slot-right"):"";
    return `<span class="native-scene-lineup-person ${pairSlot} ${person.id===c.id?"is-current is-selected":""} ${visualMode==="ld"&&hasLdArt(person)?"is-ld":""}" style="--scene-index:${index};--scene-delay:${delay}s;--scene-duration:${duration}s;--person-visual-scale:${personVisualScale};${sceneLayoutVars(person,visualMode)}">${sceneAvatar(person,"native-scene-lineup-avatar",tone,visualMode)}${actionProp}${sleepBadge}${tone==="date-overwhelmed"&&person.id===c.id?'<b class="native-character-sweat" aria-hidden="true">💧</b>':""}<small>${esc(person.name)}</small></span>`;
  }).join("")}</span>`:"";
  const conversationalInteraction=Boolean(
    companions.length
    &&!fighting
    &&/대화|이야기|말을 건|말을 나누|묻|대답|수다|상의|안부|농담|재잘|주고받|티격태격/.test(text)
  );
  const bubbleWords=tone==="interaction-playful"
    ?["♪","!"]
    :tone==="interaction-tense"?["!","?"]
      :tone==="interaction-warm"?["♪","?"]:["?","!"];
  const conversationHtml=conversationalInteraction
    ?`<span class="native-conversation-bubbles ${tone==="interaction-playful"?"is-playful":tone==="interaction-tense"?"is-tense":""}" aria-label="두 캐릭터가 대화를 주고받는 중">${bubbleWords.map(word=>`<i>${word}</i>`).join("")}</span>`
    :"";
  const actionHtml=companions.length?"":nativeSceneActionProp(c,entry,actionKind,text);
  const thoughtPerson=entry?.thoughtOfId&&state.characters?.[entry.thoughtOfId]?.id!==c.id?state.characters[entry.thoughtOfId]:null;
  const thoughtHtml=thoughtPerson?`<span class="native-important-thought" aria-label="${esc(thoughtPerson.name)}을 떠올리는 중"><i>…</i>${avatar(thoughtPerson)}<small>${esc(thoughtPerson.name)}</small></span>`:"";
  const atmosphere=tone==="shock"
    ?"shock"
    :["date-romantic","crush-mutual","crush-one-sided"].includes(tone)
      ?"romance"
      :["sad","date-broken","date-overwhelmed"].includes(tone)?"rain":"none";
  return {
    tone,
    atmosphere,
    actionKind,
    partner:companions[0]||null,
    partners:companions,
    participantCount:sceneParticipants.length,
    pet,
    lineupHtml,
    sleepMarkHtml:tone==="sleep"&&!companions.length?'<b class="native-character-sleep-mark is-main" aria-hidden="true">ZZ</b>':tone==="drowsy"&&!companions.length?'<b class="native-character-drowsy-mark is-main" aria-hidden="true">z</b>':"",
    conversationHtml,
    thoughtHtml,
    actionHtml,
    companionHtml:"",
    petHtml:pet?`<span class="native-pet-orbit" aria-label="함께 노는 ${esc(pet.name)}"><span class="native-scene-pet">${petVisual}<small>${esc(pet.name)}</small></span></span>`:"",
    effects
  };
}
function importantEntry(entry){return /출근|수업|직장|데이트|병원|다툼|기상|공무|훈련/.test(entry.title)}
const loggableEntry=entry=>entry?.title!=="자는 중"&&!/에서 자는 중$/.test(entry?.title||"");
function preferredMomentEntry(previous,next){
  if(!previous)return next;
  const score=item=>{
    const purpose=String(item?.datePurpose||"").trim();
    const title=String(item?.title||"");
    let value=0;
    if(item?.dateGroup)value+=8;
    if(item?.groupInteraction)value+=3;
    if(purpose&&title.includes(purpose))value+=7;
    if(/^.+?[과와] 데이트\s*·/.test(title))value+=4;
    // 예전 공동 장면에서 기본 행동 뒤에 다른 제목을 계속 붙인 항목은
    // 같은 분의 목적이 분명한 장면보다 우선하지 않는다.
    value-=Math.max(0,title.split(" · ").length-2)*4;
    return value;
  };
  return score(next)>=score(previous)?next:previous;
}
function uniqueDisplayedMoments(entries){
  const byMinute=new Map();
  [...entries].sort((a,b)=>Number(a.minute)-Number(b.minute)).forEach(item=>{
    const minute=Number(item?.minute);
    if(!Number.isFinite(minute))return;
    const moment=String(item?.time||`${String(Math.floor(minute/60)).padStart(2,"0")}:${String(minute%60).padStart(2,"0")}`);
    byMinute.set(moment,preferredMomentEntry(byMinute.get(moment),item));
  });
  return [...byMinute.values()].sort((a,b)=>Number(a.minute)-Number(b.minute));
}
function dailyLogItems(entries,c){
  const seen=new Set();
  const canonicalDateGroup=x=>x?.dateGroup?String(x.dateGroup):"";
  return uniqueDisplayedMoments(entries).map(x=>{
    if(x.dateGroup){
      const groupKey=canonicalDateGroup(x);
      if(seen.has(groupKey))return"";seen.add(groupKey);
      const stepMap=new Map();
      const storySeen=new Set();
      entries.filter(step=>canonicalDateGroup(step)===groupKey).sort((a,b)=>a.minute-b.minute).forEach(step=>{
        const storyKey=[step.title,step.desc].map(value=>String(value||"").replace(/^.+?[과와] 데이트\s*·\s*/,"").replace(/^데이트\s*·\s*/,"").replace(/\s+/g," ").trim()).join("|");
        if(storySeen.has(storyKey))return;
        storySeen.add(storyKey);
        const key=String(step.time||step.minute);
        stepMap.set(key,preferredMomentEntry(stepMap.get(key),step));
      });
      const steps=[...stepMap.values()];
      const partner=state.characters[x.withId],title=partner?`${togetherText(partner.name)} 데이트`:`데이트 일정`;
      const purpose=x.datePurpose?` · ${x.datePurpose}`:"";
      return `<li class="date-schedule" style="--log-theme:var(--p)"><div class="date-schedule-title"><b>${esc(title+purpose)}</b><small>${esc(steps[0].time)}–${esc(steps.at(-1).time)}</small></div><ol>${steps.map(step=>`<li><time>${esc(step.time)}</time><span><b>${esc(step.title.replace(/^.+?[과와] 데이트\s*·\s*/,"").replace(/^데이트\s*·\s*/,""))}</b><small>${esc(step.desc)}</small></span></li>`).join("")}</ol></li>`;
    }
    return `<li class="${importantEntry(x)?"important":""} ${x===entries.at(-1)?"now":""}" style="--log-theme:var(--p)"><time>${esc(x.time)}</time><span><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></span></li>`;
  }).join("");
}
function compactDisplayedTimeline(entries,minGap=30){
  const compact=[];
  [...entries].sort((a,b)=>Number(a.minute)-Number(b.minute)).forEach(item=>{
    let previous=compact.at(-1);
    const sameLocation=(a,b)=>Boolean(a&&b&&
      (a.visitHomeId||a.homeId||"")===(b.visitHomeId||b.homeId||"")&&
      (a.placeId||"")===(b.placeId||"")&&
      (a.room||"")===(b.room||""));
    const shadowsPrevious=Boolean(previous&&item?.groupInteraction&&
      Number(item.minute)-Number(previous.minute)<=10&&
      Number(item.minute)>=Number(previous.minute)&&
      sameLocation(previous,item)&&
      (String(item.baseTitle||"")===String(previous.title||"")||
        String(item.title||"").split(" · ").includes(String(previous.title||""))));
    if(shadowsPrevious){compact.pop();previous=compact.at(-1)}
    const normalized=value=>String(value||"").replace(/\s+/g," ").trim();
    const titleParts=value=>[...new Set(normalized(value).split(" · ").filter(Boolean))];
    const sameDateStory=Boolean(previous&&item?.dateGroup&&item.dateGroup===previous.dateGroup&&(
      normalized(item.title)===normalized(previous.title)||
      (titleParts(item.title).some(part=>titleParts(previous.title).includes(part))&&(
        normalized(item.desc)===normalized(previous.desc)||
        normalized(item.desc).includes(normalized(previous.desc))||
        normalized(previous.desc).includes(normalized(item.desc))
      ))
    ));
    const nearDuplicate=Boolean(previous&&(sameDateStory||Math.abs(Number(item.minute)-Number(previous.minute))<=15&&sameLocation(previous,item)&&(
      (item.interactionId&&item.interactionId===previous.interactionId)||
      (titleParts(item.title).some(part=>titleParts(previous.title).includes(part))&&(
        normalized(item.desc)===normalized(previous.desc)||
        normalized(item.desc).includes(normalized(previous.desc))||
        normalized(previous.desc).includes(normalized(item.desc))
      ))
    )));
    if(nearDuplicate){compact[compact.length-1]=preferredMomentEntry(previous,item);return}
    const protectedEntry=Boolean(item?.dateGroup||item?.interactionId||item?.groupInteraction||item?.careRoutine||/휠체어|의수|의족|보조기기/.test(`${item?.title||""} ${item?.desc||""}`));
    const previousProtected=Boolean(previous?.dateGroup||previous?.interactionId||previous?.groupInteraction||previous?.careRoutine||/휠체어|의수|의족|보조기기/.test(`${previous?.title||""} ${previous?.desc||""}`));
    if(!previous||protectedEntry||previousProtected||Number(item.minute)-Number(previous.minute)>=minGap)compact.push(item);
    else compact[compact.length-1]=item;
  });
  return compact;
}
function displayTimeline(c,current=eventFor(c)){
  const entries=visibleTimeline(c).filter(loggableEntry);
  if(loggableEntry(current)){
    // 현재 장면은 시뮬레이션 타이머가 저장한 같은 분의 항목과 제목이 조금
    // 달라도 하나의 순간이다. 같은 시각의 기존 항목을 치환해 이중 표기를 막는다.
    const withoutSameMinute=entries.filter(item=>Number(item.minute)!==Number(current.minute)&&String(item.time||"")!==String(current.time||""));
    entries.splice(0,entries.length,...withoutSameMinute,current);
  }
  return compactDisplayedTimeline(uniqueDisplayedMoments(entries));
}
function dailyLog(c){
  const entries=displayTimeline(c);
  return `<section class="panel life-log shared-life-log"><div class="title"><h2>오늘의 생활 로그</h2><small>${esc(c.name)} · 관찰과 집에서 같은 기록을 보여줘요</small></div><ol>${dailyLogItems(entries,c)}</ol></section>`;
}
function homeDailyLog(chars,h){
  const now=new Date(),nowMinute=now.getHours()*60+now.getMinutes(),time=minute=>`${String(Math.floor(minute/60)).padStart(2,"0")}:${String(minute%60).padStart(2,"0")}`;
  const entries=chars.flatMap(c=>{
    const visible=visibleTimeline(c).filter(loggableEntry),current=eventFor(c);
    // 집 전체 로그에서도 현재 장면과 같은 분의 저장 항목은 제목이 조금 달라도
    // 하나의 순간으로 취급한다. 저장 타이머 직전/직후의 이중 표기를 막는다.
    const sequence=compactDisplayedTimeline(uniqueDisplayedMoments(loggableEntry(current)?[...visible.filter(item=>Number(item.minute)!==Number(current.minute)&&String(item.time||"")!==String(current.time||"")),current]:visible));
    const own=[];
    sequence.forEach((x,index)=>{
      const previous=sequence[index-1];
      const atThisHome=x.home&&(x.visitHomeId||c.homeId)===h.id;
      const previousAtThisHome=previous?.home&&(previous.visitHomeId||c.homeId)===h.id;
      if(atThisHome)own.push({...x,character:c});
      const returningHome=x.returningHome||(x.transit&&x.townId===c.townId&&/돌아가|돌아오/.test(x.title||""));
      if(!x.home&&previousAtThisHome&&!returningHome)own.push({minute:Math.max(previous.minute+1,x.minute-8),time:time(Math.max(previous.minute+1,x.minute-8)),title:"외출",desc:`${x.title} 일정을 위해 집을 나섰어요. 문을 잠그고 필요한 소지품을 확인했어요.`,room:"entry",character:c,important:true});
      if(atThisHome&&previous&&!previous.home)own.push({minute:Math.max(previous.minute+1,x.minute-5),time:time(Math.max(previous.minute+1,x.minute-5)),title:"귀가",desc:"바깥 일정을 마치고 돌아와 신발과 겉옷을 정리하며 집 안으로 들어왔어요.",room:"entry",character:c,important:true});
    });
    return own;
  });
  const daySeed=Number(`${now.getFullYear()}${now.getMonth()+1}${now.getDate()}`),residents=chars.length?chars:[state.characters[state.activeId]].filter(Boolean),pets=h.pets||[];
  const characterAtHomeAt=(character,minute)=>{
    const latest=visibleTimeline(character).filter(item=>item.minute<=minute).at(-1);
    return Boolean(latest?.home&&(latest.visitHomeId||character.homeId)===h.id);
  };
  const cleaningMinute=20*60+5,cleaningCandidates=residents.filter(character=>characterAtHomeAt(character,cleaningMinute));
  const houseEvents=[
    {minute:9*60+12,title:"우편물이 도착함",desc:"현관 우편함에 오늘 도착한 우편물이 들어왔어요. 집에 먼저 들어오는 사람이 확인할 수 있게 기다리고 있어요.",room:"entry",houseIcon:"✉️"},
    {minute:14*60+26,title:"택배가 도착함",desc:"현관 앞에 택배 상자가 놓였어요. 배송 알림도 함께 도착했어요.",room:"entry",houseIcon:"📦"}
  ];
  if(cleaningCandidates.length)houseEvents.push({minute:cleaningMinute,title:"집 안을 청소하는 중",desc:"집에 머무는 동안 눈에 띄는 먼지와 흩어진 물건을 정리하고 자주 쓰는 공간을 가볍게 닦고 있어요.",room:"living",character:cleaningCandidates[daySeed%cleaningCandidates.length]});
  if(pets.length){
    const pet=pets[daySeed%pets.length],petMinute=11*60+38+(daySeed%4)*17;
    houseEvents.push({minute:petMinute,title:`${pet.name}의 작은 사고`,desc:`${pet.name}이 놀다가 쿠션과 장난감을 바닥에 흩어 놓고 아무 일도 없었다는 듯 주변을 살피고 있어요.`,room:pet.room||"living",pet});
  }
  entries.push(...houseEvents.filter(x=>x.minute<=nowMinute).map(x=>({...x,time:time(x.minute)})));
  entries.sort((a,b)=>a.minute-b.minute);
  // 공동 장면은 상대의 타임라인에도 동시에 기록됩니다. 한 인물에게 같은 분의
  // 제목만 조금 다른 항목이 겹쳐도 하나의 순간으로 보이도록 마지막 항목만 남깁니다.
  const deduped=[],seenEntries=new Set();
  entries.forEach(item=>{
    const key=[item.character?.id||item.pet?.id||"house",item.time||item.minute].join("|");
    if(seenEntries.has(key)){
      const index=deduped.findIndex(previous=>[previous.character?.id||previous.pet?.id||"house",previous.time||previous.minute].join("|")===key);
      if(index>=0)deduped[index]=item;
      return;
    }
    seenEntries.add(key);
    deduped.push(item);
  });
  entries.splice(0,entries.length,...deduped);
  const face=x=>x.character?avatar(x.character,"log-face"):x.pet?(x.pet.icon||x.pet.photo?`<img class="avatar log-face" src="${esc(x.pet.icon||x.pet.photo)}" alt="">`:`<span class="avatar log-face">🐾</span>`):`<span class="avatar log-face house-event-icon">${x.houseIcon||"🏠"}</span>`;
  const owner=x=>x.character?`${x.character.name} · `:x.pet?`${x.pet.name} · `:"";
  return `<section class="panel life-log home-family-log"><div class="title"><h2>집 생활 로그</h2><small>구성원의 외출·귀가와 반려생물·청소·배송 등 집 전체의 기록</small></div><ol>${entries.map(x=>`<li class="${importantEntry(x)||x.important?"important":""}" style="--log-theme:${esc(x.character?.theme?.primary||"#176b60")}"><time>${esc(x.time)}</time><span class="log-person">${face(x)}<span><b>${esc(owner(x))}${esc(x.title)}</b><small>${esc(h.rooms?.[x.room]?.name||"집 안")} · ${esc(x.desc)}</small></span></span></li>`).join("")||"<li>아직 집 기록이 없어요.</li>"}</ol></section>`;
}
function peopleAtPlaceCard(p){
  const group=charactersAtPlace(p.id,state.activeTownId);if(!group.length)return"";
  const visible=group.slice(0,5),hiddenCount=Math.max(0,group.length-visible.length);
  const names=group.map(c=>c.name).join(", ");
  const x=Math.max(9,Math.min(91,p.x)),y=Math.max(12,Math.min(91,p.y+4.5));
  return `<div class="person place-people ${state.mapCharacterLabelMode==="name"?"show-name":"icon-only"}" title="${esc(names)}" style="left:${x}%;top:${y}%;--people-count:${visible.length}"><span class="place-people-faces">${visible.map(c=>`<button type="button" class="place-person-face" data-person="${c.id}" title="${esc(c.name)}">${avatar(c)}</button>`).join("")}${hiddenCount?`<b class="place-person-more" aria-label="그 외 ${hiddenCount}명">+${hiddenCount}</b>`:""}</span>${state.mapCharacterLabelMode==="name"?`<span class="place-people-names">${esc(names)}</span>`:""}</div>`;
}
function peopleAtHomeCard(home){
  const group=charactersInsideHome(home.id);if(!group.length)return"";
  const visible=group.slice(0,5),hiddenCount=Math.max(0,group.length-visible.length),names=group.map(c=>c.name).join(", ");
  const x=Math.max(9,Math.min(91,home.mapX)),y=Math.max(12,Math.min(91,home.mapY+4.5));
  return `<div class="person place-people home-place-people ${state.mapCharacterLabelMode==="name"?"show-name":"icon-only"}" title="${esc(names)}" style="left:${x}%;top:${y}%;--people-count:${visible.length}"><span class="place-people-faces">${visible.map(c=>`<button type="button" class="place-person-face" data-person="${c.id}" title="${esc(c.name)}">${avatar(c)}</button>`).join("")}${hiddenCount?`<b class="place-person-more">+${hiddenCount}</b>`:""}</span>${state.mapCharacterLabelMode==="name"?`<span class="place-people-names">${esc(names)}</span>`:""}</div>`;
}
function buildingDetailDialogs(){
  const placeDialogs=state.world.places.map(place=>{
    const residents=charactersAtPlace(place.id,state.activeTownId);
    const stock=(place.stock||[]).map(catalogItem).filter(Boolean);
    const type=[place.type,place.subtype].filter(Boolean).join(" · ")||"유형 미설정";
    const audiences=(place.audiences||[]).length?place.audiences.join(" · "):"설정하지 않음";
    const residentCards=residents.map(character=>{
      const entry=eventFor(character);
      return `<article class="building-resident-card">${avatar(character)}<span><b>${esc(character.name)}</b><small>${esc(entry.title)}</small><em>${esc(entry.desc)}</em></span></article>`;
    }).join("")||`<p class="building-detail-empty">현재 이 건물 안에 있는 캐릭터가 없어요.</p>`;
    const stockList=stock.length?`<ul class="building-stock-list">${stock.map(item=>`<li>${item.image?`<img src="${esc(item.image)}" alt="">`:`<span>${esc(({food:"🍽️",fashion:"👕",music:"🎵",game:"🎮",media:"🎬",book:"📚"})[item.kind]||"✨")}</span>`}<b>${esc(item.name)}</b></li>`).join("")}</ul>`:`<p class="building-detail-empty">등록된 판매 상품이나 이용 항목이 없어요.</p>`;
    const interior=place.interiorImage?`<img src="${esc(place.interiorImage)}" alt="${esc(place.name)} 내부">`:`<div class="building-interior-placeholder"><span>${esc(place.emoji||"🏢")}</span><b>내부 이미지가 아직 없어요</b><small>마을 편집에서 내부 사진을 등록할 수 있어요.</small></div>`;
    return `<dialog class="building-detail-dialog" data-building-detail-dialog="${place.id}"><form method="dialog"><header><span><small>BUILDING</small><h2>${esc(place.name)}</h2></span><button value="close" aria-label="닫기">×</button></header><div class="building-detail-layout"><section class="building-interior-view">${interior}</section><section class="building-detail-info"><dl><div><dt>건물 유형</dt><dd>${esc(type)}</dd></div><div><dt>가격대</dt><dd>${esc(place.priceRange||"보통")}</dd></div><div><dt>주요 이용층</dt><dd>${esc(audiences)}</dd></div></dl><div><h3>지금 안에 있는 인물 <small>${residents.length}명</small></h3><div class="building-resident-list">${residentCards}</div></div><div><h3>이곳에서 이용할 수 있는 것</h3>${stockList}</div></section></div><button class="primary building-detail-close" value="close">닫기</button></form></dialog>`;
  }).join("");
  const homeDialogs=townHomes().map(home=>{
    const current=charactersInsideHome(home.id);
    const residents=state.order.map(id=>state.characters[id]).filter(character=>character&&(character.residences||[]).some(item=>item.homeId===home.id));
    const currentCards=current.map(character=>{const entry=eventFor(character);return `<article class="building-resident-card">${avatar(character)}<span><b>${esc(character.name)}</b><small>${esc(entry.title)}</small><em>${esc(entry.desc)}</em></span></article>`}).join("")||`<p class="building-detail-empty">현재 이 집 안에 있는 캐릭터가 없어요.</p>`;
    const residentNames=residents.length?residents.map(character=>character.name).join(" · "):"연결된 거주자 없음";
    const roomEntries=Object.values(home.rooms||{}).sort((a,b)=>(a.order||0)-(b.order||0));
    const interiorImage=home.image||roomEntries.find(room=>room.image)?.image||"";
    const interior=interiorImage?`<img src="${esc(interiorImage)}" alt="${esc(home.name)} 대표 실내">`:`<div class="building-interior-placeholder"><span>🏠</span><b>대표 실내 이미지가 아직 없어요</b><small>집 화면에서 집이나 방 사진을 등록할 수 있어요.</small></div>`;
    return `<dialog class="building-detail-dialog" data-building-detail-dialog="home:${home.id}"><form method="dialog"><header><span><small>HOME</small><h2>${esc(home.name)}</h2></span><button value="close" aria-label="닫기">×</button></header><div class="building-detail-layout"><section class="building-interior-view">${interior}</section><section class="building-detail-info"><dl><div><dt>집 유형</dt><dd>${esc(home.kind||"일반 주거")}</dd></div><div><dt>외관 분위기</dt><dd>${esc(home.exteriorStyle||"설정하지 않음")}</dd></div><div><dt>방 수</dt><dd>${roomEntries.length}개</dd></div><div><dt>거주자로 연결된 캐릭터</dt><dd>${esc(residentNames)}</dd></div></dl><div><h3>지금 집 안에 있는 캐릭터 <small>${current.length}명</small></h3><div class="building-resident-list">${currentCards}</div></div>${home.notes?`<div><h3>집 메모</h3><p>${esc(home.notes)}</p></div>`:""}</section></div><button class="primary building-detail-close" value="close">닫기</button></form></dialog>`;
  }).join("");
  return placeDialogs+homeDialogs;
}
function characterStatisticsDialog(standalone=false){
  const characters=state.order.map(id=>state.characters[id]).filter(Boolean),total=characters.length;
  const distribution=(values,limit=8)=>{
    const counts=new Map();
    values.flat().filter(Boolean).forEach(value=>counts.set(String(value),1+(counts.get(String(value))||0)));
    return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"ko")).slice(0,limit);
  };
  const rows=items=>items.map(([label,count])=>{
    const percent=total?Math.round(count/total*100):0;
    return `<li><span><b>${esc(label)}</b><small>${count}명 · ${percent}%</small></span><i style="--stat-value:${percent}%"><u></u></i></li>`;
  }).join("")||`<li class="empty">아직 표시할 캐릭터가 없어요.</li>`;
  const townName=character=>state.towns.find(town=>town.id===visibleTownId(character))?.name||"마을 미지정";
  const averageTime=(field,night=false)=>{
    const values=characters.map(character=>String(character[field]||"")).filter(value=>/^\d{1,2}:\d{2}$/.test(value)).map(value=>{
      const [hour,minute]=value.split(":").map(Number),minutes=hour*60+minute;
      return night&&minutes<12*60?minutes+1440:minutes;
    });
    if(!values.length)return "설정하지 않음";
    const mean=Math.round(values.reduce((sum,value)=>sum+value,0)/values.length)%1440;
    return `${String(Math.floor(mean/60)).padStart(2,"0")}:${String(mean%60).padStart(2,"0")}`;
  };
  const ratio=(predicate)=>total?Math.round(characters.filter(predicate).length/total*100):0;
  const driverRatio=ratio(character=>!["","면허 없음","설정하지 않음"].includes(String(character.driverLicense||"")));
  const smokerRatio=ratio(character=>["가끔 흡연","전자담배 사용","흡연"].includes(character.smokingStatus));
  const bodyConfiguredRatio=ratio(character=>{
    const body=character.bodyProfile||{};
    return !["","설정하지 않음"].includes(String(body.bodySize||""))||(body.physicalTraits||[]).length>0;
  });
  const assistiveRatio=ratio(character=>{
    const body=character.bodyProfile||{};
    return !["","사용하지 않음","설정하지 않음"].includes(String(body.wheelchair?.type||"사용하지 않음"))
      ||!["","사용하지 않음","설정하지 않음"].includes(String(body.prostheticArm?.side||"사용하지 않음"))
      ||!["","사용하지 않음","설정하지 않음"].includes(String(body.prostheticLeg?.side||"사용하지 않음"))
      ||(body.accessibilityPreferences||[]).length>0;
  });
  const bodyValue=(character,path,fallback="설정하지 않음")=>path.reduce((value,key)=>value?.[key],character.bodyProfile)||fallback;
  const eyeValues=characters.map(character=>{
    const left=bodyValue(character,["appearance","leftEyeColor"]),right=bodyValue(character,["appearance","rightEyeColor"]);
    return left===right?left:`${left} / ${right}`;
  });
  const groups=[
    ["성별",distribution(characters.map(character=>character.gender||"설정하지 않음"))],
    ["나이대",distribution(characters.map(character=>character.ageGroup||"설정하지 않음"))],
    ["직업",distribution(characters.map(character=>character.jobTitle||character.job||"무직"))],
    ["말투",distribution(characters.map(character=>character.speechStyle||"자동 · 성격에 맞춤"))],
    ["성격 유형",distribution(characters.map(character=>character.personalityTypes?.length?character.personalityTypes:["설정하지 않음"]),10)],
    ["생활 마을",distribution(characters.map(townName))],
    ["소비 유형",distribution(characters.map(character=>character.income||"설정하지 않음"))],
    ["재산",distribution(characters.map(character=>character.wealth||"설정하지 않음"))],
    ["운전면허·운전 경험",distribution(characters.map(character=>character.driverLicense||"면허 없음"))],
    ["흡연 여부",distribution(characters.map(character=>character.smokingStatus||"설정하지 않음"))],
    ["주량",distribution(characters.map(character=>character.alcoholTolerance||"설정하지 않음"))],
    ["기상 습관",distribution(characters.map(character=>character.wakeHabit||"설정하지 않음"))],
    ["수면 습관",distribution(characters.map(character=>character.sleepHabit||"설정하지 않음"))],
    ["사람과 어울리는 방식",distribution(characters.map(character=>character.socialStyle||"설정하지 않음"))],
    ["일정을 다루는 방식",distribution(characters.map(character=>character.planningStyle||"설정하지 않음"))],
    ["깔끔한 정도",distribution(characters.map(character=>character.neatness||"설정하지 않음"))],
    ["갈등 대응",distribution(characters.map(character=>character.conflictStyle||"설정하지 않음"))],
    ["애정 표현",distribution(characters.map(character=>character.affectionStyle||"설정하지 않음"))]
    ,["체형",distribution(characters.map(character=>bodyValue(character,["bodySize"]))) ]
    ,["신체 특징",distribution(characters.map(character=>character.bodyProfile?.physicalTraits?.length?character.bodyProfile.physicalTraits:["설정하지 않음"]),12)]
    ,["머리색",distribution(characters.map(character=>bodyValue(character,["appearance","hairColor"]))) ]
    ,["머리 길이",distribution(characters.map(character=>bodyValue(character,["appearance","hairLength"]))) ]
    ,["머리 질감",distribution(characters.map(character=>bodyValue(character,["appearance","hairTexture"]))) ]
    ,["눈동자 색",distribution(eyeValues,10)]
    ,["화장 정도",distribution(characters.map(character=>bodyValue(character,["appearance","makeupLevel"],"하지 않음"))) ]
    ,["화장 스타일",distribution(characters.map(character=>character.bodyProfile?.appearance?.makeupStyles?.length?character.bodyProfile.appearance.makeupStyles:["설정하지 않음"]),10)]
    ,["건강 상태",distribution(characters.map(character=>character.bodyProfile?.healthConditions?.length?character.bodyProfile.healthConditions:["설정하지 않음"]),10)]
    ,["휠체어 사용",distribution(characters.map(character=>bodyValue(character,["wheelchair","type"],"사용하지 않음"))) ]
    ,["의수 사용",distribution(characters.map(character=>bodyValue(character,["prostheticArm","side"],"사용하지 않음"))) ]
    ,["의족 사용",distribution(characters.map(character=>bodyValue(character,["prostheticLeg","side"],"사용하지 않음"))) ]
    ,["청각 상태",distribution(characters.map(character=>bodyValue(character,["hearing","side"]))) ]
    ,["시각 상태",distribution(characters.map(character=>bodyValue(character,["vision","side"]))) ]
    ,["접근성 선호",distribution(characters.map(character=>character.bodyProfile?.accessibilityPreferences?.length?character.bodyProfile.accessibilityPreferences:["설정하지 않음"]),10)]
  ];
  const summaryCards=[
    ["평균 기상 시각",averageTime("wake")],
    ["평균 취침 시각",averageTime("sleep",true)],
    ["운전면허 보유 비율",`${driverRatio}%`],
    ["흡연자 비율",`${smokerRatio}%`]
  ];
  const charts=[["운전면허 보유",driverRatio],["흡연 캐릭터",smokerRatio],["신체 설정 반영",bodyConfiguredRatio],["보조기기·접근성 설정",assistiveRatio]];
  const genderItems=groups[0][1],genderCount=Math.max(1,genderItems.reduce((sum,[,count])=>sum+count,0));
  const genderColor=label=>/여성|여자|Female|女性/.test(label)?"#f28bb8":/남성|남자|Male|男性/.test(label)?"#5b8def":"#202124";
  let genderCursor=0;
  const genderStops=genderItems.map(([label,count])=>{const start=genderCursor;genderCursor+=count/genderCount*100;return `${genderColor(label)} ${start.toFixed(2)}% ${genderCursor.toFixed(2)}%`}).join(",")||"#d9dde2 0 100%";
  const genderChart=`<section class="character-stat-gender"><div class="character-stat-gender-pie" style="--gender-pie:conic-gradient(${genderStops})"><b>${total}</b><small>명</small></div><div><h3>성별 분포</h3><ul>${genderItems.map(([label,count])=>`<li><i style="--gender-color:${genderColor(label)}"></i><b>${esc(label)}</b><span>${count}명 · ${total?Math.round(count/total*100):0}%</span></li>`).join("")}</ul></div></section>`;
  const rankingGroups=groups.filter(([,items])=>items.length).slice(0,12);
  const rankings=`<div class="character-stat-rankings">${rankingGroups.map(([title,items])=>`<section><h3><span>${title}</span> TOP 3</h3><ol>${items.slice(0,3).map(([label,count],index)=>`<li><em>${index+1}</em><b>${esc(label)}</b><span>${count}명</span></li>`).join("")}</ol></section>`).join("")}</div>`;
  const content=`<div class="home-dialog-head"><span><small>CHARACTER STATISTICS</small><h2>내 캐릭터 통계 보고서</h2></span>${standalone?"":`<button value="close" aria-label="닫기">×</button>`}</div><p><span>현재 저장된</span> <b>${total}</b><span>명의 설정을 항목별 비율과 평균으로 모아 보여줘요.</span></p><div class="character-stat-summary"><b>${total}</b><span>저장된 캐릭터</span></div><div class="character-stat-highlights">${summaryCards.map(([label,value])=>`<article><small>${label}</small><b>${value}</b></article>`).join("")}</div>${genderChart}<div class="character-stat-donuts">${charts.map(([label,percent],index)=>`<article data-percent="${percent}" style="--chart-percent:${percent};--chart-index:${index}"><i><b>${percent}%</b></i><span>${label}</span></article>`).join("")}</div>${rankings}<div class="character-stat-grid">${groups.map(([title,items])=>`<section><h3>${title}</h3><ol>${rows(items)}</ol></section>`).join("")}</div><div class="character-stat-actions"><button type="button" class="primary" data-download-character-stats>보고서 다운로드</button>${standalone?"":`<button value="close">닫기</button>`}</div>`;
  return standalone?`<section class="panel character-statistics-page" data-character-statistics-page>${content}</section>`:`<dialog class="character-stats-dialog" data-character-stats-dialog><form method="dialog">${content}</form></dialog>`;
}
function statistics(){return characterStatisticsDialog(true)}
function observe(){
  const localIds=state.order.filter(id=>visibleTownId(state.characters[id])===state.activeTownId);
  const mobileHome=Boolean(document.documentElement?.classList?.contains?.("native-app"));
  const localId=mobileHome&&state.characters[state.activeId]?state.activeId:(localIds.includes(state.activeId)?state.activeId:localIds[0]);
  const townSwitcher=state.towns.length>1?`<div class="observe-town-switcher"><b>관찰할 마을</b>${state.towns.map(town=>`<button data-observe-town="${town.id}" class="${town.id===state.activeTownId?"on":""}">🏙️ ${esc(town.name)}</button>`).join("")}</div>`:"";
  if(!localId){
    const empty=`<section class="native-observe-home native-observe-empty"><div><span>🏙️</span><h1>이 마을에 사는 캐릭터가 없어요</h1><p>캐릭터 화면에서 생활하는 마을을 지정해 주세요.</p><button class="primary" data-tab="character">캐릭터 설정 열기</button></div></section>`;
    if(mobileHome)return `${nativeGameMenu()}${empty}`;
    return `<div class="standard-observe-view">${roster()}${townSwitcher}<div class="observe desktop-observe-map-only"><section><div class="viewport"><div class="world"><img src="${TOWN_BACKGROUND}" class="world-bg">${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}</div></div></section></div>${buildingDetailDialogs()}</div>`;
  }
  const c=state.characters[localId],e=eventFor(c),place=placeForEntry(e);
  const everyoneSleeping=state.order.length>0&&state.order.every(id=>eventFor(state.characters[id]).title==="자는 중");
  const sleepGate=everyoneSleeping?`<div class="sleep-gate"><span>🌙</span><div><h2>모든 인물이 자고 있습니다</h2><p>마을은 조용해졌어요. 집에서 인물들의 수면 상태를 볼 수 있어요.</p></div><button class="primary" data-all-sleep-home>집 보기</button></div>`:"";
  const location=e.home?`🏠 ${esc(state.homes[e.visitHomeId||c.homeId]?.name||"집")} · ${esc(state.homes[e.visitHomeId||c.homeId]?.rooms?.[e.room]?.name||"집 안")}`:e.transit?"🚌 이동 중":place?`📍 ${esc(place.name)} · ${esc(townForEntry(e).name)}`:"📍 외출 중";
  const locationBackground=e.home?state.homes[e.visitHomeId||c.homeId]?.rooms?.[e.room]?.image||"":place?.interiorImage||place?.image||"";
  const nativeBackground=locationBackground||c.photo||TOWN_BACKGROUND;
  const nativeEntries=displayTimeline(c,e);
  const nativeLog=nativeEntries.slice(-2).reverse().map(item=>`<li><time>${esc(item.time)}</time><span><b>${esc(item.title)}</b><small>${esc(item.desc)}</small></span></li>`).join("");
  const emptyLog="<li><span><b>아직 기록이 없어요</b><small>조금 뒤 새로운 생활 장면이 나타납니다.</small></span></li>";
  const nativeFullLog=`<dialog class="native-log-dialog" data-native-log-dialog><form method="dialog"><div class="native-log-dialog-head"><span><small>오늘의 기록</small><h2>${esc(c.name)}의 생활 로그</h2></span><button value="close" aria-label="닫기">×</button></div><ol>${dailyLogItems(nativeEntries,c)||"<li>아직 기록이 없어요.</li>"}</ol><button class="primary native-log-dialog-close" value="close">닫기</button></form></dialog>`;
  const hasLd=hasLdArt(c),hasSd=hasSdArt(c);
  let visualMode=hasLd&&(state.homeVisualMode==="ld"||!hasSd)?"ld":"sd";
  let presentation=nativeScenePresentation(c,e,visualMode);
  // 함께 있는 인물 중 한 명이 LD를 홈 표현으로 선택했다면 어느 인물 탭에서
  // 보더라도 동일한 혼합 LD 장면을 보여 준다. LD가 없는 인물은 작은 SD로
  // 보완되며, 등록한 LD 원본의 높이와 비율은 한 명일 때와 동일하다.
  if(visualMode!=="ld"&&state.homeVisualMode==="ld"&&presentation.partners.some(person=>hasLdArt(person))){
    visualMode="ld";
    presentation=nativeScenePresentation(c,e,visualMode);
  }
  const visualScale=Math.max(70,Math.min(150,Number(visualMode==="ld"?state.homeLdScale:state.homeSdScale)||100))/100;
  const stageClasses=`${presentation.partner?"has-scene-companion":""} ${presentation.lineupHtml?"has-scene-lineup":""} ${presentation.participantCount===2?"has-two-scene-actors":""} ${presentation.pet?"has-scene-pet":""} visual-mode-${visualMode}`;
  // 2인 장면은 lineup이 두 인물을 모두 렌더링한다. 메인 이미지를 중복으로
  // 넣지 않아 예전 CSS가 남아 있어도 거대한 얼굴이 다시 나타나지 않는다.
  const sceneActors=`${presentation.lineupHtml?"":sceneAvatar(c,"native-main-character",presentation.tone,visualMode)}${presentation.sleepMarkHtml}${presentation.lineupHtml}${presentation.conversationHtml}${presentation.thoughtHtml}${presentation.actionHtml}${presentation.companionHtml}${presentation.petHtml}<i></i>`;
  const homeTools="";
  const homeDialogs="";
  const desktopScene=`<section class="desktop-observe-scene native-app" aria-label="${esc(c.name)}의 지금 이 순간"><div class="desktop-scene-canvas scene-tone-${presentation.tone} scene-action-${presentation.actionKind}" style="--native-own:${esc(c.theme?.primary||"#176b60")};--native-own-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}"><div class="native-observe-backdrop" style="background-image:url(&quot;${esc(nativeBackground)}&quot;)"></div><div class="native-observe-shade"></div><div class="native-scene-atmosphere atmosphere-${presentation.atmosphere}" aria-hidden="true"></div>${presentation.effects}${homeTools}<div class="desktop-scene-copy"><small>${t("currentMoment","지금 이 순간")}</small><h1>${esc(c.name)} · ${esc(e.title)}</h1><p>${esc(e.desc)}</p><b>${location}</b></div><div class="native-character-stage ${stageClasses}" style="--home-visual-scale:${visualScale};${sceneLayoutVars(c,visualMode)}" aria-label="${esc(c.name)} 현재 장면">${sceneActors}</div></div></section>`;
  const statusCard=`<article class="native-status-card" data-toggle-native-moment-card role="button" tabindex="0" aria-expanded="false"><div class="native-status-card-head"><small>${t("currentMoment","지금 이 순간")}</small><button type="button" data-toggle-native-moment aria-expanded="false" data-label-expand="${t("expand","펼치기")}" data-label-collapse="${t("collapse","접기")}">${t("expand","펼치기")}</button></div><h1>${esc(e.title)}</h1><p>${esc(e.desc)}</p><b>${location}</b></article>`;
  const logCard=`<section class="native-log-card" data-open-native-log-card role="button" tabindex="0" aria-label="오늘의 기록 전체 보기"><div><b>${t("todayLog","오늘의 기록")} <small class="native-log-open-hint">눌러서 펼쳐 보기 ↗</small></b><span><button type="button" data-open-native-log>${t("viewAll","전체 보기")}</button><button type="button" data-tab="home">${t("viewHome","집 보기")}</button></span></div><ol>${nativeLog||emptyLog}</ol></section>`;
  if(mobileHome){
    return `${nativeGameMenu()}<section class="native-observe-home scene-tone-${presentation.tone} scene-action-${presentation.actionKind}" style="--native-own:${esc(c.theme?.primary||"#176b60")};--native-own-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}"><div class="native-observe-backdrop" style="background-image:url(&quot;${esc(nativeBackground)}&quot;)"></div><div class="native-observe-shade"></div><div class="native-scene-atmosphere atmosphere-${presentation.atmosphere}" aria-hidden="true"></div>${presentation.effects}<div class="native-observe-top"><span><b>${esc(c.name)}</b><small>${esc(c.jobTitle||c.job||"생활 중")}</small></span><span class="native-observe-clock"><time>${new Date().toLocaleTimeString(uiLocale(),{hour:"2-digit",minute:"2-digit"})}</time></span></div>${homeTools}<div class="native-character-stage ${stageClasses}" style="--home-visual-scale:${visualScale};${sceneLayoutVars(c,visualMode)}" aria-label="${esc(c.name)} 현재 장면">${sceneActors}</div><div class="native-character-picker" aria-label="관찰 캐릭터 선택">${state.order.map(id=>{const person=state.characters[id];return `<button type="button" data-home-character="${id}" class="${id===c.id?"on":""}" style="--picker-theme:${esc(person.theme?.primary||"#176b60")}" title="${esc(person.name)}" aria-label="${esc(person.name)}">${avatar(person)}</button>`}).join("")}</div>${statusCard}${logCard}</section>${nativeFullLog}${homeDialogs}`;
  }
  const desktopLog=`<section class="desktop-observe-log">${logCard}</section>`;
  return `<div class="standard-observe-view">${roster()}${townSwitcher}${desktopScene}<div class="desktop-observe-lower"><div class="observe desktop-observe-map-only"><section><div class="world-hud"><div><small>현재 시각</small><b>${new Date().toLocaleString(uiLocale(),{month:"long",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit"})}</b></div><div><small>관찰 중</small><b>${esc(c.name)} · ${esc(e.title)}</b></div></div><div class="viewport">${sleepGate}<div class="world"><img src="${TOWN_BACKGROUND}" class="world-bg">${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}${state.world.places.map(peopleAtPlaceCard).join("")}${townHomes().map(peopleAtHomeCard).join("")}</div></div></section></div>${desktopLog}</div>${nativeFullLog}${homeDialogs}${buildingDetailDialogs()}</div>`;
}
const ROOM_SIZE_SPANS={
  "작은 방":[1,1],
  "보통 방":[2,1],
  "큰 방":[2,2],
  "넓고 긴 방":[3,1]
};
const ROOM_SIZE_WEIGHTS={
  "작은 방":1,
  "보통 방":2,
  "큰 방":4,
  "넓고 긴 방":3
};
function packedRoomLayout(roomKeys,roomData,columnCount=4){
  const occupied=[],result={},fits=(x,y,w,h)=>{
    if(x+w>columnCount)return false;
    for(let row=y;row<y+h;row++)for(let col=x;col<x+w;col++)if(occupied[row]?.[col])return false;
    return true;
  };
  roomKeys.forEach(key=>{
    const room=roomData[key]||{},[requestedWidth,requestedHeight]=ROOM_SIZE_SPANS[room.size]||ROOM_SIZE_SPANS["보통 방"];
    const width=Math.min(columnCount,requestedWidth),height=requestedHeight;
    let x=0,y=0,placed=false;
    while(!placed){
      for(x=0;x<columnCount;x++)if(fits(x,y,width,height)){placed=true;break}
      if(!placed)y+=1;
    }
    for(let row=y;row<y+height;row++){
      occupied[row]=occupied[row]||[];
      for(let col=x;col<x+width;col++)occupied[row][col]=true;
    }
    result[key]={x:x+1,y:y+1,w:width,h:height};
  });
  return {items:result,rows:Math.max(1,occupied.length)};
}
function mobileRoomLayout(roomKeys,roomData){
  const result={};
  const items=roomKeys.map(key=>({
    key,
    weight:ROOM_SIZE_WEIGHTS[roomData[key]?.size]||ROOM_SIZE_WEIGHTS["보통 방"]
  }));
  const split=(group,rect,depth=0)=>{
    if(!group.length)return;
    if(group.length===1){
      result[group[0].key]=rect;
      return;
    }
    const total=group.reduce((sum,item)=>sum+item.weight,0);
    let splitIndex=1,running=group[0].weight,best=Math.abs(total/2-running);
    for(let index=2;index<group.length;index++){
      running+=group[index-1].weight;
      const difference=Math.abs(total/2-running);
      if(difference<best){best=difference;splitIndex=index}
    }
    const first=group.slice(0,splitIndex),second=group.slice(splitIndex);
    const firstWeight=first.reduce((sum,item)=>sum+item.weight,0),ratio=firstWeight/total;
    const vertical=rect.w>rect.h*1.08||(Math.abs(rect.w-rect.h)<4&&depth%2===1);
    if(vertical){
      const firstWidth=rect.w*ratio;
      split(first,{x:rect.x,y:rect.y,w:firstWidth,h:rect.h},depth+1);
      split(second,{x:rect.x+firstWidth,y:rect.y,w:rect.w-firstWidth,h:rect.h},depth+1);
    }else{
      const firstHeight=rect.h*ratio;
      split(first,{x:rect.x,y:rect.y,w:rect.w,h:firstHeight},depth+1);
      split(second,{x:rect.x,y:rect.y+firstHeight,w:rect.w,h:rect.h-firstHeight},depth+1);
    }
  };
  split(items,{x:0,y:0,w:100,h:100});
  return result;
}
function roomStyle(h,key,layout,mobileLayout){
  const image=h.rooms?.[key]?.image,parts=[
    `--room-x:${layout?.x||1}`,
    `--room-y:${layout?.y||1}`,
    `--room-w:${layout?.w||1}`,
    `--room-h:${layout?.h||1}`,
    `--mobile-room-x:${(mobileLayout?.x||0).toFixed(4)}%`,
    `--mobile-room-y:${(mobileLayout?.y||0).toFixed(4)}%`,
    `--mobile-room-w:${(mobileLayout?.w||100).toFixed(4)}%`,
    `--mobile-room-h:${(mobileLayout?.h||100).toFixed(4)}%`
  ];
  if(image)parts.push(`background-image:linear-gradient(#ffffff30,#ffffff30),url('${image}')`);
  return `style="${parts.join(";")}"`;
}
function home(){
  const groups=homeGroups(),ids=Object.keys(state.homes||{}),selected=state.homes[state.activeHomeId]?state.activeHomeId:(state.homes[active()?.homeId]?active().homeId:ids[0]);
  state.activeHomeId=selected;
  const houseGradient=chars=>{
    if(!chars?.length)return "linear-gradient(135deg,#6e7889,#aab2bf)";
    const colors=[...new Set(chars.map(c=>c.theme?.primary||"#176b60"))];
    if(colors.length===1){
      const c=chars[0],second=c.theme?.gradient?(c.theme.secondary||colors[0]):colors[0];
      return `linear-gradient(135deg,${colors[0]},${second})`;
    }
    return `linear-gradient(135deg,${colors.join(",")})`;
  };
  return `<section class="home-page"><div class="title"><div><h1>집과 생활 거점</h1><p>캐릭터 없이 집만 만들거나, 한 캐릭터에게 주거지·본가·별채·주말집을 여러 곳 연결할 수 있어요.</p></div><div class="home-top-actions"><button data-add-home>+ 집만 생성</button>${selected?`<button data-home-edit>${state.homeEditMode?"편집 완료":"집 편집"}</button>`:""}</div></div>${ids.length?`<div class="home-tabs">${ids.map(id=>{const h=state.homes[id]||{},members=groups[id]||[];return `<button data-home-select="${id}" class="${id===selected?"on":""}" style="--home-grad:${houseGradient(members)};${h.image?`--home-photo:url('${esc(h.image)}')`:""}">🏠 ${esc(h.name||"이름 없는 집")}<small>${esc(h.kind||"일반 주거")} · ${members.length?`${members.length}명 연결`:"빈집"}</small></button>`}).join("")}</div>`:"<section class='panel empty-mini'><b>아직 만든 집이 없어요.</b><p>‘집만 생성’을 눌러 캐릭터와 별개로 집부터 만들 수 있어요.</p></section>"}<div class="home-grid">${selected?homeCard(selected,groups[selected]||[]):""}</div></section>`;
}
function homeCard(id,chars){
  const h=state.homes[id]||{id,name:"이름 없는 집",rooms:{}};
  const currentScenes=new Map(state.order.map(characterId=>state.characters[characterId]).filter(Boolean).map(c=>[c.id,eventFor(c)]));
  const sceneFor=c=>currentScenes.get(c.id);
  const inside=state.order.map(characterId=>state.characters[characterId]).filter(c=>c&&sceneFor(c)?.home&&(sceneFor(c).visitHomeId||c.homeId)===id);
  const edit=state.homeEditMode;
  const roomKeys=Object.keys(h.rooms||{}).sort((a,b)=>(Number(h.rooms[a]?.order)||0)-(Number(h.rooms[b]?.order)||0));
  const packedRooms=packedRoomLayout(roomKeys,h.rooms||{});
  const mobileRooms=mobileRoomLayout(roomKeys,h.rooms||{});
  const pets=h.pets||[];
  const petEmoji={아기:"🍼",강아지:"🐶",고양이:"🐱",새:"🐦",거북이:"🐢",호랑이:"🐯",인공지능:"🤖",식물:"🪴",드래곤:"🐉",기타:"✨"};
  const petSpeciesName=pet=>pet.species==="기타"?(pet.customSpecies?.trim()||"이름 없는 생명체"):pet.species;
  const petScene=pet=>{
    const now=new Date(),hour=now.getHours(),slot=Math.floor((hour*60+now.getMinutes())/90);
    const activeHours={아기:true,강아지:hour>=6&&hour<22,고양이:hour>=18||hour<8,새:hour>=6&&hour<18,거북이:hour>=8&&hour<18,호랑이:hour>=17||hour<9,인공지능:true,식물:true,드래곤:hour>=5&&hour<23,기타:hour>=8&&hour<20};
    if(pet.species==="아기"){
      const babyRooms=[pet.room,"nursery","bedroom","living"].filter((key,index,list)=>key&&h.rooms?.[key]&&list.indexOf(key)===index);
      const roomKey=babyRooms[0]||roomKeys[0];
      const room=h.rooms?.[roomKey]?.name||"집 안";
      const caregiver=inside.find(character=>sceneFor(character)?.room===roomKey)||inside[0];
      const periods=hour<6||hour>=21?
        [["자는 중","이불을 편안하게 덮은 채 고른 숨을 쉬며 잠들어 있어요."]]:
        hour<9?[["아침을 먹는 중","보호자가 살피는 가운데 나이에 맞는 아침을 천천히 먹고 있어요."]]:
        hour<12?[["놀이 매트에서 노는 중","안전한 장난감을 손으로 만져 보고 소리가 나는 방향을 바라보며 놀고 있어요."]]:
        hour<14?[["점심을 먹고 쉬는 중","보호자가 살피는 가운데 나이에 맞는 점심을 먹고 편안히 쉬고 있어요."]]:
        hour<16?[["낮잠 자는 중","익숙한 자리에서 편안한 자세로 낮잠을 자고 있어요."]]:
        hour<19?[["책과 장난감을 보는 중","그림책과 안전한 장난감을 번갈아 바라보며 조용히 시간을 보내고 있어요."]]:
        [["저녁을 보내는 중","보호자가 살피는 가운데 씻고 옷을 갈아입으며 잘 준비를 하고 있어요."]];
      const [title,baseDesc]=periods[slot%periods.length];
      const desc=caregiver?`${caregiver.name}의 돌봄을 받으며 ${baseDesc}`:baseDesc;
      return {roomKey,title:`${room}에서 ${title}`,desc};
    }
    if(!activeHours[pet.species]){
      const sleepRoomKey=h.rooms?.[pet.room]?pet.room:(h.rooms?.bedroom?"bedroom":roomKeys[0]);
      const sleepRoom=h.rooms?.[sleepRoomKey]?.name||"집 안";
      const sleepText={
        강아지:"익숙한 담요 위에 몸을 둥글게 말고 가끔 귀를 움직이며 잠들어 있어요.",
        고양이:"따뜻하고 높은 자리에 앞발을 접어 넣은 채 느긋하게 잠들어 있어요.",
        새:"한쪽 다리를 깃털 속에 넣고 횃대에 앉아 조용히 쉬고 있어요.",
        거북이:"은신처 안에 몸을 넣고 움직임을 줄인 채 오래 쉬고 있어요.",
        호랑이:"넓은 자리에 옆으로 몸을 누이고 꼬리 끝만 가끔 움직이며 쉬고 있어요.",
        인공지능:"충전 위치에 연결되어 저전력 대기 모드로 전환됐어요.",
        식물:"잎과 줄기를 고요히 늘어뜨린 채 밤의 휴식 시간을 보내고 있어요.",
        드래곤:"날개를 몸 가까이 접고 꼬리로 몸을 감싼 채 깊이 잠들어 있어요.",
        기타:"자기에게 가장 편안한 자리를 골라 조용히 쉬고 있어요."
      };
      return {roomKey:sleepRoomKey,title:`${sleepRoom}에서 자는 중`,desc:sleepText[pet.species]||sleepText.기타};
    }
    const walkers=inside.filter(c=>sceneFor(c)?.home&&!sceneFor(c)?.transit);
    const walkSeed=[...(pet.id+now.toDateString())].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
    const walkStart=450+(walkSeed%3)*300,currentMinute=hour*60+now.getMinutes();
    if(pet.needsWalk&&walkers.length&&currentMinute>=walkStart&&currentMinute<walkStart+45){
      const count=Math.min(walkers.length,1+(walkSeed%3));
      const names=walkers.slice(0,count).map(c=>c.name).join(" · ");
      if(pet.rideable&&["드래곤","호랑이"].includes(pet.species)){
        const movement=pet.species==="드래곤"?"등에 올라 마을 위를 천천히 날며":"등에 올라 안전한 산책길을 천천히 달리며";
        return {roomKey:null,outside:true,title:`${names}와 외출 중`,desc:`${names}가 ${pet.name}의 ${movement} 바람을 쐬고 있어요.`};
      }
      return {roomKey:null,outside:true,title:`${names}와 산책 중`,desc:`${names}가 ${pet.name}의 걸음에 맞춰 집 근처 산책길을 함께 걷고 있어요.`};
    }
    const preferred={
      강아지:["living","entry","study","bedroom"],고양이:["living","study","bedroom","kitchen"],
      새:["living","study","bedroom"],거북이:["living","study","bedroom"],
      호랑이:["living","study","entry"],인공지능:roomKeys,식물:["living","study","kitchen"],드래곤:["living","study","bedroom","entry"],기타:roomKeys
    };
    const candidates=(preferred[pet.species]||roomKeys).filter(key=>h.rooms?.[key]);
    const seed=[...(pet.id+now.toDateString())].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
    const roomKey=candidates.length?candidates[(seed+slot)%candidates.length]:(pet.room||roomKeys[0]);
    const room=h.rooms?.[roomKey]?.name||"집 안";
    const sameRoom=inside.filter(c=>{const scene=sceneFor(c);return scene?.room===roomKey&&scene.title!=="자는 중"});
    const resident=sameRoom.length?sameRoom[(seed+slot)%sameRoom.length]:null;
    const solo={
      강아지:["공을 앞발로 굴렸다가 입에 물고 방 안을 신나게 오가고 있어요.","노즈워크 장난감 사이에 숨은 간식 냄새를 따라 코를 바쁘게 움직이고 있어요.","현관 쪽에서 들리는 소리에 귀를 세웠다가 안전한지 확인하고 돌아왔어요.","푹신한 방석을 앞발로 몇 번 고른 뒤 가장 편한 자세로 엎드렸어요.","창밖을 구경하다 지나가는 움직임을 발견하고 꼬리를 흔들고 있어요.","아끼는 장난감을 자기 자리로 하나씩 옮겨 모으고 있어요.","물을 마신 뒤 입가의 물방울을 털고 바닥 냄새를 다시 확인하고 있어요.","갑자기 신이 나 짧게 방을 한 바퀴 달린 뒤 숨을 고르고 있어요."],
      고양이:["캣타워 꼭대기에 올라 아래를 내려다보며 꼬리 끝을 천천히 흔들고 있어요.","햇빛이 드는 바닥에 길게 누워 배를 데우며 느긋하게 쉬고 있어요.","작은 소리가 난 가구 밑을 들여다보고 앞발을 조심스럽게 넣어 보고 있어요.","장난감을 낮게 노려보다 갑자기 달려들어 앞발로 붙잡았어요.","창가에 앉아 바깥의 새와 움직이는 그림자를 한참 관찰하고 있어요.","종이 상자 안에 몸을 구겨 넣고 자기 몸에 딱 맞는지 확인하고 있어요.","털을 꼼꼼하게 핥아 정리하다가 아무렇지 않게 다른 자리로 옮겼어요.","방 안을 빠르게 뛰어다니다 높은 곳에 올라 태연한 얼굴로 앉아 있어요."],
      새:["횃대 사이를 가볍게 옮겨 다니며 익숙한 소리를 흉내 내고 있어요.","거울에 비친 모습을 살피며 고개를 좌우로 갸웃거리고 있어요.","부리로 장난감의 매듭을 하나씩 풀어 보며 집중하고 있어요.","깃털을 부풀렸다가 부리로 가지런히 다듬고 있어요.","창밖에서 들리는 새소리에 짧게 대답하듯 지저귀고 있어요.","먹이통에서 좋아하는 알갱이만 골라 천천히 먹고 있어요.","물그릇에서 가볍게 목욕한 뒤 날개를 퍼덕여 물기를 털고 있어요.","방 안의 소리가 달라질 때마다 고개를 돌려 어디서 나는지 찾고 있어요."],
      거북이:["따뜻한 조명이 비치는 자리까지 천천히 걸어가 몸을 데우고 있어요.","은신처 밖으로 고개를 내밀고 한동안 주변이 안전한지 확인하고 있어요.","낮은 장애물 주변을 빙 돌아 새로운 길을 천천히 탐색하고 있어요.","먹이 냄새를 따라 목을 길게 내밀고 접시 쪽으로 움직이고 있어요.","평평한 돌 위에 올라 앞다리를 뻗은 채 편안하게 쉬고 있어요.","물가와 마른 자리를 천천히 오가며 마음에 드는 위치를 고르고 있어요.","낯선 물건 앞에 멈춰 오래 바라보다 아주 조심스럽게 다가가고 있어요.","한참 움직인 뒤 익숙한 구석으로 돌아가 가만히 몸을 낮추고 있어요."],
      호랑이:["튼튼한 장난감을 앞발로 눌러 방향을 바꾸며 힘을 조절해 놀고 있어요.","넓은 공간의 가장자리를 천천히 돌며 냄새와 소리를 확인하고 있어요.","높은 자리에 올라 주변을 내려다보며 귀를 움직이고 있어요.","길게 기지개를 켠 뒤 발톱을 세우지 않고 장난감을 툭 건드렸어요.","낯선 냄새가 나는 곳에 코를 가까이 대고 한동안 흔적을 살피고 있어요.","몸을 낮춘 채 장난감을 노리다가 짧고 빠르게 앞으로 뛰어들었어요.","시원한 바닥에 몸을 길게 뻗고 꼬리로 바닥을 천천히 두드리고 있어요.","물을 마신 뒤 수염에 묻은 물방울을 털며 주위를 둘러보고 있어요."],
      인공지능:["방 안의 온도와 습도를 측정하고 쾌적한 범위인지 확인하고 있어요.","바닥의 작은 장애물을 감지해 부딪히지 않도록 경로를 다시 계산했어요.","충전량과 오늘의 작동 기록을 확인하며 다음 점검 시간을 정리하고 있어요.","켜진 채 남아 있는 기기가 없는지 방 안을 천천히 순찰하고 있어요.","택배와 우편 알림을 확인해 거주자가 보기 쉬운 순서로 정리하고 있어요.","반려동물이 위험한 물건에 가까이 가지 않는지 센서로 살피고 있어요.","조명 밝기를 현재 시각에 맞게 조절하고 사용 기록을 저장하고 있어요.","새로운 생활 패턴을 발견하고 다음 지원에 활용하려고 학습하고 있어요."],
      식물:["햇빛이 닿는 방향으로 새잎을 천천히 기울이고 있어요.","흙에 남은 수분을 머금고 잎 끝에 작은 물방울을 맺고 있어요.","창가에서 바람을 맞으며 잎을 작게 흔들고 있어요.","새로 난 잎이 펼쳐지며 조금씩 햇빛을 받아들이고 있어요.","마른 잎 하나를 떨어뜨리고 남은 잎에 힘을 모으고 있어요.","화분 가장자리로 뿌리를 뻗으며 조용히 자라고 있어요."],
      드래곤:["작은 날개를 퍼덕여 방 안의 따뜻한 공기를 휘젓고 있어요.","반짝이는 물건을 앞발로 끌어 자기 보금자리로 옮기고 있어요.","콧김과 함께 작은 불꽃을 뿜었다가 스스로 냄새를 확인하고 있어요.","꼬리 끝으로 장난감을 툭툭 건드리며 반응을 살피고 있어요.","높은 가구 위에 올라 자기 영역을 내려다보고 있어요.","따뜻한 쿠션을 둥지처럼 모아 가운데에 몸을 말고 있어요."],
      기타:["좋아하는 물건 가까이에서 자기 방식대로 시간을 보내고 있어요.","익숙한 자리를 천천히 둘러보며 달라진 것이 없는지 확인하고 있어요.","편안한 장소를 찾아 쉬면서 주변의 움직임을 살피고 있어요.","먹이와 물이 있는 곳을 확인한 뒤 자기 자리로 돌아가고 있어요."]
    };
    const together={
      강아지:[`${subjectText(resident?.name)} 던진 장난감을 쫓아가 다시 발앞에 내려놓고 기대하는 눈으로 바라보고 있어요.`,`${resident?.name}의 뒤를 졸졸 따라다니다가 멈출 때마다 옆에 나란히 앉고 있어요.`,`${subjectText(resident?.name)} 바닥에 숨긴 간식을 냄새로 찾아내며 함께 노즈워크를 하고 있어요.`,`${resident?.name}의 무릎에 턱을 얹고 손길을 기다리며 꼬리를 천천히 흔들고 있어요.`],
      고양이:[`${subjectText(resident?.name)} 흔드는 장난감의 끝을 낮게 노리다가 정확한 순간에 앞발로 낚아채고 있어요.`,`${subjectText(resident?.name)} 앉은 자리 가까이에 몸을 둥글게 말고 같은 공간에 조용히 머물고 있어요.`,`${subjectText(resident?.name)} 정리하려는 상자에 먼저 들어가 자리를 차지하고 나오지 않고 있어요.`,`${resident?.name}의 손 냄새를 확인한 뒤 머리를 가볍게 비비고 자기 자리로 돌아갔어요.`],
      새:[`${resident?.name}의 말소리를 짧게 따라 하며 대답하듯 재잘거리고 있어요.`,`${subjectText(resident?.name)} 건네는 작은 간식을 부리로 조심스럽게 받아 먹고 있어요.`,`${resident?.name}의 어깨 가까운 횃대에서 머리카락 움직임을 신기하게 바라보고 있어요.`,`${subjectText(resident?.name)} 장난감 위치를 바꾸자 고개를 갸웃거리며 바로 확인하러 갔어요.`],
      거북이:[`${subjectText(resident?.name)} 놓아 준 먹이 쪽으로 목을 길게 내밀고 천천히 다가가고 있어요.`,`${subjectText(resident?.name)} 지켜보는 앞에서 익숙한 길을 따라 느긋하게 방 안을 탐색하고 있어요.`,`${subjectText(resident?.name)} 조명을 조절해 주자 따뜻해진 자리에 올라 편안하게 몸을 펴고 있어요.`,`${resident?.name}의 손이 가까워지자 잠깐 멈췄다가 안전하다고 느끼고 다시 움직였어요.`],
      호랑이:[`${togetherText(resident?.name)} 충분한 거리를 둔 채 튼튼한 장난감의 움직임을 따라 시선을 옮기고 있어요.`,`${subjectText(resident?.name)} 준비한 넓은 놀이 공간을 천천히 돌며 냄새를 확인하고 있어요.`,`${resident?.name}의 익숙한 목소리를 듣고 귀를 돌린 뒤 편안한 자세를 유지하고 있어요.`,`${subjectText(resident?.name)} 안전하게 놓아 준 장난감을 앞발로 눌러 보며 반응을 살피고 있어요.`],
      인공지능:[`${resident?.name}의 오늘 일정과 날씨를 확인해 필요한 준비물을 짧게 알려 주고 있어요.`,`${subjectText(resident?.name)} 찾는 물건의 마지막 확인 위치를 기록에서 찾아 안내하고 있어요.`,`${resident?.name}의 방해가 되지 않도록 조명을 낮추고 알림을 조용한 방식으로 전환했어요.`,`${resident?.name}에게 필요한 것이 없는지 확인한 뒤 가까운 곳에서 대기하고 있어요.`],
      식물:[`${subjectText(resident?.name)} 화분을 돌려 주자 잎이 햇빛을 고르게 받는 방향으로 놓였어요.`,`${subjectText(resident?.name)} 흙의 상태를 살피는 동안 잎 끝의 작은 물방울이 빛나고 있어요.`,`${subjectText(resident?.name)} 마른 잎을 떼어 주자 새순이 더 잘 보이게 됐어요.`],
      드래곤:[`${resident?.name}의 뒤를 따라다니며 발끝 가까이 꼬리를 살랑거리고 있어요.`,`${subjectText(resident?.name)} 건넨 간식을 앞발로 붙잡고 작은 불씨로 살짝 데워 먹고 있어요.`,`${resident?.name}의 무릎 가까이에 몸을 말고 목을 울리며 편안해하고 있어요.`],
      기타:[`${resident?.name} 가까이에서 익숙한 방식으로 시간을 보내고 있어요.`,`${resident?.name}의 움직임을 살피며 편안한 거리를 유지하고 있어요.`,`${resident?.name}가 이름을 부르자 하던 일을 멈추고 잠시 반응을 보여 줬어요.`]
    };
    let choices=resident?(together[pet.species]||together.기타):(solo[pet.species]||solo.기타);
    if(pet.species==="기타"){
      const temperamentScripts={
        "사고뭉치":["가벼운 물건을 엉뚱한 자리로 옮겨 놓고 모르는 척 주변을 살피고 있어요.","방금 정리한 물건 사이를 헤집어 작은 소동을 만들고 있어요."],
        "진중함":["한 자리에 머물며 주변에서 일어나는 일을 차분히 관찰하고 있어요.","낯선 소리가 사라질 때까지 움직이지 않고 조용히 상황을 살피고 있어요."],
        "활발함":["익숙한 지점 사이를 바쁘게 오가며 남은 에너지를 풀고 있어요.","방 안을 크게 한 바퀴 돈 뒤 다시 출발할 곳을 찾고 있어요."],
        "호기심 많음":["처음 보는 물건 가까이에서 안전한 거리를 두고 오래 살펴보고 있어요.","새로 달라진 냄새와 소리의 근원을 차례로 확인하고 있어요."],
        "겁이 많음":["익숙한 자리에서 낯선 움직임이 지나가기를 기다리고 있어요.","믿는 사람 가까이에 머물며 조심스럽게 주변을 살피고 있어요."],
        "사람을 잘 따름":[`${resident?.name||"가족"} 가까이로 다가가 곁에 머물며 관심을 기다리고 있어요.`,`${resident?.name||"가족"}가 움직일 때마다 너무 멀어지지 않게 뒤를 따라가고 있어요.`],
        "독립적":["가족과 같은 공간에 있으면서도 자기만의 일에 집중하고 있어요.","방해받지 않는 자리를 골라 혼자만의 시간을 보내고 있어요."]
      };
      const bodyScripts={
        "털":"몸의 털을 차분히 정돈한 뒤 다시 편한 자세를 잡았어요.",
        "비늘":"따뜻한 자리에 머물자 비늘 표면에 빛이 은은하게 비치고 있어요.",
        "깃털":"흐트러진 깃털을 차례로 정돈하며 편안한 자세를 잡고 있어요.",
        "날개":"주변에 부딪힐 것이 없는지 확인한 뒤 날개를 가볍게 펼쳤다가 접었어요.",
        "지느러미":"자기에게 맞게 마련된 공간을 천천히 오가며 지느러미를 움직이고 있어요.",
        "뿔":"뿔이 가구에 닿지 않도록 고개를 조심스럽게 돌리며 이동하고 있어요.",
        "꼬리":"기분에 따라 꼬리를 천천히 움직이며 주변을 살피고 있어요.",
        "발광":"주변 밝기에 반응하듯 몸의 빛이 서서히 밝아졌다가 잦아들고 있어요.",
        "독성":"가족들이 표시해 둔 안전 구역 안에서 조심스럽게 움직이고 있어요."
      };
      const sizeScripts={
        소형:"작은 공간도 능숙하게 지나며 마음에 드는 자리를 찾고 있어요.",
        중형:"방 안을 여유 있게 오가며 익숙한 동선을 확인하고 있어요.",
        대형:"넓게 비워 둔 동선을 따라 천천히 움직이며 자리를 잡고 있어요."
      };
      choices=[...choices,...(pet.temperaments||[]).flatMap(x=>temperamentScripts[x]||[]),...(pet.bodyTraits||[]).map(x=>bodyScripts[x]).filter(Boolean),...(sizeScripts[pet.size]?[sizeScripts[pet.size]]:[])];
    }
    const desc=choices[(seed+slot)%choices.length];
    const titleMap={강아지:"활기차게 노는 중",고양이:"자기 방식대로 노는 중",새:"횃대에서 활동하는 중",거북이:"천천히 탐색하는 중",호랑이:"영역을 살피는 중",인공지능:"집 안을 지원하는 중",식물:"조용히 자라는 중",드래곤:"둥지를 오가며 노는 중",기타:"시간을 보내는 중"};
    return {roomKey,title:`${room}에서 ${titleMap[pet.species]||titleMap.기타}`,desc};
  };
  const petScenes=Object.fromEntries(pets.map(p=>[p.id,petScene(p)]));
  const roomHtml=roomKeys.map(key=>{
    const room=h.rooms?.[key]||{},roomPeople=inside.filter(c=>sceneFor(c)?.room===key);
    const roomPets=pets.filter(p=>petScenes[p.id]?.roomKey===key);
    const shownPeople=roomPeople,shownPets=roomPets;
    const furniture=FURNITURE[room.type||key]||FURNITURE.other;
    const editAttributes=`data-open-room-editor="${key}" data-home-id="${id}" data-room-key="${key}" tabindex="0" role="button" aria-label="${esc(room.name||key)} 편집"`;
    return `<div class="room room-${esc(room.type||key)} ${edit?"room-edit-target":""}" ${roomStyle(h,key,packedRooms.items[key],mobileRooms[key])} ${editAttributes}>
      <div class="room-heading room-title-${room.titleTone==="dark"?"dark":"light"}"><span><b>${esc(room.name||key)}</b><small class="room-edit-hint">편집</small></span>${edit?`<button type="button" class="room-drag-handle" data-room-drag="${key}" data-home-id="${id}" aria-label="${esc(room.name||key)} 위치 옮기기">✥</button>`:""}</div>
      <div class="room-people">${shownPeople.map(c=>{const e=sceneFor(c),sleeping=/자는 중|잠든|수면/.test(`${e?.title||""} ${e?.mood||""}`);return `<button class="home-person ${sleeping?"is-sleeping":""}" data-home-occupant="character" data-character-id="${c.id}" data-occupant-name="${esc(c.name)}" data-occupant-title="${esc(e?.title||"집에서 시간을 보내는 중")}" data-occupant-desc="${esc(e?.desc||"")}" data-occupant-room="${esc(room.name||key)}">${avatar(c)}${sleeping?'<i class="room-sleep-mark" aria-hidden="true">ZZ</i>':""}<span class="home-person-status"><b>${esc(c.name)}</b><small>${esc(e?.title||"집에서 시간을 보내는 중")}</small></span></button>`}).join("")}</div>
      <div class="room-pets">${shownPets.map(p=>`<button class="room-pet" data-home-occupant="pet" data-pet-id="${p.id}" data-occupant-name="${esc(p.name)}" data-occupant-title="${esc(petScenes[p.id].title)}" data-occupant-desc="${esc(petScenes[p.id].desc)}" data-occupant-room="${esc(room.name||key)}" title="${esc(petScenes[p.id].desc)}">${p.icon?`<img class="room-pet-icon" src="${esc(p.icon)}" alt="">`:p.photo?`<img class="room-pet-photo" src="${esc(p.photo)}" alt="">`:`<span class="room-pet-emoji">${petEmoji[p.species]||"🐾"}</span>`}<span class="room-pet-status"><b>${esc(p.name)}</b><small>${esc(petScenes[p.id].title.replace(`${h.rooms?.[key]?.name||"집 안"}에서 `,""))}</small></span></button>`).join("")}</div>
    </div>`;
  }).join("");
  const dayLabels=["일","월","화","수","목","금","토"];
  const residentEditor=edit?`<section class="resident-editor home-feature-panel home-edit-feature-panel" data-home-feature="residents"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><div><h3>이 집을 사용하는 캐릭터</h3><small>연결을 해제해도 캐릭터나 집은 삭제되지 않습니다. 별채·본가도 주거지와 동시에 둘 수 있어요.</small></div></div><div>${state.order.map(cid=>{
    const c=state.characters[cid],residence=(c.residences||[]).find(item=>item.homeId===id),on=Boolean(residence);
    return `<article class="resident-setting ${on?"on":""}"><button data-home-resident="${cid}" data-home-id="${id}" class="${on?"on":""}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${on?"이 집 연결됨":"연결하지 않음"}</small></span></button>${on?`<div class="residence-fields"><label>이 캐릭터에게 어떤 집인가요?<select data-residence-field="role" data-character-id="${cid}" data-home-id="${id}">${["주거지","본가","별채","주말집","업무용 숙소","연인의 집","친척집","기타"].map(value=>`<option ${value===residence.role?"selected":""}>${value}</option>`).join("")}</select></label><label>머무는 때<select data-residence-field="stayPattern" data-character-id="${cid}" data-home-id="${id}">${["상시 거주","평일 중심","주말 중심","요일 지정","명절·기념일","필요할 때 방문"].map(value=>`<option ${value===residence.stayPattern?"selected":""}>${value}</option>`).join("")}</select></label><label>자는 방<select data-residence-field="sleepRoomId" data-character-id="${cid}" data-home-id="${id}">${roomKeys.map(key=>`<option value="${key}" ${key===residence.sleepRoomId?"selected":""}>${esc(h.rooms[key]?.name||key)}</option>`).join("")}</select></label><label>방문 목적·설명<input data-residence-field="notes" data-character-id="${cid}" data-home-id="${id}" maxlength="200" value="${esc(residence.notes||"")}" placeholder="예: 명절에 가족과 머무는 본가"></label><label>명절·기념일 날짜<input data-residence-field="visitDates" data-character-id="${cid}" data-home-id="${id}" inputmode="numeric" value="${esc(String(residence.visitDates||"").replace(/(\d{2})-(\d{2})/g,"$1$2"))}" placeholder="예: 0101, 0815"></label><fieldset><legend>방문 요일</legend><div class="residence-days">${dayLabels.map((label,day)=>`<button type="button" data-residence-day="${day}" data-character-id="${cid}" data-home-id="${id}" class="${(residence.visitDays||[]).includes(day)?"on":""}">${label}</button>`).join("")}</div></fieldset><button type="button" data-residence-primary="${cid}" data-home-id="${id}" class="${residence.isPrimary?"on":""}">${residence.isPrimary?"✓ 기준 주거지":"기준 주거지로 지정"}</button></div>`:""}</article>`;
  }).join("")}</div><small>‘명절·기념일’은 위 날짜가 맞는 날, ‘요일 지정’은 고른 요일에 이 집의 장면을 사용해요. ‘필요할 때 방문’은 임의 이동을 만들지 않습니다.</small></section>`:"";
  const sleepEditor=edit?`<section class="sleep-room-editor home-feature-panel home-edit-feature-panel" data-home-feature="room-plan"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><h3>방 구성</h3><button data-add-room>+ 방 추가</button></div><small>새 방을 만든 뒤 방 자체를 누르면 이름·종류·크기·사진·가구를 편집할 수 있어요. 자는 방은 캐릭터 연결 설정에서 각각 정해요.</small></section>`:"";
  const petKinds=["아기","강아지","고양이","새","거북이","호랑이","식물","드래곤","인공지능","기타"];
  const petCards=pets.map(p=>`<article class="pet-card">
    <div class="pet-avatar">${p.icon?`<img class="pet-icon-art" src="${esc(p.icon)}" alt="">`:p.photo?`<img class="pet-photo-art" src="${esc(p.photo)}" alt="">`:`<span>${petEmoji[p.species]||"🐾"}</span>`}</div>
    <div class="pet-info"><b>${esc(p.name)}</b><small>${esc(petSpeciesName(p))}${p.breed?` · ${esc(p.breed)}`:""}</small><strong>${esc(petScenes[p.id].title)}</strong><p>${esc(petScenes[p.id].desc)}</p></div>
    <details class="pet-edit"><summary>반려생물 편집하기</summary><div class="pet-edit-fields"><label>이름<input data-pet-field="name" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.name)}"></label><label>종류<select data-pet-field="species" data-home-id="${id}" data-pet-id="${p.id}">${petKinds.map(x=>`<option ${x===p.species?"selected":""}>${x}</option>`).join("")}</select></label>${p.species==="기타"?`<label>종류 이름<input data-pet-field="customSpecies" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.customSpecies||"")}" placeholder="예: 전기쥐, 슬라임, 작은 괴수"></label><label>크기<select data-pet-field="size" data-home-id="${id}" data-pet-id="${p.id}">${["소형","중형","대형"].map(x=>`<option ${x===(p.size||"중형")?"selected":""}>${x}</option>`).join("")}</select></label><fieldset><legend>성향 · 여러 개 선택</legend><div class="chips">${["온순함","활발함","사고뭉치","진중함","호기심 많음","겁이 많음","사람을 잘 따름","독립적"].map(x=>`<button type="button" data-pet-trait-field="temperaments" data-home-id="${id}" data-pet-id="${p.id}" data-value="${x}" class="${(p.temperaments||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div></fieldset><fieldset><legend>확실히 알고 있는 신체 특징만 선택</legend><div class="chips">${["털","비늘","깃털","날개","지느러미","뿔","꼬리","발광","독성"].map(x=>`<button type="button" data-pet-trait-field="bodyTraits" data-home-id="${id}" data-pet-id="${p.id}" data-value="${x}" class="${(p.bodyTraits||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><small>선택하지 않은 생김새나 능력은 행동에서 지어내지 않아요.</small></fieldset>`:""}<label>품종<input data-pet-field="breed" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.breed)}" placeholder="유저가 직접 입력"></label><label>주로 있는 방<select data-pet-field="room" data-home-id="${id}" data-pet-id="${p.id}">${roomKeys.map(key=>`<option value="${key}" ${key===(p.room||"living")?"selected":""}>${esc(h.rooms[key]?.name||key)}</option>`).join("")}</select></label><label>성별<select data-pet-field="sex" data-home-id="${id}" data-pet-id="${p.id}">${["모름","수컷","암컷"].map(x=>`<option ${x===p.sex?"selected":""}>${x}</option>`).join("")}</select></label><label class="check"><input type="checkbox" data-pet-field="neutered" data-home-id="${id}" data-pet-id="${p.id}" ${p.neutered?"checked":""}> 중성화 완료</label><label class="check"><input type="checkbox" data-pet-field="needsWalk" data-home-id="${id}" data-pet-id="${p.id}" ${p.needsWalk?"checked":""}> 함께 산책이 필요함</label><label class="check"><input type="checkbox" data-pet-field="rideable" data-home-id="${id}" data-pet-id="${p.id}" ${p.rideable?"checked":""}> 등에 타고 이동할 수 있음</label><div class="pet-actions"><button data-pet-image="photo" data-home-id="${id}" data-pet-id="${p.id}">원형 사진</button><button data-image-url="petPhoto" data-id="${id}" data-room="${p.id}">사진 링크</button><button data-pet-image="icon" data-home-id="${id}" data-pet-id="${p.id}">투명 아이콘</button><button data-image-url="petIcon" data-id="${id}" data-room="${p.id}">아이콘 링크</button><button class="danger" data-delete-pet="${p.id}" data-home-id="${id}">삭제</button></div></div></details>
  </article>`).join("");
  const cars=(h.cars||[]).map(car=>`<button type="button" class="car-card" data-open-car-editor="${car.id}" data-home-id="${id}">${car.image?`<img class="car-photo" src="${esc(car.image)}" alt="">`:`<span class="car-icon">🚙</span>`}<span><b>${esc(car.name)}</b><small>${esc(car.type)}${car.color?` · ${esc(car.color)}`:""} · ${car.seats||5}인승</small><em>눌러서 편집</em></span></button>`).join("");
  const humanResidentScenes=chars.map(c=>{
    const e=eventFor(c),place=placeForEntry(e),image=sceneImage(c,e),sceneHome=state.homes[e.visitHomeId||c.homeId];
    const location=e.home?`🏠 ${sceneHome?.name||"집"} · ${sceneHome?.rooms?.[e.room]?.name||"집 안"}`:e.transit?"🚌 이동 중":place?`📍 ${place.name} · ${townForEntry(e).name}`:"📍 외출 중";
    return `<article class="resident-scene-card" style="--resident-theme:${esc(c.theme?.primary||"#176b60")}">
      <div class="resident-profile">${c.photo?`<img src="${esc(c.photo)}" alt="">`:avatar(c)}<span><h3>${esc(c.name)}</h3><small>${esc(c.jobTitle||c.job)}</small></span></div>
      <div class="resident-current"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>${location}</b>${image?`<img src="${esc(image)}" alt="">`:""}</div>
    </article>`;
  }).join("");
  const petResidentScenes=pets.map(p=>{
    const e=petScenes[p.id];
    const roomName=h.rooms?.[p.room||"living"]?.name||"집 안";
    const visual=p.icon
      ?`<img class="resident-pet-icon" src="${esc(p.icon)}" alt="">`
      :p.photo
        ?`<img class="resident-pet-photo" src="${esc(p.photo)}" alt="">`
        :`<span class="resident-pet-emoji">${petEmoji[p.species]||"🐾"}</span>`;
    return `<article class="resident-scene-card resident-pet-scene-card">
      <div class="resident-profile">${visual}<span><h3>${esc(p.name)}</h3><small>반려생물 · ${esc(petSpeciesName(p))}</small></span></div>
      <div class="resident-current"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>🏠 ${esc(h.name)} · ${esc(roomName)}</b></div>
    </article>`;
  }).join("");
  const residentScenes=humanResidentScenes+petResidentScenes;
  const exteriorStyles=["설정하지 않음","현대적","미니멀","모던","유럽풍","클래식","빈티지","한옥풍","일본식","지중해풍","전원주택풍","고딕","미래적","기타"];
  const homeSettings=edit?`<section class="home-settings-panel home-feature-panel home-edit-feature-panel" data-home-feature="house-settings"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button>
    <div class="home-identity-editor"><label class="home-name-setting">집 이름<input data-home-name data-home-id="${id}" maxlength="80" value="${esc(h.name)}" placeholder="집 이름을 입력하세요"></label><label>집의 종류<select data-home-field="kind" data-home-id="${id}">${["일반 주거","본가","별채","주말집","업무용 숙소","공동 주거","기숙사","사택","기타"].map(value=>`<option ${value===(h.kind||"일반 주거")?"selected":""}>${value}</option>`).join("")}</select></label><label>집이 있는 마을<select data-home-field="townId" data-home-id="${id}"><option value="">마을 지정 안 함</option>${state.towns.map(town=>`<option value="${town.id}" ${town.id===h.townId?"selected":""}>${esc(town.name)}</option>`).join("")}</select></label><label>집 외관 스타일<select data-home-field="exteriorStyle" data-home-id="${id}">${exteriorStyles.map(value=>`<option ${value===(h.exteriorStyle||"설정하지 않음")?"selected":""}>${value}</option>`).join("")}</select></label><label>집의 아름다운 정도<select data-home-field="beautyLevel" data-home-id="${id}">${["매우 소박함","소박함","평범함","보기 좋음","아름다움","눈에 띄게 아름다움"].map(value=>`<option ${value===(h.beautyLevel||"평범함")?"selected":""}>${value}</option>`).join("")}</select></label><label>거주 방식<select data-home-field="ownershipType" data-home-id="${id}">${["설정하지 않음","자가","전세","월세","기숙사","사택","무상 거주","임시 거주","기타"].map(value=>`<option ${value===(h.ownershipType||"설정하지 않음")?"selected":""}>${value}</option>`).join("")}</select></label><label>소유자 종류<select data-home-field="ownerKind" data-home-id="${id}">${["설정하지 않음","캐릭터","기타 인물","단체","공동 소유","기타"].map(value=>`<option ${value===(h.ownerKind||"설정하지 않음")?"selected":""}>${value}</option>`).join("")}</select></label><label>소유 캐릭터<select data-home-field="ownerCharacterId" data-home-id="${id}"><option value="">선택하지 않음</option>${state.order.map(characterId=>`<option value="${characterId}" ${characterId===h.ownerCharacterId?"selected":""}>${esc(state.characters[characterId]?.name||"")}</option>`).join("")}</select></label><label>기타 소유자·단체 이름<input data-home-field="ownerName" data-home-id="${id}" maxlength="120" value="${esc(h.ownerName||"")}" placeholder="예: 해바라기 재단, 이모, 학교 기숙사"></label><label class="home-notes-field">집 설명<input data-home-field="notes" data-home-id="${id}" maxlength="300" value="${esc(h.notes||"")}" placeholder="예: 주말에 쉬러 가는 바닷가 별채"></label><button type="button" class="danger" data-delete-home="${id}">이 집 삭제</button></div>
    <div class="home-photo-editor"><b>집 선택 버튼 배경 사진</b><span><button data-home-bg="${id}">사진</button><button data-image-url="home" data-id="${id}">링크</button>${h.image?`<button data-clear-home-bg="${id}">지우기</button>`:""}</span></div>
  </section>`:"";
  const editToolbar=edit?`<nav class="home-edit-toolbar" aria-label="집 편집 도구"><button type="button" data-open-home-feature="house-settings">집 설정</button><button type="button" data-open-home-feature="room-plan">방 추가·구성</button><button type="button" data-open-home-feature="residents">구성원</button><button type="button" class="primary" data-home-edit>완료</button></nav>`:"";
  return `<article class="home panel ${edit?"is-editing":""}" data-home-card="${id}">
    <div class="title"><div>${edit?`<input class="home-name" data-home-name data-home-id="${id}" value="${esc(h.name)}">`:`<h2>🏠 ${esc(h.name)}</h2>`}<small>${chars.length?`${chars.map(c=>c.name).join(" · ")} 연결됨`:"아직 연결된 캐릭터가 없는 집"}</small></div><b>${inside.length}명 머무는 중</b></div>
    ${editToolbar}${homeSettings}${residentEditor}${sleepEditor}<div class="clean">청결도 · ${Math.round(h.cleanliness??100)}% <i style="width:${h.cleanliness??100}%"></i></div>
    <div class="rooms ${roomKeys.length>6?"has-extra":""}" style="--room-count:${roomKeys.length};--room-cols:4;--room-rows:${packedRooms.rows}">${roomHtml}</div>
    <section class="pets home-feature-panel" data-home-feature="pets"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><h2>반려생물</h2><button data-add-pet>+ 반려생물 추가</button></div><div class="pet-grid">${petCards||"<p>아직 등록된 반려생물이 없어요.</p>"}</div></section>
    <section class="cars home-feature-panel" data-home-feature="cars"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><h2>자동차</h2><button data-add-car>+ 자동차 추가</button></div><div class="car-grid">${cars||"<p>등록된 자동차가 없어요.</p>"}</div><small>운전면허가 있는 구성원만 운전하며, 음주한 날에는 자동차를 이용하지 않아요.</small></section>
    <section class="resident-scenes home-feature-panel" data-home-feature="scenes"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><h2>구성원</h2></div><div>${residentScenes}</div></section>
    <div class="home-feature-panel" data-home-feature="house-log"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button>${homeDailyLog(chars,h)}</div>
    <nav class="home-feature-menu" aria-label="집 세부 메뉴"><button type="button" data-open-home-feature="pets">반려생물</button><button type="button" data-open-home-feature="cars">자동차</button><button type="button" data-open-home-feature="scenes">구성원</button><button type="button" data-open-home-feature="house-log">로그</button></nav>
  </article>`;
}
function chips(title,all,selected,key){return `<section class="chips"><h3>${title}</h3>${all.map(x=>`<button data-chip="${key}" data-value="${x}" class="${selected.includes(x)?"on":""}">${x}</button>`).join("")}</section>`}
function personalityChoice(c,title,field,options,help=""){
  const defaults={socialStyle:"조용히 어울림",perceptionStyle:"균형형",decisionStyle:"균형형",planningStyle:"상황에 따라",activityTempo:"상황에 따라",neatness:"보통",fashionSense:"무난하게 입음",interference:"적당히 관여",conflictStyle:"대화로 해결",affectionStyle:"행동으로 표현",energyRhythm:"상황에 따라",humorStyle:"건조한 농담만 함",emotionalExpression:"상황에 따라 표현함",impulseControl:"가끔 욱하지만 멈춤"};
  const current=c[field]||defaults[field];
  return `<label class="personality-choice"><span><b>${title}</b>${help?`<small>${help}</small>`:""}</span><select data-personality-field="${field}">${options.map(value=>`<option value="${esc(value)}" ${current===value?"selected":""}>${esc(value)}</option>`).join("")}</select></label>`;
}
const PERSONALITY_TYPES=["철두철미함","차분하고 신중함","냉정하고 논리적","다정하고 세심함","수줍고 내향적","활발하고 사교적","즉흥적이고 자유로움","호기심 많고 창의적","완고하고 통제적","무심하고 독립적","감정적이고 충동적","장난기 많음"];
function personalityTypeChoice(c){
  const selected=new Set(c.personalityTypes||[]);
  return `<section class="chips personality-choice personality-type-choice"><h3>이 캐릭터의 전체적인 유형 · 최대 4개</h3><small>여기서 고른 유형이 혼자 하는 행동과 말투의 기본이 되고, 관계 설정은 그다음에 상대별 차이를 더해요.</small><div>${PERSONALITY_TYPES.map(value=>`<button type="button" data-personality-type="${value}" class="${selected.has(value)?"on":""}">${value}</button>`).join("")}</div></section>`;
}
const CHARACTER_TRAITS=["ADHD 설정","자폐 스펙트럼 설정","복수 자아·다중 정체성 설정","해리 경험","불안 관련 특성","강박 관련 특성","감각 처리 특성","틱·투렛 관련 특성","사이코패스 성향 설정 · 비임상","간헐적 폭발 장애 설정","기타 직접 설정"];
const TRAIT_EXPRESSIONS=["주의가 쉽게 전환됨","관심 대상에 과집중함","생각이 떠오르면 바로 시작함","감각 자극에 민감함","익숙한 순서가 바뀌면 힘듦","사회적 신호를 해석하는 데 시간이 필요함","기억이 비는 때가 있음","자아마다 말투·선호가 다름","타인의 감정을 직관보다 관찰과 추론으로 파악함","죄책감이나 공감이 낮게 표현됨","감정이 급격히 치솟는 때가 있음","격해지면 먼저 거리를 두고 진정함"];
function characterTraitChoice(c){
  const traits=new Set(c.characterTraits||[]),expressions=new Set(c.traitExpressions||[]);
  return `<section class="character-trait-settings">
    <div class="character-trait-heading"><h2>서사·인지 특성 · 선택 사항</h2><p>진단명이나 설정 라벨만으로 행동을 추측하지 않아요. 먼저 설정을 표시하고, 실제 생활 장면에 나타낼 방식은 아래에서 따로 골라 주세요.</p></div>
    <section class="chips personality-choice"><h3>설정 라벨 · 최대 8개</h3><div>${CHARACTER_TRAITS.map(value=>`<button type="button" data-character-trait="${value}" class="${traits.has(value)?"on":""}">${value}</button>`).join("")}</div></section>
    <section class="chips personality-choice"><h3>실제 장면에 반영할 표현 · 최대 8개</h3><div>${TRAIT_EXPRESSIONS.map(value=>`<button type="button" data-trait-expression="${value}" class="${expressions.has(value)?"on":""}">${value}</button>`).join("")}</div><small>예: ADHD 설정을 골라도 ‘주의가 쉽게 전환됨’을 별도로 고르지 않으면 모든 행동을 산만하게 만들지 않습니다.</small></section>
    <label class="trait-note-field"><span><b>사용자 정의 특성 표현 · 선택 사항</b><small>위 선택지에 없는 표현만 적어 주세요. 고른 ‘주의가 쉽게 전환됨’ 같은 항목은 메모 없이도 생활 장면 후보에 반영됩니다.</small></span><textarea data-trait-notes maxlength="1200" rows="5" placeholder="한 줄에 한 문장씩 적어 주세요. 예: 대화가 격해지면 창가로 물러나 호흡을 고른다.">${esc(c.traitNotes||"")}</textarea></label>
    <label class="check trait-note-switch"><input type="checkbox" data-trait-notes-in-scripts ${c.traitNotesInScripts?"checked":""}> 위 사용자 정의 문장도 생활 로그에 반영</label>
    <small>선택형 표현은 고르는 즉시 행동 후보에 반영됩니다. 이 스위치는 직접 적은 문장에만 적용돼요. 설정 라벨만으로 행동을 추측하지 않으며, 실제 공격 행동은 별도의 관계 안전 설정이 허용한 범위를 넘지 않습니다.</small>
  </section>`;
}
const HEALTH_CONDITIONS=["당뇨병","고혈압","고지혈증","심혈관 질환","천식","관절 질환","만성 통증","신장 질환","기타 건강 상태"];
const BODY_SIZES=["설정하지 않음","매우 마른 체형","마른 체형","슬림한 체형","보통 체형","통통한 체형","비만 체형","근육질 체형","탄탄한 체형","골격이 큰 체형","골격이 작은 체형"];
const PHYSICAL_TRAIT_GROUPS={
  "키·골격":["키가 매우 큼","키가 큼","키가 작음","키가 매우 작음","팔다리가 긴 편","어깨가 넓음","어깨가 좁음","손이 큼","손이 작음"],
  "체형의 세부 인상":["글래머","근육이 발달함","잔근육이 발달함","근육선이 선명함","유연한 편","상체가 발달함","하체가 발달함","허리가 잘록함","허리선이 곧은 편","골반이 넓음","골반이 좁음","가슴이 큰 편","가슴이 작은 편","복부가 부드러운 편","체지방이 적은 편","팔다리가 긴 편","팔다리가 짧은 편","전체적으로 둥근 인상","각지고 단단한 인상","자세가 반듯함","구부정한 자세","걸음이 가벼움","걸음이 묵직함","붓기가 잘 생김","체중 변화가 잦음"],
  "피부·고유 특징":["피부가 밝은 편","중간 피부톤","피부가 어두운 편","구릿빛 피부","창백한 편","흉터가 있음","문신이 있음","주근깨가 있음","점이 있음","보조개가 있음","피어싱을 함"],
  "얼굴·눈의 인상":["안경을 씀","안대","특이동공","세로동공","삼백안","날카로운 눈매","처진 눈매","속눈썹이 김","두꺼운 눈썹"],
  "전체적인 분위기":["중성적인 인상","부드러운 인상","날카로운 인상","아름다움","잘생김","귀여움","우아함","위압적인 분위기","단정한 분위기","퇴폐적인 분위기","신비로운 분위기","소년미","성숙미"]
};
const HAIR_COLORS=["설정하지 않음","검은색","짙은 갈색","갈색","밝은 갈색","금발","백발·은발","회색","청회색","빨간색","주황색","분홍색","보라색","파란색","청록색","초록색","여러 색","기타"];
const HAIR_ORIGINS=["설정하지 않음","자연모","전체 염색","부분 염색","탈색 후 염색","가발·헤어피스"];
const HAIR_LENGTHS=["설정하지 않음","삭발·매우 짧음","귀 위 길이","숏컷","단발","어깨 길이","가슴 길이","허리 길이","허리보다 김"];
const HAIR_TEXTURES=["설정하지 않음","직모","약한 반곱슬","강한 반곱슬","곱슬","강한 곱슬"];
const HAIR_STYLES=["자연스럽게 풀어 둠","앞머리 있음","앞머리 없음","시스루 앞머리","일자 앞머리","처피뱅","커튼뱅","옆으로 넘긴 앞머리","앞머리가 한쪽 눈을 가림","앞머리가 양쪽 눈을 가림","올백","슬릭백","보브컷","픽시컷","댄디컷","리프컷","레이어드컷","허쉬컷","샤기컷","울프컷","투블럭","언더컷","모히칸","리젠트","포니테일","사이드 포니테일","트윈테일","양갈래","반묶음","하프업 번","땋은 머리","프렌치 브레이드","피시테일 브레이드","콘로우","박스 브레이드","로우번","하이번","스페이스 번","브레이드 업두","드레드록","히메컷","롱 스트레이트","단발 웨이브","웨이브 스타일","베이비펌","히피펌","가르마펌","고데기 스타일링"];
const EYE_COLORS=["설정하지 않음","검은색","짙은 갈색","갈색","연갈색","호박색","금색","초록색","청록색","파란색","청회색","회색","보라색","분홍색","빨간색","백색","여러 색","기타"];
const MAKEUP_LEVELS=["하지 않음","스킨케어만","선크림·기초만","가벼운 메이크업","포인트 메이크업","풀 메이크업"];
const MAKEUP_STYLES=["내추럴","글로우","매트","음영","아이 메이크업 중심","립 중심","화려한 색조","무대·촬영용","고딕","복고풍"];
const SALON_FREQUENCIES=["자동 · 설정에 맞춤","거의 가지 않음","3~4개월에 한 번","1~2개월에 한 번","한 달에 한 번","2주에 한 번","주 1회 이상"];
const SURGERY_AREAS=["눈","코","입술","윤곽·턱","피부·흉터","가슴","체형 교정","성별확정 의료 과정","기타"];
const ACCESSIBILITY_PREFERENCES=["도움 전에 먼저 물어보기","보조기기 함부로 만지지 않기","접근 가능한 동선 먼저 확인","쉬는 시간을 충분히 두기","조용한 자리 선호","문자·시각 정보 함께 제공","말로 주변 정보 설명","직접 선택하고 결정할 시간 주기"];
function profileSelect(label,path,options,current){
  return `<label>${label}<select data-body-field="${path}">${options.map(value=>`<option value="${esc(value)}" ${value===current?"selected":""}>${esc(value)}</option>`).join("")}</select></label>`;
}
function profileMultiChoice(title,key,options,selected){
  const values=new Set(selected||[]);
  const all=[...options,...[...values].filter(value=>!options.includes(value))];
  return `<fieldset><legend>${title}</legend><div class="chips">${all.map(value=>`<button type="button" data-body-list="${key}" data-value="${esc(value)}" class="${values.has(value)?"on":""}">${esc(value)}</button>`).join("")}</div></fieldset>`;
}
function profileAttractionSettings(c){
  const attractionTraits=Array.isArray(c.attractionTraits)?c.attractionTraits:[];
  const dislikedAttractionTraits=Array.isArray(c.dislikedAttractionTraits)?c.dislikedAttractionTraits:[];
  return `<section class="setting-card profile-attraction-settings">
    <h2>끌림과 외모 인식</h2>
    <p>이 캐릭터가 상대의 외모를 얼마나 보는지와, 어떤 외형·성격·말투·삶의 태도에 끌리는지를 정해요. 이 설정만으로 관계나 호감은 자동 생성되지 않습니다.</p>
    <div class="health-field-grid">
      <label>상대의 외모를 보는 정도<select data-field="appearanceInterest">${["거의 보지 않음","조금 봄","보통","꽤 중요하게 봄","외모에 크게 끌림"].map(value=>`<option ${value===(c.appearanceInterest||"보통")?"selected":""}>${value}</option>`).join("")}</select></label>
    </div>
    <div class="profile-tag-actions">
      <button type="button" data-profile-tags="attractionTraits">이 캐릭터가 끌리는 특성 정하기</button>
      <small data-profile-tags-summary="attractionTraits">${attractionTraits.length?esc(attractionTraits.join(" · ")):"정하지 않음"}</small>
    </div>
    <div class="profile-tag-actions profile-tag-actions-disliked">
      <button type="button" data-profile-tags="dislikedAttractionTraits">이 캐릭터가 비선호하는 특성 정하기</button>
      <small data-profile-tags-summary="dislikedAttractionTraits">${dislikedAttractionTraits.length?esc(dislikedAttractionTraits.join(" · ")):"정하지 않음"}</small>
    </div>
    <small>상대별 시선과 관계 단계가 먼저이며, 끌리는 특성은 그 관계 안에서 시선이 머무는 이유와 표현 후보에만 반영됩니다.</small>
  </section>`;
}
function physicalAppearanceSettings(c){
  const p=c.bodyProfile||{},a=p.appearance||{};
  const physicalTraits=new Set([...(p.physicalTraits||[]),...(c.appearanceTags||[])]);
  const physicalTraitGroups=Object.entries(PHYSICAL_TRAIT_GROUPS).map(([group,options])=>`<fieldset class="physical-trait-group"><legend>${esc(group)}</legend><div class="chips">${options.map(value=>`<button type="button" data-body-list="physicalTraits" data-value="${esc(value)}" class="${physicalTraits.has(value)?"on":""}">${esc(value)}</button>`).join("")}</div></fieldset>`).join("");
  return `<section class="setting-card physical-appearance-settings">
    <h2>신체와 외형</h2>
    <p>직접 고른 항목만 묘사에 사용합니다. 머리·눈·화장 설정은 아침 준비, 미용실, 가까운 관계의 시선 같은 생활 장면에 드물게 반영돼요.</p>
    <div class="health-field-grid">
      <label>외모가 눈에 띄는 정도<select data-field="appearanceLevel">${["매우 추함","못생김","눈에 띄지 않음","수수함","보통","매력적임","매우 아름답거나 잘생김","시선을 사로잡음"].map(value=>`<option ${value===(c.appearanceLevel||"보통")?"selected":""}>${value}</option>`).join("")}</select></label>
      ${profileSelect("체형","bodySize",BODY_SIZES,p.bodySize||"설정하지 않음")}
      ${profileSelect("현재 머리색","appearance.hairColor",HAIR_COLORS,a.hairColor||"설정하지 않음")}
      ${profileSelect("머리색 설정","appearance.hairColorOrigin",HAIR_ORIGINS,a.hairColorOrigin||"설정하지 않음")}
      ${profileSelect("본래 머리색 · 염색모일 때","appearance.naturalHairColor",HAIR_COLORS,a.naturalHairColor||"설정하지 않음")}
      ${profileSelect("머리 기장","appearance.hairLength",HAIR_LENGTHS,a.hairLength||"설정하지 않음")}
      ${profileSelect("머리 결","appearance.hairTexture",HAIR_TEXTURES,a.hairTexture||"설정하지 않음")}
      <div class="eye-color-pair">
        ${profileSelect("왼쪽 눈 색","appearance.leftEyeColor",EYE_COLORS,a.leftEyeColor||"설정하지 않음")}
        ${profileSelect("오른쪽 눈 색","appearance.rightEyeColor",EYE_COLORS,a.rightEyeColor||"설정하지 않음")}
      </div>
      ${profileSelect("화장 정도","appearance.makeupLevel",MAKEUP_LEVELS,a.makeupLevel||"하지 않음")}
      ${profileSelect("미용실 방문 빈도","appearance.salonFrequency",SALON_FREQUENCIES,a.salonFrequency||"자동 · 설정에 맞춤")}
      ${profileSelect("성형·외형 의료 시술 여부","appearance.cosmeticSurgery",["설정하지 않음","하지 않음","과거에 받음","정기적으로 관리 중","받을 계획이 있음"],a.cosmeticSurgery||"설정하지 않음")}
    </div>
    ${profileMultiChoice("머리 스타일 · 여러 개 선택 가능","appearance.hairStyles",HAIR_STYLES,a.hairStyles)}
    ${profileMultiChoice("화장 스타일 · 화장할 때 반영","appearance.makeupStyles",MAKEUP_STYLES,a.makeupStyles)}
    <section class="physical-trait-groups"><div><h3>신체 특성</h3><small>기존 ‘그 외 외모 태그’도 이곳에서 함께 확인할 수 있어요. 체형·머리색·눈색처럼 위에서 정하는 항목은 중복해서 두지 않았습니다.</small></div>${physicalTraitGroups}</section>
    ${profileMultiChoice("성형·외형 의료 시술 부위 · 원할 때만","appearance.cosmeticSurgeryAreas",SURGERY_AREAS,a.cosmeticSurgeryAreas)}
  </section>`;
}
function healthAccessibilitySettings(c){
  const p=c.bodyProfile||{},wheelchair=p.wheelchair||{},arm=p.prostheticArm||{},leg=p.prostheticLeg||{},hearing=p.hearing||{},vision=p.vision||{};
  const sideOptions=["사용하지 않음","왼쪽","오른쪽","양쪽"];
  const sensorySides=["설정하지 않음","왼쪽","오른쪽","양쪽"];
  return `<section class="setting-card health-accessibility-settings">
    <h2>건강·장애·접근성 설정 · 선택 사항</h2>
    <div class="representation-warning"><b>표현 안전 안내</b><p>이 항목은 진단이나 의학 조언이 아닙니다. 장애·질환·체형을 무능, 비극, 웃음거리, 영감의 소재, 폭력성과 연결하지 않아요. 생활 장면에는 당사자가 직접 고른 보조기기·접근성·건강 관리 방식만 가끔 반영하며, 도움은 먼저 묻고 동의받는 방식으로 표현합니다. 사람마다 선호하는 말과 경험이 다르므로 원하지 않는 항목은 고르지 않아도 됩니다.</p></div>
    <div class="health-field-grid">
      ${profileSelect("휠체어", "wheelchair.type",["사용하지 않음","수동 휠체어","전동 휠체어","스포츠용 휠체어","기타 휠체어"],wheelchair.type||"사용하지 않음")}
      ${profileSelect("휠체어 이용 방식", "wheelchair.pattern",["","항상 이용","장거리·외출 시 이용","피로하거나 통증이 있을 때 이용","활동에 따라 바꾸어 이용"],wheelchair.pattern||"")}
      ${profileSelect("의수 사용 부위", "prostheticArm.side",sideOptions,arm.side||"사용하지 않음")}
      ${profileSelect("의수 종류", "prostheticArm.type",["","미관용 의수","장식·미관용 손형 의수","수동 손형 의수","수동 갈고리형 의수","작업용 의수","작업용 갈고리·집게형 의수","바디파워 의수","바디파워 손형 의수","바디파워 갈고리형 의수","근전동 의수","근전동 손형 의수","다관절 전자의수","스포츠·활동용 의수","특정 작업용 교체 도구","기타 의수"],arm.type||"")}
      ${profileSelect("의족 사용 부위", "prostheticLeg.side",sideOptions,leg.side||"사용하지 않음")}
      ${profileSelect("의족 종류", "prostheticLeg.type",["","일상 보행용 의족","고활동형 의족","스포츠용 의족","방수용 의족","미관용 의족","기타 의족"],leg.type||"")}
      ${profileSelect("청각장애·난청 부위", "hearing.side",sensorySides,hearing.side||"설정하지 않음")}
      ${profileSelect("청각 특성", "hearing.level",["","난청","농·청각장애","상황에 따라 들리는 정도가 다름","기타"],hearing.level||"")}
      ${profileSelect("시각장애·저시력 부위", "vision.side",sensorySides,vision.side||"설정하지 않음")}
      ${profileSelect("시각 특성", "vision.level",["","저시력","맹·시각장애","시야 범위가 제한됨","빛에 민감함","기타"],vision.level||"")}
    </div>
    ${profileMultiChoice("만성질환·건강 관리", "healthConditions",HEALTH_CONDITIONS,p.healthConditions)}
    ${profileMultiChoice("청각 접근 방식", "hearing.supports",["보청기","인공와우","수어","문자 대화","입모양이 보이는 대화","자막","조용한 환경"],hearing.supports)}
    ${profileMultiChoice("시각 접근 방식", "vision.supports",["흰지팡이","안내견","화면 읽기","확대·고대비","음성 안내","촉각 표식","동행 안내"],vision.supports)}
    ${profileMultiChoice("상호작용에서 지킬 방식", "accessibilityPreferences",ACCESSIBILITY_PREFERENCES,p.accessibilityPreferences)}
    <div class="health-field-grid">
      <label>기타 건강 상태<input data-body-field="healthOther" maxlength="200" value="${esc(p.healthOther||"")}" placeholder="원할 때만 직접 입력"></label>
      <label>의수 종류 직접 입력<input data-body-field="prostheticArm.custom" maxlength="120" value="${esc(arm.custom||"")}" placeholder="기타 의수를 골랐을 때"></label>
      <label>의족 종류 직접 입력<input data-body-field="prostheticLeg.custom" maxlength="120" value="${esc(leg.custom||"")}" placeholder="기타 의족을 골랐을 때"></label>
    </div>
    <label>접근성 참고 메모 · 설정표용<textarea data-body-field="notes" maxlength="600" rows="4" placeholder="예: 안내견에게는 일하는 중 말을 걸지 않기, 도움 전에 반드시 먼저 묻기">${esc(p.notes||"")}</textarea></label>
    <small>건강 상태를 고르더라도 매 장면마다 언급하지 않습니다. 치료법·복용량·식단을 자동 처방하지 않고, 평범한 생활과 선택한 접근성 방식 안에서만 드물게 나타납니다. 이 참고 메모는 민감한 내용이 그대로 노출되지 않도록 생활 로그에는 자동 삽입하지 않고 설정표에만 보관합니다.</small>
  </section>`;
}
function characterHomeLayoutEditor(c){
  const activeMode=state.homeVisualMode==="ld"&&hasLdArt(c)?"ld":"sd";
  const sdArt=c.icon
    ?`<img src="${esc(c.icon)}" alt="${esc(c.name)} SD 미리보기">`
    :c.photo?`<img class="profile-photo-fallback" src="${esc(c.photo)}" alt="${esc(c.name)} SD 미리보기">`
      :`<span class="home-layout-fallback">${esc((c.name||"새").slice(0,1))}</span>`;
  const ldArt=hasLdArt(c)
    ?`<img src="${esc(ldArtSource(c))}" alt="${esc(c.name)} LD 미리보기">`
    :`<span class="home-layout-fallback is-ld">LD<br><small>이미지 미등록</small></span>`;
  const layer=(mode,art)=>`<div class="home-layout-layer" data-home-layout-layer="${mode}" style="${sceneLayoutVars(c,mode)}"><div class="home-layout-art" data-home-layout-drag="art" role="img" aria-label="${esc(c.name)} ${mode.toUpperCase()} 위치 조정">${art}<button type="button" class="home-layout-resize-handle" data-home-layout-resize aria-label="모서리를 끌어 캐릭터 크기 조정">↘</button></div><button type="button" class="home-layout-action" data-home-layout-drag="action" aria-label="행동 이모티콘 위치 조정">☕</button></div>`;
  return `<section class="character-home-layout-editor" data-home-layout-editor data-character-id="${c.id}" data-mode="${activeMode}"><div class="character-home-layout-heading"><div><h3>홈 캐릭터·행동 이모티콘 배치</h3><p>실제 홈 화면 모양에서 캐릭터와 이모티콘을 직접 끌어 옮기세요. 캐릭터 모서리 손잡이를 끌면 크기가 바뀝니다. SD와 LD 위치는 각각 따로 저장돼요.</p></div><div class="home-layout-mode-buttons"><button type="button" data-home-layout-mode="sd" class="${activeMode==="sd"?"on":""}">SD 배치</button><button type="button" data-home-layout-mode="ld" class="${activeMode==="ld"?"on":""}" ${hasLdArt(c)?"":"disabled"}>LD 배치</button><button type="button" data-home-layout-reset>현재 배치 초기화</button></div></div><div class="home-layout-preview" style="--layout-preview-bg:url(&quot;${esc(state.world.bg||TOWN_BACKGROUND)}&quot;)"><div class="home-layout-preview-title"><b>${esc(c.name)}</b><time>오후 07:30</time></div><div class="home-layout-preview-menu left">⌂<br>♙<br>◇<br>∞</div><div class="home-layout-preview-menu right">▦<br>▧<br>♢<br>⚙</div>${layer("sd",sdArt)}${layer("ld",ldArt)}<div class="home-layout-preview-picker">${avatar(c)}<span></span><span></span><span></span></div><div class="home-layout-preview-card"><small>지금 이 순간</small><b>홈 화면 배치 미리보기</b></div></div><small class="home-layout-save-note">드래그를 놓는 순간 이 캐릭터에 자동 저장됩니다.</small></section>`;
}
function character(){
  const c=active();
  const list=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="char-sort-row"><button class="char-row ${id===c.id?"on":""}" data-edit="${id}" style="--own:${x.theme.primary}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(x.job)}</small></span></button><span class="sort-controls"><button data-sort="${id}" data-direction="-1" ${index===0?"disabled":""} aria-label="위로">▲</button><button data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""} aria-label="아래로">▼</button></span></div>`}).join("");
  const favorites=Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips"><h3>${label} 최애</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-favorite-kind="${kind}" data-favorite-id="${item.id}" class="${(c.favorites?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>취향 사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const inventory=Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips owned-items"><h3>소지한 ${label}</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-owned-kind="${kind}" data-owned-id="${item.id}" class="${(c.inventory?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>취향 사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const workplaces=state.towns.flatMap(town=>(town.id===state.activeTownId?state.world.places:town.places).map(place=>({...place,townName:town.name})));
  const legacyYoungAge=["영아","유아"].includes(c.ageGroup)?[c.ageGroup]:[];
  const ageGroups=[...legacyYoungAge,"어린이","청소년","청년","성인","중년","장년","노년","나이 불명"];
  const profile=`<h2>프로필</h2><div class="fields"><label>캐릭터 이름<input data-field="name" value="${esc(c.name)}"></label><label>나이대<select data-field="ageGroup">${ageGroups.map(x=>`<option ${x===(c.ageGroup||"성인")?"selected":""}>${x}</option>`).join("")}</select></label><label>직업 종류<select data-field="job">${JOBS.map(x=>`<option ${x===c.job?"selected":""}>${x}</option>`).join("")}</select></label><label>표기할 직업명<input data-field="jobTitle" value="${esc(c.jobTitle||"")}" placeholder="비워 두면 직업 종류명으로 표시"></label><label>출근할 건물<select data-field="workplaceId"><option value="">자동 선택 / 없음</option><option value="home" ${c.workplaceId==="home"?"selected":""}>🏠 자택근무</option>${workplaces.map(p=>`<option value="${p.id}" ${c.workplaceId===p.id?"selected":""}>${esc(p.townName)} · ${esc(p.name)}</option>`).join("")}</select></label><label>소비 유형<select data-field="income">${INCOMES.map(x=>`<option ${x===c.income?"selected":""}>${x}</option>`).join("")}</select></label><label>매운맛 선호 <b data-range-label="spiceTolerance">${SPICE_LEVELS[c.spiceTolerance??2]}</b><input type="range" min="0" max="5" data-field="spiceTolerance" data-levels="spice" value="${c.spiceTolerance??2}"></label><label>단맛 선호 <b data-range-label="sweetPreference">${SWEET_LEVELS[c.sweetPreference??2]}</b><input type="range" min="0" max="5" data-field="sweetPreference" data-levels="sweet" value="${c.sweetPreference??2}"></label><label>외향·내향 정도 <b data-range-label="socialEnergy">${PERSONALITY_LEVELS.socialEnergy[c.socialEnergy??3]}</b><input type="range" min="0" max="6" data-field="socialEnergy" data-levels="socialEnergy" value="${c.socialEnergy??3}"></label><label>감각·직관 정도 <b data-range-label="sensingIntuition">${PERSONALITY_LEVELS.sensingIntuition[c.sensingIntuition??3]}</b><input type="range" min="0" max="6" data-field="sensingIntuition" data-levels="sensingIntuition" value="${c.sensingIntuition??3}"></label><label>사고·감정 정도 <b data-range-label="thinkingFeeling">${PERSONALITY_LEVELS.thinkingFeeling[c.thinkingFeeling??3]}</b><input type="range" min="0" max="6" data-field="thinkingFeeling" data-levels="thinkingFeeling" value="${c.thinkingFeeling??3}"></label><label>인식·판단 정도 <b data-range-label="perceivingJudging">${PERSONALITY_LEVELS.perceivingJudging[c.perceivingJudging??3]}</b><input type="range" min="0" max="6" data-field="perceivingJudging" data-levels="perceivingJudging" value="${c.perceivingJudging??3}"></label><label>기상 시각<input type="time" data-field="wake" value="${c.wake}"></label><label>취침 시각<input type="time" data-field="sleep" value="${c.sleep}"></label></div>`;
  const interactionTargets=state.order.filter(id=>id!==c.id).map(id=>`<option value="${id}">${esc(state.characters[id].name)}</option>`).join("");
  const interactionItems=Object.entries(state.catalog||{}).flatMap(([kind,items])=>(items||[]).map(item=>`<option value="${kind}:${item.id}">${esc(item.name)}</option>`)).join("");
  const worldTaste=`<h2>${esc(c.name)}의 세계관 선호와 소지품</h2><p>특히 좋아하는 항목과 실제로 가지고 다니거나 보관하는 물건을 각각 골라 주세요.</p>${favorites}<hr><h2>소지품</h2>${inventory}<hr><section class="setting-card"><h2>🎁 구체적인 물건 구매·선물하기</h2><p>실제 물건 이름을 고르면 받는 캐릭터의 소지품에 정확히 추가되고, 두 캐릭터의 같은 시각 로그에 누가 누구에게 무엇을 건넸는지 표시돼요.</p><div class="fields"><label>함께할 캐릭터<select data-character-interaction-target>${interactionTargets||'<option value="">다른 캐릭터가 필요해요</option>'}</select></label><label>구매하거나 선물할 물건<select data-character-interaction-item>${interactionItems||'<option value="">취향 사전에 물건을 먼저 추가해 주세요</option>'}</select></label></div><div class="image-actions"><button data-character-interaction="buy">내 소지품으로 구매</button><button data-character-interaction="gift">선택한 물건 선물하기</button><button data-character-interaction="exercise">같이 운동하기</button><button data-character-interaction="outing">같이 나들이하기</button></div></section>`;
  const videoFormats=["영화","드라마","애니메이션","다큐멘터리","연애 예능","여행 예능","음악 예능","관찰 예능","게임 예능","토크쇼","서바이벌","코미디 예능","브이로그","게임 방송","먹방","리뷰","교육","숏폼","웹예능","웹드라마"],gameGenres=DETAIL_OPTIONS.game;
  const storyGenres=["로맨스","코미디","액션","판타지","SF","스릴러","공포","미스터리","범죄","드라마","시대극","일상","청춘","가족","모험"];
  const taste=`<h2>${esc(c.name)}의 취향 선택</h2><p>‘좋아하는 장르’는 책·영화·드라마·애니메이션 등 이야기 콘텐츠 전체에 공통으로 반영돼요.</p>${chips("관심사",INTERESTS,c.interests||[],"interests")}${chips("취미",HOBBIES,c.hobbies||[],"hobbies")}${chips("음식",FOOD_PREFERENCES,c.foodPreferences||[],"foodPreferences")}${chips("좋아하는 음료",DRINKS,c.drinks||[],"drinks")}${chips("좋아하는 장르 · 이야기 전체",storyGenres,c.favoriteStoryGenres||[],"favoriteStoryGenres")}${chips("좋아하는 음악 장르",MUSIC,c.musicGenres||[],"musicGenres")}${chips("좋아하는 패션 스타일",DETAIL_OPTIONS.fashion,c.favoriteFashionStyles||[],"favoriteFashionStyles")}${chips("좋아하는 영상 종류",videoFormats,c.favoriteVideoGenres||[],"favoriteVideoGenres")}${chips("좋아하는 게임 장르",gameGenres,c.favoriteGameGenres||[],"favoriteGameGenres")}${chips("좋아하는 향 계열",PERFUME_NOTES,c.favoriteScentNotes||[],"favoriteScentNotes")}`;
  const personalityDetails=[
    personalityChoice(c,"사람과 어울리는 방식","socialStyle",["혼자가 편함","낯을 가림","조용히 어울림","먼저 다가감","무리의 중심"]),
    personalityChoice(c,"정보를 받아들이는 방식","perceptionStyle",["현실과 경험 중시","구체적인 편","균형형","가능성 중시","직관과 상상 중시"]),
    personalityChoice(c,"판단하는 방식","decisionStyle",["논리 우선","이성적인 편","균형형","마음을 살핌","공감 우선"]),
    personalityChoice(c,"일정을 다루는 방식","planningStyle",["무계획","즉흥적","유연한 편","상황에 따라","미리 정리함","계획적","강박적으로 계획함"]),
    personalityChoice(c,"행동을 전환하는 방식","activityTempo",["한 가지씩 차분히","잠깐 쉬고 다음 일","상황에 따라","생각나면 바로 움직임","부산스럽게 여러 일을 오감","허둥대며 주의가 자주 옮겨감"],"활동적인 정도와 별개예요. 뒤쪽일수록 하던 중 다른 일이 눈에 들어오는 행동이 늘어요."),
    personalityChoice(c,"깔끔한 정도","neatness",["어질러도 편함","조금 느슨함","보통","정돈을 좋아함","흐트러짐을 못 참음","결벽에 가까움"]),
    personalityChoice(c,"옷을 입는 감각","fashionSense",["패션에 전혀 관심 없음","조합을 자주 틀림","무난하게 입음","센스 있게 입음","스타일링에 능숙함"],"자동 코디의 색 조합·상황 적합성·액세서리 사용에 반영돼요."),
    personalityChoice(c,"남에게 관여하는 정도","interference",["방관자","요청할 때만 도움","적당히 관여","챙기고 확인함","강하게 간섭함","컨트롤프릭"],"방관자는 웬만한 일에 끼어들지 않고, 컨트롤프릭은 상대의 일정과 행동까지 통제하려 해 갈등 가능성이 커져요."),
    personalityChoice(c,"갈등 대응","conflictStyle",["피하는 편","시간을 두고 말함","대화로 해결","바로 따짐","끝까지 결론을 냄"]),
    personalityChoice(c,"애정 표현","affectionStyle",["표현이 서툼","조용히 곁에 있음","말로 표현","행동으로 표현","적극적으로 챙김"]),
    personalityChoice(c,"생활 에너지","energyRhythm",["집에서 충전","느긋한 편","상황에 따라","활동적인 편","가만히 못 있음"]),
    personalityChoice(c,"유머·장난 성향","humorStyle",["장난을 거의 하지 않음","건조한 농담만 함","가끔 장난을 즐김","장난을 즐김","유머로 분위기를 이끎"],"웃음·농담·장난 장면의 빈도와 표현을 정해요."),
    personalityChoice(c,"감정 표현의 크기","emotionalExpression",["표정 변화가 거의 없음","감정을 잘 드러내지 않음","상황에 따라 표현함","표현이 풍부함","감정이 바로 드러남"],"같은 감정이라도 표정과 몸짓으로 얼마나 드러나는지 정해요."),
    personalityChoice(c,"충동을 참는 정도","impulseControl",["매우 잘 참음","대체로 참음","가끔 욱하지만 멈춤","쉽게 욱함","거의 참지 않음"],"공격 충동이 있어도 이 성향과 실제 행동 단계가 허용해야 행동으로 나와요.")
  ].join("");
  const personality=`<h2>${esc(c.name)}의 성격</h2><p>전체 유형을 먼저 고르고, 아래에서 세부 성향과 서사·인지 특성을 조절해 주세요.</p>${personalityTypeChoice(c)}<section class="personality-detail-grid">${personalityDetails}</section>`;
  const lifestyleSelect=(label,field,options,current)=>`<label>${label}<select data-field="${field}">${options.map(value=>`<option value="${esc(value)}" ${current===value?"selected":""}>${esc(value)}</option>`).join("")}</select></label>`;
  const photoQuickCard=`<section class="character-photo-quick-card"><span>${c.photo?`<img class="profile-photo-fallback" src="${esc(c.photo)}" alt="${esc(c.name)} 프로필 사진">`:`<span class="character-image-empty-preview"><i>사진</i><small>미등록</small></span>`}</span><div><h3>프로필 사진 첨부</h3><p>여기서 바로 사진을 등록할 수 있어요. 프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.</p><div class="image-actions"><button type="button" class="primary" data-image="photo">사진 파일 선택</button><button type="button" data-image-url="photo" data-id="${c.id}">사진 링크</button>${c.photo?`<button type="button" data-clear-character-image="photo">사진 지우기</button>`:""}</div><small>투명 SD 아이콘과 단일 LD 일러스트는 ‘사진·SD·LD’ 탭에서 따로 등록해요.</small></div></section>`;
  const profileWithLicense=`<section class="profile-license">${photoQuickCard}${townAssignment(c)}${profile}<section class="setting-card character-lifestyle-settings"><h2>운전·흡연·주량</h2><p>체크 한 칸 대신 캐릭터의 실제 생활 습관에 가까운 상태를 골라 주세요.</p><div class="fields lifestyle-profile-fields">${lifestyleSelect("운전면허·운전 경험","driverLicense",["면허 없음","면허만 있음 · 운전하지 않음","초보운전","가끔 운전함","운전에 익숙함","장거리·야간 운전도 익숙함"],c.driverLicense||"면허 없음")}${lifestyleSelect("흡연 여부","smokingStatus",["설정하지 않음","비흡연","금연 중","가끔 흡연","전자담배 사용","흡연"],c.smokingStatus||"설정하지 않음")}${lifestyleSelect("주량","alcoholTolerance",["설정하지 않음","마시지 않음","한두 모금","매우 약함","약한 편","보통","강한 편","매우 강함"],c.alcoholTolerance||"설정하지 않음")}</div></section>${profileAttractionSettings(c)}</section>`;
  const bodyPane=`<section class="character-traits-pane body-pane"><div class="traits-pane-heading"><h2>${esc(c.name)}의 신체</h2><p>체형, 머리, 눈, 화장 같은 외형과 건강·접근성을 나누어 정해요. 고르지 않은 특성은 장면에서 지어내지 않습니다.</p></div>${physicalAppearanceSettings(c)}${healthAccessibilitySettings(c)}</section>`;
  const limit=characterLimit();
  const slotLabel=state.order.length>limit?`${state.order.length}명 저장됨 · 한도 ${limit}명`:`+ 생성 · ${state.order.length}/${limit}`;
  const paneMeta={profile:["프로필","사진·기본 정보·생활 습관","👤"],body:["신체","외형·건강·접근성","✦"],personality:["성격","성향·서사·인지","◈"],taste:["취향 선택","취미·음식·콘텐츠","♡"],worldTaste:["세계관 선호","최애·소지품","⌂"],manage:["사진·SD·LD","이미지·표현·파일","📷"]};
  const paneButtons=Object.entries(paneMeta).map(([key,[label,help,icon]])=>`<button type="button" data-open-character-pane="${key}" class="${state.characterPane===key?"on":""}"><span>${icon}</span><b>${label}</b><small>${help}</small></button>`).join("");
  const mobileStrip=state.order.map(id=>{const x=state.characters[id];return `<button type="button" data-mobile-character-select="${id}" class="${id===c.id?"on":""}" style="--own:${x.theme.primary}">${avatar(x)}<small>${esc(x.name)}</small></button>`}).join("");
  const reorderRows=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="mobile-character-reorder-row">${avatar(x)}<b>${esc(x.name)}</b><span><button type="button" data-sort="${id}" data-direction="-1" ${index===0?"disabled":""}>←</button><button type="button" data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""}>→</button></span></div>`}).join("");
  const ldSource=ldArtSource(c);
  const ldCard=`<article class="character-ld-card character-ld-single"><div>${ldSource?`<img class="scene-ld-art" src="${esc(ldSource)}" alt="${esc(c.name)} LD 일러스트">`:`<span class="character-image-empty-preview ld"><i>LD</i><small>LD 미등록</small></span>`}</div><h4>LD 일러스트</h4><small>전신 또는 무릎 위 이미지 한 장</small><span class="image-actions"><button type="button" data-image="ldImage">LD 파일</button><button type="button" data-image-url="ldImage" data-id="${c.id}">LD 링크</button>${ldSource?`<button type="button" data-clear-character-image="ldImage">지우기</button>`:""}</span></article>`;
  const homeVisualChoice="";
  const managePane=`<section class="character-manage-pane" style="--own:var(--p);--own-secondary:var(--s)"><div class="traits-pane-heading"><h2>${esc(c.name)}의 프로필·SD·LD</h2><p>프로필 사진, 투명 SD 아이콘, 전신 LD 일러스트는 전부 별도 파일입니다. 등록하지 않은 칸은 기존 표현을 그대로 사용해요.</p></div><div class="character-manage-grid">${homeVisualChoice}<section><span>${c.photo?`<img class="profile-photo-fallback" src="${esc(c.photo)}" alt="${esc(c.name)} 프로필 사진">`:`<span class="character-image-empty-preview"><i>사진</i><small>미등록</small></span>`}</span><div><h3>프로필 사진</h3><p>프로필 자리에서만 여백 없이 동그랗게 보여요. SD 아이콘으로 복사되지 않습니다.</p><div class="image-actions"><button type="button" data-image="photo">사진 파일</button><button type="button" data-image-url="photo" data-id="${c.id}">사진 링크</button>${c.photo?`<button type="button" data-clear-character-image="photo">지우기</button>`:""}</div></div></section><section><span>${c.icon?`<img class="sprite" src="${esc(c.icon)}" alt="${esc(c.name)} 투명 SD 아이콘">`:`<span class="character-image-empty-preview icon"><i>PNG</i><small>SD 미등록</small></span>`}</span><div><h3>투명 SD 아이콘</h3><p>별도로 등록했을 때만 사용해요. 투명 PNG 전체가 잘리지 않도록 원본 비율을 유지합니다.</p><div class="image-actions"><button type="button" data-image="icon">SD PNG 파일</button><button type="button" data-image-url="icon" data-id="${c.id}">SD 링크</button>${c.icon?`<button type="button" data-clear-character-image="icon">지우기</button>`:""}</div></div></section><section class="character-ld-settings"><div><h3>홈화면 LD 일러스트</h3><p>LD 일러스트는 캐릭터마다 한 장만 등록합니다. 감정은 장면의 배경 효과로 표현해요. LD 일러스트는 자르지 않고 원본 비율 전체를 사용하며, 위에서 선택한 표현 방식으로 홈화면에 표시합니다.</p></div><div class="character-ld-grid character-ld-single-grid">${ldCard}</div></section>${characterHomeLayoutEditor(c)}<section class="character-manage-files"><h3>캐릭터 삭제</h3><p>삭제 전 경고를 확인한 뒤 이 캐릭터와 연결된 기록을 정리해요.</p><button type="button" class="danger" data-delete-character="${c.id}">캐릭터 삭제</button></section></div></section>`;
  const pane=state.characterPane==="body"?bodyPane:state.characterPane==="personality"?`${personality}${characterTraitChoice(c)}`:state.characterPane==="taste"?taste:state.characterPane==="worldTaste"?worldTaste:state.characterPane==="manage"?managePane:profileWithLicense;
  return `<div class="editor character-editor" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}">
    <aside class="panel desktop-character-list"><div class="title"><h2>캐릭터 목록</h2><button data-new ${state.order.length>=limit?"disabled":""}>${slotLabel}</button></div>${list}</aside>
    <section class="panel form">
      <section class="mobile-character-dashboard" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}">
        <div class="mobile-character-top"><div class="mobile-character-strip">${mobileStrip}</div><div><button type="button" data-new ${state.order.length>=limit?"disabled":""}>＋</button><button type="button" data-open-character-reorder>위치 바꾸기</button></div></div>
        <div class="mobile-character-heading">${avatar(c)}<span><small>CHARACTER SETTING</small><h1>${esc(c.name)}</h1><p>편집할 항목을 선택하세요.</p></span><div class="character-file-actions mobile-character-file-actions"><button type="button" data-export-profile>프로필 내보내기</button><button type="button" data-tab="statistics">통계</button><button type="button" class="primary" data-save>캐릭터 저장</button><button type="button" class="danger" data-delete-character="${c.id}">캐릭터 삭제</button></div></div>
        <div class="mobile-character-pane-grid">${paneButtons}</div>
      </section>
      <section class="desktop-character-editor"><div class="character-menu">${Object.entries(paneMeta).map(([key,[label]])=>`<button data-character-pane="${key}" class="${state.characterPane===key?"on":""}">${label}</button>`).join("")}<div class="character-file-actions"><button type="button" data-export-profile>프로필 내보내기</button><button type="button" data-tab="statistics">통계</button><button type="button" class="primary" data-save>캐릭터 저장</button><button type="button" class="danger" data-delete-character="${c.id}">캐릭터 삭제</button></div></div>${pane}</section>
      <dialog class="mobile-character-editor-dialog" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}" data-mobile-character-editor-dialog="${state.characterPane}"><div class="mobile-character-editor-shell"><div class="mobile-editor-head"><span>${avatar(c)}<small>${paneMeta[state.characterPane]?.[0]||"프로필"}</small><b>${esc(c.name)}</b></span><button type="button" data-close-mobile-character-editor aria-label="편집을 저장하고 닫기">×</button></div><div class="mobile-character-editor-body">${pane}</div><div class="mobile-character-editor-actions"><button type="button" class="primary" data-save-mobile-character-editor>편집 완료·저장</button></div></div></dialog>
      <dialog class="mobile-character-reorder-dialog" data-mobile-character-reorder-dialog><form method="dialog"><div class="mobile-editor-head"><span><small>CHARACTER ORDER</small><b>캐릭터 위치 바꾸기</b></span><button value="close">×</button></div><p>화살표를 눌러 홈과 캐릭터 목록의 순서를 바꿔요.</p><div>${reorderRows}</div><button class="primary" value="close">완료</button></form></dialog>
    </section>
  </div>`;
}
function wardrobe(){
  const c=active(),owned=new Set(c.inventory?.fashion||[]);
  const items=(state.catalog?.fashion||[]).filter(item=>owned.has(item.id));
  const itemCard=item=>`<article class="closet-item-card" data-edit-clothing="${item.id}">${item.image?`<img src="${esc(item.image)}" alt="">`:`<span>👕</span>`}<div><b>${esc(item.name)}</b><small>${esc([item.category,item.ordinary,...(item.occasionTags||[]),...(item.colors||[])].filter(Boolean).join(" · "))}</small></div><button data-edit-clothing="${item.id}">편집</button></article>`;
  const outfitCard=outfit=>`<article class="saved-outfit-card"><div class="outfit-collage ${esc(outfit.layout||"cluster-1")}">${outfit.itemIds.map(id=>items.find(item=>item.id===id)).filter(Boolean).map(item=>item.image?`<img src="${esc(item.image)}" alt="">`:`<span>👕</span>`).join("")}</div><div><b>${esc(outfit.name)}</b><small>${esc((outfit.tags||[]).join(" · ")||"일상 코디")}</small></div><button data-edit-outfit="${outfit.id}">코디 편집</button></article>`;
  return `<section class="wardrobe-shell"><div class="wardrobe-character-strip panel">${state.order.map(id=>`<button data-wardrobe-character="${id}" class="${id===c.id?"on":""}">${avatar(state.characters[id])}<b>${esc(state.characters[id].name)}</b></button>`).join("")}</div><section class="panel closet-main"><div class="title"><div><h1>${esc(c.name)}의 옷장</h1><p>옷을 등록하고, 자주 입는 조합을 코디로 저장해요.</p></div><div><button data-new-clothing>+ 옷 등록</button><button class="primary" data-new-outfit>+ 코디 만들기</button></div></div><h2>보유한 옷</h2><div class="closet-items">${items.map(itemCard).join("")||"<div class='empty-mini'><b>아직 등록한 옷이 없어요.</b><p>옷은 이제 취향 사전이 아니라 이 옷장에서 직접 만들어요.</p></div>"}</div><div class="title outfit-section-title"><div><h2>저장한 코디</h2><p>레이아웃은 보기 방식이고, 실제 자동 코디는 상황·색·격식·패션 감각을 따져요.</p></div></div><div class="saved-outfits">${(c.savedOutfits||[]).map(outfitCard).join("")||"<div class='empty-mini'><b>저장한 코디가 없어요.</b><p>자주 입히고 싶은 옷 조합을 만들어 주세요.</p></div>"}</div></section></section>`;
}
function catalog(){
  const sections=Object.entries(CATALOG_LABELS).map(([kind,label])=>{
    const cards=(state.catalog?.[kind]||[]).map(item=>{
      const categories=kind==="movie"?Object.keys(VIDEO_GENRES):(CATALOG_CATEGORIES[kind]||[]);
      const custom=item.category&&!categories.includes(item.category)?[item.category]:[];
      const subgenres=kind==="movie"?(VIDEO_GENRES[item.category]||[]):kind==="perfume"?PERFUME_NOTES:kind==="weapon"?(WEAPON_SUBTYPES[item.category]||[]):(DETAIL_OPTIONS[kind]||[]);
      const detailEditor=kind==="perfume"?`<div class="chips"><b>향 계열 키워드 · 여러 개 선택 가능</b>${PERFUME_NOTES.map(x=>`<button data-catalog-keyword="${item.id}" data-kind="${kind}" data-value="${x}" class="${(item.keywords||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div>`:`<label>세부 항목<select data-catalog-field="subtype" data-kind="${kind}" data-item="${item.id}"><option value="">세부 항목 선택</option>${subgenres.map(x=>`<option ${x===item.subtype?"selected":""}>${esc(x)}</option>`).join("")}</select></label>`;
      const imageClass=item.imageSource==="app"?"catalog-app-art":"catalog-user-photo";
      return `<details class="catalog-dex-card"><summary>${item.image?`<img class="catalog-app-icon ${imageClass}" src="${esc(item.image)}" alt="">`:`<span class="catalog-app-icon">${CATALOG_ICONS[kind]||"📦"}</span>`}<b>${esc(item.name)}</b><small>${esc(item.category||label)}${item.subtype?` · ${esc(item.subtype)}`:""}</small></summary><div class="catalog-detail"><label>이름<input data-catalog-field="name" data-kind="${kind}" data-item="${item.id}" value="${esc(item.name)}"></label><label>분류<select data-catalog-field="category" data-kind="${kind}" data-item="${item.id}"><option value="">분류 선택</option>${[...custom,...categories].map(x=>`<option ${x===item.category?"selected":""}>${esc(x)}</option>`).join("")}</select></label>${detailEditor}<label class="catalog-illustration-field">이미지 링크<input data-catalog-field="image" data-kind="${kind}" data-item="${item.id}" value="${esc(item.image||"")}" placeholder="https://..."></label><div class="catalog-image-actions"><button type="button" class="catalog-illustration-picker" data-catalog-image="${item.id}" data-kind="${kind}">${item.imageSource==="app"&&item.image?`<img src="${esc(item.image)}" alt=""><span>앱 일러스트 바꾸기</span>`:`<span class="catalog-illustration-placeholder">✦</span><span>앱 일러스트 고르기</span>`}<small>게임에서 제공하는 투명 일러스트</small></button><button type="button" class="catalog-photo-picker" data-catalog-photo="${item.id}" data-kind="${kind}">${item.imageSource!=="app"&&item.image?`<img src="${esc(item.image)}" alt=""><span>첨부 사진 바꾸기</span>`:`<span class="catalog-illustration-placeholder">＋</span><span>사진 첨부하기</span>`}<small>내 사진은 둥근 썸네일로 표시돼요</small></button></div>${kind==="food"?`<label>맵기<select data-catalog-field="spicy" data-kind="${kind}" data-item="${item.id}">${levelOptions(SPICE_LEVELS,item.spicy??0)}</select></label><label>달기<select data-catalog-field="sweet" data-kind="${kind}" data-item="${item.id}">${levelOptions(SWEET_LEVELS,item.sweet??0)}</select></label>`:""}${["music","idol","book","movie","game"].includes(kind)?`<label>아티스트·제작자<input data-catalog-field="creator" data-kind="${kind}" data-item="${item.id}" value="${esc(item.creator||"")}"></label>`:""}<button class="danger" data-delete-catalog="${item.id}" data-kind="${kind}">항목 삭제</button></div></details>`;
    }).join("")||"<p>아직 등록된 항목이 없어요.</p>";
    return `<section class="catalog-kind catalog-section"><div class="title"><h2>${label}</h2><button data-add-catalog="${kind}">+ 추가</button></div><div class="catalog-dex-grid">${cards}</div></section>`;
  }).join("");
  return `<section class="panel form catalog-shell"><div class="title"><div><h1>세계관 취향 도감</h1><p>아이콘을 누르면 세부 정보와 편집 항목이 열려요.</p></div><button class="primary" data-catalog-save>도감 저장</button></div>${sections}</section>`;
}
const relationActivities=()=> "";
const CHARACTER_VIEW_OPTIONS={
  overall:["정하지 않음","낯선 사람으로 여김","매우 싫어함","미워함","경계함","불편해함","부담스러워함","경쟁심을 느낌","애증을 느낌","그저 그런 사람","흥미롭게 여김","인간적인 호감이 있음","친구로 좋아함","존경함","동경함","안쓰럽게 여김","소중하게 여김","연애 감정이 싹틈","연애 감정으로 좋아함","깊이 사랑함","없어서는 안 될 사람"],
  awareness:["정하지 않음","자기 감정을 분명히 자각함","감정을 어렴풋이 느낌","감정을 우정으로 착각함","감정을 경쟁심으로 착각함","감정을 불편함으로 착각함","자기 감정을 전혀 모름","느끼는 감정을 부정함"],
  mutualAwareness:["정하지 않음","상대의 마음을 전혀 모름","상대의 마음을 어렴풋이 눈치챔","상대가 느끼는 감정을 알고 있음","서로의 마음을 확인함","상대의 마음을 오해하고 있음"],
  trust:["정하지 않음","전혀 믿지 않음","의심함","조심스럽게 지켜봄","보통","어느 정도 믿음","깊이 신뢰함","전적으로 의지함"],
  fear:["설정하지 않음","가소로움","전혀 두렵지 않음","거의 두렵지 않음","조금 두려움","경계하며 두려워함","많이 두려움","공포를 느낌","극도로 두려워함"],
  closeness:["정하지 않음","남보다도 멂","낯선 사이","거리감 있음","보통","편한 사이","가까운 사이","가장 가까운 사람"],
  comfort:["정하지 않음","함께 있으면 매우 불편하고 대화도 전혀 통하지 않음","같은 공간에서는 숨 막히지만 농담과 장난은 잘 통함","공간 공유는 불편하지만 대화는 편안함","긴장하고 대화도 조심스러움","어색하지만 필요한 대화는 무난함","함께 있는 건 편하지만 대화 호흡은 평범함","편안하고 농담과 장난이 잘 통함","말없이 함께 있어도 편안함","공간도 대화도 완벽하게 편안함"],
  annoyance:["정하지 않음","전혀 귀찮거나 성가시지 않음","전혀 귀찮거나 성가시지 않지만 성가시다고 말함","가끔 성가심","종종 귀찮음","많이 귀찮고 성가심","보기만 해도 피곤함"],
  attention:["정하지 않음","관심 없음","필요할 때만 봄","종종 신경 씀","자주 살핌","늘 최우선으로 챙김"],
  jealousy:["정하지 않음","질투하지 않음","가끔 신경 쓰임","은근히 질투함","질투가 심함","독점하고 싶어 함"],
  conflictIntensity:["정하지 않음","갈등이 거의 없음","가끔 부딪힘","자주 충돌함","격렬하게 충돌함","파국적인 충돌을 반복함"],
  expectation:["정하지 않음","언제든 끝날 수 있다고 생각함","곧 헤어질 거라고 예상함","당분간 이어질 거라 생각함","오래 함께할 거라 기대함","평생 이어질 관계라고 믿음"],
  touchIntensity:["정하지 않음","신체 접촉 없음","인사·부축 같은 의례적 접촉만","손잡기·팔짱까지","포옹·기대기까지","가벼운 입맞춤까지","깊은 입맞춤까지","성인 간 친밀한 접촉까지"],
  aggression:["정하지 않음","공격 충동 없음","거친 말을 하고 싶은 충동","몸으로 밀어내고 싶은 충동","해치고 싶은 충동","죽이고 싶을 만큼 격한 충동"],
  aggressionAction:["정하지 않음","행동으로 옮기지 않음","대부분 참지만 가끔 거친 말이 나옴","거친 말로만 표출함","물건이나 벽에 화풀이할 수 있음","상대를 때릴 수 있음","실제로 때릴 수 있음","심한 폭력을 행사할 수 있음"]
};
function overallViewPhrase(value){
  const phrases={
    "정하지 않음":"아직 어떤 사람인지 판단하지 않음",
    "선택하지 않음":"아직 어떤 사람인지 판단하지 않음",
    "낯선 사람으로 여김":"낯선 사람으로 여김",
    "매우 싫어함":"매우 싫어함",
    "미워함":"미워함",
    "경계함":"경계함",
    "불편해함":"불편해함",
    "부담스러워함":"부담스러워함",
    "경쟁심을 느낌":"상대로 경쟁심을 느낌",
    "애증을 느낌":"향해 애정과 미움을 함께 느낌",
    "그저 그런 사람":"그저 그런 사람으로 여김",
    "흥미롭게 여김":"흥미로운 사람으로 여김",
    "인간적인 호감이 있음":"인간적으로 호감 있게 여김",
    "친구로 좋아함":"친구로서 좋아함",
    "존경함":"존경함",
    "동경함":"동경함",
    "안쓰럽게 여김":"안쓰럽게 여김",
    "소중하게 여김":"소중하게 여김",
    "연애 감정이 싹틈":"연애 감정으로 의식하기 시작함",
    "연애 감정으로 좋아함":"연애 감정으로 좋아함",
    "깊이 사랑함":"깊이 사랑함",
    "없어서는 안 될 사람":"없어서는 안 될 사람으로 여김"
  };
  return phrases[value]||String(value||"어떤 사람인지 판단하지 않음");
}
const characterViewOptions=key=>{
  if(key==="importance")return["선택하지 않음",...state.order.map((_,index)=>`${index+1}순위${index===0?" · 가장 중요한 사람":""}`)];
  return (CHARACTER_VIEW_OPTIONS[key]||[]).map(value=>value==="정하지 않음"?"선택하지 않음":value);
};
const characterViewEditor=()=>{
  const sourceId=state.order.includes(state.characterViewSource)?state.characterViewSource:state.order[0];
  const targetIds=state.order.filter(id=>id!==sourceId);
  const targetId=targetIds.includes(state.characterViewTarget)?state.characterViewTarget:targetIds[0];
  const source=state.characters[sourceId],target=state.characters[targetId];
  const field=(sourceId,targetId,key,label,help)=>{
    const effective=characterViewFor(sourceId,targetId);
    const current=key==="fear"
      ?(["", "정하지 않음", "선택하지 않음"].includes(effective[key]||"")?"설정하지 않음":effective[key])
      :(effective[key]==="정하지 않음"?"선택하지 않음":(effective[key]||"선택하지 않음"));
    let options=characterViewOptions(key);
    const minorPair=[sourceId,targetId].some(id=>["영아","유아","어린이","청소년"].includes(state.characters[id]?.ageGroup));
    if(key==="touchIntensity"&&minorPair)options=options.filter(value=>value!=="성인 간 친밀한 접촉까지");
    const legacy=current!=="선택하지 않음"&&!options.includes(current)?[current]:[];
    return `<label class="${key==="aggressionAction"?"view-aggression-action":""}"><span><b>${label}</b><small>${help}</small></span><select data-character-view data-source="${sourceId}" data-target="${targetId}" data-view-field="${key}">${[...legacy,...options].map(value=>`<option ${value===current?"selected":""}>${value}</option>`).join("")}</select>${key==="aggressionAction"?`<small class="field-warning">‘상대를 때릴 수 있음’ 이상을 고르면 설정한 충동·갈등·성격에 따라 낮은 수위의 폭행 장면이 나올 수 있어요. 충동만 있고 실행하지 않는 캐릭터는 반드시 ‘행동으로 옮기지 않음’을 골라 주세요.</small>`:""}</label>`;
  };
  if(!source||!target)return `<section class="character-view-editor"><h2>관계와 캐릭터별 시선</h2><p>시선을 설정하려면 캐릭터가 두 명 이상 필요해요.</p><button data-add-rel>+ 공식 관계 설정</button></section>`;
  const official=Object.values(state.relationships||{}).filter(relation=>(relation.a===sourceId&&relation.b===targetId)||(relation.a===targetId&&relation.b===sourceId));
  const officialText=[...new Set(official.map(relation=>currentOfficialLabel(relation)))].join(" · ");
  const overall=characterViewFor(sourceId,targetId).overall;
  const fields=`${field(sourceId,targetId,"overall","전체적인 감정","공식 관계와 별개인 이 캐릭터만의 속마음")}${field(sourceId,targetId,"importance","중요도","이 캐릭터의 삶에서 상대가 몇 번째로 중요한 사람인지 정해요.")}${field(sourceId,targetId,"awareness","감정 자각","자기 마음을 우정·경쟁심·불편함으로 잘못 해석할 수도 있어요.")}${field(sourceId,targetId,"mutualAwareness","상대의 마음을 아는 정도","상대의 감정이 호감인지 반감인지 단정하지 않고, 얼마나 파악하고 있는지만 정해요.")}${field(sourceId,targetId,"trust","신뢰","좋아하더라도 믿지 않을 수 있어요")}${field(sourceId,targetId,"fear","두려움 정도","상대를 얼마나 우습게 보거나 두려워하는지 강도를 정해요.")}${field(sourceId,targetId,"closeness","정서적 친밀감","상대를 자기 삶의 얼마나 안쪽 사람으로 느끼는지예요.")}${field(sourceId,targetId,"comfort","함께 있을 때의 편안함과 대화 호흡","공간을 함께 쓸 때의 편안함과 둘 사이의 말·농담 호흡을 정해요.")}${field(sourceId,targetId,"annoyance","성가심","좋아하고 사랑하면서도 많이 귀찮아할 수 있어요.")}${field(sourceId,targetId,"attention","챙기고 신경 쓰는 정도","상태와 일정을 얼마나 살필지")}${field(sourceId,targetId,"jealousy","질투·독점욕","사랑과 별개로 정해요.")}${field(sourceId,targetId,"conflictIntensity","갈등 강도","사랑이나 가족애와 별개인 실제 충돌 강도예요.")}${field(sourceId,targetId,"expectation","관계에 대한 기대","이 관계가 얼마나 이어질 거라 생각하는지 정해요.")}${field(sourceId,targetId,"touchIntensity","허용하고 표현하는 스킨십 범위","두 캐릭터의 범위가 다르면 더 낮은 쪽까지만 반영돼요.")}${field(sourceId,targetId,"aggression","공격·위해 충동","충동만으로 실제 공격하지 않아요.")}${field(sourceId,targetId,"aggressionAction","충동을 실제로 표현하는 단계","충동 단계보다 센 행동은 절대 나오지 않아요.")}`;
  const personOptions=(ids,selectedId)=>ids.map(id=>`<option value="${id}" ${id===selectedId?"selected":""}>${esc(state.characters[id].name)}</option>`).join("");
  const sourceParticle=subjectText(source.name).slice(source.name.length);
  const targetParticle=objectText(target.name).slice(target.name.length);
  return `<section class="character-view-editor" style="--relationship-own:${esc(source.theme?.primary||"#176b60")};--relationship-own-secondary:${esc(source.theme?.secondary||source.theme?.primary||"#176b60")}"><div class="title"><div><h2>관계와 캐릭터별 시선</h2><p>두 이름을 눌러 누구의 마음이 누구에게 향하는지 고르세요.</p></div></div>
    <div class="relationship-pair-magnet">
      <div class="relationship-pair-core">
        <small class="relationship-direction-help">선택한 방향의 마음</small>
        <div class="relationship-selected-pair" aria-hidden="true">${avatar(source)}<i>→</i>${avatar(target)}</div>
        <div class="relationship-direction-sentence" data-view-summary="${sourceId}:${targetId}">
          <label><span class="sr-only">마음을 보는 사람</span><select data-view-source aria-label="마음을 보는 사람">${personOptions(state.order,sourceId)}</select><b>${esc(sourceParticle)}</b></label>
          <label><span class="sr-only">마음의 대상</span><select data-view-target aria-label="마음의 대상">${personOptions(targetIds,targetId)}</select><b>${esc(targetParticle)}</b></label>
          <strong>${esc(overallViewPhrase(overall))}</strong>
        </div>
        <span>${officialText?`공식 관계 · ${esc(officialText)}`:"공식 관계 없음 · 이방인"}</span>
        <em>${esc(relationshipReality(sourceId,targetId,official))}</em>
        <button type="button" class="primary" data-open-view-dialog="${sourceId}:${targetId}">이 시선 편집하기</button>
        <button type="button" data-add-rel>+ 공식 관계 설정</button>
        <button type="button" data-open-official-relations>공식 관계 목록</button>
        <button type="button" data-open-relationship-map>관계도 보기</button>
      </div>
    </div>
    <dialog class="character-view-dialog" data-view-dialog="${sourceId}:${targetId}"><form method="dialog"><div class="title character-view-dialog-title"><div class="character-view-dialog-direction">${avatar(source)}<i>→</i>${avatar(target)}<span><h2>${esc(source.name)} → ${esc(target.name)}</h2><small>${esc(subjectText(source.name))} ${esc(objectText(target.name))} 바라보는 감정과 행동 기준</small></span></div><button value="close" aria-label="닫기">×</button></div><div class="character-view-dialog-context"><b>${officialText?`공식 관계 · ${esc(officialText)}`:"공식 관계 없음 · 이방인"}</b><span>${esc(overall)}</span></div><div class="character-view-fields">${fields}</div><div class="crop-actions"><button type="button" data-reset-character-view="${sourceId}:${targetId}">이 시선 초기화</button><button class="primary" value="close">편집 완료</button></div></form></dialog>
  </section>`;
};
const relationPairKey=(a,b)=>[a,b].sort().join("~");
function siblingWord(relation){
  const ids=relation.groupMembers?.length?relation.groupMembers:[relation.a,relation.b];
  const genders=[...new Set(ids.map(id=>state.characters[id]?.gender).filter(Boolean))];
  const base=genders.length===1&&genders[0]==="남성"?"형제":genders.length===1&&genders[0]==="여성"?"자매":genders.every(value=>["남성","여성"].includes(value))?"남매":"형제·자매";
  const pairs=ids.flatMap((a,index)=>ids.slice(index+1).map(b=>relation.siblingKinshipByPair?.[relationPairKey(a,b)]||"full"));
  return pairs.length&&pairs.every(value=>value==="nonblood")?`의${base}`:base;
}
function currentOfficialLabel(relation){
  const base=relation.type==="형제·자매"?siblingWord(relation):relation.type;
  if(relation.temporalStatus==="past"){
    const past={연인:"헤어진 연인",부부:"이혼한 부부",친구:"절연한 친구","소꿉친구":"멀어진 소꿉친구","학창 시절 친구들":"멀어진 학창 시절 친구","직장 동료":"전 직장 동료",동거인:"옛 동거인","부모·자녀":"절연한 부모·자녀","형제·자매":`절연한 ${base}`,라이벌:"과거의 라이벌",혐관:"과거의 악연"};
    return past[relation.type]||`과거의 ${base}`;
  }
  return relation.legalStatus==="관계를 따로 명명하지 않음"?`유사 ${base}`:base;
}
function relationshipReality(a,b,official=[]){
  const av=characterViewFor(a,b),bv=characterViewFor(b,a);
  const love=value=>/연애 감정|깊이 사랑|없어서는|사랑함/.test(value?.overall||"");
  const hate=value=>/싫|혐오|증오|원수/.test(value?.overall||"");
  const distant=value=>/낯선|거리|가깝지|가장 바깥/.test(value?.closeness||"")||/매우 불편|숨막|대화도.*통하지/.test(value?.comfort||"");
  const close=value=>/가장 가까운|가까운 사이|친한 사이/.test(value?.closeness||"");
  const distrust=value=>/믿지|의심|경계/.test(value?.trust||"");
  const confirmed=value=>/서로의 마음을 확인/.test(value?.mutualAwareness||"");
  const conflict=value=>/자주 충돌|격렬|파국/.test(value?.conflictIntensity||"");
  const guarded=value=>distrust(value)||distant(value)||hate(value)||/경계|탐탁지|꺼림/.test(`${value?.overall||""} ${value?.comfort||""} ${value?.annoyance||""}`);
  const past=official.some(relation=>relation.temporalStatus==="past");
  const sibling=official.some(relation=>relation.type==="형제·자매");
  if(sibling&&(distant(av)||distant(bv)||hate(av)||hate(bv)))return past?"절연한 형제 사이":"가족이지만 사실상 절연";
  if(love(av)&&love(bv)&&confirmed(av)&&confirmed(bv))return distant(av)||distant(bv)?"서로 사랑하지만 가까워지기 어려운 사이":"서로 마음을 확인한 사이";
  if(love(av)&&love(bv)){
    const denied=value=>/인정하지|오해하고|눈치챔|전혀 모름/.test(value?.mutualAwareness||"")||/부정|잘못 해석/.test(value?.awareness||"");
    if(denied(av)&&denied(bv))return"쌍방 연심이지만 인정하지 않음";
    if(hate(av)&&hate(bv))return"서로 반감을 품고도 끌리는 사이";
    return distrust(av)||distrust(bv)?"쌍방 연심과 불신이 함께 있는 사이":"쌍방 짝사랑";
  }
  if(love(av)!==love(bv))return"한쪽만 품고 있는 연심";
  if(hate(av)&&hate(bv))return conflict(av)||conflict(bv)?"서로 강하게 맞서는 사이":"서로 반감을 품은 사이";
  if(guarded(av)&&guarded(bv))return conflict(av)||conflict(bv)?"서로 경계하며 충돌하는 사이":"서로 믿지 않고 거리를 두는 사이";
  if(distrust(av)&&distrust(bv))return"서로 믿지 못하는 사이";
  if(guarded(av)!==guarded(bv))return"한쪽은 가까워지고 한쪽은 경계하는 사이";
  if(close(av)&&close(bv))return"서로 의지하는 사이";
  if(distant(av)&&distant(bv))return past?"이름만 남은 관계":"서로 거리를 두는 사이";
  if(close(av)!==close(bv))return"한쪽만 관계를 붙잡는 중";
  if(official.some(relation=>["연인","부부"].includes(relation.type)))return"서로 연애감정을 나누는 사이";
  if(official.some(relation=>["친구","소꿉친구","학창 시절 친구들","친구 모임"].includes(relation.type)))return"편안한 친구 사이";
  if(official.some(relation=>relation.type==="동거인"))return"생활을 함께 나누는 사이";
  return official.length?"관계에 맞춰 지내는 사이":"서로를 알아가는 중";
}
function relationshipMap(relations){
  let characters=state.order.map(id=>state.characters[id]).filter(Boolean);
  if(characters.length<2)return"";
  if(characters.length===2){
    const ids=characters.map(character=>character.id);
    const orderedRelation=relations.find(relation=>Array.isArray(relation.displayOrder)
      &&relation.displayOrder.length===2
      &&relation.displayOrder.every(id=>ids.includes(id)));
    if(orderedRelation)characters=orderedRelation.displayOrder.map(id=>state.characters[id]).filter(Boolean);
  }
  const positions=new Map(characters.map((character,index)=>{
    if(characters.length===2)return [character.id,{x:index===0?235:765,y:500}];
    const angle=(Math.PI*2*index/characters.length)-Math.PI/2;
    return [character.id,{x:500+400*Math.cos(angle),y:500+400*Math.sin(angle)}];
  }));
  const emotionColor=value=>{
    const text=String(value||"");
    if(/없어서는 안 될|깊이 사랑|사랑함|애틋|강한 사랑/.test(text))return"#EA69A4";
    if(/연애 감정|연심|끌림|싹틈|약한 사랑/.test(text))return"#FF97C7";
    if(/친구로 좋아|인간적인 호감|소중하게|친근|우호/.test(text))return"#4AA3DF";
    if(/싫|혐오|원수|증오/.test(text))return"#a83f3f";
    if(/경계|의심|불편|귀찮/.test(text))return"#c27a2c";
    if(/두려|무서|겁/.test(text))return"#7b5bb5";
    if(/신뢰|편안|친근|가까/.test(text))return"#438b72";
    if(/존경|동경/.test(text))return"#4f77b8";
    return"#7d756d";
  };
  const loveTier=value=>{
    const text=String(value||"");
    if(/없어서는 안 될|깊이 사랑|사랑함|애틋|강한 사랑/.test(text))return"strong";
    if(/연애 감정|연심|끌림|싹틈|약한 사랑/.test(text))return"weak";
    return"";
  };
  const edges=[];
  for(let i=0;i<characters.length;i++)for(let j=i+1;j<characters.length;j++){
    const a=characters[i].id,b=characters[j].id;
    const official=relations.filter(relation=>(relation.a===a&&relation.b===b)||(relation.a===b&&relation.b===a));
    const hasExplicit=Object.keys(explicitCharacterViewFor(a,b)).length>0||Object.keys(explicitCharacterViewFor(b,a)).length>0;
    if(official.length||hasExplicit)edges.push({a,b,official});
  }
  if(!edges.length)return"";
  const viewLabel=(source,target)=>characterViewFor(source,target).overall;
  const occupiedLabels=[];
  const placeLabel=(x,y,nx,ny)=>{
    let point={x,y};
    for(let attempt=0;attempt<8;attempt++){
      const hitsLabel=occupiedLabels.some(other=>Math.abs(other.x-point.x)<105&&Math.abs(other.y-point.y)<30);
      const hitsNode=[...positions.values()].some(node=>Math.hypot(node.x-point.x,node.y-point.y)<82);
      if(!hitsLabel&&!hitsNode)break;
      const direction=attempt%2===0?1:-1,distance=(Math.floor(attempt/2)+1)*34;
      point={x:Math.max(70,Math.min(930,x+nx*distance*direction)),y:Math.max(70,Math.min(930,y+ny*distance*direction))};
    }
    occupiedLabels.push(point);
    return point;
  };
  const lines=edges.map((edge,index)=>{
    const a=positions.get(edge.a),b=positions.get(edge.b);
    const forwardLabel=viewLabel(edge.a,edge.b),backwardLabel=viewLabel(edge.b,edge.a);
    const forwardColor=emotionColor(forwardLabel),backwardColor=emotionColor(backwardLabel);
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.max(1,Math.hypot(dx,dy)),unitX=dx/length,unitY=dy/length,normalX=-unitY,normalY=unitX,nodeRadius=characters.length===2?86:64,lane=12;
    const startA={x:a.x+unitX*nodeRadius+normalX*lane,y:a.y+unitY*nodeRadius+normalY*lane},endB={x:b.x-unitX*nodeRadius+normalX*lane,y:b.y-unitY*nodeRadius+normalY*lane};
    const startB={x:b.x-unitX*nodeRadius-normalX*lane,y:b.y-unitY*nodeRadius-normalY*lane},endA={x:a.x+unitX*nodeRadius-normalX*lane,y:a.y+unitY*nodeRadius-normalY*lane};
    const arrowLength=11,arrowHalfWidth=5,minimumArrowLength=185,availableLength=Math.max(0,length-(nodeRadius*2)),curved=availableLength<minimumArrowLength;
    const midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;
    const bend=curved?Math.max(76,Math.sqrt(Math.max(0,minimumArrowLength**2-availableLength**2))*.82)+(index%3)*18:0;
    const forwardControl={x:midX+normalX*bend,y:midY+normalY*bend},backwardControl={x:midX-normalX*bend,y:midY-normalY*bend};
    const forwardTangent=curved?{x:endB.x-forwardControl.x,y:endB.y-forwardControl.y}:{x:unitX,y:unitY};
    const backwardTangent=curved?{x:endA.x-backwardControl.x,y:endA.y-backwardControl.y}:{x:-unitX,y:-unitY};
    const normalizeVector=vector=>{const size=Math.max(1,Math.hypot(vector.x,vector.y));return{x:vector.x/size,y:vector.y/size}};
    const ft=normalizeVector(forwardTangent),bt=normalizeVector(backwardTangent),fn={x:-ft.y,y:ft.x},bn={x:-bt.y,y:bt.x};
    const forwardBase={x:endB.x-ft.x*arrowLength,y:endB.y-ft.y*arrowLength},backwardBase={x:endA.x-bt.x*arrowLength,y:endA.y-bt.y*arrowLength};
    const forward=curved?`M ${startA.x} ${startA.y} Q ${forwardControl.x} ${forwardControl.y} ${forwardBase.x} ${forwardBase.y}`:`M ${startA.x} ${startA.y} L ${forwardBase.x} ${forwardBase.y}`;
    const backward=curved?`M ${startB.x} ${startB.y} Q ${backwardControl.x} ${backwardControl.y} ${backwardBase.x} ${backwardBase.y}`:`M ${startB.x} ${startB.y} L ${backwardBase.x} ${backwardBase.y}`;
    const forwardArrow=`${endB.x},${endB.y} ${forwardBase.x+fn.x*arrowHalfWidth},${forwardBase.y+fn.y*arrowHalfWidth} ${forwardBase.x-fn.x*arrowHalfWidth},${forwardBase.y-fn.y*arrowHalfWidth}`;
    const backwardArrow=`${endA.x},${endA.y} ${backwardBase.x+bn.x*arrowHalfWidth},${backwardBase.y+bn.y*arrowHalfWidth} ${backwardBase.x-bn.x*arrowHalfWidth},${backwardBase.y-bn.y*arrowHalfWidth}`;
    const pathPoint=(start,control,end)=>curved?{x:start.x*.25+control.x*.5+end.x*.25,y:start.y*.25+control.y*.5+end.y*.25}:{x:(start.x+end.x)/2,y:(start.y+end.y)/2};
    const forwardHeart=pathPoint(startA,forwardControl,forwardBase),backwardHeart=pathPoint(startB,backwardControl,backwardBase);
    const hearts=`${loveTier(forwardLabel)?`<text class="map-heart ${loveTier(forwardLabel)}" x="${forwardHeart.x}" y="${forwardHeart.y+7}" text-anchor="middle" style="fill:${forwardColor}">♥</text>`:""}${loveTier(backwardLabel)?`<text class="map-heart ${loveTier(backwardLabel)}" x="${backwardHeart.x}" y="${backwardHeart.y+7}" text-anchor="middle" style="fill:${backwardColor}">♥</text>`:""}`;
    const compactMapLabel=(value,max)=>String(value||"").length>max?`${String(value).slice(0,max-1)}…`:String(value||"");
    const relationText=compactMapLabel(edge.official.length?[...new Set(edge.official.map(currentOfficialLabel))].join(" · "):"이방인",14);
    const stageText=compactMapLabel(relationshipReality(edge.a,edge.b,edge.official),19);
    const labelOffset=curved?Math.min(128,bend*.58):58;
    const officialPoint=placeLabel(midX+normalX*labelOffset,midY+normalY*labelOffset,normalX,normalY);
    const boxWidth=Math.min(220,Math.max(100,(Math.max(relationText.length,stageText.length)*13)+24));
    const officialMarkup=`<g class="map-official"><text class="map-relation" x="${officialPoint.x}" y="${officialPoint.y-5}" text-anchor="middle">${esc(relationText||"이방인")}</text><text class="map-stage" x="${officialPoint.x}" y="${officialPoint.y+14}" text-anchor="middle">${esc(stageText)}</text></g>`;
    return `<g class="relationship-edge"><g class="map-arrows"><path d="${forward}" fill="none" stroke="${forwardColor}" stroke-width="3.5" stroke-linecap="round"/><polygon points="${forwardArrow}" fill="${forwardColor}"/><path d="${backward}" fill="none" stroke="${backwardColor}" stroke-width="3.5" stroke-linecap="round"/><polygon points="${backwardArrow}" fill="${backwardColor}"/>${hearts}</g>${officialMarkup}</g>`;
  }).join("");
  const mapNodeSize=characters.length===2?180:136;
  const nodes=characters.map(character=>{const pos=positions.get(character.id);return `<foreignObject x="${pos.x-mapNodeSize/2}" y="${pos.y-mapNodeSize/2}" width="${mapNodeSize}" height="${mapNodeSize}"><div xmlns="http://www.w3.org/1999/xhtml" class="relationship-map-node ${characters.length===2?"map-node-pair":""}">${avatar(character)}<b>${esc(character.name)}</b></div></foreignObject>`}).join("");
  return `<section class="relationship-map"><div class="relationship-map-scroll"><div class="relationship-map-canvas"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">${lines}${nodes}</svg></div></div></section>`;
}
function relationship(){
  const all=Object.values(state.relationships),shownGroups=new Set();
  const displayType=currentOfficialLabel;
  const cards=all.map(r=>{
    if(r.groupId){
      if(shownGroups.has(r.groupId))return"";shownGroups.add(r.groupId);
      const group=all.filter(x=>x.groupId===r.groupId);
      const memberIds=[...new Set(group.flatMap(x=>[x.a,x.b]))];
      const orderedIds=Array.isArray(r.displayOrder)&&r.displayOrder.length===memberIds.length&&r.displayOrder.every(id=>memberIds.includes(id))?r.displayOrder:memberIds;
      const members=orderedIds.map(id=>state.characters[id]).filter(Boolean);
      const direction=r.type==="짝사랑"?`${[...new Set(group.map(x=>state.characters[x.admirerId||x.a]?.name).filter(Boolean))].map(esc).join(" · ")} → ${[...new Set(group.map(x=>state.characters[x.targetId||x.b]?.name).filter(Boolean))].map(esc).join(" · ")}`:r.type==="부모·자녀"?`${[...new Set(group.map(x=>`${state.characters[x.parentId||x.a]?.name||"부모"}(${x.parentRole||"부모"})`))].map(esc).join(" · ")} → ${[...new Set(group.map(x=>state.characters[x.childId||x.b]?.name).filter(Boolean))].map(esc).join(" · ")}`:members.map(member=>esc(member.name)).join(" · ");
      return `<article class="relation group-relation"><div class="relation-avatars">${members.map(member=>avatar(member)).join("")}</div><h2>${direction}</h2><p>${esc(displayType(r))} · ${members.length}명이 함께 맺은 관계</p><p class="relation-stage">${r.temporalStatus==="past"?"과거 관계 · ":""}${esc(r.stage||"편안한 사이")}</p>${r.temporalStatus==="past"&&r.faultReason&&r.faultReason!=="정하지 않음"?`<p class="relation-fault">관계가 끝난 이유 · ${esc(r.faultReason)}</p>`:""}${relationActivities(r)}<div class="relation-actions"><button data-edit-rel="${r.id}">구성원·관계 편집</button><button class="danger" data-delete-group="${r.groupId}">그룹 관계 삭제</button></div></article>`;
    }
    const orderedIds=!r.directional&&Array.isArray(r.displayOrder)&&r.displayOrder.length===2?r.displayOrder:[r.a,r.b];
    const a=state.characters[orderedIds[0]],b=state.characters[orderedIds[1]];
    const heading=r.type==="부모·자녀"?`${esc(state.characters[r.parentId||r.a]?.name||a?.name||"부모")}(${esc(r.parentRole||"부모")}) → ${esc(state.characters[r.childId||r.b]?.name||b?.name||"자녀")}`:`${esc(a?.name||"")} ${r.type==="짝사랑"?"→":"×"} ${esc(b?.name||"")}`;
    return a&&b?`<article class="relation"><div class="relation-avatars">${avatar(a)}${avatar(b)}</div><h2>${heading}</h2><p>${esc(displayType(r))} · ${r.cohabit?"함께 거주":"따로 거주"}</p><p class="relation-stage">${r.temporalStatus==="past"?"과거 관계 · ":""}${esc(r.stage||"편안한 사이")}</p><p class="relation-reality">관계 실체 · ${esc(relationshipReality(r.a,r.b,[r]))}</p>${r.temporalStatus==="past"&&r.faultReason&&r.faultReason!=="정하지 않음"?`<p class="relation-fault">관계가 끝난 이유 · ${esc(r.faultReason)}</p>`:""}${relationActivities(r)}<div class="relation-actions"><button data-edit-rel="${r.id}">편집</button><button class="danger" data-delete-rel="${r.id}">삭제</button></div></article>`:"";
  }).join("");
  const map=relationshipMap(all);
  const emptyCards='<div class="empty-mini"><b>아직 설정한 공식 관계가 없어요.</b><p>공식 관계가 없는 캐릭터끼리는 서로 낯선 사람으로 행동해요.</p></div>';
  return `<section class="panel form relationship-page"><div class="title"><h1>관계</h1></div><p>공식 관계와 각 캐릭터의 서로 다른 속마음을 한 화면에서 설정해요. 설정한 시선은 생활 장면의 말투, 접근 방식, 접촉과 갈등에 반영돼요.</p>${characterViewEditor()}<dialog class="official-relation-dialog" data-official-relation-dialog><form method="dialog"><div class="relationship-map-dialog-head"><span><small>OFFICIAL RELATIONSHIPS</small><h2>공식 관계 목록</h2></span><button value="close" aria-label="닫기">×</button></div><p>관계를 눌러 구성과 단계를 편집하거나 삭제할 수 있어요.</p><div class="relationship-card-grid">${cards||emptyCards}</div><button class="primary official-relation-dialog-close" value="close">닫기</button></form></dialog><dialog class="relationship-map-dialog" data-relationship-map-dialog><form method="dialog"><div class="relationship-map-dialog-head"><span><small>RELATIONSHIP MAP</small><h2>인물 관계도</h2></span><button value="close" aria-label="닫기">×</button></div><p>화살표 색은 각 캐릭터가 상대를 보는 감정 방향을 나타냅니다. 사랑하는 감정의 화살표에는 하트가 표시돼요.</p><div class="relationship-color-legend"><span class="friendly">친구·우호</span><span class="romantic">약한 사랑</span><span class="love">강한 사랑</span></div><div class="relationship-map-actions"><button type="button" data-refresh-relationship-map>현재 설정으로 새로고침</button><button type="button" data-export-relationship-map>PNG로 저장</button></div>${map||"<div class='empty-mini'>표시할 관계가 아직 없어요.</div>"}</form></dialog></section>`;
}
function routine(){
  const c=active(),days=["일","월","화","수","목","금","토"],items=(state.routines[c.id]||[]).slice().sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start));
  const places=state.towns.flatMap(t=>(t.id===state.activeTownId?state.world.places:t.places).map(p=>({...p,townName:t.name})));
  const toolbar=`<div class="routine-toolbar">${state.order.map(id=>`<button data-routine-character="${id}" class="${id===c.id?"on":""}">${avatar(state.characters[id])}${esc(state.characters[id].name)}</button>`).join("")}</div>`;
  const table=`<div class="weekly-scroll"><div class="weekly-table">${days.map((day,index)=>`<section class="routine-day"><h3>${day}요일</h3>${items.filter(item=>item.day===index).map(item=>`<article class="routine-block"><b>${esc(item.start)}–${esc(item.end)}</b><strong>${esc(item.title)}</strong><small>${esc(item.type)}${item.placeId?` · ${esc(places.find(p=>p.id===item.placeId)?.name||"장소")}`:""}${item.withIds?.length?` · ${item.withIds.map(id=>esc(state.characters[id]?.name||"")).filter(Boolean).join(", ")}와 함께`:""}</small><div class="routine-actions"><button data-edit-routine="${item.id}">편집</button><button class="danger" data-delete-routine="${item.id}">삭제</button></div></article>`).join("")||"<small>일정 없음</small>"}</section>`).join("")}</div></div>`;
  return `<section class="panel form routine-shell"><div class="title"><div><h1>주간 루틴</h1><p>회사 일정, 수업, 데이트, 약속과 개인 일정을 시간표로 지정할 수 있어요.</p></div><button class="primary" data-add-routine>+ 일정 추가</button></div>${toolbar}${table}</section>`;
}
function town(){const items=catalogItems(),audiences=["아재 입맛","어린이 입맛","가족","연인·데이트","학생","고소득","오타쿠"];return `<div class="town-tabs">${state.towns.map(t=>`<button data-town-select="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}<button data-add-town>+ 마을 추가</button>${state.towns.length>1?`<button class="danger" data-delete-town="${state.activeTownId}">현재 마을 삭제</button>`:""}</div><div class="town-edit"><div class="town-map-scroll"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}${state.world.places.map(peopleAtPlaceCard).join("")}${townHomes().map(peopleAtHomeCard).join("")}</div></div><aside class="panel form"><div class="title"><h2>마을 편집</h2><button class="primary" data-town-save>마을 저장</button></div><section class="inline-guide"><b>마을을 만드는 순서</b><ol><li>마을 이름과 배경을 고르세요.</li><li>건물을 추가하고 유형을 고르세요.</li><li>‘건물 모양 선택’에서 추천 그림을 적용하세요.</li><li>지도 위 건물과 집을 직접 끌어 위치를 정하세요.</li></ol></section><label>마을 이름<input data-world-name value="${esc(state.world.name)}"></label><label>마을 시대<select data-world-era><option value="modern" ${state.world.era!=="medieval"?"selected":""}>현대</option><option value="medieval" ${state.world.era==="medieval"?"selected":""}>중세</option></select><small>중세를 고르면 현대적인 표현만 시대에 맞게 바뀌고, 요리·청소·산책 같은 행동은 그대로 이어져요.</small></label><label>기본 배경<select data-world-bg><option value="world-assets/cozy-town.png" selected>제공한 손그림 마을</option></select></label><p>건물과 집은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.</p><button data-add-place>+ 건물 추가</button><div class="place-editor">${state.world.places.map(p=>`<details><summary><b>${esc(p.emoji)} ${esc(p.name)}</b></summary><div class="place-edit-heading"><span><b>${esc(p.name)} 편집</b><small>유형을 먼저 고르면 어울리는 건물 모양을 추천해요.</small></span><button class="danger" data-delete-place="${p.id}">이 건물 삭제</button></div><div class="place-config"><label>건물 이름<input data-place-field="name" data-place-id="${p.id}" value="${esc(p.name)}"></label><label>건물 유형<select data-place-field="type" data-place-id="${p.id}">${placeTypeOptions(p)}</select></label><label>세부 유형<select data-place-field="subtype" data-place-id="${p.id}">${placeSubtypeOptions(p)}</select></label><label>가격대<select data-place-field="priceRange" data-place-id="${p.id}">${["저렴","보통","고급","명품"].map(x=>`<option ${p.priceRange===x?"selected":""}>${x}</option>`).join("")}</select></label><label>마을 속 건물 크기<input type="range" min=".45" max="1.5" step=".05" data-place-field="imageScale" data-place-id="${p.id}" value="${p.imageScale||1}"></label><label>매운맛 정도<select data-place-field="spicy" data-place-id="${p.id}">${levelOptions(SPICE_LEVELS,p.spicy||0)}</select></label><label>단맛 정도<select data-place-field="sweet" data-place-id="${p.id}">${levelOptions(SWEET_LEVELS,p.sweet||0)}</select></label></div><div class="place-photo-tools"><b>지도에 표시할 건물 모양</b><span><button data-building-shape-open="${p.id}">건물 모양 선택</button></span><b>생활 로그·현재 장면용 내부 사진</b><span><button data-place-interior-image="${p.id}">내부 사진 업로드</button><button data-image-url="placeInterior" data-id="${p.id}">링크</button>${p.interiorImage?`<button data-clear-place-interior-image="${p.id}">지우기</button>`:""}</span></div><h4>주요 이용층</h4><div class="stock-picker">${audiences.map(x=>`<button data-place-audience="${p.id}" data-value="${x}" class="${(p.audiences||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><h4>이곳에서 파는 것·이용할 수 있는 것</h4><div class="stock-list stock-picker">${items.map(item=>`<button data-place-stock="${p.id}" data-item-id="${item.id}" class="${(p.stock||[]).includes(item.id)?"on":""}">${CATALOG_LABELS[item.kind]} · ${esc(item.name)}</button>`).join("")}</div></details>`).join("")}</div></aside></div>${buildingDetailDialogs()}`}
function dlc(){return `<article class="dlc-product"><div class="dlc-product-art">🏰</div><div><small>시대 스크립트 팩</small><h2>중세의 하루</h2><p>촛불을 켜고 장부를 쓰고, 시장과 여관을 오가는 하루를 담았어요.</p><div class="dlc-buy-row"><b>1,850원</b><a class="primary dlc-buy" href="./payment.html?product=medieval">토스로 구매하기</a></div></div></article>`;}
function fontSettings(){
  const options=[["system","기기·브라우저 기본 글꼴"],["dangam","창원단감둥근체"],["haeong","국민대학교 해옹 산스 · 부드러운 고딕"],["dohyeon","배달의민족 도현체 · 굵고 또렷함"],["corncorn","온글잎 콘콘체 · 편안한 손글씨"],["aggro","SB 어그로체 · 힘 있는 제목체"]];
  const sizes=[["small","작게"],["normal","보통"],["large","크게"],["xlarge","아주 크게"]];
  return `<section class="setting-card font-setting-card"><h2>글자와 화면 크기</h2><p>글꼴 정의는 모든 화면이 같은 파일 하나를 사용합니다. 선택한 글꼴은 아래 미리보기에 즉시 반영돼요.</p><div class="font-setting-grid"><label>글자 크기<select data-setting="uiScale">${sizes.map(([value,label])=>`<option value="${value}" ${state.uiScale===value?"selected":""}>${label}</option>`).join("")}</select></label><label>사용할 글꼴<select data-setting="uiFont">${options.map(([value,label])=>`<option value="${value}" ${state.uiFont===value?"selected":""}>${label}</option>`).join("")}</select></label></div><div class="font-preview"><b>서랍마을의 오늘</b><span>캐릭터들이 각자의 하루를 보내고 있어요. 긴 생활 로그도 편안하게 읽어 보세요.</span></div></section>`;
}
const ownerNameSettings=()=>`<section class="setting-card owner-name-card"><h2>사용자 닉네임</h2><p>Google 계정 이름 대신 동기화 화면에 표시하고, 캐릭터가 사용자의 부탁을 말할 때도 이 이름을 사용해요.</p><label>캐릭터들이 뭐라고 부를까요?<input data-setting="ownerName" maxlength="20" value="${esc(state.ownerName||"")}" placeholder="예: 꺄륵"></label></section>`;
function visualThemeSettings(){
  const vivid=[["rose","진주빛 로즈 부두아르","블러시 실크와 오래된 진주 장식이 머무는 공주님의 작은 방","#b57873","#cfb4ab"],["berry","한밤의 베리 정원","보랏빛 밤에 장미와 잘 익은 베리가 반짝이는 색","#be2cff","#ff45b5"],["sky","구름 위 소다수","맑은 하늘을 한 모금 머금은 듯 시원한 파랑","#078cff","#55c8ff"],["cobalt","사파이어 자정","짙은 왕실 남색과 샴페인 골드가 빛나는 밤","#112250","#3c507d"],["aqua","인어의 유리병","청록빛 파도와 민트 거품을 담은 투명한 물빛","#00a9b5","#21dfc5"],["lime","초록 사탕 온실","라임 사탕과 어린 잎이 자라는 싱그러운 온실","#52a900","#b4d900"],["coral","산호빛 저녁 편지","해 질 녘 산호와 살구빛을 담아 보낸 따뜻한 편지","#ff4f62","#ff9770"]];
  const bright=[["cream","오후 네 시의 크렘","햇빛 든 찻잔처럼 포근한 아이보리와 캐러멜","#b06a00","#f2a93b"],["peach","복숭아빛 첫 편지","부드러운 복숭아와 설레는 첫 인사를 닮은 색","#ef536f","#ff986e"],["mint","유리 온실의 아침","이슬 맺힌 민트 잎과 아침 유리창의 맑은 빛","#00a982","#4bd8aa"],["sunshine","레몬 타르트의 오후","노란 햇살과 금빛 설탕이 반짝이는 명랑한 오후","#d98b00","#ffd23f"]];
  const classic=[["monochrome","새벽의 잉크병","고요한 새벽 종이 위에 번지는 또렷한 먹빛","#20242a","#6d747d"],["sage","비 갠 뒤의 정원","비가 멎은 뒤 잎사귀에 남은 차분하고 맑은 초록","#2f855a","#76c36a"],["ocean","유리 바다의 아침","햇빛이 투과하는 깊고 맑은 바다의 푸른빛","#007fc2","#36c0e8"],["lavender","라일락 꿈결","잠들기 전 창가에 번지는 부드러운 보랏빛","#7547e8","#c26de8"]];
  const heritage=[["baroque","베르사유의 황금 오후","샹들리에와 금박 장식 사이로 쏟아지는 오래된 오후의 빛","#ad6d15","#efbb55"],["moonlit-drawer","달빛 서랍 극장","남색 벨벳과 크림 종이, 금빛 프레임으로 만든 게임 UI 샘플","#172a58","#d4a84f"]];
  const story=[["ruined-rose","재가 된 장미의 방","빛바랜 흑연과 마른 장미, 금이 간 은빛 장식이 남은 피폐한 방","#681f2a","#9a877f"],["healing-glasshouse","숨을 고르는 유리 온실","이슬 맺힌 세이지 잎과 우윳빛 햇살이 천천히 마음을 감싸는 정원","#3e755e","#9bb88a"],["reverie-ward","꿈결 너머의 유리 병동","라일락 잔상과 청록빛 환영 사이로 현실의 가장자리가 흐려지는 몽환","#6551a5","#36a9a0"],["noir-rain","자정에 젖은 필름","비 내린 골목의 흑백 필름 위로 붉은 네온과 옅은 연기가 스치는 밤","#a21f2d","#3e454d"]];
  const all=[...story,...heritage,...vivid,...bright,...classic];
  const buttons=themes=>themes.map(([value,label,description,a,b])=>`<button type="button" data-visual-theme="${esc(value)}" class="${state.visualTheme===value?"on":""}" style="--theme-a:${esc(a||"")};--theme-b:${esc(b||"")}"><i aria-hidden="true"></i><span><b>${esc(label)}</b><small>${esc(description)}</small></span>${state.visualTheme===value?`<em>현재 선택</em>`:""}</button>`).join("");
  const current=all.find(([value])=>value===state.visualTheme)||classic[0];
  return `<section class="setting-card visual-theme-card"><h2>전체 색상 테마</h2><p>이 색은 모든 캐릭터와 화면의 버튼·강조색에 함께 적용돼요. 버튼 글자는 배경 밝기에 맞춰 자동으로 바뀝니다.</p><div class="current-visual-theme" style="--theme-a:${esc(current[3])};--theme-b:${esc(current[4])}"><i aria-hidden="true"></i><span><small>현재 선택한 테마</small><b>${esc(current[1])}</b><em>${esc(current[2])}</em></span></div><button type="button" class="primary open-visual-theme-picker" data-open-visual-theme-dialog>테마 선택하기</button><dialog class="visual-theme-dialog" data-visual-theme-dialog><form method="dialog"><div class="visual-theme-dialog-head"><span><small>COLOR THEME</small><h2>테마 선택하기</h2><p>미리보기에서 원하는 색을 고르면 바로 적용돼요.</p></span><button value="close" aria-label="닫기">×</button></div><div class="visual-theme-dialog-body"><div class="visual-theme-options visual-theme-options-all">${buttons(all)}</div></div><div class="visual-theme-dialog-actions"><button value="close">닫기</button></div></form></dialog></section>`;
}
Object.assign(UI_TEXT.en,{
  "재가 된 장미의 방":"The Room of Ashen Roses","빛바랜 흑연과 마른 장미, 금이 간 은빛 장식이 남은 피폐한 방":"A ruined room of faded graphite, dried roses, and cracked silver ornament",
  "숨을 고르는 유리 온실":"The Glasshouse That Breathes","이슬 맺힌 세이지 잎과 우윳빛 햇살이 천천히 마음을 감싸는 정원":"A quiet garden where dewy sage and milky sunlight gently hold the heart",
  "꿈결 너머의 유리 병동":"The Glass Ward Beyond Reverie","라일락 잔상과 청록빛 환영 사이로 현실의 가장자리가 흐려지는 몽환":"A dreamscape where reality softens between lilac afterimages and teal visions",
  "자정에 젖은 필름":"Film Soaked at Midnight","비 내린 골목의 흑백 필름 위로 붉은 네온과 옅은 연기가 스치는 밤":"A monochrome night of wet alleys, red neon, and drifting smoke",
  "달빛 서랍 극장":"Moonlit Drawer Theatre","남색 벨벳과 크림 종이, 금빛 프레임으로 만든 게임 UI 샘플":"A game UI sample made of navy velvet, cream paper, and golden frames",
  "진주빛 로즈 부두아르":"Pearl-Rose Boudoir","블러시 실크와 오래된 진주 장식이 머무는 공주님의 작은 방":"A princess's private room of blush silk and antique pearls",
  "한밤의 베리 정원":"Midnight Berry Garden","보랏빛 밤에 장미와 잘 익은 베리가 반짝이는 색":"Roses and ripe berries shimmering in a violet night",
  "구름 위 소다수":"Soda Above the Clouds","맑은 하늘을 한 모금 머금은 듯 시원한 파랑":"A crisp blue like a sip of clear sky",
  "사파이어 자정":"Sapphire Midnight","짙은 왕실 남색과 샴페인 골드가 빛나는 밤":"A night of royal navy and gleaming champagne gold",
  "인어의 유리병":"The Mermaid's Glass Bottle","청록빛 파도와 민트 거품을 담은 투명한 물빛":"Clear water holding teal waves and mint foam",
  "초록 사탕 온실":"Green-Candy Conservatory","라임 사탕과 어린 잎이 자라는 싱그러운 온실":"A fresh conservatory of lime candy and young leaves",
  "산호빛 저녁 편지":"A Coral Evening Letter","해 질 녘 산호와 살구빛을 담아 보낸 따뜻한 편지":"A warm letter carrying sunset coral and apricot",
  "오후 네 시의 크렘":"Crème at Four","햇빛 든 찻잔처럼 포근한 아이보리와 캐러멜":"Ivory and caramel as warm as a sunlit teacup",
  "복숭아빛 첫 편지":"The First Peach-Tinted Letter","부드러운 복숭아와 설레는 첫 인사를 닮은 색":"Soft peach like a fluttering first hello",
  "유리 온실의 아침":"Morning in the Glasshouse","이슬 맺힌 민트 잎과 아침 유리창의 맑은 빛":"Dewy mint leaves and clear morning glass",
  "레몬 타르트의 오후":"A Lemon-Tart Afternoon","노란 햇살과 금빛 설탕이 반짝이는 명랑한 오후":"A cheerful afternoon of yellow sun and golden sugar",
  "새벽의 잉크병":"The Dawn Inkwell","고요한 새벽 종이 위에 번지는 또렷한 먹빛":"Clear ink spreading across quiet dawn paper",
  "비 갠 뒤의 정원":"The Garden After Rain","비가 멎은 뒤 잎사귀에 남은 차분하고 맑은 초록":"Calm, clear green left on leaves after rain",
  "유리 바다의 아침":"Morning on the Glass Sea","햇빛이 투과하는 깊고 맑은 바다의 푸른빛":"Deep, clear blue with sunlight passing through",
  "라일락 꿈결":"A Lilac Reverie","잠들기 전 창가에 번지는 부드러운 보랏빛":"Soft violet drifting across the window before sleep",
  "베르사유의 황금 오후":"A Golden Afternoon at Versailles","샹들리에와 금박 장식 사이로 쏟아지는 오래된 오후의 빛":"Old afternoon light pouring between chandeliers and gilded ornament"
});
Object.assign(UI_TEXT.ja,{
  "재가 된 장미의 방":"灰になった薔薇の部屋","빛바랜 흑연과 마른 장미, 금이 간 은빛 장식이 남은 피폐한 방":"色あせた黒鉛、枯れた薔薇、ひび割れた銀飾りが残る荒廃した部屋",
  "숨을 고르는 유리 온실":"息を整えるガラス温室","이슬 맺힌 세이지 잎과 우윳빛 햇살이 천천히 마음을 감싸는 정원":"露をまとったセージと乳白色の陽光が心をそっと包む庭",
  "꿈결 너머의 유리 병동":"夢の向こうのガラス病棟","라일락 잔상과 청록빛 환영 사이로 현실의 가장자리가 흐려지는 몽환":"ライラックの残像と青緑の幻のあいだで現実の輪郭がほどける夢景色",
  "자정에 젖은 필름":"真夜中に濡れたフィルム","비 내린 골목의 흑백 필름 위로 붉은 네온과 옅은 연기가 스치는 밤":"雨の路地を映す白黒フィルムに赤いネオンと淡い煙がよぎる夜",
  "달빛 서랍 극장":"月明かりの引き出し劇場","남색 벨벳과 크림 종이, 금빛 프레임으로 만든 게임 UI 샘플":"紺のベルベット、クリーム色の紙、金色のフレームで作ったゲームUIサンプル"
});
Object.assign(UI_TEXT.ja,{
  "진주빛 로즈 부두아르":"真珠色のローズ・ブドワール","블러시 실크와 오래된 진주 장식이 머무는 공주님의 작은 방":"ブラッシュシルクとアンティークパールに包まれた姫君の小部屋",
  "한밤의 베리 정원":"真夜中のベリーガーデン","보랏빛 밤에 장미와 잘 익은 베리가 반짝이는 색":"紫の夜に薔薇と熟したベリーがきらめく色",
  "구름 위 소다수":"雲の上のソーダ水","맑은 하늘을 한 모금 머금은 듯 시원한 파랑":"澄んだ空を一口含んだような爽やかな青",
  "사파이어 자정":"サファイアの真夜中","짙은 왕실 남색과 샴페인 골드가 빛나는 밤":"深いロイヤルネイビーとシャンパンゴールドが輝く夜",
  "인어의 유리병":"人魚のガラス瓶","청록빛 파도와 민트 거품을 담은 투명한 물빛":"青緑の波とミントの泡を閉じ込めた透明な水色",
  "초록 사탕 온실":"緑のキャンディ温室","라임 사탕과 어린 잎이 자라는 싱그러운 온실":"ライムキャンディと若葉が育つみずみずしい温室",
  "산호빛 저녁 편지":"珊瑚色の夕暮れの手紙","해 질 녘 산호와 살구빛을 담아 보낸 따뜻한 편지":"夕暮れの珊瑚色と杏色を込めたあたたかな手紙",
  "오후 네 시의 크렘":"午後四時のクレーム","햇빛 든 찻잔처럼 포근한 아이보리와 캐러멜":"陽だまりのティーカップのようなアイボリーとキャラメル",
  "복숭아빛 첫 편지":"桃色の最初の手紙","부드러운 복숭아와 설레는 첫 인사를 닮은 색":"やわらかな桃と胸が高鳴る最初の挨拶の色",
  "유리 온실의 아침":"ガラス温室の朝","이슬 맺힌 민트 잎과 아침 유리창의 맑은 빛":"露をまとったミントの葉と朝のガラスの澄んだ光",
  "레몬 타르트의 오후":"レモンタルトの午後","노란 햇살과 금빛 설탕이 반짝이는 명랑한 오후":"黄色い日差しと金色の砂糖がきらめく朗らかな午後",
  "새벽의 잉크병":"夜明けのインク壺","고요한 새벽 종이 위에 번지는 또렷한 먹빛":"静かな夜明けの紙に広がる鮮明な墨色",
  "비 갠 뒤의 정원":"雨上がりの庭","비가 멎은 뒤 잎사귀에 남은 차분하고 맑은 초록":"雨上がりの葉に残る穏やかで澄んだ緑",
  "유리 바다의 아침":"ガラスの海の朝","햇빛이 투과하는 깊고 맑은 바다의 푸른빛":"日差しが透き通る深く澄んだ海の青",
  "라일락 꿈결":"ライラックの夢心地","잠들기 전 창가에 번지는 부드러운 보랏빛":"眠る前の窓辺に広がるやわらかな紫",
  "베르사유의 황금 오후":"ヴェルサイユの黄金の午後","샹들리에와 금박 장식 사이로 쏟아지는 오래된 오후의 빛":"シャンデリアと金箔装飾の間に降り注ぐ古い午後の光"
});
Object.assign(UI_TEXT.en,{
  "전체 색상 테마":"Color theme","현재 선택한 테마":"Current theme","현재 선택":"Selected",
  "마을 편집":"Edit town","마을 저장":"Save town","마을을 만드는 순서":"How to build a town",
  "마을 이름과 배경을 고르세요.":"Choose a town name and background.","건물을 추가하고 유형을 고르세요.":"Add buildings and choose their types.","‘건물 모양 선택’에서 추천 그림을 적용하세요.":"Apply a suggested design under ‘Choose building design.’","지도 위 건물을 직접 끌어 위치를 정하세요.":"Drag buildings on the map to place them.",
  "마을 이름":"Town name","마을 시대":"Town era","현대":"Modern","중세":"Medieval","기본 배경":"Default background","제공한 손그림 마을":"Provided hand-drawn town","기본 마을 손그림":"Default hand-drawn town","제공받은 기본 마을 손그림":"Provided default hand-drawn town",
  "건물은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.":"You can drag buildings on this screen on both PC and mobile.","+ 건물 추가":"+ Add building","유형을 먼저 고르면 어울리는 건물 모양을 추천해요.":"Choose a type first to see matching building designs.","이 건물 삭제":"Delete this building",
  "건물 이름":"Building name","건물 유형":"Building type","세부 유형":"Subtype","가격대":"Price range","저렴":"Budget","보통":"Standard","고급":"Premium","명품":"Luxury","마을 속 건물 크기":"Building size on map","매운맛 정도":"Spice level","단맛 정도":"Sweetness level",
  "지도에 표시할 건물 모양":"Building design shown on the map","건물 모양 선택":"Choose building design","생활 로그·현재 장면용 내부 사진":"Interior art for life logs and current scenes","내부 사진 업로드":"Upload interior art","링크":"Link","지우기":"Remove","주요 이용층":"Main audience","이곳에서 파는 것·이용할 수 있는 것":"Items and services available here",
  "카페":"Cafe","음식점":"Restaurant","병원":"Hospital","공연장":"Venue","옷가게":"Clothing shop","사무실":"Office","학교":"School","공원":"Park","도서관":"Library","쇼핑몰":"Shopping center","숙박":"Lodging","관공서":"Public office","기타":"Other","기본 건물":"Basic building","작은 집":"Small house","지정 안 함 · 해당 유형 전체 취급":"No subtype · General use",
  "로스터리 카페":"Roastery cafe","디저트 카페":"Dessert cafe","테마 카페":"Theme cafe","찻집":"Tea house","한식당":"Korean restaurant","중식당":"Chinese restaurant","일식당":"Japanese restaurant","이탈리아 식당":"Italian restaurant","분식집":"Korean snack bar","패스트푸드점":"Fast-food restaurant","디저트 가게":"Dessert shop",
  "종합병원":"General hospital","내과":"Internal medicine","외과":"Surgery","이비인후과":"ENT clinic","정형외과":"Orthopedics","피부과":"Dermatology","치과":"Dental clinic","안과":"Eye clinic","한의원":"Korean medicine clinic","콘서트홀":"Concert hall","라이브 클럽":"Live club","뮤지컬 극장":"Musical theater","연극 극장":"Playhouse","야외 공연장":"Outdoor venue",
  "스포츠 브랜드":"Sportswear shop","캐주얼 브랜드":"Casualwear shop","정장 브랜드":"Formalwear shop","빈티지 숍":"Vintage shop","디자이너 브랜드":"Designer boutique","신발 가게":"Shoe shop","액세서리 숍":"Accessories shop","일반 회사":"Company office","IT 회사":"IT company","연구소":"Research institute","방송국":"Broadcasting station","출판사":"Publisher","디자인 스튜디오":"Design studio",
  "초등학교":"Elementary school","중학교":"Middle school","고등학교":"High school","대학교":"University","학원":"Academy","근린공원":"Neighborhood park","수목원":"Botanical garden","놀이공원":"Amusement park","반려동물 공원":"Pet park","공공도서관":"Public library","대학도서관":"University library","전문도서관":"Special library","백화점":"Department store","아울렛":"Outlet mall","복합 쇼핑몰":"Shopping complex","호텔":"Hotel","여관":"Inn","리조트":"Resort","게스트하우스":"Guesthouse","시청":"City hall","주민센터":"Community center","경찰서":"Police station","소방서":"Fire station"
});
Object.assign(UI_TEXT.ja,{
  "전체 색상 테마":"全体カラーテーマ","현재 선택한 테마":"現在のテーマ","현재 선택":"選択中",
  "마을 편집":"村を編集","마을 저장":"村を保存","마을을 만드는 순서":"村の作り方",
  "마을 이름과 배경을 고르세요.":"村の名前と背景を選びます。","건물을 추가하고 유형을 고르세요.":"建物を追加して種類を選びます。","‘건물 모양 선택’에서 추천 그림을 적용하세요.":"「建物デザインを選ぶ」からおすすめの絵を適用します。","지도 위 건물을 직접 끌어 위치를 정하세요.":"地図上で建物をドラッグして配置します。",
  "마을 이름":"村の名前","마을 시대":"村の時代","현대":"現代","중세":"中世","기본 배경":"基本背景","제공한 손그림 마을":"提供された手描きの村","기본 마을 손그림":"基本の手描き村","제공받은 기본 마을 손그림":"提供された基本の手描き村",
  "건물은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.":"PCでもモバイルでも、この画面で建物をドラッグできます。","+ 건물 추가":"＋建物を追加","유형을 먼저 고르면 어울리는 건물 모양을 추천해요.":"先に種類を選ぶと、合う建物デザインをおすすめします。","이 건물 삭제":"この建物を削除",
  "건물 이름":"建物名","건물 유형":"建物の種類","세부 유형":"詳細タイプ","가격대":"価格帯","저렴":"手頃","보통":"標準","고급":"高級","명품":"ラグジュアリー","마을 속 건물 크기":"地図上の建物サイズ","매운맛 정도":"辛さ","단맛 정도":"甘さ",
  "지도에 표시할 건물 모양":"地図に表示する建物デザイン","건물 모양 선택":"建物デザインを選ぶ","생활 로그·현재 장면용 내부 사진":"生活ログ・現在シーン用の内装画像","내부 사진 업로드":"内装画像をアップロード","링크":"リンク","지우기":"削除","주요 이용층":"主な利用者","이곳에서 파는 것·이용할 수 있는 것":"ここで販売・利用できるもの",
  "카페":"カフェ","음식점":"飲食店","병원":"病院","공연장":"公演会場","옷가게":"服屋","사무실":"オフィス","학교":"学校","공원":"公園","도서관":"図書館","쇼핑몰":"ショッピングモール","숙박":"宿泊施設","관공서":"公共機関","기타":"その他","기본 건물":"基本の建物","작은 집":"小さな家","지정 안 함 · 해당 유형 전체 취급":"指定なし・種類全般",
  "로스터리 카페":"ロースタリーカフェ","디저트 카페":"デザートカフェ","테마 카페":"テーマカフェ","찻집":"茶屋","한식당":"韓国料理店","중식당":"中華料理店","일식당":"日本料理店","이탈리아 식당":"イタリア料理店","분식집":"軽食店","패스트푸드점":"ファストフード店","디저트 가게":"デザートショップ",
  "종합병원":"総合病院","내과":"内科","외과":"外科","이비인후과":"耳鼻咽喉科","정형외과":"整形外科","피부과":"皮膚科","치과":"歯科","안과":"眼科","한의원":"韓医院","콘서트홀":"コンサートホール","라이브 클럽":"ライブクラブ","뮤지컬 극장":"ミュージカル劇場","연극 극장":"演劇場","야외 공연장":"野外公演場",
  "스포츠 브랜드":"スポーツブランド店","캐주얼 브랜드":"カジュアルブランド店","정장 브랜드":"フォーマル店","빈티지 숍":"ヴィンテージショップ","디자이너 브랜드":"デザイナーブランド店","신발 가게":"靴屋","액세서리 숍":"アクセサリーショップ","일반 회사":"一般企業","IT 회사":"IT企業","연구소":"研究所","방송국":"放送局","출판사":"出版社","디자인 스튜디오":"デザインスタジオ",
  "초등학교":"小学校","중학교":"中学校","고등학교":"高校","대학교":"大学","학원":"学習塾","근린공원":"近隣公園","수목원":"植物園","놀이공원":"遊園地","반려동물 공원":"ペット公園","공공도서관":"公共図書館","대학도서관":"大学図書館","전문도서관":"専門図書館","백화점":"百貨店","아울렛":"アウトレット","복합 쇼핑몰":"複合ショッピングモール","호텔":"ホテル","여관":"旅館","리조트":"リゾート","게스트하우스":"ゲストハウス","시청":"市役所","주민센터":"住民センター","경찰서":"警察署","소방서":"消防署"
});
function settingsContent(){
  const colorMode=`<section class="setting-card color-mode-card"><h2>화면 모드</h2><p>밝은 화면과 어두운 화면 중 읽기 편한 쪽을 고르세요.</p><div class="color-mode-options"><button type="button" data-color-mode="light" class="${state.colorMode==="light"?"on":""}"><span>☀️</span><b>화이트 모드</b></button><button type="button" data-color-mode="dark" class="${state.colorMode!=="light"?"on":""}"><span>🌙</span><b>다크 모드</b></button></div></section>`;
  const homeCharacterDisplay=`<section class="setting-card home-character-display-card"><h2>홈 화면 캐릭터 표현</h2><p>모든 캐릭터에 같은 표시 방식을 적용합니다. LD는 원본 비율을 유지하고 자르거나 늘리지 않습니다.</p><label>SD / LD<select data-setting="homeVisualMode"><option value="sd" ${state.homeVisualMode!=="ld"?"selected":""}>SD</option><option value="ld" ${state.homeVisualMode==="ld"?"selected":""}>LD</option></select></label><label>SD 크기 <output>${Math.round(Number(state.homeSdScale)||100)}%</output><input type="range" min="70" max="150" step="5" value="${Number(state.homeSdScale)||100}" data-setting="homeSdScale"></label><label>LD 크기 <output>${Math.round(Number(state.homeLdScale)||100)}%</output><input type="range" min="70" max="150" step="5" value="${Number(state.homeLdScale)||100}" data-setting="homeLdScale"></label><small>2인 LD도 1인과 같은 높이·같은 Y좌표를 사용하고 X좌표만 좌우로 나뉩니다. 현재 선택한 캐릭터가 항상 앞에 표시됩니다.</small></section>`;
  const sync=`<section class="sync-panel setting-card"><h2>저장과 동기화</h2><p id="account-status">${esc(accountText)}</p><div class="sync-actions"><button class="primary" data-auth>Google 로그인 / 로그아웃</button><button data-sync-upload>동기화</button><button data-sync-download>불러오기</button></div><small>캐릭터 정보와 사진을 함께 Google 계정에 동기화합니다.</small><small>LD는 자르지 않고 원본 비율을 유지하며, 큰 사진은 저장용 사본만 비율대로 축소해요.</small></section>`;
  const map=`<section class="setting-card map-display-card"><h2>마을 지도 표시</h2><label>건물 표기 방식<select data-setting="buildingLabelMode"><option value="full" ${state.buildingLabelMode==="full"?"selected":""}>이름과 건물 유형 표시</option><option value="name" ${state.buildingLabelMode==="name"?"selected":""}>이름만 표시</option><option value="none" ${state.buildingLabelMode==="none"?"selected":""}>아무 글자도 표시하지 않기</option></select></label><label>지도 위 캐릭터 표기<select data-setting="mapCharacterLabelMode"><option value="none" ${state.mapCharacterLabelMode==="none"?"selected":""}>캐릭터 아이콘만 표시</option><option value="name" ${state.mapCharacterLabelMode==="name"?"selected":""}>아이콘 아래 이름 표시</option></select></label><small>같은 건물에 있는 캐릭터는 지도에서 한 묶음으로 표시됩니다.</small></section>`;
  const language=`<section class="setting-card language-setting-card"><h2>${t("language","언어 · Language · 言語")}</h2><p>${t("languageHelp","영어와 일본어 번역 범위를 계속 넓히고 있어요.")}</p><label>Language<select data-setting="uiLanguage"><option value="ko">한국어</option><option value="en">English (Beta)</option><option value="ja">日本語（ベータ）</option></select></label><small>${t("languageNote","영어·일본어 베타 · 생활 장면 번역도 계속 추가됩니다.")}</small></section>`;
  const backup=`<section class="setting-card backup-file-card"><h2>브라우저 백업 파일</h2><p>사진 없이 정보만 내보냅니다. 불러올 때도 이 기기의 기존 사진은 그대로 유지해요.</p><div class="sync-actions"><button data-export-file>백업 파일 내보내기</button><button data-import-file>백업 파일 불러오기</button></div></section>`;
  const feedback=`<section class="setting-card feedback-card"><h2>개발자에게 피드백 보내기</h2><p>유형을 고르면 기기의 메일 앱이 열려요.</p></section>`;
  const guide=`<section class="setting-card page-guide-card"><h2>페이지 안내</h2><p>각 페이지를 처음 열었을 때 나오는 안내를 다시 볼 수 있어요.</p><button data-guide-reset>모든 페이지 안내 다시 보기</button></section>`;
  return `<section class="panel form settings-shell"><h1>${t("settings","설정")}</h1>${sync}${colorMode}${visualThemeSettings()}${fontSettings()}${ownerNameSettings()}${homeCharacterDisplay}${map}${language}${backup}${feedback}${guide}<button data-reset>모든 데이터 초기화</button></section>`;
}
Object.assign(UI_TEXT.en,{
  "고전과 장식 테마":"Heritage & ornamental themes","바로크 살롱":"Baroque Salon","검정 칠기 액자와 빛바랜 양피지, 와인빛과 청동 장식":"Black lacquer frames, aged parchment, wine red, and bronze ornament",
  "밝고 선명한 테마":"Bright & vivid themes","밝은 파스텔 테마":"Light pastel themes","차분한 기본 테마":"Calm classic themes",
  "이 색은 모든 캐릭터와 화면의 버튼·강조색에 함께 적용돼요. 버튼 글자는 배경 밝기에 맞춰 자동으로 바뀝니다.":"This color applies to every character and to buttons and accents across the app. Button text automatically adapts to the background brightness.",
  "프린세스 핑크":"Princess Pink","사탕처럼 선명하고 사랑스러운 공주 핑크":"A vivid, candy-bright princess pink","베리 팝":"Berry Pop","보라와 핫핑크가 통통 튀는 베리빛":"Playful berry shades of purple and hot pink","하늘 소다":"Sky Soda","맑은 하늘과 탄산처럼 시원한 파랑":"A crisp blue as refreshing as sky and soda","코발트 네온":"Cobalt Neon","화면을 또렷하게 잡는 선명한 청보라":"A clear, vivid blue-violet","아쿠아 팝":"Aqua Pop","청록과 민트가 반짝이는 물빛":"Sparkling aqua with teal and mint","라임 캔디":"Lime Candy","싱그러운 초록과 라임빛":"Fresh green and lime","코랄 펀치":"Coral Punch","산뜻한 빨강과 오렌지 코랄":"A lively red-orange coral",
  "편안하지만 탁하지 않은 초록빛":"A comfortable green that stays clear","맑고 깊은 바다의 푸른빛":"Clear, deep ocean blue","선명하면서 부드러운 보랏빛":"A vivid yet gentle violet",
  "크림 라떼":"Cream Latte","포근하고 환한 아이보리와 캐러멜빛":"Warm, bright ivory with caramel accents","복숭아 소다":"Peach Soda","생기 있고 부드러운 복숭앗빛":"A lively, soft peach palette","민트 정원":"Mint Garden","산뜻하고 맑은 민트와 잎사귀빛":"Fresh mint with clear leafy accents","햇살 레몬":"Sunlit Lemon","따뜻하고 명랑한 레몬과 금빛":"Warm, cheerful lemon and gold",
  "저장과 동기화":"Save & sync","동기화 이름 표시":"Sync display name","언어 · Language · 言語":"Language","영어와 일본어 번역 범위를 계속 넓히고 있어요.":"English and Japanese coverage is being expanded continuously.","영어·일본어 베타 · 생활 장면 번역도 계속 추가됩니다.":"English & Japanese beta · More life-scene translations are on the way.",
  "확장팩":"Expansion packs","확장팩 · 출시 준비 중":"Expansion pack · Coming soon","이력서를 제출해요":"Submit Your Résumé","기존 직업에 더 세밀한 위계와 직급, 직장 내 관계, 실제 근무 장소와 구체적인 근무 내용을 더합니다. 상사와 부하 직원, 동료 사이의 역할과 업무 흐름이 생활 장면과 주간 일정에 이어지는 대규모 직업 확장팩이에요.":"A major career expansion adding deeper hierarchy and ranks, workplace relationships, real work locations, and detailed duties to existing occupations. Roles and workflows between managers, coworkers, and direct reports carry into life scenes and weekly schedules.","직업별 위계·직급과 승진 흐름":"Career hierarchy, ranks, and promotions","상사·동료·부하 직원의 직장 내 관계":"Workplace relationships with managers, coworkers, and direct reports","근무 장소·부서·담당 업무와 전용 생활 장면":"Workplaces, departments, duties, and dedicated life scenes","이 이미지는 ":"Replace only "," 파일만 바꾸면 교체돼요.":" to change this image."
  ,"원하는 상품과 수량을 장바구니에 담아 한 번에 결제할 수 있어요.":"Add the products and quantities you want to the cart and pay in one checkout.","캐릭터 슬롯":"Character slots","캐릭터 5명 추가":"Add 5 character slots","캐릭터 슬롯 5개가 결제 즉시 계정에 영구 적용되며, 서랍마을 서비스 운영 기간 동안 유지됩니다.":"Five character slots are permanently applied to the account immediately after payment and remain available while Drawer Village is in service.","마을 슬롯":"Town slots","마을 1개 추가":"Add 1 town slot","마을 슬롯 1개가 결제 즉시 계정에 영구 적용되며, 서랍마을 서비스 운영 기간 동안 유지됩니다.":"One town slot is permanently applied to the account immediately after payment and remains available while Drawer Village is in service.","사진 저장 공간":"Image storage","사진 저장 공간 50MB 추가":"Add 50MB image storage","구매하면 계정의 사진 저장 공간이 50MB로 늘어납니다.":"This increases your account image storage to 50MB.","일회성 구매":"One-time purchase","개발 응원":"Support development","개발자에게 녹차 사주기 🍵":"Buy the developer green tea 🍵","잘 먹겠습니다 🥹":"Thank you 🥹","같은 상품도 여러 개 담을 수 있어요.":"You can add multiple quantities of the same product.","한 번 결제 금액은 5만원 미만이어야 해요.":"A single checkout must stay under KRW 50,000.","한도에 닿는 상품은 더 담을 수 없어요.":"Products that would reach the limit cannot be added.","이 상품을 더 담으면 5만원 이상이에요":"Adding this product would make the total KRW 50,000 or more","수량을 줄여 주세요":"Reduce the quantity","아직 장바구니가 비어 있어요.":"Your cart is empty.","총 결제금액":"Total","장바구니 결제하기":"Checkout cart"
});
Object.assign(UI_TEXT.ja,{
  "고전과 장식 테마":"古典・装飾テーマ","바로크 살롱":"バロックサロン","검정 칠기 액자와 빛바랜 양피지, 와인빛과 청동 장식":"黒漆の額縁、古びた羊皮紙、ワインレッドと青銅の装飾",
  "밝고 선명한 테마":"明るく鮮やかなテーマ","밝은 파스텔 테마":"明るいパステルテーマ","차분한 기본 테마":"落ち着いた基本テーマ",
  "이 색은 모든 캐릭터와 화면의 버튼·강조색에 함께 적용돼요. 버튼 글자는 배경 밝기에 맞춰 자동으로 바뀝니다.":"この色はすべてのキャラクターと画面のボタン・アクセントに適用されます。ボタンの文字色は背景の明るさに合わせて自動で変わります。",
  "프린세스 핑크":"プリンセスピンク","사탕처럼 선명하고 사랑스러운 공주 핑크":"キャンディのように鮮やかで可愛いプリンセスピンク","베리 팝":"ベリーポップ","보라와 핫핑크가 통통 튀는 베리빛":"紫とホットピンクが弾けるベリーカラー","하늘 소다":"スカイソーダ","맑은 하늘과 탄산처럼 시원한 파랑":"澄んだ空とソーダのように爽やかな青","코발트 네온":"コバルトネオン","화면을 또렷하게 잡는 선명한 청보라":"画面をくっきり見せる鮮やかな青紫","아쿠아 팝":"アクアポップ","청록과 민트가 반짝이는 물빛":"青緑とミントがきらめく水色","라임 캔디":"ライムキャンディ","싱그러운 초록과 라임빛":"みずみずしい緑とライム色","코랄 펀치":"コーラルパンチ","산뜻한 빨강과 오렌지 코랄":"爽やかな赤とオレンジのコーラル",
  "편안하지만 탁하지 않은 초록빛":"落ち着きがありながら濁らない緑","맑고 깊은 바다의 푸른빛":"澄んだ深い海の青","선명하면서 부드러운 보랏빛":"鮮やかでやわらかな紫",
  "크림 라떼":"クリームラテ","포근하고 환한 아이보리와 캐러멜빛":"あたたかく明るいアイボリーとキャラメル","복숭아 소다":"ピーチソーダ","생기 있고 부드러운 복숭앗빛":"明るくやわらかな桃色","민트 정원":"ミントガーデン","산뜻なミントと葉の色":"爽やかなミントと葉の色","산뜻하고 맑은 민트와 잎사귀빛":"爽やかで澄んだミントと葉の色","햇살 레몬":"陽だまりレモン","따뜻하고 명랑한 레몬과 금빛":"あたたかく明るいレモンと金色",
  "저장과 동기화":"保存と同期","동기화 이름 표시":"同期時の表示名","언어 · Language · 言語":"言語","영어와 일본어 번역 범위를 계속 넓히고 있어요.":"英語・日本語の翻訳範囲を引き続き拡大しています。","영어·일본어 베타 · 생활 장면 번역도 계속 추가됩니다.":"英語・日本語ベータ・生活シーンの翻訳も順次追加します。",
  "확장팩":"拡張パック","확장팩 · 출시 준비 중":"拡張パック・リリース準備中","이력서를 제출해요":"履歴書を提出します","기존 직업에 더 세밀한 위계와 직급, 직장 내 관계, 실제 근무 장소와 구체적인 근무 내용을 더합니다. 상사와 부하 직원, 동료 사이의 역할과 업무 흐름이 생활 장면과 주간 일정에 이어지는 대규모 직업 확장팩이에요.":"既存の職業に、より細かな階層・役職、職場の人間関係、実際の勤務場所と具体的な業務内容を追加します。上司・同僚・部下の役割や仕事の流れが生活シーンと週間予定に反映される大型職業拡張パックです。","직업별 위계·직급과 승진 흐름":"職業ごとの階層・役職・昇進","상사·동료·부하 직원의 직장 내 관계":"上司・同僚・部下との職場関係","근무 장소·부서·담당 업무와 전용 생활 장면":"勤務場所・部署・担当業務と専用生活シーン","이 이미지는 ":"この画像は "," 파일만 바꾸면 교체돼요.":" ファイルだけを差し替えると変更できます。"
  ,"원하는 상품과 수량을 장바구니에 담아 한 번에 결제할 수 있어요.":"ほしい商品と数量をカートに入れて、まとめて決済できます。","캐릭터 슬롯":"キャラクタースロット","캐릭터 5명 추가":"キャラクター枠を5人追加","캐릭터 슬롯 5개가 결제 즉시 계정에 영구 적용되며, 서랍마을 서비스 운영 기간 동안 유지됩니다.":"キャラクター枠5人分が決済直後にアカウントへ永続的に適用され、ひきだし村のサービス運営期間中は維持されます。","마을 슬롯":"村スロット","마을 1개 추가":"村スロットを1つ追加","마을 슬롯 1개가 결제 즉시 계정에 영구 적용되며, 서랍마을 서비스 운영 기간 동안 유지됩니다.":"村スロット1つが決済直後にアカウントへ永続的に適用され、ひきだし村のサービス運営期間中は維持されます。","사진 저장 공간":"画像ストレージ","사진 저장 공간 50MB 추가":"画像ストレージを50MB追加","구매하면 계정의 사진 저장 공간이 50MB로 늘어납니다.":"購入するとアカウントの画像保存容量が50MBになります。","일회성 구매":"買い切り","개발 응원":"開発を応援","개발자에게 녹차 사주기 🍵":"開発者に緑茶をおごる 🍵","잘 먹겠습니다 🥹":"ありがとうございます 🥹","같은 상품도 여러 개 담을 수 있어요.":"同じ商品を複数入れることもできます。","한 번 결제 금액은 5만원 미만이어야 해요.":"1回の決済金額は5万ウォン未満にしてください。","한도에 닿는 상품은 더 담을 수 없어요.":"上限に達する商品は追加できません。","이 상품을 더 담으면 5만원 이상이에요":"この商品を追加すると5万ウォン以上になります","수량을 줄여 주세요":"数量を減らしてください","아직 장바구니가 비어 있어요.":"カートは空です。","총 결제금액":"合計金額","장바구니 결제하기":"カートを決済"
});
Object.assign(UI_TEXT.en,{
  "캐릭터 슬롯 5개가 결제 즉시 계정에 영구 적용됩니다. 결제일부터 최소 6개월간 이용을 보장하며, 이후에도 서비스 운영 기간 동안 유지됩니다.":"Five character slots are permanently applied to the account immediately after payment. Access is guaranteed for at least six months from the payment date and continues while the service remains in operation.",
  "마을 슬롯 1개가 결제 즉시 계정에 영구 적용됩니다. 결제일부터 최소 6개월간 이용을 보장하며, 이후에도 서비스 운영 기간 동안 유지됩니다.":"One town slot is permanently applied to the account immediately after payment. Access is guaranteed for at least six months from the payment date and continues while the service remains in operation."
});
Object.assign(UI_TEXT.ja,{
  "캐릭터 슬롯 5개가 결제 즉시 계정에 영구 적용됩니다. 결제일부터 최소 6개월간 이용을 보장하며, 이후에도 서비스 운영 기간 동안 유지됩니다.":"キャラクター枠5人分が決済直後にアカウントへ永続的に適用されます。決済日から最低6か月間の利用を保証し、その後もサービス運営期間中は維持されます。",
  "마을 슬롯 1개가 결제 즉시 계정에 영구 적용됩니다. 결제일부터 최소 6개월간 이용을 보장하며, 이후에도 서비스 운영 기간 동안 유지됩니다.":"村スロット1つが決済直後にアカウントへ永続的に適用されます。決済日から最低6か月間の利用を保証し、その後もサービス運営期間中は維持されます。"
});
Object.assign(UI_TEXT.en,{
  "저장과 동기화":"Save & sync","이 캐릭터가 끌리는 특성 정하기":"Choose preferred traits","이 캐릭터가 비선호하는 특성 정하기":"Choose disliked traits","비선호하는 특징 정하기":"Choose disliked traits",
  "주변에서는 두 사람을 연인으로 알고 있지만, 지금은 서로의 시간을 존중하며 각자 하던 일에 집중하고 있어요. 가까이 있어도 늘 같은 행동을 해야 한다고 생각하지 않아요.":"People around them know they are a couple, but right now they are respecting each other's time and focusing on their own activities. Being close does not mean they always need to do the same thing.",
  "상대가 곁에 있어도 필요한 일은 먼저 스스로 해낸 뒤, 도움이 필요할 때만 자연스럽게 손을 내밀었어요.":"Even with the other person nearby, they handled what they could on their own and reached out naturally only when help was needed.",
  "끌림과 외모 인식":"Attraction and appearance","상대의 외모를 보는 정도":"Attention to appearance","정하지 않음":"Not set",
  "두려움 정도":"Fear level","상대를 얼마나 우습게 보거나 두려워하는지 강도를 정해요.":"Choose how dismissive or afraid this character feels toward the other person.",
  "가소로움":"Finds them laughable","전혀 두렵지 않음":"Not afraid at all","거의 두렵지 않음":"Hardly afraid","조금 두려움":"Slightly afraid","경계하며 두려워함":"Wary and afraid","많이 두려움":"Very afraid","공포를 느낌":"Terrified","극도로 두려워함":"Extremely terrified",
  "동기화와 불러오기는 필요할 때만 설정에서 사용해요.":"Use Sync or Load here whenever you need them.","Firebase가 막혀도 현재 데이터와 사진을 파일 하나로 보관할 수 있어요.":"Keep your current data and images in one backup file even when cloud sync is unavailable.",
  "이 캐릭터가 상대의 외모를 얼마나 보는지와, 어떤 외형·성격·말투·삶의 태도에 끌리는지를 정해요. 이 설정만으로 관계나 호감은 자동 생성되지 않습니다.":"Choose how much this character notices appearance and which looks, personalities, voices, or attitudes attract them. These choices never create a relationship on their own.",
  "상대별 시선과 관계 단계가 먼저이며, 끌리는 특성은 그 관계 안에서 시선이 머무는 이유와 표현 후보에만 반영됩니다.":"The directed point of view and relationship stage come first. Preferred and disliked traits only shape how that existing point of view is expressed.",
  "거의 보지 않음":"Barely notices","조금 봄":"Notices a little","꽤 중요하게 봄":"Quite important","외모에 크게 끌림":"Strongly drawn to appearance"
});
Object.assign(UI_TEXT.ja,{
  "저장과 동기화":"保存と同期","이 캐릭터가 끌리는 특성 정하기":"惹かれる特徴を選ぶ","이 캐릭터가 비선호하는 특성 정하기":"苦手な特徴を選ぶ","비선호하는 특징 정하기":"苦手な特徴を選ぶ",
  "주변에서는 두 사람을 연인으로 알고 있지만, 지금은 서로의 시간을 존중하며 각자 하던 일에 집중하고 있어요. 가까이 있어도 늘 같은 행동을 해야 한다고 생각하지 않아요.":"周囲には恋人同士として知られていますが、今は互いの時間を尊重し、それぞれのことに集中しています。そばにいるからといって、いつも同じことをする必要はないと考えています。",
  "상대가 곁에 있어도 필요한 일은 먼저 스스로 해낸 뒤, 도움이 필요할 때만 자연스럽게 손을 내밀었어요.":"相手がそばにいても、できることはまず自分で済ませ、助けが必要な時だけ自然に手を伸ばしました。",
  "끌림과 외모 인식":"惹かれ方と外見の認識","상대의 외모를 보는 정도":"外見を重視する度合い","정하지 않음":"未設定",
  "두려움 정도":"恐れの度合い","상대를 얼마나 우습게 보거나 두려워하는지 강도를 정해요.":"相手をどれほど軽く見ているか、または恐れているか、その強さを設定します。",
  "가소로움":"取るに足らないと思う","전혀 두렵지 않음":"まったく怖くない","거의 두렵지 않음":"ほとんど怖くない","조금 두려움":"少し怖い","경계하며 두려워함":"警戒しながら怖がる","많이 두려움":"かなり怖い","공포를 느낌":"恐怖を感じる","극도로 두려워함":"極度に恐れている",
  "동기화와 불러오기는 필요할 때만 설정에서 사용해요.":"必要な時にここで同期・読み込みを行えます。","Firebase가 막혀도 현재 데이터와 사진을 파일 하나로 보관할 수 있어요.":"クラウド同期が使えない場合も、データと画像を1つのバックアップファイルに保存できます。",
  "이 캐릭터가 상대의 외모를 얼마나 보는지와, 어떤 외형·성격·말투·삶의 태도에 끌리는지를 정해요. 이 설정만으로 관계나 호감은 자동 생성되지 않습니다.":"相手の外見をどの程度見るか、どんな見た目・性格・話し方・生き方に惹かれるかを設定します。この設定だけで関係や好意が自動生成されることはありません。",
  "상대별 시선과 관계 단계가 먼저이며, 끌리는 특성은 그 관계 안에서 시선이 머무는 이유와 표현 후보에만 반영됩니다.":"相手への視点と関係段階が優先されます。好み・苦手な特徴は、その関係の中で視線や表現にだけ反映されます。",
  "거의 보지 않음":"ほとんど見ない","조금 봄":"少し見る","꽤 중요하게 봄":"かなり重視する","외모에 크게 끌림":"外見に強く惹かれる"
});
Object.assign(UI_TEXT.en,{
  "성별":"Gender","설정하지 않음":"Not set","남성":"Male","여성":"Female","그외":"Another gender",
  "사용자 닉네임":"User nickname","Google 계정 이름 대신 동기화 화면에 표시하고, 캐릭터가 사용자의 부탁을 말할 때도 이 이름을 사용해요.":"Shown on sync screens instead of your Google account name, and used when characters talk about your requests.","캐릭터들이 뭐라고 부를까요?":"What should the characters call you?",
  "캐릭터 말투":"Character speech style","자동 · 성격에 맞춤":"Auto · Match personality","반말":"Casual speech","존댓말 · 해요체":"Polite speech · Haeyo style","격식 있는 존댓말 · 하십시오체":"Formal polite speech · Hasipsio style","극존칭":"Highly honorific speech","무뚝뚝한 단답":"Curt, brief replies","다정하고 부드러운 말투":"Warm and gentle speech","고풍스러운 말투":"Archaic or classical speech",
  "캐릭터가 직접 말하거나 마을 주인의 부탁을 받아들일지 판단할 때 사용하는 말투예요.":"Used when the character speaks directly or decides how to respond to the village owner's request."
});
Object.assign(UI_TEXT.ja,{
  "성별":"性別","설정하지 않음":"未設定","남성":"男性","여성":"女性","그외":"その他の性別",
  "사용자 닉네임":"ユーザーのニックネーム","Google 계정 이름 대신 동기화 화면에 표시하고, 캐릭터가 사용자의 부탁을 말할 때도 이 이름을 사용해요.":"Googleアカウント名の代わりに同期画面へ表示し、キャラクターがユーザーのお願いについて話す時にもこの名前を使います。","캐릭터들이 뭐라고 부를까요?":"キャラクターたちに何と呼ばれたいですか？",
  "캐릭터 말투":"キャラクターの話し方","자동 · 성격에 맞춤":"自動・性格に合わせる","반말":"ため口","존댓말 · 해요체":"丁寧語・ヘヨ体","격식 있는 존댓말 · 하십시오체":"改まった敬語・ハシプシオ体","극존칭":"最上級の敬語","무뚝뚝한 단답":"ぶっきらぼうな短答","다정하고 부드러운 말투":"優しく穏やかな話し方","고풍스러운 말투":"古風な話し方",
  "캐릭터가 직접 말하거나 마을 주인의 부탁을 받아들일지 판단할 때 사용하는 말투예요.":"キャラクターが直接話す時や、村の持ち主からのお願いにどう応じるか判断する時の話し方です。"
});
Object.assign(UI_TEXT.en,{
  "편집할 항목을 선택하세요.":"Choose what you want to edit.","위치 바꾸기":"Reorder","편집을 저장하고 닫기":"Save edits and close","편집 완료·저장":"Finish editing & save",
  "사진·기본 정보·생활 습관":"Photo · basics · daily habits","외형·건강·접근성":"Appearance · health · accessibility","성향·서사·인지":"Personality · narrative · cognition","취미·음식·콘텐츠":"Hobbies · food · media","최애·소지품":"Favorites · belongings","이미지·표현·파일":"Images · display · files",
  "프로필 사진 첨부":"Add a profile photo","여기서 바로 사진을 등록할 수 있어요. 프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.":"Add a photo here. Profile photos appear as full-bleed circles and stay separate from SD icons.","사진 파일 선택":"Choose photo file","사진 지우기":"Remove photo","미등록":"Not added","투명 SD 아이콘과 단일 LD 일러스트는 ‘사진·SD·LD’ 탭에서 따로 등록해요.":"Add a transparent SD icon and one LD illustration separately under Images · SD · LD.",
  "운전·흡연·주량":"Driving · smoking · alcohol","체크 한 칸 대신 캐릭터의 실제 생활 습관에 가까운 상태를 골라 주세요.":"Choose the option closest to the character's actual habits.","운전면허·운전 경험":"Driver's license & experience","흡연 여부":"Smoking","주량":"Alcohol tolerance",
  "끌림과 외모 인식":"Attraction & appearance","상대의 외모를 보는 정도":"How much appearance matters","이 캐릭터가 끌리는 특성 정하기":"Choose traits this character likes","이 캐릭터가 비선호하는 특성 정하기":"Choose traits this character dislikes",
  "이 캐릭터가 상대의 외모를 얼마나 보는지와, 어떤 외형·성격·말투·삶의 태도에 끌리는지를 정해요. 이 설정만으로 관계나 호감은 자동 생성되지 않습니다.":"Choose how much this character notices appearance and which looks, personalities, voices, or attitudes attract them. These choices do not create a relationship or affection on their own.",
  "상대별 시선과 관계 단계가 먼저이며, 끌리는 특성은 그 관계 안에서 시선이 머무는 이유와 표현 후보에만 반영됩니다.":"The directed point of view and relationship stage come first. Preferred and disliked traits only shape how that existing point of view is expressed.",
  "신체와 외형":"Body & appearance","직접 고른 항목만 묘사에 사용합니다. 머리·눈·화장 설정은 아침 준비, 미용실, 가까운 관계의 시선 같은 생활 장면에 드물게 반영돼요.":"Only selected traits are used in descriptions. Hair, eyes, and makeup occasionally affect morning routines, salon visits, and the gaze of close relationships.","외모가 눈에 띄는 정도":"How noticeable their appearance is","체형":"Body type","현재 머리색":"Current hair color","머리색 설정":"Hair color source","본래 머리색 · 염색모일 때":"Natural hair color · if dyed","머리 기장":"Hair length","머리 결":"Hair texture","왼쪽 눈 색":"Left eye color","오른쪽 눈 색":"Right eye color","화장 정도":"Makeup level","미용실 방문 빈도":"Salon frequency","성형·외형 의료 시술 여부":"Cosmetic or appearance-related procedures","머리 스타일 · 여러 개 선택 가능":"Hairstyles · choose multiple","화장 스타일 · 화장할 때 반영":"Makeup styles · used when wearing makeup",
  "프로필 사진, 투명 SD 아이콘, 전신 LD 일러스트는 전부 별도 파일입니다. 등록하지 않은 칸은 기존 표현을 그대로 사용해요.":"Profile photo, transparent SD icon, and full-body LD illustration are separate files. Empty slots keep the current fallback.","LD 일러스트":"LD illustration","전신 또는 무릎 위 이미지 한 장":"One full-body or knee-up image","LD 파일":"LD file","LD 링크":"LD link","홈화면 LD 일러스트":"Home-screen LD illustration","LD 일러스트는 캐릭터마다 한 장만 등록합니다. 감정은 장면의 배경 효과로 표현해요.":"Each character can have one LD illustration. Emotions are shown through scene background effects.","캐릭터 삭제 전 경고를 확인한 뒤 이 캐릭터와 연결된 기록을 정리해요.":"Review the warning before deleting this character and linked records."
});
Object.assign(UI_TEXT.ja,{
  "편집할 항목을 선택하세요.":"編集する項目を選んでください。","위치 바꾸기":"並べ替え","편집을 저장하고 닫기":"編集を保存して閉じる","편집 완료·저장":"編集完了・保存",
  "사진·기본 정보·생활 습관":"写真・基本情報・生活習慣","외형·건강·접근성":"外見・健康・アクセシビリティ","성향·서사·인지":"性格・物語・認知","취미·음식·콘텐츠":"趣味・食べ物・コンテンツ","최애·소지품":"お気に入り・持ち物","이미지·표현·파일":"画像・表示・ファイル",
  "프로필 사진 첨부":"プロフィール写真を追加","여기서 바로 사진을 등록할 수 있어요. 프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.":"ここで写真を登録できます。プロフィール写真は余白のない円形で表示され、SDアイコンとは別に保存されます。","사진 파일 선택":"写真ファイルを選ぶ","사진 지우기":"写真を削除","미등록":"未登録","투명 SD 아이콘과 단일 LD 일러스트는 ‘사진·SD·LD’ 탭에서 따로 등록해요.":"透過SDアイコンと1枚のLDイラストは「画像・SD・LD」で別々に登録します。",
  "운전·흡연·주량":"運転・喫煙・飲酒","체크 한 칸 대신 캐릭터의 실제 생활 습관에 가까운 상태를 골라 주세요.":"キャラクターの実際の生活習慣に近い状態を選んでください。","운전면허·운전 경험":"運転免許・運転経験","흡연 여부":"喫煙","주량":"お酒の強さ",
  "끌림과 외모 인식":"惹かれ方と外見の認識","상대의 외모를 보는 정도":"外見を重視する度合い","이 캐릭터가 끌리는 특성 정하기":"惹かれる特徴を選ぶ","이 캐릭터가 비선호하는 특성 정하기":"苦手な特徴を選ぶ",
  "이 캐릭터가 상대의 외모를 얼마나 보는지와, 어떤 외형·성격·말투·삶의 태도에 끌리는지를 정해요. 이 설정만으로 관계나 호감은 자동 생성되지 않습니다.":"相手の外見をどの程度見るか、どんな見た目・性格・話し方・生き方に惹かれるかを設定します。この設定だけで関係や好意が自動生成されることはありません。",
  "상대별 시선과 관계 단계가 먼저이며, 끌리는 특성은 그 관계 안에서 시선이 머무는 이유와 표현 후보에만 반영됩니다.":"相手への視点と関係段階が優先されます。好み・苦手な特徴は、その関係の中で視線や表現にだけ反映されます。",
  "신체와 외형":"身体と外見","직접 고른 항목만 묘사에 사용합니다. 머리·눈·화장 설정은 아침 준비, 미용실, 가까운 관계의 시선 같은 생활 장면에 드물게 반영돼요.":"選んだ項目だけを描写に使います。髪・目・メイクは、朝の支度や美容室、親しい相手の視線などに時々反映されます。","외모가 눈에 띄는 정도":"外見の目立ちやすさ","체형":"体型","현재 머리색":"現在の髪色","머리색 설정":"髪色の設定","본래 머리색 · 염색모일 때":"本来の髪色・染めている場合","머리 기장":"髪の長さ","머리 결":"髪質","왼쪽 눈 색":"左目の色","오른쪽 눈 색":"右目の色","화장 정도":"メイクの程度","미용실 방문 빈도":"美容室に行く頻度","성형·외형 의료 시술 여부":"美容・外見に関する医療施術","머리 스타일 · 여러 개 선택 가능":"ヘアスタイル・複数選択可","화장 스타일 · 화장할 때 반영":"メイクスタイル・メイク時に反映",
  "프로필 사진, 투명 SD 아이콘, 전신 LD 일러스트는 전부 별도 파일입니다. 등록하지 않은 칸은 기존 표현을 그대로 사용해요.":"プロフィール写真、透過SDアイコン、全身LDイラストは別々のファイルです。未登録の欄は現在の表示を使います。","LD 일러스트":"LDイラスト","전신 또는 무릎 위 이미지 한 장":"全身または膝上の画像1枚","LD 파일":"LDファイル","LD 링크":"LDリンク","홈화면 LD 일러스트":"ホーム画面のLDイラスト","LD 일러스트는 캐릭터마다 한 장만 등록합니다. 감정은 장면의 배경 효과로 표현해요.":"LDイラストはキャラクターごとに1枚だけ登録します。感情はシーンの背景効果で表現します。","캐릭터 삭제 전 경고를 확인한 뒤 이 캐릭터와 연결된 기록을 정리해요.":"警告を確認してから、このキャラクターと関連する記録を整理します。"
});
Object.assign(UI_TEXT.en,{
  "앱 메뉴":"App menu","메인 화면으로 돌아가기":"Return to the main screen","사진·SD·LD":"Images · SD · LD",
  "프로필 내보내기":"Export profile","캐릭터 저장":"Save character","캐릭터 삭제":"Delete character","새 캐릭터의 신체":"New character's body",
  "체형, 머리, 눈, 화장 같은 외형과 건강·접근성을 나누어 정해요.":"Set body type, hair, eyes, makeup, health, and accessibility in separate groups.","고르지 않은 특성은 장면에서 지어내지 않습니다.":"Traits you leave unset will not be invented in scenes.",
  "프로필 사진 첨부":"Add profile photo","여기서 바로 사진을 등록할 수 있어요. 프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.":"Add a photo here. Profile photos appear as full-bleed circles and are stored separately from SD icons.","사진 링크":"Photo link","기본 생활 마을":"Default home town","집마다 다른 마을을 지정했다면 실제로 머무는 집의 마을이 우선합니다.":"If a home belongs to another town, the town of the home where the character is staying takes priority.",
  "캐릭터 이름":"Character name","나이대":"Age group","끌리는 대상":"Attracted to","직업 종류":"Occupation","표기할 직업명":"Displayed job title","출근할 건물":"Workplace","자동 선택 / 없음":"Automatic / none","자택근무":"Work from home",
  "하지 않음":"None","자동 · 설정에 맞춤":"Auto · Match settings","왼쪽 눈 색":"Left eye color","오른쪽 눈 색":"Right eye color","눈 색":"Eye color","상처·흉터 표현 주의":"Scar and injury portrayal note"
});
Object.assign(UI_TEXT.ja,{
  "앱 메뉴":"アプリメニュー","메인 화면으로 돌아가기":"メイン画面に戻る","사진·SD·LD":"画像・SD・LD",
  "프로필 내보내기":"プロフィールを書き出す","캐릭터 저장":"キャラクターを保存","캐릭터 삭제":"キャラクターを削除","새 캐릭터의 신체":"新しいキャラクターの身体",
  "체형, 머리, 눈, 화장 같은 외형과 건강·접근성을 나누어 정해요.":"体型・髪・目・メイクなどの外見と、健康・アクセシビリティを分けて設定します。","고르지 않은 특성은 장면에서 지어내지 않습니다.":"未設定の特徴をシーンで勝手に作ることはありません。",
  "프로필 사진 첨부":"プロフィール写真を追加","여기서 바로 사진을 등록할 수 있어요. 프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.":"ここで写真を登録できます。プロフィール写真は余白のない円形で表示され、SDアイコンとは別に保存されます。","사진 링크":"写真リンク","기본 생활 마을":"基本生活の村","집마다 다른 마을을 지정했다면 실제로 머무는 집의 마을이 우선합니다.":"家ごとに別の村を指定した場合、実際に滞在している家の村が優先されます。",
  "캐릭터 이름":"キャラクター名","나이대":"年齢層","끌리는 대상":"惹かれる相手","직업 종류":"職業","표기할 직업명":"表示する職業名","출근할 건물":"勤務先","자동 선택 / 없음":"自動選択・なし","자택근무":"在宅勤務",
  "하지 않음":"なし","자동 · 설정에 맞춤":"自動・設定に合わせる","왼쪽 눈 색":"左目の色","오른쪽 눈 색":"右目の色","눈 색":"目の色","상처·흉터 표현 주의":"傷・傷跡の表現について"
});
const unorderedSettingsContent=settingsContent;
settingsContent=()=>{
  let html=unorderedSettingsContent();
  const sync=html.match(/<section class="sync-panel">[\s\S]*?<\/section>/)?.[0]||"";
  const backup=html.match(/<section class="setting-card"><h2>브라우저 백업 파일<\/h2>[\s\S]*?<\/section>/)?.[0]||"";
  html=html.replace(sync,"").replace(backup,"");
  const orderedSync=sync.replace("Google 계정과 데이터","저장과 동기화");
  return html.replace("</h1>",`</h1>${orderedSync}${backup}`);
};
Object.assign(UI_TEXT.en,{
  "내 캐릭터 통계 보고서":"My Character Statistics Report",
  "현재 저장된":"Currently saved",
  "명의 설정을 항목별 비율과 평균으로 모아 보여줘요.":"characters are summarized as distributions and averages.",
  "저장된 캐릭터":"Saved characters",
  "평균 기상 시각":"Average wake time","평균 취침 시각":"Average bedtime",
  "운전면허 보유 비율":"Licensed drivers","흡연자 비율":"Smokers",
  "성별 분포":"Gender distribution","여성":"Female","남성":"Male","그 외":"Other","명":"characters",
  "운전면허 보유":"Licensed drivers","흡연 캐릭터":"Characters who smoke","신체 설정 반영":"Body profile coverage","보조기기·접근성 설정":"Assistive devices & accessibility",
  "성별":"Gender","나이대":"Age group","직업":"Occupation","말투":"Speech style","성격 유형":"Personality types","생활 마을":"Home town",
  "소비 유형":"Spending style","재산":"Wealth","기상 습관":"Wake-up habit","수면 습관":"Sleep habit",
  "사람과 어울리는 방식":"Social style","일정을 다루는 방식":"Planning style","깔끔한 정도":"Tidiness","갈등 대응":"Conflict response","애정 표현":"Affection style",
  "운전면허·운전 경험":"Licence & driving experience","흡연 여부":"Smoking","주량":"Alcohol tolerance","체형":"Body type","신체 특징":"Physical traits","머리색":"Hair color","머리 길이":"Hair length","머리 질감":"Hair texture","눈동자 색":"Eye color","화장 정도":"Makeup level","화장 스타일":"Makeup style","건강 상태":"Health conditions","휠체어 사용":"Wheelchair use","의수 사용":"Prosthetic arm","의족 사용":"Prosthetic leg","청각 상태":"Hearing","시각 상태":"Vision","접근성 선호":"Accessibility preferences",
  "마을 미지정":"No town assigned","아직 표시할 캐릭터가 없어요.":"There are no characters to summarize yet.",
  "보고서 다운로드":"Download report","캐릭터 통계 보고서를 저장했습니다":"Character statistics report saved",
  "홈 화면 도구":"Home screen tools","화면 편집":"Edit display","통계":"Statistics",
  "홈 화면 편집":"Edit home display","홈화면 기본 표현":"Default home display","SD 이미지 크기":"SD image size","LD 이미지 크기":"LD image size",
  "두 명이 함께 나올 때도 각 LD의 높이와 크기는 한 명일 때와 같고, 위치만 왼쪽과 오른쪽으로 나뉩니다.":"With two characters, each LD keeps the same size and height as a solo LD; only their positions shift left and right.",
  "완료":"Done","캐릭터 통계 보고서":"Character Statistics Report"
});
Object.assign(UI_TEXT.ja,{
  "내 캐릭터 통계 보고서":"マイキャラクター統計レポート",
  "현재 저장된":"現在保存されている",
  "명의 설정을 항목별 비율과 평균으로 모아 보여줘요.":"人の設定を項目別の割合と平均でまとめて表示します。",
  "저장된 캐릭터":"保存されたキャラクター",
  "평균 기상 시각":"平均起床時刻","평균 취침 시각":"平均就寝時刻",
  "운전면허 보유 비율":"免許保有率","흡연자 비율":"喫煙者率",
  "성별 분포":"性別分布","여성":"女性","남성":"男性","그 외":"その他","명":"人",
  "운전면허 보유":"運転免許保有","흡연 캐릭터":"喫煙キャラクター","신체 설정 반영":"身体設定の反映","보조기기·접근성 설정":"補助機器・アクセシビリティ設定",
  "성별":"性別","나이대":"年齢層","직업":"職業","말투":"話し方","성격 유형":"性格タイプ","생활 마을":"生活する村",
  "소비 유형":"消費タイプ","재산":"財産","기상 습관":"起床習慣","수면 습관":"睡眠習慣",
  "사람과 어울리는 방식":"人との関わり方","일정을 다루는 방식":"予定の立て方","깔끔한 정도":"整理整頓の度合い","갈등 대응":"対立への対応","애정 표현":"愛情表現",
  "운전면허·운전 경험":"免許・運転経験","흡연 여부":"喫煙状況","주량":"酒量","체형":"体型","신체 특징":"身体的特徴","머리색":"髪色","머리 길이":"髪の長さ","머리 질감":"髪質","눈동자 색":"瞳の色","화장 정도":"メイクの濃さ","화장 스타일":"メイクスタイル","건강 상태":"健康状態","휠체어 사용":"車いすの使用","의수 사용":"義手の使用","의족 사용":"義足の使用","청각 상태":"聴覚","시각 상태":"視覚","접근성 선호":"アクセシビリティの希望",
  "마을 미지정":"村未設定","아직 표시할 캐릭터가 없어요.":"集計できるキャラクターはまだいません。",
  "보고서 다운로드":"レポートをダウンロード","캐릭터 통계 보고서를 저장했습니다":"キャラクター統計レポートを保存しました",
  "홈 화면 도구":"ホーム画面ツール","화면 편집":"画面編集","통계":"統計",
  "홈 화면 편집":"ホーム画面編集","홈화면 기본 표현":"ホーム画面の基本表示","SD 이미지 크기":"SD画像サイズ","LD 이미지 크기":"LD画像サイズ",
  "두 명이 함께 나올 때도 각 LD의 높이와 크기는 한 명일 때와 같고, 위치만 왼쪽과 오른쪽으로 나뉩니다.":"2人で表示する場合も、各LDの大きさと高さは1人の時と同じで、位置だけが左右に移動します。",
  "완료":"完了","캐릭터 통계 보고서":"キャラクター統計レポート"
});
function businessInformationFooter(){
  const language=state.uiLanguage;
  const copy=language==="en"?{
    aria:"Business and policy information",registration:"Business registration no.",representative:"Representative",hosting:"Hosting provider",mailOrder:"Mail-order sales registration",pending:"Pending",verify:"Verify business information",support:"Customer support",email:"Email",address:"Business address",privacy:"Privacy Policy",terms:"Terms of Service",toss:"Toss Payments Terms"
  }:language==="ja"?{
    aria:"事業者・ポリシー情報",registration:"事業者登録番号",representative:"代表者",hosting:"ホスティング事業者",mailOrder:"通信販売業届出番号",pending:"届出手続き中",verify:"事業者情報を確認",support:"カスタマーサポート",email:"メール",address:"事業所住所",privacy:"プライバシーポリシー",terms:"利用規約",toss:"Toss Payments 利用規約"
  }:{
    aria:"사업자 및 정책 정보",registration:"사업자등록번호",representative:"대표",hosting:"호스팅서비스",mailOrder:"통신판매업 신고번호",pending:"신고 진행 중",verify:"사업자정보확인",support:"고객센터",email:"이메일",address:"사업장 주소",privacy:"개인정보처리방침",terms:"서비스 이용약관",toss:"토스페이먼츠 이용약관"
  };
  const tossTerms=window.PARALLEL_CITY_CONFIG?.nativeApp?"":`<a href="https://pages.tosspayments.com/terms/user" target="_blank" rel="noopener">${copy.toss}</a>`;
  return `<footer class="settings-business-footer" aria-label="${copy.aria}"><b>까륵</b><p>${copy.registration} : 540-17-02654 <i></i> ${copy.representative} : 김세은<br>${copy.hosting} : Cloudflare, Inc. <i></i> ${copy.mailOrder} : ${copy.pending} <a href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=5401702654" target="_blank" rel="noopener">${copy.verify}</a><br>${copy.support} : <a href="tel:01076630610">010-7663-0610</a> <i></i> ${copy.email} : <a href="mailto:kkyaareuk@gmail.com">kkyaareuk@gmail.com</a><br>${copy.address} : 서울특별시 양천구 신정중앙로 68, 403-133호(신정동, 해풍빌딩)</p><nav aria-label="${copy.aria}"><a href="./privacy.html">${copy.privacy}</a><a href="./terms.html">${copy.terms}</a>${tossTerms}</nav></footer>`;
}
function settings(){return settingsContent().replace(/<\/section>$/,`${businessInformationFooter()}</section>`)}
function townPlaceEditor(p,items,audiences,selected){
  return `<details class="${selected?"mobile-selected":""}" ${selected?"open":""}><summary><b>${esc(p.emoji)} ${esc(p.name)}</b></summary><div class="place-edit-heading"><span><b>${esc(p.name)} 편집</b><small>유형을 먼저 고르면 어울리는 건물 모양을 추천해요.</small></span><button class="danger" data-delete-place="${p.id}">이 건물 삭제</button></div><div class="place-config"><label>건물 이름<input data-place-field="name" data-place-id="${p.id}" value="${esc(p.name)}"></label><label>건물 유형<select data-place-field="type" data-place-id="${p.id}">${placeTypeOptions(p)}</select></label><label>세부 유형<select data-place-field="subtype" data-place-id="${p.id}">${placeSubtypeOptions(p)}</select></label><label>가격대<select data-place-field="priceRange" data-place-id="${p.id}">${["저렴","보통","고급","명품"].map(x=>`<option ${p.priceRange===x?"selected":""}>${x}</option>`).join("")}</select></label><label>마을 속 건물 크기<input type="range" min=".45" max="1.5" step=".05" data-place-field="imageScale" data-place-id="${p.id}" value="${p.imageScale||1}"></label><label>매운맛 정도<select data-place-field="spicy" data-place-id="${p.id}">${levelOptions(SPICE_LEVELS,p.spicy||0)}</select></label><label>단맛 정도<select data-place-field="sweet" data-place-id="${p.id}">${levelOptions(SWEET_LEVELS,p.sweet||0)}</select></label></div><div class="place-photo-tools"><b>지도에 표시할 건물 모양</b><span><button data-building-shape-open="${p.id}">건물 모양 선택</button></span><b>생활 로그·현재 장면용 내부 사진</b><span><button data-place-interior-image="${p.id}">내부 사진 업로드</button><button data-image-url="placeInterior" data-id="${p.id}">링크</button>${p.interiorImage?`<button data-clear-place-interior-image="${p.id}">지우기</button>`:""}</span></div><h4>주요 이용층</h4><div class="stock-picker">${audiences.map(x=>`<button data-place-audience="${p.id}" data-value="${x}" class="${(p.audiences||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><h4>이곳에서 파는 것·이용할 수 있는 것</h4><div class="stock-list stock-picker">${items.map(item=>`<button data-place-stock="${p.id}" data-item-id="${item.id}" class="${(p.stock||[]).includes(item.id)?"on":""}">${CATALOG_LABELS[item.kind]} · ${esc(item.name)}</button>`).join("")}</div></details>`;
}
function townMobile(){
  const items=catalogItems(),audiences=["아재 입맛","어린이 입맛","가족","연인·데이트","학생","고소득","오타쿠"];
  const selectedPlace=state.world.places.find(place=>place.id===mobileTownPanel);
  if(mobileTownPanel&&mobileTownPanel!=="world"&&!selectedPlace)mobileTownPanel="";
  const panelType=mobileTownPanel==="world"?"world":selectedPlace?"place":"";
  const localIds=state.order.filter(id=>visibleTownId(state.characters[id])===state.activeTownId);
  const characterId=localIds.includes(state.activeId)?state.activeId:localIds[0];
  const character=state.characters[characterId],entry=character?eventFor(character):null;
  const characterCard=character&&entry?`<button type="button" class="mobile-town-character-card" data-mobile-town-character="${character.id}" style="--native-own:${esc(character.theme?.primary||"#176b60")}">${avatar(character)}<span><small>관찰 중</small><b>${esc(character.name)} · ${esc(entry.title)}</b><em>${esc(entry.desc)}</em></span></button>`:`<div class="mobile-town-character-card empty"><span><b>이 마을에 있는 캐릭터가 없어요</b><em>캐릭터 프로필에서 생활 마을을 지정할 수 있어요.</em></span></div>`;
  const desktopTabs=`<div class="town-tabs">${state.towns.map(t=>`<button data-town-select="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}<button data-add-town>+ 마을 추가</button>${state.towns.length>1?`<button class="danger" data-delete-town="${state.activeTownId}">현재 마을 삭제</button>`:""}</div>`;
  const mobileSwitcher=`<div class="mobile-town-switcher">${state.towns.map(t=>`<button data-town-select="${t.id}" class="${t.id===state.activeTownId?"on":""}" aria-label="${esc(t.name)}">${esc(t.name)}</button>`).join("")}</div>`;
  const generalEditor=`<div class="town-general-editor"><div class="title"><h2>마을 편집</h2><button class="primary" data-town-save>저장</button></div><section class="inline-guide"><b>마을을 만드는 순서</b><ol><li>마을 이름과 배경을 고르세요.</li><li>건물을 추가하고 유형을 고르세요.</li><li>지도에서 건물을 끌어 위치를 정하세요.</li></ol></section><label>마을 이름<input data-world-name value="${esc(state.world.name)}"></label><label>마을 시대<select data-world-era><option value="modern" ${state.world.era!=="medieval"?"selected":""}>현대</option><option value="medieval" ${state.world.era==="medieval"?"selected":""}>중세</option></select><small>시대에 맞는 생활 표현을 적용합니다.</small></label><label>기본 배경<select data-world-bg><option value="world-assets/cozy-town.png" selected>제공한 손그림 마을</option></select></label><button data-add-place>+ 건물 추가</button></div>`;
  const placeEditors=state.world.places.map(place=>townPlaceEditor(place,items,audiences,place.id===mobileTownPanel)).join("");
  return `<section class="mobile-town-shell ${mobileTownEditing?"editing":""} ${panelType?`sheet-open ${panelType}-panel`:""}">${desktopTabs}<div class="mobile-town-hud"><span><small>현재 마을</small><b>${esc(state.world.name)}</b></span><button type="button" data-mobile-town-edit-toggle class="${mobileTownEditing?"on":""}">${mobileTownEditing?"편집 종료":"편집 모드"}</button></div>${mobileTownEditing?`<div class="mobile-town-tools"><button type="button" data-mobile-town-settings>마을 설정</button><button type="button" data-add-place>+ 건물</button></div>`:""}<div class="town-edit"><div class="town-map-scroll"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}${state.world.places.map(peopleAtPlaceCard).join("")}${townHomes().map(peopleAtHomeCard).join("")}</div></div><aside class="panel form town-editor-panel"><div class="mobile-town-sheet-head"><span><small>${panelType==="world"?"TOWN SETTINGS":"BUILDING SETTINGS"}</small><b>${panelType==="world"?esc(state.world.name):esc(selectedPlace?.name||"건물 편집")}</b></span><button type="button" data-mobile-town-close aria-label="편집 창 닫기">×</button></div>${generalEditor}<div class="place-editor">${placeEditors}</div></aside></div>${characterCard}${mobileSwitcher}${buildingDetailDialogs()}</section>`;
}
function view(){
  if(!state.order.length)return `<section class="panel empty"><h1>첫 캐릭터를 만들어 주세요</h1><p>로그인 전에는 예시 캐릭터나 실제 지역이 표시되지 않아요.</p><button class="primary" data-new>+ 캐릭터 만들기</button></section>`;
  return ({observe,home,character,catalog,relationship,routine,statistics,town:townMobile,shop,settings}[state.activeTab]||observe)();
}
export function renderApp(next){
  if((!next.activeId||!next.characters[next.activeId])&&next.order.length)next.activeId=next.order[0];
  let content;
  try{content=view()}
  catch(error){
    console.error(`화면 일부 렌더링 실패 · ${state.activeTab}`,error);
    content=`<section class="panel empty view-error"><h1>이 화면의 일부 데이터를 읽지 못했어요</h1><p>저장 데이터는 지우거나 바꾸지 않았습니다. 다른 화면은 계속 사용할 수 있어요.</p><div class="sync-actions"><button class="primary" data-tab="observe">관찰 화면으로 이동</button><button data-tab="settings">설정 열기</button></div></section>`;
  }
  const appRoot=document.querySelector("#app");
  document.documentElement.dataset.activeTab=state.activeTab;
  appRoot.innerHTML=`${header()}<main>${content}</main>`;
  normalizeDisplayedParticles(appRoot);
  localizeLanguageSelector(appRoot);
  translateInterface(appRoot);
  const backgroundSelect=document.querySelector("[data-world-bg]");
  if(backgroundSelect){
    [...backgroundSelect.options].forEach(option=>{
      if(option.value.includes("cozy-town"))option.textContent="마을";
      else if(option.value.includes("downtown"))option.textContent="도시";
      else if(option.value.includes("department-store"))option.textContent="백화점 아트리움";
    });
  }
}
export function setAccountLabel(text){accountText=text;const el=document.querySelector("#account-status");if(el)el.textContent=translatedUiText(text)}
export function setAccountEntitlements(value){accountEntitlements={backgroundPacks:Array.isArray(value?.backgroundPacks)?value.backgroundPacks:[],iconPacks:Array.isArray(value?.iconPacks)?value.iconPacks:[],dlcPacks:Array.isArray(value?.dlcPacks)?value.dlcPacks:[],purchases:Array.isArray(value?.purchases)?value.purchases:[],characterSlotPacks:Math.max(0,Number(value?.characterSlotPacks)||0),townSlotPacks:Math.max(0,Number(value?.townSlotPacks)||0),storage50:Boolean(value?.storage50),teaSupportMonth:String(value?.teaSupportMonth||"")}}

const CART_KEY="drawer-village-cart";
const SHOP_PRODUCTS={
  character_slots_5:{label:"캐릭터 슬롯",title:"캐릭터 5명 추가",description:"캐릭터 슬롯 5개가 결제 즉시 계정에 영구 적용됩니다. 결제일부터 최소 6개월간 이용을 보장하며, 이후에도 서비스 운영 기간 동안 유지됩니다.",price:1200},
  town_slot_1:{label:"마을 슬롯",title:"마을 1개 추가",description:"마을 슬롯 1개가 결제 즉시 계정에 영구 적용됩니다. 결제일부터 최소 6개월간 이용을 보장하며, 이후에도 서비스 운영 기간 동안 유지됩니다.",price:1900},
  green_tea:{label:"개발 응원",title:"개발자에게 녹차 사주기 🍵",description:"잘 먹겠습니다 🥹",price:1500}
};
const jobExpansionCard=()=>`<section class="shop-coming shop-expansion-showcase" data-product-id="job_expansion"><div class="expansion-art"><img src="./shop-assets/resume-expansion.png" alt="이력서를 제출해요 확장팩 이미지"></div><div class="expansion-copy"><span>확장팩 · 출시 준비 중</span><small>직업 확장팩</small><h2>이력서를 제출해요</h2><p>기존 직업에 더 세밀한 위계와 직급, 직장 내 관계, 실제 근무 장소와 구체적인 근무 내용을 더합니다. 상사와 부하 직원, 동료 사이의 역할과 업무 흐름이 생활 장면과 주간 일정에 이어지는 대규모 직업 확장팩이에요.</p><ul><li>직업별 위계·직급과 승진 흐름</li><li>상사·동료·부하 직원의 직장 내 관계</li><li>근무 장소·부서·담당 업무와 전용 생활 장면</li></ul><div><b>가격 미정</b><button type="button" disabled>출시 준비 중</button></div></div></section>`;
const readCart=()=>{try{const value=JSON.parse(localStorage.getItem(CART_KEY)||"{}");return value&&typeof value==="object"?value:{}}catch{return {}}};
function nativePlayShop(){
  const products=Object.entries(SHOP_PRODUCTS).map(([id,item])=>{
    const owned=id==="character_slots_5"?Number(accountEntitlements.characterSlotPacks)||0:id==="town_slot_1"?Number(accountEntitlements.townSlotPacks)||0:0;
    return `<article class="premium-product one-time-product" data-product-id="${id}"><div class="premium-product-heading"><span>${id==="green_tea"?"응원":"Google Play"}</span><div><small>${item.label}</small><h2>${item.title}</h2></div><b data-play-price="${id}">Play 결제창에서 확인</b></div><p>${item.description}</p>${owned?`<div class="premium-current"><b>${owned}회 구매 · 현재 적용 중</b></div>`:""}<button class="primary premium-buy" data-play-purchase="${id}">Google Play에서 구매</button></article>`;
  }).join("");
  return `<section class="panel form dlc-store shop-store native-play-store"><div class="title"><div><h1>상점</h1><p>Android 앱의 디지털 상품은 Google Play 결제로 구매합니다. 가격은 Play Console에 등록한 국가별 가격으로 표시돼요.</p></div></div><section class="preview-notice play-billing-notice"><b>Google Play 안전 결제</b><p>구매는 Play 결제창에서 진행되며, 서버에서 구매 토큰을 확인한 뒤에만 슬롯과 저장 공간을 지급합니다.</p></section><div class="shop-product-grid">${products}</div><div class="shop-expansion-heading"><small>COMING NEXT</small><h2>확장팩</h2></div>${jobExpansionCard()}<section class="shop-coming"><h2>구매 복원</h2><p>같은 Google 계정의 미처리 구매는 앱 시작과 계정 동기화 때 다시 확인할 수 있어요.</p><button data-play-restore>Google Play 구매 내역 확인</button></section></section>`;
}
function shop(){
  if(window.PARALLEL_CITY_CONFIG?.nativeApp)return nativePlayShop();
  const cart=readCart();
  const lines=Object.entries(cart).filter(([id,qty])=>SHOP_PRODUCTS[id]&&!SHOP_PRODUCTS[id].disabled&&Number(qty)>0);
  const total=lines.reduce((sum,[id,qty])=>sum+SHOP_PRODUCTS[id].price*Number(qty),0);
  const cartLimit=50000;
  const isOverLimit=total>=cartLimit;
  const canAddToCart=id=>total+(Number(SHOP_PRODUCTS[id]?.price)||0)<cartLimit;
  const product=(id,item,ownedCount=0)=>`<article class="premium-product one-time-product" data-product-id="${id}"><div class="premium-product-heading"><span>${id==="green_tea"?"응원":"일회성 구매"}</span><div><small>${item.label}</small><h2>${item.title}</h2></div><b>${item.price==null?"책정 중":`${item.price.toLocaleString("ko-KR")}원`}</b></div><p>${item.description}</p>${ownedCount?`<div class="premium-current"><b>${id==="storage_50mb"?"50MB 적용 중":`${ownedCount}회 구매 · 현재 적용 중`}</b><small>${id==="storage_50mb"?"이미 적용된 계정에서는 다시 구매하지 않아요.":"구매 수량만큼 계정에 계속 더해집니다."}</small></div>`:""}${previewMode()?`<button class="premium-buy" disabled>사전 체험 중 구매 불가</button>`:id==="storage_50mb"&&ownedCount?`<button class="premium-buy" disabled>이미 적용 중</button>`:item.disabled?`<button class="premium-buy" disabled>용량·가격 확정 후 구매 가능</button>`:canAddToCart(id)?`<button class="primary premium-buy" data-cart-add="${id}">장바구니에 담기</button>`:`<button class="premium-buy" disabled>이 상품을 더 담으면 5만원 이상이에요</button>`}</article>`;
  const cartHtml=lines.length?lines.map(([id,qty])=>{const item=SHOP_PRODUCTS[id],totalTitle=id==="character_slots_5"?`캐릭터 ${qty*5}명 추가`:id==="town_slot_1"?`마을 ${qty}개 추가`:id==="green_tea"?`녹차 ${qty}잔 사주기`:item.title;return `<article class="cart-line"><div><b>${totalTitle}</b><small>${item.title} · ${item.price.toLocaleString("ko-KR")}원 × ${qty}</small></div><div class="cart-quantity"><button data-cart-minus="${id}" aria-label="${item.title} 수량 줄이기">−</button><b>${qty}</b><button data-cart-plus="${id}" aria-label="${item.title} 수량 늘리기" ${id==="storage_50mb"||!canAddToCart(id)?"disabled":""}>+</button></div><b>${(item.price*qty).toLocaleString("ko-KR")}원</b><button class="cart-remove" data-cart-remove="${id}">빼기</button></article>`}).join(""):`<p class="cart-empty">아직 장바구니가 비어 있어요.</p>`;
  const count=lines.reduce((sum,[,qty])=>sum+Number(qty),0);
  const limitDetail=state.uiLanguage==="en"?(isOverLimit?"Reduce the quantity until the total is below KRW 50,000.":`Current total: KRW ${total.toLocaleString("en-US")} · Products that would reach the limit cannot be added.`):state.uiLanguage==="ja"?(isOverLimit?"合計が5万ウォン未満になるまで数量を減らしてください。":`現在 ${total.toLocaleString("ko-KR")}ウォン・上限に達する商品は追加できません。`):(isOverLimit?"수량을 줄여 결제금액을 50,000원 미만으로 맞춰 주세요.":`현재 ${total.toLocaleString("ko-KR")}원 · 한도에 닿는 상품은 더 담을 수 없어요.`);
  return `<section class="panel form dlc-store shop-store"><div class="title"><div><h1>상점</h1><p>원하는 상품과 수량을 장바구니에 담아 한 번에 결제할 수 있어요.</p></div></div>${previewMode()?`<section class="preview-notice"><b>${esc(previewConfig().label||"사전 체험")} 기간이에요</b><p>${esc(previewConfig().message||"현재 기능을 점검하고 있어 실제 결제는 진행되지 않아요.")}</p></section>`:""}<div class="shop-product-grid">${product("character_slots_5",SHOP_PRODUCTS.character_slots_5,Number(accountEntitlements.characterSlotPacks)||0)}${product("town_slot_1",SHOP_PRODUCTS.town_slot_1,Number(accountEntitlements.townSlotPacks)||0)}${product("green_tea",SHOP_PRODUCTS.green_tea,0)}</div><div class="shop-expansion-heading"><small>COMING NEXT</small><h2>확장팩</h2></div>${jobExpansionCard()}<section class="shop-cart"><div class="title"><div><h2>장바구니</h2><p>${previewMode()?"사전 체험이 끝난 뒤 이용할 수 있어요.":"같은 상품도 여러 개 담을 수 있어요."}</p></div><b>${count}개</b></div><div class="premium-current"><b>한 번 결제 금액은 5만원 미만이어야 해요.</b><small>${limitDetail}</small></div><div class="cart-lines">${cartHtml}</div><div class="cart-total"><span>총 결제금액</span><b>${total.toLocaleString("ko-KR")}원</b></div>${previewMode()?`<span class="premium-buy disabled" aria-disabled="true">사전 체험 중에는 결제하지 않아요</span>`:`<a class="primary premium-buy ${lines.length&&!isOverLimit?"":"disabled"}" ${lines.length&&!isOverLimit?'href="./payment.html?cart=1" aria-disabled="false"':'aria-disabled="true"'}>${isOverLimit?"수량을 줄여 주세요":"장바구니 결제하기"}</a>`}</section><div class="dlc-hidden" hidden>${dlc()}</div></section>`;
}
