import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useId, useState } from "react"
import { color, corner, font, motion, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	receipt: {
		position: "relative",
		overflow: "hidden",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: corner.md,
		backgroundColor: color.surfaceRaised,
	},
	row: {
		// 注意:StyleX 0.19 會靜默丟掉 `all: unset`(編不出任何規則),原生按鈕的
		// buttonface 底色與 outset 邊框會留在畫面上 —— 要逐項重設
		appearance: "none",
		backgroundColor: "transparent",
		borderWidth: 0,
		position: "relative",
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
		borderRadius: corner.md,
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
	link: {
		flex: "none",
		color: color.textFaint,
		transitionProperty: "color",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
	},
	linkOpen: { color: color.accent },
	chevron: {
		flex: "none",
		color: color.textFaint,
		transitionProperty: "rotate",
		transitionDuration: { default: "160ms", [REDUCED]: "0s" },
		transitionTimingFunction: "ease",
	},
	chevronOpen: { rotate: "180deg" },
	// 展開 = 0fr → 1fr(雙向平滑,不是 display 硬切);內容 opacity 跟進
	bodyWrap: {
		position: "relative",
		display: "grid",
		gridTemplateRows: "0fr",
		transitionProperty: "grid-template-rows",
		transitionDuration: { default: "240ms", [REDUCED]: "0s" },
		transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
	},
	bodyWrapOpen: { gridTemplateRows: "1fr" },
	bodyClip: { overflow: "hidden", minHeight: 0 },
	body: {
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: color.border,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		fontFamily: font.body,
		fontSize: text.xs,
		display: "grid",
		gap: space.xxs,
		opacity: 0,
		transitionProperty: "opacity",
		transitionDuration: { default: "200ms", [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
	bodyOpen: { opacity: 1 },
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
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						aria-hidden="true"
						{...stylex.props(styles.link, open && styles.linkOpen)}
					>
						<path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" />
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
			<div {...stylex.props(styles.bodyWrap, open && styles.bodyWrapOpen)}>
				<div {...stylex.props(styles.bodyClip)}>
					<div id={bodyId} inert={!open} {...stylex.props(styles.body, open && styles.bodyOpen)}>
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
							<span
								{...stylex.props(styles.checkText)}
							>{`本輪 ${ledgerCount} 條收據可查,不進新 context。`}</span>
						</p>
						{handoffSummary != null && <p {...stylex.props(styles.summary)}>{handoffSummary}</p>}
					</div>
				</div>
			</div>
		</div>
	)
}
