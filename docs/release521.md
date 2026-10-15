# 1.0.469 (521) — local recovery search

2026-10-15. Recovery-only branch codex/save-recovery521 on public520 runtime; dev had only release/incident documentation since that runtime. Main is older and Pages-linked, so remains unchanged per repository constraint.

- Startup error screen can search current-account known saves and unreadable-primary archives in localStorage and their referenced IndexedDB snapshots. No state.js import is required for search.
- Displays timestamp, character count and up to four names. Explicit selection and second confirmation required. Search is read-only; original primary reference is archived before verified save replacement.
- Scope and primary/source values are rechecked after async preparation; writes guard against account/save changes. Other accounts and guest saves are excluded for signed-in scope.
- Bounded to100 referenced candidates with partial-search notice. Shows missing, failed read, undecodable and changed counts. No unowned/orphan IDB adoption, arbitrary database scanning or cloud changes.
- No assurance of recovery when all real save content is missing. Actual reporter's device has not been inspected or restored. Login/backup/reinstall history still unknown.

## Verification
Chrome and WebKit521 tests pass: actual archived IndexedDB search and UI restore/reload, read-only search, foreign account isolation, stale account/primary rejection, original reference preservation, signed owner search, missing versus failure, no-candidate KO/EN/JA.
Screenshot C:/Users/Public/drawer-releases/recovery521-found-webkit.png uses synthetic test characters.

## Release
521 internal testing only. Public submission needs explicit authorization for this version. Android build and Apple TestFlight status to be appended after verification.
