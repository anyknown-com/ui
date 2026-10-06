import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { reset, styled } from "../../lib/styled"
import { useCopy } from "../../lib/useCopy"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const blink = stylex.keyframes({ "50%": { opacity: 0 } })

const styles = stylex.create({
	// 凹下去的 surface,無框;標頭跟本體同一塊底,不畫分隔線
	block: {
		borderRadius: corner.card,
		backgroundColor: color.surface,
		overflow: "hidden",
	},
	head: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.xs,
		paddingBlockStart: space.xxs,
		paddingInlineStart: space.md,
		paddingInlineEnd: space.xxs,
	},
	lang: {
		fontFamily: font.mono,
		fontSize: type.t1,
		lineHeight: type.snug,
		color: color.textMuted,
	},
	copy: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		fontFamily: font.body,
		fontSize: type.t2,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		borderRadius: corner.pill,
		cursor: "pointer",
		transitionProperty: "background-color, color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	copied: { color: color.accent },
	pre: {
		margin: 0,
		paddingBlockStart: space.xxs,
		paddingBlockEnd: space.sm,
		paddingInline: space.md,
		overflowX: "auto",
		fontFamily: font.mono,
		fontSize: type.code,
		lineHeight: type.snug,
		color: color.text,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	code: { font: "inherit" },
	cursor: {
		display: "inline-block",
		width: 1,
		height: "1.05em",
		backgroundColor: color.text,
		verticalAlign: "text-bottom",
		marginInlineStart: 1,
		animationName: { default: blink, [REDUCED]: "none" },
		animationDuration: "1s",
		animationTimingFunction: "steps(2, start)",
		animationIterationCount: "infinite",
	},
	inline: {
		fontFamily: font.mono,
		fontSize: type.code,
		lineHeight: type.snug,
		backgroundColor: color.surface,
		borderRadius: corner.small,
		paddingInline: "0.3em",
	},
})

function CopyIcon() {
	return (
		<Glyph width={12} height={12}>
			<rect x="9" y="9" width="11" height="11" rx="2" />
			<path d="M5 15V5a2 2 0 0 1 2-2h10" />
		</Glyph>
	)
}

export type CodeBlockProps = {
	lang?: string
	code: string
	streaming?: boolean
	copyLabel?: string
	copiedLabel?: string
}

export function CodeBlock({
	lang,
	code,
	streaming = false,
	copyLabel = "複製",
	copiedLabel = "已複製 ✓",
}: CodeBlockProps) {
	const { copied, copy } = useCopy()
	return (
		<div {...stylex.props(styles.block)}>
			<div {...stylex.props(styles.head)}>
				<span {...stylex.props(styles.lang)}>{lang ?? ""}</span>
				<button
					type="button"
					onClick={() => copy(code)}
					{...stylex.props(reset.control, styles.copy, copied && styles.copied)}
				>
					{!copied && <CopyIcon />}
					{copied ? copiedLabel : copyLabel}
				</button>
			</div>
			<pre
				tabIndex={0}
				role="region"
				aria-label={lang ? `${lang} 程式碼` : "程式碼"}
				{...stylex.props(styles.pre)}
			>
				<code {...stylex.props(styles.code)}>
					{code}
					{streaming && <span aria-hidden="true" {...stylex.props(styles.cursor)} />}
				</code>
			</pre>
		</div>
	)
}

export type InlineCodeProps = ComponentProps<"code">

export function InlineCode(props: InlineCodeProps) {
	return <code {...props} {...styled(props, styles.inline)} />
}
