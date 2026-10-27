import * as stylex from "@stylexjs/stylex"
import { type KeyboardEvent, type ReactNode, useId, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { color, corner, focusRing, font, shadow, space, type } from "../../tokens.stylex"
import { Button } from "../button/Button"
import { Checkbox } from "../checkbox/Checkbox"
import { Radio } from "../radio/Radio"
import { RadioGroup } from "../radio/RadioGroup"
import { Glyph } from "../icon/glyphs"

const FORCED = "@media (forced-colors: active)"

const styles = stylex.create({
	// 沒有卡、沒有環:直接畫在紙上,只用間距、字重與一個灰分層次
	ask: {
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
		gap: space.xs,
		fontFamily: font.body,
		color: color.text,
	},
	// 「等你允許／等你回答」:琥珀字加 6px 點;答完變灰
	label: {
		display: "inline-flex",
		alignItems: "center",
		gap: "6px",
		fontSize: type.t1,
		fontWeight: 600,
		lineHeight: type.dense,
		color: color.warning,
	},
	labelDone: { color: color.textMuted },
	dot: {
		flex: "none",
		width: 6,
		height: 6,
		borderRadius: corner.shape,
		backgroundColor: { default: "currentColor", [FORCED]: "CanvasText" },
	},
	question: {
		fontSize: type.t3,
		fontWeight: 500,
		lineHeight: type.snug,
		margin: 0,
		color: color.text,
	},
	markdown: { fontSize: type.t2, lineHeight: type.body, margin: 0, color: color.textMuted },
	// 要跑的指令:縮一格、Geist Mono,沒有底;長的折行,不用橫向捲
	command: {
		fontFamily: font.mono,
		fontSize: type.t2,
		lineHeight: type.snug,
		margin: 0,
		paddingInlineStart: space.md,
		whiteSpace: "pre-wrap",
		overflowWrap: "anywhere",
		color: color.text,
	},
	actions: { display: "flex", alignItems: "center", gap: space.xs, flexWrap: "wrap" },
	// 次要的回覆是 chip:wash 底、膠囊、28px 高
	chip: {
		color: color.text,
		backgroundColor: { default: color.wash, ":hover": color.washHover },
		minHeight: "1.75rem",
		paddingInline: space.sm,
	},
	shortcut: {
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 500,
		opacity: 0.65,
		marginInlineStart: space.xxs,
	},
	note: { fontSize: type.t1, lineHeight: type.snug, color: color.textMuted, margin: 0 },
	options: {
		display: "grid",
		gap: space.xxs,
		margin: 0,
		padding: 0,
		borderWidth: 0,
		listStyle: "none",
		alignSelf: "stretch",
	},
	srOnly: {
		position: "absolute",
		width: 1,
		height: 1,
		padding: 0,
		margin: -1,
		overflow: "hidden",
		clipPath: "inset(50%)",
		whiteSpace: "nowrap",
		borderWidth: 0,
	},
	recommended: {
		fontSize: type.t1,
		fontWeight: 400,
		color: color.textMuted,
		marginInlineStart: space.xs,
	},
	// 文字欄位浮在紙上:surfaceRaised 加 shadow.float,沒有框;透明框只在 forced colors 顯形
	free: {
		alignSelf: "stretch",
		boxSizing: "border-box",
		backgroundColor: color.surfaceRaised,
		boxShadow: shadow.float,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "transparent",
		borderRadius: corner.box,
		color: color.text,
		fontFamily: font.body,
		fontSize: type.t2,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		resize: "vertical",
		minHeight: "2.4rem",
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: 2,
		"::placeholder": { color: color.textMuted },
	},
	receipt: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		fontSize: type.t2,
		lineHeight: type.snug,
		color: color.textMuted,
		margin: 0,
	},
	receiptIcon: { flex: "none" },
	receiptMono: { fontFamily: font.mono },
})

function Label({ done, children }: { done: boolean; children: ReactNode }) {
	return (
		<span {...stylex.props(styles.label, done && styles.labelDone)}>
			<span aria-hidden="true" {...stylex.props(styles.dot)} />
			{children}
		</span>
	)
}

function ReceiptIcon({ rejected }: { rejected?: boolean }) {
	return (
		<Glyph width={14} height={14} {...stylex.props(styles.receiptIcon)}>
			{/* 拒絕換成叉:收據只有灰字,記號是唯一分得出來的地方 */}
			<path d={rejected ? "M18 6 6 18M6 6l12 12" : "m5 13 4 4L19 7"} />
		</Glyph>
	)
}

const strings = defineStrings({
	"zh-TW": {
		cardName: (verb: string, subject: string) => `${verb}:${subject}`,
		blocking: "等你允許",
		waiting: "等你回答",
		replied: "已回覆",
		allowOnce: "允許一次",
		allowAlways: "總是允許",
		reject: "拒絕",
		scope: "這個指令",
		decided: "已回答",
		submit: "送出決定",
		acceptRecommended: "照建議",
		recommended: "建議",
	},
	en: {
		cardName: (verb: string, subject: string) => `${verb}: ${subject}`,
		blocking: "Waiting for your OK",
		waiting: "Waiting for your answer",
		replied: "Replied",
		allowOnce: "Allow once",
		allowAlways: "Always allow",
		reject: "Deny",
		scope: "this command",
		decided: "Answered",
		submit: "Submit decision",
		acceptRecommended: "Use recommendation",
		recommended: "Recommended",
	},
})

