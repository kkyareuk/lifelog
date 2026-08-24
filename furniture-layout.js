const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));

export const HOUSE_FURNITURE_GRID=Object.freeze({columns:12,rows:16});
export const FURNITURE_PROPS=Object.freeze(["책","화분","향수","액자","컵","인형","수집품","조명"]);
const footprint=(columns,rows)=>Object.freeze({columns,rows});
export const FURNITURE_FOOTPRINTS=Object.freeze({
  "소파":footprint(3,1),"TV":footprint(2,1),"책장":footprint(2,2),"오디오":footprint(2,1),"안마의자":footprint(2,2),"게임기":footprint(1,1),"캣타워":footprint(2,2),"턴테이블":footprint(2,1),"보드게임장":footprint(2,2),"홈시어터":footprint(3,2),"프로젝터":footprint(1,1),"악기 진열장":footprint(2,2),"수집품 진열장":footprint(2,2),"독서 의자":footprint(2,2),"반려동물 장난감":footprint(1,1),"러닝머신":footprint(2,2),
  "냉장고":footprint(1,2),"조리대":footprint(3,1),"식탁":footprint(3,2),"오븐":footprint(1,2),"커피머신":footprint(1,1),"식기세척기":footprint(1,2),"에스프레소 머신":footprint(1,1),"티 세트":footprint(1,1),"제빵 도구":footprint(2,1),"칵테일 바":footprint(2,2),"와인 냉장고":footprint(1,2),"향신료 선반":footprint(2,1),"요리책 선반":footprint(2,2),
  "신발장":footprint(2,1),"전신거울":footprint(1,2),"우산꽂이":footprint(1,1),"반려동물 산책용품":footprint(1,1),"자전거 보관대":footprint(2,2),"운동 장비 선반":footprint(2,2),"운동 장비":footprint(2,2),"캠핑 장비":footprint(2,2),
  "샤워부스":footprint(2,2),"욕조":footprint(3,1),"세면대":footprint(2,1),"세탁기":footprint(1,2),"건조기":footprint(1,2),"입욕제 선반":footprint(2,1),"향수 선반":footprint(2,1),"스킨케어 선반":footprint(2,1),
  "침대":footprint(2,2),"커플 침대":footprint(3,2),"아기 침대":footprint(2,2),"옷장":footprint(2,2),"화장대":footprint(2,2),"협탁":footprint(1,1),"빔프로젝터":footprint(1,1),"독서등":footprint(1,2),"향수 진열대":footprint(2,1),"레코드 플레이어":footprint(1,1),"작은 게임기":footprint(1,1),"봉제인형":footprint(1,1),
  "책상":footprint(2,2),"작은 책상":footprint(2,1),"컴퓨터":footprint(2,1),"피아노":footprint(3,2),"기타":footprint(1,2),"그림 도구":footprint(2,2),"재봉틀":footprint(2,2),"운동기구":footprint(2,2),"디지털 드로잉 장비":footprint(2,2),"촬영 장비":footprint(2,2),"보드게임 선반":footprint(2,2),"공예 도구":footprint(2,2),"뜨개 도구":footprint(1,1),"프라모델 작업대":footprint(2,2),"천체망원경":footprint(2,2),"악기":footprint(3,2),
  "의자":footprint(1,1),"야외 의자":footprint(1,1),"캠핑 의자":footprint(1,1),"찬장":footprint(2,2),"티 테이블":footprint(2,1),"와인장":footprint(2,2),"수납장":footprint(2,1),"선반":footprint(2,2),"보관 상자":footprint(2,1),"수집품 상자":footprint(2,1),"옷걸이":footprint(2,2),"놀이 매트":footprint(2,2),"기저귀 교환대":footprint(2,2),"작업대":footprint(2,2),"화분":footprint(1,2),"작은 테이블":footprint(1,1),"빨래 건조대":footprint(3,1),"원예 도구":footprint(1,1)
});

