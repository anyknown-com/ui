import {
	ActionIcon,
	AttachButton,
	AttachmentGrid,
	AttachmentTile,
	Bubble,
	CallBar,
	type CallStatus,
	Group,
	GroupCell,
	IconTile,
	InputCell,
	LetterTile,
	ListHead,
	ListRow,
	ListSort,
	PayloadBlock,
	PendingFiles,
	Segmented,
	SliderCell,
	Status,
	StatusBadge,
	Switch,
	TextCell,
	WeightDot,
} from "@anyknown/ui"
import * as stylex from "@stylexjs/stylex"
import { type SVGProps, useState } from "react"
import { Demo, Label, Row } from "../shell"

const PHONE = "@media (max-width: 45rem)"

const styles = stylex.create({
	column: { display: "grid", gap: 16, maxWidth: 560 },
	// 窄的時候旁邊幾欄縮到剛好放得下,寬度讓給中間那欄
	memoryGrid: {
		gridTemplateColumns: {
			default: "72px minmax(0, 1fr) 96px 56px",
			[PHONE]: "56px minmax(0, 1fr) 32px 40px",
		},
	},
	questionGrid: {
		gridTemplateColumns: {
			default: "16px minmax(0, 1fr) 128px 88px",
			[PHONE]: "16px minmax(0, 1fr) 72px 56px",
		},
	},
	muted: { color: "inherit", opacity: 0.7 },
})

function KeyGlyph(props: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" {...props}>
			<circle cx="7.5" cy="15.5" r="5.5" />
			<path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
		</svg>
	)
}

function PlusGlyph(props: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" {...props}>
			<path d="M5 12h14M12 5v14" />
		</svg>
	)
}

const EFFORT = ["自動", "少", "中", "多", "最多"]

const PHOTO =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#7a9cc6"/><stop offset="1" stop-color="#2f4a2e"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/></svg>',
	)

const REPLY = `房租上限我記成 **25k**,這是三個選項:

| 地點 | 月租 | 通勤 |
| --- | ---: | --- |
| 大安 | 24k | 12 分 |
| 中山 | 22k | 18 分 |
| 板橋 | 17k | 35 分 |`

const PAYLOAD = JSON.stringify({ url: "https://rent.example.com/list?max=25000", pages: 2 }, null, 2)

const STATUSES: CallStatus[] = ["listening", "user-speaking", "thinking", "speaking"]

