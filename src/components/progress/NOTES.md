# Progress / Spinner

進行中狀態,用「訊息是纖維、進度是織線」的品牌比喻:一條條訊息像纖維交織推進到 100%。唯一例外是 context 用量環——要求精確讀數,不玩比喻。

## 形態

1. **weave(linear determinate)** — 鬆散 → 紮實。5 條纖維全寬可見:進度前緣之後的區段收緊成規律交錯的 braid(λ26 / 相位均分,Apple 編織線材的密度),前緣之前仍是各走各的鬆散線;y 值以 smoothstep(70px 過渡帶)在鬆/緊之間混合,前緣超掃 70px 讓 100% 時全寬都達緊編。終點 = 整條固定的辮線。
2. **yarn spinner(indeterminate)** — 一根繩打架:單一 lissajous 亂結路徑,各項相位以不同速率漂移(rAF 逐幀重算 d)+ dash 段沿線行進。sm 18 / md 28 / lg 40。
3. **yarn determinate** — 照真實毛線球(🧶)的捆法:3 個方向 × 每方向 5 條平行弧的束,一束繞完換方向再繞下一束;弧線是球面大圓的投影(quadratic 往外鼓,離中軸越近鼓越多),最後補上輪廓圓收尾 = 繞滿的紮實球。無預繪灰色路徑,線是逐條出現的。
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

- determinate:`role=progressbar` + `aria-valuemin/max/now` + 人話 `aria-valuetext`;indeterminate 不設 valuenow;spinner 用 `role=status`
- 纖維透明度遞減(1 → .3)做深度;全部只用 `accent` 一色,不引入新色
- reduced-motion:spinner/tidy 動畫關閉(毛球顯示靜態滿線、tidy 直接平整),determinate 保留(進度本身是資訊)
- 百分比 Geist Mono + tabular-nums;數字外必附文字說明(「3 則訊息交接中」)

## 實作建議

SVG path 由程式生成(sine / cubic 取樣),React 實作放 utils 共用;Base UI `Progress`/`Meter` 只拿語意層,視覺全自繪。

## References

- prototype.html(weave/yarn/tidy 的生成邏輯都在檔內 script)
- https://base-ui.com/react/components/progress · https://base-ui.com/react/components/meter
- CSS `d` transition:https://developer.mozilla.org/en-US/docs/Web/CSS/d
