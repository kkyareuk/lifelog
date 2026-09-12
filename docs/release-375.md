# 1.0.328 (375)

Sofa capacity two in simulation and directed furniture actions. Screen watching prefers available sofa seats, social pairs retain sofa anchors, independent seat occupants avoid generic collision repulsion. Seated renderer bypasses standing TV/social composites. Chair/sofa faces smaller and lower, sofa has stable two seat offsets. Side-facing attached dining chairs temporarily pull outward; occupant faces remain outside the table and depth ordering keeps them visible. Vacated seats reset presentation without saving layout changes. Dining simulation uses available chairs; food emoji is attached to the diner's table side and cleared after eating.

Tests: check-seating375 covers two-person capacity, independent TV/rest, shared interaction anchors, dining chair limits. Chrome mobile touch QA verifies personal/shared drag, stable sizing, linked chair transfer, two sofa seats, face size/center, dining clearance/food, repeated layout stability and release reset. Screenshots inspected on synthetic mobile fixtures; not actual user data or physical iPhone. APK/AAB375 built, signature/version and module payload verified. iOS375 project preparation checks passed; no Mac archive/upload/submission. No claim all phone latency fixed. No new UI text; EN/JA release notes complete (100% scoped), whole-app coverage unmeasured.

<ko-KR>
소파를 두 사람이 함께 이용할 수 있도록 개선했습니다.
의자·소파 착석 시 캐릭터 크기와 위치를 조정하고, 함께 활동할 때도 좌석을 유지합니다.
식탁 옆 의자는 앉는 동안 바깥으로 빠져 자리를 확보하며, 일어나면 원위치로 돌아갑니다.
식사 중에는 앉은 자리 쪽 식탁에 음식 이모지를 표시합니다.
</ko-KR>
<en-US>
Two characters can now share a sofa.
Adjusted seated character size and position, preserving seats during shared activities.
Side chairs pull away from the table while occupied and return when vacated.
Food emoji appear on the table beside each diner during meals.
</en-US>
<ja-JP>
ソファを二人で利用できるようにしました。
着席時の大きさと位置を調整し、一緒に活動する時も座席を維持します。
テーブル横の椅子は着席中に外側へ移動して場所を確保し、離席すると元に戻ります。
食事中は座っている側のテーブルに料理の絵文字を表示します。
</ja-JP>
