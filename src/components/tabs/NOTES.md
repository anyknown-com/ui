# Tabs

同層內容切換(對話/記憶/換班紀錄),underline 為預設 variant,pills 用於篩選型切換(時間範圍等)。

## API 草案

```tsx
<Tabs defaultValue="chat" variant="underline">
  <TabsList aria-label="Thread 檢視">
    <TabsTab value="chat">對話</TabsTab>
    <TabsTab value="memory">記憶</TabsTab>
    <TabsTab value="handoff" disabled>換班紀錄</TabsTab>
  </TabsList>
  <TabsPanel value="chat">…</TabsPanel>
</Tabs>
```

## 行為

- **已實作**。點擊即切換;Base UI 1.7 走 **manual activation**(方向鍵移動焦點,Enter/Space 才切換),disabled tab 保持可聚焦(`aria-disabled`)不會被方向鍵跳過 —— 這是 APG 預設,實作沿用並補上可見的 disabled 樣式(`state.disabled`,原本寫的 `:disabled` 永遠不會命中)
- underline indicator 用 Base UI `Tabs.Indicator` 的 `--active-tab-left/width`,transition 260ms(對齊 prototype 的 `cubic-bezier(.3,1.35,.45,1)` 彈性曲線,比草案的 180ms 長);reduced-motion 關閉
- 方向鍵 ←/→ 在 tab 間循環移動並同步切換(roving tabindex:active tab tabIndex=0,其餘 -1)

## a11y

- `role=tablist/tab/tabpanel`,tab 帶 `aria-selected` + `aria-controls`,panel 帶 `aria-labelledby`
- panel `tabindex=0`,讓鍵盤使用者能從 tab 直接 Tab 進內容
- tablist 需 `aria-label` 說明這組分頁在切什麼

## 實作建議

Base UI `Tabs` 有現成 primitive(含 `Tabs.Indicator` 提供 CSS 變數定位),不必自己算 offsetLeft。

## References

- https://ui.shadcn.com/docs/components/base/tabs
- https://base-ui.com/react/components/tabs
