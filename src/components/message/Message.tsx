import * as stylex from "@stylexjs/stylex"
import type { CSSProperties } from "react"
import { Children, type ReactNode, type Ref, createContext, isValidElement, useContext, useRef } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { type StyleArg, styled } from "../../lib/styled"
import { breakpoint, color, corner, motion, space, type } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"
// 觸控裝置沒有 hover:只在 hover 才出現的東西要一直顯示
const NO_HOVER = "@media (hover: none)"
// forced colors:游標和等待點改塗 CanvasText 才看得見
const FORCED = "@media (forced-colors: active)"

const blink = stylex.keyframes({ "50%": { opacity: 0 } })
const pulse = stylex.keyframes({ "50%": { opacity: 0.3, scale: 0.8 } })

const styles = stylex.create({
	// 鉛筆稿的節奏:換人說話 24,turn 裡區塊前後 12,連續文字 4。
	// 左右不留白:Thread 和 Composer 放在同一欄,共用左右邊。
	thread: {
		display: "flex",
		flexDirection: "column",
		gap: space.lg,
		paddingBlockStart: { default: space.lg, [breakpoint.phone]: space.md },
		paddingBlockEnd: space.lg,
	},
	turn: { display: "flex", flexDirection: "column", gap: space.sm },
	textRun: { display: "flex", flexDirection: "column", gap: space.xxs },
	userTurn: { alignItems: "flex-end" },
	// 使用者的話沒有泡泡:靠右、字重 500
	user: {
		maxWidth: "85%",
		boxSizing: "border-box",
		fontSize: type.t3,
		fontWeight: 500,
		lineHeight: type.body,
		color: color.text,
		overflowWrap: "anywhere",
	},
	assistant: {
		position: "relative",
		paddingBottom: space.lg,
		marginBottom: `calc(${space.lg} * -1)`,
		contentVisibility: "auto",
		containIntrinsicSize: "auto 200px",
		// content-visibility 帶 paint containment,會切掉貼邊的焦點環
		overflowClipMargin: space.xs,
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
		animationDuration: motion.blink,
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
		borderRadius: corner.shape,
		backgroundColor: { default: color.signal, [FORCED]: "CanvasText" },
		forcedColorAdjust: "none",
		animationName: { default: pulse, [REDUCED]: "none" },
		animationDuration: motion.loop,
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
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<MessageLabels>
}

/**
 * The person's turn: no bubble, weight 500 at the end of the line, named for screen readers.
 * The time goes in a `textMuted` `type.t1` line the caller adds after the words.
 */
export function UserMessage({ children, labels }: UserMessageProps) {
	const t = useStrings(strings, labels)
	return (
		<div {...stylex.props(styles.turn, styles.userTurn)}>
			<span {...stylex.props(styles.srOnly)}>{t.userAuthor}</span>
			<div {...stylex.props(styles.user)}>{children}</div>
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
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<MessageLabels>
	/** The reply's parts: `TextPart`s, tool cards, an action bar. */
	children?: ReactNode
	/** StyleX overrides for the turn. */
	sx?: StyleArg
}

/**
 * The assistant's turn: no bubble, its parts from the left edge at weight 400, full width, named
 * for screen readers. The time and model go in a `textMuted` `type.t1` line the caller adds.
 */
export function AssistantMessage({
	streaming = false,
	pending = false,
	pendingLabel,
	labels,
	children,
	sx,
}: AssistantMessageProps) {
	const t = useStrings(strings, labels)
	const body = useRef<HTMLDivElement>(null)
	const parts = Children.toArray(children)
	const lastText = parts.reduce<number>((found, part, index) => (isTextPart(part) ? index : found), -1)
	const runs = runsOf(parts)

	return (
		<MessageBodyContext value={body}>
			<div ref={body} {...stylex.props(styles.turn, styles.assistant, sx)}>
				<span {...stylex.props(styles.srOnly)}>{t.assistantAuthor}</span>
				{pending ? (
					<span role="status">
						<span aria-hidden="true" {...stylex.props(styles.pending)} />
						<span {...stylex.props(styles.srOnly)}>{pendingLabel ?? t.pending}</span>
					</span>
				) : (
					runs.map((run) => {
						const items = run.parts.map(({ part, index }) => (
							<StreamingContext key={keyOf(part, index)} value={streaming && index === lastText}>
								{part}
							</StreamingContext>
						))
						const first = run.parts[0]
						return run.text ? (
							<div key={`text-${keyOf(first.part, first.index)}`} {...stylex.props(styles.textRun)}>
								{items}
							</div>
						) : (
							items[0]
						)
					})
				)}
			</div>
		</MessageBodyContext>
	)
}

const isTextPart = (part: ReactNode) => isValidElement(part) && part.type === TextPart

const keyOf = (part: ReactNode, index: number) =>
	isValidElement(part) && part.key != null ? part.key : index

type Run = { text: boolean; parts: { part: ReactNode; index: number }[] }

/**
 * Splits a turn's parts into runs. Consecutive `TextPart`s share one run (8px apart); any other
 * part is a block and stands alone, so the turn's 16px gap sits on both sides of it.
 */
function runsOf(parts: ReactNode[]): Run[] {
	const runs: Run[] = []
	parts.forEach((part, index) => {
		const text = isTextPart(part)
		const last = runs.at(-1)
		if (text && last?.text) last.parts.push({ part, index })
		else runs.push({ text, parts: [{ part, index }] })
	})
	return runs
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
