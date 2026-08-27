import { diffLines, diffWordsWithSpace } from "diff"

export type DiffSegment = { text: string; marked: boolean }
export type DiffRow = {
	type: "context" | "add" | "del"
	beforeNo?: number
	afterNo?: number
	segments: DiffSegment[]
}
export type DiffBlock = { kind: "lines"; rows: DiffRow[] } | { kind: "fold"; rows: DiffRow[] }

export type DiffKind = "modified" | "added" | "deleted"

export function diffKind(before: string | undefined, after: string | undefined): DiffKind {
	if (before == null) return "added"
	if (after == null) return "deleted"
	return "modified"
}

const MAX_CHANGE_RATIO = 0.6

function splitLines(value: string) {
	const lines = value.split("\n")
	if (lines.at(-1) === "") lines.pop()
	return lines
}

function plain(text: string): DiffSegment[] {
	return [{ text, marked: false }]
}

/** Word-level highlight for a paired removed/added line, skipped when almost everything changed. */
function pairSegments(removed: string, added: string): [DiffSegment[], DiffSegment[]] {
	const parts = diffWordsWithSpace(removed, added)
	const changed = parts.reduce(
		(total, part) => (part.added || part.removed ? total + part.value.length : total),
		0,
	)
	if (changed > (removed.length + added.length) * MAX_CHANGE_RATIO) {
		return [plain(removed), plain(added)]
	}
	const before: DiffSegment[] = []
	const after: DiffSegment[] = []
	for (const part of parts) {
		if (part.added) after.push({ text: part.value, marked: true })
		else if (part.removed) before.push({ text: part.value, marked: true })
		else {
			before.push({ text: part.value, marked: false })
			after.push({ text: part.value, marked: false })
		}
	}
	return [before, after]
}

export function buildDiffRows(
	before: string,
	after: string,
	{ wordDiff = true }: { wordDiff?: boolean } = {},
): DiffRow[] {
	const rows: DiffRow[] = []
	let beforeNo = 0
	let afterNo = 0
	const parts = diffLines(before, after)

	for (let index = 0; index < parts.length; index += 1) {
		const part = parts[index]
		const lines = splitLines(part.value)

		if (!part.added && !part.removed) {
			for (const line of lines) {
				beforeNo += 1
				afterNo += 1
				rows.push({ type: "context", beforeNo, afterNo, segments: plain(line) })
			}
			continue
		}

		if (part.removed) {
			const next = parts[index + 1]
			const addedLines = wordDiff && next?.added ? splitLines(next.value) : []
			for (const [offset, line] of lines.entries()) {
				beforeNo += 1
				const partner = addedLines[offset]
				const segments = partner != null ? pairSegments(line, partner)[0] : plain(line)
				rows.push({ type: "del", beforeNo, segments })
			}
			if (addedLines.length > 0) {
				for (const [offset, line] of addedLines.entries()) {
					afterNo += 1
					const partner = lines[offset]
					const segments = partner != null ? pairSegments(partner, line)[1] : plain(line)
					rows.push({ type: "add", afterNo, segments })
				}
				index += 1
			}
			continue
		}

		for (const line of lines) {
			afterNo += 1
			rows.push({ type: "add", afterNo, segments: plain(line) })
		}
	}

	return rows
}

/** Collapses runs of untouched lines longer than 2 × context into fold blocks. */
export function collapseRows(rows: DiffRow[], context: number): DiffBlock[] {
	if (!Number.isFinite(context)) return rows.length > 0 ? [{ kind: "lines", rows }] : []

	const blocks: DiffBlock[] = []
	let index = 0

	const push = (kind: DiffBlock["kind"], slice: DiffRow[]) => {
		if (slice.length === 0) return
		const last = blocks.at(-1)
		if (last?.kind === kind && kind === "lines") last.rows.push(...slice)
		else blocks.push({ kind, rows: slice })
	}

	while (index < rows.length) {
		if (rows[index].type !== "context") {
			const start = index
			while (index < rows.length && rows[index].type !== "context") index += 1
			push("lines", rows.slice(start, index))
			continue
		}
		const start = index
		while (index < rows.length && rows[index].type === "context") index += 1
		const run = rows.slice(start, index)
		if (run.length <= context * 2) {
			push("lines", run)
			continue
		}
		const leading = start === 0 ? 0 : context
		const trailing = index === rows.length ? 0 : context
		push("lines", run.slice(0, leading))
		push("fold", run.slice(leading, run.length - trailing))
		push("lines", trailing === 0 ? [] : run.slice(run.length - trailing))
	}

	return blocks
}

export function countChanges(rows: DiffRow[]) {
	let added = 0
	let removed = 0
	for (const row of rows) {
		if (row.type === "add") added += 1
		else if (row.type === "del") removed += 1
	}
	return { added, removed }
}
