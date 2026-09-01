# design.md：讓外部 agent 也能做出 AnyKnown 的一次性頁面

參考 Vercel 的做法（vercel.com/blog/how-our-agents-build-on-brand-pages-with-design-md）：一份講判斷的文件、一份有界詞彙的公開 stylesheet、一個把回饋分流回去的評估迴圈。三層缺一不可，只給 token 表 agent 還是會做出通用 SaaS dashboard。

目標讀者兩種：內部各 app 的 agent（已經用 `@anyknown/ui` + StyleX），以及外部 agent（v0 / Claude / Codex）產出不進 repo 的一次性 HTML 頁面：報告、提案、benchmark、活動頁。後者沒有 bundler、沒有 React，只能吃純 CSS 與純文件。

## 現況對照

| Vercel | 本 repo 現況 | 缺 |
| --- | --- | --- |
| design.md（判斷） | 五份指南全是工程向（元件決策、織體幾何、a11y 債） | 一份講「頁面該怎麼組、什麼不准出現」的文件 |
| vercel-brand.css（有界詞彙） | `tokens.css`（`--ak-*` 變數） | 變數不是詞彙：外部 agent 拿到變數還是自己排版。缺 class 級的 stylesheet |
| 評估迴圈 | 內部規矩：mock + agent-browser light/dark 截圖、CEO 看過才算 | 固定場景、可數的機械錯誤、回饋分流的落點 |
| 公開管道 | `llms.txt` / `llms-full.txt` / `docs/*.md` | 加 `design.md` 與 `brand.css` 兩個穩定網址 |

## 一、`DESIGN.md`（手寫，只寫判斷）

放 repo 根，跟 README 平行。內容只寫程式碼與 token 裡看不出來的東西，不抄任何數值（數值由第三節生成接在後面）。章節：

1. 這是什麼：Ledger 的氣質一段話。暖紙底、墨字、viridian 只給一個主動作；serif 只給標題與大數字，內文一律 Geist；元件沒有 background，實心是線織出來的。
2. 先框讀者任務再選結構。每種一次性頁面先答「讀者打開這頁要決定什麼」，再從幾個骨架挑：單欄長文（報告）、結論在前＋證據網格（提案、benchmark）、控制項在前（互動規劃頁）。同一套字級與間距，結構跟著讀者目標走。
3. 證據怎麼擺：比較用的數字放同一把尺上（同一欄、同一單位、同一基準）；證據表滿版不縮進卡片；一頁只有一個主圖，其他都是表。
4. 層級與排版：一頁一個 display 級標題；`text.xl` 以上只准出現在段落起頭；正文行長 60–75 字；間距只用 `space.*` 階，不准 13px 這種自創值。
5. 文案：句首大寫不 Title Case、按鈕動詞開頭、錯誤說怎麼修不說對不起、數字用 tabular。
6. 動態：只有 ease-out 與 linear，沒有回彈；能不動就不動。
7. 反模式清單，逐條點名，這是 agent 最需要的一節：通用 SaaS 三欄 KPI 卡；漸層卡片與玻璃霧面；彩色圓底 icon；每段一張 hero 圖；同一頁兩個主色按鈕；把表格塞進卡片再加陰影；自創 hex；`useEffect`（內部 agent）；overshoot bezier。
8. 交付檢查：光暗兩色都要看；縮到 375 寬要能讀；截圖跟 ui.anyknown.com 的元件放一起看不出是兩家。

寫法照 `writing-and-planning-style`：不用粗體、句子短、每條規則附一句為什麼。

## 二、`brand.css`（有界詞彙，純 CSS）

給沒有 bundler 的頁面，一個檔案 `<link>` 進來就能用。來源 `src/brand.css`，build 時把 `tokens.css` 內聯進去（單檔、不用管相對路徑），加 Google Fonts 的 `@import`（Newsreader、Geist、Geist Mono 三個都在 Google Fonts 上，外部頁面沒有 `@fontsource`）。

詞彙刻意小，十五個左右，全部 `ak-` 前綴：

