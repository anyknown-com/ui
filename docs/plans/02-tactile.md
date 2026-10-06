# 軟材：取代 flat 的設計語言

設計稿：<https://claude.ai/artifact/MYmDqnAGB7F7gjJJRjMtqK> 的「C 軟材(選定)」兩張(淺色、暗色)。A、B 兩張是沒選上的方向，不要參考。

## 一句話

冷灰的桌面上放白紙。內容是紙，浮起來的東西是疊在紙上的紙；越靠近使用者的東西越圓、陰影越深。按鈕是膠囊。墨色是主動作，鳶尾紫只代表 agent 正在做事與焦點。

為什麼換：flat 靠 1px 邊框分層，一頁上的框太多，手機與桌面 app 共用時顯得像表單。軟材靠深淺與陰影分層，邊框只留給需要 3:1 邊界的控制項。

## 顏色

來源是 OKLCH,寫進 token 時轉成 hex(repo 現行記法)。產生與對比檢查的腳本在 `scripts/palette.mjs`,改色從那裡改、重跑、把輸出貼回 `tokens.stylex.ts`。所有文字對 WCAG AA 都過;暗色的 muted、danger、signal 另外拉到 APCA |Lc| ≥ 55。

- 中性色:hue 262、chroma ≤ 0.014 的冷灰。取代舊的 sage 綠底：綠底讓白紙看起來髒。
- `signal`(新 token)與 `signalSubtle`:鳶尾紫 hue 282。只用在 agent 正在做事(LiveDot、進度、執行中的 tool 圖示底)、焦點環、目前選中的導覽項。不用在按鈕底色，不拿來裝飾。為什麼是紫不是藍:info 原本是藍，紫跟 danger 紅、success 綠、warning 琥珀的色相都至少差 60°。
- `info` 併到 `signal` 的值。資訊提示跟「agent 在跟你說話」是同一件事，一個意思一個顏色。
- `accent` 仍是墨色:主按鈕、勾選後的 checkbox/switch、選中的 segmented。
- `focusRing` = `signal`。
- danger / success / warning 只表示結果，各有 `*Subtle` 底。

## 層次(elevation)

三階，陰影用中性色 hue 262 染色，不用純黑(暗色才用黑)。

| 階 | 用在 | 淺色 | 暗色 |
| --- | --- | --- | --- |
| rest | 紙上的卡片:tool card、檔案列、附件 | 1px `border` 環 + `0 2px 6px` 5% | 底色升一階(`surface`),環用 `border` |
| float | popover、dropdown、select、tooltip、toast | `0 1px 2px` 6% + `0 10px 24px` 10% | `surfaceRaised` 底 + 黑色 40% |
| modal | dialog、sheet | `0 2px 4px` 6% + `0 24px 56px` 16% | `surfaceRaised` 底 + 黑色 60% |

桌面是 `layer1`,主紙是 `layer2`(白)。紙裡面要分區就用凹下去的 `surface`(輸入區、使用者訊息泡泡、次要按鈕),不加邊框。

dialog 的 backdrop 用中性墨色 32% 不加 blur。`backdrop-filter` 是 DESIGN.md 的反模式，現在的 Dialog 違規，一併拿掉。

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

- 按鈕：膠囊。高度 32 / 40 / 48,預設 40(觸控)。primary 墨色實心;secondary 是凹下去的 `accentSubtle` 底、無框;ghost 透明，hover 才有底;danger 紅底。按下時 `scale: 0.98`,120ms ease-out,reduced-motion 時不縮。
- 輸入框:`surface` 底 + 1px `borderControl` 框(邊界對底色要 3:1 才看得到;`border` 只有 1.2:1,只能當分隔線)。focus 時框換 `signal` 加 2px 環。
- checkbox / radio / switch:未選是 `borderControl` 框,switch 關的軌道也是;選中是墨色實心。switch 是膠囊軌道 + 白色圓鈕，鈕有 rest 陰影。
- tabs / segmented:選中的那格是浮起來的白紙(rest 陰影)放在凹下去的 `surface` 軌道上。

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
