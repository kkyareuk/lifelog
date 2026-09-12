# Pending multiplayer membership display fix

Separates authoritative membershipMembers from safety-filtered members for Members and roles. Uses group.ownerUid for the displayed host role, supports member document IDs when uid is absent, and keeps hidden avatars and blocked mail/residents hidden. Does not grant server permissions, add members or unblock accounts.

Regression: three accounts with a blocked host still render all three administrative rows, the canonical host role, no hidden avatar, no member role editing, and unchanged source records. Existing outage recovery and own-house authorization checks pass.

User confirmed mutual blocking/reporting. No installed binary contains this change yet. iOS363 is released; Android360 return slowness remains unverified. New explanatory copy KO/EN/JA complete (100% of this change; overall not measured).

## Multiplayer travel rules (pending next build)
Group managers can allow/block travel between towns independently of personal settings. Existing groups default to allowed, while individual town travel restrictions remain respected. Shared schedule reconstruction retains valid group destination town/home IDs and falls back for personal-only IDs. Scene signatures include the movement rule. KO/EN/JA rule labels complete. Shared-world regression passes. Existing town-profile suite reaches a stale hard-coded version187 assertion (current360); not reported as fully passing.

Website purchase audit: production web and Apple grants both use users/{uid}.entitlements; client reads account entitlements. Same game UID required; separate Apple/Google accounts do not automatically merge. No customer purchase tested.
