import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { NotFound } from "./ComponentPage"
import { SCENES, sceneById, type SceneEntry } from "./scenes"
import { SceneFrame, ScenePreview } from "./scenes/SceneFrame"

const TABLET = breakpoint.tablet
const MOBILE = breakpoint.phone

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
	tiles: {
		display: "grid",
		gridTemplateColumns: {
			default: "repeat(4, minmax(0, 1fr))",
			[TABLET]: "repeat(2, minmax(0, 1fr))",
		},
		gap: { default: space.md, [MOBILE]: space.sm },
	},
	tilesPage: { marginTop: space.xl, gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))" },
	tile: {
		display: "grid",
		alignContent: "start",
		gap: space.xs,
		minWidth: 0,
		color: color.text,
		textDecoration: "none",
		borderRadius: corner.card,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
	},
	tileTitle: {
		fontWeight: 600,
		fontSize: type.t3,
		lineHeight: type.tight,
		textDecoration: { default: "none", ":hover": "underline" },
		textUnderlineOffset: 2,
	},
	tileMoment: {
		fontSize: type.t2,
		lineHeight: type.snug,
		color: color.textMuted,
		display: "-webkit-box",
		WebkitLineClamp: 3,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
	},
	pager: {
		display: "flex",
		justifyContent: "space-between",
		gap: space.sm,
		marginTop: space.xxl,
		fontSize: type.t2,
	},
	pagerLink: { color: color.link, textUnderlineOffset: 2 },
})

/** One situation as a link: live preview, title, and (unless `short`) its moment. */
export function SceneTile({ entry, short }: { entry: SceneEntry; short?: boolean }) {
	return (
		<a href={`#/situations/${entry.meta.id}`} {...stylex.props(styles.tile)}>
			<ScenePreview entry={entry} />
			<span {...stylex.props(styles.tileTitle)}>{entry.meta.title}</span>
			{!short && <span {...stylex.props(styles.tileMoment)}>{entry.meta.moment}</span>}
		</a>
	)
}

export function SceneTiles({ short, page }: { short?: boolean; page?: boolean }) {
	return (
		<div {...stylex.props(styles.tiles, page && styles.tilesPage)}>
			{SCENES.map((entry) => (
				<SceneTile key={entry.meta.id} entry={entry} short={short} />
			))}
		</div>
	)
}

export function SituationsPage() {
	return (
		<article>
			<h1 {...stylex.props(styles.title)}>Situations</h1>
			<p {...stylex.props(styles.lead)}>
				The moments an agent product has, each one a full screen built only from @anyknown/ui. Open one to see
				it run, switch on Inspect to see which component is which, and read why it looks the way it does.
			</p>
			<SceneTiles page />
		</article>
	)
}

export function SituationPage({ id }: { id: string }) {
	const entry = sceneById(id)
	if (entry == null) return <NotFound what={`situation “${id}”`} />
	const index = SCENES.indexOf(entry)
	const prev = SCENES[index - 1]
	const next = SCENES[index + 1]
	return (
		<>
			<SceneFrame entry={entry} />
			<nav aria-label="More situations" {...stylex.props(styles.pager)}>
				{prev != null ? (
					<a href={`#/situations/${prev.meta.id}`} {...stylex.props(styles.pagerLink)}>
						← {prev.meta.title}
					</a>
				) : (
					<span />
				)}
				{next != null && (
					<a href={`#/situations/${next.meta.id}`} {...stylex.props(styles.pagerLink)}>
						{next.meta.title} →
					</a>
				)}
			</nav>
		</>
	)
}
