import { Dialogs, LocaleProvider, Toaster } from "@anyknown/ui"
import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { createContext, use, useState } from "react"
import { ComponentPage, NotFound } from "./ComponentPage"
import { COMPONENT_DOCS, COMPONENT_GROUPS, GUIDES } from "./content"
import { DemosPage, GuidePage, HomePage } from "./pages"
import { LOCALES, type ThemeMode, setLocale, setTheme, useHash, useSiteLocale, useTheme } from "./prefs"
import { TokensPage } from "./TokensPage"

export type Route =
	| { page: "home" }
	| { page: "guide"; key: string }
	| { page: "component"; name: string }
	| { page: "tokens"; anchor?: string }
	| { page: "demo"; anchor?: string }

export function parseRoute(hash: string): Route {
	const [head, rest] = hash.replace(/^#\/?/, "").split("/")
	switch (head) {
		case "":
		case undefined:
			return { page: "home" }
		case "guide":
			return { page: "guide", key: rest ?? "" }
		case "components":
		// Old #/docs/<name> links from before the component pages existed.
		case "docs":
			return { page: "component", name: rest ?? "" }
		case "tokens":
			return { page: "tokens", anchor: rest }
		case "demo":
			return { page: "demo", anchor: rest }
		default:
			return { page: "home" }
	}
}

const MOBILE = breakpoint.tablet

const styles = stylex.create({
	page: {
		display: "grid",
		gridTemplateColumns: { default: "15rem minmax(0, 1fr)", [MOBILE]: "minmax(0, 1fr)" },
		gridTemplateRows: "auto 1fr",
		minHeight: "100vh",
	},
	header: {
		gridColumn: "1 / -1",
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.sm,
		paddingBlock: space.sm,
		paddingInline: space.md,
	},
	brand: {
		fontFamily: font.display,
		fontSize: type.t4,
		fontWeight: 600,
		color: color.text,
		textDecoration: "none",
		marginInlineEnd: "auto",
		borderRadius: corner.small,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	controls: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		gap: space.xs,
		flexBasis: { default: "auto", [MOBILE]: "100%" },
	},
	toggleGroup: {
		display: "flex",
		gap: 2,
		backgroundColor: color.accentSubtle,
		borderRadius: corner.pill,
		padding: 2,
	},
	toggle: {
		fontFamily: font.body,
		fontSize: type.t1,
		lineHeight: type.dense,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: "transparent",
		borderWidth: 0,
		borderRadius: corner.pill,
		minHeight: "1.75rem",
		paddingInline: space.sm,
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
	},
	toggleActive: {
		color: color.text,
		backgroundColor: color.layer2,
		boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
	},
	menuButton: { display: { default: "none", [MOBILE]: "inline-flex" }, alignItems: "center" },
	nav: {
		position: { default: "sticky", [MOBILE]: "static" },
		top: 0,
		maxHeight: { default: "100vh", [MOBILE]: "none" },
		overflowY: { default: "auto", [MOBILE]: "visible" },
		paddingBlock: { default: space.xs, [MOBILE]: 0 },
		paddingInline: space.md,
		paddingBottom: { default: space.xl, [MOBILE]: space.md },
		alignSelf: "start",
	},
	navClosed: { display: { default: "block", [MOBILE]: "none" } },
	group: { marginBottom: space.sm },
	groupName: {
		display: "block",
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textMuted,
		marginBlock: space.xs,
	},
	list: {
		listStyle: "none",
		margin: 0,
		padding: 0,
		display: { default: "block", [MOBILE]: "flex" },
		flexWrap: "wrap",
		gap: space.xxs,
	},
	link: {
		display: "block",
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		textDecoration: "none",
		fontSize: type.t2,
		lineHeight: type.tight,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		borderRadius: corner.pill,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	active: { color: color.text, backgroundColor: color.accentSubtle, fontWeight: 500 },
	// The desk is body (layer1); the content is the white sheet on it. On a phone the sheet
	// runs to both edges and the bottom.
	main: {
		minWidth: 0,
		paddingBlock: { default: space.xl, [MOBILE]: space.lg },
		paddingInline: { default: space.xl, [MOBILE]: space.md },
		marginBottom: { default: space.xs, [MOBILE]: 0 },
		marginInlineEnd: { default: space.xs, [MOBILE]: 0 },
		backgroundColor: color.layer2,
		borderRadius: { default: corner.sheet, [MOBILE]: `${corner.sheet} ${corner.sheet} 0 0` },
	},
	content: { maxWidth: "56rem", marginInline: "auto" },
	skip: {
		position: "absolute",
		insetInlineStart: space.sm,
		top: { default: "-10rem", ":focus": space.sm },
		zIndex: 1,
		backgroundColor: color.layer2,
		color: color.text,
		borderRadius: corner.pill,
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
	},
})

const THEME_MODES: { mode: ThemeMode; label: string }[] = [
	{ mode: "system", label: "System" },
	{ mode: "light", label: "Light" },
	{ mode: "dark", label: "Dark" },
]

function Toggle({
	label,
	options,
	value,
	onChange,
}: {
	label: string
	options: { value: string; label: string; lang?: string }[]
	value: string
	onChange: (value: string) => void
}) {
	return (
		<div role="group" aria-label={label} {...stylex.props(styles.toggleGroup)}>
			{options.map((option) => (
				<button
					key={option.value}
					type="button"
					lang={option.lang}
					aria-pressed={value === option.value}
					onClick={() => onChange(option.value)}
					{...stylex.props(styles.toggle, value === option.value && styles.toggleActive)}
				>
					{option.label}
				</button>
			))}
		</div>
	)
}

// Picking a page closes the phone menu.
const NavigateContext = createContext<() => void>(() => {})

function NavLink({ href, current, children }: { href: string; current: boolean; children: string }) {
	const onNavigate = use(NavigateContext)
	return (
		<li>
			<a
				href={href}
				onClick={() => onNavigate()}
				aria-current={current ? "page" : undefined}
				{...stylex.props(styles.link, current && styles.active)}
			>
				{children}
			</a>
		</li>
	)
}

function NavGroup({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div {...stylex.props(styles.group)}>
			<b {...stylex.props(styles.groupName)}>{title}</b>
			<ul {...stylex.props(styles.list)}>{children}</ul>
		</div>
	)
}

const REFERENCE = new Set(["readme", "components", "decisions", "a11y", "contributing"])

function Nav({ route }: { route: Route }) {
	const isGuide = (key: string) => route.page === "guide" && route.key === key
	return (
		<>
			<NavGroup title="Guides">
				<NavLink href="#/" current={route.page === "home"}>
					Overview
				</NavLink>
				{GUIDES.filter((g) => !REFERENCE.has(g.key)).map((g) => (
					<NavLink key={g.key} href={`#/guide/${g.key}`} current={isGuide(g.key)}>
						{g.title}
					</NavLink>
				))}
			</NavGroup>
			<NavGroup title="Foundations">
				<NavLink href="#/tokens" current={route.page === "tokens"}>
					Tokens
				</NavLink>
				<NavLink href="#/demo" current={route.page === "demo"}>
					All demos
				</NavLink>
			</NavGroup>
			{COMPONENT_GROUPS.map((group) => (
				<NavGroup key={group.title} title={group.title}>
					{group.names.map((name) => (
						<NavLink
							key={name}
							href={`#/components/${name}`}
							current={route.page === "component" && route.name === name}
						>
							{COMPONENT_DOCS.get(name)?.title ?? name}
						</NavLink>
					))}
				</NavGroup>
			))}
			<NavGroup title="Reference">
				{GUIDES.filter((g) => REFERENCE.has(g.key)).map((g) => (
					<NavLink key={g.key} href={`#/guide/${g.key}`} current={isGuide(g.key)}>
						{g.title}
					</NavLink>
				))}
			</NavGroup>
		</>
	)
}

function Page({ route }: { route: Route }) {
	switch (route.page) {
		case "home":
			return <HomePage />
		case "guide":
			return <GuidePage guideKey={route.key} />
		case "component":
			return <ComponentPage name={route.name} />
		case "tokens":
			return <TokensPage />
		case "demo":
			return <DemosPage />
		default:
			return <NotFound what="such page" />
	}
}

/** A new page starts at the top, or at its anchor (`#/demo/<id>`, `#/tokens/<group>`). */
function scrollOnMount(anchor: string | undefined) {
	return (node: HTMLElement | null) => {
		if (node == null) return
		const target = anchor != null ? document.getElementById(anchor) : null
		if (target != null) target.scrollIntoView?.()
		else window.scrollTo(0, 0)
	}
}

export function Site() {
	const hash = useHash()
	const route = parseRoute(hash)
	const theme = useTheme()
	const locale = useSiteLocale()
	const [menuOpen, setMenuOpen] = useState(false)
	const anchor = route.page === "demo" || route.page === "tokens" ? route.anchor : undefined
	return (
		<LocaleProvider locale={locale}>
			<div {...stylex.props(styles.page)}>
				<a href="#main" {...stylex.props(styles.skip)} onClick={skipToMain}>
					Skip to content
				</a>
				<header {...stylex.props(styles.header)}>
					<a href="#/" {...stylex.props(styles.brand)}>
						@anyknown/ui
					</a>
					<button
						type="button"
						aria-expanded={menuOpen}
						aria-controls="site-nav"
						onClick={() => setMenuOpen((open) => !open)}
						{...stylex.props(styles.toggle, styles.toggleActive, styles.menuButton)}
					>
						{menuOpen ? "Close menu" : "Menu"}
					</button>
					<div {...stylex.props(styles.controls)}>
						<Toggle
							label="Language of built-in component text"
							options={LOCALES.map((l) => ({ value: l.locale, label: l.label, lang: l.lang }))}
							value={locale}
							onChange={setLocale}
						/>
						<Toggle
							label="Theme"
							options={THEME_MODES.map((m) => ({ value: m.mode, label: m.label }))}
							value={theme}
							onChange={(mode) => setTheme(mode as ThemeMode)}
						/>
					</div>
				</header>
				<nav
					id="site-nav"
					aria-label="Documentation"
					{...stylex.props(styles.nav, !menuOpen && styles.navClosed)}
				>
					<NavigateContext value={() => setMenuOpen(false)}>
						<Nav route={route} />
					</NavigateContext>
				</nav>
				<main id="main" tabIndex={-1} {...stylex.props(styles.main)}>
					<div key={hash} ref={scrollOnMount(anchor)} {...stylex.props(styles.content)}>
						<Page route={route} />
					</div>
				</main>
				<Toaster />
				<Dialogs />
			</div>
		</LocaleProvider>
	)
}

// The hash is the router, so a plain #main link would navigate; move focus instead.
function skipToMain(event: React.MouseEvent) {
	event.preventDefault()
	document.getElementById("main")?.focus()
}
