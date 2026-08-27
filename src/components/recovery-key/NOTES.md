# RecoveryKey

**已實作** — `RecoveryKey.tsx`,測試 `RecoveryKey.test.tsx`;playground 的 `#recovery-key` 區可實際操作。

復原金鑰展示卡:建立 vault 或重發金鑰時顯示一次。分段 mono(4 字一組)、預設模糊遮罩(hover/focus/點擊才顯示)、一鍵複製(變 ✓)、下載 .txt、警告卡、「我已抄下」checkbox gate 住主要按鈕。prototype 全部可操作。

## API 草案

```tsx
<RecoveryKey
  value="K7PQ-WM2X-9RDF-…"
  ack onAckChange          // caller 用 ack gate 自己的主要按鈕
  masked                   // 預設 true;顯示狀態內部管理
  filename="anyknown-storage-recovery-key.txt"
/>
```

## 行為

- 金鑰以 `-` 分組渲染成 4 字一段的 mono 群組,`user-select: all` 一點全選
- 遮罩:CSS blur,hover / :focus-visible / 點擊(toggle)解除;移開即恢復,避免留在螢幕上
- 複製:寫入完整含 `-` 的字串;成功後按鈕變「✓ 已複製」accent 2 秒後還原;失敗顯示 toast(正式版)
- 下載:Blob + a[download],檔名固定;正式版另有列印(見 storage 現有實作)
- checkbox 未勾時「繼續」disabled;金鑰只顯示一次的語意由 caller 的流程負責

## a11y

- 遮罩區 `role="button"` + `tabindex=0`,Enter/Space 可 toggle,`aria-label` 說明會顯示金鑰
- 警告卡 `role="note"`;複製結果正式版用 `aria-live` 或 toast 播報
- checkbox 用原生 input + label 包裹,點文字即可勾
- reduced-motion 關閉 blur transition

## References

- storage/src/components/recovery-key.tsx(現有:Copy/Download/Print、警告卡、ack checkbox 由 caller gate;無遮罩與分段 — 本設計新增)
- https://developer.1password.com/docs/secret-key(分段 mono 金鑰展示慣例)
- https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
