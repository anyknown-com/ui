# Skeleton

**已實作** — `Skeleton.tsx`,測試 `Skeleton.test.tsx`;playground 的 `#skeleton` 區可實際操作。

載入骨架:占位形狀 + shimmer,形狀對齊實際內容的排版(thread 骨架就長得像 thread),避免載入完成時跳版。

## API

```tsx
<Skeleton width="70%" height={14} />
<Skeleton shape="circle" size={36} />
{/* 組合由使用端排,提供常用預組: */}
<ThreadSkeleton messages={2} />
```

## 行為

- shimmer:linear-gradient 掃過(background-position 動畫,1.6s linear infinite),只動 background,不觸發 layout
- `prefers-reduced-motion`:**完全靜態**(骨架本身已可辨識)。草案原本提的 opacity 脈動仍是動畫,與「所有動畫包 reduced-motion」的硬性規則衝突,所以採 NOTES 自己給的第二個選項
- 骨架顏色用專屬 `bone`/`sheen` token(比 border 淺、比 surface 深),light/dark 各一組

## a11y

- 骨架區塊本身 `aria-hidden`,外層容器 `role=status` + `aria-label` **並在容器內放一段視覺隱藏的同文字**(`role=status` 不從內容取名,live region 又需要有內容才會播報,兩者缺一不可),只報一次,不逐塊報
- 內容到達後整組替換,不留殘骸;避免 aria-live 對骨架本身開火

## 實作

原生 div + StyleX keyframes,不需 primitive。`bone`/`sheen` 需補進 `tokens.stylex.ts`。

## References

- https://ui.shadcn.com/docs/components/base/skeleton
- https://www.nngroup.com/articles/skeleton-screens/
