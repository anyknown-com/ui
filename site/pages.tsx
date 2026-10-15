import { DEMO_GROUPS } from "../playground/demos"
import { Button, CodeBlock, ToolCard } from "@anyknown/ui"
import { breakpoint, color, corner, font, shadow, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { COMPONENT_DOCS, COMPONENT_GROUPS, REPO, guideByKey } from "./content"
import { Markdown, renderMarkdown } from "./Markdown"
import { NotFound } from "./ComponentPage"
import { sceneById } from "./scenes"
import { SceneTiles } from "./situations"
import { Thumbnail } from "./thumbnails"

const MOBILE = breakpoint.tablet

const styles = stylex.create({
	hero: {
		display: "grid",
		gridTemplateColumns: { default: "minmax(0, 5fr) minmax(0, 7fr)", [MOBILE]: "minmax(0, 1fr)" },
		alignItems: "center",
		gap: { default: space.xl, [MOBILE]: space.lg },
	},
	heroText: { display: "grid", gap: space.sm, alignContent: "center" },
	heroTitle: {
		fontFamily: font.display,
		fontSize: type.t7,
		lineHeight: type.dense,
		fontWeight: 600,
		letterSpacing: "-0.01em",
		color: color.text,
		margin: 0,
		textWrap: "balance",
	},
	pageTitle: {
		fontFamily: font.display,
		fontSize: type.t6,
		lineHeight: type.dense,
		fontWeight: 600,
		color: color.text,
		marginBlock: `0 ${space.sm}`,
	},
	lead: { fontSize: type.t4, lineHeight: type.snug, color: color.textMuted, maxWidth: "44rem", margin: 0 },
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
	heroScene: {
		height: { default: "34rem", [MOBILE]: "30rem" },
		minWidth: 0,
		padding: { default: space.sm, [MOBILE]: space.xs },
		boxSizing: "border-box",
		backgroundColor: color.layer1,
		borderRadius: corner.sheet,
	},
	section: { marginTop: space.xxl, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: space.md },
	sectionHead: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: space.sm },
	h3: { fontWeight: 600, fontSize: type.t3, lineHeight: type.tight, color: color.text, margin: 0 },
	muted: { fontSize: type.t2, lineHeight: type.snug, color: color.textMuted, margin: 0 },
	body: { fontSize: type.t3, lineHeight: type.body, color: color.text, margin: 0, maxWidth: "44rem" },
	ways: {
		display: "grid",
		gridTemplateColumns: { default: "repeat(3, minmax(0, 1fr))", [MOBILE]: "minmax(0, 1fr)" },
		gap: { default: space.lg, [MOBILE]: space.xl },
	},
	way: { display: "grid", alignContent: "start", gap: space.xs, minWidth: 0 },
	products: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		display: "grid",
		gridTemplateColumns: { default: "repeat(3, minmax(0, 1fr))", [MOBILE]: "minmax(0, 1fr)" },
		gap: space.lg,
	},
	product: { display: "grid", alignContent: "start", gap: space.xxs },
	rules: {
		display: "grid",
		gridTemplateColumns: { default: "repeat(3, minmax(0, 1fr))", [MOBILE]: "minmax(0, 1fr)" },
		gap: { default: space.lg, [MOBILE]: space.xl },
	},
	rule: { margin: 0, display: "grid", alignContent: "start", gap: space.sm, minWidth: 0 },
	specimen: {
		minHeight: "12rem",
		boxSizing: "border-box",
		padding: space.md,
		backgroundColor: color.layer3,
		borderRadius: corner.card,
	},
	center: { display: "flex", alignItems: "center", justifyContent: "center", gap: space.xs },
	stack: { display: "grid", alignContent: "center", gap: space.xs },
	deskSpecimen: { backgroundColor: color.layer1, display: "grid" },
	paper: {
		display: "grid",
		alignContent: "start",
		gap: space.xs,
		padding: space.md,
		backgroundColor: color.layer2,
		borderRadius: corner.card,
	},
	bar: {
		display: "block",
		height: space.xs,
		width: "60%",
		borderRadius: corner.pill,
		backgroundColor: color.bone,
	},
	barLong: { width: "85%" },
	barShort: { width: "45%" },
	restCard: {
		marginTop: space.xs,
		padding: space.sm,
		backgroundColor: color.layer2,
		borderRadius: corner.control,
		boxShadow: shadow.rest,
	},
	caption: { display: "grid", gap: space.xxs },
	agentFile: {
		marginTop: space.xl,
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr)",
		gap: space.xs,
		maxWidth: "44rem",
	},
	group: { marginTop: space.xxl, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: space.sm },
	h2: { fontFamily: font.display, fontSize: type.t5, lineHeight: type.dense, fontWeight: 600, margin: 0 },
	cards: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))",
		gap: space.sm,
	},
	// A recessed surface holding the paper stage; the stage's corner is this one minus the padding.
	card: {
		display: "grid",
		gap: space.xs,
		alignContent: "start",
		textDecoration: "none",
		color: color.text,
		backgroundColor: { default: color.layer3, ":hover": color.layer4 },
		borderRadius: corner.card,
		padding: space.xs,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
		minWidth: 0,
	},
	cardBody: { display: "grid", gap: space.xxs, paddingInline: space.xs, paddingBottom: space.xs },
	cardTitle: { fontWeight: 600, fontSize: type.t3 },
	cardText: {
		fontSize: type.t2,
		lineHeight: type.snug,
		color: color.textMuted,
		display: "-webkit-box",
		WebkitLineClamp: 2,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
	},
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

