# 元件決定紀錄

36 個元件的**定案理由、走過的彎路、踩過的坑** —— 只留程式碼與型別裡看不出來的東西。
API 看 `dist/index.d.ts`,實際長相看 [playground](https://ui.anyknown.com)。

織體(線織成的實心)的完整規格在 [TEXTURE-GUIDE.md](./TEXTURE-GUIDE.md);
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

- 勾選底是一塊布(織體,seed 10075、primary 色票),依 14.8px 顯示尺寸換算比例,紗的
  粗細行距與 button 等粗;勾用 `accentText` 縫上去,織入動畫 = clipPath width 推進
- 走過的彎路:勾選底曾是 5×5 crosshatch pattern ——「有紋路的方塊」不是布。
  勾曾用 `stroke-dasharray: 24` 但路徑長約 28,unchecked 時會漏出尾巴(改縫線後自然消失)

### radio
原生 `<input type="radio">` + `fieldset/legend`。`variant="card"` 選中時亮整張。

- 選中的內圈是**鏡頭**:布在後面延伸,圓形只是取景框 —— 孔徑從 0 打開,**布本身完全
  不動**。孔徑只開到 r 6.8(viewBox 24),維持 radio 的標準構成(外環 + 空隙 + 內圓)
- 走過的彎路:線繞成小線圈走了兩版都被打回,問題都是「讓線侷限在圓裡自己繞成一團」——
  舊 coil(2.3 圈)「是圈圈,不是線在圈圈區域」;密繞螺旋「還是像蚊香」。
  改成「布在後面、圓形只是取景框」才成立,這個語言後來也用在 tabs pills 與 progress

### switch
即時生效的開關(相對於 Checkbox 的「提交後生效」)。原生 checkbox + `role="switch"`。

- thumb 滑動 240ms `cubic-bezier(.32,.85,.45,1)`,收尾乾淨**不過衝**
- 開啟的軌道是布,織入動畫 = clipPath width 推進;關閉時是 `borderStrong` 的空槽
- 選取控件保持安靜:靜態織紋、無 rAF、不做窩與掃光(那是 button 的語言)
- 走過的彎路:thumb 曾用 `cubic-bezier(.34,1.56,.64,1)` 的雙彈跳 —— 過衝一律不要
- 設定列的慣用排版:文字在左、開關在右

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
按鈕沒有 background —— 實心是線織出來的。規格見 TEXTURE-GUIDE。

| variant | 布 | 標籤色 | 用在 |
| --- | --- | --- | --- |
| `primary` | `yarn` | `accentText` | 主要動作 |
| `secondary` | `yarnSecondary` | `text` | 次要動作 |
| `ghost` | `yarnGhost`(疏織、無底紗、不落影) | `textMuted` | 安靜的第三選項 |
| `danger` | `yarnDanger` | `accentText` | 不可逆的破壞性動作 |
| `dangerGhost` | `yarnGhost` | `danger` | 「白底紅字」:要看得出語意但不搶份量 |

- **觸發即時、動態緩成形**:pointerdown 當幀就開始,但窩約半秒才陷到位
- **取消 = 安靜**:按住拖出元件 → 張力歸零;拖回來 → 窩回來;**在元件外放開 →
  不播過衝、不播掃光**。過衝 + 掃光是「確認觸發」的專屬語言
- children 要包進 `position: relative` 的 span 才會蓋在布上面
- 完整否決紀錄(七個版本、設計者原話)在 TEXTURE-GUIDE §2

### dialog
模態對話框:半透明 blur backdrop、scale+fade 進場、Esc / backdrop 關閉。
danger confirm 變體給不可復原的動作(刪除記憶、清空 thread)。

- ConfirmDialog 免費繼承 Button —— Base UI 的 render prop 會把 children 併進來
- 預設寬度 `min(24rem, ...)` 只是常見尺寸,不是規定。`DialogContent` 收 `sx`,寬高由使用端
  蓋掉(三欄選擇器那種);不給 `size` prop —— 尺寸的組合是無限的,`sx` 才是那個出口

### toast
非阻斷通知:右下角疊放、slide+fade 進場、5 秒自動消失(hover 暫停),可帶一個動作
按鈕(「已刪除 · 復原」)。danger / success 用色點區分。

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
- pills:布織滿整條 tablist 只建一次,選取高亮是圓角取景窗滑動 —— **窗動、布不動**
- indicator 位置不自己量:Base UI 的 `Tabs.Indicator` 本來就把 `--active-tab-*` 寫成
  inline style,拿它當**變數載體**(絕對定位鋪滿、自己不動、`pointer-events: none`),
  clipPath 的 rect 用 CSS 幾何屬性直接吃那些變數
- 走過的彎路:底線的「鬆緊彈性」(雙彈簧 + 拉伸下垂)——「太誇張了」;
  x 與 width 各拆一條曲線的組合會衝過再收回,違反「任何邊不得倒退」

### badge / chip
badge 是唯讀語意標籤,chip 是可互動(可移除)的篩選單位,同一家族。

- chip 的 `×`:負 block margin 讓圓鈕不撐高 chip,`::after` 補到 24px 命中區
  (WCAG 2.2)而不影響版面 —— 這一招可以套到其他小命中區

### kbd
快捷鍵標示:surface 底 + border + 1px 下緣陰影做出按鍵感,Geist Mono,
單鍵 / 組合 / 序列三種排法。

### skeleton
載入骨架:占位形狀 + shimmer,形狀要對齊實際內容的排版(thread 骨架就長得像 thread),
避免載入完成時跳版。**刻意不用織體** —— 載入骨架要低調不搶戲。

### progress
進度 = 一個容器裡長出一塊布。布就是 button 那塊,不另外發明織法。

1. **bar(determinate)** — 軌是凹進去的容器(高 20px、內距 2px)。布是**整條軌的寬度
   織一次**,放在會被裁切的填充盒裡 —— 長出來是露出同一塊布的更多段,不是把布拉長或
   重織。寬度走 120ms linear(進度更新頻繁,expo 會拖在後面)
2. **bar(indeterminate)** — 同一塊布切 32% 一段,−32% → 100% 走 1.8s linear;
   底下一行 mono 說現在在做什麼
3. **ring(context 用量)** — 布在後面鋪滿方框,弧形只是取景框;預設 60px = 布的座標
   尺寸,**不縮放**,紗才不會變粗細。精確讀數,不玩比喻
4. **spinner** — 一段布做的 C 弧在轉(缺口 28%、圓頭)。布不動,轉的是遮罩上那道弧
5. **ball** — 毛線球的捆法:4 方向 × 每方向 6 條大圓弧,一束繞完換方向,補輪廓圓收尾

- **零 rAF**:determinate 靠 CSS width transition,indeterminate 靠 CSS animation
- indeterminate **不設 `aria-valuenow`、不顯示百分比** —— 沒有真實進度可報
- spinner 用 `role=status`;它不從內容取名,所以 `aria-label` 與視覺隱藏的內文都要
- `ringSector()` 的滿格陷阱:單段 359.99° 的弧,起訖點 `toFixed(2)` 後會變成同一個
  字串,SVG 規範會把整段弧丟掉 → clip 變空、什麼都不畫。RING=60 剛好差 0.01 不會撞,
  **換尺寸就會踩到**
- 走過的彎路:辮子(braided cable)、12px 薄布 + clip 推進 —— 都「看不出在織」;
  加經線做平織 —— 變成布料樣本,和 button 不是同一件事。lissajous 亂結與八塊小布繞圈
  ——「好爛」,形狀太碎。不定量曾是「織布」,但每幀重算而且在假裝有進度(8 層 = 8 個
  12.5%),語意是錯的
- **ProgressBall 留在線語言是刻意的例外**:ball 和 ring 都是圓的,改成織體取景框會和
  ring 變成同一張圖;而「一個東西被一圈一圈繞滿」本來就不是「一塊布長出來」能表達的

### empty-state
空狀態 = 行動邀請:icon + 一句說明 + 主要動作。文案永遠說「下一步做什麼」,
不只陳述「沒有東西」。

### scrollbar
不是元件,是一份全域 CSS(`@anyknown/ui/scrollbar.css`)。StyleX 做不了
`::-webkit-scrollbar` 偽元素。

- thumb 是 `borderStrong` 圓角線,外圍 3px 透明邊距(`background-clip: padding-box`)
  讓它浮在內容旁;hover 轉 `textFaint`。寬 10px,實際可見約 4px
- 容器建議加 `scrollbar-gutter: stable` 防止內容因捲軸出現而跳動
- **刻意不用織體** —— 全域基礎設施要隱形

---

## Desktop AI-native

### message
過去區的訊息節奏:user 右對齊氣泡、assistant 全寬純文字。turn 24px / part 8px,
字級只走三個 token。

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

### interaction-card
agent 在等你的兩種卡:Permission(權限請求)與 Decision(要你決定)。
pending 是可操作物,回覆後收成過去區的不可改收據。

- Permission:warning 邊框、mono 顯示指令 / 對象、允許一次(⏎)/ 總是允許(⌘⏎)/
  拒絕(Esc)、底部 policy 說明列(解釋為何問、規則活過 rotation)
- Decision:同一種卡分 blocking(邊框 accent、「等你才能繼續」)與 non-blocking
  (安靜邊框、「等你 · deadlineAt 倒數」);內容走 block DSL(markdown / options /
  text / table / image / diff);必填未選時送出 disabled,有 recommended 時多一顆「照建議」
- 三顆回覆鈕:允許一次 `primary`、總是允許 `secondary`、拒絕 `dangerGhost`。
  拒絕不給整塊 danger 織體(一整塊紅布會蓋過 primary),但語意要看得出來 ——
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
  核對:記憶落盤幾筆 / 摘要已交給下一輪(讀後銷毀)/ 本輪 Ledger 收據數
- **是收據不是控制**:不可改、無任何動作按鈕
- 卡面是一塊 secondary 淺色布,動態只取「僅展示面」子集(hover 帶動 + 光澤帶,
  亮度上限 0.5,**無窩無掃光**)
- **布只織一次**:固定高度 480px 的長布,卡片 `overflow` 裁形。展開只是露出更多,
  高度變化零重織
- 收合狀態用 `inert` 不能用 `hidden` —— 一樣離開 a11y tree 與 tab 序,但留在版面上
  讓 0fr→1fr 跑得動
- 走過的彎路:展開後重織一塊新的布會不一致而且會閃;`display: none` 硬切 + 單向 fade
  被打回「死板」;展開讓頁面長高 → scrollbar 出現 → 置中內容左移(修法是
  `html { scrollbar-gutter: stable }`,已進 `tokens.css`)

### composer
釘在現在線上的 prompt bar:**說話發生在現在** —— 送出後上方多一條收據、下方未來區
當場重排。永遠可用,不被 pending 卡阻塞。

- 多行 textarea 自動長高(max-height 後內捲);⏎ 送出、⇧⏎ 換行
- 左側 @ 來源鈕與 / 指令鈕;右側 model picker、麥克風、送出(空值 disabled)
- 打 `@` 時浮層列出來源建議(檔案 / ledger 收據 / 記憶,各帶種類標),點選補全
- focus 時整條 border 轉 accent(`:focus-within`)

### voice-indicator
一眼看出 agent 現在是在聽你、在想、還是在說 —— 對應 STT → runtime LLM → TTS 的三段。

- 四態:`idle`(靜態灰 bar)/ `listening`(5 條音量 bar 起伏)/ `thinking`(單點脈動)
  / `speaking`(波形依序起伏)
- 視覺化區**固定寬高**,換態不跳版;文案標明可插話(「說話中…插話會打斷」= barge-in)
- reduced-motion:全部動畫關閉,bar 停在中段靜態高度,改顯示 mono uppercase 靜態文字標

---

## Storage / 資料

### password-input
密碼與 vault passphrase 欄:顯示 / 隱藏切換、四段強度計(長度 + 字元類別評分)、
Caps Lock 警告、confirm 欄不一致錯誤。

### recovery-key
復原金鑰展示卡,建立 vault 或重發金鑰時**顯示一次**。

- 分段 mono(4 字一組)、預設模糊遮罩(hover / focus / 點擊才顯示)、一鍵複製(變 ✓)、
  下載 .txt、警告卡、「我已抄下」checkbox **gate 住主要按鈕**
- **刻意不用織體** —— 金鑰要安靜可判讀

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
- **刻意不用織體** —— 精準區不加花

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
- **刻意不用織體** —— 數據要安靜可判讀
