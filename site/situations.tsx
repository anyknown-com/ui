import { color, corner, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { NotFound } from "./ComponentPage"
import { Page, PageHead, grid, item } from "./layout"
import { SCENES, sceneById, type SceneEntry } from "./scenes"
import { SceneFrame, ScenePreview } from "./scenes/SceneFrame"

const styles = stylex.create({
	tile: {
		color: color.text,
		textDecoration: "none",
		borderRadius: corner.card,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
	},
	pager: {
		display: "flex",
		justifyContent: "space-between",
		gap: space.sm,
		fontSize: type.t3,
	},
	pagerLink: { color: color.link, textUnderlineOffset: 2 },
})

// One line per situation for its tile; the full moment is on the situation's own page.
const TAGLINES: Record<string, string> = {
	"agent-working": "The agent reads, runs tools and shows how far it got.",
	"agent-needs-you": "The agent stops to ask; you answer in the thread.",
	"review-changes": "Read what the agent changed, file by file, then decide.",
	"hand-over-files": "Files wait in the composer, then travel with your message.",
	"voice-call": "The composer becomes a call bar; speech lands as text.",
	vault: "Unlock encrypted files and keep the recovery key once.",
	"settings-and-plan": "Change how the app behaves and see what is left this month.",
	"data-editing": "Fix a memory where it stands and forget the stale ones.",
}

/** One situation as a link: live preview, title and one line. */
export function SceneTile({ entry }: { entry: SceneEntry }) {
	return (
		<a
			href={`#/situations/${entry.meta.id}`}
			{...stylex.props(stylex.defaultMarker(), item.root, styles.tile)}
		>
			<ScenePreview entry={entry} />
			<span {...stylex.props(item.text)}>
				<span {...stylex.props(item.title, item.hoverTitle)}>{entry.meta.title}</span>
				<span {...stylex.props(item.line)}>{TAGLINES[entry.meta.id] ?? entry.meta.moment}</span>
			</span>
		</a>
	)
}

/** Situation tiles, two to a row. `ids` picks and orders a subset; all of them by default. */
export function SceneTiles({ ids }: { ids?: string[] }) {
	const entries = ids == null ? SCENES : SCENES.filter((entry) => ids.includes(entry.meta.id))
	return (
		<div {...stylex.props(grid.halves)}>
			{entries.map((entry) => (
				<SceneTile key={entry.meta.id} entry={entry} />
			))}
		</div>
	)
}

export function SituationsPage() {
	return (
		<Page>
			<PageHead
				title="Situations"
				lead="The moments an agent product has, each one a full screen built only from @anyknown/ui. Open one to see it run, switch on Inspect to see which component is which, and read why it looks the way it does."
			/>
			<SceneTiles />
		</Page>
	)
}

export function SituationPage({ id }: { id: string }) {
	const entry = sceneById(id)
	if (entry == null) return <NotFound what={`situation “${id}”`} />
	const index = SCENES.indexOf(entry)
	const prev = SCENES[index - 1]
	const next = SCENES[index + 1]
	return (
		<Page>
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
		</Page>
	)
}
