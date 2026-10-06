import * as stylex from "@stylexjs/stylex"
import { type KeyboardEvent, type ReactNode, useId, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { color, corner, font, motion, shadow, space, type } from "../../tokens.stylex"
import { Button } from "../button/Button"
import { Checkbox } from "../checkbox/Checkbox"
import { Radio } from "../radio/Radio"
import { RadioGroup } from "../radio/RadioGroup"
import { Glyph } from "../icon/glyphs"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	// rest 卡片;等你回覆時外圈的環換成 warning(權限)或墨色(要你決定)
	card: {
		backgroundColor: color.surfaceRaised,
		boxShadow: shadow.rest,
		borderRadius: corner.card,
		paddingBlock: space.md,
		paddingInline: space.md,
		display: "grid",
		gap: space.sm,
		fontFamily: font.body,
		transitionProperty: "box-shadow",
		transitionDuration: { default: "180ms", [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
	permissionPending: { boxShadow: `0 0 0 1px ${color.warning}, ${shadow.rest}` },
	decisionPending: { boxShadow: `0 0 0 1px ${color.accent}, ${shadow.rest}` },
	head: { display: "flex", alignItems: "center", gap: space.xs },
	headIconWarning: { flex: "none", color: color.warning },
	headIconAccent: { flex: "none", color: color.accent },
	verb: { fontSize: type.t2, fontWeight: 500, lineHeight: type.snug, color: color.text },
	state: {
		marginInlineStart: "auto",
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.06em",
		textTransform: "uppercase",
		whiteSpace: "nowrap",
	},
	stateWarning: { color: color.warning },
	stateAccent: { color: color.accent },
	stateQuiet: { color: color.textMuted },
	body: { display: "grid", gap: space.xs },
	mono: {
		fontFamily: font.mono,
		fontSize: type.t2,
		lineHeight: type.snug,
		backgroundColor: color.surface,
		borderRadius: corner.small,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		overflowX: "auto",
		whiteSpace: "pre",
		margin: 0,
		color: color.text,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
	},
	actions: { display: "flex", gap: space.xs, flexWrap: "wrap" },
	shortcut: {
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 500,
		opacity: 0.65,
		marginInlineStart: space.xxs,
	},
	policy: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		fontSize: type.t2,
		color: color.textMuted,
		margin: 0,
	},
	policyIcon: { flex: "none", color: color.textFaint },
	question: {
		fontSize: type.t3,
		fontWeight: 500,
		lineHeight: type.snug,
		margin: 0,
		color: color.text,
	},
	markdown: { fontSize: type.t2, lineHeight: type.body, margin: 0, color: color.textMuted },
	options: {
		display: "grid",
		gap: space.xxs,
		margin: 0,
		padding: 0,
		borderWidth: 0,
		listStyle: "none",
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
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.05em",
		textTransform: "uppercase",
		color: color.accent,
		backgroundColor: color.accentSubtle,
		borderRadius: corner.pill,
		paddingBlock: "0.15rem",
		paddingInline: space.xs,
		marginInlineStart: space.xxs,
		verticalAlign: "middle",
	},
	free: {
		width: "100%",
		boxSizing: "border-box",
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: color.border, ":focus-visible": color.focusRing },
		borderRadius: corner.control,
		color: color.text,
		fontFamily: font.body,
		fontSize: type.t2,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		resize: "vertical",
		minHeight: "2.4rem",
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
		"::placeholder": { color: color.textFaint },
	},
	receipt: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		fontSize: type.t2,
		color: color.textMuted,
		margin: 0,
	},
	receiptIcon: { flex: "none", color: color.accent },
	receiptIconRejected: { color: color.danger },
	receiptMono: { fontFamily: font.mono },
})

function LockIcon() {
	return (
		<Glyph width={15} height={15} {...stylex.props(styles.headIconWarning)}>
			<rect x="4" y="10" width="16" height="10" rx="2" />
			<path d="M8 10V7a4 4 0 0 1 8 0v3" />
		</Glyph>
	)
}

function DecideIcon() {
	return (
		<Glyph width={15} height={15} {...stylex.props(styles.headIconAccent)}>
			<path d="M9 18h6M10 21h4" />
			<path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3Z" />
		</Glyph>
	)
}

function InfoIcon() {
	return (
		<Glyph width={13} height={13} {...stylex.props(styles.policyIcon)}>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 8v4m0 4h.01" />
		</Glyph>
	)
}

function ReceiptIcon({ rejected }: { rejected?: boolean }) {
	return (
		<Glyph
			width={14}
			height={14}
			{...stylex.props(styles.receiptIcon, rejected && styles.receiptIconRejected)}
		>
			<path d="m5 13 4 4L19 7" />
		</Glyph>
	)
}

