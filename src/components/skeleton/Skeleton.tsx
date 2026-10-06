import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { type StyleArg, styled } from "../../lib/styled"
import { color, corner, motion, radius, space } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
// Forced colors drop the bone colour and the sheen: each bone keeps a GrayText border instead.
const FORCED = "@media (forced-colors: active)"

const shimmer = stylex.keyframes({
	from: { backgroundPosition: "180% 0" },
	to: { backgroundPosition: "-80% 0" },
})

const styles = stylex.create({
	bone: {
		backgroundColor: color.bone,
		borderRadius: corner.small,
		borderStyle: { default: null, [FORCED]: "solid" },
		borderWidth: { default: null, [FORCED]: 1 },
		borderColor: { default: null, [FORCED]: "GrayText" },
		boxSizing: "border-box",
		backgroundImage: {
			default: `linear-gradient(100deg, transparent 30%, ${color.sheen} 50%, transparent 70%)`,
			[REDUCED]: "none",
			[FORCED]: "none",
		},
		backgroundSize: "220% 100%",
		animationName: { default: shimmer, [REDUCED]: "none" },
		animationDuration: { default: "1.6s", [REDUCED]: "2.4s" },
		animationTimingFunction: { default: motion.linear, [REDUCED]: motion.easeInOut },
		animationIterationCount: "infinite",
	},
	line: { height: "0.8rem" },
	circle: { borderRadius: corner.pill },
	size: (width: string | number, height: string | number | null) => ({ width, height }),
	group: { display: "grid", gap: space.xxs },
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

export type SkeletonProps = Omit<ComponentProps<"div">, "children" | "width" | "height"> & {
	shape?: "line" | "block" | "circle"
	width?: string | number
	height?: string | number
	size?: string | number
	sx?: StyleArg
}

export function Skeleton({ shape = "line", width, height, size, sx, ...props }: SkeletonProps) {
	const resolvedWidth = shape === "circle" ? (size ?? width ?? "2.25rem") : (width ?? "100%")
	const resolvedHeight = shape === "circle" ? (size ?? height ?? "2.25rem") : (height ?? "")
	return (
		<div
			aria-hidden="true"
			{...props}
			{...styled(
				props,
				styles.bone,
				shape === "line" && styles.line,
				shape === "circle" && styles.circle,
				styles.size(resolvedWidth, resolvedHeight || null),
				sx,
			)}
		/>
	)
}

export type SkeletonGroupProps = ComponentProps<"div"> & { label: string; sx?: StyleArg }

export function SkeletonGroup({ label, children, sx, ...props }: SkeletonGroupProps) {
	return (
		<div role="status" aria-label={label} {...props} {...styled(props, styles.group, sx)}>
			<span {...stylex.props(styles.srOnly)}>{label}</span>
			{children}
		</div>
	)
}

const threadStrings = defineStrings({
	"zh-TW": { loading: "thread 載入中" },
	en: { loading: "Loading thread" },
})

/** The ThreadSkeleton's built-in words (follow `<LocaleProvider>`): `loading` is its status label. */
export type ThreadSkeletonLabels = StringsOf<typeof threadStrings>

export type ThreadSkeletonProps = {
	/** How many user + assistant turns to draw. Defaults to 2. */
	messages?: number
	/** Shorthand for `labels.loading`, the status label; wins over it. */
	label?: string
	/** Override built-in words for this skeleton; the rest follow `<LocaleProvider>`. */
	labels?: Partial<ThreadSkeletonLabels>
}

/** A conversation-shaped placeholder: one status region over a few bubble and text bones. */
export function ThreadSkeleton({ messages = 2, label: labelProp, labels }: ThreadSkeletonProps) {
	const t = useStrings(threadStrings, labels)
	const label = labelProp ?? t.loading
	return (
		<SkeletonGroup label={label} sx={threadStyles.thread}>
			{Array.from({ length: messages }, (_, index) => (
				<div key={index} {...stylex.props(threadStyles.turn)}>
					<Skeleton sx={threadStyles.userBubble} width="55%" height="2.4rem" />
					<div {...stylex.props(threadStyles.assistant)}>
						<Skeleton shape="circle" size="1.6rem" />
						<div {...stylex.props(threadStyles.stack)}>
							<Skeleton width="96%" />
							<Skeleton width="88%" />
							<Skeleton width="47%" />
						</div>
					</div>
				</div>
			))}
		</SkeletonGroup>
	)
}

const threadStyles = stylex.create({
	thread: { display: "grid", gap: space.sm },
	turn: { display: "grid", gap: space.sm },
	userBubble: { justifySelf: "end", borderRadius: `${radius.lg} ${radius.lg} ${radius.sm} ${radius.lg}` },
	assistant: { display: "flex", gap: space.xs, alignItems: "flex-start" },
	stack: { display: "grid", gap: space.xxs, flex: 1 },
})
