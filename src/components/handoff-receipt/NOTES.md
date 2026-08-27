# Handoff Receipt

**已實作** — `HandoffReceipt.tsx`,測試 `HandoffReceipt.test.tsx`;playground 的 `#handoff-receipt` 區可實際操作。

rotation 分隔線:thread 過去區裡一條安靜的細列「換班完成 · 時間 · ctx 50% → 新 session」,可展開看交接摘要。用戶不管理 session,這是他唯一看見換班的地方。

## 需求(定案)

- collapsed 為預設:一列 = 循環 icon + 時間 + ctx 用量 + reason(soft-threshold 不特別標;hard-limit 標「硬上限」)+ chevron,左右虛線把它嵌進時間軸
- 展開(同列 toggle,不開 dialog):三項核對——記憶(flush 落盤幾筆)/ 摘要(handoff 已交給下一輪、讀後銷毀)/ Ledger(本輪收據數、不進新 context)——加一段 handoff 交接文字
- 是收據不是控制:不可改、無任何動作按鈕

## API 草案

```tsx
<HandoffReceipt at={ts} ctxPercent={50} reason="soft-threshold" // | "hard-limit" | "state-transition"
  memory={{ count: 3, items: string[] }}
  ledgerCount={42}
  handoffSummary="landing 定價區塊寫到…" 
  defaultOpen={false} />
```

## 行為

- 資料來源 = `session.rotated` 事件(fromSessionID/toSessionID/reason)fold 進過去區,無元件自行 fetch
- 展開狀態純 local UI state;body 進場 fade+slide 160ms
- handoff 本體只活到下一輪,receipt 顯示的是它的摘要快照(存在 ledger)

## A11y

- 整列是一顆 `<button aria-expanded>`,Enter/Space 展開;focus-visible 內縮 outline
- 動畫與 chevron 旋轉包 `prefers-reduced-motion: reduce`(直接關閉)
- 收據列字級小、灰字,但對比維持在 muted token(4.5:1 目標)

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/17-session-rotation.md(三載體、50% trigger、reason 三態、分隔線可展開 handoff)
- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/22-workspace-shell.md(過去區收據不可改、rotation 分隔線)
