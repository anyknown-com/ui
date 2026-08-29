# Handoff Receipt

**已實作** — `HandoffReceipt.tsx`,測試 `HandoffReceipt.test.tsx`;playground 的 `#handoff-receipt` 區可實際操作。

rotation 分隔線:thread 過去區裡一條安靜的細列「換班完成 · 時間 · ctx 50% → 新 session」,可展開看交接摘要。用戶不管理 session,這是他唯一看見換班的地方。

## 定案

- collapsed 為預設:一列 = 循環 icon + 時間 + ctx 用量 + reason(soft-threshold 不特別標;hard-limit 標「硬上限」)+ chevron,左右虛線把它嵌進時間軸
- 展開(同列 toggle,不開 dialog):三項核對——記憶(flush 落盤幾筆)/ 摘要(handoff 已交給下一輪、讀後銷毀)/ Ledger(本輪收據數、不進新 context)——加一段 handoff 交接文字
- 是收據不是控制:不可改、無任何動作按鈕

## API

```tsx
<HandoffReceipt at={ts} ctxPercent={50} reason="soft-threshold" // | "hard-limit" | "state-transition"
  memory={{ count: 3, items: string[] }}
  ledgerCount={42}
  handoffSummary="landing 定價區塊寫到…"
  defaultOpen={false} />
```

## 行為

- 資料來源 = `session.rotated` 事件(fromSessionID/toSessionID/reason)fold 進過去區,無元件自行 fetch
- 展開狀態純 local UI state;handoff 本體只活到下一輪,receipt 顯示的是它的摘要快照(存在 ledger)
- 展開 / 收合:`grid-template-rows` 0fr → 1fr,240ms `cubic-bezier(.16,1,.3,1)`,
  雙向;內容 opacity 200ms 跟進
- 收合狀態用 `inert` 而不是 `hidden` —— 一樣離開 a11y tree 與 tab 序,但留在版面上
  讓 0fr→1fr 跑得動

## 卡面織體

卡面是一塊 secondary 淺色布(seed 10075 紗線堆疊;light 米白、dark 深炭),沒有
background、實心由紗織成;border 與圓角保留,CSS `overflow` 裁形。

- 動態只取 TEXTURE-GUIDE 的「僅展示面」子集:hover 帶動(§4.2 參數照抄)+ 光澤帶
  跟指尖,亮度上限 0.5(secondary 調低);**無窩、無掃光**;靜止時 rAF 停止
- 大面積依 guide 降密度:面紗 pitch 2.0、亮紗 12 根鋪到 0.95h
- **布只織一次**:固定高度 480px 的長布,卡片 `overflow` 裁形。展開只是露出同一塊布
  更多,高度變化零重織;只有寬度變了才重織(debounce 120ms)
- 生命週期走 ref callback + cleanup,不用 effect

## a11y

- 整列是一顆 `<button aria-expanded>`,Enter/Space 展開;focus-visible 內縮 outline
- 動畫與 chevron 旋轉包 `prefers-reduced-motion: reduce`(直接關閉)
- 收合列字級小、灰字,對比 4.94:1(`textMuted` 落在 `yarnSecondary` 最深的一階)

## 走過的彎路

- 展開後重織一塊新的布 —— 換一塊布會不一致而且會閃。改成「織一次、裁形」
- `display: none` 硬切 + 單向 fade 被打回「死板」,才改成 grid-rows 雙向動畫
- 展開讓頁面長高 → scrollbar 出現 → 置中內容左移。修法是
  `html { scrollbar-gutter: stable }`,已進 `src/tokens.css`,吃 tokens.css 的 app 自動有
- row 原本寫 `all: unset`,StyleX 0.19 會靜默丟掉它,原生按鈕的 buttonface 底色與
  outset 邊框整條蓋在布上面;改用 `lib/styled.ts` 的 `reset.control`

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/17-session-rotation.md(三載體、50% trigger、reason 三態、分隔線可展開 handoff)
- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/22-workspace-shell.md(過去區收據不可改、rotation 分隔線)
