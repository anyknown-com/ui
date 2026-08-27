# PasswordInput / PassphraseField

**已實作** — `PasswordInput.tsx`,測試 `PasswordInput.test.tsx`;playground 的 `#password-input` 區可實際操作。

密碼與 vault passphrase 欄:顯示/隱藏切換、四段強度計、Caps Lock 警告、confirm 欄不一致錯誤。prototype 可操作:輸入時強度計即時變化(長度 + 字元類別評分)、Caps Lock 實際偵測、confirm 欄輸入不同內容即出錯。

## API 草案

```tsx
<PasswordInput
  value onValueChange
  meter            // 顯示強度計(create/change passphrase 時開)
  scorer={zxcvbn}  // 可注入評分器;預設長度+字元類別
  capsLockWarning
/>
<PasswordInput confirmOf={value} />  // 不一致時自動 aria-invalid + 錯誤訊息
```

## 行為

- 眼睛鈕 toggle `type="password" ↔ "text"`,`aria-pressed` 同步;切換後 focus 回輸入框
- 強度計四段:0 空(顯示提示文)、1 弱(danger)、2 可(warn)、3 強、4 很強(accent);評分 = 長度門檻(8/12/20,12 對應 storage 的 MIN_LENGTH)× 字元類別數
- Caps Lock:keydown/keyup 讀 `getModifierState("CapsLock")`,blur 時收起(blur 後讀不到狀態)
- confirm 欄:只在「有輸入且不等於主欄」時報錯,主欄修改也會重新驗證;不在每個 keystroke 前就罵人
- 密碼欄一律 `autocomplete="new-password"`(建立)或 `"current-password"`(解鎖),不擋貼上

## a11y

- 眼睛鈕 `aria-label` +`aria-pressed`;強度文字 `aria-live="polite"`,四段條 `aria-hidden`
- Caps Lock 列 `role="status"`;錯誤用 `aria-invalid` + `aria-describedby` 指向訊息
- reduced-motion 時關閉條的顏色 transition

## References

- storage/src/components/passphrase-field.tsx(現有:eye toggle、LengthBar 三段長度計、MIN_LENGTH=12)
- https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState
- https://github.com/dropbox/zxcvbn(正式評分器候選)
