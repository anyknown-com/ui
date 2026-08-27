# Popover

定位浮層基礎件:trigger 錨定的 surface 卡片,select/dropdown/combobox 都疊在它上面;也直接承載富內容(記憶詳情、成員卡片)。

## API 草案

```tsx
<Popover open onOpenChange>
  <PopoverTrigger>部署走 Cloudflare</PopoverTrigger>
  <PopoverContent side="bottom" align="center" sideOffset={8}>
    …任意內容(標題 + 內文 + 動作)
  </PopoverContent>
</Popover>
```

## 行為(prototype 已示範)

- 開合:trigger click toggle、點外側關閉、Esc 關閉並回焦 trigger
- 進場:`scale .96 → 1` + fade,140ms ease-out;`transform-origin` 依 side(top→bottom、bottom→top、left→right、right→left),讓浮層「從 trigger 長出來」;reduced-motion 關閉
- offset 8px;surface + border + `--shadow`(與 select popover 同一套)
- prototype 用純 absolute 定位;**實作時定位層用 CSS anchor positioning(`anchor()` + `position-try` 做 collision flip),或 floating-ui 的 `flip`/`shift` middleware 當 fallback** —— select/NOTES 與此處收斂成同一個 Positioner

## a11y

- trigger `aria-expanded` + `aria-haspopup`;富內容 popover 用 `role="dialog"` + `aria-labelledby`。**`PopoverContent` 的型別強制二選一**:給 `aria-label`,或標記 `titled` 並在內容裡放 `PopoverTitle` —— 沒有名字的 dialog 過不了 4.1.2
- 開啟後 focus 移入內容第一個可聚焦元素;關閉回焦 trigger(prototype 只做 Esc 回焦)
- 與 tooltip 分工:有互動內容就是 popover,純文字提示才用 tooltip

## References

- https://base-ui.com/react/components/popover(headless 層:`Positioner` 的 `side`/`align`/`sideOffset`、collisionAvoidance 內建)
- https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning/Using
- https://floating-ui.com/docs/flip