/**
 * PermissionCard's and DecisionCard's built-in words (follow `<LocaleProvider>`): the waiting
 * and answered labels, reply and submit buttons, the default `scope` and the "recommended" tag.
 * Override any with `labels`.
 */
export type InteractionCardLabels = StringsOf<typeof strings>

export type PermissionReply = "once" | { always: string } | { reject: true; message?: string }

export type PermissionReceipt = { text: string; rejected?: boolean }

export type PermissionCardProps = {
	/** What the agent wants to do, e.g. "Run command". The question line; also names the group. */
	verb: string
	/** The exact thing it wants to do it to, shown verbatim, indented, in mono. */
	subject: string
	/** What "Always allow" covers; reported back as `{ always: scope }`. Wins over `labels.scope`. */
	scope?: string
	/** A short muted note under the buttons, e.g. which policy asked. */
	policyHint?: ReactNode
	/** The amber label while waiting. Wins over `labels.blocking`. */
	blockingLabel?: string
	/** Called with the person's reply. */
	onReply?: (reply: PermissionReply) => void
	/** Once answered: the ask collapses to the grey label and this one muted line. */
	resolved?: PermissionReceipt
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<InteractionCardLabels>
}

/**
 * Asks the person to allow something the agent wants to do. Enter activates the focused
 * reply, ⌘/Ctrl+Enter always allows, Escape rejects.
 */
export function PermissionCard({
	verb,
	subject,
	scope: scopeProp,
	policyHint,
	blockingLabel,
	onReply,
	resolved,
	labels,
}: PermissionCardProps) {
	const t = useStrings(strings, labels)
	const scope = scopeProp ?? t.scope

	// Plain Enter is left to the focused button's own activation; only the
	// card-level shortcuts are intercepted.
	function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
		if (resolved) return
		if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
			event.preventDefault()
			onReply?.({ always: scope })
		} else if (event.key === "Escape") {
			event.preventDefault()
			onReply?.({ reject: true })
		}
	}

	return (
		<div role="group" aria-label={t.cardName(verb, subject)} {...stylex.props(styles.ask)}>
			<Label done={resolved != null}>{resolved ? t.replied : (blockingLabel ?? t.blocking)}</Label>
			<p aria-live="polite" {...stylex.props(resolved ? styles.receipt : styles.srOnly)}>
				{resolved != null && (
					<>
						<ReceiptIcon rejected={resolved.rejected} />
						{resolved.text}
						{" · "}
						<code {...stylex.props(styles.receiptMono)}>{subject}</code>
					</>
				)}
			</p>
			{resolved ? null : (
				<>
					<p {...stylex.props(styles.question)}>{verb}</p>
					<pre {...stylex.props(styles.command)}>{subject}</pre>
					<div {...stylex.props(styles.actions)}>
						<Button size="sm" onKeyDown={onKeyDown} onClick={() => onReply?.("once")}>
							{t.allowOnce}
							<kbd aria-hidden="true" {...stylex.props(styles.shortcut)}>
								⏎
							</kbd>
						</Button>
						<Button
							variant="secondary"
							size="sm"
							sx={styles.chip}
							aria-keyshortcuts="Meta+Enter Control+Enter"
							onKeyDown={onKeyDown}
							onClick={() => onReply?.({ always: scope })}
						>
							{t.allowAlways}
							<kbd aria-hidden="true" {...stylex.props(styles.shortcut)}>
								⌘⏎
							</kbd>
						</Button>
						<Button
							variant="secondary"
							size="sm"
							sx={styles.chip}
							aria-keyshortcuts="Escape"
							onKeyDown={onKeyDown}
							onClick={() => onReply?.({ reject: true })}
						>
							{t.reject}
							<kbd aria-hidden="true" {...stylex.props(styles.shortcut)}>
								Esc
							</kbd>
						</Button>
					</div>
					{policyHint != null && <p {...stylex.props(styles.note)}>{policyHint}</p>}
				</>
			)}
		</div>
	)
}

function optionLabel(option: DecisionOption, recommendedWord: string) {
	if (!option.recommended) return option.label
	return (
		<>
			{option.label}
			<span {...stylex.props(styles.recommended)}>{recommendedWord}</span>
		</>
	)
}

export type DecisionOption = {
	value: string
	label: string
	description?: string
	recommended?: boolean
}

export type DecisionBlock =
	| { kind: "markdown"; id: string; text: string }
	| {
			kind: "options"
			id: string
			label?: string
			multiple?: boolean
			required?: boolean
			options: DecisionOption[]
	  }
	| { kind: "text"; id: string; label?: string; placeholder?: string; required?: boolean }

export type DecisionAnswer = Record<string, string | string[]>

