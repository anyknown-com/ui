# Button — 織成的實心(探索中)

**狀態:第四版原型(線堆成按鈕本體),press 兩案待定。** `prototype.html` 瀏覽器直接開。
`Button.tsx` 是已出貨的安靜版本,本探索**尚未**進實作。

## 走過的路

1. 稀疏水平線 + 大位移 → 「像吉他弦」,不是緊緻衣料。
2. canvas 隨機短絨 → 散亂點狀「像皮膚炎」,不精緻。
3. SVG 等距正弦三層 → 太數學、太死板,沒有生命力。
4. **現版:不給 background,按鈕的實心是線自己堆出來的。**

## 現版做法(SVG,無 background)

- **覆蓋與細緻的解法(v5)**:粗紗版「不夠細緻、沒完全分佈」。改成:
  - **共享波場**:整塊布一起起伏(兩個不可通約頻率干涉、相位隨 y 緩慢滑移,
    起伏斜掃過布面)。相鄰紗同進退 → divergence 不超過線寬,不露縫;
    每條紗再疊自己的小顫(6.5–15px 短波)與粗細深淺個體差 → 有生命但不散
  - 線全面變細:面紗 0.6–1.4px、行距 ~1.2px
- **堆疊成實心**(clip 進圓角矩形,線全部收在按鈕內,不外露):
  1. 底紗:2.6px 粗、1.8px 距鋪滿 — 縫隙透出的是紗影,不是底色
  2. 縫隙陰影:0.5–0.8px 細暗紗夾在面紗之間,織紋凹處
  3. 面紗:~1.2px 距、0.6–1.4px 粗,y 越深挑越暗(色票 --y0…--y4)
  4. 挑面亮紗:0.4–0.7px 高光絲
  - 整顆 SVG 掛 CSS drop-shadow,實心感落地
- ghost 織得疏(2.1px 距、無底紗);secondary 是淺色布;每次 build 重織
- **hover = 光**:抽 1/3 面紗重繪成亮紗,柔邊 radialGradient mask 顯形,
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
