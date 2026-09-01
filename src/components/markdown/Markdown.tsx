import * as stylex from "@stylexjs/stylex"
import { Marked, type Token, type Tokens } from "marked"
import type { ComponentProps, ReactNode } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, radius, space, text } from "../../tokens.stylex"
import { Checkbox } from "../checkbox/Checkbox"
import { CodeBlock, InlineCode } from "../code-block/CodeBlock"
import { Formula } from "./Formula"
import { isMathToken, mathExtensions } from "./math"

// Its own Marked instance, not the module-level `marked`: `marked.use()` is global, and a design
// system must not reach into whatever else the host app parses.
//
// `breaks: true` because this renders what a person or a model just typed into a conversation. In
// a document a lone newline is a space; in a chat message it is a line the writer meant to break.
const parser = new Marked({ gfm: true, breaks: true }).use({ extensions: mathExtensions })

const styles = stylex.create({
	root: {
		display: "grid",
		gap: space.sm,
		// Set, never inherited. Every other component in this package states its own colour and
		// size for the same reason: a host whose text colour is wrong (or missing, as when a page
		// forgets tokens.css) would otherwise paint this black on a dark ground.
		color: color.text,
		fontSize: text.sm,
		lineHeight: text.leadingRelaxed,
		// Model output is full of things with no spaces in them — URLs, file paths, hashes. On a
		// 390px screen any one of them would otherwise push the whole conversation sideways.
		overflowWrap: "anywhere",
		minWidth: 0,
	},
	p: { margin: 0, lineHeight: text.leadingNormal },
	heading: { margin: 0, lineHeight: text.leadingSnug, fontWeight: 600 },
	h1: { fontSize: text.lg },
	// h2 and below are body-sized and carry their weight instead: these are headings inside one
	// chat message, not a page outline, and a message that shouts three sizes at you reads worse.
	h2: { fontSize: text.base },
	h3: { fontSize: text.base },
	list: { margin: 0, paddingInlineStart: "1.5em", display: "grid", gap: space.xxs },
	item: { lineHeight: text.leadingNormal },
	// The item's own text follows it on the same line, so the box must not take the whole row.
	task: { display: "inline-flex", marginInlineEnd: space.xxs, verticalAlign: "middle" },
	quote: {
		margin: 0,
		paddingInlineStart: space.sm,
		borderInlineStartWidth: 2,
		borderInlineStartStyle: "solid",
		borderInlineStartColor: color.border,
		color: color.textMuted,
		display: "grid",
		gap: space.xs,
	},
	rule: {
		border: "none",
		borderBlockStartWidth: 1,
		borderBlockStartStyle: "solid",
		borderBlockStartColor: color.border,
		margin: 0,
	},
	link: { color: color.accent, textUnderlineOffset: "0.15em" },
	image: { maxWidth: "100%", height: "auto", borderRadius: radius.md },
	// The table itself must not shrink to fit; the wrapper scrolls instead. A squashed table on a
	// phone is unreadable, a scrolling one is merely narrow.
	tableWrap: { overflowX: "auto", maxWidth: "100%" },
	// Sized by its own content, not stretched to the message width: a two-column table pulled out
	// to full width puts its cells at opposite ends of the screen and is harder to read, not easier.
	table: { borderCollapse: "collapse" },
	cell: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		textAlign: "start",
		verticalAlign: "top",
	},
	head: { backgroundColor: color.surface, fontWeight: 600 },
})

const ALIGN = { left: "start", center: "center", right: "end" } as const

/** A fenced block a shell wants to draw itself — mermaid, a chart spec, anything. */
export type MarkdownBlock = { lang: string; code: string }

export type MarkdownProps = Omit<ComponentProps<"div">, "children"> & {
	children: string
	/**
	 * Draws a fenced block instead of the built-in code block. Returning `undefined` (or not
	 * passing this at all) falls back to the code block, which is why a shell that has no mermaid
	 * bundled still shows the source rather than nothing.
	 *
	 * This package deliberately does not depend on any diagram library: mermaid alone unpacks to
	 * ~84MB, which no design system should push onto every app that installs it.
	 */
	renderBlock?: (block: MarkdownBlock) => ReactNode | undefined
	/** Passed through to code blocks, so a shell can localise their copy button. */
	copyLabel?: string
	copiedLabel?: string
	sx?: StyleArg
}

