# Economy menu direction (proposal, not shipped expansion)

Current internal: personal balance under village picker, separate icon+label Wallet and Work entries, wages/fees/common wallet, currency conversion. Public457 excludes these features.

Recommended next structure:
- Village currency: free-text unit and ordinary-meal reference price, one owner-authorized setting per village. Preserve internal base balances; display conversion never grants money. Moving village converts display, not purchasing power.
- Character full settings: wealth, consumption, date-payment frequency; wallet links to this same editor rather than keeping an independent value.
- Wallet: Money (balance, recent spending, graph only after records exist); Assets (goal savings, debt, fixed expenses). Do not add market simulation yet.
- Work: dictionary-style workplace cards and Add workplace. Required name, weekdays/time, pay; fold rank, duties, reputation and place under More settings. Multiple workplaces; explicit primary job supplies profile summary. Overlapping shifts require an explicit conflict choice, no silent double wages.
- Dictionary prices: optional ordinary-meal multiplier. Category default plus visible per-item override; do not silently charge for old entries with no price. Existing drink/meal/activity fees continue until a separately approved migration.
- Display proposal: user preference controls whether character balance stays under village picker or appears only in Wallet. Player premium currency remains separate.

These are recommendations awaiting scope decisions; this release does not claim graphs, assets or multiple workplaces are implemented.
