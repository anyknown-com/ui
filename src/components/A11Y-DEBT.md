# 已知的 a11y 偏差

a11y review 量測兩個主題的 token 組合後,列出低於門檻的項目。實作**不自行更動 palette**
—— 改與不改是設計決策,這份清單是它的待辦。

門檻:文字 4.5:1(小字)、UI 邊界與圖形 3:1、命中區 24px。

## palette 層(改一次影響全站)

| Token 組合 | 實測 | 門檻 | 出現處 |
| --- | --- | --- | --- |
| `textFaint` on `surface` | 2.97:1(light)/ 3.16:1(dark) | 4.5:1 | input placeholder、select 群組標題與 hint、dropdown 快捷鍵、label 的「選填」 |
| `borderStrong` on `surface` | 1.76:1(light) | 3:1 | checkbox / radio 未勾邊框、switch 關閉時的軌道 |
| `successHl` on `successSubtle` / `dangerHl` on `dangerSubtle` | 1.21–1.32:1 | 3:1 | diff-viewer 行內字級 highlight ——「哪幾個字變了」目前只靠這層底色 |
| `accent` on `accentSubtle`(dark) | 4.18:1 | 4.5:1 | Badge `variant="accent"`、tabs pills 的選取態 |
| `danger` on `dangerSubtle`(dark) | 4.48:1 | 4.5:1 | Badge `variant="danger"` |
| `textFaint` on `successSubtle` / `dangerSubtle` | 2.44–2.71:1 | — | diff-viewer 的行號(`aria-hidden`,只影響低視力的視覺使用者) |

建議修法(擇一):把帶語意的 faint 文字改用 `textMuted`(已達 4.5:1),或把 `textFaint`
/ `borderStrong` 各壓深一階。要動的話一次調 `tokens.stylex.ts` 與 `tokens.css` 兩邊。

## 已修:textMuted 調深一階(2026-08-29)

`textMuted` 從 light `#777165` / dark `#A59B8C` 改成 **light `#635D52` / dark `#B0A697`**。

起因是織體讓文字落在布上(底色從單一 `surface` 變成一段紗線階,要對**最不利的那一階**
算),但查下去發現 muted 本來就貼著門檻 —— 它只在 `bg` 與 `surface` 上及格,落在
`bone` / `sheen` / `accentSubtle` / `dangerSubtle` / `warningSubtle` 上全都是 3.99–4.40:1。

| 底色 | 舊 | 新 |
| --- | --- | --- |
| `bg` / `surface` | 4.63 / 4.85 | 6.24 / 6.53 |
| `bone` / `sheen` | 3.99 / 4.40 | 5.37 / 5.93 |
| `accentSubtle` / `dangerSubtle` / `warningSubtle` | 4.17 / 4.04 / 4.10 | 5.61 / 5.44 / 5.52 |
| `yarnSecondary` 最深的一階(receipt 收合列) | 3.67 | 4.94 |
| `yarnGhost` 最深的一階(ghost Button) | 3.40 | 4.57 |

順帶把三階的間距拉勻:text → muted → faint 的 L\* 間距原本是 35.0 / 14.2(muted 離
faint 遠比離 text 近,兩階分不太開),現在是 26.9 / 22.3;dark 從 26.9 / 19.2 變成
22.8 / 23.3。

`dangerGhost` 另外處理掉 interaction-card 的拒絕鈕(標籤改用 `color.danger`)。

## 命中區

| 位置 | 實測 | 門檻 | 說明 |
| --- | --- | --- | --- |
| checkbox / radio | 16.8px | 24px | 只在省略 `label` 時會踩到 —— 有 label 時整條 label 是命中區 |
| switch | 高 22.4px | 24px | 同上 |
| dropzone 取消鈕 / file-row checkbox / data-table checkbox | 22.4 / 16 / 13.6px | 24px | 這三個沒有 label 包住可以放大命中區 |

Badge 的 chip `×` 已經用 `::after` 補到 24px 而不影響版面,同一招可以套到上面三個。

## 刻意的

| 位置 | 值 | 說明 |
| --- | --- | --- |
| scrollbar thumb 可見寬 | 4px(10px 減 3px 透明邊距) | 明訂的設計,只是很細 |
