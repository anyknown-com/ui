# 織物設計語言 Guide(Woven Texture)

給後續 session 的完整規格:如何把「按鈕是線織出來的」這套語言適配到其他元件,
**不需要重新 tune**。所有參數都是與設計者多輪迭代收斂的結果,照抄即可;
要偏離前先讀「否決紀錄」,那些路已經走過而且被打回票。

參考實作:`src/components/button/prototype.html`(唯一真相,瀏覽器直接開可操作)。
品牌上位準則見 `ROADMAP.md` 的「Texture 設計準則」。

---

## 1. 哲學(為什麼是這樣)

- 品牌語言:**訊息是纖維、thread 是線**。元件不是「畫了線條裝飾的方塊」,
  而是**線織成的實體** — 沒有 background,實心由紗堆疊而成。
- 對 MUI ripple 的回答:我們的漣漪不是水波,是**布回彈時滾過的光**。
- 兩條鐵律:
  1. **織法恆定**:幾何用固定種子,同尺寸元件每次渲染完全相同。體驗的變化
     只來自使用者怎麼摸它,不來自隨機。
  2. **動態只回應觸點**:沒有任何背景自主運動(呼吸、流動、閃爍都不行)。
     動的永遠是「使用者摸到的地方」。

## 2. 否決紀錄(不要再走的路)

| 版本 | 做法 | 被打回的原因(設計者原話) |
| --- | --- | --- |
| v1 | 稀疏水平線 + 大位移撥動 | 「像吉他弦,不是緊緻衣物纖維」 |
| v2 | canvas 隨機短絨毛 | 「像患了皮膚炎的皮質」— 散亂點狀 = 不精緻 |
| v3 | 等距正弦三層織紋 | 「像數學的座標軸,死板無聊沒生命力」 |
| v4 | 粗紗(1.5–3px)隨機行距堆疊 | 「不夠細緻,而且沒完全分佈」(有洞) |
| v5 中頻波 + 每紗高頻小顫 | 波浪感 | 「太波浪,我要順滑的曲線確保質感」 |
| v6 全域相位緩流(布自己在動) | 隨機布 + 背景動態 | 「曲線要固定;動態的不同應來自觸發點與滑過的線」 |
| v7 press 整片繃直 | 均勻拉平 | 「下限的點應該是用戶點擊的點」(要凹陷不是繃直) |
| 初版彈簧 | k=.16 | 「太快了,動態要更順」 |
| 拖出放開照播觸發動效 | — | 「理論上不觸發,視覺看起來卻觸發了」(語意錯) |

歸納的品味法則:
- **精緻 = 有序 + 細**:連續、平行、順滑的細線;隨機散點 = 廉價。
- **生命力 = 長波的不規則**,不是高頻抖動。波長比元件還寬,每條線至多緩彎一兩次。
- **覆蓋要數學保證**,不能靠機率 — 縫隙露底看起來像 bug。
- **快 = 廉價,慢而綿 = 布**。觸發即時、動態緩成形。

## 3. 幾何配方(照抄)

### 3.1 確定性

```js
function mulberry32(seed) {
	let a = seed >>> 0
	return () => {
		a |= 0; a = (a + 0x6D2B79F5) | 0
		let t = Math.imul(a ^ (a >>> 15), 1 | a)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}
// build() 開頭:const rng = mulberry32(10075); 所有 rand 走它。
// 種子固定用 **10075**(設計者從隨機分佈中選定的定稿織法,不要換)。
// prototype.html 有「重織」工具可試其他分佈(#seed=N),但正式實作鎖 10075。
```

### 3.2 共享波場(所有紗的形狀來源)

```js
// w = 元件寬。兩支長波,波長 ≥ 元件寬,相位隨 y 緩慢滑移(起伏斜掃過布面)
const W1 = rand(Math.max(120, w * 0.9), w * 1.8)
const A1 = rand(1.0, 1.8), P1 = rand(0, 6.28), K1 = rand(0.05, 0.11)
const W2 = rand(w * 1.6, w * 3)
const A2 = rand(0.5, 0.9), P2 = rand(0, 6.28), K2 = rand(0.03, 0.07)
const field = (x, y) =>
	A1 * Math.sin((x / W1) * 6.283 + P1 + y * K1) +
	A2 * Math.sin((x / W2) * 6.283 + P2 + y * K2)
```

**禁止**:第三支中/短波、每條紗自己的抖動、任何波長 < 元件寬一半的成分。
取樣步長 4px、polyline、`stroke-linecap:round`,`toFixed(2)`。
**取樣範圍必須超出左右邊界**:`for (x = -4; x <= w + 4; x += 4)` — 停在 0..w 會因
寬度非 4 的倍數在右緣缺一截;超畫再由圓角 clip 裁形,左右圓角都由線條呈現。

