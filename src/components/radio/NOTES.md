# Radio / RadioGroup

**已實作** — `Radio.tsx`、`RadioGroup.tsx`,測試 `Radio.test.tsx`;playground 的 `#radio` 區可實際操作。

原生 `<input type="radio">` + `fieldset/legend` 群組。內圈 dot 用 `scale` 進場(140ms)。

## API 草案

```tsx
<RadioGroup value onValueChange name legend>
  <Radio value="50" label="50%(建議)" description="..." />
  <Radio value="75" label="75%" />
</RadioGroup>
// variant: "plain" | "card"(card 選中時 border + accentSubtle 底)
```

## 行為

- 鍵盤:同 name 群組內方向鍵移動並選取(原生行為)
- card variant 用 `:has(input:checked)` 亮整張
- disabled 可作用於單一選項或整組

## a11y

- 群組標題用 `legend`(或 `role="radiogroup"` + `aria-labelledby`)
- 說明文字掛在 label 內,一起可點

## References

- https://ui.shadcn.com/docs/components/base/radio-group

## 鏡頭取景升級(prototype 先行,2026-08-29)

- 否決紀錄:
  - 舊 coil(2.3 圈、圈距 > 線粗)—「是圈圈,不是線在圈圈區域」
  - 實心線墊(圈距 ≈ 線粗的密繞螺旋)—「還是像蚊香」;
    問題出在讓線侷限在圓裡自己繞成一團
- 定案:**鏡頭**。布(button 同源的紗線堆疊,seed 10075)像背景一樣在後面延伸,
  圓形只是取景框 — 圓形 clip 在布上開孔,選中 = 孔徑(circle r)從 0 打開,
  布本身完全不動。幾何與 checkbox 完全同源(14.8px 顯示尺寸換算)。
- 孔徑只開到 r 6.8(viewBox 24):維持 radio 的標準構成 —
  外環(border accent)+ surface 空隙 + 內實心圓(= 鏡頭裡的布),不是整面填滿。
- 已落地 `Radio.tsx`(2026-08-29,共享 lib/weave.ts;COIL_PATH 已退役刪除)
