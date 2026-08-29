# Progress / Spinner

**已實作** — `Progress.tsx`,測試 `Progress.test.tsx`;playground 的 `#progress` 區可實際操作。

進行中狀態,用「訊息是纖維、進度是織線」的品牌比喻:一條條訊息像纖維交織推進到 100%。唯一例外是 context 用量環——要求精確讀數,不玩比喻。

## 形態

> 1 / 2 / 4 / 5 是 2026-08-29 織體重做之前的舊設計,留著當否決紀錄讀;
> 現行定案看下面的「織體重做」與「prototype 同步」兩節。

1. **weave(linear determinate)** — 鬆散 → 紮實。5 條纖維全寬可見:進度前緣之後的區段收緊成規律交錯的 braid(λ26 / 相位均分,Apple 編織線材的密度),前緣之前仍是各走各的鬆散線;y 值以 smoothstep(70px 過渡帶)在鬆/緊之間混合,前緣超掃 70px 讓 100% 時全寬都達緊編。終點 = 整條固定的辮線。
2. **yarn spinner(indeterminate)** — 一根繩打架:單一 lissajous 亂結路徑,各項相位以不同速率漂移(rAF 逐幀重算 d)+ dash 段沿線行進。sm 18 / md 28 / lg 40。
3. **yarn determinate**(已實作 4 個方向 × 每方向 6 條 = 24 弧 + 1 輪廓圓 = 25 條;草案寫 3×5,實作採 prototype 的實際值)— 照真實毛線球(🧶)的捆法:4 個方向 × 每方向 6 條平行弧的束,一束繞完換方向再繞下一束;弧線是球面大圓的投影(quadratic 往外鼓,離中軸越近鼓越多),最後補上輪廓圓收尾 = 繞滿的紮實球。無預繪灰色路徑,線是逐條出現的。
4. **tidy(整理記憶)** — 織布:—、|、/、\ 四個方向的線層往復堆疊(兩輪共 8 層,每層 12.5%),鋪滿換方向,100% = 整塊布織滿。階段 label(掃描對話 → 挑出耐久事實 → 合併重複 → 落盤固定)放浮在布上的 rounded chip(surface 底 + 淺影)。每層一條蛇行 path + `pathLength=100` dashoffset 逐線顯現。
5. **ring(context 用量)** — `pathLength="100"`、dashoffset = `100 - value`、12 點起點;精確數字置中,tabular-nums。不玩比喻。

## API 草案

```tsx
<Spinner size="sm" label="載入中" />                 // yarn 毛球
<Progress value={64} aria-label="同步 thread" />      // weave;value 省略 = tidy(整理中)
<ProgressBall value={64} aria-label="下載模型" />      // yarn determinate
<ProgressRing value={42} aria-valuetext="128k context 已用 42%" />
```

## 行為 / a11y

- determinate:`role=progressbar` + `aria-valuemin/max/now` + 人話 `aria-valuetext`(**實作把 `valueText` 設為必填**);indeterminate(tidy)不設 valuenow、也不顯示任何百分比 —— 它沒有真實進度可報,只顯示階段名;spinner 用 `role=status`,label 以視覺隱藏文字放進 live region(`role=status` 不從內容取名,所以 `aria-label` 與內文兩者都要)
- 纖維透明度遞減(1 → .4,同 prototype;草案寫 .3)做深度;全部只用 `accent` 一色,不引入新色。**注意**:第 3–5 條纖維與底色對比低於 WCAG 1.4.11 的 3:1,讀數靠 `aria-valuetext` 與最前面那條線承載,見 components/README 的對比表
- reduced-motion:spinner/tidy 動畫關閉(毛球顯示靜態滿線、tidy 直接平整),determinate 保留(進度本身是資訊)
- 百分比 Geist Mono + tabular-nums;數字外必附文字說明(「3 則訊息交接中」)

## 實作建議

SVG path 由程式生成(sine / cubic 取樣),React 實作放 utils 共用;Base UI `Progress`/`Meter` 只拿語意層,視覺全自繪。

## References

- prototype.html(weave/yarn/tidy 的生成邏輯都在檔內 script)
- https://base-ui.com/react/components/progress · https://base-ui.com/react/components/meter
- CSS `d` transition:https://developer.mozilla.org/en-US/docs/Web/CSS/d

## 織體重做(2026-08-29)