type Context = Pick<MarkdownProps, "renderBlock" | "copyLabel" | "copiedLabel">

function inlineTokens(token: Token): Token[] | undefined {
	return (token as { tokens?: Token[] }).tokens
}

function renderInline(tokens: Token[] | undefined, context: Context, keyPrefix: string): ReactNode {
	if (!tokens) return null
	return tokens.map((token, index) => {
		const key = `${keyPrefix}.${index}`
		if (isMathToken(token)) {
			return (
				<Formula key={key} display={token.display}>
					{token.text}
				</Formula>
			)
		}
		switch (token.type) {
			case "text":
			case "escape": {
				const nested = inlineTokens(token)
				// A `text` token carries children only when it contains inline markup; otherwise the
				// string itself is the whole of it.
				return nested ? (
					<span key={key}>{renderInline(nested, context, key)}</span>
				) : (
					(token as Tokens.Text).text
				)
			}
			case "strong":
				return <strong key={key}>{renderInline(inlineTokens(token), context, key)}</strong>
			case "em":
				return <em key={key}>{renderInline(inlineTokens(token), context, key)}</em>
			case "del":
				return <del key={key}>{renderInline(inlineTokens(token), context, key)}</del>
			case "codespan":
				return <InlineCode key={key}>{(token as Tokens.Codespan).text}</InlineCode>
			case "br":
				return <br key={key} />
			// The list draws the box itself; this token is the source `[x]` and would double it.
			case "checkbox":
				return null
			case "link": {
				const link = token as Tokens.Link
				return (
					<a
						key={key}
						href={link.href}
						title={link.title ?? undefined}
						target="_blank"
						// Model output is untrusted: never hand a new tab a live `window.opener`.
						rel="noopener noreferrer nofollow"
						{...stylex.props(styles.link)}
					>
						{renderInline(inlineTokens(token), context, key)}
					</a>
				)
			}
			case "image": {
				const image = token as Tokens.Image
				return (
					<img
						key={key}
						src={image.href}
						alt={image.text}
						title={image.title ?? undefined}
						loading="lazy"
						{...stylex.props(styles.image)}
					/>
				)
			}
			// `html` inline: shown as text, never parsed. See renderBlocks.
			case "html":
				return <span key={key}>{(token as Tokens.HTML).raw}</span>
			default:
				return <span key={key}>{(token as { raw?: string }).raw ?? ""}</span>
		}
	})
}

/**
 * A list item's children are a mix: its own sentence arrives as inline tokens, but a nested list
 * or fenced block is block-level. Sending the whole lot to one renderer is what flattened
 * "巢狀:\n  1. 第一\n  2. 第二" into a single line.
 */
function renderItem(item: Tokens.ListItem, context: Context, key: string): ReactNode {
	return item.tokens.map((token, index) => {
		const childKey = `${key}.${index}`
		return token.type === "text" || token.type === "checkbox"
			? renderInline([token], context, childKey)
			: renderBlocks([token], context, childKey)
	})
}

function renderList(token: Tokens.List, context: Context, key: string): ReactNode {
	const Tag = token.ordered ? "ol" : "ul"
	return (
		<Tag
			key={key}
			{...(token.ordered && token.start !== "" ? { start: token.start } : {})}
			{...stylex.props(styles.list)}
		>
			{token.items.map((item, index) => (
				<li key={`${key}.${index}`} {...stylex.props(styles.item)}>
					{item.task && (
						// The design system's own box, not a native <input>: that one paints itself in the
						// OS accent colour and ignores the theme entirely.
						<Checkbox
							checked={item.checked ?? false}
							disabled
							readOnly
							aria-label={item.checked ? "已完成" : "未完成"}
							sx={styles.task}
						/>
					)}
					{renderItem(item, context, `${key}.${index}`)}
				</li>
			))}
		</Tag>
	)
}

