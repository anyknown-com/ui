# DESIGN.md

給要做出 AnyKnown 頁面的 agent 看的判斷。這份只寫程式碼與 token 裡看不出來的東西:頁面該怎麼組、什麼不准出現。數值不在這裡手抄,發佈版 `https://ui.anyknown.com/design.md` 後面接的附錄(token 表、`brand.css` 詞彙表)是 build 時從原始碼生成的。

兩種讀者。內部各 app 的 agent,已經用 `@anyknown/ui` + StyleX,元件層的規矩在 `src/components/README.md`,這份管頁面層。外部 agent(v0 / Claude / Codex)產一次性 HTML 頁面(報告、提案、benchmark、活動頁),沒有 bundler、沒有 React,只能 `<link>` 一份 `https://ui.anyknown.com/brand.css` 進來,用裡面的 `ak-*` class 排。詞彙刻意小;不在表上的 class 就是不准用。

## 1. 這是什麼

Ledger。暖紙底、墨字。viridian 只給一個主動作,頁面裡其他地方看到綠色都是錯的。serif(Newsreader)只給標題與大數字,內文一律 Geist,數據與代碼用 Geist Mono。元件沒有 background,實心是線織出來的,所以按鈕是一塊布不是一塊色。

氣質是帳本:安靜、可對照、沒有裝飾。讀者來是為了做一個決定,頁面的工作是把證據擺整齊,不是說服。

## 2. 先框讀者任務,再選結構

每種一次性頁面先答一句:讀者打開這頁要決定什麼。答不出來就不要開始排。

答得出來之後從三個骨架挑,不要自創:

- 單欄長文。報告、事後檢討。`ak-page` 裡一個 `ak-display`,接 `ak-prose`,證據表穿插其中。讀者從頭讀到尾。
- 結論在前,證據網格在後。提案、benchmark、定價比較。第一屏是結論(一段 `ak-prose` 加一排 `ak-stat`),往下是 `ak-section` 分段的 `ak-table` 與 `ak-grid-2` / `ak-grid-3`。讀者先看答案,再決定要不要看證據。
- 控制項在前。互動規劃頁、報名頁。`ak-btn` 與表單(每個欄位一個 `ak-field`,label 在上)在第一屏,說明在下面。讀者是來動手的,不是來讀的。

三個骨架共用同一套字級與間距。結構跟著讀者目標走,不跟著資料量走:資料多就分段,不要換骨架。

## 3. 證據怎麼擺

- 比較用的數字放同一把尺上:同一欄、同一單位、同一基準。兩個數字放在不同欄或不同單位,讀者就得自己換算,比較就失效了。
- 證據表滿版,不縮進卡片。`ak-table` 直接放在 `ak-section` 裡,寬度跟正文一樣。塞進卡片再加陰影是通用 SaaS 的習慣,帳本不這樣做。
- 一頁只有一個主圖,其他都是表。圖用來給一個印象,表用來對照;兩個以上的圖讀者就不知道該看哪個。
- 大數字用 `ak-stat`(裡面一個 `ak-stat-value` 一個 `ak-stat-label`),一排最多四個,而且只放結論級的數字。每個 section 都放一排 stat 就沒有結論了。
- 要讀者注意的一句話用 `ak-callout`,語意加 `ak-callout-info` / `ak-callout-warning` / `ak-callout-danger`。一頁最多兩個;到處都是提示框就沒有提示了。
- 數字用 tabular(`ak-table` 與 `ak-stat` 已經開了),欄內小數位對齊,單位放在表頭不放在每格。

## 4. 層級與排版

