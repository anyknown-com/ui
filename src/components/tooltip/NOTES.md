# Tooltip

純提示浮層:hover 與鍵盤 focus 延遲 400ms 顯示,反色小氣泡,只放一行文字(可附 Kbd 快捷鍵),絕不放互動內容。

## API 草案

```tsx
<Tooltip content="產生交接摘要" shortcut="⌘⇧H" side="top">
  <IconButton aria-label="開始換班">…</IconButton>
</Tooltip>
```

## 行為(prototype 已示範)

- 顯示:`:hover` 或 `:has(:focus-visible)`,`transition-delay: 400ms` 做開啟延遲;離開立即淡出(120ms)
- prototype 為純 CSS;四個 `side`(top/bottom/left/right)各自絕對定位 + 置中
- 氣泡反色(`--text` 底、`--bg` 字),不吃 shadow —— 與 popover 區分層級
- `pointer-events: none`:滑過氣泡不會卡住 hover
- reduced-motion:關 transition、也取消延遲

## a11y

- trigger `aria-describedby` 指向氣泡,氣泡 `role="tooltip"`
- focus-visible 也觸發(鍵盤使用者拿得到);不放連結/按鈕等互動內容,互動需求改用 popover
- 實作時補:Esc 立即關閉、touch 裝置不顯示(改 long-press 或直接省略)

## References

- https://base-ui.com/react/components/tooltip(headless 層;`Tooltip.Provider` 讓同群 tooltip 共享延遲、快速移動免重等)
- https://ui.shadcn.com/docs/components/base/tooltip
- https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
