# 已知的 a11y 偏差

a11y review 量測兩個主題的 token 組合後,列出低於門檻的項目。實作**不自行更動 palette**
—— 改與不改是設計決策,這份清單是它的待辦。

門檻:文字 4.5:1(小字)、UI 邊界與圖形 3:1、命中區 24px。

## palette 層(改一次影響全站)

數字對 `scripts/palette.mjs` 目前的輸出量(12 階中性 palette,light / dark)。

| Token 組合 | 實測 | 門檻 | 出現處 |
| --- | --- | --- | --- |
| `textFaint` on `surface` | 3.75:1(light)/ 4.88:1(dark) | 4.5:1 | input、select 搜尋、composer、interaction-card、data-table 篩選的 placeholder |
| `successHl` on `successSubtle` / `dangerHl` on `dangerSubtle` | 1.15–1.23:1 | 3:1 | diff-viewer 行內字級 highlight ——「哪幾個字變了」目前只靠這層底色 |

`textFaint` 只有 3:1,規則是不放要讀的字:icon、chevron、placeholder、分隔符、空格的 `—`
與 disabled 態可以用它,其他文字一律 `textMuted`(在所有底色上 ≥ 5.36:1)。placeholder
是唯一還算「字」的例外;要過 4.5:1 就把 placeholder 改成 `textMuted`,不是調 `textFaint`。

diff 的字級 highlight 是填色階(5 階)疊在 subtle 底(3 階)上,兩階的明度差本來就小;
要過 3:1 就另外加非顏色的記號(底線或粗體),不手調 `*Hl` 的值。

## 已修:換成 12 階中性 palette

舊表上的這幾列在新 palette 下都過門檻,已經拿掉:

| Token 組合 | 舊 | 新(light / dark) | 怎麼修的 |
| --- | --- | --- | --- |
| `textFaint` 當文字(select 群組標題與 hint、dropdown 快捷鍵、label「選填」、list 欄名、diff 行號) | 2.44–3.16 | 改用 `textMuted`:≥ 5.36 / ≥ 7.30 | 讀得到的字全部移到 `textMuted` |
| checkbox / radio 未勾邊框、switch 關的軌道 | 1.76(`borderStrong`) | 3.75 / 3.80(`borderControl` on `surface`) | 控制項邊界改用 `borderControl` |
| `accent` on `accentSubtle`(Badge accent、pills tabs 選取態) | 4.18(dark) | 15.31 / 13.62 | 墨色 accent 在中性灰上 |
| `danger` on `dangerSubtle`(Badge danger) | 4.48(dark) | 4.59 / 7.47 | red 9 階(light)/ 11 階(dark)on red 3 階 |

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