- 一頁一個 display 級標題(`ak-display`)。第二個 display 就是第二頁。
- `ak-h1` 給 section 的標題,`ak-h2` 給 section 內的分節。`text.xl` 以上的字只准出現在段落起頭,不准出現在段落中間或表格裡。
- 正文行長 60 到 75 字。`ak-prose` 已經設了最大寬,不要把它撐開;寬螢幕多出來的地方留白,不要拿東西填。
- 間距只用 `space.*` 階(附錄有表)。13px、18px 這種自創值一律不准;兩個 token 之間選不到就選小的那個。
- 顏色只用 `--ak-*` 變數。自創 hex 是這份文件最常被違反的一條,所以 lint 會數。
- 次要說明用 `ak-muted`,不用縮小字級來表示次要。字級表達層級,顏色表達重要性,兩個不要疊。
- 等寬只給數據、代碼、識別碼(`ak-mono`)。用等寬字當裝飾就是在假裝這是終端機。
- 淺色是預設,暗色跟隨 OS。`ak-theme-light` / `ak-theme-dark` 只給需要手動鎖定的頁面,鎖了就整頁鎖,不要一頁裡兩種。

## 5. 文案

- 句首大寫,不用 Title Case。標題是句子不是招牌。
- 按鈕動詞開頭:「送出報名」不是「報名表單」。讀者按下去之前要知道會發生什麼。
- 錯誤說怎麼修,不說對不起。「金額要大於 0」比「抱歉,發生錯誤」有用。
- 數字用 tabular,千分位用逗號,單位與數字之間一個空格。
- 不寫「強大」「無縫」「一站式」。帳本不形容自己。

## 6. 動態

- 只有 ease-out 與 linear。沒有回彈、沒有 overshoot、沒有 spring。`--ak-motion-spring` 留在 token 裡只是相容,不准用。
- 能不動就不動。一次性頁面通常什麼都不用動;需要的話只動 opacity 與 transform,時長用 `--ak-motion-*`。
- 尊重 `prefers-reduced-motion`,`brand.css` 已經處理 `ak-btn`,自己加的動畫要自己處理。

## 7. 反模式

逐條點名。看到就改,不用問。

- 通用 SaaS 三欄 KPI 卡:三個圓角卡片各放一個數字加一個 icon。用 `ak-stat` 一排,不要卡片。
- 漸層卡片、玻璃霧面、backdrop-filter。紙沒有這些。
- 彩色圓底 icon。icon 只用線條、單色、跟文字同色。
- 每段一張 hero 圖。一頁最多一張主圖(第 3 節)。
- 同一頁兩個主色按鈕。`ak-btn` 一頁一顆,其他都是 `ak-btn-secondary`。
- 把表格塞進卡片再加陰影。表格滿版,沒有陰影。
- 自創 hex、rgb()、hsl()。只用 `--ak-*`。
- 自創 class。詞彙外的 class 都不准,要新的排版需求先回來改 `brand.css` 再改這份。
- 內聯 style。一次性頁面也不例外,inline style 就是自創值的入口。
- 非 token 字體:Inter、Roboto、system-ui 直接寫在 `font-family` 裡。用 `--ak-font-*`。
- overshoot bezier、`animation: bounce`。第 6 節。
- 卡片裡再一層卡片。一層邊框就夠,巢狀邊框是層級沒想清楚。
- 全大寫小標(`text-transform: uppercase` 加 letter-spacing)。這是另一家的語言。
- `useEffect`(內部 agent)。ref callback 加 cleanup,範例在 `src/components/button`。

## 8. 交付檢查

交出去之前自己過一遍:

- 光暗兩色都要看。暗色不是把顏色反過來,是另一組 token;沒看過暗色就等於沒做。
- 縮到 375 寬要能讀。`ak-grid-*` 會自己折成單欄,表格要能橫向捲,不能把頁面撐寬。
- 截圖跟 `https://ui.anyknown.com` 的元件放一起,看不出是兩家。特別是按鈕:`ak-btn` 的織體與 playground 的 Button 應該是同一塊布。
- 跑 `node scripts/design-lint.mjs <html>`,自創 hex、詞彙外 class、內聯 style 都要是 0。
