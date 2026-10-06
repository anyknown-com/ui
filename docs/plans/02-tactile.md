# 軟材：取代 flat 的設計語言

設計稿：<https://claude.ai/artifact/MYmDqnAGB7F7gjJJRjMtqK> 的「C 軟材(選定)」兩張(淺色、暗色)。A、B 兩張是沒選上的方向，不要參考。

## 一句話

中性灰的桌面上放白紙。內容是紙，浮起來的東西是疊在紙上的紙；越靠近使用者的東西越圓、陰影越深。按鈕是膠囊。墨色是主動作與連結，藍色只代表 agent 正在做事、焦點、進度。

為什麼換：flat 靠 1px 邊框分層，一頁上的框太多，手機與桌面 app 共用時顯得像表單。軟材靠深淺與陰影分層，邊框只留給需要 3:1 邊界的控制項。

## 顏色

色值的來源是 `scripts/palette.mjs`:五條 12 階的 OKLCH 原色(gray、blue、red、amber、green),淺色與暗色各一份,轉成 hex 後經語意 token 進到 `tokens.stylex.ts` 與 `tokens.css`。原色只活在 script 裡，不匯出;元件只碰語意 token。

**中性色 chroma 0。** gray 的每一階都是純灰(R = G = B),不偏冷也不偏暖。帶色偏的灰會讓白紙看起來髒，也會跟狀態色互相干擾。

**每一階有固定的工作**,每條色階、兩個主題都一樣:

| 階 | 工作 |
| --- | --- |
| 1–2 | 背景(紙、桌面) |
| 3–5 | 填色(subtle 底、hover、按下) |
| 6–8 | 邊框(分隔線、較明顯的分隔線) |
| 9–10 | 實心(按鈕底、控制項邊界、icon) |
| 11–12 | 文字(次要、主要) |

**語意對應**(淺色階 / 暗色階):

| token | 色階 | 階 | 用在 |
| --- | --- | --- | --- |
| `layer1` | gray | 3 / 1 | 桌面 |
| `bg`、`layer2` | gray | 1 / 2 | 紙 |
| `surface`、`layer3` | gray | 2 / 3 | 凹下去的區塊:輸入框、使用者泡泡、code |
| `surfaceRaised` | gray | 1 / 4 | 卡片、popover、toast、dialog |
| `layer4`、`accentSubtle` | gray | 4 / 5 | hover、次要按鈕底 |
| `layer5` | gray | 5 / 6 | 按下 |
| `border` | gray | 6 / 6 | 分隔線 |
| `borderStrong` | gray | 7 / 8 | 較明顯的分隔線 |
| `borderControl` | gray | 9 / 9 | 控制項邊界 |
| `textFaint` | gray | 9 / 10 | icon、chevron、placeholder、分隔符 |
| `textMuted` | gray | 11 / 11 | 次要文字 |
| `text`、`accent`、`link` | gray | 12 / 12 | 主要文字、主動作、連結 |
| `accentText` | gray | 1 / 2 | 主動作上的字 |
| `signal`、`focusRing`、`info` | blue | 9 / 11 | agent 正在做事、焦點、進度 |
| `signalSubtle`、`infoSubtle` | blue | 3 / 3 | agent 狀態的底 |
| `danger` | red | 9 / 11 | 刪除、失敗 |
| `dangerSolid` + `onDangerSolid` | red | 9 / 9 + 白 | 不可復原的刪除按鈕 |
| `dangerSubtle` / `dangerHl` | red | 3 / 5 | 失敗的底 / diff 刪除行 |
| `warning` / `warningSubtle` | amber | 11 / 3 | 警告 |
| `success` / `successSubtle` / `successHl` | green | 11 / 3 / 5 | 成功 / diff 新增行 |

**主動作是墨色(版本 B)。** `accent` 是 gray 12,兩個主題都是;`accentText` 是 gray 1(淺)/ gray 2(暗);`link` 也是 gray 12,靠底線跟內文分開。藍色不拿來表示「可以按」,只表示 agent 在做事、焦點、進度。`info` 的值跟 `signal` 一樣：資訊提示跟「agent 在跟你說話」是同一件事。

所有文字對 WCAG AA 都過:`text` 7:1 以上,`textMuted` 與狀態色 4.5:1 以上;`textFaint`、`borderControl`、`focusRing` 是非文字,3:1 以上。`node scripts/palette.mjs` 印出完整的對比表,failures 必須是 0。

六條規則:

