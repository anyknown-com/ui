# Tabs

**已實作** — `Tabs.tsx`,測試 `Tabs.test.tsx`;playground 的 `#tabs` 區可實際操作。

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

## Texture(prototype 先行,2026-08-29)

- 否決紀錄:底線鬆緊彈性(前緣快後緣慢的雙彈簧 + 拉伸下垂)—
  「完全不用這麼戲劇化,underline 正常滑動就好,太誇張了」
- 定案:underline 維持原本的 2px 滑動 indicator,不做線的動態
- pills:布(accent-subtle 色系紗線,seed 10075)織滿整條 tablist 當背景、建一次;
  selected highlight = 圓角取景窗(clip rect)滑到選中的 tab(x/width CSS transition,
  跟 underline 同一條 260ms bezier)— 窗動、布不動,透出的織紋是連續的同一塊布
  (與 radio 的鏡頭同一個邏輯);無 rAF
- 滑動定案(underline):雙邊動畫 — indicator 用 left/right 兩個 inset,
  行進方向前緣 240ms cubic-bezier(.16,1,.3,1)(expo)、後緣 240ms
  cubic-bezier(.4,0,.2,1)(平滑),依方向對調;兩邊各自單調往目標走 —
  無倒退、無過衝、寬度漸變(x+width 拆曲線的組合被否決:某些排列會衝過再收)
- pills 取景窗:等寬情境,x/width 同曲線(240ms expo)整體平移,單調保證
- `Tabs.tsx` 現況 translate+width 結構先用同曲線 expo(單調安全);
  落地時改成 left/right 雙邊結構套上面的方向性曲線
- 已落地 `Tabs.tsx`:offsetLeft/Width 不自己量 —— Base UI 的 `Tabs.Indicator` 本來就
  把 `--active-tab-left/top/width/height` 寫成自己的 inline style,所以拿它當變數載體
  (絕對定位鋪滿整條 list、自己不動、pointer-events none),裡面放織滿 tablist 的 SVG,
  clipPath 的 rect 用 CSS 幾何屬性 x/y/width/height 吃那些變數,transition 只給 x 與
  width(等寬情境同曲線,單調)。tab 用 z-index 1 疊在布上(flex item 的 z-index 不必
  position 也生效)
- tablist 尺寸靠 ref callback + ResizeObserver 進 state(不用 effect),量到才織;
  jsdom 下 clientWidth 為 0 → 不渲染布,測試只驗語意
