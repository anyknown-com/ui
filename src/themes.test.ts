import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import { generate, readThemedGroups } from "../scripts/themes.mjs"

// themes.stylex.ts 是抄一份 token 值,抄的東西會漂 —— 新的 group 加進 tokens 之後
// 沒有跟著加進 themes,手動切「亮」時只有一半的值跟著變。這兩題就是擋這件事。
describe("themes", () => {
	test("與 tokens.stylex.ts 完全同步(不同步就跑 pnpm gen:themes)", () => {
		expect(readFileSync(join(process.cwd(), "src/themes.stylex.ts"), "utf8")).toBe(generate())
	})

	test("每一組有 dark 變體的 token 都被 theme 到", () => {
		const source = readFileSync(join(process.cwd(), "src/themes.stylex.ts"), "utf8")
		const themed = readThemedGroups().map((group) => group.name)
		expect(themed).toContain("shadow")
		for (const group of themed) {
			expect(source, `${group} 沒有被 theme`).toContain(`stylex.createTheme(${group}, {`)
		}
	})
})
