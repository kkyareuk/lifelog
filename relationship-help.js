const copy={
 overall:['공식 관계와 별개인 이 캐릭터의 속마음이에요.','This character’s feelings, separate from the official relationship.','公式関係とは別の、この人物の本心です。'],
 importance:['이야기에서 이 관계를 다루는 비중이에요. 호감도와는 달라요.','How prominently this relationship appears in the story, not affection.','物語でこの関係を扱う比重です。好感度とは別です。'],
 trust:['좋아하더라도 믿지 않을 수 있어요.','Liking someone does not necessarily mean trusting them.','好きでも信じられないことがあります。'],
 closeness:['상대를 자신의 삶에 얼마나 가까이 느끼는지예요.','How close they feel to the other person.','相手を自分の人生の近くに感じる度合いです。'],
 comfort:['같은 공간과 대화에서 느끼는 편안함이에요.','Comfort in shared space and conversation.','同じ空間や会話で感じる居心地です。'],
 awareness:['자기 감정을 알아차렸는지, 다르게 해석하는지예요.','Whether they recognize or misread their own feelings.','自分の感情に気づいているか、別の意味に捉えるかです。'],
 mutualAwareness:['상대의 마음을 얼마나 알고 있다고 생각하는지예요.','How well they think they understand the other person’s feelings.','相手の気持ちをどれほど分かっていると思うかです。'],
 fear:['호감과 별개로 느끼는 두려움이에요.','Fear, independently of affection.','好意とは別に感じる恐れです。'],
 annoyance:['상대를 귀찮게 느끼는 정도예요.','How bothersome they find the other person.','相手を煩わしく感じる度合いです。'],
 attention:['상대의 행동과 상태를 살피는 정도예요.','How much they notice the other person’s actions and state.','相手の行動や様子を気にかける度合いです。'],
 jealousy:['관심을 독차지하고 싶어 하는 정도예요.','How much they want the other person’s attention to themselves.','相手の関心を独占したい度合いです。'],
 conflictIntensity:['갈등이 생길 가능성과 강도예요. 매번 싸우지는 않아요.','Conflict likelihood and intensity, not a fight every time.','対立の起こりやすさと強さです。毎回争うわけではありません。'],
 expectation:['앞으로 이 관계가 어떻게 이어질 거라 보는지예요.','How they expect the relationship to continue.','今後この関係がどう続くと考えるかです。'],
 touchIntensity:['선택한 단계 이하를 허용해요. 두 사람 중 낮은 범위를 따라요.','Allows this level and below, within the lower of both limits.','選んだ段階以下を許可します。二人の低い方の範囲に従います。'],
 aggression:['충동이 있어도 실제 행동은 별도 설정을 따라요.','An impulse alone does not authorize an action.','衝動があっても実際の行動は別の設定に従います。'],
 aggressionAction:['충동을 실제 행동으로 옮기는 정도예요.','How far they act on an impulse.','衝動を実際の行動に移す度合いです。'],
 origin:['관계가 시작된 경위예요. 선택한 과거만 회상에 사용해요.','How the relationship began. Only selected history enters memories.','関係が始まった経緯です。選んだ過去だけを回想に使います。'],
 routine:['이 관계에서 함께하는 일상이에요. 회상의 소재가 돼요.','A shared routine in this relationship, used in memories.','この関係で共にする日常です。回想の題材になります。'],
 firstMeeting:['실제로 있었던 첫 만남만 선택해 주세요.','Choose only a first meeting that actually happened.','実際にあった初対面だけを選んでください。']
};
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function relationshipInfo(key,language='ko'){
 const i={ko:0,en:1,ja:2}[language]||0,description=copy[key]?.[i];if(!description)return '';
 return `<details class="relationship-info"><summary aria-label="${['설명 보기','Show explanation','説明を見る'][i]}">ⓘ</summary><span data-info-copy>${escape(description)}</span></details>`;
}
