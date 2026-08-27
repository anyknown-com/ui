# Reasoning fold

思考過程的摺疊列:預設收合只留「思考了 N 秒」,串流中撐開、標籤 shimmer「思考中…」,內容永遠是 muted 斜體的配角。

## API 草案

```tsx
<ReasoningFold
  streaming={false}
  durationSec={12}
  defaultOpen={false}
  onToggle={markUserToggled}   // 手動切換過就不再自動收
>
  {reasoningMarkdown}
</ReasoningFold>
```

## 行為(prototype 已示範)

- 收合列:`text-meta` muted,chevron 展開時旋轉 90 度;hover 升到 `foreground`。
- 標籤:串流中「思考中…」shimmer 脈動;結束「思考了 N 秒」。
- 內容:`text-meta` muted 斜體,左側 2px border 縮排,markdown 渲染(實作走 streamdown)。
- 串流中:預設撐開且內容貼底跟隨(stick-to-bottom 的區域版);結束 1s 後自動收合;使用者手動切換過就永遠尊重手動狀態。
- shimmer 與 chevron transition 包 `prefers-reduced-motion: reduce`。

## a11y

- 摺疊列是 `<button aria-expanded>`,內容區以 hidden 切換,鍵盤可及。
- shimmer 只是視覺,reduced-motion 下退回靜態 muted 文字,語意不變。
- 自動收合不搶 focus:收合時 focus 若在內容內,移回摺疊列。

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/24-thread-ui.md(§4 Reasoning)
- Vercel AI Elements — Reasoning(auto open/close on stream、duration 標籤):https://ai-sdk.dev/elements/components/reasoning
- assistant-ui — Reasoning UI:https://www.assistant-ui.com/docs/ui/Reasoning
- streamdown — 內容 markdown 渲染:https://streamdown.ai
