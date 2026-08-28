# Button — 織成的實心(探索中)

**狀態:第四版原型(線堆成按鈕本體),press 兩案待定。** `prototype.html` 瀏覽器直接開。
`Button.tsx` 是已出貨的安靜版本,本探索**尚未**進實作。

## 走過的路

1. 稀疏水平線 + 大位移 → 「像吉他弦」,不是緊緻衣料。
2. canvas 隨機短絨 → 散亂點狀「像皮膚炎」,不精緻。
3. SVG 等距正弦三層 → 太數學、太死板,沒有生命力。
4. **現版:不給 background,按鈕的實心是線自己堆出來的。**

## 現版做法(SVG,無 background)

- **每條紗都是個體**:長波(46–130px,鬆)+ 短顫(9–23px,纖維感)+ 整條慢漂移,
  波長互不通約、相位隨機、兩端不齊 — 刻意消掉座標軸感。每次 build 重織,紗路獨一無二。
- **堆疊成實心**(clip 進圓角矩形):
  1. 陰影紗:粗(2.2–3.2px)、暗色、下沉半格 — 紗縫是暗的,布才有厚度
  2. 本體紗:~2px 間距、1.5–2.7px 粗,交疊成實心;y 越深挑越暗的紗(光從上來),
     色票 --y0…--y4 每 variant 一組
  3. 挑面亮紗:2–4 根 0.7–1.1px 細紗浮在面上,是高光
  4. 線頭:clip 外左右各一根鬆脫捲曲的纖維
  - 整顆 SVG 掛 CSS drop-shadow,實心感落地
- ghost 織得疏(2.9px 間距、無陰影紗,看得見底);secondary 是淺色布
- **hover = 光**:抽一半本體紗重繪成亮紗,柔邊 radialGradient mask 顯形,
  柔光圓 lerp 追指尖;逐幀只改 4 個 attribute,無逐點物理。

## press/release 兩案(prototype 可並排試)

- **A 壓痕(dent)**:按下光收掉、按點織線沉暗成指印(第三份幾何,暗色 + 小 mask 圓);
  放開指印淡出、光回來。按鈕安靜地「陷下去再浮起來」。
- **B 光環暈開(bloom)**:按下光收攏成小粒;放開一圈細光環沿織線暈開
  (ring-shaped radialGradient mask + SMIL `<animate>` r 6→0.75w,480ms,同步淡出)。
  漣漪只照亮織理、不改變它。

## 待決

1. A 還是 B(或 primary 用 B、危險動作不動)?
2. 織理密度/波長/透明度的手感微調;secondary 淺色底上 sheen 是否夠明顯?
3. 進 `Button.tsx`:幾何 build 一次 + ResizeObserver;rAF 只在互動時跑;SSR 安全。
4. texture 準則 — 是否只給 primary/CTA,secondary/ghost 保持安靜?

## a11y

- 織線層 SVG、`pointer-events: none`、純裝飾(無 role/label,不進 a11y tree)
- 鍵盤 Space/Enter 等同 press(指針視為按鈕中心),focus ring 不變
- reduced-motion:rAF 與 SMIL 都不啟動,靜態織理
