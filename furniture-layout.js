const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

export const FURNITURE_CATALOG=Object.freeze({
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
});

const ICONS={
  "소파":"🛋️","TV":"📺","책장":"📚","오디오":"🔊","안마의자":"🪑","게임기":"🎮","캣타워":"🐈","턴테이블":"💿","보드게임장":"🎲","홈시어터":"🎞️","프로젝터":"📽️","악기 진열장":"🎸","수집품 진열장":"🏺","독서 의자":"🪑","반려동물 장난감":"🧸","러닝머신":"🏃",
  "냉장고":"🧊","조리대":"🍳","식탁":"🍽️","오븐":"♨️","커피머신":"☕","식기세척기":"🫧","에스프레소 머신":"☕","티 세트":"🫖","제빵 도구":"🥐","칵테일 바":"🍸","와인 냉장고":"🍷","향신료 선반":"🧂","요리책 선반":"📖",
  "신발장":"👞","전신거울":"🪞","우산꽂이":"☂️","반려동물 산책용품":"🦮","자전거 보관대":"🚲","운동 장비 선반":"🏋️","캠핑 장비":"⛺",
  "샤워부스":"🚿","욕조":"🛁","세면대":"🧼","세탁기":"🧺","건조기":"♨️","입욕제 선반":"🫧","향수 선반":"🧴","스킨케어 선반":"🧴",
  "침대":"🛏️","아기 침대":"🛏️","옷장":"👗","화장대":"💄","협탁":"🗄️","빔프로젝터":"📽️","독서등":"🛋️","향수 진열대":"🧴","레코드 플레이어":"💿","작은 게임기":"🕹️","봉제인형":"🧸",
  "책상":"🗃️","작은 책상":"🗃️","컴퓨터":"🖥️","피아노":"🎹","기타":"🎸","그림 도구":"🎨","재봉틀":"🧵","운동기구":"🏋️","디지털 드로잉 장비":"🖌️","촬영 장비":"📷","보드게임 선반":"🎲","공예 도구":"✂️","뜨개 도구":"🧶","프라모델 작업대":"🛠️","천체망원경":"🔭","악기":"🎼",
  "의자":"🪑","야외 의자":"🪑","캠핑 의자":"🪑","찬장":"🗄️","티 테이블":"🫖","와인장":"🍷","수납장":"🗄️","선반":"🗄️","보관 상자":"📦","수집품 상자":"📦","옷걸이":"🧥","놀이 매트":"🧩","기저귀 교환대":"🍼","작업대":"🛠️","화분":"🪴","작은 테이블":"🪑","빨래 건조대":"👕","원예 도구":"🌱"
};

export const furnitureIcon=item=>ICONS[String(item||"")]||"🪑";
export const furnitureCatalogForRoom=type=>FURNITURE_CATALOG[type]||FURNITURE_CATALOG.other;

