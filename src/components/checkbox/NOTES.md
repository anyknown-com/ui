# Checkbox

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