定案:進度 = 一個容器裡長出一塊布。布就是 button 那塊,不另外發明織法。

- 軌道 = 凹進去的容器:1px border、pill 圓角、底色 `color.bg`,高 20px、內距 2px
- 已完成 = 一塊 button 的布:同一組 `yarn` 色票、同一組落影(`yarn.shadow`),
  pill 圓角;寬度就是百分比,`width` 走 120ms linear(進度更新頻繁,expo 會拖在後面)
- 布是「整條軌的寬度」織一次,放在會被裁切的填充盒裡 —— 填充長出來是露出同一塊布的
  更多段,不是把布拉長或重織。紗的粗細行距和 button 等粗
- 不定量:同一塊布切成 32% 的一段,`inset-inline-start` 從 −32% 走到 100%,
  1.8s linear 無限循環;底下一行 mono 說現在在做什麼(1800ms 換一段)
- 環形(ProgressRing)同一套:布在後面鋪滿整個方框,弧形只是取景框
  (和 radio 的鏡頭同一個邏輯),clip 的扇形開到 percent;軌道是 bone 的環。
  預設尺寸 60px = 布的座標尺寸,不縮放,紗才不會變粗細
- 零 rAF:determinate 靠 CSS width transition,indeterminate 靠 CSS animation。
  舊版的 loom 與辮子每幀重算,靜止頁面上也一直在跑
- reduced-motion:transition/animation 都關掉,布是靜態的

走過的彎路(別再走):
1. 12px 高的薄布 + clip 推進 —— 「一條線直接給它推過去」,看不出在織
2. 加經線 + dasharray 交錯做平織 —— 交織是看得到了,但整條變成布料樣本,
   而且和 button 的織法不是同一件事
定案的做法是最省的:布已經有了,progress 只是把它裝進容器裡長出來。

Spinner:一段布做的弧在轉(缺口約 28%、圓頭,就是一般 loading 那個 C)。
布在後面不動(每個尺寸在 module scope 各織一塊,SSR 安全、零 rAF),轉的是遮罩上那道弧 ——
和 radio 的鏡頭、tabs 的取景窗同一個「布不動、窗在動」邏輯;0.9s linear 無限轉,
reduced-motion 停在原地。舊的 lissajous 打結 `knotPath` 已刪。
否決過:八塊小布繞成一圈轉(「好爛」)—— 形狀太碎,讀起來像 loading 圖示的仿品,
不是一個東西在轉。

## prototype 同步(2026-08-29)

`prototype.html` 已重寫成定案設計(原本還是舊的辮子 weave / loom 織布 / 細環):

- 織體幾何直接內嵌 `lib/weave.ts` 的 mulberry32 + field + 層疊(種子 10075),兩邊同源;
  紗線階與落影用 CSS var 照 tokens 的 light / dark 兩組
- bar determinate:20px 軌 + 2px 內距 + 14px 布,ResizeObserver 量到內寬才織,
  填充盒裁形、width 走 120ms linear
- bar indeterminate:同一塊布切 32% 一段,−32% → 100% 走 1.8s linear,
  底下一行 mono 階段(1800ms 換一段),不顯示百分比
- ring:布鋪滿 60×60,扇形 clip 開到 percent,軌道是 bone 的環,數字置中
- spinner:sm / md / lg 各織一塊布,遮罩上 `stroke-dasharray:72 28` 的 C 弧 0.9s linear 轉
- ball:維持毛球捆法(見下)
- reduced-motion:transition / animation 全關

`ringSector()` 的滿格要小心:單段 359.99° 的弧,起訖點 `toFixed(2)` 之後會變成同一個字串,
SVG 規範會把整段弧丟掉 → clip 變空、什麼都不畫。RING = 60(outer 29)剛好差 0.01 不會撞,
但換尺寸就會踩到 —— 要改尺寸的話滿格改走兩段半弧。

ProgressBall 維持毛球的線語言(2026-08-29 設計者拍板「保留」),是刻意的例外不是漏掉:
ball 和 ring 都是圓的,改成織體取景框會和 ring 變成同一張圖;而 ball 承載的
「一個東西被一圈一圈繞滿」(下載、抓模型)本來就不是「一塊布長出來」能表達的。
和 ring 的「精確讀數不玩比喻」是同一種例外 —— 織體準則挑的是等待 / 過渡 / 儀式
+ 主要互動面,不是所有東西都要是布。