function renderTable(token: Tokens.Table, context: Context, key: string): ReactNode {
	return (
		<div key={key} {...stylex.props(styles.tableWrap)}>
			<table {...stylex.props(styles.table)}>
				<thead>
					<tr>
						{token.header.map((cell, index) => (
							<th
								key={index}
								{...stylex.props(styles.cell, styles.head)}
								style={{ textAlign: ALIGN[token.align[index] ?? "left"] }}
							>
								{renderInline(cell.tokens, context, `${key}.h.${index}`)}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{token.rows.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{row.map((cell, index) => (
								<td
									key={index}
									{...stylex.props(styles.cell)}
									style={{ textAlign: ALIGN[token.align[index] ?? "left"] }}
								>
									{renderInline(cell.tokens, context, `${key}.${rowIndex}.${index}`)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

function renderBlocks(tokens: Token[], context: Context, keyPrefix = "b"): ReactNode[] {
	const out: ReactNode[] = []
	tokens.forEach((token, index) => {
		const key = `${keyPrefix}.${index}`
		if (isMathToken(token)) {
			out.push(
				<Formula key={key} display>
					{token.text}
				</Formula>,
			)
			return
		}
		switch (token.type) {
			case "space":
				return
			case "paragraph":
				out.push(
					<p key={key} {...stylex.props(styles.p)}>
						{renderInline(inlineTokens(token), context, key)}
					</p>,
				)
				return
			case "heading": {
				const heading = token as Tokens.Heading
				const level = headingLevel(heading.depth)
				const Tag = `h${level}` as "h1" | "h2" | "h3"
				out.push(
					<Tag key={key} {...stylex.props(styles.heading, styles[Tag])}>
						{renderInline(inlineTokens(token), context, key)}
					</Tag>,
				)
				return
			}
			case "code": {
				const block = token as Tokens.Code
				const lang = (block.lang ?? "").trim().split(/\s+/)[0] ?? ""
				const custom = context.renderBlock?.({ lang, code: block.text })
				out.push(
					custom !== undefined && custom !== null ? (
						<div key={key}>{custom}</div>
					) : (
						<CodeBlock
							key={key}
							code={block.text}
							{...(lang ? { lang } : {})}
							{...(context.copyLabel ? { copyLabel: context.copyLabel } : {})}
							{...(context.copiedLabel ? { copiedLabel: context.copiedLabel } : {})}
						/>
					),
				)
				return
			}
			case "table":
				out.push(renderTable(token as Tokens.Table, context, key))
				return
			case "list":
				out.push(renderList(token as Tokens.List, context, key))
				return
			case "blockquote":
				out.push(
					<blockquote key={key} {...stylex.props(styles.quote)}>
						{renderBlocks(inlineTokens(token) ?? [], context, key)}
					</blockquote>,
				)
				return
			case "hr":
				out.push(<hr key={key} {...stylex.props(styles.rule)} />)
				return
			case "html":
				// Never parsed, never injected — the source is shown as code. Markdown from a model is
				// untrusted input and this package has no sanitiser to lean on, so `<script>` is
				// something to display, not something to run.
				out.push(
					<CodeBlock
						key={key}
						lang="html"
						code={(token as Tokens.HTML).raw.trimEnd()}
						{...(context.copyLabel ? { copyLabel: context.copyLabel } : {})}
						{...(context.copiedLabel ? { copiedLabel: context.copiedLabel } : {})}
					/>,
				)
				return
			case "text": {
				const nested = inlineTokens(token)
				out.push(
					<p key={key} {...stylex.props(styles.p)}>
						{nested ? renderInline(nested, context, key) : (token as Tokens.Text).text}
					</p>,
				)
				return
			}
			// `def` is a link reference definition: it defines, it does not render.
			default:
				return
		}
	})
	return out
}

/** Headings inside a message never go past h3; deeper ones would be smaller than the body. */
function headingLevel(depth: number): 1 | 2 | 3 {
	return depth <= 1 ? 1 : depth === 2 ? 2 : 3
}

/**
 * Markdown as a conversation renders it: GFM tables, fenced code, TeX maths, task lists.
 *
 * Nothing here goes through `innerHTML`. The markdown is tokenised and every token is turned into
 * a React element, so a model that emits `<script>` gets its source shown, not run.
 */
export function Markdown({ children, renderBlock, copyLabel, copiedLabel, sx, ...rest }: MarkdownProps) {
	const tokens = parser.lexer(children)
	return (
		<div {...rest} {...styled(rest, styles.root, sx)}>
			{renderBlocks(tokens, { renderBlock, copyLabel, copiedLabel })}
		</div>
	)
}
