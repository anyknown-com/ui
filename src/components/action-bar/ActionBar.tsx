import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, type ReactNode, createContext, use } from "react"
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
	visible?: boolean
	children: ReactNode
	/** Overrides for the built-in words of the bar and of `ActionBar.Copy` / `ActionBar.Regenerate` inside it. */
	labels?: Partial<ActionBarLabels>
}

export function ActionBar({ label, visible = false, children, labels }: ActionBarProps) {
	const t = useStrings(strings, labels)
	return (
		<LabelsContext value={labels}>
			<div
				role="toolbar"
				aria-label={label ?? t.toolbar}
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
