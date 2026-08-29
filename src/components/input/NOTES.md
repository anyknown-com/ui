# Input

**已實作** — `Input.tsx`,測試 `Input.test.tsx`;playground 的 `#input` 區可實際操作。

單行文字輸入。`prototype.html` 為視覺與狀態規格。

## API

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

## 尺寸

md / sm / button / select 分別是 36 / 28 / 36 / 36px,textarea 72px。兩個踩過的坑:

- **控件自己要寫 `box-sizing: border-box`**。`<input>` / `<textarea>` 拿的是瀏覽器
  預設的 content-box,`minHeight: 2.25rem` 會變成「內容」36px 再加 padding + border,
  md 實際長到 54px(還會因為 `width: 100%` 超出容器 26px)。不能靠 app 端剛好有
  `*{box-sizing:border-box}` 這條 reset。同一個坑也修了 Select 的 multiple trigger
  (那顆是 div 不是原生 button,拿不到 UA 的 border-box)
- **單行控件行高用 `leadingTight`**。1.5 會把 md 撐到 39px,和 button / select 的
  2.25rem 差 3px。Textarea 自己蓋回 `leadingRelaxed`,多行照樣好讀

## References

- https://ui.shadcn.com/docs/components/base/input(Base UI 系)
- transitions.dev:「Input clear with dissolve」「Error state shake」可作 clear/error 微動效參考
