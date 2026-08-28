# Button — 織面光澤(探索中)

**狀態:第三版原型(織面 + SVG 動畫),press 兩案待定。** `prototype.html` 瀏覽器直接開。
`Button.tsx` 是已出貨的安靜版本,本探索**尚未**進實作。

## 走過的路

1. 稀疏水平線 + 大位移 → 「像吉他弦」,不是緊緻衣料。
2. canvas 隨機短絨 → 散亂的點狀質地「像皮膚炎」,不精緻。
3. **現版:織出來的線。** 精緻感來自「有序」:連續、平行、帶織理節奏,層層交疊。

## 現版做法(SVG)

- **三層織理**,靜止時是安靜的質地:
  - 緯線主層:2.6px 間距、0.7px 振幅正弦,相鄰線相位相反(線與線微靠攏又分開 = 織的節奏),op .13
  - 緯線副層:錯半格、不同波長(34 vs 26),op .07 — 兩層干涉出布的深度
  - 經線:7px 間距、微彎,op .05,只是提示
- **hover = 光,不是形變**:同一套織線幾何再畫一份亮的,用柔邊 radialGradient mask 顯形;
  柔光圓 lerp 追指尖(延遲就是撫摸感),移動快光亮到 1、停下沉回 .5,離開淡出。
- 逐幀只改 4 個 attribute(圓心 ×2、兩個 group opacity),沒有逐點物理,便宜。

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
