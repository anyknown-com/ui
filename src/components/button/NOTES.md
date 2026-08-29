# Button

**已實作** — `Button.tsx`,測試 `Button.test.tsx`;playground 的 `#button` 區可實際操作。

按鈕沒有 background —— 實心是線織出來的。幾何與動態的完整規格在
[TEXTURE-GUIDE.md](../TEXTURE-GUIDE.md),**參數以那份為唯一真相**,這裡不重複;
手感的基準是 `prototype.html`,瀏覽器直接開可操作。

## API

```tsx
<Button variant="primary" size="md" disabled>建立 thread</Button>
// variant: "primary" | "secondary" | "ghost" | "danger" | "dangerGhost"
// size: "sm" | "md"
```

| variant | 布 | 標籤色 | 用在 |
| --- | --- | --- | --- |
| `primary` | `yarn`(accent 染透) | `accentText` | 主要動作 |
| `secondary` | `yarnSecondary`(淺色布) | `text` | 次要動作 |
| `ghost` | `yarnGhost`(疏織、無底紗、不落影) | `textMuted` | 安靜的第三選項 |
| `danger` | `yarnDanger`(紅布) | `accentText` | 不可逆的破壞性動作 |
| `dangerGhost` | `yarnGhost`(疏織) | `danger` | 「白底紅字」:要看得出語意但不搶份量 |

## 行為

走 TEXTURE-GUIDE §4 的 press 全套:hover 帶動掃過的紗 + 光澤帶跟指尖、按住把布壓出
一個窩、放開回彈時光從按點掃出。三個語意規則:

- **觸發即時、動態緩成形**:pointerdown 當幀就開始,但窩約半秒才陷到位
- **取消 = 安靜**:按住拖出元件 → 張力歸零(窩鬆開);拖回來(還按著)→ 窩回來;
  **在元件外放開 → 不播過衝、不播掃光**,只歸位。過衝 + 掃光是「確認觸發」的專屬語言
- secondary / ghost 的光澤帶亮度上限調低(0.5),primary / danger 是 0.75

## 實作

- 幾何與動態都在 `lib/silk.ts`,Button 只挑 variant 與色票;靜態幾何走 `lib/weave.ts`
- 生命週期用 ref callback + cleanup(React 19),`useCallback` 鎖 identity,
  只有 variant 變了才重建織體
- 落影掛在按鈕的 CSS `filter` 上,四組色票各自帶 `shadow`(ghost 為 none)
- children 包進 `label` span(`position: relative`)才會蓋在布上面;
  用 `render={<Button/>}` 的地方(Dialog 的 confirm)照樣正常

## a11y

- 織線層是 `<svg aria-hidden>` + `pointer-events: none`,純裝飾,不進 a11y tree
- 鍵盤 Space/Enter 等同 press(指針視為按鈕中心);keyup 觸發 release 後把 pointer
  清 null,blur 也清(否則 rAF 不會停)
- focus ring 維持原生:`focus-visible` 2px `color.focusRing`,offset 3
- reduced-motion:rAF 完全不啟動,織紋靜態呈現(靜態本身就是完成的視覺)
- **已知偏差**:ghost 的 `textMuted` 對 ghost 的 `--y2` 只有 3.67:1(紗很疏,實際
  多半看到的是頁面底色 4.63:1)—— 見 [A11Y-DEBT.md](../A11Y-DEBT.md)

## 走過的彎路

完整的否決紀錄(七個版本,含設計者原話)在 TEXTURE-GUIDE §2。歸納出來的品味法則:

- **精緻 = 有序 + 細**:連續、平行、順滑的細線;隨機散點 = 廉價
- **生命力 = 長波的不規則**,不是高頻抖動。波長比元件還寬,每條線至多緩彎一兩次
- **覆蓋要數學保證**,不能靠機率 —— 縫隙露底看起來像 bug
- **快 = 廉價,慢而綿 = 布**

## References

- [TEXTURE-GUIDE.md](../TEXTURE-GUIDE.md) — 織物設計語言的完整規格與適配指引
- prototype.html — 手感的唯一真相
