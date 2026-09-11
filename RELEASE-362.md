# iOS362 restore follow-up (1.0.327; Android remains360)

Reported code: restoring: RESTORE_FAILED. The native restore method mapped AppStore.sync failure to this code before listing unfinished transactions. Apple underlying failure is not yet known.

Recover UID-bound, server-verified Sandbox consumables before interactive Apple sync. If sync fails, still inspect locally verified unfinished purchases and validate them on the server before finishing. Report partial recovery separately from complete success. Never claim recovery if neither saved grants nor newly verified purchases exist. Native sync domain/code is bounded and shown without receipt/account data.

Regression checks: all four iOS product mappings; saved ledger plus sync failure; empty ledger plus sync failure rejects; unfinished purchase plus sync failure verifies; wrong UID rejects; existing idempotency/refund/auth checks. New KO/EN/JA copy complete; overall translation coverage not measured. Real device Apple sync remains unverified. No account deletion or purchase executed for testing; no public review submission.
