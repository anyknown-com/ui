# Dropzone

**已實作** — `Dropzone.tsx`,測試 `Dropzone.test.tsx`;playground 的 `#dropzone` 區可實際操作。

拖放上傳區:虛線框 idle、dragover 高亮(accent 邊框 + accentSubtle 底)、選檔按鈕 fallback、上傳中列表(檔名 + 進度條 + 取消)、超限錯誤列。prototype 的 dragover、選檔、模擬進度、取消都可操作。

## API

```tsx
<Dropzone
  onFiles={(files) => …}   // 已通過 maxSize 篩選;超限的走 onReject
  onReject={(rejections) => …}
  maxSize={10 * MB}
  multiple accept
  disabled                  // storage:search/recents 模式時整區停用
>
  {children}                // 也可包內容區當整頁 drop target(overlay 模式)
</Dropzone>
<UploadList jobs onCancel />  // 列表可獨立用(對應 storage 的 UploadTray)
```

## 行為

- dragenter/dragleave 用 depth counter,拖過子元素不閃爍(同 storage DropZone)
- dragover 需 `preventDefault` + `dropEffect="copy"`;只對含 `Files` 的 drag 反應,忽略列移動等內部 drag
- 選檔按鈕觸發 hidden `<input type=file multiple>`;change 後清 `input.value` 讓同檔可重選
- 每列狀態:加密中 → 上傳中(bytes 進度)→ 完成(取消鈕消失);取消即移除(正式版保留可 retry,見 UploadTray)
- 超限檔不進 queue,直接一列 danger 底 + 說明,不擋其他檔案

## a11y

- 列表 `aria-live="polite"`;取消鈕 `aria-label="取消上傳 {name}"`
- 選檔按鈕是真按鈕,鍵盤使用者不依賴 drag;正式版進度條用 `role="progressbar"` + `aria-valuenow`
- 高亮與進度 transition 包 `prefers-reduced-motion`

## References

- storage/src/components/files/drop-zone.tsx(depth counter、isFileDrag、overlay 模式)
- storage/src/components/files/upload-tray.tsx(job 狀態機:queued/encrypting/uploading/done/failed/cancelled、retry/resume)
- storage/src/components/files/use-queue-uploads.ts
- https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
- https://react-dropzone.js.org(headless 層候選:accept/maxSize/rejection 模型)
