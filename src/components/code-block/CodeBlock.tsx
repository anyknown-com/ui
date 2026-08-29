import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { reset, styled } from "../../lib/styled"
import { useCopy } from "../../lib/useCopy"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const blink = stylex.keyframes({ "50%": { opacity: 0 } })

const styles = stylex.create({
	block: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		backgroundColor: color.surface,
		overflow: "hidden",
	},
	head: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.xs,
		paddingBlock: space.xxs,
		paddingInlineStart: space.sm,
		paddingInlineEnd: space.xxs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
	},
	lang: {
		fontFamily: font.mono,
		fontSize: "0.68rem",
		lineHeight: text.leadingSnug,
		letterSpacing: "0.04em",
		color: color.textFaint,
	},
	copy: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		fontFamily: font.body,
		fontSize: text.xs,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: {
			default: "transparent",
			":hover": `color-mix(in srgb, ${color.border} 40%, ${color.surface})`,
		},
		paddingBlock: space.xxs,
		paddingInline: space.xxs,
		borderRadius: radius.sm,
		cursor: "pointer",
		transitionProperty: "background-color, color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	copied: { color: color.accent },
	pre: {
		margin: 0,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		overflowX: "auto",
		fontFamily: font.mono,
		fontSize: text.code,
		lineHeight: text.leadingNormal,
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
		fontSize: text.code,
		lineHeight: text.leadingNormal,
		backgroundColor: `color-mix(in srgb, ${color.border} 40%, ${color.surface})`,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.sm,
		paddingInline: "0.3em",
	},
})

function CopyIcon() {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<rect x="9" y="9" width="11" height="11" rx="2" />
			<path d="M5 15V5a2 2 0 0 1 2-2h10" />
		</svg>
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

export function InlineCode(props: ComponentProps<"code">) {
	return <code {...props} {...styled(props, styles.inline)} />
}
