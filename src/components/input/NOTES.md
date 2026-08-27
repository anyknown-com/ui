# Input

**已實作** — `Input.tsx`,測試 `Input.test.tsx`;playground 的 `#input` 區可實際操作。

單行文字輸入。`prototype.html` 為視覺與狀態規格。

## API 草案

```tsx
<Input size="sm" | "md" invalid leadingIcon={<Search />} ... /* ComponentProps<"input"> */ />
```

- `invalid` → 設 `aria-invalid`,border/focus ring 轉 `danger`
- 錯誤訊息與 help text 由 Field/Label 層組合,不內建在 Input

## 行為

- focus ring:`focus-visible` 2px `color.focusRing`,offset -1(貼齊 border)
- hover 提升 border 至 `borderStrong`;transition `motion.fast`
- disabled:opacity 0.5 + `not-allowed`

## a11y

- 一律搭配 `<label for>`(見 label/)
- 錯誤訊息用 `aria-describedby` 連結
- font-size ≥ 16px 於 mobile 可免 iOS 自動 zoom(md=0.9rem 需確認 desktop-only 或調整)

## References

- https://ui.shadcn.com/docs/components/base/input(Base UI 系)
- transitions.dev:「Input clear with dissolve」「Error state shake」可作 clear/error 微動效參考
