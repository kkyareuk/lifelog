# Internal 1.0.404 / 456 — wallet and building interiors

Scope approved in the task. Development branch only; Android internal / iOS TestFlight internal preparation. Public455 and the public website are not replaced by this build. Public455 was observed available on Google Play on September19 at20:32KST. Internal454 is the preceding internal release; closed testing215 is not being promoted.

## Player notes
<ko-KR>
지갑·직장 메뉴와 캐릭터 잔액을 추가했어요. 재화 이름과 평범한 밥 한 끼 가격을 직접 정할 수 있고, 단위를 바꿔도 재산 가치는 유지돼요. 퇴근 급여·유료 활동 지출과 동거인 공동지갑을 지원해요. 홈에서 관찰·마을을 전환하고 카페·병원 등 건물 내부도 꾸밀 수 있어요. 자아만들기 시간 갱신, 집 가구 표시 크기와 방 크기 조절을 개선했어요.
</ko-KR>
<en-US>
Added Wallet, Work and character balances. Name your currency and set the price of an ordinary meal without changing your wealth. Receive wages after work, pay for activities and share deposited money with housemates. Switch between observation and village views, and decorate cafe, hospital and other building interiors. Improved self-discovery countdown updates, furniture display size and room resizing.
</en-US>
<ja-JP>
財布・仕事メニューとキャラクターの残高を追加しました。通貨名と普通の食事1回の価格を自由に設定でき、単位を変えても資産価値は変わりません。退勤時の給与、有料行動の支払い、同居人と入金分だけ共有する共同財布に対応しました。観察・村の画面を切り替え、カフェや病院などの内装も編集できます。自分づくりの残り時間、家具の表示サイズ、部屋のサイズ変更を改善しました。
</ja-JP>

## Validation
- Currency conversions preserve base balances; wealth grants run once; insufficient funds block payment; shared deposits require resident opt-in.
- Server owner/member boundaries, concurrent/replayed transfers, persistent transfer receipts and atomic failures pass against transaction fixtures.
- Actual directed work completion credited once; zero-balance cafe order blocked; funded drink charged.
- Building edit roles, room/furniture/floor persistence, revision conflicts and invalid image rejection pass.
- Chrome and WebKit384x832: free-text gold conversion, balance below village picker, separated discovery button, observation/village switch, building room drag resize with fixed opposite corner, furniture addition and reopen persistence pass.
- Countdown authoritative server time and entitlement-cache tests pass; guest live timer decreases10:00→9:57.
- Prior navigation, shared-home ownership, coffee/sleep and multi-character activity checks pass.
- check-shared-town-service.cjs has an existing line60 expectation that members cannot create their own homes; same failure reproduced using HEAD's unchanged service. Relevant ownership suite passes; no permission change was made to work around the stale expectation.
- iOS project/module preparation and internal-only workflow checks pass. Browser WebKit is not a signed-device test. No claim of real-device frame-rate measurement.
- Static translation inventory EN2258/2988(75.6%), JA2257/2988(75.5%); new player UI and release copy supplied in KO/EN/JA.

## Artifact
Signed Android AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.404-456-internal.aab
SHA256:042674E46668DA76D94B69454DADDC6F843D5EFF6232D9306426EF2FDD755621
All492 assets match the prepared Android bundle byte-for-byte. Google Play internal delivery verified; iOS status is recorded below.

## Backend compatibility
The wallet handler checks group membership and resident ownership. Common-wallet changes and personal balances are transactional. Existing shared residents without wallet data are not charged by the new simulation; owned characters opt in when the new Wallet UI initializes. Ordinary display conversion makes no network call and does not use real exchange rates. No real-money purchases or compensation grants are changed.

## Delivery
- Source d7f87f8 pushed to dev.
- sharedTownApi deployed successfully; other functions and real-money products unchanged. Initial discovery timeout resolved by allowing 60 seconds for CLI source analysis.
- Google Play internal release337: 456 (1.0.404), available to internal testers September19 22:39KST. No supported devices removed. One nonblocking missing deobfuscation-file warning.
- iOS internal TestFlight workflow35446347704 succeeded. Apple accepted signed1.0.404(456), internal-only, source d7f87f8. Signed Apple login entitlement verified. Apple build processing has not yet produced an installable record (bounded status check build:null); tester availability is not confirmed. No public review submitted for456. Public455 remains Waiting for Review in App Store Connect.
