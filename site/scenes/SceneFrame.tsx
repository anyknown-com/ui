// How a scene is shown: the full frame on its situation page, and the small scaled preview on
// tiles. Scenes never import this file.
import { Switch } from "@anyknown/ui"
import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { COMPONENT_DOCS } from "../content"
import { InspectContext } from "./Inspect"
import type { SceneEntry } from "./scene"

const MOBILE = breakpoint.phone

const styles = stylex.create({
	crumb: {
		fontSize: type.t2,
		color: { default: color.textMuted, ":hover": color.text },
		textUnderlineOffset: 2,
	},
	title: {
		fontFamily: font.display,
		fontSize: type.t6,
		lineHeight: type.dense,
		fontWeight: 600,
		color: color.text,
		marginBlock: `${space.xs} ${space.sm}`,
	},
	moment: { fontSize: type.t4, lineHeight: type.snug, color: color.textMuted, maxWidth: "44rem", margin: 0 },
	bar: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.sm,
		marginTop: space.lg,
		marginBottom: space.sm,
	},
	barNote: { fontSize: type.t2, color: color.textMuted, margin: 0 },
	// The desk the scene's paper lies on, recessed into the page's own sheet.
	desk: {
		backgroundColor: color.layer1,
		borderRadius: corner.sheet,
		padding: { default: space.lg, [MOBILE]: space.xs },
		minWidth: 0,
	},
	section: { marginTop: space.xl, display: "grid", gap: space.sm },
	h2: {
		fontFamily: font.display,
		fontSize: type.t5,
		lineHeight: type.dense,
		fontWeight: 600,
		color: color.text,
		margin: 0,
	},
	decisions: {
		margin: 0,
		paddingInlineStart: space.lg,
		display: "grid",
		gap: space.xs,
		maxWidth: "44rem",
		fontSize: type.t3,
		lineHeight: type.body,
		color: color.text,
	},
	uses: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: space.xs },
	use: {
		display: "inline-flex",
		alignItems: "center",
		minHeight: "2.25rem",
		paddingInline: space.sm,
		borderRadius: corner.control,
		fontSize: type.t2,
		fontWeight: 500,
		color: color.text,
		textDecoration: "none",
		backgroundColor: { default: color.layer3, ":hover": color.layer4 },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	// Preview: the compact scene laid out at 2.5× the tile's size, then scaled down to fit.
	preview: {
		position: "relative",
		overflow: "hidden",
		aspectRatio: "4 / 3",
		backgroundColor: color.layer1,
		borderRadius: corner.card,
	},
	previewInner: {
		position: "absolute",
		insetBlockStart: 0,
		insetInlineStart: 0,
		width: "250%",
		height: "250%",
		padding: space.lg,
		boxSizing: "border-box",
		transform: "scale(0.4)",
		transformOrigin: "0 0",
		pointerEvents: "none",
	},
})

export function SceneFrame({ entry }: { entry: SceneEntry }) {
	const { meta, Scene } = entry
	const [inspect, setInspect] = useState(false)
	return (
		<article>
			<a href="#/situations" {...stylex.props(styles.crumb)}>
				Situations
			</a>
			<h1 {...stylex.props(styles.title)}>{meta.title}</h1>
			<p {...stylex.props(styles.moment)}>{meta.moment}</p>
			<div {...stylex.props(styles.bar)}>
				<p {...stylex.props(styles.barNote)}>Built only from @anyknown/ui. Try it in light, dark and on a phone.</p>
				<Switch label="Inspect" checked={inspect} onCheckedChange={setInspect} />
			</div>
			<div {...stylex.props(styles.desk)}>
				<InspectContext value={inspect}>
					<Scene />
				</InspectContext>
			</div>
			<section {...stylex.props(styles.section)}>
				<h2 {...stylex.props(styles.h2)}>Why it looks like this</h2>
				<ol {...stylex.props(styles.decisions)}>
					{meta.decisions.map((decision) => (
						<li key={decision}>{decision}</li>
					))}
				</ol>
			</section>
			<section {...stylex.props(styles.section)}>
				<h2 {...stylex.props(styles.h2)}>Components used</h2>
				<ul {...stylex.props(styles.uses)}>
					{meta.uses.map((name) => (
						<li key={name}>
							<a href={`#/components/${name}`} {...stylex.props(styles.use)}>
								{COMPONENT_DOCS.get(name)?.title ?? name}
							</a>
						</li>
					))}
				</ul>
			</section>
		</article>
	)
}

/** A small live render of the scene for tiles: not focusable, not clickable, hidden from readers. */
export function ScenePreview({ entry }: { entry: SceneEntry }) {
	const { Scene } = entry
	return (
		<div aria-hidden="true" inert {...stylex.props(styles.preview)}>
			<div {...stylex.props(styles.previewInner)}>
				<Scene compact />
			</div>
		</div>
	)
}
