# Pending multiplayer membership display fix

Separates authoritative membershipMembers from safety-filtered members for Members and roles. Uses group.ownerUid for the displayed host role, supports member document IDs when uid is absent, and keeps hidden avatars and blocked mail/residents hidden. Does not grant server permissions, add members or unblock accounts.

Regression: three accounts with a blocked host still render all three administrative rows, the canonical host role, no hidden avatar, no member role editing, and unchanged source records. Existing outage recovery and own-house authorization checks pass.

Actual reported group is unverified pending both invite codes / safety testing history. No installed binary contains this change yet. iOS363 contains only the earlier signing fix. Release remains held; Android360 return freeze still not reproduced. New explanatory copy KO/EN/JA complete (100% of this change; overall not measured).
