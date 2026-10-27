import { DEMO_GROUPS } from "../playground/demos"
import { Button, CodeBlock, StatusBadge, SubThreadRow } from "@anyknown/ui"
import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { COMPONENT_DOCS, COMPONENT_GROUPS, REPO, guideByKey } from "./content"
import { Page, PageHead, Section, grid, item } from "./layout"
import { Markdown } from "./Markdown"
import { NotFound } from "./ComponentPage"
import { SCENES, sceneById } from "./scenes"
import { SceneTiles } from "./situations"
import { BLURBS, Thumbnail } from "./thumbnails"

const styles = stylex.create({
	actions: { display: "flex", flexWrap: "wrap", gap: space.xs, marginTop: space.sm },
	primary: {
		display: "inline-flex",
		alignItems: "center",
		minHeight: "2.5rem",
		paddingInline: space.md,
		borderRadius: corner.shape,
		fontSize: type.t2,
		fontWeight: 500,
		textDecoration: "none",
		color: color.bg,
		backgroundColor: color.text,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
	},
	secondary: { color: color.text, backgroundColor: { default: color.wash, ":hover": color.washHover } },
	hero: { alignItems: "center" },
	heroScene: {
		height: { default: "34rem", [breakpoint.tablet]: "28rem" },
		minWidth: 0,
		padding: space.sm,
		boxSizing: "border-box",
	},
	// Get started: the code blocks of the three ways sit on one line whatever the copy above them.
	way: { gridTemplateRows: "auto 1fr auto auto" },
	// The stage every small specimen and thumbnail sits in: one shape across the site.
	specimen: {
		aspectRatio: "16 / 10",
		boxSizing: "border-box",
		padding: space.lg,
		display: "grid",
		alignContent: "center",
		minWidth: 0,
	},
	center: { display: "flex", alignItems: "center", justifyContent: "center", gap: space.xs },
	flush: { marginInlineStart: 0 },
	badges: { display: "flex", flexWrap: "wrap", gap: space.xs },
	paper: {
		display: "grid",
		alignContent: "start",
		gap: space.xs,
		padding: space.md,
	},
	bar: {
		display: "block",
		height: space.xs,
		width: "60%",
		borderRadius: corner.shape,
		backgroundColor: color.wash,
	},
	barLong: { width: "85%" },
	barShort: { width: "45%" },
	restCard: { marginTop: space.xs },
	figure: { margin: 0 },
	h2: { fontFamily: font.display, fontSize: type.t5, lineHeight: type.dense, fontWeight: 600, margin: 0 },
	group: { marginTop: space.xxl },
	// A catalog card: the thumbnail is the only frame; the text sits under it on the page.
	card: {
		textDecoration: "none",
		color: color.text,
		borderRadius: corner.box,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 3,
	},
	stack: { display: "grid", gap: space.sm, justifyItems: "start" },
	codes: { display: "grid", gap: space.xs, justifySelf: "stretch", maxWidth: "44rem" },
	foot: { fontSize: type.t2, lineHeight: type.snug, color: color.textMuted, margin: 0 },
	link: { color: color.text, textUnderlineOffset: 2 },
})

const AGENT_SCENE = sceneById("agent-working")

// The home page shows the moments only an agent product has; the rest are one click away.
const HOME_SCENES = ["agent-needs-you", "review-changes", "hand-over-files", "voice-call"]

const WAYS = [
	{
		who: "Building an agent app",
		step: "Install the package, then set up StyleX and the theme.",
		lang: "bash",
		code: "pnpm add @anyknown/ui @stylexjs/stylex",
		href: "#/guide/getting-started",
		link: "Getting started",
	},
	{
		who: "Making a one-off page",
		step: "Link the stylesheet and use its ak-* classes. No bundler, no React.",
		lang: "html",
		code: '<link rel="stylesheet" href="https://ui.anyknown.com/brand.css">',
		href: "#/agents",
		link: "For agents",
	},
	{
		who: "Coding in our repos",
		step: "Load the index; it links every guide and component as markdown.",
		lang: "url",
		code: "https://ui.anyknown.com/llms.txt",
		href: "#/components",
		link: "Components",
	},
]

