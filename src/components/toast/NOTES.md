# Toast

**已實作** — `Toast.tsx`,測試 `Toast.test.tsx`;playground 的 `#toast` 區可實際操作。

非阻斷通知:疊在右下角、slide+fade 進場、5 秒後自動消失(hover 暫停);danger/success 用色點區分,可帶一個動作按鈕(「已刪除 · 復原」)。

## API 草案

```tsx
const { toast } = useToast()

toast("交接摘要已複製")
toast.success("換班完成", { description: "3 則記憶已帶進新 thread" })
toast.danger("無法連到 vault", { description: "稍後會自動重試" })
toast("已刪除「偏好 pnpm」", { action: { label: "復原", onClick: undo } })

// app root
<Toaster position="bottom-right" />
```

## 行為(prototype 已示範)

- 疊放:新 toast 最靠近角落(Base UI 的 store 是 newest-first,所以 bottom-* 用 `column-reverse`);寬 `min(20rem, vw - 2.5rem)`;超過 `limit` 的 toast 由 `data-limited` 隱藏
- 進場:`translate 1rem → 0` + fade,180ms;reduced-motion 全關(直接移除)。**離場動畫未實作**:StyleX 無法選 `[data-ending-style]`,所以退場是瞬時的
- 自動消失:5000ms,由 Base UI 的 viewport 統一計時;退織倒數線的 `animation-play-state` 也綁在 **viewport** 的 hover/focus 上,兩者才不會各走各的
- variant 只換左側色點(default `faint` / success `accent` / danger `danger`),不整片染色 —— Ledger 走低調路線;色點是 `aria-hidden`,所以 success/danger 另加一段視覺隱藏的文字(「成功:」「錯誤:」)避免顏色是唯一線索
- action 按鈕點擊後即關閉該 toast

## a11y

- 容器 `aria-live="polite"`(danger 可升 `assertive`),新內容由 SR 自動朗讀
- 時長至少 5s(WCAG 2.2.1 考量);hover/focus 暫停計時
- action 按鈕可 focus;純文字 toast 不搶 focus

## References

- https://base-ui.com/react/components/toast(headless 層:`Toast.Provider`/`Viewport`/`Root`/`Action`,timer 暫停內建)
- https://ui.shadcn.com/docs/components/base/toast
- https://sonner.emilkowal.ski/(疊放與 hover 展開的互動參考)
