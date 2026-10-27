import * as stylex from "@stylexjs/stylex"
import { type ReactNode, useId } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { useControllableState } from "../../lib/useControllableState"
import { color, corner, focusRing, font, motion, space, type } from "../../tokens.stylex"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	// 直接畫在紙上:一行灰字,沒有底、線、膠囊;展開的內容縮一格
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
		gap: space.xxs,
		width: "100%",
		boxSizing: "border-box",
		minHeight: 28,
		paddingBlock: space.xxs,
		paddingInline: 0,
		cursor: "pointer",
		fontFamily: font.body,
		fontSize: type.t2,
		textAlign: "start",
		color: { default: color.textMuted, ":hover": color.text },
		borderRadius: corner.shape,
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	mono: { fontFamily: font.mono, fontSize: type.t1, lineHeight: 1, whiteSpace: "nowrap" },
	chevron: {
		flex: "none",
		transitionProperty: "rotate",
		transitionDuration: { default: motion.quick, [REDUCED]: "0s" },
		transitionTimingFunction: motion.ease,
	},
	chevronOpen: { rotate: "90deg" },
	// 展開 = 0fr → 1fr(雙向平滑,不是 display 硬切);內容 opacity 跟進
	bodyWrap: {
		position: "relative",
		display: "grid",
		gridTemplateRows: "0fr",
		transitionProperty: "grid-template-rows",
		transitionDuration: { default: motion.slide, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	bodyWrapOpen: { gridTemplateRows: "1fr" },
	bodyClip: { overflow: "hidden", minHeight: 0 },
	body: {
		marginInlineStart: space.md,
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: type.snug,
		display: "grid",
		gap: space.xxs,
		opacity: 0,
		transitionProperty: "opacity",
		transitionDuration: { default: motion.normal, [REDUCED]: "0s" },
		transitionTimingFunction: motion.easeOut,
	},
	bodyOpen: { opacity: 1 },
	check: { display: "flex", alignItems: "baseline", gap: space.xxs, margin: 0 },
	checkIcon: { flex: "none", color: color.textMuted, translate: "0 2px" },
	checkTitle: { fontWeight: 500, whiteSpace: "nowrap", color: color.text },
	checkText: { color: color.textMuted },
	summary: { margin: 0, color: color.textMuted },
})

const strings = defineStrings({
	"zh-TW": {
		rotated: "換班完成",
		newSession: "新 session",
		hardLimit: "(硬上限)",
		stateTransition: "(狀態切換)",
		memoryTitle: "記憶",
		summaryTitle: "摘要",
		ledgerTitle: "紀錄",
		memoryLabel: (count: number, items: string[]) =>
			`${count} 則記憶已存下${items.length > 0 ? `(${items.join("、")})` : ""}。`,
		summaryLabel: "交接摘要已交給新 session,讀過就刪除。",
		ledgerLabel: (count: number) => `這一輪的 ${count} 筆紀錄還查得到,不會帶進新 session。`,
	},
	en: {
		rotated: "Handed off",
		newSession: "new session",
		hardLimit: " (hard limit)",
		stateTransition: " (state change)",
		memoryTitle: "Memory",
		summaryTitle: "Summary",
		ledgerTitle: "Records",
		memoryLabel: (count: number, items: string[]) =>
			`${count} ${count === 1 ? "memory" : "memories"} saved${items.length > 0 ? ` (${items.join(", ")})` : ""}.`,
		summaryLabel: "The handoff summary went to the new session and is deleted once read.",
		ledgerLabel: (count: number) =>
			`This round's ${count} ${count === 1 ? "record stays" : "records stay"} searchable but not carried into the new session.`,
	},
})

/** HandoffReceipt's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type HandoffReceiptLabels = StringsOf<typeof strings>

function CheckIcon() {
	return (
		<Glyph width={13} height={13} {...stylex.props(styles.checkIcon)}>
			<path d="m5 13 4 4L19 7" />
		</Glyph>
	)
}

/** Why the session rotated: the soft threshold, the hard context limit, or a state change. */
export type HandoffReason = "soft-threshold" | "hard-limit" | "state-transition"

