// Default interiors use ordinary editable room/furniture data. Saved layouts win.
const room=(names,type,items)=>({names,type,items});
const lobby=()=>room(['로비','Lobby','ロビー'],'living',['카운터','소파','작은 테이블','화분']);
const bathroom=()=>room(['화장실','Restroom','お手洗い'],'bathroom',['세면대','변기']);
const presets={
 '병원':[room(['접수·대기실','Reception and waiting','受付・待合室'],'living',['카운터','컴퓨터','소파','의자']),room(['진료실','Consultation room','診察室'],'study',['책상','의자','침대','수납장']),room(['병동','Ward','病棟'],'bedroom',['1인 침대','협탁','1인 침대','협탁']),bathroom()],
 '카페':[room(['카페 좌석','Cafe seating','カフェ席'],'dining',['식탁','의자','의자','식탁','의자','의자']),room(['주문·커피 바','Order and coffee bar','注文・コーヒーバー'],'kitchen',['카운터','커피머신','커피포트','티 세트','찬장']),room(['직원 휴게실','Staff room','スタッフルーム'],'living',['소파','작은 테이블','옷걸이']),bathroom()],
 '음식점':[room(['식사 공간','Dining area','客席'],'dining',['식탁','의자','의자','식탁','의자','의자']),room(['주방','Kitchen','厨房'],'kitchen',['조리대','인덕션','냉장고','오븐','찬장']),lobby(),bathroom()],
 '학교':[room(['교실','Classroom','教室'],'study',['책상','의자','책상','의자','책장']),room(['교무실','Teachers office','職員室'],'study',['책상','컴퓨터','책장','의자']),room(['도서실','Reading room','図書室'],'study',['책장','책장','작은 테이블','의자']),bathroom()],
 '도서관':[room(['열람실','Reading hall','閲覧室'],'study',['책상','의자','책상','의자']),room(['서가','Book stacks','書架'],'study',['책장','책장','책장','독서 의자']),lobby(),bathroom()],
 '사무실':[room(['사무 공간','Workspace','執務室'],'study',['책상','컴퓨터','의자','책상','컴퓨터','의자']),room(['회의실','Meeting room','会議室'],'dining',['식탁','의자','의자','의자']),lobby(),bathroom()],
 '관공서':[room(['민원 창구','Service desk','窓口'],'study',['카운터','컴퓨터','의자','의자']),room(['사무실','Office','事務室'],'study',['책상','컴퓨터','수납장','의자']),lobby(),bathroom()],
 '숙박':[lobby(),room(['객실 1','Guest room 1','客室1'],'guest',['침대','협탁','옷장']),room(['객실 2','Guest room 2','客室2'],'guest',['침대','협탁','작은 책상']),bathroom()],
 '옷가게':[room(['매장','Showroom','売り場'],'storage',['옷걸이','옷걸이','선반','카운터']),room(['피팅룸','Fitting room','試着室'],'bedroom',['전신거울','옷걸이','의자']),room(['재고실','Stockroom','倉庫'],'storage',['선반','보관 상자','보관 상자']),bathroom()],
 '상점':[room(['판매 공간','Shop floor','売り場'],'storage',['선반','선반','수납장','카운터']),room(['창고','Stockroom','倉庫'],'storage',['선반','보관 상자','보관 상자']),lobby(),bathroom()],
 '공연장':[room(['무대','Stage','舞台'],'hobby',['피아노','악기','오디오']),room(['관객석','Audience seats','客席'],'living',['의자','의자','의자','의자','의자','의자']),room(['대기실','Backstage','楽屋'],'bedroom',['화장대','옷걸이','소파']),bathroom()],
 '공원':[room(['쉼터','Rest area','休憩所'],'balcony',['화분','야외 의자','작은 테이블','화분']),room(['정원','Garden','庭園'],'balcony',['화분','화분 2','야외 의자','원예 도구']),lobby(),bathroom()]
};
export function defaultBuildingRooms(place,language='ko'){
 const specs=presets[place.type]||[lobby(),room(['다목적실','Common room','多目的室'],'hobby',['작업대','책장','의자']),room(['휴게실','Lounge','休憩室'],'living',['소파','작은 테이블','화분']),bathroom()];
 return Object.fromEntries(specs.map((spec,index)=>{const key='area'+index,dining=spec.type==='dining'&&spec.items.length===6,positions=dining?[[50,35],[23,35],[77,35],[50,72],[23,72],[77,72]]:[[22,36],[55,36],[80,36],[22,72],[55,72],[80,72]],placements=spec.items.map((item,i)=>({id:key+'-f'+i,item,x:positions[i][0],y:positions[i][1],rotation:0,scale:1,...(dining&&item==='의자'?{tableId:key+'-f'+(i<3?0:3)}:{})}));return [key,{name:spec.names[({ko:0,en:1,ja:2})[language]||0],type:spec.type,floor:1,floorMaterial:place.type==='병원'||spec.type==='bathroom'?'cream':'natural',wallMaterial:place.type==='병원'||spec.type==='bathroom'?'sky-tile':'cream-panel',size:'넓은 방',layout:{x:index%2*50,y:Math.floor(index/2)*50,w:50,h:50},furniture:[...spec.items],furniturePlacements:placements}] }));
}
