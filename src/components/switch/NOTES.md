# Switch

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
