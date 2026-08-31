# popup 疊層低於 dialog：Select/Dropdown/Popover 在 Dialog 裡打不開

## 現象與重現

product（app.anyknown.com）Runs 頁的「New run」對話框：Provider 下拉點開後畫面上什麼都沒有。選項其實有渲染（accessibility tree 看得到、鍵盤也能操作），只是被 dialog 蓋住 —— 對 mouse 使用者等於壞掉。light/dark 都一樣。

本 repo 重現：playground 或任何 app，把 `Select`（或 `DropdownMenu` / `Popover`）放進 `DialogContent` 再打開。

## 原因

疊層值各寫各的，popup 層低於 dialog 層：

| 層 | 值 | 位置 |
| --- | --- | --- |
| popup positioner（select / dropdown / popover / composer 共用） | 40 | `src/lib/popup.ts` `popupStyles.positioner` |
| tooltip positioner | 60 | `src/components/tooltip/Tooltip.tsx` |
| dialog backdrop | 70 | `src/components/dialog/Dialog.tsx` |
| dialog viewport | 71 | `src/components/dialog/Dialog.tsx` |
| toast | 80 | `src/components/toast/Toast.tsx` |

Base UI 的 popup 都 portal 到 body，所以 popup 跟 dialog 同在 body 層比 z-index；40 < 71，dialog 裡打開的浮層永遠在下面。tooltip 60 也一樣：dialog 內元素的 tooltip 會被蓋住。

## 修法

1. `src/lib/popup.ts` 加一個集中疊層表並 export，其他元件引用、不再各寫 magic number：
   - dialogBackdrop 70、dialog 71、popup 75、tooltip 78、toast 80
   - 語意：popup 要壓過 dialog（浮層本來就是當下互動的最上層）；tooltip 壓過 popup（popup 內元素也能有 tooltip）；toast 永遠最上（非阻斷通知不能被 modal 蓋掉）。
   - popup 40 → 75 對非 dialog 情境無影響：popup 是 portal 到 body 的暫態層，modal 打開時 Base UI 會關掉外面的 popup，不存在「頁面上的 popup 意外壓過後來的 dialog」。
2. `popupStyles.positioner` 用新值；`Tooltip.tsx`、`Dialog.tsx`、`Toast.tsx` 改引用同一張表。`Composer.tsx` 也用 `popupStyles`，順帶被修正，確認它自己的 `zIndex: 10`（內部元素）不受影響。
3. 測試：`select/Select.test.tsx` 加一個「Select 在 Dialog 內打開，positioner z-index 大於 dialog viewport」的 case（jsdom 讀 computed style 或直接斷言 class 對應的 style；做不到就退而斷言兩處引用同一組常數且 popup > dialog）。
4. 動之前先讀 `src/components/COMPONENTS.md` 的 dialog / popover / tooltip 節（repo 規矩）；改完更新 popover 那節，寫下疊層表與理由。
5. verify：`pnpm check && pnpm test`；`pnpm playground` 開 dialog+select 組合實際點一次；發佈前 `pnpm verify:pack`。

## 發佈與下游

- patch release（`@anyknown/ui` 現版 0.4.x 線）。
- 發佈後 product repo `pnpm up @anyknown/ui` 帶到新版，回 Runs 的「New run」實測下拉可見（發現此 bug 的地方，2026-08-31 product phase-06 走查記錄）。
