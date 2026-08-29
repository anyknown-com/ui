# Switch

**已實作** — `Switch.tsx`,測試 `Switch.test.tsx`;playground 的 `#switch` 區可實際操作。

即時生效的開關(相對於 Checkbox 的「提交後生效」)。原生 checkbox + `role="switch"`。

## API

```tsx
<Switch checked disabled label description onCheckedChange />
```

## 行為

- thumb 滑動 240ms `cubic-bezier(.32,.85,.45,1)` —— 收尾乾淨,**不過衝**
- 開啟的軌道是一塊布:TEXTURE-GUIDE 的紗線堆疊(seed 10075、primary 色票),
  織入動畫是 clipPath rect 的 width 推進 —— 紗固定不動,布被逐漸「織出」
- 關閉時軌道是 `borderStrong` 的空槽
- 選取控件保持安靜:靜態織紋、無 rAF、不做窩與掃光(那是 button 的語言)
- 設定列的慣用排版:文字在左、開關在右
- `prefers-reduced-motion` 關閉動畫

## a11y

- input 加 `role="switch"`(aria-checked 由原生 checked 對映)
- 切換即生效,不需要另外的儲存按鈕;若有延遲生效要顯示 pending 狀態

## 走過的彎路

- thumb 曾用 `cubic-bezier(.34,1.56,.64,1)` 的雙彈跳(transitions.dev 的
  「Toggle thumb slides」)—— 過衝一律不要,全站動畫收尾乾淨
- on-state 曾是 5×5 crosshatch pattern,不是布。換成真正的紗線堆疊之後才和
  button 同源

## References

- https://ui.shadcn.com/docs/components/base/switch
