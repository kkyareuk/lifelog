# Public 1.0.405 / 457

Based on released public455 (f564b2e), not the economy development branch. Character money, Wallet, Work and observation/village switching are absent. Plaza/Mafia remain locked.

<ko-KR>
캐릭터 애정 표현 설정의 선택값 유지와 저장 반응을 보완했어요. 자아만들기 남은 시간 표시, 집 가구 크기, 방 크기를 조절할 때 반대 방향으로 움직이거나 튀는 문제를 개선했어요.
</ko-KR>
<en-US>
Improved affection-setting persistence and save responsiveness. Fixed self-discovery countdown updates, furniture display size and room resizing that could jump or move in the wrong direction.
</en-US>
<ja-JP>
愛情表現の設定値の保持と保存時の反応を改善しました。自分づくりの残り時間、家具の表示サイズ、部屋のサイズ変更時に逆方向へ動いたり跳ねたりする問題を改善しました。
</ja-JP>

Validation: Chrome and WebKit402x820 touch selection, rerender and reload persistence pass. Original report is iOS411; exact old-device failure was not reproduced in current source. Synchronized duplicate book/legacy inputs and queued legacy save after input. Settings scroll/selection continuity, anchored resizing, furniture grid and server-authoritative countdown tests pass. Selection test updated to await asynchronous persistence and recognize existing checkbox handling. Signed Android AAB485 assets byte-identical; SHA256 DB4C9EDBE452B4D5C86B69DD4258074D657480F500AB32DC5B385D859DFDA7BC. EN2260/2993(75.5%), JA2259/2993(75.5%). Store delivery pending.
