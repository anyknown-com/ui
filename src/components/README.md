# Components

34 個元件,全部已實作。每個 folder 含:

- `<Name>.tsx` — StyleX 實作
- `<Name>.test.tsx` — vitest + testing-library

視覺的真相是**實作本身**:`pnpm playground` 或 <https://ui.anyknown.com> 直接操作。
決定與理由集中在 [COMPONENTS.md](./COMPONENTS.md)。

`scrollbar` 沒有元件檔,它就是 `src/scrollbar.css`。

```bash
pnpm playground   # http://localhost:5199,用打包後的 dist 渲染全部元件
```

playground 與文檔站用同一組 section id。

## 清單

- **表單** — `input` `textarea` `label` `checkbox` `radio` `switch` `select` `dropdown`
- **基礎** — `button` `dialog` `toast` `tooltip` `popover` `tabs` `badge` `kbd` `skeleton` `progress` `empty-state` `scrollbar`
- **Desktop AI-native** — `message` `tool-card` `reasoning-fold` `action-bar` `code-block` `interaction-card` `handoff-receipt` `composer` `voice-indicator`
- **Storage / 資料** — `password-input` `recovery-key` `dropzone` `file-row` `diff-viewer` `data-table`

## 其他文件

- [COMPONENTS.md](./COMPONENTS.md) — 34 個元件的定案理由、走過的彎路、踩過的坑。
  改任何一個元件之前先讀它那一節,免得把已經被否決的路再走一次
- [TEXTURE-GUIDE.md](./TEXTURE-GUIDE.md) — 織物設計語言的完整規格與適配指引。
  **適配新元件前必讀**,參數照抄不要重 tune
- [A11Y-DEBT.md](./A11Y-DEBT.md) — 已知的對比與命中區偏差,等設計決策

## 共同決策

1. **Headless 層用 Base UI**(`@base-ui/react`),StyleX 上皮。理由:combobox
   (filter/multi/grouping)與 menu(巢狀 submenu、safe polygon)只有 Base UI 有完整
   primitive。簡單控件(input/textarea/checkbox/radio/switch/label)用原生元素即可,
   不必套 primitive
2. 所有顏色/間距/圓角/動效引用 `tokens.stylex.ts`,不寫死值
3. **動畫不回彈**:滑動類 240ms `cubic-bezier(.16,1,.3,1)`,進度類 120ms linear;
   任何邊不得倒退或過衝。唯一的例外是 button 放開時的回彈微鼓,那是織體的語意
4. **禁用 `useEffect`**:用 ref callback + cleanup(React 19)。量尺寸一律
   ref callback + `ResizeObserver`
5. 一律包 `prefers-reduced-motion`
6. focus ring 統一:`focus-visible` 2px `color.focusRing`,offset 2(嵌在框內的用 -1)
7. 表單錯誤:控件設 `aria-invalid` + `aria-describedby`,訊息由 Field 層渲染
8. **StyleX 0.19 會靜默丟掉簡寫**(`all: unset`、`border: 0`、`background: none`)—— 
   編不出任何 CSS,原生控件的 UA 外觀會留在畫面上。用 `lib/styled.ts` 的
   `reset.control`,放在 `stylex.props` 的第一個參數
9. **尺寸類元件自己寫 `boxSizing: border-box`**,不要靠 app 端有沒有 reset
10. **佈局交給使用端:`sx`**。元件負責自己長什麼樣,不負責它在頁面上的位置與尺寸。
    需要外部調整的元件收一個 `sx?: StyleArg`,接在自己的樣式後面(`styled(props, ...own, sx)`)。
    不要靠 caller 傳 `className` —— StyleX 是 atomic class,字串接在後面不保證勝出,
    要覆蓋就得在同一次 `stylex.props` 裡排在後面
11. **theme 要整組套**。`themes.stylex.ts` 的 `light` / `dark` 是一組 theme(color +
    五組 yarn + shadow),用 `stylex.props(...light)` 展開。只套其中一個 var group 會讓
    布停在另一個主題 —— 深色布配深色字,secondary / ghost 的標籤整個看不見。
    那個檔由 `pnpm gen:themes` 從 tokens 生成,不要手改

## Field 的使用範圍

`Field` 擁有它那顆控件的 `id`(控件自己傳的 `id` 在 Field 內會被忽略),所以一個
`Field` 只放一顆控件。`Checkbox` / `Radio` / `Switch` 自帶 label,放進 `Field` 時只給
`help` / `error` / `disabled`,不要再給 `label`。

## 引擎橋接

`@anyknown/ui` 輸出兩種形式:

1. `tokens.stylex.ts` — StyleX 使用端(desktop / accounts / storage / i18n)
2. `tokens.css` — 純 CSS variables(同一組 Ledger 值),給非 StyleX 的使用端。desktop
   自己是純 StyleX,只有 streamdown 那個第三方 markdown 元件 ship 了 Tailwind utility
   class,它的 `@theme inline` 引用這些 `--ak-*`

Token 值以 `tokens.stylex.ts` 為唯一真相,`tokens.css` 由它同步(先手動,之後可加
codegen)。另有 `scrollbar.css`(客製捲軸,全域套用)。
