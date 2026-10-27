import * as stylex from "@stylexjs/stylex"
import type { ReactNode } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { color, space, type } from "../../tokens.stylex"
import { Ghost } from "../ghost/Ghost"
import { Chevron } from "../icon/Chevron"
import { ICON_STROKE, icon } from "../icon/icon"

/**
 * A sub agent's run inside a thread: the run's title in weight 500 from the left edge, the
 * chevron after the words, and the status as a coloured word on the line under it. No fill: on
 * hover the grey status line goes darker. While the run is not over, what it is doing
 * (`children`) shows indented one step (16px) under it.
 */

const styles = stylex.create({
	root: {
		color: color.text,
		display: "flex",
		flexDirection: "column",
		fontSize: type.t3,
		gap: space.xxs,
		lineHeight: type.snug,
	},
	head: {
		alignItems: "flex-start",
		backgroundColor: "transparent",
		color: { default: color.textMuted, ":hover": color.text },
		display: "flex",
		flexDirection: "column",
		fontSize: type.t3,
		gap: 0,
		height: "auto",
		justifyContent: "flex-start",
		lineHeight: type.snug,
		minHeight: 28,
		paddingInline: 0,
		textAlign: "start",
		whiteSpace: "normal",
	},
	title: {
		alignItems: "center",
		color: color.text,
		display: "inline-flex",
		fontWeight: 500,
		gap: space.xxs,
		minWidth: 0,
	},
	// 狀態那行平常是灰字;hover 整顆時只把灰字變深
	line: { color: "inherit", fontSize: type.t2 },
	body: { marginInlineStart: space.md },
})

// 狀態只上在字:正在做 signal、等你 warning、完成 success、失敗 danger,取消是 muted
const tones = stylex.create({
	signal: { color: color.signal },
	warning: { color: color.warning },
	success: { color: color.success },
	danger: { color: color.danger },
	muted: { color: color.textMuted },
})

const strings = defineStrings({
	"zh-TW": {
		running: "進行中",
		paused: "暫停",
		blocked: "卡住了",
		done: "完成",
		failed: "失敗了",
		cancelled: "取消了",
	},
	en: {
		running: "Running",
		paused: "Paused",
		blocked: "Stuck",
		done: "Done",
		failed: "Failed",
		cancelled: "Cancelled",
	},
})

/** The SubThreadRow's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type SubThreadRowLabels = StringsOf<typeof strings>

/** Where a sub agent's run is. `queued` and `running` both read 進行中 / Running. */
export type SubThreadStatus = "queued" | "running" | "waiting" | "blocked" | "done" | "failed" | "cancelled"

type Look = {
	word: keyof SubThreadRowLabels
	tone: keyof typeof tones
	over: boolean
}

const LIVE: Look = { word: "running", tone: "signal", over: false }

const LOOKS: Record<SubThreadStatus, Look> = {
	queued: LIVE,
	running: LIVE,
	waiting: { word: "paused", tone: "warning", over: false },
	blocked: { word: "blocked", tone: "warning", over: false },
	done: { word: "done", tone: "success", over: true },
	failed: { word: "failed", tone: "danger", over: true },
	cancelled: { word: "cancelled", tone: "muted", over: true },
}

export type SubThreadRowProps = {
	/** What the sub agent was asked to do. */
	title: ReactNode
	/** Where its run is. */
	status: SubThreadStatus
	/** Opens the run's own view. The whole row is the button. */
	onOpenRun: () => void
	/** What the run is doing, drawn indented under the row until the run is over (done, failed, cancelled). */
	children?: ReactNode
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<SubThreadRowLabels>
	sx?: stylex.StyleXStyles
}

export function SubThreadRow({ title, status, onOpenRun, children, labels, sx }: SubThreadRowProps) {
	const t = useStrings(strings, labels)
	const { word, tone, over } = LOOKS[status]

	return (
		<section {...stylex.props(styles.root, sx)}>
			<Ghost onClick={onOpenRun} sx={styles.head}>
				<span {...stylex.props(styles.title)}>
					{title}
					<Chevron direction="right" {...stylex.props(icon.md)} strokeWidth={ICON_STROKE} />
				</span>
				<span {...stylex.props(styles.line)}>
					<span {...stylex.props(tones[tone])}>{t[word]}</span>
				</span>
			</Ghost>
			{!over && children != null && <div {...stylex.props(styles.body)}>{children}</div>}
		</section>
	)
}
