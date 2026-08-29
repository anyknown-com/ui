import * as stylex from "@stylexjs/stylex"
import { type KeyboardEvent, type ReactNode, useId, useState } from "react"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"
import { Button } from "../button/Button"
import { Checkbox } from "../checkbox/Checkbox"
import { Radio } from "../radio/Radio"
import { RadioGroup } from "../radio/RadioGroup"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	card: {
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		paddingBlock: space.sm,
		paddingInline: space.md,
		display: "grid",
		gap: space.xs,
		fontFamily: font.body,
		transitionProperty: "border-color",
		transitionDuration: { default: "180ms", [REDUCED]: "0s" },
	},
	permissionPending: { borderColor: color.warning },
	decisionPending: { borderColor: color.accent },
	head: { display: "flex", alignItems: "center", gap: space.xs },
	headIconWarning: { flex: "none", color: color.warning },
	headIconAccent: { flex: "none", color: color.accent },
	verb: { fontSize: text.sm, fontWeight: 500, lineHeight: text.leadingSnug, color: color.text },
	state: {
		marginInlineStart: "auto",
		fontFamily: font.mono,
		fontSize: "0.68rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.06em",
		textTransform: "uppercase",
		whiteSpace: "nowrap",
	},
	stateWarning: { color: color.warning },
	stateAccent: { color: color.accent },
	stateQuiet: { color: color.textFaint },
	body: { display: "grid", gap: space.xs },
	mono: {
		fontFamily: font.mono,
		fontSize: "0.82rem",
		lineHeight: text.leadingNormal,
		backgroundColor: color.bg,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.sm,
		paddingBlock: space.xs,
		paddingInline: space.xs,
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
		fontSize: "0.68rem",
		fontWeight: 500,
		opacity: 0.65,
		marginInlineStart: space.xxs,
	},
	policy: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		fontSize: "0.78rem",
		color: color.textMuted,
		borderTopWidth: 1,
		borderTopStyle: "solid",
		borderTopColor: color.border,
		paddingTop: space.xs,
		margin: 0,
	},
	policyIcon: { flex: "none", color: color.textFaint },
	question: {
		fontSize: "0.95rem",
		fontWeight: 500,
		lineHeight: text.leadingSnug,
		margin: 0,
		color: color.text,
	},
	markdown: { fontSize: text.sm, lineHeight: text.leadingRelaxed, margin: 0, color: color.textMuted },
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
		fontSize: "0.62rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.05em",
		textTransform: "uppercase",
		color: color.accent,
		backgroundColor: color.accentSubtle,
		borderRadius: radius.sm,
		paddingBlock: "0.15rem",
		paddingInline: space.xxs,
		marginInlineStart: space.xxs,
		verticalAlign: "middle",
	},
	free: {
		width: "100%",
		boxSizing: "border-box",
		backgroundColor: color.bg,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: color.border, ":focus-visible": color.focusRing },
		borderRadius: radius.sm,
		color: color.text,
		fontFamily: font.body,
		fontSize: text.sm,
		paddingBlock: space.xs,
		paddingInline: space.xs,
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
		fontSize: text.sm,
		color: color.textMuted,
		margin: 0,
	},
	receiptIcon: { flex: "none", color: color.accent },
	receiptIconRejected: { color: color.danger },
	receiptMono: { fontFamily: font.mono },
})

function LockIcon() {
	return (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.headIconWarning)}
		>
			<rect x="4" y="10" width="16" height="10" rx="2" />
			<path d="M8 10V7a4 4 0 0 1 8 0v3" />
		</svg>
	)
}

function DecideIcon() {
	return (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.headIconAccent)}
		>
			<path d="M9 18h6M10 21h4" />
			<path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3Z" />
		</svg>
	)
}

function InfoIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.policyIcon)}
		>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 8v4m0 4h.01" />
		</svg>
	)
}

function ReceiptIcon({ rejected }: { rejected?: boolean }) {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.receiptIcon, rejected && styles.receiptIconRejected)}
		>
			<path d="m5 13 4 4L19 7" />
		</svg>
	)
}

export type PermissionReply = "once" | { always: string } | { reject: true; message?: string }

export type PermissionReceipt = { text: string; rejected?: boolean }

export type PermissionCardProps = {
	verb: string
	subject: string
	scope?: string
	policyHint?: ReactNode
	blockingLabel?: string
	onReply?: (reply: PermissionReply) => void
	resolved?: PermissionReceipt
}

export function PermissionCard({
	verb,
	subject,
	scope = "這個指令",
	policyHint,
	blockingLabel = "等你才能繼續",
	onReply,
	resolved,
}: PermissionCardProps) {
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
			aria-label={`${verb}:${subject}`}
			{...stylex.props(styles.card, !resolved && styles.permissionPending)}
		>
			<div {...stylex.props(styles.head)}>
				<LockIcon />
				<span {...stylex.props(styles.verb)}>{verb}</span>
				<span {...stylex.props(styles.state, resolved ? styles.stateQuiet : styles.stateWarning)}>
					{resolved ? "已回覆" : blockingLabel}
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
							允許一次
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
							總是允許
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
							拒絕
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

function optionLabel(option: DecisionOption) {
	if (!option.recommended) return option.label
	return (
		<>
			{option.label}
			<span {...stylex.props(styles.recommended)}>建議</span>
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
	title: string
	blocks: DecisionBlock[]
	blocking?: boolean
	deadlineLabel?: string
	submitLabel?: string
	recommendedLabel?: string
	onAnswer?: (answer: DecisionAnswer) => void
	resolved?: { text: string }
}

export function DecisionCard({
	title,
	blocks,
	blocking = false,
	deadlineLabel,
	submitLabel = "送出決定",
	recommendedLabel = "照建議",
	onAnswer,
	resolved,
}: DecisionCardProps) {
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
				<span {...stylex.props(styles.verb)}>決定</span>
				<span
					{...stylex.props(
						styles.state,
						resolved ? styles.stateQuiet : blocking ? styles.stateAccent : styles.stateQuiet,
					)}
				>
					{resolved ? "已決定" : blocking ? "等你才能繼續" : (deadlineLabel ?? "等你")}
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
											label={optionLabel(option)}
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
										label={optionLabel(option)}
										description={option.description}
									/>
								))}
							</RadioGroup>
						)
					})}
					<div {...stylex.props(styles.actions)}>
						<Button disabled={missing} onClick={() => onAnswer?.(answer)}>
							{submitLabel}
						</Button>
						{hasRecommendation && (
							<Button variant="secondary" disabled={recommendationMissing} onClick={() => onAnswer?.(merged)}>
								{recommendedLabel}
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
