# Select / Combobox

**已實作** — `Select.tsx`,測試 `Select.test.tsx`;playground 的 `#select` 區可實際操作。

觸發鈕 + popover(頂部搜尋框 + 分組列表)。prototype 是可操作的:打字過濾、方向鍵移動、Enter 選取、Esc 關閉、多選 chips。

## 需求(定案)

- text search filter(空結果顯示 empty state,帶查詢字)
- multiple select(trigger 內顯示 chips,可個別移除)
- options grouping(group label + 過濾後空群組自動隱藏)

## API 草案

```tsx
<Select value onValueChange placeholder multiple searchable>
  <SelectGroup label="Anthropic">
    <SelectItem value="fable-5" hint="最強">Fable 5</SelectItem>
  </SelectGroup>
</Select>
```

## 實作建議

用 **Base UI 的 Combobox**(https://base-ui.com/react/components/combobox)做 headless 層,StyleX 上皮:
`multiple`、filter、`Combobox.Group`、`Combobox.Empty`、`Combobox.Chips` 全部原生支援,鍵盤與 aria 也是(shadcn 新版同路線)。Radix 沒有 combobox primitive,不建議自組。

## 行為細節(prototype 已示範)

- popover 進場:`scale 1 0.97 → 1` + fade,140ms,transform-origin top;reduced-motion 關閉
- 選中項打勾(accent);active 項 `accentSubtle` 底;hover 同步 active
- 單選:選取即關閉並回焦 trigger;多選:保持開啟連續選
- 開啟時 focus 進搜尋框;popover 定位實作時用 anchor positioning 或 floating-ui(collision flip)

## References

- https://ui.shadcn.com/docs/components/base/combobox(anatomy:Input/Content/List/Item/Chips/Group/Separator/Empty)
- https://ui.shadcn.com/docs/components/base/select(無搜尋的簡單版,可同一元件 `searchable=false` 收斂)