export type HandoffReceiptProps = {
	/** When the handoff happened, already formatted (e.g. `"14:32"`). */
	at: string
	/** How full the context was at the handoff, 0–100. */
	ctxPercent: number
	/** Why it rotated. `hard-limit` and `state-transition` are named in the row; the default is not. */
	reason?: HandoffReason
	/** The memories carried over: how many, and optionally their names. */
	memory: { count: number; items?: string[] }
	/** How many records of this round stay behind, still searchable. */
	ledgerCount: number
	/** The handoff summary itself, shown under the three checks. */
	handoffSummary?: ReactNode
	/** Whether the checks are shown. Pass it to control the fold; pair it with `onOpenChange`. */
	open?: boolean
	/** Whether the checks start shown when `open` is not passed. Collapsed by default. */
	defaultOpen?: boolean
	/** Called with the new state when the user opens or closes the fold. */
	onOpenChange?: (open: boolean) => void
	/** Override built-in words for this receipt; the rest follow `<LocaleProvider>`. */
	labels?: Partial<HandoffReceiptLabels>
}

/**
 * A receipt in the thread where the agent rotated to a new session: one muted line (time, context
 * fill, reason) with the chevron after the words, that folds open to what was kept, handed over and left behind. The row is a
 * real button: Enter and Space toggle it.
 */
export function HandoffReceipt({
	at,
	ctxPercent,
	reason = "soft-threshold",
	memory,
	ledgerCount,
	handoffSummary,
	open: openProp,
	defaultOpen = false,
	onOpenChange,
	labels,
}: HandoffReceiptProps) {
	const t = useStrings(strings, labels)
	const reasonLabel =
		reason === "hard-limit" ? t.hardLimit : reason === "state-transition" ? t.stateTransition : ""
	const bodyId = useId()
	const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange)

	return (
		<div {...stylex.props(styles.receipt)}>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={bodyId}
				onClick={() => setOpen(!open)}
				{...stylex.props(styles.row)}
			>
				<span>
					{`${t.rotated} · `}
					<span {...stylex.props(styles.mono)}>{at}</span>
					{" · "}
					<span {...stylex.props(styles.mono)}>{`ctx ${ctxPercent}%`}</span>
					{reasonLabel}
					{` → ${t.newSession}`}
				</span>
				<Glyph width={14} height={14} {...stylex.props(styles.chevron, open && styles.chevronOpen)}>
					<path d="m9 6 6 6-6 6" />
				</Glyph>
			</button>
			<div {...stylex.props(styles.bodyWrap, open && styles.bodyWrapOpen)}>
				<div {...stylex.props(styles.bodyClip)}>
					<div id={bodyId} inert={!open} {...stylex.props(styles.body, open && styles.bodyOpen)}>
						<p {...stylex.props(styles.check)}>
							<CheckIcon />
							<b {...stylex.props(styles.checkTitle)}>{t.memoryTitle}</b>
							<span {...stylex.props(styles.checkText)}>
								{t.memoryLabel(memory.count, memory.items ?? [])}
							</span>
						</p>
						<p {...stylex.props(styles.check)}>
							<CheckIcon />
							<b {...stylex.props(styles.checkTitle)}>{t.summaryTitle}</b>
							<span {...stylex.props(styles.checkText)}>{t.summaryLabel}</span>
						</p>
						<p {...stylex.props(styles.check)}>
							<CheckIcon />
							<b {...stylex.props(styles.checkTitle)}>{t.ledgerTitle}</b>
							<span {...stylex.props(styles.checkText)}>{t.ledgerLabel(ledgerCount)}</span>
						</p>
						{handoffSummary != null && <p {...stylex.props(styles.summary)}>{handoffSummary}</p>}
					</div>
				</div>
			</div>
		</div>
	)
}
