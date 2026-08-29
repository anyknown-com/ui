# Handoff Receipt

**已實作** — `HandoffReceipt.tsx`,測試 `HandoffReceipt.test.tsx`;playground 的 `#handoff-receipt` 區可實際操作。

rotation 分隔線:thread 過去區裡一條安靜的細列「換班完成 · 時間 · ctx 50% → 新 session」,可展開看交接摘要。用戶不管理 session,這是他唯一看見換班的地方。

## 需求(定案)

- collapsed 為預設:一列 = 循環 icon + 時間 + ctx 用量 + reason(soft-threshold 不特別標;hard-limit 標「硬上限」)+ chevron,左右虛線把它嵌進時間軸
- 展開(同列 toggle,不開 dialog):三項核對——記憶(flush 落盤幾筆)/ 摘要(handoff 已交給下一輪、讀後銷毀)/ Ledger(本輪收據數、不進新 context)——加一段 handoff 交接文字
- 是收據不是控制:不可改、無任何動作按鈕

## API 草案

```tsx
<HandoffReceipt at={ts} ctxPercent={50} reason="soft-threshold" // | "hard-limit" | "state-transition"
  memory={{ count: 3, items: string[] }}
  ledgerCount={42}
  handoffSummary="landing 定價區塊寫到…" 
  defaultOpen={false} />
```

## 行為

- 資料來源 = `session.rotated` 事件(fromSessionID/toSessionID/reason)fold 進過去區,無元件自行 fetch
- 展開狀態純 local UI state;body 進場 fade+slide 160ms
- handoff 本體只活到下一輪,receipt 顯示的是它的摘要快照(存在 ledger)

## A11y

- 整列是一顆 `<button aria-expanded>`,Enter/Space 展開;focus-visible 內縮 outline
- 動畫與 chevron 旋轉包 `prefers-reduced-motion: reduce`(直接關閉)
- 收據列字級小、灰字,但對比維持在 muted token(4.5:1 目標)

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/17-session-rotation.md(三載體、50% trigger、reason 三態、分隔線可展開 handoff)
- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/22-workspace-shell.md(過去區收據不可改、rotation 分隔線)

## 卡面織體(prototype 先行,2026-08-29)

- 卡面改為 secondary 淺色布(seed 10075 紗線堆疊;light 米白、dark 深炭),
  無 background、實心由紗織成;border/圓角保留,CSS overflow 裁形
- 動態是 guide「僅展示面」子集:hover 帶動(§4.2 參數照抄)+ 光澤帶跟指尖,
  亮度上限 0.5(secondary 調低);無窩、無掃光;靜止時 rAF 停止
- 大面積依 guide 降密度:面紗 pitch 2.0、亮紗 6 根;展開變高 → ResizeObserver 重織
- 待驗收重點:文字底下的織紋會不會太搶(尤其 dark);timeline 大量實例的效能
  (落地時要共享 ticker / 首次 hover 才建動態)

## 展開動態修正(2026-08-29 後續)

- 頁面左移 bug:展開讓頁面長高 → scrollbar 出現 → 置中內容左移;
  修 `html{scrollbar-gutter:stable}`(落地時 app 全域也要這條)
- 展開/收合改平滑:grid-template-rows 0fr→1fr,240ms cubic-bezier(.16,1,.3,1),
  雙向;內容 opacity 200ms 跟進(原本 display:none 硬切 + 單向 fade 被打回「死板」)
- 織紋恆定(否決「展開後重織」:換一塊布會不一致且閃):布只織一次 —
  固定高度 480px 的長布,卡片 overflow 裁形;展開只是露出同一塊布更多,
  高度變化零重織;只有寬度變了才重織(debounce 120ms)。
  效能:每幀只更新可視高度內的紗

## 落地(2026-08-29)

- `HandoffReceipt.tsx` 已照上面搬:SilkBody hover 模式、yarnSecondary、fixedHeight 480、
  bandMax 0.5、pitch 2、亮紗 12 根鋪到 0.95h;ref callback + cleanup 管生命週期
- 收合狀態不能再用 `hidden`(會沒得動畫),改 `inert` —— 一樣離開 a11y tree 與 tab 序,
  但留在版面上讓 0fr→1fr 跑得動;測試改驗 inert
- 卡片的 row 原本寫 `all: unset`,StyleX 0.19 會靜默丟掉它,原生按鈕的 buttonface 底色
  與 outset 邊框整條蓋在布上面;改成 appearance / backgroundColor / borderWidth 逐項重設
- `html{scrollbar-gutter:stable}` 已進 `src/tokens.css`,吃 tokens.css 的 app 自動有
