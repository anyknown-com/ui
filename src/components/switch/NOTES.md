# Switch

**已實作** — `Switch.tsx`,測試 `Switch.test.tsx`;playground 的 `#switch` 區可實際操作。

即時生效的開關(相對於 Checkbox 的「提交後生效」)。原生 checkbox + `role="switch"`。

## API 草案

```tsx
<Switch checked disabled label description onCheckedChange />
```

## 行為

- thumb 滑動 200ms `cubic-bezier(.34,1.56,.64,1)`(輕微回彈,對應 transitions.dev「Toggle thumb slides」)
- track 底色 `borderStrong` → 開啟轉 `accent`
- 設定列的慣用排版:文字在左、開關在右(prototype 已示範)
- `prefers-reduced-motion` 關閉動畫

## a11y

- input 加 `role="switch"`(aria-checked 由原生 checked 對映)
- 切換即生效,不需要另外的儲存按鈕;若有延遲生效要顯示 pending 狀態

## References

- https://ui.shadcn.com/docs/components/base/switch
- transitions.dev「Toggle/Thumb slides」:double-bounce 滑動參考

## Texture 升級(prototype 先行,2026-08-29)

- prototype.html 已把 on-state 藥丸從 5×5 crosshatch pattern 換成 TEXTURE-GUIDE
  的完整紗線堆疊(mulberry32(10075)、共享波場、底紗/縫隙/面紗/亮紗、primary 色票)
- 織入動畫改為 clipPath rect 的 width 推進 — 紗固定不動,布被逐漸「織出」
- 選取控件保持安靜:靜態織紋、無 rAF、無窩/掃光
- 已落地 `Switch.tsx`(2026-08-29,共享 lib/weave.ts;lib/Fabric.tsx 已汰換刪除)
