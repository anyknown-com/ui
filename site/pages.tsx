import { DEMO_GROUPS } from "../playground/demos"
import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { API, COMPONENT_DOCS, COMPONENT_GROUPS, GUIDES, REPO, guideByKey } from "./content"
import { Markdown, renderMarkdown } from "./Markdown"
import { NotFound } from "./ComponentPage"

const MOBILE = breakpoint.tablet

const styles = stylex.create({
	hero: { display: "grid", gap: space.sm, maxWidth: "44rem" },
	heroTitle: {
		fontFamily: font.display,
		fontSize: type.t7,
		lineHeight: type.dense,
		fontWeight: 600,
		letterSpacing: "-0.01em",
		color: color.text,
		margin: 0,
	},
	lead: { fontSize: type.t4, lineHeight: type.snug, color: color.textMuted, margin: 0 },
	actions: { display: "flex", flexWrap: "wrap", gap: space.xs, marginTop: space.xs },
	primary: {
		display: "inline-flex",
		alignItems: "center",
		minHeight: "2.5rem",
		paddingInline: space.md,
		borderRadius: corner.pill,
		fontSize: type.t2,
		fontWeight: 500,
		textDecoration: "none",
		color: color.accentText,
		backgroundColor: color.accent,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
	},
	secondary: { color: color.text, backgroundColor: { default: color.accentSubtle, ":hover": color.layer5 } },
	install: {
		fontFamily: font.mono,
		fontSize: type.code,
		color: color.text,
		backgroundColor: color.layer3,
		borderRadius: corner.control,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		marginTop: space.sm,
		overflowX: "auto",
		whiteSpace: "pre",
	},
	stats: {
		display: "flex",
		flexWrap: "wrap",
		gap: space.lg,
		marginTop: space.lg,
		fontSize: type.t2,
		color: color.textMuted,
	},
	stat: { display: "grid" },
	statNum: { fontFamily: font.display, fontSize: type.t5, fontWeight: 600, color: color.text },
	group: { marginTop: space.xxl, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: space.sm },
	h2: { fontFamily: font.display, fontSize: type.t5, lineHeight: type.dense, fontWeight: 600, margin: 0 },
	cards: {
		display: "grid",
		gridTemplateColumns: { default: "repeat(auto-fill, minmax(15rem, 1fr))", [MOBILE]: "minmax(0, 1fr)" },
		gap: space.sm,
	},
	card: {
		display: "grid",
		gap: space.xxs,
		alignContent: "start",
		textDecoration: "none",
		color: color.text,
		backgroundColor: { default: color.layer3, ":hover": color.layer4 },
		borderRadius: corner.card,
		paddingBlock: space.sm,
		paddingInline: space.md,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
		minWidth: 0,
	},
	cardTitle: { fontWeight: 600, fontSize: type.t3 },
	cardText: { fontSize: type.t2, lineHeight: type.snug, color: color.textMuted },
	foot: { marginTop: space.xxl, fontSize: type.t2, color: color.textMuted },
	link: { color: color.link, textUnderlineOffset: 2 },
})

/** First sentence of a markdown paragraph, as plain text. */
function plain(markdown: string) {
	const html = renderMarkdown(markdown.split("\n\n")[0] ?? "", "README.md")
	const text = html
		.replace(/<[^>]+>/g, "")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, "&")
		.trim()
	// "… The family exports:" introduces a list the card does not show
	return text.replace(/\s*[^.]*:$/, "")
}

export function HomePage() {
	const exports = API.filter((c) => c.aliasOf == null).length
	return (
		<article>
			<div {...stylex.props(styles.hero)}>
				<h1 {...stylex.props(styles.heroTitle)}>@anyknown/ui</h1>
				<p {...stylex.props(styles.lead)}>
					The design system behind AnyKnown's AI-agent products: React 19 components on StyleX tokens, with a
					chat and agent vocabulary built in. Gray paper on a desk, ink for the one action that matters, and
					blue only when the agent is working.
				</p>
				<div {...stylex.props(styles.actions)}>
					<a href="#/guide/getting-started" {...stylex.props(styles.primary)}>
						Get started
					</a>
					<a href="#/tokens" {...stylex.props(styles.primary, styles.secondary)}>
						Foundations
					</a>
					<a href="#/demo" {...stylex.props(styles.primary, styles.secondary)}>
						All demos
					</a>
				</div>
				<pre {...stylex.props(styles.install)}>pnpm add @anyknown/ui @stylexjs/stylex</pre>
			</div>
			<div {...stylex.props(styles.stats)}>
				<div {...stylex.props(styles.stat)}>
					<span {...stylex.props(styles.statNum)}>{COMPONENT_DOCS.size}</span>component families
				</div>
				<div {...stylex.props(styles.stat)}>
					<span {...stylex.props(styles.statNum)}>{exports}</span>exported components
				</div>
				<div {...stylex.props(styles.stat)}>
					<span {...stylex.props(styles.statNum)}>{GUIDES.length}</span>guides
				</div>
			</div>
			{COMPONENT_GROUPS.map((group) => (
				<section key={group.title} {...stylex.props(styles.group)}>
					<h2 {...stylex.props(styles.h2)}>{group.title}</h2>
					<div {...stylex.props(styles.cards)}>
						{group.names.map((name) => {
							const doc = COMPONENT_DOCS.get(name)
							return (
								<a key={name} href={`#/components/${name}`} {...stylex.props(styles.card)}>
									<span {...stylex.props(styles.cardTitle)}>{doc?.title ?? name}</span>
									{doc != null && <span {...stylex.props(styles.cardText)}>{plain(doc.lead)}</span>}
								</a>
							)
						})}
					</div>
				</section>
			))}
			<p {...stylex.props(styles.foot)}>
				MIT licensed ·{" "}
				<a href={REPO} {...stylex.props(styles.link)}>
					Source on GitHub
				</a>{" "}
				·{" "}
				<a href="/llms.txt" {...stylex.props(styles.link)}>
					llms.txt
				</a>
			</p>
		</article>
	)
}

export function GuidePage({ guideKey }: { guideKey: string }) {
	const guide = guideByKey(guideKey)
	if (guide == null) return <NotFound what={`guide “${guideKey}”`} />
	return (
		<article>
			<Markdown body={guide.body} from={guide.file} />
			<p {...stylex.props(styles.foot)}>
				<a href={`${REPO}/blob/main/${guide.file}`} {...stylex.props(styles.link)}>
					Edit this page
				</a>
			</p>
		</article>
	)
}

/** Every demo on one page, like the playground; `#/demo/<id>` scrolls to one. */
export function DemosPage() {
	return (
		<article>
			{DEMO_GROUPS.map((group) => (
				<section key={group.title}>
					<h2 {...stylex.props(styles.h2, styles.group)}>{group.title}</h2>
					{group.demos.map(({ id, Component }) => (
						<Component key={id} />
					))}
				</section>
			))}
		</article>
	)
}