const AGENT_SCENE = sceneById("agent-working")

const WAYS = [
	{
		who: "Building an agent app",
		step: "Install the package, then follow Getting started to set up StyleX and the theme.",
		lang: "bash",
		code: "pnpm add @anyknown/ui @stylexjs/stylex",
		href: "#/guide/getting-started",
		link: "Getting started",
	},
	{
		who: "Making a one-off page",
		step: "Link the stylesheet and lay the page out with its ak-* classes. No bundler, no React.",
		lang: "html",
		code: '<link rel="stylesheet" href="https://ui.anyknown.com/brand.css">',
		href: "#/agents",
		link: "For agents",
	},
	{
		who: "Coding in our repos",
		step: "Load the index; it links every guide and component page as plain markdown.",
		lang: "url",
		code: "https://ui.anyknown.com/llms.txt",
		href: "#/components",
		link: "Components",
	},
]

// What each product imports from @anyknown/ui today, read from its source.
const PRODUCTS = [
	{
		name: "Anyknown Desktop",
		uses: "Groups and settings cells, segmented controls and switches, live dots and status badges, bubbles, markdown, attachments and dialogs, across the whole shell.",
	},
	{
		name: "Anyknown Storage",
		uses: "List rows with letter and icon tiles, the password input that unlocks the vault, fields and spinners.",
	},
	{
		name: "Anyknown Call",
		uses: "The call bar and live dot in the web dock, with empty states and toasts around them.",
	},
]

