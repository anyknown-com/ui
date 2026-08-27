# Dropdown Menu

動作選單(相對於 Select 的「選值」)。prototype 可操作:群組、分隔線、checkbox item、快捷鍵欄、兩層 submenu(hover/focus 展開)。

## 需求(定案)

- multi-layer submenu(巢狀不限一層;prototype 示範兩層)
- group label / separator / checkbox item / 快捷鍵提示 / danger item

## API 草案

```tsx
<DropdownMenu trigger={<Button>Thread 動作</Button>}>
  <DropdownGroup label="這條 thread">
    <DropdownItem icon={<Plus />} shortcut="⌘N" onSelect>新增交接備註</DropdownItem>
    <DropdownSub label="匯出" icon={<List />}>
      <DropdownItem>Markdown</DropdownItem>
      <DropdownSub label="範圍…">…</DropdownSub>
    </DropdownSub>
  </DropdownGroup>
  <DropdownSeparator />
  <DropdownCheckboxItem checked onCheckedChange>顯示換班回條</DropdownCheckboxItem>
  <DropdownItem variant="danger">刪除這一天的紀錄</DropdownItem>
</DropdownMenu>
```

## 實作建議

用 **Base UI 的 Menu**(https://base-ui.com/react/components/menu)做 headless 層:
submenu(SubmenuTrigger,含 hover intent / safe polygon)、CheckboxItem、RadioItem、typeahead、完整鍵盤(方向鍵、→ 進子選單、← 退回)全部內建。prototype 的鍵盤只做了 Esc,完整行為交給 primitive,不要手刻。

## 行為細節(prototype 已示範)

- 進場 `scale .97 → 1` + fade 140ms,transform-origin 依開啟方向;子選單 120ms;reduced-motion 關閉
- submenu 靠右展開、頂部對齊觸發項(-0.35rem 對齊 padding);碰到視窗邊界時實作要 flip 到左側
- checkbox item 的勾位在左欄(固定寬,未勾時保留空位,文字不跳動)
- danger item 用 `color.danger`,放在 separator 之後的最尾端

## References

- https://ui.shadcn.com/docs/components/base/dropdown-menu(anatomy:Group/Label/Separator/Sub/CheckboxItem/RadioGroup/Shortcut)
- transitions.dev「Menu dropdown」:origin-aware 開合;「Dropdown menu morph」若之後想要 trigger 變形進選單的進階動效
