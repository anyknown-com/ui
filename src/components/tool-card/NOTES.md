# Tool card

**已實作** — `ToolCard.tsx`,測試 `ToolCard.test.tsx`;playground 的 `#tool-card` 區可實際操作。

工具呼叫的收據:單列 icon + title(動詞)+ subtitle(主要參數)+ 耗時 + chevron,展開看輸入/輸出;subagent 是它的變體,不是新元件家族。

## API

```tsx
<ToolCard
  tool="shell"                 // 對應動詞表:讀取/編輯/寫入/執行/搜尋…,未知則原名
  subtitle="pnpm test"         // runtime 給的 title 優先
  state="running|completed|error"
  durationMs={8100}
  defaultOpen                  // shell / edit / write / error 預設展開
  retry={{ attempt: 2, max: 3, delayMs: 3000 }}  // 自動重試可見化(warning,不是錯誤)
>
  <ToolInput json={input} />
  <ToolOutput text={output} />
</ToolCard>

<SubagentCard callID={part.callID} />  // tool === "subagent" 時由 ToolPart 分流
```

## 行為

- 列與展開內容全走 token:列 `text-meta`、輸入/輸出 `text-code` mono、內距 `--card-pad`(10px 12px)、耗時 `tabular-nums`。
- 狀態 icon:running = spinner、completed = ✓ success、error = ✗ destructive。
- 預設收合;例外預設展開:`shell`、`edit`/`write`、任何 error —— error 是**在 render 期間看 state 轉換**判斷的,因為工具通常先 running 後失敗,只看初始 state 會讓錯誤留在收合狀態。
- error:destructive 底的錯誤區 + 「複製錯誤」;卡底 `retry-line` 顯示「重試中(第 2 次,3 秒後)… 重試 2/3」,warning 色 + `role="status"`。
- subagent 變體(plan 28):標題「委派 + title」;第二行永遠存在 = model chip(mono 小框,未指定不顯示)+ running 時 now line(子 session 此刻的工具,shimmer)/ 其他狀態「N 工具」;completed 收合時多一段摘要 `line-clamp-3`;展開 = 子 thread `nested` 變體(左 2px border + 12px 縮排、task 全文是引文塊不是氣泡、字級全降到 meta/code)。
- shimmer 與 spinner 包 `prefers-reduced-motion`(shimmer 關閉、spinner **放慢不關閉**)。spinner 是「還在跑」的唯一即時訊號,屬 WCAG 2.3.3 的必要動效,所以照 NOTES 減速而非移除;骨架的 shimmer 是裝飾,那邊就整個關掉。

## a11y

- 整列是 `<button aria-expanded>`,展開區 hidden 切換(**StyleX 的 `display:grid` 會蓋掉 UA 的 `[hidden]{display:none}`,所以樣式裡要自己寫 `:is([hidden])` 分支**);focus ring `outline-offset:-2px` 貼卡內。
- 卡片有**一個常駐**的視覺隱藏 `role="status"`,內容是狀態 +(有的話)重試進度 —— live region 要跟文字一起在場才會播報,把 region 跟它的文字一起掛上等於沒播報。spinner 與重試列本身改為 `aria-hidden`。
- 展開內容超寬只在 `pre` 內橫向捲動,不撐破卡。`pre` 用 `role="group"` 而不是 `region`,否則一條長 thread 會把 landmark 清單灌爆。

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/24-thread-ui.md(§5 工具卡、§6 錯誤與重試)
- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/28-subagent-display.md(委派卡全部規則)
- Vercel AI Elements — Tool:https://ai-sdk.dev/elements/components/tool
- assistant-ui — Tool UI / ToolFallback:https://www.assistant-ui.com/docs/guides/ToolUI
- opencode 工具卡(title/subtitle、重試可見化、預設展開規則的參考來源)
