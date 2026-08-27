# Voice Indicator

**已實作** — `VoiceIndicator.tsx`,測試 `VoiceIndicator.test.tsx`;playground 的 `#voice-indicator` 區可實際操作。

語音通話的狀態顯示:一眼看出 agent 現在是在聽你、在想、還是在說——對應 STT → runtime LLM → TTS pipeline 的三個活動段。

## 需求(定案)

- 四態:`idle`(靜態灰 bar)/ `listening`(5 條音量 bar 起伏,accent)/ `thinking`(單點脈動)/ `speaking`(波形依序起伏)
- 視覺化區固定寬高,換態不跳版;文案標明可插話(「說話中…插話會打斷」= barge-in)
- `prefers-reduced-motion: reduce`:全部動畫關閉,bar 停在中段靜態高度,改顯示 mono uppercase 靜態文字標(聆聽中/思考中/說話中)

## API 草案

```tsx
<VoiceIndicator
  state={"idle" | "listening" | "thinking" | "speaking"}
  level={number} // 0–1,listening 時可用真實 mic 音量驅動 bar 高度(prototype 用 CSS 假動畫)
/>
```

## 行為

- 狀態來源 = server `call.*` 事件:mic 收音(Scribe realtime WS partial)→ listening;committed 送 LLM → thinking;TTS stream-input 播放 → speaking
- barge-in:speaking 期間偵測到用戶語音 → 停播放、flush TTS、轉 listening——指示器只反映狀態,不管音訊
- **實作走 rAF 逐幀重算 path**(同 prototype):四態是同一條線的不同函數,thinking 的電話線是 prolate cycloid、listening 的振幅由 `level` 驅動,CSS keyframes 表達不了。草案寫「全 CSS、無 JS timer」是在 prototype 定案前寫的。reduced-motion 下不啟動 rAF,線停在 t=1.2 的靜態姿勢

## A11y

- 視覺化區 `aria-hidden`;文字 label 帶 `role="status"`(polite)播報狀態變化
- reduced-motion 下資訊不減:動畫換成靜態標籤,狀態仍可讀
- 指示器本身不可互動;掛在 call 控制旁,開關通話由 call 按鈕負責

## References

- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/23-call.md(pipeline:Scribe realtime STT → runtime LLM → TTS stream-input;VAD、barge-in、延遲 1–1.5s)
- /Users/solemnis/Documents/anyknown-com/a/docs/plans/desktop/22-workspace-shell.md(現在線 presence 狀態呈現)
