# Feature proposal for storage

Readers: the CEO and the storage engineers. What they need to decide when they open the page: whether the next sprint builds share links or version history.

Build a one-page proposal, written in Traditional Chinese, from the data below.

- 兩個候選:分享連結(E2EE 下要做 key wrapping,預估工作量 M)、版本歷史(每次上傳留 blob,預估工作量 S,但 R2 成本每月 +USD 12 起)
- 用戶回饋:最近 30 天 41 則,提到分享 23 則、版本 9 則、其他 9 則
- 分享連結的技術風險:連結帶 key 進 URL fragment,瀏覽器歷史會留
- 版本歷史的技術風險:沒有
- 建議:先做版本歷史,分享連結等 accounts 的 OIDC 上線再做
