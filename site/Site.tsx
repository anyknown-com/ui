import { Dialogs, LocaleProvider, Toaster } from "@anyknown/ui"
import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { createContext, use, useState } from "react"
import { ComponentPage, NotFound } from "./ComponentPage"
import { COMPONENT_DOCS, COMPONENT_GROUPS, GUIDES } from "./content"
import { AgentsPage, ComponentsPage, DemosPage, GuidePage, HomePage } from "./pages"
import { LOCALES, type ThemeMode, setLocale, setTheme, useHash, useSiteLocale, useTheme } from "./prefs"
import { SituationPage, SituationsPage } from "./situations"
import { TokensPage } from "./TokensPage"

export type Route =
	| { page: "home" }
	| { page: "situations" }
	| { page: "situation"; id: string }
	| { page: "components" }
	| { page: "component"; name: string }
	| { page: "guide"; key: string }
	| { page: "tokens"; anchor?: string }
	| { page: "demo"; anchor?: string }
	| { page: "agents" }

export function parseRoute(hash: string): Route {
	const [head, rest] = hash.replace(/^#\/?/, "").split("/")
	switch (head) {
		case "":
		case undefined:
			return { page: "home" }
		case "situations":
			return rest ? { page: "situation", id: rest } : { page: "situations" }
		case "guide":
			return { page: "guide", key: rest ?? "" }
		case "components":
		// Old #/docs/<name> links from before the component pages existed.
		case "docs":
			return rest ? { page: "component", name: rest } : { page: "components" }
		case "tokens":
			return { page: "tokens", anchor: rest }
		case "demo":
			return { page: "demo", anchor: rest }
		case "agents":
			return { page: "agents" }
		default:
			return { page: "home" }
	}
}

type Section = "situations" | "components" | "foundations" | "guides" | "agents"

const SECTIONS: { section: Section; label: string; href: string }[] = [
	{ section: "situations", label: "Situations", href: "#/situations" },
	{ section: "components", label: "Components", href: "#/components" },
	{ section: "foundations", label: "Foundations", href: "#/tokens" },
	{ section: "guides", label: "Guides", href: "#/guide/getting-started" },
	{ section: "agents", label: "For agents", href: "#/agents" },
]

function sectionOf(route: Route): Section | null {
	switch (route.page) {
		case "situations":
		case "situation":
			return "situations"
		case "components":
		case "component":
		case "demo":
			return "components"
		case "tokens":
			return "foundations"
		case "guide":
			return "guides"
		case "agents":
			return "agents"
		default:
			return null
	}
}

const MOBILE = breakpoint.tablet

const focus = { default: "none", ":focus-visible": `2px solid ${color.focusRing}` }

const styles = stylex.create({
	page: {
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr)",
		gridTemplateRows: "auto 1fr",
		minHeight: "100vh",
	},
	withRail: { gridTemplateColumns: { default: "15rem minmax(0, 1fr)", [MOBILE]: "minmax(0, 1fr)" } },
	header: {
		gridColumn: "1 / -1",
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
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
		marginInlineEnd: { default: space.sm, [MOBILE]: "auto" },
		borderRadius: corner.small,
		outline: focus,
		outlineOffset: 2,
	},
	sections: {
		display: "flex",
		alignItems: { default: "center", [MOBILE]: "stretch" },
		gap: space.xxs,
		marginInlineEnd: "auto",
		flexDirection: { default: "row", [MOBILE]: "column" },
		alignSelf: { default: "auto", [MOBILE]: "stretch" },
		flexBasis: { default: "auto", [MOBILE]: "100%" },
	},
	sectionLink: {
		display: "flex",
		alignItems: "center",
		minHeight: "2.25rem",
		paddingInline: space.sm,
		borderRadius: corner.control,
		fontSize: type.t2,
		fontWeight: 500,
		whiteSpace: "nowrap",
		textDecoration: "none",
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		outline: focus,
		outlineOffset: -2,
	},
	sectionActive: { color: color.text, backgroundColor: color.accentSubtle },
	controls: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		gap: space.xs,
		flexBasis: { default: "auto", [MOBILE]: "100%" },
	},
	// On a phone the section links and the toggles live behind the menu button.
	closed: { display: { default: "flex", [MOBILE]: "none" } },
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
		outline: focus,
	},
	toggleActive: {
		color: color.text,
		backgroundColor: color.layer2,
		boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
	},
	menuButton: { display: { default: "none", [MOBILE]: "inline-flex" }, alignItems: "center" },
	rail: {
		position: { default: "sticky", [MOBILE]: "static" },
		top: 0,
		maxHeight: { default: "100vh", [MOBILE]: "none" },
		overflowY: { default: "auto", [MOBILE]: "visible" },
		paddingBlock: { default: space.xs, [MOBILE]: 0 },
		paddingInline: space.md,
		paddingBottom: { default: space.xl, [MOBILE]: space.md },
		alignSelf: "start",
	},
	railClosed: { display: { default: "block", [MOBILE]: "none" } },
	group: { marginBottom: space.sm },
	groupName: {
		display: "block",
		fontSize: type.t2,
		fontWeight: 600,
		color: color.text,
		paddingInline: space.xs,
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
		borderRadius: corner.control,
		outline: focus,
		outlineOffset: -2,
	},
	active: { color: color.text, backgroundColor: color.accentSubtle, fontWeight: 500 },
	// The desk is body (layer1); the content is the white sheet on it. On a phone the sheet
	// runs to both edges and the bottom.
	main: {
		minWidth: 0,
		paddingBlock: { default: space.xxl, [MOBILE]: space.lg },
		paddingInline: { default: space.xl, [MOBILE]: space.md },
		marginBottom: { default: space.xs, [MOBILE]: 0 },
		marginInline: { default: space.xs, [MOBILE]: 0 },
		backgroundColor: color.layer2,
		borderRadius: { default: corner.sheet, [MOBILE]: `${corner.sheet} ${corner.sheet} 0 0` },
	},
	mainWithRail: { marginInlineStart: 0 },
	// One content width for every page. Reading text inside it keeps its own measure and stays
	// on the start edge, so every page shares the same start edge.
	content: { maxWidth: "72rem", marginInline: "auto" },
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
		outline: focus,
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