const strings = defineStrings({
	"zh-TW": {
		cardName: (verb: string, subject: string) => `${verb}:${subject}`,
		blocking: "等你才能繼續",
		waiting: "等你",
		replied: "已回覆",
		allowOnce: "允許一次",
		allowAlways: "總是允許",
		reject: "拒絕",
		scope: "這個指令",
		decide: "決定",
		decided: "已決定",
		submit: "送出決定",
		acceptRecommended: "照建議",
		recommended: "建議",
	},
	en: {
		cardName: (verb: string, subject: string) => `${verb}: ${subject}`,
		blocking: "Blocked on you",
		waiting: "Waiting on you",
		replied: "Replied",
		allowOnce: "Allow once",
		allowAlways: "Always allow",
		reject: "Deny",
		scope: "this command",
		decide: "Decision",
		decided: "Decided",
		submit: "Submit decision",
		acceptRecommended: "Use recommendation",
		recommended: "Recommended",
	},
})

/**
 * PermissionCard's and DecisionCard's built-in words (follow `<LocaleProvider>`): state
 * badges, reply and submit buttons, the default `scope` and the "recommended" tag.
 * Override any with `labels`.
 */
export type InteractionCardLabels = StringsOf<typeof strings>

export type PermissionReply = "once" | { always: string } | { reject: true; message?: string }

export type PermissionReceipt = { text: string; rejected?: boolean }

export type PermissionCardProps = {
	/** What the agent wants to do, e.g. "Run command". Heads the card and names it. */
	verb: string
	/** The exact thing it wants to do it to, shown verbatim in a scrollable block. */
	subject: string
	/** What "Always allow" covers; reported back as `{ always: scope }`. Wins over `labels.scope`. */
	scope?: string
	/** A short note under the buttons, e.g. which policy asked. */
	policyHint?: ReactNode
	/** The state badge while waiting. Wins over `labels.blocking`. */
	blockingLabel?: string
	/** Called with the person's reply. */
	onReply?: (reply: PermissionReply) => void
	/** Once answered: the card collapses to this receipt. */
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
		<div
			role="group"
			aria-label={t.cardName(verb, subject)}
			{...stylex.props(styles.card, !resolved && styles.permissionPending)}
		>
			<div {...stylex.props(styles.head)}>
				<LockIcon />
				<span {...stylex.props(styles.verb)}>{verb}</span>
				<span {...stylex.props(styles.state, resolved ? styles.stateQuiet : styles.stateWarning)}>
					{resolved ? t.replied : (blockingLabel ?? t.blocking)}
				</span>
			</div>
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
				<div {...stylex.props(styles.body)}>
					<pre tabIndex={0} role="region" aria-label={verb} {...stylex.props(styles.mono)}>
						{subject}
					</pre>
					<div {...stylex.props(styles.actions)}>
						<Button onKeyDown={onKeyDown} onClick={() => onReply?.("once")}>
							{t.allowOnce}
							<kbd aria-hidden="true" {...stylex.props(styles.shortcut)}>
								⏎
							</kbd>
						</Button>
						<Button
							variant="secondary"
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
							variant="dangerGhost"
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
					{policyHint != null && (
						<p {...stylex.props(styles.policy)}>
							<InfoIcon />
							{policyHint}
						</p>
					)}
				</div>
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
	/** The agent cannot continue until this is answered: the card gets a ring and a blocking badge. */
	blocking?: boolean
	/** The badge when not blocking, e.g. when the agent will go ahead on its own. Defaults to `labels.waiting`. */
	deadlineLabel?: string
	/** The submit button. Wins over `labels.submit`. */
	submitLabel?: string
	/** The button that submits the recommended options. Wins over `labels.acceptRecommended`. */
	recommendedLabel?: string
	/** Called with the answer, keyed by block id. */
	onAnswer?: (answer: DecisionAnswer) => void
	/** Once answered: the card collapses to this receipt. */
	resolved?: { text: string }
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<InteractionCardLabels>
}

/** Asks the person to decide: options, free text, and a one-click "use the recommendation". */
export function DecisionCard({
	title,
	blocks,
	blocking = false,
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
		<div {...stylex.props(styles.card, !resolved && blocking && styles.decisionPending)}>
			<div {...stylex.props(styles.head)}>
				<DecideIcon />
				<span {...stylex.props(styles.verb)}>{t.decide}</span>
				<span
					{...stylex.props(
						styles.state,
						resolved ? styles.stateQuiet : blocking ? styles.stateAccent : styles.stateQuiet,
					)}
				>
					{resolved ? t.decided : blocking ? t.blocking : (deadlineLabel ?? t.waiting)}
				</span>
			</div>
			<p aria-live="polite" {...stylex.props(resolved ? styles.receipt : styles.srOnly)}>
				{resolved != null && (
					<>
						<ReceiptIcon />
						{resolved.text}
					</>
				)}
			</p>
			{resolved ? null : (
				<div {...stylex.props(styles.body)}>
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
								<fieldset
									key={block.id}
									aria-label={groupLabel}
									aria-required={block.required || undefined}
									{...stylex.props(styles.options)}
								>
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
								aria-label={groupLabel}
								aria-required={block.required || undefined}
								variant="card"
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
						<Button disabled={missing} onClick={() => onAnswer?.(answer)}>
							{submitLabel ?? t.submit}
						</Button>
						{hasRecommendation && (
							<Button variant="secondary" disabled={recommendationMissing} onClick={() => onAnswer?.(merged)}>
								{recommendedLabel ?? t.acceptRecommended}
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
