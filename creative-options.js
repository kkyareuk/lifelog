// Creative settings are optional. Diagnoses never imply violence, morality,
// professional qualifications, or a fixed personality/mood.
export const MARTIAL_ARTS=["격투기","태권도","권법","검술","창술"];
export const MENTAL_HEALTH=["우울장애","외상 후 스트레스 장애(PTSD)","사회불안장애","불안장애","공황장애","강박장애","양극성장애","기타 정신건강 상태"];
export const CARE_MODES=["설정하지 않음","외래 통원","낮 병동","입원","재택 회복"];
export const SHOES=["로퍼","비즈니스 슈즈","옥스퍼드 슈즈","더비 슈즈","몽크 스트랩","전통 신발","게타","잇폰바게타","조리","짚신"];
export const TRADITIONAL_CLOTHES=["전통복","한복","기모노","유카타","하카마","무녀복"];
export const EXTRA_FAMILY=["조부모·손자녀","친척","그 외 가족","보호자·피보호자","같은 가문","선택한 가족"];
export const EXTRA_DRINKS=["소다","모히토","무알코올 모히토","에이드","스무디"];
export const creativeCopy=[
 ["격투기","Martial arts","格闘技"],["태권도","Taekwondo","テコンドー"],["권법","Unarmed martial arts","拳法"],["검술","Swordsmanship","剣術"],["창술","Spear training","槍術"],
 ["우울장애","Depressive disorder","うつ病"],["외상 후 스트레스 장애(PTSD)","Post-traumatic stress disorder (PTSD)","心的外傷後ストレス障害（PTSD）"],["사회불안장애","Social anxiety disorder","社交不安症"],["불안장애","Anxiety disorder","不安症"],["공황장애","Panic disorder","パニック症"],["강박장애","Obsessive-compulsive disorder","強迫症"],["양극성장애","Bipolar disorder","双極性障害"],["기타 정신건강 상태","Other mental health condition","その他の精神的な健康状態"],
 ["정신건강","Mental health","メンタルヘルス"],["정신건강 설정","Mental health settings","精神的な健康の設定"],["정신건강 지식","Mental health knowledge","精神保健の知識"],["심리학","Psychology","心理学"],["치료 형태","Care arrangement","治療の形態"],["치료 요일","Care days","治療を受ける曜日"],["치료 시작","Care starts","治療開始"],["귀가 시각","Return home","帰宅時刻"],["치료 장소","Care location","治療を受ける場所"],["외래 통원","Outpatient visits","外来通院"],["낮 병동","Day hospital","デイホスピタル"],["입원","Inpatient stay","入院"],["재택 회복","Recovery at home","自宅での療養"],
 ["필요한 지원","Preferred support","希望するサポート"],["조용한 공간","Quiet space","静かな場所"],["예고 후 다가오기","Approach after letting them know","声をかけてから近づく"],["휴식 시간","Rest breaks","休憩時間"],["동행 지원","Accompaniment","付き添い"],
 ["여러 상태를 함께 선택할 수 있어요. 진단명으로 성격이나 기분을 고정하지 않으며, 치료 일정은 직접 정해요.","You can select several conditions. Diagnoses do not fix personality or mood; set care schedules yourself.","複数選択できます。診断名で性格や気分は固定されません。治療の予定は自分で設定します。"],
 ["로퍼","Loafers","ローファー"],["비즈니스 슈즈","Business shoes","ビジネスシューズ"],["옥스퍼드 슈즈","Oxford shoes","オックスフォードシューズ"],["더비 슈즈","Derby shoes","ダービーシューズ"],["몽크 스트랩","Monk-strap shoes","モンクストラップ"],["전통 신발","Traditional footwear","伝統的な履物"],["게타","Geta","下駄"],["잇폰바게타","Single-tooth geta","一本歯下駄"],["조리","Zori","草履"],["짚신","Straw sandals","草鞋"],
 ["전통복","Traditional clothing","伝統衣装"],["한복","Hanbok","韓服"],["기모노","Kimono","着物"],["유카타","Yukata","浴衣"],["하카마","Hakama","袴"],["무녀복","Miko attire","巫女装束"],["단벌신사","Wears the same outfit","いつも同じ服を着る"],
 ["조부모·손자녀","Grandparent and grandchild","祖父母と孫"],["친척","Relatives","親戚"],["그 외 가족","Other family","その他の家族"],["보호자·피보호자","Guardian and dependent","保護者と被保護者"],["같은 가문","Same family line","同じ一族"],["선택한 가족","Chosen family","選んだ家族"],
 ["나의 역할·호칭","My role / title","自分の役割・呼称"],["상대의 역할·호칭","Their role / title","相手の役割・呼称"],["혈연·법적 관계와 별개로 역할을 적을 수 있고, 같은 두 사람에게 여러 관계를 함께 설정할 수 있어요.","Roles can differ from biological or legal ties. The same pair can have multiple relationships.","血縁や法的関係とは別に役割を記入でき、同じ二人に複数の関係を設定できます。"],
 ["소다","Soda","ソーダ"],["모히토","Mojito","モヒート"],["무알코올 모히토","Alcohol-free mojito","ノンアルコールモヒート"],["에이드","Fruit ade","フルーツエード"],["스무디","Smoothie","スムージー"],
 ["사전은 항목 종류마다 80개까지 추가할 수 있어요.","Each dictionary category can contain up to 80 items.","辞典は種類ごとに80件まで追加できます。"]
];
export function careRoutineFor(character,date,world){
 const profile=character.bodyProfile||{},stored=profile.carePlan||{},weekdays=["월","화","수","목","금"];
 const plan=profile.hospitalVisitFrequency==="평일 전부"?{...stored,mode:stored.mode&&stored.mode!=="설정하지 않음"?stored.mode:"외래 통원",weekdays,end:stored.mode&&stored.mode!=="설정하지 않음"?stored.end:"10:00"}:stored;
 if(!plan||!CARE_MODES.includes(plan.mode)||["설정하지 않음","재택 회복"].includes(plan.mode))return null;
 const weekday=["일","월","화","수","목","금","토"][date.getDay()];
 if(plan.mode!=="입원"&&!(plan.weekdays||[]).includes(weekday))return null;
 const places=(world.towns||[]).flatMap(t=>t.places||[]);
 const place=places.find(p=>p.id===plan.placeId)||places.find(p=>/병원|의원|클리닉/.test(`${p.name} ${p.type}`));
 if(!place)return null;
 const start=plan.mode==="입원"?"00:00":plan.start||"09:00",end=plan.mode==="입원"?"23:59":plan.end||"16:00";
 const purposes=hospitalPurposes(profile),department=(profile.hospitalDepartments||[]).join(" · "),description=[department,...purposes].filter(Boolean).join(" · ");
 return {id:`care-${character.id}`,day:date.getDay(),start,end,title:description|| (plan.mode==="낮 병동"?"낮 병동 프로그램":plan.mode==="입원"?"병원에서 치료와 휴식":"외래 진료"),placeId:place.id,withIds:[],careSchedule:true};
}

export const HOSPITAL_DEPARTMENTS=['종합병원','정신과','내과','외과','이비인후과','정형외과','피부과','치과','안과','한의원'];
export const hospitalPurposes=profile=>Array.isArray(profile?.hospitalVisitPurposes)?profile.hospitalVisitPurposes.filter(x=>x&&x!=='설정하지 않음'):profile?.hospitalVisitPurpose&&profile.hospitalVisitPurpose!=='설정하지 않음'?[profile.hospitalVisitPurpose]:[];
creativeCopy.push(['평일 전부','Every weekday','平日すべて'],['직접 정한 요일','Selected weekdays','指定した曜日'],['평일 전체 선택','Select all weekdays','平日をすべて選択'],['정신과','Psychiatry','精神科'],['진료 분야','Medical departments','診療科'],['병원 방문 목적','Hospital visit purposes','受診目的'],['입원 치료','Inpatient treatment','入院治療'],['통원 치료','Outpatient treatment','通院治療']);