### 3.3 層疊(下到上;全部 clip 進圓角矩形,線不出元件)

| 層 | 行距 | 粗細 | 顏色 | 動態 |
| --- | --- | --- | --- | --- |
| 1 底紗 | 1.5px | 3.4px | `--y-un`(最深) | **永遠靜態** |
| 2 縫隙陰影 | 2.4px | 0.5–0.8px | `--y-sh`,op .5 | **永遠靜態** |
| 3 面紗 | 1.2px(±0.15 抖動) | 0.6–1.4px | `--y0..4` 依深度+隨機 | 動態 |
| 4 挑面亮紗 | 4–5 根,上半部 | 0.4–0.7px | `--y-hi`,op .45 | 動態 |

- 底紗覆蓋是**數學保證**:寬 3.4 − 距 1.5 − 相鄰紗偏差(同場,≈0)> 0 恆成立;
  範圍鋪到 y ∈ [−0.8, h+2.6]。縫隙透出的是底紗深色 = 布的深度,不是漏底。
- 面紗選色:`bucket = clamp(round(4.2 − (y/h)*3 + rand(−0.9, 0.9)), 0, 4)`
  (上淺下深,光從上面來)。
- ghost 變體:無底紗無縫隙紗(刻意透底),面紗行距 2.1px、粗 0.6–1.0px。
- 整個 SVG 掛 CSS `filter: drop-shadow(...)`(見色票),實心感落地。
- 圓角 = clipPath rect rx 8(對應 radius.md .5rem);SVG `overflow:hidden`。

### 3.4 色票(--y-un / --y-sh / --y0..4 / --y-hi)

從 Ledger token 衍生的紗線階,light / dark 各一組(prototype.html 有完整值可抄):

- **primary**(accent 染透):light 以 #23705A 為 --y2,向下到 --y-un #11362C,
  向上到 --y4 #2E8266,--y-hi #5CAA89;dark 以 #4FA184 為 --y2(同構)。
- **secondary**(淺色布):light --y2 #EDEAE0 附近的米白階,--y-un #CBC5B4;
  dark 是深炭布。文字用 `--text`。
- **ghost**(疏織):border 色系的細紗,無底。
- 新元件配色原則:取該元件的主色當 --y2,L* 往下 −18/−12/−6、往上 +6/+12 生成
  --y0..--y4;--y-un 再深(接近黑的該色);--y-hi 是提亮 +30 的絲光色。
  對比:label 文字與 --y2 的對比必須 ≥ 4.5:1(等同原本實心底)。

## 4. 動態配方(全部觸點驅動)

每幀重算的只有面紗+亮紗的 `d`;base 波場值預存(`base[i] = field(x_i, y0)`),
每幀只疊加觸點項。**只在有東西真的在動時重算**(spring/張力低於 1e-3 就停 rAF)。

### 4.1 一條紗的合成式

```js
// gx, gy = 柔化後的指尖位置(lerp 0.25 追 pointer)
// pressX, pressY = 按下瞬間的 (gx, gy),按住期間不變
const sT = 2 * (w * 0.35) ** 2   // 繃緊 x 包絡
const sD = 2 * (w * 0.22) ** 2   // 凹陷 x 包絡
const sX = 2 * (w * 0.20) ** 2   // 帶動 x 包絡
const ten = Math.max(-0.4, tension)
const dy = pressY - yarn.y
const funnel = ten * dy * 0.5 * Math.exp(-(dy ** 2) / 338)   // σy ≈ 13px
y(x) = yarn.y
     + yarn.base[i] * (1 - 0.5 * ten * Math.exp(-((x - pressX) ** 2) / sT))  // 局部繃緊
     + funnel      * Math.exp(-((x - pressX) ** 2) / sD)                     // 凹陷(窩)
     + yarn.disp   * Math.exp(-((x - gx) ** 2) / sX)                         // hover 帶動
```

### 4.2 彈簧常數(全部收斂過,別改)

| 東西 | 式子 | k | 阻尼 | 備註 |
| --- | --- | --- | --- | --- |
| hover 帶動(每紗) | target = clamp(vy×0.28, ±1.8) × exp(−(yarn.y−gy)²/200) | 0.13 | 0.24 | vy 消費後歸零 |
| 張力 tension | target = pressed && pointer在內 ? 1 : 0 | 0.07 | 0.16 | 緩成形緩回彈 |
| release 過衝 | tenV −= 0.035 | — | — | 只在有效觸發時 |
| 指尖柔化 gx/gy | lerp | 0.25 | — | |
| 窩拖動 pressX/Y | 按住時 lerp 追 gx/gy | 0.18 | — | 比游標慢半拍=壓著布拖的阻尼感 |
| 光澤帶 bx | lerp | 0.16 | — | 延遲=撫摸感 |
| 光澤帶 opacity | lerp | 0.15 | — | |

