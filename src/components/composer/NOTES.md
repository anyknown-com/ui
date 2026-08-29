# Composer

**已實作** — `Composer.tsx`,測試 `Composer.test.tsx`;playground 的 `#composer` 區可實際操作。

釘在現在線上的 prompt bar:說話發生在現在——送出後上方多一條收據、下方未來區當場重排。永遠可用,不被 pending 卡阻塞。

## 定案

- 多行 textarea 自動長高(max-height 後內捲);⏎ 送出、⇧⏎ 換行
- 左側:@ 來源鈕(插入 `@` 並開建議浮層)、/ 指令鈕
- 右側:model picker(小 select)、麥克風鈕(接 call/voice)、送出鈕(空值 disabled)
- 打 `@` 時浮層列出來源建議:檔案 / ledger 收據 / 記憶,各帶種類標;點選補全
- focus 時整條 border 轉 accent(`:focus-within`)

## API

```tsx
<Composer
  onSubmit={(text: string, refs: SourceRef[]) => void}
  sources={(query: string) => Promise<SourceRef[]>} // @ 建議
  commands={SlashCommand[]}                          // / 建議(同一浮層機制)
  model={modelId} onModelChange
  onMicToggle={() => void}                           // 交給 voice-indicator / call
  disabled={false}                                   // 永不為 true:composer 不阻塞
/>
```

## 行為

- @ 偵測:游標前最後一個 token 以 `@` 開頭即開浮層(prototype 為靜態建議;實作時 query 打 server 的檢索 route)
- 浮層由下往上開(bar 在畫面底),`scale 1 .97 → 1` + fade 140ms,reduced-motion 關閉
- 送出走 message route;`agenda.updated` 事件驅動未來區重排動效,composer 本身不管
- / 指令與 @ 共用同一浮層元件,只換資料源

## a11y

- textarea 帶 `aria-label`;@ 鈕 `aria-expanded` 對應浮層;Esc 關浮層
- 浮層是 `role="listbox"` + 方向鍵導航;有 `sources`/`commands` 時 textarea 本身升為 `role="combobox"`(`aria-expanded`/`aria-autocomplete="list"`/`aria-activedescendant`),否則浮層開了 SR 不會知道。沒給建議來源時維持單純 textbox。
- 所有 icon 鈕有 `aria-label` 與 focus-visible ring;送出 disabled 用原生 `disabled`

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/22-workspace-shell.md(composer 釘在現在線、送出後收據 + 未來重排、永不阻塞)
- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/25-interaction-cards.md(pending 不阻塞 composer)
- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/23-call.md(麥克風鈕接語音 pipeline)
- https://www.beautifului.dev/ 的 Prompt Bar 概念(左工具、右 model+送出的排布)
