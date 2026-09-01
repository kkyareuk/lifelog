export const SCENE_IMAGE_VARIANTS=[
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

export function sceneImageFor(character,entry,mode="ldImage",mood=""){
  const field=mode==="icon"?"icon":"ldImage";
  const key=sceneImageVariantKey(entry,mood);
  const variants=normalizeSceneImageVariants(character?.sceneImageVariants);
  const variant=key?variants[key]?.[field]:"";
  const fallback=field==="icon"?String(character?.icon||character?.photo||""):String(character?.ldImage||"");
  return{src:String(variant||fallback),key,isVariant:Boolean(variant)};
}
