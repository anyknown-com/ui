import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useId, useState } from "react"
import { color, corner, font, motion, space, type } from "../../tokens.stylex"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	// 直接畫在紙上:一條分隔線中間一顆膠囊,展開的摘要是凹下去的 surface
	receipt: {
		position: "relative",
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
		paddingBlock: space.xxs,
		paddingInline: 0,
		cursor: "pointer",
		fontFamily: font.body,
		fontSize: type.t2,
		color: { default: color.textMuted, ":hover": color.text },
		borderRadius: corner.pill,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
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
	label: {
		display: "flex",
		alignItems: "center",
		gap: 6,
		minWidth: 0,
		boxSizing: "border-box",
		minHeight: 32,
		paddingBlock: space.xxs,
		paddingInline: space.sm,
		borderRadius: corner.pill,
		backgroundColor: color.surface,
		textAlign: "start",
	},
	mono: { fontFamily: font.mono, fontSize: type.t1, lineHeight: 1, whiteSpace: "nowrap" },
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
		marginBlockStart: space.xs,
		backgroundColor: color.surface,
		borderRadius: corner.card,
		paddingBlock: space.sm,
		paddingInline: space.md,
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: type.snug,
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
		<Glyph width={13} height={13} {...stylex.props(styles.checkIcon)}>
			<path d="m5 13 4 4L19 7" />
		</Glyph>
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
	/** The three checks' names. */
	memoryTitle?: string
	summaryTitle?: string
	ledgerTitle?: string
	/** What was kept: the memory count and, when given, the items in brackets. */
	memoryLabel?: (count: number, items: string[]) => string
	summaryLabel?: string
	/** What stays behind: this round's records, still searchable, not carried over. */
	ledgerLabel?: (count: number) => string
}

export function HandoffReceipt({
	at,
	ctxPercent,
	reason = "soft-threshold",
	memory,
	ledgerCount,
	handoffSummary,
	defaultOpen = false,
	memoryTitle = "記憶",
	summaryTitle = "摘要",
	ledgerTitle = "紀錄",
	memoryLabel = (count, items) => `${count} 則記憶已存下${items.length > 0 ? `(${items.join("、")})` : ""}。`,
	summaryLabel = "交接摘要已交給新 session,讀過就刪除。",
	ledgerLabel = (count) => `這一輪的 ${count} 筆紀錄還查得到,不會帶進新 session。`,
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
					<Glyph width={13} height={13} {...stylex.props(styles.link, open && styles.linkOpen)}>
						<path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" />
					</Glyph>
					<span>
						{"換班完成 · "}
						<span {...stylex.props(styles.mono)}>{at}</span>
						{" · "}
						<span {...stylex.props(styles.mono)}>{`ctx ${ctxPercent}%`}</span>
						{REASON_LABEL[reason]}
						{" → 新 session"}
					</span>
				</span>
				<Glyph width={12} height={12} {...stylex.props(styles.chevron, open && styles.chevronOpen)}>
					<path d="m6 9 6 6 6-6" />
				</Glyph>
				<span aria-hidden="true" {...stylex.props(styles.rule, open && styles.ruleOpen)} />
			</button>
			<div {...stylex.props(styles.bodyWrap, open && styles.bodyWrapOpen)}>
				<div {...stylex.props(styles.bodyClip)}>
					<div id={bodyId} inert={!open} {...stylex.props(styles.body, open && styles.bodyOpen)}>
						<p {...stylex.props(styles.check)}>
							<CheckIcon />
							<b {...stylex.props(styles.checkTitle)}>{memoryTitle}</b>
							<span {...stylex.props(styles.checkText)}>{memoryLabel(memory.count, memory.items ?? [])}</span>
						</p>
						<p {...stylex.props(styles.check)}>
							<CheckIcon />
							<b {...stylex.props(styles.checkTitle)}>{summaryTitle}</b>
							<span {...stylex.props(styles.checkText)}>{summaryLabel}</span>
						</p>
						<p {...stylex.props(styles.check)}>
							<CheckIcon />
							<b {...stylex.props(styles.checkTitle)}>{ledgerTitle}</b>
							<span {...stylex.props(styles.checkText)}>{ledgerLabel(ledgerCount)}</span>
						</p>
						{handoffSummary != null && <p {...stylex.props(styles.summary)}>{handoffSummary}</p>}
					</div>
				</div>
			</div>
		</div>
	)
}
