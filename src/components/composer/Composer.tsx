import * as stylex from "@stylexjs/stylex"
import { type KeyboardEvent, type ReactNode, useCallback, useId, useRef, useState } from "react"
import { flushSync } from "react-dom"
import { press, reset } from "../../lib/styled"
import { popupStyles } from "../../lib/popup"
import { breakpoint, color, corner, font, motion, space, type } from "../../tokens.stylex"
import { autoGrow } from "../textarea/Textarea"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	// 凹下去的 surface 紙,無框;打字時外圈一條 signal 焦點環
	composer: {
		position: "relative",
		backgroundColor: color.surface,
		borderRadius: corner.sheet,
		paddingBlockStart: space.sm,
		paddingBlockEnd: space.xs,
		paddingInlineStart: space.md,
		paddingInlineEnd: space.xs,
		display: "grid",
		gap: space.xs,
		outline: { default: "none", ":focus-within": `2px solid ${color.focusRing}` },
		outlineOffset: 0,
	},
	textarea: {
		width: "100%",
		boxSizing: "border-box",
		fontFamily: font.body,
		// iOS Safari 在 16px 以下的欄位 focus 時會放大整頁
		fontSize: { default: type.t3, [breakpoint.phone]: type.phoneInput },
		lineHeight: type.body,
		color: color.text,
		backgroundColor: "transparent",
		paddingBlock: 0,
		paddingInlineStart: 0,
		paddingInlineEnd: space.xs,
		resize: "none",
		fieldSizing: "content",
		maxHeight: "11rem",
		overflowY: "auto",
		whiteSpace: "pre-wrap",
		overflowWrap: "anywhere",
		"::placeholder": { color: color.textFaint },
	},
	// 左邊的圖示鈕往外推半顆,圖示跟上面的字對齊
	bar: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		marginInlineStart: `calc(${space.xs} * -1)`,
	},
	iconButton: {
		display: "grid",
		placeItems: "center",
		width: 32,
		height: 32,
		borderRadius: corner.pill,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		cursor: "pointer",
		transitionProperty: "background-color, color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	iconButtonOn: { backgroundColor: color.accentSubtle, color: color.accent },
	spacer: { flex: 1 },
	model: {
		height: 32,
		fontFamily: font.body,
		fontSize: type.t2,
		fontWeight: 500,
		lineHeight: 1,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		borderWidth: 0,
		borderRadius: corner.pill,
		paddingInline: space.sm,
		cursor: "pointer",
		transitionProperty: "background-color, color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	// 圓的墨色送出鈕;空值時退成凹下的灰
	send: {
		display: "grid",
		placeItems: "center",
		width: 40,
		height: 40,
		flex: "none",
		borderRadius: corner.pill,
		backgroundColor: { default: color.accent, ":disabled": color.accentSubtle },
		color: { default: color.accentText, ":disabled": color.textFaint },
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 2,
	},
	popup: {
		position: "absolute",
		zIndex: 10,
		bottom: `calc(100% + ${space.xxs})`,
		insetInlineStart: space.xs,
		width: `min(20rem, calc(100% - ${space.md}))`,
		transformOrigin: "bottom",
	},
	groupLabel: {
		fontFamily: font.mono,
		fontSize: type.t1,
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textMuted,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
	},
	list: { listStyle: "none", margin: 0, padding: space.xxs },
	option: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		borderRadius: corner.control,
		paddingBlock: "0.42rem",
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: type.t2,
		color: color.text,
		cursor: "pointer",
	},
	optionActive: {
		backgroundColor: color.accentSubtle,
		outline: `2px solid ${color.focusRing}`,
		outlineOffset: -2,
		"@media (forced-colors: active)": { outline: "2px solid Highlight" },
	},
	kind: { color: color.textMuted, fontSize: type.t1, marginInlineStart: "auto" },
	hint: {
		fontFamily: font.body,
		fontSize: type.t1,
		color: color.textMuted,
		margin: 0,
	},
})

export type SourceRef = { id: string; label: string; kind: string }
export type SlashCommand = { id: string; label: string; kind?: string }

const AT_PATTERN = /(^|\s)@(\S*)$/
const SLASH_PATTERN = /^\/(\S*)$/

function AtIcon() {
	return (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4" />
			<path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
		</svg>
	)
}

function SlashIcon() {
	return (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="m16 4-8 16" />
		</svg>
	)
}

