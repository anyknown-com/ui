# 元件決定紀錄

36 個元件的**定案理由、走過的彎路、踩過的坑** —— 只留程式碼與型別裡看不出來的東西。
API 看 `dist/index.d.ts`,實際長相看 [playground](https://ui.anyknown.com)。

對比與命中區的已知偏差在 [A11Y-DEBT.md](./A11Y-DEBT.md)。

---

## 表單

### input / textarea
單行與多行文字輸入,共用 border / focus / error 的樣式語言。

- **控件自己要寫 `boxSizing: border-box`**。`<input>` / `<textarea>` 拿的是瀏覽器預設的
  content-box,`minHeight: 2.25rem` 會變成「內容」36px 再加 padding + border,md 實際
  長到 54px(還會因為 `width: 100%` 超出容器 26px)。不能靠 app 端剛好有
  `*{box-sizing:border-box}`。同一個坑也修了 Select 的 multiple trigger(那顆是 div,
  拿不到 UA 的 border-box)
- **單行控件行高用 `leadingTight`**。1.5 會把 md 撐到 39px,和 button / select 差 3px。
  Textarea 自己蓋回 `leadingRelaxed`,多行照樣好讀
- 尺寸:md / sm / button / select = 36 / 28 / 36 / 36px,textarea 72px

### label
表單標籤,含 required / optional 標記。連同 `Field`(label + control + help/error 的組合
容器)一起用,自動接好 `for` / `aria-describedby`。

- `Field` 擁有它那顆控件的 `id`(控件自己傳的 `id` 會被忽略),所以**一個 Field 只放
  一顆控件**。Checkbox / Radio / Switch 自帶 label,放進 Field 時只給 `help` / `error`
  / `disabled`

### checkbox
原生 `<input type="checkbox">` 隱藏 + 自繪 box。

- 未勾是 `bg` 上一圈 1.5px `borderStrong`;勾選 / indeterminate 是 `accent` 實心方塊,
  上面一筆 `accentText` 的勾(或一橫),`stroke-dashoffset` 160ms 畫出來
- dasharray(32)要比路徑(約 18)長:曾用 24 配 28 的路徑,unchecked 時會漏出尾巴
- field context 的 `invalid` 畫成 `danger` 邊框

### radio
原生 `<input type="radio">` + `fieldset/legend`。`variant="card"` 選中時亮整張。

- 標準構成:外環 + 空隙 + 內圓。選中時外環與內圓都是 `accent`,內圓 scale 0 → 1
  160ms ease-out,不過衝

### switch
即時生效的開關(相對於 Checkbox 的「提交後生效」)。原生 checkbox + `role="switch"`。

- 軌道是實心藥丸:關 `borderStrong`、開 `accent`。thumb 關的時候永遠是白的(用 `bg`
  在暗色下會變成黑鈕),開的時候是 `accentText`
- thumb 滑動 180ms ease-out,**不過衝** —— 曾用 `cubic-bezier(.34,1.56,.64,1)` 的雙彈跳,
  過衝一律不要
- 設定列的慣用排版:文字在左、開關在右

### slider
一條連續的量(思考多少、門檻)。**沒有節點** —— 有節點就該是 Radio 或 Select。

- **刻意不用 Base UI**:它的方向鍵一次走 `step`,要「拖曳連續、方向鍵 5%」就得跟它搶
  keydown;一顆單向的 `role="slider"` 自己寫比較誠實
- 方向鍵 ±5%(range 的,不是 step 的)、Home / End 到底,值一律 clamp 再 snap 回 step
- 軌道 `layer4`、填滿 `borderStrong`、握把 `surfaceRaised` + `shadow.raised`
- 握把 200ms `easeOut`,**拖曳中把 transition 關掉**(不然手指在前、握把在後)
- `valueText` 唸的是標籤不是數字:0.62 要唸成「多」
- 存檔接 `onValueCommit` 不接 `onChange`:拖曳放開(含 pointercancel)給一次、方向鍵 / Home / End
  每動一次給一次;值沒變就不給。拖一下 PATCH 一次就是接錯了事件

### select
觸發鈕 + popover(頂部搜尋框 + 分組列表)。

- 定案要有:text search filter(空結果顯示帶查詢字的 empty state)、multiple
  (trigger 內顯示可個別移除的 chips)、options grouping(過濾後空群組自動隱藏)

### dropdown
動作選單(相對於 Select 的「選值」)。

- 定案要有:多層 submenu(不限一層)、group label、separator、checkbox item、
  快捷鍵提示、danger item

---

## 基礎

### button
平的:一個 background、hover 往頁面底色混 14%(ghost 類是透明 → `bone` / `dangerSubtle`)。

| variant | 底 | 標籤色 | 用在 |
| --- | --- | --- | --- |
| `primary` | `accent` | `accentText` | 主要動作,一個畫面一顆 |
| `secondary` | `bone` | `text` | 次要動作 |
| `ghost` | 透明 | `textMuted` | 安靜的第三選項 |
| `danger` | `danger` | `accentText` | 不可逆的破壞性動作 |
| `dangerGhost` | 透明 | `danger` | 「白底紅字」:要看得出語意但不搶份量 |

- children 包在 `position: relative` 的 span 裡

### dialog
模態對話框:半透明 blur backdrop、scale+fade 進場、Esc / backdrop 關閉。
danger confirm 變體給不可復原的動作(刪除記憶、清空 thread)。

- ConfirmDialog 免費繼承 Button —— Base UI 的 render prop 會把 children 併進來
- 寬度三階 `size`:`sm`(預設 24rem)/ `md`(40rem)/ `full`(64rem 寬、46rem 高的沉浸式)。
  **原本刻意不給 `size`**,理由是尺寸的組合無限;改口是因為「沉浸式」那個組合(寬 + 高 +
  不自己捲)每個使用端都抄一次同一段 `sx`,那就是一個階不是一個偏好。階外的仍然走 `sx`
- `body` 是會捲的那一段:給了 `body`,popup 自己不再捲(`overflow: hidden` + flex column),
  標頭與 `children`(篩選 chips 那排)釘住,只有 `body` 捲 —— 沉浸式清單捲起來標頭不能跟著跑

### toast
非阻斷通知:右下角疊放、slide+fade 進場、5 秒自動消失(hover 暫停),可帶一個動作
按鈕(「已刪除 · 復原」)。danger / success 用色點區分。

- **狀態自己養,不靠 Base UI toast**。`createToastManager()` 跑在 `lib/store.ts`
  (`subscribe` / `getSnapshot` / `set`,React 端走 `useSyncExternalStore`),計時器也在
  manager 裡。改這裡之前要知道:live region、暫停、limit 現在都是我們的責任,沒有人替我們兜
- API:`toast(title, opts)` / `toast.success` / `toast.danger` 回傳 id;
  `toast.update(id, patch)`、`toast.close(id)`、
  `toast.promise(promise, { loading, success, error })`(`success` / `error` 可以是字串或
  拿到值 / 錯誤的函式,回傳原本的 promise)。`toastManager.add({ title, type, ... })` 的形狀
  沿用 Base UI 的 `type` 欄位名,舊的呼叫端不用改
- **loading 不倒數**,落定才換成 success / danger 並從頭倒數。`update` 也從頭倒數 ——
  內容換了就是新訊息,要給完整的時間讀
- **同 key 去重就是全部的「分組」**:同一個 `key` 還在畫面上時,不疊新的一則,原地換內容、
  重新倒數、計數 +1,標題後面一個 `×N`(tabular 數字)。沒有更精巧的分組
- `limit`(預設 3)超過就**丟掉最舊的**,不是藏起來排隊
- 暫停有三個來源,任何一個在就停:viewport 上 hover、viewport 內有 focus、`document.hidden`。
  倒數線是 CSS 動畫,`animationPlayState` 跟著同一個 `paused` 走;重新倒數靠 `epoch` 換 key
  重播。全部關掉時順手清掉 hover / focus —— viewport 縮成 0,mouseleave 不一定會來,
  不清的話下一則會永遠停住
- 無障礙:viewport 是常駐的 `role="region"` + `aria-live="polite"`;每則是
  `role="status"`(`aria-atomic`,去重 / promise 更新時整則重念),danger 是 `role="alert"`。
  色點之外有視覺隱藏的「成功:/ 錯誤:」;每則都有一顆「關閉通知」
- viewport 的 hover / focus / visibility 監聽掛在 ref callback 裡(含 cleanup),不用 `useEffect`

### tooltip
純提示浮層:hover 與鍵盤 focus 延遲 400ms 顯示,反色小氣泡,只放一行文字(可附 Kbd)。
**絕不放互動內容**。

### popover
定位浮層基礎件:trigger 錨定的 surface 卡片。select / dropdown / combobox 都疊在它上面,
也直接承載富內容(記憶詳情、成員卡片)。

疊層值集中在 `lib/popup.ts` 的 `layer`,元件不自己寫 magic number —— Base UI 的浮層一律
portal 到 body,跟 dialog / toast 同在 body 層比 z-index,各寫各的就會出洞:

| 層 | 值 | 為什麼在這個位置 |
| --- | --- | --- |
| dialog backdrop | 70 | |
| dialog viewport | 71 | |
| popup(select / dropdown / popover) | 75 | 浮層是當下互動的最上層,要壓過 dialog |
| tooltip | 78 | popup 裡的元素也能有 tooltip |
| toast | 80 | 非阻斷通知不能被 modal 蓋掉 |

- 跨檔案 import 的值在 `stylex.create()` 裡不能靜態求值(只吃同檔內的常數),所以 `layer`
  之外另配一份做好的 `layerStyles`,dialog / tooltip / toast 套樣式而不是讀數字
- 走過的彎路:popup 曾是 40,低於 dialog 的 71 —— dialog 裡的 Select 打開後,選項其實有
  渲染(accessibility tree 看得到、鍵盤也能操作)卻被 dialog 蓋住,對滑鼠使用者等於壞掉。
  popup 抬到 dialog 之上對非 dialog 情境無影響:popup 是 portal 到 body 的暫態層,modal
  打開時 Base UI 會關掉外面的 popup
- Composer 的來源/指令浮層是 `position: absolute` 的 `zIndex: 10`,活在自己的堆疊脈絡裡,
  不吃這張表

### tabs
同層內容切換。underline 為預設,pills 用於篩選型切換。

- Base UI 1.7 走 **manual activation**(方向鍵移動焦點,Enter/Space 才切換),
  disabled tab 保持可聚焦不被跳過 —— 這是 APG 預設。可見的 disabled 樣式要用
  `state.disabled`,寫 `:disabled` 永遠不會命中
- underline 240ms `cubic-bezier(.16,1,.3,1)`,兩邊各自單調往目標走,**無倒退無過衝**
- pills:選取高亮是一顆平的藥丸(`surfaceRaised` + 1px `border`)在 tab 底下滑
- indicator 位置不自己量:Base UI 的 `Tabs.Indicator` 本來就把 `--active-tab-*` 寫成
  inline style,藥丸的 `width` / `height` / `translate` 直接吃那些變數
- 走過的彎路:底線的「鬆緊彈性」(雙彈簧 + 拉伸下垂)——「太誇張了」;
  x 與 width 各拆一條曲線的組合會衝過再收回,違反「任何邊不得倒退」

### badge / chip
badge 是唯讀語意標籤,chip 是可互動(可移除、可按)的篩選單位,同一家族。

- chip 的 `×`:負 block margin 讓圓鈕不撐高 chip,`::after` 補到 24px 命中區
  (WCAG 2.2)而不影響版面 —— 這一招可以套到其他小命中區
- `removeLabel` 只在給了 `onRemove` 時必填;沒有 × 就沒有要唸的東西
- 給 `onClick` 就渲染成真的 `<button aria-pressed>`(沒給就是 `<span>`)。
  選取態是**反白**(text 底、bg 字),不是加一圈邊框 —— 一排篩選 chip 掃過去要一眼看出開哪幾個。
  可按的 chip 不轉發 `ref`(那會是 button 的 ref,不是 span 的)

### kbd
快捷鍵標示:surface 底 + border + 1px 下緣陰影做出按鍵感,Geist Mono,
單鍵 / 組合 / 序列三種排法。

### skeleton
載入骨架:占位形狀 + shimmer,形狀要對齊實際內容的排版(thread 骨架就長得像 thread),
避免載入完成時跳版。

### progress
1. **bar(determinate)** — 4px 的 `border` 軌 + `accent` 實心填充,寬度跟著 value 走
   (進度更新頻繁,用短的 linear transition,expo 會拖在後面)
2. **bar(indeterminate)** — 40% 的一段 1.8s linear 滑過去;底下一行 mono 說現在在做什麼。
   reduced motion 時停在原地
3. **ring(context 用量)** — `border` 的軌圓 + `accent` 的弧(`stroke-dasharray`)。精確讀數
4. **spinner** — 一段 `currentColor` 的弧 0.8s linear 在轉
5. **ball** — 跟 ring 同一張圖,只是尺寸不同;API 留著

- **零 rAF**:determinate 靠 CSS transition,indeterminate 靠 CSS animation
- indeterminate **不設 `aria-valuenow`、不顯示百分比** —— 沒有真實進度可報
- spinner 用 `role=status`;它不從內容取名,所以 `aria-label` 與視覺隱藏的內文都要

### empty-state
空狀態 = 行動邀請:icon + 一句說明 + 主要動作。文案永遠說「下一步做什麼」,
不只陳述「沒有東西」。

### scrollbar
不是元件,是一份全域 CSS(`@anyknown/ui/scrollbar.css`)。StyleX 做不了
`::-webkit-scrollbar` 偽元素。

- thumb 是 `borderStrong` 圓角線,外圍 3px 透明邊距(`background-clip: padding-box`)
  讓它浮在內容旁;hover 轉 `textFaint`。寬 10px,實際可見約 4px
- 容器建議加 `scrollbar-gutter: stable` 防止內容因捲軸出現而跳動

---

## Desktop AI-native

### message
過去區的訊息節奏:user 右對齊氣泡、assistant 全寬純文字。turn 24px / part 8px,
字級只走三個 token。

### bubble
product 殼的訊息泡泡(0.9):整寬、`radius.xl`、上下 12 左右 16、`t3` / `body`。人說的是
`successHl` 底、照打的字顯示;回覆是 `layer3` 底、`Markdown tables="ruled"`。

- 跟 `UserMessage` / `AssistantMessage` 不是同一個版面:那組是 desktop 的 turn(靠右 85%
  的泡泡、全寬的回覆、串流游標、action bar),這個是殼的一列一泡泡。位置與寬度交給 thread
- prop 叫 `from` 不叫 `role`:`role` 是 ARIA 的字,給一個不是 ARIA role 的值 lint 會擋

### attachment
訊息帶的檔案(0.9,product 殼搬來):`AttachmentGrid` 一排會折行、間距 16 的 150px
方塊;`AttachmentTile` 是 `layer3`、`radius.xl` 的方塊,上面一段名字 + 一個字的種類
(`PDF`)。有 `preview` 就是圖,`object-fit: cover` 鋪滿,說明變白字加陰影;沒有就在左下角
畫 28px 的檔案 glyph。

- 不是 `FileRow`:那是檔案管理的一列(勾選、動作),這是訊息裡看得到的附件
- 圖的 `alt=""`:名字已經寫在 `figcaption`,再唸一次是重複

### tool-card
工具呼叫的收據:單列 icon + title(動詞)+ subtitle(主要參數)+ 耗時 + chevron,
展開看輸入/輸出。**subagent 是它的變體,不是新元件家族**。

### reasoning-fold
思考過程的摺疊列:預設收合只留「思考了 N 秒」,串流中撐開、標籤 shimmer「思考中…」。
內容永遠是 muted 斜體的配角。

### action-bar
assistant 訊息底部的 hover 動作列。**高度永遠保留**(pb + 負 mb 技法),hover 只切
opacity —— turn 節奏零跳動。

### code-block
header(語言小寫標籤 + 複製鈕)+ `text-code`(13/1.5 mono)本體。
超寬**只在 block 內橫向捲動**,不讓頁面橫捲。

### markdown
一則訊息裡的 markdown:GFM 表格、fenced code、TeX 數學、任務清單。
`marked` 只用 `lexer()` 拿 token 樹,每個 token 自己轉成 React element ——
**整個元件沒有一處走 `innerHTML`**,模型吐 `<script>` 就顯示原始碼,不會執行。

- **根節點一定要自己寫 `color` / `fontSize` / `lineHeight`**。第一版漏了 `color`,
  段落與表格就繼承宿主的 `body`,而 playground / site 的 `main.css` 把 `@stylex;`
  擺在 `@import` 前面,postcss 丟掉 @import、`--ak-text` 是空字串 —— 深色主題下
  變成黑字配 `rgb(32,29,24)` 的底。同一個元件裡的 CodeBlock 沒事,因為它自己寫了
- 任務清單用 `Checkbox`,不是原生 `<input type=checkbox>`(後者用 OS 的 accent
  color 畫自己,完全不看主題)
- 表格**照內容寬度**,不 `minWidth: 100%`:兩欄表格拉滿訊息寬只會把字推到左右兩端。
  外層 wrapper 才是捲動的那一層
- `tables="ruled"` 是泡泡裡的表格:沒有框、沒有底,表頭下與列之間一條 `border` 細線、
  最後一列下面沒有;表頭 13px `textMuted` 500,格子 `8px 24px 8px 0`。預設 `grid` 不變
  (記憶的附件內文還在用)。以前 product 靠 `[data-bubble] th/td { … !important }` 蓋掉,
  現在不用了
- `breaks: true`。這是訊息不是文件 —— 單獨一個換行是寫的人真的想換行
- 圖表不做:mermaid 光 unpack 就 84MB,設計系統不該讓每個裝它的 app 背。
  留 `renderBlock({lang, code})` 這個口子給 shell 自己接,沒接就退回 code block
- 自己的 `Marked` 實例,不用 module-level 的 `marked`:`marked.use()` 是全域的,
  會污染宿主 app 解析的其他東西

### formula
TeX → MathML,交給瀏覽器排版。**選 Temml 不選 KaTeX**:輸出 MathML 就不需要
樣式表也不需要 web font,而 KaTeX 會逼每個消費端多引一支 CSS 加 1MB 字體。
螢幕閱讀器拿到的也是真的數學而不是一堆定位過的 span。

- Temml 是動態 import 的(~250KB,多數訊息沒有數學),還沒到之前畫面上先顯示原始 TeX,
  所以載入失敗也不會留一塊空白
- `temml.render(node)` 直接寫進 DOM,不經過字串 —— 這個 package 沒有一處用
  `dangerouslySetInnerHTML`,數學不該是第一個
- `$` 同時是錢。`$5 漲到 $10` 不是公式:開頭 `$` 後不能是空白、結尾 `$` 前不能是
  空白且後面不能接數字
- marked extension 的 `start()` **是 marked 下刀的位置**,不是「下一個 `$`」。
  block 層的 hint 指到行內數學的 `$`,就會把整個句子從中間切成兩段(`breaks: true`
  之下前半的尾隨空白還會變成 `<br>`)。所以 block 與 inline 各有各的 hint

### payload-block
工具被呼叫時帶的參數、回來的結果(0.9,product 殼搬來):1px `border` 的框、`corner.card`、
mono `t2` / `snug`,內容左 16 右 48 上下 12、橫向捲動,右上角一顆 32px 的複製鈕
(`IconButton`,1.5 秒後從勾變回複製)。沒有語言標頭,這是它跟 `CodeBlock` 的差別。

- **不帶語法高亮**。shiki 一裝就是幾 MB 的語法與主題,設計系統不該讓每個 app 背;
  也不收 HTML 字串 —— 整個套件不走 `innerHTML`。要上色的殼傳 `highlight(code)`,
  回一個 React node 放在原本 `<pre>` 的位置(shiki 的 `codeToHast` + `toJsxRuntime`,
  或殼自己決定要不要 `dangerouslySetInnerHTML`);沒傳就是純文字的 `<pre>`
- 複製的永遠是 `code` 原文,不是畫出來的東西

### interaction-card
agent 在等你的兩種卡:Permission(權限請求)與 Decision(要你決定)。
pending 是可操作物,回覆後收成過去區的不可改收據。

- Permission:warning 邊框、mono 顯示指令 / 對象、允許一次(⏎)/ 總是允許(⌘⏎)/
  拒絕(Esc)、底部 policy 說明列(解釋為何問、規則活過 rotation)
- Decision:同一種卡分 blocking(邊框 accent、「等你才能繼續」)與 non-blocking
  (安靜邊框、「等你 · deadlineAt 倒數」);內容走 block DSL(markdown / options /
  text / table / image / diff);必填未選時送出 disabled,有 recommended 時多一顆「照建議」
- 三顆回覆鈕:允許一次 `primary`、總是允許 `secondary`、拒絕 `dangerGhost`。
  拒絕不給整塊實心 danger(一整塊紅會蓋過 primary),但語意要看得出來 ——
  這個元件自己的 token 語彙裡 danger 本來就是「拒絕」的顏色(收據列 rejected 的 ✓
  用的就是 `color.danger`)
- 複選 options 是**無框列**:Checkbox 沒有 card variant,外框也無法從外面套
  (caller 的 className 會落到 input 上)
- 快捷鍵**只攔 Esc 與 ⌘⏎**,單獨的 ⏎ 留給被聚焦的按鈕自己 —— 否則 tab 到「拒絕」
  按 ⏎ 會變成允許
- 收據的 `aria-live="polite"` 區塊**常駐**(pending 時是空的視覺隱藏節點),回覆後才
  填字 —— region 跟文字一起掛上是不會播報的

### handoff-receipt
rotation 分隔線:thread 過去區裡一條安靜的細列「換班完成 · 時間 · ctx 50% → 新
session」,可展開看交接摘要。用戶不管理 session,**這是他唯一看見換班的地方**。

- collapsed 為預設,左右虛線把它嵌進時間軸;展開(同列 toggle,不開 dialog)看三項
  核對:記憶落盤幾筆 / 摘要已交給下一輪(讀後銷毀)/ 本輪收據數
- **是收據不是控制**:不可改、無任何動作按鈕
- 卡面是平的 `surfaceRaised` + 1px `border`;展開時虛線變實線、連結 icon 轉 `accent`
- 收合狀態用 `inert` 不能用 `hidden` —— 一樣離開 a11y tree 與 tab 序,但留在版面上
  讓 0fr→1fr 跑得動
- 走過的彎路:`display: none` 硬切 + 單向 fade 被打回「死板」;展開讓頁面長高 →
  scrollbar 出現 → 置中內容左移(修法是 `html { scrollbar-gutter: stable }`,已進 `tokens.css`)

### composer
釘在現在線上的 prompt bar:**說話發生在現在** —— 送出後上方多一條收據、下方未來區
當場重排。永遠可用,不被 pending 卡阻塞。

- 多行 textarea 自動長高(max-height 後內捲);⏎ 送出、⇧⏎ 換行
- 左側 @ 來源鈕與 / 指令鈕;右側 model picker、麥克風、送出(空值 disabled)
- 打 `@` 時浮層列出來源建議(檔案 / ledger 收據 / 記憶,各帶種類標),點選補全
- focus 時整條 border 轉 accent(`:focus-within`)

### attach-button / pending-files
chatbox 的附件(0.9,product 殼搬來)。`AttachButton` 是一顆 36px 的 `IconButton`(18px 的
`+`),按了開檔案選擇器;`PendingFiles` 是選好還沒送的檔,一檔一個 outline `Chip`、`×`
拿掉,間距 6、會折行。

- 鍵盤與讀屏摸到的是按鈕;真正的 `<input type="file">` 是 `hidden`、`tabIndex -1`,
  只給 `.click()` 打開選擇器。選完把 `value` 清掉,同一個檔可以再選一次
- 不是 `Dropzone` / `UploadList`:那是整塊虛線拖放區與帶進度條的上傳清單,
  chatbox 只要一顆鈕跟一排 chip

### call-bar
通話時 chatbox 換成的那一條(0.9,product 殼搬來):`layer4` 底、`corner.card`、左 16 其他 8;
呼吸的點、狀態字、mono 的 `mm:ss`、靜音、紅色的掛斷。

- **受控,自己不存任何狀態**:`status` / `seconds` / `muted` 都從通話 session 來,
  `onMute(next)` 交出要切到的值。舊版在元件裡自己 `setInterval` 數秒、自己記靜音,
  換頁重掛就歸零
- `status` 跟 product contract 的 `CallStatus` 同一組七個值。字是預設的中文,
  `labels` 換;稿只畫了 `listening`「通話中」與靜音「已靜音」,其他五個是先給的字
- 狀態變化**不做 live region**:通話中讀屏插嘴會蓋掉對方的聲音。整條是
  `role="group"`(名字「通話」),點是裝飾

### voice-indicator
一眼看出 agent 現在是在聽你、在想、還是在說 —— 對應 STT → runtime LLM → TTS 的三段。

- 四態:`idle`(靜態灰 bar)/ `listening`(5 條音量 bar 起伏)/ `thinking`(單點脈動)
  / `speaking`(波形依序起伏)
- 視覺化區**固定寬高**,換態不跳版;文案標明可插話(「說話中…插話會打斷」= barge-in)
- reduced-motion:全部動畫關閉,bar 停在中段靜態高度,改顯示 mono uppercase 靜態文字標

### live-dot
「還在跑」的一顆呼吸點。給工具紀錄的當前動作、sub thread 的進行中狀態。

- 呼吸只到 0.35 就回來:淡到底會變成閃爍,那是警報不是「還在跑」
- 1.6s `ease-in-out` 無限循環,`prefers-reduced-motion` 直接停住(點還在,只是不動)
- 預設 `aria-hidden` —— 一顆點沒有要唸的東西;給 `label` 才升成 `role="status"`

---

## Storage / 資料

### password-input
密碼與 vault passphrase 欄:顯示 / 隱藏切換、四段強度計(長度 + 字元類別評分)、
Caps Lock 警告、confirm 欄不一致錯誤。

### recovery-key
復原金鑰展示卡,建立 vault 或重發金鑰時**顯示一次**。

- 分段 mono(4 字一組)、預設模糊遮罩(hover / focus / 點擊才顯示)、一鍵複製(變 ✓)、
  下載 .txt、警告卡、「我已抄下」checkbox **gate 住主要按鈕**

### dropzone
拖放上傳區:虛線框 idle、dragover 高亮(accent 邊框 + accentSubtle 底)、
**選檔按鈕 fallback**(drag 永遠不是唯一入口)、上傳中列表(檔名 + 進度條 + 取消)、
超限錯誤列。

### file-row
檔案列表的一列:類型圖示 + 檔名 + 大小(mono、tabular)+ 修改時間 + hover 才浮現的
動作與選取 checkbox;另有資料夾列與加密中 / 上傳中的 busy 列。

### diff-viewer
行級 unified diff + 行內字級 highlight。給 plan 審查 takeover 與 i18n 譯文對照用。

- 行級增刪用 success / danger 的 **subtle 底**(不是飽和色),sign 與 stat 用對應 text 色
- 行內 highlight 只標變動的字(`<mark>`,比行底再深一階的 hl 色)
- mono 13px、雙欄行號(before / after),行號 faint、不可選取
- 收合未變動區段:「⋯ N 行未變動」列可展開收合
- 檔案標題列:kind 色點(modified 黃 / added 綠 / deleted 紅)+ path + `+N −N` 統計;
  added = 只有 after,deleted = 只有 before

### data-table
排序、過濾、選取、inline edit 的資料表。第一個消費者是 i18n 字典編輯。

- 欄頭點擊排序 asc → desc,`aria-sort` + accent 箭頭,一次只排一欄
- 頂部 filter 即時過濾(key 與各 locale 都比對),右側 `N / M keys` 計數(mono、`aria-live`)
- inline edit:雙擊 cell → 輸入框,Enter 確認、Esc 取消、**blur 視同確認**;
  空值顯示 faint 的 `—`
- 選取列 checkbox,header checkbox 全選 / 半選(indeterminate)
- **sticky header 用 `inset box-shadow` 當底線** —— `border-collapse` 下 border 不會
  跟著 sticky
- 空結果:置中訊息帶查詢字 + 「清除過濾」動作
- 捲動區高度 `maxHeight`(預設 20rem),`footer` 渲染在列之後、**捲動區之內** ——
  「載入更多」待在清單裡才跟得上捲動

### ghost / icon-button / segmented / spin / status-chip
平面語言的小控件,從 product 的 ui-next 原樣搬來:`Ghost` / `GhostLink` 是沒有底的文字鈕,
`IconButton` 一定帶 Tooltip(名字就是 tooltip),`Segmented` 是 `aria-pressed` 的按鈕組不是
tabs,`Spin` 是按鈕裡那顆 12px 的環,`StatusChip` 的 variant 是一個字母的狀態碼
(`r` `w` `d` `n` `a` `f` `plain`),`Pill` 是 fold 第一行的 22px mono 藥丸。

### group / page / settings-rows / table
頁面骨架的零件:`Group` + `Row` / `Item` 是一張清單卡(見下一節),`PageHead` / `SectionLabel` /
`Panel` / `Snippet` 是頁面的字與面,`SettingsRows` + `SettingsRow` 是設定頁左標籤右控件的列,
`Table` + `Tr` + `Cell` 是低階的表格零件(要排序、分頁用 `DataTable`)。字級用 `type`、
圓角用 `corner`、hover 用 `ink`。

### group(分組清單)
設定頁的分組清單,照 product 殼對過稿的 `ios/` 原樣搬來(0.9)。`Group` 上面一行 muted 的
`header`、中間一張 `layer3` 的卡(圓角 10、沒有邊框)、下面一段 muted 的 `footer`;
0.8 的有框 `surface` 卡沒有人用,直接換掉。

- 卡裡的列是 cell:`GroupCell`(字、第二行 `detail`、右邊 `value` / `control`)、
  `InputCell`(96px 的名字欄 + 沒框的 Input)、`TextCell`(會長高的 Textarea)、
  `SliderCell`(名字與讀數一行、slider 在下)。44px、左右 16px、`t3`
- 列與列之間的細線是 cell 自己的 `background-image`,寬 `100% - 16px` 靠右,
  **不是**卡的 `gap` 或 `border`:第一列沒有線,線從左邊 16px 起
- `GroupCell` 有 `onPress` 就整列是一顆 `Ghost`;沒有 `tone`、不是選項(`checked`)才畫
  chevron —— 「新增」「刪除」這種動作列與單選的選項都不是「點進去」
- 列前面的東西:`IconTile`(28px `layer4` 方塊 + 16px glyph)、`LetterTile`(同一塊寫
  第一個字母)、`ActionIcon`(沒有方塊的 18px glyph,動作列用)。glyph 收 lucide 的元件,
  這個套件不依賴 lucide
- 0.8 的 `Item` / `Row` 還在,放進新的卡裡:`Item` 自己把字級壓回 `t2`,hover 升到 `layer4`
- `Status` 是點 + 字:`dot` 給 `filled`(定了)/ `hollow`(等人確認)/ `dashed`(過期了)
  三種 7px 的點,`tone` 給點的顏色;`warning` / `danger` 連字一起染,`success` / `muted`
  字留 muted —— 平靜的狀態不搶眼。沒給 `dot` 就只有字。`warn` 是 `tone="warning"` +
  實心點的簡寫(0.8 的 API)

### status-badge
一個東西自己在跑時(AI 在操作的畫面)放在它頭上的狀態藥丸:`t2`、上下 4 左右 10、
全圓角。`live` 是 `layer4` 底 + 呼吸的 `LiveDot`、`warn` 是 22% 的 warning 底配 warning 字、
`plain` 是 `layer4` 底配 muted 字。

- 不是 `Pill`(fold 第一行 22px 的 mono 藥丸),也不是 `StatusChip`(16px 的工具狀態碼)
- `live` 的字只唸一次:`LiveDot` 帶 `role="status"` 唸狀態,看得到的字 `aria-hidden`

### list
一張「點開來看」的清單(記憶、問題):`ListHead` 一行 `t1` faint 的欄名、底下一條細線;
`ListRow` 每列是一顆 `Ghost`,40px、`t3`、hover `layer3`、圓角 `radius.md`,沒有框。
跟 `Table` 不同:`Table` 是 mono 的帳本,這裡一個 mono 都沒有。

- **欄寬是呼叫端的**:同一個 grid template 用 `sx` 給表頭與每一列。手機上怎麼排
  (藏表頭、一列折兩行、列上下各 10px)也寫在同一個 `sx` 裡 —— 元件不帶 breakpoint,
  殼的 640px 與這個套件的 45rem 才不會打架
- 列是 `minHeight: 40` 不是 `height: 40`:折兩行時自己長高
- 能排序的欄名用 `ListSort`(`t1` 的 `Ghost`),`active` 變深色、後面跟一個 ` ↓`
- `WeightDot`:問題前面 8px 的點。`light` 灰色實心(沒人回答就照建議做)、`soon` 紅色實心
  (快到期了)、`heavy` 1.5px 橘色空心環(一定要人決定)。不是 `Dot`(設定列 6px accent)

