// How a scene is shown: the full frame on its situation page, and the small scaled preview on
// tiles. Scenes never import this file.
import { Switch } from "@anyknown/ui"
import { breakpoint, color, corner, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { COMPONENT_DOCS } from "../content"
import { PageHead, Section, grid } from "../layout"
import { InspectContext } from "./Inspect"
import type { SceneEntry } from "./scene"

const MOBILE = breakpoint.phone

// Tiles lay the compact scene out larger than the tile, then scale it down to fit: big enough
// that the scene's text still reads, small enough that the whole moment is in view.
const PREVIEW_SCALE = 0.75

const styles = stylex.create({
	stage: { display: "grid", gap: space.sm, minWidth: 0 },
	bar: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		columnGap: space.lg,
		rowGap: space.xs,
	},
	barNote: { fontSize: type.t2, lineHeight: type.snug, color: color.textMuted, margin: 0 },
	// The desk the scene's paper lies on, recessed into the page's own sheet.
	// In dark the desk step sits too close to the sheet, so media frames take layer4 there.
	desk: {
		backgroundColor: `light-dark(${color.layer1}, ${color.layer4})`,
		borderRadius: corner.sheet,
		padding: { default: space.lg, [MOBILE]: space.xs },
		minWidth: 0,
	},
	decisions: {
		margin: 0,
		paddingInlineStart: space.lg,
		display: "grid",
		gap: space.sm,
		fontSize: type.t3,
		lineHeight: type.body,
		color: color.text,
		textWrap: "pretty",
	},
	uses: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		display: "flex",
		flexWrap: "wrap",
		alignContent: "start",
		gap: space.xs,
	},
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
	preview: {
		position: "relative",
		overflow: "hidden",
		aspectRatio: "16 / 10",
		backgroundColor: `light-dark(${color.layer1}, ${color.layer4})`,
		borderRadius: corner.card,
	},
	previewInner: {
		position: "absolute",
		insetBlockStart: 0,
		insetInlineStart: 0,
		width: `calc(100% / ${PREVIEW_SCALE})`,
		height: `calc(100% / ${PREVIEW_SCALE})`,
		padding: space.lg,
		boxSizing: "border-box",
		transform: `scale(${PREVIEW_SCALE})`,
		transformOrigin: "0 0",
		pointerEvents: "none",
	},
})

/** A situation page's blocks: head, the live scene, then why it looks so and what it uses. */
export function SceneFrame({ entry }: { entry: SceneEntry }) {
	const { meta, Scene } = entry
	const [inspect, setInspect] = useState(false)
	return (
		<>
			<PageHead crumb={{ href: "#/situations", label: "Situations" }} title={meta.title} lead={meta.moment} />
			<div {...stylex.props(styles.stage)}>
				<div {...stylex.props(styles.bar)}>
					<p {...stylex.props(styles.barNote)}>
						Built only from @anyknown/ui. Try it in light, dark and on a phone.
					</p>
					<Switch label="Inspect" checked={inspect} onCheckedChange={setInspect} />
				</div>
				<div {...stylex.props(styles.desk)}>
					<InspectContext value={inspect}>
						<Scene />
					</InspectContext>
				</div>
			</div>
			<div {...stylex.props(grid.halves)}>
				<Section title="Why it looks like this">
					<ol {...stylex.props(styles.decisions)}>
						{meta.decisions.map((decision) => (
							<li key={decision}>{decision}</li>
						))}
					</ol>
				</Section>
				<Section title="Components used">
					<ul {...stylex.props(styles.uses)}>
						{meta.uses.map((name) => (
							<li key={name}>
								<a href={`#/components/${name}`} {...stylex.props(styles.use)}>
									{COMPONENT_DOCS.get(name)?.title ?? name}
								</a>
							</li>
						))}
					</ul>
				</Section>
			</div>
		</>
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
