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

- 點擊即切換(activation on focus 亦可,Base UI 預設 automatic);disabled tab 不可選、方向鍵跳過
- underline indicator 用絕對定位 + left/width transition(180ms)滑到 active tab;reduced-motion 關閉
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
