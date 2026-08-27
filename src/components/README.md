# Components 規劃

**狀態:34 個元件全部已實作。** 每個 folder 現在含 `<Name>.tsx`(StyleX 實作)、`<Name>.test.tsx`(vitest + testing-library)、原本的 `prototype.html` 與 `NOTES.md`。`Button` / `Card` / `Text` 已搬進 `button/` `card/` `text/`。`scrollbar` 沒有元件檔,它就是 `src/scrollbar.css`。

`playground/`(不進發佈產物)import **打包後的 `dist/`** 渲染全部元件,section id 與 `prototypes.html` 一致,可以左右對照:

```bash
pnpm playground   # http://localhost:5199
```

每個 folder 原本含:

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

## 已知的對比問題(待設計決策,實作未自行更動 palette)

a11y review 量測 `tokens.css` 兩個主題後發現三處低於 WCAG 門檻。因為 `prototype.html` 是視覺的唯一真相,實作沒有擅自改 token 值,改動與否請設計決定:

| Token 組合 | 實測 | 門檻 | 出現處 |
| --- | --- | --- | --- |
| `textFaint` on `surface` | 2.97:1(light)/ 3.16:1(dark) | 4.5:1(小字) | input placeholder、select 群組標題與 hint、dropdown 快捷鍵、label 的「選填」 |
| `borderStrong` on `surface` | 1.76:1(light) | 3:1(UI 邊界) | checkbox / radio 未勾邊框、switch 關閉時的軌道 |
| checkbox / radio 命中區 | 16.8px;switch 高 22.4px | 24px | 只在省略 `label` 時會踩到(有 label 時整條 label 是命中區) |
| `accent` on `accentSubtle`(dark) | 4.18:1 | 4.5:1 | Badge `variant="accent"` |
| `danger` on `dangerSubtle`(dark) | 4.48:1 | 4.5:1 | Badge `variant="danger"` |
| weave 第 3–5 條纖維 | 3.10 / 2.35 / 1.82:1 | 3:1(圖形) | `Progress` 的深度層次;讀數由最前面那條線與 `aria-valuetext` 承載 |
| tidy 織布線 | 1.78:1 | 3:1(圖形) | `Progress`(indeterminate);布是裝飾,階段名是文字 |
| scrollbar thumb 可見寬 | 4px(10px 減 3px 透明邊距) | — | scrollbar/NOTES 明訂的設計,只是很細 |
| `successHl` on `successSubtle` / `dangerHl` on `dangerSubtle` | 1.21–1.32:1 | 3:1(圖形) | diff-viewer 行內字級 highlight —— 「哪幾個字變了」目前只靠這層底色 |
| `textFaint` on `successSubtle` / `dangerSubtle` | 2.44–2.71:1 | — | diff-viewer 的行號(`aria-hidden`,只影響低視力的視覺使用者) |
| dropzone 取消鈕 22.4px / file-row checkbox 16px / data-table checkbox 13.6px | — | 24px | 這三個沒有 label 包住可以放大命中區 |

`textFaint`、`borderStrong`、`*Hl` 三組都是 palette 決定,實作沒有擅自改;要動的話一次調 `tokens.stylex.ts` 與 `tokens.css` 兩邊。

建議修法(擇一):把帶語意的 faint 文字改用 `textMuted`(已達 4.5:1),或把 `textFaint` / `borderStrong` 各壓深一階。

## Field 的使用範圍

`Field` 擁有它那顆控件的 `id`(控件自己傳的 `id` 在 Field 內會被忽略),所以一個 `Field` 只放一顆控件。`Checkbox` / `Radio` / `Switch` 自帶 label,放進 `Field` 時只給 `help` / `error` / `disabled`,不要再給 `label`。
