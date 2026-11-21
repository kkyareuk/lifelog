export const SCENE_IMAGE_VARIANTS=[
  {id:"joy",ko:"기쁨",en:"Joy",ja:"喜び"},
  {id:"sad",ko:"슬픔",en:"Sadness",ja:"悲しみ"},
  {id:"angry",ko:"화남",en:"Anger",ja:"怒り"},
  {id:"shy",ko:"부끄러움·설렘",en:"Shy / fluttery",ja:"照れ・ときめき"},
  {id:"tense",ko:"긴장",en:"Tension",ja:"緊張"},
  {id:"tired",ko:"피곤함",en:"Tired",ja:"疲れ"},
  {id:"talk",ko:"대화",en:"Talking",ja:"会話"},
  {id:"hug",ko:"포옹",en:"Hugging",ja:"ハグ"},
  {id:"gift",ko:"선물",en:"Gift exchange",ja:"贈り物"},
  {id:"conflict",ko:"다툼",en:"Arguing",ja:"口論"},
  {id:"sleep",ko:"수면",en:"Sleeping",ja:"睡眠"},
  {id:"morning",ko:"아침 준비",en:"Morning routine",ja:"朝の支度"},
  {id:"bath",ko:"목욕·욕실",en:"Bath time",ja:"入浴・洗面"},
  {id:"work",ko:"근무·일하는 중",en:"Working",ja:"仕事中"},
  {id:"outing",ko:"외출",en:"Going out",ja:"外出"}
];

export function normalizeSceneImageVariants(value={}){
  const source=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
  return Object.fromEntries(SCENE_IMAGE_VARIANTS.map(({id})=>[id,{
    icon:String(source[id]?.icon||""),
    ldImage:String(source[id]?.ldImage||"")
  }]));
}

export function sceneImageVariantKey(entry,mood=""){
  const text=`${entry?.title||""} ${entry?.desc||""} ${entry?.mood||""} ${entry?.room||""} ${mood||""}`;
  if(/자는 중|잠든|수면|취침|잠자|sleep/i.test(text))return"sleep";
  if(/목욕|샤워|욕실|씻는|씻고|세면|bath|shower/i.test(text))return"bath";
  if(/아침.{0,8}(준비|단장)|기상|일어나|양치|출근 준비|morning/i.test(text))return"morning";
  if(entry?.work||/출근|근무|업무|일하는 중|직장|근무지|working|at work/i.test(text))return"work";
  if(entry?.transit||/외출|산책|쇼핑|나들이|이동 중|going out|outing/i.test(text))return"outing";
  return"";
}

// Prefer an ongoing action, then the current emotional state, then the daily activity.
export function sceneImageCandidates(entry={},mood={}){
  const activity=sceneImageVariantKey(entry);
  if(activity==="sleep")return ["sleep"];
  const action=entry.contactRejected?"":({talk:"talk",gossip:"talk",comfort:"talk",compliment:"talk",debate:"talk",hug:"hug",gift:"gift",argue:"conflict",fight:"conflict",insult:"conflict",taunt:"conflict"})[entry.meetingKind]||"";
  const tone=typeof mood==="string"?mood:mood?.tone;
  const emotion=({good:"joy",excited:"joy",sad:"sad",angry:"angry",furious:"angry",irritated:"angry",hostile:"angry",flirty:"shy",embarrassed:"shy",tense:"tense",uneasy:"tense",tired:"tired",sleeping:"sleep"})[tone]||"";
  return [...new Set([action,emotion,activity].filter(Boolean))];
}
export function sceneImageFor(character,entry,mode="ldImage",mood={}){
  const field=mode==="icon"?"icon":"ldImage";
  const variants=character?.sceneImageVariants||{};
  const key=sceneImageCandidates(entry||{},mood)[0]||"";
  const variant=key?variants[key]?.[field]:"";
  const fallback=field==="icon"?String(character?.icon||character?.photo||""):String(character?.ldImage||character?.photo||character?.icon||"");
  return{src:String(variant||fallback),key,isVariant:Boolean(variant)};
}
export const sceneImageCopy=(language,key)=>({
  title:{ko:"감정·상황별 이미지",en:"Emotion & interaction images",ja:"感情・シーン別の画像"},
  help:{ko:"감정과 행동에 맞는 SD·LD 이미지를 등록해요. 행동 → 감정 → 일상 순서로 상태를 판단하며, 해당 칸이 비어 있으면 등록한 기본 캐릭터 이미지로 표시해요. GIF는 1.5MB 이하 원본을 움직이는 그대로 저장하며 자르지 않아요.",en:"Add SD and LD images for emotions and actions. The state is chosen in action, emotion, then daily activity order. An empty slot uses your default character image. GIFs up to 1.5 MB keep their animation and are not cropped.",ja:"感情や行動に合わせたSD・LD画像を登録できます。行動、感情、日常の順に状態を判断し、その画像が未登録なら基本のキャラクター画像を表示します。1.5MB以下のGIFは切り抜かず、アニメーションのまま保存します。"},
  tooLarge:{ko:"GIF는 1.5MB 이하 파일을 선택해 주세요.",en:"Please choose a GIF no larger than 1.5 MB.",ja:"1.5MB以下のGIFを選んでください。"}
})[key]?.[language]||({title:"Emotion & interaction images",help:"",tooLarge:"Please choose a GIF no larger than 1.5 MB."})[key];
