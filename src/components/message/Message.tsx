import * as stylex from "@stylexjs/stylex"
import type { CSSProperties } from "react"
import { Children, type ReactNode, type Ref, createContext, isValidElement, useContext, useRef } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { type StyleArg, styled } from "../../lib/styled"
import { color, corner, motion, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
// 觸控裝置沒有 hover:只在 hover 才出現的東西要一直顯示
const NO_HOVER = "@media (hover: none)"
// forced colors 會換掉底色:泡泡改用框,游標和等待點改塗 CanvasText 才看得見
const FORCED = "@media (forced-colors: active)"
// 使用者泡泡的大角。軟材規格是 18 18 6 18,圓角 token 沒有 18 這一階
const BUBBLE_CORNER = 18

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
		boxSizing: "border-box",
		backgroundColor: color.surface,
		borderRadius: BUBBLE_CORNER,
		borderEndEndRadius: corner.small,
		paddingBlock: space.sm,
		paddingInline: space.md,
		fontSize: type.t3,
		lineHeight: type.body,
		color: color.text,
		overflowWrap: "anywhere",
		outline: { default: null, [FORCED]: "1px solid CanvasText" },
	},
	assistant: {
		position: "relative",
		paddingBottom: space.xl,
		marginBottom: `calc(${space.xl} * -1)`,
		contentVisibility: "auto",
		containIntrinsicSize: "auto 200px",
		"--ak-action-bar-opacity": { default: "0", ":hover": "1", [NO_HOVER]: "1" },
	},
	part: { margin: 0, fontSize: type.t3, lineHeight: type.body, color: color.text },
	cursor: {
		display: "inline-block",
		width: 1,
		height: "1.05em",
		backgroundColor: { default: color.text, [FORCED]: "CanvasText" },
		forcedColorAdjust: "none",
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
		borderRadius: corner.pill,
		backgroundColor: { default: color.signal, [FORCED]: "CanvasText" },
		forcedColorAdjust: "none",
		animationName: { default: pulse, [REDUCED]: "none" },
		animationDuration: "1.2s",
		animationTimingFunction: motion.easeInOut,
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

const strings = defineStrings({
	"zh-TW": { userAuthor: "你說:", assistantAuthor: "助理說:", pending: "回覆中" },
	en: { userAuthor: "You said:", assistantAuthor: "Assistant said:", pending: "Replying" },
})

/**
 * The message turns' built-in words (follow `<LocaleProvider>`): the screen-reader author
 * prefix of each turn and the pending announcement. Override any with `labels`.
 */
export type MessageLabels = StringsOf<typeof strings>

export type UserMessageProps = {
	/** What the person said. */
	children: ReactNode
	/** The screen-reader prefix that names the author. Wins over `labels.userAuthor`. */
	authorLabel?: string
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<MessageLabels>
}

/** The person's turn: a sunken bubble at the end of the line, named for screen readers. */
export function UserMessage({ children, authorLabel, labels }: UserMessageProps) {
	const t = useStrings(strings, labels)
	return (
		<div {...stylex.props(styles.turn, styles.userTurn)}>
			<span {...stylex.props(styles.srOnly)}>{authorLabel ?? t.userAuthor}</span>
			<div {...stylex.props(styles.bubble)}>{children}</div>
		</div>
	)
}

export type AssistantMessageProps = {
	/** Shows a blinking cursor after the last text part while the reply is still arriving. */
	streaming?: boolean
	/** Before the first token: shows a pulsing dot and announces `pendingLabel` instead of the parts. */
	pending?: boolean
	/** Announced while pending. Wins over `labels.pending`. */
	pendingLabel?: string
	/** The screen-reader prefix that names the author. Wins over `labels.assistantAuthor`. */
	authorLabel?: string
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<MessageLabels>
	/** The reply's parts: `TextPart`s, tool cards, an action bar. */
	children?: ReactNode
	/** StyleX overrides for the turn. */
	sx?: StyleArg
}

/** The assistant's turn: no bubble, its parts on the paper, named for screen readers. */
export function AssistantMessage({
	streaming = false,
	pending = false,
	pendingLabel,
	authorLabel,
	labels,
	children,
	sx,
}: AssistantMessageProps) {
	const t = useStrings(strings, labels)
	const body = useRef<HTMLDivElement>(null)
	const parts = Children.toArray(children)
	const lastText = parts.reduce(
		(found, part, index) => (isValidElement(part) && part.type === TextPart ? index : found),
		-1,
	)

	return (
		<MessageBodyContext value={body}>
			<div ref={body} {...stylex.props(styles.turn, styles.assistant, sx)}>
				<span {...stylex.props(styles.srOnly)}>{authorLabel ?? t.assistantAuthor}</span>
				{pending ? (
					<span role="status">
						<span aria-hidden="true" {...stylex.props(styles.pending)} />
						<span {...stylex.props(styles.srOnly)}>{pendingLabel ?? t.pending}</span>
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
