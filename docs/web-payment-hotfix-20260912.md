# Web payment configuration hotfix — 2026-09-12

Production payment authentication used the live client key while the API service still referenced a test secret. Provider logs confirmed NOT_FOUND_PAYMENT on the test merchant during confirmation of live payment sessions.

Selected the existing general-payment merchant in the provider dashboard and verified its live client key matches the deployed website. Updated the existing Secret Manager secret and patched only the production function's secret binding. No app source, prices, entitlements, access permissions, or other services were changed.

Verification: function ACTIVE with the updated secret binding; operation completed successfully. A read-only lookup of a previously failing order with the matching live credential returned HTTP 200 / IN_PROGRESS. No payment was confirmed, charged, cancelled, or refunded during verification. End-to-end card authentication and approval remains to be verified by an authorized purchaser. Old unfinished orders were not retried automatically; start a new checkout.

Android remains 351 / 1.0.318. No new player strings, so EN/JA translation is not applicable to this configuration-only hotfix. No announcement or reporter email sent. Credentials and payment identifiers intentionally omitted.
