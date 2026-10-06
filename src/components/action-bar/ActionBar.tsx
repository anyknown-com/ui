import { useDirection } from "@base-ui/react/direction-provider"
import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type KeyboardEvent, type ReactNode, createContext, use } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { press, reset, styled } from "../../lib/styled"
import { useCopy } from "../../lib/useCopy"
import { color, corner, focusRing, motion, space, type } from "../../tokens.stylex"
import { useMessageBody } from "../message/Message"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const styles = stylex.create({
	bar: {
		position: "absolute",
		insetInlineStart: 0,
		bottom: 0,
		height: space.xl,
		display: "flex",
		alignItems: "center",
		gap: "0.15rem",
		opacity: { default: "var(--ak-action-bar-opacity, 0)", ":focus-within": 1 },
		transitionProperty: "opacity",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
	},
	button: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		fontSize: type.t1,
		lineHeight: type.snug,
		color: { default: color.textMuted, ":hover": color.text },
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		// 24px both ways, also for an icon-only ActionBar.Button: the WCAG 2.5.8 minimum
		minHeight: "1.5rem",
		minWidth: "1.5rem",
		justifyContent: "center",
		borderRadius: corner.pill,
		cursor: "pointer",
		outline: { default: "none", ":focus-visible": `${focusRing.width} solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	done: { color: color.accent },
	icon: { flex: "none" },
})

const hoverStyles = stylex.create({
	reveal: { opacity: 1 },
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
			{...stylex.props(styles.icon)}
		>
			<rect x="9" y="9" width="11" height="11" rx="2" />
			<path d="M5 15V5a2 2 0 0 1 2-2h10" />
		</svg>
	)
}

function RegenerateIcon() {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
			{...stylex.props(styles.icon)}
		>
			<path d="M3 12a9 9 0 1 1 2.6 6.3" />
			<path d="M3 22v-6h6" />
		</svg>
	)
}

const strings = defineStrings({
	"zh-TW": { toolbar: "訊息動作", copy: "複製", copied: "已複製 ✓", regenerate: "重新生成" },
	en: { toolbar: "Message actions", copy: "Copy", copied: "Copied ✓", regenerate: "Regenerate" },
})

/** The ActionBar's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type ActionBarLabels = StringsOf<typeof strings>

// The bar's `labels` reach the built-in actions rendered inside it.
const LabelsContext = createContext<Partial<ActionBarLabels> | undefined>(undefined)

export type ActionBarProps = {
	/** The toolbar's accessible name. Wins over `labels.toolbar`. */
	label?: string
	/** Show the bar at rest; otherwise it shows on hover of the message and on focus inside it. */
	visible?: boolean
	/** The actions: `ActionBar.Copy`, `ActionBar.Regenerate`, `ActionBar.Button`. */
	children: ReactNode
	/** Overrides for the built-in words of the bar and of `ActionBar.Copy` / `ActionBar.Regenerate` inside it. */
	labels?: Partial<ActionBarLabels>
}

// WAI-ARIA APG toolbar: the bar is one tab stop and the arrow keys move between its buttons, so
// a long thread costs one Tab per message instead of one per action.
const ITEMS = "button:not(:disabled)"

function items(bar: HTMLElement) {
	return Array.from(bar.querySelectorAll<HTMLElement>(ITEMS))
}

// Roving tabindex: `current` (or the item that already holds the stop, or the first) gets 0.
function rove(bar: HTMLElement, current?: HTMLElement) {
	const list = items(bar)
	const keep =
		(current && list.includes(current) ? current : undefined) ??
		list.find((item) => item.getAttribute("tabindex") === "0") ??
		list[0]
	for (const item of list) item.tabIndex = item === keep ? 0 : -1
}

// Ref callback: set the stop on mount and again when buttons come, go or turn disabled.
function roveOnChange(bar: HTMLDivElement | null) {
	if (bar == null) return
	rove(bar)
	const observer = new MutationObserver(() => rove(bar))
	observer.observe(bar, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] })
	return () => observer.disconnect()
}

function onKeyDown(event: KeyboardEvent<HTMLDivElement>, providerRtl: boolean) {
	const bar = event.currentTarget
	const list = items(bar)
	const at = list.indexOf(event.target as HTMLElement)
	if (at < 0) return
	// Left and right follow the reading direction: in RTL, ArrowLeft is "next". A `"rtl"`
	// DirectionProvider wins, else the computed CSS direction (`dir`), as in Slider.
	const rtl = providerRtl || getComputedStyle(bar).direction === "rtl"
	const step = rtl ? -1 : 1
	let next: number
	if (event.key === "ArrowRight") next = at + step
	else if (event.key === "ArrowLeft") next = at - step
	else if (event.key === "Home") next = 0
	else if (event.key === "End") next = list.length - 1
	else return
	event.preventDefault()
	list[(next + list.length) % list.length]?.focus()
}

/**
 * The row of actions under a message. A `role="toolbar"` with one tab stop: Tab lands on the
 * last-used button, ←/→ move between buttons (mirrored under `<DirectionProvider direction="rtl">`
 * or a computed CSS `direction: rtl`, wrapping at the ends), Home/End jump to the first/last.
 */
export function ActionBar({ label, visible = false, children, labels }: ActionBarProps) {
	const t = useStrings(strings, labels)
	const providerRtl = useDirection() === "rtl"
	return (
		<LabelsContext value={labels}>
			{/* oxlint-disable-next-line jsx-a11y/interactive-supports-focus -- focus goes to the buttons (roving tabindex), not the bar */}
			<div
				ref={roveOnChange}
				role="toolbar"
				aria-label={label ?? t.toolbar}
				onKeyDown={(event) => onKeyDown(event, providerRtl)}
				onFocus={(event) => rove(event.currentTarget, event.target)}
				{...stylex.props(styles.bar, visible && hoverStyles.reveal)}
			>
				{children}
			</div>
		</LabelsContext>
	)
}

export type ActionBarButtonProps = ComponentProps<"button"> & { icon?: ReactNode }

function ActionBarButton({ icon, children, ...props }: ActionBarButtonProps) {
	return (
		<button type="button" {...props} {...styled(props, reset.control, styles.button, press.button)}>
			{icon}
			{children}
		</button>
	)
}

export type CopyActionProps = {
	text?: string
	/** The button's text. Wins over `labels.copy` on the bar. */
	label?: string
	/** The button's text after a copy. Wins over `labels.copied` on the bar. */
	copiedLabel?: string
}

function CopyAction({ text: value, label, copiedLabel }: CopyActionProps) {
	const t = useStrings(strings, use(LabelsContext))
	const body = useMessageBody()
	const { copied, copy } = useCopy()

	// The turn also holds a hidden author label, the reasoning fold and this bar
	// itself, so copy only the text parts.
	function messageText() {
		const parts = body?.current?.querySelectorAll("[data-ak-message-text]") ?? []
		return Array.from(parts, (part) => part.textContent ?? "").join("\n\n")
	}

	return (
		<button
			type="button"
			onClick={() => copy(value ?? messageText())}
			{...stylex.props(reset.control, styles.button, copied && styles.done, press.button)}
		>
			{!copied && <CopyIcon />}
			{copied ? (copiedLabel ?? t.copied) : (label ?? t.copy)}
		</button>
	)
}

export type RegenerateActionProps = {
	onRegenerate: () => void
	/** The button's text. Wins over `labels.regenerate` on the bar. */
	label?: string
}

function RegenerateAction({ onRegenerate, label }: RegenerateActionProps) {
	const t = useStrings(strings, use(LabelsContext))
	return (
		<ActionBarButton icon={<RegenerateIcon />} onClick={onRegenerate}>
			{label ?? t.regenerate}
		</ActionBarButton>
	)
}

ActionBar.Copy = CopyAction
ActionBar.Regenerate = RegenerateAction
ActionBar.Button = ActionBarButton
