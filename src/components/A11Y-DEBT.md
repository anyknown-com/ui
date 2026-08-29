# 已知的 a11y 偏差

a11y review 量測兩個主題的 token 組合後,列出低於門檻的項目。`prototype.html` 是視覺的
唯一真相,所以實作**沒有自行更動 palette** —— 改與不改是設計決策,這份清單是它的待辦。

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

## 織體帶來的(2026-08-29)

文字落在布上,底色從單一 `surface` 變成一段紗線階,對比要對**最不利的那一階**算。

| 位置 | 實測 | 門檻 | 說明 |
| --- | --- | --- | --- |
| handoff-receipt 收合列的 `textMuted` on `yarnSecondary` | 4.03–4.36:1 | 4.5:1 | 在 `surface` 上原本是 4.85:1 |
| ghost Button 的 `textMuted` on `yarnGhost` 的 `--y2` | 3.67:1 | 4.5:1 | 紗很疏,實際多半看到的是頁面底色(4.63:1) |

最小的修法是把 `textMuted` 調深一階(light `#777165` → `#67614F`、dark `#A59B8C` →
`#B0A697`):布上 4.68–5.56:1 全部過,頁面底色上也從 4.63 變 5.90。但那是全域 palette,
34 個元件的 muted 文字都會跟著變重,**未經設計決定不自行更動**。

`dangerGhost` 已經處理掉 interaction-card 拒絕鈕那一顆(改用 `color.danger` 標籤後是
4.31:1 布上 / 5.44:1 頁面底),但一般 ghost 按鈕的偏差還在。

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
| scrollbar thumb 可見寬 | 4px(10px 減 3px 透明邊距) | scrollbar/NOTES 明訂的設計,只是很細 |
