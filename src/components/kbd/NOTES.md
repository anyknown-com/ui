# Kbd

**已實作** — `Kbd.tsx`,測試 `Kbd.test.tsx`;playground 的 `#kbd` 區可實際操作。

快捷鍵標示:surface 底 + border + 1px 下緣陰影做出按鍵感,Geist Mono,單鍵/組合/序列三種排法。

## API 草案

```tsx
<Kbd>⌘</Kbd>
<KbdGroup keys={["⌘", "⇧", "P"]} />
<KbdGroup keys={["g", "t"]} separator="然後" />
```

## 行為

- 純展示元件,無互動;每顆鍵一個 `<kbd>`,組合鍵是多顆並排(gap .2rem),不用 + 號串接
- 序列用文字分隔(「然後」),與組合鍵視覺區分
- 深色 tooltip/menu 內使用時切 inverted 樣式:半透明底、去陰影(context 由父層 class 決定,不加 prop)

## a11y

- `<kbd>` 語意元素;符號鍵(⌘⇧)螢幕報讀器唸法不一,關鍵操作說明處建議併寫文字(如「Cmd+Shift+H」於 aria-label 或說明文)
- 顏色對比:kbd 文字用 muted,在 surface 上需 ≥ 4.5:1(現值符合)

## 實作建議

原生 `<kbd>` + StyleX,不需 primitive。快捷鍵符號依平台切換(mac ⌘ / win Ctrl)屬上層 hook 責任,Kbd 只管渲染。

## References

- https://ui.shadcn.com/docs/components/base/kbd
- https://developer.mozilla.org/docs/Web/HTML/Element/kbd
