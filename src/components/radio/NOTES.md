# Radio / RadioGroup

原生 `<input type="radio">` + `fieldset/legend` 群組。內圈 dot 用 `scale` 進場(140ms)。

## API 草案

```tsx
<RadioGroup value onValueChange name legend>
  <Radio value="50" label="50%(建議)" description="..." />
  <Radio value="75" label="75%" />
</RadioGroup>
// variant: "plain" | "card"(card 選中時 border + accentSubtle 底)
```

## 行為

- 鍵盤:同 name 群組內方向鍵移動並選取(原生行為)
- card variant 用 `:has(input:checked)` 亮整張
- disabled 可作用於單一選項或整組

## a11y

- 群組標題用 `legend`(或 `role="radiogroup"` + `aria-labelledby`)
- 說明文字掛在 label 內,一起可點

## References

- https://ui.shadcn.com/docs/components/base/radio-group
