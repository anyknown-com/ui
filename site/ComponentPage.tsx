import { DEMOS } from "../playground/demos"
import { breakpoint, color, corner, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import {
	type ApiComponent,
	type ApiProp,
	COMPONENT_DOCS,
	COMPONENT_GROUPS,
	REPO,
	apiForFolder,
} from "./content"
import { Markdown, renderMarkdown } from "./Markdown"
import { Page, PageHead, Section, grid } from "./layout"
import { SCENES } from "./scenes"

const MOBILE = breakpoint.tablet

const styles = stylex.create({
	title: {
		fontFamily: font.display,
		fontSize: type.t6,
		lineHeight: type.dense,
		fontWeight: 600,
		color: color.text,
		margin: 0,
	},
	lead: { fontSize: type.t4, lineHeight: type.snug, color: color.textMuted, maxWidth: "44rem", margin: 0 },
	apiEntry: { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: space.sm, minWidth: 0 },
	whenCard: {
		display: "grid",
		alignContent: "start",
		gap: space.xs,
		backgroundColor: color.layer3,
		borderRadius: corner.card,
		padding: space.lg,
		minWidth: 0,
	},
	whenTitle: {
		fontSize: type.t4,
		lineHeight: type.tight,
		fontWeight: 600,
		color: color.text,
		margin: 0,
	},
	api: { display: "grid", gap: space.lg },
	apiName: {
		fontFamily: font.mono,
		fontSize: type.t3,
		fontWeight: 600,
		color: color.text,
		margin: 0,
	},
	apiNote: { fontSize: type.t2, color: color.textMuted, margin: 0, lineHeight: type.snug },
	table: {
		width: "100%",
		borderCollapse: "collapse",
		fontSize: type.t2,
		display: { default: "table", [MOBILE]: "block" },
	},
	thead: {
		display: { default: "table-header-group", [MOBILE]: "none" },
	},
	th: {
		textAlign: "start",
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		color: color.textMuted,
		paddingBlock: space.xs,
		paddingInline: space.xs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
	},
	tbody: { display: { default: "table-row-group", [MOBILE]: "block" } },
	tr: {
		display: { default: "table-row", [MOBILE]: "grid" },
		gap: { default: null, [MOBILE]: space.xxs },
		paddingBlock: { default: null, [MOBILE]: space.sm },
		borderBottomWidth: { default: 0, [MOBILE]: 1 },
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
	},
	td: {
		display: { default: "table-cell", [MOBILE]: "block" },
		verticalAlign: "top",
		paddingBlock: { default: space.xs, [MOBILE]: 0 },
		paddingInline: { default: space.xs, [MOBILE]: 0 },
		borderBottomWidth: { default: 1, [MOBILE]: 0 },
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		color: color.textMuted,
		lineHeight: type.snug,
		minWidth: 0,
		overflowWrap: "anywhere",
	},
	propName: { fontFamily: font.mono, color: color.text, fontWeight: 600, whiteSpace: "nowrap" },
	deprecatedName: { textDecorationLine: "line-through", color: color.textMuted },
	code: { fontFamily: font.mono, fontSize: type.code, color: color.text },
	nowrap: { whiteSpace: "nowrap" },
	required: { fontFamily: font.mono, fontSize: type.t1, color: color.danger, marginInlineStart: space.xxs },
	tag: {
		display: "inline-block",
		fontFamily: font.mono,
		fontSize: type.t1,
		color: color.warning,
		backgroundColor: color.warningSubtle,
		borderRadius: corner.pill,
		paddingInline: space.xs,
		marginInlineStart: space.xxs,
	},
	mobileLabel: {
		display: { default: "none", [MOBILE]: "inline" },
		fontFamily: font.mono,
		fontSize: type.t1,
		color: color.textMuted,
		marginInlineEnd: space.xxs,
	},
	foot: {
		fontSize: type.t2,
		color: color.textMuted,
		display: "flex",
		flexWrap: "wrap",
		gap: space.md,
	},
	link: { color: color.link, textUnderlineOffset: 2 },
	seenIn: { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: space.sm, maxWidth: "44rem" },
	seenItem: { display: "grid", gap: space.xxs },
	seenLink: { color: color.link, textUnderlineOffset: 2, fontSize: type.t3, fontWeight: 600 },
	seenMoment: { fontSize: type.t2, lineHeight: type.snug, color: color.textMuted, margin: 0 },
})

const KNOWN = new Set(["When to use", "When not to use", "Usage", "Accessibility", "Keyboard", "Related"])

function Inline({ text, from }: { text: string; from: string }) {
	// JSDoc is markdown-ish; render it inline so `code` and links work.
	const html = renderMarkdown(text, from).replace(/^<p>|<\/p>\n?$/g, "")
	return <span className="prose-inline" dangerouslySetInnerHTML={{ __html: html }} />
}

function PropRow({ prop, from }: { prop: ApiProp; from: string }) {
	const deprecated = prop.deprecated !== false
	return (
		<tr {...stylex.props(styles.tr)}>
			<td {...stylex.props(styles.td)}>
				<code {...stylex.props(styles.propName, deprecated && styles.deprecatedName)}>{prop.name}</code>
				{prop.required && (
					<span {...stylex.props(styles.required)} title="Required">
						required
					</span>
				)}
				{deprecated && <span {...stylex.props(styles.tag)}>deprecated</span>}
			</td>
			<td {...stylex.props(styles.td)}>
				<span {...stylex.props(styles.mobileLabel)}>Type</span>
				<code {...stylex.props(styles.code)}>{prop.type}</code>
			</td>
			<td {...stylex.props(styles.td)}>
				<span {...stylex.props(styles.mobileLabel)}>Default</span>
				{prop.default != null ? (
					<code {...stylex.props(styles.code, styles.nowrap)}>{prop.default}</code>
				) : (
					"—"
				)}
			</td>
			<td {...stylex.props(styles.td)}>
				{typeof prop.deprecated === "string" && (
					<>
						<b>Deprecated:</b> <Inline text={prop.deprecated} from={from} />{" "}
					</>
				)}
				{prop.description !== "" && <Inline text={prop.description} from={from} />}
			</td>
		</tr>
	)
}

const EXTENDS_NOTE: Record<string, string> = { "@base-ui/react": "the Base UI primitive's props" }

function extendsNote(bases: string[]): string | null {
	if (bases.length === 0) return null
	const parts = bases.map((b) => {
		const tag = b.match(/^React\.(\w+?)HTMLAttributes$/)?.[1]
		if (tag != null) return `native \`<${tag.toLowerCase()}>\` attributes`
		if (b === "React.HTMLAttributes") return "native HTML attributes"
		return EXTENDS_NOTE[b] ?? `props from \`${b}\``
	})
	return `Also accepts ${parts.join(" and ")}.`
}

function ApiEntry({ entry }: { entry: ApiComponent }) {
	const from = entry.file
	if (entry.aliasOf != null) {
		return (
			<p {...stylex.props(styles.apiNote)}>
				<code {...stylex.props(styles.code)}>{entry.name}</code> is an alias of{" "}
				<code {...stylex.props(styles.code)}>{entry.aliasOf}</code>.
				{entry.deprecated !== false && " Deprecated."}
			</p>
		)
	}
	const note = extendsNote(entry.extends ?? [])
	return (
		<div {...stylex.props(styles.apiEntry)}>
			<h3 id={`api-${entry.name}`} {...stylex.props(styles.apiName)}>
				{`<${entry.name}>`}
				{entry.deprecated !== false && <span {...stylex.props(styles.tag)}>deprecated</span>}
			</h3>
			{entry.description !== "" && (
				<p {...stylex.props(styles.apiNote)}>
					<Inline text={entry.description} from={from} />
				</p>
			)}
			{entry.props.length > 0 ? (
				<table {...stylex.props(styles.table)}>
					<thead {...stylex.props(styles.thead)}>
						<tr>
							<th {...stylex.props(styles.th)}>Prop</th>
							<th {...stylex.props(styles.th)}>Type</th>
							<th {...stylex.props(styles.th)}>Default</th>
							<th {...stylex.props(styles.th)}>Description</th>
						</tr>
					</thead>
					<tbody {...stylex.props(styles.tbody)}>
						{entry.props.map((prop) => (
							<PropRow key={prop.name} prop={prop} from={from} />
						))}
					</tbody>
				</table>
			) : (
				<p {...stylex.props(styles.apiNote)}>No props of its own.</p>
			)}
			{note != null && (
				<p {...stylex.props(styles.apiNote)}>
					<Inline text={note} from={from} />
				</p>
			)}
		</div>
	)
}

export function groupOf(name: string) {
	return COMPONENT_GROUPS.find((g) => g.names.includes(name))?.title
}

export function ComponentPage({ name }: { name: string }) {
	const doc = COMPONENT_DOCS.get(name)
	const from = `src/components/${name}/README.md`
	if (doc == null) return <NotFound what={`component “${name}”`} />
	const demos = DEMOS.filter((d) => d.covers.includes(name))
	const api = apiForFolder(name)
	const section = (title: string) => doc.sections.get(title)
	const when = section("When to use")
	const whenNot = section("When not to use")
	const usage = section("Usage")
	const extra = [...doc.sections.keys()].filter((k) => !KNOWN.has(k))
	const seenIn = SCENES.filter((scene) => scene.meta.uses.includes(name))
	return (
		<Page>
			<PageHead
				crumb={{ href: "#/components", label: groupOf(name) ?? "Components" }}
				title={doc.title}
				lead={<Markdown body={doc.lead} from={from} />}
			/>

			{(when != null || whenNot != null) && (
				<div {...stylex.props(grid.halves)}>
					{when != null && (
						<div {...stylex.props(styles.whenCard)}>
							<h2 {...stylex.props(styles.whenTitle)}>When to use</h2>
							<Markdown body={when} from={from} />
						</div>
					)}
					{whenNot != null && (
						<div {...stylex.props(styles.whenCard)}>
							<h2 {...stylex.props(styles.whenTitle)}>When not to use</h2>
							<Markdown body={whenNot} from={from} />
						</div>
					)}
				</div>
			)}

			{seenIn.length > 0 && (
				<Section title="Seen in">
					<ul {...stylex.props(styles.seenIn)}>
						{seenIn.map(({ meta }) => (
							<li key={meta.id} {...stylex.props(styles.seenItem)}>
								<a href={`#/situations/${meta.id}`} {...stylex.props(styles.seenLink)}>
									{meta.title}
								</a>
								<p {...stylex.props(styles.seenMoment)}>{meta.moment}</p>
							</li>
						))}
					</ul>
				</Section>
			)}

			{demos.length > 0 && (
				<Section title="Examples">
					{demos.map(({ id, Component }) => (
						<Component key={id} />
					))}
				</Section>
			)}

			{usage != null && (
				<Section title="Usage">
					<Markdown body={usage} from={from} />
				</Section>
			)}

			<Section title="API">
				{api.length > 0 ? (
					<div {...stylex.props(styles.api)}>
						{api.map((entry) => (
							<ApiEntry key={entry.name} entry={entry} />
						))}
					</div>
				) : (
					<p {...stylex.props(styles.apiNote)}>No React components; see Usage for the exported helpers.</p>
				)}
			</Section>

			{["Accessibility", "Keyboard", ...extra, "Related"].map((title) => {
				const body = section(title)
				if (body == null) {
					return title === "Keyboard" ? (
						<Section key={title} title={title}>
							<p {...stylex.props(styles.apiNote)}>Keyboard reference is being written.</p>
						</Section>
					) : null
				}
				return (
					<Section key={title} title={title}>
						<Markdown body={body} from={from} />
					</Section>
				)
			})}

			<footer {...stylex.props(styles.foot)}>
				<a href={`${REPO}/blob/main/${from}`} {...stylex.props(styles.link)}>
					Edit this page
				</a>
				<a href={`${REPO}/tree/main/src/components/${name}`} {...stylex.props(styles.link)}>
					Source
				</a>
			</footer>
		</Page>
	)
}

export function NotFound({ what }: { what: string }) {
	return (
		<article>
			<h1 {...stylex.props(styles.title)}>Not found</h1>
			<p {...stylex.props(styles.lead)}>
				There is no {what}.{" "}
				<a href="#/" {...stylex.props(styles.link)}>
					Back to the start page
				</a>
				.
			</p>
		</article>
	)
}
