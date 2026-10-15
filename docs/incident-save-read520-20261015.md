# SAVE_READ persists on iOS520 — 2026-10-15

## Evidence
User supplied an iPhone iOS18.7 report from1.0.468(520): Saved snapshot is unavailable at snapshot-store.js get, account-storage read, state load. Screenshot shows startup protection and backup-file recovery controls. The device save has not been accessed. Account sign-in, app deletion history and exported backup availability are not confirmed.

## Source findings
- snapshot-store.js preloads only known referenced snapshot IDs, retrying reads three times. Both absent/non-string records and exhausted database-read failures leave no cache entry.
- get() reports the same Saved snapshot is unavailable for either condition. This report does NOT establish deletion of the underlying record or identify a WebKit eviction cause.
- state.js attempts existing same-scope last-nonempty, pre-cloud and legacy saves before aborting startup. The supplied screenshot shows protection, not successful recovery.
- boot-recovery.js supports a user-selected JSON backup without requiring state.js startup and archives the previous pointer before restoring.
- No real-world restoration is verified.520's reconnect/recovery UI change did not resolve this reporter's startup failure.

## Next evidence needed
Confirm whether the reporter used Google/Apple login (and which provider), whether an exported backup JSON exists in Files/iCloud Drive, and whether the app was ever deleted/reinstalled. If signed in, establish the correct app account before checking its cloud save; the inquiry email must not be assumed to identify that app account. A backup file must be validated before use.

Keep the installed app and its data. Do not log out, reset, create an empty replacement save, or overwrite cloud data during investigation. No account data, database contents or device files were inspected or modified; no email was sent.

No runtime code or release version changed in this diagnostic follow-up. Do not mark this incident resolved or publish another build as a proven recovery without evidence.
