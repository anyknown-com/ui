import { Toast as BaseToast } from "@base-ui/react/toast"
import * as stylex from "@stylexjs/stylex"
import { createContext, useContext, useState } from "react"
import { reset } from "../../lib/styled"
import { usePrefersReducedMotion } from "../../lib/motion"
import { UNWEAVE_PATH } from "../../lib/paths"
import { layerStyles } from "../../lib/popup"
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
		display: "flex",
		gap: space.xs,
		width: "min(20rem, calc(100vw - 2.5rem))",
	},
	fromBottom: { flexDirection: "column-reverse" },
	fromTop: { flexDirection: "column" },
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
		opacity: { default: 1, ":is([data-limited])": 0 },
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
	running: (ms: number, paused: boolean) => ({
		animationDuration: `${ms}ms`,
		animationPlayState: paused ? "paused" : "running",
	}),
	dot: { flex: "none", width: "0.5rem", height: "0.5rem", borderRadius: radius.full },
	dotDefault: { backgroundColor: color.textFaint },
	dotSuccess: { backgroundColor: color.accent },
	dotDanger: { backgroundColor: color.danger },
	content: { flex: 1, display: "grid", gap: 0 },
	title: { margin: 0, fontSize: text.sm, color: color.text },
	description: { margin: 0, fontSize: "0.78rem", color: color.textMuted },
	action: {
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
})

const TONE = {
	success: { dot: styles.dotSuccess, line: styles.lineSuccess, word: "成功:" },
	danger: { dot: styles.dotDanger, line: styles.lineDanger, word: "錯誤:" },
	default: { dot: styles.dotDefault, line: styles.lineDefault, word: "" },
} as const

type Tone = keyof typeof TONE

export type ToastOptions = {
	description?: string
	action?: { label: string; onClick: () => void }
	timeout?: number
}

type Manager = ReturnType<typeof BaseToast.createToastManager>

function makeApi(getManager: () => Manager) {
	function add(tone: Tone, title: string, options: ToastOptions = {}) {
		const manager = getManager()
		const action = options.action
		let id = ""
		id = manager.add({
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
							manager.close(id)
						},
					}
				: undefined,
		})
		return id
	}

	return Object.assign((title: string, options?: ToastOptions) => add("default", title, options), {
		success: (title: string, options?: ToastOptions) => add("success", title, options),
		danger: (title: string, options?: ToastOptions) => add("danger", title, options),
		close: (id: string) => getManager().close(id),
	})
}

/**
 * Fallback manager for apps with a single <Toaster/>: importing `toast` works
 * without threading context. A Toaster mounted with its own manager registers
 * itself here so the module-level `toast` keeps reaching the live viewport.
 */
export const toastManager = BaseToast.createToastManager()

const ToastApiContext = createContext<ReturnType<typeof makeApi> | null>(null)

export const toast = makeApi(() => toastManager)

export function useToast() {
	const scoped = useContext(ToastApiContext)
	return { toast: scoped ?? toast }
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
	/** Pass a manager from `createToastManager()` to scope this viewport. */
	manager?: Manager
}

export function Toaster({
	position = "bottom-right",
	timeout = DEFAULT_TIMEOUT,
	limit = 3,
	manager,
}: ToasterProps) {
	const [own] = useState(() => manager ?? toastManager)
	const [api] = useState(() => makeApi(() => own))
	const [paused, setPaused] = useState(false)
	const fromBottom = position.startsWith("bottom")

	return (
		<ToastApiContext value={api}>
			<BaseToast.Provider toastManager={own} timeout={timeout} limit={limit}>
				<BaseToast.Portal>
					<BaseToast.Viewport
						onMouseEnter={() => setPaused(true)}
						onMouseLeave={() => setPaused(false)}
						onFocus={() => setPaused(true)}
						onBlur={() => setPaused(false)}
						{...stylex.props(
							layerStyles.toast,
							styles.viewport,
							fromBottom ? styles.fromBottom : styles.fromTop,
							POSITIONS[position],
						)}
					>
						<ToastList fallbackTimeout={timeout} paused={paused} />
					</BaseToast.Viewport>
				</BaseToast.Portal>
			</BaseToast.Provider>
		</ToastApiContext>
	)
}

function ToastList({ fallbackTimeout, paused }: { fallbackTimeout: number; paused: boolean }) {
	const { toasts } = BaseToast.useToastManager()
	return toasts.map((item) => (
		<ToastItem key={item.id} toast={item} fallbackTimeout={fallbackTimeout} paused={paused} />
	))
}

type ToastItemProps = {
	toast: BaseToast.Root.ToastObject
	fallbackTimeout: number
	paused: boolean
}

function ToastItem({ toast: item, fallbackTimeout, paused }: ToastItemProps) {
	const reduced = usePrefersReducedMotion()
	const tone = TONE[(item.type as Tone) in TONE ? (item.type as Tone) : "default"]
	const duration = item.timeout ?? fallbackTimeout

	return (
		<BaseToast.Root toast={item} {...stylex.props(styles.toast)}>
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
						{...stylex.props(styles.countLine, tone.line, styles.running(duration, paused))}
					/>
				</svg>
			)}
			<span aria-hidden="true" {...stylex.props(styles.dot, tone.dot)} />
			<BaseToast.Content {...stylex.props(styles.content)}>
				{tone.word !== "" && <span {...stylex.props(styles.srOnly)}>{tone.word}</span>}
				<BaseToast.Title {...stylex.props(styles.title)} />
				{item.description != null && <BaseToast.Description {...stylex.props(styles.description)} />}
			</BaseToast.Content>
			{item.actionProps != null && <BaseToast.Action {...stylex.props(reset.control, styles.action)} />}
		</BaseToast.Root>
	)
}
