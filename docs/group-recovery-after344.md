# Multiplayer reconnect recovery after 344

- Membership indexes and group existence are confirmed from the server before replacing the joined-group list. Network failure retains the previous list.
- Empty cache snapshots cannot clear a selected group or its collections. Metadata updates remain subscribed so an authoritative empty server result can still be applied.
- Reconnecting the same group retains its last usable data. The online event refreshes memberships even if there is no active group.
- Overlapping refreshes cannot let an older result overwrite a newer result. Group fetch concurrency is limited to four.

Validation: node --check auth.js and scripts/check-group-recovery345.mjs passed (failed fetch, recovered owner list, reconnect without active group, cached empty document/collection, authoritative server empty result).

Support investigation confirmed the reported account's three group documents, owner membership records and membership indexes still exist. No production data or roles were changed. The client's historical event sequence cannot be established without device logs. Account identifiers are omitted here.

Delivery: source fix only; Android remains 344 / 1.0.311 until the next build. No app-store or website deployment. No new user-facing strings; translation work is not applicable to this patch.
