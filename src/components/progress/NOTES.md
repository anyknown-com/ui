# Progress / Spinner

**已實作** — `Progress.tsx`,測試 `Progress.test.tsx`;playground 的 `#progress` 區可實際操作。

進行中狀態。定案:**進度 = 一個容器裡長出一塊布**。布就是 button 那塊(TEXTURE-GUIDE
§3、種子 10075、同一組 `yarn` 色票與落影),不另外發明織法。

兩個刻意的例外:context 用量環要精確讀數,不玩比喻;ProgressBall 留在毛線球的線語言。

## API

```tsx
<Spinner size="sm" label="載入中" />
<Progress value={64} valueText="3 則訊息交接中 · 64%" aria-label="同步 thread" />  // value 省略 = 不定量
<ProgressBall value={64} valueText="下載模型 64%" aria-label="下載模型" />
<ProgressRing value={42} valueText="128k context 已用 42%" aria-label="context 用量" />
```

## 形態

1. **bar(determinate)** — 軌是凹進去的容器(1px border、pill 圓角、底色 `color.bg`,
   高 20px、內距 2px)。布是**整條軌的寬度織一次**,放在會被裁切的填充盒裡 ——
   填充長出來是露出同一塊布的更多段,不是把布拉長或重織。紗的粗細行距和 button 等粗。
   寬度走 120ms linear(進度更新頻繁,expo 會拖在後面)
2. **bar(indeterminate)** — 同一塊布切成 32% 的一段,`inset-inline-start` 從 −32%
   走到 100%,1.8s linear 無限循環;底下一行 mono 說現在在做什麼(1800ms 換一段)
3. **ring(context 用量)** — 布在後面鋪滿整個方框,弧形只是取景框(和 radio 的鏡頭
   同一個邏輯),clip 的扇形開到 percent;軌道是 bone 的環。預設 60px = 布的座標尺寸,
   **不縮放**,紗才不會變粗細。數字置中、tabular-nums
4. **spinner(indeterminate)** — 一段布做的 C 弧在轉(缺口約 28%、圓頭)。布在後面
   不動(每個尺寸在 module scope 各織一塊,SSR 安全、零 rAF),轉的是遮罩上那道弧 ——
   和 radio 的鏡頭、tabs 的取景窗同一個「布不動、窗在動」邏輯。0.9s linear。
   sm 18 / md 28 / lg 40
5. **ball(determinate)** — 毛線球的捆法:4 個方向 × 每方向 6 條平行弧的束,一束繞完
   換方向再繞下一束,最後補輪廓圓收尾 = 繞滿的紮實球。弧線是球面大圓的投影
   (quadratic 往外鼓,離中軸越近鼓越多)。線是逐條出現的,無預繪灰色路徑

## 行為與 a11y

- **零 rAF**:determinate 靠 CSS width transition,indeterminate 靠 CSS animation
- determinate:`role=progressbar` + `aria-valuemin/max/now` + 人話 `aria-valuetext`
  (實作把 `valueText` 設為**必填**)
- indeterminate:**不設 `aria-valuenow`、也不顯示任何百分比** —— 它沒有真實進度可報,
  只顯示階段名
- spinner 用 `role=status`;`role=status` 不從內容取名,所以 `aria-label` 與視覺隱藏的
  內文兩者都要
- `prefers-reduced-motion`:transition / animation 都關掉,布是靜態的
- 百分比用 Geist Mono + tabular-nums;數字外必附文字說明(「3 則訊息交接中」)

## 實作

`ringSector()` 的滿格要小心:單段 359.99° 的弧,起訖點 `toFixed(2)` 之後會變成同一個
字串,SVG 規範會把整段弧丟掉 → clip 變空、什麼都不畫。RING = 60(outer 29)剛好差
0.01 不會撞,但**換尺寸就會踩到** —— 要改尺寸的話滿格改走兩段半弧。

`prototype.html` 與 `Progress.tsx` 同源:prototype 內嵌 `lib/weave.ts` 的
mulberry32 + field + 層疊,紗線階與落影用 CSS var 照 tokens 的 light / dark 兩組。

## 走過的彎路

進度條:

1. 鬆散纖維在前緣後方收緊成 braided cable ——「一條線直接給它推過去」,看不出在織
2. 12px 高的薄布 + clip 推進 —— 一樣看不出在織
3. 加經線 + dasharray 交錯做平織 —— 交織是看得到了,但整條變成布料樣本,
   而且和 button 的織法不是同一件事

定案的做法是最省的:布已經有了,progress 只是把它裝進容器裡長出來。

Spinner:

- lissajous 亂結(一根繩自己打架):每幀重算 `d`,靜止頁面上也一直在跑
- 八塊小布繞成一圈轉 ——「好爛」,形狀太碎,讀起來像 loading 圖示的仿品,
  不是一個東西在轉

不定量狀態曾經是「織布」:—、|、/、\ 四個方向的線層往復堆疊成一整塊布。表現力夠,
但每幀重算,而且它在假裝有進度(8 層 = 8 個 12.5%),語意是錯的。

ProgressBall 維持線語言是**刻意的例外**,不是漏掉:ball 和 ring 都是圓的,改成織體
取景框會和 ring 變成同一張圖;而 ball 承載的「一個東西被一圈一圈繞滿」(下載、抓模型)
本來就不是「一塊布長出來」能表達的。織體準則挑的是等待 / 過渡 / 儀式 + 主要互動面,
不是所有東西都要是布。

## References

- prototype.html — 唯一真相,瀏覽器直接開
- https://base-ui.com/react/components/progress · https://base-ui.com/react/components/meter
