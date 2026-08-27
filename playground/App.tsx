import * as stylex from "@stylexjs/stylex"
import { color, font, radius, space, text } from "@anyknown/ui/tokens.stylex"
import { Toaster } from "@anyknown/ui"
import { BasicsDemos } from "./demos/basics"
import { DesktopDemos } from "./demos/desktop"
import { FormsDemos } from "./demos/forms"

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
	main: { padding: space.lg, minWidth: 0 },
})

export function App() {
	return (
		<div {...stylex.props(styles.page)}>
			<nav {...stylex.props(styles.nav)}>
				<h1 {...stylex.props(styles.title)}>@anyknown/ui</h1>
				{Object.entries(GROUPS).map(([group, names]) => (
					<div key={group}>
						<b {...stylex.props(styles.groupName)}>{group}</b>
						{names.map((name) => (
							<a key={name} href={`#${name}`} {...stylex.props(styles.link)}>
								{name}
							</a>
						))}
					</div>
				))}
			</nav>
			<main {...stylex.props(styles.main)}>
				<FormsDemos />
				<BasicsDemos />
				<DesktopDemos />
			</main>
			<Toaster />
		</div>
	)
}
