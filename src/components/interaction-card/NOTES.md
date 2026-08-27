# Interaction Card

agent 在等你的兩種卡:Permission(權限請求)與 Decision(要你決定)。pending 是可操作物,回覆後收成過去區的不可改收據。

## 需求(定案)

- Permission 卡:warning 邊框、mono 顯示指令/對象、允許一次(⏎)/總是允許(⌘⏎)/拒絕(Esc)、底部 policy 說明列(解釋為何問、規則活過 rotation)
- Decision 卡:同一種卡分 blocking(邊框 accent、狀態「等你才能繼續」)與 non-blocking(安靜邊框、「等你 · deadlineAt 倒數」)
- Decision 內容走 block DSL:markdown / options(radio 或 checkbox,`recommended` 標「建議」)/ text 自由輸入 / table / image / diff;prototype 示範 options + text
- 必填未選時「送出決定」disabled;有 recommended 時多一顆「照建議」
- resolved:卡縮成一列收據文字(已允許一次 / 已總是允許(scope)/ 已拒絕 / 已決定 · 你選了…),不可改

## API 草案

```tsx
<PermissionCard verb="執行指令" subject="pnpm publish --access public"
  policyHint="只在花錢、發佈、動到安全的時候停下來問你"
  onReply={(r: "once" | { always: PermissionRule } | { reject: true; message?: string }) => void}
  resolved={receipt} />

<DecisionCard blocking title="landing 的定價區塊,先出哪一版?"
  blocks={DecisionBlock[]} deadlineAt={ts}
  onAnswer={(answer: Record<string, string | string[]>, answerText?: string) => void}
  resolved={receipt} />
```

## 行為

- 回覆只打 server route(`/permissions/:id/reply`、`/decisions/:id/answer`),renderer 不碰 runtime
- 拒絕一張 permission 會 cascade 拒絕同 session 其他 pending,UI 一起轉「已拒絕(連帶)」收據
- 只有一個 options block 且無其他必填輸入時,點選項即送出(prototype 保留送出鈕示範通則)
- blocking decision pending 期間,assistant footer 顯示「等你決定」
- pending 卡聚合在現在線「等你 · N」chip;卡不阻塞 composer

## A11y

- options 用原生 radio/checkbox 包 label,`:has(input:checked)` 上色、`:has(input:focus-visible)` 畫 focus ring
- 快捷鍵僅在卡 focus 時生效,綁在三顆按鈕上;**只攔 Esc 與 ⌘⏎**,單獨的 ⏎ 留給被聚焦的按鈕自己(否則 tab 到「拒絕」按 ⏎ 會變成允許)。glyph 用 `aria-hidden` + `aria-keyshortcuts`,不進 accessible name
- 收據的 `aria-live="polite"` 區塊**常駐**(pending 時是空的視覺隱藏節點),回覆後才填字 —— region 跟文字一起掛上是不會播報的

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/25-interaction-cards.md(卡面、block DSL、scope、cascade)
- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/22-workspace-shell.md(等你 chip、收據不可改)