function MicIcon() {
	return (
		<svg
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<rect x="9" y="2" width="6" height="12" rx="3" />
			<path d="M5 10a7 7 0 0 0 14 0" />
			<path d="M12 17v4" />
		</svg>
	)
}

function SendIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="M12 19V5" />
			<path d="m5 12 7-7 7 7" />
		</svg>
	)
}

export type ComposerProps = {
	placeholder?: string
	hint?: ReactNode
	models?: string[]
	model?: string
	onModelChange?: (model: string) => void
	sources?: (query: string) => Promise<SourceRef[]>
	commands?: SlashCommand[]
	micActive?: boolean
	onMicToggle?: () => void
	onSubmit: (text: string, refs: SourceRef[]) => void
	label?: string
	sourcesLabel?: string
	commandsLabel?: string
}

export function Composer({
	placeholder = "跟 agent 說話",
	hint,
	models,
	model,
	onModelChange,
	sources,
	commands,
	micActive = false,
	onMicToggle,
	onSubmit,
	label = "訊息",
	sourcesLabel = "@ 來源",
	commandsLabel = "/ 指令",
}: ComposerProps) {
	const listId = useId()
	const suggestible = sources != null || commands != null
	const textarea = useRef<HTMLTextAreaElement>(null)
	const [value, setValue] = useState("")
	const [caret, setCaret] = useState(0)
	const [items, setItems] = useState<SourceRef[]>([])
	const [rawActive, setActive] = useState(0)
	const [picked, setPicked] = useState<SourceRef[]>([])
	const [dismissed, setDismissed] = useState(false)
	// The @ query the last source lookup was for, and a counter that retires stale answers.
	const lookup = useRef<{ query: string | null; id: number }>({ query: null, id: 0 })

	// Same growth as Textarea autoGrow: field-sizing, else Pretext, else scrollHeight.
	// Clearing the value on submit fires no input event, so a new value re-attaches.
	const attach = useCallback(
		(area: HTMLTextAreaElement | null) => {
			textarea.current = area
			const cleanup = area ? autoGrow(area, undefined) : undefined
			return () => {
				cleanup?.()
				textarea.current = null
			}
		},
		// oxlint-disable-next-line react-hooks/exhaustive-deps, react/memo-dependencies -- value / placeholder re-measure
		[value, placeholder],
	)

	/** Moves text and caret together, and asks `sources` when the @ query changed. */
	function track(next: string, position: number) {
		setValue(next)
		setCaret(position)
		const query = AT_PATTERN.exec(next.slice(0, position))?.[2] ?? null
		if (query === lookup.current.query) return
		lookup.current.query = query
		const id = ++lookup.current.id
		if (query == null || sources == null) return
		sources(query)
			.then((result) => {
				if (lookup.current.id !== id) return
				setItems(result)
				setActive(0)
			})
			.catch(() => {
				if (lookup.current.id === id) setItems([])
			})
	}

	const before = value.slice(0, caret)
	const atMatch = AT_PATTERN.exec(before)
	const slashMatch = SLASH_PATTERN.exec(before)
	const mode = atMatch ? "sources" : slashMatch ? "commands" : null
	const query = atMatch?.[2] ?? slashMatch?.[1] ?? ""

	const options: SourceRef[] =
		mode === "commands"
			? (commands ?? [])
					.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()))
					.map((command) => ({ id: command.id, label: command.label, kind: command.kind ?? "指令" }))
			: mode === "sources"
				? items
				: []

	const open = mode != null && options.length > 0 && !dismissed
	const active = options.length === 0 ? 0 : Math.min(rawActive, options.length - 1)
	const canSend = value.trim().length > 0

	// The caret lives in state so the @/-slash mode can be derived from it, but the DOM
	// caret has to be moved explicitly or the browser parks it at the end: commit first.
	function moveCaret(next: string, position: number) {
		flushSync(() => track(next, position))
		textarea.current?.setSelectionRange(position, position)
	}

	function complete(option: SourceRef) {
		const tail = value.slice(caret)
		// Function replacers: a label containing $&, $1 … must go in literally.
		const head =
			mode === "commands"
				? before.replace(SLASH_PATTERN, () => `/${option.label} `)
				: before.replace(AT_PATTERN, (_, lead: string) => `${lead}@${option.label} `)
		moveCaret(head + tail, head.length)
		if (mode === "sources") setPicked((refs) => [...refs, option])
		textarea.current?.focus()
	}

	function submit() {
		if (!canSend) return
		// A ref the user deleted again is not a ref any more.
		onSubmit(
			value,
			picked.filter((ref) => value.includes(`@${ref.label}`)),
		)
		track("", 0)
		setPicked([])
		setDismissed(false)
	}

	function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		// Enter while an IME candidate is open commits the candidate, not the message.
		if (event.nativeEvent.isComposing) return
		if (open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
			event.preventDefault()
			setActive((index) => (index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length)
			return
		}
		if (open && event.key === "Enter" && !event.shiftKey) {
			event.preventDefault()
			complete(options[active])
			return
		}
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault()
			submit()
			return
		}
		if (event.key === "Escape" && open) {
			event.preventDefault()
			setDismissed(true)
		}
	}

	function insertMarker(marker: string) {
		const position = textarea.current?.selectionStart ?? value.length
		const lead = position > 0 && !/\s$/.test(value.slice(0, position)) ? " " : ""
		const next = `${value.slice(0, position)}${lead}${marker}${value.slice(position)}`
		setDismissed(false)
		moveCaret(next, position + lead.length + marker.length)
		textarea.current?.focus()
	}

	return (
		<div {...stylex.props(styles.composer)}>
			{open && (
				<div {...stylex.props(popupStyles.surface, styles.popup)}>
					<div {...stylex.props(styles.groupLabel)}>{mode === "commands" ? commandsLabel : sourcesLabel}</div>
					<ul
						id={listId}
						role="listbox"
						aria-label={mode === "commands" ? commandsLabel : sourcesLabel}
						{...stylex.props(styles.list)}
					>
						{options.map((option, index) => (
							<li
								key={option.id}
								id={`${listId}-${index}`}
								role="option"
								aria-selected={index === active}
								onMouseDown={(event) => {
									event.preventDefault()
									complete(option)
								}}
								{...stylex.props(styles.option, index === active && styles.optionActive)}
							>
								{option.label}
								<small {...stylex.props(styles.kind)}>{option.kind}</small>
							</li>
						))}
					</ul>
				</div>
			)}
			<textarea
				ref={attach}
				rows={1}
				aria-label={label}
				role={suggestible ? "combobox" : undefined}
				aria-expanded={suggestible ? open : undefined}
				aria-autocomplete={suggestible ? "list" : undefined}
				aria-haspopup={suggestible ? "listbox" : undefined}
				aria-controls={open ? listId : undefined}
				aria-activedescendant={open ? `${listId}-${active}` : undefined}
				placeholder={placeholder}
				value={value}
				onChange={(event) => {
					const area = event.currentTarget
					track(area.value, area.selectionStart ?? area.value.length)
					setDismissed(false)
				}}
				onKeyUp={(event) => track(event.currentTarget.value, event.currentTarget.selectionStart ?? 0)}
				onClick={(event) => track(event.currentTarget.value, event.currentTarget.selectionStart ?? 0)}
				onKeyDown={onKeyDown}
				{...stylex.props(reset.control, styles.textarea)}
			/>
			<div {...stylex.props(styles.bar)}>
				<button
					type="button"
					aria-label={`加入來源(@)`}
					aria-expanded={mode === "sources" && open}
					onClick={() => insertMarker("@")}
					{...stylex.props(reset.control, styles.iconButton)}
				>
					<AtIcon />
				</button>
				<button
					type="button"
					aria-label="指令(/)"
					aria-expanded={mode === "commands" && open}
					onClick={() => insertMarker("/")}
					{...stylex.props(reset.control, styles.iconButton)}
				>
					<SlashIcon />
				</button>
				<span {...stylex.props(styles.spacer)} />
				{models != null && models.length > 0 && (
					<select
						aria-label="模型"
						value={model}
						onChange={(event) => onModelChange?.(event.currentTarget.value)}
						{...stylex.props(styles.model)}
					>
						{models.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				)}
				{onMicToggle != null && (
					<button
						type="button"
						aria-label="語音輸入"
						aria-pressed={micActive}
						onClick={onMicToggle}
						{...stylex.props(reset.control, styles.iconButton, micActive && styles.iconButtonOn)}
					>
						<MicIcon />
					</button>
				)}
				<button
					type="button"
					aria-label="送出"
					disabled={!canSend}
					onClick={submit}
					{...stylex.props(reset.control, styles.send, press.button)}
				>
					<SendIcon />
				</button>
			</div>
			{hint != null && <p {...stylex.props(styles.hint)}>{hint}</p>}
		</div>
	)
}
