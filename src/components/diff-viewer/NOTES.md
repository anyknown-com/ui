# DiffViewer

**已實作** — `DiffViewer.tsx`,測試 `DiffViewer.test.tsx`;playground 的 `#diff-viewer` 區可實際操作。

行級 unified diff + 行內字級 highlight。給 plan 審查 takeover(changeset 的 before/after)與 i18n 譯文修改對照用;prototype 的收合區段可實際展開/收合。

## 定案

- 行級增刪:`+` 綠 / `−` 紅,用 success/danger 的 **subtle 底**(不是飽和色),sign 與 stat 用對應 text 色
- 行內 highlight:同一行內只標變動的字(`<mark>`,比行底再深一階的 hl 色)
- mono 13px、雙欄行號(before/after 各一欄),行號 faint、不可選取
- 收合未變動區段:「⋯ N 行未變動」列,點開展開、再點收合;chevron 旋轉指示
- 檔案標題列:kind 色點(modified 黃 / added 綠 / deleted 紅,對應 plan 26 的 changeset kind)+ path(mono)+ `+N −N` 統計
- added = 只有 after(全 `+`);deleted = 只有 before(全 `−`)

## API

```tsx
<DiffViewer
  file={{ path: "locales/zh-TW.json", kind: "modified", before, after }}
  collapseContext={3}   // 保留的 context 行數,其餘收合;Infinity = 不收合
  wordDiff              // 行內字級 highlight(相鄰 del/add 行配對計算)
/>
```

`before/after` 都有 = modified;只有 `after` = added;只有 `before` = deleted(同 plan 26 §2 的推導)。

## 行為

- diff 計算:行級用 LCS(diff npm 套件 `diffLines`),相鄰的 del/add 配對後再跑 `diffChars`/`diffWordsWithSpace` 得行內 range;變動比例過高(>60%)就放棄行內 highlight,整行素色即可,避免碎 mark
- 收合:連續未變動行 > `collapseContext * 2` 才收合;展開動畫 fade + 3px 位移 160ms,`prefers-reduced-motion` 關閉
- 橫向捲動在 `.body` 上(`overflow-x:auto`),行號與 sign 欄不換行;不做 soft-wrap(精準 diff 以原始行為準)

## a11y

- 收合列是真 `<button>` + `aria-expanded`,鍵盤可操作
- 行號、`+`/`−` sign 設 `user-select:none`,複製 diff 內容時不夾雜;增刪語意不只靠色:sign 字符本身就是指示
- 實作時每行可加 `aria-hidden` 的行號欄 + visually-hidden 的「新增行/刪除行」前綴,或整個 diff 給 `role="region"` + `aria-label="<path> 的變更"`

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/26-memory-plan-display.md(§2 審查 takeover:changeset kind 推導、套用/丟棄流程;本元件即右欄 `unified-diff.tsx` 的 UI 規格)
- /Users/solemnis/Documents/anyknown-com/i18n/src/pages/editor.tsx(i18n 編輯情境;譯文修改對照走同一元件)
- https://www.npmjs.com/package/diff(`diffLines`/`diffChars`,行級 + 字級計算)
- https://primer.style/design/components/diff(GitHub diff 的行號、fold、word-highlight 慣例)