export function HomePage() {
	return (
		<article>
			<div {...stylex.props(styles.hero)}>
				<div {...stylex.props(styles.heroText)}>
					<h1 {...stylex.props(styles.heroTitle)}>Components for products where an agent does the work</h1>
					<p {...stylex.props(styles.lead)}>
						@anyknown/ui is the React and StyleX system behind Anyknown. Threads, tool calls, questions for
						the person, files, voice and settings are built in, and they all look like one product.
					</p>
					<div {...stylex.props(styles.actions)}>
						<a href="#/situations" {...stylex.props(styles.primary)}>
							See the situations
						</a>
						<a href="#/guide/getting-started" {...stylex.props(styles.primary, styles.secondary)}>
							Get started
						</a>
					</div>
				</div>
				{AGENT_SCENE != null && (
					<div {...stylex.props(styles.heroScene)}>
						<AGENT_SCENE.Scene compact />
					</div>
				)}
			</div>

			<section {...stylex.props(styles.section)}>
				<div {...stylex.props(styles.sectionHead)}>
					<h2 {...stylex.props(styles.h2)}>Situations</h2>
					<a href="#/situations" {...stylex.props(styles.link)}>
						All situations
					</a>
				</div>
				<SceneTiles short />
			</section>

			<section {...stylex.props(styles.section)}>
				<h2 {...stylex.props(styles.h2)}>Three ways in</h2>
				<div {...stylex.props(styles.ways)}>
					{WAYS.map((way) => (
						<div key={way.who} {...stylex.props(styles.way)}>
							<h3 {...stylex.props(styles.h3)}>{way.who}</h3>
							<p {...stylex.props(styles.muted)}>{way.step}</p>
							<CodeBlock lang={way.lang} code={way.code} />
							<a href={way.href} {...stylex.props(styles.link)}>
								{way.link}
							</a>
						</div>
					))}
				</div>
			</section>

			<section {...stylex.props(styles.section)}>
				<h2 {...stylex.props(styles.h2)}>Shipping in</h2>
				<ul {...stylex.props(styles.products)}>
					{PRODUCTS.map((product) => (
						<li key={product.name} {...stylex.props(styles.product)}>
							<span {...stylex.props(styles.h3)}>{product.name}</span>
							<span {...stylex.props(styles.muted)}>{product.uses}</span>
						</li>
					))}
				</ul>
			</section>

			<section {...stylex.props(styles.section)}>
				<h2 {...stylex.props(styles.h2)}>The rules in one look</h2>
				<div {...stylex.props(styles.rules)}>
					<figure {...stylex.props(styles.rule)}>
						<div aria-hidden="true" {...stylex.props(styles.specimen, styles.deskSpecimen)}>
							<div {...stylex.props(styles.paper)}>
								<span {...stylex.props(styles.bar, styles.barLong)} />
								<span {...stylex.props(styles.bar)} />
								<div {...stylex.props(styles.restCard)}>
									<span {...stylex.props(styles.bar, styles.barShort)} />
								</div>
							</div>
						</div>
						<figcaption {...stylex.props(styles.caption)}>
							<b {...stylex.props(styles.h3)}>Gray desk, white paper</b>
							<span {...stylex.props(styles.muted)}>
								Depth comes from tone and shadow. Cards are paper on paper, not boxes with borders.
							</span>
						</figcaption>
					</figure>
					<figure {...stylex.props(styles.rule)}>
						<div aria-hidden="true" inert {...stylex.props(styles.specimen, styles.center)}>
							<Button variant="secondary" size="sm">
								Save draft
							</Button>
							<Button size="sm">Publish</Button>
						</div>
						<figcaption {...stylex.props(styles.caption)}>
							<b {...stylex.props(styles.h3)}>Ink for the one action</b>
							<span {...stylex.props(styles.muted)}>
								One solid ink pill per view. Everything else is sunken or quiet, and links are ink too.
							</span>
						</figcaption>
					</figure>
					<figure {...stylex.props(styles.rule)}>
						<div aria-hidden="true" inert {...stylex.props(styles.specimen, styles.stack)}>
							<ToolCard tool="shell" state="running" subtitle="pnpm test" />
							<ToolCard tool="read" state="completed" subtitle="turn.ts" durationMs={300} />
						</div>
						<figcaption {...stylex.props(styles.caption)}>
							<b {...stylex.props(styles.h3)}>Blue only while the agent works</b>
							<span {...stylex.props(styles.muted)}>
								Blue means running, focus or progress. When the work is done, it goes back to gray.
							</span>
						</figcaption>
					</figure>
				</div>
			</section>

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

/** The catalog index: every family by group, each card a live thumbnail, its name and its purpose. */
export function ComponentsPage() {
	return (
		<article>
			<h1 {...stylex.props(styles.pageTitle)}>Components</h1>
			<p {...stylex.props(styles.lead)}>
				{COMPONENT_DOCS.size} component families, grouped by the job they do. Each page has demos, the rules
				for when to use it, and its full API.
			</p>
			{COMPONENT_GROUPS.map((group) => (
				<section key={group.title} {...stylex.props(styles.group)}>
					<h2 {...stylex.props(styles.h2)}>{group.title}</h2>
					<div {...stylex.props(styles.cards)}>
						{group.names.map((name) => {
							const doc = COMPONENT_DOCS.get(name)
							return (
								<a key={name} href={`#/components/${name}`} {...stylex.props(styles.card)}>
									<Thumbnail name={name} />
									<span {...stylex.props(styles.cardBody)}>
										<span {...stylex.props(styles.cardTitle)}>{doc?.title ?? name}</span>
										{doc != null && <span {...stylex.props(styles.cardText)}>{plain(doc.lead)}</span>}
									</span>
								</a>
							)
						})}
					</div>
				</section>
			))}
		</article>
	)
}

const AGENT_FILES = [
	{
		name: "design.md",
		what: "Judgment for laying out a page: which of three skeletons to pick, how to lay out evidence, and what must never appear. It ends with the token table and the brand.css vocabulary.",
		when: "Load it before you lay out any page.",
		urls: ["https://ui.anyknown.com/design.md"],
	},
	{
		name: "brand.css",
		what: "The whole look for a one-off HTML page: the --ak-* variables and the ak-* classes, light and dark. A class that is not in it is not allowed.",
		when: "Link it from the page’s <head>; no bundler or React needed.",
		urls: ["https://ui.anyknown.com/brand.css"],
	},
	{
		name: "llms.txt and llms-full.txt",
		what: "The index of this site as plain markdown links, and the same content inlined into one file.",
		when: "Use llms.txt to find one page; use llms-full.txt when you want everything in one read.",
		urls: ["https://ui.anyknown.com/llms.txt", "https://ui.anyknown.com/llms-full.txt"],
	},
]

export function AgentsPage() {
	return (
		<article>
			<h1 {...stylex.props(styles.pageTitle)}>For agents</h1>
			<p {...stylex.props(styles.lead)}>
				Three plain-text files at fixed URLs. An agent loads one of these instead of reading this site.
			</p>
			{AGENT_FILES.map((file) => (
				<section key={file.name} {...stylex.props(styles.agentFile)}>
					<h2 {...stylex.props(styles.h2)}>{file.name}</h2>
					<p {...stylex.props(styles.body)}>{file.what}</p>
					<p {...stylex.props(styles.muted)}>{file.when}</p>
					{file.urls.map((url) => (
						<CodeBlock key={url} lang="url" code={url} />
					))}
				</section>
			))}
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