function GuidesRail({ route }: { route: Route }) {
	const isGuide = (key: string) => route.page === "guide" && route.key === key
	return (
		<>
			<NavGroup title="Guides">
				{GUIDES.filter((g) => !REFERENCE.has(g.key)).map((g) => (
					<NavLink key={g.key} href={`#/guide/${g.key}`} current={isGuide(g.key)}>
						{g.title}
					</NavLink>
				))}
			</NavGroup>
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

function ComponentsRail({ route }: { route: Route }) {
	return (
		<>
			<NavGroup title="Catalog">
				<NavLink href="#/components" current={route.page === "components"}>
					All components
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
		</>
	)
}

function Page({ route }: { route: Route }) {
	switch (route.page) {
		case "home":
			return <HomePage />
		case "situations":
			return <SituationsPage />
		case "situation":
			return <SituationPage id={route.id} />
		case "components":
			return <ComponentsPage />
		case "component":
			return <ComponentPage name={route.name} />
		case "guide":
			return <GuidePage guideKey={route.key} />
		case "tokens":
			return <TokensPage />
		case "demo":
			return <DemosPage />
		case "agents":
			return <AgentsPage />
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
	const section = sectionOf(route)
	const rail = section === "components" || section === "guides" ? section : null
	const closeMenu = () => setMenuOpen(false)
	return (
		<LocaleProvider locale={locale}>
			<div {...stylex.props(styles.page, rail != null && styles.withRail)}>
				<a href="#main" {...stylex.props(styles.skip)} onClick={skipToMain}>
					Skip to content
				</a>
				<header {...stylex.props(styles.header)}>
					<a href="#/" onClick={closeMenu} {...stylex.props(styles.brand)}>
						@anyknown/ui
					</a>
					<button
						type="button"
						aria-expanded={menuOpen}
						aria-controls="site-sections"
						onClick={() => setMenuOpen((open) => !open)}
						{...stylex.props(styles.toggle, styles.toggleActive, styles.menuButton)}
					>
						{menuOpen ? "Close menu" : "Menu"}
					</button>
					<nav
						id="site-sections"
						aria-label="Sections"
						{...stylex.props(styles.sections, !menuOpen && styles.closed)}
					>
						{SECTIONS.map((item) => (
							<a
								key={item.section}
								href={item.href}
								onClick={closeMenu}
								aria-current={section === item.section ? "page" : undefined}
								{...stylex.props(styles.sectionLink, section === item.section && styles.sectionActive)}
							>
								{item.label}
							</a>
						))}
					</nav>
					<div {...stylex.props(styles.controls, !menuOpen && styles.closed)}>
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
				{rail != null && (
					<nav
						aria-label={rail === "components" ? "Components" : "Guides"}
						{...stylex.props(styles.rail, !menuOpen && styles.railClosed)}
					>
						<NavigateContext value={closeMenu}>
							{rail === "components" ? <ComponentsRail route={route} /> : <GuidesRail route={route} />}
						</NavigateContext>
					</nav>
				)}
				<main id="main" tabIndex={-1} {...stylex.props(styles.main, rail != null && styles.mainWithRail)}>
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
