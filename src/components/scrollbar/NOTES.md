# Scrollbar

全產品線的客製捲軸,隨 `@anyknown/ui/scrollbar.css` 全域套用(不是元件,是一份 CSS)。

## 設計

- thumb:`borderStrong` 圓角線,外圍 3px 透明邊距(`background-clip: padding-box`)讓它浮在內容旁;hover 轉 `textFaint`
- track / corner:透明;寬 10px(實際可見約 4px)
- 容器建議加 `scrollbar-gutter: stable` 防止內容因捲軸出現而跳動

## 實作

- Chromium / Safari:`::-webkit-scrollbar*` 偽元素
- Firefox:標準 `scrollbar-width: thin` + `scrollbar-color`,包在 `@supports not selector(::-webkit-scrollbar)` 分流(Chromium 121+ 若同時設標準屬性會停用 webkit 偽元素,所以兩者必須互斥)
- StyleX 做不了 scrollbar 偽元素,因此獨立成 css 檔;使用端 `import "@anyknown/ui/scrollbar.css"`(顏色引用 `--ak-*` 變數,需同時載入 tokens.css 或有 fallback 值——檔內已帶 fallback)

## References

- src/scrollbar.css(唯一真相)
- https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color