- 骨架：`ak-page`（最大寬、左右留白、bg）、`ak-section`、`ak-grid-2` / `ak-grid-3`
- 文字：`ak-display`、`ak-h1`、`ak-h2`、`ak-prose`（含 p / ul / ol / a / code 的階層）、`ak-muted`、`ak-mono`
- 證據：`ak-table`（滿版、tabular-nums、斑馬用 bone）、`ak-stat`（大數字 serif + 小標 muted）、`ak-callout`（info / warning / danger 三色由 modifier 決定）
- 動作：`ak-btn`、`ak-btn-secondary`；`ak-btn` 的實心用 `weave.ts` 在 build 時預渲染成 SVG data URI 當 background，靜態織體即可，不做 silk 動態。這一步保住品牌辨識，不然外部頁面的按鈕就是一顆 viridian 色塊。

沒有 card、沒有 hero、沒有 badge 一堆變體。詞彙不在表上就是不准用，這正是「有界」的意思。

dark 跟隨 OS，跟 `tokens.css` 一致；`.ak-theme-light` / `.ak-theme-dark` 兩個 class 給要手動切的頁面。

出口：`site/dist/brand.css`，網址 `https://ui.anyknown.com/brand.css`；同時進 package `exports` 的 `./brand.css`，內部想做靜態頁也能用。

## 三、生成與發佈（`scripts/llms-txt.mjs` 擴充）

1. `design.md` = `DESIGN.md` 原文 + 生成附錄：token 表（從 `tokens.stylex.ts` 讀，light / dark 兩欄）、`brand.css` 的 class 清單（從 css 掃 `.ak-` selector，附一句用途，用途寫在 css 註解裡、掃出來）。數字永遠不手抄，跟 `gen:themes` 同一思路。
2. 出 `site/dist/design.md`，`llms.txt` 第一條指過去，並註明 `brand.css` 的網址與最短用法（一段 HTML 範例：link brand.css、`ak-page` 包起來、一個 `ak-h1` 一段 `ak-prose` 一張 `ak-table`）。
3. `scripts/design-check.mjs` 進 `pnpm check`：DESIGN.md 裡提到的每個 `ak-*` class 都要存在於 `brand.css`，反過來 `brand.css` 每個 class 都要在 DESIGN.md 出現過一次。文件與詞彙不同步就擋。

## 四、評估迴圈

沒有這層，前兩層寫完就會慢慢過期。

1. 固定五個場景放 `site/eval/scenarios/`，每個一段 prompt 加一份假資料：product 的 usage 月報、call 的定價比較、storage 的功能提案、一場 benchmark、一頁活動報名。場景不換，才量得出差異。
2. 跑法：subagent 帶 `design.md` + `brand.css` 各產一頁，再不帶各產一頁；agent-browser 光暗各截一張。照 `e2e-subagent-user-story` 的規矩分批、每批最多三個。
3. `scripts/design-lint.mjs` 對產出的 HTML 數機械錯誤：自創 hex、`--ak-*` 以外的顏色、詞彙外的 class、非 token 字體、overshoot easing、內聯 style。有數字才知道文件有沒有用；Vercel 的 57% 就是這樣量的。
4. 回饋分流，每次走查後固定做：判斷型的修正寫進 `DESIGN.md`；重複出現的排版需求加進 `brand.css`（同時 DESIGN.md 加一條）；能用規則抓的丟進 `design-lint.mjs`。同一個問題三個地方只能落一個，落在最靠近機器的那個。
5. 成功指標不是零錯，是同類抱怨在下一輪同類場景出現的次數下降。

## 順序與驗收

1. `DESIGN.md` 初稿 → 驗：CEO 讀過一遍，反模式清單每條他都同意。
2. `brand.css` + 織體 SVG 預渲染 → 驗：一頁純 HTML 範例用 `site` 開起來，光暗截圖放在 playground 的 Button 旁邊看不出兩家。
3. 生成與 check → 驗：`pnpm site:build` 出 `design.md` / `brand.css`，`pnpm check` 對故意寫錯的 class 會紅。
4. 五個場景第一輪 → 驗：有無 design.md 的機械錯誤數對比，寫進本檔末尾當基線。
5. minor release，README 的「基礎設施現況」表加兩個網址。

## 不做

- 不做 Slack 裡的 design-agent，我們的入口是 Claude Code。
- 不做 class 級的完整元件庫（dialog、select 那些）；一次性頁面不需要互動元件，需要就回到 `@anyknown/ui`。
- 不做多品牌／多主題，只有 Ledger。
