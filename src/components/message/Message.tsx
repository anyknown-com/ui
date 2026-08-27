import * as stylex from "@stylexjs/stylex"
import type { CSSProperties } from "react"
import { Children, type ReactNode, type Ref, createContext, isValidElement, useContext, useRef } from "react"
import { styled } from "../../lib/styled"
import { color, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

const blink = stylex.keyframes({ "50%": { opacity: 0 } })
const pulse = stylex.keyframes({ "50%": { opacity: 0.3, scale: 0.8 } })

const styles = stylex.create({
	thread: {
		display: "flex",
		flexDirection: "column",
		gap: space.lg,
		paddingInline: space.md,
		paddingBlock: space.lg,
	},
	turn: { display: "flex", flexDirection: "column", gap: space.xs },
	userTurn: { alignItems: "flex-end" },
	bubble: {
		maxWidth: "85%",
		backgroundColor: `color-mix(in srgb, ${color.border} 45%, ${color.surface})`,
		borderRadius: radius.xl,
		borderEndEndRadius: radius.sm,
		paddingBlock: space.xs,
		paddingInline: space.sm,
		fontSize: text.sm,
		lineHeight: text.leadingRelaxed,
		color: color.text,
	},
	assistant: {
		position: "relative",
		paddingBottom: space.xl,
		marginBottom: `calc(${space.xl} * -1)`,
		contentVisibility: "auto",
		containIntrinsicSize: "auto 200px",
		"--ak-action-bar-opacity": { default: "0", ":hover": "1" },
	},
	part: { margin: 0, fontSize: text.sm, lineHeight: text.leadingRelaxed, color: color.text },
	cursor: {
		display: "inline-block",
		width: 1,
		height: "1.05em",
		backgroundColor: color.text,
		verticalAlign: "text-bottom",
		marginInlineStart: 1,
		animationName: { default: blink, [REDUCED]: "none" },
		animationDuration: "1s",
		animationTimingFunction: "steps(2, start)",
		animationIterationCount: "infinite",
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
	pending: {
		display: "inline-block",
		width: "0.5rem",
		height: "0.5rem",
		borderRadius: radius.full,
		backgroundColor: color.textMuted,
		animationName: { default: pulse, [REDUCED]: "none" },
		animationDuration: "1.2s",
		animationTimingFunction: "ease-in-out",
		animationIterationCount: "infinite",
	},
})

const StreamingContext = createContext(false)
const MessageBodyContext = createContext<{ current: HTMLElement | null } | null>(null)

export function useMessageBody() {
	return useContext(MessageBodyContext)
}

export type ThreadProps = {
	children: ReactNode
	className?: string
	style?: CSSProperties
	ref?: Ref<HTMLDivElement>
}

export function Thread({ children, ...rest }: ThreadProps) {
	return (
		<div {...rest} {...styled(rest, styles.thread)}>
			{children}
		</div>
	)
}

export type UserMessageProps = { children: ReactNode; authorLabel?: string }

export function UserMessage({ children, authorLabel = "你說:" }: UserMessageProps) {
	return (
		<div {...stylex.props(styles.turn, styles.userTurn)}>
			<span {...stylex.props(styles.srOnly)}>{authorLabel}</span>
			<div {...stylex.props(styles.bubble)}>{children}</div>
		</div>
	)
}

export type AssistantMessageProps = {
	streaming?: boolean
	pending?: boolean
	pendingLabel?: string
	authorLabel?: string
	children?: ReactNode
}

export function AssistantMessage({
	streaming = false,
	pending = false,
	pendingLabel = "回覆中",
	authorLabel = "助理說:",
	children,
}: AssistantMessageProps) {
	const body = useRef<HTMLDivElement>(null)
	const parts = Children.toArray(children)
	const lastText = parts.reduce(
		(found, part, index) => (isValidElement(part) && part.type === TextPart ? index : found),
		-1,
	)

	return (
		<MessageBodyContext value={body}>
			<div ref={body} {...stylex.props(styles.turn, styles.assistant)}>
				<span {...stylex.props(styles.srOnly)}>{authorLabel}</span>
				{pending ? (
					<span role="status">
						<span aria-hidden="true" {...stylex.props(styles.pending)} />
						<span {...stylex.props(styles.srOnly)}>{pendingLabel}</span>
					</span>
				) : (
					parts.map((part, index) => (
						<StreamingContext
							key={isValidElement(part) && part.key != null ? part.key : index}
							value={streaming && index === lastText}
						>
							{part}
						</StreamingContext>
					))
				)}
			</div>
		</MessageBodyContext>
	)
}

export type TextPartProps = { children: ReactNode }

export function TextPart({ children }: TextPartProps) {
	const streaming = useContext(StreamingContext)
	return (
		<p data-ak-message-text="" {...stylex.props(styles.part)}>
			{children}
			{streaming && <span aria-hidden="true" {...stylex.props(styles.cursor)} />}
		</p>
	)
}