### 4.3 光澤帶(緞面反光)

- 形狀:**−14° 斜長條**(rect 高 3h、寬 0.6w,linearGradient 透明→白 .85→透明),
  當 mask 用;顯形層 = 抽 1/2 面紗重繪 `--y-hi`(0.9px,stroke-opacity .6)。
- hover:帶 lerp 追指尖 x;亮度 = min(0.75, 0.3 + speed/7),按住時壓到 0.15。
- release 掃光:從 pressX 沿最後移動方向掃 0.9w,**640ms**,ease-out cubic
  (`1−(1−t)³`),亮度 0.9×(1−t) 同步淡出。

### 4.4 互動語意(必須完全一致)

- **觸發即時、動態緩成形**:pointerdown 當幀就開始,但窩約半秒陷到位。
- **取消 = 安靜**:按住拖出元件 → 張力目標歸 0(窩先鬆開,對齊原生 `:active`);
  拖回來(還按著)→ 窩回來;**在元件外放開 → 不播過衝、不播掃光**,只歸位。
  過衝+掃光是「確認觸發」的專屬語言。
- 鍵盤:Space/Enter = 按在元件中心;keyup 觸發 release 後把 pointer 清 null;
  blur 也清(否則 rAF 不會停)。
- `prefers-reduced-motion`:rAF 完全不啟動,織紋靜態呈現(靜態本身就是完成的視覺)。

### 4.5 a11y / 工程

- 織線層:`<svg aria-hidden="true">` + `pointer-events:none`,純裝飾;
  語意元素(button/div)本身保持原生行為與 focus ring(outline 2px focusRing,offset 3)。
- 幾何 build 一次 + ResizeObserver(尺寸沒變就 early return);
  進 React 實作時:首次 hover 才建動態(SSR 安全,server 上零副作用),
  列表大量實例考慮共享一個 ticker。
- 每幀成本上限:~55 條 × 36 點的 d 重算;更大的元件要降面紗密度或分區重算。

## 5. 適配到其他元件

### 哪些元件該用(對齊 ROADMAP texture 準則)

- **可用織體**(等待/過渡/儀式 + 主要互動面):button(primary/CTA)、
  interaction-card 的確認鈕、dialog 的 danger confirm、handoff-receipt 卡面、
  progress 軌道、dropzone 面(蟻行縫線可與織體並存)。
- **維持安靜,不要織**:輸入類表單控件、data-table、diff-viewer、recovery-key、
  scrollbar、skeleton(準則明文排除)。
- secondary/ghost 按鈕:織但無光澤帶亮度上限調低(0.5),或僅 hover 光不做窩。

### 適配步驟(給新 session 的 checklist)

1. 讀本文件 + 開 `button/prototype.html` 感受基準手感。
2. 抄 mulberry32 + field + 層疊參數,只換:元件尺寸、色票(§3.4 原則衍生)、
   圓角(跟該元件的 radius token)。
3. 動態依元件語意取捨,但**參數不動**:
   - 可點擊 → 全套(帶動 + 窩 + 掃光)
   - 僅展示的面(卡片) → 只有 hover 帶動 + 光澤帶,無窩
   - 進度/等待 → 光澤帶可作為進度的「前緣」,仍不得有背景自主動態
4. 驗收清單:
   - [ ] 重新整理三次,織紋完全相同
   - [ ] 靜止時(無 pointer)rAF 完全停止
   - [ ] 縫隙透出的是底紗色,任何縮放下不露 page 背景
   - [ ] 曲線順滑(無 <w/2 波長成分、無折角)
   - [ ] 按住拖出 → 窩鬆開;外面放開 → 無過衝無掃光
   - [ ] reduced-motion 全靜態;鍵盤可觸發;label 對比 ≥ 4.5:1

---

## 6. 落地狀態(2026-08-29,給接手 session)

規則:React 禁用 useEffect(ref callback + cleanup 取代);動畫不回彈
(滑動類定案 240ms cubic-bezier(.16,1,.3,1),寬度變化不得前衝、任何邊不得倒退)。

已落地(.tsx,check/test 全綠,playground 實機驗過):

- lib/weave.ts — 靜態幾何 builder(小控件 module scope 預織)+ buildThread 縫線
- lib/silk.ts — 動態引擎(press 全套 / hover 僅展示子集),幾何與 weave.ts 同源
- tokens.stylex.ts — yarn / yarnSecondary / yarnGhost / yarnDanger / yarnSubtle;
  每組多一個 shadow = §3.3 的落影(掛在元件的 CSS filter 上,ghost 為 none)
