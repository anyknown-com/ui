# Components Roadmap

四層,依複用度與產品時程排序。每個元件 folder 含 `prototype.html`(Ledger token 直接渲染,瀏覽器直接開)+ `NOTES.md`(API 草案/行為/a11y/references)。

## 第一批:表單控件(已規劃)

input · textarea · label · checkbox · radio · switch · select · dropdown

## 第二批:跨產品基礎件(desktop / storage / i18n / accounts 都在重複做)

| Folder | 內容 | 現況痛點 |
| --- | --- | --- |
| `dialog/` | Dialog + ConfirmDialog | i18n、storage 各有一套 dialogs/ |
| `toast/` | 通知 | storage 用 sonner,收斂視覺 |
| `tooltip/` | 提示 | — |
| `popover/` | 浮層定位基礎 | select/dropdown 的底層,抽出共用 |
| `tabs/` | 分頁 | — |
| `badge/` | Badge / Chip 家族 | 「等你 · N」、tool chips、記憶 chip |
| `kbd/` | 快捷鍵標示 | desktop 快捷鍵文化(⌘N、⌘↑↓) |
| `skeleton/` | 載入骨架 | — |
| `progress/` | Spinner + 進度條 | storage 上傳、desktop 載入 |
| `empty-state/` | 空狀態 | 「空畫面是行動邀請」規格化 |
| `scrollbar/` | 客製捲軸(全域 CSS) | 細圓安靜 thumb,`@anyknown/ui/scrollbar.css` |

## 第三批:Desktop AI-native 件(對外核心體驗;來源:a/docs/plans/desktop/)

| Folder | 內容 | 依據 |
| --- | --- | --- |
| `message/` | 訊息正文節奏(user 氣泡 / assistant 全寬、串流中) | plan 24 |
| `tool-card/` | 工具卡 + 委派卡變體(摺疊、retry 可見化) | plan 24、28 |
| `reasoning-fold/` | 思考摺疊 | plan 24 |
| `action-bar/` | hover 動作列(複製/重新生成,防跳動) | plan 24 |
| `code-block/` | code block(copy、串流中) | plan 24 |
| `interaction-card/` | Permission 卡 + Decision 卡(block DSL) | plan 25 |
| `handoff-receipt/` | 換班回條 | plan 17 |
| `composer/` | Prompt bar(@sources、/commands、model picker、聽寫) | plan 22、23 |
| `voice-indicator/` | 語音狀態(聆聽/說話/音量) | plan 23 |

## 第四批:Storage 對外件 + 資料件

| Folder | 內容 | 依據 |
| --- | --- | --- |
| `password-input/` | 密碼/passphrase 欄(強度、顯示切換) | storage passphrase-field |
| `recovery-key/` | 復原金鑰展示(分段、複製、確認) | storage recovery-key |
| `dropzone/` | 拖放上傳 + 進度 | storage files |
| `file-row/` | 檔案列(視覺件;virtualize 留在 app) | storage files |
| `diff-viewer/` | 精準 diff | plan 26、i18n 譯文對照 |
| `data-table/` | 排序/過濾/inline edit | i18n editor;等兩邊需求都清楚再定 API |

## 引擎橋接(重要)

desktop plan 24 已定 thread 用 Tailwind v4 `@theme`。`@anyknown/ui` 因此輸出兩種形式:

1. `tokens.stylex.ts` — StyleX 產品線(accounts/storage/i18n)
2. `tokens.css` — 純 CSS variables(同一組 Ledger 值),desktop 的 Tailwind `@theme` 直接引用

Token 值以 `tokens.stylex.ts` 為唯一真相,`tokens.css` 由它同步(先手動,之後可加 codegen)。另有 `scrollbar.css`(客製捲軸,全域套用)。

## Texture 設計準則(線/織的品牌語言)

「訊息是纖維、thread 是線」的 texture 用在**等待、過渡、儀式**時刻:progress(weave/毛球/織布 tidy)、handoff-receipt(接線打結)、voice-indicator(一條線的四態,thinking 是電話線)、toast(退織倒數線)、dropzone(縫線蟻行)、empty-state(線頭 icon)、tabs(底線的鬆緊彈性)。**選取類控件用「布織入」**:switch(fabric 推著線頭走)、checkbox(布織進格子再縫勾)、radio(線繞成小線圈)。

**刻意不用**:context ring、diff-viewer、data-table、recovery-key、輸入類表單控件(數據與金鑰要安靜可判讀)、**scrollbar**(全域基礎設施要隱形)、以及 **skeleton**(載入骨架要低調不搶戲,用現代 rounded shimmer)。
