import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { color, radius, space } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const shimmer = stylex.keyframes({
	from: { backgroundPosition: "180% 0" },
	to: { backgroundPosition: "-80% 0" },
})

const styles = stylex.create({
	bone: {
		backgroundColor: color.bone,
		borderRadius: radius.sm,
		backgroundImage: {
			default: `linear-gradient(100deg, transparent 30%, ${color.sheen} 50%, transparent 70%)`,
			[REDUCED]: "none",
		},
		backgroundSize: "220% 100%",
		animationName: { default: shimmer, [REDUCED]: "none" },
		animationDuration: { default: "1.6s", [REDUCED]: "2.4s" },
		animationTimingFunction: { default: "linear", [REDUCED]: "ease-in-out" },
		animationIterationCount: "infinite",
	},
	line: { height: "0.8rem" },
	circle: { borderRadius: radius.full },
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

export type ThreadSkeletonProps = { messages?: number; label?: string }

export function ThreadSkeleton({ messages = 2, label = "thread 載入中" }: ThreadSkeletonProps) {
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
