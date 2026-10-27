// Foundations: every token group from src/tokens.stylex.ts, rendered from the generated
// tokens.json so the values here are the values that ship.
import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import type { CSSProperties, ReactNode } from "react"
import { type TokenEntry, type TokenGroup, TOKEN_GROUPS, tokenGroup } from "./content"
import { Page, PageHead, Section, grid } from "./layout"

const MOBILE = breakpoint.tablet

// tokens.stylex.ts documents most colours with line comments, which the generator cannot
// read; the roles are short enough to keep here.
const COLOR_ROLES: Record<string, string> = {
	bg: "The one sheet: page background.",
	surfaceRaised: "Things that float: text fields, composer, menus, sheet, dialog, toast, tooltip.",
	borderControl: "The only edge: an unchecked checkbox or radio, 3:1 against the page.",
	text: "Primary text, links (with an underline) and the solid primary button.",
	textMuted: "Secondary text; the one grey. At least 4.5:1 on the page and on `wash`.",
	signal: "Blue: the agent is working. Text or a 6px dot, never a fill.",
	danger: "Red: failed. Text or a 6px dot.",
	success: "Green: done. Text or a 6px dot.",
	warning: "Amber: waiting for you. Text or a 6px dot.",
	focusRing: "Keyboard focus ring (`signal`).",
	scrim: "Dialog backdrop: black 32%, no blur.",
	wash: "Ink at 6%: chips, secondary buttons, the selected row, skeleton bones.",
	washHover: "Ink at 11%: the hover of a wash.",
	washStrong: "Ink at 26%: bars, slider track, sheet handle, scrollbar thumb.",
}

const SHADOW_ROLES: Record<string, string> = {
	float: "Text field, composer, menu, tooltip, toast.",
	modal: "Dialog and sheet.",
}

const CORNER_ROLES: Record<string, string> = {
	shape:
		"One-line shapes: buttons, chips, single-line fields, icon buttons, menu rows, switch, slider thumb.",
	box: "Anything that grows with its content: composer, textarea, menu, dialog, sheet top, toast, tooltip, images.",
	check: "The checkbox square only. Radio stays a circle.",
}

const styles = stylex.create({
	toc: {
		display: "flex",
		flexWrap: "wrap",
		gap: space.xs,
		margin: 0,
		padding: 0,
		listStyle: "none",
	},
	tocLink: {
		display: "inline-block",
		fontSize: type.t2,
		color: color.text,
		textDecoration: "none",
		backgroundColor: { default: color.wash, ":hover": color.washHover },
		borderRadius: corner.shape,
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	note: { fontSize: type.t2, lineHeight: type.snug, color: color.textMuted, margin: 0, maxWidth: "44rem" },
	mono: { fontFamily: font.mono, fontSize: type.code, color: color.text, overflowWrap: "anywhere" },
	faint: { fontFamily: font.mono, fontSize: type.t1, color: color.textMuted, overflowWrap: "anywhere" },
	card: {
		display: "grid",
		gap: space.xxs,
		alignContent: "start",
		padding: space.sm,
		minWidth: 0,
	},
	swatches: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: space.xxs, marginBottom: space.xxs },
	swatch: {
		height: "3rem",
		borderRadius: corner.box,
		display: "flex",
		alignItems: "flex-end",
		padding: space.xxs,
	},
	swatchLabel: {
		fontFamily: font.mono,
		fontSize: type.t1,
		backgroundColor: color.bg,
		color: color.text,
		borderRadius: corner.check,
		paddingInline: space.xxs,
	},
	deprecated: {
		fontFamily: font.mono,
		fontSize: type.t1,
		color: color.warning,
		justifySelf: "start",
	},
	rows: { display: "grid", gap: 0 },
	row: {
		display: "grid",
		gridTemplateColumns: { default: "10rem minmax(0, 1fr)", [MOBILE]: "minmax(0, 1fr)" },
		gap: { default: space.md, [MOBILE]: space.xxs },
		alignItems: "center",
		paddingBlock: space.xs,
		minWidth: 0,
	},
	sample: { color: color.text, margin: 0, overflowWrap: "anywhere", minWidth: 0 },
	bar: { height: space.sm, backgroundColor: color.signal, borderRadius: corner.shape },
	cornerBox: {
		width: "4rem",
		height: "3rem",
		backgroundColor: color.wash,
	},
	shadowBox: {
		height: "4rem",
		backgroundColor: color.surfaceRaised,
		borderRadius: corner.box,
		marginBlock: space.sm,
	},
	iconBox: {
		backgroundColor: color.text,
		borderRadius: corner.check,
	},
	details: { display: "grid", gap: space.sm },
	summary: { cursor: "pointer", fontSize: type.t2, color: color.textMuted },
})

