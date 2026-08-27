# Action bar

assistant 訊息底部的 hover 動作列:高度永遠保留(pb + 負 mb 技法),hover 只切 opacity,turn 節奏零跳動。

## API 草案

```tsx
<AssistantMessage isLast={isLast}>
  <TextPart>…</TextPart>
  <ActionBar>
    <ActionBar.Copy />                     {/* 點擊 → ✓ 2s */}
    {isLast && <ActionBar.Regenerate />}   {/* 只在最後一則 */}
  </ActionBar>
</AssistantMessage>
```

## 行為(prototype 已示範)

- 防跳動:訊息容器 `padding-bottom: var(--bar-h)` + `margin-bottom: calc(var(--bar-h) * -1)`(assistant-ui 的 `-mb-7.5 pb-7.5` 技法);bar 絕對定位在保留區,`opacity 0 → 1`(120ms)。turn gap 維持 24px 不變。
- 顯示條件:`.assistant:hover` 或 `:focus-within`(鍵盤 tab 進按鈕也會現形)。
- 複製:寫入 clipboard,按鈕文字變「已複製 ✓」2 秒後還原。
- 重新生成:只在最後一則 assistant 出現;實作接 plan 24 §6 的 `POST /sessions/:id/retry`(同 parentID 新 assistant,舊卡由 selector 蓋掉)。
- opacity transition 包 `prefers-reduced-motion: reduce`。

## a11y

- 容器 `role="toolbar" aria-label="訊息動作"`;按鈕有文字 label,不是純 icon。
- `:focus-within` 讓鍵盤使用者不靠 hover 也能看到並操作。
- 複製結果的「已複製 ✓」同時是視覺與可讀文字回饋。

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/24-thread-ui.md(§2 版面:保留列高防跳動、重新生成只在最後一則)
- assistant-ui — AssistantActionBar(`-mb-7.5 pb-7.5` 原技法出處):https://www.assistant-ui.com/docs/ui/AssistantActionBar
- Vercel AI Elements — Actions:https://ai-sdk.dev/elements/components/actions
