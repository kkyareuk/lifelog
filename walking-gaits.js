export const WALKING_STYLE_OPTIONS=[
  "느리고 조심스럽게",
  "차분하고 반듯하게",
  "보통 속도로 자연스럽게",
  "가볍고 경쾌하게",
  "빠르고 성큼성큼",
  "그림자처럼 매우 민첩하게"
];

const GAITS={
  "느리고 조심스럽게":{className:"walk-style-careful",routeDurationFactor:1.35,stepDuration:.72,footstepInterval:1260,playbackRate:.9,sound:"walk"},
  "차분하고 반듯하게":{className:"walk-style-poised",routeDurationFactor:1.18,stepDuration:.58,footstepInterval:1100,playbackRate:.94,sound:"walk"},
  "보통 속도로 자연스럽게":{className:"walk-style-natural",routeDurationFactor:1,stepDuration:.52,footstepInterval:940,playbackRate:.98,sound:"walk"},
  "가볍고 경쾌하게":{className:"walk-style-light",routeDurationFactor:.84,stepDuration:.4,footstepInterval:760,playbackRate:1.03,sound:"walk"},
  "빠르고 성큼성큼":{className:"walk-style-striding",routeDurationFactor:.72,stepDuration:.34,footstepInterval:630,playbackRate:1.08,sound:"walk"},
  "그림자처럼 매우 민첩하게":{className:"walk-style-shadow",routeDurationFactor:.46,stepDuration:.2,footstepInterval:370,playbackRate:1.13,sound:"run"}
};

export function walkingGait(value){
  return GAITS[value]||GAITS["보통 속도로 자연스럽게"];
}

export function walkStyleClassFor(character){
  return walkingGait(character?.walkingStyle).className;
}

export function walkingGaitForElement(element){
  const named=walkingGait(element?.dataset?.walkingStyle);
  if(element?.dataset?.walkingStyle)return named;
  return Object.values(GAITS).find(gait=>element?.classList?.contains?.(gait.className))||named;
}
