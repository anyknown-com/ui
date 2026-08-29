# Tabs

**已實作** — `Tabs.tsx`,測試 `Tabs.test.tsx`;playground 的 `#tabs` 區可實際操作。

同層內容切換(對話/記憶/換班紀錄),underline 為預設 variant,pills 用於篩選型切換(時間範圍等)。

## API

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

- 點擊即切換;Base UI 1.7 走 **manual activation**(方向鍵移動焦點,Enter/Space 才
  切換),disabled tab 保持可聚焦(`aria-disabled`)不會被方向鍵跳過 —— 這是 APG
  預設,實作沿用並補上可見的 disabled 樣式(`state.disabled`;寫 `:disabled`
  永遠不會命中)
- 方向鍵 ←/→ 在 tab 間循環移動(roving tabindex:active tab tabIndex=0,其餘 -1)
- underline:2px indicator 滑動,240ms `cubic-bezier(.16,1,.3,1)`;
  兩邊各自單調往目標走 —— **無倒退、無過衝**
- pills:布(accent-subtle 色系紗線,seed 10075)織滿整條 tablist、只建一次;
  選取高亮 = 圓角取景窗(clipPath 的 rect)滑到選中的 tab —— **窗動、布不動**,
  透出的織紋是連續的同一塊布(和 radio 的鏡頭同一個邏輯)。無 rAF
- `prefers-reduced-motion` 關閉 transition

## 實作

- indicator 位置不自己量:Base UI 的 `Tabs.Indicator` 本來就把
  `--active-tab-left/top/width/height` 寫成自己的 inline style,所以拿它當**變數載體**
  (絕對定位鋪滿整條 list、自己不動、`pointer-events: none`),裡面放織滿 tablist 的
  SVG,clipPath 的 rect 用 CSS 幾何屬性 x/y/width/height 吃那些變數
- transition 只給 x 與 width,同一條曲線(等寬情境整體平移,單調保證)
- tab 用 `z-index: 1` 疊在布上(flex item 的 z-index 不必 position 也生效)
- tablist 尺寸靠 ref callback + ResizeObserver 進 state(不用 effect),量到才織;
  jsdom 下 clientWidth 為 0 → 不渲染布,測試只驗語意

## a11y

- `role=tablist/tab/tabpanel`,tab 帶 `aria-selected` + `aria-controls`,panel 帶 `aria-labelledby`
- panel `tabindex=0`,讓鍵盤使用者能從 tab 直接 Tab 進內容
- tablist 需 `aria-label` 說明這組分頁在切什麼

## 走過的彎路

- 底線的「鬆緊彈性」(前緣快後緣慢的雙彈簧 + 拉伸下垂)——「完全不用這麼戲劇化,
  underline 正常滑動就好,太誇張了」。underline 不做線的動態
- x 與 width 各拆一條曲線的組合:某些排列會衝過再收回,違反「任何邊不得倒退」。
  改成兩邊同曲線才單調安全

## References

- https://ui.shadcn.com/docs/components/base/tabs
- https://base-ui.com/react/components/tabs
