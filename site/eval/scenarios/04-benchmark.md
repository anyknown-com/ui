# 記憶檢索的 benchmark

讀者:CTO。打開這頁要決定:記憶系統用 hybrid + rerank 還是只用 embedding。

做一頁 benchmark 報告,資料如下。

- 資料集:1,200 條 query,人工標注的相關記憶
- 三個方案的 recall@10 / MRR / p95 延遲:
  - embedding only(Qwen3-Embedding 0.6B):0.71 / 0.52 / 38 ms
  - FTS5 only:0.58 / 0.41 / 6 ms
  - hybrid + rerank(Qwen3-Reranker 0.6B):0.86 / 0.69 / 112 ms
- hybrid 在「時間相關」的 query 上 recall 0.91,embedding only 只有 0.62
- 延遲預算 150 ms
- 結論:hybrid + rerank,延遲在預算內
