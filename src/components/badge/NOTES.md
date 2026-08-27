# Badge / Chip

**已實作** — `Badge.tsx`,測試 `Badge.test.tsx`;playground 的 `#badge` 區可實際操作。

小型狀態與計數標示:badge 是唯讀語意標籤,chip 是可互動(可移除)的篩選單位,同一家族收斂。

## API 草案

```tsx
<Badge variant="accent">進行中</Badge>
<Badge variant="neutral" dot="accent">Fable 在線</Badge>
<Badge variant="accent" count={3}>等你</Badge>
<Badge variant="mono">128k · 42%</Badge>
<Chip onRemove={fn}>工作區:anyknown</Chip>
```

## 行為

- 純 badge 無互動,`<span>` 即可;removable chip 的 × 是真正的 `<button>`,不是整顆 chip 可點
- count 與 mono 內容用 Geist Mono,數字不跳動
- variant:`neutral`(預設)/ `accent` / `success`(實心)/ `danger` / `outline` / `mono`

## a11y

- × 按鈕帶完整 `aria-label`(「移除篩選:工作區 anyknown」),不是只有「移除」
- dot 為純裝飾(`aria-hidden` 或空 span),狀態語意必須同時出現在文字裡
- 不用 badge 傳達唯一資訊來源的顏色語意(色盲不可辨),文案先行

## 實作建議

原生元素即可,不需 primitive。顏色對照 `tokens.stylex.ts` 的 semantic 色;`danger-subtle` 若 tokens 尚無需補一個。

## References

- https://ui.shadcn.com/docs/components/base/badge
- https://ui.shadcn.com/docs/components/base/input-group(chips 併排時的間距參考)
