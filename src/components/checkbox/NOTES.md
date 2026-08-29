# Checkbox

**已實作** — `Checkbox.tsx`,測試 `Checkbox.test.tsx`;playground 的 `#checkbox` 區可實際操作。

原生 `<input type="checkbox">` 隱藏 + 自繪 box;勾勾用 SVG stroke-dashoffset 畫出(160ms ease-out)。

## API 草案

```tsx
<Checkbox checked indeterminate disabled label description onCheckedChange />
```

## 行為

- checked / indeterminate 都填 `accent` 底;indeterminate 顯示橫線
- focus ring 打在 box 上(`:focus-visible + .box`)
- 整個 label 可點;disabled 用 `:has()` 整組淡出
- `prefers-reduced-motion` 關閉 stroke 動畫

## a11y

- 語意完全來自原生 input(不用 div+aria)
- indeterminate 只能由 JS 設,實作時用 ref effect(或 Base UI Checkbox 的 `indeterminate` prop)

## References

- https://ui.shadcn.com/docs/components/base/checkbox
- transitions.dev「Checkbox check」:stroke-drawn 勾勾動畫(本 prototype 已按此做)

## Texture 升級(prototype 先行,2026-08-29)

- prototype.html 已把勾選底從 5×5 crosshatch pattern 換成 TEXTURE-GUIDE 的完整
  紗線堆疊(mulberry32(10075)、primary 色票);依實際顯示尺寸(14.8px)換算比例,
  螢幕上紗的粗細行距與 button 等粗
- 勾改用 accent-text 縫(同 primary button label 的對比),織入動畫 = clipPath width 推進
- 修了 check 的 stroke-dasharray 24 → 29(路徑長 ~28,24 會在 unchecked 時漏出尾巴;
  `Checkbox.tsx` 同樣的潛在 bug 落地時一併修)
- 已落地 `Checkbox.tsx`(2026-08-29,共享 lib/weave.ts;dasharray bug 隨縫線方案一併消失)