- Checkbox / Switch / Radio — 定案設計照 prototype
- Button — 四 variant 織體 + press 全套 + 落影;playground `#button` 有完整展示
- Tabs pills — buildWeave 織滿 tablist;Base UI 的 Indicator 只當 `--active-tab-*`
  的載體(絕對定位鋪滿整條 list、自己不動),取景窗是 clipPath 裡的 rect,
  x/y/width/height 直接吃那些變數,x 與 width 同一條 240ms expo。
  窗動、布不動:切 tab 前後紗的 d 逐字相同
- HandoffReceipt — 卡面 SilkBody hover 模式 + yarnSecondary + fixedHeight 480;
  展開 0fr→1fr(240ms expo)+ 內容 opacity 200ms;收合狀態改用 inert 離開 a11y tree
  (不能再用 hidden,否則沒得動畫);html{scrollbar-gutter:stable} 已進 tokens.css
- InteractionCard — 三顆回覆鈕與送出/照建議改用共用 Button
  (允許一次 primary、總是允許 secondary、拒絕 ghost:拒絕不給 danger 織體,
  一整塊紅布會蓋過 primary 的份量);options 改用 RadioGroup variant=card 與 Checkbox
- Dialog 的 ConfirmDialog 免費繼承 Button(Base UI 的 render prop 會把 children 併進來)

實機驗收(headless Chrome 走 §5 清單):

- 重整三次,button / pills / receipt / checkbox 的織法 hash 完全相同
- 沒碰過的頁面 SilkBody 一次 rAF 都沒排;hover 後回到靜止也回到 0,d 不再變
- 按住 → 光澤帶壓到 0.15、紗收成窩;放開 → 0.72 掃光
- 按住拖出元件外放開 → 光澤帶維持 0.000,不播過衝也不播掃光
- reduced-motion:rAF 全程 0、織紋不動,pills / receipt / underline 的 transition 都是 0s

踩到的坑(接手前先讀):

- StyleX 0.19 會靜默丟掉 `all: unset`、`border: 0`、`background: none` 這類簡寫 —
  編不出任何 CSS,原生 button 的 buttonface 底色與 outset 邊框、fieldset 的 groove
  邊框就留在畫面上,直接蓋掉底下的布(chip 的 × 是最明顯的災情)。
  已全部清掉:`lib/styled.ts` 出了一個 `reset.control`(appearance / margin / padding /
  borderWidth / backgroundColor / font / color / textAlign 逐項重設),12 個元件的
  19 處 `all: "unset"` 都改成把它放在 `stylex.props` 的第一個參數。新元件照做。
- `box-sizing` 同理:`<input>`/`<textarea>` 是 content-box,`minHeight: 2.25rem` 會變成
  「內容」36px 再加 padding+border(md 長到 54px)。元件自己要寫 `boxSizing: border-box`,
  不能靠 app 端有沒有 reset。
- 這一輪定的(2026-08-29):
  - interaction-card 的「拒絕」= 新的 `dangerGhost` variant:織體層級走 ghost 疏織
    (不與 primary 打架),標籤色走 `color.danger` —— 就是原本「白底紅字」的織體版。
    依據是同一個檔案自己的 token 語彙:收據列 rejected 的 ✓ 早就是 `color.danger`
    (`InteractionCard.tsx:157`),danger 在這個元件裡本來就是「拒絕」的顏色。
    順帶把這顆的對比從 ghost textMuted 的 3.67:1 拉到 4.31:1(布上)/ 5.44:1(頁面底)。
  - ProgressBall 維持毛球的線語言,是刻意的例外(理由與並排比較見 progress/NOTES.md)。
  - progress/prototype.html 已重寫成定案設計,與 Progress.tsx 同源。

- 一處對比沒到 §3.4 的 4.5:1,是照 prototype 搬的結果,palette 沒動,等設計者定奪:
  receipt 收合列的 textMuted 落在淺色布上 4.03–4.36:1(原本在 surface 上是 4.58:1);
  最小的修法是把 textMuted 調深一階(light #777165 → #67614F、dark #A59B8C → #B0A697),
  布上 4.68–5.56:1 全部過,頁面底色上也從 4.63 變 5.90 —— 但那是全域 palette 動刀,
  34 個元件的 muted 文字都會跟著變重,所以沒有自己動。
  dark 的 pills 選取 4.18:1 是既有值(布的 --y2 就是 accent-subtle,和先前的實心底同色),
  不是織體造成的;ghost 按鈕原本的 3.67:1 已由上面的 dangerGhost 一併處理。
