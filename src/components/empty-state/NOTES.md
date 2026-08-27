# EmptyState

**已實作** — `EmptyState.tsx`,測試 `EmptyState.test.tsx`;playground 的 `#empty-state` 區可實際操作。

空狀態 = 行動邀請:icon + 一句說明 + 主要動作,文案永遠說「下一步做什麼」,不只陳述「沒有東西」。

## API 草案

```tsx
<EmptyState
  icon={<MemoryIcon />}
  title="還沒有記憶"
  description="開始第一個 thread,重要的事會自動留下來,換班時帶得走。"
  action={<Button>開始第一個 thread</Button>}
/>
```

## 行為 / 文案原則

- 三種場合、三種動作強度:首次空(solid 主按鈕,邀請開始)、搜尋無果(ghost「清除篩選」,description 回顯查詢字)、時間區間空(ghost 導向最近有內容處)
- description 一句話收尾在下一步,不解釋系統機制;標題用 Newsreader 與頁面標題同語氣
- 容器 dashed border 區分「這裡本來會有內容」;icon 放 accent-subtle 圓底,不放插畫

## a11y

- icon 純裝飾 `aria-hidden`;標題用真實 heading(層級由使用端傳入,預設 h3)
- 搜尋無果時若動態出現,外層列表容器用 `aria-live=polite` 報一次結果數,空狀態本身不再重複
- 動作是真按鈕/連結,可 Tab 到;沒有動作可做的空狀態(唯讀檢視)允許省略 action

## 實作建議

原生元素 + StyleX,不需 primitive;icon/title/description/action 四個 slot 即可,不做 variant prop。

## References

- https://ui.shadcn.com/docs/components/base/empty
- https://www.nngroup.com/articles/empty-state-interface-design/
