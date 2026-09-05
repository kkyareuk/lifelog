// 모든 화면과 이벤트가 반드시 app.js와 같은 상태 모듈 인스턴스를 본다.
// 캐시 키가 다르면 브라우저는 같은 state.js를 별도 모듈로 취급해 버튼은
// 새 상태를 바꾸고 화면은 예전 상태를 그리는 치명적인 불일치가 생긴다.
import {state,active,characterViewFor,explicitCharacterViewFor} from "./state.js?v=20260906dev232";
import {renderDictionary,itemArt} from "./dictionary.js?v=20260906dev232";
import {PLACEMENTS,characterPlacement,orderAnimationCharacters} from "./character-placement.js?v=20260906dev232";
import {characterMood} from "./character-mood.js?v=20260906dev232";
import {createContactMailbox} from "./notification-mail.js?v=20260906dev232";
import {dictionaryCopy} from "./dictionary-copy.js?v=20260906dev232";
import {eventFor as simulateEventFor,visibleTimeline as simulateVisibleTimeline,homeGroups} from "./simulation.js?v=20260906dev232";
import {SPEECH_STYLE_OPTIONS} from "./speech-styles.js?v=20260906dev232";
import {furnitureFootprint,furnitureIcon,furnitureLabel,furniturePropIcon,normalizeFurniturePlacements,supportsFurnitureProps} from "./furniture-layout.js?v=20260906dev232";
import {homeSurfaceImage,normalizeHomeSurface,normalizeWallSurface,wallSurfaceImage} from "./home-surfaces.js?v=20260906dev232";
import {TOWN_TYPE_SUBTYPES,TOWN_TYPES,TOWN_REPUTATIONS,TOWN_FAME_LEVELS,TOWN_TERRAINS,TOWN_TRANSPORTS} from "./town-profile.js?v=20260906dev232";
import {normalizeBuildingLighting,buildingLightsOn,scheduleTownLighting} from "./town-lighting.js?v=20260906dev232";
import {accountStorage as localStorage} from "./account-storage.js?v=20260906dev232";
import {achievementRows} from "./achievements.js?v=20260906dev232";
import {homeEditorCopy,homeFurnitureDrawer,homeRoomBrowser,homeMemberMenu,homeInformationMarkup} from "./home-editor-ui.js?v=20260906dev232";
import {homeSleepAnimation} from "./home-simulation.js?v=20260906dev232";
import {WALKING_STYLE_OPTIONS,walkingGait,walkStyleClassFor} from "./walking-gaits.js?v=20260906dev232";
const esc=(x="")=>String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const I18N={
  en:{brandName:"Drawer Village",observe:"Observe",mailbox:"Mailbox",home:"Home",character:"Characters",catalog:"Dictionary",relationship:"Relationships",routine:"Schedule",statistics:"Statistics",town:"Town",shop:"Shop",settings:"Settings",saved:"Saved on this device",brandTagline:"Character life observation game",currentMoment:"Current moment",todayLog:"Today's log",expand:"Expand",collapse:"Collapse",viewAll:"View all",viewHome:"View home",gridEdit:"Grid edit",floorUp:"Go up one floor",floorDown:"Go down one floor",floorLabel:n=>`F${n}`,language:"Language",languageHelp:"English covers the main interface, and more life scenes and relationship text are translated with every update.",languageNote:"English Beta · Interface and selected life scenes translated; coverage keeps expanding.",mailArrived:"A letter has arrived",mailReady:"Open it when you are ready. Your choice will continue into their actual schedule.",mailEmpty:"No letters have arrived yet",mailEmptyHelp:"Questions, choices, worries, and check-ins from your characters will arrive here.",mailboxHelp:"Read all character letters in one place.",openLetter:"Open letter",characterPicker:"Choose a character to observe",currentTownResidents:"Characters in this town",moveToAnotherTown:"Move to another town",close:"Close",noSleepingRoom:"Other · None (does not stay overnight)",locationExterior:"Current building exterior",inTransit:"In transit",outAndAbout:"Out and about",emptyTownTitle:"No characters live in this town yet",emptyTownHelp:"Choose a home town from the Characters screen.",openCharacterSettings:"Open character settings"},
  ja:{brandName:"ひきだし村",observe:"観察",mailbox:"郵便箱",home:"家",character:"人物",catalog:"辞典",relationship:"関係",routine:"予定",statistics:"統計",town:"村",shop:"店",settings:"設定",saved:"端末に保存済み",brandTagline:"引き出しの中のキャラクター生活観察ゲーム",currentMoment:"今この瞬間",todayLog:"今日の記録",expand:"開く",collapse:"閉じる",viewAll:"すべて見る",viewHome:"家を見る",gridEdit:"グリッド編集",floorUp:"一つ上の階へ",floorDown:"一つ下の階へ",floorLabel:n=>`${n}階`,language:"言語",languageHelp:"日本語は基本画面に対応し、生活シーンや関係文もアップデートごとに翻訳を増やしています。",languageNote:"日本語ベータ・基本画面と一部の生活シーンに対応。翻訳範囲を継続して拡大します。",mailArrived:"手紙が届きました",mailReady:"準備ができたら手紙を開いてください。選択は実際の生活予定に反映されます。",mailEmpty:"届いた手紙はまだありません",mailEmptyHelp:"キャラクターからの質問・選択・悩み・近況はここに届きます。",mailboxHelp:"キャラクターからの手紙をここでまとめて確認できます。",openLetter:"手紙を開く",characterPicker:"観察する人物を選ぶ",currentTownResidents:"この村の人物",moveToAnotherTown:"別の村へ移動",close:"閉じる",noSleepingRoom:"その他・なし（宿泊しない）",locationExterior:"現在の建物の外観",inTransit:"移動中",outAndAbout:"外出中",emptyTownTitle:"この村にはまだキャラクターが住んでいません",emptyTownHelp:"キャラクター画面で生活する村を選んでください。",openCharacterSettings:"キャラクター設定を開く"}
};
Object.assign(I18N.en,dictionaryCopy.en);Object.assign(I18N.ja,dictionaryCopy.ja);
Object.assign(I18N.en,{"작은 서랍 속,":"Inside a little drawer,","너만의 이야기":"a story of your own","캐릭터의 하루가 모이는 곳":"A home for your characters’ everyday stories","이름과 모습을 정하면, 이 마을에서 첫 하루가 시작돼요.":"Choose a name and a face. Their first day in this village begins with you.","첫 캐릭터 만들기":"Create your first character","내 마을 불러오기":"Load my village","이미 마을이 있다면, 먼저 불러와 주세요.":"Already have a village? Load it before starting a new one.","캐릭터의 하루":"Everyday life","함께 쌓는 관계":"Growing relationships","꾸미는 집과 마을":"Homes and villages","계정 기록을 확인하는 중…":"Checking your account save…","설정 열기":"Open settings"});
Object.assign(I18N.ja,{"작은 서랍 속,":"小さな引き出しに、","너만의 이야기":"あなただけの物語","캐릭터의 하루가 모이는 곳":"キャラクターたちの日々が集まる場所","이름과 모습을 정하면, 이 마을에서 첫 하루가 시작돼요.":"名前と姿を決めたら、この村で最初の一日が始まります。","첫 캐릭터 만들기":"最初のキャラクターを作る","내 마을 불러오기":"自分の村を読み込む","이미 마을이 있다면, 먼저 불러와 주세요.":"すでに村がある場合は、先に読み込んでください。","캐릭터의 하루":"キャラクターの日々","함께 쌓는 관계":"育んでいく関係","꾸미는 집과 마을":"彩る家と村","계정 기록을 확인하는 중…":"アカウントの記録を確認中…","설정 열기":"設定を開く"});
Object.assign(I18N.en,{"현실 시간":"Local real time","건물 불빛":"Building lights","조명 방식":"Lighting mode","설정한 시간에 켜기":"Scheduled lighting","항상 켜기":"Always on","항상 끄기":"Always off","켜지는 시간":"Lights on at","꺼지는 시간":"Lights off at","기기의 현실 시간 기준 · 같은 시각으로 설정하면 24시간 켜져요.":"Uses device local time. Matching times keep lights on for 24 hours.","이 건물 그림에는 아직 불빛 레이어가 없어요.":"This building artwork does not have a light layer yet.","계정 데이터를 전환하지 못했습니다 · 다시 로그인해 주세요":"Could not switch account data. Please sign in again."});
Object.assign(I18N.ja,{"현실 시간":"端末の現在時刻","건물 불빛":"建物の明かり","조명 방식":"照明モード","설정한 시간에 켜기":"時間を指定","항상 켜기":"常に点灯","항상 끄기":"常に消灯","켜지는 시간":"点灯時刻","꺼지는 시간":"消灯時刻","기기의 현실 시간 기준 · 같은 시각으로 설정하면 24시간 켜져요.":"端末の現在時刻に従います。同じ時刻なら24時間点灯します。","이 건물 그림에는 아직 불빛 레이어가 없어요.":"この建物の絵には照明レイヤーがまだありません。","계정 데이터를 전환하지 못했습니다 · 다시 로그인해 주세요":"アカウントを切り替えられませんでした。再ログインしてください。"});
Object.assign(I18N.en,{"같이 TV 보는 중":"Watching TV together","조깅 · 이동 중":"Jogging · moving","집 메뉴":"Home menu","아침 조깅을 마치고 집으로 돌아가는 중":"Heading home after a morning jog","욕실에서 손톱을 정돈하는 중":"Trimming their nails in the bathroom"});
Object.assign(I18N.ja,{"같이 TV 보는 중":"一緒にテレビを見ているところ","조깅 · 이동 중":"ジョギング・移動中","집 메뉴":"家のメニュー","아침 조깅을 마치고 집으로 돌아가는 중":"朝のジョギングを終えて帰宅中","욕실에서 손톱을 정돈하는 중":"浴室で爪を整えているところ"});
Object.assign(I18N.en,{"저장된 마을을 확인한 뒤 이어서 열게요.":"We’ll continue after checking your saved village.","상태별 아이콘·LD":"Scene icons & LD art","수면":"Sleeping","아침 준비":"Morning routine","목욕·욕실":"Bath time","근무·일하는 중":"Working","외출":"Going out","기쁨":"Happy","슬픔":"Sad","화남":"Angry","피곤함":"Tired","기본 이미지로 자동 대체":"Falls back to the default image","집 추가":"Add home","구성원과 집 내부 사진은 집 화면에서 설정해요.":"Set residents and interior photos on the Home screen.","외관·마을 위치·건물 평판은 마을의 건물 정보에서 설정해요.":"Set the exterior, town location, and building reputation in Town building info."});
Object.assign(I18N.ja,{"저장된 마을을 확인한 뒤 이어서 열게요.":"保存済みの村を確認してから続きを開きます。","상태별 아이콘·LD":"シーン別アイコン・LD","수면":"睡眠","아침 준비":"朝の支度","목욕·욕실":"入浴・洗面","근무·일하는 중":"仕事中","외출":"外出","기쁨":"喜び","슬픔":"悲しみ","화남":"怒り","피곤함":"疲れ","기본 이미지로 자동 대체":"未登録時は基本画像を使用","집 추가":"家を追加","구성원과 집 내부 사진은 집 화면에서 설정해요.":"住人と室内写真は家画面で設定します。","외관·마을 위치·건물 평판은 마을의 건물 정보에서 설정해요.":"外観・村での位置・建物の評判は村の建物情報で設定します。"});
Object.assign(I18N.en,{"수면·아침 준비·욕실·근무·외출·기분에 맞는 그림을 사용할 수 있어요. 비워 둔 칸은 기본 이미지로 자동 대체됩니다.":"Choose art for sleep, morning routines, bath time, work, outings, and moods. Empty slots automatically use the default image.","아이콘 비우기":"Clear icon","LD 비우기":"Clear LD","완료":"Done"});
Object.assign(I18N.ja,{"수면·아침 준비·욕실·근무·외출·기분에 맞는 그림을 사용할 수 있어요. 비워 둔 칸은 기본 이미지로 자동 대체됩니다.":"睡眠・朝の支度・入浴・仕事・外出・気分に合う絵を設定できます。空欄は基本画像を自動で使います。","아이콘 비우기":"アイコンを消す","LD 비우기":"LDを消す","완료":"完了"});
Object.assign(I18N.en,{"빈집":"Empty home","빈집 삭제":"Delete empty home","빈집을 바로 삭제할 수 있어요.":"This empty home can be deleted here."});
Object.assign(I18N.ja,{"빈집":"空き家","빈집 삭제":"空き家を削除","빈집을 바로 삭제할 수 있어요.":"この空き家はここから削除できます。"});
Object.assign(I18N.en,{"관심사 선택":"Select interests","취미 선택":"Select hobbies","기술 숙련 선택":"Select skill proficiency","좋아하는 것 선택":"Select favorites","좋아하는 것 · 사전 선택":"Favorites · Dictionary","소지품 선택":"Select belongings","마을 일러스트 준비 중":"Town illustration coming later","등록된 마을 일러스트가 없어요":"No town illustrations are registered","제공받은 일러스트를 하나씩 추가할 예정이에요.":"Illustrations supplied by the project owner will be added one at a time.","상점 메뉴":"Shop menu","이미 적용 중":"Already applied"});
Object.assign(I18N.ja,{"관심사 선택":"関心事を選択","취미 선택":"趣味を選択","기술 숙련 선택":"技能習熟を選択","좋아하는 것 선택":"好きなものを選択","좋아하는 것 · 사전 선택":"好きなもの・辞典","소지품 선택":"所持品を選択","마을 일러스트 준비 중":"村のイラストは後日追加","등록된 마을 일러스트가 없어요":"登録済みの村イラストはありません","제공받은 일러스트를 하나씩 추가할 예정이에요.":"提供されたイラストを一つずつ追加する予定です。","상점 메뉴":"ショップメニュー","이미 적용 중":"適用済み"});
Object.assign(I18N.en,{"법적으로 관계가 등록됨":"Legally registered","법적으로 관계가 등록되지 않음":"Not legally registered","편지 모두 삭제":"Delete all letters"});
Object.assign(I18N.ja,{"법적으로 관계가 등록됨":"法的に登録されている","법적으로 관계가 등록되지 않음":"法的に登録されていない","편지 모두 삭제":"手紙をすべて削除"});
Object.assign(I18N.en,{"그림자처럼 매우 민첩하게":"Shadow-swift and agile"});
Object.assign(I18N.ja,{"그림자처럼 매우 민첩하게":"影のように俊敏に"});
Object.assign(I18N.en,{"싫어하는 것 선택":"Select dislikes","싫어하는 장르":"Disliked genres","싫어하는 음식":"Disliked foods","싫어하는 음료":"Disliked drinks","싫어하는 음악":"Disliked music","싫어하는 영상":"Disliked videos","싫어하는 게임":"Disliked games","싫어하는 향":"Disliked scents","싫어하는 동물":"Disliked animals","싫어하는 전자기기":"Disliked electronics","싫어하는 무기":"Disliked weapons","싫어하는 책":"Disliked books","감정 자극 민감도":"Emotional sensitivity","주변 감정에 물드는 정도":"Emotional contagion"});
Object.assign(I18N.ja,{"싫어하는 것 선택":"苦手なものを選択","싫어하는 장르":"苦手なジャンル","싫어하는 음식":"苦手な食べ物","싫어하는 음료":"苦手な飲み物","싫어하는 음악":"苦手な音楽","싫어하는 영상":"苦手な映像","싫어하는 게임":"苦手なゲーム","싫어하는 향":"苦手な香り","싫어하는 동물":"苦手な動物","싫어하는 전자기기":"苦手な電子機器","싫어하는 무기":"苦手な武器","싫어하는 책":"苦手な本","감정 자극 민감도":"感情刺激への敏感さ","주변 감정에 물드는 정도":"周囲の感情に影響される程度"});
Object.assign(I18N.en,{"매우 낙천적임":"Very optimistic","쾌활한 편":"Cheerful","열정적인 편":"Passionate","다정한 편":"Warmhearted","유혹적인 편":"Flirtatious","호기심 많은 편":"Curious","차분한 편":"Composed","냉소적인 편":"Cynical","까칠한 편":"Prickly","예민한 편":"Sensitive","불안한 편":"Anxious","침울한 편":"Gloomy","분노를 품은 편":"Carries anger","매우 둔감함":"Very insensitive","둔감한 편":"Rather insensitive","보통":"Moderate","매우 예민함":"Very sensitive","거의 물들지 않음":"Hardly affected","가까운 사람에게만 물듦":"Affected only by close people","상황에 따라 물듦":"Depends on the situation","쉽게 물드는 편":"Easily affected","매우 쉽게 물듦":"Very easily affected"});
Object.assign(I18N.ja,{"매우 낙천적임":"とても楽観的","쾌활한 편":"快活","열정적인 편":"情熱的","다정한 편":"思いやりがある","유혹적인 편":"誘惑的","호기심 많은 편":"好奇心旺盛","차분한 편":"落ち着いている","냉소적인 편":"皮肉っぽい","까칠한 편":"とげとげしい","예민한 편":"敏感","불안한 편":"不安がち","침울한 편":"沈みがち","분노를 품은 편":"怒りを抱えている","매우 둔감함":"とても鈍感","둔감한 편":"鈍感なほう","보통":"普通","매우 예민함":"とても敏感","거의 물들지 않음":"ほとんど影響されない","가까운 사람에게만 물듦":"親しい人にだけ影響される","상황에 따라 물듦":"状況によって影響される","쉽게 물드는 편":"影響されやすい","매우 쉽게 물듦":"とても影響されやすい"});
Object.assign(I18N.en,{"마을 산책 중":"Roaming around town","마을에서 대화 중":"Chatting in town"});
Object.assign(I18N.ja,{"마을 산책 중":"村を散策中","마을에서 대화 중":"村で会話中"});
Object.assign(I18N.en,{"옷 검색":"Search wardrobe","유니폼":"Uniform","격식":"Formal","총":"Total","상황과 드레스코드에 맞춰 자동 선택":"Auto-selected for the situation and dress code","옷 추가":"Add clothing","검색 결과가 없어요.":"No matching clothing.","드레스코드":"Dress code","사용 중":"Enabled","사용 안 함":"Disabled","이 건물의 드레스코드 사용":"Use a dress code for this building","필수 유니폼":"Required uniform","허용 색 · 여러 개 선택":"Allowed colors · multiple selection","권장 재질 · 여러 개 선택":"Preferred materials · multiple selection","분위기 · 여러 개 선택":"Styles · multiple selection"});
Object.assign(I18N.ja,{"옷 검색":"衣装を検索","유니폼":"制服","격식":"フォーマル","총":"合計","상황과 드레스코드에 맞춰 자동 선택":"状況とドレスコードに合わせて自動選択","옷 추가":"衣装を追加","검색 결과가 없어요.":"一致する衣装がありません。","드레스코드":"ドレスコード","사용 중":"使用中","사용 안 함":"未使用","이 건물의 드레스코드 사용":"この建物でドレスコードを使用","필수 유니폼":"制服必須","허용 색 · 여러 개 선택":"使用可能な色・複数選択","권장 재질 · 여러 개 선택":"推奨素材・複数選択","분위기 · 여러 개 선택":"雰囲気・複数選択"});
Object.assign(I18N.en,{"유니폼 착용 필수":"Uniform required","옷장에서 ‘유니폼으로 등록’한 옷만 자동 선택해요.":"Only wardrobe items marked ‘Register as uniform’ are auto-selected."});
Object.assign(I18N.ja,{"유니폼 착용 필수":"制服の着用必須","옷장에서 ‘유니폼으로 등록’한 옷만 자동 선택해요.":"クローゼットで「制服として登録」した服だけを自動選択します。"});
Object.assign(I18N.en,{"개요 페이지 이동":"Overview page navigation","이전 페이지":"Previous page","이전 페이지 없음":"No previous page","다음 페이지":"Next page","다음 페이지 없음":"No next page","기상 습관":"Wake-up habit","취침 습관":"Bedtime habit","생활습관":"Daily rhythm","식습관":"Eating habits","걸음걸이":"Walking style","자율 이끌림":"Autonomous attraction","외모를 보는 정도":"Attention to appearance","선호하는 특성":"Preferred traits","비선호하는 특성":"Disliked traits","모양":"Appearance"});
Object.assign(I18N.ja,{"개요 페이지 이동":"概要ページの移動","이전 페이지":"前のページ","이전 페이지 없음":"前のページはありません","다음 페이지":"次のページ","다음 페이지 없음":"次のページはありません","기상 습관":"起床習慣","취침 습관":"就寝習慣","생활습관":"生活リズム","식습관":"食習慣","걸음걸이":"歩き方","자율 이끌림":"自律的な惹かれ方","외모를 보는 정도":"外見を重視する度合い","선호하는 특성":"好みの特徴","비선호하는 특성":"苦手な特徴","모양":"外見"});
Object.assign(I18N.en,{"생활 환경 적응도":"Everyday environment familiarity","교육 수준":"Education background","설정하지 않음":"Not set","도시·현대 생활에 매우 익숙함":"Very familiar with modern urban life","일상 도구와 제도를 무리 없이 이용함":"Comfortable using everyday tools and services","익숙한 환경에서는 독립적으로 생활함":"Lives independently in familiar environments","일부 일상 도구나 제도에 도움이 필요함":"Needs help with some everyday tools or services","현재 환경의 생활 방식이 낯섦":"Unfamiliar with the current way of life","다른 시대·문화권의 생활 방식에 익숙함":"Familiar with another era or cultural setting","자연·야외 중심 생활에 익숙함":"Familiar with nature- or outdoor-centered living","기초 교육 과정 이수":"Completed foundational education","중등 교육 과정 이수":"Completed lower secondary education","고등 교육 과정 이수":"Completed upper secondary education","전문·직업 교육 이수":"Completed vocational or professional training","대학 교육 이수":"Completed university education","대학원 교육 이수":"Completed graduate education","독학·비정규 교육 중심":"Primarily self-taught or informally educated","도제·문하 교육 이수":"Completed apprenticeship or mentorship training","종교·전통 교육 이수":"Completed religious or traditional education","현재 교육 과정 재학 중":"Currently enrolled in education","세계관 고유 교육 체계":"Setting-specific education system"});
Object.assign(I18N.ja,{"생활 환경 적응도":"生活環境への慣れ","교육 수준":"教育背景","설정하지 않음":"未設定","도시·현대 생활에 매우 익숙함":"現代の都市生活にとても慣れている","일상 도구와 제도를 무리 없이 이용함":"日常の道具や制度を無理なく利用できる","익숙한 환경에서는 독립적으로 생활함":"慣れた環境では自立して生活する","일부 일상 도구나 제도에 도움이 필요함":"一部の日常道具や制度で助けが必要","현재 환경의 생활 방식이 낯섦":"現在の生活様式に慣れていない","다른 시대·문화권의 생활 방식에 익숙함":"別の時代・文化圏の生活様式に慣れている","자연·야외 중심 생활에 익숙함":"自然・野外中心の生活に慣れている","기초 교육 과정 이수":"基礎教育課程を修了","중등 교육 과정 이수":"中等教育課程を修了","고등 교육 과정 이수":"高等教育課程を修了","전문·직업 교육 이수":"専門・職業教育を修了","대학 교육 이수":"大学教育を修了","대학원 교육 이수":"大学院教育を修了","독학·비정규 교육 중심":"独学・非正規教育が中心","도제·문하 교육 이수":"徒弟・師弟教育を修了","종교·전통 교육 이수":"宗教・伝統教育を修了","현재 교육 과정 재학 중":"現在教育課程に在学中","세계관 고유 교육 체계":"世界観固有の教育体系"});
Object.assign(I18N.en,{"왼쪽 시력":"Left-eye vision","오른쪽 시력":"Right-eye vision","눈 특징":"Eye features","안경":"Glasses","색상 방식":"Color method","본래 머리색":"Natural hair color","염색 색상":"Dyed color","머리 길이":"Hair length","머리 모양":"Hairstyle","키":"Height","키 인상":"Height impression","몸무게":"Weight","체격":"Build","전체적인 외모":"Overall appearance","정상 시력":"Normal vision","저시력":"Low vision","거의 보이지 않음":"Almost no vision","보이지 않음":"Blind","착용하지 않음":"Does not wear","필요할 때만 착용":"Wears when needed","안경 착용":"Wears glasses","선글라스 착용":"Wears sunglasses","자연 모발":"Natural hair","염색":"Dyed","부분 염색":"Partially dyed"});
Object.assign(I18N.ja,{"왼쪽 시력":"左目の視力","오른쪽 시력":"右目の視力","눈 특징":"目の特徴","안경":"眼鏡","색상 방식":"色の設定","본래 머리색":"地毛の色","염색 색상":"染髪色","머리 길이":"髪の長さ","머리 모양":"髪型","키":"身長","키 인상":"身長の印象","몸무게":"体重","체격":"体格","전체적인 외모":"全体的な外見","정상 시력":"通常視力","저시력":"弱視","거의 보이지 않음":"ほとんど見えない","보이지 않음":"見えない","착용하지 않음":"着用しない","필요할 때만 착용":"必要な時だけ着用","안경 착용":"眼鏡を着用","선글라스 착용":"サングラスを着用","자연 모발":"地毛","염색":"染髪","부분 염색":"部分染め"});
Object.assign(I18N.en,{"왼쪽 눈":"Left eye","오른쪽 눈":"Right eye","본래 머리색:":"Natural hair:"});
Object.assign(I18N.ja,{"왼쪽 눈":"左目","오른쪽 눈":"右目","본래 머리색:":"地毛の色："});
Object.assign(I18N.en,{"헤어스타일":"Hairstyles","머리 장식":"Hair accessories","여러 개 선택 가능":"Select multiple","선택 완료":"Done","선택한 항목이 없습니다.":"No items selected."});
Object.assign(I18N.ja,{"헤어스타일":"ヘアスタイル","머리 장식":"髪飾り","여러 개 선택 가능":"複数選択できます","선택 완료":"選択完了","선택한 항목이 없습니다.":"選択項目はありません。"});
Object.assign(I18N.en,{"체모 정도":"Body hair amount","체모 위치":"Body hair locations","없음":"None","거의 없음":"Almost none","적은 편":"Light","많은 편":"Heavy","매우 많음":"Very heavy","얼굴":"Face","인중":"Upper lip","턱":"Chin","구레나룻":"Sideburns","가슴":"Chest","배":"Abdomen","등":"Back","어깨":"Shoulders","팔":"Arms","겨드랑이":"Armpits","손":"Hands","허벅지":"Thighs","종아리":"Calves","발":"Feet"});
Object.assign(I18N.ja,{"체모 정도":"体毛の量","체모 위치":"体毛の部位","없음":"なし","거의 없음":"ほとんどなし","적은 편":"少なめ","많은 편":"多め","매우 많음":"非常に多い","얼굴":"顔","인중":"口ひげ","턱":"あご","구레나룻":"もみあげ","가슴":"胸","배":"腹","등":"背中","어깨":"肩","팔":"腕","겨드랑이":"わき","손":"手","허벅지":"太もも","종아리":"ふくらはぎ","발":"足"});
Object.assign(I18N.en,{"행동 습관":"Behavior habits","2개 선택됨":"2 selected","개 선택됨":" selected","외모가 눈에 띄는 정도":"How noticeable their appearance is","본인 외모에 대한 자각 정도":"Awareness of their appearance","피부":"Skin","피부 특징":"Skin features","흉터":"Scars","문신":"Tattoos","종합 인상":"Overall impression","피부색 고르기":"Choose a skin tone","서랍마을 피부 팔레트":"Drawer Village skin palette","인종이나 국가 대신 색의 밝기와 언더톤으로 고릅니다.":"Choose by depth and undertone, without race or nationality labels.","쿨톤":"Cool","뉴트럴톤":"Neutral","웜톤":"Warm","올리브톤":"Olive","신체 페이지 이동":"Body page navigation"});
Object.assign(I18N.ja,{"행동 습관":"行動の癖","2개 선택됨":"2個選択済み","개 선택됨":"個選択済み","외모가 눈에 띄는 정도":"外見の目立ちやすさ","본인 외모에 대한 자각 정도":"自分の外見への自覚","피부":"肌","피부 특징":"肌の特徴","흉터":"傷跡","문신":"タトゥー","종합 인상":"全体の印象","피부색 고르기":"肌色を選ぶ","서랍마을 피부 팔레트":"ひきだし村スキンパレット","人種や国籍ではなく、明るさとアンダートーンで選びます。":"人種や国籍ではなく、明るさとアンダートーンで選びます。","쿨톤":"クール","뉴트럴톤":"ニュートラル","웜톤":"ウォーム","올리브톤":"オリーブ","신체 페이지 이동":"身体ページの移動"});
Object.assign(I18N.en,{"설정하지 않음":"Not set","전혀 자각하지 못함":"Not aware at all","조금 알고 있음":"Slightly aware","대체로 알고 있음":"Generally aware","정확히 알고 있음":"Clearly aware","타인의 반응까지 잘 앎":"Aware of others’ reactions","신체 일러스트":"Body illustration","사진 추가하기":"Add image","주근깨가 있음":"Freckles","점이 있음":"Moles","홍조가 있음":"Rosy complexion","피부 결이 매끄러움":"Smooth skin texture","피부가 건조함":"Dry skin","피부가 민감함":"Sensitive skin","햇볕에 잘 탐":"Tans easily","햇볕에 쉽게 붉어짐":"Sunburns easily","색소침착이 있음":"Hyperpigmentation","백반이 있음":"Vitiligo","여드름 흔적이 있음":"Acne marks","기타 피부 특징":"Other skin feature","공포스러운":"Frightening","퇴폐적인 분위기":"Decadent aura","중성적인 인상":"Androgynous impression","부드러운 인상":"Gentle impression","날카로운 인상":"Sharp impression","귀여운 인상":"Cute impression","우아한 인상":"Elegant impression","위압적인 분위기":"Intimidating aura","단정한 분위기":"Neat impression","신비로운 분위기":"Mysterious aura","성숙한 인상":"Mature impression","어린 인상":"Youthful impression"});
Object.assign(I18N.ja,{"설정하지 않음":"未設定","전혀 자각하지 못함":"まったく自覚していない","조금 알고 있음":"少し自覚している","대체로 알고 있음":"だいたい自覚している","정확히 알고 있음":"正確に自覚している","타인의 반응까지 잘 앎":"周囲の反応までよく分かる","신체 일러스트":"全身イラスト","사진 추가하기":"画像を追加","주근깨가 있음":"そばかすがある","점이 있음":"ほくろがある","홍조가 있음":"赤みがある","피부 결이 매끄러움":"肌のきめが滑らか","피부가 건조함":"乾燥肌","피부가 민감함":"敏感肌","햇볕에 잘 탐":"日焼けしやすい","햇볕에 쉽게 붉어짐":"日に当たると赤くなりやすい","색소침착이 있음":"色素沈着がある","백반이 있음":"白斑がある","여드름 흔적이 있음":"にきび跡がある","기타 피부 특징":"その他の肌の特徴","공포스러운":"恐ろしい","퇴폐적인 분위기":"退廃的な雰囲気","중성적인 인상":"中性的な印象","부드러운 인상":"柔らかな印象","날카로운 인상":"鋭い印象","귀여운 인상":"可愛い印象","우아한 인상":"優雅な印象","위압적인 분위기":"威圧的な雰囲気","단정한 분위기":"端正な雰囲気","신비로운 분위기":"神秘的な雰囲気","성숙한 인상":"大人びた印象","어린 인상":"幼い印象"});
Object.assign(I18N.en,{"추가":"Add","제거":"Remove","흉터 추가":"Add scar","흉터 제거":"Remove scar","문신 추가":"Add tattoo","문신 제거":"Remove tattoo","왼쪽 눈가":"Around left eye","오른쪽 눈가":"Around right eye","왼쪽 볼":"Left cheek","오른쪽 볼":"Right cheek","입가":"Around mouth","왼쪽 어깨":"Left shoulder","오른쪽 어깨":"Right shoulder","왼팔":"Left arm","오른팔":"Right arm","왼손":"Left hand","오른손":"Right hand","배·옆구리":"Abdomen · side","왼쪽 허벅지":"Left thigh","오른쪽 허벅지":"Right thigh","왼쪽 종아리":"Left calf","오른쪽 종아리":"Right calf","수술 부위":"Surgical site","화상 부위":"Burn area","기타 위치":"Other location","팔 전체":"Full arm","등 전체":"Full back","전신":"Full body"});
Object.assign(I18N.ja,{"추가":"追加","제거":"削除","흉터 추가":"傷跡を追加","흉터 제거":"傷跡を削除","문신 추가":"タトゥーを追加","문신 제거":"タトゥーを削除","왼쪽 눈가":"左目の周り","오른쪽 눈가":"右目の周り","왼쪽 볼":"左頬","오른쪽 볼":"右頬","입가":"口元","왼쪽 어깨":"左肩","오른쪽 어깨":"右肩","왼팔":"左腕","오른팔":"右腕","왼손":"左手","오른손":"右手","배·옆구리":"腹・脇腹","왼쪽 허벅지":"左太もも","오른쪽 허벅지":"右太もも","왼쪽 종아리":"左ふくらはぎ","오른쪽 종아리":"右ふくらはぎ","수술 부위":"手術部位","화상 부위":"やけどの部位","기타 위치":"その他の部位","팔 전체":"腕全体","등 전체":"背中全体","전신":"全身"});
Object.assign(I18N.en,{"자기 외형에 대한 인식":"How they see their own appearance","자신을 매우 추하다고 여김":"Sees themself as very ugly","자신을 못생겼다고 여김":"Sees themself as unattractive","외모에 자신이 없음":"Feels insecure about their appearance","평범하다고 여김":"Sees themself as ordinary","나름 매력적이라고 여김":"Sees themself as fairly attractive","자신을 아름답거나 잘생겼다고 여김":"Sees themself as beautiful or handsome","외모에 강한 자신감이 있음":"Feels highly confident about their appearance","이름":"Name","위치":"Location","유형":"Type","이 흔적에 대한 생각":"How they feel about this mark","설정 완료":"Done","가느다란 흉터":"Thin scar","칼자국":"Blade scar","찢어진 상처 흔적":"Laceration scar","화상 흉터":"Burn scar","수술 흉터":"Surgical scar","긁힌 흔적":"Scratch scar","물린 흔적":"Bite scar","울퉁불퉁한 흉터":"Raised scar","색소가 남은 흉터":"Pigmented scar","기타 흉터":"Other scar","문자·문구":"Text or lettering","기하학 무늬":"Geometric design","꽃·식물":"Flowers or plants","동물":"Animal","상징·문장":"Symbol or crest","인물·초상":"Portrait","추상 무늬":"Abstract design","전통 문양":"Traditional motif","작은 포인트":"Small accent","넓은 면적의 문신":"Large-area tattoo","기타 문신":"Other tattoo","아끼며 드러내고 싶어함":"Treasures it and likes to show it","자연스럽게 받아들임":"Accepts it naturally","별다른 생각이 없음":"Feels neutral about it","남에게 보이는 것을 꺼림":"Dislikes others seeing it","가리고 싶어함":"Wants to hide it","없애고 싶어함":"Wants to remove it","그때의 기억을 떠올림":"Associates it with a memory","자신만의 의미를 부여함":"Gives it a personal meaning","신체 단위":"Body units","캐릭터 설정의 키와 몸무게 표기 단위를 고릅니다.":"Choose how height and weight are displayed in character settings.","표기 단위":"Display units","미터법 · cm / kg":"Metric · cm / kg","야드파운드법 · in / lb":"Imperial · in / lb","저장값은 안전하게 유지되며 화면 표기만 변환됩니다.":"Saved values stay intact; only the display is converted."});
Object.assign(I18N.ja,{"자기 외형에 대한 인식":"自分の外見をどう捉えているか","자신을 매우 추하다고 여김":"自分をとても醜いと思っている","자신을 못생겼다고 여김":"自分を魅力的でないと思っている","외모에 자신이 없음":"外見に自信がない","평범하다고 여김":"自分を普通だと思っている","나름 매력적이라고 여김":"自分なりに魅力的だと思っている","자신을 아름답거나 잘생겼다고 여김":"自分を美しい・格好いいと思っている","외모에 강한 자신감이 있음":"外見に強い自信がある","이름":"名前","위치":"位置","유형":"種類","이 흔적에 대한 생각":"この痕への気持ち","설정 완료":"設定完了","가느다란 흉터":"細い傷跡","칼자국":"刃物の傷跡","찢어진 상처 흔적":"裂傷の跡","화상 흉터":"やけどの跡","수술 흉터":"手術痕","긁힌 흔적":"引っかき傷","물린 흔적":"噛み傷","울퉁불퉁한 흉터":"盛り上がった傷跡","색소가 남은 흉터":"色素の残った傷跡","기타 흉터":"その他の傷跡","문자·문구":"文字・言葉","기하학 무늬":"幾何学模様","꽃·식물":"花・植物","동물":"動物","상징·문장":"象徴・紋章","인물·초상":"人物・肖像","추상 무늬":"抽象模様","전통 문양":"伝統文様","작은 포인트":"小さなワンポイント","넓은 면적의 문신":"広い範囲のタトゥー","기타 문신":"その他のタトゥー","아끼며 드러내고 싶어함":"大切にして見せたい","자연스럽게 받아들임":"自然に受け入れている","별다른 생각이 없음":"特に意識していない","남에게 보이는 것을 꺼림":"人に見られるのを嫌がる","가리고 싶어함":"隠したい","없애고 싶어함":"消したい","그때의 기억을 떠올림":"当時の記憶を思い出す","자신만의 의미를 부여함":"自分だけの意味を持たせている","신체 단위":"身体の単位","캐릭터 설정의 키와 몸무게 표기 단위를 고릅니다.":"キャラクター設定の身長と体重の表示単位を選びます。","표기 단위":"表示単位","미터법 · cm / kg":"メートル法・cm / kg","야드파운드법 · in / lb":"ヤード・ポンド法・in / lb","저장값은 안전하게 유지되며 화면 표기만 변환됩니다.":"保存値は維持され、表示だけが変換されます。"});
Object.assign(I18N.en,Object.fromEntries(["Ugly impression","Uncanny impression","Unpleasant impression","Frightening impression","Intimidating aura","Rugged and wild impression","Cold and detached impression","Gloomy impression","Decadent aura","Frail and precarious impression","Tired and worn impression","Humble and plain impression","Unobtrusive impression","Neat and upright impression","Intelligent and composed impression","Gentle and warm impression","Friendly and comfortable impression","Playful and sly impression","Innocent and clear impression","Cute and lovable impression","Fresh and lively impression","Elegant and refined impression","Glamorous and dazzling impression","Sensual and captivating impression","Mysterious and unreal impression","Androgynous and ambiguous impression","Mature and experienced impression","Young and youthful impression"].map((value,index)=>[["추악한 인상","기괴한 인상","불쾌한 인상","공포스러운 인상","위압적인 분위기","거칠고 야성적인 인상","차갑고 냉담한 인상","음울한 인상","퇴폐적인 분위기","병약하고 위태로운 인상","피곤하고 지친 인상","초라하고 수수한 인상","눈에 잘 띄지 않는 인상","단정하고 반듯한 인상","지적이고 침착한 인상","부드럽고 온화한 인상","친근하고 편안한 인상","장난스럽고 능청스러운 인상","순진하고 맑은 인상","귀엽고 사랑스러운 인상","청량하고 생기 있는 인상","우아하고 고상한 인상","화려하고 눈부신 인상","관능적이고 매혹적인 인상","신비롭고 비현실적인 인상","중성적이고 모호한 인상","성숙하고 노련한 인상","어리고 앳된 인상"][index],value])));
Object.assign(I18N.ja,Object.fromEntries(["醜い印象","奇怪な印象","不快な印象","恐ろしい印象","威圧的な雰囲気","荒々しく野性的な印象","冷たくよそよそしい印象","陰鬱な印象","退廃的な雰囲気","病弱で危うい印象","疲れ切った印象","みすぼらしく素朴な印象","目立たない印象","きちんとして端正な印象","知的で落ち着いた印象","柔らかく穏やかな印象","親しみやすく安心する印象","いたずらっぽく飄々とした印象","無垢で澄んだ印象","可愛らしく愛嬌のある印象","爽やかで生き生きした印象","優雅で気品ある印象","華やかでまばゆい印象","官能的で魅惑的な印象","神秘的で非現実的な印象","中性的で曖昧な印象","成熟して経験豊かな印象","若くあどけない印象"].map((value,index)=>[["추악한 인상","기괴한 인상","불쾌한 인상","공포스러운 인상","위압적인 분위기","거칠고 야성적인 인상","차갑고 냉담한 인상","음울한 인상","퇴폐적인 분위기","병약하고 위태로운 인상","피곤하고 지친 인상","초라하고 수수한 인상","눈에 잘 띄지 않는 인상","단정하고 반듯한 인상","지적이고 침착한 인상","부드럽고 온화한 인상","친근하고 편안한 인상","장난스럽고 능청스러운 인상","순진하고 맑은 인상","귀엽고 사랑스러운 인상","청량하고 생기 있는 인상","우아하고 고상한 인상","화려하고 눈부신 인상","관능적이고 매혹적인 인상","신비롭고 비현실적인 인상","중성적이고 모호한 인상","성숙하고 노련한 인상","어리고 앳된 인상"][index],value])));
Object.assign(I18N.en,{"눈 특징":"Eye features","눈매가 날카로움":"Sharp eyes","눈매가 부드러움":"Soft eyes","눈꼬리가 올라감":"Upturned eyes","눈꼬리가 내려감":"Downturned eyes","큰 눈":"Large eyes","작은 눈":"Small eyes","쌍꺼풀 있음":"Double eyelids","속쌍꺼풀":"Inner double eyelids","무쌍":"Monolids","삼백안":"Sanpaku eyes","사백안":"Four-white eyes","졸린 눈":"Sleepy eyes","처진 눈":"Droopy eyes","짝눈":"Asymmetrical eyes","오드아이":"Heterochromia","눈 밑 점":"Beauty mark under eye","다크서클":"Dark circles","속눈썹이 김":"Long eyelashes","눈썹이 진함":"Thick eyebrows","머리핀":"Hairpin","리본":"Ribbon","헤어밴드":"Hair band","머리띠":"Headband","비녀":"Hair stick","장식 빗":"Decorative comb","꽃 장식":"Flower accessory","베일":"Veil","모자":"Hat","후드":"Hood","왕관":"Crown","티아라":"Tiara","뿔":"Horns","한쪽 뿔":"Single horn","한 쌍의 뿔":"Pair of horns","후광":"Halo","동물 귀 장식":"Animal ear accessory","깃털 장식":"Feather accessory","보석 장식":"Gem accessory","체인 장식":"Chain accessory"});
Object.assign(I18N.ja,{"눈 특징":"目の特徴","눈매가 날카로움":"鋭い目つき","눈매가 부드러움":"柔らかい目つき","눈꼬리가 올라감":"つり目","눈꼬리가 내려감":"たれ目","큰 눈":"大きな目","작은 눈":"小さな目","쌍꺼풀 있음":"二重","속쌍꺼풀":"奥二重","무쌍":"一重","삼백안":"三白眼","사백안":"四白眼","졸린 눈":"眠そうな目","처진 눈":"垂れた目","짝눈":"左右非対称の目","오드아이":"オッドアイ","눈 밑 점":"泣きぼくろ","다크서클":"目のくま","속눈썹이 김":"まつ毛が長い","눈썹이 진함":"眉が濃い","머리핀":"ヘアピン","리본":"リボン","헤어밴드":"ヘアバンド","머리띠":"カチューシャ","비녀":"かんざし","장식 빗":"飾り櫛","꽃 장식":"花飾り","베일":"ベール","모자":"帽子","후드":"フード","왕관":"王冠","티아라":"ティアラ","뿔":"角","한쪽 뿔":"片角","한 쌍의 뿔":"一対の角","후광":"光輪","동물 귀 장식":"動物耳の飾り","깃털 장식":"羽飾り","보석 장식":"宝石飾り","체인 장식":"チェーン飾り"});
Object.assign(I18N.en,{"총평":"Overall look","분위기":"Aura","건강·접근성 설정":"Health & accessibility","휠체어":"Wheelchair","휠체어 유형":"Wheelchair type","이용 방식":"Use pattern","청각장애·난청":"Deafness / hearing loss","영향받는 쪽":"Affected side","청력 정도":"Hearing level","의수":"Prosthetic arm","의수 유형":"Arm type","의족":"Prosthetic leg","의족 유형":"Leg type","만성질환·건강 관리":"Ongoing health needs","청각 접근 방식":"Hearing access","시각 접근 방식":"Vision access","병원 방문 빈도":"Hospital visits","병원에서 할 일(검사/수술)":"Visit purpose / procedure","복용중인 약":"Current medication","약 이름 1":"Medication 1","약 이름 2":"Medication 2","스포츠용 휠체어":"Sports wheelchair","기타 휠체어":"Other wheelchair","항상 이용":"Used at all times","장거리·외출 시 이용":"Used for long trips / outings","피로하거나 통증이 있을 때 이용":"Used with fatigue or pain","활동에 따라 바꾸어 이용":"Varies by activity","일상생활용 의수":"Everyday prosthetic arm","미관용 의수":"Cosmetic prosthetic arm","근전도 의수":"Myoelectric prosthetic arm","작업용 갈고리·집게형 의수":"Work hook / gripper prosthesis","스포츠용 의수":"Sports prosthetic arm","기타 의수":"Other prosthetic arm","일상생활용 의족":"Everyday prosthetic leg","스포츠용 의족":"Sports prosthetic leg","수중용 의족":"Water-use prosthetic leg","미관용 의족":"Cosmetic prosthetic leg","기타 의족":"Other prosthetic leg","경도 난청":"Mild hearing loss","중도 난청":"Moderate hearing loss","고도 난청":"Severe hearing loss","농":"Deaf","청각 처리에 어려움":"Auditory processing difficulty","보청기 사용":"Uses hearing aids","인공와우 사용":"Uses cochlear implant","수어 사용":"Uses sign language","문자·자막 선호":"Prefers text / captions","입모양 읽기":"Lip-reading","조용한 환경 선호":"Prefers quiet environments","큰 글씨 선호":"Prefers large text","화면 확대 사용":"Uses screen magnification","고대비 화면 선호":"Prefers high contrast","스크린 리더 사용":"Uses a screen reader","점자 사용":"Uses Braille","색 구분 보조 필요":"Needs color-identification support","정기적으로":"Regularly","필요할 때만":"Only as needed","자주 방문":"Frequent visits","입원·장기 치료 중":"Inpatient / long-term treatment","압도적으로 아름다운 사람":"Strikingly beautiful","매우 아름다운 사람":"Very beautiful","아름다운 사람":"Beautiful","매우 잘생긴 사람":"Exceptionally handsome","잘생긴 사람":"Handsome","귀엽고 사랑스러운 사람":"Cute and lovable","매력적인 사람":"Attractive","호감이 가는 외모":"Pleasant-looking","수수하고 평범한 외모":"Plain and ordinary-looking","개성이 강한 외모":"Distinctive-looking","낯설고 기묘한 외모":"Uncanny-looking","다소 못생긴 사람":"Somewhat unattractive","매우 못생긴 사람":"Very unattractive","추악하다고 느껴지는 외모":"Perceived as grotesque"});
Object.assign(I18N.ja,{"총평":"外見の総評","분위기":"雰囲気","건강·접근성 설정":"健康・アクセシビリティ","휠체어":"車椅子","휠체어 유형":"車椅子の種類","이용 방식":"利用方法","청각장애·난청":"聴覚障害・難聴","영향받는 쪽":"影響のある側","청력 정도":"聴力の程度","의수":"義手","의수 유형":"義手の種類","의족":"義足","의족 유형":"義足の種類","만성질환·건강 관리":"継続的な健康管理","청각 접근 방식":"聴覚のアクセス方法","시각 접근 방식":"視覚のアクセス方法","병원 방문 빈도":"通院頻度","병원에서 할 일(검사/수술)":"受診目的・処置","복용중인 약":"服用中の薬","약 이름 1":"薬の名前 1","약 이름 2":"薬の名前 2","스포츠용 휠체어":"スポーツ用車椅子","기타 휠체어":"その他の車椅子","항상 이용":"常時利用","장거리·외출 시 이용":"長距離・外出時に利用","피로하거나 통증이 있을 때 이용":"疲労・痛みがある時に利用","활동에 따라 바꾸어 이용":"活動に合わせて使い分け","일상생활용 의수":"日常生活用義手","미관용 의수":"装飾用義手","근전도 의수":"筋電義手","작업용 갈고리·집게형 의수":"作業用フック・把持義手","스포츠용 의수":"スポーツ用義手","기타 의수":"その他の義手","일상생활용 의족":"日常生活用義足","스포츠용 의족":"スポーツ用義足","수중용 의족":"水中用義足","미관용 의족":"装飾用義足","기타 의족":"その他の義足","경도 난청":"軽度難聴","중도 난청":"中等度難聴","고도 난청":"高度難聴","농":"ろう","청각 처리에 어려움":"聴覚処理が苦手","보청기 사용":"補聴器を使用","인공와우 사용":"人工内耳を使用","수어 사용":"手話を使用","문자·자막 선호":"文字・字幕を優先","입모양 읽기":"読唇","조용한 환경 선호":"静かな環境を優先","큰 글씨 선호":"大きな文字を優先","화면 확대 사용":"画面拡大を使用","고대비 화면 선호":"高コントラストを優先","스크린 리더 사용":"スクリーンリーダーを使用","점자 사용":"点字を使用","색 구분 보조 필요":"色識別の補助が必要","정기적으로":"定期的","필요할 때만":"必要な時だけ","자주 방문":"頻繁に通院","입원·장기 치료 중":"入院・長期治療中","압도적으로 아름다운 사람":"圧倒的に美しい人","매우 아름다운 사람":"とても美しい人","아름다운 사람":"美しい人","매우 잘생긴 사람":"非常に端正な人","잘생긴 사람":"端正な人","귀엽고 사랑스러운 사람":"可愛らしく愛嬌のある人","매력적인 사람":"魅力的な人","호감이 가는 외모":"好感の持てる外見","수수하고 평범한 외모":"素朴で平凡な外見","개성이 강한 외모":"個性の強い外見","낯설고 기묘한 외모":"異質で奇妙な外見","다소 못생긴 사람":"やや不格好な人","매우 못생긴 사람":"非常に不格好な人","추악하다고 느껴지는 외모":"醜悪に感じられる外見"});
Object.assign(I18N.en,{"당뇨병":"Diabetes","고혈압":"High blood pressure","고지혈증":"High cholesterol","심혈관 질환":"Cardiovascular condition","천식":"Asthma","관절 질환":"Joint condition","만성 통증":"Chronic pain","신장 질환":"Kidney condition","기타 건강 상태":"Other health condition","보청기":"Hearing aids","인공와우":"Cochlear implant","수어":"Sign language","문자 대화":"Text communication","조용한 환경":"Quiet environment","입모양이 보이는 대화":"Face-to-face speech with visible lips","자막":"Captions","지팡이":"White cane","안내견":"Guide dog","화면읽기":"Screen reader","확대·고대비":"Magnification · high contrast","음성 안내":"Audio guidance","촉각 표식":"Tactile markers","동행 안내":"Companion guidance","초음파":"Ultrasonic aid"});
Object.assign(I18N.ja,{"당뇨병":"糖尿病","고혈압":"高血圧","고지혈증":"高コレステロール","심혈관 질환":"心血管疾患","천식":"喘息","관절 질환":"関節疾患","만성 통증":"慢性疼痛","신장 질환":"腎疾患","기타 건강 상태":"その他の健康状態","보청기":"補聴器","인공와우":"人工内耳","수어":"手話","문자 대화":"文字での会話","조용한 환경":"静かな環境","입모양이 보이는 대화":"口元が見える対面会話","자막":"字幕","지팡이":"白杖","안내견":"盲導犬","화면읽기":"スクリーンリーダー","확대·고대비":"拡大・高コントラスト","음성 안내":"音声案内","촉각 표식":"触覚マーカー","동행 안내":"同行者の案内","초음파":"超音波補助"});
Object.assign(I18N.en,{"페이지 이동":"Page navigation","옷장":"Wardrobe","화장 정도":"Makeup level","화장 스타일":"Makeup style","성형·외형 의료 시술":"Cosmetic procedures","시술 부위":"Procedure areas","패션":"Fashion sense","의상 태그":"Outfit tags","미용실 방문 빈도":"Salon visits","미용실에서 하는 일":"Salon services","옷을 고르는 기준":"Clothing priority","옷가게 방문 빈도":"Clothing shopping frequency","구매한 옷을 실제로 입고 다님":"Wears purchased clothes","작업복":"Workwear","작업복 의상 태그":"Workwear tags","수영복":"Swimwear","수영복 의상 태그":"Swimwear tags","잠옷":"Sleepwear","잠옷 의상 태그":"Sleepwear tags","파티복":"Partywear","파티복 의상 태그":"Partywear tags","유행 민감도":"Trend sensitivity","유행을 따르는 정도":"How closely they follow trends","신발":"Shoes","실내":"Indoors","이 캐릭터의 전체적인 유형":"Overall personality types","외향과 내향":"Extraversion and introversion","감각과 직관":"Sensing and intuition","사고와 감정":"Thinking and feeling","인식과 판단":"Perceiving and judging","행동을 전환하는 방식":"Task-switching style","남에게 관여하는 정도":"Involvement with others","깔끔한 정도":"Tidiness","게으름·근면함":"Diligence","갈등 대응":"Conflict response","애정 표현":"Affection style","생활 에너지":"Daily energy","유머·장난 성향":"Humor and playfulness","감정 표현의 크기":"Emotional expressiveness","충동을 참는 정도":"Impulse control","서사·인지 특성 선택사항":"Narrative and cognitive traits","실제 장면에 반영할 표현":"How traits appear in scenes","관심사":"Interests","취미":"Hobbies","좋아하는 장르":"Favorite genres","기술 숙련":"Skills","좋아하는 음식":"Favorite foods","좋아하는 음료":"Favorite drinks","좋아하는 음악":"Favorite music","좋아하는 영상":"Favorite video","좋아하는 게임":"Favorite games","좋아하는 향":"Favorite scents","좋아하는 동물":"Favorite animals","좋아하는 전자기기":"Favorite electronics","좋아하는 무기":"Favorite weapons","좋아하는 책":"Favorite books","사전에서 고르기":"Choose from dictionary","사전에 등록한 항목을 여러 개 고를 수 있어요.":"Choose multiple entries registered in the dictionary.","사전에서 먼저 항목을 만들어 주세요.":"Create an entry in the dictionary first.","보유한 음식 · 사전":"Owned foods · Dictionary","보유한 음료 · 사전":"Owned drinks · Dictionary","보유한 음악 · 사전":"Owned music · Dictionary","보유한 밴드 · 사전":"Owned bands · Dictionary","보유한 책 · 사전":"Owned books · Dictionary","보유한 영화 · 사전":"Owned movies · Dictionary","보유한 게임 · 사전":"Owned games · Dictionary","보유한 향수 · 사전":"Owned perfumes · Dictionary","보유한 취미용품 · 사전":"Owned hobby items · Dictionary","보유한 전자기기 · 사전":"Owned electronics · Dictionary","보유한 무기 · 사전":"Owned weapons · Dictionary","보유한 동물 · 사전":"Owned animals · Dictionary"});
Object.assign(I18N.ja,{"페이지 이동":"ページ移動","옷장":"衣装","화장 정도":"メイクの程度","화장 스타일":"メイクスタイル","성형·외형 의료 시술":"美容・外見の医療施術","시술 부위":"施術部位","패션":"ファッション感覚","의상 태그":"衣装タグ","미용실 방문 빈도":"美容室へ行く頻度","미용실에서 하는 일":"美容室で行うこと","옷을 고르는 기준":"服を選ぶ基準","옷가게 방문 빈도":"服を買いに行く頻度","구매한 옷을 실제로 입고 다님":"購入した服を実際に着る","작업복":"仕事着","작업복 의상 태그":"仕事着タグ","수영복":"水着","수영복 의상 태그":"水着タグ","잠옷":"寝間着","잠옷 의상 태그":"寝間着タグ","파티복":"パーティー衣装","파티복 의상 태그":"パーティー衣装タグ","유행 민감도":"流行への敏感さ","유행을 따르는 정도":"流行を取り入れる程度","신발":"靴","실내":"室内","이 캐릭터의 전체적인 유형":"この人物の全体的なタイプ","외향과 내향":"外向と内向","감각과 직관":"感覚と直観","사고와 감정":"思考と感情","인식과 판단":"知覚と判断","행동을 전환하는 방식":"行動の切り替え方","남에게 관여하는 정도":"他人への関わり方","깔끔한 정도":"几帳面さ","게으름·근면함":"勤勉さ","갈등 대응":"対立への対応","애정 표현":"愛情表現","생활 에너지":"生活エネルギー","유머·장난 성향":"ユーモア・いたずら傾向","감정 표현의 크기":"感情表現の大きさ","충동을 참는 정도":"衝動を抑える程度","서사·인지 특성 선택사항":"物語・認知特性の選択項目","실제 장면에 반영할 표현":"実際の場面への表れ方","관심사":"関心事","취미":"趣味","좋아하는 장르":"好きなジャンル","기술 숙련":"技能","좋아하는 음식":"好きな食べ物","좋아하는 음료":"好きな飲み物","좋아하는 음악":"好きな音楽","좋아하는 영상":"好きな映像","좋아하는 게임":"好きなゲーム","좋아하는 향":"好きな香り","좋아하는 동물":"好きな動物","좋아하는 전자기기":"好きな電子機器","좋아하는 무기":"好きな武器","좋아하는 책":"好きな本","사전에서 고르기":"辞典から選ぶ","사전에 등록한 항목을 여러 개 고를 수 있어요.":"辞典に登録した項目を複数選べます。","사전에서 먼저 항목을 만들어 주세요.":"先に辞典で項目を作成してください。","보유한 음식 · 사전":"所持している食べ物・辞典","보유한 음료 · 사전":"所持している飲み物・辞典","보유한 음악 · 사전":"所持している音楽・辞典","보유한 밴드 · 사전":"所持しているバンド・辞典","보유한 책 · 사전":"所持している本・辞典","보유한 영화 · 사전":"所持している映画・辞典","보유한 게임 · 사전":"所持しているゲーム・辞典","보유한 향수 · 사전":"所持している香水・辞典","보유한 취미용품 · 사전":"所持している趣味用品・辞典","보유한 전자기기 · 사전":"所持している電子機器・辞典","보유한 무기 · 사전":"所持している武器・辞典","보유한 동물 · 사전":"所持している動物・辞典"});
Object.assign(I18N.en,{"기분과 정서 성향":"Mood & emotional disposition","현재 기분을 고정하는 설정이 아니라, 같은 일을 겪어도 이 캐릭터답게 받아들이고 회복하도록 만드는 기준이에요.":"These settings do not lock the current mood. They shape how this character interprets and recovers from the same experience.","기분 계산에 함께 쓰여요":"Used in mood calculation","행동·장소·관계·피로·옷차림의 영향은 그대로 받고, 여기서는 반응의 방향과 세기만 조절합니다.":"Actions, places, relationships, fatigue, and clothing still matter. These choices tune the direction and strength of the response.","평소 정서의 방향":"Usual emotional outlook","기분 변화 폭":"Mood variability","감정이 남는 시간":"How long feelings linger","좋은 일이 있을 때":"Response to good events","힘들 때 보이는 반응":"Response under stress","기분을 회복하는 방식":"Recovery style","낙천적인 편":"Optimistic","대체로 밝은 편":"Generally upbeat","현실적인 편":"Realistic","무덤덤한 편":"Reserved","걱정이 많은 편":"Prone to worry","비관적인 편":"Pessimistic","거의 흔들리지 않음":"Hardly changes","안정적인 편":"Generally steady","상황에 따라 달라짐":"Depends on the situation","변화가 잦은 편":"Changes often","변화 폭이 큼":"Changes strongly","금방 지나감":"Passes quickly","짧게 남음":"Lingers briefly","오래 남음":"Lingers a long time","매우 오래 남음":"Lingers very long","조용히 만족함":"Quietly satisfied","미소와 말로 표현함":"Shows it with smiles and words","주변과 기쁨을 나눔":"Shares joy with others","기쁨이 크게 드러남":"Shows joy openly","좋은 일도 먼저 의심함":"Questions good news first","잠시 거리를 둠":"Takes some distance","말수가 줄어듦":"Becomes quiet","걱정이 많아짐":"Worries more","예민해짐":"Becomes sensitive","화부터 남":"Gets angry first","도움을 요청함":"Asks for help","아무렇지 않은 척함":"Pretends to be fine","혼자 정리하며 회복":"Recovers by processing alone","가까운 사람과 이야기하며 회복":"Recovers by talking to someone close","쉬거나 자면서 회복":"Recovers through rest or sleep","취미에 몰두하며 회복":"Recovers through a hobby","문제를 해결해야 회복":"Recovers after solving the problem","시간이 지나야 회복":"Needs time to recover"});
Object.assign(I18N.ja,{"기분과 정서 성향":"気分・感情傾向","현재 기분을 고정하는 설정이 아니라, 같은 일을 겪어도 이 캐릭터답게 받아들이고 회복하도록 만드는 기준이에요.":"現在の気分を固定する設定ではなく、同じ出来事でもその人物らしく受け止め、回復するための基準です。","기분 계산에 함께 쓰여요":"気分の計算に使われます","행동·장소·관계·피로·옷차림의 영향은 그대로 받고, 여기서는 반응의 방향과 세기만 조절합니다.":"行動・場所・関係・疲労・服装の影響はそのまま受け、ここでは反応の方向と強さだけを調整します。","평소 정서의 방향":"普段の感情傾向","기분 변화 폭":"気分の変化幅","감정이 남는 시간":"感情が残る時間","좋은 일이 있을 때":"良いことへの反応","힘들 때 보이는 반응":"つらい時の反応","기분을 회복하는 방식":"気分の回復方法","낙천적인 편":"楽観的","대체로 밝은 편":"おおむね明るい","현실적인 편":"現実的","무덤덤한 편":"淡々としている","걱정이 많은 편":"心配性","비관적인 편":"悲観的","거의 흔들리지 않음":"ほとんど揺れない","안정적인 편":"安定している","상황에 따라 달라짐":"状況による","변화가 잦은 편":"変化が多い","변화 폭이 큼":"変化幅が大きい","금방 지나감":"すぐに過ぎる","짧게 남음":"少し残る","오래 남음":"長く残る","매우 오래 남음":"とても長く残る","조용히 만족함":"静かに満足する","미소와 말로 표현함":"笑顔と言葉で表す","주변과 기쁨을 나눔":"周りと喜びを分かち合う","기쁨이 크게 드러남":"喜びが大きく表れる","좋은 일도 먼저 의심함":"良いこともまず疑う","잠시 거리를 둠":"少し距離を置く","말수가 줄어듦":"口数が減る","걱정이 많아짐":"心配が増える","예민해짐":"敏感になる","화부터 남":"先に怒る","도움을 요청함":"助けを求める","아무렇지 않은 척함":"平気なふりをする","혼자 정리하며 회복":"一人で整理して回復","가까운 사람과 이야기하며 회복":"親しい人と話して回復","쉬거나 자면서 회복":"休息や睡眠で回復","취미에 몰두하며 회복":"趣味に没頭して回復","문제를 해결해야 회복":"問題を解決して回復","시간이 지나야 회복":"時間をかけて回復"});
Object.assign(I18N.en,{"개 선택":" selected"});Object.assign(I18N.ja,{"개 선택":"個選択"});
Object.assign(I18N.en,{"평소 외모 관리":"Everyday appearance care","거의 신경 쓰지 않음":"Hardly pays attention","필요한 만큼만":"Only what is needed","기본적으로 단정하게":"Keeps generally neat","꾸준히 관리함":"Maintains it regularly","세심하게 공들임":"Takes meticulous care","액세서리 착용":"Wear accessories","착용하지 않음":"Does not wear them","착용함":"Wears them"});
Object.assign(I18N.ja,{"평소 외모 관리":"普段の身だしなみ","거의 신경 쓰지 않음":"ほとんど気にしない","필요한 만큼만":"必要な分だけ","기본적으로 단정하게":"基本的に整える","꾸준히 관리함":"こまめに整える","세심하게 공들임":"丁寧に手をかける","액세서리 착용":"アクセサリー着用","착용하지 않음":"着用しない","착용함":"着用する"});
Object.assign(I18N.en,{"연결된 행동 로그":"Linked activity log"});Object.assign(I18N.ja,{"연결된 행동 로그":"関連する行動ログ"});
Object.assign(I18N.en,{"캐릭터 화면으로 돌아가기":"Back to character screen","뒤로가기":"Back"});
Object.assign(I18N.ja,{"캐릭터 화면으로 돌아가기":"キャラクター画面に戻る","뒤로가기":"戻る"});
const t=(key,fallback)=>I18N[state.uiLanguage]?.[key]||fallback;
export const translateText=key=>t(key,key);
Object.assign(I18N.en,{"현재 계정의 기기 저장 데이터를 초기화할까요? 다른 계정의 데이터는 유지됩니다.":"Reset this account's data on this device? Other accounts will be kept."});
Object.assign(I18N.ja,{"현재 계정의 기기 저장 데이터를 초기화할까요? 다른 계정의 데이터는 유지됩니다.":"この端末にある現在のアカウントのデータを初期化しますか？他のアカウントのデータは保持されます。"});
const homeFloorLabel=floor=>typeof I18N[state.uiLanguage]?.floorLabel==="function"?I18N[state.uiLanguage].floorLabel(floor):`${floor}층`;
const uiLocale=()=>({en:"en-US",ja:"ja-JP"}[state.uiLanguage]||"ko-KR");
const UI_TEXT={
  en:{
    "벽지·바닥 대신 사진 사용":"Use photo instead of wall and floor","방 주인":"Room owner","출입가능":"Room access","집 스타일":"Home style","집 유형":"Home type","세부정보":"Details","차량 이름":"Car name","차 소유주":"Car owner","가족 공동 차량":"Shared family car","좌석 수":"Seats","차 사진 선택":"Choose car photo","자동차 삭제":"Delete car","편집 완료":"Done editing","아기":"Baby","호랑이":"Tiger","식물":"Plant","차량 설정":"Car settings","색상":"Color","경차":"Compact car","승용차":"Passenger car","승합차":"Van","스포츠카":"Sports car","전기차":"Electric car","오토바이":"Motorcycle","자가":"Owner-occupied","전세":"Lump-sum deposit lease","월세":"Monthly rent","임시 거주":"Temporary housing","방 세부 유형":"Room use","공용":"Shared","개인용":"Private","손님용":"Guest",
    "캐릭터 목록":"Character list","첫 캐릭터를 만들어 주세요":"Create your first character","+ 캐릭터 만들기":"+ Create character","+ 생성":"+ Create","프로필":"Profile","신체":"Body","성격":"Personality","취향 선택":"Preferences","세계관 선호":"Worldview","사진·SD·LD·테마":"Images · SD · LD · Theme","프로필 내보내기":"Export profile","캐릭터 저장":"Save character","캐릭터 삭제":"Delete character","기본 생활 마을":"Home town","캐릭터 이름":"Character name","나이대":"Age group","직업 종류":"Occupation","표기할 직업명":"Displayed job title","출근할 건물":"Workplace","소비 유형":"Spending style","기상 시각":"Wake-up time","취침 시각":"Bedtime","투명 SD 아이콘":"Transparent SD icon","홈화면 LD 일러스트":"Home-screen LD illustration","홈화면 기본 표현":"Default home visual","홈화면 캐릭터 크기":"Home character size","테마색 설정":"Theme colors","기본":"Neutral","기쁨":"Joy","슬픔":"Sad","화남":"Angry","피곤":"Tired","파일":"File","링크":"Link","지우기":"Clear","화면 모드":"Display mode","화이트 모드":"Light mode","다크 모드":"Dark mode","전체 색상 테마":"Color theme","글자와 화면 크기":"Text and display size","글자 크기":"Text size","사용할 글꼴":"Font","마을 지도 표시":"Town map display","건물 표기 방식":"Building labels","지도 위 캐릭터 표기":"Character labels on map","Google 계정과 데이터":"Google account and data","Google 로그인 / 로그아웃":"Google sign in / out","동기화":"Sync","불러오기":"Load","브라우저 백업 파일":"Browser backup file","백업 파일 내보내기":"Export backup","백업 파일 불러오기":"Import backup","개발자에게 피드백 보내기":"Send feedback to the developer","피드백 보내기":"Send feedback","페이지 안내":"Page guides","모든 페이지 안내 다시 보기":"Show all page guides again","모든 데이터 초기화":"Reset all data","상점":"Shop","장바구니":"Cart","장바구니에 담기":"Add to cart","출시 준비 중":"Coming soon","직업 확장팩":"Occupation Expansion","더 넓은 직업의 하루":"More careers, richer daily lives","가격 미정":"Price TBD","테마 DLC":"Theme DLC","구매 복원":"Restore purchases","관계":"Relationships","주간 루틴":"Weekly routine","마을":"Town","사전":"Dictionary","캐릭터":"Characters","현재 시각":"Current time","관찰 중":"Observing","현재 장면":"Current scene","오늘의 생활 로그":"Today's life log","아직 기록이 없어요":"No entries yet","조금 뒤 새로운 생활 장면이 나타납니다.":"A new life scene will appear shortly.","눌러서 펼쳐 보기 ↗":"Tap to expand ↗","전체 보기":"View all","집 보기":"View home","저장":"Save","삭제":"Delete","완료":"Done","편집":"Edit","이름만 표시":"Names only","아무 글자도 표시하지 않기":"Hide all labels","캐릭터 아이콘만 표시":"Icons only","아이콘 아래 이름 표시":"Names below icons","작게":"Small","보통":"Medium","크게":"Large","아주 크게":"Extra large","기기·브라우저 기본 글꼴":"Device / browser default","SD · 아이콘":"SD · Icon","LD · 전신 일러스트":"LD · Full-body illustration","한국어":"한국어","현재 마을 삭제":"Delete current town","+ 마을 추가":"+ Add town","편집 모드":"Edit mode","편집 완료":"Finish editing","집 설정":"Home settings","방 추가·구성":"Add / arrange rooms","구성원":"Residents","반려생물":"Pets","자동차":"Cars","로그":"Log"
  },
  ja:{
    "벽지·바닥 대신 사진 사용":"壁・床の代わりに写真を使用","방 주인":"部屋の持ち主","출입가능":"入室できる人","집 스타일":"家のスタイル","집 유형":"家の種類","세부정보":"詳細","차량 이름":"車の名前","차 소유주":"車の所有者","가족 공동 차량":"家族共用の車","좌석 수":"座席数","차 사진 선택":"車の写真を選択","자동차 삭제":"車を削除","편집 완료":"編集完了","아기":"赤ちゃん","호랑이":"トラ","식물":"植物","차량 설정":"車の設定","색상":"色","경차":"軽自動車","승용차":"乗用車","승합차":"ワンボックスカー","스포츠카":"スポーツカー","전기차":"電気自動車","오토바이":"バイク","자가":"持ち家","전세":"チョンセ（保証金型賃貸）","월세":"月払い賃貸","임시 거주":"仮住まい","방 세부 유형":"部屋の用途","공용":"共用","개인용":"個人用","손님용":"来客用",
    "캐릭터 목록":"キャラクター一覧","첫 캐릭터를 만들어 주세요":"最初のキャラクターを作ってください","+ 캐릭터 만들기":"＋キャラクター作成","+ 생성":"＋作成","프로필":"プロフィール","신체":"身体","성격":"性格","취향 선택":"好み","세계관 선호":"世界観","사진·SD·LD·테마":"画像・SD・LD・テーマ","프로필 내보내기":"プロフィールを書き出す","캐릭터 저장":"キャラクターを保存","캐릭터 삭제":"キャラクターを削除","기본 생활 마을":"生活する村","캐릭터 이름":"キャラクター名","나이대":"年齢層","직업 종류":"職業","표기할 직업명":"表示する職業名","출근할 건물":"勤務先","소비 유형":"消費スタイル","기상 시각":"起床時刻","취침 시각":"就寝時刻","투명 SD 아이콘":"透過SDアイコン","홈화면 LD 일러스트":"ホーム画面のLDイラスト","홈화면 기본 표현":"ホーム画面の基本表示","홈화면 캐릭터 크기":"ホーム画面のキャラクターサイズ","테마색 설정":"テーマカラー","기본":"通常","기쁨":"喜び","슬픔":"悲しみ","화남":"怒り","피곤":"疲れ","파일":"ファイル","링크":"リンク","지우기":"消去","화면 모드":"画面モード","화이트 모드":"ライトモード","다크 모드":"ダークモード","전체 색상 테마":"全体カラーテーマ","글자와 화면 크기":"文字と画面サイズ","글자 크기":"文字サイズ","사용할 글꼴":"フォント","마을 지도 표시":"村マップ表示","건물 표기 방식":"建物ラベル","지도 위 캐릭터 표기":"マップ上のキャラクター表示","Google 계정과 데이터":"Googleアカウントとデータ","Google 로그인 / 로그아웃":"Googleログイン／ログアウト","동기화":"同期","불러오기":"読み込む","브라우저 백업 파일":"ブラウザのバックアップ","백업 파일 내보내기":"バックアップを書き出す","백업 파일 불러오기":"バックアップを読み込む","개발자에게 피드백 보내기":"開発者へフィードバック","피드백 보내기":"フィードバックを送る","페이지 안내":"ページガイド","모든 페이지 안내 다시 보기":"すべてのページガイドを再表示","모든 데이터 초기화":"すべてのデータを初期化","상점":"ショップ","장바구니":"カート","장바구니에 담기":"カートに追加","출시 준비 중":"リリース準備中","직업 확장팩":"職業拡張パック","더 넓은 직업의 하루":"もっと多彩な職業生活","가격 미정":"価格未定","테마 DLC":"テーマDLC","구매 복원":"購入を復元","관계":"関係","주간 루틴":"週間ルーティン","마을":"村","사전":"辞典","캐릭터":"キャラクター","현재 시각":"現在時刻","관찰 중":"観察中","현재 장면":"現在のシーン","오늘의 생활 로그":"今日の生活ログ","아직 기록이 없어요":"まだ記録がありません","조금 뒤 새로운 생활 장면이 나타납니다.":"しばらくすると新しい生活シーンが表示されます。","눌러서 펼쳐 보기 ↗":"タップして開く ↗","전체 보기":"すべて見る","집 보기":"家を見る","저장":"保存","삭제":"削除","완료":"完了","편집":"編集","이름만 표시":"名前のみ表示","아무 글자도 표시하지 않기":"ラベルを表示しない","캐릭터 아이콘만 표시":"アイコンのみ","아이콘 아래 이름 표시":"アイコンの下に名前","작게":"小","보통":"標準","크게":"大","아주 크게":"特大","기기·브라우저 기본 글꼴":"端末・ブラウザの標準フォント","SD · 아이콘":"SD・アイコン","LD · 전신 일러스트":"LD・全身イラスト","한국어":"한국어","현재 마을 삭제":"現在の村を削除","+ 마을 추가":"＋村を追加","편집 모드":"編集モード","편집 완료":"編集完了","집 설정":"家の設定","방 추가·구성":"部屋の追加・配置","구성원":"住人","반려생물":"ペット","자동차":"車","로그":"ログ"
  }
};
Object.assign(UI_TEXT.en,{"세계관 설정":"Worldview settings","캐릭터 프로필":"Character profile","돌아가기":"Back","미설정":"Not set","나이":"Age","생일":"Birthday","월":"month","일":"day","나이 / 생일":"Age / birthday","키·몸무게":"Height · weight","서랍마을 주민등록증":"Drawer Village Resident Card","이곳에 사진을 넣어주세요":"Place a photo here","프로필 사진 추가":"Add profile photo","프로필 사진 변경":"Change profile photo","선택됨":"Selected","선택된 캐릭터 바꾸기":"Change selected character","위치 바꾸기":"Reorder","새 캐릭터 만들기":"Create character","연도 없이 월과 일을 골라 주세요. 생일 당일 생활과 달력에 반영돼요.":"Choose the month and day without a year. It appears in that day's life and calendar."});
Object.assign(UI_TEXT.ja,{"세계관 설정":"世界観設定","캐릭터 프로필":"キャラクタープロフィール","돌아가기":"戻る","미설정":"未設定","나이":"年齢","생일":"誕生日","월":"月","일":"日","나이 / 생일":"年齢／誕生日","키·몸무게":"身長・体重","서랍마을 주민등록증":"ひきだし村 住民登録証","이곳에 사진을 넣어주세요":"ここに写真を入れてください","프로필 사진 추가":"プロフィール写真を追加","프로필 사진 변경":"プロフィール写真を変更","선택됨":"選択中","선택된 캐릭터 바꾸기":"選択中の人物を変更","위치 바꾸기":"並べ替え","새 캐릭터 만들기":"人物を作成","연도 없이 월과 일을 골라 주세요. 생일 당일 생활과 달력에 반영돼요.":"年を入れずに月日を選んでください。誕生日当日の生活とカレンダーに反映されます。"});
Object.assign(UI_TEXT.en,{"빠른 설정":"Quick setup","전체 설정":"Full settings","생활에 필요한 핵심만":"Only the essentials for daily life","모든 설정 항목 보기":"View every setting","캐릭터 설정 방식":"Character setup options","선호 물품 미리보기":"Favorite item preview","이름":"Name","성별":"Gender","성지향":"Orientation","직업":"Occupation","직업명":"Display job title","성격 키워드":"Personality keywords","말투":"Speech style","아이콘":"Icon","화면에 표시할 이름":"Name shown in the game","취소하기":"Cancel","저장하기":"Save","캐릭터 페이지로 돌아가기":"Back to character page","삶의 기초":"Life basics","프로필·주거·직업·생활 습관":"Profile · Home · Work · Habits","외형과 건강":"Appearance & health","신체·외모·건강·접근성":"Body · Appearance · Health · Accessibility","성격과 말투":"Personality & voice","성향·서사·인지·표현":"Traits · Narrative · Cognition · Expression","개인 취향":"Personal tastes","취미·음식·콘텐츠":"Hobbies · Food · Media","세계관 물품":"World items","최애·소지품":"Favorites · Inventory","이미지와 화면":"Images & screen","사진·SD·LD·색상·홈 배치":"Photo · SD · LD · Color · Home layout"});
Object.assign(UI_TEXT.ja,{"빠른 설정":"クイック設定","전체 설정":"全体設定","생활에 필요한 핵심만":"生活に必要な項目だけ","모든 설정 항목 보기":"すべての設定を見る","캐릭터 설정 방식":"キャラクター設定方法","선호 물품 미리보기":"好きなアイテムのプレビュー","이름":"名前","성별":"性別","성지향":"性的指向","직업":"職業","직업명":"表示する職業名","성격 키워드":"性格キーワード","말투":"話し方","아이콘":"アイコン","화면에 표시할 이름":"ゲーム内で表示する名前","취소하기":"キャンセル","저장하기":"保存","캐릭터 페이지로 돌아가기":"キャラクターページに戻る","삶의 기초":"生活の基本","프로필·주거·직업·생활 습관":"プロフィール・住居・職業・生活習慣","외형과 건강":"外見と健康","신체·외모·건강·접근성":"身体・外見・健康・アクセシビリティ","성격과 말투":"性格と話し方","성향·서사·인지·표현":"性向・物語・認知・表現","개인 취향":"個人の好み","취미·음식·콘텐츠":"趣味・食べ物・コンテンツ","세계관 물품":"世界観アイテム","최애·소지품":"お気に入り・持ち物","이미지와 화면":"画像と画面","사진·SD·LD·색상·홈 배치":"写真・SD・LD・色・ホーム配置"});
Object.assign(UI_TEXT.en,{"바로가기":"Shortcut"});
Object.assign(UI_TEXT.ja,{"바로가기":"ショートカット"});
Object.assign(UI_TEXT.en,{"빠른설정":"Quick settings","전체설정":"Full settings"});
Object.assign(UI_TEXT.ja,{"빠른설정":"クイック設定","전체설정":"全体設定"});
Object.assign(UI_TEXT.en,{"빠른 설정 바로가기":"Quick settings shortcut","전체 설정 바로가기":"Full settings shortcut"});
Object.assign(UI_TEXT.ja,{"빠른 설정 바로가기":"クイック設定へ","전체 설정 바로가기":"全体設定へ"});
Object.assign(UI_TEXT.en,{"서로 믿지 않고 거리를 두는 사이":"They do not trust each other and keep their distance."});
Object.assign(UI_TEXT.ja,{"서로 믿지 않고 거리를 두는 사이":"互いを信頼せず、距離を置いている関係"});
Object.assign(UI_TEXT.en,{"새 캐릭터":"New character"});
Object.assign(UI_TEXT.ja,{"새 캐릭터":"新しい人物"});
Object.assign(UI_TEXT.en,{"캐릭터 관리":"Character management"});
Object.assign(UI_TEXT.ja,{"캐릭터 관리":"キャラクター管理"});
Object.assign(UI_TEXT.en,{"개요":"Overview","취향":"Preferences","소지품":"Belongings","전체 설정":"Full settings"});
Object.assign(UI_TEXT.ja,{"개요":"概要","취향":"好み","소지품":"持ち物","전체 설정":"全体設定"});
Object.assign(UI_TEXT.en,{"기본":"Basic","생활":"Daily life","이끌림":"Attraction","개요 기본 설정":"Overview basics","개요 설정 분류":"Overview sections","생일 월":"Birth month","생일 일":"Birth day","출근 장소":"Workplace","자동 선택 · 없음":"Automatic · None","자택근무":"Work from home","주소":"Address","본가":"Primary home","캐릭터 말투":"Speech style","운전면허":"Driver's license","재산":"Wealth","소비유형":"Spending style","흡연 여부":"Smoking","주량":"Alcohol tolerance","운전·흡연·주량":"Driving · smoking · alcohol"});
Object.assign(UI_TEXT.ja,{"기본":"基本","생활":"生活","이끌림":"惹かれ方","개요 기본 설정":"概要の基本設定","개요 설정 분류":"概要の分類","생일 월":"誕生月","생일 일":"誕生日","출근 장소":"勤務先","자동 선택 · 없음":"自動選択・なし","자택근무":"在宅勤務","주소":"住所","본가":"本宅","캐릭터 말투":"話し方","운전면허":"運転免許","재산":"資産","소비유형":"消費スタイル","흡연 여부":"喫煙","주량":"酒量","운전·흡연·주량":"運転・喫煙・酒量"});
Object.assign(UI_TEXT.en,{"개요 생활 설정":"Overview lifestyle settings","기상 습관":"Wake-up habit","취침 습관":"Bedtime habit","생활습관":"Daily rhythm","식습관":"Eating habits","걸음걸이":"Walking style","자율 이끌림":"Autonomous attraction","외모를 보는 정도":"Attention to appearance","선호하는 특성":"Preferred traits","비선호하는 특성":"Disliked traits","느리고 조심스럽게":"Slow and careful","차분하고 반듯하게":"Calm and poised","보통 속도로 자연스럽게":"Natural, average pace","가볍고 경쾌하게":"Light and lively","빠르고 성큼성큼":"Fast, long strides","규칙적으로 식사함":"Eats on a regular schedule","배고플 때 식사함":"Eats when hungry","조금씩 자주 먹음":"Eats small meals often","한 번에 많이 먹음":"Eats large meals","식사를 자주 거름":"Often skips meals","천천히 오래 먹음":"Eats slowly","빨리 먹는 편":"Eats quickly","정하지 않음":"Not set"});
Object.assign(UI_TEXT.ja,{"개요 생활 설정":"概要・生活設定","기상 습관":"起床習慣","취침 습관":"就寝習慣","생활습관":"生活リズム","식습관":"食習慣","걸음걸이":"歩き方","자율 이끌림":"自律的な惹かれ方","외모를 보는 정도":"外見を重視する度合い","선호하는 특성":"好みの特徴","비선호하는 특성":"苦手な特徴","느리고 조심스럽게":"ゆっくり慎重に","차분하고 반듯하게":"落ち着いて端正に","보통 속도로 자연스럽게":"自然な普通の速さ","가볍고 경쾌하게":"軽やかに","빠르고 성큼성큼":"速く大股で","규칙적으로 식사함":"規則正しく食べる","배고플 때 식사함":"空腹時に食べる","조금씩 자주 먹음":"少量をこまめに食べる","한 번에 많이 먹음":"一度にたくさん食べる","식사를 자주 거름":"食事をよく抜く","천천히 오래 먹음":"ゆっくり時間をかけて食べる","빨리 먹는 편":"早食い","정하지 않음":"未設定"});
Object.assign(UI_TEXT.en,{"알람이 울리기 전에 눈을 뜸":"Wakes before the alarm","알람을 여러 번 미룸":"Snoozes the alarm several times","눈을 뜨자마자 바로 일어남":"Gets up immediately","이불 속에서 한참 뒹굶":"Lingers under the blanket","일어나자마자 창문을 엶":"Opens the window after waking","일어나자마자 물을 마심":"Drinks water after waking","침대에서 오늘 일정을 확인함":"Checks today's schedule in bed","비몽사몽한 채 방을 돌아다님":"Wanders around half-awake","누가 깨워 줘야 일어남":"Needs someone to wake them","끼니를 자주 거름":"Often skips meals","배고플 때만 먹음":"Eats only when hungry","빠르게 먹는 편":"Eats quickly","설정하지 않음 · 절대 끌리지 않음":"Not set · Never attracted","연인이 없을 때만 취향이면 끌림":"Attracted to their type only when single","연인이 있어도 취향이면 끌릴 수 있음":"May be attracted to their type even while partnered"});
Object.assign(UI_TEXT.ja,{"알람이 울리기 전에 눈을 뜸":"アラーム前に目が覚める","알람을 여러 번 미룸":"アラームを何度も止める","눈을 뜨자마자 바로 일어남":"目が覚めるとすぐ起きる","이불 속에서 한참 뒹굶":"布団の中でしばらく過ごす","일어나자마자 창문을 엶":"起きるとすぐ窓を開ける","일어나자마자 물을 마심":"起きるとすぐ水を飲む","침대에서 오늘 일정을 확인함":"ベッドで今日の予定を確認する","비몽사몽한 채 방을 돌아다님":"寝ぼけたまま部屋を歩く","누가 깨워 줘야 일어남":"誰かに起こしてもらう必要がある","끼니를 자주 거름":"食事をよく抜く","배고플 때만 먹음":"空腹時だけ食べる","빠르게 먹는 편":"早食い","설정하지 않음 · 절대 끌리지 않음":"未設定・決して惹かれない","연인이 없을 때만 취향이면 끌림":"恋人がいない時だけ好みなら惹かれる","연인이 있어도 취향이면 끌릴 수 있음":"恋人がいても好みなら惹かれることがある"});
Object.assign(UI_TEXT.en,{"캐릭터 테마색":"Character theme colors","주 색상":"Primary color","보조 색상":"Secondary color","두 색상을 그라데이션으로 사용":"Use both colors as a gradient","프로필 사진 추가하기":"Add profile photo","배치 조정하기":"Adjust placement","LD 사진 추가하기":"Add LD image","아이콘 추가하기":"Add icon","손가락으로 직접 배치":"Direct touch placement","한 손가락으로 이동하고, 두 손가락으로 확대·축소와 회전을 조절해요.":"Drag with one finger. Pinch and rotate with two fingers.","배치 편집 닫기":"Close placement editor"});
Object.assign(UI_TEXT.ja,{"캐릭터 테마색":"キャラクターのテーマ色","주 색상":"メインカラー","보조 색상":"サブカラー","두 색상을 그라데이션으로 사용":"2色をグラデーションで使う","프로필 사진 추가하기":"プロフィール写真を追加","배치 조정하기":"配置を調整","LD 사진 추가하기":"LD画像を追加","아이콘 추가하기":"アイコンを追加","손가락으로 직접 배치":"指で直接配置","한 손가락으로 이동하고, 두 손가락으로 확대·축소와 회전을 조절해요.":"1本指で移動し、2本指で拡大・縮小と回転を調整します。","배치 편집 닫기":"配置編集を閉じる"});
Object.assign(UI_TEXT.en,{"이미지":"Images"});
Object.assign(UI_TEXT.ja,{"이미지":"画像"});
Object.assign(UI_TEXT.en,{"걷기 구두소리 듣기":"Preview walking footsteps","달리기 구두소리 듣기":"Preview running footsteps","표지에서 개요로 이동":"Go from cover to overview","개요 첫 페이지":"First overview page"});
Object.assign(UI_TEXT.ja,{"걷기 구두소리 듣기":"歩く足音を試聴","달리기 구두소리 듣기":"走る足音を試聴","표지에서 개요로 이동":"表紙から概要へ移動","개요 첫 페이지":"概要の1ページ目"});
Object.assign(UI_TEXT.en,{"사진 추가하기":"Add photo","프로필 사진":"Profile photo","아이콘":"Icon","행동 습관":"Behavior habits"});
Object.assign(UI_TEXT.ja,{"사진 추가하기":"写真を追加","프로필 사진":"プロフィール写真","아이콘":"アイコン","행동 습관":"行動の癖"});
Object.assign(UI_TEXT.en,{"소리":"Sound","이동과 생활 효과음":"Movement & life sounds","캐릭터가 걷거나 뛰는 동안 들리는 효과음을 조절해요.":"Adjust the sound effects played while characters walk or run.","모든 효과음 음소거":"Mute all sound effects","앱의 이동·생활 효과음을 한 번에 끕니다.":"Turn off movement and life sound effects at once.","효과음 크기":"Sound effects volume","구두소리 미리 듣기":"Preview footsteps","음소거를 해제하면 미리 들을 수 있어요.":"Unmute sound effects to preview them."});
Object.assign(UI_TEXT.ja,{"소리":"サウンド","이동과 생활 효과음":"移動・生活効果音","캐릭터가 걷거나 뛰는 동안 들리는 효과음을 조절해요.":"キャラクターが歩いたり走ったりする時の効果音を調整します。","모든 효과음 음소거":"すべての効果音をミュート","앱의 이동·생활 효과음을 한 번에 끕니다.":"移動・生活効果音をまとめてオフにします。","효과음 크기":"効果音の音量","구두소리 미리 듣기":"足音を試聴","음소거를 해제하면 미리 들을 수 있어요.":"ミュートを解除すると試聴できます。"});
Object.assign(UI_TEXT.en,{"밝은 글자":"Light text","어두운 글자":"Dark text","작은 방":"Small room","보통 방":"Medium room","큰 방":"Large room","취미방":"Hobby room","북유럽풍":"Scandinavian","인더스트리얼":"Industrial","맥시멀":"Maximalist","아기자기":"Cozy and cute","자연친화":"Nature-inspired","방 삭제":"Delete room","사진 밝기에 맞춰 방 이름이 잘 보이는 쪽을 고르세요.":"Choose a text color that is readable over the photo.","가끔 공간의 무드와 캐릭터의 기분 묘사에 반영돼요.":"Used in descriptions of the room's atmosphere and the character's mood.","일반 주거":"Residence"});
Object.assign(UI_TEXT.ja,{"밝은 글자":"明るい文字","어두운 글자":"暗い文字","작은 방":"小さな部屋","보통 방":"標準の部屋","큰 방":"大きな部屋","취미방":"趣味の部屋","북유럽풍":"北欧風","인더스트리얼":"インダストリアル","맥시멀":"マキシマル","아기자기":"かわいらしい","자연친화":"自然を感じる","방 삭제":"部屋を削除","사진 밝기에 맞춰 방 이름이 잘 보이는 쪽을 고르세요.":"写真の明るさに合わせ、部屋名が読みやすい色を選んでください。","가끔 공간의 무드와 캐릭터의 기분 묘사에 반영돼요.":"空間の雰囲気やキャラクターの気分の描写に使われます。","일반 주거":"住居"});
Object.assign(UI_TEXT.en,{"방 편집":"Edit room","방 이름":"Room name","방 유형":"Room type","방이 있는 층":"Floor","방 크기":"Room size","방 사진 표시":"Room photo fit","인테리어 스타일":"Interior style","방 제목 색":"Room title color","가구 배치":"Furniture placement","가구를 누르면 방 안에 하나씩 추가돼요. 편집 화면에서 직접 끌고, 아래 도구로 회전·크기·앞뒤 순서를 바꿀 수 있어요.":"Tap furniture to add it to the room. Drag it in the edit view, then use the toolbar to rotate, resize, or change its layer.","선택한 가구 편집":"Edit selected furniture","가구 작게":"Make furniture smaller","가구 크게":"Make furniture larger","가구 회전":"Rotate furniture","가구 뒤로":"Send furniture backward","가구 앞으로":"Bring furniture forward","가구":"Furniture"});
Object.assign(UI_TEXT.ja,{"방 편집":"部屋を編集","방 이름":"部屋の名前","방 유형":"部屋の種類","방이 있는 층":"部屋の階","방 크기":"部屋の大きさ","방 사진 표시":"部屋写真の表示","인테리어 스타일":"インテリアスタイル","방 제목 색":"部屋名の色","가구 배치":"家具の配置","가구를 누르면 방 안에 하나씩 추가돼요. 편집 화면에서 직접 끌고, 아래 도구로 회전·크기·앞뒤 순서를 바꿀 수 있어요.":"家具を押すと部屋に1つ追加されます。編集画面でドラッグし、下のツールで回転・大きさ・前後関係を調整できます。","선택한 가구 편집":"選択した家具を編集","가구 작게":"家具を小さくする","가구 크게":"家具を大きくする","가구 회전":"家具を回転","가구 뒤로":"家具を後ろへ","가구 앞으로":"家具を前へ","가구":"家具"});
Object.assign(UI_TEXT.en,{"가구 배치":"Furniture placement","커플 침대":"Couple bed","침대 지정":"Assign bed","최근 생활 로그":"Recent life log"});
Object.assign(UI_TEXT.ja,{"가구 배치":"家具の配置","커플 침대":"ダブルベッド","침대 지정":"ベッド指定","최근 생활 로그":"最近の生活ログ"});
Object.assign(UI_TEXT.en,{"바닥재":"Flooring","마루 바닥":"Wood floor","크림 타일":"Cream tile","직접 그린 바닥":"Custom floor","바닥 이미지 첨부":"Add custom floor image","직접 그린 바닥 변경":"Change custom floor","집 화면에는 바닥재가 보이고, 방 사진은 관찰 장면과 집 정보에서만 사용돼요.":"The home view shows flooring. Room photos are used only in observation scenes and home details.","관찰·집 정보용 방 사진":"Room photo for observation and home details","방 사진 변경":"Change room photo","방 사진 추가하기":"Add room photo"});
Object.assign(UI_TEXT.ja,{"바닥재":"床材","마루 바닥":"木の床","크림 타일":"クリーム色のタイル","직접 그린 바닥":"自作の床","바닥 이미지 첨부":"床画像を追加","직접 그린 바닥 변경":"自作の床を変更","집 화면에는 바닥재가 보이고, 방 사진은 관찰 장면과 집 정보에서만 사용돼요.":"家の画面には床材が表示され、部屋写真は観察シーンと家情報でのみ使用されます。","관찰·집 정보용 방 사진":"観察・家情報用の部屋写真","방 사진 변경":"部屋写真を変更","방 사진 추가하기":"部屋写真を追加"});
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
    "관계인 캐릭터별 시선":"Each character's point of view","두 이름을 눌러 누구의 마음이 누구에게 향하는지 고르세요.":"Choose two names to decide whose feelings are directed at whom.","함께 다니기":"Stay together","둘 다 별도 일정이 없을 때 같은 장소에서 함께 행동하고, 생활 로그에도 함께 표시해요.":"When neither has a separate schedule, they stay in the same place and appear together in the life log.",
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
    "관계인 캐릭터별 시선":"キャラクターごとの視点","두 이름을 눌러 누구의 마음이 누구에게 향하는지 고르세요.":"2人の名前を押して、誰の気持ちが誰に向いているか選んでください。","함께 다니기":"一緒に行動する","둘 다 별도 일정이 없을 때 같은 장소에서 함께 행동하고, 생활 로그에도 함께 표시해요.":"2人とも別の予定がない時は同じ場所で一緒に行動し、生活ログにも一緒に表示します。",
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
  "세부 유형":"Subtype","지형":"Terrain","교통편":"Transport","교통편 · 여러 개 선택 가능":"Transport · select multiple","다른 마을과 이동 가능":"Travel to and from other towns","끄면 이 마을을 오가는 일정과 자동 이동이 멈춰요.":"Turn this off to stop schedules and automatic travel to or from this town.","기후":"Climate","기후 설정과 기후별 생활 로그는 기후 확장 DLC에서 제공할 예정이에요.":"Climate settings and climate-specific life logs will be included in the Climate Expansion DLC.","마을 일러스트 선택":"Choose town illustration","마을 설정과 잘 맞는 순서로 보여 줘요. 선택하면 마을 전체 배경이 바뀝니다.":"Illustrations are ranked by compatibility with this town. Choosing one changes the entire town background.","추천":"Recommended","기본 제공":"Included","기후 확장 DLC":"Climate Expansion DLC",
  "생활 중심":"Everyday life","주거 중심":"Residential","상업 중심":"Commercial","행정 중심":"Administrative","산업 중심":"Industrial","학원·연구 중심":"Academic · research","의료·복지 중심":"Medical · welfare","관광 중심":"Tourism","휴양 중심":"Resort · retreat","교통·물류 중심":"Transport · logistics","농업 중심":"Agricultural","어업·항구 중심":"Fishing · port","광업·자원 중심":"Mining · resources","군사·방위 중심":"Military · defense","종교·성지 중심":"Religious · sacred","문화·예술 중심":"Culture · arts","생태·보전 중심":"Ecology · conservation","혼합형":"Mixed-use",
  "평야":"Plains","구릉":"Hills","산지":"Mountains","분지":"Basin","고원":"Highland","해안":"Coast","섬":"Island","강가":"Riverside","호숫가":"Lakeside","삼각주":"Delta","숲":"Forest","습지":"Wetland","사막":"Desert","설원":"Snowfield","화산 지대":"Volcanic area","협곡":"Canyon","동굴·지하":"Cavern · underground",
  "도보길":"Walking paths","자전거도로":"Bicycle routes","일반 도로":"Roads","시외버스":"Intercity bus","철도":"Rail","지하철":"Subway","노면전차":"Tram","여객선":"Ferry","공항":"Airport","케이블카":"Cable car",
  "숲과 연못 마을":"Forest and pond town","강가 정착지":"Riverside settlement","계획 도시":"Planned city","강변 중심 도시":"Riverfront downtown","눈 내리는 산간 마을":"Snowy mountain town","열대 섬 마을":"Tropical island town","사막 교역 도시":"Desert trading city",
  "가족 친화적":"Family-friendly","교육 환경이 좋음":"Excellent education","의료·복지가 좋음":"Excellent health and welfare","일자리가 많음":"Plenty of jobs","창업이 활발함":"Thriving startups","상권이 유명함":"Famous shopping district","음식으로 유명함":"Famous for food","축제로 유명함":"Famous for festivals","예술과 문화로 유명함":"Known for arts and culture","자연 경관이 아름다움":"Beautiful natural scenery","교통이 편리함":"Convenient transport","부유한 동네":"Affluent","물가가 비쌈":"Expensive","밤문화가 활발함":"Active nightlife","주민들이 친절함":"Friendly residents","외지인을 환영함":"Welcoming to outsiders","치안이 불안함":"Poor public safety","사건 사고가 잦음":"Frequent incidents","환경 오염이 심함":"Severe pollution","쇠퇴 중인 곳":"In decline","신비한 소문이 도는 곳":"Known for mysterious rumors"
});
Object.assign(UI_TEXT.ja,{
  "세부 유형":"詳細タイプ","지형":"地形","교통편":"交通手段","교통편 · 여러 개 선택 가능":"交通手段・複数選択可","다른 마을과 이동 가능":"ほかの村と移動可能","끄면 이 마을을 오가는 일정과 자동 이동이 멈춰요.":"オフにすると、この村を出入りする予定と自動移動が止まります。","기후":"気候","기후 설정과 기후별 생활 로그는 기후 확장 DLC에서 제공할 예정이에요.":"気候設定と気候別の生活ログは、気候拡張DLCで提供予定です。","마을 일러스트 선택":"村のイラストを選択","마을 설정과 잘 맞는 순서로 보여 줘요. 선택하면 마을 전체 배경이 바뀝니다.":"村の設定に合う順に表示します。選ぶと村全体の背景が変わります。","추천":"おすすめ","기본 제공":"基本収録","기후 확장 DLC":"気候拡張DLC",
  "생활 중심":"生活中心","주거 중심":"住宅中心","상업 중심":"商業中心","행정 중심":"行政中心","산업 중심":"産業中心","학원·연구 중심":"学園・研究中心","의료·복지 중심":"医療・福祉中心","관광 중심":"観光中心","휴양 중심":"保養中心","교통·물류 중심":"交通・物流中心","농업 중심":"農業中心","어업·항구 중심":"漁業・港中心","광업·자원 중심":"鉱業・資源中心","군사·방위 중심":"軍事・防衛中心","종교·성지 중심":"宗教・聖地中心","문화·예술 중심":"文化・芸術中心","생태·보전 중심":"生態・保全中心","혼합형":"複合型",
  "평야":"平野","구릉":"丘陵","산지":"山地","분지":"盆地","고원":"高原","해안":"海岸","섬":"島","강가":"川辺","호숫가":"湖畔","삼각주":"三角州","숲":"森","습지":"湿地","사막":"砂漠","설원":"雪原","화산 지대":"火山地帯","협곡":"峡谷","동굴·지하":"洞窟・地下",
  "도보길":"歩道","자전거도로":"自転車道","일반 도로":"一般道路","시외버스":"高速バス","철도":"鉄道","지하철":"地下鉄","노면전차":"路面電車","여객선":"旅客船","공항":"空港","케이블카":"ケーブルカー",
  "숲과 연못 마을":"森と池の村","강가 정착지":"川辺の集落","계획 도시":"計画都市","강변 중심 도시":"川沿いの中心都市","눈 내리는 산간 마을":"雪の山村","열대 섬 마을":"熱帯の島の村","사막 교역 도시":"砂漠の交易都市",
  "가족 친화적":"家族にやさしい","교육 환경이 좋음":"教育環境が良い","의료·복지가 좋음":"医療・福祉が充実","일자리가 많음":"仕事が多い","창업이 활발함":"起業が盛ん","상권이 유명함":"商業地区が有名","음식으로 유명함":"食で有名","축제로 유명함":"祭りで有名","예술과 문화로 유명함":"芸術と文化で有名","자연 경관이 아름다움":"自然景観が美しい","교통이 편리함":"交通が便利","부유한 동네":"裕福な地域","물가가 비쌈":"物価が高い","밤문화가 활발함":"夜の文化が盛ん","주민들이 친절함":"住民が親切","외지인을 환영함":"よそ者を歓迎する","치안이 불안함":"治安が不安","사건 사고가 잦음":"事件や事故が多い","환경 오염이 심함":"環境汚染が深刻","쇠퇴 중인 곳":"衰退中","신비한 소문이 도는 곳":"不思議な噂がある"
});
Object.assign(UI_TEXT.en,{"식재료":"Ingredients","출퇴근 이동수단 · 여러 개 선택 가능":"Commute methods · select multiple","자차":"Own car","대중교통":"Public transit","버스":"Bus","지하철":"Subway","택시":"Taxi","도보":"Walking","자전거":"Bicycle","차 소유주":"Car owner","가족 공동 차량":"Shared family car","집 외형 바꾸기":"Change home exterior","집 설정 열기":"Open home settings","이 건물 편집하기":"Edit this building","건물이나 집을 길게 누르면 바로 편집할 수 있어요.":"Press and hold a building or home to edit it directly."});
Object.assign(UI_TEXT.ja,{"식재료":"食材","출퇴근 이동수단 · 여러 개 선택 가능":"通勤手段・複数選択可","자차":"自家用車","대중교통":"公共交通機関","버스":"バス","지하철":"地下鉄","택시":"タクシー","도보":"徒歩","자전거":"自転車","차 소유주":"車の所有者","가족 공동 차량":"家族共用車","집 외형 바꾸기":"家の外観を変更","집 설정 열기":"家の設定を開く","이 건물 편집하기":"この建物を編集","건물이나 집을 길게 누르면 바로 편집할 수 있어요.":"建物や家を長押しすると、すぐに編集できます。"});
Object.assign(UI_TEXT.en,{
  "레이아웃은 보기 방식이고, 실제 자동 코디는 상황·색·격식·패션 감각을 따져요.":"The layout only changes the view. Automatic outfit selection still considers the situation, colors, formality, and fashion sense.",
  "마른 잎 하나를 떨어뜨리고 남은 잎에 힘을 모으고 있어요.":"It dropped one dry leaf and is gathering strength in the leaves that remain.",
  "먹이 냄새를 따라 목을 길게 내밀고 접시 쪽으로 움직이고 있어요.":"Following the smell of food, it stretches its neck and moves toward the dish.",
  "먹이와 물이 있는 곳을 확인한 뒤 자기 자리로 돌아가고 있어요.":"After checking where the food and water are, it returns to its spot.",
  "먹이통에서 좋아하는 알갱이만 골라 천천히 먹고 있어요.":"It picks out its favorite pieces from the feeder and eats them slowly.",
  "먼저 어울림":"Blend in first","메이스":"Mace",
  "모든 캐릭터에 같은 표시 방식을 적용합니다. LD는 원본 비율을 유지하고 자르거나 늘리지 않습니다.":"Use the same display style for every character. LD art keeps its original aspect ratio without cropping or stretching.",
  "모서리를 끌어 캐릭터 크기 조정":"Drag a corner to resize the character",
  "몸을 낮춘 채 장난감을 노리다가 짧고 빠르게 앞으로 뛰어들었어요.":"Crouching low, it stalked the toy before springing forward in a quick, short pounce.",
  "몸의 털을 차분히 정돈한 뒤 다시 편한 자세를 잡았어요.":"It calmly groomed its fur, then settled back into a comfortable position.",
  "못생김":"Unattractive","무난하게 입음":"Dresses simply","무대·촬영용":"Stage · filming","무상 거주":"Rent-free housing","무알코올":"Alcohol-free","무카페인":"Caffeine-free","문구":"Stationery",
  "문자·시각 정보 함께 제공":"Provide text and visual information together",
  "물가와 마른 자리를 천천히 오가며 마음에 드는 위치를 고르고 있어요.":"It slowly moves between the water and dry ground, choosing the spot it likes best."
});
Object.assign(UI_TEXT.ja,{
  "레이아웃은 보기 방식이고, 실제 자동 코디는 상황·색·격식·패션 감각을 따져요.":"レイアウトは表示方法だけを変えます。実際の自動コーデは状況・色・格式・ファッション感覚を考慮します。",
  "마른 잎 하나를 떨어뜨리고 남은 잎에 힘을 모으고 있어요.":"枯れ葉を一枚落とし、残った葉に力を集めています。",
  "먹이 냄새를 따라 목을 길게 내밀고 접시 쪽으로 움직이고 있어요.":"餌の匂いを追って首を伸ばし、皿の方へ動いています。",
  "먹이와 물이 있는 곳을 확인한 뒤 자기 자리로 돌아가고 있어요.":"餌と水の場所を確かめてから、自分の場所へ戻っています。",
  "먹이통에서 좋아하는 알갱이만 골라 천천히 먹고 있어요.":"餌入れから好きな粒だけを選び、ゆっくり食べています。",
  "먼저 어울림":"まずはなじむ","메이스":"メイス",
  "모든 캐릭터에 같은 표시 방식을 적용합니다. LD는 원본 비율을 유지하고 자르거나 늘리지 않습니다.":"すべてのキャラクターに同じ表示方法を適用します。LDは元の比率を保ち、切り抜きや引き伸ばしをしません。",
  "모서리를 끌어 캐릭터 크기 조정":"角をドラッグしてキャラクターの大きさを調整",
  "몸을 낮춘 채 장난감을 노리다가 짧고 빠르게 앞으로 뛰어들었어요.":"姿勢を低くしておもちゃを狙い、短く素早く飛びかかりました。",
  "몸의 털을 차분히 정돈한 뒤 다시 편한 자세를 잡았어요.":"毛並みを落ち着いて整えてから、また楽な姿勢を取りました。",
  "못생김":"不格好","무난하게 입음":"無難な服装","무대·촬영용":"舞台・撮影用","무상 거주":"無償居住","무알코올":"ノンアルコール","무카페인":"ノンカフェイン","문구":"文房具",
  "문자·시각 정보 함께 제공":"文字と視覚情報をあわせて提供",
  "물가와 마른 자리를 천천히 오가며 마음에 드는 위치를 고르고 있어요.":"水辺と乾いた場所をゆっくり行き来し、気に入った場所を選んでいます。"
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
  "현재 장면 새로고침":"Refresh current scene","홈 캐릭터 표현 전환":"Switch home character visual","지금 사용 중인 사전 항목":"Dictionary items currently in use"
});
Object.assign(UI_TEXT.ja,{
  "LD 미등록":"LD未登録","LD 일러스트":"LDイラスト","전신 또는 무릎 위 이미지 한 장":"全身または膝上の画像1枚","LD 파일":"LDファイル","LD 링크":"LDリンク",
  "LD 일러스트는 캐릭터마다 한 장만 등록합니다. 감정은 장면의 배경 효과로 표현해요.":"LDイラストはキャラクターごとに1枚だけ登録します。感情はシーンの背景エフェクトで表現します。",
  "투명 SD 아이콘과 단일 LD 일러스트는 ‘사진·SD·LD’ 탭에서 따로 등록해요.":"透過SDアイコンと1枚のLDイラストは「画像・SD・LD」タブで別々に登録します。",
  "프로필 사진, 투명 SD 아이콘, 전신 LD 일러스트는 전부 별도 파일입니다. 등록하지 않은 칸은 기존 표현을 그대로 사용해요.":"プロフィール写真・透過SDアイコン・LDイラストはすべて別ファイルです。未登録の欄は既存の表示を使用します。",
  "현재 장면 새로고침":"現在のシーンを更新","홈 캐릭터 표현 전환":"ホームのキャラクター表示を切り替える","지금 사용 중인 사전 항목":"現在使用中の辞典アイテム"
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
Object.assign(UI_TEXT.en,{
  "1,850원":"KRW 1,850","건물 정보 보기\"":"View building details","기본 실루엣\"":"Default silhouette",
  "공식 관계와 각 캐릭터의 서로 다른 속마음을 한 화면에서 설정해요. 설정한 시선은 생활 장면의 말투, 접근 방식, 접촉과 갈등에 반영돼요.":"Set official relationships and each character's private point of view in one place. These views shape their tone, approach, physical contact, and conflicts in life scenes.",
  "기존 ‘그 외 외모 태그’도 이곳에서 함께 확인할 수 있어요. 체형·머리색·눈색처럼 위에서 정하는 항목은 중복해서 두지 않았습니다.":"You can also review the existing Other appearance tags here. Options already covered above, such as build, hair color, and eye color, are not duplicated.",
  "내 소지품으로 구매":"Buy for my inventory","내추럴":"Natural","넓고 긴 방":"Large long room","노다치":"Nodachi","노래":"Songs","노트북":"Laptop","놀이 매트":"Play mat","놀이 매트에서 노는 중":"Playing on the play mat","농·청각장애":"Deaf or hard of hearing","농구":"Basketball",
  "넓게 비워 둔 동선을 따라 천천히 움직이며 자리를 잡고 있어요.":"They move slowly along the wide, clear path and settle into place.",
  "넓은 공간의 가장자리를 천천히 돌며 냄새와 소리를 확인하고 있어요.":"They slowly circle the edge of the open space, checking its scents and sounds.",
  "넓은 자리에 옆으로 몸을 누이고 꼬리 끝만 가끔 움직이며 쉬고 있어요.":"They lie on their side in a roomy spot, resting with only the tip of their tail moving now and then.",
  "노즈워크 장난감 사이에 숨은 간식 냄새를 따라 코를 바쁘게 움직이고 있어요.":"Their nose works busily as they follow the scent of treats hidden in the nose-work toy.",
  "높은 가구 위에 올라 자기 영역을 내려다보고 있어요.":"They climb onto a tall piece of furniture and look down over their territory."
});
Object.assign(UI_TEXT.ja,{
  "1,850원":"1,850ウォン","건물 정보 보기\"":"建物情報を見る","기본 실루엣\"":"基本シルエット",
  "공식 관계와 각 캐릭터의 서로 다른 속마음을 한 화면에서 설정해요. 설정한 시선은 생활 장면의 말투, 접근 방식, 접촉과 갈등에 반영돼요.":"公式の関係と、キャラクターごとに異なる本音を一つの画面で設定します。その視点は生活シーンの口調、接し方、接触、葛藤に反映されます。",
  "기존 ‘그 외 외모 태그’도 이곳에서 함께 확인할 수 있어요. 체형·머리색·눈색처럼 위에서 정하는 항목은 중복해서 두지 않았습니다.":"既存の「その他の外見タグ」もここで確認できます。体型・髪色・瞳色など上で設定する項目は重複させていません。",
  "내 소지품으로 구매":"自分の持ち物として購入","내추럴":"ナチュラル","넓고 긴 방":"広くて長い部屋","노다치":"野太刀","노래":"歌","노트북":"ノートパソコン","놀이 매트":"プレイマット","놀이 매트에서 노는 중":"プレイマットで遊んでいる","농·청각장애":"ろう・難聴","농구":"バスケットボール",
  "넓게 비워 둔 동선을 따라 천천히 움직이며 자리를 잡고 있어요.":"広く空けた動線に沿ってゆっくり移動し、居場所を決めています。",
  "넓은 공간의 가장자리를 천천히 돌며 냄새와 소리를 확인하고 있어요.":"広い空間の端をゆっくり回りながら、匂いと音を確かめています。",
  "넓은 자리에 옆으로 몸을 누이고 꼬리 끝만 가끔 움직이며 쉬고 있어요.":"広い場所で横になり、しっぽの先だけを時々動かしながら休んでいます。",
  "노즈워크 장난감 사이에 숨은 간식 냄새를 따라 코를 바쁘게 움직이고 있어요.":"ノーズワークのおもちゃに隠れたおやつの匂いを追い、忙しく鼻を動かしています。",
  "높은 가구 위에 올라 자기 영역을 내려다보고 있어요.":"背の高い家具に上がり、自分の縄張りを見下ろしています。"
});
Object.assign(UI_TEXT.en,{
  "두 캐릭터의 범위가 다르면 더 낮은 쪽까지만 반영돼요.":"When the characters have different limits, the lower boundary applies.","둔기":"Blunt weapons","둘이 같은 공간에 있을 때의 편안함과 대화 호흡을 정해요.":"Sets how comfortable they feel together and how naturally conversation flows.","둥지를 오가며 노는 중":"Playing between nests","드라마":"Drama","드래곤":"Dragon","드럼":"Drums","등에 올라 마을 위를 천천히 날며":"Riding on its back and flying slowly above the town","등에 올라 안전한 산책길을 천천히 달리며":"Riding on its back along a safe path at an easy pace","디저트광":"Dessert lover","디지털 드로잉":"Digital drawing","디지털 드로잉 장비":"Digital drawing equipment","디퓨저":"Diffuser","따뜻하게":"Warmly","따뜻하고 높은 자리에 앞발을 접어 넣은 채 느긋하게 잠들어 있어요.":"They are sleeping peacefully in a warm, elevated spot with their front paws tucked in.","따뜻한 자리에 머물자 비늘 표면에 빛이 은은하게 비치고 있어요.":"As they rest in a warm spot, light glimmers softly across their scales.","따뜻한 조명이 비치는 자리까지 천천히 걸어가 몸을 데우고 있어요.":"They slowly walk into the warm light and let it heat their body.","따뜻한 쿠션을 둥지처럼 모아 가운데에 몸을 말고 있어요.":"They gather warm cushions into a nest and curl up in the middle.","따로 거주":"Living separately","뜨개 도구":"Knitting tools"
});
Object.assign(UI_TEXT.ja,{
  "두 캐릭터의 범위가 다르면 더 낮은 쪽까지만 반영돼요.":"二人の範囲が異なる場合は、より低いほうまで反映されます。","둔기":"鈍器","둘이 같은 공간에 있을 때의 편안함과 대화 호흡을 정해요.":"二人が同じ空間にいるときの居心地と会話のテンポを設定します。","둥지를 오가며 노는 중":"巣を行き来して遊んでいる","드라마":"ドラマ","드래곤":"ドラゴン","드럼":"ドラム","등에 올라 마을 위를 천천히 날며":"背中に乗って村の上をゆっくり飛びながら","등에 올라 안전한 산책길을 천천히 달리며":"背中に乗って安全な散歩道をゆっくり走りながら","디저트광":"スイーツ好き","디지털 드로잉":"デジタルドローイング","디지털 드로잉 장비":"デジタル作画機材","디퓨저":"ディフューザー","따뜻하게":"あたたかく","따뜻하고 높은 자리에 앞발을 접어 넣은 채 느긋하게 잠들어 있어요.":"あたたかく高い場所で前足をしまい、のんびり眠っています。","따뜻한 자리에 머물자 비늘 표면에 빛이 은은하게 비치고 있어요.":"あたたかい場所で休むと、鱗の表面に光がやわらかく映っています。","따뜻한 조명이 비치는 자리까지 천천히 걸어가 몸을 데우고 있어요.":"あたたかな照明の当たる場所までゆっくり歩き、体を温めています。","따뜻한 쿠션을 둥지처럼 모아 가운데에 몸을 말고 있어요.":"あたたかいクッションを巣のように集め、その中央で丸くなっています。","따로 거주":"別居","뜨개 도구":"編み物道具"
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
let displayParticleMatcherRevision="",cachedDisplayParticleMatcher=null;
const displayParticleMatcher=()=>{
  const revision=`${Number(state.lastSaved||0)}:${state.order.length}:${Object.keys(state.homes||{}).length}`;
  if(revision===displayParticleMatcherRevision)return cachedDisplayParticleMatcher;
  const names=displayEntityNames();
  cachedDisplayParticleMatcher=names.length?new RegExp(`(${names.map(regexEscape).join("|")})(은|는|이|가|을|를|과|와)(?=[\\s,.!?·'\"’”)]|$)`,"g"):null;
  displayParticleMatcherRevision=revision;
  return cachedDisplayParticleMatcher;
};
function resolveDisplayParticles(text,matcher=displayParticleMatcher()){
  let result=String(text||"")
    .replace(/([가-힣A-Za-z0-9_]+)은\(는\)/g,(_,word)=>withParticle(word,"은","는"))
    .replace(/([가-힣A-Za-z0-9_]+)이\(가\)/g,(_,word)=>subjectText(word))
    .replace(/([가-힣A-Za-z0-9_]+)을\(를\)/g,(_,word)=>objectText(word))
    .replace(/([가-힣A-Za-z0-9_]+)과\(와\)/g,(_,word)=>togetherText(word));
  if(matcher){
    matcher.lastIndex=0;
    result=result.replace(matcher,(_,name,particle)=>{
      if(["은","는"].includes(particle))return withParticle(name,"은","는");
      if(["이","가"].includes(particle))return subjectText(name);
      if(["을","를"].includes(particle))return objectText(name);
      return togetherText(name);
    });
  }
  return result;
}
function normalizeDisplayedParticles(root){
  if(!root||typeof document.createTreeWalker!=="function")return;
  // A large character/village can contain thousands of text nodes. Building
  // the entity-name list and every regular expression for every text node was
  // the main source of input and tab-navigation stalls on the web build.
  const matcher=displayParticleMatcher();
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const next=resolveDisplayParticles(node.nodeValue,matcher);if(next!==node.nodeValue)node.nodeValue=next});
}
const sceneFailureIds=new Set();
const fallbackEvent=c=>{
  const roomKeys=Object.keys(state.homes?.[c?.homeId]?.rooms||{});
  return {minute:new Date().getHours()*60+new Date().getMinutes(),title:"생활 장면을 다시 계산하는 중",desc:"저장된 설정은 그대로 두고 현재 장면만 안전하게 다시 계산하고 있어요.",home:true,room:c?.sleepRoomId||roomKeys[0]||"",townId:c?.townId||state.activeTownId,mood:"대기"};
};
const renderEventCache=new Map(),renderTimelineCache=new Map();
const cacheSetBounded=(cache,key,value)=>{
  cache.set(key,value);
  if(cache.size>160)cache.delete(cache.keys().next().value);
  return value;
};
const renderSceneCacheKey=(c,date)=>`${c?.id||""}:${Number(c?.timelineResetAt||0)}:${Number(state.lastSaved||0)}:${state.uiLanguage}:${date.getFullYear()}-${date.getMonth()}-${date.getDate()}:${date.getHours()}:${date.getMinutes()}`;
const eventFor=(c,date=new Date())=>{
  const key=renderSceneCacheKey(c,date);
  if(renderEventCache.has(key))return renderEventCache.get(key);
  try{return cacheSetBounded(renderEventCache,key,simulateEventFor(c,date)||fallbackEvent(c))}
  catch(error){
    if(!sceneFailureIds.has(c?.id)){sceneFailureIds.add(c?.id);console.error(`캐릭터 장면 계산 실패 · ${c?.id||"unknown"}`,error)}
    return fallbackEvent(c);
  }
};
// Town cards share the render cache instead of running the simulator once per
// character for every building on the map.
const charactersAtPlace=(id,townId=state.activeTownId)=>state.order.map(key=>state.characters[key]).filter(Boolean).filter(character=>{const scene=eventFor(character);return scene.placeId===id&&scene.townId===townId});
const visibleTimeline=(c,date=new Date())=>{
  const key=renderSceneCacheKey(c,date);
  if(renderTimelineCache.has(key))return renderTimelineCache.get(key);
  try{const entries=simulateVisibleTimeline(c,date),value=Array.isArray(entries)?entries:[];return cacheSetBounded(renderTimelineCache,key,value)}
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
const CATALOG_LABELS={food:"음식",ingredient:"식재료",drink:"음료",fashion:"옷·패션",music:"음악",idol:"아이돌·밴드",book:"책·작품",movie:"영화·영상",game:"게임",perfume:"향수",hobby:"취미 물품",electronics:"전자기기",weapon:"무기"};
const CATALOG_CATEGORIES={food:["한식","일식","중식","이탈리아 음식","양식","분식","패스트푸드","디저트","빵","간식","기타"],ingredient:["채소","과일","곡물","육류","해산물","유제품","달걀","향신료·조미료","가공식품","기타 식재료"],drink:["커피","차","라테","탄산음료","주스","술","기타 음료","기타"],fashion:["상의","하의","아우터","원피스","신발","가방","액세서리","기타"],music:["노래","앨범","플레이리스트","악기","기타"],idol:["솔로 가수","아이돌","밴드","가상 아티스트","기타"],book:["소설","만화","잡지","에세이","전문서적","기타"],movie:["영화","드라마","애니메이션","예능","유튜브·웹영상","기타"],game:["PC 게임","콘솔 게임","모바일 게임","보드게임","기타"],perfume:["향수","디퓨저","캔들","바디 제품","기타"],hobby:["미술 도구","수집품","운동 용품","공예 도구","반려동물 용품","기타"],electronics:["휴대기기","컴퓨터","게임기","음향기기","카메라","생활가전","기타"],weapon:["총기","검·도검","활·석궁","둔기","창·장병기","방어구","판타지 무기","기타"]};
const BLADE_SUBTYPES=["단검","나이프","쇼트소드","아밍소드","롱소드","바스타드소드","대검","클레이모어","레이피어","에페","세이버","커틀러스","샴시르","시미터","카타나","타치","와키자시","노다치","쌍검","검지팡이","의장검"];
const WEAPON_SUBTYPES={총기:["권총","리볼버","기관단총","돌격소총","소총","저격소총","산탄총","기관총"],"검·도검":BLADE_SUBTYPES,도검:BLADE_SUBTYPES,검:BLADE_SUBTYPES,"활·석궁":["단궁","장궁","복합궁","컴파운드 보우","석궁"],둔기:["곤봉","메이스","철퇴","전투망치"],"창·장병기":["창","장창","할버드","언월도","삼지창"],방어구:["방패","경갑","중갑","투구"],"판타지 무기":["마법봉","지팡이","마도서","마검","에너지 무기"]};
Object.assign(UI_TEXT.en,{
  "가족":"Family","가슴":"Chest","가슴 길이":"Chest length","가죽 공예":"Leathercraft","강아지":"Dog","거북이":"Turtle","건물":"Building","거의 가지 않음":"Almost never goes","강한 사랑":"Deep love","같이 나들이하기":"Go on an outing together","같이 운동하기":"Exercise together","개인정보처리방침":"Privacy Policy",
  "캐릭터가 물어봐요":"A character has a question","오늘은 맡길게":"Let them decide today","이번 주말에는 뭘 할까요?":"What should I do this weekend?","회사에서 무엇부터 할까요?":"What should I do first at work?","오늘 남는 시간에는 뭘 할까요?":"What should I do with my free time today?","정한 일정이 캐릭터의 생활에 반영됩니다.":"Your choice will appear in the character's actual schedule.",
  "카페에서 느긋하게":"Relax at a café","공원에서 긴 산책":"Take a long park walk","집에서 완전히 쉬기":"Stay home and fully rest","집에서 좋아하는 취미":"Enjoy a favorite hobby at home","공원으로 산책":"Take a walk in the park","저녁 요리 만들기":"Cook dinner","미뤄 둔 핵심 업무":"Finish the most important delayed task","곤란한 동료 도와주기":"Help a struggling coworker","정시에 마치고 퇴근":"Finish on time and leave work"
});
Object.assign(UI_TEXT.ja,{
  "가족":"家族","가슴":"胸","가슴 길이":"胸の長さ","가죽 공예":"レザークラフト","강아지":"犬","거북이":"カメ","건물":"建物","거의 가지 않음":"ほとんど行かない","강한 사랑":"深い愛","같이 나들이하기":"一緒に出かける","같이 운동하기":"一緒に運動する","개인정보처리방침":"プライバシーポリシー",
  "캐릭터가 물어봐요":"キャラクターからの質問","오늘은 맡길게":"今日は本人に任せる","이번 주말에는 뭘 할까요?":"今週末は何をしよう？","회사에서 무엇부터 할까요?":"会社では何から始めよう？","오늘 남는 시간에는 뭘 할까요?":"今日の空き時間は何をしよう？","정한 일정이 캐릭터의 생활에 반영됩니다.":"選んだ予定はキャラクターの実際の生活に反映されます。",
  "카페에서 느긋하게":"カフェでのんびり","공원에서 긴 산책":"公園を長く散歩する","집에서 완전히 쉬기":"家でゆっくり休む","집에서 좋아하는 취미":"家で好きな趣味を楽しむ","공원으로 산책":"公園を散歩する","저녁 요리 만들기":"夕食を作る","미뤄 둔 핵심 업무":"後回しにした重要業務","곤란한 동료 도와주기":"困っている同僚を手伝う","정시에 마치고 퇴근":"定時で仕事を終える"
});
const DETAIL_OPTIONS={food:["국물","면","밥","구이","튀김","샐러드","케이크","쿠키"],drink:["따뜻하게","차갑게","무카페인","카페인","무알코올","알코올"],fashion:["캐주얼","정장","스포츠","빈티지","스트리트","럭셔리"],music:["보컬곡","연주곡","라이브","기타","피아노","바이올린","드럼","베이스","관악기"],idol:["보컬","댄스","밴드","버추얼","솔로","그룹"],book:["로맨스","판타지","추리","공포","SF","역사","교양"],game:["MOBA","MMORPG","액션 RPG","턴제 RPG","FPS","TPS","배틀로얄","RTS","전략","시뮬레이션","샌드박스","서바이벌","어드벤처","퍼즐","리듬","격투","레이싱","스포츠","공포","소셜·파티"],hobby:["입문용","전문가용","휴대용","수집용","실내용","야외용"],electronics:["스마트폰","태블릿","노트북","데스크톱","콘솔","헤드폰","스피커","카메라","스마트워치"],weapon:[]};
const PERFUME_NOTES=["우디","플로럴","시트러스","머스크","앰버","아쿠아","그린","파우더리","프루티","스파이시","구르망","레더"];
const VIDEO_GENRES={
  "영화":["드라마","로맨스","코미디","액션","스릴러","미스터리","범죄","공포","판타지","SF","가족","모험","다큐멘터리"],
  "드라마":["로맨스","가족","법정","의학","범죄","사극","판타지","청춘"],
  "애니메이션":["일상","판타지","액션","로맨스","스포츠","SF","아동"],
  "예능":["연애 예능","여행 예능","음악 예능","관찰 예능","게임 예능","토크쇼","서바이벌","코미디"],
  "유튜브·웹영상":["브이로그","게임 방송","먹방","리뷰","교육","숏폼","웹예능","웹드라마"],
  "기타":[]
};
const catalogItems=()=>Object.entries(state.catalog||{}).flatMap(([kind,items])=>(items||[]).map(item=>({...item,kind})));
const levelOptions=(labels,value)=>labels.map((label,index)=>`<option value="${index}" ${Number(value)===index?"selected":""}>${label}</option>`).join("");
const placeTypeOptions=place=>Object.keys(PLACE_TYPES).map(type=>`<option ${place.type===type?"selected":""}>${type}</option>`).join("");
const placeSubtypeOptions=place=>(PLACE_TYPES[place.type]||[""]).map(type=>`<option value="${type}" ${place.subtype===type?"selected":""}>${type||"지정 안 함 · 해당 유형 전체 취급"}</option>`).join("");
const CATALOG_ICONS={food:"🍽️",ingredient:"🥕",drink:"🥤",fashion:"👗",music:"🎵",idol:"🎤",book:"📚",movie:"🎬",game:"🎮",perfume:"🧴",hobby:"🎨",electronics:"💻",weapon:"⚔️"};
const roomClasses={living:"living",kitchen:"kitchen",entry:"entry",bath:"bath",bedroom:"bedroom",study:"study"};
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
const backgroundOptions=()=>"";
const TOWN_BACKGROUND="";
const townBackgroundMarkup=(src,className="world-bg")=>src?`<img src="${esc(src)}" class="${className}" alt="">${className==="world-bg"?`<span class="town-sky-wash" aria-hidden="true"></span><span class="town-clock" aria-label="${esc(t("현실 시간","현실 시간"))}"></span>`:""}`:"";
const BUILDING_ICONS=[["cafe","카페"],["restaurant","식당"],["office","사무실"],["hospital","병원"],["park","공원"],["school","학교"],["clothing","옷가게"],["theater","공연장"],["hotel","호텔"],["department","백화점"],["library","도서관"],["shop","상점"]];
const BUILDING_PRESET_SOURCES={"cafe":"world-assets/building-types/cafe-handdrawn.png","type-cafe":"world-assets/building-types/cafe-handdrawn.png","hospital":"world-assets/building-types/hospital-handdrawn.png","type-hospital":"world-assets/building-types/hospital-handdrawn.png","type-piano-hall":"world-assets/building-types/piano-hall-handdrawn.png","theater":"world-assets/building-types/piano-hall-handdrawn.png","type-dress-shop":"world-assets/building-types/dress-shop-handdrawn.png","type-stadium":"world-assets/building-types/stadium-handdrawn.png","type-office":"world-assets/building-types/office-handdrawn.png","type-graduation-school":"world-assets/building-types/graduation-school-handdrawn.png","type-suitcase-hotel":"world-assets/building-types/suitcase-hotel-handdrawn.png","type-clock-school":"world-assets/building-types/clock-school-handdrawn.png","type-library":"world-assets/building-types/library-handdrawn.png","type-generic-building":"world-assets/building-types/generic-building-handdrawn.png","type-park":"world-assets/building-types/park-handdrawn.png","park":"world-assets/building-types/park-handdrawn.png","red-roof-home":"world-assets/building-types/red-roof-home-handdrawn.png","type-restaurant":"world-assets/building-types/restaurant-handdrawn.png","drawer-building":"world-assets/drawer-building.png","medieval-castle":"world-assets/medieval-castle.svg","medieval-tavern":"world-assets/medieval-tavern.svg","medieval-market":"world-assets/medieval-market.svg"};
const BUILDING_LIGHT_SOURCES={
  "world-assets/building-types/cafe-handdrawn.png":"world-assets/building-types/cafe-light.png",
  "world-assets/building-types/hospital-handdrawn.png":"world-assets/building-types/hospital-light.png",
  "world-assets/building-types/piano-hall-handdrawn.png":"world-assets/building-types/piano-hall-light.png",
  "world-assets/building-types/office-handdrawn.png":"world-assets/building-types/office-light.png",
  "world-assets/building-types/park-handdrawn.png":"world-assets/building-types/park-light.png",
  "world-assets/building-types/red-roof-home-handdrawn.png":"world-assets/building-types/red-roof-home-light.png"
};
const buildingExteriorSource=place=>state.buildingShapes?.find(shape=>shape.id===place?.iconPreset)?.src||BUILDING_PRESET_SOURCES[place?.iconPreset]||BUILDING_PRESET_SOURCES["drawer-building"];
const homeExteriorSource=home=>String(home?.exteriorImage||state.buildingShapes?.find(shape=>shape.id===home?.iconPreset)?.src||BUILDING_PRESET_SOURCES[home?.iconPreset]||BUILDING_PRESET_SOURCES["red-roof-home"]);
const buildingIconOptions=p=>BUILDING_ICONS.map(([id,label])=>`<option value="${id}" ${p.iconPreset===id?"selected":""}>${label}</option>`).join("");
const visibleTownId=c=>eventFor(c)?.townId||c.townId;

function avatar(c,cls=""){
  const fallback=esc((c.name||"새").slice(0,1));
  if(c.icon)return `<img class="sprite ${cls}" src="${esc(c.icon)}" alt="" data-avatar-fallback="${fallback}" onerror="window.DrawerVillageAvatarFallback?.(this)">`;
  if(c.photo)return `<img class="avatar profile-photo-fallback ${cls}" src="${esc(c.photo)}" alt="" data-avatar-fallback="${fallback}" onerror="window.DrawerVillageAvatarFallback?.(this)">`;
  return `<span class="avatar ${cls}">${fallback}</span>`;
}
function profileAvatar(c,cls=""){
  const fallback=esc((c.name||"새").slice(0,1));
  if(c.photo)return `<img class="avatar profile-photo-fallback ${cls}" src="${esc(c.photo)}" alt="" data-avatar-fallback="${fallback}" onerror="window.DrawerVillageAvatarFallback?.(this)">`;
  if(c.icon)return `<img class="sprite ${cls}" src="${esc(c.icon)}" alt="" data-avatar-fallback="${fallback}" onerror="window.DrawerVillageAvatarFallback?.(this)">`;
  return `<span class="avatar ${cls}">${fallback}</span>`;
}
function wardrobeSceneItem(c,entry,field){
  const owned=new Set(c.inventory?.fashion||[]),items=(state.catalog?.fashion||[]).filter(item=>owned.has(item.id)&&item[field]);
  if(!items.length)return null;
  const scene=entry||eventFor(c)||{},copy=`${scene.title||""} ${scene.desc||""}`,work=/출근|업무|근무|회사|직장/.test(copy),sleep=/자는 중|취침|잠/.test(copy),date=/데이트|연인/.test(copy),party=/파티|연회|공연/.test(copy);
  const occasions=work?["출근복","유니폼","정장"]:sleep?["잠옷","실내복"]:date?["데이트룩","외출복"]:party?["파티복","격식 있는 자리"]:["일상복","외출복"];
  const mood=characterMood(c,scene,state).label,moodTag=/유혹|여유로움|설렘/.test(mood)||/유혹/.test(copy)?"유혹적임":/황홀|신남|들뜸|즐거움|명랑/.test(mood)?"들뜸":/기쁨|기분 좋|뿌듯|의욕|다정/.test(mood)?"기분 좋음":/만족|안도/.test(mood)?"만족함":/호기심/.test(mood)?"호기심":/지루/.test(mood)?"지루함":/격분|화남|분노/.test(mood)?"화남":/까칠|냉소|짜증|불쾌|날이 서/.test(mood)?"짜증남":/혐오/.test(mood)?"혐오감":/불안|걱정|긴장|경계|당황/.test(mood)?"긴장함":/상실|외로움|상처|실망|침울|슬픔|가라앉/.test(mood)?"슬픔":/졸림|지침|피곤/.test(mood)?"피곤함":"평온함";
  const month=new Date().getMonth()+1,warmth=[12,1,2].includes(month)?["따뜻함","매우 따뜻함"]:[6,7,8].includes(month)?["시원함","매우 시원함"]:["보통","따뜻함","시원함"];
  const scheduled=[...(state.routines?.[c.id]||[]),...(state.monthlyRoutines?.[c.id]||[])].find(value=>String(value.id)===String(scene.routineId)),place=(state.world?.places||[]).find(value=>value.id===scene.placeId),codes=[place?.dressCode?{...place.dressCode,requiredUniform:false}:null,scheduled?.dressCode].filter(code=>code?.enabled),dress={colors:[...new Set(codes.flatMap(code=>code.colors||[]))],materials:[...new Set(codes.flatMap(code=>code.materials||[]))],flairs:[...new Set(codes.flatMap(code=>code.flairs||[]))],formality:codes.map(code=>code.formality).find(value=>value&&value!=="지정 안 함")||"",requiredUniform:Boolean(scheduled?.dressCode?.enabled&&scheduled.dressCode.requiredUniform)};
  const overlap=(left,right)=>(left||[]).filter(value=>(right||[]).includes(value)).length;
  const score=item=>((item.occasionTags||[]).some(tag=>tag==="모든 상황"||occasions.includes(tag))?8:0)+((item.moodTags||["모든 기분"]).some(tag=>tag==="모든 기분"||tag===moodTag)?4:0)+(warmth.includes(item.warmth||"보통")?2:0)+((work||dress.requiredUniform)&&item.requiredUniform?12:0)+(dress.formality&&item.formality===dress.formality?8:0)+overlap(item.colors,dress.colors)*3+overlap(item.materials,dress.materials)*3+overlap(item.flairs,dress.flairs)*2;
  return [...items].sort((a,b)=>score(b)-score(a)||String(a.id).localeCompare(String(b.id)))[0]||null;
}
const wardrobeSceneArt=(c,entry,field)=>wardrobeSceneItem(c,entry,field)?.[field]||"";
const ldArtSource=(c,entry)=>wardrobeSceneArt(c,entry,"ldImage")||String(c?.ldImage||"");
const hasLdArt=(c,entry)=>Boolean(ldArtSource(c,entry));
const sdArtSource=(c,entry)=>wardrobeSceneArt(c,entry,"iconImage")||String(c?.icon||c?.photo||"");
const usesProfilePhoto=(c,entry)=>Boolean(c?.photo&&!c?.icon&&!wardrobeSceneArt(c,entry,"iconImage"));
const hasSdArt=(c,entry)=>Boolean(sdArtSource(c,entry));
const homeSceneLayoutFor=(c,mode)=>{
  const source=c?.homeSceneLayout?.[mode]||{};
  const number=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  return {
    x:number(source.x),y:number(source.y),scale:number(source.scale,1),rotation:number(source.rotation),
    actionX:number(source.actionX),actionY:number(source.actionY)
  };
};
const sceneLayoutVars=(c,mode,entry=null)=>{
  const outfitLayout=wardrobeSceneItem(c,entry,mode==="ld"?"ldImage":"iconImage")?.sceneLayout?.[mode];
  const layout=outfitLayout?{...homeSceneLayoutFor(c,mode),...outfitLayout}:homeSceneLayoutFor(c,mode);
  const globalScale=Math.max(70,Math.min(150,Number(mode==="ld"?state.homeLdScale:state.homeSdScale)||100))/100;
  return `--character-art-x:${layout.x}%;--character-art-y:${layout.y}%;--character-art-scale:${layout.scale};--character-render-scale:${globalScale*layout.scale};--character-art-rotation:${layout.rotation}deg;--character-action-x:${layout.actionX}%;--character-action-y:${layout.actionY}%`;
};
function sceneAvatar(c,cls="",tone="neutral",mode="sd",entry=null){
  if(mode==="ld"&&hasLdArt(c,entry)){
    const src=ldArtSource(c,entry);
    return `<img class="sprite scene-ld-art ${cls}" src="${esc(src)}" alt="${esc(c.name)} LD 일러스트">`;
  }
  const src=sdArtSource(c,entry);
  if(!src)return `<span class="scene-default-silhouette ${cls}" role="img" aria-label="${esc(c.name)} 기본 실루엣"></span>`;
  return `<img class="sprite ${usesProfilePhoto(c,entry)?"profile-photo-fallback":""} ${cls}" src="${esc(src)}" alt="${esc(c.name)}">`;
}
function header(){
  const tabs=[["observe",t("observe","관찰"),"◉"],["mailbox",t("mailbox","우편함"),"✉"],["home",t("home","집"),"⌂"],["character",t("character","캐릭터"),"♙"],["catalog",t("catalog","사전"),"◇"],["relationship",t("relationship","관계"),"∞"],["routine",t("routine","일정"),"▦"],["statistics",t("statistics","통계"),"▥"],["town",t("town","마을"),"▧"],["shop",t("shop","상점"),"♢"],["settings",t("settings","설정"),"⚙"]];
  const current=tabs.find(([key])=>key===state.activeTab)||tabs[0];
  const nativeBar=["observe","home","catalog"].includes(state.activeTab)?"":`<div class="native-sub-header"><button type="button" data-tab="observe" aria-label="${esc(t("메인 화면으로 돌아가기","메인 화면으로 돌아가기"))}">‹</button><b>${current[1]}</b><span>${esc(t("brandName","서랍마을"))}</span></div>`;
  return `<header><div class="brand"><span class="logo"><img src="./icons/drawer-village-logo.png" alt="${esc(t("brandName","서랍마을"))}"></span><div><h1>${t("brandName","서랍마을")}</h1><small>${t("brandTagline","서랍 속 캐릭터 생활 관찰 게임")}</small></div>${previewMode()?`<span class="preview-badge">${esc(previewConfig().label||"사전 체험")}</span>`:""}</div><nav>${tabs.map(([k,n,icon])=>`<button type="button" data-tab="${k}" class="${state.activeTab===k?"on":""}"><span class="tab-icon tab-icon-${k}" data-menu-icon="${k}" aria-hidden="true">${icon}</span><span>${n}</span></button>`).join("")}</nav><span id="save-state">${t("saved","기기에 저장됨")}</span></header>${nativeBar}`;
}
const GAME_HUD_SIDE_TABS={
  left:[
    {key:"character",labelKey:"character",label:"캐릭터",asset:"profile-placeholder.png"},
    {key:"catalog",labelKey:"catalog",label:"사전",asset:"catalog.png"},
    {key:"relationship",labelKey:"relationship",label:"관계",asset:"relationship.png"}
  ],
  right:[
    {key:"routine",labelKey:"routine",label:"일정",asset:"routine.png"},
    {key:"statistics",labelKey:"statistics",label:"통계",asset:"statistics.png"},
    {key:"settings",labelKey:"settings",label:"설정",asset:"settings.png"}
  ]
};
const HOME_UI_THEMES=Object.freeze({
  "drawer-classic":Object.freeze({id:"drawer-classic",label:"서랍마을 기본",root:"./assets/home-ui"})
});
function homeUiTheme(character){
  const id=character?.homeUiTheme||state.homeUiTheme||"drawer-classic";
  return HOME_UI_THEMES[id]||HOME_UI_THEMES["drawer-classic"];
}
function homeUiAsset(character,name){return `${homeUiTheme(character).root}/${name}`}
function homeUiThemeStyle(character){
  const names={woodTop:"wood-top.png",woodStrip:"wood-strip.png",profileRing:"profile-ring.png",pillLeft:"pill-left.png",pillMiddle:"pill-middle.png",pillRight:"pill-right.png",redTape:"red-tape.png"};
  return Object.entries(names).map(([key,name])=>`--home-ui-${key.replace(/[A-Z]/g,letter=>`-${letter.toLowerCase()}`)}:url(&quot;${esc(homeUiAsset(character,name))}&quot;)`).join(";");
}
const GAME_HUD_LABELS={
  ko:{character:"캐릭터",catalog:"사전",relationship:"관계",routine:"일정",statistics:"통계",settings:"설정",mailbox:"우편함",home:"집",todayLog:"기록물",shop:"상점",town:"마을"},
  en:{character:"People",catalog:"Dictionary",relationship:"Bonds",routine:"Schedule",statistics:"Stats",settings:"Settings",mailbox:"Mail",home:"Home",todayLog:"Log",shop:"Shop",town:"Town"},
  ja:{character:"人物",catalog:"辞典",relationship:"関係",routine:"予定",statistics:"統計",settings:"設定",mailbox:"郵便",home:"家",todayLog:"記録",shop:"店",town:"村"}
};
function gameHudLabel(key,fallback){return GAME_HUD_LABELS[state.uiLanguage||"ko"]?.[key]||t(key,fallback)}
let mobileTownMode="";
let mobileTownPanel="";
let mobileTownPlacement=null;
let settingsPane="home";
let nativeShopSection="base";
export function setMobileTownMode(value=""){
  const next=["town","buildings","decorations"].includes(String(value||""))?String(value):"";
  mobileTownMode=next;
  mobileTownPanel=next==="town"?"world":next==="decorations"?"decorations":next==="buildings"?"buildings":"";
  mobileTownPlacement=null;
}
export function setMobileTownPanel(value=""){mobileTownPanel=String(value||"")}
export function setMobileTownPlacement(kind="",id=""){mobileTownPlacement=kind&&id?{kind:String(kind),id:String(id)}:null}
export function setSettingsPane(value="home"){
  const next=String(value||"home");
  settingsPane=["home","gameplay","sound","notifications","display","achievements","account","support"].includes(next)?next:"home";
}
export function setNativeShopSection(value="base"){
  const next=String(value||"base");
  nativeShopSection=["bundle","base","skin","expansion"].includes(next)?next:"base";
}
function gameHudSideMenu(side,character){
  return `<nav class="game-hud-side game-hud-side-${side}" aria-label="${esc(t(side==="left"?"캐릭터와 관계 메뉴":"일정과 설정 메뉴",side==="left"?"캐릭터와 관계 메뉴":"일정과 설정 메뉴"))}">${GAME_HUD_SIDE_TABS[side].map(({key,labelKey,label,asset,icon})=>`<button type="button" class="game-hud-button" data-tab="${key}">${asset?`<img class="game-hud-menu-art" src="${esc(homeUiAsset(character,asset))}" alt="">`:`<span data-menu-icon="${key}" aria-hidden="true">${icon}</span>`}<small><span>${gameHudLabel(labelKey,label)}</span></small></button>`).join("")}</nav>`;
}
function gameHudDock(character){
  const item=(key,label,asset,attrs,classKey=key)=>`<button type="button" class="game-hud-button game-hud-${classKey}-button" ${attrs}><img src="${esc(homeUiAsset(character,asset))}" alt=""><small><span>${gameHudLabel(key,label)}</span></small></button>`;
  return `<nav class="game-hud-dock" aria-label="${esc(t("주요 메뉴","주요 메뉴"))}">${item("home","집","home.png",'data-tab="home"')}${item("mailbox","우편함","mailbox.png",'data-tab="mailbox"')}${item("todayLog","기록물","ink.png","data-open-native-log","log")}${item("shop","상점","shop.png",'data-tab="shop"')}${item("town","마을","town.png",'data-tab="town"')}</nav>`;
}
function rosterSummary(entry){
  const title=String(entry?.title||"생활 중").split(" · ")[0].trim();
  return title.length>24?`${title.slice(0,23)}…`:title;
}
function roster(){
  return `<div class="roster">${state.order.map(id=>{const c=state.characters[id],e=eventFor(c),away=visibleTownId(c)!==state.activeTownId,summary=rosterSummary(e);return `<button class="roster-card ${id===state.activeId?"on":""} ${away?"away":""}" data-roster="${id}" title="${esc(c.name)} · ${esc(e.title)}">${avatar(c)}<span class="roster-info"><b>${esc(c.name)}</b><small>${esc(summary)}</small></span></button>`}).join("")}</div>`;
}
function buildingLightSource(p){
  const src=buildingExteriorSource(p);
  return BUILDING_LIGHT_SOURCES[src]||"";
}
function homeBuildingLightSource(home){
  const src=homeExteriorSource(home);
  return BUILDING_LIGHT_SOURCES[src]||"";
}
function homeBuildingMapArt(home){
  const src=homeExteriorSource(home),light=homeBuildingLightSource(home),config=normalizeBuildingLighting(home);
  return `<span class="building-art" ${light?`data-building-light data-lighting-mode="${config.lightingMode}" data-light-on-time="${config.lightOnTime}" data-light-off-time="${config.lightOffTime}" data-lights-on="${buildingLightsOn(config)}"`:""}><img class="building-preset-image" src="${esc(src)}" alt="">${light?`<img class="building-light building-light-halo" src="${esc(light)}" alt="" aria-hidden="true"><img class="building-light building-light-core" src="${esc(light)}" alt="" aria-hidden="true">`:""}</span>`;
}
function buildingMapArt(p){
  const src=buildingExteriorSource(p),light=buildingLightSource(p),config=normalizeBuildingLighting(p);
  return `<span class="building-art" ${light?`data-building-light data-lighting-mode="${config.lightingMode}" data-light-on-time="${config.lightOnTime}" data-light-off-time="${config.lightOffTime}" data-lights-on="${buildingLightsOn(config)}"`:""}><img class="building-preset-image" src="${esc(src)}" alt="">${light?`<img class="building-light building-light-halo" src="${esc(light)}" alt="" aria-hidden="true"><img class="building-light building-light-core" src="${esc(light)}" alt="" aria-hidden="true">`:""}</span>`;
}
function buildingLightingBaseControls(p){
  const config=normalizeBuildingLighting(p);
  return `<label class="building-fame-setting">${t("건물 인지도","건물 인지도")}<select data-place-field="fameLevel" data-place-id="${p.id}">${["거의 알려지지 않음","동네 안에서 알려짐","마을 전체에 알려짐","다른 마을에도 알려짐","전국적으로 알려짐"].map(value=>`<option ${value===(p.fameLevel||"거의 알려지지 않음")?"selected":""}>${t(value,value)}</option>`).join("")}</select><small>${t("인지도는 얼마나 널리 알려졌는지, 평판은 좋고 나쁜 평가를 뜻해요.","인지도는 얼마나 널리 알려졌는지, 평판은 좋고 나쁜 평가를 뜻해요.")}</small></label><fieldset class="building-lighting-settings"><legend>${t("건물 불빛","건물 불빛")}</legend><label>${t("조명 방식","조명 방식")}<select data-place-field="lightingMode" data-place-id="${p.id}">${[["schedule","설정한 시간에 켜기"],["always","항상 켜기"],["off","항상 끄기"]].map(([value,label])=>`<option value="${value}" ${config.lightingMode===value?"selected":""}>${t(label,label)}</option>`).join("")}</select></label><div><label>${t("켜지는 시간","켜지는 시간")}<input type="time" data-place-field="lightOnTime" data-place-id="${p.id}" value="${config.lightOnTime}"></label><label>${t("꺼지는 시간","꺼지는 시간")}<input type="time" data-place-field="lightOffTime" data-place-id="${p.id}" value="${config.lightOffTime}"></label></div><small>${t("기기의 현실 시간 기준 · 같은 시각으로 설정하면 24시간 켜져요.","기기의 현실 시간 기준 · 같은 시각으로 설정하면 24시간 켜져요.")}${buildingLightSource(p)?"":` ${t("이 건물 그림에는 아직 불빛 레이어가 없어요.","이 건물 그림에는 아직 불빛 레이어가 없어요.")}`}</small></fieldset>`;
}
function buildingDressCodeControls(p){
  const code=p.dressCode||{enabled:false,colors:[],materials:[],flairs:[],formality:"지정 안 함"};
  const group=(field,values)=>`<div class="building-dress-chips">${values.map(value=>`<button type="button" data-place-dress-code="${p.id}" data-dress-field="${field}" data-value="${value}" class="${(code[field]||[]).includes(value)?"on":""}">${t(value,value)}</button>`).join("")}</div>`;
  const selectedCount=(code.colors?.length||0)+(code.materials?.length||0)+(code.flairs?.length||0);
  return `<section class="building-dress-code"><button type="button" class="building-dress-code-open" data-open-place-dress="${p.id}"><span><b>${t("드레스코드","드레스코드")}</b><small>${code.enabled?t("사용 중","사용 중"):t("사용 안 함","사용 안 함")} · ${selectedCount}${t("개 선택","개 선택")}</small></span><i aria-hidden="true">›</i></button><dialog class="building-dress-code-dialog" data-place-dress-dialog="${p.id}"><form method="dialog"><header><span><small>DRESS CODE</small><b>${esc(p.name)} · ${t("드레스코드","드레스코드")}</b></span><button value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header><div class="building-dress-code-settings"><label class="book-check-field"><span>${t("이 건물의 드레스코드 사용","이 건물의 드레스코드 사용")}</span><input type="checkbox" data-place-dress-enabled="${p.id}" ${code.enabled?"checked":""}></label><label class="building-dress-select">${t("격식 정도","격식 정도")}<select data-place-dress-formality="${p.id}">${["지정 안 함","매우 편한 차림","캐주얼","단정한 차림","격식 있음","최고 격식"].map(value=>`<option ${value===code.formality?"selected":""}>${t(value,value)}</option>`).join("")}</select></label></div><div class="building-dress-code-groups"><section><h5>${t("허용 색 · 여러 개 선택","허용 색 · 여러 개 선택")}</h5>${group("colors",["검정","흰색","아이보리","회색","갈색","베이지","빨강","노랑","초록","파랑","남색","보라","분홍"])}</section><section><h5>${t("권장 재질 · 여러 개 선택","권장 재질 · 여러 개 선택")}</h5>${group("materials",["면","데님","니트","울","가죽","실크","린넨","벨벳","레이스"])}</section><section><h5>${t("분위기 · 여러 개 선택","분위기 · 여러 개 선택")}</h5>${group("flairs",["미니멀","단정함","편안함","캐주얼","스포티","빈티지","러블리","우아함","화려함","정장","유니폼","파티용"])}</section></div><footer><button value="close">${t("선택 완료","선택 완료")}</button></footer></form></dialog></section>`;
}
function buildingLightingControls(p){return buildingLightingBaseControls(p)+buildingDressCodeControls(p)}
function placeCard(p,editable=false){
  const mode=state.buildingLabelMode||"full";
  const labelX=p.x,labelY=p.y;
  const label=mode==="none"?"":`<span class="map-place-label" style="left:${labelX}%;top:${labelY}%;--town-label-offset:${Math.round(126*(Number(p.imageScale)||1)+3)}px"><b>${esc(p.name)}</b>${mode==="full"?`<small>${esc(p.subtype?`${p.type} · ${p.subtype}`:p.type)}</small>`:""}</span>`;
  const art=buildingMapArt(p);
  const canDelete=editable===true||(state.activeTab==="town"&&(!document.documentElement.classList.contains("native-app")||mobileTownMode==="buildings"));
  const quickDelete=canDelete&&mobileTownMode!=="town"&&mobileTownMode!=="decorations"?`<button type="button" class="place-quick-delete" style="left:${p.x}%;top:${p.y}%" data-delete-place="${p.id}" aria-label="${esc(p.name||"건물")} 삭제" title="건물 삭제">×</button>`:"";
  const selected=mobileTownPlacement?.kind==="place"&&mobileTownPlacement.id===p.id;
  return `<button type="button" class="place has-art map-art-button ${selected?"placement-selected":""}" style="left:${p.x}%;top:${p.y}%;z-index:${Number(p.mapZ)||10};--place:${p.color};--place-scale:${p.imageScale||1};--place-flip:${p.flipX?-1:1}" data-place="${p.id}" data-building-detail-open="${p.id}" aria-label="${esc(p.name)} 건물 정보 보기">${art}</button>${label}${quickDelete}`;
}
function townHomes(){
  return Object.values(state.homes||{}).filter(home=>home&&home.townId===state.activeTownId);
}
function homeMapCard(home){
  const mode=state.buildingLabelMode||"full";
  const label=mode==="none"?"":`<span class="map-place-label home-map-label" style="left:${home.mapX}%;top:${home.mapY}%;--town-label-offset:${Math.round(126*(Number(home.mapScale)||1.08)+3)}px"><b>${esc(home.name)}</b>${mode==="full"?`<small>${esc(`집 · ${home.buildingSubtype||"단독주택"}`)}</small>`:""}</span>`;
  const selected=mobileTownPlacement?.kind==="home"&&mobileTownPlacement.id===home.id;
  return `<button type="button" class="place has-art map-art-button home-map-place ${selected?"placement-selected":""}" style="left:${home.mapX}%;top:${home.mapY}%;z-index:${Number(home.mapZ)||12};--place-scale:${home.mapScale||1.08};--place-flip:${home.mapFlipX?-1:1}" data-home-map="${home.id}" data-building-detail-open="home:${home.id}" aria-label="${esc(home.name)} 집 정보 보기">${homeBuildingMapArt(home)}</button>${label}`;
}
function townDecorationCard(item){
  const selected=mobileTownPlacement?.kind==="decoration"&&mobileTownPlacement.id===item.id;
  const art=item.image?`<img class="building-preset-image" src="${esc(item.image)}" alt="">`:`<span class="town-decoration-emoji" aria-hidden="true">${esc(item.emoji||"✨")}</span>`;
  return `<button type="button" class="place map-art-button town-decoration ${selected?"placement-selected":""}" style="left:${item.x}%;top:${item.y}%;z-index:${Number(item.mapZ)||20};--place-scale:${item.scale||1};--place-flip:${item.flipX?-1:1}" data-town-decoration="${item.id}" aria-label="${esc(item.name)}">${art}</button>`;
}
function townDecorationsMarkup(){return (state.world.decorations||[]).map(townDecorationCard).join("")}
function tabletObserveMap(){
  const town=state.towns?.find(item=>item.id===state.activeTownId)||state.world;
  return `<section class="tablet-observe-map" aria-label="${esc(t("town","마을"))}"><div class="tablet-observe-world town-environment" data-town-language="${state.uiLanguage||"ko"}">${townBackgroundMarkup(town?.bg||state.world?.bg)}${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}${townDecorationsMarkup()}${state.world.places.map(peopleAtPlaceCard).join("")}${townHomes().map(peopleAtHomeCard).join("")}</div></section>`;
}
function charactersInsideHome(homeId){
  return state.order.map(id=>state.characters[id]).filter(Boolean).filter(character=>{
    const entry=eventFor(character);
    return Boolean(entry?.home&&!entry.transit&&(entry.visitHomeId||character.homeId)===homeId);
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
function sceneMovementIcon(entry){return entry?.movementKind==="jog"?"🏃":entry?.transit?"➜":"📍"}
const PET_SCENE_EMOJI={강아지:"🐶",고양이:"🐱",새:"🐦",거북이:"🐢",호랑이:"🐯",인공지능:"🤖",식물:"🪴",드래곤:"🐉",기타:"✨"};
function nativePetForScene(c,entry){
  const preferredHome=state.homes?.[entry?.visitHomeId||c?.homeId];
  const pets=[...(preferredHome?.pets||[])];
  // 장면에 있는 집의 반려생물만 후보로 사용한다. 고양이라는 단어만 보고
  // 다른 집의 고양이를 가져오면 남의 집 반려동물이 현재 장면에 나타난다.
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
const FOOD_PREFERENCE_EMOJI_GROUPS=[
  {test:/한식|김치|비빔밥|불고기|떡볶이|국밥|찌개|전골/,symbols:["🍚","🥘","🍲","🥟","🍙"]},
  {test:/일식|일본|초밥|스시|라멘|우동|소바|돈부리/,symbols:["🍣","🍜","🍙","🍱","🍥"]},
  {test:/중식|중국|딤섬|마라|짜장|짬뽕|훠궈/,symbols:["🥟","🥡","🍜","🥮","🥠"]},
  {test:/양식|이탈리|프랑스|파스타|스테이크|리조또/,symbols:["🍝","🍕","🥩","🥗","🥖"]},
  {test:/패스트푸드|햄버거|감자튀김|핫도그|피자/,symbols:["🍔","🍟","🌭","🍕","🥤"]},
  {test:/디저트|단것|케이크|초콜릿|아이스크림|사탕/,symbols:["🍰","🧁","🍮","🍩","🍨","🍫"]},
  {test:/빵|베이커리|브런치|팬케이크|와플/,symbols:["🥐","🥯","🥖","🧇","🥞"]},
  {test:/카페|커피|차|티|밀크티|버블티/,symbols:["☕","🫖","🍵","🧋","🧉"]},
  {test:/채식|비건|샐러드|채소|야채/,symbols:["🥗","🥦","🥑","🥕","🍄"]},
  {test:/해산물|생선|회|새우|조개/,symbols:["🍣","🦪","🍤","🍥","🍲"]},
  {test:/고기|육류|바비큐|삼겹살|스테이크/,symbols:["🥩","🍖","🍗","🥓","🍔"]},
  {test:/매운|매콤|향신료/,symbols:["🌶️","🌮","🍛","🍜","🥘"]},
  {test:/과일|상큼|주스/,symbols:["🍓","🍇","🍉","🥭","🍑"]},
  {test:/술|맥주|와인|칵테일|위스키/,symbols:["🍺","🍷","🍸","🍹","🥃"]}
];
function nativeFoodPreferenceSymbols(person,text){
  const source=[...(person?.foodPreferences||[]),...(person?.drinks||[]),text||""].join(" ");
  const symbols=[...new Set(FOOD_PREFERENCE_EMOJI_GROUPS.filter(group=>group.test.test(source)).flatMap(group=>group.symbols))];
  if(!symbols.length)return [];
  const offset=nativeVisualSeed(`${person?.id||person?.name||"character"}:${source}`)%symbols.length;
  return [...symbols.slice(offset),...symbols.slice(0,offset)].slice(0,4);
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
  let foodSymbols=[];
  // A shared scene may be rendered from either participant's viewpoint.  Use
  // the canonical scene text stored on the interaction so the same actor does
  // not hold cake in one view and ice cream in the other.
  const propText=String(entry?.sharedActionText||text||"");
  const teaAction=/차를 우리는|차를 우려|차를 내리|찻물을|차 한 잔|차를 마시|티백|홍차|녹차|보이차|말차/.test(propText);
  if(actionKind==="nail-care")symbol="💅";
  else if(actionKind==="tea"||teaAction)symbol="🍵";
  else if(actionKind==="eating"){
    item=nativeSceneFoodItem(person,entry,propText);
    foodSymbols=nativeFoodPreferenceSymbols(person,propText);
    symbol=item?nativeFoodSymbol(item,propText):(foodSymbols[0]||nativeFoodSymbol(null,propText));
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
  else if(actionKind==="organizing")symbol=nativeOrganizingSymbol(person,propText);
  else if(actionKind==="gaming")symbol="🎮";
  else if(actionKind==="cooking"){
    foodSymbols=nativeFoodPreferenceSymbols(person,propText);
    symbol=/탕|찌개|국|수프|끓/.test(propText)?"🍲":/파스타|스파게티|면 요리/.test(propText)?"🍝":(foodSymbols[0]||"🍳");
  }
  else if(actionKind==="reading")symbol="📖";
  else if(actionKind==="writing")symbol="📝";
  else if(actionKind==="music")symbol="🎵";
  else if(actionKind==="exercise")symbol="🏋️";
  else if(actionKind==="grooming")symbol=/향수|향을 고르/.test(propText)?"🧴":"💄";
  else if(actionKind==="repair")symbol="🛠️";
  else if(actionKind==="gardening")symbol="🪴";
  else if(actionKind==="mail")symbol="✉️";
  if(entry?.itemId){item=item||catalogItem(entry.itemId);if(item&&!symbol)symbol="🎁"}
  if(!symbol)return "";
  // Generic focus scenes can still carry a concrete catalog item. Previously
  // the item photo was rendered, but its `idle` action class left a cup or
  // plate completely static. Let the handled item supply the prop motion while
  // keeping the scene's broader action and mood unchanged.
  const itemText=`${item?.name||""} ${item?.category||""} ${item?.subtype||""}`;
  const propActionKind=item?.kind==="drink"&&["idle","eating","tea","coffee-drinking"].includes(actionKind)
    ?(/커피|coffee/i.test(itemText)?"coffee-drinking":"tea")
    :item?.kind==="food"&&actionKind==="idle"
      ?"eating"
      :actionKind;
  const propVariant=symbol==="🪥"?" action-prop-toothbrush":symbol==="🪒"?" action-prop-razor":symbol==="🧼"?" action-prop-soap":symbol==="👞"?" action-prop-shoe":"";
  // A named catalog food is the user's actual collection item, so keep its
  // photo visible. The dedicated class places it beside/below the character
  // instead of cropping a pale square over the character's face.
  const hasCatalogPhoto=Boolean(item?.image);
  const image=hasCatalogPhoto?itemArt(item,symbol):esc(symbol);
  const title=item?.name?`${person?.name||"캐릭터"} · ${item.name}`:`${person?.name||"캐릭터"} · ${symbol}`;
  return `<span class="${individual?"native-person-action-prop":"native-scene-action-prop"} action-prop-${propActionKind}${propVariant}${hasCatalogPhoto?" catalog-food-photo":""}" title="${esc(title)}" aria-hidden="true">${image}</span>`;
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
    &&(relation.groupMembers?.length?relation.groupMembers.includes(firstId)&&relation.groupMembers.includes(secondId):((relation.a===firstId&&relation.b===secondId)||(relation.a===secondId&&relation.b===firstId)))
  )||null;
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
    return sameMinute&&(sameInteraction||sameDate||(samePlace&&(reciprocal||namesEachOther)));
  });
  const namedPartnerIds=state.order.filter(id=>id!==c.id&&id!==entry?.thoughtOfId&&state.characters?.[id]?.name&&text.includes(state.characters[id].name));
  const declaredPartnerIds=[...(entry?.participantOrder||[]),...(entry?.withIds||[]),entry?.withId].filter(id=>id&&id!==c.id);
  // 현재 장면에 참여자가 명시돼 있으면 다른 캐릭터의 같은 시각 장면을
  // 역추적해 제3자를 덧붙이지 않는다. 제목은 두 사람인데 화면에는 세 명이
  // 나타나는 모순과 행동 소품 중복을 이 단계에서 차단한다.
  const inferredPartnerIds=entry?.groupInteraction&&declaredPartnerIds.length?[]:[...namedPartnerIds,...mirroredPartnerIds];
  const rawPartnerIds=[...new Set([...declaredPartnerIds,...inferredPartnerIds].filter(id=>{
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
    :/손톱|손톱줄|네일/.test(text)?"nail-care"
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
  const ambientMood=characterMood(c,entry,state).tone;
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
                    :dating?"date-neutral":partner&&entry?.groupInteraction?"interaction-neutral"
                      :ambientMood==="angry"?"fight-fire"
                        :ambientMood==="sad"?"sad"
                          :ambientMood==="tense"?"interaction-tense"
                            :ambientMood==="excited"?"interaction-playful"
                              :ambientMood==="good"?"interaction-warm":"neutral";
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
  // Decorative particles used to create 10–12 independently animated layers
  // on every scene. Four (six for rain/sadness) keeps the mood readable while
  // cutting continuous mobile compositing work by more than half.
  const effectCount=tone==="sleep"?0:tone==="sad"?6:4;
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
    :configuredRelation?relationshipAnimationOrder(configuredRelation,configuredRelation.displayOrder,`${entry?.interactionId||entry?.dateGroup||entry?.title}:${entry?.minute||""}`):[];
  const sceneParticipantIds=orderAnimationCharacters([...new Set([
    ...configuredOrder.filter(id=>sceneIds.has(id)),
    c.id,
    ...partners.map(person=>person.id)
  ])],state.characters,state.relationships,`${entry?.interactionId||entry?.title}:${entry?.minute||''}`);
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
    return `<span class="native-scene-lineup-person ${walkStyleClassFor(person)} ${pairSlot} ${person.id===c.id?"is-current is-selected":""} ${visualMode==="ld"&&hasLdArt(person,personEntry)?"is-ld":""}" style="--scene-index:${index};--scene-delay:${delay}s;--scene-duration:${duration}s;--person-visual-scale:${personVisualScale};${sceneLayoutVars(person,visualMode,personEntry)}">${sceneAvatar(person,"native-scene-lineup-avatar",tone,visualMode,personEntry)}${actionProp}${sleepBadge}${tone==="date-overwhelmed"&&person.id===c.id?'<b class="native-character-sweat" aria-hidden="true">💧</b>':""}<small>${esc(person.name)}</small></span>`;
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
  const logTheme=esc(c?.theme?.primary||"#a96f46");
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
      return `<li class="date-schedule" style="--log-theme:${logTheme}"><div class="date-schedule-title"><b>${esc(title+purpose)}</b><small>${esc(steps[0].time)}–${esc(steps.at(-1).time)}</small></div><ol>${steps.map(step=>`<li><time>${esc(step.time)}</time><span><b>${esc(step.title.replace(/^.+?[과와] 데이트\s*·\s*/,"").replace(/^데이트\s*·\s*/,""))}</b><small>${esc(step.desc)}</small></span></li>`).join("")}</ol></li>`;
    }
    return `<li class="${importantEntry(x)?"important":""} ${x===entries.at(-1)?"now":""}" style="--log-theme:${logTheme}"><time>${esc(x.time)}</time><span><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></span></li>`;
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
export function homeLogMarkup(homeId){
  const home=state.homes[homeId];if(!home)return "";
  const chars=(homeGroups()[homeId]||[]);
  return homeDailyLog(chars,home);
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
function townActionPresentation(entry,place=null){
  const copy=`${entry?.title||""} ${entry?.desc||""} ${place?.type||""}`;
  if(/밥|식사|먹|요리|음식|카페|차를|커피/.test(copy))return {kind:"eat",icon:/커피|차를|카페/.test(copy)?"☕":"🍽️",label:entry?.title||"식사 중"};
  if(/연주|공연|피아노|노래|음악/.test(copy))return {kind:"music",icon:"♫",label:entry?.title||"음악 활동 중"};
  if(/공부|수업|책|독서|연구/.test(copy))return {kind:"study",icon:"📖",label:entry?.title||"집중하는 중"};
  if(/업무|근무|일하는|회의|보고서|정리/.test(copy))return {kind:"work",icon:"✎",label:entry?.title||"일하는 중"};
  if(/운동|조깅|달리|훈련/.test(copy))return {kind:"exercise",icon:"🏃",label:entry?.title||"운동 중"};
  if(/대화|이야기|함께 시간을|데이트|약속/.test(copy))return {kind:"talk",icon:"💬",label:entry?.title||"대화 중"};
  if(/쇼핑|구매|고르는|상점/.test(copy))return {kind:"shop",icon:"🛍️",label:entry?.title||"둘러보는 중"};
  if(/진료|치료|병원|검사/.test(copy))return {kind:"medical",icon:"✚",label:entry?.title||"진료 중"};
  if(/청소|씻|욕실|정돈|양말|빨래|짝을 맞|개는|서랍에 넣/.test(copy))return {kind:"clean",icon:/양말|빨래|짝을 맞/.test(copy)?"🧦":"🫧",label:entry?.title||"정리 중"};
  if(/잠|휴식|쉬는/.test(copy))return {kind:"rest",icon:"☾",label:entry?.title||"쉬는 중"};
  return {kind:"idle",icon:"",label:entry?.title||"머무는 중"};
}
function townActionFace(character,entry,place=null){const action=townActionPresentation(entry,place);return `<span class="place-person-face town-action-${action.kind}" role="button" tabindex="0" data-person="${character.id}" title="${esc(`${character.name} · ${action.label}`)}">${avatar(character)}${action.icon?`<i class="town-action-symbol" aria-hidden="true">${action.icon}</i>`:""}</span>`}
function peopleAtPlaceCard(p){
  const group=charactersAtPlace(p.id,state.activeTownId);if(!group.length)return"";
  const visible=orderAnimationCharacters(group.map(c=>c.id),state.characters,state.relationships,`town:place:${p.id}`).map(id=>state.characters[id]).filter(Boolean).slice(0,5),hiddenCount=Math.max(0,group.length-visible.length);
  const names=group.map(c=>c.name).join(", ");
  const x=Math.max(9,Math.min(91,p.x)),y=Math.max(12,Math.min(91,p.y+4.5));
  const scenes=visible.map(character=>eventFor(character)),interactionId=scenes.find(scene=>scene?.groupInteraction&&scene.interactionId)?.interactionId;
  const conversation=Boolean(interactionId&&scenes.filter(scene=>scene?.interactionId===interactionId).length>=2);
  const bubbleEdge=x<=18?"bubble-edge-left":x>=82?"bubble-edge-right":"";
  const bubbleVertical=y<=18?"bubble-below":"";
  return `<div class="person place-people ${conversation?"is-town-conversation":""} ${bubbleEdge} ${bubbleVertical} ${state.mapCharacterLabelMode==="name"?"show-name":"icon-only"}" title="${esc(names)}" style="left:${x}%;top:${y}%;--people-count:${visible.length}">${conversation?'<span class="town-conversation-bubbles" aria-hidden="true"><i>•••</i><i>♪</i></span>':""}<span class="place-people-faces">${visible.map((c,index)=>townActionFace(c,scenes[index],p)).join("")}${hiddenCount?`<b class="place-person-more" aria-label="그 외 ${hiddenCount}명">+${hiddenCount}</b>`:""}</span>${state.mapCharacterLabelMode==="name"?`<span class="place-people-names">${esc(names)}</span>`:""}</div>`;
}
function peopleAtHomeCard(home){
  // 지도에 떠도는 인물 레이어는 집마다 중복되지 않도록 첫 집 카드에서만
  // 한 번 붙인다. 각 인물의 실제 장면이 home이면 아래 후보에서 제외된다.
  const travelers=home.id===townHomes()[0]?.id?townTravelersMarkup():"";
  const group=charactersInsideHome(home.id);if(!group.length&&!travelers)return"";
  const visible=orderAnimationCharacters(group.map(c=>c.id),state.characters,state.relationships,`town:home:${home.id}`).map(id=>state.characters[id]).filter(Boolean).slice(0,5),hiddenCount=Math.max(0,group.length-visible.length),names=group.map(c=>c.name).join(", ");
  const x=Math.max(9,Math.min(91,home.mapX)),y=Math.max(12,Math.min(91,home.mapY+4.5));
  const residents=group.length?`<div class="person place-people home-place-people ${state.mapCharacterLabelMode==="name"?"show-name":"icon-only"}" title="${esc(names)}" style="left:${x}%;top:${y}%;--people-count:${visible.length}"><span class="place-people-faces">${visible.map(c=>townActionFace(c,eventFor(c),home)).join("")}${hiddenCount?`<b class="place-person-more">+${hiddenCount}</b>`:""}</span>${state.mapCharacterLabelMode==="name"?`<span class="place-people-names">${esc(names)}</span>`:""}</div>`:"";
  return residents+travelers;
}
function townTravelersMarkup(homeId=""){
  const travelers=state.order.map(id=>state.characters[id]).filter(Boolean).filter(character=>{
    const scene=eventFor(character);
    return visibleTownId(character)===state.activeTownId&&!scene?.home&&!placeForEntry(scene)&&(!homeId||scene.destinationHomeId===homeId);
  });
  const rows=travelers.map(character=>({character,scene:eventFor(character)}));
  const decorationGroups=new Map();
  rows.forEach(row=>{if(!row.scene.decorationId)return;const group=decorationGroups.get(row.scene.decorationId)||[];group.push(row.character.id);decorationGroups.set(row.scene.decorationId,group)});
  const villageRoutes=[
    [[16,25],[38,18],[70,24],[84,48],[68,76],[34,80]],
    [[20,72],[18,42],[42,20],[76,18],[83,55],[58,79]],
    [[14,48],[31,24],[61,18],[84,35],[78,72],[43,82]],
    [[26,18],[67,20],[84,44],[72,78],[37,75],[16,52]]
  ];
  return travelers.map((character,index)=>{
    const scene=eventFor(character),home=state.homes?.[scene.destinationHomeId||character.homeId];
    const decoration=(state.world.decorations||[]).find(item=>item.id===scene.decorationId);
    const conversation=Boolean(scene.groupInteraction&&scene.interactionId),seed=nativeVisualSeed(`${conversation?scene.interactionId:character.id}:${scene.minute}:${scene.movementKind||"roaming"}`);
    const decorationGroup=decorationGroups.get(scene.decorationId)||[],decorationIndex=Math.max(0,decorationGroup.indexOf(character.id));
    const decorationRing=Math.floor(decorationIndex/6),decorationAngle=(decorationIndex%6)*Math.PI/3+(decorationRing%2?Math.PI/6:0),decorationRadius=decoration?16+decorationRing*12:0;
    const decorationX=decoration?(Number(decoration.x)||50)+Math.cos(decorationAngle)*decorationRadius:0,decorationY=decoration?(Number(decoration.y)||50)+Math.sin(decorationAngle)*decorationRadius*.45:0;
    const villageWalk=scene.movementKind==="village-walk"||scene.townProfileLog,gait=walkingGait(character.walkingStyle),walkClass=walkStyleClassFor(character);
    const route=villageRoutes[seed%villageRoutes.length],routeShift=(seed>>>4)%route.length,routePoints=route.map((_,routeIndex)=>route[(routeIndex+routeShift)%route.length]);
    const baseX=decoration?decorationX:villageWalk?routePoints[0][0]:home?.townId===state.activeTownId?Number(home.mapX)||50:20+(seed%61),baseY=decoration?decorationY:villageWalk?routePoints[0][1]:home?.townId===state.activeTownId?Number(home.mapY)||50:18+((seed>>>5)%61);
    const participantIndex=Math.max(0,(scene.participantOrder||[]).indexOf(character.id));
    const x=Math.max(14,Math.min(86,baseX+(scene.returningHome?-13:0)+(conversation?(participantIndex%2?6:-6):0))),y=Math.max(17,Math.min(84,baseY+(scene.returningHome?10:0)));
    const action=townActionPresentation(scene),symbol=conversation?"💬":decoration?"✨":scene.movementKind==="jog"?"🏃":scene.transit?"➜":action.icon||"👣",label=conversation?t("마을에서 대화 중","마을에서 대화 중"):decoration?`${decoration.name} · ${scene.title}`:scene.movementKind==="jog"?t("조깅 · 이동 중","조깅 · 이동 중"):scene.transit?t("이동 중","이동 중"):action.label||t("마을 산책 중","마을 산책 중");
    const routeStyle=villageWalk?routePoints.map((point,routeIndex)=>`--route-x${routeIndex}:${point[0]}%;--route-y${routeIndex}:${point[1]}%`).join(";"):"";
    const movementClass=conversation?"is-conversation":decoration?"is-decoration-visit":villageWalk?"is-village-walk":scene.movementKind==="jog"?"is-jogging":scene.transit?"is-transit":"is-roaming";
    const routeDuration=(56+(seed%13))*gait.routeDurationFactor,travelDuration=(20+(seed%7))*gait.routeDurationFactor;
    return `<button type="button" class="town-traveler town-action-${action.kind} ${movementClass} ${walkClass}" data-person="${esc(character.id)}" data-walking-style="${esc(character.walkingStyle||"보통 속도로 자연스럽게")}" style="left:${x}%;top:${y}%;--traveler-delay:${-(index%7)*1.15}s;--route-duration:${routeDuration.toFixed(2)}s;--travel-duration:${travelDuration.toFixed(2)}s;--town-step-duration:${gait.stepDuration}s;${routeStyle}" aria-label="${esc(`${character.name} · ${scene.title}`)}"><span class="town-traveler-visual">${avatar(character)}<i aria-hidden="true">${symbol}</i></span><span class="town-traveler-status"><b>${esc(character.name)}</b><small>${esc(label)}</small></span></button>`;
  }).join("");
}
export function buildingDetailDialogs(selectedKey=""){
  // Create the selected building only, not every hidden dialog and stock photo.
  if(!selectedKey)return "";
  const placeDialogs=state.world.places.filter(place=>place.id===selectedKey).map(place=>{
    const residents=charactersAtPlace(place.id,state.activeTownId);
    const stock=(place.stock||[]).map(catalogItem).filter(Boolean);
    const type=[place.type,place.subtype].filter(Boolean).join(" · ")||"유형 미설정";
    const audiences=(place.audiences||[]).length?place.audiences.join(" · "):"설정하지 않음";
    const residentCards=residents.map(character=>{
      const entry=eventFor(character);
      return `<article class="building-resident-card">${avatar(character)}<span><b>${esc(character.name)}</b><small>${esc(entry.title)}</small><em>${esc(entry.desc)}</em></span></article>`;
    }).join("")||`<p class="building-detail-empty">현재 이 건물 안에 있는 캐릭터가 없어요.</p>`;
    const stockList=stock.length?`<ul class="building-stock-list">${stock.map(item=>`<li>${item.image?`<img src="${esc(item.image)}" alt="">`:`<span>${esc(({food:"🍽️",ingredient:"🥕",fashion:"👕",music:"🎵",game:"🎮",media:"🎬",book:"📚"})[item.kind]||"✨")}</span>`}<b>${esc(item.name)}</b></li>`).join("")}</ul>`:`<p class="building-detail-empty">등록된 판매 상품이나 이용 항목이 없어요.</p>`;
    const interior=place.interiorImage?`<img src="${esc(place.interiorImage)}" alt="${esc(place.name)} 내부">`:`<div class="building-interior-placeholder"><span>${esc(place.emoji||"🏢")}</span><b>내부 이미지가 아직 없어요</b><small>마을 편집에서 내부 사진을 등록할 수 있어요.</small></div>`;
    return `<dialog class="building-detail-dialog" data-building-detail-dialog="${place.id}"><form method="dialog"><header><span><small>BUILDING</small><h2>${esc(place.name)}</h2></span><button value="close" aria-label="닫기">×</button></header><div class="building-detail-layout"><section class="building-interior-view">${interior}</section><section class="building-detail-info"><dl><div><dt>건물 유형</dt><dd>${esc(type)}</dd></div><div><dt>가격대</dt><dd>${esc(place.priceRange||"보통")}</dd></div><div><dt>주요 이용층</dt><dd>${esc(audiences)}</dd></div></dl><div><h3>지금 안에 있는 인물 <small>${residents.length}명</small></h3><div class="building-resident-list">${residentCards}</div></div><div><h3>이곳에서 이용할 수 있는 것</h3>${stockList}</div></section></div><button class="primary building-detail-close" value="close">닫기</button></form></dialog>`;
  }).join("");
  const homeDialogs=townHomes().filter(home=>`home:${home.id}`===selectedKey).map(home=>{
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
    ,["곱슬기",distribution(characters.map(character=>bodyValue(character,["appearance","hairTexture"]))) ]
    ,["머릿결",distribution(characters.map(character=>bodyValue(character,["appearance","hairCondition"]))) ]
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
function statisticsDashboard(){
  const townSnapshots=(state.towns||[]).map(town=>town.id===state.activeTownId?state.world:town).filter(Boolean);
  const sizeOrder={"초소형 거주지":1,"작은 마을":2,"보통 마을":3,"큰 마을":4,"대도시":5,"광역 도시":6};
  const residentTownId=character=>state.homes?.[character.homeId]?.townId||character.townId||state.activeTownId;
  const residentCount=town=>state.order.filter(id=>state.characters[id]&&residentTownId(state.characters[id])===town.id).length;
  const sortedTowns=[...townSnapshots].sort((a,b)=>(sizeOrder[b.size]||0)-(sizeOrder[a.size]||0)||residentCount(b)-residentCount(a)||String(a.name).localeCompare(String(b.name),"ko"));
  const scope=state.statisticsTownId==="all"||sortedTowns.some(town=>town.id===state.statisticsTownId)?state.statisticsTownId:"all";
  const characters=state.order.map(id=>state.characters[id]).filter(character=>character&&(scope==="all"||residentTownId(character)===scope));
  const selectedTown=sortedTowns.find(town=>town.id===scope),total=characters.length;
  const homes=Object.values(state.homes||{}).filter(home=>scope==="all"||home.townId===scope),places=scope==="all"?townSnapshots.flatMap(town=>town.places||[]):selectedTown?.places||[],buildingCount=homes.length+places.length;
  const averageTime=(field,night=false)=>{const values=characters.map(character=>String(character[field]||"")).filter(value=>/^\d{1,2}:\d{2}$/.test(value)).map(value=>{const [hour,minute]=value.split(":").map(Number),raw=hour*60+minute;return night&&raw<720?raw+1440:raw});if(!values.length)return "—";const mean=Math.round(values.reduce((sum,value)=>sum+value,0)/values.length)%1440;return `${String(Math.floor(mean/60)).padStart(2,"0")}:${String(mean%60).padStart(2,"0")}`};
  const averageBody=field=>{const values=characters.map(character=>Number(character.bodyProfile?.[field])).filter(Number.isFinite).filter(value=>value>0);return values.length?`${Math.round(values.reduce((sum,value)=>sum+value,0)/values.length*10)/10}${field==="heightCm"?"cm":"kg"}`:"—"};
  const distribution=(values,limit=8)=>{const counts=new Map();values.flat().filter(Boolean).forEach(value=>counts.set(String(value),(counts.get(String(value))||0)+1));return [...counts.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"ko")).slice(0,limit)};
  const ageOrder=["노년","장년","중년","성인","청년","청소년","어린이","유아","영아","나이 불명"],genderKind=value=>/여성|여자|Female|女性/.test(value||"")?"female":/남성|남자|Male|男性/.test(value||"")?"male":"other";
  const pyramid=ageOrder.map(age=>{const group=characters.filter(character=>(character.ageGroup||"나이 불명")===age),male=group.filter(character=>genderKind(character.gender)==="male").length,female=group.filter(character=>genderKind(character.gender)==="female").length,other=group.length-male-female;return {age,male,female,other}}),pyramidMax=Math.max(1,...pyramid.flatMap(row=>[row.male,row.female]));
  const personality=distribution(characters.map(character=>character.personalityTypes?.[0]||"미설정"),10),personalityTotal=Math.max(1,personality.reduce((sum,[,count])=>sum+count,0)),palette=["#d6ad2f","#7d5d9b","#5c8fb5","#bb715d","#6e9b76","#c189b0","#8a755d","#789393","#b5a166","#888"];
  let cursor=0;const personalityStops=personality.map(([,count],index)=>{const start=cursor;cursor+=count/personalityTotal*100;return `${palette[index%palette.length]} ${start}% ${cursor}%`}).join(",")||"#ddd 0 100%";
  const ratio=predicate=>total?Math.round(characters.filter(predicate).length/total*100):0,employed=ratio(character=>!['','무직','설정하지 않음'].includes(character.job||'')),morning=ratio(character=>{const hour=Number(String(character.wake||"").split(":")[0]);return Number.isFinite(hour)&&hour<7}),social=total?Math.round(characters.reduce((sum,character)=>sum+(Number(character.socialEnergy)||3),0)/total*10)/10:0,relationshipLinks=Object.values(state.relationships||{}).filter(relation=>{const ids=relation.memberIds||relation.characterIds||relation.members||[relation.a,relation.b];return ids.some(id=>characters.some(character=>character.id===id))}).length;
  const scopeButtons=`<button type="button" data-statistics-scope="all" class="${scope==="all"?"on":""}">${t("전체","전체")}</button>${sortedTowns.map(town=>`<button type="button" data-statistics-scope="${esc(town.id)}" class="${scope===town.id?"on":""}">${esc(town.name)} <small>${residentCount(town)}</small></button>`).join("")}`;
  const metrics=[["마을 수",scope==="all"?sortedTowns.length:1,"곳"],["건물 수",buildingCount,"개"],["캐릭터 수",total,"명"]];
  const lifestyle=[["평균 기상 시각",averageTime("wake")],["평균 취침 시각",averageTime("sleep",true)],["평균 키",averageBody("heightCm")],["평균 몸무게",averageBody("weightKg")]];
  return `<section class="statistics-report" data-character-statistics-page><header class="statistics-report-head"><small>DRAWER VILLAGE REPORT</small><h1>${t("통계 보고서","통계 보고서")}</h1><p>${t("마을과 캐릭터의 생활을 한눈에 살펴봐요.","마을과 캐릭터의 생활을 한눈에 살펴봐요.")}</p></header><nav class="statistics-scope-tabs" aria-label="${esc(t("통계 범위","통계 범위"))}">${scopeButtons}</nav><div class="statistics-summary">${metrics.map(([label,value,unit])=>`<article><small>${t(label,label)}</small><b>${value}<em>${t(unit,unit)}</em></b></article>`).join("")}</div><section class="statistics-card statistics-population"><header><span><small>AGE · GENDER</small><h2>${t("연령대와 성비","연령대와 성비")}</h2></span><p>${esc(selectedTown?.name||t("전체 마을","전체 마을"))}</p></header><div class="population-legend"><span class="male">${t("남성","남성")}</span><span class="other">${t("그 외·미설정","그 외·미설정")}</span><span class="female">${t("여성","여성")}</span></div><div class="population-pyramid">${pyramid.map(row=>`<div class="population-row"><i class="male" style="--population:${row.male/pyramidMax*100}%"><b>${row.male||""}</b></i><span>${t(row.age,row.age)}${row.other?`<small>+${row.other}</small>`:""}</span><i class="female" style="--population:${row.female/pyramidMax*100}%"><b>${row.female||""}</b></i></div>`).join("")}</div></section><section class="statistics-lifestyle">${lifestyle.map(([label,value])=>`<article><small>${t(label,label)}</small><b>${value}</b></article>`).join("")}</section><section class="statistics-card statistics-personality"><div class="personality-donut" style="--personality-chart:conic-gradient(${personalityStops})"><span><b>${total}</b><small>${t("명","명")}</small></span></div><div class="personality-top"><small>PERSONALITY TOP 3</small><h2>${t("가장 많은 성격","가장 많은 성격")}</h2><ol>${personality.slice(0,3).map(([label,count],index)=>`<li><em>${index+1}</em><b>${esc(label)}</b><span>${count}${t("명","명")}</span></li>`).join("")||`<li>${t("아직 집계할 설정이 없어요.","아직 집계할 설정이 없어요.")}</li>`}</ol></div></section><section class="statistics-card statistics-social"><header><small>SOCIAL SNAPSHOT</small><h2>${t("생활과 사회 지표","생활과 사회 지표")}</h2></header><div><article><b>${employed}%</b><span>${t("직업이 있는 캐릭터","직업이 있는 캐릭터")}</span></article><article><b>${morning}%</b><span>${t("오전 7시 전 기상","오전 7시 전 기상")}</span></article><article><b>${social} / 6</b><span>${t("평균 사회 에너지","평균 사회 에너지")}</span></article><article><b>${relationshipLinks}</b><span>${t("연결된 관계 수","연결된 관계 수")}</span></article></div></section><div class="character-stat-actions"><button type="button" class="primary" data-download-character-stats>${t("보고서 다운로드","보고서 다운로드")}</button></div></section>`;
}
function statistics(){return statisticsDashboard()}
function observe(){
  const localIds=state.order.filter(id=>visibleTownId(state.characters[id])===state.activeTownId);
  const nativeHome=Boolean(document.documentElement?.classList?.contains?.("native-app"));
  const localId=localIds.includes(state.activeId)?state.activeId:localIds[0];
  const townSwitcher=state.towns.length>1?`<div class="observe-town-switcher"><b>관찰할 마을</b>${state.towns.map(town=>`<button data-observe-town="${town.id}" class="${town.id===state.activeTownId?"on":""}">🏙️ ${esc(town.name)}</button>`).join("")}</div>`:"";
  if(!localId){
    if(nativeHome){
      const theme=homeUiTheme();
      return `<section class="game-observe-hud game-observe-empty" data-native-hud-version="4" data-home-ui-theme="${theme.id}" style="${homeUiThemeStyle()}" aria-label="${esc(t("observe","관찰"))}">${tabletObserveMap()}<div class="native-observe-backdrop" style="background-image:url(&quot;${esc(state.world?.bg||TOWN_BACKGROUND)}&quot;)"></div><div class="native-observe-shade"></div><div class="game-hud-top game-hud-empty-top"><div><b>${esc(state.world?.name||t("town","마을"))}</b><small>${t("emptyTownTitle","이 마을에 사는 캐릭터가 없어요")}</small></div><time>${new Date().toLocaleTimeString(uiLocale(),{hour:"2-digit",minute:"2-digit"})}</time></div>${gameHudSideMenu("left")}${gameHudSideMenu("right")}<div class="game-observe-empty-copy"><span>🏙️</span><h1>${t("emptyTownTitle","이 마을에 사는 캐릭터가 없어요")}</h1><p>${t("emptyTownHelp","캐릭터 화면에서 생활하는 마을을 지정해 주세요.")}</p><button class="primary" data-tab="character">${t("openCharacterSettings","캐릭터 설정 열기")}</button></div>${gameHudDock()}</section>${buildingDetailDialogs()}`;
    }
    return `<div class="standard-observe-view">${roster()}${townSwitcher}<div class="observe desktop-observe-map-only"><section><div class="viewport"><div class="world town-environment" data-town-language="${state.uiLanguage||"ko"}">${townBackgroundMarkup(state.world?.bg)}${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}${townDecorationsMarkup()}</div></div></section></div>${buildingDetailDialogs()}</div>`;
  }
  const c=state.characters[localId],e=eventFor(c),place=placeForEntry(e);
  const sceneHome=e.home?state.homes[e.visitHomeId||c.homeId]:null;
  const locationText=sceneHome?`${sceneHome.name||"집"} · ${sceneHome.rooms?.[e.room]?.name||"집 안"}`:e.transit?t("inTransit","이동 중"):place?`${place.name} · ${townForEntry(e).name}`:t("outAndAbout","외출 중");
  const locationExterior=sceneHome?homeExteriorSource(sceneHome):place?buildingExteriorSource(place):"";
  const location=`<span class="game-hud-location">${locationExterior?`<img src="${esc(locationExterior)}" alt="${esc(t("locationExterior","현재 건물 외관"))}">`:`<i class="${e.transit?"is-moving":""}" aria-hidden="true">${sceneMovementIcon(e)}</i>`}<b>${esc(locationText)}</b></span>`;
  const sceneTown=townForEntry(e);
  const locationBackground=e.home?state.homes[e.visitHomeId||c.homeId]?.rooms?.[e.room]?.image||"":place?.interiorImage||place?.image||"";
  // 프로필 사진은 캐릭터의 얼굴 표시에만 쓴다. 방·장소 사진이 없는
  // 장면의 배경으로 재사용하면 캐릭터가 외출했을 때 얼굴 사진이 화면
  // 전체를 덮는다. 장소 사진, 해당 마을 배경, 기본 배경 순서만 허용한다.
  const nativeBackground=locationBackground||sceneTown?.bg||state.world?.bg||TOWN_BACKGROUND;
  const nativeEntries=displayTimeline(c,e);
  const logTheme=esc(c?.theme?.primary||"#a96f46");
  const nativeFullLog=`<dialog class="native-log-dialog" data-native-log-dialog><form method="dialog"><div class="native-log-dialog-head"><span><small>오늘의 기록</small><h2>${esc(c.name)}의 생활 로그</h2></span><button value="close" aria-label="닫기">×</button></div><ol>${dailyLogItems(nativeEntries,c)||"<li>아직 기록이 없어요.</li>"}</ol><button class="primary native-log-dialog-close" value="close">닫기</button></form></dialog>`;
  const hasLd=hasLdArt(c,e),hasSd=hasSdArt(c,e);
  let visualMode=hasLd&&(state.homeVisualMode==="ld"||!hasSd)?"ld":"sd";
  let presentation=nativeScenePresentation(c,e,visualMode);
  // 함께 있는 인물 중 한 명이 LD를 홈 표현으로 선택했다면 어느 인물 탭에서
  // 보더라도 동일한 혼합 LD 장면을 보여 준다. LD가 없는 인물은 작은 SD로
  // 보완되며, 등록한 LD 원본의 높이와 비율은 한 명일 때와 동일하다.
  if(visualMode!=="ld"&&state.homeVisualMode==="ld"&&presentation.partners.some(person=>hasLdArt(person,eventFor(person)))){
    visualMode="ld";
    presentation=nativeScenePresentation(c,e,visualMode);
  }
  const visualScale=Math.max(70,Math.min(150,Number(visualMode==="ld"?state.homeLdScale:state.homeSdScale)||100))/100;
  const movementClass=e.transit?`is-scene-moving ${e.movementKind==="jog"?"is-scene-jogging":"is-scene-transit"} ${walkStyleClassFor(c)}`:"";
  const stageClasses=`${presentation.partner?"has-scene-companion":""} ${presentation.lineupHtml?"has-scene-lineup":""} ${presentation.participantCount===2?"has-two-scene-actors":""} ${presentation.pet?"has-scene-pet":""} ${movementClass} visual-mode-${visualMode}`;
  // 2인 장면은 lineup이 두 인물을 모두 렌더링한다. 메인 이미지를 중복으로
  // 넣지 않아 예전 CSS가 남아 있어도 거대한 얼굴이 다시 나타나지 않는다.
  const movingBadge=e.transit?`<span class="native-scene-moving-badge" aria-label="${esc(e.movementKind==="jog"?t("조깅 · 이동 중","조깅 · 이동 중"):t("이동 중","이동 중"))}"><i aria-hidden="true">${sceneMovementIcon(e)}</i><b>${esc(e.movementKind==="jog"?t("조깅 · 이동 중","조깅 · 이동 중"):t("이동 중","이동 중"))}</b></span>`:"";
  const sceneActors=`${presentation.lineupHtml?"":sceneAvatar(c,"native-main-character",presentation.tone,visualMode,e)}${presentation.sleepMarkHtml}${presentation.lineupHtml}${presentation.conversationHtml}${presentation.thoughtHtml}${presentation.actionHtml}${presentation.companionHtml}${presentation.petHtml}${movingBadge}<i></i>`;
  if(!nativeHome){
    const everyoneSleeping=state.order.length>0&&state.order.every(id=>eventFor(state.characters[id]).title==="자는 중");
    const sleepGate=everyoneSleeping?`<div class="sleep-gate"><span>🌙</span><div><h2>모든 인물이 자고 있습니다</h2><p>마을은 조용해졌어요. 집에서 인물들의 수면 상태를 볼 수 있어요.</p></div><button class="primary" data-all-sleep-home>집 보기</button></div>`:"";
    const desktopLocation=sceneHome?`🏠 ${esc(sceneHome.name||"집")} · ${esc(sceneHome.rooms?.[e.room]?.name||"집 안")}`:e.transit?`${sceneMovementIcon(e)} ${esc(t("inTransit","이동 중"))}`:place?`📍 ${esc(place.name)} · ${esc(townForEntry(e).name)}`:`📍 ${esc(t("outAndAbout","외출 중"))}`;
    const desktopScene=`<section class="desktop-observe-scene native-app" aria-label="${esc(c.name)}의 지금 이 순간"><div class="desktop-scene-canvas scene-tone-${presentation.tone} scene-action-${presentation.actionKind} ${movementClass}" style="--native-own:${esc(c.theme?.primary||"#176b60")};--native-own-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}"><div class="native-observe-backdrop" style="background-image:url(&quot;${esc(nativeBackground)}&quot;)"></div><div class="native-observe-shade"></div><div class="native-scene-atmosphere atmosphere-${presentation.atmosphere}" aria-hidden="true"></div>${presentation.effects}<div class="desktop-scene-copy"><small>${t("currentMoment","지금 이 순간")}</small><h1>${esc(c.name)} · ${esc(e.title)}</h1><p>${esc(e.desc)}</p><b>${desktopLocation}</b></div><div class="native-character-stage ${stageClasses}" style="--home-visual-scale:${visualScale};${sceneLayoutVars(c,visualMode,e)}" aria-label="${esc(c.name)} 현재 장면">${sceneActors}</div></div></section>`;
    const emptyLog="<li><span><b>아직 기록이 없어요</b><small>조금 뒤 새로운 생활 장면이 나타납니다.</small></span></li>";
    const desktopLogEntries=nativeEntries.slice().reverse().map(item=>`<li style="--log-theme:${logTheme}"><time>${esc(item.time)}</time><span><b>${esc(item.title)}</b><small>${esc(item.desc)}</small></span></li>`).join("");
    const desktopLog=`<section class="desktop-observe-log"><section class="native-log-card desktop-log-expanded" style="--log-theme:${logTheme}" aria-label="오늘의 기록"><div><b>${t("todayLog","오늘의 기록")}</b><span><button type="button" data-tab="home">${t("viewHome","집 보기")}</button></span></div><ol>${desktopLogEntries||emptyLog}</ol></section></section>`;
    return `<div class="standard-observe-view">${roster()}${townSwitcher}${desktopScene}<div class="desktop-observe-lower"><div class="observe desktop-observe-map-only"><section><div class="world-hud"><div><small>현재 시각</small><b>${new Date().toLocaleString(uiLocale(),{month:"long",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit"})}</b></div><div><small>관찰 중</small><b>${esc(c.name)} · ${esc(e.title)}</b></div></div><div class="viewport">${sleepGate}<div class="world town-environment" data-town-language="${state.uiLanguage||"ko"}">${townBackgroundMarkup(state.world?.bg)}${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}${townDecorationsMarkup()}${state.world.places.map(peopleAtPlaceCard).join("")}${townHomes().map(peopleAtHomeCard).join("")}</div></div></section></div>${desktopLog}</div>${nativeFullLog}${buildingDetailDialogs()}</div>`;
  }
  const otherTowns=state.towns.filter(town=>town.id!==state.activeTownId);
  const hudRoster=`<details class="game-hud-profile"><summary class="game-hud-profile-toggle" data-open-game-hud-roster aria-label="${esc(t("characterPicker","관찰 캐릭터 바꾸기"))}"><span class="game-hud-profile-frame">${profileAvatar(c,"game-hud-current-profile")}<img class="game-hud-profile-ring" src="${esc(homeUiAsset(c,"profile-ring.png"))}" alt=""></span><span class="game-hud-profile-copy"><b>${esc(c.name)}</b><small><em>${esc(c.jobTitle||c.job||t("생활 중","생활 중"))}</em></small></span></summary><section class="game-hud-roster-drawer"><small class="game-hud-roster-kicker">${t("currentTownResidents","이 마을의 캐릭터")}</small><div class="game-hud-roster-options" aria-label="${esc(t("characterPicker","관찰 캐릭터 선택"))}">${localIds.map(id=>{const person=state.characters[id];return `<button type="button" data-home-character="${id}" class="game-hud-button character-picker-button ${id===c.id?"on":""}" style="--picker-theme:${esc(person.theme?.primary||"#176b60")}" title="${esc(person.name)}" aria-label="${esc(person.name)}">${profileAvatar(person)}<small>${esc(person.name)}</small></button>`}).join("")}</div>${otherTowns.length?`<div class="game-hud-town-jump"><b>${t("moveToAnotherTown","다른 마을로 이동")}</b><div>${otherTowns.map(town=>`<button type="button" data-observe-town="${town.id}">${esc(town.name)}</button>`).join("")}</div></div>`:""}</section></details>`;
  const currentMood=characterMood(c,e,state);
  const sleeping=/자는 중|잠든|수면|sleep|眠/.test(`${e.title||""} ${e.mood||""}`),commandLabel=({ko:sleeping?"깨우고 할 일 정하기":"할 일 정하기",en:sleeping?"Wake & choose":"Choose activity",ja:sleeping?"起こして行動を決める":"行動を決める"}[state.uiLanguage]||"할 일 정하기");
  const statusCard=`<article class="game-hud-moment" data-game-hud-moment><div class="game-hud-moment-head"><button type="button" class="character-mood-badge" data-open-character-mood aria-label="${esc(t("현재 기분","현재 기분"))}">${currentMood.icon} ${esc(currentMood.label)}</button><button type="button" class="game-hud-button game-hud-moment-toggle" data-toggle-game-hud-moment aria-expanded="false" data-expand-label="${esc(t("expand","펼치기"))}" data-collapse-label="${esc(t("collapse","접기"))}"><span>${t("expand","펼치기")}</span></button></div><div class="game-hud-moment-body" data-toggle-game-hud-moment role="button" tabindex="0" aria-expanded="false" aria-label="${esc(t("currentMoment","지금 이 순간"))} · ${esc(t("expand","펼치기"))}"><h1>${esc(e.title)}</h1><p>${esc(e.desc)}</p>${location}</div><button type="button" class="game-hud-character-command" data-character-command="${esc(c.id)}">${esc(commandLabel)}</button></article>`;
  const theme=homeUiTheme(c);
  const gameNow=new Date(),gameDate=gameNow.toLocaleDateString(uiLocale(),{month:"long",day:"numeric",weekday:"short"}),gameTime=gameNow.toLocaleTimeString(uiLocale(),{hour:"2-digit",minute:"2-digit"});
  const gameHud=`<section class="game-observe-hud scene-tone-${presentation.tone} scene-action-${presentation.actionKind} ${movementClass}" data-native-hud-version="4" data-home-ui-theme="${theme.id}" style="${homeUiThemeStyle(c)};--native-own:${esc(c.theme?.primary||"#176b60")};--native-own-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")};--log-theme:${logTheme}" aria-label="${esc(c.name)}의 관찰 화면">${tabletObserveMap()}<div class="native-observe-backdrop" style="background-image:url(&quot;${esc(nativeBackground)}&quot;)"></div><div class="native-observe-shade"></div><div class="native-scene-atmosphere atmosphere-${presentation.atmosphere}" aria-hidden="true"></div>${presentation.effects}<div class="game-hud-top">${hudRoster}<time>${gameTime}</time><small class="game-hud-date">${esc(gameDate)}</small></div>${gameHudSideMenu("left",c)}${gameHudSideMenu("right",c)}<div class="game-hud-stage visual-mode-${visualMode}"><div class="native-character-stage ${stageClasses}" style="--home-visual-scale:${visualScale};${sceneLayoutVars(c,visualMode,e)}" aria-label="${esc(c.name)} 현재 장면">${sceneActors}</div></div>${statusCard}${gameHudDock(c)}</section>`;
  return `${gameHud}${nativeFullLog}${buildingDetailDialogs()}`;
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
  const room=h.rooms?.[key]||{},manual=room.layout&&typeof room.layout==="object"?room.layout:null;
  const resolvedMobile=manual||mobileLayout||{x:0,y:0,w:100,h:100};
  const floorMaterial=normalizeHomeSurface(room.floorMaterial,room.type,{allowCustom:true,customImage:room.floorImage});
  const wallMaterial=normalizeWallSurface(room.wallMaterial,floorMaterial,room.type);
  const floorImage=room.usePhoto&&room.image?room.image:homeSurfaceImage(floorMaterial,room.floorImage,room.type);
  const fullRoomIllustration=room.usePhoto??(floorMaterial==="custom");
  const wallImage=fullRoomIllustration?"":wallSurfaceImage(wallMaterial,floorMaterial,room.floorImage,room.type);
  const furnitureColumns=Math.max(1,Math.round((Number(resolvedMobile.w)||100)/100*12));
  const furnitureRows=Math.max(1,Math.round((Number(resolvedMobile.h)||100)/100*16));
  const parts=[
    `--room-x:${layout?.x||1}`,
    `--room-y:${layout?.y||1}`,
    `--room-w:${layout?.w||1}`,
    `--room-h:${layout?.h||1}`,
    `--mobile-room-x:${(Number(resolvedMobile.x)||0).toFixed(4)}%`,
    `--mobile-room-y:${(Number(resolvedMobile.y)||0).toFixed(4)}%`,
    `--mobile-room-w:${(Number(resolvedMobile.w)||100).toFixed(4)}%`,
    `--mobile-room-h:${(Number(resolvedMobile.h)||100).toFixed(4)}%`,
    `--furniture-grid-cols:${furnitureColumns}`,
    `--furniture-grid-rows:${furnitureRows}`,
    `--furniture-cell-w:${(100/furnitureColumns).toFixed(4)}%`,
    `--furniture-cell-h:${(100/furnitureRows).toFixed(4)}%`,
    `--room-image-fit:${room.imageFit==="contain"?"contain":"cover"}`,
    `--room-floor-size:${fullRoomIllustration?"cover":"250px"}`,
    `--room-floor-repeat:${fullRoomIllustration?"no-repeat":"repeat"}`,
    `--room-floor-position:${fullRoomIllustration?"center":"center top"}`,
    `--room-wall-image:${wallImage?`url('${wallImage}')`:"none"}`,
    `background-image:linear-gradient(#1010100a,#1010100a),url('${floorImage}')`
  ];
  return `style="${parts.join(";")}"`;
}
const COUPLE_BED_ASSET_ROOT="assets/furniture/couple-bed";
const COUPLE_BED_ART_SCALE=1.05;
const furniturePlacementStyle=(placement,footprint)=>`--furniture-x:${placement.x}%;--furniture-y:${placement.y}%;--furniture-scale:${placement.scale};--furniture-rotation:${placement.rotation}deg;--furniture-layer:${placement.layer};--furniture-flip:${placement.flipped?-1:1};--furniture-grid-width:${footprint.columns};--furniture-grid-height:${footprint.rows}`;
const coupleBedImage=(layer,extra="")=>`<img class="couple-bed-layer couple-bed-${layer} ${extra}" src="${COUPLE_BED_ASSET_ROOT}/couple-bed-${layer}.png" alt="" aria-hidden="true">`;
function roomFurnitureMarkup(homeId,roomKey,room,edit,bedStates=new Map()){
  const placements=normalizeFurniturePlacements(room.furniturePlacements);
  if(!placements.length&&!edit)return "";
  return `<div class="room-furniture-layer" aria-label="${esc(room.name||roomKey)} 가구">${placements.map(placement=>{
    const label=furnitureLabel(placement.item,state.uiLanguage),props=placement.props||[],footprint=furnitureFootprint(placement.item),coupleBed=placement.item==="커플 침대",bedState=edit?"default":bedStates.get(placement.id)||"default";
    const art=coupleBed?`<span class="room-furniture-art room-couple-bed-art" data-bed-layer-state="${bedState}" aria-hidden="true">${coupleBedImage("base")}${bedState!=="under-cover"?coupleBedImage("quilt"):""}${bedState==="default"?coupleBedImage("footboard"):""}</span>`:`<span class="room-furniture-art" aria-hidden="true">${furnitureIcon(placement.item)}</span>`;
    return `<button type="button" class="room-furniture-item ${coupleBed?"is-couple-bed":""}" data-furniture-placement="${esc(placement.id)}" data-home-id="${esc(homeId)}" data-room-key="${esc(roomKey)}" data-furniture-name="${esc(label)}" data-furniture-supports-props="${supportsFurnitureProps(placement.item)}" data-furniture-columns="${footprint.columns}" data-furniture-rows="${footprint.rows}" style="${furniturePlacementStyle(placement,footprint)}" aria-label="${esc(label)}${edit?" · 끌어서 이동":""}" ${edit?"":"tabindex=\"-1\""}>${art}${props.length?`<span class="room-furniture-props" aria-hidden="true">${props.map((prop,index)=>`<i style="--prop-slot:${index}">${furniturePropIcon(prop.item)}</i>`).join("")}</span>`:""}${edit?`<small>${esc(label)} · ${footprint.columns}×${footprint.rows}</small>`:""}</button>`;
  }).join("")}</div>`;
}
function roomFurnitureOverlayMarkup(room,bedStates=new Map()){
  const overlays=normalizeFurniturePlacements(room.furniturePlacements).filter(placement=>placement.item==="커플 침대"&&["on-bed","under-cover"].includes(bedStates.get(placement.id))).map(placement=>{
    const footprint=furnitureFootprint(placement.item),bedState=bedStates.get(placement.id);
    return `<span class="room-couple-bed-overlay" data-bed-layer-state="${bedState}" style="${furniturePlacementStyle(placement,footprint)}">${bedState==="under-cover"?coupleBedImage("quilt"):""}${coupleBedImage("footboard")}</span>`;
  });
  return overlays.length?`<div class="room-furniture-overlay-layer" aria-hidden="true">${overlays.join("")}</div>`:"";
}
function homeLifePersonMarkup(character,event,agent,room,roomKey,index,bedSlot=-1,options={}){
  // 집 화면도 관찰 화면·로그와 같은 장면 객체를 그대로 사용한다. 가구
  // 시뮬레이션은 위치와 애니메이션만 담당하며 행동 문장을 새로 만들지 않는다.
  const scene=event;
  const title=scene?.title||"집에서 시간을 보내는 중",text=`${title} ${scene?.desc||""} ${scene?.mood||""}`;
  const now=Date.now(),scheduledWalk=agent?.phase==="walking",walking=scheduledWalk&&now>=Number(agent?.startedAt||0),presentation=nativeScenePresentation(character,scene,"sd"),sleeping=!scheduledWalk&&presentation.actionKind==="sleep",conversing=Boolean(options.conversing),bedActivity=bedSlot>=0&&agent?.phase==="using",bedConversation=bedActivity&&Boolean(options.bedConversation);
  const actionKind=walking?"walking":conversing&&agent?.actionKind?agent.actionKind:presentation.actionKind,actionProp=bedActivity?"":nativeSceneActionProp(character,scene,actionKind,text,true);
  const duration=Math.max(1,Number(agent?.endsAt||0)-Number(agent?.startedAt||0)),elapsed=Math.max(0,Math.min(duration,now-Number(agent?.startedAt||0)));
  const walkStyleClass=walkStyleClassFor(character);
  const visualPhase=scheduledWalk&&!walking?"waiting-to-walk":agent?.phase,bedUsing=bedSlot>=0&&agent?.phase==="using",coupleBedClass=bedSlot>=0?` is-couple-bed-user couple-bed-slot-${bedSlot+1}${bedUsing?" is-using-couple-bed":""}${options.bedState==="under-cover"?" is-under-cover":""}${bedConversation?" is-bed-conversation":""}`:"",conversationClass=conversing?` is-conversing conversation-slot-${Number(options.slot)||1}${agent?.approachingInteraction?" is-approaching-conversation":""}`:"",canvasClass=options.canvasWalker?" home-canvas-walker":"",lifeClass=agent?`home-life-person home-life-${visualPhase} ${walkStyleClass}${coupleBedClass}${conversationClass}${canvasClass}`:"";
  const bedRotation=Number(options.bedPlacement?.rotation)||0,bedRadians=bedRotation*Math.PI/180,bedPlacementScale=Math.max(.55,Math.min(1.8,Number(options.bedPlacement?.scale)||1)),bedVisualScale=bedPlacementScale*COUPLE_BED_ART_SCALE;
  // 얼굴 중심을 침대 그림의 두 베개 중심에 맞춘다. 이 좌표에서 인물은
  // 침대 바닥보다 위, 이불·하단 프레임보다 아래 레이어에 놓인다.
  const localBedX=bedSlot===0?-4.6*bedVisualScale:bedSlot===1?4.6*bedVisualScale:0,localBedY=bedSlot>=0?-4.9*bedVisualScale:0,bedOffsetX=localBedX*Math.cos(bedRadians)-localBedY*Math.sin(bedRadians),bedOffsetY=localBedX*Math.sin(bedRadians)+localBedY*Math.cos(bedRadians);
  const isBedPose=bedSlot>=0&&agent?.phase==="using",anchorX=isBedPose?Number(options.bedPlacement?.x):Number(agent?.x),anchorY=isBedPose?Number(options.bedPlacement?.y):Number(agent?.y);
  const safeAnchorX=Number.isFinite(anchorX)?anchorX:Number.isFinite(Number(agent?.x))?Number(agent.x):50,safeAnchorY=Number.isFinite(anchorY)?anchorY:Number.isFinite(Number(agent?.y))?Number(agent.y):50;
  const x=agent?Math.max(5,Math.min(95,safeAnchorX+bedOffsetX)):50;
  const y=agent?Math.max(5,Math.min(95,safeAnchorY+bedOffsetY)):50;
  const fromX=agent?Math.max(5,Math.min(95,Number(agent.fromX)||x)):x,fromY=agent?Math.max(5,Math.min(95,Number(agent.fromY)||y)):y;
  const bedCharacterScale=.76,bedFaceSize=Math.round(Math.max(46,Math.min(60,52*bedPlacementScale)));
  const lifeStyle=agent?`--life-x:${x}%;--life-y:${y}%;--life-dx:${fromX-x}cqw;--life-dy:${fromY-y}cqh;--life-duration:${Math.max(1,Number(agent.arrivesAt||agent.endsAt)-Number(agent.startedAt||0))}ms;--life-delay:-${elapsed}ms;${bedSlot>=0?`--bed-face-size:${bedFaceSize}px;--couple-bed-character-scale:${bedCharacterScale};--couple-bed-character-rotation:${bedRotation}deg;`:""}`:"";
  const sceneActivity=String(title).replace(`${room.name||roomKey}에서 `,"").replace(`${room.name||roomKey} `,"");
  const itemLabel=agent?.item?furnitureLabel(agent.item,state.uiLanguage):"";
  const activity=conversing&&itemLabel?state.uiLanguage==="en"?`${itemLabel} · chatting`:state.uiLanguage==="ja"?`${itemLabel}を使いながら会話中`:`${itemLabel}을 사용하며 대화 중`:sceneActivity;
  // 침대 안에서는 잠든 자세처럼 얼굴과 이불의 작은 움직임만 보여 준다.
  // 각자 말풍선을 띄우면 두 사람용 공유 카드와 겹쳐 침대가 가려진다.
  const speech=conversing&&!bedConversation?`<i class="home-person-chat-bubble" aria-hidden="true">${agent?.approachingInteraction?"!":"•••"}</i>`:"";
  const quietBedSleep=bedSlot>=0&&sleeping,hideStatus=quietBedSleep||Boolean(options.hideStatus);
  const sleepMotion=homeSleepAnimation(character.sleepHabit);
  return `<div class="home-person ${lifeClass} scene-action-${esc(actionKind)} ${sleeping?"is-sleeping":""}" data-sleep-style="${sleeping?sleepMotion.style:""}" style="--sleep-duration:${sleepMotion.duration}s;--sleep-delay:-${(now/1000+index*.71)%sleepMotion.duration}s;${lifeStyle}--home-float-delay:${-(index%4)*.37}s" role="button" tabindex="0" aria-label="${esc(`${character.name} · ${title}`)}" data-couple-bed-id="${esc(options.bedPlacement?.id||"")}" data-bed-slot="${bedSlot}" data-home-person="${esc(character.id)}" data-home-occupant="character" data-character-id="${esc(character.id)}" data-occupant-name="${esc(character.name)}" data-occupant-title="${esc(title)}" data-occupant-desc="${esc(scene?.desc||"")}" data-occupant-room="${esc(room.name||roomKey)}"><span class="home-person-visual">${avatar(character)}${actionProp}${speech}${sleeping&&!quietBedSleep?'<i class="room-sleep-mark" aria-hidden="true">ZZ</i>':""}</span>${hideStatus?"":`<span class="home-person-status"><b>${esc(character.name)}</b><small>${esc(activity)}</small></span>`}</div>`;
}
function homeInteractionSummary(scene){
  const text=`${scene?.title||""} ${scene?.desc||""} ${scene?.sharedActionText||""}`;
  if(/TV|텔레비전|방송|영화|영상|드라마|프로그램|화면을 보는/.test(text))return {kind:"watch",label:t("같이 TV 보는 중","같이 TV 보는 중"),symbol:"📺"};
  if(/뽀뽀|입맞춤|키스/.test(text))return {kind:"kiss",label:t("뽀뽀하는 중","뽀뽀하는 중"),symbol:"♥"};
  if(/포옹|껴안|안아 주|안아주/.test(text))return {kind:"hug",label:t("포옹하는 중","포옹하는 중"),symbol:"♡"};
  if(/식사|먹는 중|밥을|디저트|차를 마/.test(text))return {kind:"meal",label:t("함께 식사하는 중","함께 식사하는 중"),symbol:"♪"};
  if(/대화|이야기|말을 주고받|수다/.test(text))return {kind:"talk",label:t("대화하는 중","대화하는 중"),symbol:"…"};
  if(/장난|게임|놀|춤|노래/.test(text))return {kind:"play",label:t("함께 노는 중","함께 노는 중"),symbol:"♪"};
  return {kind:"together",label:t("함께 시간을 보내는 중","함께 시간을 보내는 중"),symbol:"✦"};
}
function homeOrderedCharacters(characters,scenes=[]){
  const configured=scenes.flatMap(scene=>Array.isArray(scene?.participantOrder)?scene.participantOrder:[]),rank=id=>{
    const configuredIndex=configured.indexOf(id);
    return configuredIndex>=0?configuredIndex:configured.length+Math.max(0,state.order.indexOf(id));
  };
  return [...characters].sort((a,b)=>rank(a.id)-rank(b.id));
}
function homeBedForegroundStatusMarkup(characters,scenes,room,roomKey,bedPlacement,index,{shared=false}={}){
  const ordered=homeOrderedCharacters(characters,scenes).slice(0,2),names=ordered.map(character=>character.name).join(" · ");
  const sceneTitles=[...new Set(scenes.map(scene=>String(scene?.title||"").replace(`${room.name||roomKey}에서 `,"").replace(`${room.name||roomKey} `,"").trim()).filter(Boolean))];
  const activity=sceneTitles.length===1?sceneTitles[0]:homeInteractionSummary(scenes[0]||{}).label;
  const bedRotation=Number(bedPlacement?.rotation)||0,bedRadians=bedRotation*Math.PI/180,bedScale=Math.max(.55,Math.min(1.8,Number(bedPlacement?.scale)||1))*COUPLE_BED_ART_SCALE;
  const localY=9.5*bedScale,x=Math.max(10,Math.min(90,(Number(bedPlacement?.x)||50)-localY*Math.sin(bedRadians))),y=Math.max(12,Math.min(92,(Number(bedPlacement?.y)||50)+localY*Math.cos(bedRadians)));
  const title=`${names} · ${activity}`;
  return `<div class="home-bed-foreground-status ${shared?"is-shared":""}" style="--bed-status-x:${x}%;--bed-status-y:${y}%;--home-float-delay:${-(index%4)*.37}s" role="group" aria-label="${esc(title)}" data-bed-status-for="${esc(bedPlacement?.id||"")}"><span class="home-interaction-status"><b>${esc(names)}</b><small>${esc(activity)}</small></span></div>`;
}
function homeTvInteractionMarkup(characters,scenes,agents,room,roomKey,index){
  const sceneByCharacterId=new Map(characters.map((character,sceneIndex)=>[character.id,scenes[sceneIndex]]));
  const ordered=homeOrderedCharacters(characters,scenes).slice(0,2),activeAgents=ordered.map(character=>agents[character.id]).filter(Boolean);
  const average=(key,fallback)=>activeAgents.length?activeAgents.reduce((sum,agent)=>sum+(Number(agent?.[key])||0),0)/activeAgents.length:fallback;
  const x=Math.max(14,Math.min(86,average("x",50))),y=Math.max(16,Math.min(86,average("y",55))),names=ordered.map(character=>character.name).join(" · ");
  const reactions=["laugh","angry","cry"],symbols={laugh:"😂",angry:"💢",cry:"😢"};
  return `<div class="home-interaction-card home-life-interaction home-interaction-watch" style="--life-x:${x}%;--life-y:${y}%;--home-float-delay:${-(index%4)*.37}s" role="group" aria-label="${esc(`${names} ${t("같이 TV 보는 중","같이 TV 보는 중")}`)}"><span class="home-interaction-visual">${ordered.map((character,avatarIndex)=>{const scene=sceneByCharacterId.get(character.id)||scenes[0]||{},reaction=reactions[nativeVisualSeed(`${character.id}:${scene.minute}:tv-reaction`)%reactions.length];return `<button type="button" class="home-interaction-avatar home-interaction-avatar-${avatarIndex+1} tv-reaction-${reaction}" aria-label="${esc(`${character.name} · ${t("같이 TV 보는 중","같이 TV 보는 중")}`)}" data-home-occupant="character" data-character-id="${esc(character.id)}" data-occupant-name="${esc(character.name)}" data-occupant-title="${esc(scene.title||t("같이 TV 보는 중","같이 TV 보는 중"))}" data-occupant-desc="${esc(scene.desc||"")}" data-occupant-room="${esc(room.name||roomKey)}">${avatar(character)}<i class="home-tv-reaction" aria-hidden="true">${symbols[reaction]}</i></button>`}).join("")}</span><span class="home-interaction-status"><b>${esc(names)}</b><small>${esc(t("같이 TV 보는 중","같이 TV 보는 중"))}</small></span></div>`;
}
function homeLifeInteractionMarkup(characters,scenes,agents,room,roomKey,index){
  const sceneByCharacterId=new Map(characters.map((character,sceneIndex)=>[character.id,scenes[sceneIndex]]));
  const ordered=homeOrderedCharacters(characters,scenes);
  const scene=scenes[0]||{},summary=homeInteractionSummary(scene),activeAgents=ordered.map(character=>agents[character.id]).filter(Boolean);
  if(summary.kind==="watch")return homeTvInteractionMarkup(ordered,scenes,agents,room,roomKey,index);
  const average=(key,fallback)=>activeAgents.length?activeAgents.reduce((sum,agent)=>sum+(Number(agent?.[key])||0),0)/activeAgents.length:fallback;
  const x=Math.max(12,Math.min(88,average("x",50))),y=Math.max(12,Math.min(88,average("y",50)));
  const names=ordered.map(character=>character.name).join(" · "),title=`${names} ${summary.label}`;
  const lifeStyle=activeAgents.length?`--life-x:${x}%;--life-y:${y}%;`:"";
  const speech=summary.kind==="talk"?'<span class="home-interaction-speech" aria-hidden="true"><i>•••</i><i>••</i></span>':"";
  return `<div class="home-interaction-card home-life-interaction home-interaction-${summary.kind}" style="${lifeStyle}--home-float-delay:${-(index%4)*.37}s" role="group" aria-label="${esc(title)}" data-home-interaction="${esc(scene.interactionId||"")}"><span class="home-interaction-visual">${ordered.slice(0,2).map((character,avatarIndex)=>{const characterScene=sceneByCharacterId.get(character.id)||scene;return `<button type="button" class="home-interaction-avatar home-interaction-avatar-${avatarIndex+1}" aria-label="${esc(`${character.name} · ${summary.label}`)}" data-home-occupant="character" data-character-id="${esc(character.id)}" data-occupant-name="${esc(character.name)}" data-occupant-title="${esc(characterScene?.title||summary.label)}" data-occupant-desc="${esc(characterScene?.desc||scene?.desc||"")}" data-occupant-room="${esc(room.name||roomKey)}">${avatar(character)}</button>`}).join("")}<em aria-hidden="true">${summary.symbol}</em>${speech}</span><span class="home-interaction-status"><b>${esc(names)}</b><small>${esc(summary.label)}</small></span></div>`;
}
function homeNativePill(label,attributes="",className=""){
  return `<button type="button" class="home-native-pill ${className}" ${attributes}><span>${esc(label)}</span></button>`;
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
  const nativeHome=Boolean(document.documentElement?.classList?.contains?.("native-app"));
  if(nativeHome){
    if(!selected)return `<section class="home-page home-native-page home-native-empty" style="${homeUiThemeStyle(active())}"><button type="button" class="home-native-back" data-tab="observe" aria-label="${esc(t("메인 화면으로 돌아가기","메인 화면으로 돌아가기"))}"><img src="${esc(homeUiAsset(active(),"back.png"))}" alt=""></button><section><b>${esc(t("아직 만든 집이 없어요.","아직 만든 집이 없어요."))}</b><p>${esc(t("‘집만 생성’을 눌러 캐릭터와 별개로 집부터 만들 수 있어요.","‘집만 생성’을 눌러 캐릭터와 별개로 집부터 만들 수 있어요."))}</p><button type="button" data-add-home>${esc(t("새 집 만들기","새 집 만들기"))}</button></section></section>`;
    return `<section class="home-page home-native-page"><div class="home-grid">${homeCard(selected,groups[selected]||[])}</div></section>`;
  }
  return `<section class="home-page"><div class="title"><div><h1>집과 생활 거점</h1><p>캐릭터 없이 집만 만들거나, 한 캐릭터에게 주거지·본가·별채·주말집을 여러 곳 연결할 수 있어요.</p></div><div class="home-top-actions"><button data-add-home>+ 집만 생성</button>${selected?`<button data-home-edit>${state.homeEditMode?"편집 완료":"집 편집"}</button>`:""}</div></div>${ids.length?`<div class="home-tabs">${ids.map(id=>{const h=state.homes[id]||{},members=groups[id]||[];return `<button data-home-select="${id}" class="${id===selected?"on":""}" style="--home-grad:${houseGradient(members)};${h.image?`--home-photo:url('${esc(h.image)}')`:""}">🏠 ${esc(h.name||"이름 없는 집")}<small>${esc(h.kind||"일반 주거")} · ${members.length?`${members.length}명 연결`:"빈집"}</small></button>`}).join("")}</div>`:"<section class='panel empty-mini'><b>아직 만든 집이 없어요.</b><p>‘집만 생성’을 눌러 캐릭터와 별개로 집부터 만들 수 있어요.</p></section>"}<div class="home-grid">${selected?homeCard(selected,groups[selected]||[]):""}</div></section>`;
}
function homeCard(id,chars){
  const h=state.homes[id]||{id,name:"이름 없는 집",rooms:{}};
  const nativeHome=Boolean(document.documentElement?.classList?.contains?.("native-app"));
  const currentScenes=new Map(state.order.map(characterId=>state.characters[characterId]).filter(Boolean).map(c=>[c.id,eventFor(c)]));
  const sceneFor=c=>currentScenes.get(c.id);
  const inside=state.order.map(characterId=>state.characters[characterId]).filter(c=>c&&sceneFor(c)?.home&&(sceneFor(c).visitHomeId||c.homeId)===id);
  const edit=state.homeEditMode;
  const lifeAgents=edit?{}:(h.lifeSimulation?.agents||{});
  const roomForCharacter=character=>h.rooms?.[lifeAgents[character.id]?.roomKey]?lifeAgents[character.id].roomKey:sceneFor(character)?.room;
  const roomKeys=Object.keys(h.rooms||{}).sort((a,b)=>(Number(h.rooms[a]?.order)||0)-(Number(h.rooms[b]?.order)||0));
  const floorCount=Math.max(1,Math.min(5,Number(h.floorCount)||1)),activeFloor=Math.max(1,Math.min(floorCount,Number(h.activeFloor)||1));
  const visibleRoomKeys=roomKeys.filter(key=>(Number(h.rooms[key]?.floor)||1)===activeFloor);
  const packedRooms=packedRoomLayout(visibleRoomKeys,h.rooms||{});
  const mobileRooms=mobileRoomLayout(visibleRoomKeys,h.rooms||{});
  const visualRoomLayout=key=>{
    const manual=h.rooms?.[key]?.layout;
    return manual&&typeof manual==="object"?manual:(mobileRooms[key]||{x:0,y:0,w:100,h:100});
  };
  const isCrossRoomWalker=character=>{
    const agent=lifeAgents[character.id];
    return agent?.phase==="walking"&&agent.fromRoomKey&&agent.fromRoomKey!==agent.roomKey&&visibleRoomKeys.includes(agent.fromRoomKey)&&visibleRoomKeys.includes(agent.roomKey);
  };
  const canvasAgentFor=agent=>{
    const target=visualRoomLayout(agent.roomKey),origin=visualRoomLayout(agent.fromRoomKey||agent.roomKey);
    const point=(layout,x,y)=>({x:Number(layout.x||0)+Number(layout.w||100)*Number(x||50)/100,y:Number(layout.y||0)+Number(layout.h||100)*Number(y||50)/100});
    const to=point(target,agent.x,agent.y),from=point(origin,agent.fromX,agent.fromY);
    return {...agent,x:to.x,y:to.y,fromX:from.x,fromY:from.y};
  };
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
    const preferredRoom=h.rooms?.[pet.room]?pet.room:"";
    const candidates=(preferred[pet.species]||roomKeys).filter(key=>h.rooms?.[key]);
    const seed=[...(pet.id+now.toDateString())].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
    // ‘주로 있는 방’은 화면을 다시 열어도 가장 먼저 적용되는 고정 거점이다.
    // 방 안의 위치와 행동은 계속 바뀌되, 임의 방 선택이 유저 설정을 덮지 않는다.
    const roomKey=preferredRoom||(candidates.length?candidates[(seed+slot)%candidates.length]:roomKeys[0]);
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
  const petMotionSeed=pet=>[...(String(pet.id||pet.name)+new Date().toDateString())].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
  const petPoint=(pet,step)=>{const seed=petMotionSeed(pet);return {x:18+((seed+step*37)%65),y:28+((seed*3+step*29)%54)}};
  const visibleAgentPoint=agent=>{
    if(!agent||agent.phase!=="walking"||!agent.arrivesAt||Date.now()>=agent.arrivesAt)return{x:Number(agent?.x)||50,y:Number(agent?.y)||55};
    const progress=Math.max(0,Math.min(1,(Date.now()-Number(agent.startedAt||Date.now()))/Math.max(1,Number(agent.arrivesAt)-Number(agent.startedAt||Date.now()))));
    return{x:Number(agent.fromX)+(Number(agent.x)-Number(agent.fromX))*progress,y:Number(agent.fromY)+(Number(agent.y)-Number(agent.fromY))*progress};
  };
  const petMotion=(pet,index)=>{
    const seed=petMotionSeed(pet);
    const sleeping=/자는 중|잠들|낮잠/.test(`${petScenes[pet.id]?.title||""} ${petScenes[pet.id]?.desc||""}`);
    const motionSlot=Math.floor(Date.now()/(12*60_000)),roomKey=petScenes[pet.id]?.roomKey;
    const occupied=[...Object.values(lifeAgents).filter(agent=>agent?.roomKey===roomKey).map(visibleAgentPoint),...pets.slice(0,index).filter(other=>petScenes[other.id]?.roomKey===roomKey).map(other=>petPoint(other,motionSlot))];
    let chosenSlot=motionSlot,current=petPoint(pet,chosenSlot),attempt=0;
    while(occupied.some(point=>Math.hypot(point.x-current.x,point.y-current.y)<20)&&attempt<7){attempt+=1;chosenSlot=motionSlot+attempt*3;current=petPoint(pet,chosenSlot)}
    const previous=petPoint(pet,chosenSlot-1);
    return {x:current.x,y:current.y,dx:sleeping?0:previous.x-current.x,dy:sleeping?0:previous.y-current.y,duration:sleeping?0:13+(seed%6),delay:-(index%4)*1.3,sleeping,motion:["sniff","look","stretch","pounce"][(seed+motionSlot)%4]};
  };
  const roomHtml=visibleRoomKeys.map(key=>{
    const room=h.rooms?.[key]||{},roomPeople=inside.filter(c=>roomForCharacter(c)===key);
    const normalizedFloor=normalizeHomeSurface(room.floorMaterial,room.type,{allowCustom:true,customImage:room.floorImage});
    const customFloor=normalizedFloor==="custom";
    const customTile=normalizedFloor==="customTile";
    const roomPets=pets.filter(p=>petScenes[p.id]?.roomKey===key);
    const shownPeople=roomPeople.filter(character=>!isCrossRoomWalker(character)),shownPets=roomPets;
    const editAttributes=`data-home-id="${id}" data-room-key="${key}" data-home-room-hold="${key}"${edit?` data-open-room-editor="${key}" tabindex="0" role="button" aria-label="${esc(room.name||key)} 편집"`:""}`;
    const roomLayout=packedRooms.items[key]||{},peopleDirection=Number(roomLayout.w)>Number(roomLayout.h)?"is-horizontal":"is-vertical";
    const renderedPeople=new Set(),peopleMarkup=[],foregroundMarkup=[],coupleBedSlots=new Map(),coupleBedUsers=new Map(),activeCoupleBedGroups=new Map(),coupleBedPlacements=new Map(),bedStates=new Map();
    shownPeople.forEach(character=>{
      const agent=lifeAgents[character.id],bed=agent?.furnitureId?(room.furniturePlacements||[]).find(item=>item.id===agent.furnitureId):null;
      if(bed?.item!=="커플 침대")return;
      const users=coupleBedUsers.get(bed.id)||[];users.push(character);coupleBedUsers.set(bed.id,users);
    });
    coupleBedUsers.forEach((users,bedId)=>{
      const bed=(room.furniturePlacements||[]).find(item=>item.id===bedId),assigned=bed?.assignedCharacterIds||[];
      const placementWeights={"always-left":-20,"prefer-left":-10,random:0,"prefer-right":10,"always-right":20};
      users.sort((a,b)=>{
        const leftPlacement=characterPlacement(a,state.relationships),rightPlacement=characterPlacement(b,state.relationships),placementDifference=placementWeights[leftPlacement]-placementWeights[rightPlacement];
        if(placementDifference)return placementDifference;
        const sceneSeed=`${bedId}:${sceneFor(a)?.minute||""}:${sceneFor(b)?.minute||""}`;
        if(leftPlacement===rightPlacement)return nativeVisualSeed(`${sceneSeed}:${a.id}`)-nativeVisualSeed(`${sceneSeed}:${b.id}`);
        const ai=assigned.indexOf(a.id),bi=assigned.indexOf(b.id);return (ai<0?99:ai)-(bi<0?99:bi)||String(a.id).localeCompare(String(b.id));
      });
      users.slice(0,2).forEach((character,slot)=>coupleBedSlots.set(character.id,slot));
      users.forEach(character=>coupleBedPlacements.set(character.id,bed));
      const activeUsers=users.filter(character=>lifeAgents[character.id]?.phase==="using");
      // 침대에서 하는 모든 생활 활동은 잠잘 때와 같은 레이어를 쓴다.
      // 인물은 침대 바닥 위에, 이불과 하단 프레임 아래에 놓인다.
      if(activeUsers.length)bedStates.set(bedId,"under-cover");
      if(activeUsers.length>1)activeCoupleBedGroups.set(bedId,activeUsers.slice(0,2));
    });
    const tvGroups=new Map();
    shownPeople.forEach(character=>{
      const agent=lifeAgents[character.id];
      if(agent?.phase!=="using"||agent?.actionKind!=="watch")return;
      const key=agent.furnitureId||`${agent.roomKey}:watch`,members=tvGroups.get(key)||[];members.push(character);tvGroups.set(key,members);
    });
    shownPeople.forEach((character,index)=>{
      if(renderedPeople.has(character.id))return;
      const agent=lifeAgents[character.id],bedPair=(activeCoupleBedGroups.get(agent?.furnitureId)||[]).filter(other=>!renderedPeople.has(other.id));
      // 같은 커플 침대를 동시에 쓰는 두 사람은 장면 로그의 interactionId가
      // 서로 달라도 하나의 침대 활동이다. 여기에서 먼저 묶어야 개별 상태 카드가
      // 두 장 생기거나 한 사람만 과도하게 커지는 중간 렌더가 남지 않는다.
      if(bedPair.length>1){
        const pair=bedPair.slice(0,2),sharedBed=coupleBedPlacements.get(pair[0].id);
        pair.forEach((person,slot)=>{
          renderedPeople.add(person.id);
          peopleMarkup.push(homeLifePersonMarkup(person,sceneFor(person),lifeAgents[person.id]||{},room,key,index+slot,coupleBedSlots.get(person.id)??slot,{conversing:true,slot:slot+1,bedPlacement:sharedBed,bedState:"under-cover",bedConversation:true,hideStatus:true}));
        });
        foregroundMarkup.push(homeBedForegroundStatusMarkup(pair,pair.map(sceneFor),room,key,sharedBed,index,{shared:true}));
        return;
      }
      const tvPartners=agent?.actionKind==="watch"?(tvGroups.get(agent.furnitureId||`${agent.roomKey}:watch`)||[]):[];
      const pendingTvPartners=tvPartners.filter(other=>!renderedPeople.has(other.id));
      if(pendingTvPartners.length>1){
        const tvPair=pendingTvPartners.slice(0,2);
        tvPair.forEach(other=>renderedPeople.add(other.id));
        peopleMarkup.push(homeTvInteractionMarkup(tvPair,tvPair.map(sceneFor),lifeAgents,room,key,index));
        return;
      }
      const scene=sceneFor(character),interactionId=scene?.groupInteraction&&scene?.interactionId?scene.interactionId:"";
      const partners=interactionId?shownPeople.filter(other=>sceneFor(other)?.interactionId===interactionId):[];
      if(partners.length>1){
        partners.forEach(other=>renderedPeople.add(other.id));
        const summary=homeInteractionSummary(scene);
        if(summary.kind==="talk"){
          const orderedPartners=homeOrderedCharacters(partners,partners.map(sceneFor)),pair=orderedPartners.slice(0,2);
          const pairBeds=pair.map(person=>coupleBedPlacements.get(person.id));
          const sharedBed=pair.length===2&&pairBeds[0]&&pairBeds.every(bed=>bed?.id===pairBeds[0].id)&&pair.every(person=>lifeAgents[person.id]?.phase==="using");
          if(sharedBed)bedStates.set(sharedBed.id,"under-cover");
          pair.forEach((person,slot)=>{
            const paired=lifeAgents[person.id]||{};
            const personBed=coupleBedPlacements.get(person.id);
            peopleMarkup.push(homeLifePersonMarkup(person,sceneFor(person),paired,room,key,index+slot,coupleBedSlots.get(person.id)??-1,{conversing:true,slot:slot+1,bedPlacement:personBed,bedState:sharedBed?"under-cover":personBed?bedStates.get(personBed.id):"",bedConversation:Boolean(sharedBed),hideStatus:Boolean(sharedBed)}));
          });
          if(sharedBed)foregroundMarkup.push(homeBedForegroundStatusMarkup(pair,pair.map(sceneFor),room,key,sharedBed,index,{shared:true}));
        }else peopleMarkup.push(homeLifeInteractionMarkup(partners,partners.map(sceneFor),lifeAgents,room,key,index));
        return;
      }
      renderedPeople.add(character.id);
      const characterBed=coupleBedPlacements.get(character.id);
      const characterAgent=lifeAgents[character.id],activeBed=characterBed&&characterAgent?.phase==="using"?characterBed:null;
      const sleepingInBed=activeBed&&nativeScenePresentation(character,scene,"sd").actionKind==="sleep";
      peopleMarkup.push(homeLifePersonMarkup(character,scene,characterAgent,room,key,index,coupleBedSlots.get(character.id)??-1,{bedPlacement:characterBed,bedState:characterBed?bedStates.get(characterBed.id):"",hideStatus:Boolean(activeBed&&!sleepingInBed)}));
      if(activeBed&&!sleepingInBed)foregroundMarkup.push(homeBedForegroundStatusMarkup([character],[scene],room,key,activeBed,index));
    });
    const hasOccupants=shownPeople.length>0||shownPets.length>0;
    return `<div class="room room-${esc(room.type||key)} ${customFloor?"room-custom-floor":""} ${customTile?"room-custom-tile":""} ${hasOccupants?"room-has-occupants":""} ${edit?"room-edit-target":""}" ${roomStyle(h,key,packedRooms.items[key],mobileRooms[key])} ${editAttributes}>
      <span class="room-wall-shell" aria-hidden="true"></span>
      <div class="room-heading room-title-${room.titleTone==="dark"?"dark":"light"}"><span><b>${esc(room.name||key)}</b>${edit?`<small class="room-edit-hint">${activeFloor}층 · ${t("gridEdit","격자 편집")}</small>`:""}</span>${edit?`<button type="button" class="room-drag-handle" data-room-drag="${key}" data-home-id="${id}" aria-label="${esc(room.name||key)} 위치 옮기기">✥</button>`:""}</div>${edit?`<button type="button" class="room-resize-handle" data-room-resize="${key}" data-home-id="${id}" aria-label="${esc(room.name||key)} 크기 조절">↘</button>`:""}
      ${roomFurnitureMarkup(id,key,room,edit,bedStates)}
      <div class="room-people ${shownPeople.some(c=>lifeAgents[c.id])?"has-home-life":""} ${peopleDirection}">${peopleMarkup.join("")}</div>
      ${edit?"":roomFurnitureOverlayMarkup(room,bedStates)}
      ${edit||!foregroundMarkup.length?"":`<div class="room-foreground-layer">${foregroundMarkup.join("")}</div>`}
      <div class="room-pets">${shownPets.map((p,petIndex)=>{const motion=petMotion(p,petIndex);return `<div class="room-pet home-pet-roaming pet-motion-${motion.motion} ${motion.sleeping?"is-sleeping":""}" style="--pet-x:${motion.x}%;--pet-y:${motion.y}%;--pet-dx:${motion.dx}cqw;--pet-dy:${motion.dy}cqh;--pet-roam-duration:${motion.duration}s;--pet-roam-delay:${motion.delay}s" role="button" tabindex="0" aria-label="${esc(`${p.name} · ${petScenes[p.id].title}`)}" data-home-occupant="pet" data-pet-id="${p.id}" data-pet-species="${esc(p.species)}" data-occupant-name="${esc(p.name)}" data-occupant-title="${esc(petScenes[p.id].title)}" data-occupant-desc="${esc(petScenes[p.id].desc)}" data-occupant-room="${esc(room.name||key)}" title="${esc(petScenes[p.id].desc)}">${p.icon?`<img class="room-pet-icon" src="${esc(p.icon)}" alt="">`:p.photo?`<img class="room-pet-photo" src="${esc(p.photo)}" alt="">`:`<span class="room-pet-emoji">${petEmoji[p.species]||"🐾"}</span>`}<span class="room-pet-status"><b>${esc(p.name)}</b><small>${esc(petScenes[p.id].title.replace(`${h.rooms?.[key]?.name||"집 안"}에서 `,""))}</small></span></div>`}).join("")}</div>
    </div>`;
  }).join("");
  const canvasWalkers=inside.filter(isCrossRoomWalker).map((character,index)=>{
    const agent=canvasAgentFor(lifeAgents[character.id]),room=h.rooms?.[agent.roomKey]||{};
    return homeLifePersonMarkup(character,sceneFor(character),agent,room,agent.roomKey,index,-1,{canvasWalker:true});
  }).join("");
  const dayLabels=["일","월","화","수","목","금","토"];
  const residentEditor=`<section class="resident-editor home-feature-panel home-edit-feature-panel" data-home-feature="residents"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><div><h3>이 집을 사용하는 캐릭터</h3><small>연결을 해제해도 캐릭터나 집은 삭제되지 않습니다. 별채·본가도 주거지와 동시에 둘 수 있어요.</small></div></div><div>${state.order.map(cid=>{
    const c=state.characters[cid],residence=(c.residences||[]).find(item=>item.homeId===id),on=Boolean(residence);
    return `<article class="resident-setting ${on?"on":""}" data-resident-editor-id="${cid}"><button data-home-resident="${cid}" data-home-id="${id}" class="${on?"on":""}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${on?"이 집 연결됨":"연결하지 않음"}</small></span></button>${on?`<div class="residence-fields"><label>이 캐릭터에게 어떤 집인가요?<select data-residence-field="role" data-character-id="${cid}" data-home-id="${id}">${["주거지","본가","별채","주말집","업무용 숙소","연인의 집","친척집","기타"].map(value=>`<option ${value===residence.role?"selected":""}>${value}</option>`).join("")}</select></label><label>머무는 때<select data-residence-field="stayPattern" data-character-id="${cid}" data-home-id="${id}">${["상시 거주","평일 중심","주말 중심","요일 지정","명절·기념일","필요할 때 방문"].map(value=>`<option ${value===residence.stayPattern?"selected":""}>${value}</option>`).join("")}</select></label><label>자는 방<select data-residence-field="sleepRoomId" data-character-id="${cid}" data-home-id="${id}"><option value="__none__" ${residence.sleepRoomId==="__none__"?"selected":""}>${t("noSleepingRoom","기타 · 없음 (숙박하지 않음)")}</option>${roomKeys.map(key=>`<option value="${key}" ${key===residence.sleepRoomId?"selected":""}>${esc(h.rooms[key]?.name||key)}</option>`).join("")}</select></label><label>방문 목적·설명<input data-residence-field="notes" data-character-id="${cid}" data-home-id="${id}" maxlength="200" value="${esc(residence.notes||"")}" placeholder="예: 명절에 가족과 머무는 본가"></label><label>명절·기념일 날짜<input data-residence-field="visitDates" data-character-id="${cid}" data-home-id="${id}" inputmode="numeric" value="${esc(String(residence.visitDates||"").replace(/(\d{2})-(\d{2})/g,"$1$2"))}" placeholder="예: 0101, 0815"></label><fieldset><legend>방문 요일</legend><div class="residence-days">${dayLabels.map((label,day)=>`<button type="button" data-residence-day="${day}" data-character-id="${cid}" data-home-id="${id}" class="${(residence.visitDays||[]).includes(day)?"on":""}">${label}</button>`).join("")}</div></fieldset><button type="button" data-residence-primary="${cid}" data-home-id="${id}" class="${residence.isPrimary?"on":""}">${residence.isPrimary?"✓ 기준 주거지":"기준 주거지로 지정"}</button></div>`:""}</article>`;
  }).join("")}</div><small>‘명절·기념일’은 위 날짜가 맞는 날, ‘요일 지정’은 고른 요일에 이 집의 장면을 사용해요. ‘필요할 때 방문’은 임의 이동을 만들지 않습니다.</small></section>`;
  const sleepEditor=edit?`<section class="sleep-room-editor home-feature-panel home-edit-feature-panel" data-home-feature="room-plan"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><h3>방 구성</h3><button data-add-room>+ 방 추가</button></div><small>새 방을 만든 뒤 방 자체를 누르면 이름·종류·크기·사진을 편집할 수 있어요. 가구는 위의 ‘가구 배치’에서 따로 관리하고, 자는 방은 캐릭터 연결 설정에서 정해요.</small></section>`:"";
  const petKinds=["아기","강아지","고양이","새","거북이","호랑이","식물","드래곤","인공지능","기타"];
  const petCards=pets.map(p=>`<article class="pet-card" data-pet-editor-id="${p.id}">
    <div class="pet-avatar">${p.icon?`<img class="pet-icon-art" src="${esc(p.icon)}" alt="">`:p.photo?`<img class="pet-photo-art" src="${esc(p.photo)}" alt="">`:`<span>${petEmoji[p.species]||"🐾"}</span>`}</div>
    <div class="pet-info"><b>${esc(p.name)}</b><small>${esc(petSpeciesName(p))}${p.breed?` · ${esc(p.breed)}`:""}</small><strong>${esc(petScenes[p.id].title)}</strong><p>${esc(petScenes[p.id].desc)}</p></div>
    <details class="pet-edit"><summary>반려생물 편집하기</summary><div class="pet-edit-fields"><label>이름<input data-pet-field="name" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.name)}"></label><label>종류<select data-pet-field="species" data-home-id="${id}" data-pet-id="${p.id}">${petKinds.map(x=>`<option ${x===p.species?"selected":""}>${x}</option>`).join("")}</select></label>${p.species==="기타"?`<label>종류 이름<input data-pet-field="customSpecies" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.customSpecies||"")}" placeholder="예: 전기쥐, 슬라임, 작은 괴수"></label><label>크기<select data-pet-field="size" data-home-id="${id}" data-pet-id="${p.id}">${["소형","중형","대형"].map(x=>`<option ${x===(p.size||"중형")?"selected":""}>${x}</option>`).join("")}</select></label><fieldset><legend>성향 · 여러 개 선택</legend><div class="chips">${["온순함","활발함","사고뭉치","진중함","호기심 많음","겁이 많음","사람을 잘 따름","독립적"].map(x=>`<button type="button" data-pet-trait-field="temperaments" data-home-id="${id}" data-pet-id="${p.id}" data-value="${x}" class="${(p.temperaments||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div></fieldset><fieldset><legend>확실히 알고 있는 신체 특징만 선택</legend><div class="chips">${["털","비늘","깃털","날개","지느러미","뿔","꼬리","발광","독성"].map(x=>`<button type="button" data-pet-trait-field="bodyTraits" data-home-id="${id}" data-pet-id="${p.id}" data-value="${x}" class="${(p.bodyTraits||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><small>선택하지 않은 생김새나 능력은 행동에서 지어내지 않아요.</small></fieldset>`:""}<label>품종<input data-pet-field="breed" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.breed)}" placeholder="유저가 직접 입력"></label><label>주로 있는 방<select data-pet-field="room" data-home-id="${id}" data-pet-id="${p.id}">${roomKeys.map(key=>`<option value="${key}" ${key===(p.room||"living")?"selected":""}>${esc(h.rooms[key]?.name||key)}</option>`).join("")}</select></label><label>성별<select data-pet-field="sex" data-home-id="${id}" data-pet-id="${p.id}">${["모름","수컷","암컷"].map(x=>`<option ${x===p.sex?"selected":""}>${x}</option>`).join("")}</select></label><label class="check"><input type="checkbox" data-pet-field="neutered" data-home-id="${id}" data-pet-id="${p.id}" ${p.neutered?"checked":""}> 중성화 완료</label><label class="check"><input type="checkbox" data-pet-field="needsWalk" data-home-id="${id}" data-pet-id="${p.id}" ${p.needsWalk?"checked":""}> 함께 산책이 필요함</label><label class="check"><input type="checkbox" data-pet-field="rideable" data-home-id="${id}" data-pet-id="${p.id}" ${p.rideable?"checked":""}> 등에 타고 이동할 수 있음</label><div class="pet-actions"><button data-pet-image="photo" data-home-id="${id}" data-pet-id="${p.id}">원형 사진</button><button data-image-url="petPhoto" data-id="${id}" data-room="${p.id}">사진 링크</button><button data-pet-image="icon" data-home-id="${id}" data-pet-id="${p.id}">투명 아이콘</button><button data-image-url="petIcon" data-id="${id}" data-room="${p.id}">아이콘 링크</button><button class="danger" data-delete-pet="${p.id}" data-home-id="${id}">삭제</button></div></div></details>
  </article>`).join("");
  const cars=(h.cars||[]).map(car=>`<button type="button" class="car-card" data-open-car-editor="${car.id}" data-home-id="${id}">${car.image?`<img class="car-photo" src="${esc(car.image)}" alt="">`:`<span class="car-icon">🚙</span>`}<span><b>${esc(car.name)}</b><small>${esc(car.type)}${car.color?` · ${esc(car.color)}`:""} · ${car.seats||5}인승</small><em>눌러서 편집</em></span></button>`).join("");
  const humanResidentScenes=chars.map(c=>{
    const e=eventFor(c),place=placeForEntry(e),image=sceneImage(c,e),sceneHome=state.homes[e.visitHomeId||c.homeId];
    const location=e.home?`🏠 ${sceneHome?.name||"집"} · ${sceneHome?.rooms?.[e.room]?.name||"집 안"}`:e.transit?"🚌 이동 중":place?`📍 ${place.name} · ${townForEntry(e).name}`:"📍 외출 중";
    return `<article class="resident-scene-card" style="--resident-theme:${esc(c.theme?.primary||"#176b60")}">
      <div class="resident-profile"><span class="resident-profile-picture">${profileAvatar(c,"resident-character-image")}</span><span><h3>${esc(c.name)}</h3><small>${esc(c.jobTitle||c.job)}</small></span></div>
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
  const homeSettings=`<section class="home-settings-panel home-feature-panel home-edit-feature-panel" data-home-feature="house-settings"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button>
    <div class="home-identity-editor"><label class="home-name-setting">집 이름<input data-home-name data-home-id="${id}" maxlength="80" value="${esc(h.name)}" placeholder="집 이름을 입력하세요"></label><label>집의 용도<select data-home-field="kind" data-home-id="${id}">${["일반 주거","본가","별채","주말집","업무용 숙소","공동 주거","기숙사","사택","기타"].map(value=>`<option ${value===(h.kind||"일반 주거")?"selected":""}>${value}</option>`).join("")}</select></label><label>건물 층수<select data-home-floor-count data-home-id="${id}">${[1,2,3,4,5].map(value=>`<option value="${value}" ${value===floorCount?"selected":""}>${value}층</option>`).join("")}</select><small>층을 줄이면 위층 방은 남아 있는 가장 높은 층으로 이동해요.</small></label><label>거주 방식<select data-home-field="ownershipType" data-home-id="${id}">${["설정하지 않음","자가","전세","월세","기숙사","사택","무상 거주","임시 거주","기타"].map(value=>`<option ${value===(h.ownershipType||"설정하지 않음")?"selected":""}>${value}</option>`).join("")}</select></label><label>소유자 종류<select data-home-field="ownerKind" data-home-id="${id}">${["설정하지 않음","캐릭터","기타 인물","단체","공동 소유","기타"].map(value=>`<option ${value===(h.ownerKind||"설정하지 않음")?"selected":""}>${value}</option>`).join("")}</select></label><label>소유 캐릭터<select data-home-field="ownerCharacterId" data-home-id="${id}"><option value="">선택하지 않음</option>${state.order.map(characterId=>`<option value="${characterId}" ${characterId===h.ownerCharacterId?"selected":""}>${esc(state.characters[characterId]?.name||"")}</option>`).join("")}</select></label><label>기타 소유자·단체 이름<input data-home-field="ownerName" data-home-id="${id}" maxlength="120" value="${esc(h.ownerName||"")}" placeholder="예: 해바라기 재단, 이모, 학교 기숙사"></label><label class="home-notes-field">집 안 생활 메모<input data-home-field="notes" data-home-id="${id}" maxlength="300" value="${esc(h.notes||"")}" placeholder="예: 주말에 가족이 모이는 집"></label><p class="home-setting-town-note">${t("외관·마을 위치·건물 평판은 마을의 건물 정보에서 설정해요.","외관·마을 위치·건물 평판은 마을의 건물 정보에서 설정해요.")}</p><button type="button" class="danger" data-delete-home="${id}">이 집 삭제</button></div>
  </section>`;
  const homeCopy=homeEditorCopy(state.uiLanguage);
  const homeTown=state.towns?.find(town=>town.id===h.townId),homeGroupsById=homeGroups();
  const hudCharacter=chars.find(character=>character.id===state.activeId)||chars[0]||active();
  const nativeHud=nativeHome?`<div class="home-native-hud" data-home-native-hud style="${homeUiThemeStyle(hudCharacter)};--home-own:${esc(hudCharacter?.theme?.primary||"#176b60")}">
    <div class="home-native-header" aria-label="${esc(h.name)}"><button type="button" class="home-native-back" data-tab="observe" aria-label="${esc(t("메인 화면으로 돌아가기","메인 화면으로 돌아가기"))}"><img src="${esc(homeUiAsset(hudCharacter,"back.png"))}" alt=""></button><div class="home-native-meta"><small class="home-native-context">${esc(t(h.kind||"일반 주거",h.kind||"일반 주거"))} · ${esc(homeFloorLabel(activeFloor))}</small><button type="button" class="home-native-house-name" data-home-switcher-toggle aria-expanded="false" aria-label="${esc(`${h.name||t("이름 없는 집","이름 없는 집")} · ${t("집 이동","집 이동")}`)}"><img src="${esc(homeExteriorSource(h))}" alt=""><span>${esc(h.name||t("이름 없는 집","이름 없는 집"))}</span></button></div></div>
    <div class="home-native-switcher" data-home-switcher hidden><b>${esc(t("집 이동","집 이동"))}</b>${Object.keys(state.homes||{}).map(homeId=>{const item=state.homes[homeId]||{},members=homeGroupsById[homeId]||[];return `<div class="home-native-switcher-row"><button type="button" data-home-select="${esc(homeId)}" class="${homeId===id?"on":""}"><span>🏠</span><b>${esc(item.name||t("이름 없는 집","이름 없는 집"))}</b><small>${esc(item.kind||t("일반 주거","일반 주거"))} · ${members.length?members.length:t("빈집","빈집")}</small></button>${members.length?"":`<button type="button" class="home-native-empty-delete danger" data-delete-home="${esc(homeId)}" title="${esc(t("빈집을 바로 삭제할 수 있어요.","빈집을 바로 삭제할 수 있어요."))}">${esc(t("빈집 삭제","빈집 삭제"))}</button>`}</div>`}).join("")}<button type="button" class="home-native-add-home" data-add-home>＋ ${esc(t("새 집 만들기","새 집 만들기"))}</button></div>
    <nav class="home-native-side" aria-label="${esc(t("집 메뉴","집 메뉴"))}">${homeNativePill(t("집 정보","집 정보"),'data-open-home-feature="house-info"',"home-native-info-link")}${homeNativePill(homeCopy.rooms,'data-open-home-feature="room-info"')}${homeNativePill(homeCopy.members,'data-open-home-feature="members"',"home-native-residents")}${homeNativePill(t(edit?"편집 완료":"편집모드",edit?"편집 완료":"편집모드"),"data-home-edit",`home-native-edit ${edit?"on":""}`)}</nav>
    ${floorCount>1?`<nav class="home-native-elevator" aria-label="${esc(homeFloorLabel(activeFloor))}"><button type="button" data-home-floor-step="1" data-home-id="${esc(id)}" aria-label="${esc(t("floorUp","위층으로 이동"))}" ${activeFloor>=floorCount?"disabled":""}>▲</button><b>${esc(homeFloorLabel(activeFloor))}</b><button type="button" data-home-floor-step="-1" data-home-id="${esc(id)}" aria-label="${esc(t("floorDown","아래층으로 이동"))}" ${activeFloor<=1?"disabled":""}>▼</button></nav>`:""}
    ${homeNativePill(t("UI 숨김","UI 숨김"),'data-home-ui-toggle aria-pressed="false"',"home-native-ui-toggle")}<nav class="home-native-bottom">${homeNativePill(homeCopy.logs,'data-open-home-feature="house-log"')}${homeNativePill(homeCopy.summary,'data-open-home-feature="scenes"')}</nav>
  </div>`:"";
  const tabletHomeInfo=nativeHome?`<aside class="home-native-tablet-info" aria-label="${esc(t("집 정보","집 정보"))}"><div class="home-native-tablet-photo">${h.image||h.exteriorImage?`<img src="${esc(h.image||h.exteriorImage)}" alt="">`:`<img src="${esc(homeExteriorSource(h))}" alt="">`}</div><dl><div><dt>${t("집 유형","집 유형")}</dt><dd>${esc(t(h.kind||"일반 주거",h.kind||"일반 주거"))}</dd></div><div><dt>${t("세부 유형","세부 유형")}</dt><dd>${esc(t(h.buildingSubtype||"단독주택",h.buildingSubtype||"단독주택"))}</dd></div><div><dt>${t("마을","마을")}</dt><dd>${esc(homeTown?.name||t("마을 미지정","마을 미지정"))}</dd></div><div><dt>${t("층","층")}</dt><dd>${floorCount}</dd></div><div><dt>${t("방 수","방 수")}</dt><dd>${roomKeys.length}</dd></div><div><dt>${t("구성원","구성원")}</dt><dd>${chars.length}</dd></div><div><dt>${t("현재 집 안","현재 집 안")}</dt><dd>${inside.length}</dd></div><div><dt>${t("청결도","청결도")}</dt><dd>${Math.round(h.cleanliness??100)}%</dd></div></dl></aside>`:"";
  const homeInfo=homeInformationMarkup(h,homeExteriorSource(h),state,t);
  const editToolbar=edit?(nativeHome?`<nav class="home-edit-toolbar home-native-edit-tools" style="${homeUiThemeStyle(hudCharacter)}" aria-label="집 편집 도구">${homeNativePill(t("집 설정","집 설정"),'data-open-home-feature="house-settings"')}${homeNativePill(t("방 구성","방 구성"),'data-open-home-feature="room-plan"')}${homeNativePill(t("가구 배치","가구 배치"),`data-open-furniture-layout="${esc(id)}"`)}${homeNativePill(t("거주 설정","거주 설정"),'data-open-home-feature="residents"')}</nav>`:`<nav class="home-edit-toolbar" aria-label="집 편집 도구"><button type="button" data-open-home-feature="house-settings">집 설정</button><button type="button" data-open-home-feature="room-plan">방 추가·구성</button><button type="button" data-open-furniture-layout="${esc(id)}">가구 배치</button><button type="button" data-open-home-feature="residents">구성원</button><button type="button" class="primary" data-home-edit>완료</button></nav>`):"";
  const propToolbarLabel=state.uiLanguage==="en"?"Props +":state.uiLanguage==="ja"?"小物＋":"소품 +";
  const furnitureToolbar=edit?`<nav class="furniture-edit-toolbar" data-furniture-edit-toolbar hidden aria-label="${homeCopy.editFurniture}"><div class="furniture-edit-heading"><strong data-furniture-edit-name>${homeCopy.furniture}</strong><select data-furniture-move-room aria-label="${homeCopy.moveRoom}" title="${homeCopy.moveRoom}">${Object.entries(h.rooms||{}).map(([key,room])=>`<option value="${esc(key)}">${esc(room.name||key)} · ${homeCopy.floor(Number(room.floor)||1)}</option>`).join("")}</select></div><div class="furniture-edit-actions"><button type="button" data-furniture-command="smaller" aria-label="${homeCopy.smaller}">−</button><button type="button" data-furniture-command="larger" aria-label="${homeCopy.larger}">＋</button><button type="button" data-furniture-command="rotate" aria-label="${homeCopy.direction}">↻ <span data-furniture-facing-label>${homeCopy.front}</span></button><button type="button" data-furniture-command="flip">${homeCopy.flip}</button><button type="button" data-furniture-command="assign">${homeCopy.assign}</button><button type="button" data-furniture-command="back" aria-label="${homeCopy.backward}">↓</button><button type="button" data-furniture-command="front" aria-label="${homeCopy.forward}">↑</button><button type="button" data-furniture-command="props">${propToolbarLabel}</button><button type="button" class="danger" data-furniture-command="delete">${homeCopy.remove}</button><button type="button" class="primary" data-furniture-command="done">${homeCopy.done}</button></div></nav>`:"";
  return `<article class="home panel ${edit?"is-editing":""}" data-home-card="${id}">
    ${nativeHud}${tabletHomeInfo}
    <div class="title"><div>${edit?`<input class="home-name" data-home-name data-home-id="${id}" value="${esc(h.name)}">`:`<h2>🏠 ${esc(h.name)}</h2>`}<small>${chars.length?`${chars.map(c=>c.name).join(" · ")} 연결됨`:"아직 연결된 캐릭터가 없는 집"}</small></div><b>${inside.length}명 머무는 중</b></div>
    ${nativeHome?"":editToolbar}${homeSettings}${residentEditor}${sleepEditor}${homeRoomBrowser(h,state.uiLanguage,value=>t(value,value))}${homeMemberMenu(h,chars,state.uiLanguage)}<div class="clean">청결도 · ${Math.round(h.cleanliness??100)}% <i style="width:${h.cleanliness??100}%"></i></div>
    ${!nativeHome&&floorCount>1?`<nav class="home-floor-tabs" aria-label="집 층 선택">${Array.from({length:floorCount},(_,index)=>index+1).map(floor=>`<button type="button" data-home-floor="${floor}" data-home-id="${id}" class="${floor===activeFloor?"on":""}">${floor}층 <small>${roomKeys.filter(key=>(Number(h.rooms[key]?.floor)||1)===floor).length}개 방</small></button>`).join("")}</nav>`:""}
    <div class="rooms ${visibleRoomKeys.length>6?"has-extra":""}" data-room-canvas data-home-id="${id}" data-room-floor="${activeFloor}" data-room-grid-cols="12" data-room-grid-rows="16" style="--room-count:${visibleRoomKeys.length};--room-cols:4;--room-rows:${packedRooms.rows}">${roomHtml||`<button type="button" class="empty-floor-room" data-add-room>+ ${activeFloor}층에 방 추가</button>`}${canvasWalkers?`<div class="home-life-roaming-layer" aria-label="방 사이를 이동하는 캐릭터">${canvasWalkers}</div>`:""}</div>${edit?homeFurnitureDrawer(h,state.uiLanguage):""}${furnitureToolbar}
    ${homeInfo}<section class="pets home-feature-panel" data-home-feature="pets"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><h2>반려생물</h2><button data-add-pet>+ 반려생물 추가</button></div><div class="pet-grid">${petCards||"<p>아직 등록된 반려생물이 없어요.</p>"}</div></section>
    <section class="cars home-feature-panel" data-home-feature="cars"><button type="button" class="home-feature-close" data-close-home-feature aria-label="닫기">×</button><div class="title"><h2>자동차</h2><button data-add-car>+ 자동차 추가</button></div><div class="car-grid">${cars||"<p>등록된 자동차가 없어요.</p>"}</div><small>운전면허가 있는 구성원만 운전하며, 음주한 날에는 자동차를 이용하지 않아요.</small></section>
    <section class="resident-scenes home-feature-panel home-design-page home-journal-page" data-home-feature="scenes"><header class="home-design-head"><button type="button" class="home-design-back" data-close-home-feature aria-label="${homeCopy.back}"></button><h2>${homeCopy.summary}</h2></header><div class="home-journal-content">${residentScenes}</div></section>
    <div class="home-feature-panel home-design-page home-journal-page" data-home-feature="house-log"><header class="home-design-head"><button type="button" class="home-design-back" data-close-home-feature aria-label="${homeCopy.back}"></button><h2>${homeCopy.logs}</h2></header><div class="home-journal-content" data-lazy-home-log="${esc(id)}"></div></div>
    ${nativeHome?"":`<nav class="home-feature-menu" aria-label="집 세부 메뉴"><button type="button" data-open-home-feature="pets">반려생물</button><button type="button" data-open-home-feature="cars">자동차</button><button type="button" data-open-home-feature="scenes">구성원</button><button type="button" data-open-home-feature="house-log">로그</button></nav>`}
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
Object.assign(I18N.en,{
  "인지·감각·상호작용 특성":"Cognitive, sensory & interaction traits",
  "생활 장면에 반영할 특성":"Traits used in life scenes",
  "성향·정서·표현":"Personality · Emotions · Expression"
});
Object.assign(I18N.ja,{
  "인지·감각·상호작용 특성":"認知・感覚・関わり方の特性",
  "생활 장면에 반영할 특성":"生活場面に反映する特性",
  "성향·정서·표현":"性格・感情・表現"
});
const TRAIT_EXPRESSIONS=["주의가 쉽게 전환됨","관심 대상에 과집중함","생각이 떠오르면 바로 시작함","감각 자극에 민감함","익숙한 순서가 바뀌면 힘듦","사회적 신호를 해석하는 데 시간이 필요함","기억이 비는 때가 있음","자아마다 말투·선호가 다름","타인의 감정을 직관보다 관찰과 추론으로 파악함","죄책감이나 공감이 낮게 표현됨","감정이 급격히 치솟는 때가 있음","격해지면 먼저 거리를 두고 진정함"];
function cognitiveAccessDialog(c){
  const expressions=new Set(c.traitExpressions||[]),count=expressions.size;
  const countText=state.uiLanguage==="en"?`${count} selected`:state.uiLanguage==="ja"?`${count}個選択`:`${count}개 선택됨`;
  return `<section class="body-cognitive-entry"><button type="button" data-open-cognitive-traits><span><b>${t("인지·감각·상호작용 특성","인지·감각·상호작용 특성")}</b><small data-cognitive-trait-summary>${countText}</small></span><i aria-hidden="true">＋</i></button></section>
  <dialog class="character-body-choice-dialog cognitive-access-dialog" data-cognitive-traits-dialog><form method="dialog">
    <header><span><small>COGNITION · SENSORY · ACCESS</small><b>${t("인지·감각·상호작용 특성","인지·감각·상호작용 특성")}</b></span><button type="submit" value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header>
    <section class="character-body-choice-panel cognitive-access-options" aria-label="${esc(t("생활 장면에 반영할 특성","생활 장면에 반영할 특성"))}">${TRAIT_EXPRESSIONS.map(value=>`<button type="button" data-trait-expression="${esc(value)}" class="${expressions.has(value)?"on":""}" aria-pressed="${expressions.has(value)}"><span>${esc(t(value,value))}</span><i aria-hidden="true">✓</i></button>`).join("")}</section>
    <footer><span><b data-trait-expression-count>${count}</b>/8</span><button type="submit" value="apply">${t("선택 완료","선택 완료")}</button></footer>
  </form></dialog>`;
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
const HAIR_CURL_PATTERNS=["설정하지 않음","완전한 직모","약한 반곱슬","강한 반곱슬","느슨한 웨이브","굵은 곱슬","촘촘한 곱슬","코일형"];
const HAIR_CONDITIONS=["설정하지 않음","매끄럽고 윤기 있음","부드러운 편","보통","굵고 탄탄함","거칠고 뻣뻣함","건조하고 푸석함","쉽게 엉킴","잘 끊어짐"];
const HAIR_STYLES=["자연스럽게 풀어 둠","앞머리 있음","앞머리 없음","시스루 앞머리","일자 앞머리","처피뱅","커튼뱅","옆으로 넘긴 앞머리","앞머리가 한쪽 눈을 가림","앞머리가 양쪽 눈을 가림","올백","슬릭백","보브컷","픽시컷","댄디컷","리프컷","레이어드컷","허쉬컷","샤기컷","울프컷","투블럭","언더컷","모히칸","리젠트","포니테일","사이드 포니테일","트윈테일","양갈래","반묶음","하프업 번","땋은 머리","프렌치 브레이드","피시테일 브레이드","콘로우","박스 브레이드","로우번","하이번","스페이스 번","브레이드 업두","드레드록","히메컷","롱 스트레이트","단발 웨이브","웨이브 스타일","베이비펌","히피펌","가르마펌","고데기 스타일링"];
const EYE_FEATURE_OPTIONS=["눈매가 날카로움","눈매가 부드러움","눈꼬리가 올라감","눈꼬리가 내려감","큰 눈","작은 눈","쌍꺼풀 있음","속쌍꺼풀","무쌍","삼백안","사백안","졸린 눈","처진 눈","짝눈","오드아이","눈 밑 점","다크서클","속눈썹이 김","눈썹이 진함"];
const HAIR_ACCESSORY_OPTIONS=["머리핀","리본","헤어밴드","머리띠","비녀","장식 빗","꽃 장식","베일","모자","후드","왕관","티아라","뿔","한쪽 뿔","한 쌍의 뿔","후광","동물 귀 장식","깃털 장식","보석 장식","체인 장식"];
const BODY_HAIR_AMOUNTS=["설정하지 않음","없음","거의 없음","적은 편","보통","많은 편","매우 많음"];
const BODY_HAIR_LOCATION_OPTIONS=["얼굴","인중","턱","구레나룻","가슴","배","등","어깨","팔","겨드랑이","손","허벅지","종아리","발"];
const SKIN_FEATURE_OPTIONS=["주근깨가 있음","점이 있음","홍조가 있음","피부 결이 매끄러움","피부가 건조함","피부가 민감함","햇볕에 잘 탐","햇볕에 쉽게 붉어짐","색소침착이 있음","백반이 있음","여드름 흔적이 있음","기타 피부 특징"];
const APPEARANCE_SUMMARY_OPTIONS=["압도적으로 아름다운 사람","매우 아름다운 사람","아름다운 사람","매우 잘생긴 사람","잘생긴 사람","귀엽고 사랑스러운 사람","매력적인 사람","호감이 가는 외모","수수하고 평범한 외모","개성이 강한 외모","낯설고 기묘한 외모","다소 못생긴 사람","매우 못생긴 사람","추악하다고 느껴지는 외모"];
const OVERALL_IMPRESSION_OPTIONS=["추악한 인상","기괴한 인상","불쾌한 인상","공포스러운 인상","위압적인 분위기","거칠고 야성적인 인상","차갑고 냉담한 인상","음울한 인상","퇴폐적인 분위기","병약하고 위태로운 인상","피곤하고 지친 인상","초라하고 수수한 인상","눈에 잘 띄지 않는 인상","단정하고 반듯한 인상","지적이고 침착한 인상","부드럽고 온화한 인상","친근하고 편안한 인상","장난스럽고 능청스러운 인상","순진하고 맑은 인상","귀엽고 사랑스러운 인상","청량하고 생기 있는 인상","우아하고 고상한 인상","화려하고 눈부신 인상","관능적이고 매혹적인 인상","신비롭고 비현실적인 인상","중성적이고 모호한 인상","성숙하고 노련한 인상","어리고 앳된 인상"];
const WHEELCHAIR_TYPES=["사용하지 않음","수동 휠체어","전동 휠체어","스포츠용 휠체어","기타 휠체어"];
const WHEELCHAIR_PATTERNS=["설정하지 않음","항상 이용","장거리·외출 시 이용","피로하거나 통증이 있을 때 이용","활동에 따라 바꾸어 이용"];
const PROSTHETIC_SIDES=["사용하지 않음","왼쪽","오른쪽","양쪽"];
const PROSTHETIC_ARM_TYPES=["설정하지 않음","일상생활용 의수","미관용 의수","근전도 의수","작업용 갈고리·집게형 의수","스포츠용 의수","기타 의수"];
const PROSTHETIC_LEG_TYPES=["설정하지 않음","일상 보행 의족","활동형 의족","스포츠용 의족","부분 의족","기타 의족"];
const HEARING_LEVELS=["설정하지 않음","상황에 따라 들리는 정도가 다름","가벼운 난청","중등도 난청","고도 난청","심도 난청","들리지 않음"];
const HEARING_SUPPORT_OPTIONS=["보청기","인공와우","수어","문자 대화","조용한 환경","입모양이 보이는 대화","자막"];
const VISION_SUPPORT_OPTIONS=["지팡이","안내견","화면읽기","확대·고대비","음성 안내","촉각 표식","동행 안내","초음파"];
const SCAR_LOCATION_OPTIONS=["얼굴","왼쪽 눈가","오른쪽 눈가","왼쪽 볼","오른쪽 볼","입가","목","왼쪽 어깨","오른쪽 어깨","왼팔","오른팔","왼손","오른손","가슴","배·옆구리","등","왼쪽 허벅지","오른쪽 허벅지","왼쪽 종아리","오른쪽 종아리","수술 부위","화상 부위","기타 위치"];
const TATTOO_LOCATION_OPTIONS=["얼굴","목","왼쪽 어깨","오른쪽 어깨","왼팔","오른팔","팔 전체","왼손","오른손","가슴","배·옆구리","등","등 전체","왼쪽 허벅지","오른쪽 허벅지","왼쪽 종아리","오른쪽 종아리","전신","기타 위치"];
const SCAR_TYPE_OPTIONS=["설정하지 않음","가느다란 흉터","칼자국","찢어진 상처 흔적","화상 흉터","수술 흉터","긁힌 흔적","물린 흔적","울퉁불퉁한 흉터","색소가 남은 흉터","기타 흉터"];
const TATTOO_TYPE_OPTIONS=["설정하지 않음","문자·문구","기하학 무늬","꽃·식물","동물","상징·문장","인물·초상","추상 무늬","전통 문양","작은 포인트","넓은 면적의 문신","기타 문신"];
const BODY_MARK_ATTITUDE_OPTIONS=["설정하지 않음","아끼며 드러내고 싶어함","자연스럽게 받아들임","별다른 생각이 없음","남에게 보이는 것을 꺼림","가리고 싶어함","없애고 싶어함","그때의 기억을 떠올림","자신만의 의미를 부여함"];
const SKIN_TONE_DEPTHS=[0,3,5,7,10,13,17,21,23,25,28,31,35,40,45,50,55,60];
const SKIN_TONE_COLORS={
  "쿨톤":["#FFFDFC","#FFF8F6","#FCEFEA","#F8E4DE","#F1D5CD","#E8C3BA","#D9ADA4","#C9978E","#B98279","#A56E67","#905B57","#7A4A48","#633B3B","#4E2E30","#3B2327","#2A191E","#1C1116","#110A0E"],
  "뉴트럴톤":["#FFFDF9","#FFF8F2","#FBEFE7","#F6E3D9","#EFD4C7","#E4C1B1","#D5AA98","#C3927E","#B17C69","#9C6755","#875443","#714435","#5B352A","#47291F","#352019","#251612","#180E0B","#0F0806"],
  "웜톤":["#FFFDF7","#FFF7EC","#FAEDDE","#F4E0CE","#EBCFBA","#DFBBA2","#CFA58A","#BD8D70","#AA775A","#966247","#814F38","#6C3F2C","#573124","#44261C","#331C15","#24130E","#170C08","#0E0704"],
  "올리브톤":["#FCFBF5","#F8F4E9","#F1EBDD","#E8DFCE","#DDD0BB","#CEBCA3","#BDA58A","#AA8D70","#98785A","#846448","#70523A","#5D4230","#4B3427","#3A291F","#2B1E18","#1E1511","#140E0B","#0C0806"],
  "그레이톤":["#FBFBFC","#F1F1F3","#E5E6E9","#D7D9DD","#C7C9CF","#B5B8C0","#A3A6AF","#91949D","#7E818A","#6C6E76","#595B62","#484950","#38393F","#2A2B31","#1F2025","#17181C","#101115","#090A0D"],
  "쿨블루톤":["#F8FCFF","#ECF7FF","#DDEFFD","#CDE6F7","#B9D9EC","#A4CADF","#8DB8D1","#75A5C0","#6091AE","#4F7C99","#406783","#33536D","#283F57","#1E3044","#162333","#101925","#0A1018","#05090E"],
  "웜블루톤":["#FBFCFF","#F0F4FF","#E3EAFB","#D5DEF2","#C4CFE6","#B0BDD7","#9AA9C6","#8494B4","#70809F","#5E6C89","#4D5872","#3E475D","#303749","#242A38","#1A1F2A","#12161E","#0C0F15","#07090C"],
  "쿨그린톤":["#F7FFFC","#EAFBF5","#D9F3E9","#C7E9DD","#B1DDCF","#9BCDBF","#83BBAE","#6CA89C","#579589","#468075","#386B61","#2C574E","#22433C","#19332E","#122521","#0D1A17","#08110F","#040A08"],
  "웜그린톤":["#FCFFF8","#F3FBEA","#E7F3D9","#D8E9C6","#C7DDB1","#B5CF9B","#A0BE83","#8CAD6D","#789A59","#658549","#53713B","#425D30","#344925","#28381D","#1D2915","#151E0F","#0D1309","#070B05"],
  "라일락톤":["#FFFAFF","#F8F0FC","#EEE3F5","#E3D4EC","#D5C3E1","#C5AFD4","#B39AC5","#A085B5","#8D71A2","#795F8E","#654D78","#523D62","#40304E","#30243B","#231A2C","#19121F","#100B15","#09060C"]
};
const skinToneParts=value=>{
  const match=String(value||"").match(/^(.+톤)\s+(\d+)호$/);
  return match?{undertone:match[1],depth:Number(match[2])}:{undertone:"뉴트럴톤",depth:23};
};
export const skinToneColor=value=>{
  const {undertone,depth}=skinToneParts(value);
  const index=SKIN_TONE_DEPTHS.reduce((best,current,currentIndex)=>Math.abs(current-depth)<Math.abs(SKIN_TONE_DEPTHS[best]-depth)?currentIndex:best,0);
  return SKIN_TONE_COLORS[undertone]?.[index]||SKIN_TONE_COLORS["뉴트럴톤"][8];
};
const skinToneDepthLabel=depth=>String(depth).padStart(2,"0");
const skinToneLabel=value=>{
  const {undertone,depth}=skinToneParts(value);
  const shade=skinToneDepthLabel(depth);
  if(state.uiLanguage==="en")return `${t(undertone,undertone)} ${shade}`;
  if(state.uiLanguage==="ja")return `${t(undertone,undertone)} ${shade}号`;
  return `${undertone} ${shade}호`;
};
const EYE_COLORS=["설정하지 않음","검은색","짙은 갈색","갈색","연갈색","호박색","금색","초록색","청록색","파란색","청회색","회색","보라색","분홍색","빨간색","백색","여러 색","기타"];
const APPEARANCE_PREVIEW_COLORS={
  "설정하지 않음":"#D8D1C2","검은색":"#22201F","짙은 갈색":"#3C281F","갈색":"#704A32","밝은 갈색":"#A8774F",
  "연갈색":"#B68A61","호박색":"#C78222","금색":"#E1B72E","금발":"#E5C65A","백발·은발":"#D9DDE1","백색":"#F4F1E9",
  "회색":"#808489","청회색":"#6F8795","빨간색":"#9D2A2A","주황색":"#D06E2E","분홍색":"#D67C9D","보라색":"#75569A",
  "파란색":"#416FA8","청록색":"#2D8C82","초록색":"#4E7D4B","여러 색":"#8A65A5","기타":"#8D8178"
};
export const appearancePreviewColor=(value,fallback="#D8D1C2")=>APPEARANCE_PREVIEW_COLORS[value]||fallback;
export const hairCurlPreviewPath=value=>({
  "완전한 직모":"M67 491 L324 491",
  "약한 반곱슬":"M67 492 C111 481 143 483 177 493 C213 503 256 499 324 486",
  "강한 반곱슬":"M67 494 C91 470 124 470 150 493 C177 517 207 516 234 491 C261 466 294 468 324 494",
  "느슨한 웨이브":"M67 494 C101 463 135 463 169 494 C203 525 237 525 271 494 C289 478 307 478 324 492",
  "굵은 곱슬":"M67 495 C82 466 106 466 121 495 C136 524 160 524 175 495 C190 466 214 466 229 495 C244 524 268 524 283 495 C294 474 311 472 324 491",
  "촘촘한 곱슬":"M67 493 C76 470 90 470 99 493 C108 516 122 516 131 493 C140 470 154 470 163 493 C172 516 186 516 195 493 C204 470 218 470 227 493 C236 516 250 516 259 493 C268 470 282 470 291 493 C300 516 314 514 324 490",
  "코일형":"M67 493 C67 474 91 474 91 493 C91 512 67 512 67 493 M99 493 C99 474 123 474 123 493 C123 512 99 512 99 493 M131 493 C131 474 155 474 155 493 C155 512 131 512 131 493 M163 493 C163 474 187 474 187 493 C187 512 163 512 163 493 M195 493 C195 474 219 474 219 493 C219 512 195 512 195 493 M227 493 C227 474 251 474 251 493 C251 512 227 512 227 493 M259 493 C259 474 283 474 283 493 C283 512 259 512 259 493 M291 493 C291 474 315 474 315 493 C315 508 302 512 294 504"
}[value]||"M67 492 C108 480 143 481 177 493 C213 506 258 501 324 486");
const MAKEUP_LEVELS=["하지 않음","스킨케어만","선크림·기초만","가벼운 메이크업","포인트 메이크업","풀 메이크업"];
const MAKEUP_STYLES=["노 메이크업 메이크업","내추럴","글로우","듀이","세미매트","매트","음영","누드톤","코랄톤","로즈톤","브라운톤","모브톤","레드 립","그라데이션 립","오버 립","스모키 아이","캣아이","언더라인 강조","속눈썹 강조","블러셔 강조","주근깨 메이크업","도화살 메이크업","청순 메이크업","러블리 메이크업","큐티 메이크업","성숙한 메이크업","섹시 메이크업","화려한 색조","글리터","메탈릭","컬러 아이라인","고딕","지뢰계","양산형","펑크","그런지","복고풍","시대극","판타지","인외 메이크업","무대·공연용","촬영용","특수 분장","드랙 메이크업"];
const WARDROBE_TAG_GROUPS={
  "가격대":["저가","합리적인 가격","중간 가격대","고가","명품","맞춤 제작"],
  "색":["검은색","흰색","회색","베이지","갈색","빨간색","분홍색","주황색","노란색","초록색","청록색","파란색","보라색","금색","은색","여러 색"],
  "분위기":["섹시","화려","성숙","청순","큐티","우아","시크","중성적","단정","캐주얼","클래식","고딕","펑크","스트리트","빈티지","로맨틱","스포티","미니멀","럭셔리","판타지"],
  "형태·소재":["몸에 붙는 실루엣","여유로운 실루엣","노출이 적음","노출이 많음","레이어드","가죽","데님","니트","실크·새틴","레이스","시스루","기능성 소재","장식이 많음","무늬가 많음"]
};
const WARDROBE_TAG_OPTIONS=Object.values(WARDROBE_TAG_GROUPS).flat();
const SALON_FREQUENCIES=["자동 · 설정에 맞춤","거의 가지 않음","3~4개월에 한 번","1~2개월에 한 번","한 달에 한 번","2주에 한 번","주 1회 이상"];
const SURGERY_AREAS=["눈","코","입술","윤곽·턱","피부·흉터","가슴","체형 교정","성별확정 의료 과정","기타"];
const ACCESSIBILITY_PREFERENCES=["도움 전에 먼저 물어보기","보조기기 함부로 만지지 않기","접근 가능한 동선 먼저 확인","쉬는 시간을 충분히 두기","조용한 자리 선호","문자·시각 정보 함께 제공","말로 주변 정보 설명","직접 선택하고 결정할 시간 주기"];
const HOSPITAL_PURPOSES=["설정하지 않음","상담·경과 확인","정기 검진 · 상담 포함","검사·영상 촬영 · 검진·상담 포함","외래 처치·치료 · 검사 이하 포함","통원 시술 · 외래 치료 이하 포함","입원 치료 · 통원 치료 이하 포함","수술·집중 치료 · 입원 치료 이하 포함","재활·회복 관리","처방·복약 조정","예방접종","정신건강 진료","치과 진료","기타 진료"];
const MEDICATION_PURPOSES=["설정하지 않음","통증 조절","알레르기 관리","호흡기 관리","심혈관 관리","혈압 관리","혈당 관리","호르몬 관리","면역 관리","소화기 관리","감염 치료","수면 관리","불안 완화","기분 조절","집중력 관리","피임·생식 건강","성별확정 의료 과정","비타민·영양 보충","기타"];
const MEDICATION_FREQUENCIES=["설정하지 않음","필요할 때만","매일 아침","매일 점심","매일 저녁","취침 전","하루 1회","하루 2회","하루 3회 이상","주 1회","정해진 주기마다"];
function profileSelect(label,path,options,current){
  return `<label>${label}<select data-body-field="${path}">${options.map(value=>`<option value="${esc(value)}" ${value===current?"selected":""}>${esc(value)}</option>`).join("")}</select></label>`;
}
function profileMultiChoice(title,key,options,selected){
  const values=new Set(selected||[]);
  const all=[...options,...[...values].filter(value=>!options.includes(value))];
  return `<fieldset><legend>${title}</legend><div class="chips">${all.map(value=>`<button type="button" data-body-list="${key}" data-value="${esc(value)}" class="${values.has(value)?"on":""}">${esc(value)}</button>`).join("")}</div></fieldset>`;
}
function profileCollapsibleChoice(title,key,options,selected){
  const values=new Set(selected||[]);
  const all=[...options,...[...values].filter(value=>!options.includes(value))];
  const summary=values.size?`${values.size}개 선택`:`정하지 않음`;
  const open=document.documentElement.classList.contains("native-app")?"":" open";
  return `<details class="body-option-group" data-body-option-group="${esc(key)}"${open}>
    <summary><span><b>${esc(title)}</b><small>${esc(summary)}</small></span><i aria-hidden="true">＋</i></summary>
    <div class="chips">${all.map(value=>`<button type="button" data-body-list="${key}" data-value="${esc(value)}" class="${values.has(value)?"on":""}">${esc(value)}</button>`).join("")}</div>
  </details>`;
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
  const physicalTraitGroups=Object.entries(PHYSICAL_TRAIT_GROUPS).map(([group,options])=>profileCollapsibleChoice(group,`physicalTraits:${group}`,options,[...physicalTraits].filter(value=>options.includes(value)))).join("");
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
      ${profileSelect("곱슬기","appearance.hairTexture",HAIR_CURL_PATTERNS,a.hairTexture||"설정하지 않음")}
      ${profileSelect("머릿결","appearance.hairCondition",HAIR_CONDITIONS,a.hairCondition||"설정하지 않음")}
      <div class="eye-color-pair">
        ${profileSelect("왼쪽 눈 색","appearance.leftEyeColor",EYE_COLORS,a.leftEyeColor||"설정하지 않음")}
        ${profileSelect("오른쪽 눈 색","appearance.rightEyeColor",EYE_COLORS,a.rightEyeColor||"설정하지 않음")}
      </div>
      ${profileSelect("화장 정도","appearance.makeupLevel",MAKEUP_LEVELS,a.makeupLevel||"하지 않음")}
      ${profileSelect("미용실 방문 빈도","appearance.salonFrequency",SALON_FREQUENCIES,a.salonFrequency||"자동 · 설정에 맞춤")}
      ${profileSelect("성형·외형 의료 시술 여부","appearance.cosmeticSurgery",["설정하지 않음","하지 않음","과거에 받음","정기적으로 관리 중","받을 계획이 있음"],a.cosmeticSurgery||"설정하지 않음")}
    </div>
    ${profileCollapsibleChoice("머리 스타일 · 여러 개 선택 가능","appearance.hairStyles",HAIR_STYLES,a.hairStyles)}
    ${profileCollapsibleChoice("화장 스타일 · 화장할 때 반영","appearance.makeupStyles",MAKEUP_STYLES,a.makeupStyles)}
    <section class="physical-trait-groups"><div><h3>신체 특성</h3><small>기존 ‘그 외 외모 태그’도 이곳에서 함께 확인할 수 있어요. 체형·머리색·눈색처럼 위에서 정하는 항목은 중복해서 두지 않았습니다.</small></div>${physicalTraitGroups}</section>
    ${profileCollapsibleChoice("성형·외형 의료 시술 부위 · 원할 때만","appearance.cosmeticSurgeryAreas",SURGERY_AREAS,a.cosmeticSurgeryAreas)}
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
      <label>기타 건강 상태<input data-body-field="healthOther" maxlength="200" value="${esc(p.healthOther||"")}" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="원할 때만 직접 입력"></label>
      <label>의수 종류 직접 입력<input data-body-field="prostheticArm.custom" maxlength="120" value="${esc(arm.custom||"")}" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="기타 의수를 골랐을 때"></label>
      <label>의족 종류 직접 입력<input data-body-field="prostheticLeg.custom" maxlength="120" value="${esc(leg.custom||"")}" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="기타 의족을 골랐을 때"></label>
    </div>
    <label>접근성 참고 메모 · 설정표용<textarea data-body-field="notes" maxlength="600" rows="4" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="예: 안내견에게는 일하는 중 말을 걸지 않기, 도움 전에 반드시 먼저 묻기">${esc(p.notes||"")}</textarea></label>
    <small>건강 상태를 고르더라도 매 장면마다 언급하지 않습니다. 치료법·복용량·식단을 자동 처방하지 않고, 평범한 생활과 선택한 접근성 방식 안에서만 드물게 나타납니다. 이 참고 메모는 민감한 내용이 그대로 노출되지 않도록 생활 로그에는 자동 삽입하지 않고 설정표에만 보관합니다.</small>
  </section>`;
}
function characterHomeLayoutEditor(c){
  const previewEntry=eventFor(c);
  const activeMode=state.homeVisualMode==="ld"&&hasLdArt(c,previewEntry)?"ld":"sd";
  const previewText=`${previewEntry?.title||""} ${previewEntry?.desc||""} ${previewEntry?.mood||""}`;
  const previewPresentation=nativeScenePresentation(c,previewEntry,activeMode);
  const previewAction=nativeSceneActionProp(c,previewEntry,previewPresentation.actionKind,previewText)||'<span class="native-scene-action-prop action-prop-preview" aria-hidden="true">✨</span>';
  const previewBackground=sceneImage(c,previewEntry)||townForEntry(previewEntry)?.bg||state.world?.bg||TOWN_BACKGROUND;
  const previewLocation=previewEntry?.home
    ?`${state.homes[previewEntry.visitHomeId||c.homeId]?.name||"집"} · ${state.homes[previewEntry.visitHomeId||c.homeId]?.rooms?.[previewEntry.room]?.name||"집 안"}`
    :placeForEntry(previewEntry)?.name||t("outAndAbout","외출 중");
  const previewSd=sdArtSource(c,previewEntry);
  const sdArt=previewSd
    ?`<img class="${usesProfilePhoto(c,previewEntry)?"profile-photo-fallback":""}" src="${esc(previewSd)}" alt="${esc(c.name)} SD 미리보기">`
      :`<span class="home-layout-fallback">${esc((c.name||"새").slice(0,1))}</span>`;
  const ldArt=hasLdArt(c,previewEntry)
    ?`<img class="scene-ld-art" src="${esc(ldArtSource(c,previewEntry))}" alt="${esc(c.name)} LD 미리보기">`
    :`<span class="home-layout-fallback is-ld">LD<br><small>이미지 미등록</small></span>`;
  const layer=(mode,art)=>`<div class="home-layout-layer visual-mode-${mode}" data-home-layout-layer="${mode}" style="${sceneLayoutVars(c,mode)}"><div class="home-layout-art" role="img" aria-label="${esc(c.name)} ${mode.toUpperCase()} 위치 조정">${art}</div><button type="button" class="home-layout-action" data-home-layout-action aria-label="행동 아이콘 위치 조정">${previewAction}</button></div>`;
  const previewSide=side=>`<nav class="home-layout-preview-side ${side}">${GAME_HUD_SIDE_TABS[side].map(({key,labelKey,label,asset})=>`<span><img src="${esc(homeUiAsset(c,asset))}" alt=""><small>${gameHudLabel(labelKey,label)}</small></span>`).join("")}</nav>`;
  const dockItems=[["home","집","home.png"],["mailbox","우편함","mailbox.png"],["todayLog","기록물","ink.png"],["shop","상점","shop.png"],["town","마을","town.png"]];
  const previewDock=`<nav class="home-layout-preview-dock">${dockItems.map(([key,label,asset])=>`<span><img src="${esc(homeUiAsset(c,asset))}" alt=""><small>${gameHudLabel(key,label)}</small></span>`).join("")}</nav>`;
  return `<section class="character-home-layout-editor" data-home-layout-editor data-character-id="${c.id}" data-mode="${activeMode}">
    <div class="character-home-layout-heading"><div><h3>${t("손가락으로 직접 배치","손가락으로 직접 배치")}</h3><p>${t("한 손가락으로 이동하고, 두 손가락으로 확대·축소와 회전을 조절해요.","한 손가락으로 이동하고, 두 손가락으로 확대·축소와 회전을 조절해요.")}</p><small>1인과 2인 장면은 저장한 Y 위치·크기·회전을 그대로 사용하며, 2인일 때는 X 위치만 좌우로 나뉩니다.</small></div><div class="home-layout-mode-buttons"><button type="button" data-home-layout-mode="sd" class="${activeMode==="sd"?"on":""}">SD 배치</button><button type="button" data-home-layout-mode="ld" class="${activeMode==="ld"?"on":""}" ${hasLdArt(c,previewEntry)?"":"disabled"}>LD 배치</button><button type="button" data-home-layout-fill ${hasLdArt(c,previewEntry)?"":"disabled"}>LD 화면에 꽉 차게</button><button type="button" data-home-layout-reset>현재 배치 초기화</button></div></div>
    <div class="home-layout-preview" data-home-layout-gesture-surface style="${homeUiThemeStyle(c)};--layout-preview-bg:url(&quot;${esc(previewBackground)}&quot;)" aria-label="${esc(c.name)} 배치 미리보기. 한 손가락 이동, 두 손가락 확대 축소 및 회전">
      <div class="home-layout-preview-backdrop"></div><div class="home-layout-ld-frame-guide" aria-hidden="true"><small>실제 LD 배치 영역</small></div>
      ${layer("sd",sdArt)}${layer("ld",ldArt)}
      <div class="home-layout-preview-ui" aria-hidden="true"><div class="home-layout-preview-wood"></div><div class="home-layout-preview-top"><span>${profileAvatar(c)}<img src="${esc(homeUiAsset(c,"profile-ring.png"))}" alt=""></span><b>${esc(c.name)}</b><em>${esc(c.jobTitle||c.job||"생활 중")}</em><small>8월 23일 (일)</small><time>오후 07:30</time></div>${previewSide("left")}${previewSide("right")}<article class="home-layout-preview-moment"><strong>서랍 로그</strong><b>${esc(previewEntry?.title||"지금 이 순간")}</b><p>${esc(previewEntry?.desc||"캐릭터의 생활 장면이 이곳에 표시됩니다.")}</p><small>🏠 ${esc(previewLocation)}</small></article>${previewDock}</div>
    </div>
    <small class="home-layout-preview-caption">실제 홈 화면 비율 · 화면 어디서든 한 손가락으로 이동하고, 두 손가락으로 크기와 각도를 함께 맞출 수 있어요. 행동 아이콘은 아이콘을 직접 끌어 옮겨요.</small>
    <small class="home-layout-save-note">손가락을 떼면 현재 배치가 바로 저장됩니다.</small>
  </section>`;
}

function characterFullOverview(c){
  const primary=String(c.theme?.primary||"#176B60").toUpperCase();
  const secondary=String(c.theme?.secondary||"#6FD0AE").toUpperCase();
  const emptyPhotoSlot=label=>`<span class="character-full-empty-slot"><b>${esc(t("사진 추가하기","사진 추가하기"))}</b><small>${esc(label)}</small></span>`;
  const currentIcon=c.icon
    ?`<img src="${esc(c.icon)}" alt="${esc(c.name)} 아이콘 미리보기">`
    :emptyPhotoSlot(t("아이콘","아이콘"));
  const placementArt=hasLdArt(c)
    ?`<img class="scene-ld-art" src="${esc(ldArtSource(c))}" alt="${esc(c.name)} LD 배치 미리보기">`
    :c.icon?`<img src="${esc(c.icon)}" alt="${esc(c.name)} SD 배치 미리보기">`:profileAvatar(c);
  return `<section class="character-full-svg-overview" aria-label="${esc(c.name)} ${t("이미지","이미지")}"><div class="character-full-content-group">
    <h2 class="character-full-theme-title">${t("캐릭터 대표 색상","캐릭터 대표 색상")}</h2>
    <label class="character-full-theme-row primary"><span class="character-full-theme-swatch" style="--swatch:${esc(primary)}"><input type="color" data-color="primary" value="${esc(primary)}"></span><b>${t("주 색상","주 색상")}</b><input type="text" data-theme-hex="primary" value="${esc(primary)}" maxlength="7" inputmode="text" aria-label="${t("주 색상","주 색상")} HEX"></label>
    <label class="character-full-theme-row secondary"><span class="character-full-theme-swatch" style="--swatch:${esc(secondary)}"><input type="color" data-color="secondary" value="${esc(secondary)}"></span><b>${t("보조 색상","보조 색상")}</b><input type="text" data-theme-hex="secondary" value="${esc(secondary)}" maxlength="7" inputmode="text" aria-label="${t("보조 색상","보조 색상")} HEX"></label>
    <label class="character-full-gradient"><input type="checkbox" data-gradient ${c.theme?.gradient!==false?"checked":""}><span>${t("두 색상을 그라데이션으로 사용","두 색상을 그라데이션으로 사용")}</span></label>
    <button type="button" class="character-full-image-slot profile ${c.photo?"has-image":"is-empty"}" data-image="photo">${c.photo?`<img src="${esc(c.photo)}" alt="${esc(c.name)} 프로필 사진">`:emptyPhotoSlot(t("프로필 사진","프로필 사진"))}</button>
    <span class="character-full-slot-label profile">${t("프로필 사진 추가하기","프로필 사진 추가하기")}</span>
    <button type="button" class="character-full-placement-card" data-open-character-layout>${placementArt}</button>
    <span class="character-full-slot-label placement">${t("배치 조정하기","배치 조정하기")}</span>
    <button type="button" class="character-full-image-slot ld ${hasLdArt(c)?"has-image":"is-empty"}" data-image="ldImage">${hasLdArt(c)?`<img src="${esc(ldArtSource(c))}" alt="${esc(c.name)} LD 일러스트">`:emptyPhotoSlot("LD")}</button>
    <span class="character-full-slot-label ld">${t("LD 사진 추가하기","LD 사진 추가하기")}</span>
    <button type="button" class="character-full-image-slot icon ${c.icon?"has-image":"is-empty"}" data-image="icon">${currentIcon}</button>
    <span class="character-full-slot-label icon">${t("아이콘 추가하기","아이콘 추가하기")}</span>
    <button type="button" class="character-full-theme-chooser" data-character-theme="drawer-default" aria-label="${esc(t("테마 고르기","테마 고르기"))}"><img src="./icons/drawer-village-logo.png" alt=""><span>${t("테마 고르기","테마 고르기")}<small>${t("기본 테마 · 서랍마을","기본 테마 · 서랍마을")}</small></span></button>
    <button type="button" class="character-full-advanced-ld" data-open-advanced-ld>${t("고급 LD 사진 추가하기","고급 LD 사진 추가하기")}</button>
    <nav class="character-book-cover-controls" aria-label="${esc(t("표지에서 개요로 이동","표지에서 개요로 이동"))}"><button type="button" disabled aria-label="${esc(t("이전 페이지 없음","이전 페이지 없음"))}">◀</button><b>1</b><button type="button" data-character-pane="profile" aria-label="${esc(t("개요 첫 페이지","개요 첫 페이지"))}">▶</button></nav></div>
  </section>`;
}
function nativeCharacterHub(c){
  const limit=characterLimit();
  const slotLabel=state.order.length>limit?`${state.order.length}명 저장됨 · 한도 ${limit}명`:`+ 생성 · ${state.order.length}/${limit}`;
  const list=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="char-sort-row"><button class="char-row ${id===c.id?"on":""}" data-edit="${id}" style="--own:${x.theme.primary}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(x.job)}</small></span></button><span class="sort-controls"><button data-sort="${id}" data-direction="-1" ${index===0?"disabled":""} aria-label="위로">▲</button><button data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""} aria-label="아래로">▼</button></span></div>`}).join("");
  const otherIds=state.order.filter(id=>id!==c.id),canCreate=state.order.length<limit,rosterItemCount=otherIds.length+(canCreate?1:0),rosterVisibleRows=Math.min(6,rosterItemCount);
  const mobileStrip=`${otherIds.map(id=>{const x=state.characters[id];return `<button type="button" data-mobile-character-select="${id}" class="character-roster-entry" style="--own:${x.theme.primary}">${avatar(x)}<small>${esc(x.name)}</small></button>`}).join("")}${canCreate?`<button type="button" data-new class="character-roster-entry character-roster-new" aria-label="${esc(t("새 캐릭터 만들기","새 캐릭터 만들기"))}"><span aria-hidden="true">＋</span><small>${t("새 캐릭터","새 캐릭터")}</small></button>`:""}`;
  const reorderRows=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="mobile-character-reorder-row">${avatar(x)}<b>${esc(x.name)}</b><span><button type="button" data-sort="${id}" data-direction="-1" ${index===0?"disabled":""} aria-label="위로 이동">↑</button><button type="button" data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""} aria-label="아래로 이동">↓</button></span></div>`}).join("");
  const selectedIcon=c.icon?`<img class="sprite" src="${esc(c.icon)}" alt="${esc(c.name)}">`:c.photo?`<img class="avatar profile-photo-fallback" src="${esc(c.photo)}" alt="${esc(c.name)}">`:`<img class="sprite character-wallet-default-profile" src="./assets/home-ui/profile-placeholder.png" alt="${esc(t("기본 실루엣","기본 실루엣"))}">`;
  const profilePhoto=c.photo?`<img src="${esc(c.photo)}" alt="${esc(c.name)}">`:`<span>${t("이곳에 사진을 넣어주세요","이곳에 사진을 넣어주세요")}</span>`;
  const unknown=t("미설정","미설정"),birthdayLabel=c.birthday?`${Number(c.birthday.slice(0,2))}${t("월","월")} ${Number(c.birthday.slice(2))}${t("일","일")}`:unknown;
  const draftRows=[{key:"name",label:"이름",value:c.name},{key:"birthday",label:"생일",value:birthdayLabel},{key:"job",label:"직업 종류",value:c.jobTitle||c.job||unknown},{key:"age",label:"나이",value:c.ageGroup||unknown},{key:"gender",label:"성별",value:c.gender||unknown}];
  const favoriteItems=Object.entries(c.favorites||{}).flatMap(([kind,ids])=>(Array.isArray(ids)?ids:[]).map(id=>(state.catalog?.[kind]||[]).find(item=>item.id===id))).filter(Boolean);
  const favoriteSlots=Array.from({length:3},(_,index)=>{const item=favoriteItems[index];return `<span class="character-favorite-object ${item?.image?"has-image":"is-empty"}">${item?.image?`<img src="${esc(item.image)}" alt="${esc(item.name)}">`:`<i>${index===0?"♡":"·"}</i>`}</span>`}).join("");
  const orientationOptions=["설정하지 않음 · 누구에게도 끌리지 않음","여성에게 끌림","남성에게 끌림","여성과 남성에게 끌림","성별과 무관하게 끌림","그외 성별에게 끌림"];
  const quickSettings=`<dialog class="mobile-character-editor-dialog character-quick-settings-dialog" style="--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}" data-mobile-character-editor-dialog="quick" data-character-dialog-origin="hub"><div class="mobile-character-editor-shell character-quick-settings-shell"><header class="character-quick-header"><button type="button" class="character-quick-back" data-close-mobile-character-editor aria-label="${esc(t("캐릭터 화면으로 돌아가기","캐릭터 화면으로 돌아가기"))}"><span aria-hidden="true">←</span><b>${t("뒤로가기","뒤로가기")}</b></button><h1>${t("빠른설정","빠른설정")}</h1><button type="button" class="character-quick-save" data-save-mobile-character-editor>${t("저장하기","저장하기")}</button></header><div class="character-quick-fields"><button type="button" class="character-quick-icon" data-image="icon" aria-label="${esc(t("투명 SD 아이콘","투명 SD 아이콘"))}">${selectedIcon}<small>${t("아이콘","아이콘")}</small></button><label>${t("이름","이름")}<input data-field="name" value="${esc(c.name)}" maxlength="40" autocomplete="off" autocorrect="off" spellcheck="false"></label><div class="character-quick-pair"><label>${t("성별","성별")}<select data-field="gender">${["설정하지 않음","남성","여성","그외"].map(value=>`<option ${value===(c.gender||"설정하지 않음")?"selected":""}>${value}</option>`).join("")}</select></label><label>${t("성지향","성지향")}<select data-field="attractionTarget">${orientationOptions.map(value=>`<option ${value===(c.attractionTarget||orientationOptions[0])?"selected":""}>${value}</option>`).join("")}</select></label></div><label>${t("직업","직업")}<select data-field="job">${JOBS.map(value=>`<option ${value===c.job?"selected":""}>${value}</option>`).join("")}</select></label><label>${t("직업명","직업명")}<input data-field="jobTitle" value="${esc(c.jobTitle||"")}" maxlength="60" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${esc(t("화면에 표시할 이름","화면에 표시할 이름"))}"></label><fieldset><legend>${t("성격 키워드","성격 키워드")}</legend><div class="character-quick-personality">${PERSONALITY_TYPES.map(value=>`<button type="button" data-personality-type="${value}" class="${(c.personalityTypes||[]).includes(value)?"on":""}" aria-pressed="${(c.personalityTypes||[]).includes(value)}"><i aria-hidden="true">✓</i><span>${value}</span></button>`).join("")}</div></fieldset><label>${t("말투","말투")}<select data-field="speechStyle">${SPEECH_STYLE_OPTIONS.map(value=>`<option ${value===(c.speechStyle||SPEECH_STYLE_OPTIONS[0])?"selected":""}>${value}</option>`).join("")}</select></label></div></div></dialog>`;
  const mobileProfile=`<section class="mobile-character-profile-draft"><button type="button" class="character-draft-back" data-tab="observe" aria-label="${esc(t("돌아가기","돌아가기"))}"></button><button type="button" class="character-wallet-selected" data-toggle-character-roster aria-label="${esc(t("선택된 캐릭터 바꾸기","선택된 캐릭터 바꾸기"))}"><span>${selectedIcon}</span><b><em>${t("선택됨","선택됨")}</em></b></button><div class="character-wallet-art" aria-hidden="true"></div><img class="character-setting-clip" src="./assets/character-ui/clip.png" alt=""><section class="character-registration-card"><button type="button" class="character-registration-photo" data-image="photo" aria-label="${esc(t(c.photo?"프로필 사진 변경":"프로필 사진 추가",c.photo?"프로필 사진 변경":"프로필 사진 추가"))}">${profilePhoto}</button><img class="character-registration-paper" src="./assets/character-ui/registration-card.png" alt="" aria-hidden="true"><div class="character-registration-fields"><h2>${t("서랍마을 주민등록증","서랍마을 주민등록증")}</h2><dl>${draftRows.map(({key,label,value})=>`<div class="character-registration-field-${key}"><dt>${t(label,label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl></div></section><div class="character-wallet-roster" data-character-roster data-roster-count="${rosterItemCount}" style="--roster-visible:${rosterVisibleRows}" hidden><div class="mobile-character-strip">${mobileStrip}</div><span class="character-roster-actions"><button type="button" class="character-roster-reorder" data-open-character-reorder aria-label="${esc(t("위치 바꾸기","위치 바꾸기"))}">↕</button><button type="button" class="character-roster-close" data-toggle-character-roster aria-label="${esc(t("닫기","닫기"))}">×</button></span></div></section>`;
  const hubActions=`<section class="character-setting-choices" aria-label="${esc(t("캐릭터 설정 방식","캐릭터 설정 방식"))}"><span class="character-setting-cloth" aria-hidden="true"><img src="./assets/character-ui/character-cloth-white.png" alt=""></span><img class="character-setting-book" src="./assets/character-ui/book.png" alt=""><img class="character-setting-tape" src="./assets/character-ui/tape.png" alt=""><img class="character-setting-key" src="./assets/character-ui/key.png" alt=""><span class="character-favorite-preview" aria-label="${esc(t("선호 물품 미리보기","선호 물품 미리보기"))}">${favoriteSlots}</span><button type="button" class="character-setting-choice character-quick-choice" data-open-quick-character-settings><span><b>${t("빠른설정","빠른설정")}</b><small>${t("바로가기","바로가기")}</small></span></button><button type="button" class="character-setting-choice character-full-choice" data-open-full-character-settings><span><b>${t("전체설정","전체설정")}</b><small>${t("바로가기","바로가기")}</small></span></button></section>`;
  const draftActions=`<nav class="character-draft-actions" aria-label="${esc(t("캐릭터 관리","캐릭터 관리"))}"><button type="button" class="character-draft-action" data-export-profile><span>${t("프로필 내보내기","프로필 내보내기")}</span></button><button type="button" class="character-draft-action" data-save><span>${t("캐릭터 저장","캐릭터 저장")}</span></button><button type="button" class="character-draft-action danger" data-delete-character="${c.id}"><span>${t("캐릭터 삭제","캐릭터 삭제")}</span></button></nav>`;
  const tabletSummary=`<section class="tablet-character-summary" aria-label="${esc(c.name)} ${esc(t("캐릭터 정보","캐릭터 정보"))}"><div class="tablet-character-summary-paper"><header><span class="tablet-character-summary-avatar">${selectedIcon}</span><span><small>${t("선택한 캐릭터","선택한 캐릭터")}</small><h2>${esc(c.name)}</h2><p>${esc(c.jobTitle||c.job||unknown)}</p></span><i class="tablet-character-theme" style="--primary:${esc(c.theme?.primary||"#176b60")};--secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}" aria-hidden="true"></i></header><dl>${draftRows.map(({label,value})=>`<div><dt>${t(label,label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl><div class="tablet-character-setting-actions"><button type="button" data-open-quick-character-settings><b>${t("빠른설정","빠른설정")}</b><small>${t("기본 정보를 빠르게 수정","기본 정보를 빠르게 수정")}</small></button><button type="button" data-open-full-character-settings><b>${t("전체설정","전체설정")}</b><small>${t("설정책에서 자세히 수정","설정책에서 자세히 수정")}</small></button></div><nav><button type="button" data-export-profile>${t("프로필 내보내기","프로필 내보내기")}</button><button type="button" data-save>${t("캐릭터 저장","캐릭터 저장")}</button><button type="button" class="danger" data-delete-character="${c.id}">${t("캐릭터 삭제","캐릭터 삭제")}</button></nav></div></section>`;
  return `<div class="editor character-editor character-editor-hub-only" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")};--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}"><aside class="panel desktop-character-list"><div class="title"><h2>${t("캐릭터 목록","캐릭터 목록")}</h2><button data-new ${state.order.length>=limit?"disabled":""}>${slotLabel}</button></div>${list}</aside><section class="panel form character-hub-shell">${tabletSummary}<section class="mobile-character-dashboard" data-character-ui-version="8" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")};--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}"><img class="character-wood-background" src="./assets/character-ui/character-wood-background.png" alt="" aria-hidden="true">${mobileProfile}${hubActions}${draftActions}</section>${quickSettings}<dialog class="mobile-character-reorder-dialog" data-mobile-character-reorder-dialog><form method="dialog"><div class="mobile-editor-head"><span><small>CHARACTER ORDER</small><b>${t("캐릭터 위치 바꾸기","캐릭터 위치 바꾸기")}</b></span><button value="close">×</button></div><p>${t("화살표를 눌러 홈과 캐릭터 목록의 순서를 바꿔요.","화살표를 눌러 홈과 캐릭터 목록의 순서를 바꿔요.")}</p><div>${reorderRows}</div><button class="primary" value="close">${t("완료","완료")}</button></form></dialog></section></div>`;
}
function character(){
  const c=active();
  // A phone that rotates into tablet width must immediately return to the
  // tablet's persistent roster + shared-book shell without losing its pane.
  const nativeApp=document.documentElement.classList.contains("native-app");
  const nativeTabletMode=nativeApp&&Boolean(window.matchMedia?.("(min-width:721px)")?.matches);
  const nativeTabletLandscape=nativeTabletMode&&Boolean(window.matchMedia?.("(orientation:landscape)")?.matches);
  if(nativeApp&&state.characterSettingsView!=="full")return nativeCharacterHub(c);
  // Full settings use the same book content on phones and tablets. Keep the
  // legacy dashboard/catalog strings out of memory even when the tablet keeps
  // its separate character list column.
  const fixedBookMode=state.characterSettingsView==="full";
  const list=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="char-sort-row"><button class="char-row ${id===c.id?"on":""}" data-edit="${id}" style="--own:${x.theme.primary}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(x.job)}</small></span></button><span class="sort-controls"><button data-sort="${id}" data-direction="-1" ${index===0?"disabled":""} aria-label="위로">▲</button><button data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""} aria-label="아래로">▼</button></span></div>`}).join("");
  const favorites=fixedBookMode?"":Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips"><h3>${label} 최애</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-favorite-kind="${kind}" data-favorite-id="${item.id}" class="${(c.favorites?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const inventory=fixedBookMode?"":Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips owned-items"><h3>소지한 ${label}</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-owned-kind="${kind}" data-owned-id="${item.id}" class="${(c.inventory?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const workplaces=state.towns.flatMap(town=>(town.id===state.activeTownId?state.world.places:town.places).map(place=>({...place,townName:town.name})));
  const legacyYoungAge=["영아","유아"].includes(c.ageGroup)?[c.ageGroup]:[];
  const ageGroups=[...legacyYoungAge,"어린이","청소년","청년","성인","중년","장년","노년","나이 불명"];
  const birthMonth=String(c.birthday||"").slice(0,2),birthDay=String(c.birthday||"").slice(2,4);
  const orientationOptions=["설정하지 않음 · 누구에게도 끌리지 않음","여성에게 끌림","남성에게 끌림","여성과 남성에게 끌림","성별과 무관하게 끌림","그외 성별에게 끌림"];
  const birthdaySelects=`<fieldset class="birthday-parts"><legend>${t("생일","생일")}</legend><label>${t("월","월")}<select data-birthday-part="month"><option value="">--</option>${Array.from({length:12},(_,index)=>String(index+1).padStart(2,"0")).map(value=>`<option value="${value}" ${value===birthMonth?"selected":""}>${Number(value)}</option>`).join("")}</select></label><label>${t("일","일")}<select data-birthday-part="day"><option value="">--</option>${Array.from({length:31},(_,index)=>String(index+1).padStart(2,"0")).map(value=>`<option value="${value}" ${value===birthDay?"selected":""}>${Number(value)}</option>`).join("")}</select></label><small>${t("연도 없이 월과 일을 골라 주세요. 생일 당일 생활과 달력에 반영돼요.","연도 없이 월과 일을 골라 주세요. 생일 당일 생활과 달력에 반영돼요.")}</small></fieldset>`;
  const profile=`<section class="profile-basic-settings"><div class="settings-section-heading"><span><small>BASIC PROFILE</small><h2>프로필</h2></span><p>캐릭터를 알아보는 데 필요한 정보부터 간단히 설정해요.</p></div><div class="fields"><label>캐릭터 이름<input data-field="name" value="${esc(c.name)}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"></label><label>나이대<select data-field="ageGroup">${ageGroups.map(x=>`<option ${x===(c.ageGroup||"성인")?"selected":""}>${x}</option>`).join("")}</select></label>${birthdaySelects}<label>직업 종류<select data-field="job">${JOBS.map(x=>`<option ${x===c.job?"selected":""}>${x}</option>`).join("")}</select></label><label>표기할 직업명<input data-field="jobTitle" value="${esc(c.jobTitle||"")}" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" placeholder="비워 두면 직업 종류명으로 표시"></label><label>기상 시각<input type="time" data-field="wake" value="${c.wake}"></label><label>취침 시각<input type="time" data-field="sleep" value="${c.sleep}"></label></div></section>`;
  const profileAdvancedFields=`<div class="fields"><label>출근할 건물<select data-field="workplaceId"><option value="">자동 선택 / 없음</option><option value="home" ${c.workplaceId==="home"?"selected":""}>🏠 자택근무</option>${workplaces.map(p=>`<option value="${p.id}" ${c.workplaceId===p.id?"selected":""}>${esc(p.townName)} · ${esc(p.name)}</option>`).join("")}</select></label><label>소비 유형<select data-field="income">${INCOMES.map(x=>`<option ${x===c.income?"selected":""}>${x}</option>`).join("")}</select></label><label>매운맛 선호 <b data-range-label="spiceTolerance">${SPICE_LEVELS[c.spiceTolerance??2]}</b><input type="range" min="0" max="5" data-field="spiceTolerance" data-levels="spice" value="${c.spiceTolerance??2}"></label><label>단맛 선호 <b data-range-label="sweetPreference">${SWEET_LEVELS[c.sweetPreference??2]}</b><input type="range" min="0" max="5" data-field="sweetPreference" data-levels="sweet" value="${c.sweetPreference??2}"></label><label>외향·내향 정도 <b data-range-label="socialEnergy">${PERSONALITY_LEVELS.socialEnergy[c.socialEnergy??3]}</b><input type="range" min="0" max="6" data-field="socialEnergy" data-levels="socialEnergy" value="${c.socialEnergy??3}"></label><label>감각·직관 정도 <b data-range-label="sensingIntuition">${PERSONALITY_LEVELS.sensingIntuition[c.sensingIntuition??3]}</b><input type="range" min="0" max="6" data-field="sensingIntuition" data-levels="sensingIntuition" value="${c.sensingIntuition??3}"></label><label>사고·감정 정도 <b data-range-label="thinkingFeeling">${PERSONALITY_LEVELS.thinkingFeeling[c.thinkingFeeling??3]}</b><input type="range" min="0" max="6" data-field="thinkingFeeling" data-levels="thinkingFeeling" value="${c.thinkingFeeling??3}"></label><label>인식·판단 정도 <b data-range-label="perceivingJudging">${PERSONALITY_LEVELS.perceivingJudging[c.perceivingJudging??3]}</b><input type="range" min="0" max="6" data-field="perceivingJudging" data-levels="perceivingJudging" value="${c.perceivingJudging??3}"></label></div>`;
  const worldTaste=fixedBookMode?"":`<h2>${esc(c.name)}의 세계관 선호와 소지품</h2><p>선물로 받고 싶은 것을 포함해 특히 좋아하는 항목과 실제로 가지고 다니거나 보관하는 물건을 각각 골라 주세요. 실제 선물은 우편함에서 보낼 수 있어요.</p>${favorites}<hr><h2>소지품</h2>${inventory}`;
  const videoFormats=["영화","드라마","애니메이션","다큐멘터리","연애 예능","여행 예능","음악 예능","관찰 예능","게임 예능","토크쇼","서바이벌","코미디 예능","브이로그","게임 방송","먹방","리뷰","교육","숏폼","웹예능","웹드라마"],gameGenres=DETAIL_OPTIONS.game;
  const storyGenres=["로맨스","코미디","액션","판타지","SF","스릴러","공포","미스터리","범죄","드라마","시대극","일상","청춘","가족","모험"];
  const taste=fixedBookMode?"":`<h2>${esc(c.name)}의 취향 선택</h2><p>‘좋아하는 장르’는 책·영화·드라마·애니메이션 등 이야기 콘텐츠 전체에 공통으로 반영돼요.</p>${chips("관심사",INTERESTS,c.interests||[],"interests")}${chips("취미",HOBBIES,c.hobbies||[],"hobbies")}${chips("음식",FOOD_PREFERENCES,c.foodPreferences||[],"foodPreferences")}${chips("좋아하는 음료",DRINKS,c.drinks||[],"drinks")}${chips("좋아하는 장르 · 이야기 전체",storyGenres,c.favoriteStoryGenres||[],"favoriteStoryGenres")}${chips("좋아하는 음악 장르",MUSIC,c.musicGenres||[],"musicGenres")}${chips("좋아하는 패션 스타일",DETAIL_OPTIONS.fashion,c.favoriteFashionStyles||[],"favoriteFashionStyles")}${chips("좋아하는 영상 종류",videoFormats,c.favoriteVideoGenres||[],"favoriteVideoGenres")}${chips("좋아하는 게임 장르",gameGenres,c.favoriteGameGenres||[],"favoriteGameGenres")}${chips("좋아하는 향 계열",PERFUME_NOTES,c.favoriteScentNotes||[],"favoriteScentNotes")}`;
  const personalityDetails=fixedBookMode?"": [
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
  const personalityBasics=fixedBookMode?"": [
    personalityChoice(c,"사람과 어울리는 방식","socialStyle",["혼자가 편함","낯을 가림","조용히 어울림","먼저 다가감","무리의 중심"]),
    personalityChoice(c,"일정을 다루는 방식","planningStyle",["무계획","즉흥적","유연한 편","상황에 따라","미리 정리함","계획적","강박적으로 계획함"]),
    personalityChoice(c,"애정 표현","affectionStyle",["표현이 서툼","조용히 곁에 있음","말로 표현","행동으로 표현","적극적으로 챙김"]),
    personalityChoice(c,"생활 에너지","energyRhythm",["집에서 충전","느긋한 편","상황에 따라","활동적인 편","가만히 못 있음"])
  ].join("");
  const personalityPane=fixedBookMode?"":`<section class="character-traits-pane personality-pane"><div class="traits-pane-heading"><h2>${esc(c.name)}의 성격</h2><p>전체 설정에서는 성격과 정서 표현 항목을 접지 않고 한 번에 확인할 수 있어요.</p></div>${personalityTypeChoice(c)}<section class="profile-basic-settings personality-basic-settings"><div class="settings-section-heading"><span><small>CORE PERSONALITY</small><h3>핵심 성격</h3></span><p>일상 장면에 가장 크게 반영되는 항목이에요.</p></div><section class="personality-detail-grid">${personalityBasics}</section></section><section class="settings-complete-group personality-complete-settings"><div class="settings-section-heading"><span><small>ALL PERSONALITY DETAILS</small><h3>전체 성격 항목</h3></span></div><section class="personality-detail-grid">${personalityDetails}</section></section></section>`;
  const lifestyleSelect=(label,field,options,current)=>`<label>${label}<select data-field="${field}">${options.map(value=>`<option value="${esc(value)}" ${current===value?"selected":""}>${esc(value)}</option>`).join("")}</select></label>`;
  const commuteModes=chips("출퇴근 이동수단 · 여러 개 선택 가능",["자차","대중교통","버스","지하철","택시","도보","자전거"],c.commuteModes||[],"commuteModes");
  const photoQuickCard=`<section class="character-photo-quick-card"><span>${c.photo?`<img class="profile-photo-fallback" src="${esc(c.photo)}" alt="${esc(c.name)} 프로필 사진">`:`<span class="character-image-empty-preview"><i>사진</i><small>미등록</small></span>`}</span><div><h3>프로필 사진 첨부</h3><p>여기서 바로 사진을 등록할 수 있어요. 프로필 사진은 동그랗게 표시되며 SD 아이콘과는 별도입니다.</p><div class="image-actions"><button type="button" class="primary" data-image="photo">사진 파일 선택</button><button type="button" data-image-url="photo" data-id="${c.id}">사진 링크</button>${c.photo?`<button type="button" data-clear-character-image="photo">사진 지우기</button>`:""}</div><small>투명 SD 아이콘과 단일 LD 일러스트는 ‘사진·SD·LD’ 탭에서 따로 등록해요.</small></div></section>`;
  const profileWithLicense=`<section class="profile-license">${photoQuickCard}${townAssignment(c)}${profile}<section class="settings-complete-group profile-complete-settings"><div class="settings-section-heading"><span><small>PROFILE DETAILS</small><h3>생활·관계 설정</h3></span><p>직장·소비·입맛·생활 습관·끌림 설정을 모두 표시해요.</p></div>${profileAdvancedFields}<section class="setting-card character-lifestyle-settings"><h2>운전·흡연·주량</h2><p>캐릭터의 실제 생활 습관에 가까운 상태를 골라 주세요.</p><div class="fields lifestyle-profile-fields">${lifestyleSelect("운전면허·운전 경험","driverLicense",["면허 없음","면허만 있음 · 운전하지 않음","초보운전","가끔 운전함","운전에 익숙함","장거리·야간 운전도 익숙함"],c.driverLicense||"면허 없음")}${lifestyleSelect("흡연 여부","smokingStatus",["설정하지 않음","비흡연","금연 중","가끔 흡연","전자담배 사용","흡연"],c.smokingStatus||"설정하지 않음")}${lifestyleSelect("주량","alcoholTolerance",["설정하지 않음","마시지 않음","한두 모금","매우 약함","약한 편","보통","강한 편","매우 강함"],c.alcoholTolerance||"설정하지 않음")}</div>${commuteModes}</section>${profileAttractionSettings(c)}</section></section>`;
  const overviewPane=state.characterOverviewPane==="basic"?"basic":"life";
  const overviewOption=(value,current)=>`<option value="${esc(value)}" ${value===current?"selected":""}>${esc(t(value,value))}</option>`;
  const overviewSelect=(field,values,current,extra="")=>`<select data-field="${field}" ${extra}>${values.map(value=>overviewOption(value,current)).join("")}</select>`;
  const overviewMonth=`<select data-birthday-part="month" aria-label="${esc(t("생일 월","생일 월"))}"><option value="">-</option>${Array.from({length:12},(_,index)=>String(index+1).padStart(2,"0")).map(value=>`<option value="${value}" ${value===birthMonth?"selected":""}>${Number(value)}</option>`).join("")}</select>`;
  const overviewDay=`<select data-birthday-part="day" aria-label="${esc(t("생일 일","생일 일"))}"><option value="">-</option>${Array.from({length:31},(_,index)=>String(index+1).padStart(2,"0")).map(value=>`<option value="${value}" ${value===birthDay?"selected":""}>${Number(value)}</option>`).join("")}</select>`;
  const overviewHomes=Object.values(state.homes||{}),overviewHome=c.homeId&&state.homes[c.homeId]?state.homes[c.homeId]:overviewHomes[0];
  const overviewBasic=`<section class="character-overview-basic" aria-label="${esc(t("개요 기본 설정","개요 기본 설정"))}">
    <label class="overview-field overview-name"><b>${t("이름","이름")}</b><input data-field="name" value="${esc(c.name)}" maxlength="40" autocomplete="off" autocorrect="off" spellcheck="false"></label>
    <label class="overview-field overview-age"><b>${t("나이","나이")}</b>${overviewSelect("ageGroup",ageGroups,c.ageGroup||"성인")}</label>
    <fieldset class="overview-field overview-birthday"><legend>${t("생일","생일")}</legend><span>${overviewMonth}<i>${t("월","월")}</i>${overviewDay}<i>${t("일","일")}</i></span></fieldset>
    <label class="overview-field overview-gender"><b>${t("성별","성별")}</b>${overviewSelect("gender",["설정하지 않음","남성","여성","그외"],c.gender||"설정하지 않음")}</label>
    <label class="overview-field overview-orientation"><b>${t("성지향","성지향")}</b>${overviewSelect("attractionTarget",orientationOptions,c.attractionTarget||orientationOptions[0])}</label>
    <label class="overview-field overview-job"><b>${t("직업","직업")}</b>${overviewSelect("job",JOBS,c.job||"무직")}</label>
    <label class="overview-field overview-workplace"><b>${t("출근 장소","출근 장소")}</b><select data-field="workplaceId"><option value="">${t("자동 선택 · 없음","자동 선택 · 없음")}</option><option value="home" ${c.workplaceId==="home"?"selected":""}>${t("자택근무","자택근무")}</option>${workplaces.map(place=>`<option value="${place.id}" ${c.workplaceId===place.id?"selected":""}>${esc(place.name)}</option>`).join("")}</select></label>
    <label class="overview-field overview-job-title"><b>${t("직업명","직업명")}</b><input data-field="jobTitle" value="${esc(c.jobTitle||"")}" maxlength="60" autocomplete="off" autocorrect="off" spellcheck="false"></label>
    <label class="overview-field overview-address"><b>${t("주소","주소")}</b><select data-field="townId">${state.towns.map(town=>`<option value="${town.id}" ${town.id===c.townId?"selected":""}>${esc(town.name)}</option>`).join("")}</select></label>
    <label class="overview-field overview-family-home"><b>${t("본가","본가")}</b><select data-field="homeId">${overviewHomes.map(home=>`<option value="${home.id}" ${home.id===(overviewHome?.id||"")?"selected":""}>${esc(home.name)}</option>`).join("")}</select></label>
    <label class="overview-field overview-speech"><b>${t("캐릭터 말투","캐릭터 말투")}</b>${overviewSelect("speechStyle",SPEECH_STYLE_OPTIONS,c.speechStyle||SPEECH_STYLE_OPTIONS[0])}</label>
    <label class="overview-field overview-license"><b>${t("운전면허","운전면허")}</b>${overviewSelect("driverLicense",["면허 없음","면허만 있음 · 운전하지 않음","초보운전","가끔 운전함","운전에 익숙함","장거리·야간 운전도 익숙함"],c.driverLicense||"면허 없음")}</label>
    <label class="overview-field overview-wealth"><b>${t("재산","재산")}</b>${overviewSelect("wealth",["설정하지 않음","형편이 어려움","평범한 형편","여유 있는 편","부유함","대부호"],c.wealth||"평범한 형편")}</label>
    <label class="overview-field overview-spending"><b>${t("소비유형","소비유형")}</b>${overviewSelect("income",INCOMES,c.income||"필요한 만큼 소비")}</label>
    <label class="overview-field overview-smoking"><b>${t("흡연 여부","흡연 여부")}</b>${overviewSelect("smokingStatus",["설정하지 않음","비흡연","금연 중","가끔 흡연","전자담배 사용","흡연"],c.smokingStatus||"설정하지 않음")}</label>
    <label class="overview-field overview-alcohol"><b>${t("주량","주량")}</b>${overviewSelect("alcoholTolerance",["설정하지 않음","마시지 않음","한두 모금","매우 약함","약한 편","보통","강한 편","매우 강함"],c.alcoholTolerance||"설정하지 않음")}</label>
  </section>`;
  const overviewChoiceCount=values=>values?.length?`${values.length}${t("개 선택됨","개 선택됨")}`:t("정하지 않음","정하지 않음");
  const overviewPlacement=characterPlacement(c,state.relationships);
  const overviewPlacementLabel=PLACEMENTS.find(([id])=>id===overviewPlacement)?.[state.uiLanguage==="en"?2:state.uiLanguage==="ja"?3:1]||"무작위 배치";
  const overviewLife=`<section class="character-overview-basic character-overview-life" aria-label="${esc(t("개요 생활 설정","개요 생활 설정"))}">
    <div class="overview-field overview-animation-placement"><b>${t("애니메이션 위치","애니메이션 위치")}</b><button type="button" data-character-placement-open><span>${esc(overviewPlacementLabel)}</span><i>⌄</i></button></div>
    <label class="overview-field overview-wake"><b>${t("기상 시각","기상 시각")}</b><input type="time" data-field="wake" value="${esc(c.wake||"07:30")}"></label>
    <label class="overview-field overview-wake-habit"><b>${t("기상 습관","기상 습관")}</b>${overviewSelect("wakeHabit",["알람을 듣고 천천히 일어남","알람이 울리기 전에 눈을 뜸","알람을 여러 번 미룸","눈을 뜨자마자 바로 일어남","이불 속에서 한참 뒹굶","일어나자마자 창문을 엶","일어나자마자 물을 마심","침대에서 오늘 일정을 확인함","비몽사몽한 채 방을 돌아다님","누가 깨워 줘야 일어남"],c.wakeHabit||"알람을 듣고 천천히 일어남")}</label>
    <label class="overview-field overview-sleep"><b>${t("취침 시각","취침 시각")}</b><input type="time" data-field="sleep" value="${esc(c.sleep||"00:30")}"></label>
    <label class="overview-field overview-sleep-habit"><b>${t("취침 습관","취침 습관")}</b>${overviewSelect("sleepHabit",["이불을 단정히 덮고 잠","이불을 걷어차며 잠","옆으로 웅크려 잠","팔다리를 뻗고 잠","베개를 끌어안고 잠","잠꼬대를 자주 함","뒤척임이 많음","아주 얌전히 잠","새벽에 자주 깸","코를 골며 깊이 잠"],c.sleepHabit||"이불을 단정히 덮고 잠")}</label>
    <label class="overview-field overview-life-adaptation"><b>${t("생활 환경 적응도","생활 환경 적응도")}</b>${overviewSelect("lifeAdaptation",["설정하지 않음","도시·현대 생활에 매우 익숙함","일상 도구와 제도를 무리 없이 이용함","익숙한 환경에서는 독립적으로 생활함","일부 일상 도구나 제도에 도움이 필요함","현재 환경의 생활 방식이 낯섦","다른 시대·문화권의 생활 방식에 익숙함","자연·야외 중심 생활에 익숙함"],c.lifeAdaptation||"설정하지 않음")}</label>
    <div class="overview-field overview-food-habit"><b>${t("식습관","식습관")}</b><button type="button" data-profile-tags="eatingHabits"><span>${esc(overviewChoiceCount(c.eatingHabits||[]))}</span><i>＋</i></button></div>
    <label class="overview-field overview-walking-style"><b>${t("걸음걸이","걸음걸이")}</b>${overviewSelect("walkingStyle",WALKING_STYLE_OPTIONS,c.walkingStyle||"보통 속도로 자연스럽게")}</label>
    <label class="overview-field overview-education"><b>${t("교육 수준","교육 수준")}</b>${overviewSelect("educationLevel",["설정하지 않음","기초 교육 과정 이수","중등 교육 과정 이수","고등 교육 과정 이수","전문·직업 교육 이수","대학 교육 이수","대학원 교육 이수","독학·비정규 교육 중심","도제·문하 교육 이수","종교·전통 교육 이수","현재 교육 과정 재학 중","세계관 고유 교육 체계"],c.educationLevel||"설정하지 않음")}</label>
    <label class="overview-field overview-openness"><b>${t("자율 이끌림","자율 이끌림")}</b>${overviewSelect("relationshipOpenness",["설정하지 않음 · 절대 끌리지 않음","연인이 없을 때만 취향이면 끌림","연인이 있어도 취향이면 끌릴 수 있음"],c.relationshipOpenness||"설정하지 않음 · 절대 끌리지 않음")}</label>
    <label class="overview-field overview-appearance-interest"><b>${t("상대의 외모를 보는 정도","상대의 외모를 보는 정도")}</b>${overviewSelect("appearanceInterest",["거의 보지 않음","조금 봄","보통","꽤 중요하게 봄","외모에 크게 끌림"],c.appearanceInterest||"보통")}</label>
    <div class="overview-field overview-attraction"><b>${t("선호하는 특성","선호하는 특성")}</b><button type="button" data-profile-tags="attractionTraits">${(c.attractionTraits||[]).length?esc(c.attractionTraits.slice(0,2).join(" · ")):t("정하지 않음","정하지 않음")}<i>＋</i></button></div>
    <div class="overview-field overview-disliked-attraction"><b>${t("비선호하는 특성","비선호하는 특성")}</b><button type="button" data-profile-tags="dislikedAttractionTraits">${(c.dislikedAttractionTraits||[]).length?esc(c.dislikedAttractionTraits.slice(0,2).join(" · ")):t("정하지 않음","정하지 않음")}<i>＋</i></button></div>
  </section>`;
  const overviewControlsFor=pane=>pane==="basic"
    ?`<nav class="character-overview-page-controls" aria-label="${esc(t("개요 페이지 이동","개요 페이지 이동"))}"><button type="button" data-character-pane="visual" aria-label="${esc(t("이전 페이지","이전 페이지"))}">◀</button><b>2</b><button type="button" data-character-overview-pane="life" aria-label="${esc(t("다음 페이지","다음 페이지"))}">▶</button></nav>`
    :`<nav class="character-overview-page-controls" aria-label="${esc(t("개요 페이지 이동","개요 페이지 이동"))}"><button type="button" data-character-overview-pane="basic" aria-label="${esc(t("이전 페이지","이전 페이지"))}">◀</button><b>3</b><button type="button" data-character-pane="body" aria-label="${esc(t("다음 페이지","다음 페이지"))}">▶</button></nav>`;
  const overviewPortrait=c.icon?`<img src="${esc(c.icon)}" alt="${esc(c.name)} 아이콘 미리보기">`:profileAvatar(c);
  const profileOverviewMarkup=pane=>`<section class="character-profile-overview-page" data-overview-page="${pane}"><div class="character-overview-portrait">${overviewPortrait}</div>${overviewControlsFor(pane)}${pane==="basic"?overviewBasic:overviewLife}</section>`;
  const profileOverviewBasicPane=profileOverviewMarkup("basic");
  const profileOverviewLifePane=profileOverviewMarkup("life");
  const profileOverviewPane=overviewPane==="basic"?profileOverviewBasicPane:profileOverviewLifePane;
  const bodyAppearance=c.bodyProfile?.appearance||{};
  const bodyBasics=`<section class="profile-basic-settings body-basic-settings"><div class="settings-section-heading"><span><small>QUICK SETTINGS</small><h3>간단 설정</h3></span><p>캐릭터를 알아보는 데 중요한 외형만 먼저 골라요.</p></div><div class="health-field-grid"><label>외모가 눈에 띄는 정도<select data-field="appearanceLevel">${["매우 추함","못생김","눈에 띄지 않음","수수함","보통","매력적임","매우 아름답거나 잘생김","시선을 사로잡음"].map(value=>`<option ${value===(c.appearanceLevel||"보통")?"selected":""}>${value}</option>`).join("")}</select></label>${profileSelect("체형","bodySize",BODY_SIZES,c.bodyProfile?.bodySize||"설정하지 않음")}${profileSelect("현재 머리색","appearance.hairColor",HAIR_COLORS,bodyAppearance.hairColor||"설정하지 않음")}${profileSelect("머리 기장","appearance.hairLength",HAIR_LENGTHS,bodyAppearance.hairLength||"설정하지 않음")}${profileSelect("화장 정도","appearance.makeupLevel",MAKEUP_LEVELS,bodyAppearance.makeupLevel||"하지 않음")}</div></section>`;
  const bodySelect=(path,values,current,extra="")=>`<select data-body-field="${path}" ${extra}>${values.map(value=>overviewOption(value,current)).join("")}</select>`;
  const bodyChoiceSummary=(values=[])=>values.length?`${values.slice(0,2).map(value=>t(value,value)).join(" · ")}${values.length>2?` +${values.length-2}`:""}`:t("정하지 않음","정하지 않음");
  const bodyChoiceOpener=(path,label,values)=>`<button type="button" data-open-body-choice="${esc(path)}"><span data-body-choice-summary>${esc(bodyChoiceSummary(values))}</span><i aria-hidden="true">＋</i><span class="sr-only">${esc(t("여러 개 선택 가능","여러 개 선택 가능"))}</span></button>`;
  const markOption=(options,current)=>[...options,...(!options.includes(current)&&current?[current]:[])].map(value=>overviewOption(value,current)).join("");
  const bodyMarkCollection=(field,label,locations,types,values)=>{
    const current=Array.isArray(values)?values:[];
    const rows=current.map((item,index)=>`<button type="button" data-open-body-mark="${field}" data-body-mark-index="${index}"><span>${esc(item?.name||`${label} ${index+1}`)}</span><i aria-hidden="true">⌄</i></button>`).join("");
    const dialogs=current.map((item,index)=>`<dialog class="character-body-mark-dialog" data-body-mark-dialog="${field}-${index}"><form method="dialog"><header><span><small>${field==="scars"?"SCAR DETAILS":"TATTOO DETAILS"}</small><b>${esc(item?.name||`${label} ${index+1}`)}</b></span><button type="submit" value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header><div class="body-mark-fields"><label><b>${t("이름","이름")}</b><input data-body-mark-field="name" data-body-mark-collection="${field}" data-body-mark-index="${index}" maxlength="40" value="${esc(item?.name||`${label} ${index+1}`)}"></label><label><b>${t("위치","위치")}</b><select data-body-mark-field="location" data-body-mark-collection="${field}" data-body-mark-index="${index}">${markOption(locations,item?.location||"기타 위치")}</select></label><label><b>${t("유형","유형")}</b><select data-body-mark-field="type" data-body-mark-collection="${field}" data-body-mark-index="${index}">${markOption(types,item?.type||"설정하지 않음")}</select></label><label><b>${t("이 흔적에 대한 생각","이 흔적에 대한 생각")}</b><select data-body-mark-field="attitude" data-body-mark-collection="${field}" data-body-mark-index="${index}">${markOption(BODY_MARK_ATTITUDE_OPTIONS,item?.attitude||"설정하지 않음")}</select></label></div><footer><button type="submit" value="close">${t("설정 완료","설정 완료")}</button></footer></form></dialog>`).join("");
    return `<fieldset class="body-figure-field body-${field}"><legend>${t(label,label)}</legend><div class="body-repeat-list">${rows||`<span class="body-repeat-empty">${t("없음","없음")}</span>`}</div><div class="body-repeat-actions"><button type="button" data-body-array-action="add" data-body-array-field="${field}" data-body-array-label="${label}" aria-label="${esc(t(`${label} 추가`,`${label} 추가`))}"><i>＋</i><span>${t("추가","추가")}</span></button><button type="button" data-body-array-action="remove" data-body-array-field="${field}" ${current.length?"":"disabled"} aria-label="${esc(t(`${label} 제거`,`${label} 제거`))}"><i>−</i><span>${t("제거","제거")}</span></button></div>${dialogs}</fieldset>`;
  };
  const medicationCollection=values=>{
    const current=Array.isArray(values)?values:[];
    const rows=current.map((item,index)=>`<button type="button" data-open-body-medication="${index}"><span>${esc(item?.name||`복용약 ${index+1}`)}</span><i aria-hidden="true">⌄</i></button>`).join("");
    const dialogs=current.map((item,index)=>`<dialog class="character-body-mark-dialog" data-body-medication-dialog="${index}"><form method="dialog"><header><span><small>MEDICATION DETAILS</small><b>${esc(item?.name||`복용약 ${index+1}`)}</b></span><button type="submit" value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header><div class="body-mark-fields"><label><b>${t("약 이름","약 이름")}</b><input data-body-medication-field="name" data-body-medication-index="${index}" maxlength="60" value="${esc(item?.name||`복용약 ${index+1}`)}"></label><label><b>${t("복용 목적·특성","복용 목적·특성")}</b><select data-body-medication-field="purpose" data-body-medication-index="${index}">${MEDICATION_PURPOSES.map(value=>overviewOption(value,item?.purpose||"설정하지 않음")).join("")}</select></label><label><b>${t("복용 주기","복용 주기")}</b><select data-body-medication-field="frequency" data-body-medication-index="${index}">${MEDICATION_FREQUENCIES.map(value=>overviewOption(value,item?.frequency||"설정하지 않음")).join("")}</select></label><label><b>${t("메모","메모")}</b><input data-body-medication-field="notes" data-body-medication-index="${index}" maxlength="160" value="${esc(item?.notes||"")}" placeholder="${esc(t("복용량·주의사항 등","복용량·주의사항 등"))}"></label></div><footer><button type="submit" value="close">${t("설정 완료","설정 완료")}</button></footer></form></dialog>`).join("");
    return `<div class="body-repeat-list body-medication-list">${rows||`<span class="body-repeat-empty">${t("없음","없음")}</span>`}</div><div class="body-repeat-actions"><button type="button" data-body-medication-action="add"><i>＋</i><span>${t("추가","추가")}</span></button><button type="button" data-body-medication-action="remove" ${current.length?"":"disabled"}><i>−</i><span>${t("제거","제거")}</span></button></div>${dialogs}`;
  };
  const bodyChoicePanel=(path,label,options,selected=[])=>{
    const selectedSet=new Set(selected);
    return `<section class="character-body-choice-panel" data-body-choice-panel="${esc(path)}" data-body-choice-title="${esc(t(label,label))}" hidden>${options.map(value=>`<button type="button" data-body-list="${esc(path)}" data-value="${esc(value)}" class="${selectedSet.has(value)?"on":""}"><span>${esc(t(value,value))}</span><i aria-hidden="true">✓</i></button>`).join("")}</section>`;
  };
  const bodyInlineChoice=(path,options,selected=[])=>{
    const selectedSet=new Set(selected);
    return `<div class="body-accessibility-chips">${options.map(value=>`<button type="button" data-body-list="${esc(path)}" data-value="${esc(value)}" class="${selectedSet.has(value)?"on":""}">${esc(t(value,value))}</button>`).join("")}</div>`;
  };
  const leftEyePreview=appearancePreviewColor(bodyAppearance.leftEyeColor,"#D8D1C2");
  const rightEyePreview=appearancePreviewColor(bodyAppearance.rightEyeColor,"#D8D1C2");
  const hairPreviewColor=appearancePreviewColor(bodyAppearance.hairColor,"#7F0000");
  const hairPreviewPath=hairCurlPreviewPath(bodyAppearance.hairTexture);
  const bodyGuide=`<svg class="character-body-guide" viewBox="0 0 412 917" aria-hidden="true" focusable="false" data-hair-curl-preview="${esc(bodyAppearance.hairTexture||"설정하지 않음")}"><ellipse data-eye-color-preview="left" cx="112" cy="235" rx="26" ry="26.5" fill="${leftEyePreview}"/><path d="M54 244C54 244 62 208 111.5 208C161 208 169 244 169 244" fill="none" stroke="#17120f" stroke-width="2.5"/><path d="M54 244.5C54 244.5 62 261.5 111.5 261.5C161 261.5 169 244.5 169 244.5" fill="none" stroke="#17120f" stroke-width="2.5"/><ellipse data-eye-color-preview="right" cx="278" cy="235" rx="26" ry="26.5" fill="${rightEyePreview}"/><path d="M220 244C220 244 228 208 277.5 208C327 208 335 244 335 244" fill="none" stroke="#17120f" stroke-width="2.5"/><path d="M220 244.5C220 244.5 228 261.5 277.5 261.5C327 261.5 335 244.5 335 244.5" fill="none" stroke="#17120f" stroke-width="2.5"/><path data-hair-shape-preview d="${hairPreviewPath}" fill="none" stroke="${hairPreviewColor}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const bodyChoiceDialog=`<dialog class="character-body-choice-dialog" data-body-choice-dialog><form method="dialog"><header><span><small>MULTI SELECT</small><b data-body-choice-dialog-title>${t("여러 개 선택 가능","여러 개 선택 가능")}</b></span><button type="submit" value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header><p>${t("여러 개 선택 가능","여러 개 선택 가능")}</p>${bodyChoicePanel("appearance.eyeFeatures","눈 특징",EYE_FEATURE_OPTIONS,bodyAppearance.eyeFeatures||[])}${bodyChoicePanel("appearance.hairStyles","헤어스타일",HAIR_STYLES,bodyAppearance.hairStyles||[])}${bodyChoicePanel("appearance.hairAccessories","머리 장식",HAIR_ACCESSORY_OPTIONS,bodyAppearance.hairAccessories||[])}${bodyChoicePanel("appearance.bodyHairLocations","체모 위치",BODY_HAIR_LOCATION_OPTIONS,bodyAppearance.bodyHairLocations||[])}${bodyChoicePanel("skinFeatures","피부 특징",SKIN_FEATURE_OPTIONS,c.bodyProfile?.skinFeatures||[])}${bodyChoicePanel("appearanceSummaries","총평",APPEARANCE_SUMMARY_OPTIONS,c.bodyProfile?.appearanceSummaries||[])}${bodyChoicePanel("overallImpressions","분위기",OVERALL_IMPRESSION_OPTIONS,c.bodyProfile?.overallImpressions||[])}<footer><button type="submit" value="close">${t("선택 완료","선택 완료")}</button></footer></form></dialog>`;
  const selectedSkinTone=c.bodyProfile?.skinTone||"뉴트럴톤 23호";
  const skinToneDialog=`<dialog class="character-skin-tone-dialog" data-skin-tone-dialog><form method="dialog"><header><span><small>SKIN PALETTE</small><b>${t("피부색 고르기","피부색 고르기")}</b></span><button type="submit" value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header><p>${t("인종이나 국가 대신 색의 밝기와 언더톤으로 고릅니다.","인종이나 국가 대신 색의 밝기와 언더톤으로 고릅니다.")}</p><div class="character-skin-tone-grid">${Object.entries(SKIN_TONE_COLORS).map(([undertone,colors])=>`<section><h3>${t(undertone,undertone)}</h3><div>${colors.map((color,index)=>{const shade=skinToneDepthLabel(SKIN_TONE_DEPTHS[index]),value=`${undertone} ${shade}호`,selected=skinToneParts(selectedSkinTone);return `<button type="button" data-skin-tone-choice="${esc(value)}" class="${selected.undertone===undertone&&selected.depth===SKIN_TONE_DEPTHS[index]?"on":""}" style="--skin-tone:${color}" aria-label="${esc(skinToneLabel(value))}"><i></i><span>${shade}</span></button>`}).join("")}</div></section>`).join("")}</div><footer><button type="submit" value="close">${t("선택 완료","선택 완료")}</button></footer></form></dialog>`;
  const bodyFigureSource=hasLdArt(c)?ldArtSource(c):c.photo||"";
  const bodyFigureImage=bodyFigureSource?`<img src="${esc(bodyFigureSource)}" alt="${esc(c.name)} ${esc(t("신체 일러스트","신체 일러스트"))}">`:`<span>${t("사진 추가하기","사진 추가하기")}</span>`;
  const imperial=state.measurementUnits==="imperial";
  const heightValue=c.bodyProfile?.heightCm?(imperial?(Number(c.bodyProfile.heightCm)/2.54).toFixed(1):c.bodyProfile.heightCm):"";
  const weightValue=c.bodyProfile?.weightKg?(imperial?(Number(c.bodyProfile.weightKg)*2.2046226218).toFixed(1):c.bodyProfile.weightKg):"";
  const bodyFigurePane=`<section class="character-body-svg-page character-body-figure-page" aria-label="${esc(c.name)} ${esc(t("신체 설정","신체 설정"))}">
    <label class="body-figure-field body-appearance-level"><b>${t("외모가 눈에 띄는 정도","외모가 눈에 띄는 정도")}</b>${overviewSelect("appearanceLevel",["매우 추함","못생김","눈에 띄지 않음","수수함","보통","매력적임","매우 아름답거나 잘생김","시선을 사로잡음"],c.appearanceLevel||"보통")}</label>
    <label class="body-figure-field body-appearance-awareness"><b>${t("자기 외형에 대한 인식","자기 외형에 대한 인식")}</b>${bodySelect("appearanceAwareness",["설정하지 않음","자신을 매우 추하다고 여김","자신을 못생겼다고 여김","외모에 자신이 없음","평범하다고 여김","나름 매력적이라고 여김","자신을 아름답거나 잘생겼다고 여김","외모에 강한 자신감이 있음"],c.bodyProfile?.appearanceAwareness||"설정하지 않음")}</label>
    <svg class="character-body-measure-guides" viewBox="0 0 412 917" aria-hidden="true"><path d="M58 218v257M58 218h27M58 475h27"/><path d="M323 367v43l-46 17"/><circle cx="277" cy="427" r="4"/></svg>
    <button type="button" class="body-figure-art ${bodyFigureSource?"has-image":"is-empty"}" data-image="${hasLdArt(c)?"ldImage":"photo"}">${bodyFigureImage}</button>
    <label class="body-figure-field body-height"><b>${t("키","키")}</b><span><input type="number" inputmode="decimal" min="${imperial?8:20}" max="${imperial?118:300}" step="0.1" data-body-measurement="heightCm" value="${esc(heightValue)}"><i>${imperial?"in":"cm"}</i></span></label>
    <label class="body-figure-field body-height-impression">${bodySelect("heightImpression",["설정하지 않음","키가 매우 작음","키가 작은 편","평균적인 키","키가 큰 편","키가 매우 큼"],c.bodyProfile?.heightImpression||"설정하지 않음")}</label>
    <label class="body-figure-field body-weight"><b>${t("몸무게","몸무게")}</b><span><input type="number" inputmode="decimal" min="${imperial?2:1}" max="${imperial?1102:500}" step="0.1" data-body-measurement="weightKg" value="${esc(weightValue)}"><i>${imperial?"lb":"kg"}</i></span></label>
    <label class="body-figure-field body-build">${bodySelect("bodySize",BODY_SIZES,c.bodyProfile?.bodySize||"설정하지 않음")}</label>
    <div class="body-figure-field body-overall"><b>${t("총평","총평")}</b>${bodyChoiceOpener("appearanceSummaries","총평",c.bodyProfile?.appearanceSummaries||[])}</div>
    <div class="body-figure-field body-atmosphere"><b>${t("분위기","분위기")}</b>${bodyChoiceOpener("overallImpressions","분위기",c.bodyProfile?.overallImpressions||[])}</div>
    <div class="body-figure-field body-skin-tone"><b>${t("피부","피부")}</b><button type="button" data-open-skin-tone><i style="--skin-tone:${skinToneColor(selectedSkinTone)}"></i><span>${esc(skinToneLabel(selectedSkinTone))}</span></button></div>
    <div class="body-figure-field body-skin-features"><b>${t("피부 특징","피부 특징")}</b>${bodyChoiceOpener("skinFeatures","피부 특징",c.bodyProfile?.skinFeatures||[])}</div>
    ${bodyMarkCollection("scars","흉터",SCAR_LOCATION_OPTIONS,SCAR_TYPE_OPTIONS,c.bodyProfile?.scars)}
    ${bodyMarkCollection("tattoos","문신",TATTOO_LOCATION_OPTIONS,TATTOO_TYPE_OPTIONS,c.bodyProfile?.tattoos)}
    <nav class="character-book-page-controls body-controls" aria-label="${esc(t("신체 페이지 이동","신체 페이지 이동"))}"><button type="button" data-character-pane="profile" data-character-overview-target="life" aria-label="${esc(t("이전 페이지","이전 페이지"))}">◀</button><b>4</b><button type="button" data-character-body-pane="appearance" aria-label="${esc(t("다음 페이지","다음 페이지"))}">▶</button></nav>
    ${bodyChoiceDialog}${skinToneDialog}
  </section>`;
  const bodyAppearancePane=`<section class="character-body-svg-page character-body-appearance-page" aria-label="${esc(c.name)} ${esc(t("신체 설정","신체 설정"))}">
    ${bodyGuide}
    <section class="character-body-eye-card">
      <label class="body-svg-field body-left-eye"><b>${t("왼쪽 눈","왼쪽 눈")}</b>${bodySelect("appearance.leftEyeColor",EYE_COLORS,bodyAppearance.leftEyeColor||"설정하지 않음")}</label>
      <label class="body-svg-field body-left-vision"><b>${t("왼쪽 시력","왼쪽 시력")}</b>${bodySelect("appearance.leftVision",["정상 시력","저시력","거의 보이지 않음","보이지 않음"],bodyAppearance.leftVision||"정상 시력")}</label>
      <label class="body-svg-field body-right-eye"><b>${t("오른쪽 눈","오른쪽 눈")}</b>${bodySelect("appearance.rightEyeColor",EYE_COLORS,bodyAppearance.rightEyeColor||"설정하지 않음")}</label>
      <label class="body-svg-field body-right-vision"><b>${t("오른쪽 시력","오른쪽 시력")}</b>${bodySelect("appearance.rightVision",["정상 시력","저시력","거의 보이지 않음","보이지 않음"],bodyAppearance.rightVision||"정상 시력")}</label>
      <div class="body-svg-field body-eye-features"><b>${t("눈 특징","눈 특징")}</b>${bodyChoiceOpener("appearance.eyeFeatures","눈 특징",bodyAppearance.eyeFeatures||[])}</div>
      <label class="body-svg-field body-glasses"><b>${t("안경","안경")}</b>${bodySelect("appearance.glasses",["착용하지 않음","필요할 때만 착용","안경 착용","선글라스 착용"],bodyAppearance.glasses||"착용하지 않음")}</label>
    </section>
    <section class="character-body-hair-card">
      <label class="body-svg-field body-hair-color"><b>${t("현재 머리색","현재 머리색")}</b>${bodySelect("appearance.hairColor",HAIR_COLORS,bodyAppearance.hairColor||"설정하지 않음")}</label>
      <label class="body-svg-field body-hair-origin"><b>${t("머리색 설정","머리색 설정")}</b>${bodySelect("appearance.hairColorOrigin",["자연 모발","염색","부분 염색","가발·헤어피스","설정하지 않음"],bodyAppearance.hairColorOrigin||"설정하지 않음")}</label>
      <label class="body-svg-field body-natural-hair"><b>${t("본래 머리색","본래 머리색")}</b>${bodySelect("appearance.naturalHairColor",HAIR_COLORS,bodyAppearance.naturalHairColor||"설정하지 않음",bodyAppearance.hairColorOrigin==="자연 모발"?'disabled aria-disabled="true" title="자연 모발은 현재 머리색과 자동으로 같아집니다"':"")}</label>
      <label class="body-svg-field body-hair-length"><b>${t("머리 기장","머리 기장")}</b>${bodySelect("appearance.hairLength",HAIR_LENGTHS,bodyAppearance.hairLength||"설정하지 않음")}</label>
      <label class="body-svg-field body-hair-curl"><b>${t("곱슬기","곱슬기")}</b>${bodySelect("appearance.hairTexture",HAIR_CURL_PATTERNS,bodyAppearance.hairTexture||"설정하지 않음")}</label>
      <label class="body-svg-field body-hair-condition"><b>${t("머릿결","머릿결")}</b>${bodySelect("appearance.hairCondition",HAIR_CONDITIONS,bodyAppearance.hairCondition||"설정하지 않음")}</label>
      <div class="body-svg-field body-hair-style"><b>${t("헤어스타일","헤어스타일")}</b>${bodyChoiceOpener("appearance.hairStyles","헤어스타일",bodyAppearance.hairStyles||[])}</div>
      <div class="body-svg-field body-hair-ornament"><b>${t("머리 장식","머리 장식")}</b>${bodyChoiceOpener("appearance.hairAccessories","머리 장식",bodyAppearance.hairAccessories||[])}</div>
      <label class="body-svg-field body-hair-amount"><b>${t("체모 정도","체모 정도")}</b>${bodySelect("appearance.bodyHairAmount",BODY_HAIR_AMOUNTS,bodyAppearance.bodyHairAmount||"설정하지 않음")}</label>
      <div class="body-svg-field body-hair-locations"><b>${t("체모 위치","체모 위치")}</b>${bodyChoiceOpener("appearance.bodyHairLocations","체모 위치",bodyAppearance.bodyHairLocations||[])}</div>
    </section>
    <nav class="character-book-page-controls body-controls" aria-label="${esc(t("신체 페이지 이동","신체 페이지 이동"))}"><button type="button" data-character-body-pane="figure" aria-label="${esc(t("이전 페이지","이전 페이지"))}">◀</button><b>5</b><button type="button" data-character-body-pane="accessibility" aria-label="${esc(t("다음 페이지","다음 페이지"))}">▶</button></nav>
    ${bodyChoiceDialog}
  </section>`;
  const bodyAccessibilityPane=`<section class="character-body-svg-page character-body-accessibility-page" aria-label="${esc(c.name)} ${esc(t("건강·접근성 설정","건강·접근성 설정"))}">
    <section class="body-accessibility-device body-wheelchair"><b>${t("휠체어","휠체어")}</b>${bodySelect("wheelchair.type",WHEELCHAIR_TYPES,c.bodyProfile?.wheelchair?.type||"사용하지 않음")}${bodySelect("wheelchair.pattern",WHEELCHAIR_PATTERNS,c.bodyProfile?.wheelchair?.pattern||"설정하지 않음")}</section>
    <section class="body-accessibility-device body-hearing"><b>${t("청각장애·난청","청각장애·난청")}</b>${bodySelect("hearing.side",["설정하지 않음","왼쪽","오른쪽","양쪽"],c.bodyProfile?.hearing?.side||"설정하지 않음")}${bodySelect("hearing.level",HEARING_LEVELS,c.bodyProfile?.hearing?.level||"설정하지 않음")}</section>
    <section class="body-accessibility-device body-prosthetic-arm"><b>${t("의수","의수")}</b>${bodySelect("prostheticArm.side",PROSTHETIC_SIDES,c.bodyProfile?.prostheticArm?.side||"사용하지 않음")}${bodySelect("prostheticArm.type",PROSTHETIC_ARM_TYPES,c.bodyProfile?.prostheticArm?.type||"설정하지 않음")}</section>
    <section class="body-accessibility-device body-prosthetic-leg"><b>${t("의족","의족")}</b>${bodySelect("prostheticLeg.side",PROSTHETIC_SIDES,c.bodyProfile?.prostheticLeg?.side||"사용하지 않음")}${bodySelect("prostheticLeg.type",PROSTHETIC_LEG_TYPES,c.bodyProfile?.prostheticLeg?.type||"설정하지 않음")}</section>
    <section class="body-accessibility-choice body-health-conditions"><b>${t("만성질환·건강 관리","만성질환·건강 관리")}</b>${bodyInlineChoice("healthConditions",HEALTH_CONDITIONS,c.bodyProfile?.healthConditions||[])}</section>
    <section class="body-accessibility-choice body-hearing-supports"><b>${t("청각 접근 방식","청각 접근 방식")}</b>${bodyInlineChoice("hearing.supports",HEARING_SUPPORT_OPTIONS,c.bodyProfile?.hearing?.supports||[])}</section>
    <section class="body-accessibility-choice body-vision-supports"><b>${t("시각 접근 방식","시각 접근 방식")}</b>${bodyInlineChoice("vision.supports",VISION_SUPPORT_OPTIONS,c.bodyProfile?.vision?.supports||[])}</section>
    <section class="body-accessibility-device body-hospital"><b>${t("병원 방문","병원 방문")}</b>${bodySelect("hospitalVisitFrequency",["자동 · 설정에 맞춤","정기 검진 때만","한 달에 한 번 이하","한 달에 여러 번","주 1회 이상","필요할 때 비정기적으로"],c.bodyProfile?.hospitalVisitFrequency||"자동 · 설정에 맞춤")}${bodySelect("hospitalVisitPurpose",HOSPITAL_PURPOSES,c.bodyProfile?.hospitalVisitPurpose||"설정하지 않음")}</section>
    <section class="body-accessibility-device body-medications"><b>${t("복용중인 약","복용중인 약")}</b>${medicationCollection(c.bodyProfile?.medications)}</section>
    <nav class="character-book-page-controls body-controls" aria-label="${esc(t("신체 페이지 이동","신체 페이지 이동"))}"><button type="button" data-character-body-pane="appearance" aria-label="${esc(t("이전 페이지","이전 페이지"))}">◀</button><b>6</b><button type="button" data-character-pane="wardrobe" aria-label="${esc(t("다음 페이지","다음 페이지"))}">▶</button></nav>
  </section>`;
  const bodyPane=state.characterBodyPane==="appearance"?bodyAppearancePane:state.characterBodyPane==="accessibility"?bodyAccessibilityPane:bodyFigurePane;
  const bookPageControls=(page,previous,next)=>`<nav class="character-book-page-controls book-section-controls" aria-label="${esc(t("페이지 이동","페이지 이동"))}"><button type="button" ${previous} aria-label="${esc(t("이전 페이지","이전 페이지"))}">◀</button><b>${page}</b><button type="button" ${next} aria-label="${esc(t("다음 페이지","다음 페이지"))}">▶</button></nav>`;
  const bookField=(label,field,options,current)=>`<label class="book-form-field"><b>${t(label,label)}</b><select data-field="${field}">${options.map(value=>overviewOption(value,current)).join("")}</select></label>`;
  const bookFieldContinuation=(label,field,options,current)=>`<label class="book-form-field book-form-continuation"><span class="sr-only">${t(label,label)}</span><select aria-label="${esc(t(label,label))}" data-field="${field}">${options.map(value=>overviewOption(value,current)).join("")}</select></label>`;
  const bookListSummary=(values,kind="")=>{
    if(!Array.isArray(values)||!values.length)return t("정하지 않음","정하지 않음");
    const names=values.slice(0,2).map(value=>t(value,value)).join(" · "),rest=values.length-2;
    const detail=`${names}${rest>0?` +${rest}`:""}`;
    return kind?`${t(kind,kind)} · ${detail}`:detail;
  };
  const bookListButton=(label,field,values,path=field)=>`<div class="book-form-field"><b>${t(label,label)}</b><button type="button" data-open-book-list="${field}" data-book-list-path="${esc(path)}"><span>${bookListSummary(values)}</span><i aria-hidden="true">${t("선택","선택")}</i></button></div>`;
  const bookListContinuation=(label,field,values,path=field)=>`<div class="book-form-field book-form-continuation"><button type="button" aria-label="${esc(t(label,label))}" data-open-book-list="${field}" data-book-list-path="${esc(path)}"><span>${bookListSummary(values)}</span><i aria-hidden="true">${t("선택","선택")}</i></button></div>`;
  const wardrobePane=`<section class="character-book-form-page wardrobe-book-page">
    <div class="book-form-grid">
      <div class="book-form-stack book-form-combined"><label class="book-form-field"><b>${t("화장 정도","화장 정도")}</b>${bodySelect("appearance.makeupLevel",MAKEUP_LEVELS,bodyAppearance.makeupLevel||"하지 않음")}</label>${bookListContinuation("화장 스타일","makeupStyles",bodyAppearance.makeupStyles||[],"bodyProfile.appearance.makeupStyles")}</div>
      <div class="book-form-stack book-form-combined">${bookField("성형·외형 의료 시술","cosmeticSurgery",["설정하지 않음","하지 않음","상담만 받음","비수술 시술","수술 경험 있음"],c.cosmeticSurgery||bodyAppearance.cosmeticSurgery||"설정하지 않음")}${bookListContinuation("시술 부위","cosmeticSurgeryAreas",bodyAppearance.cosmeticSurgeryAreas||[],"bodyProfile.appearance.cosmeticSurgeryAreas")}</div>
      <div class="book-form-stack book-form-combined">${bookField("패션","fashionSense",["패션에 전혀 관심 없음","조합을 자주 틀림","무난하게 입음","센스 있게 입음","스타일링에 능숙함"],c.fashionSense||"무난하게 입음")}${bookListContinuation("의상 태그","favoriteFashionStyles",c.favoriteFashionStyles||[])}</div>
      ${bookField("평소 외모 관리","appearanceCareLevel",["거의 신경 쓰지 않음","필요한 만큼만","기본적으로 단정하게","꾸준히 관리함","세심하게 공들임"],c.appearanceCareLevel||"기본적으로 단정하게")}
      ${bookField("액세서리 착용","accessoryUse",["착용하지 않음","착용함"],c.accessoryUse||"착용하지 않음")}
      <div class="book-form-stack book-form-combined"><label class="book-form-field"><b>${t("미용실 방문 빈도","미용실 방문 빈도")}</b>${bodySelect("appearance.salonFrequency",SALON_FREQUENCIES,bodyAppearance.salonFrequency||"자동 · 설정에 맞춤")}</label>${bookFieldContinuation("미용실에서 하는 일","salonPurpose",["설정하지 않음","커트","커트·염색","커트·염색·펌","두피·모발 관리까지"],c.salonPurpose||"설정하지 않음")}</div>
      ${bookField("옷을 고르는 기준","clothingPriority",["가격","편안함","실용성","상황에 맞춤","디자인","브랜드","유행"],c.clothingPriority||"가격")}
      <div class="book-form-stack">${bookField("옷가게 방문 빈도","clothingShopFrequency",["자동 · 설정에 맞춤","거의 가지 않음","계절마다","매달","월 2회 이상"],c.clothingShopFrequency||"자동 · 설정에 맞춤")}<label class="book-check-field"><span>${t("구매한 옷을 실제로 입고 다님","구매한 옷을 실제로 입고 다님")}</span><input type="checkbox" data-field="wearsPurchasedClothes" ${c.wearsPurchasedClothes!==false?"checked":""}></label></div>
      <div class="book-form-stack">${bookField("유행 민감도","trendSensitivity",["유행에 무관심","유행을 늦게 받아들임","필요한 것만 따름","유행을 즐김","유행의 선도자"],c.trendSensitivity||"필요한 것만 따름")}${bookField("유행을 따르는 정도","trendFollowing",["전혀 따르지 않음","조금만 반영","상황에 따라","적극적으로 반영","새 유행을 먼저 시도"],c.trendFollowing||"상황에 따라")}</div>
      <div class="book-form-stack">${bookField("신발","shoeStyle",["설정하지 않음","운동화","구두","부츠","샌들","하이힐"],c.shoeStyle||"설정하지 않음")}${bookField("실내","indoorFootwear",["맨발","양말","실내화","신발을 벗지 않음"],c.indoorFootwear||"맨발")}</div>
    </div>${bookPageControls(7,'data-character-body-pane="accessibility"','data-character-pane="personality" data-character-personality-pane="core"')}
  </section>`;
  const personalityCoreFields=[
    ["외향과 내향","socialStyle",["혼자가 편함","낯을 가림","조용히 어울림","먼저 다가감","무리의 중심"]],
    ["감각과 직관","perceptionStyle",["눈앞의 현실 중시","구체적인 편","균형형","가능성 중시","직관과 상상 중시"]],
    ["사고와 감정","decisionStyle",["논리 우선","이성적인 편","균형형","마음을 살핌","공감 우선"]],
    ["인식과 판단","planningStyle",["즉흥적","유연한 편","상황에 따라","미리 정리함","계획적"]],
    ["행동을 전환하는 방식","activityTempo",["한 가지씩 차분히","잠깐 쉬고 다음 일","상황에 따라","생각나면 바로 움직임","여러 일을 오감"]],
    ["남에게 관여하는 정도","interference",["방관자","요청할 때만 도움","적당히 관여","챙기고 확인함","강하게 간섭함","통제광"]],
    ["깔끔한 정도","neatness",["어질러도 편함","조금 느슨함","보통","정돈을 좋아함","흐트러짐을 못 참음"]],
    ["게으름·근면함","diligence",["매우 느긋함","필요할 때만 움직임","보통","부지런함","쉴 새 없이 움직임"]],
    ["갈등 대응","conflictStyle",["피하는 편","시간을 두고 말함","대화로 해결","바로 따짐","끝까지 결론을 냄"]],
    ["애정 표현","affectionStyle",["표현이 서툼","조용히 곁에 있음","말로 표현","행동으로 표현","적극적으로 챙김"]],
    ["생활 에너지","energyRhythm",["집에서 충전","느긋한 편","상황에 따라","활동적인 편","가만히 못 있음"]],
    ["유머·장난 성향","humorStyle",["장난을 거의 하지 않음","건조한 농담만 함","가끔 장난을 즐김","장난을 즐김","유머로 분위기를 이끎"]]
  ];
  const personalityCorePane=`<section class="character-book-form-page personality-book-page"><div class="personality-type-book"><b>${t("이 캐릭터의 전체적인 유형","이 캐릭터의 전체적인 유형")}</b><div>${PERSONALITY_TYPES.map(value=>`<button type="button" data-personality-type="${value}" class="${(c.personalityTypes||[]).includes(value)?"on":""}">${value}</button>`).join("")}</div></div><div class="book-form-grid">${personalityCoreFields.map(([label,field,options])=>bookField(label,field,options,c[field]||options[0])).join("")}</div>${bookPageControls(8,'data-character-pane="wardrobe"','data-character-personality-pane="emotion"')}</section>`;
  const personalityEmotionFields=[
    ["평소 정서의 방향","emotionalBaseline",["매우 낙천적임","낙천적인 편","대체로 밝은 편","쾌활한 편","열정적인 편","다정한 편","유혹적인 편","호기심 많은 편","차분한 편","현실적인 편","무덤덤한 편","냉소적인 편","까칠한 편","예민한 편","걱정이 많은 편","불안한 편","침울한 편","비관적인 편","분노를 품은 편"]],
    ["기분 변화 폭","moodVolatility",["거의 흔들리지 않음","안정적인 편","상황에 따라 달라짐","변화가 잦은 편","변화 폭이 큼"]],
    ["감정이 남는 시간","moodPersistence",["금방 지나감","짧게 남음","보통","오래 남음","매우 오래 남음"]],
    ["좋은 일이 있을 때","positiveMoodResponse",["조용히 만족함","미소와 말로 표현함","주변과 기쁨을 나눔","기쁨이 크게 드러남","좋은 일도 먼저 의심함"]],
    ["힘들 때 보이는 반응","stressMoodResponse",["잠시 거리를 둠","말수가 줄어듦","걱정이 많아짐","예민해짐","화부터 남","도움을 요청함","아무렇지 않은 척함"]],
    ["기분을 회복하는 방식","moodRecoveryStyle",["혼자 정리하며 회복","가까운 사람과 이야기하며 회복","쉬거나 자면서 회복","취미에 몰두하며 회복","문제를 해결해야 회복","시간이 지나야 회복"]],
    ["분노할 때 보이는 반응","angerResponse",["차분히 이유를 확인함","말수가 차갑게 줄어듦","즉시 잘못을 따짐","목소리가 커짐","자리를 피해 식힘","울컥하지만 말을 고름","해결책을 분명히 요구함"]],
    ["유혹·호감 신호를 받을 때","flirtResponse",["눈치채지 못함","알아도 모른 척함","당황해 거리를 둠","은근히 받아줌","장난스럽게 맞받음","직접 호응함","상대를 경계함"]],
    ["감정 자극 민감도","emotionalSensitivity",["매우 둔감함","둔감한 편","보통","예민한 편","매우 예민함"]],
    ["주변 감정에 물드는 정도","emotionalContagion",["거의 물들지 않음","가까운 사람에게만 물듦","상황에 따라 물듦","쉽게 물드는 편","매우 쉽게 물듦"]]
  ];
  const personalityEmotionPane=`<section class="character-book-form-page personality-emotion-book-page"><div class="personality-emotion-content"><div class="personality-emotion-heading"><small>EMOTIONAL TEMPERAMENT</small><h2>${t("기분과 정서 성향","기분과 정서 성향")}</h2><p>${t("현재 기분을 고정하는 설정이 아니라, 같은 일을 겪어도 이 캐릭터답게 받아들이고 회복하도록 만드는 기준이에요.","현재 기분을 고정하는 설정이 아니라, 같은 일을 겪어도 이 캐릭터답게 받아들이고 회복하도록 만드는 기준이에요.")}</p></div><div class="book-form-grid personality-emotion-grid">${personalityEmotionFields.map(([label,field,options])=>bookField(label,field,options,c[field]||options[0])).join("")}${bookField("감정 표현의 크기","emotionalExpression",["표정 변화가 거의 없음","감정을 잘 드러내지 않음","상황에 따라 표현함","표현이 풍부함","감정이 바로 드러남"],c.emotionalExpression||"상황에 따라 표현함")}${bookField("충동을 참는 정도","impulseControl",["매우 잘 참음","대체로 참음","가끔 욱하지만 멈춤","쉽게 욱함","거의 참지 않음"],c.impulseControl||"가끔 욱하지만 멈춤")}</div>${cognitiveAccessDialog(c)}</div>${bookPageControls(9,'data-character-personality-pane="core"','data-character-pane="taste" data-character-taste-pane="categories"')}</section>`;
  // 이전 버전에서 저장된 details 상태도 합쳐진 9페이지로 자연스럽게 연다.
  const personalityBookPane=["details","emotion"].includes(state.characterPersonalityPane)?personalityEmotionPane:personalityCorePane;
  const tasteCategories=[['좋아하는 장르','favoriteStoryGenres'],['좋아하는 음식','foodPreferences'],['좋아하는 음료','drinks'],['좋아하는 음악','musicGenres'],['좋아하는 영상','favoriteVideoGenres'],['좋아하는 게임','favoriteGameGenres'],['좋아하는 향','favoriteScentNotes'],['좋아하는 동물','favoriteAnimals'],['좋아하는 전자기기','favoriteElectronics'],['좋아하는 무기','favoriteWeapons'],['좋아하는 책','favoriteBooks']];
  const dislikedTasteCategories=[['싫어하는 장르','dislikedStoryGenres'],['싫어하는 음식','dislikedFoodPreferences'],['싫어하는 음료','dislikedDrinks'],['싫어하는 음악','dislikedMusicGenres'],['싫어하는 영상','dislikedVideoGenres'],['싫어하는 게임','dislikedGameGenres'],['싫어하는 향','dislikedScentNotes'],['싫어하는 동물','dislikedAnimals'],['싫어하는 전자기기','dislikedElectronics'],['싫어하는 무기','dislikedWeapons'],['싫어하는 책','dislikedBooks']];
  const catalogTasteKinds=[['좋아하는 음식 · 사전','food'],['좋아하는 음료 · 사전','drink'],['좋아하는 음악 · 사전','music'],['좋아하는 밴드 · 사전','idol'],['좋아하는 책 · 사전','book'],['좋아하는 영화 · 사전','movie'],['좋아하는 게임 · 사전','game'],['좋아하는 향수 · 사전','perfume'],['좋아하는 취미용품 · 사전','hobby'],['좋아하는 전자기기 · 사전','electronics'],['좋아하는 무기 · 사전','weapon'],['좋아하는 동물 · 사전','animal']];
  const catalogSelectionSummary=(kind,ids)=>{
    if(!Array.isArray(ids)||!ids.length)return t("정하지 않음","정하지 않음");
    const byId=new Map((state.catalog?.[kind]||[]).map(item=>[String(item.id),String(item.name||"").trim()]));
    const names=ids.map(id=>byId.get(String(id))).filter(Boolean),rest=ids.length-Math.min(2,names.length);
    if(!names.length)return state.uiLanguage==="en"?`${ids.length} selected`:state.uiLanguage==="ja"?`${ids.length}個選択`:`${ids.length}개 선택됨`;
    return `${names.slice(0,2).join(" · ")}${rest>0?` +${rest}`:""}`;
  };
  const catalogSelectionButton=(label,kind,collection)=>`<div class="book-form-field"><b>${t(label,label)}</b><button type="button" data-open-book-catalog="${kind}" data-book-catalog-mode="${collection}"><span>${esc(catalogSelectionSummary(kind,c[collection]?.[kind]||[]))}</span><i aria-hidden="true">＋</i></button></div>`;
  const tasteMenuButton=(label,attrs,summary="")=>`<button type="button" class="taste-menu-action" ${attrs}><span><b>${t(label,label)}</b>${summary?`<small>${esc(summary)}</small>`:""}</span><i aria-hidden="true">＋</i></button>`;
  const tasteBookPane=`<section class="character-book-form-page taste-book-page taste-menu-page"><div class="taste-menu-grid">${tasteMenuButton("관심사 선택",'data-open-book-list="interests"',bookListSummary(c.interests||[],"관심사"))}${tasteMenuButton("취미 선택",'data-open-book-list="hobbies"',bookListSummary(c.hobbies||[],"취미"))}${tasteMenuButton("기술 숙련 선택",'data-open-book-list="skills"',bookListSummary(c.skills||[],"기술 숙련"))}${tasteMenuButton("좋아하는 것 선택",'data-open-taste-group="favorites"')}${tasteMenuButton("싫어하는 것 선택",'data-open-taste-group="dislikes"')}${tasteMenuButton("소지품 선택",'data-open-taste-group="inventory"')}</div>${bookPageControls(10,'data-character-personality-pane="emotion" data-character-pane="personality"','data-character-pane="closet"')}</section>`;
  const closetOwned=new Set(c.inventory?.fashion||[]),closetItems=(state.catalog?.fashion||[]).filter(item=>closetOwned.has(item.id));
  const closetBookPane=`<section class="character-book-form-page closet-book-page"><div class="closet-book-toolbar"><label><span class="sr-only">${t("검색","검색")}</span><input type="search" data-closet-search placeholder="${t("옷 검색","옷 검색")}"></label><nav><button type="button" class="on" data-closet-filter="all">${t("전체","전체")}</button><button type="button" data-closet-filter="uniform">${t("유니폼","유니폼")}</button><button type="button" data-closet-filter="formal">${t("격식","격식")}</button></nav></div><div class="closet-book-frame"><div class="closet-book-paper"><div class="closet-book-count"><b>${t("총","총")} ${closetItems.length}</b><small>${t("상황과 드레스코드에 맞춰 자동 선택","상황과 드레스코드에 맞춰 자동 선택")}</small></div><div class="closet-book-grid">${closetItems.map(item=>`<button type="button" data-edit-clothing="${item.id}" data-closet-card data-closet-search-text="${esc(`${item.name} ${(item.occasionTags||[]).join(" ")} ${(item.flairs||[]).join(" ")}`.toLowerCase())}" data-uniform="${item.requiredUniform?"true":"false"}" data-formal="${/격식|정장/.test(item.formality||"")?"true":"false"}"><span class="closet-book-art">${item.iconImage||item.image?`<img src="${esc(item.iconImage||item.image)}" alt="">`:`<i>👕</i>`}</span><b>${esc(item.name)}</b><small>${esc([item.warmth,item.formality,item.comfort].filter(Boolean).join(" · "))}</small></button>`).join("")}<button type="button" class="closet-book-add" data-new-clothing><span>＋</span><b>${t("옷 추가","옷 추가")}</b></button><p class="closet-book-no-results" hidden>${t("검색 결과가 없어요.","검색 결과가 없어요.")}</p></div></div></div>${bookPageControls(11,'data-character-pane="taste"','disabled')}</section>`;
  const tasteCategoryDialog=(mode,title,buttons)=>`<dialog class="character-body-choice-dialog taste-category-dialog" data-taste-category-dialog="${mode}"><form method="dialog"><header><span><small>TASTE MENU</small><b>${t(title,title)}</b></span><button value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header><div class="taste-category-list">${buttons}</div><footer><button value="close">${t("닫기","닫기")}</button></footer></form></dialog>`;
  const favoriteTasteButtons=tasteCategories.map(([label,field])=>bookListButton(label,field,c[field]||[])).join("")+catalogTasteKinds.map(([label,kind])=>catalogSelectionButton(label,kind,"favorites")).join("");
  const dislikedTasteButtons=dislikedTasteCategories.map(([label,field])=>bookListButton(label,field,c[field]||[])).join("")+catalogTasteKinds.map(([label,kind])=>catalogSelectionButton(label.replace("좋아하는","싫어하는"),kind,"dislikes")).join("");
  const tasteDialogs=`${tasteCategoryDialog("favorites","좋아하는 것 선택",favoriteTasteButtons)}${tasteCategoryDialog("dislikes","싫어하는 것 선택",dislikedTasteButtons)}${tasteCategoryDialog("inventory","소지품 선택",catalogTasteKinds.map(([label,kind])=>catalogSelectionButton(label.replace("좋아하는","보유한"),kind,"inventory")).join(""))}`;
  const bookListSources={
    makeupStyles:{path:"bodyProfile.appearance.makeupStyles",groups:{"화장 스타일":MAKEUP_STYLES}},cosmeticSurgeryAreas:{path:"bodyProfile.appearance.cosmeticSurgeryAreas",groups:{"시술 부위":SURGERY_AREAS}},
    favoriteFashionStyles:{groups:WARDROBE_TAG_GROUPS},
    interests:{groups:{"관심사":INTERESTS}},hobbies:{groups:{"취미":HOBBIES}},favoriteStoryGenres:{groups:{"장르":storyGenres}},skills:{groups:{"기술":["요리","악기","그림","글쓰기","운동","춤","연기","공예","프로그래밍","외국어","정비","의료"]}},foodPreferences:{groups:{"음식":FOOD_PREFERENCES}},drinks:{groups:{"음료":DRINKS}},musicGenres:{groups:{"음악":MUSIC}},favoriteVideoGenres:{groups:{"영상":videoFormats}},favoriteGameGenres:{groups:{"게임":gameGenres}},favoriteScentNotes:{groups:{"향":PERFUME_NOTES}},favoriteAnimals:{groups:{"동물":["개","고양이","새","토끼","파충류","어류","말","야생동물"]}},favoriteElectronics:{groups:{"전자기기":["스마트폰","컴퓨터","게임기","카메라","오디오","스마트홈","웨어러블"]}},favoriteWeapons:{groups:{"무기":["검","활","총기","창","도끼","둔기","마법 도구"]}},favoriteBooks:{groups:{"책":storyGenres}},
    dislikedStoryGenres:{groups:{"장르":storyGenres}},dislikedFoodPreferences:{groups:{"음식":FOOD_PREFERENCES}},dislikedDrinks:{groups:{"음료":DRINKS}},dislikedMusicGenres:{groups:{"음악":MUSIC}},dislikedVideoGenres:{groups:{"영상":videoFormats}},dislikedGameGenres:{groups:{"게임":gameGenres}},dislikedScentNotes:{groups:{"향":PERFUME_NOTES}},dislikedAnimals:{groups:{"동물":["개","고양이","새","토끼","파충류","어류","말","야생동물"]}},dislikedElectronics:{groups:{"전자기기":["스마트폰","컴퓨터","게임기","카메라","오디오","스마트홈","웨어러블"]}},dislikedWeapons:{groups:{"무기":["검","활","총기","창","도끼","둔기","마법 도구"]}},dislikedBooks:{groups:{"책":storyGenres}}
  };
  const valueAtPath=(object,path)=>String(path||"").split(".").reduce((value,key)=>value?.[key],object);
  const bookListDialog=`<dialog class="character-body-choice-dialog character-book-list-dialog" data-book-list-dialog><form method="dialog"><header><span><small>MULTI SELECT</small><b data-book-list-title>${t("여러 개 선택 가능","여러 개 선택 가능")}</b></span><button type="submit" value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header><p>${t("분류별로 살펴보고 여러 개를 선택할 수 있어요.","분류별로 살펴보고 여러 개를 선택할 수 있어요.")}</p>${Object.entries(bookListSources).map(([field,source])=>{const path=source.path||field,selected=new Set(valueAtPath(c,path)||[]),groups=Object.entries(source.groups);return `<section class="character-body-choice-panel book-list-group-panel" data-book-list-panel="${field}" data-book-list-title-value="${field}" hidden>${groups.map(([group,options])=>`<div class="book-choice-group">${groups.length>1?`<h3>${esc(t(group,group))}</h3>`:""}<div>${options.map(value=>`<button type="button" data-book-list-choice="${field}" data-book-list-path="${esc(path)}" data-value="${esc(value)}" class="${selected.has(value)?"on":""}"><span>${esc(t(value,value))}</span><i aria-hidden="true">✓</i></button>`).join("")}</div></div>`).join("")}</section>`}).join("")}<footer><button type="submit" value="apply">${t("선택 완료","선택 완료")}</button></footer></form></dialog>`;
  const bookCatalogDialog=`<dialog class="character-body-choice-dialog character-book-catalog-dialog" data-book-catalog-dialog><form method="dialog"><header><span><small>CATALOG SELECT</small><b data-book-catalog-title>${t("사전에서 고르기","사전에서 고르기")}</b></span><button type="submit" value="close" aria-label="${esc(t("닫기","닫기"))}">×</button></header><p>${t("사전에 등록한 항목을 여러 개 고를 수 있어요.","사전에 등록한 항목을 여러 개 고를 수 있어요.")}</p>${catalogTasteKinds.map(([label,kind])=>`<section class="character-body-choice-panel" data-book-catalog-panel="${kind}" hidden>${(state.catalog?.[kind]||[]).map(item=>`<button type="button" data-book-catalog-item="${item.id}" data-book-catalog-kind="${kind}"><span>${esc(item.name)}</span><i aria-hidden="true">✓</i></button>`).join("")||`<small>${t("사전에서 먼저 항목을 만들어 주세요.","사전에서 먼저 항목을 만들어 주세요.")}</small>`}</section>`).join("")}<footer><button type="submit" value="apply">${t("선택 완료","선택 완료")}</button></footer></form></dialog>`;
  const limit=characterLimit();
  const slotLabel=state.order.length>limit?`${state.order.length}명 저장됨 · 한도 ${limit}명`:`+ 생성 · ${state.order.length}/${limit}`;
  const paneMeta={
    profile:["삶의 기초","프로필·주거·직업·생활 습관","01"],
    body:["외형과 건강","신체·외모·건강·접근성","02"],
    personality:["성격과 말투","성향·정서·표현","03"],
    taste:["개인 취향","취미·음식·콘텐츠","04"],
    manage:["이미지와 화면","사진·SD·LD·색상·홈 배치","06"]
  };
  const mobileCharacterIds=state.order.filter(id=>id!==c.id),canCreateCharacter=state.order.length<limit,rosterItemCount=mobileCharacterIds.length+(canCreateCharacter?1:0),rosterVisibleRows=Math.min(6,rosterItemCount);
  const mobileStrip=`${mobileCharacterIds.map(id=>{const x=state.characters[id];return `<button type="button" data-mobile-character-select="${id}" class="character-roster-entry" style="--own:${x.theme.primary}">${avatar(x)}<small>${esc(x.name)}</small></button>`}).join("")}${canCreateCharacter?`<button type="button" data-new class="character-roster-entry character-roster-new" aria-label="${esc(t("새 캐릭터 만들기","새 캐릭터 만들기"))}"><span aria-hidden="true">＋</span><small>${t("새 캐릭터","새 캐릭터")}</small></button>`:""}`;
  const reorderRows=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="mobile-character-reorder-row">${avatar(x)}<b>${esc(x.name)}</b><span><button type="button" data-sort="${id}" data-direction="-1" ${index===0?"disabled":""} aria-label="위로 이동">↑</button><button type="button" data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""} aria-label="아래로 이동">↓</button></span></div>`}).join("");
  const ldSource=ldArtSource(c);
  const ldCard=`<article class="character-ld-card character-ld-single"><div>${ldSource?`<img class="scene-ld-art" src="${esc(ldSource)}" alt="${esc(c.name)} LD 일러스트">`:`<span class="character-image-empty-preview ld"><i>LD</i><small>LD 미등록</small></span>`}</div><h4>LD 일러스트</h4><small>전신 또는 무릎 위 이미지 한 장</small><span class="image-actions"><button type="button" data-image="ldImage">LD 파일</button><button type="button" data-image-url="ldImage" data-id="${c.id}">LD 링크</button>${ldSource?`<button type="button" data-clear-character-image="ldImage">지우기</button>`:""}</span></article>`;
  const themePalette=["#176B60","#3D6E9E","#7757A8","#A24E6A","#B76935","#8A6A35","#4F7A48","#57616F","#7A4141","#2B2B34"];
  const themeColorField=(field,label,value)=>`<section class="theme-color-group"><h4>${label}</h4><label class="theme-custom-color"><span class="sr-only">${label}</span><input type="color" data-color="${field}" value="${esc(value)}" aria-label="${label} 색상표"><input type="text" data-theme-hex="${field}" value="${esc(value)}" maxlength="7" inputmode="text" aria-label="${label} HEX 코드"></label><div class="character-theme-palette"><small>빠른 색상</small><div>${themePalette.map(color=>`<button type="button" class="theme-swatch ${String(value).toUpperCase()===color?"selected":""}" data-theme-swatch="${field}" data-color-value="${color}" style="--swatch:${color};background:${color}!important;background-image:linear-gradient(${color},${color})!important" aria-label="${color}"></button>`).join("")}</div></div></section>`;
  const homeVisualChoice=`<section class="character-manage-theme"><div><h3>캐릭터 테마색</h3><p>색상표에서 직접 고르거나 6자리 HEX 코드를 입력해요. 캐릭터 선택 효과와 강조색에 함께 적용됩니다.</p></div><div class="theme-color-groups">${themeColorField("primary","주 색상",c.theme?.primary||"#176B60")}${themeColorField("secondary","보조 색상",c.theme?.secondary||"#D4A373")}</div><label class="theme-gradient-toggle"><input type="checkbox" data-gradient ${c.theme?.gradient!==false?"checked":""}><span>두 색상을 그라데이션으로 사용</span></label></section>`;
  const managePane=`<section class="character-manage-pane" style="--own:var(--p);--own-secondary:var(--s)"><div class="traits-pane-heading"><h2>${esc(c.name)}의 사진·색상·배치</h2><p>프로필·SD·LD 이미지와 캐릭터 테마색, 홈 화면 배치를 한곳에서 설정해요.</p></div><div class="character-manage-grid">${homeVisualChoice}<section><span>${c.photo?`<img class="profile-photo-fallback" src="${esc(c.photo)}" alt="${esc(c.name)} 프로필 사진">`:`<span class="character-image-empty-preview"><i>사진</i><small>미등록</small></span>`}</span><div><h3>프로필 사진</h3><p>프로필 자리에서만 여백 없이 동그랗게 보여요. SD 아이콘으로 복사되지 않습니다.</p><div class="image-actions"><button type="button" data-image="photo">사진 파일</button><button type="button" data-image-url="photo" data-id="${c.id}">사진 링크</button>${c.photo?`<button type="button" data-clear-character-image="photo">지우기</button>`:""}</div></div></section><section><span>${c.icon?`<img class="sprite" src="${esc(c.icon)}" alt="${esc(c.name)} 투명 SD 아이콘">`:`<span class="character-image-empty-preview icon"><i>PNG</i><small>SD 미등록</small></span>`}</span><div><h3>투명 SD 아이콘</h3><p>별도로 등록했을 때만 사용해요. 투명 PNG 전체가 잘리지 않도록 원본 비율을 유지합니다.</p><div class="image-actions"><button type="button" data-image="icon">SD PNG 파일</button><button type="button" data-image-url="icon" data-id="${c.id}">SD 링크</button>${c.icon?`<button type="button" data-clear-character-image="icon">지우기</button>`:""}</div></div></section><section class="character-ld-settings"><div><h3>홈화면 LD 일러스트</h3><p>LD 일러스트는 캐릭터마다 한 장만 등록합니다. 감정은 장면의 배경 효과로 표현해요. LD 일러스트는 자르지 않고 원본 비율 전체를 사용하며, 위에서 선택한 표현 방식으로 홈화면에 표시합니다.</p></div><div class="character-ld-grid character-ld-single-grid">${ldCard}</div></section>${characterHomeLayoutEditor(c)}<section class="character-manage-files"><h3>캐릭터 삭제</h3><p>삭제 전 경고를 확인한 뒤 이 캐릭터와 연결된 기록을 정리해요.</p><button type="button" class="danger" data-delete-character="${c.id}">캐릭터 삭제</button></section></div></section>`;
  const pane=state.characterPane==="body"?bodyPane:state.characterPane==="personality"?personalityPane:state.characterPane==="taste"?taste:state.characterPane==="manage"?managePane:profileWithLicense;
  const fullActivePane=["visual","profile","body","wardrobe","personality","taste","closet"].includes(state.characterPane)?state.characterPane:"visual";
  const fullPane=fullActivePane==="visual"?characterFullOverview(c):fullActivePane==="profile"?profileOverviewPane:fullActivePane==="body"?bodyPane:fullActivePane==="wardrobe"?wardrobePane:fullActivePane==="personality"?personalityBookPane:fullActivePane==="closet"?closetBookPane:tasteBookPane;
  const layoutDialogMarkup=`<dialog class="character-layout-dialog" data-character-layout-dialog><form method="dialog" class="character-layout-dialog-shell"><header><span><small>HOME SCENE LAYOUT</small><b>${t("배치 조정하기","배치 조정하기")}</b></span><button value="close" aria-label="${t("배치 편집 닫기","배치 편집 닫기")}">×</button></header>${characterHomeLayoutEditor(c)}</form></dialog>`;
  const layoutDialog=fullActivePane==="visual"?layoutDialogMarkup:"";
  const unknown=t("미설정","미설정");
  const birthdayLabel=c.birthday?`${Number(c.birthday.slice(0,2))}${t("월","월")} ${Number(c.birthday.slice(2))}${t("일","일")}`:unknown;
  const draftRows=[
    {key:"name",label:"이름",value:c.name},
    {key:"birthday",label:"생일",value:birthdayLabel},
    {key:"job",label:"직업 종류",value:c.jobTitle||c.job||unknown},
    {key:"age",label:"나이",value:c.ageGroup||unknown},
    {key:"gender",label:"성별",value:c.gender||unknown}
  ];
  const selectedIcon=c.icon
    ?`<img class="sprite" src="${esc(c.icon)}" alt="${esc(c.name)}">`
    :c.photo
      ?`<img class="avatar profile-photo-fallback" src="${esc(c.photo)}" alt="${esc(c.name)}">`
      :`<img class="sprite character-wallet-default-profile" src="./assets/home-ui/profile-placeholder.png" alt="${esc(t("기본 실루엣","기본 실루엣"))}">`;
  const profilePhoto=c.photo?`<img src="${esc(c.photo)}" alt="${esc(c.name)}">`:`<span>${t("이곳에 사진을 넣어주세요","이곳에 사진을 넣어주세요")}</span>`;
  const favoriteItems=Object.entries(c.favorites||{}).flatMap(([kind,ids])=>(Array.isArray(ids)?ids:[]).map(id=>(state.catalog?.[kind]||[]).find(item=>item.id===id))).filter(Boolean);
  const favoriteSlots=Array.from({length:3},(_,index)=>{const item=favoriteItems[index];return `<span class="character-favorite-object ${item?.image?"has-image":"is-empty"}">${item?.image?`<img src="${esc(item.image)}" alt="${esc(item.name)}">`:`<i>${index===0?"♡":"·"}</i>`}</span>`}).join("");
  const quickSettings=`<dialog class="mobile-character-editor-dialog character-quick-settings-dialog" style="--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}" data-mobile-character-editor-dialog="quick"><div class="mobile-character-editor-shell character-quick-settings-shell"><div class="character-quick-fields"><button type="button" class="character-quick-icon" data-image="icon" aria-label="${esc(t("투명 SD 아이콘","투명 SD 아이콘"))}">${selectedIcon}<small>${t("아이콘","아이콘")}</small></button><label>${t("이름","이름")}<input data-field="name" value="${esc(c.name)}" maxlength="40" autocomplete="off" autocorrect="off" spellcheck="false"></label><div class="character-quick-pair"><label>${t("성별","성별")}<select data-field="gender">${["설정하지 않음","남성","여성","그외"].map(value=>`<option ${value===(c.gender||"설정하지 않음")?"selected":""}>${value}</option>`).join("")}</select></label><label>${t("성지향","성지향")}<select data-field="attractionTarget">${orientationOptions.map(value=>`<option ${value===(c.attractionTarget||orientationOptions[0])?"selected":""}>${value}</option>`).join("")}</select></label></div><label>${t("직업","직업")}<select data-field="job">${JOBS.map(value=>`<option ${value===c.job?"selected":""}>${value}</option>`).join("")}</select></label><label>${t("직업명","직업명")}<input data-field="jobTitle" value="${esc(c.jobTitle||"")}" maxlength="60" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${esc(t("화면에 표시할 이름","화면에 표시할 이름"))}"></label><fieldset><legend>${t("성격 키워드","성격 키워드")}</legend><div class="character-quick-personality">${PERSONALITY_TYPES.map(value=>`<button type="button" data-personality-type="${value}" class="${(c.personalityTypes||[]).includes(value)?"on":""}" aria-pressed="${(c.personalityTypes||[]).includes(value)}"><i aria-hidden="true">✓</i><span>${value}</span></button>`).join("")}</div></fieldset><label>${t("말투","말투")}<select data-field="speechStyle">${SPEECH_STYLE_OPTIONS.map(value=>`<option ${value===(c.speechStyle||SPEECH_STYLE_OPTIONS[0])?"selected":""}>${value}</option>`).join("")}</select></label></div><div class="character-quick-actions"><button type="button" data-close-mobile-character-editor>${t("취소하기","취소하기")}</button><button type="button" class="primary" data-save-mobile-character-editor>${t("저장하기","저장하기")}</button></div></div></dialog>`;
  const mobileProfileDraft=`<section class="mobile-character-profile-draft">
    <button type="button" class="character-draft-back" data-tab="observe" aria-label="${esc(t("돌아가기","돌아가기"))}"></button>
    <button type="button" class="character-wallet-selected" data-toggle-character-roster aria-label="${esc(t("선택된 캐릭터 바꾸기","선택된 캐릭터 바꾸기"))}"><span>${selectedIcon}</span><b><em>${t("선택됨","선택됨")}</em></b></button>
    <div class="character-wallet-art" aria-hidden="true"></div>
    <img class="character-setting-clip" src="./assets/character-ui/clip.png" alt="">
    <section class="character-registration-card">
      <button type="button" class="character-registration-photo" data-image="photo" aria-label="${esc(t(c.photo?"프로필 사진 변경":"프로필 사진 추가",c.photo?"프로필 사진 변경":"프로필 사진 추가"))}">${profilePhoto}</button>
      <img class="character-registration-paper" src="./assets/character-ui/registration-card.png" alt="" aria-hidden="true">
      <div class="character-registration-fields"><h2>${t("서랍마을 주민등록증","서랍마을 주민등록증")}</h2><dl>${draftRows.map(({key,label,value})=>`<div class="character-registration-field-${key}"><dt>${t(label,label)}</dt><dd>${esc(value)}</dd></div>`).join("")}</dl></div>
    </section>
    <div class="character-wallet-roster" data-character-roster data-roster-count="${rosterItemCount}" style="--roster-visible:${rosterVisibleRows}" hidden><div class="mobile-character-strip">${mobileStrip}</div><span class="character-roster-actions"><button type="button" class="character-roster-reorder" data-open-character-reorder aria-label="${esc(t("위치 바꾸기","위치 바꾸기"))}">↕</button><button type="button" class="character-roster-close" data-toggle-character-roster aria-label="${esc(t("닫기","닫기"))}">×</button></span></div>
  </section>`;
  const draftActions=`<nav class="character-draft-actions" aria-label="${esc(t("캐릭터 관리","캐릭터 관리"))}"><button type="button" class="character-draft-action" data-export-profile><span>${t("프로필 내보내기","프로필 내보내기")}</span></button><button type="button" class="character-draft-action" data-save><span>${t("캐릭터 저장","캐릭터 저장")}</span></button><button type="button" class="character-draft-action danger" data-delete-character="${c.id}"><span>${t("캐릭터 삭제","캐릭터 삭제")}</span></button></nav>`;
  const hubActions=`<section class="character-setting-choices" aria-label="${esc(t("캐릭터 설정 방식","캐릭터 설정 방식"))}"><span class="character-setting-cloth" aria-hidden="true"><img src="./assets/character-ui/character-cloth-white.png" alt=""></span><img class="character-setting-book" src="./assets/character-ui/book.png" alt=""><img class="character-setting-tape" src="./assets/character-ui/tape.png" alt=""><img class="character-setting-key" src="./assets/character-ui/key.png" alt=""><span class="character-favorite-preview" aria-label="${esc(t("선호 물품 미리보기","선호 물품 미리보기"))}">${favoriteSlots}</span><button type="button" class="character-setting-choice character-quick-choice" data-open-quick-character-settings><span><b>${t("빠른설정","빠른설정")}</b><small>${t("바로가기","바로가기")}</small></span></button><button type="button" class="character-setting-choice character-full-choice" data-open-full-character-settings><span><b>${t("전체설정","전체설정")}</b><small>${t("바로가기","바로가기")}</small></span></button></section>`;
  const fullPaneMeta=[["visual","사진·색상·배치"],["profile","개요"],["body","신체"],["wardrobe","의상 취향"],["personality","성격"],["taste","취향·소지품"],["closet","옷장"]];
  const fullPaneTitle=fullPaneMeta.find(([key])=>key===fullActivePane)?.[1]||"전체 설정";
  const fullNavigation=`<details class="character-book-v9-menu"><summary class="character-book-v9-composite"><i class="character-book-v9-fill" aria-hidden="true"></i><span aria-hidden="true">☰</span><b>${t(fullPaneTitle,fullPaneTitle)}</b></summary><nav aria-label="${esc(t("전체 설정 메뉴","전체 설정 메뉴"))}">${fullPaneMeta.map(([key,label])=>`<button type="button" class="character-book-v9-composite ${key===fullActivePane?"on":""}" data-character-pane="${key}" ${key===fullActivePane?'aria-current="page"':""}><i class="character-book-v9-fill" aria-hidden="true"></i><span>${t(label,label)}</span></button>`).join("")}</nav></details>`;
  const cornerInk=`<button type="button" class="character-book-v8-ink" data-save aria-label="${esc(t("잉크병을 눌러 저장","잉크병을 눌러 저장"))}"><img src="./assets/home-ui/ink.png" alt=""></button>`;
  const fullSave=`<button type="button" class="character-book-v8-save character-book-v9-composite" data-save><i class="character-book-v9-fill" aria-hidden="true"></i><span>${t("저장","저장")}</span></button>`;
  const fullBookDialogs=`${layoutDialog}${["body","wardrobe","taste"].includes(fullActivePane)?bookListDialog:""}${fullActivePane==="taste"?`${bookCatalogDialog}${tasteDialogs}`:""}`;
  const currentFullPageKey=fullActivePane==="profile"?`overview-${overviewPane}`:fullActivePane==="body"?`body-${state.characterBodyPane}`:fullActivePane==="personality"?`personality-${["details","emotion"].includes(state.characterPersonalityPane)?"details":"core"}`:fullActivePane;
  const fullPageEntries=[
    {key:"visual",pane:"visual",html:characterFullOverview(c)},
    {key:"overview-basic",pane:"profile",html:profileOverviewBasicPane},
    {key:"overview-life",pane:"profile",html:profileOverviewLifePane},
    {key:"body-figure",pane:"body",html:bodyFigurePane},
    {key:"body-appearance",pane:"body",html:bodyAppearancePane},
    {key:"body-accessibility",pane:"body",html:bodyAccessibilityPane},
    {key:"wardrobe",pane:"wardrobe",html:wardrobePane},
    {key:"personality-core",pane:"personality",html:personalityCorePane},
    {key:"personality-details",pane:"personality",html:personalityEmotionPane},
    {key:"taste",pane:"taste",html:tasteBookPane},
    {key:"closet",pane:"closet",html:closetBookPane}
  ];
  const currentFullPageIndex=Math.max(0,fullPageEntries.findIndex(page=>page.key===currentFullPageKey));
  const fullSpreadStart=Math.floor(currentFullPageIndex/2)*2;
  const fullSpreadPages=fullPageEntries.slice(fullSpreadStart,fullSpreadStart+2);
  const fullSpreadEnd=fullSpreadStart+fullSpreadPages.length;
  const fullSpreadContent=fullSpreadPages.map((page,index)=>`<section class="character-book-spread-leaf" data-spread-side="${index===0?"left":"right"}" data-spread-page="${page.key}"><main class="character-book-v8-page" data-book-page="${page.pane}">${page.html}</main></section>`).join("");
  const fullSpreadDialogs=`${fullSpreadPages.some(page=>page.key==="visual")?layoutDialogMarkup:""}${bookListDialog}${bookCatalogDialog}${tasteDialogs}`;
  const fullBook=`<section class="character-book-v8 is-open" data-character-full-ui-version="9" data-full-pane="${fullActivePane}" style="--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}">
    <div class="character-book-v8-canvas">
      <span class="character-book-v8-stage" aria-hidden="true"><img class="character-book-v8-wood" src="./assets/character-ui/character-wood-background.png" alt=""><span class="character-book-v8-book"></span></span>
      <h1 class="sr-only">${esc(c.name)} · ${t("전체 설정","전체 설정")}</h1>
      <button type="button" class="character-book-v8-back" data-close-full-character-settings aria-label="${esc(t("캐릭터 화면으로 돌아가기","캐릭터 화면으로 돌아가기"))}"><img src="./assets/character-ui/back.png" alt=""></button>
      ${fullNavigation}
      <main class="character-book-v8-page" data-book-page="${fullActivePane}">${fullPane}</main>
      ${cornerInk}${fullSave}
    </div>${fullBookDialogs}
  </section>`;
  const tabletFullBook=fullBook.replace('class="character-book-v8 is-open"','class="character-book-v8 is-open tablet-character-book"');
  const tabletSpreadBook=`<section class="character-book-v8 is-open tablet-character-book character-book-spread-layout" data-character-full-ui-version="10" data-book-layout="spread" data-full-pane="${fullActivePane}" style="--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}">
    <div class="character-book-v8-canvas">
      <span class="character-book-v8-stage" aria-hidden="true"><img class="character-book-v8-wood" src="./assets/character-ui/character-wood-background.png" alt=""><span class="character-book-v8-book"></span></span>
      <h1 class="sr-only">${esc(c.name)} · ${t("전체 설정","전체 설정")}</h1>
      <button type="button" class="character-book-v8-back" data-close-full-character-settings aria-label="${esc(t("캐릭터 화면으로 돌아가기","캐릭터 화면으로 돌아가기"))}"><img src="./assets/character-ui/back.png" alt=""></button>
      ${fullNavigation}
      <div class="character-book-v8-spread">${fullSpreadContent}</div>
      <nav class="character-book-spread-controls" aria-label="${esc(t("펼친 책 페이지 이동","펼친 책 페이지 이동"))}"><button type="button" data-character-spread-step="-1" ${fullSpreadStart===0?"disabled":""} aria-label="${esc(t("이전 두 페이지","이전 두 페이지"))}">◀</button><b>${fullSpreadStart+1}${fullSpreadPages.length>1?`–${fullSpreadEnd}`:""}</b><button type="button" data-character-spread-step="1" ${fullSpreadEnd>=fullPageEntries.length?"disabled":""} aria-label="${esc(t("다음 두 페이지","다음 두 페이지"))}">▶</button></nav>
      ${cornerInk}${fullSave}
    </div>${fullSpreadDialogs}
  </section>`;
  // 전체설정에서는 보이지 않는 허브·구형 데스크톱 편집기·정렬창을 DOM에
  // 함께 만들지 않는다. 캐릭터 페이지 이동 때마다 세 화면을 통째로 파싱하던
  // 것이 Android WebView에서 가장 큰 지연과 터치 버벅임의 원인이었다.
  if(state.characterSettingsView==="full"){
    if(nativeTabletLandscape)return `<div class="editor character-editor character-editor-tablet-full character-editor-tablet-landscape" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")};--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}"><section class="panel form character-tablet-full-shell">${tabletSpreadBook}</section></div>`;
    if(nativeTabletMode)return `<div class="editor character-editor character-editor-tablet-full character-editor-tablet-portrait-full" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")};--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}"><section class="panel form character-tablet-full-shell">${tabletFullBook}</section></div>`;
    return `<div class="editor character-editor character-editor-full-only" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")};--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}"><section class="panel form character-full-only-shell">${fullBook}</section></div>`;
  }
  return `<div class="editor character-editor" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")};--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}">
    <aside class="panel desktop-character-list"><div class="title"><h2>캐릭터 목록</h2><button data-new ${state.order.length>=limit?"disabled":""}>${slotLabel}</button></div>${list}</aside>
    <section class="panel form">
      <section class="mobile-character-dashboard ${state.characterSettingsView==="full"?"is-hidden":""}" data-character-ui-version="8" style="--character-own:${esc(c.theme?.primary||"#176b60")};--character-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")};--character-accent:${esc(c.theme?.primary||"#176b60")};--character-accent-secondary:${esc(c.theme?.secondary||c.theme?.primary||"#176b60")}">
        <img class="character-wood-background" src="./assets/character-ui/character-wood-background.png" alt="" aria-hidden="true">
        ${mobileProfileDraft}
        ${hubActions}
        ${draftActions}
      </section>
      <section class="desktop-character-editor"><div class="character-menu">${Object.entries(paneMeta).map(([key,[label]])=>`<button data-character-pane="${key}" class="${state.characterPane===key?"on":""}">${label}</button>`).join("")}<div class="character-file-actions"><button type="button" data-export-profile>프로필 내보내기</button><button type="button" data-tab="statistics">통계</button><button type="button" class="primary" data-save>캐릭터 저장</button><button type="button" class="danger" data-delete-character="${c.id}">캐릭터 삭제</button></div></div>${pane}</section>
      ${tabletFullBook}
      ${quickSettings}
      <nav class="character-tablet-settings-entry" aria-label="${esc(t("캐릭터 설정 방식","캐릭터 설정 방식"))}"><button type="button" data-open-quick-character-settings>${t("빠른설정","빠른설정")}</button><button type="button" data-open-full-character-settings>${t("전체설정","전체설정")}</button></nav>
      <dialog class="mobile-character-reorder-dialog" data-mobile-character-reorder-dialog><form method="dialog"><div class="mobile-editor-head"><span><small>CHARACTER ORDER</small><b>캐릭터 위치 바꾸기</b></span><button value="close">×</button></div><p>화살표를 눌러 홈과 캐릭터 목록의 순서를 바꿔요.</p><div>${reorderRows}</div><button class="primary" value="close">완료</button></form></dialog>
    </section>
  </div>`;
}

function mailbox(){
  const letters=createContactMailbox(localStorage).due(state.characters).filter(m=>m.extra.mode!=="scheduleEnd"||(state.routines[m.extra.characterId]||[]).some(r=>r.id===m.extra.routineId));
  const mailActionCopy={
    en:{delete:"Delete",deleteAll:"Delete all letters"},
    ja:{delete:"削除",deleteAll:"手紙をすべて削除"},
    ko:{delete:"삭제",deleteAll:"편지 모두 삭제"}
  }[state.uiLanguage||"ko"];
  const mailCards=letters.map(m=>`<article class="character-mail-card has-mail" data-mail-id="${esc(m.id)}"><div><small>${esc(new Date(m.at).toLocaleString(state.uiLanguage||"ko"))}</small><h2>${esc(m.title)}</h2><p>${esc(m.body)}</p></div><div class="mail-card-actions"><button type="button" data-open-contact-mail="${esc(m.id)}">${m.answered?t("답변 완료","답변 완료"):t("openLetter","편지 열기")}</button><button type="button" class="mail-delete-button" data-delete-contact-mail="${esc(m.id)}">${mailActionCopy.delete}</button></div></article>`).join("");
  const pending=state.dailyQuestion&&!state.dailyQuestion.answered&&!state.dailyQuestion.mailId?state.dailyQuestion:null;
  const sender=state.characters[pending?.characterId]||active()||state.characters[state.order[0]];
  const current=active()||sender,callCopy={
    en:{title:"Call home",help:"End an outing and ask a character to stay home until their next scheduled plan.",current:`Call ${current?.name||"character"} home`,all:"Call everyone home"},
    ja:{title:"家に呼ぶ",help:"外出を終え、次の登録予定まで家で過ごすように呼び戻します。",current:`${current?.name||"人物"}を家に呼ぶ`,all:"全員を家に呼ぶ"},
    ko:{title:"집으로 부르기",help:"외출 중인 캐릭터를 불러 다음 등록 일정 전까지 집에서 지내게 해요.",current:`${current?.name||"캐릭터"} 집으로 부르기`,all:"모두 집으로 부르기"}
  }[state.uiLanguage||"ko"];
  const title=pending?t("mailArrived",`${sender?.name||"캐릭터"}에게서 우편이 도착했어요`):t("mailEmpty","아직 도착한 우편이 없어요");
  const description=pending?t("mailReady","준비됐을 때 편지를 열고 선택하면 실제 생활 일정으로 이어집니다."):t("mailEmptyHelp","캐릭터의 질문과 선택, 고민과 안부는 이제 이 우편함에 도착해요.");
  const giftCopy={
    en:{title:"Send a gift",help:"Choose a character and an item from the dictionary. The recipient receives it and both characters remember the exchange.",target:"Recipient",item:"Gift",send:"Send gift",noTarget:"Add another character first",noItem:"Add an item to the dictionary first"},
    ja:{title:"プレゼントを送る",help:"相手と辞典の品物を選びます。相手の持ち物に追加され、二人の記録にも残ります。",target:"送り先",item:"プレゼント",send:"プレゼントを送る",noTarget:"ほかのキャラクターを追加してください",noItem:"辞典に品物を追加してください"},
    ko:{title:"선물 보내기",help:"받을 캐릭터와 사전의 물건을 고르세요. 상대의 소지품에 추가되고 두 캐릭터의 기록에도 남아요.",target:"받을 캐릭터",item:"선물할 물건",send:"선물 보내기",noTarget:"다른 캐릭터를 먼저 추가해 주세요",noItem:"사전에 물건을 먼저 추가해 주세요"}
  }[state.uiLanguage||"ko"];
  const giftTargets=current?state.order.filter(id=>id!==current.id).map(id=>`<option value="${id}">${esc(state.characters[id].name)}</option>`).join(""):"";
  const giftItems=Object.entries(state.catalog||{}).flatMap(([kind,items])=>(items||[]).map(item=>`<option value="${kind}:${item.id}">${esc(item.name)}</option>`)).join("");
  const gift=current?`<section class="mailbox-gift" data-mailbox-gift><img src="./assets/home-ui/mailbox.png" alt=""><span><h2>${giftCopy.title}</h2><p>${giftCopy.help}</p></span><div class="fields"><label>${giftCopy.target}<select data-character-interaction-target>${giftTargets||`<option value="">${giftCopy.noTarget}</option>`}</select></label><label>${giftCopy.item}<select data-character-interaction-item>${giftItems||`<option value="">${giftCopy.noItem}</option>`}</select></label></div><button type="button" class="primary" data-character-interaction="gift">${giftCopy.send}</button></section>`:"";
  return `<section class="mailbox-shell panel" style="--character-own:${esc(sender?.theme?.primary||"#176b60")}"><div class="mailbox-heading"><span aria-hidden="true"><img src="./assets/home-ui/mailbox.png" alt=""></span><div><small>CHARACTER MAIL</small><h1>${t("mailbox","우편함")}</h1><p>${t("mailboxHelp","캐릭터에게서 온 편지를 한곳에서 확인해요.")}</p></div>${letters.length?`<button type="button" class="mail-delete-all-button" data-delete-all-contact-mail>${mailActionCopy.deleteAll}</button>`:""}</div>${mailCards}${pending||!letters.length?`<article class="character-mail-card ${pending?"has-mail":"is-empty"}">${sender?avatar(sender):'<span class="mailbox-empty-icon">✉</span>'}<div><small>${pending?esc(sender?.name||""):t("mailbox","우편함")}</small><h2>${esc(title)}</h2><p>${esc(description)}</p></div>${pending?`<button type="button" class="primary" data-open-daily-question>${t("openLetter","편지 열기")}</button>`:""}</article>`:""}${gift}<section class="mailbox-home-call"><img src="./assets/home-ui/home.png" alt=""><span><h2>${callCopy.title}</h2><p>${callCopy.help}</p></span><div><button type="button" data-force-home="current">${esc(callCopy.current)}</button><button type="button" data-force-home="all">${callCopy.all}</button></div></section></section>`;
}
function wardrobe(){
  const c=active(),owned=new Set(c.inventory?.fashion||[]);
  const items=(state.catalog?.fashion||[]).filter(item=>owned.has(item.id));
  const itemCard=item=>`<article class="closet-item-card" data-edit-clothing="${item.id}">${item.image?`<img src="${esc(item.image)}" alt="">`:`<span>👕</span>`}<div><b>${esc(item.name)}</b><small>${esc([item.category,item.ordinary,...(item.occasionTags||[]),...(item.colors||[])].filter(Boolean).join(" · "))}</small></div><button data-edit-clothing="${item.id}">편집</button></article>`;
  const outfitCard=outfit=>`<article class="saved-outfit-card"><div class="outfit-collage ${esc(outfit.layout||"cluster-1")}">${outfit.itemIds.map(id=>items.find(item=>item.id===id)).filter(Boolean).map(item=>item.image?`<img src="${esc(item.image)}" alt="">`:`<span>👕</span>`).join("")}</div><div><b>${esc(outfit.name)}</b><small>${esc((outfit.tags||[]).join(" · ")||"일상 코디")}</small></div><button data-edit-outfit="${outfit.id}">코디 편집</button></article>`;
  return `<section class="wardrobe-shell"><div class="wardrobe-character-strip panel">${state.order.map(id=>`<button data-wardrobe-character="${id}" class="${id===c.id?"on":""}">${avatar(state.characters[id])}<b>${esc(state.characters[id].name)}</b></button>`).join("")}</div><section class="panel closet-main"><div class="title"><div><h1>${esc(c.name)}의 옷장</h1><p>옷을 등록하고, 자주 입는 조합을 코디로 저장해요.</p></div><div><button data-new-clothing>+ 옷 등록</button><button class="primary" data-new-outfit>+ 코디 만들기</button></div></div><h2>보유한 옷</h2><div class="closet-items">${items.map(itemCard).join("")||"<div class='empty-mini'><b>아직 등록한 옷이 없어요.</b><p>옷은 이제 취향 사전이 아니라 이 옷장에서 직접 만들어요.</p></div>"}</div><div class="title outfit-section-title"><div><h2>저장한 코디</h2><p>레이아웃은 보기 방식이고, 실제 자동 코디는 상황·색·격식·패션 감각을 따져요.</p></div></div><div class="saved-outfits">${(c.savedOutfits||[]).map(outfitCard).join("")||"<div class='empty-mini'><b>저장한 코디가 없어요.</b><p>자주 입히고 싶은 옷 조합을 만들어 주세요.</p></div>"}</div></section></section>`;
}
export function catalogSubgenreOptions(kind,category){
  return kind==="movie"?(VIDEO_GENRES[category]||[]):kind==="perfume"?PERFUME_NOTES:kind==="weapon"?(WEAPON_SUBTYPES[category]||[]):(DETAIL_OPTIONS[kind]||[]);
}
export function catalogCardMarkup(kind,item,{editor=false}={}){
  const label=CATALOG_LABELS[kind]||"항목";
  if(!editor)return `<button type="button" class="catalog-tile" data-open-catalog="${esc(item.id)}" data-kind="${esc(kind)}" aria-label="${esc(item.name)}"><span class="catalog-tile-art">${item.image?`<img loading="lazy" decoding="async" src="${esc(item.image)}" alt="">`:`<span>${CATALOG_ICONS[kind]||"📦"}</span>`}</span><b>${esc(item.name)}</b></button>`;
  const categories=kind==="movie"?Object.keys(VIDEO_GENRES):(CATALOG_CATEGORIES[kind]||[]);
  const custom=item.category&&!categories.includes(item.category)?[item.category]:[];
  const subgenres=catalogSubgenreOptions(kind,item.category);
  const detailEditor=kind==="perfume"?`<div class="chips"><b>향 계열 키워드 · 여러 개 선택 가능</b>${PERFUME_NOTES.map(x=>`<button type="button" data-catalog-keyword="${item.id}" data-kind="${kind}" data-value="${x}" class="${(item.keywords||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div>`:`<label>세부 항목<select data-catalog-field="subtype" data-kind="${kind}" data-item="${item.id}"><option value="">세부 항목 선택</option>${subgenres.map(x=>`<option ${x===item.subtype?"selected":""}>${esc(x)}</option>`).join("")}</select></label>`;
  const imageClass=item.imageSource==="app"?"catalog-app-art":"catalog-user-photo";
  return `<details class="catalog-dex-card" data-catalog-card="${item.id}" data-kind="${kind}"><summary>${item.image?`<img class="catalog-app-icon ${imageClass}" src="${esc(item.image)}" alt="">`:`<span class="catalog-app-icon">${CATALOG_ICONS[kind]||"📦"}</span>`}<b>${esc(item.name)}</b><small>${esc(item.category||label)}${item.subtype?` · ${esc(item.subtype)}`:""}</small></summary><div class="catalog-detail"><label>이름<input data-catalog-field="name" data-kind="${kind}" data-item="${item.id}" value="${esc(item.name)}"></label><label>분류<select data-catalog-field="category" data-kind="${kind}" data-item="${item.id}"><option value="">분류 선택</option>${[...custom,...categories].map(x=>`<option ${x===item.category?"selected":""}>${esc(x)}</option>`).join("")}</select></label>${detailEditor}<label class="catalog-illustration-field">이미지 링크<input data-catalog-field="image" data-kind="${kind}" data-item="${item.id}" value="${esc(item.image||"")}" placeholder="https://..."></label><div class="catalog-image-actions"><button type="button" class="catalog-illustration-picker" data-catalog-image="${item.id}" data-kind="${kind}">${item.imageSource==="app"&&item.image?`<img src="${esc(item.image)}" alt=""><span>앱 일러스트 바꾸기</span>`:`<span class="catalog-illustration-placeholder">✦</span><span>앱 일러스트 고르기</span>`}<small>게임에서 제공하는 투명 일러스트</small></button><button type="button" class="catalog-photo-picker" data-catalog-photo="${item.id}" data-kind="${kind}">${item.imageSource!=="app"&&item.image?`<img src="${esc(item.image)}" alt=""><span>첨부 사진 바꾸기</span>`:`<span class="catalog-illustration-placeholder">＋</span><span>사진 첨부하기</span>`}<small>내 사진은 둥근 썸네일로 표시돼요</small></button></div>${kind==="food"?`<label>맵기<select data-catalog-field="spicy" data-kind="${kind}" data-item="${item.id}">${levelOptions(SPICE_LEVELS,item.spicy??0)}</select></label><label>달기<select data-catalog-field="sweet" data-kind="${kind}" data-item="${item.id}">${levelOptions(SWEET_LEVELS,item.sweet??0)}</select></label>`:""}${["music","idol","book","movie","game"].includes(kind)?`<label>아티스트·제작자<input data-catalog-field="creator" data-kind="${kind}" data-item="${item.id}" value="${esc(item.creator||"")}"></label>`:""}<button type="button" class="danger" data-delete-catalog="${item.id}" data-kind="${kind}">항목 삭제</button></div></details>`;
}
function catalog(){
  return renderDictionary({labels:CATALOG_LABELS,icons:CATALOG_ICONS,categories:CATALOG_CATEGORIES,subtypes:catalogSubgenreOptions,translate:t});
}
function legacyCatalog(){
  const sections=Object.entries(CATALOG_LABELS).map(([kind,label])=>{
    const items=state.catalog?.[kind]||[],cards=items.map(item=>catalogCardMarkup(kind,item)).join("");
    return `<section class="catalog-kind catalog-section" data-catalog-section="${kind}"><div class="title"><h2>${CATALOG_ICONS[kind]||"📦"} ${label}</h2><small>${items.length}</small></div><div class="catalog-icon-grid" data-catalog-grid="${kind}">${cards}<button type="button" class="catalog-tile catalog-add-tile" data-add-catalog="${kind}"><span class="catalog-tile-art">＋</span><b>${t("물품 추가","물품 추가")}</b></button></div></section>`;
  }).join("");
  return `<section class="panel form catalog-shell"><div class="title"><div><h1>세계관 사전</h1><p>아이콘을 누르면 세부 정보와 편집 항목이 열려요.</p></div><button type="button" class="primary" data-catalog-save>사전 저장</button></div>${sections}</section>`;
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
function relationshipMotionFor(sourceId,targetId,official=[]){
  const sourceExplicit=explicitCharacterViewFor(sourceId,targetId),targetExplicit=explicitCharacterViewFor(targetId,sourceId);
  const hasSourceView=Object.keys(sourceExplicit).length>0,hasTargetView=Object.keys(targetExplicit).length>0;
  const currentOfficial=official.filter(relation=>relation.temporalStatus!=="past");
  if(!official.length&&!hasSourceView&&!hasTargetView)return"stranger";
  const sourceView=characterViewFor(sourceId,targetId),targetView=characterViewFor(targetId,sourceId);
  const sourceLove=isRomanticCharacterView(sourceView),targetLove=isRomanticCharacterView(targetView);
  if(sourceLove&&!targetLove)return"crush-forward";
  if(!sourceLove&&targetLove)return"crush-reverse";
  if(sourceLove&&targetLove||currentOfficial.some(relation=>["연인","부부"].includes(relation.type)))return"romantic";
  const combined=[sourceView,targetView].map(view=>`${view.overall||""} ${view.trust||""} ${view.fear||""} ${view.comfort||""} ${view.conflictIntensity||""}`).join(" ");
  if(/혐오|증오|원수|매우 싫|격렬|파국|자주 충돌/.test(combined)||currentOfficial.some(relation=>["혐관","라이벌"].includes(relation.type)))return"tense";
  if(/경계|믿지|의심|두려|무서|거리감|매우 불편/.test(combined))return"wary";
  if(/가까운 사이|가장 가까운|친한 사이|편안|의지|소중/.test(combined)||currentOfficial.some(relation=>["친구","소꿉친구","부모·자녀","형제·자매","동거인"].includes(relation.type)))return"close";
  return"neutral";
}
const relationshipScreenCopy=()=>({
  en:{selected:"Selected",mindOf:"'s feelings toward",officialNone:"No official relationship · strangers",setFeelings:"Set viewpoint",setOfficial:"Official relationships",addOfficial:"Add relationship",officialList:"Official relationships",makeGroup:"Groups",addGroup:"Add group",groupTitle:"Groups",groupEmpty:"No groups yet.",relationshipMap:"Relationship map",done:"Done",reset:"Reset these feelings",back:"Back",officialTitle:"Official relationships",officialEmpty:"No official relationships yet.",officialHint:"Search or select a relationship to edit it.",search:"Search",all:"All",family:"Family",friends:"Friends",romance:"Romance",groups:"Groups",rivals:"Rivals",edit:"Edit",remove:"Delete",close:"Close"},
  ja:{selected:"選択中",mindOf:"が相手をどう思うか",officialNone:"公式関係なし・他人",setFeelings:"視線設定",setOfficial:"公式関係",addOfficial:"関係を追加",officialList:"公式関係一覧",makeGroup:"グループ",addGroup:"グループを追加",groupTitle:"グループ一覧",groupEmpty:"グループはまだありません。",relationshipMap:"関係図",done:"編集完了",reset:"この関係を初期化",back:"戻る",officialTitle:"公式関係一覧",officialEmpty:"設定した公式関係はまだありません。",officialHint:"検索または関係を選んで編集できます。",search:"検索",all:"すべて",family:"家族",friends:"友人",romance:"恋愛",groups:"グループ",rivals:"対立",edit:"編集",remove:"削除",close:"閉じる"},
  ko:{selected:"선택됨",mindOf:"의 마음이 향하는 방향",officialNone:"공식 관계 없음 · 이방인",setFeelings:"시선 설정",setOfficial:"공식 관계",addOfficial:"새 관계 추가하기",officialList:"공식 관계 목록",makeGroup:"그룹",addGroup:"그룹 추가하기",groupTitle:"그룹 목록",groupEmpty:"아직 만든 그룹이 없어요.",relationshipMap:"관계도 보기",done:"편집 완료",reset:"이 관계 설정 초기화",back:"돌아가기",officialTitle:"공식 관계 목록",officialEmpty:"아직 설정한 공식 관계가 없어요.",officialHint:"검색하거나 관계를 눌러 편집할 수 있어요.",search:"검색",all:"전체",family:"가족",friends:"친구",romance:"연인",groups:"그룹",rivals:"혐관",edit:"편집",remove:"삭제",close:"닫기"}
}[state.uiLanguage]||null)||{selected:"선택됨",mindOf:"의 마음이 향하는 방향",officialNone:"공식 관계 없음 · 이방인",setFeelings:"시선 설정",setOfficial:"공식 관계",addOfficial:"새 관계 추가하기",officialList:"공식 관계 목록",makeGroup:"그룹",addGroup:"그룹 추가하기",groupTitle:"그룹 목록",groupEmpty:"아직 만든 그룹이 없어요.",relationshipMap:"관계도 보기",done:"편집 완료",reset:"이 관계 설정 초기화",back:"돌아가기",officialTitle:"공식 관계 목록",officialEmpty:"아직 설정한 공식 관계가 없어요.",officialHint:"검색하거나 관계를 눌러 편집할 수 있어요.",search:"검색",all:"전체",family:"가족",friends:"친구",romance:"연인",groups:"그룹",rivals:"혐관",edit:"편집",remove:"삭제",close:"닫기"};
const characterViewEditor=()=>{
  const copy=relationshipScreenCopy();
  const translatedFieldLabels=({
    en:{"전체적인 감정":"Overall feeling","중요도":"Importance","신뢰":"Trust","정서적 친밀감":"Emotional closeness","함께 있을 때의 편안함":"Comfort together","감정 자각":"Feeling awareness","상대의 마음을 아는 정도":"Understands their feelings","두려움 정도":"Fear","성가심":"Annoyance","챙기고 신경 쓰는 정도":"Attention and care","질투·독점욕":"Jealousy","갈등 강도":"Conflict","관계에 대한 기대":"Relationship expectations","스킨십 범위":"Touch boundaries","공격·위해 충동":"Aggressive impulse","충동을 실제로 표현하는 단계":"Acts on impulses"},
    ja:{"전체적인 감정":"全体的な感情","중요도":"重要度","신뢰":"信頼","정서적 친밀감":"心の近さ","함께 있을 때의 편안함":"一緒にいる時の安心感","감정 자각":"感情の自覚","상대의 마음을 아는 정도":"相手の気持ちの理解","두려움 정도":"恐れ","성가심":"煩わしさ","챙기고 신경 쓰는 정도":"気にかける度合い","질투·독점욕":"嫉妬・独占欲","갈등 강도":"対立の強さ","관계에 대한 기대":"関係への期待","스킨십 범위":"触れ合いの範囲","공격·위해 충동":"攻撃衝動","충동을 실제로 표현하는 단계":"衝動を行動に移す段階"}
  }[state.uiLanguage]||null)||{};
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
    return `<label class="relationship-view-field view-${key}" title="${esc(help)}"><b>${esc(translatedFieldLabels[label]||label)}</b><select data-character-view data-source="${sourceId}" data-target="${targetId}" data-view-field="${key}">${[...legacy,...options].map(value=>`<option ${value===current?"selected":""}>${value}</option>`).join("")}</select></label>`;
  };
  if(!source||!target){
    const emptyCopy=({ko:{title:"함께할 이야기를 기다리고 있어요",hint:"캐릭터가 두 명 이상이면 서로의 관계와 마음을 정할 수 있어요.",create:"캐릭터 만들기"},en:{title:"A story to share",hint:"Add a second character to set their relationship and feelings toward each other.",create:"Create character"},ja:{title:"一緒に紡ぐ物語を待っています",hint:"キャラクターが2人以上になると、関係や相手への気持ちを設定できます。",create:"キャラクターを作る"}})[state.uiLanguage]||{title:"함께할 이야기를 기다리고 있어요",hint:"캐릭터가 두 명 이상이면 서로의 관계와 마음을 정할 수 있어요.",create:"캐릭터 만들기"};
    return `<section class="relationship-empty"><button type="button" class="relationship-empty-back" data-tab="observe" aria-label="${copy.back}"><img src="./assets/home-ui/back.png" alt=""></button><div class="relationship-empty-card"><img src="./assets/home-ui/relationship.png" alt=""><h2>${emptyCopy.title}</h2><p>${emptyCopy.hint}</p><button type="button" data-tab="character">${emptyCopy.create}</button></div></section>`;
  }
  const official=Object.values(state.relationships||{}).filter(relation=>{const members=relation.groupMembers?.length?relation.groupMembers:[relation.a,relation.b];return members.includes(sourceId)&&members.includes(targetId)});
  const officialText=[...new Set(official.map(relation=>currentOfficialLabel(relation)))].join(" · ");
  const overall=characterViewFor(sourceId,targetId).overall;
  const reality=relationshipReality(sourceId,targetId,official);
  // This editor is directional. Keep the first selection on the left and the
  // second selection on the right; scene-placement preferences do not apply.
  const heroLeft=source,heroRight=target;
  const relationshipMotion=relationshipMotionFor(sourceId,targetId,official);
  const viewFields=`${field(sourceId,targetId,"overall","전체적인 감정","공식 관계와 별개인 이 캐릭터만의 속마음")}${field(sourceId,targetId,"importance","중요도","이 캐릭터의 삶에서 상대가 얼마나 중요한지 정해요.")}${field(sourceId,targetId,"trust","신뢰","좋아하더라도 믿지 않을 수 있어요.")}${field(sourceId,targetId,"closeness","정서적 친밀감","상대를 자기 삶의 얼마나 안쪽 사람으로 느끼는지예요.")}${field(sourceId,targetId,"comfort","함께 있을 때의 편안함","둘이 같은 공간에 있을 때의 편안함과 대화 호흡을 정해요.")}${field(sourceId,targetId,"awareness","감정 자각","자기 마음을 우정·경쟁심·불편함으로 잘못 해석할 수도 있어요.")}${field(sourceId,targetId,"mutualAwareness","상대의 마음을 아는 정도","상대의 감정을 얼마나 파악하고 있는지 정해요.")}${field(sourceId,targetId,"fear","두려움 정도","상대를 얼마나 우습게 보거나 두려워하는지 강도를 정해요.")}${field(sourceId,targetId,"annoyance","성가심","좋아하고 사랑하면서도 많이 귀찮아할 수 있어요.")}${field(sourceId,targetId,"attention","챙기고 신경 쓰는 정도","상태와 일정을 얼마나 살필지 정해요.")}${field(sourceId,targetId,"jealousy","질투·독점욕","사랑과 별개로 정해요.")}${field(sourceId,targetId,"conflictIntensity","갈등 강도","사랑이나 가족애와 별개인 실제 충돌 강도예요.")}${field(sourceId,targetId,"expectation","관계에 대한 기대","이 관계가 얼마나 이어질 거라 생각하는지 정해요.")}${field(sourceId,targetId,"touchIntensity","스킨십 범위","두 캐릭터의 범위가 다르면 더 낮은 쪽까지만 반영돼요.")}${field(sourceId,targetId,"aggression","공격·위해 충동","충동만으로 실제 공격하지 않아요.")}${field(sourceId,targetId,"aggressionAction","충동을 실제로 표현하는 단계","충동 단계보다 센 행동은 절대 나오지 않아요.")}`;
  const characterSelector=(role,ids,selectedId,character)=>`<div class="relationship-character-selector selector-${role}">
    <button type="button" class="relationship-character-selected" data-toggle-relationship-roster="${role}" aria-label="${esc(character.name)} · ${copy.selected}"><span>${avatar(character)}</span><b><i aria-hidden="true"></i><em>${copy.selected}</em></b></button>
    <div class="relationship-character-roster" data-relationship-roster="${role}" hidden><div>${ids.map(id=>{const person=state.characters[id];return `<button type="button" class="relationship-character-roster-entry ${id===selectedId?"on":""}" data-relationship-character="${role}" data-character-id="${id}" aria-label="${esc(person.name)}">${avatar(person)}<small>${esc(person.name)}</small></button>`}).join("")}</div><button type="button" class="relationship-character-roster-close" data-toggle-relationship-roster="${role}" aria-label="${copy.close}">×</button></div>
  </div>`;
  const sourceColor=source.theme?.primary||"#176b60",targetColor=target.theme?.primary||"#176b60";
  const sourceParticle=subjectText(source.name).slice(source.name.length);
  const targetParticle=objectText(target.name).slice(target.name.length);
  return `<section class="character-view-editor relationship-stage relationship-motion-${relationshipMotion}" style="--relationship-own:${esc(sourceColor)};--relationship-own-secondary:${esc(source.theme?.secondary||sourceColor)};--relationship-target:${esc(targetColor)};--relationship-left:${esc(heroLeft.theme?.primary||sourceColor)};--relationship-right:${esc(heroRight.theme?.primary||targetColor)}">
    <button type="button" class="relationship-back-button" data-tab="observe" aria-label="${copy.back}"><img src="./assets/home-ui/back.png" alt=""></button>
    <div class="relationship-choice-row">
      ${characterSelector("source",state.order,sourceId,source)}
      <span class="relationship-choice-arrow" aria-hidden="true"></span>
      ${characterSelector("target",targetIds,targetId,target)}
    </div>
    <div class="relationship-hero-pair" aria-hidden="true">${avatar(heroLeft)}${avatar(heroRight)}</div>
    <div class="relationship-direction-sentence" data-view-summary="${sourceId}:${targetId}"><span><mark style="--sentence-name:${esc(sourceColor)}">${esc(source.name)}</mark>${esc(sourceParticle)} <mark style="--sentence-name:${esc(targetColor)}">${esc(target.name)}</mark>${esc(targetParticle)}</span><strong data-view-summary-phrase>${esc(overallViewPhrase(overall))}</strong></div>
    <small class="relationship-official-status">${officialText?`공식 관계 · ${esc(officialText)}`:copy.officialNone}</small>
    <em class="relationship-reality-pill">${esc(reality)}</em>
    <nav class="relationship-stage-actions">
      <button type="button" class="relationship-composite-action" data-open-view-dialog="${sourceId}:${targetId}"><i aria-hidden="true"></i><span>${copy.setFeelings}</span></button>
      <button type="button" class="relationship-composite-action" data-open-official-relations><i aria-hidden="true"></i><span>${copy.setOfficial}</span></button>
      <button type="button" class="relationship-composite-action" data-open-character-groups><i aria-hidden="true"></i><span>${copy.makeGroup}</span></button>
      <button type="button" class="relationship-composite-action" data-open-relationship-map><i aria-hidden="true"></i><span>${copy.relationshipMap}</span></button>
    </nav>
    <dialog class="character-view-dialog relationship-fullscreen-dialog relationship-viewpoint-dialog" data-view-dialog="${sourceId}:${targetId}"><form method="dialog"><header class="relationship-editor-head"><button value="close" class="relationship-back-button" aria-label="${copy.back}"><img src="./assets/home-ui/back.png" alt=""></button><div class="relationship-editor-pair"><figure>${avatar(source)}<b>${esc(source.name)}</b></figure><i aria-hidden="true"></i><figure>${avatar(target)}<b>${esc(target.name)}</b></figure></div></header><div class="character-view-fields relationship-all-fields">${viewFields}</div></form></dialog>
  </section>`;
};
const relationPairKey=(a,b)=>[a,b].sort().join("~");
const relationshipAnimationOrder=(relation,requestedIds=[],seed="")=>{
  const ids=[...new Set((requestedIds?.length?requestedIds:(relation?.groupMembers?.length?relation.groupMembers:relation?.displayOrder||[relation?.a,relation?.b])).filter(Boolean))];
  if(!relation||ids.length<2)return ids;
  const official=(Array.isArray(relation.displayOrder)?relation.displayOrder:ids).filter(id=>ids.includes(id));
  ids.forEach(id=>{if(!official.includes(id))official.push(id)});
  return orderAnimationCharacters(official,state.characters,state.relationships,`${relation.id}:${seed}`);
};
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
function relationshipMap(relations,characterIds=[]){
  const requestedIds=Array.isArray(characterIds)?new Set(characterIds.map(String)):null;
  let characters=state.order.map(id=>state.characters[id]).filter(character=>character&&(!requestedIds||!requestedIds.size||requestedIds.has(String(character.id))));
  if(characters.length<2)return"";
  if(characters.length===2){
    const ids=characters.map(character=>character.id);
    const orderedRelation=relations.find(relation=>{const members=relation.groupMembers?.length?relation.groupMembers:relation.displayOrder;return Array.isArray(members)&&ids.every(id=>members.includes(id))});
    if(orderedRelation)characters=relationshipAnimationOrder(orderedRelation,ids,"relationship-map").map(id=>state.characters[id]).filter(Boolean);
  }
  const positions=new Map(characters.map((character,index)=>{
    if(characters.length===2)return [character.id,{x:index===0?235:765,y:500}];
    const angle=(Math.PI*2*index/characters.length)-Math.PI/2;
    return [character.id,{x:500+350*Math.cos(angle),y:500+350*Math.sin(angle)}];
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
  const edges=[];
  for(let i=0;i<characters.length;i++)for(let j=i+1;j<characters.length;j++){
    const a=characters[i].id,b=characters[j].id;
    const official=relations.filter(relation=>(relation.a===a&&relation.b===b)||(relation.a===b&&relation.b===a));
    const hasExplicit=Object.keys(explicitCharacterViewFor(a,b)).length>0||Object.keys(explicitCharacterViewFor(b,a)).length>0;
    if(official.length||hasExplicit)edges.push({a,b,official});
  }
  if(!edges.length)return"";
  const viewLabel=(source,target)=>characterViewFor(source,target).overall;
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
    return `<g class="relationship-edge"><g class="map-arrows"><path d="${forward}" fill="none" stroke="${forwardColor}" stroke-width="5" stroke-linecap="round"/><polygon points="${forwardArrow}" fill="${forwardColor}"/><path d="${backward}" fill="none" stroke="${backwardColor}" stroke-width="5" stroke-linecap="round"/><polygon points="${backwardArrow}" fill="${backwardColor}"/></g></g>`;
  }).join("");
  const mapNodeSize=characters.length===2?200:156;
  const nodes=characters.map(character=>{const pos=positions.get(character.id);return `<foreignObject x="${pos.x-mapNodeSize/2}" y="${pos.y-mapNodeSize/2}" width="${mapNodeSize}" height="${mapNodeSize}"><div xmlns="http://www.w3.org/1999/xhtml" class="relationship-map-node ${characters.length===2?"map-node-pair":""}">${avatar(character)}<b>${esc(character.name)}</b></div></foreignObject>`}).join("");
  return `<section class="relationship-map"><div class="relationship-map-scroll"><div class="relationship-map-canvas"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">${lines}${nodes}</svg></div></div></section>`;
}
export function relationshipMapMarkup(characterIds=[]){
  return relationshipMap(Object.values(state.relationships||{}),characterIds);
}
function relationship(){
  const all=Object.values(state.relationships||{}),shownGroups=new Set(),copy=relationshipScreenCopy();
  const mapCopy=({
    en:{title:"Relationship map",hint:"Each arrow color shows how the character at its starting point feels about the character it points to.",scope:"Characters shown",all:"All characters",custom:"Custom selection",town:"Town",group:"Group",choose:"Choose characters",refresh:"Update map",save:"Save PNG",loading:"Preparing the map…",empty:"Choose at least two characters who have a relationship or viewpoint setting.",legend:["Strong love","Romantic interest","Friendly / positive","Trust / comfort","Respect / admiration","Guarded / annoyed","Fear","Hate / hostility","Neutral / undecided"]},
    ja:{title:"人物関係図",hint:"矢印の色は、出発点の人物が相手に向ける感情を表します。",scope:"表示する人物",all:"すべての人物",custom:"個別選択",town:"タウン",group:"グループ",choose:"人物を選択",refresh:"関係図を更新",save:"PNGで保存",loading:"関係図を準備中…",empty:"関係または視線設定がある人物を2人以上選んでください。",legend:["強い愛","恋愛感情","友好・好意","信頼・安心","尊敬・憧れ","警戒・煩わしさ","恐れ","嫌悪・敵意","中立・未定"]},
    ko:{title:"인물 관계도",hint:"화살표 색은 출발점의 캐릭터가 상대를 보는 감정을 나타냅니다.",scope:"표시할 캐릭터",all:"전체 캐릭터",custom:"개별 선택",town:"마을",group:"그룹",choose:"캐릭터 고르기",refresh:"관계도 갱신",save:"PNG로 저장",loading:"관계도를 준비하는 중이에요.",empty:"관계나 시선 설정이 있는 캐릭터를 두 명 이상 골라 주세요.",legend:["강한 사랑","연애 감정","친구·우호","신뢰·편안","존경·동경","경계·성가심","두려움","싫음·적의","중립·미정"]}
  }[state.uiLanguage]||null)||null;
  const relationKind=relation=>relation.groupId||relation.groupMembers?.length>2?"groups":["부모·자녀","형제·자매","부부"].includes(relation.type)?"family":["연인","짝사랑"].includes(relation.type)?"romance":["혐관","라이벌","원수"].includes(relation.type)?"rivals":"friends";
  const cards=all.map(r=>{
    if(r.groupId||r.groupMembers?.length>2){
      if(r.groupId&&shownGroups.has(r.groupId))return"";
      if(r.groupId)shownGroups.add(r.groupId);
      const group=r.groupId?all.filter(item=>item.groupId===r.groupId):[r],memberIds=[...new Set(r.groupMembers?.length?r.groupMembers:group.flatMap(item=>[item.a,item.b]))];
      const orderedIds=Array.isArray(r.displayOrder)&&r.displayOrder.length===memberIds.length&&r.displayOrder.every(id=>memberIds.includes(id))?r.displayOrder:memberIds;
      const members=orderedIds.map(id=>state.characters[id]).filter(Boolean),memberNames=members.map(member=>member.name).join(" × ");
      const title=r.name||memberNames||currentOfficialLabel(r),search=`${title} ${memberNames} ${r.type} ${r.stage||""} ${(r.tags||[]).join(" ")}`;
      return `<article class="relationship-list-card relation group-relation" data-official-card data-relation-kind="groups" data-relation-search="${esc(search.toLocaleLowerCase())}"><div class="relation-avatars">${members.map(member=>avatar(member)).join("")}</div><h2>${esc(title)}</h2><p>${esc(memberNames)}</p><p>${esc(currentOfficialLabel(r))} · ${r.temporalStatus==="past"?"과거 관계":"현재 관계"}</p><p class="relation-stage">${esc(r.stage||"편안한 사이")}</p><div class="relation-actions"><button data-edit-rel="${r.id}">${copy.edit}</button><button class="danger" ${r.groupId?`data-delete-group="${r.groupId}"`:`data-delete-rel="${r.id}"`}>${copy.remove}</button></div></article>`;
    }
    const orderedIds=!r.directional&&Array.isArray(r.displayOrder)&&r.displayOrder.length===2?r.displayOrder:[r.a,r.b],a=state.characters[orderedIds[0]],b=state.characters[orderedIds[1]];
    if(!a||!b)return"";
    const pair=r.type==="부모·자녀"?`${state.characters[r.parentId||r.a]?.name||a.name}(${r.parentRole||"부모"}) → ${state.characters[r.childId||r.b]?.name||b.name}`:`${a.name} ${r.type==="짝사랑"?"→":"×"} ${b.name}`;
    const title=r.name||pair,search=`${title} ${pair} ${r.type} ${r.stage||""} ${(r.tags||[]).join(" ")}`;
    return `<article class="relationship-list-card relation" data-official-card data-relation-kind="${relationKind(r)}" data-relation-search="${esc(search.toLocaleLowerCase())}"><div class="relation-avatars">${avatar(a)}${avatar(b)}</div><h2>${esc(title)}</h2><p>${esc(pair)}</p><p>${esc(currentOfficialLabel(r))} · ${r.cohabit?"함께 거주":"따로 거주"}</p><p class="relation-stage">${r.temporalStatus==="past"?"과거 관계 · ":""}${esc(r.stage||"편안한 사이")}</p>${(r.tags||[]).length?`<p class="relation-tags">${r.tags.map(tag=>`#${esc(tag)}`).join(" ")}</p>`:""}<div class="relation-actions"><button data-edit-rel="${r.id}">${copy.edit}</button><button class="danger" data-delete-rel="${r.id}">${copy.remove}</button></div></article>`;
  }).join("");
  const filters=[["all",copy.all],["family",copy.family],["friends",copy.friends],["romance",copy.romance],["groups",copy.groups],["rivals",copy.rivals]];
  const groupCards=(state.characterGroups||[]).map(group=>{
    const members=(group.memberIds||[]).map(id=>state.characters[id]).filter(Boolean),names=members.map(member=>member.name).join(" × "),search=`${group.name||""} ${names}`.toLocaleLowerCase();
    const related=all.filter(relation=>(group.memberIds||[]).includes(relation.a)&&(group.memberIds||[]).includes(relation.b)),kind=related.length?relationKind(related[0]):"groups";
    return `<article class="relationship-group-list-card" data-group-card data-group-kind="${kind}" data-group-search="${esc(search)}"><div class="relation-avatars">${members.slice(0,4).map(member=>avatar(member)).join("")}</div><span><h2>${esc(group.name||"이름 없는 그룹")}</h2><p>${esc(names||"구성원 없음")}</p></span><div class="relation-actions"><button data-edit-character-group="${group.id}">${copy.edit}</button><button class="danger" data-delete-character-group="${group.id}">${copy.remove}</button></div></article>`;
  }).join("");
  const filterButtons=(attribute)=>filters.map(([kind,label])=>`<button type="button" class="${kind==="all"?"on":""}" ${attribute}="${kind}">${label}</button>`).join("");
  return `<section class="panel form relationship-page relationship-redesign">${characterViewEditor()}
    <dialog class="official-relation-dialog relationship-fullscreen-dialog relationship-list-dialog" data-official-relation-dialog><form method="dialog"><header class="relationship-list-head"><button value="close" class="relationship-back-button" aria-label="${copy.back}"><img src="./assets/home-ui/back.png" alt=""></button><span><small>OFFICIAL RELATIONSHIPS</small><h2>${copy.officialTitle}</h2><p>${copy.officialHint}</p></span></header><div class="relationship-list-tools"><input type="search" data-relation-search placeholder="${copy.search}" aria-label="${copy.search}"><nav>${filterButtons("data-relation-filter")}</nav></div><div class="relationship-card-grid">${cards}<button type="button" data-add-rel class="relationship-list-create-card"><b>＋</b><span>${copy.addOfficial}</span></button><div class="empty-mini relationship-filter-empty" hidden><b>${copy.officialEmpty}</b></div></div></form></dialog>
    <dialog class="relationship-fullscreen-dialog relationship-list-dialog relationship-group-list-dialog" data-character-group-list-dialog><form method="dialog"><header class="relationship-list-head"><button value="close" class="relationship-back-button" aria-label="${copy.back}"><img src="./assets/home-ui/back.png" alt=""></button><span><small>CHARACTER GROUPS</small><h2>${copy.groupTitle}</h2><p>${copy.officialHint}</p></span></header><div class="relationship-list-tools"><input type="search" data-group-search placeholder="${copy.search}" aria-label="${copy.search}"><nav>${filterButtons("data-group-filter")}</nav></div><div class="relationship-group-card-list">${groupCards}<button type="button" data-add-character-group class="relationship-group-create-card"><b>＋</b><span>${copy.addGroup}</span></button><div class="empty-mini relationship-group-filter-empty" hidden><b>${copy.groupEmpty}</b></div></div></form></dialog>
    <dialog class="relationship-map-dialog" data-relationship-map-dialog data-map-empty="${esc(mapCopy.empty)}"><form method="dialog"><div class="relationship-map-dialog-head"><span><small>RELATIONSHIP MAP</small><h2>${mapCopy.title}</h2></span><button value="close" aria-label="${copy.close}">×</button></div><p>${mapCopy.hint}</p><section class="relationship-map-filter"><label><b>${mapCopy.scope}</b><select data-relationship-map-scope><option value="all">${mapCopy.all}</option><option value="custom">${mapCopy.custom}</option>${state.towns.map(town=>`<option value="town:${esc(town.id)}">${mapCopy.town} · ${esc(town.name)}</option>`).join("")}${(state.characterGroups||[]).map(group=>`<option value="group:${esc(group.id)}">${mapCopy.group} · ${esc(group.name)}</option>`).join("")}</select></label><fieldset><legend>${mapCopy.choose}</legend><div class="relationship-map-character-list">${state.order.map(id=>{const character=state.characters[id];return character?`<button type="button" class="on" aria-pressed="true" data-relationship-map-character="${esc(id)}">${avatar(character)}<span>${esc(character.name)}</span></button>`:""}).join("")}</div></fieldset></section><div class="relationship-color-legend">${mapCopy.legend.map((label,index)=>`<span class="tone-${index}">${label}</span>`).join("")}</div><div class="relationship-map-actions"><button type="button" data-refresh-relationship-map>${mapCopy.refresh}</button><button type="button" data-export-relationship-map>${mapCopy.save}</button></div><div data-relationship-map-content><div class="empty-mini">${mapCopy.loading}</div></div></form></dialog>
  </section>`;
}
function routine(){
  const c=active(),language=state.uiLanguage||"ko",days=language==="en"?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:language==="ja"?["日","月","火","水","木","金","土"]:["일","월","화","수","목","금","토"],items=(state.routines[c.id]||[]).slice().sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start));
  const places=state.towns.flatMap(t=>(t.id===state.activeTownId?state.world.places:t.places).map(p=>({...p,townName:t.name})));
  const routineCopy={
    en:{homeSuffix:"'s home",characterHome:"Character home",title:"Schedule",weekly:"Weekly",monthly:"Monthly",add:"Add schedule",addAnniversary:"Anniversary",changeCharacter:"Change character",back:"Back to home",empty:"No schedule",edit:"Edit",remove:"Delete",previous:"Previous month",next:"Next month"},
    ja:{homeSuffix:"の家",characterHome:"キャラクターの家",title:"予定",weekly:"週間",monthly:"月間",add:"予定を追加",addAnniversary:"記念日",changeCharacter:"人物を変更",back:"ホームへ戻る",empty:"予定なし",edit:"編集",remove:"削除",previous:"前の月",next:"次の月"},
    ko:{homeSuffix:"의 집",characterHome:"캐릭터의 집",title:"일정",weekly:"주간",monthly:"월간",add:"일정 추가",addAnniversary:"기념일",changeCharacter:"캐릭터 바꾸기",back:"홈으로 돌아가기",empty:"일정 없음",edit:"편집",remove:"삭제",previous:"이전 달",next:"다음 달"}
  }[language]||null;
  const routineText=routineCopy||{homeSuffix:"의 집",characterHome:"캐릭터의 집",title:"일정",weekly:"주간",monthly:"월간",add:"일정 추가",addAnniversary:"기념일",changeCharacter:"캐릭터 바꾸기",back:"홈으로 돌아가기",empty:"일정 없음",edit:"편집",remove:"삭제",previous:"이전 달",next:"다음 달"};
  const destinationLabel=item=>{
    if(item.visitHomeId){
      const home=state.homes?.[item.visitHomeId],residents=state.order.map(id=>state.characters[id]).filter(character=>character&&(character.homeId===item.visitHomeId||(character.residences||[]).some(residence=>residence.homeId===item.visitHomeId)));
      return residents.length?`${residents.map(character=>character.name).join(" · ")}${routineText.homeSuffix}`:(home?.name||routineText.characterHome);
    }
    return item.placeId?(places.find(place=>place.id===item.placeId)?.name||"장소"):"";
  };
  const toolbar=`<div class="routine-toolbar">${state.order.map(id=>`<button type="button" data-routine-character="${id}" class="${id===c.id?"on":""}">${avatar(state.characters[id])}<span>${esc(state.characters[id].name)}</span></button>`).join("")}</div>`;
  const characterSwitcher=`<details class="routine-character-switcher"><summary>${routineText.changeCharacter}</summary>${toolbar}</details>`;
  const table=`<div class="weekly-scroll"><div class="weekly-table">${days.map((day,index)=>{const dayItems=items.filter(item=>item.day===index);return `<section class="routine-day" data-routine-day="${index}"><h3>${day}</h3><div class="routine-day-items">${dayItems.map(item=>`<article class="routine-block"><button type="button" class="routine-block-main" data-edit-routine="${item.id}"><b>${esc(item.start)}</b><strong>${esc(item.title)}</strong><small>${esc(item.type)}${destinationLabel(item)?` · ${esc(destinationLabel(item))}`:""}</small></button><button type="button" class="routine-block-delete" data-delete-routine="${item.id}" aria-label="${routineText.remove}">×</button></article>`).join("")}</div><button type="button" class="routine-day-add" data-add-routine-day="${index}" aria-label="${day} · ${routineText.add}">＋</button>${dayItems.length?"":`<small class="routine-day-empty">${routineText.empty}</small>`}</section>`}).join("")}</div></div>`;
  const now=new Date(),monthKey=state.routineMonth||`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`,[year,month]=monthKey.split("-").map(Number),firstDay=new Date(year,month-1,1).getDay(),lastDate=new Date(year,month,0).getDate();
  const monthItems=(state.monthlyRoutines?.[c.id]||[]).filter(item=>item.date.startsWith(`${monthKey}-`)).slice().sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));
  const todayKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
  const calendarCells=Array.from({length:Math.ceil((firstDay+lastDate)/7)*7},(_,index)=>{const date=index-firstDay+1;if(date<1||date>lastDate)return '<section class="monthly-day is-empty" aria-hidden="true"></section>';const dateKey=`${monthKey}-${String(date).padStart(2,"0")}`,recurringKey=`${String(month).padStart(2,"0")}${String(date).padStart(2,"0")}`,dayItems=monthItems.filter(item=>item.date===dateKey),birthdays=state.order.map(id=>state.characters[id]).filter(character=>character?.birthday===recurringKey),anniversaries=(state.anniversaries||[]).filter(item=>item.date===recurringKey);const special=[...birthdays.map(character=>`<span class="calendar-special birthday">🎂 ${esc(character.name)}</span>`),...anniversaries.map(item=>`<button type="button" class="calendar-special anniversary" data-edit-anniversary="${item.id}">💌 ${esc(item.title||item.type)}</button>`)];return `<section class="monthly-day ${dateKey===todayKey?"is-today":""}" ${dateKey===todayKey?'aria-current="date"':""}><h3><b>${date}</b><small>${dateKey===todayKey?t("오늘","오늘"):days[index%7]}</small></h3>${special.join("")}${dayItems.map(item=>`<article class="routine-block"><button type="button" class="routine-block-main" data-edit-monthly-routine="${item.id}"><b>${esc(item.start)}</b><strong>${esc(item.title)}</strong></button><button type="button" class="routine-block-delete" data-delete-monthly-routine="${item.id}" aria-label="${routineText.remove}">×</button></article>`).join("")||(!special.length?`<small class="monthly-empty">${routineText.empty}</small>`:"")}</section>`}).join("");
  const monthTitle=language==="en"?`${new Date(year,month-1,1).toLocaleString("en",{month:"long"})} ${year}`:language==="ja"?`${year}年 ${month}月`:`${year}년 ${month}월`;
  const monthly=`<div class="monthly-view"><div class="monthly-heading"><button type="button" class="routine-month-back" data-routine-month-step="-1" aria-label="${routineText.previous}"></button><h2>${monthTitle}</h2><button type="button" class="routine-month-today" data-routine-month-today>${t("오늘","오늘")}</button><button type="button" class="routine-month-next" data-routine-month-step="1" aria-label="${routineText.next}"></button></div><div class="monthly-weekdays">${days.map(day=>`<b>${day}</b>`).join("")}</div><div class="monthly-calendar">${calendarCells}</div></div>`;
  const monthlyView=state.routineView==="monthly";
  return `<section class="routine-shell"><div class="routine-screen-head"><button type="button" class="routine-back-button" data-tab="observe" aria-label="${routineText.back}"></button>${characterSwitcher}</div><div class="routine-title-row"><span><img src="./assets/home-ui/routine.png" alt=""><h1>${routineText.title}</h1></span><div class="routine-title-actions"><button type="button" class="routine-add-button" ${monthlyView?"data-add-monthly-routine":"data-add-routine"}>${routineText.add}</button>${monthlyView?`<button type="button" data-add-anniversary>${routineText.addAnniversary}</button>`:""}</div></div><div class="routine-view-tabs"><button type="button" data-routine-view="weekly" class="${monthlyView?"":"on"}">${routineText.weekly}</button><button type="button" data-routine-view="monthly" class="${monthlyView?"on":""}">${routineText.monthly}</button></div>${monthlyView?monthly:table}</section>`;
}
function town(){const items=catalogItems(),audiences=["아재 입맛","어린이 입맛","가족","연인·데이트","학생","고소득","오타쿠"];return `<div class="town-tabs">${state.towns.map(t=>`<button data-town-select="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}<button data-add-town>+ 마을 추가</button>${state.towns.length>1?`<button class="danger" data-delete-town="${state.activeTownId}">현재 마을 삭제</button>`:""}</div><div class="town-edit"><div class="town-map-scroll"><div class="world town-environment" data-town-language="${state.uiLanguage||"ko"}">${townBackgroundMarkup(state.world.bg)}${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}${townDecorationsMarkup()}${state.world.places.map(peopleAtPlaceCard).join("")}${townHomes().map(peopleAtHomeCard).join("")}</div></div><aside class="panel form"><div class="title"><h2>마을 편집</h2><button class="primary" data-town-save>마을 저장</button></div><section class="inline-guide"><b>마을을 만드는 순서</b><ol><li>마을 이름을 정하세요.</li><li>건물을 추가하고 유형을 고르세요.</li><li>‘건물 모양 선택’에서 추천 그림을 적용하세요.</li><li>지도 위 건물과 집을 직접 끌어 위치를 정하세요.</li></ol></section><label>마을 이름<input data-world-name value="${esc(state.world.name)}"></label><label>마을 시대<select data-world-era><option value="modern" ${state.world.era!=="medieval"?"selected":""}>현대</option><option value="medieval" ${state.world.era==="medieval"?"selected":""}>중세</option></select><small>중세를 고르면 현대적인 표현만 시대에 맞게 바뀌고, 요리·청소·산책 같은 행동은 그대로 이어져요.</small></label><p>직접 그린 숲과 연못 마을 배경을 사용하고 있어요.</p><p>건물과 집은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.</p><button data-add-place>+ 건물 추가</button><div class="place-editor">${state.world.places.map(p=>`<details><summary><b>${esc(p.emoji)} ${esc(p.name)}</b></summary><div class="place-edit-heading"><span><b>${esc(p.name)} 편집</b><small>유형을 먼저 고르면 어울리는 건물 모양을 추천해요.</small></span><button class="danger" data-delete-place="${p.id}">이 건물 삭제</button></div><div class="place-config"><label>건물 이름<input data-place-field="name" data-place-id="${p.id}" value="${esc(p.name)}"></label><label>건물 유형<select data-place-field="type" data-place-id="${p.id}">${placeTypeOptions(p)}</select></label><label>세부 유형<select data-place-field="subtype" data-place-id="${p.id}">${placeSubtypeOptions(p)}</select></label><label>가격대<select data-place-field="priceRange" data-place-id="${p.id}">${["저렴","보통","고급","명품"].map(x=>`<option ${p.priceRange===x?"selected":""}>${x}</option>`).join("")}</select></label><label>마을 속 건물 크기<input type="range" min=".45" max="1.5" step=".05" data-place-field="imageScale" data-place-id="${p.id}" value="${p.imageScale||1}"></label><label>매운맛 정도<select data-place-field="spicy" data-place-id="${p.id}">${levelOptions(SPICE_LEVELS,p.spicy||0)}</select></label><label>단맛 정도<select data-place-field="sweet" data-place-id="${p.id}">${levelOptions(SWEET_LEVELS,p.sweet||0)}</select></label></div><div class="place-photo-tools"><b>지도에 표시할 건물 모양</b><span><button data-building-shape-open="${p.id}">건물 모양 선택</button></span><b>생활 로그·현재 장면용 내부 사진</b><span><button data-place-interior-image="${p.id}">내부 사진 업로드</button><button data-image-url="placeInterior" data-id="${p.id}">링크</button>${p.interiorImage?`<button data-clear-place-interior-image="${p.id}">지우기</button>`:""}</span></div><h4>주요 이용층</h4><div class="stock-picker">${audiences.map(x=>`<button data-place-audience="${p.id}" data-value="${x}" class="${(p.audiences||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><h4>이곳에서 파는 것·이용할 수 있는 것</h4><div class="stock-list stock-picker">${items.map(item=>`<button data-place-stock="${p.id}" data-item-id="${item.id}" class="${(p.stock||[]).includes(item.id)?"on":""}">${CATALOG_LABELS[item.kind]} · ${esc(item.name)}</button>`).join("")}</div></details>`).join("")}</div></aside></div>${buildingDetailDialogs()}`}
function dlc(){return `<article class="dlc-product"><div class="dlc-product-art">🏰</div><div><small>시대 스크립트 팩</small><h2>중세의 하루</h2><p>촛불을 켜고 장부를 쓰고, 시장과 여관을 오가는 하루를 담았어요.</p><div class="dlc-buy-row"><b>1,850원</b><a class="primary dlc-buy" href="./payment.html?product=medieval">토스로 구매하기</a></div></div></article>`;}
function screenScaleSettings(){
  const sizes=[["small","작게"],["normal","보통"],["large","크게"],["xlarge","아주 크게"]];
  const fonts=[["hanbit","KCC 한빛체 · 손으로 그린 UI"],["mplus-rounded","M PLUS Rounded 1c · 일본어·한자 둥근 고딕"],["dangam","창원단감둥근체 · 둥글고 귀여움"],["haeong","해옹 산스 · 부드러운 고딕"],["dohyeon","도현체 · 또렷한 제목"],["corncorn","온글잎 꾹꾹체 · 귀여운 손글씨"],["griun","그리운 심심체 · 손글씨"],["aggro","SB 어그로체 · 단단한 고딕"],["system","기기 기본 글꼴"]];
  return `<section class="setting-card font-setting-card"><h2>${t("글자와 화면 크기","글자와 화면 크기")}</h2><p>${t("글자 크기와 글꼴을 고를 수 있어요. 일본어·한자는 M PLUS Rounded 1c가 가장 안정적으로 표시돼요.","글자 크기와 글꼴을 고를 수 있어요. 일본어·한자는 M PLUS Rounded 1c가 가장 안정적으로 표시돼요.")}</p><div class="font-setting-grid"><label>${t("글자 크기","글자 크기")}<select data-setting="uiScale">${sizes.map(([value,label])=>`<option value="${value}" ${state.uiScale===value?"selected":""}>${t(label,label)}</option>`).join("")}</select></label><label>${t("사용할 글꼴","사용할 글꼴")}<select data-setting="uiFont">${fonts.map(([value,label])=>`<option value="${value}" ${state.uiFont===value?"selected":""}>${t(label,label)}</option>`).join("")}</select></label></div><div class="font-preview"><b>${t("서랍마을의 오늘","서랍마을의 오늘")}</b><span>${t("캐릭터들이 각자의 하루를 보내고 있어요. 긴 생활 로그도 편안하게 읽어 보세요.","캐릭터들이 각자의 하루를 보내고 있어요. 긴 생활 로그도 편안하게 읽어 보세요.")}</span></div></section>`;
}
Object.assign(UI_TEXT.en,{
  "글자와 화면 크기":"Text and display","글자 크기와 글꼴을 고를 수 있어요. 일본어·한자는 M PLUS Rounded 1c가 가장 안정적으로 표시돼요.":"Choose the text size and typeface. M PLUS Rounded 1c provides the clearest Japanese and kanji.","글자 크기":"Text size","사용할 글꼴":"Typeface","작게":"Small","보통":"Medium","크게":"Large","아주 크게":"Extra large","서랍마을의 오늘":"Today in Drawer Village","캐릭터들이 각자의 하루를 보내고 있어요. 긴 생활 로그도 편안하게 읽어 보세요.":"Your characters are living their own days. Long life logs should stay comfortable to read.","M PLUS Rounded 1c · 일본어·한자 둥근 고딕":"M PLUS Rounded 1c · Rounded Japanese UI","창원단감둥근체 · 둥글고 귀여움":"Changwon Dangam · Soft and cute","해옹 산스 · 부드러운 고딕":"Haeong Sans · Gentle sans serif","도현체 · 또렷한 제목":"Do Hyeon · Clear display","온글잎 꾹꾹체 · 귀여운 손글씨":"Ownglyph Corncorn · Cute handwriting","SB 어그로체 · 단단한 고딕":"SB Aggro · Bold sans serif","기기 기본 글꼴":"Device default"
});
Object.assign(UI_TEXT.ja,{
  "글자와 화면 크기":"文字と画面サイズ","글자 크기와 글꼴을 고를 수 있어요. 일본어·한자는 M PLUS Rounded 1c가 가장 안정적으로 표시돼요.":"文字サイズとフォントを選べます。日本語・漢字には M PLUS Rounded 1c が最も読みやすく表示されます。","글자 크기":"文字サイズ","사용할 글꼴":"使用するフォント","작게":"小さめ","보통":"標準","크게":"大きめ","아주 크게":"最大","서랍마을의 오늘":"今日のひきだし村","캐릭터들이 각자의 하루를 보내고 있어요. 긴 생활 로그도 편안하게 읽어 보세요.":"キャラクターたちはそれぞれの一日を過ごしています。長い生活ログも読みやすく表示されます。","M PLUS Rounded 1c · 일본어·한자 둥근 고딕":"M PLUS Rounded 1c・読みやすい丸ゴシック","창원단감둥근체 · 둥글고 귀여움":"チャンウォンダンガム・丸くてかわいい","해옹 산스 · 부드러운 고딕":"ヘオン・やわらかなゴシック","도현체 · 또렷한 제목":"Do Hyeon・くっきりした見出し","온글잎 꾹꾹체 · 귀여운 손글씨":"Ownglyph クックック・かわいい手書き風","SB 어그로체 · 단단한 고딕":"SB Aggro・力強いゴシック","기기 기본 글꼴":"端末の標準フォント"
});
Object.assign(UI_TEXT.en,{"그리운 심심체 · 손글씨":"Griun Simsimche · Handwriting"});
Object.assign(UI_TEXT.ja,{"그리운 심심체 · 손글씨":"グリウン・シムシム体・手書き風"});
Object.assign(UI_TEXT.en,{"KCC 한빛체 · 손으로 그린 UI":"KCC Hanbit · Hand-drawn UI"});
Object.assign(UI_TEXT.ja,{"KCC 한빛체 · 손으로 그린 UI":"KCC Hanbit・手描きUI"});
Object.assign(UI_TEXT.en,{
  "내 집 또는 자동 선택":"My home or automatic","캐릭터의 집":"Character homes","마을의 건물":"Town buildings","즉시 귀환":"Return home now","현재 외출을 끝내고 다음 등록 일정 전까지 집에서 지내게 해요.":"End the current outing and stay home until the next scheduled plan.","모두 귀환":"Send everyone home",
  "선물로 받고 싶은 것을 포함해 특히 좋아하는 항목과 실제로 가지고 다니거나 보관하는 물건을 각각 골라 주세요. 실제 선물은 우편함에서 보낼 수 있어요.":"Choose favorite items, including gifts this character would like to receive, and separately choose what they actually carry or store. Send real gifts from the Mailbox."
});
Object.assign(UI_TEXT.ja,{
  "내 집 또는 자동 선택":"自宅または自動選択","캐릭터의 집":"キャラクターの家","마을의 건물":"村の建物","즉시 귀환":"すぐ帰宅","현재 외출을 끝내고 다음 등록 일정 전까지 집에서 지내게 해요.":"現在の外出を終え、次の登録予定まで家で過ごします。","모두 귀환":"全員を帰宅",
  "선물로 받고 싶은 것을 포함해 특히 좋아하는 항목과 실제로 가지고 다니거나 보관하는 물건을 각각 골라 주세요. 실제 선물은 우편함에서 보낼 수 있어요.":"プレゼントでもらいたい物を含むお気に入りと、実際に持ち歩いたり保管したりする物を分けて選びます。実際のプレゼントは郵便箱から送れます。"
});
const ownerNameSettings=()=>`<section class="setting-card owner-name-card"><h2>사용자 닉네임</h2><p>Google 계정 이름 대신 동기화 화면에 표시하고, 캐릭터가 사용자의 부탁을 말할 때도 이 이름을 사용해요.</p><label>캐릭터들이 뭐라고 부를까요?<input data-setting="ownerName" maxlength="20" value="${esc(state.ownerName||"")}" placeholder="예: 꺄륵"></label></section>`;
function visualThemeSettings(){
  const copy={
    en:{heading:"Home UI theme",description:"The current release keeps one complete Drawer Village UI pack as the default. Future packs can replace the frame and every home icon together, globally or per character.",current:"Current default",name:"Drawer Village Classic"},
    ja:{heading:"ホームUIテーマ",description:"現在は「ひきだし村」UIパックだけを基本テーマとして使用します。今後は枠とホームアイコン一式を、全体またはキャラクターごとに切り替えられます。",current:"現在の基本テーマ",name:"ひきだし村クラシック"},
    ko:{heading:"홈 화면 UI 테마",description:"지금은 서랍마을 UI 팩 하나만 기본 테마로 사용해요. 이후 팩을 추가하면 상단판과 홈 아이콘 전체를 공통 또는 캐릭터별로 바꿀 수 있어요.",current:"현재 기본 테마",name:"서랍마을 기본"}
  }[state.uiLanguage||"ko"];
  return `<section class="setting-card visual-theme-card"><h2>${copy.heading}</h2><p>${copy.description}</p><div class="current-visual-theme" style="--theme-a:#80502f;--theme-b:#b77a4b"><i aria-hidden="true"></i><span><small>${copy.current}</small><b>${copy.name}</b></span></div></section>`;
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
  "마을 정보":"Town info","건물 편집":"Edit buildings","지도에 표시할 건물 모양":"Building design shown on the map","건물 모양":"Building design","건물 모양 선택":"Choose building design","건물 모양 변경":"Change building design","생활 로그·현재 장면용 내부 사진":"Interior art for life logs and current scenes","내부 사진":"Interior image","내부 사진 업로드":"Upload interior art","집 선택 사진":"Home selector photo","사진 추가":"Add photo","사진 변경":"Change photo","링크":"Link","지우기":"Remove","주요 이용층":"Main audience","판매 목록":"Items for sale","정하지 않음":"Not set","추가 설정":"More settings","이곳에서 파는 것·이용할 수 있는 것":"Items and services available here","집의 방·거주 설정은 집 화면에서 이어서 편집할 수 있어요.":"Room and resident settings remain available from the Home screen.","방·거주 설정 열기":"Open room & resident settings",
  "카페":"Cafe","음식점":"Restaurant","병원":"Hospital","공연장":"Venue","옷가게":"Clothing shop","사무실":"Office","학교":"School","공원":"Park","도서관":"Library","쇼핑몰":"Shopping center","숙박":"Lodging","관공서":"Public office","기타":"Other","기본 건물":"Basic building","작은 집":"Small house","단독주택":"Detached house","아파트":"Apartment","빌라":"Low-rise apartment","연립주택":"Row house","오피스텔":"Studio residence","타운하우스":"Townhouse","농가":"Farmhouse","저택":"Mansion","성":"Castle","궁전":"Palace","기숙사":"Dormitory","사택":"Company housing","공동주택":"Communal housing","이동식 주택":"Mobile home","지정 안 함 · 해당 유형 전체 취급":"No subtype · General use",
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
  "마을 정보":"村の情報","건물 편집":"建物を編集","지도에 표시할 건물 모양":"地図に表示する建物デザイン","건물 모양":"建物デザイン","건물 모양 선택":"建物デザインを選ぶ","건물 모양 변경":"建物デザインを変更","생활 로그·현재 장면용 내부 사진":"生活ログ・現在シーン用の内装画像","내부 사진":"内装画像","내부 사진 업로드":"内装画像をアップロード","집 선택 사진":"家選択用の写真","사진 추가":"写真を追加","사진 변경":"写真を変更","링크":"リンク","지우기":"削除","주요 이용층":"主な利用者","판매 목록":"販売一覧","정하지 않음":"未設定","추가 설정":"追加設定","이곳에서 파는 것·이용할 수 있는 것":"ここで販売・利用できるもの","집의 방·거주 설정은 집 화면에서 이어서 편집할 수 있어요.":"部屋・住人設定は家画面から続けて編集できます。","방·거주 설정 열기":"部屋・住人設定を開く",
  "카페":"カフェ","음식점":"飲食店","병원":"病院","공연장":"公演会場","옷가게":"服屋","사무실":"オフィス","학교":"学校","공원":"公園","도서관":"図書館","쇼핑몰":"ショッピングモール","숙박":"宿泊施設","관공서":"公共機関","기타":"その他","기본 건물":"基本の建物","작은 집":"小さな家","단독주택":"一戸建て","아파트":"マンション","빌라":"低層マンション","연립주택":"連棟住宅","오피스텔":"オフィステル","타운하우스":"タウンハウス","농가":"農家住宅","저택":"邸宅","성":"城","궁전":"宮殿","기숙사":"寮","사택":"社宅","공동주택":"共同住宅","이동식 주택":"移動式住宅","지정 안 함 · 해당 유형 전체 취급":"指定なし・種類全般",
  "로스터리 카페":"ロースタリーカフェ","디저트 카페":"デザートカフェ","테마 카페":"テーマカフェ","찻집":"茶屋","한식당":"韓国料理店","중식당":"中華料理店","일식당":"日本料理店","이탈리아 식당":"イタリア料理店","분식집":"軽食店","패스트푸드점":"ファストフード店","디저트 가게":"デザートショップ",
  "종합병원":"総合病院","내과":"内科","외과":"外科","이비인후과":"耳鼻咽喉科","정형외과":"整形外科","피부과":"皮膚科","치과":"歯科","안과":"眼科","한의원":"韓医院","콘서트홀":"コンサートホール","라이브 클럽":"ライブクラブ","뮤지컬 극장":"ミュージカル劇場","연극 극장":"演劇場","야외 공연장":"野外公演場",
  "스포츠 브랜드":"スポーツブランド店","캐주얼 브랜드":"カジュアルブランド店","정장 브랜드":"フォーマル店","빈티지 숍":"ヴィンテージショップ","디자이너 브랜드":"デザイナーブランド店","신발 가게":"靴屋","액세서리 숍":"アクセサリーショップ","일반 회사":"一般企業","IT 회사":"IT企業","연구소":"研究所","방송국":"放送局","출판사":"出版社","디자인 스튜디오":"デザインスタジオ",
  "초등학교":"小学校","중학교":"中学校","고등학교":"高校","대학교":"大学","학원":"学習塾","근린공원":"近隣公園","수목원":"植物園","놀이공원":"遊園地","반려동물 공원":"ペット公園","공공도서관":"公共図書館","대학도서관":"大学図書館","전문도서관":"専門図書館","백화점":"百貨店","아울렛":"アウトレット","복합 쇼핑몰":"複合ショッピングモール","호텔":"ホテル","여관":"旅館","리조트":"リゾート","게스트하우스":"ゲストハウス","시청":"市役所","주민센터":"住民センター","경찰서":"警察署","소방서":"消防署"
});
Object.assign(UI_TEXT.en,{
  "설정 메뉴":"Settings menu","게임플레이":"Gameplay","홈 화면과 마을 표시":"Home screen and town display","알림":"Notifications","캐릭터 연락과 일정 종료 알림":"Character messages and schedule-end alerts",
  "화면·표시":"Display & appearance","화면 모드, 색상 테마, 글자와 조작 크기":"Display mode, color theme, and text/control size",
  "계정·백업":"Account & backup","언어와 백업 파일":"Language and backup files",
  "도움말·오류 신고":"Help & bug reports","피드백, 페이지 안내, 초기화":"Feedback, page guides, and reset",
  "설정 메뉴로 돌아가기":"Back to settings menu","주 색상":"Primary color","보조 색상":"Secondary color","주 색상 빠른 색상":"Primary quick colors","보조 색상 빠른 색상":"Secondary quick colors","두 색상을 그라데이션으로 사용":"Use a gradient of both colors",
  "데이터 초기화":"Reset data","기기의 서랍마을 데이터를 모두 지울 때만 사용하세요.":"Use this only when you want to erase all Drawer Village data on this device."
});
Object.assign(UI_TEXT.ja,{
  "설정 메뉴":"設定メニュー","게임플레이":"ゲームプレイ","홈 화면과 마을 표시":"ホーム画面と村の表示","알림":"通知","캐릭터 연락과 일정 종료 알림":"キャラクターからの連絡と予定終了通知",
  "화면·표시":"画面・表示","화면 모드, 색상 테마, 글자와 조작 크기":"画面モード、カラーテーマ、文字と操作の大きさ",
  "계정·백업":"アカウント・バックアップ","언어와 백업 파일":"言語とバックアップファイル",
  "도움말·오류 신고":"ヘルプ・不具合報告","피드백, 페이지 안내, 초기화":"フィードバック、ページ案内、初期化",
  "설정 메뉴로 돌아가기":"設定メニューに戻る","주 색상":"メインカラー","보조 색상":"サブカラー","주 색상 빠른 색상":"メインカラーのクイックカラー","보조 색상 빠른 색상":"サブカラーのクイックカラー","두 색상을 그라데이션으로 사용":"2色をグラデーションで使用",
  "데이터 초기화":"データを初期化","기기의 서랍마을 데이터를 모두 지울 때만 사용하세요.":"この端末のひきだし村データをすべて消去するときだけ使用してください。"
});
Object.assign(UI_TEXT.en,{
  "캐릭터 그룹":"Character groups","빌런즈처럼 자주 함께 움직이는 인물을 묶으면 일정에서 한 번에 선택할 수 있어요.":"Group characters who often act together, such as a villains team, and select them together in schedules.","+ 그룹 만들기":"+ Create group","구성원 없음":"No members","아직 만든 그룹이 없어요.":"No groups yet.","캐릭터 그룹 편집":"Edit character group","캐릭터 그룹 만들기":"Create character group","그룹 이름":"Group name","그룹에 넣을 캐릭터":"Characters in this group","그룹은 캐릭터와 기존 관계를 바꾸지 않으며, 일정의 함께하는 인물을 빠르게 고를 때 사용합니다.":"Groups do not change characters or relationships. They are shortcuts for selecting schedule companions.","그룹으로 빠르게 선택":"Quick-select a group",
  "캐릭터의 마을 이동":"Character town movement","켜면 캐릭터가 다른 마을의 집·직장·일정 장소로 자동 이동하지 않고 자기 마을 안에서 생활합니다.":"When enabled, characters stay in their own town instead of automatically traveling to homes, workplaces, or schedule locations in other towns.","마을 사이 이동 완전히 막기":"Block all inter-town movement","기존 일정은 지우지 않고, 이 설정을 끄면 다시 원래 장소를 사용해요.":"Existing schedules are preserved and resume using their original locations when this is turned off.","⏰ 일정 종료 알림":"⏰ Schedule end notifications","선택한 캐릭터의 등록 일정이 끝나는 시각에 알려줘요.":"Notify you when a selected character's saved schedule ends.",
  "캐릭터 바꾸기":"Change character","일정 추가":"Add schedule","기념일":"Anniversary","기록물":"Archive","주간 일정 편집":"Edit weekly schedule","월간 일정 편집":"Edit dated schedule","기념일 추가":"Add anniversary","기념일 편집":"Edit anniversary","날짜 · 매년 반복":"Date · repeats yearly","날짜":"Date","시작 시각":"Start time","종료 시각":"End time","일정 종류":"Schedule type","개인 일정":"Personal schedule","일정 이름":"Schedule name","장소":"Location","내 집 또는 자동 선택":"My home or automatic","함께하는 캐릭터":"Characters joining","기념일 유형":"Anniversary type","표시할 이름":"Display name","비우면 기념일 유형으로 표시":"Leave blank to use the anniversary type","연락을 보낼 캐릭터":"Character who will contact you","함께 기념할 캐릭터":"Character celebrating together","선택하지 않음":"Do not select","메모":"Notes","월":"Month","일":"Day","취소":"Cancel","저장":"Save","삭제":"Delete",
  "화면에 표시되는 글자의 크기만 조절합니다. 사이트 글꼴은 화면 디자인에 맞는 서랍마을 글꼴로 표시돼요.":"Adjust only the displayed text size. Drawer Village uses the font designed for its interface."
});
Object.assign(UI_TEXT.ja,{
  "캐릭터 그룹":"キャラクターグループ","빌런즈처럼 자주 함께 움직이는 인물을 묶으면 일정에서 한 번에 선택할 수 있어요.":"ヴィランズのようによく一緒に行動する人物をまとめ、予定で一括選択できます。","+ 그룹 만들기":"＋グループ作成","구성원 없음":"メンバーなし","아직 만든 그룹이 없어요.":"まだグループがありません。","캐릭터 그룹 편집":"キャラクターグループ編集","캐릭터 그룹 만들기":"キャラクターグループ作成","그룹 이름":"グループ名","그룹에 넣을 캐릭터":"グループに入れる人物","그룹은 캐릭터와 기존 관계를 바꾸지 않으며, 일정의 함께하는 인물을 빠르게 고를 때 사용합니다.":"グループは人物や既存の関係を変更せず、予定の同行者をすばやく選ぶために使います。","그룹으로 빠르게 선택":"グループを一括選択",
  "캐릭터의 마을 이동":"キャラクターの村移動","켜면 캐릭터가 다른 마을의 집·직장·일정 장소로 자동 이동하지 않고 자기 마을 안에서 생활합니다.":"有効にすると、別の村の家・職場・予定場所へ自動移動せず、自分の村で生活します。","마을 사이 이동 완전히 막기":"村同士の移動を完全に防ぐ","기존 일정은 지우지 않고, 이 설정을 끄면 다시 원래 장소를 사용해요.":"既存の予定は削除せず、この設定をオフにすると元の場所を再び使います。","⏰ 일정 종료 알림":"⏰ 予定終了通知","선택한 캐릭터의 등록 일정이 끝나는 시각에 알려줘요.":"選択した人物の登録予定が終わる時刻に通知します。",
  "캐릭터 바꾸기":"人物を変更","일정 추가":"予定を追加","기념일":"記念日","기록물":"記録","주간 일정 편집":"週間予定を編集","월간 일정 편집":"日付指定の予定を編集","기념일 추가":"記念日を追加","기념일 편집":"記念日を編集","날짜 · 매년 반복":"日付・毎年繰り返す","날짜":"日付","시작 시각":"開始時刻","종료 시각":"終了時刻","일정 종류":"予定の種類","개인 일정":"個人の予定","일정 이름":"予定名","장소":"場所","내 집 또는 자동 선택":"自宅または自動選択","함께하는 캐릭터":"同行する人物","기념일 유형":"記念日の種類","표시할 이름":"表示名","비우면 기념일 유형으로 표시":"空欄なら記念日の種類を表示","연락을 보낼 캐릭터":"連絡する人物","함께 기념할 캐릭터":"一緒に祝う人物","선택하지 않음":"選択しない","메모":"メモ","월":"月","일":"日","취소":"キャンセル","저장":"保存","삭제":"削除",
  "화면에 표시되는 글자의 크기만 조절합니다. 사이트 글꼴은 화면 디자인에 맞는 서랍마을 글꼴로 표시돼요.":"画面に表示する文字サイズだけを調整します。ひきだし村はUIデザインに合わせた書体で表示します。"
});
function settingsContent(){
  const colorMode=`<section class="setting-card color-mode-card"><h2>화면 모드</h2><p>밝은 화면과 어두운 화면 중 읽기 편한 쪽을 고르세요.</p><div class="color-mode-options"><button type="button" data-color-mode="light" class="${state.colorMode==="light"?"on":""}"><span>☀️</span><b>화이트 모드</b></button><button type="button" data-color-mode="dark" class="${state.colorMode!=="light"?"on":""}"><span>🌙</span><b>다크 모드</b></button></div></section>`;
  const sound=`<section class="setting-card sound-setting-card"><h2>${t("이동과 생활 효과음","이동과 생활 효과음")}</h2><p>${t("캐릭터가 걷거나 뛰는 동안 들리는 효과음을 조절해요.","캐릭터가 걷거나 뛰는 동안 들리는 효과음을 조절해요.")}</p><label class="notification-update-option"><input type="checkbox" data-sound-muted ${state.soundMuted?"checked":""}><span><b>${t("모든 효과음 음소거","모든 효과음 음소거")}</b><small>${t("앱의 이동·생활 효과음을 한 번에 끕니다.","앱의 이동·생활 효과음을 한 번에 끕니다.")}</small></span></label><label class="sound-volume-control">${t("효과음 크기","효과음 크기")} <output>${Math.round(Number(state.soundEffectsVolume)||0)}%</output><input type="range" min="0" max="100" step="5" value="${Number(state.soundEffectsVolume)||0}" data-sound-volume ${state.soundMuted?"disabled":""}></label><div class="sound-preview-actions"><button type="button" data-sound-preview="walk" ${state.soundMuted?"disabled":""}>${t("걷기 구두소리 듣기","걷기 구두소리 듣기")}</button><button type="button" data-sound-preview="run" ${state.soundMuted?"disabled":""}>${t("달리기 구두소리 듣기","달리기 구두소리 듣기")}</button></div>${state.soundMuted?`<small>${t("음소거를 해제하면 미리 들을 수 있어요.","음소거를 해제하면 미리 들을 수 있어요.")}</small>`:""}</section>`;
  const measurement=`<section class="setting-card measurement-setting-card"><h2>${t("신체 단위","신체 단위")}</h2><p>${t("캐릭터 설정의 키와 몸무게 표기 단위를 고릅니다.","캐릭터 설정의 키와 몸무게 표기 단위를 고릅니다.")}</p><label>${t("표기 단위","표기 단위")}<select data-setting="measurementUnits"><option value="metric" ${state.measurementUnits!=="imperial"?"selected":""}>${t("미터법 · cm / kg","미터법 · cm / kg")}</option><option value="imperial" ${state.measurementUnits==="imperial"?"selected":""}>${t("야드파운드법 · in / lb","야드파운드법 · in / lb")}</option></select></label><small>${t("저장값은 안전하게 유지되며 화면 표기만 변환됩니다.","저장값은 안전하게 유지되며 화면 표기만 변환됩니다.")}</small></section>`;
  const homeCharacterDisplay=`<section class="setting-card home-character-display-card"><h2>홈 화면 캐릭터 표현</h2><p>모든 캐릭터에 같은 표시 방식을 적용합니다. LD는 원본 비율을 유지하고 자르거나 늘리지 않습니다.</p><label>SD / LD<select data-setting="homeVisualMode"><option value="sd" ${state.homeVisualMode!=="ld"?"selected":""}>SD</option><option value="ld" ${state.homeVisualMode==="ld"?"selected":""}>LD</option></select></label><label>SD 크기 <output>${Math.round(Number(state.homeSdScale)||100)}%</output><input type="range" min="70" max="150" step="5" value="${Number(state.homeSdScale)||100}" data-setting="homeSdScale"></label><label>LD 크기 <output>${Math.round(Number(state.homeLdScale)||100)}%</output><input type="range" min="70" max="150" step="5" value="${Number(state.homeLdScale)||100}" data-setting="homeLdScale"></label><small>2인 LD도 1인과 같은 높이·같은 Y좌표를 사용하고 X좌표만 좌우로 나뉩니다. 현재 선택한 캐릭터가 항상 앞에 표시됩니다.</small></section>`;
  const sync=`<section class="sync-panel setting-card"><h2>저장과 동기화</h2><p id="account-status">${esc(accountText)}</p><div class="sync-actions"><button class="primary" data-auth>Google 로그인 / 로그아웃</button><button data-sync-upload>동기화</button><button data-sync-download>불러오기</button></div><small>캐릭터 정보와 사진을 함께 Google 계정에 동기화합니다.</small><small>LD는 자르지 않고 원본 비율을 유지하며, 큰 사진은 저장용 사본만 비율대로 축소해요.</small><div class="account-deletion-links"><a href="./privacy.html#account-deletion" target="_blank" rel="noopener">계정·클라우드 데이터 삭제 안내</a><a href="mailto:kkyaareuk@gmail.com?subject=%EC%84%9C%EB%9E%8D%EB%A7%88%EC%9D%84%20%EA%B3%84%EC%A0%95%20%EB%B0%8F%20%EB%8D%B0%EC%9D%B4%ED%84%B0%20%EC%82%AD%EC%A0%9C%20%EC%9A%94%EC%B2%AD">삭제 요청 메일 보내기</a></div></section>`;
  const map=`<section class="setting-card map-display-card"><h2>마을 지도 표시</h2><label>건물 표기 방식<select data-setting="buildingLabelMode"><option value="full" ${state.buildingLabelMode==="full"?"selected":""}>이름과 건물 유형 표시</option><option value="name" ${state.buildingLabelMode==="name"?"selected":""}>이름만 표시</option><option value="none" ${state.buildingLabelMode==="none"?"selected":""}>아무 글자도 표시하지 않기</option></select></label><label>지도 위 캐릭터 표기<select data-setting="mapCharacterLabelMode"><option value="none" ${state.mapCharacterLabelMode==="none"?"selected":""}>캐릭터 아이콘만 표시</option><option value="name" ${state.mapCharacterLabelMode==="name"?"selected":""}>아이콘 아래 이름 표시</option></select></label><small>같은 건물에 있는 캐릭터는 지도에서 한 묶음으로 표시됩니다.</small></section>`;
  const movement=`<section class="setting-card intertown-movement-card"><h2>캐릭터의 마을 이동</h2><p>켜면 캐릭터가 다른 마을의 집·직장·일정 장소로 자동 이동하지 않고 자기 마을 안에서 생활합니다.</p><label class="notification-update-option"><input type="checkbox" data-prevent-intertown-movement ${state.preventInterTownMovement?"checked":""}><span><b>마을 사이 이동 완전히 막기</b><small>기존 일정은 지우지 않고, 이 설정을 끄면 다시 원래 장소를 사용해요.</small></span></label></section>`;
  const language=`<section class="setting-card language-setting-card"><h2>${t("language","언어 · Language · 言語")}</h2><p>${t("languageHelp","영어와 일본어 번역 범위를 계속 넓히고 있어요.")}</p><label>Language<select data-setting="uiLanguage"><option value="ko">한국어</option><option value="en">English (Beta)</option><option value="ja">日本語（ベータ）</option></select></label><small>${t("languageNote","영어·일본어 베타 · 생활 장면 번역도 계속 추가됩니다.")}</small></section>`;
  const backup=`<section class="setting-card backup-file-card"><h2>브라우저 백업 파일</h2><p>사진 없이 정보만 내보냅니다. 불러올 때도 이 기기의 기존 사진은 그대로 유지해요.</p><div class="sync-actions"><button data-export-file>백업 파일 내보내기</button><button data-import-file>백업 파일 불러오기</button></div></section>`;
  const feedback=`<section class="setting-card feedback-card"><h2>개발자에게 피드백 보내기</h2><p>유형을 고르면 기기의 메일 앱이 열려요.</p></section>`;
  const guide=`<section class="setting-card page-guide-card"><h2>페이지 안내</h2><p>각 페이지를 처음 열었을 때 나오는 안내를 다시 볼 수 있어요.</p><button data-guide-reset>모든 페이지 안내 다시 보기</button></section>`;
  const noticeSettings=state.characterNotificationSettings||{},noticeIds=new Set(noticeSettings.characterIds?.length?noticeSettings.characterIds:state.order);
  const noticeCharacters=state.order.map(id=>{const character=state.characters[id],image=character?.icon||character?.photo||"";return `<label class="notification-character-option ${noticeIds.has(id)?"on":""}"><input type="checkbox" data-character-notification-character="${esc(id)}" ${noticeIds.has(id)?"checked":""}>${image?`<img src="${esc(image)}" alt="">`:`<span>${esc(character?.name?.slice(0,1)||"새")}</span>`}<b>${esc(character?.name||"캐릭터")}</b></label>`}).join("")||"<p>알림을 받을 캐릭터를 먼저 만들어 주세요.</p>";
  const noticeHourOptions=(from,to,current)=>Array.from({length:to-from+1},(_,index)=>from+index).map(hour=>`<option value="${hour}" ${Number(current)===hour?"selected":""}>${String(hour).padStart(2,"0")}:00</option>`).join("");
  const noticeKinds=[["questions","❓ 질문과 실제 선택"],["checkins","💬 오늘의 안부 질문"],["worries","🤔 캐릭터의 고민"],["comfort","🌿 다정한 휴식 메시지"],["lifeLogs","📖 구체적인 생활로그"],["relationships","🎁 관계와 선물"],["home","🏠 집과 생활"],["work","💼 일과 학교"],["tastes","🍰 취향과 음식"]];
  const noticeFrequencyControls=`<label>빈도 기준<select data-character-notification-setting="frequencyMode"><option value="perDay" ${noticeSettings.frequencyMode!=="interval"?"selected":""}>하루 횟수로 정하기</option><option value="interval" ${noticeSettings.frequencyMode==="interval"?"selected":""}>몇 시간마다 받기</option></select></label><label>하루 연락 횟수<select data-character-notification-setting="timesPerDay">${[1,2,3,4,5,6].map(value=>`<option value="${value}" ${Number(noticeSettings.timesPerDay||1)===value?"selected":""}>하루 ${value}번</option>`).join("")}</select></label><label>연락 간격<select data-character-notification-setting="intervalHours">${[2,3,4,6,8,12].map(value=>`<option value="${value}" ${Number(noticeSettings.intervalHours||4)===value?"selected":""}>${value}시간마다</option>`).join("")}</select></label>`;
  const notifications=`<section class="setting-card character-notification-card"><div class="notification-setting-head"><span><small>CHARACTER CONTACT</small><h2>캐릭터 연락 알림</h2><p>질문·고민·안부와 실제 생활로그가 낮 시간에 도착해요. 알림을 눌러도 갑작스러운 팝업은 열리지 않고, 캐릭터 화면의 ‘오늘의 연락’에서 확인합니다.</p></span><button type="button" class="${state.characterNotificationsEnabled?"danger":"primary"}" data-character-notification-toggle>${state.characterNotificationsEnabled?"알림 끄기":"알림 켜기"}</button></div><p class="notification-permission-state" data-character-notification-status>${state.characterNotificationsEnabled?"알림 사용 중":state.characterNotificationConsent==="granted"?"알림 꺼짐 · 권한은 유지됨":state.characterNotificationConsent==="denied"?"휴대폰에서 알림이 거부됨":"아직 알림을 요청하지 않음"}</p><section class="notification-settings-detail" aria-label="연락 설정"><div class="notification-settings-body"><h3>1. 연락받을 캐릭터</h3><p>여러 명을 고르면 같은 캐릭터가 연달아 나오지 않게 번갈아 연락해요.</p><div class="notification-character-grid">${noticeCharacters}</div><h3>2. 빈도와 시간</h3><div class="notification-setting-grid">${noticeFrequencyControls}<label>알림 말투<select data-character-notification-setting="voiceMode"><option value="mixed" ${noticeSettings.voiceMode!=="character"&&noticeSettings.voiceMode!=="concise"?"selected":""}>섞어서 · 말투와 담백한 문장</option><option value="character" ${noticeSettings.voiceMode==="character"?"selected":""}>캐릭터 말투를 적극 반영</option><option value="concise" ${noticeSettings.voiceMode==="concise"?"selected":""}>담백하게 · 말투 연출 최소화</option></select></label><label>연락 시작 시간<select data-character-notification-setting="startHour">${noticeHourOptions(9,16,noticeSettings.startHour||10)}</select></label><label>연락 종료 시간<select data-character-notification-setting="endHour">${noticeHourOptions(12,21,noticeSettings.endHour||18)}</select></label></div><p>‘하루 횟수’는 선택한 낮 시간 안에서 고르게 나누고, ‘몇 시간마다’는 시작 시간부터 정한 간격으로 도착해요.</p><h3>3. 받고 싶은 연락</h3><div class="notification-kind-grid">${noticeKinds.map(([kind,label])=>{const selected=(noticeSettings.contentKinds||[]).includes(kind);return `<button type="button" class="${selected?"on":""}" data-character-notification-kind="${kind}" aria-pressed="${selected}"><span>${label}</span></button>`}).join("")}</div><label class="notification-update-option"><input type="checkbox" data-character-schedule-end-notices ${noticeSettings.scheduleEnds?"checked":""}><span><b>⏰ 일정 종료 알림</b><small>선택한 캐릭터의 등록 일정이 끝나는 시각에 알려줘요.</small></span></label><p>생일과 기념일 연락은 특별한 날짜에 한 번만 도착합니다. 생활로그는 관찰 기록 문장 그대로 보내고 말투를 입히지 않으며, 그 밖의 연락은 선택한 말투 설정을 따라요.</p><button type="button" data-character-notification-test ${state.characterNotificationsEnabled?"":"disabled"}>5초 뒤 시험 알림 보내기</button></div></section><small>알림의 작은 상태표시 아이콘은 Android 규칙상 앱 아이콘이며, 본문 옆 큰 아이콘에는 연락한 캐릭터의 등록 이미지를 표시해요. 처음 켤 때 설명 뒤 Android 공식 허용창이 한 번 나타나며 언제든 여기나 휴대폰 설정에서 끌 수 있어요.</small></section>`;
  const appVersion=String(window.DRAWER_VILLAGE_APP_VERSION||"").trim(),versionCode=String(window.DRAWER_VILLAGE_VERSION_CODE||"").trim();
  const buildLabel=state.uiLanguage==="en"?"Build":state.uiLanguage==="ja"?"ビルド":"빌드";
  const versionText=appVersion?`${appVersion}${versionCode?` · ${buildLabel} ${versionCode}`:""}`:"웹 버전 · 자동 업데이트";
  const appInfo=`<section class="setting-card app-version-card"><h2>앱 정보</h2><p><b>현재 버전</b> <span>${esc(versionText)}</span></p><small>오류를 제보할 때 이 버전과 빌드 번호를 함께 알려 주세요.</small></section>`;
  const achievementCopy=({
    en:{heading:"Achievements",intro:"Progress is saved in this world first, then synced to the signed-in Google Play Games profile on Android.",unlocked:"Unlocked",progress:"In progress",local:"Saved in this world",open:"Open Google Play achievements",signIn:"Connect Play Games",setup:"Google Play achievement IDs have not been connected to this build yet. Local progress is still recorded."},
    ja:{heading:"実績",intro:"この世界で進捗を先に保存し、Androidではログイン中のGoogle Play Gamesプロフィールへ同期します。",unlocked:"達成済み",progress:"進行中",local:"この世界に保存済み",open:"Google Playの実績を開く",signIn:"Play Gamesに接続",setup:"このビルドにはGoogle Play実績IDがまだ接続されていません。端末内の進捗は記録されます。"},
    ko:{heading:"업적",intro:"이 월드에서 먼저 달성 여부를 저장하고, Android에서는 로그인된 Google Play 게임즈 프로필에 동기화해요.",unlocked:"달성",progress:"진행 중",local:"이 월드에 기록됨",open:"Google Play 업적 열기",signIn:"Play 게임즈 연결",setup:"아직 이 빌드에 Google Play 업적 ID가 연결되지 않았어요. 게임 안의 달성 기록은 계속 저장됩니다."}
  }[state.uiLanguage]||null);
  const achievementList=achievementRows(state,state.uiLanguage),achievementUnlocked=achievementList.filter(item=>item.unlocked).length;
  const achievementItems=achievementList.map(item=>`<article class="achievement-card ${item.unlocked?"is-unlocked":""}"><span class="achievement-icon" aria-hidden="true">${item.icon}</span><div><small>${item.unlocked?achievementCopy.unlocked:achievementCopy.progress}</small><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p><progress max="${item.goal}" value="${item.value}"></progress><b>${item.value} / ${item.goal}</b></div></article>`).join("");
  const achievements=`<section class="setting-card achievements-setting-card"><header><span><small>GOOGLE PLAY GAMES</small><h2>${achievementCopy.heading}</h2></span><b>${achievementUnlocked} / ${achievementList.length}</b></header><p>${achievementCopy.intro}</p><p class="achievement-platform-status" data-achievement-platform-status>${achievementCopy.local}</p><div class="achievement-grid">${achievementItems}</div><div class="achievement-actions"><button type="button" data-achievement-sign-in>${achievementCopy.signIn}</button><button type="button" class="primary" data-open-google-achievements>${achievementCopy.open}</button></div><small data-achievement-setup-note hidden>${achievementCopy.setup}</small></section>`;
  const menu=`<nav class="settings-category-grid" aria-label="설정 메뉴"><button type="button" data-tab="settings" data-settings-pane="gameplay"><span>🎮</span><b>게임플레이</b><small>홈 화면과 마을 표시</small></button><button type="button" data-tab="settings" data-settings-pane="sound"><span>🔊</span><b>소리</b><small>이동과 생활 효과음</small></button><button type="button" data-tab="settings" data-settings-pane="notifications"><span>🔔</span><b>알림</b><small>캐릭터 연락과 일정 종료 알림</small></button><button type="button" data-tab="settings" data-settings-pane="display"><span>🖥️</span><b>화면·표시</b><small>화면 모드, 색상 테마, 글자와 조작 크기</small></button><button type="button" data-tab="settings" data-settings-pane="achievements"><span>🏆</span><b>${achievementCopy.heading}</b><small>${achievementUnlocked} / ${achievementList.length} ${achievementCopy.unlocked}</small></button><button type="button" data-tab="settings" data-settings-pane="account"><span>☁️</span><b>계정·백업</b><small>언어와 백업 파일</small></button><button type="button" data-tab="settings" data-settings-pane="support"><span>🛟</span><b>도움말·오류 신고</b><small>피드백, 페이지 안내, 초기화</small></button></nav>`;
  const paneContent={
    gameplay:`${homeCharacterDisplay}${map}${movement}`,
    sound,
    notifications,
    display:`${measurement}${colorMode}${visualThemeSettings()}${screenScaleSettings()}${ownerNameSettings()}`,
    achievements,
    account:`${sync}${language}${backup}`,
    support:`${feedback}${guide}<section class="setting-card reset-setting-card"><h2>데이터 초기화</h2><p>기기의 서랍마을 데이터를 모두 지울 때만 사용하세요.</p><button class="danger" data-reset>모든 데이터 초기화</button></section>`
  };
  const paneNames={gameplay:"게임플레이",sound:"소리",notifications:"알림",display:"화면·표시",achievements:achievementCopy.heading,account:"계정·백업",support:"도움말·오류 신고"};
  const body=settingsPane==="home"?`${sync}${appInfo}${menu}`:`<div class="settings-pane-heading"><button type="button" data-tab="settings" data-settings-pane="home" aria-label="설정 메뉴로 돌아가기">‹</button><span><small>SETTINGS</small><h2>${paneNames[settingsPane]}</h2></span></div>${paneContent[settingsPane]||menu}`;
  return `<section class="panel form settings-shell ${settingsPane==="home"?"settings-home":"settings-subpage"}"><h1>${t("settings","설정")}</h1>${body}</section>`;
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
  "서랍마을 응원":"Support Drawer Village",
  "서랍마을 응원 선물 🎁":"Drawer Village Support Gift 🎁",
  "서랍마을의 다음 업데이트를 응원해 주세요.":"Support the next Drawer Village update."
});
Object.assign(UI_TEXT.ja,{
  "서랍마을 응원":"ひきだし村を応援",
  "서랍마을 응원 선물 🎁":"ひきだし村 応援ギフト 🎁",
  "서랍마을의 다음 업데이트를 응원해 주세요.":"ひきだし村の次のアップデートを応援してください。"
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
  "했다체 · 건조한 서술":"Dry declarative narration","기계적인 말투":"Mechanical speech","사무적인 말투 · 직장 메일체":"Businesslike · Office email style","판교어 · 스타트업 업무체":"Pangyo startup jargon","상냥하고 배려하는 말투":"Kind and considerate speech","소심하고 머뭇거리는 말투":"Timid and hesitant speech","열정적인 말투":"Passionate speech","능글맞고 여유로운 말투":"Sly and easygoing speech","냉소적인 말투":"Cynical speech","걸걸한 아저씨 말투":"Gruff older-guy speech","거칠고 상스러운 말투 · 순화":"Rough speech · toned down","중2병 말투":"Chuunibyou dramatic speech","귀여니체 · 2000년대 인터넷소설체":"2000s Korean web-novel style","하드보일드 누아르체":"Hard-boiled noir voice","사극 선비 말투":"Historical scholar speech","군인식 말투":"Military speech","마왕의 말투":"Demon king speech","군주의 말투":"Sovereign speech","신탁을 내리는 신의 말투":"Divine oracle speech","옛날 번역기체":"Old machine-translation style","귀엽고 애교 있는 말투":"Cute and affectionate speech","수다스럽고 말이 많은 말투":"Chatty, talkative speech",
  "질문 팝업과 캐릭터가 직접 하는 말에 실제로 반영돼요. ‘자동’은 성격 유형을 보고 어울리는 말투를 고릅니다.":"Applied to character question popups and direct dialogue. Auto chooses a fitting voice from the character's personality types."
});
Object.assign(UI_TEXT.ja,{
  "했다체 · 건조한 서술":"乾いた宣言調の叙述","기계적인 말투":"機械的な話し方","사무적인 말투 · 직장 메일체":"事務的・社内メール調","판교어 · 스타트업 업무체":"パンギョ系スタートアップ業務用語","상냥하고 배려하는 말투":"優しく思いやりのある話し方","소심하고 머뭇거리는 말투":"気弱でためらいがちな話し方","열정적인 말투":"情熱的な話し方","능글맞고 여유로운 말투":"飄々として余裕のある話し方","냉소적인 말투":"皮肉っぽい話し方","걸걸한 아저씨 말투":"しゃがれた親父風の話し方","거칠고 상스러운 말투 · 순화":"荒っぽい話し方・表現は控えめ","중2병 말투":"中二病風の話し方","귀여니체 · 2000년대 인터넷소설체":"2000年代ネット小説風","하드보일드 누아르체":"ハードボイルド・ノワール調","사극 선비 말투":"時代劇の士人風","군인식 말투":"軍人風の話し方","마왕의 말투":"魔王の話し方","군주의 말투":"君主の話し方","신탁을 내리는 신의 말투":"神託を告げる神の話し方","옛날 번역기체":"昔の機械翻訳調","귀엽고 애교 있는 말투":"可愛く甘える話し方","수다스럽고 말이 많은 말투":"おしゃべりで話の長い口調",
  "질문 팝업과 캐릭터가 직접 하는 말에 실제로 반영돼요. ‘자동’은 성격 유형을 보고 어울리는 말투를 고릅니다.":"キャラクターの質問ポップアップと直接の台詞に反映されます。「自動」は性格タイプから合う話し方を選びます。"
});
Object.assign(UI_TEXT.en,{
  "가장 중요한 사람":"Most important person","건물 삭제":"Delete building","건물 정보 보기":"View building details","건축":"Architecture","검·도검":"Swords · blades","검지팡이":"Sword cane","게임 방송":"Gaming streams","게임 예능":"Gaming variety shows","게임기":"Game console","격투":"Martial arts","경갑":"Light armor","경제":"Economics","계정·클라우드 데이터 삭제 안내":"Account & cloud data deletion guide"
});
Object.assign(UI_TEXT.ja,{
  "가장 중요한 사람":"最も大切な人","건물 삭제":"建物を削除","건물 정보 보기":"建物情報を見る","건축":"建築","검·도검":"剣・刀剣","검지팡이":"仕込み杖","게임 방송":"ゲーム配信","게임 예능":"ゲームバラエティ","게임기":"ゲーム機","격투":"格闘","경갑":"軽装鎧","경제":"経済","계정·클라우드 데이터 삭제 안내":"アカウント・クラウドデータ削除案内"
});
Object.assign(UI_TEXT.en,{
  "나이 불명":"Age unknown","나이프":"Knife","난청":"Hard of hearing","낮잠":"Nap","낮잠 자는 중":"Taking a nap",
  "익숙한 자리에서 편안한 자세로 낮잠을 자고 있어요.":"They are napping comfortably in their usual spot.",
  "공을 앞발로 굴렸다가 입에 물고 방 안을 신나게 오가고 있어요.":"They roll the ball with a paw, pick it up, and happily dash around the room.",
  "그림책과 안전한 장난감을 번갈아 바라보며 조용히 시간을 보내고 있어요.":"They quietly alternate between a picture book and a safe toy.",
  "길게 기지개를 켠 뒤 발톱을 세우지 않고 장난감을 툭 건드렸어요.":"After a long stretch, they gently tap the toy without extending their claws.",
  "깃털을 부풀렸다가 부리로 가지런히 다듬고 있어요.":"They fluff their feathers, then carefully preen them with their beak.",
  "꼬리 끝으로 장난감을 툭툭 건드리며 반응을 살피고 있어요.":"They tap the toy with the tip of their tail and watch how it responds.",
  "날개를 몸 가까이 접고 꼬리로 몸을 감싼 채 깊이 잠들어 있어요.":"They are fast asleep with their wings tucked in and their tail curled around them.",
  "낮은 장애물 주변을 빙 돌아 새로운 길을 천천히 탐색하고 있어요.":"They slowly explore a new route around a low obstacle.",
  "낯선 냄새가 나는 곳에 코를 가까이 대고 한동안 흔적을 살피고 있어요.":"They bring their nose close to an unfamiliar scent and inspect its trail for a while.",
  "낯선 물건 앞에 멈춰 오래 바라보다 아주 조심스럽게 다가가고 있어요.":"They stop and study an unfamiliar object before approaching it very carefully.",
  "낯선 소리가 사라질 때까지 움직이지 않고 조용히 상황을 살피고 있어요.":"They stay still and quietly watch until the unfamiliar sound fades away."
});
Object.assign(UI_TEXT.ja,{
  "나이 불명":"年齢不明","나이프":"ナイフ","난청":"難聴","낮잠":"昼寝","낮잠 자는 중":"昼寝中",
  "익숙한 자리에서 편안한 자세로 낮잠을 자고 있어요.":"いつもの場所で楽な姿勢になり、昼寝をしています。",
  "공을 앞발로 굴렸다가 입에 물고 방 안을 신나게 오가고 있어요.":"前足でボールを転がしてから口にくわえ、楽しそうに部屋を行き来しています。",
  "그림책과 안전한 장난감을 번갈아 바라보며 조용히 시간을 보내고 있어요.":"絵本と安全なおもちゃを交互に眺めながら、静かに過ごしています。",
  "길게 기지개를 켠 뒤 발톱을 세우지 않고 장난감을 툭 건드렸어요.":"大きく伸びをしたあと、爪を立てずにおもちゃをそっとつつきました。",
  "깃털을 부풀렸다가 부리로 가지런히 다듬고 있어요.":"羽をふくらませたあと、くちばしできれいに整えています。",
  "꼬리 끝으로 장난감을 툭툭 건드리며 반응을 살피고 있어요.":"しっぽの先でおもちゃをつつき、反応をうかがっています。",
  "날개를 몸 가까이 접고 꼬리로 몸을 감싼 채 깊이 잠들어 있어요.":"翼を体に寄せ、しっぽで体を包むようにして深く眠っています。",
  "낮은 장애물 주변을 빙 돌아 새로운 길을 천천히 탐색하고 있어요.":"低い障害物の周りを回りながら、新しい道をゆっくり探索しています。",
  "낯선 냄새가 나는 곳에 코를 가까이 대고 한동안 흔적을 살피고 있어요.":"見慣れない匂いに鼻を近づけ、しばらく痕跡を調べています。",
  "낯선 물건 앞에 멈춰 오래 바라보다 아주 조심스럽게 다가가고 있어요.":"見慣れない物の前で立ち止まり、よく眺めてから慎重に近づいています。",
  "낯선 소리가 사라질 때까지 움직이지 않고 조용히 상황을 살피고 있어요.":"聞き慣れない音が消えるまで動かず、静かに様子を見ています。"
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
// 신체 편집에서 가장 길게 노출되는 선택지를 우선 번역한다. 접힌
// summary뿐 아니라 펼친 뒤의 버튼도 선택값은 한국어로 유지한 채
// 화면에만 번역되므로 기존 저장 데이터와 호환된다.
Object.assign(UI_TEXT.en,{
  "키·골격":"Height & frame","체형의 세부 인상":"Detailed body impression","피부·고유 특징":"Skin & distinctive features","얼굴·눈의 인상":"Face & eyes","전체적인 분위기":"Overall impression","신체 특성":"Physical traits","성형·외형 의료 시술 부위 · 원할 때만":"Procedure areas · optional",
  "키가 매우 큼":"Very tall","키가 큼":"Tall","키가 작음":"Short","키가 매우 작음":"Very short","팔다리가 긴 편":"Long limbs","팔다리가 짧은 편":"Short limbs","어깨가 넓음":"Broad shoulders","어깨가 좁음":"Narrow shoulders","손이 큼":"Large hands","손이 작음":"Small hands",
  "글래머":"Curvy","근육이 발달함":"Muscular","잔근육이 발달함":"Lean muscle","근육선이 선명함":"Defined muscles","유연한 편":"Flexible","상체가 발달함":"Developed upper body","하체가 발달함":"Developed lower body","허리가 잘록함":"Narrow waist","허리선이 곧은 편":"Straight waistline","골반이 넓음":"Wide hips","골반이 좁음":"Narrow hips","가슴이 큰 편":"Larger chest","가슴이 작은 편":"Smaller chest","복부가 부드러운 편":"Soft midsection","체지방이 적은 편":"Low body fat","전체적으로 둥근 인상":"Overall rounded build","각지고 단단한 인상":"Angular, solid build","자세가 반듯함":"Upright posture","구부정한 자세":"Slouched posture","걸음이 가벼움":"Light steps","걸음이 묵직함":"Heavy steps","붓기가 잘 생김":"Prone to swelling","체중 변화가 잦음":"Frequent weight changes",
  "피부가 밝은 편":"Light skin tone","중간 피부톤":"Medium skin tone","피부가 어두운 편":"Dark skin tone","구릿빛 피부":"Bronze skin tone","창백한 편":"Pale","흉터가 있음":"Has scars","문신이 있음":"Has tattoos","주근깨가 있음":"Has freckles","점이 있음":"Has beauty marks","보조개가 있음":"Has dimples","피어싱을 함":"Has piercings",
  "안경을 씀":"Wears glasses","안대":"Eye patch","특이동공":"Unusual pupils","세로동공":"Vertical pupils","삼백안":"Sanpaku eyes","날카로운 눈매":"Sharp eyes","처진 눈매":"Downturned eyes","속눈썹이 김":"Long eyelashes","두꺼운 눈썹":"Thick eyebrows",
  "중성적인 인상":"Androgynous impression","부드러운 인상":"Gentle impression","날카로운 인상":"Sharp impression","아름다움":"Beautiful","잘생김":"Handsome","귀여움":"Cute","우아함":"Elegant","위압적인 분위기":"Intimidating presence","단정한 분위기":"Neat impression","퇴폐적인 분위기":"Decadent impression","신비로운 분위기":"Mysterious impression","소년미":"Youthful charm","성숙미":"Mature charm",
  "자연스럽게 풀어 둠":"Worn loose naturally","앞머리 있음":"With bangs","앞머리 없음":"No bangs","시스루 앞머리":"See-through bangs","일자 앞머리":"Blunt bangs","처피뱅":"Choppy bangs","커튼뱅":"Curtain bangs","옆으로 넘긴 앞머리":"Side-swept bangs","앞머리가 한쪽 눈을 가림":"Bangs cover one eye","앞머리가 양쪽 눈을 가림":"Bangs cover both eyes","올백":"Slicked back","슬릭백":"Slick back","보브컷":"Bob cut","픽시컷":"Pixie cut","댄디컷":"Dandy cut","리프컷":"Leaf cut","레이어드컷":"Layered cut","허쉬컷":"Hush cut","샤기컷":"Shag cut","울프컷":"Wolf cut","투블럭":"Two-block cut","언더컷":"Undercut","모히칸":"Mohawk","리젠트":"Pompadour","포니테일":"Ponytail","사이드 포니테일":"Side ponytail","트윈테일":"Twin tails","양갈래":"Pigtails","반묶음":"Half-up","하프업 번":"Half-up bun","땋은 머리":"Braided hair","프렌치 브레이드":"French braid","피시테일 브레이드":"Fishtail braid","콘로우":"Cornrows","박스 브레이드":"Box braids","로우번":"Low bun","하이번":"High bun","스페이스 번":"Space buns","브레이드 업두":"Braided updo","드레드록":"Dreadlocks","히메컷":"Hime cut","롱 스트레이트":"Long straight hair","단발 웨이브":"Wavy bob","웨이브 스타일":"Wavy style","베이비펌":"Baby perm","히피펌":"Hippie perm","가르마펌":"Parted perm","고데기 스타일링":"Heat-styled hair"
});
Object.assign(UI_TEXT.ja,{
  "키·골격":"身長・骨格","체형의 세부 인상":"体型の細かな印象","피부·고유 특징":"肌・固有の特徴","얼굴·눈의 인상":"顔・目の印象","전체적인 분위기":"全体の雰囲気","신체 특성":"身体的特徴","성형·외형 의료 시술 부위 · 원할 때만":"美容・外見施術の部位・任意",
  "키가 매우 큼":"とても背が高い","키가 큼":"背が高い","키가 작음":"背が低い","키가 매우 작음":"とても背が低い","팔다리가 긴 편":"手足が長め","팔다리가 짧은 편":"手足が短め","어깨가 넓음":"肩幅が広い","어깨가 좁음":"肩幅が狭い","손이 큼":"手が大きい","손이 작음":"手が小さい",
  "글래머":"グラマラス","근육이 발달함":"筋肉が発達している","잔근육이 발달함":"しなやかな筋肉","근육선이 선명함":"筋肉のラインが明瞭","유연한 편":"柔軟性が高い","상체가 발달함":"上半身が発達している","하체가 발달함":"下半身が発達している","허리가 잘록함":"ウエストが細い","허리선이 곧은 편":"ウエストラインが直線的","골반이 넓음":"骨盤が広い","골반이 좁음":"骨盤が狭い","가슴이 큰 편":"胸が大きめ","가슴이 작은 편":"胸が小さめ","복부가 부드러운 편":"お腹がやわらかめ","체지방이 적은 편":"体脂肪が少なめ","전체적으로 둥근 인상":"全体的に丸みのある印象","각지고 단단한 인상":"角張ったしっかりした印象","자세가 반듯함":"姿勢が良い","구부정한 자세":"猫背","걸음이 가벼움":"足取りが軽い","걸음이 묵직함":"足取りが重い","붓기가 잘 생김":"むくみやすい","체중 변화가 잦음":"体重が変化しやすい",
  "피부가 밝은 편":"明るい肌色","중간 피부톤":"中間の肌色","피부가 어두운 편":"濃い肌色","구릿빛 피부":"小麦色の肌","창백한 편":"青白いほう","흉터가 있음":"傷跡がある","문신이 있음":"タトゥーがある","주근깨가 있음":"そばかすがある","점이 있음":"ほくろがある","보조개가 있음":"えくぼがある","피어싱을 함":"ピアスをしている",
  "안경을 씀":"眼鏡をかけている","안대":"眼帯","특이동공":"特徴的な瞳孔","세로동공":"縦長の瞳孔","삼백안":"三白眼","날카로운 눈매":"鋭い目つき","처진 눈매":"垂れ目","속눈썹이 김":"まつ毛が長い","두꺼운 눈썹":"太い眉",
  "중성적인 인상":"中性的な印象","부드러운 인상":"やわらかな印象","날카로운 인상":"鋭い印象","아름다움":"美しい","잘생김":"端正","귀여움":"かわいい","우아함":"優雅","위압적인 분위기":"威圧感のある雰囲気","단정한 분위기":"きちんとした雰囲気","퇴폐적인 분위기":"退廃的な雰囲気","신비로운 분위기":"神秘的な雰囲気","소년미":"少年らしい魅力","성숙미":"成熟した魅力",
  "자연스럽게 풀어 둠":"自然に下ろす","앞머리 있음":"前髪あり","앞머리 없음":"前髪なし","시스루 앞머리":"シースルーバング","일자 앞머리":"ぱっつん前髪","처피뱅":"チョッピーバング","커튼뱅":"カーテンバング","옆으로 넘긴 앞머리":"横に流した前髪","앞머리가 한쪽 눈을 가림":"前髪が片目を隠す","앞머리가 양쪽 눈을 가림":"前髪が両目を隠す","올백":"オールバック","슬릭백":"スリックバック","보브컷":"ボブカット","픽시컷":"ピクシーカット","댄디컷":"ダンディーカット","리프컷":"リーフカット","레이어드컷":"レイヤーカット","허쉬컷":"ハッシュカット","샤기컷":"シャギーカット","울프컷":"ウルフカット","투블럭":"ツーブロック","언더컷":"アンダーカット","모히칸":"モヒカン","리젠트":"リーゼント","포니테일":"ポニーテール","사이드 포니테일":"サイドポニーテール","트윈테일":"ツインテール","양갈래":"二つ結び","반묶음":"ハーフアップ","하프업 번":"ハーフアップお団子","땋은 머리":"三つ編み","프렌치 브레이드":"フレンチブレイド","피시테일 브레이드":"フィッシュテールブレイド","콘로우":"コーンロウ","박스 브레이드":"ボックスブレイド","로우번":"ローバン","하이번":"ハイバン","스페이스 번":"スペースバン","브레이드 업두":"編み込みアップ","드레드록":"ドレッドロックス","히메컷":"姫カット","롱 스트레이트":"ロングストレート","단발 웨이브":"ウェーブボブ","웨이브 스타일":"ウェーブスタイル","베이비펌":"ベビーパーマ","히피펌":"ヒッピーパーマ","가르마펌":"分け目パーマ","고데기 스타일링":"アイロンスタイリング"
});
UI_DYNAMIC_TEXT.en.push([/^(\d+)개 선택$/,(count)=>`${count} selected`]);
UI_DYNAMIC_TEXT.ja.push([/^(\d+)개 선택$/,(count)=>`${count}個選択`]);
Object.assign(UI_TEXT.en,{
  "+ 반려생물 추가":"+ Add pet","+ 방 추가":"+ Add room","+ 옷 등록":"+ Add clothing","+ 일정 추가":"+ Add schedule","+ 자동차 추가":"+ Add car","+ 집만 생성":"+ Create home only","+ 코디 만들기":"+ Create outfit","+ 크게":"+ Larger","− 작게":"− Smaller","✓ 기준 주거지":"✓ Primary residence",
  "🎁 구체적인 물건 구매·선물하기":"🎁 Buy or gift a specific item","🏠 자택근무":"🏠 Work from home","📍 외출 중":"📍 Out and about","🚌 이동 중":"🚌 In transit","간단 설정":"Basic settings","고급 설정":"Advanced settings","거주 방식":"Residence type","건강·장애·접근성 설정 · 선택 사항":"Health, disability & accessibility · optional","기타 건강 상태":"Other health condition","기타 소유자·단체 이름":"Other owner or group name",
  "끌어서 놓거나 버튼을 누르면 바로 저장됩니다.":"Drag and drop or use the buttons to save immediately.","눌러서 편집":"Tap to edit","단맛 선호":"Sweetness preference","매운맛 선호":"Spice preference","마을 지정 안 함":"No town assigned","머무는 때":"When they stay","명절·기념일 날짜":"Holiday or anniversary dates","반려생물 편집하기":"Edit pet","방 구성":"Room setup","방문 목적·설명":"Visit purpose & notes","방문 요일":"Visit days",
  "보유한 옷":"Owned clothing","분류":"Category","분류 선택":"Choose category","세부 항목":"Details","세부 항목 선택":"Choose details","소유 캐릭터":"Owning character","소유자 종류":"Owner type","소지품":"Belongings","아이콘 링크":"Icon link","아직 등록된 항목이 없어요.":"No items have been added yet.","아직 만든 집이 없어요.":"No homes have been created yet.","아직 설정한 공식 관계가 없어요.":"No official relationships have been set yet.","아직 집 기록이 없어요.":"No home log entries yet.",
  "옷을 등록하고, 자주 입는 조합을 코디로 저장해요.":"Add clothing and save frequently worn combinations as outfits.","요일":"Day of week","원형 사진":"Circular photo","의수 종류 직접 입력":"Enter prosthetic arm type","의족 종류 직접 입력":"Enter prosthetic leg type","이 집 삭제":"Delete this home","이 집을 사용하는 캐릭터":"Characters using this home","이 캐릭터에게 어떤 집인가요?":"What kind of home is this for the character?","이름":"Name","이미 적용 중":"Already active","이미지 링크":"Image link","이미지 미등록":"No image added","일정 없음":"No schedule",
  "자는 방":"Bedroom","저장한 코디":"Saved outfits","접근성 참고 메모 · 설정표용":"Accessibility notes · settings only","종류":"Type","주로 있는 방":"Usual room","중성화 완료":"Neutered","지금 이 순간":"Current moment","집 생활 로그":"Home life log","집 선택 버튼 배경 사진":"Home selector background photo","집 설명":"Home description","집 외관 스타일":"Home exterior style","집 이름":"Home name","집과 생활 거점":"Homes & living bases","집의 아름다운 정도":"Home appearance","집의 종류":"Home type","집이 있는 마을":"Home town","최애":"Favorite","캐릭터 위치 바꾸기":"Move character","캐릭터 위치·크기":"Character position & size","코디 편집":"Edit outfit","투명 아이콘":"Transparent icon","표현 안전 안내":"Representation safety notice","품종":"Breed","함께 산책이 필요함":"Needs walks together","함께할 캐릭터":"Character to join","행동 아이콘 위치":"Action icon position","현재 배치 초기화":"Reset current layout","홈 캐릭터·행동 아이콘 배치":"Home character & action icon layout","홈 화면 배치 미리보기":"Home layout preview","LD 배치":"LD placement","SD 배치":"SD placement"
});
Object.assign(UI_TEXT.ja,{
  "+ 반려생물 추가":"＋ペットを追加","+ 방 추가":"＋部屋を追加","+ 옷 등록":"＋服を登録","+ 일정 추가":"＋予定を追加","+ 자동차 추가":"＋車を追加","+ 집만 생성":"＋家だけ作成","+ 코디 만들기":"＋コーデを作成","+ 크게":"＋大きく","− 작게":"− 小さく","✓ 기준 주거지":"✓ 基準の住居",
  "🎁 구체적인 물건 구매·선물하기":"🎁 実際の品物を購入・贈る","🏠 자택근무":"🏠 在宅勤務","📍 외출 중":"📍 外出中","🚌 이동 중":"🚌 移動中","간단 설정":"かんたん設定","고급 설정":"詳細設定","거주 방식":"居住形態","건강·장애·접근성 설정 · 선택 사항":"健康・障害・アクセシビリティ・任意","기타 건강 상태":"その他の健康状態","기타 소유자·단체 이름":"その他の所有者・団体名",
  "끌어서 놓거나 버튼을 누르면 바로 저장됩니다.":"ドラッグするかボタンを押すとすぐ保存されます。","눌러서 편집":"タップして編集","단맛 선호":"甘さの好み","매운맛 선호":"辛さの好み","마을 지정 안 함":"村を指定しない","머무는 때":"滞在する時","명절·기념일 날짜":"祝日・記念日の日付","반려생물 편집하기":"ペットを編集","방 구성":"部屋の構成","방문 목적·설명":"訪問目的・説明","방문 요일":"訪問する曜日",
  "보유한 옷":"持っている服","분류":"カテゴリー","분류 선택":"カテゴリーを選択","세부 항목":"詳細項目","세부 항목 선택":"詳細項目を選択","소유 캐릭터":"所有キャラクター","소유자 종류":"所有者の種類","소지품":"持ち物","아이콘 링크":"アイコンリンク","아직 등록된 항목이 없어요.":"登録された項目はまだありません。","아직 만든 집이 없어요.":"作成した家はまだありません。","아직 설정한 공식 관계가 없어요.":"設定された公式関係はまだありません。","아직 집 기록이 없어요.":"家の記録はまだありません。",
  "옷을 등록하고, 자주 입는 조합을 코디로 저장해요.":"服を登録し、よく着る組み合わせをコーデとして保存します。","요일":"曜日","원형 사진":"円形写真","의수 종류 직접 입력":"義手の種類を直接入力","의족 종류 직접 입력":"義足の種類を直接入力","이 집 삭제":"この家を削除","이 집을 사용하는 캐릭터":"この家を使うキャラクター","이 캐릭터에게 어떤 집인가요?":"このキャラクターにとってどんな家ですか？","이름":"名前","이미 적용 중":"適用中","이미지 링크":"画像リンク","이미지 미등록":"画像未登録","일정 없음":"予定なし",
  "자는 방":"寝る部屋","저장한 코디":"保存したコーデ","접근성 참고 메모 · 설정표용":"アクセシビリティ参考メモ・設定用","종류":"種類","주로 있는 방":"普段いる部屋","중성화 완료":"避妊・去勢済み","지금 이 순간":"今この瞬間","집 생활 로그":"家の生活ログ","집 선택 버튼 배경 사진":"家選択ボタンの背景写真","집 설명":"家の説明","집 외관 스타일":"家の外観スタイル","집 이름":"家の名前","집과 생활 거점":"家と生活拠点","집의 아름다운 정도":"家の美しさ","집의 종류":"家の種類","집이 있는 마을":"家がある村","최애":"最推し","캐릭터 위치 바꾸기":"キャラクター位置を変更","캐릭터 위치·크기":"キャラクターの位置・サイズ","코디 편집":"コーデを編集","투명 아이콘":"透過アイコン","표현 안전 안내":"表現上の安全案内","품종":"品種","함께 산책이 필요함":"一緒に散歩が必要","함께할 캐릭터":"一緒に行くキャラクター","행동 아이콘 위치":"行動アイコンの位置","현재 배치 초기화":"現在の配置をリセット","홈 캐릭터·행동 아이콘 배치":"ホームのキャラクター・行動アイコン配置","홈 화면 배치 미리보기":"ホーム画面配置プレビュー","LD 배치":"LD配置","SD 배치":"SD配置"
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
  "집에서 시간을 보내는 중":"Spending time at home","지금 이 방에 있는 캐릭터":"Character in this room","반려생물":"Pet","이름 없음":"Unnamed","조용히 자기 시간을 보내고 있어요.":"They are quietly spending time on their own.",
  "이 집 연결됨":"Linked to this home","연결하지 않음":"Not linked","주거지":"Primary home","본가":"Family home","별채":"Secondary home","주말집":"Weekend home","업무용 숙소":"Work accommodation","연인의 집":"Partner's home","친척집":"Relative's home","상시 거주":"Lives here full-time","평일 중심":"Mostly weekdays","주말 중심":"Mostly weekends","요일 지정":"Selected days","명절·기념일":"Holidays & anniversaries","필요할 때 방문":"Visits when needed",
  "연결을 해제해도 캐릭터나 집은 삭제되지 않습니다. 별채·본가도 주거지와 동시에 둘 수 있어요.":"Unlinking does not delete the character or home. A family or secondary home can be kept alongside the primary home.",
  "‘명절·기념일’은 위 날짜가 맞는 날, ‘요일 지정’은 고른 요일에 이 집의 장면을 사용해요. ‘필요할 때 방문’은 임의 이동을 만들지 않습니다.":"Holiday or anniversary visits use the dates above; selected-day visits use the chosen weekdays. Visits when needed never create random travel.",
  "새 방을 만든 뒤 방 자체를 누르면 이름·종류·크기·사진·가구를 편집할 수 있어요. 자는 방은 캐릭터 연결 설정에서 각각 정해요.":"After adding a room, tap it to edit its name, type, size, photo, and furniture. Choose each character's bedroom in their home link settings.",
  "종류 이름":"Type name","크기":"Size","성향 · 여러 개 선택":"Temperament · choose any","확실히 알고 있는 신체 특징만 선택":"Choose only known physical traits","선택하지 않은 생김새나 능력은 행동에서 지어내지 않아요.":"Scenes never invent appearances or abilities you did not select.",
  "소형":"Small","중형":"Medium","대형":"Large","온순함":"Gentle","활발함":"Active","사고뭉치":"Mischievous","진중함":"Serious","호기심 많음":"Curious","겁이 많음":"Timid","사람을 잘 따름":"People-friendly","독립적":"Independent","털":"Fur","비늘":"Scales","깃털":"Feathers","날개":"Wings","지느러미":"Fins","뿔":"Horns","꼬리":"Tail","발광":"Bioluminescence","독성":"Venomous",
  "모름":"Unknown","수컷":"Male","암컷":"Female","등에 타고 이동할 수 있음":"Can be ridden","투명 아이콘":"Transparent icon","아이콘 링크":"Icon link","사진 링크":"Photo link",
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
  "집에서 시간을 보내는 중":"家で過ごしているところ","지금 이 방에 있는 캐릭터":"今この部屋にいるキャラクター","반려생물":"ペット","이름 없음":"名前なし","조용히 자기 시간을 보내고 있어요.":"静かに自分の時間を過ごしています。",
  "이 집 연결됨":"この家に登録済み","연결하지 않음":"登録しない","주거지":"住居","본가":"実家","별채":"別宅","주말집":"週末の家","업무용 숙소":"仕事用の宿泊先","연인의 집":"恋人の家","친척집":"親戚の家","상시 거주":"常時居住","평일 중심":"平日中心","주말 중심":"週末中心","요일 지정":"曜日指定","명절·기념일":"祝日・記念日","필요할 때 방문":"必要な時に訪問",
  "연결을 해제해도 캐릭터나 집은 삭제되지 않습니다. 별채·본가도 주거지와 동시에 둘 수 있어요.":"登録を解除してもキャラクターや家は削除されません。別宅や実家は住居と同時に設定できます。",
  "‘명절·기념일’은 위 날짜가 맞는 날, ‘요일 지정’은 고른 요일에 이 집의 장면을 사용해요. ‘필요할 때 방문’은 임의 이동을 만들지 않습니다.":"祝日・記念日は上の日付、曜日指定は選んだ曜日にこの家のシーンを使います。必要な時の訪問ではランダムな移動は発生しません。",
  "새 방을 만든 뒤 방 자체를 누르면 이름·종류·크기·사진·가구를 편집할 수 있어요. 자는 방은 캐릭터 연결 설정에서 각각 정해요.":"部屋を追加したあと、その部屋を押すと名前・種類・大きさ・写真・家具を編集できます。寝る部屋はキャラクターの家設定で個別に選びます。",
  "종류 이름":"種類名","크기":"大きさ","성향 · 여러 개 선택":"性格・複数選択可","확실히 알고 있는 신체 특징만 선택":"把握している身体的特徴だけ選択","선택하지 않은 생김새나 능력은 행동에서 지어내지 않아요.":"選んでいない外見や能力をシーンで作りません。",
  "소형":"小型","중형":"中型","대형":"大型","온순함":"おとなしい","활발함":"活発","사고뭉치":"いたずら好き","진중함":"落ち着いている","호기심 많음":"好奇心旺盛","겁이 많음":"怖がり","사람을 잘 따름":"人懐っこい","독립적":"独立心が強い","털":"毛","비늘":"うろこ","깃털":"羽毛","날개":"翼","지느러미":"ひれ","뿔":"角","꼬리":"しっぽ","발광":"発光","독성":"毒性",
  "모름":"不明","수컷":"オス","암컷":"メス","등에 타고 이동할 수 있음":"背中に乗って移動できる","투명 아이콘":"透過アイコン","아이콘 링크":"アイコンリンク","사진 링크":"写真リンク",
  "완료":"完了","캐릭터 통계 보고서":"キャラクター統計レポート"
});
Object.assign(UI_TEXT.en,{"집 이동":"Switch home","집 정보":"Home info","집 편집":"Edit","편집 완료":"Done","구성원":"Members","반려생물":"Pets","UI 숨김":"Hide UI","UI 표시":"Show UI","생활 로그":"Life log","자동차":"Vehicles","새 집 만들기":"Create home","이름 없는 집":"Unnamed home","집 안에 머무는 중":"Currently at home","연결된 구성원":"Linked residents","청결도":"Cleanliness","층":"Floors","집 설정":"Home setup","방 구성":"Rooms","가구 배치":"Furniture","거주 설정":"Residents"});
Object.assign(UI_TEXT.ja,{"집 이동":"家を移動","집 정보":"家情報","집 편집":"編集","편집 완료":"完了","구성원":"住人","반려생물":"ペット","UI 숨김":"UI非表示","UI 표시":"UI表示","생활 로그":"生活ログ","자동차":"自動車","새 집 만들기":"新しい家を作る","이름 없는 집":"名前のない家","집 안에 머무는 중":"家にいる","연결된 구성원":"登録住人","청결도":"清潔度","층":"階","집 설정":"家設定","방 구성":"部屋構成","가구 배치":"家具配置","거주 설정":"居住設定"});
Object.assign(UI_TEXT.en,{"바닥재":"Floor material","벽 재질":"Wall material","살구빛 목재":"Apricot wood","내추럴 목재":"Natural wood","크림 목재":"Cream wood","차콜 목재":"Charcoal wood","월넛 목재":"Walnut wood","직접 그린 바닥":"Custom floor","바닥과 같은 벽":"Match the floor","보내 주신 다섯 재질 중 하나를 고르거나 직접 그린 바닥을 넣을 수 있어요.":"Choose one of the five supplied materials or add your own floor artwork.","방 위쪽에 벽면을 세우고 짙은 갈색 테두리로 바닥과 구분해요.":"Adds a wall face along the top of the room with a dark brown boundary.","직접 그린 바닥 첨부":"Add custom floor","직접 그린 바닥 변경":"Change custom floor"});
Object.assign(UI_TEXT.ja,{"바닥재":"床材","벽 재질":"壁材","살구빛 목재":"アプリコット材","내추럴 목재":"ナチュラル材","크림 목재":"クリーム材","차콜 목재":"チャコール材","월넛 목재":"ウォールナット材","직접 그린 바닥":"自作の床","바닥과 같은 벽":"床と同じ壁","보내 주신 다섯 재질 중 하나를 고르거나 직접 그린 바닥을 넣을 수 있어요.":"提供された5種類の素材から選ぶか、自作の床画像を追加できます。","방 위쪽에 벽면을 세우고 짙은 갈색 테두리로 바닥과 구분해요.":"部屋上部に壁面を作り、濃い茶色の境界線で床と分けます。","직접 그린 바닥 첨부":"自作の床を追加","직접 그린 바닥 변경":"自作の床を変更"});
Object.assign(UI_TEXT.en,{"직접 그린 바닥을 선택하면 첨부 이미지가 방 전체에 표시되고 벽은 숨겨져요.":"When Custom floor is selected, the attached image fills the room and the wall is hidden."});
Object.assign(UI_TEXT.ja,{"직접 그린 바닥을 선택하면 첨부 이미지가 방 전체에 표시되고 벽은 숨겨져요.":"「自作の床」を選ぶと、添付画像が部屋全体に表示され、壁は非表示になります。"});
Object.assign(UI_TEXT.en,{"벽지":"Wallpaper","직접 그린 벽지 7종 가운데 방에 어울리는 무늬를 골라 주세요.":"Choose the hand-drawn wallpaper that best fits this room from the seven available designs."});
Object.assign(UI_TEXT.ja,{"벽지":"壁紙","직접 그린 벽지 7종 가운데 방에 어울리는 무늬를 골라 주세요.":"手描きの壁紙7種類から、この部屋に合う柄を選んでください。"});
Object.assign(UI_TEXT.en,{
  "‘상대를 때릴 수 있음’ 이상을 고르면 설정한 충동·갈등·성격에 따라 낮은 수위의 폭행 장면이 나올 수 있어요. 충동만 있고 실행하지 않는 캐릭터는 반드시 ‘행동으로 옮기지 않음’을 골라 주세요.":"Choosing ‘May hit the other person’ or above can produce low-level assault scenes when impulse, conflict, and personality allow it. If the character has urges but never acts, choose ‘Does not act on it’.",
  "‘좋아하는 장르’는 책·영화·드라마·애니메이션 등 이야기 콘텐츠 전체에 공통으로 반영돼요.":"Favorite genres apply across books, films, dramas, animation, and other story-based media.",
  "2인 LD도 1인과 같은 높이·같은 Y좌표를 사용하고 X좌표만 좌우로 나뉩니다. 현재 선택한 캐릭터가 항상 앞에 표시됩니다.":"Two-character LD scenes keep the same height and Y position as solo scenes; only X splits left and right. The selected character always appears in front.",
  "1~2개월에 한 번":"Every 1–2 months","2주에 한 번":"Every 2 weeks","3~4개월에 한 번":"Every 3–4 months","반년에 한 번":"Every 6 months","1년에 한 번":"Once a year","몇 년에 한 번":"Every few years",
  "가격을 거의 신경 쓰지 않음":"Rarely considers price","가성비 중시":"Values cost effectiveness","품질 우선":"Prioritizes quality","필요한 만큼 소비":"Spends only what is needed","취향에는 아끼지 않음":"Spends freely on personal tastes","절약을 우선함":"Prioritizes saving",
  "가끔 욱하지만 멈춤":"Sometimes flares up but stops","매우 잘 참음":"Very strong self-control","대체로 참음":"Usually holds back","쉽게 욱함":"Quick-tempered","거의 참지 않음":"Rarely holds back",
  "가끔 장난을 즐김":"Sometimes playful","장난을 거의 하지 않음":"Rarely jokes around","건조한 농담만 함":"Dry humor only","장난을 즐김":"Enjoys teasing","유머로 분위기를 이끎":"Leads the mood with humor",
  "가능성 중시":"Focuses on possibilities","가능성을 봄":"Notices possibilities","현실과 가능성을 함께 봄":"Balances reality and possibilities","구체적인 사실 중시":"Focuses on concrete facts","경험과 사실을 우선함":"Prioritizes experience and facts",
  "가만히 못 있음":"Always needs to be moving","활동적인 편":"Active","상황에 따라":"Depends on the situation","느긋한 편":"Laid-back","집에서 충전함":"Recharges at home",
  "가발·헤어피스":"Wig · hairpiece","가방":"Bag","가벼운 메이크업":"Light makeup","메이크업을 하지 않음":"No makeup","진한 메이크업":"Bold makeup","무대·촬영용 메이크업":"Stage · camera makeup",
  "가상 아티스트":"Virtual artist","프리랜서":"Freelancer","회사원":"Office worker","공무원":"Civil servant","의료인":"Healthcare worker","교육자":"Educator","연구자":"Researcher","예술가":"Artist","자영업":"Self-employed","학생":"Student","무직":"Unemployed",
  "피하는 편":"Avoids conflict","시간을 두고 말함":"Talks after taking time","대화로 해결":"Resolves through conversation","바로 따짐":"Confronts immediately","끝까지 결론을 냄":"Pursues a final resolution",
  "표현이 서툼":"Struggles to express affection","조용히 곁에 있음":"Stays quietly nearby","말로 표현":"Expresses it in words","행동으로 표현":"Expresses it through actions","적극적으로 챙김":"Actively takes care of them",
  "혼자가 편함":"Prefers being alone","낯을 가림":"Reserved with strangers","조용히 어울림":"Socializes quietly","먼저 다가감":"Approaches first","무리의 중심":"Center of the group",
  "논리 우선":"Logic first","이성적인 편":"Rational","균형형":"Balanced","마음을 살핌":"Considers feelings","공감 우선":"Empathy first",
  "무계획":"Unplanned","즉흥적":"Spontaneous","유연하게 조정":"Adjusts flexibly","계획적":"Planned","강박적으로 계획함":"Plans obsessively",
  "요청할 때만 도움":"Helps only when asked","거의 관여하지 않음":"Rarely gets involved","적당히 관여":"Moderately involved","강하게 간섭함":"Highly interfering","통제광":"Controlling"
});
Object.assign(UI_TEXT.ja,{
  "‘상대를 때릴 수 있음’ 이상을 고르면 설정한 충동·갈등·성격에 따라 낮은 수위의 폭행 장면이 나올 수 있어요. 충동만 있고 실행하지 않는 캐릭터는 반드시 ‘행동으로 옮기지 않음’을 골라 주세요.":"「相手を殴る可能性がある」以上を選ぶと、衝動・対立・性格に応じて軽度の暴力シーンが出る場合があります。衝動はあっても実行しないキャラクターは必ず「行動に移さない」を選んでください。",
  "‘좋아하는 장르’는 책·영화·드라마·애니메이션 등 이야기 콘텐츠 전체에 공통으로 반영돼요.":"好きなジャンルは本・映画・ドラマ・アニメなど物語コンテンツ全体に反映されます。",
  "2인 LD도 1인과 같은 높이·같은 Y좌표를 사용하고 X좌표만 좌우로 나뉩니다. 현재 선택한 캐릭터가 항상 앞에 표시됩니다.":"2人LDも1人の時と同じ高さ・Y座標を使い、X座標だけ左右に分かれます。選択中のキャラクターが常に手前に表示されます。",
  "1~2개월에 한 번":"1～2か月に1回","2주에 한 번":"2週間に1回","3~4개월에 한 번":"3～4か月に1回","반년에 한 번":"半年に1回","1년에 한 번":"1年に1回","몇 년에 한 번":"数年に1回",
  "가격을 거의 신경 쓰지 않음":"価格をほとんど気にしない","가성비 중시":"コストパフォーマンス重視","품질 우선":"品質優先","필요한 만큼 소비":"必要な分だけ使う","취향에는 아끼지 않음":"好みには惜しまない","절약을 우선함":"節約を優先",
  "가끔 욱하지만 멈춤":"時々かっとなるが止まれる","매우 잘 참음":"非常に自制できる","대체로 참음":"たいてい我慢する","쉽게 욱함":"かっとなりやすい","거의 참지 않음":"ほとんど我慢しない",
  "가끔 장난을 즐김":"時々いたずらを楽しむ","장난을 거의 하지 않음":"ほとんど冗談を言わない","건조한 농담만 함":"淡々とした冗談だけ","장난을 즐김":"いたずらを楽しむ","유머로 분위기를 이끎":"ユーモアで場を盛り上げる",
  "가능성 중시":"可能性を重視","가능성을 봄":"可能性に目を向ける","현실과 가능성을 함께 봄":"現実と可能性の両方を見る","구체적인 사실 중시":"具体的な事実を重視","경험과 사실을 우선함":"経験と事実を優先",
  "가만히 못 있음":"じっとしていられない","활동적인 편":"活動的","상황에 따라":"状況による","느긋한 편":"のんびりしている","집에서 충전함":"家で充電する",
  "가발·헤어피스":"かつら・ヘアピース","가방":"バッグ","가벼운 메이크업":"薄いメイク","메이크업을 하지 않음":"メイクをしない","진한 메이크업":"濃いメイク","무대·촬영용 메이크업":"舞台・撮影用メイク",
  "가상 아티스트":"バーチャルアーティスト","프리랜서":"フリーランス","회사원":"会社員","공무원":"公務員","의료인":"医療従事者","교육자":"教育者","연구자":"研究者","예술가":"芸術家","자영업":"自営業","학생":"学生","무직":"無職",
  "피하는 편":"対立を避ける","시간을 두고 말함":"時間を置いて話す","대화로 해결":"対話で解決","바로 따짐":"すぐ問いただす","끝까지 결론을 냄":"最後まで結論を出す",
  "표현이 서툼":"愛情表現が苦手","조용히 곁에 있음":"静かにそばにいる","말로 표현":"言葉で表現","행동으로 표현":"行動で表現","적극적으로 챙김":"積極的に世話をする",
  "혼자가 편함":"一人が楽","낯을 가림":"人見知り","조용히 어울림":"静かに関わる","먼저 다가감":"自分から近づく","무리의 중심":"集団の中心",
  "논리 우선":"論理優先","이성적인 편":"理性的","균형형":"バランス型","마음을 살핌":"気持ちを考える","공감 우선":"共感優先",
  "무계획":"無計画","즉흥적":"即興的","유연하게 조정":"柔軟に調整","계획적":"計画的","강박적으로 계획함":"強迫的に計画する",
  "요청할 때만 도움":"頼まれた時だけ助ける","거의 관여하지 않음":"ほとんど関与しない","적당히 관여":"適度に関与","강하게 간섭함":"強く干渉する","통제광":"支配的"
});
Object.assign(UI_TEXT.en,{
  "관찰":"Observe","집":"Home","캐릭터":"Character","관계":"Relationships","주간 루틴":"Schedule","마을":"Town","상점":"Shop","설정":"Settings","기기에 저장됨":"Saved on this device",
  "거실":"Living room","현관":"Entryway","침실":"Bedroom","주방":"Kitchen","욕실":"Bathroom","식당":"Dining room","서재·취미방":"Study · hobby room","아이방":"Child's room","손님방":"Guest room","창고":"Storage room","다이닝룸":"Dining room","베란다":"Balcony","기타 방":"Other room",
  "소파":"Sofa","침대":"Bed","책상":"Desk","책장":"Bookcase","의자":"Chair","식탁":"Dining table","옷장":"Wardrobe","신발장":"Shoe cabinet","수납장":"Storage cabinet","선반":"Shelf","협탁":"Bedside table","화장대":"Vanity","전신거울":"Full-length mirror","냉장고":"Refrigerator","세탁기":"Washing machine","건조기":"Dryer","식기세척기":"Dishwasher","오븐":"Oven","세면대":"Sink","욕조":"Bathtub","샤워부스":"Shower booth",
  "음식":"Food","음료":"Drinks","간식":"Snacks","고기":"Meat","해산물":"Seafood","채식":"Vegetarian","면 요리":"Noodles","국물":"Soup · stew","구이":"Grilled food","튀김":"Fried food","샐러드":"Salad","디저트":"Dessert","케이크":"Cake","쿠키":"Cookies","커피":"Coffee","주스":"Juice","탄산음료":"Soda","기타 음료":"Other drinks","한식":"Korean food","중식":"Chinese food","일식":"Japanese food","이탈리아 음식":"Italian food","양식":"Western food","분식":"Korean street food","패스트푸드":"Fast food",
  "취미":"Hobbies","취미 없음":"No hobbies","게임":"Games","독서":"Reading","음악":"Music","영화·영상":"Film · video","운동":"Exercise","공예":"Crafts","미술":"Art","요리":"Cooking","여행":"Travel","패션":"Fashion","사진 촬영":"Photography","글쓰기":"Writing","그림 그리기":"Drawing","악기 연주":"Playing an instrument","노래 부르기":"Singing","춤추기":"Dancing","식물 돌보기":"Caring for plants","인테리어 꾸미기":"Decorating interiors","외국어 공부":"Studying languages","인터넷 서핑":"Browsing the web","쇼핑":"Shopping","산책":"Walking","캠핑":"Camping","등산":"Hiking","드라이브":"Driving","봉사활동":"Volunteering",
  "직모":"Straight","약한 반곱슬":"Slightly wavy","강한 반곱슬":"Wavy","곱슬":"Curly","강한 곱슬":"Tightly curled","삭발·매우 짧음":"Shaved · very short","숏컷":"Short","귀 위 길이":"Above the ears","단발":"Bob length","어깨 길이":"Shoulder length","허리 길이":"Waist length","허리보다 김":"Below the waist","자연모":"Natural hair","전체 염색":"Full dye","부분 염색":"Partial dye","탈색 후 염색":"Bleached and dyed","여러 색":"Multiple colors",
  "검은색":"Black","갈색":"Brown","밝은 갈색":"Light brown","짙은 갈색":"Dark brown","연갈색":"Light brown","금발":"Blonde","백발·은발":"White · silver","회색":"Gray","빨간색":"Red","주황색":"Orange","노란색":"Yellow","초록색":"Green","청록색":"Teal","파란색":"Blue","보라색":"Purple","분홍색":"Pink","호박색":"Amber","청회색":"Blue-gray","여러 색":"Multicolored",
  "매우 마른 체형":"Very thin build","마른 체형":"Thin build","슬림한 체형":"Slim build","보통 체형":"Average build","탄탄한 체형":"Toned build","근육질 체형":"Muscular build","통통한 체형":"Chubby build","비만 체형":"Large build","골격이 작은 체형":"Small frame","골격이 큰 체형":"Large frame",
  "청각 접근 방식":"Hearing access","시각 접근 방식":"Vision access","음성 안내":"Audio guidance","자막":"Captions","수어":"Sign language","입모양이 보이는 대화":"Face-to-face speech with visible lips","문자 대화":"Text communication","조용한 환경":"Quiet environment","화면 읽기":"Screen reader","확대·고대비":"Magnification · high contrast","촉각 표식":"Tactile markers","말로 주변 정보 설명":"Verbal descriptions of surroundings","직접 선택하고 결정할 시간 주기":"Allow time to choose and decide","접근 가능한 동선 먼저 확인":"Check accessible routes first","보조기기 함부로 만지지 않기":"Do not touch assistive devices without permission","쉬는 시간을 충분히 두기":"Allow enough rest time"
});
Object.assign(UI_TEXT.ja,{
  "관찰":"観察","집":"家","캐릭터":"人物","관계":"関係","주간 루틴":"予定","마을":"村","상점":"店","설정":"設定","기기에 저장됨":"端末に保存済み",
  "거실":"リビング","현관":"玄関","침실":"寝室","주방":"キッチン","욕실":"浴室","식당":"ダイニング","서재·취미방":"書斎・趣味部屋","아이방":"子ども部屋","손님방":"客室","창고":"物置","다이닝룸":"ダイニングルーム","베란다":"ベランダ","기타 방":"その他の部屋",
  "소파":"ソファ","침대":"ベッド","책상":"机","책장":"本棚","의자":"椅子","식탁":"食卓","옷장":"クローゼット","신발장":"靴箱","수납장":"収納棚","선반":"棚","협탁":"ベッドサイドテーブル","화장대":"ドレッサー","전신거울":"全身鏡","냉장고":"冷蔵庫","세탁기":"洗濯機","건조기":"乾燥機","식기세척기":"食器洗い機","오븐":"オーブン","세면대":"洗面台","욕조":"浴槽","샤워부스":"シャワーブース",
  "음식":"食べ物","음료":"飲み物","간식":"おやつ","고기":"肉料理","해산물":"魚介料理","채식":"ベジタリアン","면 요리":"麺料理","국물":"スープ・煮込み","구이":"焼き料理","튀김":"揚げ物","샐러드":"サラダ","디저트":"デザート","케이크":"ケーキ","쿠키":"クッキー","커피":"コーヒー","주스":"ジュース","탄산음료":"炭酸飲料","기타 음료":"その他の飲み物","한식":"韓国料理","중식":"中華料理","일식":"日本料理","이탈리아 음식":"イタリア料理","양식":"洋食","분식":"韓国軽食","패스트푸드":"ファストフード",
  "취미":"趣味","취미 없음":"趣味なし","게임":"ゲーム","독서":"読書","음악":"音楽","영화·영상":"映画・動画","운동":"運動","공예":"工芸","미술":"美術","요리":"料理","여행":"旅行","패션":"ファッション","사진 촬영":"写真撮影","글쓰기":"文章を書く","그림 그리기":"絵を描く","악기 연주":"楽器演奏","노래 부르기":"歌う","춤추기":"踊る","식물 돌보기":"植物の世話","인테리어 꾸미기":"インテリアを飾る","외국어 공부":"外国語学習","인터넷 서핑":"ネット閲覧","쇼핑":"買い物","산책":"散歩","캠핑":"キャンプ","등산":"登山","드라이브":"ドライブ","봉사활동":"ボランティア活動",
  "직모":"ストレート","약한 반곱슬":"少しウェーブ","강한 반곱슬":"ウェーブ","곱슬":"カール","강한 곱슬":"強いカール","삭발·매우 짧음":"坊主・ベリーショート","숏컷":"ショート","귀 위 길이":"耳より上","단발":"ボブ","어깨 길이":"肩まで","허리 길이":"腰まで","허리보다 김":"腰より長い","자연모":"地毛","전체 염색":"全体染め","부분 염색":"部分染め","탈색 후 염색":"ブリーチ後に染色","여러 색":"複数色",
  "검은색":"黒","갈색":"茶色","밝은 갈색":"明るい茶色","짙은 갈색":"濃い茶色","연갈색":"薄茶色","금발":"金髪","백발·은발":"白髪・銀髪","회색":"灰色","빨간색":"赤","주황색":"オレンジ","노란색":"黄色","초록색":"緑","청록색":"青緑","파란색":"青","보라색":"紫","분홍색":"ピンク","호박색":"琥珀色","청회색":"青灰色","여러 색":"多色",
  "매우 마른 체형":"非常に細い体型","마른 체형":"細い体型","슬림한 체형":"スリムな体型","보통 체형":"標準体型","탄탄한 체형":"引き締まった体型","근육질 체형":"筋肉質","통통한 체형":"ふっくらした体型","비만 체형":"大柄な体型","골격이 작은 체형":"骨格が小さい体型","골격이 큰 체형":"骨格が大きい体型",
  "청각 접근 방식":"聴覚アクセシビリティ","시각 접근 방식":"視覚アクセシビリティ","음성 안내":"音声案内","자막":"字幕","수어":"手話","입모양이 보이는 대화":"口元が見える会話","문자 대화":"文字での会話","조용한 환경":"静かな環境","화면 읽기":"スクリーンリーダー","확대·고대비":"拡大・ハイコントラスト","촉각 표식":"触覚マーカー","말로 주변 정보 설명":"周囲の情報を言葉で説明","직접 선택하고 결정할 시간 주기":"自分で選び決める時間を確保","접근 가능한 동선 먼저 확인":"移動可能な経路を先に確認","보조기기 함부로 만지지 않기":"補助機器に無断で触れない","쉬는 시간을 충분히 두기":"十分な休憩時間を取る"
});
Object.assign(UI_TEXT.en,{
  "간헐적 폭발 장애 설정":"Intermittent explosive disorder setting","감각 자극에 민감함":"Sensitive to sensory stimuli","감각 처리 특성":"Sensory processing trait","감각·직관 정도":"Sensing · intuition","감정 표현의 크기":"Emotional expressiveness","감정에 깊이 공명":"Deeply emotionally attuned","감정을 잘 드러내지 않음":"Rarely shows emotions","감정이 급격히 치솟는 때가 있음":"Emotions sometimes surge suddenly","감정이 바로 드러남":"Emotions show immediately","강박 관련 특성":"Obsessive-compulsive trait",
  "같은 감정이라도 표정과 몸짓으로 얼마나 드러나는지 정해요.":"Choose how much the same emotion shows through expressions and gestures.","격해지면 먼저 거리를 두고 진정함":"Steps away first to calm down when overwhelmed","결벽에 가까움":"Almost obsessively tidy","공감형":"Empathetic","공격 충동이 있어도 이 성향과 실제 행동 단계가 허용해야 행동으로 나와요.":"Even with an aggressive impulse, it appears only when this trait and the allowed action level permit it.","관심 대상에 과집중함":"Hyperfocuses on subjects of interest","구체적인 편":"Tends to be concrete","기억이 비는 때가 있음":"Sometimes has memory gaps",
  "남에게 관여하는 정도":"Level of involvement with others","논리 최우선":"Logic above all","눈앞의 현실 중시":"Focuses on present reality","부산스럽게 여러 일을 오감":"Juggles several tasks restlessly","불안 관련 특성":"Anxiety-related trait","사고·감정 정도":"Thinking · feeling","사람이 버거움":"Finds social contact overwhelming","사이코패스 성향 설정 · 비임상":"Psychopathic traits · non-clinical setting","사회적 신호를 해석하는 데 시간이 필요함":"Needs time to interpret social cues","상상의 세계":"Imaginative world","상황에 따라 다름":"Depends on the situation","상황에 따라 표현함":"Expresses it depending on the situation","생각나면 바로 움직임":"Acts as soon as an idea occurs","생각이 떠오르면 바로 시작함":"Starts immediately when an idea occurs","생활 에너지":"Daily energy",
  "서사·인지 특성 · 선택 사항":"Narrative & cognitive traits · optional","설정 라벨 · 최대 8개":"Setting labels · up to 8","실제 장면에 반영할 표현 · 최대 8개":"Expressions used in scenes · up to 8","사용자 정의 특성 표현 · 선택 사항":"Custom trait expressions · optional","복수 자아·다중 정체성 설정":"Multiple selves · plural identity setting","해리 경험":"Dissociative experiences","틱·투렛 관련 특성":"Tic · Tourette-related trait","기타 직접 설정":"Other custom setting","주의가 쉽게 전환됨":"Attention shifts easily","익숙한 순서가 바뀌면 힘듦":"Struggles when familiar routines change","자아마다 말투·선호가 다름":"Each self has different speech and preferences","타인의 감정을 직관보다 관찰과 추론으로 파악함":"Understands others' emotions through observation and reasoning rather than intuition","죄책감이나 공감이 낮게 표현됨":"Guilt or empathy is expressed weakly",
  "정보를 받아들이는 방식":"How they take in information","판단하는 방식":"How they make decisions","행동을 전환하는 방식":"How they switch activities","깔끔한 정도":"Tidiness","옷을 입는 감각":"Fashion sense","갈등 대응":"Conflict response","애정 표현":"Affection style","유머·장난 성향":"Humor · playfulness","충동을 참는 정도":"Impulse control","현실과 경험 중시":"Values reality and experience","직관과 상상 중시":"Values intuition and imagination","한 가지씩 차분히":"One task at a time","잠깐 쉬고 다음 일":"Takes a short break before the next task","허둥대며 주의가 자주 옮겨감":"Rushes and shifts attention often","어질러도 편함":"Comfortable with clutter","조금 느슨함":"A little relaxed","정돈을 좋아함":"Likes order","흐트러짐을 못 참음":"Cannot tolerate disorder","패션에 전혀 관심 없음":"No interest in fashion","조합을 자주 틀림":"Often mismatches outfits","센스 있게 입음":"Dresses with good taste","스타일링에 능숙함":"Skilled at styling","방관자":"Bystander","챙기고 확인함":"Checks in and looks after others","컨트롤프릭":"Control freak",
  "신체와 외형":"Body & appearance","외모가 눈에 띄는 정도":"How noticeable their appearance is","현재 머리색":"Current hair color","머리색 설정":"Hair color status","본래 머리색 · 염색모일 때":"Natural hair color · if dyed","머리 기장":"Hair length","머리 결":"Hair texture","왼쪽 눈 색":"Left eye color","오른쪽 눈 색":"Right eye color","화장 정도":"Makeup level","미용실 방문 빈도":"Salon visit frequency","성형·외형 의료 시술 여부":"Cosmetic procedure status","머리 스타일 · 여러 개 선택 가능":"Hairstyles · multiple selections allowed","화장 스타일 · 화장할 때 반영":"Makeup styles · used when wearing makeup","신체 특성":"Physical traits","만성질환·건강 관리":"Chronic conditions · health management","상호작용에서 지킬 방식":"Interaction preferences","휠체어 이용 방식":"Wheelchair use pattern","의수 사용 부위":"Prosthetic arm side","의수 종류":"Prosthetic arm type","의족 사용 부위":"Prosthetic leg side","의족 종류":"Prosthetic leg type","청각장애·난청 부위":"Hearing loss side","청각 특성":"Hearing characteristics","시각장애·저시력 부위":"Visual impairment side","시각 특성":"Vision characteristics"
});
Object.assign(UI_TEXT.ja,{
  "간헐적 폭발 장애 설정":"間欠性爆発性障害の設定","감각 자극에 민감함":"感覚刺激に敏感","감각 처리 특성":"感覚処理の特性","감각·직관 정도":"感覚・直感の度合い","감정 표현의 크기":"感情表現の大きさ","감정에 깊이 공명":"感情に深く共鳴する","감정을 잘 드러내지 않음":"感情をあまり表に出さない","감정이 급격히 치솟는 때가 있음":"感情が急激に高まる時がある","감정이 바로 드러남":"感情がすぐ表に出る","강박 관련 특성":"強迫関連の特性",
  "같은 감정이라도 표정과 몸짓으로 얼마나 드러나는지 정해요.":"同じ感情でも表情や身振りにどの程度現れるかを決めます。","격해지면 먼저 거리를 두고 진정함":"激しくなったら先に距離を取って落ち着く","결벽에 가까움":"潔癖に近い","공감형":"共感型","공격 충동이 있어도 이 성향과 실제 행동 단계가 허용해야 행동으로 나와요.":"攻撃衝動があっても、この傾向と実際の行動段階で許可された場合だけ行動に現れます。","관심 대상에 과집중함":"関心対象に過集中する","구체적인 편":"具体的なほう","기억이 비는 때가 있음":"記憶が抜ける時がある",
  "남에게 관여하는 정도":"他人への関与の度合い","논리 최우선":"論理を最優先","눈앞의 현실 중시":"目の前の現実を重視","부산스럽게 여러 일을 오감":"落ち着かず複数のことを行き来する","불안 관련 특성":"不安関連の特性","사고·감정 정도":"思考・感情の度合い","사람이 버거움":"人との関わりが負担","사이코패스 성향 설정 · 비임상":"サイコパシー傾向・非臨床設定","사회적 신호를 해석하는 데 시간이 필요함":"社会的な合図の解釈に時間が必要","상상의 세계":"想像の世界","상황에 따라 다름":"状況によって異なる","상황에 따라 표현함":"状況に応じて表現する","생각나면 바로 움직임":"思いついたらすぐ動く","생각이 떠오르면 바로 시작함":"考えが浮かぶとすぐ始める","생활 에너지":"生活エネルギー",
  "서사·인지 특성 · 선택 사항":"物語・認知特性・任意","설정 라벨 · 최대 8개":"設定ラベル・最大8個","실제 장면에 반영할 표현 · 최대 8개":"実際の場面に反映する表現・最大8個","사용자 정의 특성 표현 · 선택 사항":"ユーザー定義の特性表現・任意","복수 자아·다중 정체성 설정":"複数の自己・多重アイデンティティ設定","해리 경험":"解離体験","틱·투렛 관련 특성":"チック・トゥレット関連の特性","기타 직접 설정":"その他の個別設定","주의가 쉽게 전환됨":"注意が移りやすい","익숙한 순서가 바뀌면 힘듦":"慣れた順序が変わるとつらい","자아마다 말투·선호가 다름":"自己ごとに話し方や好みが異なる","타인의 감정을 직관보다 관찰과 추론으로 파악함":"他人の感情を直感より観察と推論で理解する","죄책감이나 공감이 낮게 표현됨":"罪悪感や共感が弱く表現される",
  "정보를 받아들이는 방식":"情報の受け取り方","판단하는 방식":"判断の仕方","행동을 전환하는 방식":"行動の切り替え方","깔끔한 정도":"きれい好きの度合い","옷을 입는 감각":"服装のセンス","갈등 대응":"対立への対応","애정 표현":"愛情表現","유머·장난 성향":"ユーモア・いたずら傾向","충동을 참는 정도":"衝動を抑える度合い","현실과 경험 중시":"現実と経験を重視","직관과 상상 중시":"直感と想像を重視","한 가지씩 차분히":"一つずつ落ち着いて","잠깐 쉬고 다음 일":"少し休んで次のことへ","허둥대며 주의가 자주 옮겨감":"慌てて注意が頻繁に移る","어질러도 편함":"散らかっていても平気","조금 느슨함":"少しゆるい","정돈을 좋아함":"整頓が好き","흐트러짐을 못 참음":"乱れに耐えられない","패션에 전혀 관심 없음":"ファッションに全く関心がない","조합을 자주 틀림":"組み合わせをよく間違える","센스 있게 입음":"センスよく着る","스타일링에 능숙함":"スタイリングが得意","방관자":"傍観者","챙기고 확인함":"気にかけて確認する","컨트롤프릭":"コントロールフリーク",
  "신체와 외형":"身体と外見","외모가 눈에 띄는 정도":"外見の目立ちやすさ","현재 머리색":"現在の髪色","머리색 설정":"髪色の設定","본래 머리색 · 염색모일 때":"本来の髪色・染髪時","머리 기장":"髪の長さ","머리 결":"髪質","왼쪽 눈 색":"左目の色","오른쪽 눈 색":"右目の色","화장 정도":"メイクの程度","미용실 방문 빈도":"美容院に行く頻度","성형·외형 의료 시술 여부":"美容・外見医療施術の有無","머리 스타일 · 여러 개 선택 가능":"ヘアスタイル・複数選択可","화장 스타일 · 화장할 때 반영":"メイクスタイル・メイク時に反映","신체 특성":"身体的特徴","만성질환·건강 관리":"慢性疾患・健康管理","상호작용에서 지킬 방식":"関わり方の希望","휠체어 이용 방식":"車いすの利用方法","의수 사용 부위":"義手の使用部位","의수 종류":"義手の種類","의족 사용 부위":"義足の使用部位","의족 종류":"義足の種類","청각장애·난청 부위":"聴覚障害・難聴の部位","청각 특성":"聴覚特性","시각장애·저시력 부위":"視覚障害・弱視の部位","시각 특성":"視覚特性"
});
Object.assign(UI_TEXT.en,{
  "· 가장 중요한 사람":"· Most important person","고객센터":"Customer support","고딕":"Gothic","고소득":"High income","고양이":"Cat","고지혈증":"High cholesterol","고혈압":"High blood pressure","고활동형 의족":"High-activity prosthetic leg","곤봉":"Club","공동 소유":"Co-owned","공동 주거":"Shared housing","공방 체험":"Craft workshop experience",
  "가벼운 물건을 엉뚱한 자리로 옮겨 놓고 모르는 척 주변을 살피고 있어요.":"They moved a light object to an odd spot, then glanced around as if they knew nothing about it.","가족과 같은 공간에 있으면서도 자기만의 일에 집중하고 있어요.":"They are sharing the room with family while staying focused on their own activity.","가족들이 표시해 둔 안전 구역 안에서 조심스럽게 움직이고 있어요.":"They are moving carefully within the safe area marked by the family.","갑자기 신이 나 짧게 방을 한 바퀴 달린 뒤 숨을 고르고 있어요.":"A sudden burst of excitement sent them on a quick lap around the room, and now they are catching their breath.","거울에 비친 모습을 살피며 고개를 좌우로 갸웃거리고 있어요.":"They are studying their reflection and tilting their head from side to side.",
  "건강 상태를 고르더라도 매 장면마다 언급하지 않습니다. 치료법·복용량·식단을 자동 처방하지 않고, 평범한 생활과 선택한 접근성 방식 안에서만 드물게 나타납니다. 이 참고 메모는 민감한 내용이 그대로 노출되지 않도록 생활 로그에는 자동 삽입하지 않고 설정표에만 보관합니다.":"A selected health condition is not mentioned in every scene. The game never prescribes treatment, dosage, or diet; it appears only occasionally in ordinary life and through the accessibility choices you made. This private note stays in the profile sheet and is not inserted into life logs."
});
Object.assign(UI_TEXT.ja,{
  "· 가장 중요한 사람":"・最も大切な人","고객센터":"カスタマーサポート","고딕":"ゴシック","고소득":"高所得","고양이":"猫","고지혈증":"高脂血症","고혈압":"高血圧","고활동형 의족":"高活動型義足","곤봉":"棍棒","공동 소유":"共同所有","공동 주거":"共同住宅","공방 체험":"工房体験",
  "가벼운 물건을 엉뚱한 자리로 옮겨 놓고 모르는 척 주변을 살피고 있어요.":"軽い物を妙な場所へ移し、知らないふりをして周囲をうかがっています。","가족과 같은 공간에 있으면서도 자기만의 일에 집중하고 있어요.":"家族と同じ空間にいながら、自分のことに集中しています。","가족들이 표시해 둔 안전 구역 안에서 조심스럽게 움직이고 있어요.":"家族が示した安全な範囲の中を慎重に動いています。","갑자기 신이 나 짧게 방을 한 바퀴 달린 뒤 숨을 고르고 있어요.":"急に楽しくなって部屋を一周だけ走り、息を整えています。","거울에 비친 모습을 살피며 고개를 좌우로 갸웃거리고 있어요.":"鏡に映る姿を確かめながら、首を左右にかしげています。",
  "건강 상태를 고르더라도 매 장면마다 언급하지 않습니다. 치료법·복용량·식단을 자동 처방하지 않고, 평범한 생활과 선택한 접근성 방식 안에서만 드물게 나타납니다. 이 참고 메모는 민감한 내용이 그대로 노출되지 않도록 생활 로그에는 자동 삽입하지 않고 설정표에만 보관합니다.":"健康状態を選んでも毎回の場面で触れることはありません。治療法・服用量・食事を自動で指示せず、普段の生活と選択したアクセシビリティの範囲でまれに表れます。この参考メモは生活ログへ自動挿入せず、プロフィール表だけに保存します。"
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
Object.assign(UI_TEXT.en,{
  "앱 정보":"App information","현재 버전":"Current version","웹 버전 · 자동 업데이트":"Web version · updates automatically",
  "오류를 제보할 때 이 버전과 빌드 번호를 함께 알려 주세요.":"Please include this version and build number when reporting an issue."
});
Object.assign(UI_TEXT.ja,{
  "앱 정보":"アプリ情報","현재 버전":"現在のバージョン","웹 버전 · 자동 업데이트":"ウェブ版・自動更新",
  "오류를 제보할 때 이 버전과 빌드 번호를 함께 알려 주세요.":"不具合を報告する際は、このバージョンとビルド番号もお知らせください。"
});
Object.assign(UI_TEXT.en,{
  "캐릭터 연락 알림":"Character contact notifications","알림 켜기":"Enable notifications","알림 끄기":"Turn off notifications","알림 사용 중":"Notifications are on","알림 꺼짐 · 권한은 유지됨":"Notifications are off · permission remains granted","휴대폰에서 알림이 거부됨":"Notifications are blocked on this device","아직 알림을 요청하지 않음":"Notification permission has not been requested",
  "선택한 캐릭터가 낮 시간에 가끔 소식을 보내거나 선택을 물어요. 답한 내용은 실제 생활 일정에 이어집니다.":"Selected characters sometimes send an update or ask a question during the day. Your answers continue into their actual schedules.","누가, 얼마나 자주 연락할지 정하기":"Choose who contacts you and how often","연락받을 캐릭터":"Characters who may contact you","여러 명을 고르면 같은 캐릭터가 연달아 나오지 않게 번갈아 연락해요.":"When you choose several characters, they take turns instead of the same character appearing repeatedly.",
  "연락 빈도":"Contact frequency","가끔 · 주 3회":"Occasionally · 3 times a week","하루 1회":"Once a day","활발하게 · 하루 2회":"Lively · twice a day","알림 말투":"Notification voice","섞어서 · 말투와 담백한 문장":"Mixed · character voice and plain text","캐릭터 말투를 적극 반영":"Use character voice often","담백하게 · 말투 연출 최소화":"Concise · minimal voice styling","연락 시작 시간":"Start time","연락 종료 시간":"End time","받고 싶은 연락":"Notification topics","질문과 선택":"Questions & choices","지금 하는 일":"Current moments","관계와 선물":"Relationships & gifts","집과 생활":"Home & daily life","일과 학교":"Work & school","취향과 음식":"Tastes & food","5초 뒤 시험 알림 보내기":"Send a test notification in 5 seconds",
  "같은 문구와 같은 캐릭터가 짧은 기간에 반복되지 않도록 최근 연락을 기억해요. ‘섞어서’는 캐릭터 말투를 일부 알림에만 사용합니다.":"Recent contacts are remembered so the same line or character does not repeat too soon. Mixed mode uses the character's voice only in some notifications.","처음 켤 때 서랍마을의 설명을 보여준 뒤 Android의 공식 알림 허용창이 한 번 나타납니다. 언제든 여기서 끄거나 휴대폰 설정에서 차단할 수 있어요.":"When you first enable this, Drawer Village explains the feature before Android shows its official permission dialog. You can turn it off here or block it in device settings at any time."
});
Object.assign(UI_TEXT.ja,{
  "캐릭터 연락 알림":"キャラクターからの連絡通知","알림 켜기":"通知をオンにする","알림 끄기":"通知をオフにする","알림 사용 중":"通知はオンです","알림 꺼짐 · 권한은 유지됨":"通知はオフ・許可は維持されています","휴대폰에서 알림이 거부됨":"端末で通知が拒否されています","아직 알림을 요청하지 않음":"通知の許可はまだ求めていません",
  "선택한 캐릭터가 낮 시간에 가끔 소식을 보내거나 선택을 물어요. 답한 내용은 실제 생활 일정에 이어집니다.":"選んだキャラクターが昼間に近況を送ったり、選択を尋ねたりします。回答は実際の生活予定に反映されます。","누가, 얼마나 자주 연락할지 정하기":"誰から、どのくらい連絡を受けるか設定","연락받을 캐릭터":"連絡を受けるキャラクター","여러 명을 고르면 같은 캐릭터가 연달아 나오지 않게 번갈아 연락해요.":"複数選ぶと、同じキャラクターが続かないよう交代で連絡します。",
  "연락 빈도":"連絡頻度","가끔 · 주 3회":"ときどき・週3回","하루 1회":"1日1回","활발하게 · 하루 2회":"活発に・1日2回","알림 말투":"通知の話し方","섞어서 · 말투와 담백한 문장":"ミックス・話し方と簡潔な文","캐릭터 말투를 적극 반영":"キャラクターの話し方を多めに反映","담백하게 · 말투 연출 최소화":"簡潔・話し方の演出を最小限に","연락 시작 시간":"連絡開始時刻","연락 종료 시간":"連絡終了時刻","받고 싶은 연락":"受け取りたい連絡","질문과 선택":"質問と選択","지금 하는 일":"今していること","관계와 선물":"関係とプレゼント","집과 생활":"家と暮らし","일과 학교":"仕事と学校","취향과 음식":"好みと食べ物","5초 뒤 시험 알림 보내기":"5秒後にテスト通知を送る",
  "같은 문구와 같은 캐릭터가 짧은 기간에 반복되지 않도록 최근 연락을 기억해요. ‘섞어서’는 캐릭터 말투를 일부 알림에만 사용합니다.":"同じ文やキャラクターが短期間に繰り返されないよう、最近の連絡を記憶します。「ミックス」は一部の通知だけにキャラクターの話し方を使います。","처음 켤 때 서랍마을의 설명을 보여준 뒤 Android의 공식 알림 허용창이 한 번 나타납니다. 언제든 여기서 끄거나 휴대폰 설정에서 차단할 수 있어요.":"初めてオンにする時は説明の後にAndroid公式の許可画面が表示されます。ここや端末設定からいつでもオフにできます。"
});
Object.assign(UI_TEXT.en,{
  "막연한 상태 문구 대신 캐릭터의 질문·고민·안부와 실제 생활로그가 낮 시간에 도착해요. 질문 알림에서 고른 답은 실제 생활 일정으로 이어집니다.":"Instead of vague status lines, you receive character questions, worries, check-ins, and concrete life logs during the day. Answers chosen from question notifications continue into their actual schedules.",
  "❓ 질문과 실제 선택":"❓ Questions & real choices","💬 오늘의 안부 질문":"💬 Daily check-in questions","🤔 캐릭터의 고민":"🤔 Character worries","🌿 다정한 휴식 메시지":"🌿 Gentle rest messages","📖 구체적인 생활로그":"📖 Concrete life logs","🎁 관계와 선물":"🎁 Relationships & gifts","🏠 집과 생활":"🏠 Home & daily life","💼 일과 학교":"💼 Work & school","🍰 취향과 음식":"🍰 Tastes & food",
  "생활로그는 관찰 기록 문장 그대로 보내고 말투를 입히지 않아요. 그 밖의 연락은 선택한 말투 설정을 따르며, 같은 문구와 캐릭터가 짧은 기간에 반복되지 않게 조절해요.":"Life logs are sent as plain observation records without character voice styling. Other messages follow your selected voice setting, while repeated lines and characters are spaced out.",
  "알림의 작은 상태표시 아이콘은 Android 규칙상 앱 아이콘이며, 본문 옆 큰 아이콘에는 연락한 캐릭터의 등록 이미지를 표시해요. 처음 켤 때 설명 뒤 Android 공식 허용창이 한 번 나타나며 언제든 여기나 휴대폰 설정에서 끌 수 있어요.":"Android requires the small status icon to use the app icon, while the larger icon beside the message uses the contacting character's registered image. Android's official permission dialog appears once after the explanation, and notifications can be disabled here or in device settings at any time."
});
Object.assign(UI_TEXT.ja,{
  "막연한 상태 문구 대신 캐릭터의 질문·고민·안부와 실제 생활로그가 낮 시간에 도착해요. 질문 알림에서 고른 답은 실제 생활 일정으로 이어집니다.":"曖昧な状態文ではなく、キャラクターからの質問・悩み・気遣いと具体的な生活ログが昼間に届きます。質問通知で選んだ回答は実際の生活予定に反映されます。",
  "❓ 질문과 실제 선택":"❓ 質問と実際の選択","💬 오늘의 안부 질문":"💬 今日の気遣い質問","🤔 캐릭터의 고민":"🤔 キャラクターの悩み","🌿 다정한 휴식 메시지":"🌿 優しい休息メッセージ","📖 구체적인 생활로그":"📖 具体的な生活ログ","🎁 관계와 선물":"🎁 関係とプレゼント","🏠 집과 생활":"🏠 家と暮らし","💼 일과 학교":"💼 仕事と学校","🍰 취향과 음식":"🍰 好みと食べ物",
  "생활로그는 관찰 기록 문장 그대로 보내고 말투를 입히지 않아요. 그 밖의 연락은 선택한 말투 설정을 따르며, 같은 문구와 캐릭터가 짧은 기간에 반복되지 않게 조절해요.":"生活ログは観察記録の文をそのまま送り、話し方の演出は加えません。それ以外の連絡は選んだ話し方に従い、同じ文やキャラクターが短期間に続かないよう調整します。",
  "알림의 작은 상태표시 아이콘은 Android 규칙상 앱 아이콘이며, 본문 옆 큰 아이콘에는 연락한 캐릭터의 등록 이미지를 표시해요. 처음 켤 때 설명 뒤 Android 공식 허용창이 한 번 나타나며 언제든 여기나 휴대폰 설정에서 끌 수 있어요.":"Androidの規則により小さいステータスアイコンはアプリアイコンを使い、本文横の大きいアイコンには連絡したキャラクターの登録画像を表示します。説明の後にAndroid公式の許可画面が一度表示され、ここや端末設定からいつでもオフにできます。"
});
Object.assign(UI_TEXT.en,{
  "관심사":"Interests","공연 관람":"Watching performances","공예 도구":"Craft tools","공포":"Horror","과학":"Science","관악기":"Wind instruments","관절 질환":"Joint condition","관찰 예능":"Observational variety shows","교양":"General interest","교육":"Educational",
  "천문학":"Astronomy","우주":"Space","의학":"Medicine","심리학":"Psychology","철학":"Philosophy","정치":"Politics","경제":"Economics","법률":"Law","언어":"Language","외국어":"Foreign languages","지도":"Maps","지리":"Geography","건축":"Architecture","영상 편집":"Video editing","소설":"Novels","시":"Poetry",
  "베이킹":"Baking","와인":"Wine","원예":"Gardening","자연":"Nature","환경":"Environment","러닝":"Running","헬스":"Weight training","요가":"Yoga","e스포츠":"Esports","보드게임":"Board games","퍼즐":"Puzzles","마술":"Magic","뜨개질":"Knitting","재봉":"Sewing","목공":"Woodworking","도예":"Pottery","수집":"Collecting","빈티지":"Vintage","전자기기":"Electronics","프로그래밍":"Programming","로봇":"Robotics","인공지능":"Artificial intelligence","오컬트":"Occult","신화":"Mythology","종교":"Religion","범죄 사건":"Crime cases","추리":"Mystery","밀리터리":"Military","무기":"Weapons"
});
Object.assign(UI_TEXT.ja,{
  "관심사":"関心分野","공연 관람":"公演鑑賞","공예 도구":"工芸道具","공포":"ホラー","과학":"科学","관악기":"管楽器","관절 질환":"関節疾患","관찰 예능":"観察バラエティ","교양":"教養","교육":"教育",
  "천문학":"天文学","우주":"宇宙","의학":"医学","심리학":"心理学","철학":"哲学","정치":"政治","경제":"経済","법률":"法律","언어":"言語","외국어":"外国語","지도":"地図","지리":"地理","건축":"建築","영상 편집":"動画編集","소설":"小説","시":"詩",
  "베이킹":"お菓子作り","와인":"ワイン","원예":"園芸","자연":"自然","환경":"環境","러닝":"ランニング","헬스":"筋力トレーニング","요가":"ヨガ","e스포츠":"eスポーツ","보드게임":"ボードゲーム","퍼즐":"パズル","마술":"マジック","뜨개질":"編み物","재봉":"裁縫","목공":"木工","도예":"陶芸","수집":"収集","빈티지":"ヴィンテージ","전자기기":"電子機器","프로그래밍":"プログラミング","로봇":"ロボット","인공지능":"人工知能","오컬트":"オカルト","신화":"神話","종교":"宗教","범죄 사건":"犯罪事件","추리":"ミステリー","밀리터리":"ミリタリー","무기":"武器"
});
Object.assign(UI_TEXT.en,{"인물 관계도":"Relationship map","화살표 색은 출발점의 캐릭터가 상대를 보는 감정을 나타냅니다.":"Each arrow color shows how the character at its starting point feels about the character it points to.","표시할 캐릭터":"Characters shown","전체 캐릭터":"All characters","개별 선택":"Custom selection","마을":"Town","그룹":"Group","캐릭터 고르기":"Choose characters","관계도 갱신":"Update map","PNG로 저장":"Save PNG","관계도를 준비하는 중이에요.":"Preparing the map…","관계나 시선 설정이 있는 캐릭터를 두 명 이상 골라 주세요.":"Choose at least two characters who have a relationship or viewpoint setting.","강한 사랑":"Strong love","연애 감정":"Romantic interest","친구·우호":"Friendly / positive","신뢰·편안":"Trust / comfort","존경·동경":"Respect / admiration","경계·성가심":"Guarded / annoyed","두려움":"Fear","싫음·적의":"Hate / hostility","중립·미정":"Neutral / undecided"});
Object.assign(UI_TEXT.ja,{"인물 관계도":"人物関係図","화살표 색은 출발점의 캐릭터가 상대를 보는 감정을 나타냅니다.":"矢印の色は、出発点の人物が相手に向ける感情を表します。","표시할 캐릭터":"表示する人物","전체 캐릭터":"すべての人物","개별 선택":"個別選択","마을":"タウン","그룹":"グループ","캐릭터 고르기":"人物を選択","관계도 갱신":"関係図を更新","PNG로 저장":"PNGで保存","관계도를 준비하는 중이에요.":"関係図を準備中…","관계나 시선 설정이 있는 캐릭터를 두 명 이상 골라 주세요.":"関係または視線設定がある人物を2人以上選んでください。","강한 사랑":"強い愛","연애 감정":"恋愛感情","친구·우호":"友好・好意","신뢰·편안":"信頼・安心","존경·동경":"尊敬・憧れ","경계·성가심":"警戒・煩わしさ","두려움":"恐れ","싫음·적의":"嫌悪・敵意","중립·미정":"中立・未定"});
function settings(){return settingsContent().replace(/<\/section>$/,`${businessInformationFooter()}</section>`)}
Object.assign(UI_TEXT.en,{
  "건물 층수":"Number of floors","층을 줄이면 위층 방은 남아 있는 가장 높은 층으로 이동해요.":"If you reduce the floor count, rooms above it move to the highest remaining floor.","방이 있는 층":"Room floor",
  "집 편집 모드에서 위치와 크기가 12×16 격자 칸에 자석처럼 맞춰져요.":"In Home edit mode, room position and size snap to a 12×16 grid.","자동 배치로 되돌리기":"Reset to automatic layout","이 층의 자동 배치 기준으로 되돌렸어요":"This floor was reset to its automatic layout.",
  "반복할 요일 · 여러 개 선택 가능":"Repeat on · choose multiple days","같은 시간과 내용의 일정을 선택한 모든 요일에 한 번에 적용해요.":"Apply the same time and details to every selected day at once.","일정을 적용할 요일을 하나 이상 골라 주세요":"Choose at least one day for this schedule.",
  "구매하거나 선물할 물건":"Item to buy or gift","구성원·관계 편집":"Edit members & relationships","권총":"Handgun","귀가":"Return home","그룹":"Group","그룹 관계 삭제":"Delete group relationship","그린":"Green","구르망":"Gourmand","과거에 받음":"Received in the past","관계가 끝난 이유 ·":"Why the relationship ended ·","관계 실체 ·":"Relationship status ·","공식 관계와 별개인 이 캐릭터만의 속마음":"This character's private feelings, separate from the official relationship","관계를 눌러 구성과 단계를 편집하거나 삭제할 수 있어요.":"Select a relationship to edit its members and stage or delete it.","구성원의 외출·귀가와 반려생물·청소·배송 등 집 전체의 기록":"A whole-home log of residents leaving and returning, pets, cleaning, deliveries, and more"
});
Object.assign(UI_TEXT.ja,{
  "건물 층수":"建物の階数","층을 줄이면 위층 방은 남아 있는 가장 높은 층으로 이동해요.":"階数を減らすと、上階の部屋は残っている最上階へ移動します。","방이 있는 층":"部屋がある階",
  "집 편집 모드에서 위치와 크기가 12×16 격자 칸에 자석처럼 맞춰져요.":"家の編集モードでは、部屋の位置と大きさが12×16のグリッドにスナップします。","자동 배치로 되돌리기":"自動配置に戻す","이 층의 자동 배치 기준으로 되돌렸어요":"この階を自動配置に戻しました。",
  "반복할 요일 · 여러 개 선택 가능":"繰り返す曜日・複数選択可","같은 시간과 내용의 일정을 선택한 모든 요일에 한 번에 적용해요.":"同じ時間と内容を選んだすべての曜日へ一度に反映します。","일정을 적용할 요일을 하나 이상 골라 주세요":"予定を適用する曜日を1つ以上選んでください。",
  "구매하거나 선물할 물건":"購入・プレゼントする物","구성원·관계 편집":"メンバー・関係を編集","권총":"拳銃","귀가":"帰宅","그룹":"グループ","그룹 관계 삭제":"グループ関係を削除","그린":"グリーン","구르망":"グルマン","과거에 받음":"過去に受け取った","관계가 끝난 이유 ·":"関係が終わった理由・","관계 실체 ·":"関係の実態・","공식 관계와 별개인 이 캐릭터만의 속마음":"公式関係とは別の、このキャラクターだけの本心","관계를 눌러 구성과 단계를 편집하거나 삭제할 수 있어요.":"関係を選ぶと、構成や段階の編集・削除ができます。","구성원의 외출·귀가와 반려생물·청소·배송 등 집 전체의 기록":"住人の外出・帰宅、ペット、掃除、配達など家全体の記録"
});
Object.assign(UI_TEXT.en,{
  "격자 편집":"Grid edit","기숙사":"Dormitory","그림 도구":"Art supplies","금색":"Gold","기계":"Machine","글로우":"Glow","극강의 단맛":"Extremely sweet","과거 관계 ·":"Past relationship ·","근전동 의수":"Myoelectric prosthetic arm","근전동 손형 의수":"Myoelectric hand prosthesis","기관단총":"Submachine gun","기관총":"Machine gun"
});
Object.assign(UI_TEXT.ja,{
  "격자 편집":"グリッド編集","기숙사":"寮","그림 도구":"画材","금색":"金色","기계":"機械","글로우":"グロウ","극강의 단맛":"非常に甘い","과거 관계 ·":"過去の関係・","근전동 의수":"筋電義手","근전동 손형 의수":"筋電ハンド型義手","기관단총":"短機関銃","기관총":"機関銃"
});
Object.assign(UI_TEXT.en,{
  "기본 실루엣":"Default silhouette","기저귀 교환대":"Changing table","기준 주거지로 지정":"Set as primary residence","기타 의수":"Other prosthetic arm","기타 의수를 골랐을 때":"When Other prosthetic arm is selected","기타 의족":"Other prosthetic leg","기타 의족을 골랐을 때":"When Other prosthetic leg is selected","기타 휠체어":"Other wheelchair","기타 인물":"Other person","국민대학교 해옹 산스 · 부드러운 고딕":"Kookmin Haeong Sans · Soft Gothic","깨끗한 흰 종이 위에 차분한 벽돌색을 얹은 기본 테마":"A base theme with calm brick tones on clean white paper","기분에 따라 꼬리를 천천히 움직이며 주변을 살피고 있어요.":"They slowly move their tail with their mood and look around."
});
Object.assign(UI_TEXT.ja,{
  "기본 실루엣":"基本シルエット","기저귀 교환대":"おむつ交換台","기준 주거지로 지정":"主な住居に設定","기타 의수":"その他の義手","기타 의수를 골랐을 때":"その他の義手を選んだとき","기타 의족":"その他の義足","기타 의족을 골랐을 때":"その他の義足を選んだとき","기타 휠체어":"その他の車いす","기타 인물":"その他の人物","국민대학교 해옹 산스 · 부드러운 고딕":"国民大学ヘオン・サンス・柔らかなゴシック","깨끗한 흰 종이 위에 차분한 벽돌색을 얹은 기본 테마":"白い紙に落ち着いたレンガ色を重ねた基本テーマ","기분에 따라 꼬리를 천천히 움직이며 주변을 살피고 있어요.":"気分に合わせてしっぽをゆっくり動かしながら周囲を見ています。"
});
Object.assign(UI_TEXT.en,{
  "사진·색상·배치":"Images · color · layout","이미지·테마색·홈 배치":"Images · theme colors · home layout","위로 이동":"Move up","아래로 이동":"Move down",
  "캐릭터 테마색":"Character theme colors","색상표에서 직접 고르거나 6자리 HEX 코드를 입력해요. 캐릭터 선택 효과와 강조색에 함께 적용됩니다.":"Choose from the color picker or enter a 6-digit HEX code. These colors are used for character selection effects and accents.","주 색상":"Primary color","보조 색상":"Secondary color","빠른 색상":"quick colors","두 색상을 그라데이션으로 사용":"Use both colors as a gradient",
  "오늘의 연락":"Today's contact","에게 오늘의 질문이 도착했어요":" has a question for you today","갑자기 팝업으로 띄우지 않아요. 준비됐을 때 여기서 열고 선택하면 실제 생활 일정으로 이어집니다.":"It will not open as a sudden popup. Open it here when ready; your choice continues into the actual schedule.","질문과 선택은 팝업 대신 이곳에 조용히 도착해요.":"Questions and choices arrive quietly here instead of appearing as popups.","질문 열기":"Open question",
  "오늘의 연락 열기":"Open today's contact","연락":"Contact","아직 도착한 연락이 없어요":"No contact has arrived yet","새 질문과 선택은 이 메뉴에 조용히 도착해요.":"New questions and choices arrive quietly in this menu.","준비됐을 때 열고 선택하면 실제 생활 일정으로 이어집니다.":"Open it when ready; your choice continues into the actual schedule.",
  "질문·고민·안부와 실제 생활로그가 낮 시간에 도착해요. 알림을 눌러도 갑작스러운 팝업은 열리지 않고, 캐릭터 화면의 ‘오늘의 연락’에서 확인합니다.":"Questions, worries, check-ins, and concrete life logs arrive during the day. Tapping a notification never opens a surprise popup; review it under Today's contact on the Character screen.","연락 설정 정리하기":"Review contact settings","1. 연락받을 캐릭터":"1. Characters who can contact you","2. 빈도와 시간":"2. Frequency and time","3. 받고 싶은 연락":"3. Types of contact",
  "평일":"Weekdays","주말":"Weekend","매일":"Every day","선택 해제":"Clear selection","선택됨:":"Selected:","요일을 하나 이상 선택해 주세요.":"Choose at least one day.",
  "주간 일정":"Weekly schedule","월간 일정":"Monthly schedule","날짜가 정해진 약속과 한 번만 있는 일정을 달력에 기록해요.":"Add dated appointments and one-time plans to the calendar.","날짜가 정해진 약속·생일·기념일을 달력에서 함께 봐요.":"See dated plans, birthdays, and anniversaries together on the calendar.","반복되는 회사 일정, 수업, 데이트와 개인 일정을 요일별로 지정해요.":"Set repeating work, class, date, and personal schedules by weekday.","월간 일정 편집":"Edit monthly schedule","날짜":"Date","이전 달":"Previous month","다음 달":"Next month","일정 없음":"No plans","+ 기념일":"+ Anniversary","기념일 추가":"Add anniversary","기념일 편집":"Edit anniversary","날짜 · 매년 반복":"Date · repeats yearly","기념일 유형":"Anniversary type","표시할 이름":"Display name","비우면 기념일 유형으로 표시":"Leave blank to use the anniversary type","연락을 보낼 캐릭터":"Character who sends the message","함께 기념할 캐릭터":"Character to celebrate with","선택하지 않음":"None","첫 만남":"First meeting","연애 시작":"Started dating","결혼":"Wedding","가족이 된 날":"Became family","함께 살기 시작한 날":"Moved in together","이사":"Moving day","입학·졸업":"Enrollment · graduation","입사·창업":"New job · business launch","반려생물과 만난 날":"Met a companion animal","추모일":"Memorial day","사용자 지정":"Custom",
  "빈도 기준":"Frequency method","하루 횟수로 정하기":"Set times per day","몇 시간마다 받기":"Receive every few hours","하루 연락 횟수":"Contacts per day","연락 간격":"Contact interval","하루 1번":"Once a day","하루 2번":"Twice a day","하루 3번":"3 times a day","하루 4번":"4 times a day","하루 5번":"5 times a day","하루 6번":"6 times a day","2시간마다":"Every 2 hours","3시간마다":"Every 3 hours","4시간마다":"Every 4 hours","6시간마다":"Every 6 hours","8시간마다":"Every 8 hours","12시간마다":"Every 12 hours","‘하루 횟수’는 선택한 낮 시간 안에서 고르게 나누고, ‘몇 시간마다’는 시작 시간부터 정한 간격으로 도착해요.":"Times per day are spread across your chosen daytime window. Interval mode starts at the selected start time.","생일과 기념일 연락은 특별한 날짜에 한 번만 도착합니다. 생활로그는 관찰 기록 문장 그대로 보내고 말투를 입히지 않으며, 그 밖의 연락은 선택한 말투 설정을 따라요.":"Birthday and anniversary messages arrive once on their special date. Life logs stay in plain observation style; other contacts follow the selected character voice.",
  "방 사진 표시":"Room photo display","전체 보기 · 자르지 않음":"Show full image · no crop","공간 채우기 · 가장자리 잘림":"Fill room · crop edges","침실처럼 사진 전체가 중요한 방은 ‘전체 보기’를 권장해요.":"Use Show full image for bedrooms and other rooms where the entire composition matters."
});
Object.assign(UI_TEXT.ja,{
  "사진·색상·배치":"画像・色・配置","이미지·테마색·홈 배치":"画像・テーマ色・ホーム配置","위로 이동":"上へ移動","아래로 이동":"下へ移動",
  "캐릭터 테마색":"キャラクターのテーマ色","색상표에서 직접 고르거나 6자리 HEX 코드를 입력해요. 캐릭터 선택 효과와 강조색에 함께 적용됩니다.":"カラーピッカーから選ぶか、6桁のHEXコードを入力します。キャラクター選択効果とアクセント色に反映されます。","주 색상":"メインカラー","보조 색상":"サブカラー","빠른 색상":"クイックカラー","두 색상을 그라데이션으로 사용":"2色をグラデーションで使う",
  "오늘의 연락":"今日の連絡","에게 오늘의 질문이 도착했어요":"から今日の質問が届きました","갑자기 팝업으로 띄우지 않아요. 준비됐을 때 여기서 열고 선택하면 실제 생활 일정으로 이어집니다.":"突然ポップアップで表示しません。準備ができたらここで開き、選択すると実際の生活予定に反映されます。","질문과 선택은 팝업 대신 이곳에 조용히 도착해요.":"質問と選択はポップアップではなく、ここに静かに届きます。","질문 열기":"質問を開く",
  "오늘의 연락 열기":"今日の連絡を開く","연락":"連絡","아직 도착한 연락이 없어요":"まだ連絡は届いていません","새 질문과 선택은 이 메뉴에 조용히 도착해요.":"新しい質問と選択はこのメニューに静かに届きます。","준비됐을 때 열고 선택하면 실제 생활 일정으로 이어집니다.":"準備ができたら開いて選ぶと、実際の生活予定に反映されます。",
  "질문·고민·안부와 실제 생활로그가 낮 시간에 도착해요. 알림을 눌러도 갑작스러운 팝업은 열리지 않고, 캐릭터 화면의 ‘오늘의 연락’에서 확인합니다.":"質問・悩み・気遣いと具体的な生活ログが昼間に届きます。通知を押しても突然ポップアップは開かず、キャラクター画面の「今日の連絡」で確認できます。","연락 설정 정리하기":"連絡設定を整理","1. 연락받을 캐릭터":"1. 連絡を受けるキャラクター","2. 빈도와 시간":"2. 頻度と時間","3. 받고 싶은 연락":"3. 受け取りたい連絡",
  "평일":"平日","주말":"週末","매일":"毎日","선택 해제":"選択解除","선택됨:":"選択中:","요일을 하나 이상 선택해 주세요.":"曜日を1つ以上選んでください。",
  "주간 일정":"週間予定","월간 일정":"月間予定","날짜가 정해진 약속과 한 번만 있는 일정을 달력에 기록해요.":"日付のある約束や一度だけの予定をカレンダーに記録します。","날짜가 정해진 약속·생일·기념일을 달력에서 함께 봐요.":"日付のある予定・誕生日・記念日をカレンダーでまとめて確認できます。","반복되는 회사 일정, 수업, 데이트와 개인 일정을 요일별로 지정해요.":"繰り返す仕事・授業・デート・個人予定を曜日ごとに設定します。","월간 일정 편집":"月間予定を編集","날짜":"日付","이전 달":"前の月","다음 달":"次の月","일정 없음":"予定なし","+ 기념일":"＋記念日","기념일 추가":"記念日を追加","기념일 편집":"記念日を編集","날짜 · 매년 반복":"日付・毎年繰り返す","기념일 유형":"記念日の種類","표시할 이름":"表示名","비우면 기념일 유형으로 표시":"空欄の場合は記念日の種類を表示","연락을 보낼 캐릭터":"連絡を送るキャラクター","함께 기념할 캐릭터":"一緒に祝うキャラクター","선택하지 않음":"選択しない","첫 만남":"初めて会った日","연애 시작":"交際を始めた日","결혼":"結婚記念日","가족이 된 날":"家族になった日","함께 살기 시작한 날":"一緒に暮らし始めた日","이사":"引っ越し","입학·졸업":"入学・卒業","입사·창업":"入社・開業","반려생물과 만난 날":"ペットと出会った日","추모일":"追悼日","사용자 지정":"カスタム",
  "빈도 기준":"頻度の決め方","하루 횟수로 정하기":"1日の回数で設定","몇 시간마다 받기":"数時間ごとに受け取る","하루 연락 횟수":"1日の連絡回数","연락 간격":"連絡間隔","하루 1번":"1日1回","하루 2번":"1日2回","하루 3번":"1日3回","하루 4번":"1日4回","하루 5번":"1日5回","하루 6번":"1日6回","2시간마다":"2時間ごと","3시간마다":"3時間ごと","4시간마다":"4時間ごと","6시간마다":"6時間ごと","8시간마다":"8時間ごと","12시간마다":"12時間ごと","‘하루 횟수’는 선택한 낮 시간 안에서 고르게 나누고, ‘몇 시간마다’는 시작 시간부터 정한 간격으로 도착해요.":"「1日の回数」は選んだ昼間の時間帯に均等に分け、「数時間ごと」は開始時刻から設定した間隔で届きます。","생일과 기념일 연락은 특별한 날짜에 한 번만 도착합니다. 생활로그는 관찰 기록 문장 그대로 보내고 말투를 입히지 않으며, 그 밖의 연락은 선택한 말투 설정을 따라요.":"誕生日と記念日の連絡は特別な日に一度だけ届きます。生活ログは観察文のまま送り、それ以外の連絡は選んだ話し方に従います。",
  "방 사진 표시":"部屋写真の表示","전체 보기 · 자르지 않음":"全体表示・切り抜かない","공간 채우기 · 가장자리 잘림":"空間を埋める・端を切り抜く","침실처럼 사진 전체가 중요한 방은 ‘전체 보기’를 권장해요.":"寝室など写真全体が重要な部屋には「全体表示」をおすすめします。"
});
Object.assign(UI_TEXT.en,{
  "테마 고르기":"Choose theme","전체 설정 메뉴":"Full settings menu","머리 장식":"Hair accessories","곱슬기":"Curl pattern","머릿결":"Hair condition","가발·헤어피스":"Wig · hairpiece","본래 머리색":"Natural hair color",
  "완전한 직모":"Pin-straight","약한 반곱슬":"Slightly wavy","강한 반곱슬":"Strongly wavy","느슨한 웨이브":"Loose waves","굵은 곱슬":"Large curls","촘촘한 곱슬":"Tight curls","코일형":"Coily","매끄럽고 윤기 있음":"Smooth and glossy","부드러운 편":"Soft","보통":"Average","굵고 탄탄함":"Thick and resilient","거칠고 뻣뻣함":"Coarse and stiff","건조하고 푸석함":"Dry and frizzy","쉽게 엉킴":"Tangles easily","잘 끊어짐":"Breaks easily"
});
Object.assign(UI_TEXT.ja,{
  "테마 고르기":"テーマを選ぶ","전체 설정 메뉴":"全体設定メニュー","머리 장식":"ヘアアクセサリー","곱슬기":"カールの強さ","머릿결":"髪質","가발·헤어피스":"かつら・ヘアピース","본래 머리색":"地毛の色",
  "완전한 직모":"完全な直毛","약한 반곱슬":"ゆるいくせ毛","강한 반곱슬":"強いくせ毛","느슨한 웨이브":"ゆるいウェーブ","굵은 곱슬":"大きなカール","촘촘한 곱슬":"細かいカール","코일형":"コイル状","매끄럽고 윤기 있음":"なめらかで艶がある","부드러운 편":"柔らかめ","보통":"普通","굵고 탄탄함":"太くてしっかり","거칠고 뻣뻣함":"粗くて硬い","건조하고 푸석함":"乾燥してぱさつく","쉽게 엉킴":"絡まりやすい","잘 끊어짐":"切れやすい"
});
Object.assign(UI_TEXT.en,{
  "✉ 연락":"✉ Contact","높은 자리에 올라 주변을 내려다보며 귀를 움직이고 있어요.":"They perch up high, looking around while their ears twitch.","눈에 띄게 아름다움":"Strikingly beautiful","눈에 띄지 않음":"Unnoticeable","다관절 전자의수":"Multi-articulating electronic hand","다큐멘터리":"Documentary","단검":"Dagger","단궁":"Shortbow","단체":"Group","달콤함":"Sweetness","대검":"Greatsword","대기":"Waiting","대표":"Representative","댄스":"Dance","덕질":"Fandom activities","데스크톱":"Desktop computer","독서 의자":"Reading chair","독서등":"Reading lamp","돌격소총":"Assault rifle","동행 안내":"Companion guidance"
});
Object.assign(UI_TEXT.ja,{
  "✉ 연락":"✉ 連絡","높은 자리에 올라 주변을 내려다보며 귀를 움직이고 있어요.":"高い場所から周囲を見下ろし、耳を動かしています。","눈에 띄게 아름다움":"ひときわ美しい","눈에 띄지 않음":"目立たない","다관절 전자의수":"多関節電子義手","다큐멘터리":"ドキュメンタリー","단검":"短剣","단궁":"短弓","단체":"団体","달콤함":"甘さ","대검":"大剣","대기":"待機","대표":"代表","댄스":"ダンス","덕질":"推し活","데스크톱":"デスクトップPC","독서 의자":"読書椅子","독서등":"読書灯","돌격소총":"アサルトライフル","동행 안내":"同行案内"
});
Object.assign(UI_TEXT.en,{
  "관찰 캐릭터 바꾸기":"Switch observed character","관찰 캐릭터 선택":"Choose a character to observe","캐릭터와 관계 메뉴":"Character and relationship menu","일정과 설정 메뉴":"Schedule and settings menu","주요 메뉴":"Main menu","생활 중":"Living their day",
  "라이브":"Live","라테":"Latte","러닝머신":"Treadmill","럭셔리":"Luxury","레더":"Leather","레이싱":"Racing","레이피어":"Rapier","레코드 수집":"Collecting records","레코드 플레이어":"Record player","로맨스":"Romance","롱소드":"Longsword","리듬":"Rhythm","리볼버":"Revolver","리뷰":"Reviews","립 중심":"Lip-focused","마검":"Magic sword","마도서":"Grimoire"
});
Object.assign(UI_TEXT.ja,{
  "관찰 캐릭터 바꾸기":"観察するキャラクターを切り替える","관찰 캐릭터 선택":"観察するキャラクターを選ぶ","캐릭터와 관계 메뉴":"キャラクターと関係メニュー","일정과 설정 메뉴":"予定と設定メニュー","주요 메뉴":"メインメニュー","생활 중":"生活中",
  "라이브":"ライブ","라테":"ラテ","러닝머신":"ランニングマシン","럭셔리":"ラグジュアリー","레더":"レザー","레이싱":"レース","레이피어":"レイピア","레코드 수집":"レコード収集","레코드 플레이어":"レコードプレーヤー","로맨스":"ロマンス","롱소드":"ロングソード","리듬":"リズム","리볼버":"リボルバー","리뷰":"レビュー","립 중심":"リップ中心","마검":"魔剣","마도서":"魔導書"
});
Object.assign(UI_TEXT.en,{
  "기타 · 없음 (숙박하지 않음)":"Other · None (does not stay overnight)","마법봉":"Magic wand","만성 통증":"Chronic pain","만화":"Comics","만화 보기":"Reading comics","말차 라테":"Matcha latte","맛집 탐방":"Restaurant hopping","매력적임":"Attractive","매우 소박함":"Very plain","매우 아름답거나 잘생김":"Very beautiful or handsome","매우 추함":"Very unattractive","매우 현실적":"Very realistic","매운 음식":"Spicy food","매운맛":"Spiciness","매트":"Mat","맹·시각장애":"Blindness or visual impairment","머스크":"Musk","먹방":"Mukbang","면 요리 선호":"Prefers noodle dishes","모던":"Modern","모바일 게임":"Mobile games","모험":"Adventure"
});
Object.assign(UI_TEXT.ja,{
  "기타 · 없음 (숙박하지 않음)":"その他・なし（宿泊しない）","마법봉":"魔法の杖","만성 통증":"慢性疼痛","만화":"漫画","만화 보기":"漫画を読む","말차 라테":"抹茶ラテ","맛집 탐방":"グルメ巡り","매력적임":"魅力的","매우 소박함":"とても素朴","매우 아름답거나 잘생김":"とても美しい・ハンサム","매우 추함":"非常に不美形","매우 현실적":"非常に現実的","매운 음식":"辛い料理","매운맛":"辛さ","매트":"マット","맹·시각장애":"盲・視覚障害","머스크":"ムスク","먹방":"モッパン","면 요리 선호":"麺料理を好む","모던":"モダン","모바일 게임":"モバイルゲーム","모험":"冒険"
});
Object.assign(UI_TEXT.en,{
  "물그릇에서 가볍게 물놀이를 한 뒤 날개를 털어 물기를 털고 있어요.":"After splashing lightly in the water bowl, they shake their wings dry.","미관용 의수":"Cosmetic prosthetic arm","미관용 의족":"Cosmetic prosthetic leg","미니멀":"Minimal","미래적":"Futuristic","미리 정리함":"Plans and organizes ahead","미술 도구":"Art supplies","미스터리":"Mystery","밀크티":"Milk tea","바닐라 라테":"Vanilla latte","바디 제품":"Body care products","바디파워 의수":"Body-powered prosthetic arm","바디파워 손형 의수":"Body-powered hand prosthesis","바디파워 갈고리형 의수":"Body-powered hook prosthesis","바깥 일정을 마치고 집으로 돌아왔어요.":"They finished their plans outside and came home.","바닥의 작은 장애물을 피해 천천히 움직이고 있어요.":"They move slowly around small obstacles on the floor.","믿는 사람 가까이에 머물며 조용히 주변을 살피고 있어요.":"They stay near someone they trust and quietly watch their surroundings.","미리보기에서 직접 끌거나 크기 조절 손잡이를 사용하세요.":"Drag directly in the preview or use the resize handle.","매우 편안함":"Very comfortable","매우 불편함":"Very uncomfortable"
});
Object.assign(UI_TEXT.ja,{
  "물그릇에서 가볍게 물놀이를 한 뒤 날개를 털어 물기를 털고 있어요.":"水入れで軽く水浴びをした後、翼を羽ばたかせて水気を払っています。","미관용 의수":"装飾用義手","미관용 의족":"装飾用義足","미니멀":"ミニマル","미래적":"未来的","미리 정리함":"前もって整理する","미술 도구":"画材","미스터리":"ミステリー","밀크티":"ミルクティー","바닐라 라테":"バニララテ","바디 제품":"ボディケア用品","바디파워 의수":"体動式義手","바디파워 손형 의수":"体動式ハンド型義手","바디파워 갈고리형 의수":"体動式フック型義手","바깥 일정을 마치고 집으로 돌아왔어요.":"外での予定を終えて家に戻りました。","바닥의 작은 장애물을 피해 천천히 움직이고 있어요.":"床の小さな障害物を避けながらゆっくり動いています。","믿는 사람 가까이에 머물며 조용히 주변을 살피고 있어요.":"信頼する人のそばにいて、静かに周囲を見ています。","미리보기에서 직접 끌거나 크기 조절 손잡이를 사용하세요.":"プレビュー上で直接ドラッグするか、サイズ調整ハンドルを使ってください。","매우 편안함":"とても快適","매우 불편함":"とても不快"
});
Object.assign(UI_TEXT.en,{
  "LD의 회색 영역은 실제 홈 화면의 상단 바 아래부터 화면 맨 아래까지와 같은 비율입니다. 영역 안에서 직접 끌고 모서리 손잡이로 크기를 조절하세요.":"The gray LD area matches the real home screen from below the top bar to the bottom edge. Drag the LD inside it and use the corner handle to resize it.",
  "미리보기 전체가 실제 412×917 홈 화면과 같은 비율입니다. 상단바 아래부터 화면의 절대적인 맨 아래까지 보면서 전신을 직접 배치하세요.":"The entire preview uses the real 412×917 home-screen ratio. Position the full body while viewing everything from below the top bar to the absolute bottom edge.",
  "실제 LD 배치 영역":"Actual LD placement area","실제 홈 화면 비율 · 흰 점선 아래부터 화면 최하단까지가 LD 좌표계입니다.":"Actual home-screen ratio · The LD coordinate space runs from below the white dashed line to the bottom edge.",
  "행동 아이콘 위치 조정":"Adjust action icon position",
  "1인과 2인 장면은 저장한 Y 위치와 크기를 그대로 사용하며, 2인일 때는 X 위치만 좌우로 나뉩니다.":"Solo and two-character scenes keep the saved Y position and size. With two characters, only the X positions split left and right.",
  "LD 화면에 꽉 차게":"Fill LD stage","LD 배치 영역":"LD placement area","LD를 전체 배치 영역 높이에 맞췄습니다.":"The LD now fills the placement area height."
});
Object.assign(UI_TEXT.ja,{
  "LD의 회색 영역은 실제 홈 화면의 상단 바 아래부터 화면 맨 아래까지와 같은 비율입니다. 영역 안에서 직접 끌고 모서리 손잡이로 크기를 조절하세요.":"LDの灰色の範囲は、実際のホーム画面で上部バーの下から画面最下部までの比率と同じです。範囲内でLDをドラッグし、角のハンドルで大きさを調整してください。",
  "미리보기 전체가 실제 412×917 홈 화면과 같은 비율입니다. 상단바 아래부터 화면의 절대적인 맨 아래까지 보면서 전신을 직접 배치하세요.":"プレビュー全体は実際の412×917ホーム画面と同じ比率です。上部バーの下から画面の最下端までを見ながら全身を配置できます。",
  "실제 LD 배치 영역":"実際のLD配置範囲","실제 홈 화면 비율 · 흰 점선 아래부터 화면 최하단까지가 LD 좌표계입니다.":"実際のホーム画面比率・白い点線の下から画面最下部までがLD座標範囲です。",
  "행동 아이콘 위치 조정":"アクションアイコンの位置を調整",
  "1인과 2인 장면은 저장한 Y 위치와 크기를 그대로 사용하며, 2인일 때는 X 위치만 좌우로 나뉩니다.":"1人・2人のシーンとも保存したY位置と大きさを維持し、2人のときだけX位置が左右に分かれます。",
  "LD 화면에 꽉 차게":"LDを画面いっぱいにする","LD 배치 영역":"LD配置範囲","LD를 전체 배치 영역 높이에 맞췄습니다.":"LDを配置範囲の高さに合わせました。"
});
Object.assign(UI_TEXT.en,{
  "뽀뽀하는 중":"Kissing","포옹하는 중":"Hugging","함께 식사하는 중":"Eating together","대화하는 중":"Talking","함께 노는 중":"Playing together","함께 시간을 보내는 중":"Spending time together"
});
Object.assign(UI_TEXT.ja,{
  "뽀뽀하는 중":"キスしているところ","포옹하는 중":"抱きしめているところ","함께 식사하는 중":"一緒に食事中","대화하는 중":"会話中","함께 노는 중":"一緒に遊んでいるところ","함께 시간을 보내는 중":"一緒に過ごしているところ"
});
const BUILDING_REPUTATION_OPTIONS=["지정 안 함","매우 좋은 평판","좋은 평판","무난함","호불호가 갈림","나쁜 평판","매우 나쁜 평판"];
const BUILDING_FAME_OPTIONS=["거의 알려지지 않음","동네 안에서 알려짐","마을 전체에 알려짐","다른 마을에도 알려짐","전국적으로 알려짐"];
const BUILDING_ATMOSPHERE_OPTIONS=["지정 안 함","아늑하고 편안함","활기차고 북적임","조용하고 차분함","세련되고 고급스러움","오래되고 정겨움","어둡고 음침함","독특하고 신비로움"];
function townPlaceEditor(p,items,audiences,selected){
  const stockCount=(p.stock||[]).length,audienceCount=(p.audiences||[]).length;
  const selectionLabel=count=>count?`${count}${t("개 선택됨","개 선택됨")}`:t("정하지 않음","정하지 않음");
  return `<details class="${selected?"mobile-selected":""}" ${selected?"open":""}><summary><b>${esc(p.emoji)} ${esc(p.name)}</b></summary><div class="town-building-editor-card"><label class="town-building-name">${t("건물 이름","건물 이름")}<input data-place-field="name" data-place-id="${p.id}" value="${esc(p.name)}"></label><div class="town-building-grid"><label>${t("건물 유형","건물 유형")}<select data-place-field="type" data-place-id="${p.id}">${placeTypeOptions(p)}</select></label><label>${t("가격대","가격대")}<select data-place-field="priceRange" data-place-id="${p.id}">${["저렴","보통","고급","명품"].map(x=>`<option ${p.priceRange===x?"selected":""}>${t(x,x)}</option>`).join("")}</select></label><label>${t("세부 유형","세부 유형")}<select data-place-field="subtype" data-place-id="${p.id}">${placeSubtypeOptions(p)}</select></label><span aria-hidden="true"></span><label class="town-building-action">${t("건물 모양","건물 모양")}<button type="button" data-building-shape-open="${p.id}">${t("건물 모양 선택","건물 모양 선택")}</button></label><label class="town-building-action">${t("내부 사진","내부 사진")}<span><button type="button" data-place-interior-image="${p.id}">${t("내부 사진 업로드","내부 사진 업로드")}</button>${p.interiorImage?`<button type="button" data-clear-place-interior-image="${p.id}">${t("지우기","지우기")}</button>`:""}</span></label><label>${t("건물 평판","건물 평판")}<select data-place-field="reputation" data-place-id="${p.id}">${BUILDING_REPUTATION_OPTIONS.map(value=>`<option ${value===(p.reputation||"지정 안 함")?"selected":""}>${t(value,value)}</option>`).join("")}</select></label><label>${t("건물 분위기","건물 분위기")}<select data-place-field="atmosphere" data-place-id="${p.id}">${BUILDING_ATMOSPHERE_OPTIONS.map(value=>`<option ${value===(p.atmosphere||"지정 안 함")?"selected":""}>${t(value,value)}</option>`).join("")}</select></label><section class="town-audience-field"><h4>${t("주요 이용층","주요 이용층")}</h4><details><summary>${selectionLabel(audienceCount)}</summary><div class="stock-picker">${audiences.map(x=>`<button type="button" data-place-audience="${p.id}" data-value="${x}" class="${(p.audiences||[]).includes(x)?"on":""}">${t(x,x)}</button>`).join("")}</div></details></section><section class="town-stock-field"><h4>${t("판매 목록","판매 목록")}</h4><details><summary>${selectionLabel(stockCount)}</summary><div class="stock-list stock-picker">${items.map(item=>`<button type="button" data-place-stock="${p.id}" data-item-id="${item.id}" class="${(p.stock||[]).includes(item.id)?"on":""}">${CATALOG_LABELS[item.kind]} · ${esc(item.name)}</button>`).join("")}</div></details></section></div>${buildingLightingControls(p)}<details class="town-building-advanced"><summary>${t("추가 설정","추가 설정")}</summary><div><label>${t("마을 속 건물 크기","마을 속 건물 크기")}<input type="range" min=".45" max="1.5" step=".05" data-place-field="imageScale" data-place-id="${p.id}" value="${p.imageScale||1}"></label><label>${t("매운맛 정도","매운맛 정도")}<select data-place-field="spicy" data-place-id="${p.id}">${levelOptions(SPICE_LEVELS,p.spicy||0)}</select></label><label>${t("단맛 정도","단맛 정도")}<select data-place-field="sweet" data-place-id="${p.id}">${levelOptions(SWEET_LEVELS,p.sweet||0)}</select></label></div></details><button type="button" class="danger town-building-delete" data-delete-place="${p.id}">${t("이 건물 삭제","이 건물 삭제")}</button></div></details>`;
}
const HOME_BUILDING_SUBTYPES=["단독주택","아파트","빌라","연립주택","오피스텔","타운하우스","농가","저택","성","궁전","기숙사","사택","공동주택","이동식 주택","기타"];
const HOME_EXTERIOR_STYLES=["설정하지 않음","현대적","미니멀","모던","유럽풍","클래식","빈티지","한옥풍","일본식","지중해풍","전원주택풍","고딕","미래적","기타"];
const HOME_BEAUTY_LEVELS=["매우 소박함","소박함","평범함","보기 좋음","아름다움","눈에 띄게 아름다움"];
function townHomeEditor(home,selected){
  const subtype=home.buildingSubtype||"단독주택";
  return `<details class="town-home-building ${selected?"mobile-selected":""}" ${selected?"open":""}><summary><b>🏠 ${esc(home.name)}</b></summary><div class="town-building-editor-card"><label class="town-building-name">${t("건물 이름","건물 이름")}<input data-home-name data-home-id="${home.id}" value="${esc(home.name)}"></label><div class="town-building-grid"><label>${t("건물 유형","건물 유형")}<select aria-label="${esc(t("건물 유형","건물 유형"))}"><option selected>${t("집","집")}</option></select></label><label>${t("마을","마을")}<select data-home-field="townId" data-home-id="${home.id}">${state.towns.map(town=>`<option value="${town.id}" ${town.id===home.townId?"selected":""}>${esc(town.name)}</option>`).join("")}</select></label><label>${t("세부 유형","세부 유형")}<select data-home-field="buildingSubtype" data-home-id="${home.id}">${HOME_BUILDING_SUBTYPES.map(value=>`<option ${value===subtype?"selected":""}>${t(value,value)}</option>`).join("")}</select></label><label>${t("집 외관 스타일","집 외관 스타일")}<select data-home-field="exteriorStyle" data-home-id="${home.id}">${HOME_EXTERIOR_STYLES.map(value=>`<option ${value===(home.exteriorStyle||"설정하지 않음")?"selected":""}>${t(value,value)}</option>`).join("")}</select></label><label class="town-building-action">${t("건물 모양","건물 모양")}<button type="button" data-home-building-shape="${home.id}">${home.exteriorImage||home.iconPreset&&home.iconPreset!=="drawer-home"?t("건물 모양 변경","건물 모양 변경"):t("건물 모양 선택","건물 모양 선택")}</button></label><label>${t("마을 속 건물 크기","마을 속 건물 크기")}<input type="range" min=".7" max="1.7" step=".05" data-home-field="mapScale" data-home-id="${home.id}" value="${Number(home.mapScale)||1.08}"></label><label>${t("건물 평판","건물 평판")}<select data-home-field="reputation" data-home-id="${home.id}">${BUILDING_REPUTATION_OPTIONS.map(value=>`<option ${value===(home.reputation||"지정 안 함")?"selected":""}>${t(value,value)}</option>`).join("")}</select></label><label>${t("건물 분위기","건물 분위기")}<select data-home-field="atmosphere" data-home-id="${home.id}">${BUILDING_ATMOSPHERE_OPTIONS.map(value=>`<option ${value===(home.atmosphere||"지정 안 함")?"selected":""}>${t(value,value)}</option>`).join("")}</select></label><label class="town-home-beauty">${t("집의 아름다운 정도","집의 아름다운 정도")}<select data-home-field="beautyLevel" data-home-id="${home.id}">${HOME_BEAUTY_LEVELS.map(value=>`<option ${value===(home.beautyLevel||"평범함")?"selected":""}>${t(value,value)}</option>`).join("")}</select></label></div><small>${t("구성원과 집 내부 사진은 집 화면에서 설정해요.","구성원과 집 내부 사진은 집 화면에서 설정해요.")}</small></div></details>`;
}
function townBuildingEntries(){
  const towns=(state.towns||[]).map(town=>town.id===state.activeTownId?state.world:town);
  const places=towns.flatMap(town=>(town.places||[]).map(place=>({kind:"place",id:place.id,townId:town.id,townName:town.name,name:place.name,type:place.type||"기타",art:buildingExteriorSource(place)})));
  const homes=Object.values(state.homes||{}).filter(Boolean).map(home=>({kind:"home",id:home.id,townId:home.townId||"",townName:towns.find(town=>town.id===home.townId)?.name||t("마을 미지정","마을 미지정"),name:home.name,type:"집",art:homeExteriorSource(home)}));
  return [...places,...homes].sort((a,b)=>a.townName.localeCompare(b.townName,"ko")||a.name.localeCompare(b.name,"ko"));
}
function townBuildingBrowser(character){
  const entries=townBuildingEntries(),types=["집","사무실","음식점","카페","병원","공연장","옷가게","학교","공원","도서관","쇼핑몰","숙박","관공서","기타"];
  const pinnedFilter=(kind,items)=>`<nav class="town-building-${kind}-filters" aria-label="${esc(t(kind==="town"?"마을 선택":"건물 유형",kind==="town"?"마을 선택":"건물 유형"))}"><button type="button" class="on town-building-filter-all" data-building-${kind}-filter="${kind==="town"?"all":"전체"}">${t("전체","전체")}</button><div class="town-building-filter-scroll">${items}</div></nav>`;
  const townFilters=(state.towns||[]).map(town=>`<button type="button" data-building-town-filter="${town.id}">${esc(town.name)}</button>`).join("");
  const typeFilters=types.map(type=>`<button type="button" data-building-type-filter="${esc(type)}">${t(type,type)}</button>`).join("");
  return `<aside class="town-building-screen town-building-browser-screen" aria-label="${esc(t("건물 정보","건물 정보"))}"><div class="town-building-screen-head"><button type="button" class="town-building-screen-back" data-mobile-town-close aria-label="${esc(t("마을로 돌아가기","마을로 돌아가기"))}"><img src="${esc(homeUiAsset(character||active(),"back.png"))}" alt=""></button><label class="town-building-search"><span class="sr-only">${t("건물 검색","건물 검색")}</span><input type="search" data-building-search placeholder="${esc(t("검색","검색"))}"></label></div>${pinnedFilter("town",townFilters)}${pinnedFilter("type",typeFilters)}<div class="town-building-paper"><div class="town-building-catalog-head"><span>${t("총","총")} <b data-building-count>${entries.length}</b></span><button type="button" data-building-recovery>${t("건물 복구","건물 복구")}</button></div><div class="town-building-card-grid" aria-live="polite">${entries.map(entry=>`<button type="button" class="town-building-browser-card" data-building-browser-card data-building-browser-open="${entry.kind==="home"?`home:${entry.id}`:entry.id}" data-building-browser-town="${entry.townId}" data-building-browser-type="${esc(entry.type)}" data-building-browser-name="${esc(entry.name)}"><span><img src="${esc(entry.art)}" alt=""></span><b>${esc(entry.name)}</b><small>${esc(entry.townName)} · ${esc(t(entry.type,entry.type))}</small></button>`).join("")}<button type="button" class="town-building-add" data-add-place aria-label="${esc(t("건물 추가","건물 추가"))}">＋<small>${t("건물 추가","건물 추가")}</small></button><button type="button" class="town-building-add town-home-add" data-add-town-home aria-label="${esc(t("집 추가","집 추가"))}">＋<small>${t("집 추가","집 추가")}</small></button></div></div></aside>`;
}
function townBuildingDetailScreen(character,place,home,items,audiences){
  const building=place||home,name=building?.name||t("건물 정보","건물 정보"),exterior=place?buildingExteriorSource(place):homeExteriorSource(home);
  const interior=place?.interiorImage||place?.image||home?.image||"";
  const homeLighting=home?`<fieldset class="building-lighting-settings home-building-lighting"><legend>${t("건물 불빛","건물 불빛")}</legend><label>${t("조명 방식","조명 방식")}<select data-home-field="lightingMode" data-home-id="${home.id}">${[["schedule","설정한 시간에 켜기"],["always","항상 켜기"],["off","항상 끄기"]].map(([value,label])=>`<option value="${value}" ${normalizeBuildingLighting(home).lightingMode===value?"selected":""}>${t(label,label)}</option>`).join("")}</select></label><div><label>${t("켜지는 시간","켜지는 시간")}<input type="time" data-home-field="lightOnTime" data-home-id="${home.id}" value="${normalizeBuildingLighting(home).lightOnTime}"></label><label>${t("꺼지는 시간","꺼지는 시간")}<input type="time" data-home-field="lightOffTime" data-home-id="${home.id}" value="${normalizeBuildingLighting(home).lightOffTime}"></label></div></fieldset>`:"";
  const editor=place?townPlaceEditor(place,items,audiences,true):home?`${townHomeEditor(home,true)}${homeLighting}<button type="button" class="danger town-building-delete" data-delete-home="${esc(home.id)}">${t("이 건물 삭제","이 건물 삭제")}</button>`:"";
  return `<aside class="town-building-screen town-building-detail-screen" aria-label="${esc(name)}"><div class="town-building-detail-head"><button type="button" class="town-building-screen-back" data-building-browser-back aria-label="${esc(t("건물 목록으로 돌아가기","건물 목록으로 돌아가기"))}"><img src="${esc(homeUiAsset(character||active(),"back.png"))}" alt=""></button><b>${esc(name)}</b></div><div class="town-building-detail-scroll"><section class="town-building-hero">${interior?`<img class="town-building-interior" src="${esc(interior)}" alt="${esc(name)} ${esc(t(home?"집 사진":"내부 사진",home?"집 사진":"내부 사진"))}">`:`<div class="town-building-interior town-building-interior-empty"><span>${esc(place?.emoji||"🏠")}</span><small>${t(home?"집 일러스트나 가족사진을 넣어 주세요.":"내부 사진을 등록해 주세요",home?"집 일러스트나 가족사진을 넣어 주세요.":"내부 사진을 등록해 주세요")}</small></div>`}<img class="town-building-exterior" src="${esc(exterior)}" alt="${esc(name)} ${esc(t("건물 모양","건물 모양"))}"></section><div class="place-editor town-building-detail-form">${editor}<div class="editor-save-actions"><button type="button" class="primary" data-editor-save>${t("저장","저장")}</button></div></div></div></aside>`;
}
const TOWN_DECORATION_CHOICES=[
  ["bench","🪑","벤치","휴식"],["lamp","💡","가로등","조명"],["fountain","⛲","분수","조형물"],["tree","🌳","나무","자연"],
  ["flowers","🌸","꽃밭","자연"],["statue","🗿","조각상","조형물"],["sign","🪧","안내판","시설"],["vending","🥤","자판기","시설"]
];
function townPlacementToolbar(){
  if(!["buildings","decorations"].includes(mobileTownMode)||!mobileTownPlacement)return "";
  const {kind,id}=mobileTownPlacement,item=kind==="place"?state.world.places.find(entry=>entry.id===id):kind==="home"?state.homes[id]:(state.world.decorations||[]).find(entry=>entry.id===id);
  const valid=mobileTownMode==="decorations"?["place","home","decoration"].includes(kind):["place","home"].includes(kind);
  if(!item||!valid)return "";
  return `<nav class="town-placement-toolbar" aria-label="${esc(t("배치 조절","배치 조절"))}"><b>${esc(item.name||"선택 항목")}</b><div><button type="button" data-town-placement-command="undo">↶<small>${t("실행 취소","실행 취소")}</small></button><button type="button" data-town-placement-command="redo">↷<small>${t("다시 실행","다시 실행")}</small></button><button type="button" data-town-placement-command="smaller">−<small>${t("작게","작게")}</small></button><button type="button" data-town-placement-command="larger">＋<small>${t("크게","크게")}</small></button><button type="button" data-town-placement-command="flip">↔<small>${t("좌우반전","좌우반전")}</small></button><button type="button" data-town-placement-command="back">↓<small>${t("뒤로","뒤로")}</small></button><button type="button" data-town-placement-command="front">↑<small>${t("앞으로","앞으로")}</small></button><button type="button" data-town-placement-command="delete" class="danger">${t("삭제","삭제")}</button><button type="button" data-town-placement-command="done" class="primary">${t("완료","완료")}</button></div></nav>`;
}
Object.assign(I18N.en,{"열람할 마을":"Village to view","현재 마을 삭제":"Delete this village","물품 추가":"Add item","마을 삭제 시 주민과 집은 남은 마을로 옮겨져요. 마지막 마을은 삭제할 수 없어요.":"Residents and homes move to a remaining village. The last village cannot be deleted."});
Object.assign(I18N.ja,{"열람할 마을":"閲覧する村","현재 마을 삭제":"この村を削除","물품 추가":"品物を追加","마을 삭제 시 주민과 집은 남은 마을로 옮겨져요. 마지막 마을은 삭제할 수 없어요.":"住民と家は残った村へ移ります。最後の村は削除できません。"});
Object.assign(UI_TEXT.en,{"과묵한 직설체":"Terse and direct","냉정한 격식체":"Cool and formal","이 마을의 건물과 배치를 삭제할까요? 주민과 집은 남은 마을로 옮겨집니다.":"Delete this village's buildings and layout? Residents and homes will move to a remaining village.","세계관 사전":"World dictionary","아이콘을 누르면 세부 정보와 편집 항목이 열려요.":"Tap an icon to view or edit an item."});
Object.assign(UI_TEXT.ja,{"과묵한 직설체":"寡黙で率直","냉정한 격식체":"冷静で格式的","이 마을의 건물과 배치를 삭제할까요? 주민과 집은 남은 마을로 옮겨집니다.":"この村の建物と配置を削除しますか？住民と家は残った村へ移ります。","세계관 사전":"世界観辞典","아이콘을 누르면 세부 정보와 편집 항목이 열려요.":"アイコンを押すと詳細の閲覧・編集ができます。"});
Object.assign(I18N.en,{"집 사진":"Home picture","집 사진 등록":"Add a home picture","집 일러스트나 가족사진을 넣어 주세요.":"Add an illustration of the home or a family picture."});
Object.assign(I18N.ja,{"집 사진":"家の写真","집 사진 등록":"家の写真を登録","집 일러스트나 가족사진을 넣어 주세요.":"家のイラストや家族写真を入れてください。"});
Object.assign(UI_TEXT.en,{"가격":"Price","가공식품":"Processed foods","과일":"Fruit","곡물":"Grains","구두":"Dress shoes","기술":"Skills","기타 식재료":"Other ingredients"});
Object.assign(UI_TEXT.ja,{"가격":"価格","가공식품":"加工食品","과일":"果物","곡물":"穀物","구두":"革靴","기술":"技術","기타 식재료":"その他の食材"});
Object.assign(I18N.en,{"옷장":"Wardrobe","옷 추가":"Add clothing","첫 옷 추가하기":"Add the first outfit","의상 취향":"Clothing preferences","마을 인지도":"Town recognition","건물 인지도":"Building recognition","인지도는 얼마나 널리 알려졌는지, 평판은 좋고 나쁜 평가를 뜻해요.":"Recognition describes how widely a place is known; reputation describes whether people view it positively or negatively.","평판 정보 없음":"No reputation information","매우 좋은 평판":"Excellent reputation","좋은 평판":"Good reputation","대체로 무난한 평판":"Mostly neutral reputation","호불호가 갈림":"Mixed reputation","나쁜 평판":"Bad reputation","매우 나쁜 평판":"Very bad reputation","거의 알려지지 않음":"Almost unknown","동네 안에서 알려짐":"Known locally","마을 전체에 알려짐":"Known across town","다른 마을에도 알려짐":"Known in other towns","전국적으로 알려짐":"Known nationwide","상황·기분·온도·격식에 따라 홈의 아이콘과 LD를 자동으로 골라요.":"Home icons and LD art are selected automatically based on situation, mood, temperature, and formality."});
Object.assign(I18N.ja,{"옷장":"クローゼット","옷 추가":"服を追加","첫 옷 추가하기":"最初の服を追加","의상 취향":"服装の好み","마을 인지도":"村の知名度","건물 인지도":"建物の知名度","인지도는 얼마나 널리 알려졌는지, 평판은 좋고 나쁜 평가를 뜻해요.":"知名度はどれほど広く知られているか、評判は好意的・否定的な評価を表します。","평판 정보 없음":"評判情報なし","매우 좋은 평판":"とても良い評判","좋은 평판":"良い評判","대체로 무난한 평판":"おおむね普通の評判","호불호가 갈림":"評価が分かれる","나쁜 평판":"悪い評判","매우 나쁜 평판":"とても悪い評判","거의 알려지지 않음":"ほとんど知られていない","동네 안에서 알려짐":"近所で知られている","마을 전체에 알려짐":"村全体で知られている","다른 마을에도 알려짐":"ほかの村にも知られている","전국적으로 알려짐":"全国的に知られている","상황·기분·온도·격식에 따라 홈의 아이콘과 LD를 자동으로 골라요.":"状況・気分・気温・格式に合わせてホームのアイコンとLDを自動選択します。"});
Object.assign(I18N.en,{"옷 등록·편집":"Add or edit clothing","상황·기분·온도·격식 정보를 바탕으로 홈의 아이콘과 LD가 자동으로 바뀝니다.":"The home icon and LD art change automatically based on situation, mood, temperature, and formality.","아이콘":"Icon","이미지 링크 또는 기기에서 선택":"Image link or choose from device","이름":"Name","분류":"Category","평범한 정도":"Ordinariness","따뜻함":"Warmth","격식 정도":"Formality","편안함":"Comfort","필수 유니폼":"Required uniform","입는 상황 · 중복 선택":"Situations · select multiple","기분 태그 · 중복 선택":"Mood tags · select multiple","색 · 중복 선택":"Colors · select multiple","재질 · 중복 선택":"Materials · select multiple","분위기 · 중복 선택":"Style · select multiple","옷 삭제":"Delete clothing","취소":"Cancel","저장":"Save","모든 상황":"All situations","모든 기분":"All moods","아침 준비":"Morning routine","욕실·목욕":"Bathing","출근복":"Workwear","데이트룩":"Date outfit","잠옷":"Sleepwear","집안일":"Housework","휴식":"Rest","들뜸":"Excited","기쁨":"Happy","평온함":"Calm","지루함":"Bored","긴장함":"Tense","화남":"Angry","슬픔":"Sad","피곤함":"Tired"});
Object.assign(I18N.ja,{"옷 등록·편집":"服の追加・編集","상황·기분·온도·격식 정보를 바탕으로 홈의 아이콘과 LD가 자동으로 바뀝니다.":"状況・気分・気温・格式に合わせてホームのアイコンとLDが自動で変わります。","아이콘":"アイコン","이미지 링크 또는 기기에서 선택":"画像リンクまたは端末から選択","이름":"名前","분류":"分類","평범한 정도":"普段らしさ","따뜻함":"暖かさ","격식 정도":"格式","편안함":"快適さ","필수 유니폼":"必須ユニフォーム","입는 상황 · 중복 선택":"着用状況・複数選択","기분 태그 · 중복 선택":"気分タグ・複数選択","색 · 중복 선택":"色・複数選択","재질 · 중복 선택":"素材・複数選択","분위기 · 중복 선택":"雰囲気・複数選択","옷 삭제":"服を削除","취소":"キャンセル","저장":"保存","모든 상황":"すべての状況","모든 기분":"すべての気分","아침 준비":"朝の支度","욕실·목욕":"入浴","출근복":"仕事着","데이트룩":"デート服","잠옷":"寝間着","집안일":"家事","휴식":"休息","들뜸":"浮き立つ","기쁨":"喜び","평온함":"穏やか","지루함":"退屈","긴장함":"緊張","화남":"怒り","슬픔":"悲しみ","피곤함":"疲れ"});
Object.assign(UI_TEXT.en,{"색 선택하기":"Choose colors","재질 선택하기":"Choose materials","분위기 중복 선택하기":"Choose styles","선택하지 않음":"Nothing selected","여러 개 선택할 수 있어요.":"You can select more than one.","선택 완료":"Done","만족함":"Satisfied","기분 좋음":"Feeling good","유혹적임":"Seductive","이 일정의 드레스코드 사용":"Use a dress code for this schedule","허용 색":"Allowed colors","권장 재질":"Preferred materials"});
Object.assign(UI_TEXT.ja,{"색 선택하기":"色を選択","재질 선택하기":"素材を選択","분위기 중복 선택하기":"雰囲気を選択","선택하지 않음":"未選択","여러 개 선택할 수 있어요.":"複数選択できます。","선택 완료":"選択完了","만족함":"満足","기분 좋음":"ご機嫌","유혹적임":"誘惑的","이 일정의 드레스코드 사용":"この予定でドレスコードを使用","허용 색":"使用可能な色","권장 재질":"推奨素材"});
Object.assign(UI_TEXT.en,{"유니폼으로 등록":"Register as uniform","건물이나 일정에서 ‘유니폼 착용 필수’를 켰을 때 선택 후보가 되는 옷이에요.":"This outfit becomes eligible when a building or schedule requires a uniform.","SD 아이콘 직접 배치":"Place SD icon directly","LD 사진 직접 배치":"Place LD art directly","그림을 끌어 옮기고, 두 손가락으로 크기와 각도를 조절해요.":"Drag the art to move it. Use two fingers to resize and rotate.","배치 초기화":"Reset placement","축소":"Zoom out","확대":"Zoom in","켜면 옷장에서 ‘유니폼으로 등록’한 옷만 자동 선택해요.":"When enabled, only wardrobe items registered as uniforms are auto-selected."});
Object.assign(UI_TEXT.ja,{"유니폼으로 등록":"制服として登録","건물이나 일정에서 ‘유니폼 착용 필수’를 켰을 때 선택 후보가 되는 옷이에요.":"建物や予定で制服着用を必須にした時の候補になる服です。","SD 아이콘 직접 배치":"SDアイコンを直接配置","LD 사진 직접 배치":"LD画像を直接配置","그림을 끌어 옮기고, 두 손가락으로 크기와 각도를 조절해요.":"画像をドラッグして移動し、2本指で大きさと角度を調整します。","배치 초기화":"配置をリセット","축소":"縮小","확대":"拡大","켜면 옷장에서 ‘유니폼으로 등록’한 옷만 자동 선택해요.":"有効にすると、クローゼットで制服として登録した服だけを自動選択します。"});
function townInformationScreen(character){
  const optionList=(values,current)=>values.map(value=>`<option value="${esc(value)}" ${value===current?"selected":""}>${t(value,value)}</option>`).join("");
  const selectField=(label,dataName,values,current)=>`<label><b>${t(label,label)}</b><select ${dataName}>${optionList(values,current)}</select></label>`;
  const subtypes=TOWN_TYPE_SUBTYPES[state.world.townType]||TOWN_TYPE_SUBTYPES[TOWN_TYPES[0]];
  const transportButtons=TOWN_TRANSPORTS.map(mode=>`<button type="button" data-world-transport="${esc(mode)}" class="${(state.world.transportModes||[]).includes(mode)?"on":""}" aria-pressed="${(state.world.transportModes||[]).includes(mode)}">${t(mode,mode)}</button>`).join("");
  return `<aside class="town-information-screen" aria-label="${esc(t("마을 정보 편집","마을 정보 편집"))}"><img class="town-information-backdrop" src="${esc(state.world.bg)}" alt="" aria-hidden="true">
    <header class="town-information-head"><button type="button" class="town-information-back" data-mobile-town-close aria-label="${esc(t("마을로 돌아가기","마을로 돌아가기"))}"><img src="${esc(homeUiAsset(character||active(),"back.png"))}" alt=""></button><b data-town-information-title>${esc(state.world.name)}</b></header>
    <div class="town-information-content">
      <section class="town-information-hero"><img src="${esc(state.world.bg)}" alt="${esc(t("숲과 연못 마을","숲과 연못 마을"))}"></section>
      <div class="town-information-form">
        <label><b>${t("열람할 마을","열람할 마을")}</b><select data-town-browse>${state.towns.map(town=>`<option value="${esc(town.id)}" ${town.id===state.activeTownId?"selected":""}>${esc(town.name)}</option>`).join("")}</select></label>
        <label class="town-information-name"><b>${t("마을 이름","마을 이름")}</b><input data-world-name maxlength="40" value="${esc(state.world.name)}"></label>
        <div class="town-information-grid">
          ${selectField("마을 유형","data-world-town-type",TOWN_TYPES,state.world.townType||TOWN_TYPES[0])}
          ${selectField("세부 유형","data-world-town-subtype",subtypes,state.world.townSubtype||subtypes[0])}
          ${selectField("마을 밀집도","data-world-density",["매우 한적함","한적함","여유로움","보통","붐빔","매우 붐빔"],state.world.density||"여유로움")}
          ${selectField("도시화 정도","data-world-urbanization",["외딴 정착지","한적한 시골","마을","소도시","중소 도시","대도시","초고밀도 도시"],state.world.urbanization||"소도시")}
          ${selectField("마을 평판","data-world-reputation",TOWN_REPUTATIONS,state.world.reputation||"평판 정보 없음")}
          ${selectField("마을 인지도","data-world-fame-level",TOWN_FAME_LEVELS,state.world.fameLevel||"거의 알려지지 않음")}
          ${selectField("마을 규모","data-world-size",["작은 정착지","작은 마을","보통 마을","큰 마을","광역 도시"],state.world.size||"보통 마을")}
          ${selectField("지형","data-world-terrain",TOWN_TERRAINS,state.world.terrain||"평야")}
          <label><b>${t("마을 시대","마을 시대")}</b><select data-world-era><option value="modern" ${state.world.era!=="medieval"?"selected":""}>${t("현대","현대")}</option><option value="medieval" ${state.world.era==="medieval"?"selected":""}>${t("중세","중세")}</option></select></label>
        </div>
        <fieldset class="town-transport-field"><legend>${t("교통편 · 여러 개 선택 가능","교통편 · 여러 개 선택 가능")}</legend><div>${transportButtons}</div><label><input type="checkbox" data-world-travel-allowed ${state.world.travelAllowed!==false?"checked":""}><span><b>${t("다른 마을과 이동 가능","다른 마을과 이동 가능")}</b><small>${t("끄면 이 마을을 오가는 일정과 자동 이동이 멈춰요.","끄면 이 마을을 오가는 일정과 자동 이동이 멈춰요.")}</small></span></label></fieldset>
        <p class="town-climate-dlc-note"><b>🔒 ${t("기후","기후")}</b><span>${t("기후 설정과 기후별 생활 로그는 기후 확장 DLC에서 제공할 예정이에요.","기후 설정과 기후별 생활 로그는 기후 확장 DLC에서 제공할 예정이에요.")}</span></p>
        <label class="town-information-description"><b>${t("마을 소개","마을 소개")}</b><textarea data-world-description rows="4" maxlength="600" placeholder="${esc(t("이 마을의 분위기와 특징을 적어 주세요.","이 마을의 분위기와 특징을 적어 주세요."))}">${esc(state.world.description||"")}</textarea></label>
        <button type="button" class="town-information-save" data-town-save>${t("저장","저장")}</button>
        <button type="button" class="danger" data-delete-town="${esc(state.activeTownId)}" ${state.towns.length<=1?"disabled":""}>${t("현재 마을 삭제","현재 마을 삭제")}</button>
        <small>${t("마을 삭제 시 주민과 집은 남은 마을로 옮겨져요. 마지막 마을은 삭제할 수 없어요.","마을 삭제 시 주민과 집은 남은 마을로 옮겨져요. 마지막 마을은 삭제할 수 없어요.")}</small>
      </div>
    </div>
  </aside>`;
}
function townMobile(){
  const items=catalogItems(),audiences=["아재 입맛","어린이 입맛","가족","연인·데이트","학생","고소득","오타쿠"];
  const selectedPlace=state.world.places.find(place=>place.id===mobileTownPanel);
  const selectedHome=mobileTownPanel.startsWith("home:")?state.homes[mobileTownPanel.slice(5)]:null;
  if(mobileTownPanel&&!["world","info","decorations","buildings"].includes(mobileTownPanel)&&!selectedPlace&&!selectedHome)mobileTownPanel="";
  const panelType=mobileTownPanel==="world"?"world":mobileTownPanel==="info"?"info":mobileTownPanel==="decorations"?"decorations":mobileTownPanel==="buildings"?"buildings":selectedPlace?"place":selectedHome?"home":"";
  const residentIds=state.order.filter(id=>{
    const character=state.characters[id];if(!character)return false;
    const homeIds=[character.homeId,...(character.residences||[]).map(residence=>residence.homeId)].filter(Boolean);
    return homeIds.some(homeId=>state.homes?.[homeId]?.townId===state.activeTownId)||(!homeIds.length&&character.townId===state.activeTownId);
  });
  const localIds=state.preventInterTownMovement?[...residentIds]:state.order.filter(id=>visibleTownId(state.characters[id])===state.activeTownId);
  const characterId=localIds.includes(state.activeId)?state.activeId:localIds[0];
  const character=state.characters[characterId];
  const desktopTabs=`<div class="town-tabs">${state.towns.map(town=>`<button data-town-select="${town.id}" class="${town.id===state.activeTownId?"on":""}">🏙️ ${esc(town.name)}</button>`).join("")}${mobileTownMode==="town"?`<button data-add-town>+ ${t("마을 추가","마을 추가")}</button>${state.towns.length>1?`<button class="danger" data-delete-town="${state.activeTownId}">${t("현재 마을 삭제","현재 마을 삭제")}</button>`:""}`:""}</div>`;
  const townHeader=`<header class="town-native-header"><button type="button" class="home-native-back town-native-back" data-tab="observe" aria-label="${esc(t("메인 화면으로 돌아가기","메인 화면으로 돌아가기"))}"><img src="${esc(homeUiAsset(character||active(),"back.png"))}" alt=""></button><button type="button" class="town-native-title" data-open-town-switcher aria-label="${esc(t("마을 이동","마을 이동"))}"><img src="${esc(homeUiAsset(character||active(),"town.png"))}" alt=""><span class="town-native-name">${esc(state.world.name)}</span></button><span class="town-native-status">${t("현재 {current}명 · 거주 {resident}명","현재 {current}명 · 거주 {resident}명").replace("{current}",localIds.length).replace("{resident}",residentIds.length)}</span><div class="town-native-menu" role="navigation" aria-label="${esc(t("마을 메뉴","마을 메뉴"))}"><button type="button" class="home-native-pill" data-mobile-town-layout-mode><span>${t("마을 정보","마을 정보")}</span></button><button type="button" class="home-native-pill" data-mobile-building-edit-mode><span>${t("건물 정보","건물 정보")}</span></button><button type="button" class="home-native-pill" data-mobile-town-decoration-mode><span>${mobileTownMode==="decorations"?t("편집완료","편집완료"):t("편집모드","편집모드")}</span></button></div></header>`;
  const townSwitcher=`<dialog class="town-switch-dialog" data-town-switch-dialog><form method="dialog"><header><span><small>TOWN SELECT</small><b>${t("마을 이동","마을 이동")}</b></span><button value="cancel" aria-label="${esc(t("닫기","닫기"))}">×</button></header><div>${state.towns.map(town=>`<button type="button" data-town-select="${town.id}" class="${town.id===state.activeTownId?"on":""}"><i aria-hidden="true"></i><span><b>${esc(town.name)}</b><small>${town.id===state.activeTownId?t("현재 마을","현재 마을"):t("이 마을로 이동","이 마을로 이동")}</small></span></button>`).join("")}<button type="button" class="town-switch-add" data-add-town data-add-town-switcher><i aria-hidden="true">＋</i><span><b>${t("새 마을 만들기","새 마을 만들기")}</b><small>${t("새로운 마을 슬롯을 추가해요","새로운 마을 슬롯을 추가해요")}</small></span></button></div></form></dialog>`;
  const categories=["전체",...[...new Set(TOWN_DECORATION_CHOICES.map(item=>item[3]))]];
  const decorationCatalog=`<section class="town-decoration-catalog"><div class="town-decoration-theme-row"><button type="button" class="town-decoration-collapse" data-toggle-decoration-catalog aria-expanded="true" aria-label="${esc(t("편집 목록 접기","편집 목록 접기"))}">⌄</button><button type="button" class="town-decoration-theme-button">${t("모든 테마 보기","모든 테마 보기")}</button></div><div class="town-decoration-catalog-body"><nav>${categories.map((category,index)=>`<button type="button" data-decoration-category="${category}" class="${index===0?"on":""}">${t(category,category)}</button>`).join("")}</nav><div class="town-decoration-results">${TOWN_DECORATION_CHOICES.map(([kind,icon,label,category])=>`<button type="button" data-add-town-decoration="${kind}" data-decoration-choice data-decoration-label="${esc(label)}" data-decoration-group="${esc(category)}"><span>${icon}</span><small>${t(label,label)}</small></button>`).join("")}</div></div></section>`;
  const townInfo=`<div class="town-info-card"><img class="town-info-art" src="${esc(state.world.bg)}" alt=""><dl><div><dt>${t("마을 유형","마을 유형")}</dt><dd>${t(state.world.townSubtype||state.world.townType,state.world.townSubtype||state.world.townType)}</dd></div><div><dt>${t("도시화 정도","도시화 정도")}</dt><dd>${t(state.world.urbanization||"소도시",state.world.urbanization||"소도시")}</dd></div><div><dt>${t("마을 평판","마을 평판")}</dt><dd>${t(state.world.reputation||"평판 정보 없음",state.world.reputation||"평판 정보 없음")}</dd></div><div><dt>${t("마을 인지도","마을 인지도")}</dt><dd>${t(state.world.fameLevel||"거의 알려지지 않음",state.world.fameLevel||"거의 알려지지 않음")}</dd></div><div><dt>${t("지형","지형")}</dt><dd>${t(state.world.terrain||"평야",state.world.terrain||"평야")}</dd></div><div><dt>${t("교통편","교통편")}</dt><dd>${(state.world.transportModes||[]).map(value=>t(value,value)).join(" · ")||t("없음","없음")}</dd></div><div><dt>${t("마을 시대","마을 시대")}</dt><dd>${state.world.era==="medieval"?t("중세","중세"):t("현대","현대")}</dd></div></dl>${state.world.description?`<p>${esc(state.world.description)}</p>`:""}</div>`;
  const generalEditor=panelType==="world"?townInformationScreen(character):panelType==="info"?townInfo:panelType==="buildings"?`<div class="town-general-editor town-building-start"><p>${t("건물을 눌러 설정하거나 격자 위에서 바로 옮길 수 있어요.","건물을 눌러 설정하거나 격자 위에서 바로 옮길 수 있어요.")}</p><button data-add-place>+ ${t("건물 추가","건물 추가")}</button></div>`:panelType==="decorations"?`<div class="town-general-editor town-decoration-editor">${decorationCatalog}</div>`:"";
  const placeEditors=mobileTownMode==="buildings"&&selectedPlace?townPlaceEditor(selectedPlace,items,audiences,true):mobileTownMode==="buildings"&&selectedHome?townHomeEditor(selectedHome,true):"";
  const selectedBuildingName=selectedPlace?.name||selectedHome?.name||t("건물 편집","건물 편집");
  const editorPanel=panelType==="world"?townInformationScreen(character):panelType==="buildings"?townBuildingBrowser(character):["place","home"].includes(panelType)?townBuildingDetailScreen(character,selectedPlace,selectedHome,items,audiences):panelType?`<aside class="panel form town-editor-panel"><div class="mobile-town-sheet-head"><span><small>${panelType==="info"?"TOWN INFO":"TOWN DECORATIONS"}</small><b>${panelType==="info"?esc(state.world.name):t("마을 장식","마을 장식")}</b></span><button type="button" data-mobile-town-close aria-label="${esc(t("편집 창 닫기","편집 창 닫기"))}">×</button></div>${generalEditor}</aside>`:"";
  return `<section class="mobile-town-shell ${mobileTownMode?`${mobileTownMode}-editing`:""} ${panelType?`sheet-open ${panelType}-panel`:""}" data-town-mode="${mobileTownMode}" data-town-id="${esc(state.activeTownId)}" style="${homeUiThemeStyle(character||active())}">${desktopTabs}${townHeader}${townSwitcher}<div class="town-edit"><div class="town-map-scroll"><div class="world town-environment" data-town-language="${state.uiLanguage||"ko"}">${townBackgroundMarkup(state.world.bg)}${state.world.places.map(placeCard).join("")}${townHomes().map(homeMapCard).join("")}${townDecorationsMarkup()}${state.world.places.map(peopleAtPlaceCard).join("")}${townHomes().map(peopleAtHomeCard).join("")}</div></div></div>${editorPanel}${townPlacementToolbar()}${buildingDetailDialogs()}</section>`;
}
Object.assign(UI_TEXT.en,{
  "마을 이동":"Switch town","현재 마을":"Current town","이 마을로 이동":"Go to this town","마을 추가":"Add town","새 마을 만들기":"Create a new town","새로운 마을 슬롯을 추가해요":"Add another town slot.","현재 마을 삭제":"Delete current town","마을 정보 편집":"Edit town information","마을 유형":"Town type","마을 밀집도":"Town density","도시화 정도":"Urbanization","마을 평판":"Town reputation","마을 규모":"Town size","마을 지형·기후":"Terrain · climate","마을 사진":"Town photo","마을 사진 바꾸기":"Change town photo","마을 소개":"Town description","이 마을의 분위기와 특징을 적어 주세요.":"Describe the atmosphere and defining features of this town.","장식 검색":"Search decorations","장식 유형":"Decoration categories","전체":"All","휴식":"Seating","조명":"Lighting","자연":"Nature","시설":"Facilities","조형물":"Sculptures","건물을 눌러 설정하거나 격자 위에서 바로 옮길 수 있어요.":"Tap a building to edit it, or drag it directly on the grid.",
  "생활 중심 마을":"Everyday-life town","주거 중심 마을":"Residential town","상업 중심 마을":"Commercial town","관광 마을":"Tourist town","산업 도시":"Industrial city","학원 도시":"Academic city","휴양 마을":"Resort town","매우 한적함":"Very secluded","한적함":"Secluded","여유로움":"Uncrowded","보통":"Moderate","붐빔":"Busy","매우 붐빔":"Very busy","작은 정착지":"Small settlement","작은 마을":"Small village","보통 마을":"Medium town","큰 마을":"Large town","광역 도시":"Metropolitan city","평야·온대":"Plains · temperate","해안·해양성":"Coastal · maritime","산지·서늘함":"Mountain · cool","분지·온난함":"Basin · mild","사막·건조":"Desert · dry","설원·한랭":"Snowfield · cold","열대·다우":"Tropical · rainy",
  "외딴 정착지":"Remote settlement","한적한 시골":"Quiet countryside","마을":"Village","소도시":"Small town","중소 도시":"Regional city","대도시":"Large city","초고밀도 도시":"High-density metropolis","알려지지 않음":"Unknown","조용하고 평화로움":"Quiet and peaceful","살기 좋음":"A good place to live","관광지로 유명함":"Known as a tourist destination","기회의 도시":"A city of opportunity","위험하다는 소문":"Rumored to be dangerous","폐쇄적인 곳":"Known to be insular","화려하고 번화함":"Vibrant and bustling","역사가 깊음":"Rich in history"
});
Object.assign(UI_TEXT.ja,{
  "마을 이동":"村を移動","현재 마을":"現在の村","이 마을로 이동":"この村へ移動","마을 추가":"村を追加","현재 마을 삭제":"現在の村を削除","마을 정보 편집":"村情報を編集","마을 유형":"村の種類","마을 밀집도":"村の密集度","도시화 정도":"都市化の程度","마을 평판":"村の評判","마을 규모":"村の規模","마을 지형·기후":"地形・気候","마을 사진":"村の写真","마을 사진 바꾸기":"村の写真を変更","마을 소개":"村の紹介","이 마을의 분위기와 특징을 적어 주세요.":"この村の雰囲気や特徴を書いてください。","장식 검색":"装飾を検索","장식 유형":"装飾カテゴリ","전체":"すべて","휴식":"休憩","조명":"照明","자연":"自然","시설":"設備","조형물":"造形物","건물을 눌러 설정하거나 격자 위에서 바로 옮길 수 있어요.":"建物をタップして設定するか、グリッド上でそのまま移動できます。",
  "생활 중심 마을":"暮らし中心の村","주거 중심 마을":"住宅中心の村","상업 중심 마을":"商業中心の村","관광 마을":"観光の村","산업 도시":"産業都市","학원 도시":"学園都市","휴양 마을":"保養の村","매우 한적함":"とても静か","한적함":"静か","여유로움":"ゆったり","보통":"普通","붐빔":"混雑","매우 붐빔":"とても混雑","작은 정착지":"小さな集落","작은 마을":"小さな村","보통 마을":"中規模の村","큰 마을":"大きな村","광역 도시":"広域都市","평야·온대":"平野・温帯","해안·해양성":"海岸・海洋性","산지·서늘함":"山地・冷涼","분지·온난함":"盆地・温暖","사막·건조":"砂漠・乾燥","설원·한랭":"雪原・寒冷","열대·다우":"熱帯・多雨",
  "외딴 정착지":"人里離れた集落","한적한 시골":"静かな田舎","마을":"村","소도시":"小都市","중소 도시":"地方都市","대도시":"大都市","초고밀도 도시":"超高密度都市","알려지지 않음":"知られていない","조용하고 평화로움":"静かで平和","살기 좋음":"暮らしやすい","관광지로 유명함":"観光地として有名","기회의 도시":"機会の街","위험하다는 소문":"危険だという噂","폐쇄적인 곳":"閉鎖的な場所","화려하고 번화함":"華やかで賑やか","역사가 깊음":"歴史が深い"
});
Object.assign(UI_TEXT.ja,{"새 마을 만들기":"新しい村を作る","새로운 마을 슬롯을 추가해요":"新しい村の枠を追加します。"});
Object.assign(UI_TEXT.en,{
  "건물 평판":"Building reputation","건물 분위기":"Building atmosphere","지정 안 함":"Not set","지역 주민에게 사랑받음":"Loved by locals","평이 좋음":"Well reviewed","무난함":"Average","호불호가 갈림":"Divisive","악평이 있음":"Poorly reviewed","유명한 명소":"Famous landmark","아늑하고 편안함":"Cozy and comfortable","활기차고 북적임":"Lively and bustling","조용하고 차분함":"Quiet and calm","세련되고 고급스러움":"Polished and upscale","오래되고 정겨움":"Old and familiar","어둡고 음침함":"Dark and gloomy","독특하고 신비로움":"Distinctive and mysterious","모든 테마 보기":"View all themes","편집 목록 접기":"Collapse edit catalog","마을에 있는 캐릭터":"Character in town"
});
Object.assign(UI_TEXT.ja,{
  "건물 평판":"建物の評判","건물 분위기":"建物の雰囲気","지정 안 함":"未指定","지역 주민에게 사랑받음":"地域の住民に愛されている","평이 좋음":"評判が良い","무난함":"無難","호불호가 갈림":"好みが分かれる","악평이 있음":"悪評がある","유명한 명소":"有名な名所","아늑하고 편안함":"居心地がよく快適","활기차고 북적임":"活気があり賑やか","조용하고 차분함":"静かで落ち着いている","세련되고 고급스러움":"洗練され高級感がある","오래되고 정겨움":"古く懐かしい","어둡고 음침함":"暗く陰気","독특하고 신비로움":"個性的で神秘的","모든 테마 보기":"すべてのテーマを見る","편집 목록 접기":"編集リストを閉じる","마을에 있는 캐릭터":"村にいる人物"
});
Object.assign(UI_TEXT.en,{
  "사진 추가하기":"Add photo","추가할 방법을 골라 주세요.":"Choose how to add it.","기기에서 업로드하기":"Upload from device","휴대폰이나 컴퓨터에 저장된 사진":"A photo saved on your phone or computer","링크로 추가하기":"Add by link","웹에 있는 이미지 주소":"An image URL on the web","사진을 저장하지 못했어요. 다른 사진으로 다시 시도해 주세요.":"The picture could not be saved. Please try another one.",
  "약 이름":"Medication name","복용중인 약":"Current medications","복용 목적·특성":"Purpose · properties","복용 주기":"Schedule","복용량·주의사항 등":"Dose, precautions, and notes","추가":"Add","제거":"Remove","설정 완료":"Done",
  "병원 방문":"Hospital visits","상담·경과 확인":"Consultation · follow-up","정기 검진 · 상담 포함":"Routine exam · includes consultation","검사·영상 촬영 · 검진·상담 포함":"Tests · imaging · includes exam and consultation","외래 처치·치료 · 검사 이하 포함":"Outpatient treatment · includes lower levels","통원 시술 · 외래 치료 이하 포함":"Day procedure · includes outpatient treatment","입원 치료 · 통원 치료 이하 포함":"Inpatient care · includes day treatment","수술·집중 치료 · 입원 치료 이하 포함":"Surgery · intensive care · includes inpatient care","재활·회복 관리":"Rehabilitation · recovery","처방·복약 조정":"Prescription · medication adjustment","예방접종":"Vaccination","정신건강 진료":"Mental health care","치과 진료":"Dental care","기타 진료":"Other care",
  "통증 조절":"Pain management","알레르기 관리":"Allergy management","호흡기 관리":"Respiratory care","심혈관 관리":"Cardiovascular care","혈압 관리":"Blood-pressure management","혈당 관리":"Blood-sugar management","호르몬 관리":"Hormone management","면역 관리":"Immune-system care","소화기 관리":"Digestive care","감염 치료":"Infection treatment","수면 관리":"Sleep management","불안 완화":"Anxiety relief","기분 조절":"Mood regulation","집중력 관리":"Attention management","피임·생식 건강":"Contraception · reproductive health","성별확정 의료 과정":"Gender-affirming care","비타민·영양 보충":"Vitamins · supplements",
  "그레이톤":"Gray tone","쿨블루톤":"Cool blue tone","웜블루톤":"Warm blue tone","쿨그린톤":"Cool green tone","웜그린톤":"Warm green tone","라일락톤":"Lilac tone",
  "가격대":"Price range","색":"Color","분위기":"Style mood","형태·소재":"Silhouette · material","저가":"Budget","합리적인 가격":"Affordable","중간 가격대":"Mid-range","고가":"Premium","명품":"Luxury label","맞춤 제작":"Made to order","섹시":"Sexy","화려":"Glamorous","성숙":"Mature","청순":"Pure","큐티":"Cute","우아":"Elegant","시크":"Chic","중성적":"Androgynous","단정":"Neat","캐주얼":"Casual","클래식":"Classic","스트리트":"Street","빈티지":"Vintage","로맨틱":"Romantic","스포티":"Sporty","미니멀":"Minimal","럭셔리":"Luxury","판타지":"Fantasy","몸에 붙는 실루엣":"Fitted silhouette","여유로운 실루엣":"Relaxed silhouette","노출이 적음":"Low coverage exposure","노출이 많음":"Revealing","레이어드":"Layered","가죽":"Leather","데님":"Denim","니트":"Knit","실크·새틴":"Silk · satin","레이스":"Lace","시스루":"Sheer","기능성 소재":"Technical fabric","장식이 많음":"Highly embellished","무늬가 많음":"Patterned",
  "의상 태그":"Outfit tags","의상 태그 선택":"Choose outfit tags","개 선택됨":" selected","분류별로 살펴보고 여러 개를 선택할 수 있어요.":"Browse by category and select multiple options.","서사·인지 특성 선택사항":"Optional narrative · cognitive traits","실제 장면에 반영할 표현":"Expressions used in scenes"
});
Object.assign(UI_TEXT.ja,{
  "사진 추가하기":"写真を追加","추가할 방법을 골라 주세요.":"追加方法を選んでください。","기기에서 업로드하기":"端末からアップロード","휴대폰이나 컴퓨터에 저장된 사진":"スマートフォンやパソコンに保存された写真","링크로 추가하기":"リンクで追加","웹에 있는 이미지 주소":"ウェブ上の画像URL","사진을 저장하지 못했어요. 다른 사진으로 다시 시도해 주세요.":"画像を保存できませんでした。別の画像でもう一度お試しください。",
  "약 이름":"薬の名前","복용중인 약":"服用中の薬","복용 목적·특성":"服用目的・特性","복용 주기":"服用頻度","복용량·주의사항 등":"用量・注意事項など","추가":"追加","제거":"削除","설정 완료":"設定完了",
  "병원 방문":"通院","상담·경과 확인":"相談・経過確認","정기 검진 · 상담 포함":"定期検診・相談を含む","검사·영상 촬영 · 검진·상담 포함":"検査・画像撮影・検診と相談を含む","외래 처치·치료 · 검사 이하 포함":"外来処置・治療・検査以下を含む","통원 시술 · 외래 치료 이하 포함":"通院施術・外来治療以下を含む","입원 치료 · 통원 치료 이하 포함":"入院治療・通院治療以下を含む","수술·집중 치료 · 입원 치료 이하 포함":"手術・集中治療・入院治療以下を含む","재활·회복 관리":"リハビリ・回復管理","처방·복약 조정":"処方・服薬調整","예방접종":"予防接種","정신건강 진료":"メンタルヘルス診療","치과 진료":"歯科診療","기타 진료":"その他の診療",
  "통증 조절":"疼痛管理","알레르기 관리":"アレルギー管理","호흡기 관리":"呼吸器管理","심혈관 관리":"心血管管理","혈압 관리":"血圧管理","혈당 관리":"血糖管理","호르몬 관리":"ホルモン管理","면역 관리":"免疫管理","소화기 관리":"消化器管理","감염 치료":"感染治療","수면 관리":"睡眠管理","불안 완화":"不安緩和","기분 조절":"気分調整","집중력 관리":"集中力管理","피임·생식 건강":"避妊・生殖健康","성별확정 의료 과정":"ジェンダー肯定医療","비타민·영양 보충":"ビタミン・栄養補給",
  "그레이톤":"グレートーン","쿨블루톤":"クールブルートーン","웜블루톤":"ウォームブルートーン","쿨그린톤":"クールグリーントーン","웜그린톤":"ウォームグリーントーン","라일락톤":"ライラックトーン",
  "가격대":"価格帯","색":"色","분위기":"雰囲気","형태·소재":"形・素材","저가":"低価格","합리적인 가격":"手頃な価格","중간 가격대":"中価格帯","고가":"高価格","명품":"高級ブランド","맞춤 제작":"オーダーメイド","섹시":"セクシー","화려":"華やか","성숙":"大人っぽい","청순":"清楚","큐티":"キュート","우아":"優雅","시크":"シック","중성적":"中性的","단정":"端正","캐주얼":"カジュアル","클래식":"クラシック","스트리트":"ストリート","빈티지":"ヴィンテージ","로맨틱":"ロマンティック","스포티":"スポーティー","미니멀":"ミニマル","럭셔리":"ラグジュアリー","판타지":"ファンタジー","몸에 붙는 실루엣":"体に沿うシルエット","여유로운 실루엣":"ゆったりしたシルエット","노출이 적음":"露出が少ない","노출이 많음":"露出が多い","레이어드":"レイヤード","가죽":"レザー","데님":"デニム","니트":"ニット","실크·새틴":"シルク・サテン","레이스":"レース","시스루":"シースルー","기능성 소재":"機能素材","장식이 많음":"装飾が多い","무늬가 많음":"柄が多い",
  "의상 태그":"衣装タグ","의상 태그 선택":"衣装タグを選択","개 선택됨":"個選択済み","분류별로 살펴보고 여러 개를 선택할 수 있어요.":"分類ごとに確認し、複数選択できます。","서사·인지 특성 선택사항":"物語・認知特性の選択項目","실제 장면에 반영할 표현":"実際の場面に反映する表現"
});
Object.assign(UI_TEXT.en,{"배치 조절":"Placement controls","실행 취소":"Undo","다시 실행":"Redo","작게":"Smaller","크게":"Larger","좌우반전":"Flip horizontal","뒤로":"Send back","앞으로":"Bring forward","마을 장식 추가":"Add town decorations","주민들은 놓아 둔 장식을 보고 쉬거나 사진을 찍는 등 자연스럽게 상호작용해요.":"Residents naturally interact with decorations by resting, looking around, or taking photos.","벤치":"Bench","가로등":"Streetlight","분수":"Fountain","나무":"Tree","꽃밭":"Flower bed","조각상":"Statue","안내판":"Guide sign","자판기":"Vending machine"});
Object.assign(UI_TEXT.ja,{"배치 조절":"配置調整","실행 취소":"元に戻す","다시 실행":"やり直す","작게":"小さく","크게":"大きく","좌우반전":"左右反転","뒤로":"背面へ","앞으로":"前面へ","마을 장식 추가":"村の装飾を追加","주민들은 놓아 둔 장식을 보고 쉬거나 사진을 찍는 등 자연스럽게 상호작용해요.":"住民は置かれた装飾を眺めたり、休んだり、写真を撮ったりして自然に交流します。","벤치":"ベンチ","가로등":"街灯","분수":"噴水","나무":"木","꽃밭":"花壇","조각상":"彫像","안내판":"案内板","자판기":"自動販売機"});
Object.assign(UI_TEXT.en,{"마을 장식":"Town decorations","마을 정보":"Town info","마을 이름":"Town name","마을 시대":"Town era","현대":"Modern","중세":"Medieval","기본 배경":"Background","건물 추가":"Add building","집 유형":"Home type","세부 유형":"Subtype","층":"Floors","방 수":"Rooms","구성원":"Residents","현재 집 안":"Currently home","청결도":"Cleanliness","마을 미지정":"No town","단독주택":"Detached house","아파트":"Apartment","빌라":"Villa","연립주택":"Townhouse block","오피스텔":"Studio residence","타운하우스":"Townhouse","농가":"Farmhouse","저택":"Mansion","성":"Castle","궁전":"Palace","기숙사":"Dormitory","사택":"Company housing","공동주택":"Shared housing","이동식 주택":"Mobile home","집 외관 스타일":"Home exterior style","매우 소박함":"Very modest","소박함":"Modest","평범함":"Ordinary","보기 좋음":"Pleasant","아름다움":"Beautiful","눈에 띄게 아름다움":"Strikingly beautiful","현대적":"Contemporary","유럽풍":"European","한옥풍":"Hanok style","일본식":"Japanese","지중해풍":"Mediterranean","전원주택풍":"Country-house style","미래적":"Futuristic"});
Object.assign(UI_TEXT.ja,{"마을 장식":"村の装飾","마을 정보":"村情報","마을 이름":"村の名前","마을 시대":"村の時代","현대":"現代","중세":"中世","기본 배경":"背景","건물 추가":"建物を追加","집 유형":"住居タイプ","세부 유형":"詳細タイプ","층":"階数","방 수":"部屋数","구성원":"住人","현재 집 안":"在宅中","청결도":"清潔度","마을 미지정":"村未指定","단독주택":"一戸建て","아파트":"アパート","빌라":"ヴィラ","연립주택":"連棟住宅","오피스텔":"オフィステル","타운하우스":"タウンハウス","농가":"農家","저택":"邸宅","성":"城","궁전":"宮殿","기숙사":"寮","사택":"社宅","공동주택":"共同住宅","이동식 주택":"移動式住宅","집 외관 스타일":"家の外観スタイル","매우 소박함":"とても質素","소박함":"質素","평범함":"普通","보기 좋음":"感じがよい","아름다움":"美しい","눈에 띄게 아름다움":"ひときわ美しい","현대적":"現代的","유럽풍":"ヨーロッパ風","한옥풍":"韓屋風","일본식":"和風","지중해풍":"地中海風","전원주택풍":"田園住宅風","미래적":"未来的"});
Object.assign(UI_TEXT.en,{"건물 정보":"Building info","편집모드":"Edit mode","편집완료":"Finish editing","마을 메뉴":"Town menu","현재 {current}명 · 거주 {resident}명":"{current} here · {resident} residents","마을로 돌아가기":"Back to town","건물 검색":"Search buildings","검색":"Search","마을 선택":"Choose town","건물 목록으로 돌아가기":"Back to building list","내부 사진을 등록해 주세요":"Add an interior image"});
Object.assign(UI_TEXT.ja,{"건물 정보":"建物情報","편집모드":"編集モード","편집완료":"編集完了","마을 메뉴":"村メニュー","현재 {current}명 · 거주 {resident}명":"現在{current}人・居住{resident}人","마을로 돌아가기":"村に戻る","건물 검색":"建物を検索","검색":"検索","마을 선택":"村を選択","건물 목록으로 돌아가기":"建物一覧に戻る","내부 사진을 등록해 주세요":"内観画像を登録してください"});
Object.assign(UI_TEXT.en,{"기본 테마 · 서랍마을":"Default theme · Drawer Village","고급 LD 사진 추가하기":"Add advanced LD art","잉크병을 눌러 저장":"Press the inkwell to save","분노할 때 보이는 반응":"Response when angry","유혹·호감 신호를 받을 때":"Response to flirtation or interest","차분히 이유를 확인함":"Calmly asks what happened","말수가 차갑게 줄어듦":"Grows cold and quiet","즉시 잘못을 따짐":"Immediately confronts the issue","목소리가 커짐":"Raises their voice","자리를 피해 식힘":"Steps away to cool down","울컥하지만 말을 고름":"Gets emotional but chooses words carefully","해결책을 분명히 요구함":"Clearly asks for a solution","눈치채지 못함":"Does not notice","알아도 모른 척함":"Notices but pretends not to","당황해 거리를 둠":"Gets flustered and keeps distance","은근히 받아줌":"Subtly reciprocates","장난스럽게 맞받음":"Playfully responds","직접 호응함":"Responds directly","상대를 경계함":"Becomes wary","오늘":"Today","통계 보고서":"Statistics report","마을과 캐릭터의 생활을 한눈에 살펴봐요.":"See village and character life at a glance.","통계 범위":"Statistics scope","마을 수":"Villages","건물 수":"Buildings","캐릭터 수":"Characters","곳":"","개":"","연령대와 성비":"Age and gender","그 외·미설정":"Other · unset","전체 마을":"All villages","평균 기상 시각":"Average wake time","평균 취침 시각":"Average bedtime","평균 키":"Average height","평균 몸무게":"Average weight","가장 많은 성격":"Most common personalities","생활과 사회 지표":"Life and social indicators","직업이 있는 캐릭터":"Characters with jobs","오전 7시 전 기상":"Wake before 7 AM","평균 사회 에너지":"Average social energy","연결된 관계 수":"Relationship links","보고서 다운로드":"Download report","아직 집계할 설정이 없어요.":"No settings to summarize yet."});
Object.assign(UI_TEXT.ja,{"기본 테마 · 서랍마을":"基本テーマ・ひきだし村","고급 LD 사진 추가하기":"高度なLD画像を追加","잉크병을 눌러 저장":"インク壺を押して保存","분노할 때 보이는 반응":"怒った時の反応","유혹·호감 신호를 받을 때":"誘惑・好意のサインへの反応","차분히 이유를 확인함":"落ち着いて理由を確認する","말수가 차갑게 줄어듦":"冷たく無口になる","즉시 잘못을 따짐":"すぐに問題を問いただす","목소리가 커짐":"声が大きくなる","자리를 피해 식힘":"その場を離れて頭を冷やす","울컥하지만 말을 고름":"感情がこみ上げても言葉を選ぶ","해결책을 분명히 요구함":"解決策を明確に求める","눈치채지 못함":"気づかない","알아도 모른 척함":"気づいても知らないふりをする","당황해 거리를 둠":"戸惑って距離を取る","은근히 받아줌":"さりげなく応じる","장난스럽게 맞받음":"冗談っぽく応じる","직접 호응함":"はっきり応じる","상대를 경계함":"相手を警戒する","오늘":"今日","통계 보고서":"統計レポート","마을과 캐릭터의 생활을 한눈에 살펴봐요.":"村とキャラクターの暮らしをひと目で確認できます。","통계 범위":"統計範囲","마을 수":"村の数","건물 수":"建物数","캐릭터 수":"キャラクター数","곳":"か所","개":"個","연령대와 성비":"年代と性別","그 외·미설정":"その他・未設定","전체 마을":"すべての村","평균 기상 시각":"平均起床時刻","평균 취침 시각":"平均就寝時刻","평균 키":"平均身長","평균 몸무게":"平均体重","가장 많은 성격":"多い性格","생활과 사회 지표":"生活・社会指標","직업이 있는 캐릭터":"仕事があるキャラクター","오전 7시 전 기상":"午前7時前に起床","평균 사회 에너지":"平均ソーシャルエネルギー","연결된 관계 수":"つながっている関係数","보고서 다운로드":"レポートをダウンロード","아직 집계할 설정이 없어요.":"集計できる設定がまだありません。"});
Object.assign(UI_TEXT.en,{"캐릭터 대표 색상":"Character accent colors"});
Object.assign(UI_TEXT.ja,{"캐릭터 대표 색상":"キャラクターのアクセントカラー"});
Object.assign(UI_TEXT.en,{"여기에 등록한 SD·LD는 옷만 겹치는 레이어가 아니라, 해당 상황에서 캐릭터 그림 전체를 통째로 바꿉니다.":"The SD and LD art saved here do not overlay only the clothing. They replace the character's entire image in matching situations.","SD 아이콘 화면 배치":"SD icon placement","LD 사진 화면 배치":"LD art placement","가로 위치":"Horizontal position","세로 위치":"Vertical position","크기":"Scale"});
Object.assign(UI_TEXT.ja,{"여기에 등록한 SD·LD는 옷만 겹치는 레이어가 아니라, 해당 상황에서 캐릭터 그림 전체를 통째로 바꿉니다.":"ここで登録するSD・LDは服だけを重ねるレイヤーではなく、該当する状況でキャラクター画像全体を置き換えます。","SD 아이콘 화면 배치":"SDアイコンの配置","LD 사진 화면 배치":"LD画像の配置","가로 위치":"横位置","세로 위치":"縦位置","크기":"拡大率"});
function welcome(){
  const authInfo=window.ParallelCityAuth?.getInfo?.();
  const busy=!authInfo||!authInfo.ready||Boolean(authInfo.busy);
  return `<section class="village-welcome" aria-labelledby="welcome-title">
    <img class="welcome-landscape" src="./world-assets/owner-forest-town.webp" alt="" fetchpriority="high" loading="eager">
    <div class="welcome-top"><span class="welcome-brand">${esc(t("brandName","서랍마을"))}</span><button type="button" data-tab="settings">${esc(t("설정 열기","설정 열기"))}</button></div>
    <div class="welcome-note"><p class="welcome-eyebrow">${esc(t("캐릭터의 하루가 모이는 곳","캐릭터의 하루가 모이는 곳"))}</p>
      <h1 id="welcome-title">${esc(t("작은 서랍 속,","작은 서랍 속,"))}<br><em>${esc(t("너만의 이야기","너만의 이야기"))}</em></h1>
      <p class="welcome-intro">${esc(t("이름과 모습을 정하면, 이 마을에서 첫 하루가 시작돼요.","이름과 모습을 정하면, 이 마을에서 첫 하루가 시작돼요."))}</p>
      <div class="welcome-actions"><button type="button" data-welcome-create ${busy?"disabled":""}>${esc(t("첫 캐릭터 만들기","첫 캐릭터 만들기"))}<span aria-hidden="true"> →</span></button><button type="button" data-welcome-restore ${busy?"disabled":""}>${esc(t("내 마을 불러오기","내 마을 불러오기"))}</button></div>
      <p class="welcome-restore-hint" role="status">${esc(busy?t("계정 기록을 확인하는 중…","계정 기록을 확인하는 중…"):t("이미 마을이 있다면, 먼저 불러와 주세요.","이미 마을이 있다면, 먼저 불러와 주세요."))}</p>
      <div class="welcome-details">${[["profile-placeholder.png","캐릭터의 하루"],["relationship.png","함께 쌓는 관계"],["home.png","꾸미는 집과 마을"]].map(([asset,label])=>`<span><img src="./assets/home-ui/${asset}" alt="">${esc(t(label,label))}</span>`).join("")}</div>
    </div>
    <div class="welcome-language" aria-label="Language">${[["ko","한국어"],["en","English"],["ja","日本語"]].map(([code,label])=>`<button type="button" data-welcome-language="${code}" aria-pressed="${(state.uiLanguage||"ko")===code}">${label}</button>`).join("")}</div>
  </section>`;
}
function accountLoading(){
  return `<section class="village-account-loading" role="status" aria-live="polite"><img src="./world-assets/owner-forest-town.webp" alt=""><div><span aria-hidden="true"></span><b>${esc(t("계정 기록을 확인하는 중…","계정 기록을 확인하는 중…"))}</b><p>${esc(t("저장된 마을을 확인한 뒤 이어서 열게요.","저장된 마을을 확인한 뒤 이어서 열게요."))}</p></div></section>`;
}
function view(){
  const authInfo=window.ParallelCityAuth?.getInfo?.();
  const configured=Boolean(window.PARALLEL_CITY_FIREBASE?.apiKey&&window.PARALLEL_CITY_FIREBASE?.projectId&&window.PARALLEL_CITY_FIREBASE?.authDomain);
  // A remembered Google session must finish its account switch and initial
  // cloud download before any local game screen is exposed.  Manual syncs do
  // not use startupSyncing, so they never replace an already-open screen.
  if(configured&&!window.DrawerVillageAuthStartupFailed&&(!authInfo||!authInfo.ready||authInfo.startupSyncing))return accountLoading();
  if(!state.order.length){
    if(state.activeTab==="settings")return settings();
    if(state.activeTab==="mailbox")return mailbox();
    if(!authInfo||!authInfo.ready||authInfo.busy)return accountLoading();
    return welcome();
  }
  return ({observe,mailbox,home,character,catalog,relationship,routine,statistics,town:townMobile,shop,settings}[state.activeTab]||observe)();
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
  const showingWelcome=!state.order.length&&!["settings","mailbox"].includes(state.activeTab);
  const showingAccountLoading=Boolean(content?.includes?.('class="village-account-loading"'));
  // The empty-world landing page is scrollable, unlike the fixed game HUD.
  document.documentElement.dataset.activeTab=showingWelcome?"welcome":state.activeTab;
  appRoot.classList.toggle("is-welcome",showingWelcome);
  appRoot.classList.toggle("is-account-loading",showingAccountLoading);
  appRoot.innerHTML=`${showingWelcome||showingAccountLoading?"":header()}<main>${content}</main>`;
  scheduleTownLighting(document);
  appRoot.querySelectorAll("img").forEach((image,index)=>{
    image.decoding="async";
    if(index>2&&!image.closest(".native-current-scene,.home-current-scene,.app-loading-card"))image.loading="lazy";
    if(image.classList.contains("world-bg")||image.closest("dialog,.building-detail-dialog"))image.fetchPriority="low";
  });
  normalizeDisplayedParticles(appRoot);
  localizeLanguageSelector(appRoot);
  translateInterface(appRoot);
  const backgroundSelect=document.querySelector("[data-world-bg]");
  if(backgroundSelect){
    if(backgroundSelect.options[0])backgroundSelect.options[0].value=state.world.bg;
    backgroundSelect.value=state.world.bg;
    [...backgroundSelect.options].forEach(option=>{
      if(option.value.includes("department-store"))option.textContent="백화점 아트리움";
    });
  }
}
export function setAccountLabel(text=accountText){
  accountText=text;const el=document.querySelector("#account-status");if(el)el.textContent=translatedUiText(text);
  const welcomeRoot=document.querySelector(".village-welcome");
  if(welcomeRoot){
    const authInfo=window.ParallelCityAuth?.getInfo?.();
    const busy=!authInfo||!authInfo.ready||Boolean(authInfo.busy);
    welcomeRoot.querySelectorAll("[data-welcome-create],[data-welcome-restore]").forEach(button=>button.disabled=busy);
    const hint=welcomeRoot.querySelector("[role=status]");if(hint)hint.textContent=busy?t("계정 기록을 확인하는 중…","계정 기록을 확인하는 중…"):t("이미 마을이 있다면, 먼저 불러와 주세요.","이미 마을이 있다면, 먼저 불러와 주세요.");
  }
}
export function setAccountEntitlements(value){accountEntitlements={backgroundPacks:Array.isArray(value?.backgroundPacks)?value.backgroundPacks:[],iconPacks:Array.isArray(value?.iconPacks)?value.iconPacks:[],dlcPacks:Array.isArray(value?.dlcPacks)?value.dlcPacks:[],purchases:Array.isArray(value?.purchases)?value.purchases:[],characterSlotPacks:Math.max(0,Number(value?.characterSlotPacks)||0),townSlotPacks:Math.max(0,Number(value?.townSlotPacks)||0),storage50:Boolean(value?.storage50),teaSupportMonth:String(value?.teaSupportMonth||"")}}

const CART_KEY="drawer-village-cart";
const SHOP_PRODUCTS={
  character_slots_5:{label:"캐릭터 슬롯",title:"캐릭터 5명 추가",description:"캐릭터 슬롯 5개가 결제 즉시 계정에 영구 적용됩니다. 결제일부터 최소 6개월간 이용을 보장하며, 이후에도 서비스 운영 기간 동안 유지됩니다.",price:1200},
  town_slot_1:{label:"마을 슬롯",title:"마을 1개 추가",description:"마을 슬롯 1개가 결제 즉시 계정에 영구 적용됩니다. 결제일부터 최소 6개월간 이용을 보장하며, 이후에도 서비스 운영 기간 동안 유지됩니다.",price:1900},
  storage_50mb:{label:"사진 저장 공간",title:"사진 저장 공간 50MB 추가",description:"구매하면 계정의 사진 저장 공간이 50MB로 늘어납니다.",price:2900},
  green_tea:{label:"서랍마을 응원",title:"서랍마을 응원 선물 🎁",description:"서랍마을의 다음 업데이트를 응원해 주세요.",price:3000}
};
const shopProductBadge=(id,item)=>id==="character_slots_5"
  ?`<img class="shop-product-icon" src="./assets/shop/character-slots-5.png" alt="${esc(item.title)}">`
  :`<span>${id==="green_tea"?"응원":"일회성 구매"}</span>`;
const jobExpansionCard=()=>`<section class="shop-coming shop-expansion-showcase" data-product-id="job_expansion"><div class="expansion-art"><img src="./shop-assets/resume-expansion.png" alt="이력서를 제출해요 확장팩 이미지"></div><div class="expansion-copy"><span>확장팩 · 출시 준비 중</span><small>직업 확장팩</small><h2>이력서를 제출해요</h2><p>기존 직업에 더 세밀한 위계와 직급, 직장 내 관계, 실제 근무 장소와 구체적인 근무 내용을 더합니다. 상사와 부하 직원, 동료 사이의 역할과 업무 흐름이 생활 장면과 주간 일정에 이어지는 대규모 직업 확장팩이에요.</p><ul><li>직업별 위계·직급과 승진 흐름</li><li>상사·동료·부하 직원의 직장 내 관계</li><li>근무 장소·부서·담당 업무와 전용 생활 장면</li></ul><div><b>가격 미정</b><button type="button" disabled>출시 준비 중</button></div></div></section>`;
const readCart=()=>{try{const value=JSON.parse(localStorage.getItem(CART_KEY)||"{}");return value&&typeof value==="object"?value:{}}catch{return {}}};
function nativePlayShop({browseOnly=false}={}){
  const language=state.uiLanguage||"ko";
  const copies={
    ko:{back:"메인으로 돌아가기",title:"서랍 상점",bundle:"번들",base:"기본상점",skin:"스킨상점",expansion:"확장팩상점",checking:"상품 확인 중",restore:"구매 내역 복원",bundleSoon:"신규 번들은 아직 판매하지 않아요",skinSoon:"스킨 상점 준비 중",expansionSoon:"확장팩 상점 준비 중",soonDetail:"상품 구성이 확정되면 이곳에서 알려드릴게요.",buy:"구매하기"},
    en:{back:"Back to home",title:"Drawer Shop",bundle:"Bundles",base:"Base shop",skin:"Skins",expansion:"Expansions",checking:"Checking product",restore:"Restore purchases",bundleSoon:"New bundles are not on sale yet",skinSoon:"Skin shop coming soon",expansionSoon:"Expansion shop coming soon",soonDetail:"We will announce products here after the lineup is finalized.",buy:"Buy"},
    ja:{back:"メインへ戻る",title:"ひきだし商店",bundle:"バンドル",base:"基本ショップ",skin:"スキン",expansion:"拡張パック",checking:"商品を確認中",restore:"購入を復元",bundleSoon:"新しいバンドルはまだ販売していません",skinSoon:"スキンショップ準備中",expansionSoon:"拡張パック準備中",soonDetail:"商品内容が確定したら、こちらでお知らせします。",buy:"購入"}
  };
  const copy=copies[language]||copies.ko;
  const previewCopy=({ko:{notice:"상점을 둘러볼 수 있어요. iOS 구매·복원은 아직 준비 중이며 실제 결제는 진행되지 않아요.",pending:"구매 준비 중"},en:{notice:"Explore the shop. iOS purchases and restore are not available yet; no payment will be taken.",pending:"Coming soon"},ja:{notice:"ショップをご覧いただけます。iOSの購入・復元機能は準備中のため、決済は行われません。",pending:"購入準備中"}})[language]||{notice:"상점을 둘러볼 수 있어요. iOS 구매·복원은 아직 준비 중이며 실제 결제는 진행되지 않아요.",pending:"구매 준비 중"};
  const section=nativeShopSection;
  const tab=(key,label)=>`<button type="button" class="drawer-shop-hit drawer-shop-tab" data-drawer-shop-tab="${key}" aria-pressed="${section===key}">${esc(label)}</button>`;
  const icons={character_slots_5:`<img src="./assets/shop/character-slots-5.png" alt="">`,town_slot_1:"🏘️",storage_50mb:"🗄️",green_tea:"🎁"};
  const productCard=id=>{const item=SHOP_PRODUCTS[id],fallback=`₩${item.price.toLocaleString("ko-KR")}`,owned=id==="storage_50mb"&&accountEntitlements.storage50;return `<article class="drawer-shop-product"><span class="drawer-shop-product-icon ${id}">${icons[id]}</span><div><small>${esc(t(item.label,item.label))}</small><b>${esc(t(item.title,item.title))}</b><p>${esc(t(item.description,item.description))}</p></div>${browseOnly?`<button type="button" class="drawer-shop-purchase" disabled>${esc(previewCopy.pending)}</button>`:`<button type="button" class="drawer-shop-purchase" data-play-purchase="${id}" data-play-owned="${owned}" data-purchase-state="${owned?"unavailable":"checking"}" disabled aria-label="${esc(item.title)} · ${esc(owned?"이미 구매함":copy.checking)}"><span data-play-price="${id}">${owned?esc(t("이미 적용 중","이미 적용 중")):fallback}</span><small class="drawer-shop-sr" data-play-label>${esc(owned?"이미 적용 중":copy.checking)}</small></button>`}</article>`};
  const comingTitle=section==="bundle"?copy.bundleSoon:section==="skin"?copy.skinSoon:copy.expansionSoon;
  const content=section==="base"?`<div class="drawer-shop-products">${["character_slots_5","town_slot_1","storage_50mb","green_tea"].map(productCard).join("")}</div>`:`<div class="drawer-shop-coming" role="status"><span aria-hidden="true">✦</span><b>${esc(comingTitle)}</b><small>${esc(copy.soonDetail)}</small></div>`;
  return `<section class="drawer-shop-shell" aria-label="${esc(t("shop","상점"))}"><div class="drawer-shop-stage" data-shop-section="${section}"><header class="drawer-shop-hero"><img class="drawer-shop-wood" src="./assets/shop/drawer-shop-wood.jpg" alt=""><img class="drawer-shop-seller" src="./assets/shop/drawer-shop-seller.png" alt=""><button type="button" class="drawer-shop-back" data-tab="observe" aria-label="${esc(copy.back)}"><img src="./assets/home-ui/back.png" alt=""></button><h1><small>DRAWER VILLAGE</small><span>${esc(copy.title)}</span><i aria-hidden="true">✦</i></h1></header><nav class="drawer-shop-tabs" aria-label="${esc(t("상점 메뉴","상점 메뉴"))}">${tab("bundle",copy.bundle)}${tab("base",copy.base)}${tab("skin",copy.skin)}${tab("expansion",copy.expansion)}</nav><div class="drawer-shop-content">${browseOnly?`<p class="drawer-shop-preview-notice" role="status">${esc(previewCopy.notice)}</p>`:""}${content}</div>${browseOnly?"":`<button type="button" class="drawer-shop-restore" data-play-restore>${esc(copy.restore)}</button>`}</div></section>`;
}
function shop(){
  if(window.PARALLEL_CITY_CONFIG?.iosPreview){
    return nativePlayShop({browseOnly:true});
  }
  if(window.PARALLEL_CITY_CONFIG?.nativeApp||new URLSearchParams(location.search).has("native-preview"))return nativePlayShop();
  const cart=readCart();
  const lines=Object.entries(cart).filter(([id,qty])=>SHOP_PRODUCTS[id]&&!SHOP_PRODUCTS[id].disabled&&Number(qty)>0);
  const total=lines.reduce((sum,[id,qty])=>sum+SHOP_PRODUCTS[id].price*Number(qty),0);
  const cartLimit=50000;
  const isOverLimit=total>=cartLimit;
  const canAddToCart=id=>total+(Number(SHOP_PRODUCTS[id]?.price)||0)<cartLimit;
  const product=(id,item,ownedCount=0)=>`<article class="premium-product one-time-product" data-product-id="${id}"><div class="premium-product-heading">${shopProductBadge(id,item)}<div><small>${item.label}</small><h2>${item.title}</h2></div><b>${item.price==null?"책정 중":`${item.price.toLocaleString("ko-KR")}원`}</b></div><p>${item.description}</p>${ownedCount?`<div class="premium-current"><b>${id==="storage_50mb"?"50MB 적용 중":`${ownedCount}회 구매 · 현재 적용 중`}</b><small>${id==="storage_50mb"?"이미 적용된 계정에서는 다시 구매하지 않아요.":"구매 수량만큼 계정에 계속 더해집니다."}</small></div>`:""}${previewMode()?`<button class="premium-buy" disabled>사전 체험 중 구매 불가</button>`:id==="storage_50mb"&&ownedCount?`<button class="premium-buy" disabled>이미 적용 중</button>`:item.disabled?`<button class="premium-buy" disabled>용량·가격 확정 후 구매 가능</button>`:canAddToCart(id)?`<button class="primary premium-buy" data-cart-add="${id}">장바구니에 담기</button>`:`<button class="premium-buy" disabled>이 상품을 더 담으면 5만원 이상이에요</button>`}</article>`;
  const cartHtml=lines.length?lines.map(([id,qty])=>{const item=SHOP_PRODUCTS[id],totalTitle=id==="character_slots_5"?`캐릭터 ${qty*5}명 추가`:id==="town_slot_1"?`마을 ${qty}개 추가`:id==="green_tea"?`응원 선물 ${qty}개`:item.title;return `<article class="cart-line"><div><b>${totalTitle}</b><small>${item.title} · ${item.price.toLocaleString("ko-KR")}원 × ${qty}</small></div><div class="cart-quantity"><button data-cart-minus="${id}" aria-label="${item.title} 수량 줄이기">−</button><b>${qty}</b><button data-cart-plus="${id}" aria-label="${item.title} 수량 늘리기" ${id==="storage_50mb"||!canAddToCart(id)?"disabled":""}>+</button></div><b>${(item.price*qty).toLocaleString("ko-KR")}원</b><button class="cart-remove" data-cart-remove="${id}">빼기</button></article>`}).join(""):`<p class="cart-empty">아직 장바구니가 비어 있어요.</p>`;
  const count=lines.reduce((sum,[,qty])=>sum+Number(qty),0);
  const limitDetail=state.uiLanguage==="en"?(isOverLimit?"Reduce the quantity until the total is below KRW 50,000.":`Current total: KRW ${total.toLocaleString("en-US")} · Products that would reach the limit cannot be added.`):state.uiLanguage==="ja"?(isOverLimit?"合計が5万ウォン未満になるまで数量を減らしてください。":`現在 ${total.toLocaleString("ko-KR")}ウォン・上限に達する商品は追加できません。`):(isOverLimit?"수량을 줄여 결제금액을 50,000원 미만으로 맞춰 주세요.":`현재 ${total.toLocaleString("ko-KR")}원 · 한도에 닿는 상품은 더 담을 수 없어요.`);
  return `<section class="panel form dlc-store shop-store"><div class="title"><div><h1>상점</h1><p>원하는 상품과 수량을 장바구니에 담아 한 번에 결제할 수 있어요.</p></div></div>${previewMode()?`<section class="preview-notice"><b>${esc(previewConfig().label||"사전 체험")} 기간이에요</b><p>${esc(previewConfig().message||"현재 기능을 점검하고 있어 실제 결제는 진행되지 않아요.")}</p></section>`:""}<div class="shop-product-grid">${product("character_slots_5",SHOP_PRODUCTS.character_slots_5,Number(accountEntitlements.characterSlotPacks)||0)}${product("town_slot_1",SHOP_PRODUCTS.town_slot_1,Number(accountEntitlements.townSlotPacks)||0)}${product("storage_50mb",SHOP_PRODUCTS.storage_50mb,accountEntitlements.storage50?1:0)}${product("green_tea",SHOP_PRODUCTS.green_tea,0)}</div><div class="shop-expansion-heading"><small>COMING NEXT</small><h2>확장팩</h2></div>${jobExpansionCard()}<section class="shop-cart"><div class="title"><div><h2>장바구니</h2><p>${previewMode()?"사전 체험이 끝난 뒤 이용할 수 있어요.":"같은 상품도 여러 개 담을 수 있어요."}</p></div><b>${count}개</b></div><div class="premium-current"><b>한 번 결제 금액은 5만원 미만이어야 해요.</b><small>${limitDetail}</small></div><div class="cart-lines">${cartHtml}</div><div class="cart-total"><span>총 결제금액</span><b>${total.toLocaleString("ko-KR")}원</b></div>${previewMode()?`<span class="premium-buy disabled" aria-disabled="true">사전 체험 중에는 결제하지 않아요</span>`:`<a class="primary premium-buy ${lines.length&&!isOverLimit?"":"disabled"}" ${lines.length&&!isOverLimit?'href="./payment.html?cart=1" aria-disabled="false"':'aria-disabled="true"'}>${isOverLimit?"수량을 줄여 주세요":"장바구니 결제하기"}</a>`}</section><div class="dlc-hidden" hidden>${dlc()}</div></section>`;
}

Object.assign(UI_TEXT.en,{"웨딩드레스 부티크":"Wedding dress boutique","원형 경기장":"Circular stadium","도심 오피스":"City office","학사모 학교":"Graduation school","여행가방 호텔":"Suitcase hotel","시계탑 학교":"Clock school","책더미 도서관":"Book-stack library","옥상 정원 건물":"Rooftop garden building","직접 그린 건물":"Hand-drawn building","시간별 조명":"Scheduled lighting","원화의 흰색 유지":"Original white artwork preserved"});
Object.assign(UI_TEXT.ja,{"웨딩드레스 부티크":"ウェディングドレス・ブティック","원형 경기장":"円形スタジアム","도심 오フィス":"都心オフィス","학사모 학교":"卒業帽の学校","여행가방 호텔":"スーツケースホテル","시계탑 학교":"時計台の学校","책더미 도서관":"本の山の図書館","옥상 정원 건물":"屋上庭園の建物","직접 그린 건물":"手描きの建物","시간별 조명":"時間指定の照明","원화의 흰색 유지":"原画の白色を保持"});
Object.assign(UI_TEXT.en,{"캐릭터 정보":"Character information","선택한 캐릭터":"Selected character","기본 정보를 빠르게 수정":"Quickly edit basic information","설정책에서 자세히 수정":"Edit every detail in the settings book","펼친 책 페이지 이동":"Turn open-book spreads","이전 두 페이지":"Previous two pages","다음 두 페이지":"Next two pages"});
Object.assign(UI_TEXT.ja,{"캐릭터 정보":"人物情報","선택한 캐릭터":"選択中の人物","기본 정보를 빠르게 수정":"基本情報をすばやく編集","설정책에서 자세히 수정":"設定帳ですべての詳細を編集","펼친 책 페이지 이동":"見開きページを移動","이전 두 페이지":"前の2ページ","다음 두 페이지":"次の2ページ"});
