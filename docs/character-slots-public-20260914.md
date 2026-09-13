# Character slots — public pricing update, 2026-09-14

Public baseline: 4fd1afc (origin/main). This change does not promote dev/internal 385.

- Single character slot: KRW 1,000; existing five-slot pack: KRW 4,800.
- Both remain available. Existing purchased capacity is preserved.
- Public web supports single-slot cart quantities and entitlement totals.
- Google Play active purchase options verified at these prices.
- Billing API selectively updated from its currently deployed source; active revision api-00019-ful, 2026-09-13T15:48:28Z. Removed the exclusive single/five date gate, changed five-pack price, permitted five distinct cart products. No other function was deployed.
- Apple single-slot product remains pending submission; do not claim available until reviewed.

Validation: scripts/check-slot-public.cjs (prices, mixed quantities, old entitlements, invalid carts); scripts/qa-slot-public.mjs (384px shop, Korean/English/Japanese titles and prices). No real purchase was charged. Legacy prepare-web build helper fails on its pre-existing missing character-code.js whitelist entry; public Pages serves the repository root and was tested directly.

## Korean
캐릭터 슬롯을 1개씩 1,000원에 추가할 수 있습니다. 기존 5개 추가 상품은 4,800원으로 함께 이용할 수 있습니다. 이미 구매한 슬롯은 그대로 유지됩니다.

## English
Add character slots individually for KRW 1,000, or choose the existing five-slot pack for KRW 4,800. Previously purchased slots are preserved.

## Japanese
キャラクタースロットを1枠1,000ウォンで追加できます。従来の5枠セットも4,800ウォンで利用できます。購入済みの枠はそのまま維持されます。
