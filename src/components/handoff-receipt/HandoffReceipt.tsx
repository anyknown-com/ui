import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useId, useState } from "react"
import { KNOT_LEAD, KNOT_LOOP } from "../../lib/paths"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const slideIn = stylex.keyframes({
	from: { opacity: 0, translate: "0 -3px" },
	to: { opacity: 1, translate: "0 0" },
})

const styles = stylex.create({
	receipt: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.md,
		backgroundColor: color.surface,
	},
	row: {
		all: "unset",
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		width: "100%",
		boxSizing: "border-box",
		paddingBlock: space.xs,
		paddingInline: space.sm,
		cursor: "pointer",
		fontFamily: font.body,
		fontSize: text.xs,
		color: { default: color.textMuted, ":hover": color.text },
		borderRadius: radius.md,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	rule: {
		flex: 1,
		borderTopWidth: 1,
		borderTopStyle: "dashed",
		borderTopColor: color.borderStrong,
		minWidth: space.md,
		transitionProperty: "border-color",
		transitionDuration: { default: "300ms", [REDUCED]: "0s" },
	},
	ruleOpen: { borderTopStyle: "solid", borderTopColor: color.accent },
	label: { whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: space.xxs },
	mono: { fontFamily: font.mono, fontSize: "0.76rem", lineHeight: 1 },
	knot: { flex: "none", overflow: "visible" },
	lead: {
		stroke: color.textFaint,
		transitionProperty: "opacity",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
	},
	leadHidden: { opacity: 0 },
	loop: {
		stroke: color.accent,
		strokeDasharray: 100,
		strokeDashoffset: 100,
		transitionProperty: "stroke-dashoffset",
		transitionDuration: { default: "500ms", [REDUCED]: "0s" },
		transitionTimingFunction: "ease",
		transitionDelay: { default: "120ms", [REDUCED]: "0s" },
	},
	loopTied: { strokeDashoffset: 0 },
	chevron: {
		flex: "none",
		color: color.textFaint,
		transitionProperty: "rotate",
		transitionDuration: { default: "160ms", [REDUCED]: "0s" },
		transitionTimingFunction: "ease",
	},
	chevronOpen: { rotate: "180deg" },
	body: {
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: color.border,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		fontFamily: font.body,
		fontSize: text.xs,
		display: { default: "grid", ":is([hidden])": "none" },
		gap: space.xxs,
		animationName: { default: slideIn, [REDUCED]: "none" },
		animationDuration: "160ms",
		animationTimingFunction: "ease-out",
	},
	check: { display: "flex", alignItems: "baseline", gap: space.xxs, margin: 0 },
	checkIcon: { flex: "none", color: color.accent, translate: "0 2px" },
	checkTitle: { fontWeight: 500, whiteSpace: "nowrap", color: color.text },
	checkText: { color: color.textMuted },
	summary: {
		margin: 0,
		color: color.textMuted,
		borderInlineStartWidth: 2,
		borderInlineStartStyle: "solid",
		borderInlineStartColor: color.border,
		paddingInlineStart: space.xs,
	},
})

const REASON_LABEL: Record<string, string> = {
	"soft-threshold": "",
	"hard-limit": "(硬上限)",
	"state-transition": "(狀態切換)",
}

function CheckIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.checkIcon)}
		>
			<path d="m5 13 4 4L19 7" />
		</svg>
	)
}

export type HandoffReason = "soft-threshold" | "hard-limit" | "state-transition"

export type HandoffReceiptProps = {
	at: string
	ctxPercent: number
	reason?: HandoffReason
	memory: { count: number; items?: string[] }
	ledgerCount: number
	handoffSummary?: ReactNode
	defaultOpen?: boolean
}

export function HandoffReceipt({
	at,
	ctxPercent,
	reason = "soft-threshold",
	memory,
	ledgerCount,
	handoffSummary,
	defaultOpen = false,
}: HandoffReceiptProps) {
	const bodyId = useId()
	const [open, setOpen] = useState(defaultOpen)

	return (
		<div {...stylex.props(styles.receipt)}>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={bodyId}
				onClick={() => setOpen((value) => !value)}
				{...stylex.props(styles.row)}
			>
				<span aria-hidden="true" {...stylex.props(styles.rule, open && styles.ruleOpen)} />
				<span {...stylex.props(styles.label)}>
					<svg
						width="15"
						height="13"
						viewBox="0 0 15 13"
						fill="none"
						strokeWidth="1.7"
						strokeLinecap="round"
						aria-hidden="true"
						{...stylex.props(styles.knot)}
					>
						<path d={KNOT_LEAD} {...stylex.props(styles.lead, open && styles.leadHidden)} />
						<path d={KNOT_LOOP} pathLength="100" {...stylex.props(styles.loop, open && styles.loopTied)} />
					</svg>
					<span>
						{"換班完成 · "}
						<span {...stylex.props(styles.mono)}>{at}</span>
						{" · "}
						<span {...stylex.props(styles.mono)}>{`ctx ${ctxPercent}%`}</span>
						{REASON_LABEL[reason]}
						{" → 新 session"}
					</span>
				</span>
				<svg
					width="12"
					height="12"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					aria-hidden="true"
					{...stylex.props(styles.chevron, open && styles.chevronOpen)}
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
				<span aria-hidden="true" {...stylex.props(styles.rule, open && styles.ruleOpen)} />
			</button>
			<div id={bodyId} hidden={!open} {...stylex.props(styles.body)}>
				<p {...stylex.props(styles.check)}>
					<CheckIcon />
					<b {...stylex.props(styles.checkTitle)}>記憶</b>
					<span {...stylex.props(styles.checkText)}>
						{`${memory.count} 筆耐久事實已落盤`}
						{memory.items?.length ? `(${memory.items.join("、")})` : ""}。
					</span>
				</p>
				<p {...stylex.props(styles.check)}>
					<CheckIcon />
					<b {...stylex.props(styles.checkTitle)}>摘要</b>
					<span {...stylex.props(styles.checkText)}>handoff 已交給下一輪,讀後即銷毀。</span>
				</p>
				<p {...stylex.props(styles.check)}>
					<CheckIcon />
					<b {...stylex.props(styles.checkTitle)}>Ledger</b>
					<span {...stylex.props(styles.checkText)}>{`本輪 ${ledgerCount} 條收據可查,不進新 context。`}</span>
				</p>
				{handoffSummary != null && <p {...stylex.props(styles.summary)}>{handoffSummary}</p>}
			</div>
		</div>
	)
}