const SPRITE_ATLASES=[
  ["소파","TV","책장","오디오","안마의자","게임기","캣타워","턴테이블","보드게임장","홈시어터","프로젝터","악기 진열장","수집품 진열장","독서 의자","반려동물 장난감","러닝머신","냉장고","조리대","식탁","오븐"],
  ["커피머신","식기세척기","티 세트","제빵 도구","칵테일 바","와인 냉장고","향신료 선반","요리책 선반","신발장","전신거울","우산꽂이","자전거 보관대","운동 장비 선반","캠핑 장비","샤워부스","욕조","세면대","세탁기","건조기","입욕제 선반"],
  ["침대","커플 침대","옷장","화장대","협탁","독서등","레코드 플레이어","작은 게임기","봉제인형","책상","컴퓨터","피아노","기타","그림 도구","재봉틀","운동기구","디지털 드로잉 장비","촬영 장비","보드게임 선반","공예 도구"],
  ["뜨개 도구","프라모델 작업대","천체망원경","악기","의자","찬장","티 테이블","와인장","수납장","놀이 매트","기저귀 교환대","옷걸이","작은 책상","작업대","화분","야외 의자","작은 테이블","빨래 건조대","원예 도구","캠핑 의자"]
];
const FURNITURE_SPRITES=Object.fromEntries(SPRITE_ATLASES.flatMap((items,atlasIndex)=>items.map((item,itemIndex)=>[item,`./assets/home-furniture/sprites/furniture-${String(atlasIndex+1).padStart(2,"0")}-${String(itemIndex+1).padStart(2,"0")}.png`])));
Object.assign(FURNITURE_SPRITES,{"에스프레소 머신":FURNITURE_SPRITES["커피머신"],"반려동물 산책용품":FURNITURE_SPRITES["반려동물 장난감"],"운동 장비":FURNITURE_SPRITES["운동 장비 선반"],"향수 선반":FURNITURE_SPRITES["입욕제 선반"],"스킨케어 선반":FURNITURE_SPRITES["입욕제 선반"],"향수 진열대":FURNITURE_SPRITES["입욕제 선반"],"빔프로젝터":FURNITURE_SPRITES["프로젝터"],"선반":FURNITURE_SPRITES["책장"],"보관 상자":FURNITURE_SPRITES["수납장"],"수집품 상자":FURNITURE_SPRITES["수집품 진열장"],"아기 침대":FURNITURE_SPRITES["침대"]});
const PROP_ICONS={책:"📕",화분:"🪴",향수:"🧴",액자:"🖼️",컵:"☕",인형:"🧸",수집품:"🏺",조명:"💡"};
const PROP_LABELS={
  en:{책:"Book",화분:"Plant",향수:"Perfume",액자:"Frame",컵:"Cup",인형:"Doll",수집품:"Collectible",조명:"Lamp"},
  ja:{책:"本",화분:"鉢植え",향수:"香水",액자:"写真立て",컵:"カップ",인형:"人形",수집품:"コレクション",조명:"照明"}
};
const PROP_SURFACE_PATTERN=/(선반|책장|진열|수납장|신발장|찬장|와인장|책상|테이블|협탁|화장대|조리대|작업대|식탁|바)$/;

