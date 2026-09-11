# Release 347 / 1.0.314

Base: delivered private release 346 / 1.0.313. Development branch only.

- Per-group member name/photo editor on join and group information, with existing profile lookup on rejoin. Account profile edits no longer overwrite group profiles. Membership roles are not changed by profile updates.
- Group profile dialog Korean/English/Japanese, cancel and image removal.
- Home entry action opens the selected home without moving the character. Reuses projected scenes in observation selection and deferred question checks.
- Morality shown in emotional traits using the existing score. Smaller wrapping labels on character page 3.
- Credits use a static searchable three-column list, wooden background, matching round back button, no public amount explanation or rotating featured name.
- Separate notice site, verified kkyaareuk@gmail.com authorization enforced on server. Draft save is private; exact revision preview and idempotent publish. One shared announcement document, mailbox fetch, 30 days. No push/email writes.

## Verification
- qa-member-profile347: save/cancel and KO/EN/JA mobile layout.
- qa-layout347: 384px/1280px screenshots, three-column credits, home navigation preserves selected character.
- qa-morality346: village score mean and translated editor/statistics regression.
- check-join343: repeat join preserves owner/manager role and slot usage.
- check-notice-admin347: verified admin only, draft isolation, stale preview rejected, duplicate publish prevented, no push/email.
- CPU 4x / 80-character synthetic profile: command 526.2ms, save 41.3ms, home render 568.4ms. This is not proof of full lag resolution on physical devices.
- No live user announcement sent during testing. End-to-end Google administrator sign-in requires the user's own session.

## User patch notes
서랍마을 1.0.314 업데이트

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

✨ 새로운 기능
- 멀티방마다 사용할 이름과 프로필 사진을 따로 정하고 변경할 수 있어요.

🔧 개선 사항
- 마을에서 집의 ‘들어가기’를 누르면 해당 집 화면으로 이동해요.
- 일부 화면 전환에서 반복하던 처리를 줄였어요.
- 기분과 정서 성향에서도 도덕성을 확인할 수 있어요.

🎨 UI/UX
- 캐릭터 전체설정 3페이지의 긴 제목이 겹치지 않도록 조정했어요.
- 크레딧을 나무 배경의 이름 검색과 3열 명단으로 정리했어요.

🐛 오류 수정
- 계정 프로필을 변경할 때 멀티방별 프로필까지 함께 바뀌는 문제를 수정했어요.
