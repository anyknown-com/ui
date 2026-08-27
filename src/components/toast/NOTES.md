# Toast

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

- 疊放:新 toast append 在最下(最靠近角落);寬 `min(20rem, vw - 2.5rem)`
- 進場:`translate 1rem → 0` + fade,180ms;離場反向 160ms transition;reduced-motion 全關(直接移除)
- 自動消失:5000ms;`mouseenter` 清 timer、`mouseleave` 重新起算(實作時 focus 進 toast 也要暫停)
- variant 只換左側色點(default `faint` / success `accent` / danger `danger`),不整片染色 —— Ledger 走低調路線
- action 按鈕點擊後即關閉該 toast

## a11y

- 容器 `aria-live="polite"`(danger 可升 `assertive`),新內容由 SR 自動朗讀
- 時長至少 5s(WCAG 2.2.1 考量);hover/focus 暫停計時
- action 按鈕可 focus;純文字 toast 不搶 focus

## References

- https://base-ui.com/react/components/toast(headless 層:`Toast.Provider`/`Viewport`/`Root`/`Action`,timer 暫停內建)
- https://ui.shadcn.com/docs/components/base/toast
- https://sonner.emilkowal.ski/(疊放與 hover 展開的互動參考)
