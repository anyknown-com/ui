import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test } from "vitest"
import { buildDiffRows, collapseRows, countChanges, diffKind } from "../../lib/diff"
import { DiffViewer } from "./DiffViewer"

const BEFORE = ["const a = 1", "const b = 2", "const c = 3"].join("\n")
const AFTER = ["const a = 1", "const b = 22", "const c = 3"].join("\n")

const LONG_BEFORE = Array.from({ length: 20 }, (_, i) => `line ${i}`).join("\n")
const LONG_AFTER = LONG_BEFORE.replace("line 10", "line ten")

describe("diff lib", () => {
	test("infers the changeset kind from which side exists", () => {
		expect(diffKind(BEFORE, AFTER)).toBe("modified")
		expect(diffKind(undefined, AFTER)).toBe("added")
		expect(diffKind(BEFORE, undefined)).toBe("deleted")
	})

	test("pairs removed and added lines and marks only the changed words", () => {
		const rows = buildDiffRows(BEFORE, AFTER)
		const removed = rows.find((row) => row.type === "del")
		const added = rows.find((row) => row.type === "add")
		expect(removed?.segments.some((segment) => segment.marked)).toBe(true)
		expect(added?.segments.some((segment) => segment.marked)).toBe(true)
		expect(added?.segments.map((s) => s.text).join("")).toBe("const b = 22")
	})

	test("wordDiff off leaves lines unmarked", () => {
		const rows = buildDiffRows(BEFORE, AFTER, { wordDiff: false })
		expect(rows.every((row) => row.segments.every((segment) => !segment.marked))).toBe(true)
	})

	test("numbers each side independently", () => {
		const rows = buildDiffRows(BEFORE, AFTER)
		expect(rows[0]).toMatchObject({ type: "context", beforeNo: 1, afterNo: 1 })
		const removed = rows.find((r) => r.type === "del")
		const added = rows.find((r) => r.type === "add")
		expect(removed?.beforeNo).toBe(2)
		expect(removed?.afterNo).toBeUndefined()
		expect(added?.afterNo).toBe(2)
		expect(added?.beforeNo).toBeUndefined()
	})

	test("counts additions and removals", () => {
		expect(countChanges(buildDiffRows(BEFORE, AFTER))).toEqual({ added: 1, removed: 1 })
	})

	test("collapses long untouched runs, keeping the context lines", () => {
		const blocks = collapseRows(buildDiffRows(LONG_BEFORE, LONG_AFTER), 3)
		expect(blocks.some((block) => block.kind === "fold")).toBe(true)
		const first = blocks[0]
		expect(first.kind).toBe("fold")
	})

	test("a negative context behaves like zero instead of slicing badly", () => {
		const rows = buildDiffRows(LONG_BEFORE, LONG_AFTER)
		const blocks = collapseRows(rows, -3)
		expect(blocks.some((block) => block.kind === "fold")).toBe(true)
		expect(blocks.every((block) => block.rows.length > 0)).toBe(true)
		expect(blocks.flatMap((block) => block.rows)).toHaveLength(rows.length)
	})

	test("Infinity context never collapses", () => {
		const blocks = collapseRows(buildDiffRows(LONG_BEFORE, LONG_AFTER), Number.POSITIVE_INFINITY)
		expect(blocks).toHaveLength(1)
		expect(blocks[0].kind).toBe("lines")
	})
})

describe("DiffViewer", () => {
	test("the header names the file and its stats", () => {
		render(<DiffViewer file={{ path: "locales/zh-TW.json", before: BEFORE, after: AFTER }} />)
		expect(screen.getByText("locales/zh-TW.json")).toBeInTheDocument()
		expect(screen.getByText("+1")).toBeInTheDocument()
		expect(screen.getByText("−1")).toBeInTheDocument()
	})

	test("the diff body is a labelled, keyboard-reachable scroll region", () => {
		render(<DiffViewer file={{ path: "a.ts", before: BEFORE, after: AFTER }} />)
		const region = screen.getByRole("region", { name: "a.ts 的變更" })
		expect(region).toHaveAttribute("tabindex", "0")
	})

	test("added and removed lines are announced by prefix, not only by colour", () => {
		render(<DiffViewer file={{ path: "a.ts", before: BEFORE, after: AFTER }} />)
		expect(screen.getByText("新增行")).toBeInTheDocument()
		expect(screen.getByText("刪除行")).toBeInTheDocument()
	})

	test("fold rows are real buttons that expand and collapse", async () => {
		render(<DiffViewer file={{ path: "a.ts", before: LONG_BEFORE, after: LONG_AFTER }} />)
		const fold = screen.getAllByRole("button")[0]
		expect(fold).toHaveAttribute("aria-expanded", "false")
		expect(fold).toHaveTextContent(/⋯ \d+ 行未變動/)
		const body = document.getElementById(fold.getAttribute("aria-controls") as string) as HTMLElement
		expect(body).not.toBeVisible()
		await userEvent.click(fold)
		expect(fold).toHaveAttribute("aria-expanded", "true")
		expect(body).toBeVisible()
		expect(within(body).getByText(/line 0/)).toBeInTheDocument()
	})

	test("an added file renders every line as an addition", () => {
		render(<DiffViewer file={{ path: "new.ts", after: AFTER }} />)
		expect(screen.getByText("+3")).toBeInTheDocument()
		expect(screen.getByText("−0")).toBeInTheDocument()
	})

	test("a deleted file renders every line as a removal", () => {
		render(<DiffViewer file={{ path: "gone.ts", before: BEFORE }} />)
		expect(screen.getByText("−3")).toBeInTheDocument()
		expect(screen.getByText("+0")).toBeInTheDocument()
	})
})

describe("DiffViewer regressions", () => {
	test("the changeset kind is stated in words, not only by the dot colour", () => {
		const { unmount } = render(<DiffViewer file={{ path: "a.ts", before: BEFORE, after: AFTER }} />)
		expect(screen.getByText("已修改")).toBeInTheDocument()
		unmount()
		render(<DiffViewer file={{ path: "new.ts", after: AFTER }} />)
		expect(screen.getByText("新增檔案")).toBeInTheDocument()
	})
})
