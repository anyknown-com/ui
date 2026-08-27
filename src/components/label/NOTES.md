# Label

表單標籤,含 required / optional 標記。實作上建議連同 `Field`(label + control + help/error 的組合容器)一起做,自動接好 `for`/`aria-describedby`。

## API 草案

```tsx
<Label htmlFor required optional>顯示名稱</Label>
// 或組合層:
<Field label="Email" required error={msg} help="...">
  <Input />
</Field>
```

## 行為

- required 星號 `aria-hidden`,語意靠 control 的 `required`/`aria-required`
- 控件 disabled 時,label/help 用 `:has(:disabled)` 一起降 opacity
- 點 label 聚焦控件(原生 `for` 行為,checkbox/radio/switch 同樣受益)

## References

- https://ui.shadcn.com/docs/components/base/label
- Base UI Field:https://base-ui.com/react/components/field(Field/Label/Description/Error 的組合模式)
