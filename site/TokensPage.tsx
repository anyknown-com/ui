// Foundations: every token group from src/tokens.stylex.ts, rendered from the generated
// tokens.json so the values here are the values that ship.
import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import type { CSSProperties, ReactNode } from "react"
import { type TokenEntry, type TokenGroup, TOKEN_GROUPS, tokenGroup } from "./content"

const MOBILE = breakpoint.tablet

// tokens.stylex.ts documents most colours with line comments, which the generator cannot
// read; the roles are short enough to keep here.
const COLOR_ROLES: Record<string, string> = {
	bg: "Page background and input fill.",
	surface: "A sheet one step off the page: code blocks, sunken panels.",
	surfaceRaised: "Floating surfaces in dark mode (popover, dialog).",
	border: "Hairlines and dividers. Surfaces separate by tone first.",
	borderStrong: "A divider that must be seen, hover rings.",
	borderControl: "Edges of inputs, checkboxes, radios, switch off: 3:1 against the page.",
	text: "Primary text.",
	textMuted: "Secondary text; ≥ 4.5:1 on every surface.",
	textFaint: "Icons, placeholders, separators, disabled. Not for text you must read.",
	accent: "The primary action: ink. One per view.",
	accentText: "Text on `accent`.",
	accentSubtle: "Secondary buttons, selected rows, hover washes.",
	link: "Links: ink with an underline, never blue.",
	signal: "Blue, only for agent activity, focus and progress.",
	signalSubtle: "Background behind signal content.",
	danger: "Errors and destructive text.",
	dangerSubtle: "Background of an error notice.",
	dangerSolid: "Fill of an irreversible delete button.",
	onDangerSolid: "Text on `dangerSolid`.",
	success: "Success text and icons.",
	successSubtle: "Background of a success notice.",
	warning: "Warning text and icons.",
	warningSubtle: "Background of a warning notice.",
	info: "Same as `signal`.",
	infoSubtle: "Same as `signalSubtle`.",
	focusRing: "Keyboard focus ring (`signal`).",
	scrim: "Dialog backdrop: black 32%, no blur.",
	bone: "Skeleton placeholder.",
	sheen: "Skeleton shimmer.",
	successHl: "Changed characters on an added diff line.",
	dangerHl: "Changed characters on a removed diff line.",
	layer1: "The desk: app rail and page background.",
	layer2: "The main sheet.",
	layer3: "Messages and cards on the sheet.",
	layer4: "A fold inside a message.",
	layer5: "Rows inside a fold; the deepest step.",
}

const SHADOW_ROLES: Record<string, string> = {
	rest: "Cards on the paper: tool card, file row, attachment.",
	float: "Popover, dropdown, select, tooltip, toast.",
	modal: "Dialog and sheet.",
}

const CORNER_ROLES: Record<string, string> = {
	small: "Checkbox, kbd, small chip.",
	control: "Input, select, textarea, segmented.",
	card: "Cards at rest.",
	float: "Toast, popover, dropdown.",
	sheet: "Composer, the main sheet.",
	modal: "Dialog.",
	pill: "Buttons, badges, tags, switch, progress.",
}

const TONE_ROLES: Record<string, string> = {
	layer6: "One step past `layer5` (its hover).",
	faint: "Faint ink for decorations.",
	railLayer2: "Rail surface, one step up.",
	railLayer3: "Rail surface, two steps up.",
}

