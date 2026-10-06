import * as stylex from "@stylexjs/stylex"
import { breakpoint, color, corner, font, radius, space, text, type } from "@anyknown/ui/tokens.stylex"
import { Dialogs, LocaleProvider, Toaster } from "@anyknown/ui"
import { DEMO_GROUPS, DEMOS } from "./demos"

const styles = stylex.create({
	page: {
		display: "grid",
		gridTemplateColumns: { default: "13rem minmax(0, 1fr)", [breakpoint.tablet]: "minmax(0, 1fr)" },
		minHeight: "100vh",
	},
	nav: {
		position: { default: "sticky", [breakpoint.tablet]: "static" },
		top: 0,
		height: { default: "100vh", [breakpoint.tablet]: "auto" },
		overflowY: { default: "auto", [breakpoint.tablet]: "visible" },
		padding: space.md,
		display: { default: "block", [breakpoint.tablet]: "flex" },
		flexWrap: "wrap",
		gap: space.xxs,
	},
	title: {
		fontFamily: font.display,
		fontSize: text.lg,
		fontWeight: 600,
		margin: 0,
		marginBottom: { default: space.md, [breakpoint.tablet]: space.xs },
		flexBasis: "100%",
	},
	// On a narrow window the groups dissolve and every link joins one wrapped row
	group: { display: { default: "block", [breakpoint.tablet]: "contents" } },
	groupName: {
		display: { default: "block", [breakpoint.tablet]: "none" },
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textMuted,
		marginBlock: space.sm,
	},
	link: {
		display: "block",
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		textDecoration: "none",
		fontSize: text.xs,
		paddingBlock: space.xxs,
		paddingInline: space.xxs,
		borderRadius: radius.sm,
	},
	// The shell is the desk (layer1 on body); the content is the main sheet on top of it
	main: {
		padding: { default: space.lg, [breakpoint.tablet]: space.md },
		minWidth: 0,
		marginBlock: { default: space.xs, [breakpoint.tablet]: 0 },
		marginInlineEnd: { default: space.xs, [breakpoint.tablet]: 0 },
		backgroundColor: color.layer2,
		borderRadius: { default: corner.sheet, [breakpoint.tablet]: 0 },
	},
})

export function App() {
	return (
		<LocaleProvider locale="en">
			<div {...stylex.props(styles.page)}>
				<nav aria-label="Components" {...stylex.props(styles.nav)}>
					<h1 {...stylex.props(styles.title)}>@anyknown/ui</h1>
					{DEMO_GROUPS.map((group) => (
						<div key={group.title} {...stylex.props(styles.group)}>
							<b {...stylex.props(styles.groupName)}>{group.title}</b>
							{group.demos.map(({ id }) => (
								<a key={id} href={`#${id}`} {...stylex.props(styles.link)}>
									{id}
								</a>
							))}
						</div>
					))}
				</nav>
				<main {...stylex.props(styles.main)}>
					{DEMOS.map(({ id, Component }) => (
						<Component key={id} />
					))}
				</main>
				<Toaster />
				<Dialogs />
			</div>
		</LocaleProvider>
	)
}
