# DataTable

**已實作** — `DataTable.tsx`,測試 `DataTable.test.tsx`;playground 的 `#data-table` 區可實際操作。

排序、過濾、選取、inline edit 的資料表。第一個消費者是 i18n 字典編輯(key / zh-TW / en / 狀態);prototype 全部互動可實際操作。

## 定案

- 欄頭點擊排序:asc → desc 切換,`aria-sort` + accent 箭頭指示;一次只排一欄
- 頂部 filter 輸入框:即時過濾(key 與各 locale 譯文都比對),右側 `N / M keys` 計數(mono、`aria-live`)
- inline edit:雙擊 cell → 變輸入框,Enter 確認、Esc 取消、blur 視同確認;空值顯示 faint 的 `—`
- 選取列:checkbox 欄,header checkbox 全選/半選(indeterminate),選取列 `accent-subtle` 底
- 列 hover:`bg` 底(比 surface 深一階)
- sticky header:容器 `max-height` 捲動,thead `position:sticky` + `inset box-shadow` 當底線(border-collapse 下 border 不會跟著 sticky)
- 空結果:置中訊息帶查詢字 + 「清除過濾」動作
- 狀態 badge:已翻譯(accent-subtle)/ 缺譯(danger-subtle)/ 待審(warning-subtle)

## API

```tsx
<DataTable
  rows={items}
  rowKey={(r) => r.key}
  filter={q}
  sort={sort} onSortChange={setSort}          // { col, dir } | null
  selected={sel} onSelectedChange={setSel}    // Set<rowKey>
  columns={[
    { id: "key", header: "key", mono: true, sortable: true },
    { id: "zh", header: "zh-TW", sortable: true, editable: true, onCommit },
    { id: "en", header: "en", sortable: true, editable: true, onCommit },
    { id: "status", header: "狀態", sortable: true, cell: (r) => <StatusBadge s={r.status} /> },
  ]}
  emptyState={(q) => <>找不到符合「{q}」的 key。</>}
/>
```

排序/過濾/選取全部 controlled;元件不擁有資料。

## 實作

- **實作沒有用 TanStack Table**:API 草案把排序/過濾/選取全部設成 controlled,元件不擁有資料,headless 層就沒有狀態可管了 —— 只會多一個 runtime 依賴換不到東西。排序/過濾由使用端算好再傳 `rows`,元件只負責 `aria-sort`、`indeterminate`、inline edit 與 sticky header。將來若要把排序邏輯收進元件,再引 TanStack 不遲。虛擬化的判斷維持原案:DataTable 保持真 table,列數大到要虛擬化的場景交給 grid 型元件
- inline edit 的 commit 走 optimistic:先改 UI,失敗 revert + toast(i18n `cell.tsx` 現行模式)

## a11y

- 真 `<table>` + `<thead>/<tbody>`,表格 `aria-label`
- 排序:`<th aria-sort="ascending|descending">`,只放在目前排序欄;箭頭 `aria-hidden`,排序控制是 th 內的真 `<button>`
- checkbox 各自 `aria-label`(「選取 nav.projects」);全選用原生 `indeterminate`
- 過濾計數 `aria-live="polite"`,結果數變化會播報
- inline edit 的 input 給 `aria-label`(含 key 與 locale);Esc 取消不寫入
- 之後補:雙擊之外的鍵盤進入編輯(focus cell 後按 Enter/F2),prototype 未做

## References

- /Users/solemnis/Documents/anyknown-com/i18n/src/pages/editor.tsx(消費情境:字典編輯頁)
- /Users/solemnis/Documents/anyknown-com/i18n/src/components/editor/grid.tsx(現行 ARIA grid + virtualizer 實作;DataTable 是它的非虛擬化、真 table 版)
- https://tanstack.com/table/latest(headless sorting/filtering/selection)
- https://www.w3.org/WAI/ARIA/apg/patterns/table/(table pattern 與 aria-sort)