export function WebDemos() {
	const [notify, setNotify] = useState(true)
	const [handoff, setHandoff] = useState(0.6)
	const [saves, setSaves] = useState(0)
	const [order, setOrder] = useState("check")
	const [files, setFiles] = useState([
		{ id: "1", name: "租約草稿.pdf" },
		{ id: "2", name: "客廳.jpg" },
	])
	const [status, setStatus] = useState<CallStatus>("listening")
	const [muted, setMuted] = useState(false)
	const [seconds, setSeconds] = useState(0)

	const tick = (node: HTMLDivElement | null) => {
		if (node === null) return
		const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
		return () => clearInterval(timer)
	}

	return (
		<>
			<Demo id="group" title="group" note="設定頁的分組清單:header、一張 layer3 的卡、footer。">
				<div {...stylex.props(styles.column)}>
					<Group header="交接" footer="context 用到這條線時,先寫記憶再交給下一個 model。">
						<GroupCell
							icon={<IconTile icon={KeyGlyph} />}
							label="Provider key"
							value="2 把"
							onPress={() => {}}
						/>
						<GroupCell
							icon={<LetterTile name="figma" />}
							label="Figma"
							detail="mcp.figma.com"
							value="要處理"
							warn
							onPress={() => {}}
						/>
						<GroupCell
							label="通知"
							control={<Switch checked={notify} onCheckedChange={setNotify} aria-label="通知" />}
						/>
						<SliderCell
							label="交接時機"
							min={0.5}
							max={0.9}
							step={0.05}
							value={handoff}
							text={(v) => `${Math.round(v * 100)}%`}
							onChange={setHandoff}
							onValueCommit={() => setSaves((n) => n + 1)}
						/>
					</Group>
					<Label>SliderCell 存了 {saves} 次:拖一次、按一次方向鍵各存一次</Label>
					<Group header="選一個">
						<GroupCell label="自動" checked onPress={() => {}} />
						<GroupCell label="Claude Opus" checked={false} onPress={() => {}} />
					</Group>
					<Group>
						<InputCell label="名稱" placeholder="STRIPE_TEST_KEY" mono />
						<TextCell placeholder="給 AI 的說明" aria-label="說明" />
						<GroupCell
							icon={<ActionIcon icon={PlusGlyph} />}
							label="存起來"
							tone="accent"
							onPress={() => {}}
						/>
					</Group>
				</div>
			</Demo>

			<Demo id="status" title="status" note="點 + 字的狀態;一個東西自己在跑時的狀態藥丸。">
				<Row>
					<Status dot="filled" tone="success">
						還對
					</Status>
					<Status dot="hollow">待確認</Status>
					<Status dot="filled" tone="warning">
						不確定
					</Status>
					<Status dot="dashed" tone="danger">
						過期
					</Status>
				</Row>
				<Row>
					<StatusBadge tone="live">AI 操作中</StatusBadge>
					<StatusBadge tone="warn">需要處理</StatusBadge>
					<StatusBadge tone="plain">做完了</StatusBadge>
				</Row>
			</Demo>

			<Demo id="list" title="list" note="欄寬由呼叫端的 sx 給;排序中的欄名變深、後面一個 ↓。">
				<div>
					<ListHead sx={styles.memoryGrid}>
						<ListSort active={order === "check"} onClick={() => setOrder("check")}>
							狀態
						</ListSort>
						<span>記憶</span>
						<span>scope</span>
						<ListSort active={order === "recent"} onClick={() => setOrder("recent")}>
							建立
						</ListSort>
					</ListHead>
					<ListRow sx={styles.memoryGrid}>
						<Status dot="dashed" tone="danger">
							過期
						</Status>
						<span>房租上限 25k</span>
						<span {...stylex.props(styles.muted)}>個人</span>
						<span {...stylex.props(styles.muted)}>9/12</span>
					</ListRow>
					<ListRow sx={styles.memoryGrid}>
						<Status dot="filled" tone="success">
							還對
						</Status>
						<span>通勤不超過 20 分鐘</span>
						<span {...stylex.props(styles.muted)}>個人</span>
						<span {...stylex.props(styles.muted)}>9/20</span>
					</ListRow>
				</div>
				<div>
					<ListHead aria-hidden="true" sx={styles.questionGrid}>
						<span />
						<span>問題</span>
						<span>AI 建議</span>
						<span>自動執行</span>
					</ListHead>
					<ListRow sx={styles.questionGrid}>
						<WeightDot weight="heavy" title="要你決定,不會自動執行" />
						<span>要簽大安那間嗎?</span>
						<span {...stylex.props(styles.muted)}>先約看房</span>
						<span {...stylex.props(styles.muted)}>—</span>
					</ListRow>
					<ListRow sx={styles.questionGrid}>
						<WeightDot weight="light" soon title="未回答會照建議執行" />
						<span>看房約週六下午?</span>
						<span {...stylex.props(styles.muted)}>週六 14:00</span>
						<span {...stylex.props(styles.muted)}>2 小時後</span>
					</ListRow>
				</div>
			</Demo>

			<Demo id="bubble" title="bubble" note="人說的照打的字;回覆是 markdown,表格是 ruled 的。">
				<div {...stylex.props(styles.column)}>
					<Bubble from="user">幫我找大安、中山、板橋,月租 25k 以內的房子</Bubble>
					<Bubble from="assistant">{REPLY}</Bubble>
				</div>
			</Demo>

			<Demo id="attachment" title="attachment">
				<AttachmentGrid>
					<AttachmentTile name="客廳.jpg" label="JPG" preview={PHOTO} />
					<AttachmentTile name="租約草稿.pdf" label="PDF" />
				</AttachmentGrid>
			</Demo>

			<Demo id="payload-block" title="payload-block" note="不帶高亮;殼傳 highlight(code) 自己上色。">
				<div {...stylex.props(styles.column)}>
					<PayloadBlock code={PAYLOAD} />
				</div>
			</Demo>

			<Demo id="chatbox" title="attach-button / pending-files">
				<Row>
					<AttachButton
						onFiles={(picked) =>
							setFiles((now) => [
								...now,
								...picked.map((file) => ({ id: crypto.randomUUID(), name: file.name })),
							])
						}
					/>
					<PendingFiles
						files={files}
						onRemove={(id) => setFiles((now) => now.filter((file) => file.id !== id))}
					/>
				</Row>
			</Demo>

			<Demo id="call-bar" title="call-bar" note="受控:狀態、秒數、靜音都由通話 session 給。">
				<div ref={tick} {...stylex.props(styles.column)}>
					<Segmented
						label="通話狀態"
						value={status}
						onChange={setStatus}
						options={STATUSES.map((value) => ({ value, label: value }))}
					/>
					<CallBar
						status={status}
						seconds={seconds}
						muted={muted}
						onMute={setMuted}
						onHangUp={() => setSeconds(0)}
					/>
				</div>
			</Demo>
		</>
	)
}
