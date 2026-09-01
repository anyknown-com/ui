# product 的 usage 月報

讀者:CEO。打開這頁要決定:下個月要不要把 gateway 的 Queue runs 配額調高。

做一頁 2026 年 8 月的 usage 月報,資料如下。

- 總呼叫數 1,204,311(7 月 1,020,880)
- 成本 USD 412.50(7 月 398.20)
- 平均每次呼叫 token:輸入 2,140、輸出 380
- Queue runs:排隊 18,402 次,超過配額被退回 1,211 次(7 月 240 次)
- 各 app 呼叫佔比:desktop 61%、call 22%、storage 9%、其他 8%
- 供應商分佈:Anthropic 71%、OpenAI 19%、Google 10%
- 最貴的 10 個 run 合計 USD 38.10,全部來自 desktop 的 goal loop
- p95 延遲 2.8 s(7 月 3.1 s)

結論要寫清楚:退回數成長五倍,配額該調。
