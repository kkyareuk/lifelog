const tri=(ko,en,ja)=>({ko,en,ja});
const options=rows=>rows.map(([ko,en,ja])=>({value:ko,text:tri(ko,en,ja)}));
export const RECORD_OPTIONS={
 location:options([['왼팔','Left arm','左腕'],['오른팔','Right arm','右腕'],['왼손','Left hand','左手'],['오른손','Right hand','右手'],['왼쪽 어깨','Left shoulder','左肩'],['오른쪽 어깨','Right shoulder','右肩'],['등 전체','Full back','背中全体'],['배·옆구리','Abdomen or side','腹・脇腹'],['왼쪽 허벅지','Left thigh','左太もも'],['오른쪽 종아리','Right calf','右ふくらはぎ'],['기타 위치','Other location','その他の場所']]),
 type:options([['설정하지 않음','Unspecified','未設定'],['문자·문구','Lettering','文字'],['기하학 무늬','Geometric','幾何学模様'],['꽃·식물','Flowers or plants','花・植物'],['동물','Animal','動物'],['상징·문장','Symbol or crest','象徴・紋章'],['추상 무늬','Abstract','抽象模様'],['기타 문신','Other tattoo','その他']]),
 attitude:options([['설정하지 않음','Unspecified','未設定'],['아끼며 드러내고 싶어함','Treasure it and want to show it','大切で見せたい'],['자연스럽게 받아들임','Accept it naturally','自然に受け入れている'],['별다른 생각이 없음','Feel neutral','特に何も思わない'],['남에게 보이는 것을 꺼림','Dislike showing it','人に見せたくない'],['가리고 싶어함','Want to hide it','隠したい'],['없애고 싶어함','Want to remove it','消したい'],['그때의 기억을 떠올림','Recall that time','当時を思い出す'],['자신만의 의미를 부여함','Give it personal meaning','自分なりの意味がある']]),
 purpose:options([['설정하지 않음','Unspecified','未設定'],['통증 조절','Pain management','痛みの管理'],['알레르기 관리','Allergy management','アレルギー管理'],['호흡기 관리','Respiratory care','呼吸器管理'],['혈압 관리','Blood pressure management','血圧管理'],['혈당 관리','Blood sugar management','血糖管理'],['호르몬 관리','Hormone management','ホルモン管理'],['소화기 관리','Digestive care','消化器管理'],['수면 관리','Sleep management','睡眠管理'],['불안 완화','Anxiety relief','不安の緩和'],['기분 조절','Mood management','気分の調整'],['비타민·영양 보충','Nutritional supplements','栄養補給'],['기타','Other','その他']]),
 frequency:options([['설정하지 않음','Unspecified','未設定'],['필요할 때만','As needed','必要な時だけ'],['매일 아침','Every morning','毎朝'],['매일 점심','Every noon','毎昼'],['매일 저녁','Every evening','毎晩'],['취침 전','Before bed','就寝前'],['하루 1회','Once a day','一日一回'],['하루 2회','Twice a day','一日二回'],['하루 3회 이상','Three or more times daily','一日三回以上'],['주 1회','Weekly','週一回'],['정해진 주기마다','At scheduled intervals','決まった周期']]),
 department:options([['종합병원','General hospital','総合病院'],['정신과','Psychiatry','精神科'],['내과','Internal medicine','内科'],['외과','Surgery','外科'],['이비인후과','ENT','耳鼻科'],['정형외과','Orthopedics','整形外科'],['피부과','Dermatology','皮膚科'],['치과','Dentistry','歯科'],['안과','Ophthalmology','眼科'],['한의원','Korean medicine clinic','韓医院']]),
 visitPurpose:options([['정기 검진 · 상담 포함','Regular checkup','定期健診'],['통원 치료','Outpatient treatment','通院治療'],['상담·경과 확인','Consultation and follow-up','相談・経過確認'],['재활·회복 관리','Rehabilitation','リハビリ'],['처방·복약 조정','Prescription review','処方・服薬調整'],['예방접종','Vaccination','予防接種'],['치과 진료','Dental care','歯科診療'],['기타 진료','Other consultation','その他の診療']]),
 visitFrequency:options([['필요할 때 비정기적으로','As needed','必要な時に不定期'],['한 달에 한 번 이하','Monthly or less','月一回以下'],['주 1회 이상','Weekly or more','週一回以上'],['한 달에 여러 번','Several times monthly','月に数回'],['평일 전부','Every weekday','平日すべて']]),
 height:options([['키가 매우 작음','Very short','とても小柄'],['키가 작은 편','Rather short','小柄'],['평균적인 키','Average height','平均的な身長'],['키가 큰 편','Rather tall','長身'],['키가 매우 큼','Very tall','とても長身']]),
 build:options([['매우 마른 체형','Very slim','とても細身'],['마른 체형','Slim','細身'],['슬림한 체형','Slender','すらっとした体型'],['보통 체형','Average build','標準体型'],['통통한 체형','Plump','ふっくらした体型'],['비만 체형','Larger build','大きめの体型'],['근육질 체형','Muscular','筋肉質'],['탄탄한 체형','Toned','引き締まった体型']]),
 health:options([['당뇨병','Diabetes','糖尿病'],['고혈압','High blood pressure','高血圧'],['고지혈증','High cholesterol','脂質異常症'],['심혈관 질환','Cardiovascular condition','心血管疾患'],['천식','Asthma','喘息'],['관절 질환','Joint condition','関節疾患'],['만성 통증','Chronic pain','慢性疼痛'],['신장 질환','Kidney condition','腎疾患'],['기타 건강 상태','Other health condition','その他の健康状態']])
};
export const FORM_FIELDS={height:['bodyProfile.heightCm','bodyProfile.heightImpression'],weight:['bodyProfile.weightKg','bodyProfile.bodySize'],tattoos:['bodyProfile.tattoos'],medications:['bodyProfile.medications'],hospital:['bodyProfile.hospitalVisits','bodyProfile.hospitalVisitPurposes','bodyProfile.hospitalDepartments','bodyProfile.hospitalVisitFrequency'],checkup:['bodyProfile.heightCm','bodyProfile.heightImpression','bodyProfile.weightKg','bodyProfile.bodySize','bodyProfile.healthConditions','bodyProfile.healthOther','bodyProfile.hospitalVisits','bodyProfile.hospitalVisitPurposes','bodyProfile.hospitalDepartments','bodyProfile.hospitalVisitFrequency','bodyProfile.medications']};
const get=(c,path)=>path.split('.').reduce((v,k)=>v?.[k],c);
export function recordFormPatch(c,kind,payload,locked){
 if(!payload||!FORM_FIELDS[kind])return null;const fields=FORM_FIELDS[kind],patch={bodyProfile:structuredClone(c.bodyProfile||{})};let changed=false;
 const put=(key,value)=>{const path='bodyProfile.'+key;if(!fields.includes(path)||locked(c,path)||JSON.stringify(value)===JSON.stringify(c.bodyProfile?.[key]))return;patch.bodyProfile[key]=value;changed=true;};
 const allowed=(key,v)=>RECORD_OPTIONS[key].some(o=>o.value===v);
 for(const [key,value] of Object.entries(payload.values||{})){
  if(!fields.includes('bodyProfile.'+key))return null;
  if(locked(c,'bodyProfile.'+key))continue;
  if(payload.baseValues&&JSON.stringify(payload.baseValues[key])!==JSON.stringify(c.bodyProfile?.[key]))return null;
  if(['heightCm','weightKg'].includes(key)){const n=Number(value);if(value!==''&&(!Number.isFinite(n)||n<(key==='heightCm'?20:1)||n>300))return null;put(key,value===''?'':String(Math.round(n*10)/10));}
  else if(['heightImpression','bodySize'].includes(key)){if(value!==''&&!allowed(key==='bodySize'?'build':'height',value)&&value!==c.bodyProfile?.[key])return null;put(key,value||'설정하지 않음');}
  else if(key==='healthConditions'){if(!Array.isArray(value)||value.length>12||value.some(v=>!allowed('health',v)&&!c.bodyProfile?.healthConditions?.includes(v)))return null;put(key,[...new Set(value)]);}
  else if(key==='healthOther'){if(typeof value!=='string'||value.length>200)return null;put(key,value);}
 }
 for(const [key,rows] of Object.entries(payload.records||{})){
  if(!fields.includes('bodyProfile.'+key))return null;if(locked(c,'bodyProfile.'+key))continue;
  if(!Array.isArray(rows)||rows.length>(key==='tattoos'?8:12))return null;
  // Refuse to replace a collection edited by another client while the form was open.
  if(JSON.stringify(payload.base?.[key]||[])!==JSON.stringify(c.bodyProfile?.[key]||[]))return null;
  const schema=key==='tattoos'?{name:40,location:'location',type:'type',attitude:'attitude'}:key==='medications'?{name:60,purpose:'purpose',frequency:'frequency',notes:160}:{department:'department',purpose:'visitPurpose',frequency:'visitFrequency'};
  const result=[];for(const [index,row] of rows.entries()){const next={};for(const [f,rule] of Object.entries(schema)){const v=row[f]??'';if(typeof v!=='string')return null;if(typeof rule==='number'){if(v.length>rule)return null;next[f]=v;}else{if(!allowed(rule,v)&&v!==c.bodyProfile?.[key]?.[index]?.[f])return null;next[f]=v;}}
   if(key==='medications'&&!next.name.trim())return null;if(key==='tattoos'&&!next.name.trim())next.name='문신 '+(index+1);result.push(next);}
  put(key,result);
  if(key==='hospitalVisits'){put('hospitalDepartments',[...new Set(result.map(r=>r.department))]);put('hospitalVisitPurposes',[...new Set(result.map(r=>r.purpose))]);if(result.length)put('hospitalVisitFrequency',result[0].frequency);}
 }
 // An unchanged confirmation is still a valid answer; it must not repeat.
 return changed?patch:{};
}
