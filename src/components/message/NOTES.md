# Message

過去區的訊息節奏:user 右對齊氣泡、assistant 全寬純文字,turn 24px / part 8px,字級只走 plan 24 的三個 token。

## API 草案

```tsx
<Thread>
  <UserMessage>幫我看一下 thread reducer…</UserMessage>
  <AssistantMessage streaming={false} pending={false}>
    <TextPart>好,規則在 `selectVisibleMessages`…</TextPart>
  </AssistantMessage>
</Thread>
```

- 元件不自帶尺寸:正文 `text-body`(14/1.6)、inline code `text-code`(13/1.5 mono),spacing 由 Thread 的 `--turn-gap: 24px` / `--part-gap: 8px` 控。
- `streaming`:最後一個 text part 尾端接閃爍 cursor。
- `pending`:還沒任何 part 時渲染脈動點 + `aria-label="回覆中"`。

## 行為(prototype 已示範)

- user:`bg-muted rounded-2xl rounded-br-md px-3.5 py-2`,max-w 85%,靠右。
- assistant:全寬、無頭像無氣泡;段落間距 = part gap。
- streaming cursor:1px 直線,`steps(2)` 1s 閃爍;pending 點 1.2s 脈動。兩者皆包 `prefers-reduced-motion: reduce` 關閉。
- 長 thread:每個 turn 上 `content-visibility:auto; contain-intrinsic-size:auto 200px`(實作時加,prototype 未示範)。

## a11y

- pending 點是 `role="status"` + `aria-label="回覆中"`,cursor 是純裝飾 `aria-hidden`。
- 氣泡與正文顏色只用 semantic token,對比走 `foreground` on `muted`。

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/24-thread-ui.md(§1 token、§2 版面)
- Vercel AI Elements — Message / Conversation anatomy:https://ai-sdk.dev/elements/components/message
- assistant-ui — Thread 節奏與 viewport:https://www.assistant-ui.com/docs/ui/Thread
- streamdown — 串流 markdown 渲染(正文實作層):https://streamdown.ai