const LABELS={
  en:{"소파":"Sofa","TV":"TV","책장":"Bookcase","오디오":"Audio system","안마의자":"Massage chair","게임기":"Game console","캣타워":"Cat tower","턴테이블":"Turntable","보드게임장":"Board game table","홈시어터":"Home theater","프로젝터":"Projector","악기 진열장":"Instrument display","수집품 진열장":"Collection display","독서 의자":"Reading chair","반려동물 장난감":"Pet toys","러닝머신":"Treadmill","냉장고":"Refrigerator","조리대":"Kitchen counter","식탁":"Dining table","오븐":"Oven","커피머신":"Coffee machine","식기세척기":"Dishwasher","에스프레소 머신":"Espresso machine","티 세트":"Tea set","제빵 도구":"Baking tools","칵테일 바":"Cocktail bar","와인 냉장고":"Wine fridge","향신료 선반":"Spice rack","요리책 선반":"Cookbook shelf","신발장":"Shoe cabinet","전신거울":"Full-length mirror","우산꽂이":"Umbrella stand","반려동물 산책용품":"Pet walking gear","자전거 보관대":"Bike rack","운동 장비 선반":"Exercise rack","캠핑 장비":"Camping gear","샤워부스":"Shower","욕조":"Bathtub","세면대":"Sink","세탁기":"Washing machine","건조기":"Dryer","입욕제 선반":"Bath shelf","향수 선반":"Perfume shelf","스킨케어 선반":"Skincare shelf","침대":"Bed","옷장":"Wardrobe","화장대":"Vanity","협탁":"Bedside table","빔프로젝터":"Beam projector","독서등":"Reading lamp","향수 진열대":"Perfume display","레코드 플레이어":"Record player","작은 게임기":"Mini console","봉제인형":"Plush toy","책상":"Desk","컴퓨터":"Computer","피아노":"Piano","기타":"Guitar","그림 도구":"Art supplies","재봉틀":"Sewing machine","운동기구":"Exercise equipment","디지털 드로잉 장비":"Digital art setup","촬영 장비":"Camera gear","보드게임 선반":"Board game shelf","공예 도구":"Craft tools","뜨개 도구":"Knitting tools","프라모델 작업대":"Model workbench","천체망원경":"Telescope","악기":"Instrument","의자":"Chair","찬장":"Cupboard","티 테이블":"Tea table","와인장":"Wine cabinet","수납장":"Storage cabinet","놀이 매트":"Play mat","기저귀 교환대":"Changing table","옷걸이":"Clothes rack","작은 책상":"Small desk","작업대":"Workbench","화분":"Plant","야외 의자":"Outdoor chair","작은 테이블":"Small table","빨래 건조대":"Drying rack","원예 도구":"Gardening tools","캠핑 의자":"Camping chair","선반":"Shelf","보관 상자":"Storage box","수집품 상자":"Collection box","아기 침대":"Crib"},
  ja:{"소파":"ソファ","TV":"テレビ","책장":"本棚","오디오":"オーディオ","안마의자":"マッサージチェア","게임기":"ゲーム機","캣타워":"キャットタワー","턴테이블":"ターンテーブル","보드게임장":"ボードゲーム台","홈시어터":"ホームシアター","프로젝터":"プロジェクター","악기 진열장":"楽器ディスプレイ","수집품 진열장":"コレクション棚","독서 의자":"読書椅子","반려동물 장난감":"ペットのおもちゃ","러닝머신":"ランニングマシン","냉장고":"冷蔵庫","조리대":"調理台","식탁":"食卓","오븐":"オーブン","커피머신":"コーヒーメーカー","식기세척기":"食器洗い機","에스프레소 머신":"エスプレッソマシン","티 세트":"ティーセット","제빵 도구":"製菓道具","칵테일 바":"カクテルバー","와인 냉장고":"ワインセラー","향신료 선반":"スパイス棚","요리책 선반":"料理本棚","신발장":"靴箱","전신거울":"全身鏡","우산꽂이":"傘立て","반려동물 산책용품":"ペット散歩用品","자전거 보관대":"自転車ラック","운동 장비 선반":"運動用品棚","캠핑 장비":"キャンプ用品","샤워부스":"シャワー","욕조":"浴槽","세면대":"洗面台","세탁기":"洗濯機","건조기":"乾燥機","입욕제 선반":"入浴剤棚","향수 선반":"香水棚","스킨케어 선반":"スキンケア棚","침대":"ベッド","옷장":"クローゼット","화장대":"ドレッサー","협탁":"ベッドサイドテーブル","빔프로젝터":"プロジェクター","독서등":"読書灯","향수 진열대":"香水ディスプレイ","레코드 플레이어":"レコードプレーヤー","작은 게임기":"小型ゲーム機","봉제인형":"ぬいぐるみ","책상":"机","컴퓨터":"パソコン","피아노":"ピアノ","기타":"ギター","그림 도구":"画材","재봉틀":"ミシン","운동기구":"運動器具","디지털 드로잉 장비":"デジタル作画機材","촬영 장비":"撮影機材","보드게임 선반":"ボードゲーム棚","공예 도구":"工作道具","뜨개 도구":"編み物道具","프라모델 작업대":"模型作業台","천체망원경":"天体望遠鏡","악기":"楽器","의자":"椅子","찬장":"食器棚","티 테이블":"ティーテーブル","와인장":"ワイン棚","수납장":"収納棚","놀이 매트":"プレイマット","기저귀 교환대":"おむつ交換台","옷걸이":"衣類ラック","작은 책상":"小さな机","작업대":"作業台","화분":"鉢植え","야외 의자":"屋外椅子","작은 테이블":"小さなテーブル","빨래 건조대":"物干し台","원예 도구":"園芸道具","캠핑 의자":"キャンプ椅子","선반":"棚","보관 상자":"収納箱","수집품 상자":"コレクション箱","아기 침대":"ベビーベッド"}
};
export const furnitureLabel=(item,locale="ko")=>LABELS[locale]?.[String(item||"")]||String(item||"");

export function normalizeFurniturePlacement(value,index=0){
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const item=String(value.item||"").trim().slice(0,80);
  if(!item)return null;
  const rotation=((Number(value.rotation)||0)%360+540)%360-180;
  return {
    id:String(value.id||`furniture-${index+1}`).slice(0,120),
    item,
    x:clamp(value.x,6,94),
    y:clamp(value.y,14,90),
    scale:clamp(value.scale||1,.55,1.8),
    layer:Math.round(clamp(value.layer??index,0,20)),
    rotation:Number(rotation.toFixed(2))
  };
}

export function normalizeFurniturePlacements(value){
  if(!Array.isArray(value))return [];
  const seen=new Set();
  return value.map(normalizeFurniturePlacement).filter(item=>item&&!seen.has(item.id)&&(seen.add(item.id),true)).slice(0,80);
}

const START_SLOTS=[[22,34],[50,34],[78,34],[28,62],[58,62],[82,66],[18,80],[46,80],[72,80]];
export function newFurniturePlacement(id,item,index=0){
  const [x,y]=START_SLOTS[Math.max(0,Number(index)||0)%START_SLOTS.length];
  return normalizeFurniturePlacement({id,item,x,y,scale:1,rotation:0,layer:Math.min(20,index)},index);
}
