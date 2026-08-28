# Button — 絨面纖維(探索中)

**狀態:第二版原型(絨面),press 兩案待定。** `prototype.html` 瀏覽器直接開,可實際操作。
`Button.tsx` 是已出貨的安靜版本,本探索**尚未**進實作。

## 概念

不做 MUI 的圓形漣漪。第一版把纖維畫成稀疏的水平線 + 大位移,回饋是「像吉他弦」——
布料的緊緻感不對。第二版改成**絨面**:canvas 鋪一層 3px 網格的短纖維(600 根上下,
靜止透明度 10–14%,是質地不是圖案),緊緻布料被摸的視覺反應是**亮度**,不是形變:

- hover:纖維順著指尖走向**倒伏**(±0.9rad 內,彈簧回正),倒伏處泛起光澤軌跡,
  慢慢消退(×0.955/frame)。摸得快痕跡亮。
- 位移極小、光澤為主 — 這是絨布與弦的差別。

## press/release 兩案(prototype 可並排試)

- **A 壓痕(dent)**:按下,按點周圍絨毛壓平壓暗(一塊指印,σ≈15px);放開半秒內立回。
  像壓沙發布面,隱喻直觀。
- **B 熨平 → 光澤暈開(bloom)**:按下,全部倒伏歸零、光澤收掉(布繃出張力);
  放開,一圈柔和亮度從按點暈開(c≈0.09px/ms,約 500ms 淡完)。
  對 MUI 漣漪的回答:我們的漣漪是布面回彈掃過的光,不是水波。

## 待決

1. A 還是 B(或 primary 用 B、危險動作不動)?
2. 密度/透明度手感:PITCH 3px、baseA .10–.14 在 retina 與一般螢幕上是否都夠細?
3. 進 `Button.tsx` 的成本:canvas + rAF 纖維場要 lazy(首次 hover 才建),
   列表大量按鈕時共享一個 ticker;SSR 無副作用(canvas 只在 client 建)。
4. texture 準則說 texture 用在「等待、過渡、儀式」— 是否只給 primary/CTA,
   secondary/ghost 保持安靜?

## a11y

- 纖維層是 canvas、`pointer-events: none`、純裝飾,不進 accessibility tree
- 鍵盤 Space/Enter 等同 press(原型已接,指針視為按鈕中心),focus ring 不變
- reduced-motion:rAF 不啟動,完全靜態
