import { Toaster } from "@anyknown/ui"
import { color, font, radius, space, text } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { marked } from "marked"
import { useEffect, useState } from "react"
import { BasicsDemos } from "../playground/demos/basics"
import { DesktopDemos } from "../playground/demos/desktop"
import { FormsDemos } from "../playground/demos/forms"
import { StorageDemos } from "../playground/demos/storage"
import componentsReadme from "../src/components/README.md?raw"
import roadmap from "../src/components/ROADMAP.md?raw"
import readme from "../README.md?raw"

const GROUPS: Record<string, string[]> = {
	表單: ["input", "textarea", "label", "checkbox", "radio", "switch", "select", "dropdown"],
	基礎: [
		"dialog",
		"toast",
		"tooltip",
		"popover",
		"tabs",
		"badge",
		"kbd",
		"skeleton",
		"progress",
		"empty-state",
		"scrollbar",
	],
	"Desktop AI": [
		"message",
		"tool-card",
		"reasoning-fold",
		"action-bar",
		"code-block",
		"interaction-card",
		"handoff-receipt",
		"composer",
		"voice-indicator",
	],
	"Storage / 資料": ["password-input", "recovery-key", "dropzone", "file-row", "diff-viewer", "data-table"],
}

const NOTES = Object.fromEntries(
	Object.entries(
		import.meta.glob("../src/components/*/NOTES.md", { query: "?raw", import: "default", eager: true }),
	).map(([path, raw]) => [path.split("/").at(-2)!, raw as string]),
)

// Repo 內的相對連結改指到站內對應頁。
const GUIDES: Record<string, { title: string; body: string }> = {
	readme: {
		title: "開始使用",
		body: readme
			.replace("(./src/components/README.md)", "(#/guide/components)")
			.replace("(./ROADMAP.md)", "(#/guide/roadmap)"),
	},
	components: {
		title: "元件規劃",
		body: componentsReadme.replace("(./ROADMAP.md)", "(#/guide/roadmap)"),
	},
	roadmap: { title: "Roadmap", body: roadmap },
}

type Route =
	| { page: "demo"; anchor?: string }
	| { page: "guide"; key: string }
	| { page: "docs"; name: string }

function parseRoute(hash: string): Route {
	const parts = hash.replace(/^#\/?/, "").split("/")
	if (parts[0] === "docs" && NOTES[parts[1]] != null) return { page: "docs", name: parts[1] }
	if (parts[0] === "guide" && GUIDES[parts[1]] != null) return { page: "guide", key: parts[1] }
	return { page: "demo", anchor: parts[0] === "demo" ? parts[1] : undefined }
}

function useRoute(): Route {
	const [route, setRoute] = useState<Route>(() => parseRoute(location.hash))
	useEffect(() => {
		const onChange = () => setRoute(parseRoute(location.hash))
		window.addEventListener("hashchange", onChange)
		return () => window.removeEventListener("hashchange", onChange)
	}, [])
	return route
}

const styles = stylex.create({
	page: { display: "grid", gridTemplateColumns: "13rem 1fr", minHeight: "100vh" },
	nav: {
		position: "sticky",
		top: 0,
		height: "100vh",
		overflowY: "auto",
		borderRightWidth: 1,
		borderRightStyle: "solid",
		borderRightColor: color.border,
		padding: space.md,
	},
	title: { fontFamily: font.display, fontSize: text.lg, fontWeight: 500, margin: 0, marginBottom: space.md },
	groupName: {
		display: "block",
		fontFamily: font.mono,
		fontSize: "0.62rem",
		fontWeight: 600,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textFaint,
		marginBlock: space.sm,
	},
	link: {
		display: "block",
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		textDecoration: "none",
		fontSize: text.xs,
		paddingBlock: "0.18rem",
		paddingInline: space.xxs,
		borderRadius: radius.sm,
	},
	active: { color: color.text, backgroundColor: color.accentSubtle },
	main: { padding: space.lg, minWidth: 0 },
	docHeader: { display: "flex", alignItems: "baseline", gap: space.sm, marginBottom: space.md },
	demoLink: { fontSize: text.xs, color: color.accentText },
})

function NavLink({ href, current, children }: { href: string; current: boolean; children: string }) {
	return (
		<a
			href={href}
			aria-current={current ? "page" : undefined}
			{...stylex.props(styles.link, current && styles.active)}
		>
			{children}
		</a>
	)
}

function Markdown({ body }: { body: string }) {
	return <div className="prose" dangerouslySetInnerHTML={{ __html: marked.parse(body, { async: false }) }} />
}

function DemoPage({ anchor }: { anchor?: string }) {
	useEffect(() => {
		if (anchor != null) document.getElementById(anchor)?.scrollIntoView()
	}, [anchor])
	return (
		<>
			<FormsDemos />
			<BasicsDemos />
			<DesktopDemos />
			<StorageDemos />
		</>
	)
}

function DocsPage({ name }: { name: string }) {
	useEffect(() => window.scrollTo(0, 0), [name])
	return (
		<>
			<div {...stylex.props(styles.docHeader)}>
				<a href={`#/demo/${name}`} {...stylex.props(styles.demoLink)}>
					實際操作示範 →
				</a>
			</div>
			<Markdown body={NOTES[name]} />
		</>
	)
}

function GuidePage({ guide }: { guide: string }) {
	useEffect(() => window.scrollTo(0, 0), [guide])
	return <Markdown body={GUIDES[guide].body} />
}

export function Site() {
	const route = useRoute()
	return (
		<div {...stylex.props(styles.page)}>
			<nav {...stylex.props(styles.nav)}>
				<h1 {...stylex.props(styles.title)}>@anyknown/ui</h1>
				<b {...stylex.props(styles.groupName)}>指南</b>
				{Object.entries(GUIDES).map(([key, guide]) => (
					<NavLink key={key} href={`#/guide/${key}`} current={route.page === "guide" && route.key === key}>
						{guide.title}
					</NavLink>
				))}
				<NavLink href="#/demo" current={route.page === "demo"}>
					全部示範
				</NavLink>
				{Object.entries(GROUPS).map(([group, names]) => (
					<div key={group}>
						<b {...stylex.props(styles.groupName)}>{group}</b>
						{names.map((name) => (
							<NavLink
								key={name}
								href={`#/docs/${name}`}
								current={route.page === "docs" && route.name === name}
							>
								{name}
							</NavLink>
						))}
					</div>
				))}
			</nav>
			<main {...stylex.props(styles.main)}>
				{route.page === "demo" ? (
					<DemoPage anchor={route.anchor} />
				) : route.page === "docs" ? (
					<DocsPage name={route.name} />
				) : (
					<GuidePage guide={route.key} />
				)}
			</main>
			<Toaster />
		</div>
	)
}
