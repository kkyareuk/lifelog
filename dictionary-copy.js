const copy=[
 ['태그','Tags','タグ'],['빵','Bread','パン'],['면','Noodles','麺'],['밥','Rice','ご飯'],
 ['옷·패션','Clothing','服・ファッション'],['아이돌·밴드','Idols · bands','アイドル・バンド'],['책·작품','Books · works','本・作品'],['취미 물품','Hobby items','趣味の品物'],['향수','Perfume','香水'],['전자기기','Electronics','電子機器'],['무기','Weapons','武器'],
 ['사전 목록으로 돌아가기','Back to dictionary','辞典の一覧に戻る'],['메인 화면으로 돌아가기','Back to main screen','メイン画面に戻る'],
 ['사전 검색','Search dictionary','辞典を検索'],['이용 장소','Available at','利用場所'],['정렬','Sort','並べ替え'],
 ['기본순','Default','標準順'],['이름순','Name','名前順'],['별점순','Rating','評価順'],['최근 추가순','Newest','新しい順'],
 ['총','Total','全'],['물품 추가하기','Add item','品物を追加'],['물품 설정','Item settings','品物の設定'],['해당하는 물품이 없어요.','No matching items.','該当する品物がありません。'],
 ['사진 선택','Choose picture','画像を選択'],['인게임 일러스트','In-game illustrations','ゲーム内イラスト'],['기기에서 업로드','Upload from device','端末からアップロード'],
 ['카테고리 선택','Choose category','カテゴリを選択'],['카테고리','Category','カテゴリ'],['세부 유형','Subtype','詳細タイプ'],
 ['별점','Star rating','星評価'],['복제','Duplicate','複製'],['태그 추가','Add tag','タグを追加'],['태그 삭제','Remove tag','タグを削除'],
 ['대중적인 호감도','General appeal','一般的な人気'],['호불호가 매우 갈림','Very polarizing','好みが大きく分かれる'],['호불호가 갈림','Polarizing','好みが分かれる'],
 ['무난함','Neutral appeal','無難'],['대체로 좋아함','Generally liked','概ね好まれる'],['폭넓게 사랑받음','Widely loved','幅広く愛される'],
 ['매우 저렴','Very inexpensive','とても安い'],['비쌈','Expensive','高い'],['매우 비쌈','Very expensive','とても高い'],
 ['애니메이션 유형','Animation effect','アニメーション効果'],['은은한 빛','Soft glow','柔らかな光'],['반짝임','Sparkles','きらめき'],['둥실둥실','Floating','ふわふわ'],['살랑살랑','Gentle sway','ゆらゆら'],
 ['맵기','Spiciness','辛さ'],['달기','Sweetness','甘さ'],['아주 약함','Very mild','とても弱い'],['약함','Mild','弱い'],['강함','Strong','強い'],['아주 강함','Very strong','とても強い'],
 ['향 계열','Fragrance notes','香りの系統'],['http 또는 https 이미지 링크를 넣어 주세요.','Enter an http or https image URL.','http または https の画像URLを入力してください。'],
 ['답변 완료','Answered','回答済み'],['선물을 받을 캐릭터가 없어 이 질문에 답할 수 없어요.','The gift recipient no longer exists, so this question cannot be answered.','贈り先のキャラクターがいないため、この質問には回答できません。']
];
export const dictionaryCopy=Object.fromEntries(['en','ja'].map((language,index)=>[language,Object.fromEntries(copy.map(row=>[row[0],row[index+1]]))]));
