# design.md eval loop

Five fixed scenarios (`scenarios/`), each a prompt plus fake data. The scenarios don't change, so differences between rounds can be measured.

How to run:

1. Two runs per scenario: one page built with `site/dist/design.md` (which includes the brand.css vocabulary) and one without. Hand them to subagents in batches of at most three. Output goes to `out/<scenario>-with.html` / `out/<scenario>-without.html` (not in git).
2. Count mechanical errors with `node scripts/design-lint.mjs out/*.html`.
3. Take one light and one dark screenshot of each with agent-browser and compare them with `example.html`.
4. Route the feedback: judgment fixes go into `DESIGN.md`; layout needs that keep coming up go into `src/brand.css` (with a matching line in DESIGN.md); anything a rule can catch goes into `scripts/design-lint.mjs`. Each problem lands in exactly one place, the one closest to the machine.

Success isn't zero errors; it is the same kind of complaint showing up less often in the next round of the same kind of scenario. Record each round's numbers at the end of `docs/plans/01-design-md.md`.

The pages are written in Traditional Chinese, like `example.html` (`lang="zh-Hant"`), so each round also exercises the Figtree + Noto Sans TC mix. That is why the scenario instructions are in English but the data, which becomes page content, stays in Chinese. Pass the whole scenario file to the subagent as the prompt.
