# design.md 評估迴圈

固定五個場景(`scenarios/`),每個一段 prompt 加一份假資料。場景不換,才量得出差異。

跑法:

1. 每個場景兩條:帶 `site/dist/design.md`(內含 brand.css 詞彙)產一頁,不帶產一頁。交 subagent 做,分批、每批最多三個。產出放 `out/<scenario>-with.html` / `out/<scenario>-without.html`(不進 git)。
2. `node scripts/design-lint.mjs out/*.html` 數機械錯誤。
3. agent-browser 光暗各截一張,跟 `example.html` 放一起看。
4. 回饋分流:判斷型的修正寫進 `DESIGN.md`;重複出現的排版需求加進 `src/brand.css`(同時 DESIGN.md 加一條);能用規則抓的丟進 `scripts/design-lint.mjs`。同一個問題只落一個地方,落在最靠近機器的那個。

成功指標不是零錯,是同類抱怨在下一輪同類場景出現的次數下降。每輪的數字記在 `docs/plans/01-design-md.md` 末尾。