export const FURNITURE_CATALOG=Object.freeze({
  living:["소파","TV","책장","오디오","안마의자","게임기","캣타워","턴테이블","보드게임장","홈시어터","프로젝터","악기 진열장","수집품 진열장","독서 의자","반려동물 장난감","러닝머신"],
  kitchen:["냉장고","조리대","식탁","오븐","커피머신","식기세척기","에스프레소 머신","티 세트","제빵 도구","칵테일 바","와인 냉장고","향신료 선반","요리책 선반"],
  entry:["신발장","전신거울","우산꽂이","반려동물 산책용품","자전거 보관대","운동 장비 선반","캠핑 장비"],
  bath:["샤워부스","욕조","세면대","세탁기","건조기","입욕제 선반","향수 선반","스킨케어 선반"],
  bedroom:["침대","커플 침대","옷장","화장대","협탁","빔프로젝터","독서등","향수 진열대","레코드 플레이어","작은 게임기","봉제인형","수집품 진열장"],
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
  "침대":"🛏️","커플 침대":"🛏️","아기 침대":"🛏️","옷장":"👗","화장대":"💄","협탁":"🗄️","빔프로젝터":"📽️","독서등":"🛋️","향수 진열대":"🧴","레코드 플레이어":"💿","작은 게임기":"🕹️","봉제인형":"🧸",
  "책상":"🗃️","작은 책상":"🗃️","컴퓨터":"🖥️","피아노":"🎹","기타":"🎸","그림 도구":"🎨","재봉틀":"🧵","운동기구":"🏋️","디지털 드로잉 장비":"🖌️","촬영 장비":"📷","보드게임 선반":"🎲","공예 도구":"✂️","뜨개 도구":"🧶","프라모델 작업대":"🛠️","천체망원경":"🔭","악기":"🎼",
  "의자":"🪑","야외 의자":"🪑","캠핑 의자":"🪑","찬장":"🗄️","티 테이블":"🫖","와인장":"🍷","수납장":"🗄️","선반":"🗄️","보관 상자":"📦","수집품 상자":"📦","옷걸이":"🧥","놀이 매트":"🧩","기저귀 교환대":"🍼","작업대":"🛠️","화분":"🪴","작은 테이블":"🪑","빨래 건조대":"👕","원예 도구":"🌱"
};

export const furnitureIcon=item=>ICONS[String(item||"")]||"🪑";
export const furnitureSprite=item=>FURNITURE_SPRITES[String(item||"")]||FURNITURE_SPRITES["의자"];
export const furnitureCatalogForRoom=type=>FURNITURE_CATALOG[type]||FURNITURE_CATALOG.other;
export const furniturePropIcon=item=>PROP_ICONS[String(item||"")]||"✨";
export const furniturePropLabel=(item,locale="ko")=>PROP_LABELS[locale]?.[String(item||"")]||String(item||"");
export const supportsFurnitureProps=item=>PROP_SURFACE_PATTERN.test(String(item||"").trim());

export function furnitureGridForRoom(roomRect,canvasRect){
  const canvasWidth=Math.max(1,Number(canvasRect?.width)||Number(roomRect?.width)||1);
  const canvasHeight=Math.max(1,Number(canvasRect?.height)||Number(roomRect?.height)||1);
  return {
    columns:Math.max(1,Math.round((Math.max(1,Number(roomRect?.width)||1)/canvasWidth)*HOUSE_FURNITURE_GRID.columns)),
    rows:Math.max(1,Math.round((Math.max(1,Number(roomRect?.height)||1)/canvasHeight)*HOUSE_FURNITURE_GRID.rows))
  };
}

export function snapFurniturePosition(x,y,grid={},itemFootprint={columns:1,rows:1}){
  const columns=Math.max(1,Math.round(Number(grid.columns)||4)),rows=Math.max(1,Math.round(Number(grid.rows)||4));
  const width=Math.max(1,Math.min(columns,Math.round(Number(itemFootprint.columns)||1))),height=Math.max(1,Math.min(rows,Math.round(Number(itemFootprint.rows)||1)));
  const column=Math.round(clamp(x,0,100)/100*columns-width/2),row=Math.round(clamp(y,0,100)/100*rows-height/2);
  const startColumn=clamp(column,0,columns-width),startRow=clamp(row,0,rows-height);
  return {
    x:Number((((startColumn+width/2)/columns)*100).toFixed(4)),
    y:Number((((startRow+height/2)/rows)*100).toFixed(4)),
    column:startColumn,row:startRow
  };
}

export function normalizeFurnitureProp(value,index=0){
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const item=String(value.item||"").trim().slice(0,40);if(!FURNITURE_PROPS.includes(item))return null;
  return {id:String(value.id||`prop-${index+1}`).slice(0,120),item,slot:Math.round(clamp(value.slot??index,0,3))};
}
export function normalizeFurnitureProps(value){
  if(!Array.isArray(value))return [];
  const seen=new Set();
  return value.map(normalizeFurnitureProp).filter(item=>item&&!seen.has(item.id)&&(seen.add(item.id),true)).slice(0,4);
}
export const newFurnitureProp=(id,item,index=0)=>normalizeFurnitureProp({id,item,slot:index},index);

const LABELS={
  en:{"소파":"Sofa","TV":"TV","책장":"Bookcase","오디오":"Audio system","안마의자":"Massage chair","게임기":"Game console","캣타워":"Cat tower","턴테이블":"Turntable","보드게임장":"Board game table","홈시어터":"Home theater","프로젝터":"Projector","악기 진열장":"Instrument display","수집품 진열장":"Collection display","독서 의자":"Reading chair","반려동물 장난감":"Pet toys","러닝머신":"Treadmill","냉장고":"Refrigerator","조리대":"Kitchen counter","식탁":"Dining table","오븐":"Oven","커피머신":"Coffee machine","식기세척기":"Dishwasher","에스프레소 머신":"Espresso machine","티 세트":"Tea set","제빵 도구":"Baking tools","칵테일 바":"Cocktail bar","와인 냉장고":"Wine fridge","향신료 선반":"Spice rack","요리책 선반":"Cookbook shelf","신발장":"Shoe cabinet","전신거울":"Full-length mirror","우산꽂이":"Umbrella stand","반려동물 산책용품":"Pet walking gear","자전거 보관대":"Bike rack","운동 장비 선반":"Exercise rack","캠핑 장비":"Camping gear","샤워부스":"Shower","욕조":"Bathtub","세면대":"Sink","세탁기":"Washing machine","건조기":"Dryer","입욕제 선반":"Bath shelf","향수 선반":"Perfume shelf","스킨케어 선반":"Skincare shelf","침대":"Bed","옷장":"Wardrobe","화장대":"Vanity","협탁":"Bedside table","빔프로젝터":"Beam projector","독서등":"Reading lamp","향수 진열대":"Perfume display","레코드 플레이어":"Record player","작은 게임기":"Mini console","봉제인형":"Plush toy","책상":"Desk","컴퓨터":"Computer","피아노":"Piano","기타":"Guitar","그림 도구":"Art supplies","재봉틀":"Sewing machine","운동기구":"Exercise equipment","디지털 드로잉 장비":"Digital art setup","촬영 장비":"Camera gear","보드게임 선반":"Board game shelf","공예 도구":"Craft tools","뜨개 도구":"Knitting tools","프라모델 작업대":"Model workbench","천체망원경":"Telescope","악기":"Instrument","의자":"Chair","찬장":"Cupboard","티 테이블":"Tea table","와인장":"Wine cabinet","수납장":"Storage cabinet","놀이 매트":"Play mat","기저귀 교환대":"Changing table","옷걸이":"Clothes rack","작은 책상":"Small desk","작업대":"Workbench","화분":"Plant","야외 의자":"Outdoor chair","작은 테이블":"Small table","빨래 건조대":"Drying rack","원예 도구":"Gardening tools","캠핑 의자":"Camping chair","선반":"Shelf","보관 상자":"Storage box","수집품 상자":"Collection box","아기 침대":"Crib"},
  ja:{"소파":"ソファ","TV":"テレビ","책장":"本棚","오디오":"オーディオ","안마의자":"マッサージチェア","게임기":"ゲーム機","캣타워":"キャットタワー","턴테이블":"ターンテーブル","보드게임장":"ボードゲーム台","홈시어터":"ホームシアター","프로젝터":"プロジェクター","악기 진열장":"楽器ディスプレイ","수집품 진열장":"コレクション棚","독서 의자":"読書椅子","반려동물 장난감":"ペットのおもちゃ","러닝머신":"ランニングマシン","냉장고":"冷蔵庫","조리대":"調理台","식탁":"食卓","오븐":"オーブン","커피머신":"コーヒーメーカー","식기세척기":"食器洗い機","에스프레소 머신":"エスプレッソマシン","티 세트":"ティーセット","제빵 도구":"製菓道具","칵테일 바":"カクテルバー","와인 냉장고":"ワインセラー","향신료 선반":"スパイス棚","요리책 선반":"料理本棚","신발장":"靴箱","전신거울":"全身鏡","우산꽂이":"傘立て","반려동물 산책용품":"ペット散歩用品","자전거 보관대":"自転車ラック","운동 장비 선반":"運動用品棚","캠핑 장비":"キャンプ用品","샤워부스":"シャワー","욕조":"浴槽","세면대":"洗面台","세탁기":"洗濯機","건조기":"乾燥機","입욕제 선반":"入浴剤棚","향수 선반":"香水棚","스킨케어 선반":"スキンケア棚","침대":"ベッド","옷장":"クローゼット","화장대":"ドレッサー","협탁":"ベッドサイドテーブル","빔프로젝터":"プロジェクター","독서등":"読書灯","향수 진열대":"香水ディスプレイ","레코드 플레이어":"レコードプレーヤー","작은 게임기":"小型ゲーム機","봉제인형":"ぬいぐるみ","책상":"机","컴퓨터":"パソコン","피아노":"ピアノ","기타":"ギター","그림 도구":"画材","재봉틀":"ミシン","운동기구":"運動器具","디지털 드로잉 장비":"デジタル作画機材","촬영 장비":"撮影機材","보드게임 선반":"ボードゲーム棚","공예 도구":"工作道具","뜨개 도구":"編み物道具","프라모델 작업대":"模型作業台","천체망원경":"天体望遠鏡","악기":"楽器","의자":"椅子","찬장":"食器棚","티 테이블":"ティーテーブル","와인장":"ワイン棚","수납장":"収納棚","놀이 매트":"プレイマット","기저귀 교환대":"おむつ交換台","옷걸이":"衣類ラック","작은 책상":"小さな机","작업대":"作業台","화분":"鉢植え","야외 의자":"屋外椅子","작은 테이블":"小さなテーブル","빨래 건조대":"物干し台","원예 도구":"園芸道具","캠핑 의자":"キャンプ椅子","선반":"棚","보관 상자":"収納箱","수집품 상자":"コレクション箱","아기 침대":"ベビーベッド"}
};
Object.assign(LABELS.en,{"커플 침대":"Couple bed"});
Object.assign(LABELS.ja,{"커플 침대":"ダブルベッド"});
export const furnitureLabel=(item,locale="ko")=>LABELS[locale]?.[String(item||"")]||String(item||"");
export const isBedFurniture=item=>/침대/.test(String(item||""));
export const furnitureCapacity=item=>String(item||"")==="커플 침대"?2:isBedFurniture(item)?1:0;
export const furnitureFootprint=item=>FURNITURE_FOOTPRINTS[String(item||"")]||footprint(1,1);

export function normalizeFurniturePlacement(value,index=0){
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const item=String(value.item||"").trim().slice(0,80);
  if(!item)return null;
  const rotation=((Number(value.rotation)||0)%360+540)%360-180;
  return {
    id:String(value.id||`furniture-${index+1}`).slice(0,120),
    item,
    x:clamp(value.x,.5,99.5),
    y:clamp(value.y,.5,99.5),
    scale:clamp(value.scale||1,.55,1.8),
    layer:Math.round(clamp(value.layer??index,0,20)),
    rotation:Number(rotation.toFixed(2)),
    props:supportsFurnitureProps(item)?normalizeFurnitureProps(value.props):[],
    assignedCharacterIds:isBedFurniture(item)?[...new Set((Array.isArray(value.assignedCharacterIds)?value.assignedCharacterIds:[]).map(String).filter(Boolean))].slice(0,furnitureCapacity(item)):[]
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
  const footprint=furnitureFootprint(item),snapped=snapFurniturePosition(x,y,{columns:4,rows:4},footprint);
  return normalizeFurniturePlacement({id,item,x:snapped.x,y:snapped.y,scale:1,rotation:0,layer:Math.min(20,index),props:[],assignedCharacterIds:[]},index);
}
