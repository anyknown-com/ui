import * as stylex from "@stylexjs/stylex"
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react"
import { popupStyles } from "../../lib/popup"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	composer: {
		position: "relative",
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: color.border, ":focus-within": color.accent },
		borderRadius: radius.lg,
		paddingBlock: space.xs,
		paddingInline: space.xs,
		display: "grid",
		gap: space.xxs,
		transitionProperty: "border-color",
		transitionDuration: { default: "140ms", [REDUCED]: "0s" },
		outline: { default: "none", ":focus-within": `1px solid ${color.accent}` },
		outlineOffset: -1,
	},
	textarea: {
		all: "unset",
		width: "100%",
		boxSizing: "border-box",
		fontFamily: font.body,
		fontSize: text.sm,
		lineHeight: text.leadingNormal,
		color: color.text,
		paddingBlock: space.xxs,
		paddingInline: space.xxs,
		resize: "none",
		fieldSizing: "content",
		maxHeight: "11rem",
		overflowY: "auto",
		whiteSpace: "pre-wrap",
		overflowWrap: "anywhere",
		"::placeholder": { color: color.textFaint },
	},
	bar: { display: "flex", alignItems: "center", gap: space.xxs },
	iconButton: {
		all: "unset",
		display: "grid",
		placeItems: "center",
		width: "1.9rem",
		height: "1.9rem",
		borderRadius: radius.sm,
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
		fontFamily: font.body,
		fontSize: "0.78rem",
		fontWeight: 500,
		lineHeight: 1,
		color: color.textMuted,
		backgroundColor: "transparent",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: "transparent", ":hover": color.border },
		borderRadius: radius.sm,
		paddingBlock: space.xxs,
		paddingInline: space.xxs,
		cursor: "pointer",
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	send: {
		all: "unset",
		display: "grid",
		placeItems: "center",
		width: "1.9rem",
		height: "1.9rem",
		borderRadius: radius.sm,
		backgroundColor: { default: color.accent, ":disabled": color.border },
		color: { default: color.accentText, ":disabled": color.textFaint },
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 1,
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
		fontSize: "0.65rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textFaint,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
	},
	list: { listStyle: "none", margin: 0, padding: space.xxs },
	option: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		borderRadius: radius.sm,
		paddingBlock: "0.42rem",
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: text.sm,
		color: color.text,
		cursor: "pointer",
	},
	optionActive: {
		backgroundColor: color.accentSubtle,
		outline: `2px solid ${color.focusRing}`,
		outlineOffset: -2,
		"@media (forced-colors: active)": { outline: "2px solid Highlight" },
	},
	kind: { color: color.textFaint, fontSize: "0.72rem", marginInlineStart: "auto" },
	hint: {
		fontFamily: font.body,
		fontSize: "0.72rem",
		color: color.textFaint,
		margin: 0,
		marginInline: space.xxs,
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
			width="14"
			height="14"
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
	const textarea = useRef<HTMLTextAreaElement>(null)
	const [value, setValue] = useState("")
	const [caret, setCaret] = useState(0)
	const [items, setItems] = useState<SourceRef[]>([])
	const [active, setActive] = useState(0)
	const [picked, setPicked] = useState<SourceRef[]>([])

	const before = value.slice(0, caret)
	const atMatch = AT_PATTERN.exec(before)
	const slashMatch = SLASH_PATTERN.exec(before)
	const mode = atMatch ? "sources" : slashMatch ? "commands" : null
	const query = atMatch?.[2] ?? slashMatch?.[1] ?? ""

	useEffect(() => {
		if (mode !== "sources" || !sources) return
		let cancelled = false
		sources(query).then((result) => {
			if (!cancelled) {
				setItems(result)
				setActive(0)
			}
		})
		return () => {
			cancelled = true
		}
	}, [mode, query, sources])

	const options: SourceRef[] =
		mode === "commands"
			? (commands ?? [])
					.filter((command) => command.label.toLowerCase().includes(query.toLowerCase()))
					.map((command) => ({ id: command.id, label: command.label, kind: command.kind ?? "指令" }))
			: mode === "sources"
				? items
				: []

	const open = mode != null && options.length > 0
	const canSend = value.trim().length > 0

	function complete(option: SourceRef) {
		const marker = mode === "commands" ? "/" : "@"
		const pattern = mode === "commands" ? SLASH_PATTERN : AT_PATTERN
		const next = `${before.replace(pattern, (_, lead = "") => `${lead}${marker}${option.label} `)}${value.slice(caret)}`
		setValue(next)
		setCaret(next.length - value.slice(caret).length)
		if (mode === "sources") setPicked((refs) => [...refs, option])
		textarea.current?.focus()
	}

	function submit() {
		if (!canSend) return
		onSubmit(value, picked)
		setValue("")
		setPicked([])
		setCaret(0)
	}

	function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
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
		if (event.key === "Escape" && mode != null) {
			event.preventDefault()
			setCaret(value.length)
			setValue((current) => current)
			setItems([])
		}
	}

	function insertMarker(marker: string) {
		const position = textarea.current?.selectionStart ?? value.length
		const lead = position > 0 && !/\s$/.test(value.slice(0, position)) ? " " : ""
		const next = `${value.slice(0, position)}${lead}${marker}${value.slice(position)}`
		setValue(next)
		setCaret(position + lead.length + marker.length)
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
				ref={textarea}
				rows={1}
				aria-label={label}
				aria-controls={open ? listId : undefined}
				aria-activedescendant={open ? `${listId}-${active}` : undefined}
				placeholder={placeholder}
				value={value}
				onChange={(event) => {
					setValue(event.currentTarget.value)
					setCaret(event.currentTarget.selectionStart ?? event.currentTarget.value.length)
				}}
				onKeyUp={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
				onClick={(event) => setCaret(event.currentTarget.selectionStart ?? 0)}
				onKeyDown={onKeyDown}
				{...stylex.props(styles.textarea)}
			/>
			<div {...stylex.props(styles.bar)}>
				<button
					type="button"
					aria-label={`加入來源(@)`}
					aria-expanded={mode === "sources" && open}
					onClick={() => insertMarker("@")}
					{...stylex.props(styles.iconButton)}
				>
					<AtIcon />
				</button>
				<button
					type="button"
					aria-label="指令(/)"
					aria-expanded={mode === "commands" && open}
					onClick={() => insertMarker("/")}
					{...stylex.props(styles.iconButton)}
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
						{...stylex.props(styles.iconButton, micActive && styles.iconButtonOn)}
					>
						<MicIcon />
					</button>
				)}
				<button
					type="button"
					aria-label="送出"
					disabled={!canSend}
					onClick={submit}
					{...stylex.props(styles.send)}
				>
					<SendIcon />
				</button>
			</div>
			{hint != null && <p {...stylex.props(styles.hint)}>{hint}</p>}
		</div>
	)
}
