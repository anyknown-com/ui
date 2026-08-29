# Checkbox

**已實作** — `Checkbox.tsx`,測試 `Checkbox.test.tsx`;playground 的 `#checkbox` 區可實際操作。

原生 `<input type="checkbox">` 隱藏 + 自繪 box。

## API

```tsx
<Checkbox checked indeterminate disabled label description onCheckedChange />
```

## 行為

- 勾選的底是一塊布:TEXTURE-GUIDE 的紗線堆疊(seed 10075、primary 色票),
  依實際顯示尺寸(14.8px)換算比例,螢幕上紗的粗細行距與 button 等粗
- 勾用 `accent-text` 縫上去(對比同 primary button 的 label),
  織入動畫 = clipPath width 推進;indeterminate 顯示橫線
- 幾何與 radio 同源,都走 `lib/weave.ts`
- focus ring 打在 box 上(`:focus-visible + .box`)
- 整個 label 可點;disabled 用 `:has()` 整組淡出
- `prefers-reduced-motion` 關閉動畫,織紋靜態呈現

## a11y

- 語意完全來自原生 input(不用 div+aria)
- indeterminate 只能由 JS 設,用 ref callback 設在原生 input 上

## 走過的彎路

- 勾選底曾是 5×5 crosshatch pattern —— 那是「有紋路的方塊」,不是布
- 勾曾用 `stroke-dasharray: 24`,但路徑長約 28,unchecked 時會漏出尾巴;
  改成縫線方案之後這個 bug 自然消失

## References

- https://ui.shadcn.com/docs/components/base/checkbox
