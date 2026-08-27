# Components 規劃

已實作:`Button.tsx`、`Card.tsx`、`Text.tsx`(flat 檔案,實作新元件時一併搬進各自 folder)。

規劃中的元件(33 個 folder),每個 folder 含:

- `prototype.html` — 用 Ledger token 直接渲染的視覺/行為規格,瀏覽器直接開,行為性元件可實際操作
- `NOTES.md` — API 草案、行為細節、a11y、參考來源

分批清單與依據見 [ROADMAP.md](./ROADMAP.md):

- 表單:`input` `textarea` `label` `checkbox` `radio` `switch` `select` `dropdown`
- 基礎:`dialog` `toast` `tooltip` `popover` `tabs` `badge` `kbd` `skeleton` `progress` `empty-state` `scrollbar`
- Desktop AI-native:`message` `tool-card` `reasoning-fold` `action-bar` `code-block` `interaction-card` `handoff-receipt` `composer` `voice-indicator`
- Storage / 資料:`password-input` `recovery-key` `dropzone` `file-row` `diff-viewer` `data-table`

## 共同決策(實作 session 請沿用)

1. **Headless 層用 Base UI**(`@base-ui-components/react`),StyleX 上皮。理由:combobox(filter/multi/grouping)與 menu(巢狀 submenu、safe polygon)只有 Base UI 有完整 primitive;shadcn 新版同路線。簡單控件(input/textarea/checkbox/radio/switch/label)用原生元素即可,不必套 primitive。
2. 所有顏色/間距/圓角/動效引用 `tokens.stylex.ts`,不寫死值。
3. 動效:進場 140ms scale+fade、控件過渡 `motion.fast`;一律包 `prefers-reduced-motion`。
4. focus ring 統一:`focus-visible` 2px `color.focusRing`,offset 2(嵌在框內的用 -1)。
5. 表單錯誤:控件設 `aria-invalid` + `aria-describedby`,訊息由 Field 層渲染。
