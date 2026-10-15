import * as stylex from "@stylexjs/stylex"
import type { ReactNode, SVGAttributes } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { color, corner, space, type } from "../../tokens.stylex"
import { Ghost } from "../ghost/Ghost"
import { Chevron } from "../icon/Chevron"
import {
	CircleAlertGlyph,
	CircleCheckGlyph,
	CirclePauseGlyph,
	CircleSlashGlyph,
	CircleXGlyph,
} from "../icon/glyphs"
import { ICON_STROKE, icon } from "../icon/icon"
import { LiveDot } from "../live-dot/LiveDot"

/**
 * A sub agent's run inside a thread: a filled pill with the run's title, its status and a
 * chevron that opens the run. While the run is not over, what it is doing (`children`) shows
 * indented under the pill. The numbers are desktop's, copied from shell-ui's sub-thread.
 */

const styles = stylex.create({
	root: {
		color: color.text,
		display: "flex",
		flexDirection: "column",
		fontSize: type.t3,
		gap: space.xs,
		lineHeight: type.tight,
		marginInlineStart: space.md,
	},
	head: {
		alignItems: "center",
		backgroundColor: { default: color.layer3, ":hover": color.layer4 },
		borderRadius: corner.float,
		color: color.text,
		display: "flex",
		fontSize: type.t3,
		gap: space.sm,
		height: "auto",
		justifyContent: "space-between",
		lineHeight: type.body,
		minHeight: 44,
		paddingBlock: 10,
		paddingInline: space.md,
		textAlign: "start",
		width: "100%",
	},
	// Ghost 不換行;標題在窄寬度要換行,不然會疊到狀態字上
	title: { flex: 1, minWidth: 0, whiteSpace: "normal" },
	chevron: { color: color.textFaint },
	body: { marginInlineStart: space.md },
	status: {
		alignItems: "center",
		display: "inline-flex",
		flexShrink: 0,
		fontSize: type.t2,
		gap: 6,
		lineHeight: type.tight,
	},
})

// 一種狀態一個顏色:卡住和暫停都是 warning,失敗是 danger,取消是 muted,三者分得開
const tones = stylex.create({
	text: { color: color.text },
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
	glyph: ((props: SVGAttributes<SVGSVGElement>) => ReactNode) | null
	tone: keyof typeof tones
	over: boolean
}

const LIVE: Look = { word: "running", glyph: null, tone: "text", over: false }

const LOOKS: Record<SubThreadStatus, Look> = {
	queued: LIVE,
	running: LIVE,
	waiting: { word: "paused", glyph: CirclePauseGlyph, tone: "warning", over: false },
	blocked: { word: "blocked", glyph: CircleAlertGlyph, tone: "warning", over: false },
	done: { word: "done", glyph: CircleCheckGlyph, tone: "success", over: true },
	failed: { word: "failed", glyph: CircleXGlyph, tone: "danger", over: true },
	cancelled: { word: "cancelled", glyph: CircleSlashGlyph, tone: "muted", over: true },
}

export type SubThreadRowProps = {
	/** What the sub agent was asked to do. */
	title: ReactNode
	/** Where its run is. */
	status: SubThreadStatus
	/** Opens the run's own view. The whole pill is the button. */
	onOpenRun: () => void
	/** What the run is doing, drawn indented under the pill until the run is over (done, failed, cancelled). */
	children?: ReactNode
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<SubThreadRowLabels>
	sx?: stylex.StyleXStyles
}

export function SubThreadRow({ title, status, onOpenRun, children, labels, sx }: SubThreadRowProps) {
	const t = useStrings(strings, labels)
	const { word, glyph: Glyph, tone, over } = LOOKS[status]

	return (
		<section {...stylex.props(styles.root, sx)}>
			<Ghost onClick={onOpenRun} sx={styles.head}>
				<span {...stylex.props(styles.title)}>{title}</span>
				<span {...stylex.props(styles.status, tones[tone])}>
					{Glyph ? <Glyph {...stylex.props(icon.sm)} strokeWidth={ICON_STROKE} /> : <LiveDot />}
					{t[word]}
				</span>
				<Chevron direction="right" {...stylex.props(icon.md, styles.chevron)} strokeWidth={ICON_STROKE} />
			</Ghost>
			{!over && children != null && <div {...stylex.props(styles.body)}>{children}</div>}
		</section>
	)
}