export function HomePage() {
	return (
		<Page>
			<div {...stylex.props(grid.split, styles.hero)}>
				<PageHead
					display
					title="Components for products where an agent does the work"
					lead="@anyknown/ui is the React and StyleX system behind Anyknown. Threads, tool calls, questions for the person, files, voice and settings are built in, and they all look like one product."
				>
					<div {...stylex.props(styles.actions)}>
						<a href="#/situations" {...stylex.props(styles.primary)}>
							See the situations
						</a>
						<a href="#/guide/getting-started" {...stylex.props(styles.primary, styles.secondary)}>
							Get started
						</a>
					</div>
				</PageHead>
				{AGENT_SCENE != null && (
					<div {...stylex.props(styles.heroScene)}>
						<AGENT_SCENE.Scene compact />
					</div>
				)}
			</div>

			<Section
				title="Situations"
				lead="Whole screens built only from @anyknown/ui, each one a moment an agent product has."
				link={{ href: "#/situations", label: `All ${SCENES.length} situations` }}
			>
				<SceneTiles ids={HOME_SCENES} />
			</Section>

			<Section title="Get started">
				<div {...stylex.props(grid.thirds)}>
					{WAYS.map((way) => (
						<div key={way.who} {...stylex.props(item.root, styles.way)}>
							<h3 {...stylex.props(item.title)}>{way.who}</h3>
							<p {...stylex.props(item.line)}>{way.step}</p>
							<CodeBlock lang={way.lang} code={way.code} />
							<a href={way.href} {...stylex.props(item.line, styles.link)}>
								{way.link}
							</a>
						</div>
					))}
				</div>
			</Section>

			<Section title="The rules in one look">
				<div {...stylex.props(grid.thirds)}>
					<figure {...stylex.props(item.root, styles.figure)}>
						<div aria-hidden="true" {...stylex.props(styles.specimen)}>
							<div {...stylex.props(styles.paper)}>
								<span {...stylex.props(styles.bar, styles.barLong)} />
								<span {...stylex.props(styles.bar)} />
								<div {...stylex.props(styles.restCard)}>
									<span {...stylex.props(styles.bar, styles.barShort)} />
								</div>
							</div>
						</div>
						<figcaption {...stylex.props(item.text)}>
							<b {...stylex.props(item.title)}>One sheet, no lines</b>
							<span {...stylex.props(item.line)}>
								Space and weight set the order; only what floats has a shadow.
							</span>
						</figcaption>
					</figure>
					<figure {...stylex.props(item.root, styles.figure)}>
						<div aria-hidden="true" inert {...stylex.props(styles.specimen, styles.center)}>
							<Button variant="secondary" size="sm">
								Save draft
							</Button>
							<Button size="sm">Publish</Button>
						</div>
						<figcaption {...stylex.props(item.text)}>
							<b {...stylex.props(item.title)}>Ink for the one action</b>
							<span {...stylex.props(item.line)}>One solid ink pill per view; everything else is quiet.</span>
						</figcaption>
					</figure>
					<figure {...stylex.props(item.root, styles.figure)}>
						<div aria-hidden="true" inert {...stylex.props(styles.specimen)}>
							<div {...stylex.props(styles.paper)}>
								<div {...stylex.props(styles.badges)}>
									<StatusBadge tone="live">Agent working</StatusBadge>
									<StatusBadge tone="plain">Done</StatusBadge>
								</div>
								<SubThreadRow
									title="Trace retry events"
									status="running"
									onOpenRun={() => {}}
									sx={styles.flush}
								/>
							</div>
						</div>
						<figcaption {...stylex.props(item.text)}>
							<b {...stylex.props(item.title)}>Blue only while the agent works</b>
							<span {...stylex.props(item.line)}>When the work is done, it goes back to gray.</span>
						</figcaption>
					</figure>
				</div>
			</Section>

			<p {...stylex.props(styles.foot)}>
				Runs Anyknown Desktop, Storage and Call · MIT licensed ·{" "}
				<a href={REPO} {...stylex.props(styles.link)}>
					Source on GitHub
				</a>{" "}
				·{" "}
				<a href="/llms.txt" {...stylex.props(styles.link)}>
					llms.txt
				</a>
			</p>
		</Page>
	)
}

/** The catalog index: every family by group, each card a live thumbnail, its name and one line. */
export function ComponentsPage() {
	return (
		<Page>
			<PageHead
				title="Components"
				lead={`${COMPONENT_DOCS.size} component families, grouped by the job they do. Each page has demos, the rules for when to use it, and its full API.`}
			/>
			{COMPONENT_GROUPS.map((group) => (
				<Section key={group.title} title={group.title}>
					<div {...stylex.props(grid.thirds)}>
						{group.names.map((name) => (
							<a
								key={name}
								href={`#/components/${name}`}
								{...stylex.props(stylex.defaultMarker(), item.root, styles.card)}
							>
								<Thumbnail name={name} />
								<span {...stylex.props(item.text)}>
									<span {...stylex.props(item.title, item.hoverTitle)}>
										{COMPONENT_DOCS.get(name)?.title ?? name}
									</span>
									<span {...stylex.props(item.line)}>{BLURBS[name]}</span>
								</span>
							</a>
						))}
					</div>
				</Section>
			))}
		</Page>
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
		<Page>
			<PageHead
				title="For agents"
				lead="Three plain-text files at fixed URLs. An agent loads one of these instead of reading this site."
			/>
			{AGENT_FILES.map((file) => (
				<Section key={file.name} title={file.name} lead={file.what}>
					<div {...stylex.props(styles.stack)}>
						<p {...stylex.props(item.line)}>{file.when}</p>
						<div {...stylex.props(styles.codes)}>
							{file.urls.map((url) => (
								<CodeBlock key={url} lang="url" code={url} />
							))}
						</div>
					</div>
				</Section>
			))}
		</Page>
	)
}

export function GuidePage({ guideKey }: { guideKey: string }) {
	const guide = guideByKey(guideKey)
	if (guide == null) return <NotFound what={`guide “${guideKey}”`} />
	return (
		<Page>
			<Markdown body={guide.body} from={guide.file} />
			<p {...stylex.props(styles.foot)}>
				<a href={`${REPO}/blob/main/${guide.file}`} {...stylex.props(styles.link)}>
					Edit this page
				</a>
			</p>
		</Page>
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
