# Code block

markdown 裡的程式碼區塊:header(語言小寫標籤 + 複製鈕)+ `text-code`(13/1.5 mono)本體,超寬只在 block 內橫向捲動。

## API 草案

```tsx
<CodeBlock lang="ts" code={code} streaming={false} />
<InlineCode>turn.ts</InlineCode>
```

實作走 streamdown + `@streamdown/code`:marked 分塊 memo(串流只重渲染變動 block)、remend 自癒未閉合 fence、shiki 雙主題(`github-light` / `github-dark`,跟 `.dark` class 切)。prototype 的 token 色只是示意。

## 行為(prototype 已示範)

- header:語言 label 小寫 mono faint;複製鈕點擊 → 寫入 clipboard、變「已複製 ✓」(accent)2 秒後還原。
- 本體:`text-code` 13/1.5 mono;`overflow-x: auto` 在 `pre` 上,頁面不橫向捲動;表格同理。
- streaming:尾端 1px cursor 閃爍(`steps(2)` 1s);fence 未閉合時仍渲染為完整 block(remend),不炸版。
- inline code:同 `text-code` 字級,muted 底 + 1px border,`padding 0 .3em`。
- cursor 動畫包 `prefers-reduced-motion: reduce`。

## a11y

- 複製鈕是有文字的 button,狀態變化以文字呈現(「已複製 ✓」),不只換 icon。
- cursor 是裝飾,`aria-hidden`。
- `pre` 可捲動區在鍵盤上可達(實作時 `tabindex=0` + `role="region"` + `aria-label` 帶語言)。

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/24-thread-ui.md(§3 Markdown 與程式碼)
- streamdown / @streamdown/code(分塊 memo、remend、shiki 雙主題):https://streamdown.ai
- Vercel AI Elements — CodeBlock(header + copy anatomy):https://ai-sdk.dev/elements/components/code-block
- assistant-ui — Markdown / CodeHeader:https://www.assistant-ui.com/docs/ui/Markdown
