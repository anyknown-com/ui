# FileRow

**已實作** — `FileRow.tsx`,測試 `FileRow.test.tsx`;playground 的 `#file-row` 區可實際操作。

檔案列表的一列:類型圖示 + 檔名 + 大小(mono、tabular)+ 修改時間 + hover 才浮現的動作(下載/改名/刪除)與選取 checkbox;另有資料夾列與加密中/上傳中 busy 列。prototype 的 hover、點列選取、checkbox、Space 選取、動作鈕都可操作。

## API 草案

```tsx
<FileRow
  item={{ kind: "file" | "folder", name, size, mtime, mime }}
  selected onSelectChange
  onOpen                       // 資料夾雙擊/Enter 進入;檔案開 preview
  actions={[{ icon, label, onAction }]}   // 預設 下載/改名/刪除;資料夾無下載
  state="idle" | "encrypting" | "uploading"  // busy 列:無動作、aria-busy
  progress                     // uploading 時 0–100
/>
```

## 行為

- hover 或已選取時才顯示 checkbox 與動作列(`opacity`,focus-within 也顯示,鍵盤可達)
- 點列 = toggle 選取;checkbox / 動作鈕 stopPropagation;雙擊資料夾開啟;Space 選取、Enter 開啟
- 大小欄 Geist Mono + `tabular-nums` 右對齊;資料夾顯示 `—`;圖示依 mime/副檔名(見 storage icons.tsx),資料夾 accent 色
- 選取底色 `accentSubtle`,hover 同色(選取狀態以 checkbox 與 aria-selected 區分)
- busy 列:整列 muted、無 checkbox 無動作;加密中 = spinner(reduced-motion 停轉),上傳中 = 細進度條 + 百分比
- 正式版:列虛擬化、shift/cmd 多選、拖曳移動、context menu(storage 已有,API 應留 slot)

## a11y

- 容器 `role="grid"`,列 `role="row"` + `aria-selected`;正式版鍵盤焦點走 `aria-activedescendant`(storage 現行做法)
- checkbox `aria-label="選取 {name}"`;動作鈕 label 帶檔名;busy 列 `aria-busy="true"`
- 已選數量以 `aria-live="polite"` 播報

## References

- storage/src/components/files/list-row.tsx(ROW_GRID 欄寬、group-hover 顯示 checkbox/動作、data-selected、MobileRow 變體)
- storage/src/components/files/icons.tsx(mime/副檔名 → 圖示對應)
- storage/src/components/files/use-row-keys.ts、item-menu.tsx(鍵盤與 context menu,API 需預留)
- https://www.w3.org/WAI/ARIA/apg/patterns/grid/(ARIA grid pattern)