export type DecisionCardProps = {
	/** The question. Also names unlabelled option groups and text boxes. */
	title: string
	/** The card's contents in order: markdown notes, option groups and free-text boxes. */
	blocks: DecisionBlock[]
	/** The amber label while waiting, e.g. when the agent will go ahead on its own. Defaults to `labels.waiting`. */
	deadlineLabel?: string
	/** The submit button. Wins over `labels.submit`. */
	submitLabel?: string
	/** The button that submits the recommended options. Wins over `labels.acceptRecommended`. */
	recommendedLabel?: string
	/** Called with the answer, keyed by block id. */
	onAnswer?: (answer: DecisionAnswer) => void
	/** Once answered: the ask collapses to the grey label and this one muted line. */
	resolved?: { text: string }
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<InteractionCardLabels>
}

/** Asks the person a question: options, free text, and a one-click "use the recommendation". */
export function DecisionCard({
	title,
	blocks,
	deadlineLabel,
	submitLabel,
	recommendedLabel,
	onAnswer,
	resolved,
	labels,
}: DecisionCardProps) {
	const t = useStrings(strings, labels)
	const base = useId()
	const [answer, setAnswer] = useState<DecisionAnswer>({})

	const missing = blocks.some((block) => {
		if (block.kind === "markdown" || !block.required) return false
		const value = answer[block.id]
		return value == null || value.length === 0
	})

	const recommended: DecisionAnswer = {}
	for (const block of blocks) {
		if (block.kind !== "options") continue
		const picks = block.options.filter((option) => option.recommended).map((option) => option.value)
		if (picks.length === 0) continue
		recommended[block.id] = block.multiple ? picks : picks[0]
	}
	const hasRecommendation = Object.keys(recommended).length > 0
	const merged = { ...answer, ...recommended }
	const recommendationMissing = blocks.some((block) => {
		if (block.kind === "markdown" || !block.required) return false
		const value = merged[block.id]
		return value == null || value.length === 0
	})

	function set(id: string, value: string | string[]) {
		setAnswer((current) => ({ ...current, [id]: value }))
	}

	return (
		<div {...stylex.props(styles.ask)}>
			<Label done={resolved != null}>{resolved ? t.decided : (deadlineLabel ?? t.waiting)}</Label>
			<p aria-live="polite" {...stylex.props(resolved ? styles.receipt : styles.srOnly)}>
				{resolved != null && (
					<>
						<ReceiptIcon />
						{resolved.text}
					</>
				)}
			</p>
			{resolved ? null : (
				<>
					<p {...stylex.props(styles.question)}>{title}</p>
					{blocks.map((block) => {
						if (block.kind === "markdown") {
							return (
								<p key={block.id} {...stylex.props(styles.markdown)}>
									{block.text}
								</p>
							)
						}
						if (block.kind === "text") {
							return (
								<textarea
									key={block.id}
									rows={1}
									aria-label={block.label ?? title}
									placeholder={block.placeholder}
									required={block.required}
									value={(answer[block.id] as string) ?? ""}
									onChange={(event) => set(block.id, event.currentTarget.value)}
									{...stylex.props(styles.free)}
								/>
							)
						}
						const selected = answer[block.id]
						// label 沒給時,組名走 aria-label(視覺上不重複卡片標題)
						const groupLabel = block.label == null ? title : undefined
						if (block.multiple) {
							const picks = Array.isArray(selected) ? selected : []
							return (
								// role=group 不支援 aria-required,必填只靠送出鈕停用來表達
								<fieldset key={block.id} aria-label={groupLabel} {...stylex.props(styles.options)}>
									{block.label != null && <legend {...stylex.props(styles.question)}>{block.label}</legend>}
									{block.options.map((option) => (
										<Checkbox
											key={option.value}
											name={`${base}${block.id}`}
											value={option.value}
											checked={picks.includes(option.value)}
											onCheckedChange={(on) =>
												set(block.id, on ? [...picks, option.value] : picks.filter((v) => v !== option.value))
											}
											label={optionLabel(option, t.recommended)}
											description={option.description}
										/>
									))}
								</fieldset>
							)
						}
						return (
							<RadioGroup
								key={block.id}
								name={`${base}${block.id}`}
								legend={block.label}
								// radiogroup 才能帶 aria-required;fieldset 預設的 group 不行
								role="radiogroup"
								aria-label={groupLabel}
								aria-required={block.required || undefined}
								value={typeof selected === "string" ? selected : ""}
								onValueChange={(value) => set(block.id, value)}
							>
								{block.options.map((option) => (
									<Radio
										key={option.value}
										value={option.value}
										label={optionLabel(option, t.recommended)}
										description={option.description}
									/>
								))}
							</RadioGroup>
						)
					})}
					<div {...stylex.props(styles.actions)}>
						<Button size="sm" disabled={missing} onClick={() => onAnswer?.(answer)}>
							{submitLabel ?? t.submit}
						</Button>
						{hasRecommendation && (
							<Button
								variant="secondary"
								size="sm"
								sx={styles.chip}
								disabled={recommendationMissing}
								onClick={() => onAnswer?.(merged)}
							>
								{recommendedLabel ?? t.acceptRecommended}
							</Button>
						)}
					</div>
				</>
			)}
		</div>
	)
}
