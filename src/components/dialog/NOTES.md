# Dialog / ConfirmDialog

模態對話框:半透明 blur backdrop、scale+fade 進場、Esc/backdrop 關閉;danger confirm 變體給不可復原的動作(刪除記憶、清空 thread)。

## API 草案

```tsx
<Dialog open onOpenChange>
  <DialogTrigger>重新命名工作區</DialogTrigger>
  <DialogContent title="重新命名工作區" description="新名稱會同步到所有成員。">
    …
    <DialogActions>
      <Button variant="ghost">取消</Button>
      <Button variant="primary">儲存</Button>
    </DialogActions>
  </DialogContent>
</Dialog>

<ConfirmDialog
  title="刪除這則記憶?"
  description="此動作無法復原。"
  danger confirmLabel="刪除"
  onConfirm={…}
/>
```

## 行為(prototype 已示範)

- 進場:`scale .96 → 1` + fade,160ms ease-out;reduced-motion 關閉
- backdrop:`rgba(bg, .35)` + `backdrop-filter: blur(2px)`
- 關閉:Esc(原生)、點 backdrop(`e.target === dialog`)、取消/確認按鈕
- ConfirmDialog = Dialog 的收斂 preset:danger 時確認鈕用 `--danger`,描述文字內嵌目標名稱(`<b>`)

## a11y

- **實作走 Base UI 的 `Dialog`/`AlertDialog`**(不是原生 `<dialog>`):focus trap、背景 `inert`、Esc、回焦 trigger 都由 primitive 提供,`ConfirmDialog` 另外禁止 backdrop 關閉
- `aria-labelledby` 指向標題;描述可加 `aria-describedby`
- danger confirm 開啟時初始 focus 落在「取消」(避免誤按),實作時用 `initialFocus`

## References

- https://base-ui.com/react/components/dialog(headless 層;`AlertDialog` 對應 ConfirmDialog:https://base-ui.com/react/components/alert-dialog)
- https://ui.shadcn.com/docs/components/base/dialog
