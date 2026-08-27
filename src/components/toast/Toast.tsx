import { Toast as BaseToast } from "@base-ui/react/toast"
import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { usePrefersReducedMotion } from "../../lib/motion"
import { UNWEAVE_PATH } from "../../lib/paths"
import { color, font, motion, radius, shadow, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
const DEFAULT_TIMEOUT = 5000

const slideIn = stylex.keyframes({
	from: { opacity: 0, translate: "1rem 0" },
	to: { opacity: 1, translate: "0 0" },
})

const unweave = stylex.keyframes({
	from: { strokeDashoffset: 0 },
	to: { strokeDashoffset: -100 },
})

const styles = stylex.create({
	viewport: {
		position: "fixed",
		zIndex: 80,
		display: "flex",
		flexDirection: "column",
		gap: space.xs,
		width: "min(20rem, calc(100vw - 2.5rem))",
	},
	bottomRight: { bottom: space.md, insetInlineEnd: space.md },
	bottomLeft: { bottom: space.md, insetInlineStart: space.md },
	topRight: { top: space.md, insetInlineEnd: space.md },
	topLeft: { top: space.md, insetInlineStart: space.md },
	toast: {
		position: "relative",
		overflow: "hidden",
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		boxShadow: shadow.popover,
		paddingBlock: space.xs,
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: text.sm,
		color: color.text,
		animationName: { default: slideIn, [REDUCED]: "none" },
		animationDuration: "180ms",
		animationTimingFunction: "ease-out",
	},
	countdown: { position: "absolute", top: 0, insetInlineStart: 0, width: "100%", height: 5 },
	countLine: {
		fill: "none",
		strokeWidth: 1.5,
		strokeLinecap: "round",
		strokeDasharray: 100,
		animationName: unweave,
		animationTimingFunction: "linear",
		animationFillMode: "forwards",
	},
	lineDefault: { stroke: color.textFaint },
	lineSuccess: { stroke: color.accent },
	lineDanger: { stroke: color.danger },
	duration: (ms: number) => ({ animationDuration: `${ms}ms` }),
	dot: { flex: "none", width: "0.5rem", height: "0.5rem", borderRadius: radius.full },
	dotDefault: { backgroundColor: color.textFaint },
	dotSuccess: { backgroundColor: color.accent },
	dotDanger: { backgroundColor: color.danger },
	content: { flex: 1, display: "grid", gap: 0 },
	title: { margin: 0, fontSize: text.sm, color: color.text },
	description: { margin: 0, fontSize: "0.78rem", color: color.textMuted },
	action: {
		all: "unset",
		fontFamily: font.body,
		fontSize: "0.8rem",
		fontWeight: 500,
		lineHeight: 1,
		color: color.accent,
		cursor: "pointer",
		paddingBlock: space.xxs,
		paddingInline: space.xxs,
		borderRadius: radius.sm,
		backgroundColor: { default: "transparent", ":hover": color.accentSubtle },
		transitionProperty: "background-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
	},
})

const TONE = {
	success: { dot: styles.dotSuccess, line: styles.lineSuccess },
	danger: { dot: styles.dotDanger, line: styles.lineDanger },
	default: { dot: styles.dotDefault, line: styles.lineDefault },
} as const

type Tone = keyof typeof TONE

export const toastManager = BaseToast.createToastManager()

export type ToastOptions = {
	description?: string
	action?: { label: string; onClick: () => void }
	timeout?: number
}

function add(tone: Tone, title: string, options: ToastOptions = {}) {
	const action = options.action
	let id = ""
	id = toastManager.add({
		title,
		type: tone,
		description: options.description,
		timeout: options.timeout,
		priority: tone === "danger" ? "high" : "low",
		actionProps: action
			? {
					children: action.label,
					onClick: () => {
						action.onClick()
						toastManager.close(id)
					},
				}
			: undefined,
	})
	return id
}

export const toast = Object.assign((title: string, options?: ToastOptions) => add("default", title, options), {
	success: (title: string, options?: ToastOptions) => add("success", title, options),
	danger: (title: string, options?: ToastOptions) => add("danger", title, options),
	close: (id: string) => toastManager.close(id),
})

export function useToast() {
	return { toast }
}

const POSITIONS = {
	"bottom-right": styles.bottomRight,
	"bottom-left": styles.bottomLeft,
	"top-right": styles.topRight,
	"top-left": styles.topLeft,
} as const

export type ToasterProps = {
	position?: keyof typeof POSITIONS
	timeout?: number
	limit?: number
}

export function Toaster({ position = "bottom-right", timeout = DEFAULT_TIMEOUT, limit = 3 }: ToasterProps) {
	return (
		<BaseToast.Provider toastManager={toastManager} timeout={timeout} limit={limit}>
			<BaseToast.Portal>
				<BaseToast.Viewport {...stylex.props(styles.viewport, POSITIONS[position])}>
					<ToastList fallbackTimeout={timeout} />
				</BaseToast.Viewport>
			</BaseToast.Portal>
		</BaseToast.Provider>
	)
}

function ToastList({ fallbackTimeout }: { fallbackTimeout: number }) {
	const { toasts } = BaseToast.useToastManager()
	return toasts.map((item) => <ToastItem key={item.id} toast={item} fallbackTimeout={fallbackTimeout} />)
}

type ToastItemProps = {
	toast: BaseToast.Root.ToastObject
	fallbackTimeout: number
}

function ToastItem({ toast: item, fallbackTimeout }: ToastItemProps) {
	const reduced = usePrefersReducedMotion()
	const [paused, setPaused] = useState(false)
	const tone = TONE[(item.type as Tone) in TONE ? (item.type as Tone) : "default"]
	const duration = item.timeout ?? fallbackTimeout

	return (
		<BaseToast.Root
			toast={item}
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocus={() => setPaused(true)}
			onBlur={() => setPaused(false)}
			{...stylex.props(styles.toast)}
		>
			{!reduced && duration > 0 && (
				<svg
					viewBox="0 0 320 6"
					preserveAspectRatio="none"
					aria-hidden="true"
					{...stylex.props(styles.countdown)}
				>
					<path
						d={UNWEAVE_PATH}
						pathLength="100"
						style={{ animationPlayState: paused ? "paused" : "running" }}
						{...stylex.props(styles.countLine, tone.line, styles.duration(duration))}
					/>
				</svg>
			)}
			<span aria-hidden="true" {...stylex.props(styles.dot, tone.dot)} />
			<BaseToast.Content {...stylex.props(styles.content)}>
				<BaseToast.Title {...stylex.props(styles.title)} />
				{item.description != null && <BaseToast.Description {...stylex.props(styles.description)} />}
			</BaseToast.Content>
			{item.actionProps != null && <BaseToast.Action {...stylex.props(styles.action)} />}
		</BaseToast.Root>
	)
}