1. **一個顏色一個意思。** 藍色只代表 agent 正在做事與焦點;紅色只代表刪除與失敗;琥珀只代表警告;綠色只代表成功。拿來裝飾都是錯的。
2. **一個畫面一顆主動作。** 墨色實心按鈕一畫面一顆。`dangerSolid` 只給不可復原的刪除,其他破壞性動作用 `dangerGhost`。
3. **`textFaint` 不放字。** 它只有 3:1,給 icon、chevron、placeholder、分隔符;要讀的字一律 `textMuted`。
4. **`border` 是分隔線。** 控制項的邊界(input、checkbox、radio、switch 關)用 `borderControl`,`border` 對底色只有 1.4:1,當邊界看不見。
5. **狀態標籤是淡底加同色字。** 3 階底、11 階字(`successSubtle` + `success` 這種組合),永遠不用實心底。
6. **不手調顏色。** 要改色就改 `scripts/palette.mjs` 的色階或對應，重跑、把印出的 JSON 貼回 `tokens.stylex.ts` 與 `tokens.css`,然後 `pnpm gen:themes`。單獨改一個 hex 會讓那一階跟其他階的關係壞掉。

## 層次(elevation)

三階，陰影用黑色，不染色。

| 階 | 用在 | 淺色 | 暗色 |
| --- | --- | --- | --- |
| rest | 紙上的卡片:tool card、檔案列、附件 | `surfaceRaised` 底 + 1px `border` 環 + `0 2px 6px` 5% | `surfaceRaised` 底(升一階),環用 `border` |
| float | popover、dropdown、select、tooltip、toast | `0 1px 2px` 6% + `0 10px 24px` 10% | `surfaceRaised` 底 + 黑色 40% |
| modal | dialog、sheet | `0 2px 4px` 6% + `0 24px 56px` 16% | `surfaceRaised` 底 + 黑色 60% |

桌面是 `layer1`,主紙是 `layer2`(白)。紙裡面要分區就用凹下去的 `surface`(輸入區、使用者訊息泡泡、次要按鈕),不加邊框。

所有 rest 卡片(`Card`、tool card、檔案列、附件、互動卡、復原金鑰)都是 `surfaceRaised` 底,不要另挑一個值;卡片裡凹下去的區塊仍然是 `surface`。

dialog 的 backdrop 用黑色 32% 不加 blur。`backdrop-filter` 是 DESIGN.md 的反模式，現在的 Dialog 違規，一併拿掉。

## 圓角

圓角跟尺寸走，不是一個值套全部。巢狀時內層圓角 = 外層 − padding。

| 東西 | 圓角 |
| --- | --- |
| checkbox、kbd、小 chip 的內角 | 6px |
| input、select、textarea、segmented 外框 | 12px |
| 紙上的卡片(rest) | 14px |
| toast、popover、dropdown | 16px |
| composer、主紙 | 20px |
| dialog | 24px |
| 按鈕、badge、tag、switch、進度條、LiveDot 外框 | 全圓(膠囊) |

## 控制項

- 按鈕：膠囊。高度 32 / 40 / 48,預設 40(觸控)。primary 墨色實心;secondary 是凹下去的 `accentSubtle` 底、無框;ghost 透明，hover 才有底;danger 是 `dangerSolid` 底配 `onDangerSolid` 字，只給不可復原的刪除。按下時 `scale: 0.98`,120ms ease-out,reduced-motion 時不縮。
- 輸入框:`surface` 底 + 1px `borderControl` 框(邊界對底色要 3:1 才看得到;`border` 只有 1.2:1,只能當分隔線)。focus 時框換 `signal` 加 2px 環。
- checkbox / radio / switch:未選是 `borderControl` 框,switch 關的軌道也是;選中是墨色實心。switch 是膠囊軌道 + 白色圓鈕，鈕有 rest 陰影。
- tabs / segmented:選中的那格是浮起來的白紙(rest 陰影)放在凹下去的 `surface` 軌道上,外圈一條 1px `borderControl` 環。白紙對軌道只有 1.09:1,選中與否要靠這條環的 3:1 才分得出來。

## 字

- 內文與標題:Figtree,中文接 Noto Sans TC。標題 600–700,內文 400。Figtree 的 x-height 大、字形圓，跟膠囊和大圓角是同一個語氣;Geist 的幾何感偏冷，留給 mono。
- 數據、代碼、識別碼:Geist Mono 不換。
- 內文 15px、行高 1.6;字級表其他階不動。

## 對話

- 使用者訊息：靠右的凹下泡泡(`surface`),圓角 18 18 6 18。
- agent 訊息：不加泡泡，直接排在紙上。
- 想了幾秒 / tool card:膠囊按鈕展開;tool card 是 rest 卡片，左邊 36px 的 `signalSubtle` 圖示底，執行中有膠囊進度條。

## 動態

不變：只有 ease-out 與 linear,沒有回彈，只動 opacity 與 transform。新增的只有按鈕按下的 0.98。

## 不在這次範圍

- 換 token 名稱。舊名都保留，新增 `signal`、`signalSubtle` 與 elevation / 圓角的新 token。
- `brand.css` 的 class 詞彙。值會跟著 token 換，class 名稱不動。
