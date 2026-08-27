# Textarea

多行輸入。與 Input 共用 border/focus/error 樣式語言。

## API 草案

```tsx
<Textarea autoGrow maxRows invalid ... /* ComponentProps<"textarea"> */ />
```

## 行為

- `autoGrow`:優先用 CSS `field-sizing: content` + `max-height`(Chrome/Edge 已支援);fallback 用 oninput 調 scrollHeight。開啟時 `resize: none`
- 字數統計由外層 Field 組合(tabular-nums,mono)
- 其餘狀態(hover/focus/error/disabled)同 Input

## References

- https://ui.shadcn.com/docs/components/base/textarea
- field-sizing: https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
