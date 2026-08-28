# Button — 纖維撫摸(探索中)

**狀態:hover 方向已有原型,press/release 兩案待定。** `prototype.html` 瀏覽器直接開,可實際操作。
`Button.tsx` 是已出貨的安靜版本,本探索**尚未**進實作。

## 概念

不做 MUI 的圓形漣漪。按鈕底下鋪一層水平纖維(貼合「訊息是纖維、thread 是線」),
滑鼠滑過去時,線像被手指揉過:讓開、彈回、殘留一點晃動。移動越快揉得越深。

## 原型的物理

- 每條線取樣成點(6px 一點),每點一顆彈簧(`pos += vel; vel += (target-pos)*k - vel*damping`)
- hover target:高斯波包,水平 σ≈16px、垂直指數衰減,方向是「從指尖讓開」
- 指尖速度放大深度(0.6x–1.8x),快速掃過像用力揉
- idle 時能量趨零就停 rAF;`prefers-reduced-motion` 直接不啟動,線是靜態裝飾

## press/release 兩案(prototype 可並排試)

- **A 捏聚**:按下線往按點聚攏(像捏起一撮纖維),放開彈散 + overshoot。
  隱喻強、跟 switch 的「fabric 推線頭」同族;但視覺動得比較大,危險動作按鈕上可能太鬧。
- **B 繃緊 → 行進波**:按下全部拉平(布繃緊、有張力),放開從按點沿線跑出一個一維波,
  600ms 內衰減。是「線的漣漪」而不是圓形漣漪,安靜、跟 handoff-receipt 的線語言最一致。

## 待決

1. A 還是 B(或 primary 用 B、危險動作乾脆不動)?
2. 線的密度/透明度:primary 上用 accentText @ .22 夠隱形嗎?
3. 進 `Button.tsx` 時的成本:每顆按鈕一個 rAF 彈簧場,列表裡大量按鈕要 lazy(hover 才建 SVG)
4. texture 準則說 texture 用在「等待、過渡、儀式」— button hover 算不算儀式時刻,還是應該只給
   primary/CTA 級按鈕,secondary/ghost 保持安靜?

## a11y

- 纖維層 `pointer-events: none`、純裝飾,不進 accessibility tree(SVG 無 role/label)
- 鍵盤 Space/Enter 等同 press(原型已接),focus ring 不變
- reduced-motion:完全靜態
