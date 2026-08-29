import { Toaster } from "@anyknown/ui"
import { dark, light } from "@anyknown/ui/themes.stylex"
import { color, font, radius, space, text } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { marked } from "marked"
import { useEffect, useState } from "react"
import { BasicsDemos } from "../playground/demos/basics"
import { DesktopDemos } from "../playground/demos/desktop"
import { FormsDemos } from "../playground/demos/forms"
import { StorageDemos } from "../playground/demos/storage"
import componentsReadme from "../src/components/README.md?raw"
import componentsDoc from "../src/components/COMPONENTS.md?raw"
import textureGuide from "../src/components/TEXTURE-GUIDE.md?raw"
import a11yDebt from "../src/components/A11Y-DEBT.md?raw"
import readme from "../README.md?raw"

const GROUPS: Record<string, string[]> = {
	表單: ["input", "textarea", "label", "checkbox", "radio", "switch", "select", "dropdown"],
	基礎: [
		"button",
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

// Repo 內的相對連結改指到站內對應頁。
const GUIDES: Record<string, { title: string; body: string }> = {
	readme: {
		title: "開始使用",
		body: readme
			.replace("(./src/components/README.md)", "(#/guide/components)")
			.replace("(./src/components/TEXTURE-GUIDE.md)", "(#/guide/texture)"),
	},
	components: {
		title: "元件總覽",
		body: componentsReadme
			.replace("(./TEXTURE-GUIDE.md)", "(#/guide/texture)")
			.replace("(./A11Y-DEBT.md)", "(#/guide/a11y)"),
	},
	decisions: {
		title: "元件決定紀錄",
		body: componentsDoc
			.replace("(./TEXTURE-GUIDE.md)", "(#/guide/texture)")
			.replace("(./A11Y-DEBT.md)", "(#/guide/a11y)"),
	},
	texture: {
		title: "織物設計語言",
		body: textureGuide.replace("(./A11Y-DEBT.md)", "(#/guide/a11y)"),
	},
	a11y: { title: "a11y 偏差", body: a11yDebt },
}

type Route = { page: "demo"; anchor?: string } | { page: "guide"; key: string }

function parseRoute(hash: string): Route {
	const parts = hash.replace(/^#\/?/, "").split("/")
	// 舊的 #/docs/<name> 連結直接落到該元件的示範
	if (parts[0] === "docs" && parts[1] != null) return { page: "demo", anchor: parts[1] }
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

type ThemeMode = "system" | "light" | "dark"
const THEME_KEY = "ak-site-theme"
const THEMES = { light, dark }
const MODES: { mode: ThemeMode; label: string }[] = [
	{ mode: "system", label: "系統" },
	{ mode: "light", label: "亮" },
	{ mode: "dark", label: "暗" },
]

function loadTheme(): ThemeMode {
	try {
		const saved = localStorage.getItem(THEME_KEY)
		if (saved === "light" || saved === "dark") return saved
	} catch {
		/* private mode 等情況拿不到就用系統 */
	}
	return "system"
}

// Dialog/toast 會 portal 到 body,theme class 要掛在 <html> 才蓋得到全部;
// data-theme 給 tokens.css 的 CSS-var 消費端(body、.prose、scrollbar)。
function useTheme() {
	const [mode, setMode] = useState<ThemeMode>(loadTheme)
	useEffect(() => {
		const root = document.documentElement
		if (mode === "system") delete root.dataset.theme
		else root.dataset.theme = mode
		const cls = mode === "system" ? [] : (stylex.props(THEMES[mode]).className?.split(" ") ?? [])
		root.classList.add(...cls)
		try {
			if (mode === "system") localStorage.removeItem(THEME_KEY)
			else localStorage.setItem(THEME_KEY, mode)
		} catch {
			/* 存不進去就只在這次生效 */
		}
		return () => root.classList.remove(...cls)
	}, [mode])
	return { mode, setMode }
}

const MOBILE = "@media (max-width: 880px)"

const styles = stylex.create({
	page: {
		display: "grid",
		gridTemplateColumns: { default: "14rem minmax(0, 1fr)", [MOBILE]: "minmax(0, 1fr)" },
		minHeight: "100vh",
	},
	nav: {
		position: { default: "sticky", [MOBILE]: "static" },
		top: 0,
		height: { default: "100vh", [MOBILE]: "auto" },
		overflowY: { default: "auto", [MOBILE]: "visible" },
		borderRightWidth: { default: 1, [MOBILE]: 0 },
		borderRightStyle: "solid",
		borderRightColor: color.border,
		borderBottomWidth: { default: 0, [MOBILE]: 1 },
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		padding: space.md,
	},
	navHead: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.sm,
		marginBottom: space.md,
	},
	title: { fontFamily: font.display, fontSize: text.lg, fontWeight: 500, margin: 0 },
	themeGroup: {
		display: "flex",
		gap: 2,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.md,
		padding: 2,
	},
	themeBtn: {
		fontFamily: font.mono,
		fontSize: "0.62rem",
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: radius.sm,
		paddingBlock: "0.15rem",
		paddingInline: "0.4rem",
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
	},
	themeBtnActive: { color: color.text, backgroundColor: color.accentSubtle },
	group: {
		display: { default: "block", [MOBILE]: "flex" },
		flexWrap: "wrap",
		alignItems: "baseline",
		columnGap: space.xs,
	},
	groupName: {
		display: "block",
		fontFamily: font.mono,
		fontSize: "0.62rem",
		fontWeight: 600,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textFaint,
		marginBlock: space.sm,
		flexBasis: { default: "auto", [MOBILE]: "100%" },
	},
	link: {
		display: { default: "block", [MOBILE]: "inline-block" },
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		textDecoration: "none",
		fontSize: text.xs,
		paddingBlock: "0.18rem",
		paddingInline: space.xxs,
		borderRadius: radius.sm,
	},
	active: { color: color.text, backgroundColor: color.accentSubtle },
	main: { padding: { default: space.lg, [MOBILE]: space.md }, minWidth: 0 },
	content: { maxWidth: "56rem", marginInline: "auto" },
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

function GuidePage({ guide }: { guide: string }) {
	useEffect(() => window.scrollTo(0, 0), [guide])
	return <Markdown body={GUIDES[guide].body} />
}

export function Site() {
	const route = useRoute()
	const { mode, setMode } = useTheme()
	return (
		<div {...stylex.props(styles.page)}>
			<nav {...stylex.props(styles.nav)}>
				<div {...stylex.props(styles.navHead)}>
					<h1 {...stylex.props(styles.title)}>@anyknown/ui</h1>
					<div role="group" aria-label="主題" {...stylex.props(styles.themeGroup)}>
						{MODES.map((option) => (
							<button
								key={option.mode}
								type="button"
								aria-pressed={mode === option.mode}
								onClick={() => setMode(option.mode)}
								{...stylex.props(styles.themeBtn, mode === option.mode && styles.themeBtnActive)}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
				<div {...stylex.props(styles.group)}>
					<b {...stylex.props(styles.groupName)}>指南</b>
					{Object.entries(GUIDES).map(([key, guide]) => (
						<NavLink key={key} href={`#/guide/${key}`} current={route.page === "guide" && route.key === key}>
							{guide.title}
						</NavLink>
					))}
					<NavLink href="#/demo" current={route.page === "demo"}>
						全部示範
					</NavLink>
				</div>
				{Object.entries(GROUPS).map(([group, names]) => (
					<div key={group} {...stylex.props(styles.group)}>
						<b {...stylex.props(styles.groupName)}>{group}</b>
						{names.map((name) => (
							<NavLink
								key={name}
								href={`#/demo/${name}`}
								current={route.page === "demo" && route.anchor === name}
							>
								{name}
							</NavLink>
						))}
					</div>
				))}
			</nav>
			<main {...stylex.props(styles.main)}>
				<div {...stylex.props(styles.content)}>
					{route.page === "demo" ? (
						<DemoPage anchor={route.anchor} />
					) : (
						<GuidePage guide={route.key} />
					)}
				</div>
			</main>
			<Toaster />
		</div>
	)
}
