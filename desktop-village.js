const COPY={
  ko:{eyebrow:'서랍 속에서 이어지는 오늘',village:'마을',home:'집 안',build:'마을 꾸미기',activity:'할 일 정하기',visit:'집으로 들어가기',tip:'마을의 건물과 캐릭터를 눌러 살펴보세요.',residents:'함께 사는 캐릭터',journal:'오늘의 기록과 친구',friends:'친구'},
  en:{eyebrow:'Another day inside your drawer',village:'Village',home:'At home',build:'Decorate town',activity:'Choose activity',visit:'Open home',tip:'Select a building or character to take a closer look.',residents:'Village residents',journal:'Today’s journal & friends',friends:'Friends'},
  ja:{eyebrow:'ひきだしの中で続く今日',village:'村',home:'家の中',build:'村を飾る',activity:'行動を決める',visit:'家に入る',tip:'村の建物やキャラクターを選んで見てみましょう。',residents:'一緒に暮らすキャラクター',journal:'今日の記録とフレンド',friends:'フレンド'}
};
export function desktopVillageCopy(language){return COPY[language]||COPY.ko}