const styles = stylex.create({
	title: {
		fontFamily: font.display,
		fontSize: type.t6,
		lineHeight: type.dense,
		fontWeight: 600,
		color: color.text,
		marginBlock: `0 ${space.sm}`,
	},
	lead: { fontSize: type.t4, lineHeight: type.snug, color: color.textMuted, maxWidth: "44rem", margin: 0 },
	toc: {
		display: "flex",
		flexWrap: "wrap",
		gap: space.xs,
		marginTop: space.md,
		padding: 0,
		listStyle: "none",
	},
	tocLink: {
		display: "inline-block",
		fontSize: type.t2,
		color: color.text,
		textDecoration: "none",
		backgroundColor: { default: color.accentSubtle, ":hover": color.layer5 },
		borderRadius: corner.pill,
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	section: {
		marginTop: space.xxl,
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr)",
		gap: space.sm,
		minWidth: 0,
		scrollMarginTop: space.lg,
	},
	h2: { fontFamily: font.display, fontSize: type.t5, lineHeight: type.dense, fontWeight: 600, margin: 0 },
	note: { fontSize: type.t2, lineHeight: type.snug, color: color.textMuted, margin: 0, maxWidth: "44rem" },
	mono: { fontFamily: font.mono, fontSize: type.code, color: color.text, overflowWrap: "anywhere" },
	faint: { fontFamily: font.mono, fontSize: type.t1, color: color.textMuted, overflowWrap: "anywhere" },
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(15rem, 1fr))",
		gap: space.sm,
	},
	card: {
		display: "grid",
		gap: space.xxs,
		alignContent: "start",
		backgroundColor: color.layer3,
		borderRadius: corner.card,
		padding: space.sm,
		minWidth: 0,
	},
	swatches: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: space.xxs, marginBottom: space.xxs },
	swatch: {
		height: "3rem",
		borderRadius: corner.small,
		boxShadow: `inset 0 0 0 1px ${color.border}`,
		display: "flex",
		alignItems: "flex-end",
		padding: space.xxs,
	},
	swatchLabel: {
		fontFamily: font.mono,
		fontSize: type.t1,
		backgroundColor: color.bg,
		color: color.text,
		borderRadius: corner.small,
		paddingInline: space.xxs,
	},
	deprecated: {
		fontFamily: font.mono,
		fontSize: type.t1,
		color: color.warning,
		backgroundColor: color.warningSubtle,
		borderRadius: corner.pill,
		paddingInline: space.xs,
		justifySelf: "start",
	},
	rows: { display: "grid", gap: 0 },
	row: {
		display: "grid",
		gridTemplateColumns: { default: "10rem minmax(0, 1fr)", [MOBILE]: "minmax(0, 1fr)" },
		gap: { default: space.md, [MOBILE]: space.xxs },
		alignItems: "center",
		paddingBlock: space.xs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		minWidth: 0,
	},
	sample: { color: color.text, margin: 0, overflowWrap: "anywhere", minWidth: 0 },
	bar: { height: space.sm, backgroundColor: color.signal, borderRadius: corner.pill },
	cornerBox: {
		width: "4rem",
		height: "3rem",
		backgroundColor: color.layer2,
		boxShadow: `inset 0 0 0 1px ${color.borderStrong}`,
	},
	shadowBox: {
		height: "4rem",
		backgroundColor: color.surfaceRaised,
		borderRadius: corner.card,
		marginBlock: space.sm,
	},
	iconBox: {
		backgroundColor: color.text,
		borderRadius: corner.small,
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

function Section({
	id,
	title,
	note,
	children,
}: {
	id: string
	title: string
	note?: ReactNode
	children: ReactNode
}) {
	return (
		<section id={id} aria-labelledby={`${id}-h`} {...stylex.props(styles.section)}>
			<h2 id={`${id}-h`} {...stylex.props(styles.h2)}>
				{title}
			</h2>
			{note != null && <p {...stylex.props(styles.note)}>{note}</p>}
			{children}
		</section>
	)
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
		<div {...stylex.props(styles.grid)}>
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

const g = (name: string) => tokenGroup(name)
const isSize = (e: TokenEntry) => /^t\d$|^code$|^phoneInput$/.test(e.key)

export function TokensPage() {
	const colorGroup = g("color")
	const typeGroup = g("type")
	const shown = new Set<string>([...SECTIONS.map(([id]) => id), "radius"])
	const others = TOKEN_GROUPS.filter((group) => !shown.has(group.name))
	return (
		<article>
			<h1 {...stylex.props(styles.title)}>Foundations</h1>
			<p {...stylex.props(styles.lead)}>
				Every value the components use, read from <code {...stylex.props(styles.mono)}>tokens.stylex.ts</code>{" "}
				at build time. In StyleX, import the group:{" "}
				<code
					{...stylex.props(styles.mono)}
				>{`import { color, space } from "@anyknown/ui/tokens.stylex"`}</code>
				. Without StyleX, use the matching <code {...stylex.props(styles.mono)}>--ak-*</code> variable from{" "}
				<code {...stylex.props(styles.mono)}>@anyknown/ui/tokens.css</code>.
			</p>
			<ul {...stylex.props(styles.toc)} aria-label="Token groups">
				{SECTIONS.map(([id, title]) => (
					<li key={id}>
						<a href={`#/tokens/${id}`} {...stylex.props(styles.tocLink)}>
							{title}
						</a>
					</li>
				))}
			</ul>

			{colorGroup != null && (
				<Section
					id="color"
					title="Color"
					note="Neutral gray, chroma 0. Ink is the primary action; blue (signal) only means the agent is working, focus, or progress. Each card shows the light and the dark value; dark follows the OS unless a theme is applied."
				>
					<Colors group={colorGroup} roles={COLOR_ROLES} />
				</Section>
			)}

			{typeGroup != null && (
				<Section
					id="type"
					title="Type scale"
					note="One rem scale: t1–t4 are UI, t5–t7 are headings. Line heights live in the same group. The old `text` group is deprecated; each of its keys names the replacement."
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
					note="Figtree for UI and headings, Geist Mono for code and numbers, Noto Sans TC for Chinese."
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
					note="Padding and gaps. rem, so they follow the reader's font size."
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
					note="Corners follow size: the closer a surface is to the reader, the rounder. Nested: inner radius = outer − padding. `radius` is the older numeric scale."
				>
					<Rows
						group={g("corner")!}
						roles={CORNER_ROLES}
						render={(e) => (
							<div {...stylex.props(styles.cornerBox)} style={{ borderRadius: String(e.value) }} />
						)}
					/>
					{g("radius") != null && <Rows group={g("radius")!} />}
				</Section>
			)}

			{g("shadow") != null && (
				<Section
					id="shadow"
					title="Elevation"
					note="Three steps, rest → float → modal. Shadows are black, never tinted. Samples render in the current theme."
				>
					<div {...stylex.props(styles.grid)}>
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
				<Section id="motion" title="Motion" note={g("motion")!.description}>
					<Rows group={g("motion")!} />
				</Section>
			)}

			{g("zIndex") != null && (
				<Section id="zIndex" title="Stacking (zIndex)" note={g("zIndex")!.description}>
					<Rows group={g("zIndex")!} />
				</Section>
			)}

			{g("breakpoint") != null && (
				<Section id="breakpoint" title="Breakpoints" note={g("breakpoint")!.description}>
					<Rows group={g("breakpoint")!} />
				</Section>
			)}

			{g("iconSize") != null && (
				<Section id="iconSize" title="Icon sizes" note={g("iconSize")!.description}>
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
				<Section id="focusRing" title="Focus ring" note={g("focusRing")!.description}>
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
						<Rows group={group} roles={group.name === "tone" ? TONE_ROLES : undefined} />
					</details>
				))}
			</Section>
		</article>
	)
}