function Token({ group, entry }: { group: string; entry: TokenEntry }) {
	return (
		<>
			<code {...stylex.props(styles.mono)}>{`${group}.${entry.key}`}</code>
			{entry.deprecated !== false && <span {...stylex.props(styles.deprecated)}>deprecated</span>}
		</>
	)
}

function cssVar(group: string, key: string) {
	const kebab = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
	return group === "color"
		? `--ak-${kebab}`
		: `--ak-${group.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}-${kebab}`
}

function Description({ entry, roles }: { entry: TokenEntry; roles?: Record<string, string> }) {
	const text =
		typeof entry.deprecated === "string" ? entry.deprecated : entry.description || roles?.[entry.key]
	return text ? <span {...stylex.props(styles.note)}>{text.replace(/`/g, "")}</span> : null
}

function Swatch({ value, label }: { value: string; label: string }) {
	// The swatch shows the literal value for that theme, whatever theme the page is in.
	const style: CSSProperties = { backgroundColor: value }
	return (
		<div {...stylex.props(styles.swatch)} style={style}>
			<span {...stylex.props(styles.swatchLabel)}>{label}</span>
		</div>
	)
}

function Colors({ group, roles }: { group: TokenGroup; roles: Record<string, string> }) {
	return (
		<div {...stylex.props(grid.thirds)}>
			{group.tokens.map((entry) => (
				<div key={entry.key} {...stylex.props(styles.card)}>
					<div {...stylex.props(styles.swatches)}>
						<Swatch value={entry.light ?? ""} label="light" />
						<Swatch value={entry.dark ?? ""} label="dark" />
					</div>
					<Token group={group.name} entry={entry} />
					<span {...stylex.props(styles.faint)}>
						{entry.light} · {entry.dark}
					</span>
					<span {...stylex.props(styles.faint)}>{cssVar(group.name, entry.key)}</span>
					<Description entry={entry} roles={roles} />
				</div>
			))}
		</div>
	)
}

function Rows({
	group,
	roles,
	render,
}: {
	group: TokenGroup
	roles?: Record<string, string>
	render?: (entry: TokenEntry) => ReactNode
}) {
	return (
		<div {...stylex.props(styles.rows)}>
			{group.tokens.map((entry) => (
				<div key={entry.key} {...stylex.props(styles.row)}>
					<div>
						<Token group={group.name} entry={entry} />
						<div {...stylex.props(styles.faint)}>
							{String(entry.value ?? `${entry.light} · ${entry.dark}`)}
						</div>
					</div>
					<div>
						{render?.(entry)}
						<Description entry={entry} roles={roles} />
					</div>
				</div>
			))}
		</div>
	)
}

const SECTIONS = [
	["color", "Color"],
	["type", "Type scale"],
	["font", "Fonts"],
	["space", "Space"],
	["corner", "Corners"],
	["shadow", "Elevation"],
	["motion", "Motion"],
	["zIndex", "Stacking (zIndex)"],
	["breakpoint", "Breakpoints"],
	["iconSize", "Icon sizes"],
	["focusRing", "Focus ring"],
	["other", "Other groups"],
] as const

// Only the tokens the language keeps or adds are described; the rest go in Phase 18.
const KEPT: Record<string, Record<string, string>> = {
	color: COLOR_ROLES,
	shadow: SHADOW_ROLES,
	corner: CORNER_ROLES,
}
const g = (name: string) => {
	const group = tokenGroup(name)
	const kept = KEPT[name]
	return group != null && kept != null
		? { ...group, tokens: group.tokens.filter((entry) => entry.key in kept) }
		: group
}
const isSize = (e: TokenEntry) => /^t\d$|^code$|^phoneInput$/.test(e.key)

export function TokensPage() {
	const colorGroup = g("color")
	const typeGroup = g("type")
	const shown = new Set<string>(SECTIONS.map(([id]) => id))
	const others = TOKEN_GROUPS.filter((group) => !shown.has(group.name))
	return (
		<Page>
			<PageHead
				title="Foundations"
				lead={
					<>
						Every value the components use, read from{" "}
						<code {...stylex.props(styles.mono)}>tokens.stylex.ts</code> at build time. In StyleX, import the
						group:{" "}
						<code
							{...stylex.props(styles.mono)}
						>{`import { color, space } from "@anyknown/ui/tokens.stylex"`}</code>
						. Without StyleX, use the matching <code {...stylex.props(styles.mono)}>--ak-*</code> variable
						from <code {...stylex.props(styles.mono)}>@anyknown/ui/tokens.css</code>.
					</>
				}
			>
				<ul {...stylex.props(styles.toc)} aria-label="Token groups">
					{SECTIONS.map(([id, title]) => (
						<li key={id}>
							<a href={`#/tokens/${id}`} {...stylex.props(styles.tocLink)}>
								{title}
							</a>
						</li>
					))}
				</ul>
			</PageHead>

			{colorGroup != null && (
				<Section
					id="color"
					title="Color"
					lead="Neutral gray, chroma 0. Ink is the primary action and the link; blue, red, amber and green each say one status. Colour is for status and goes on text or a 6px dot, never a fill. Each card shows the light and the dark value; dark follows the OS unless a theme is applied."
				>
					<Colors group={colorGroup} roles={COLOR_ROLES} />
				</Section>
			)}

			{typeGroup != null && (
				<Section
					id="type"
					title="Type scale"
					lead="One rem scale: t1–t4 are UI, t5–t7 are headings. Line heights live in the same group."
				>
					<Rows
						group={{ ...typeGroup, tokens: typeGroup.tokens.filter(isSize) }}
						render={(e) => (
							<p {...stylex.props(styles.sample)} style={{ fontSize: String(e.value), lineHeight: 1.2 }}>
								The agent handed off 3 memories · 交接完成
							</p>
						)}
					/>
					<Rows group={{ ...typeGroup, tokens: typeGroup.tokens.filter((e) => !isSize(e)) }} />
				</Section>
			)}

			{g("font") != null && (
				<Section
					id="font"
					title="Fonts"
					lead="Geist for UI and headings, Geist Mono for code and numbers, Noto Sans TC for Chinese."
				>
					<Rows
						group={g("font")!}
						render={(e) => (
							<p
								{...stylex.props(styles.sample)}
								style={{ fontFamily: String(e.value), fontSize: "1.25rem" }}
							>
								Handoff 0123 交接
							</p>
						)}
					/>
				</Section>
			)}

			{g("space") != null && (
				<Section
					id="space"
					title="Space"
					lead="Padding and gaps. rem, so they follow the reader's font size."
				>
					<Rows
						group={g("space")!}
						render={(e) => <div {...stylex.props(styles.bar)} style={{ width: String(e.value) }} />}
					/>
				</Section>
			)}

			{g("corner") != null && (
				<Section
					id="corner"
					title="Corners"
					lead="Three corners. A shape is one line high and fully round; a box grows with its content; the checkbox square is the only 4px."
				>
					<Rows
						group={g("corner")!}
						roles={CORNER_ROLES}
						render={(e) => (
							<div {...stylex.props(styles.cornerBox)} style={{ borderRadius: String(e.value) }} />
						)}
					/>
				</Section>
			)}

			{g("shadow") != null && (
				<Section
					id="shadow"
					title="Elevation"
					lead="Two steps, float → modal. Only things that float have one. Shadows are black, never tinted. Samples render in the current theme."
				>
					<div {...stylex.props(grid.thirds)}>
						{g("shadow")!.tokens.map((entry) => (
							<div key={entry.key} {...stylex.props(styles.card)}>
								<div
									{...stylex.props(styles.shadowBox)}
									style={{ boxShadow: `var(${cssVar("shadow", entry.key)})` }}
								/>
								<Token group="shadow" entry={entry} />
								<Description entry={entry} roles={SHADOW_ROLES} />
							</div>
						))}
					</div>
				</Section>
			)}

			{g("motion") != null && (
				<Section id="motion" title="Motion" lead={g("motion")!.description}>
					<Rows group={g("motion")!} />
				</Section>
			)}

			{g("zIndex") != null && (
				<Section id="zIndex" title="Stacking (zIndex)" lead={g("zIndex")!.description}>
					<Rows group={g("zIndex")!} />
				</Section>
			)}

			{g("breakpoint") != null && (
				<Section id="breakpoint" title="Breakpoints" lead={g("breakpoint")!.description}>
					<Rows group={g("breakpoint")!} />
				</Section>
			)}

			{g("iconSize") != null && (
				<Section id="iconSize" title="Icon sizes" lead={g("iconSize")!.description}>
					<Rows
						group={g("iconSize")!}
						render={(e) => (
							<div
								{...stylex.props(styles.iconBox)}
								style={{ width: String(e.value), height: String(e.value) }}
							/>
						)}
					/>
				</Section>
			)}

			{g("focusRing") != null && (
				<Section id="focusRing" title="Focus ring" lead={g("focusRing")!.description}>
					<Rows group={g("focusRing")!} />
				</Section>
			)}

			<Section id="other" title="Other groups">
				{others.map((group) => (
					<details key={group.name} {...stylex.props(styles.details)}>
						<summary {...stylex.props(styles.summary)}>
							<code {...stylex.props(styles.mono)}>{group.name}</code>
							{group.deprecated !== false && " (deprecated)"} · {group.tokens.length} tokens
						</summary>
						{group.description !== "" && <p {...stylex.props(styles.note)}>{group.description}</p>}
						<Rows group={group} />
					</details>
				))}
			</Section>
		</Page>
	)
}
