import {
	ActionIcon,
	AttachButton,
	AttachmentGrid,
	AttachmentTile,
	Bars,
	Break,
	Bubble,
	Button,
	CallBar,
	type CallStatus,
	Detail,
	Dot,
	FootNote,
	Ghost,
	Group,
	GroupCell,
	Help,
	Hint,
	IconTile,
	InputCell,
	LetterTile,
	ListHead,
	ListRow,
	ListSort,
	MoreRow,
	PageHead,
	PageNumber,
	PageSub,
	Panel,
	PayloadBlock,
	PendingFiles,
	SectionLabel,
	Segmented,
	SettingsRow,
	SettingsRows,
	SettingsValue,
	SliderCell,
	Snippet,
	StatBar,
	StatLine,
	Status,
	StatusBadge,
	StatusCell,
	Subject,
	Switch,
	Table,
	TableCell,
	TableHead,
	TextCell,
	Toggle,
	Tr,
	WeightDot,
} from "@anyknown/ui"
import * as stylex from "@stylexjs/stylex"
import { breakpoint, color, space } from "@anyknown/ui/tokens.stylex"
import { Fragment, type SVGProps, useState } from "react"
import { type DemoEntry, Demo, Label, Row } from "../shell"

const styles = stylex.create({
	column: { display: "grid", gap: space.md, maxWidth: "35rem" },
	// When narrow, the side columns shrink to just fit and give the width to the middle one
	memoryGrid: {
		gridTemplateColumns: {
			default: "4.5rem minmax(0, 1fr) 6rem 3.5rem",
			[breakpoint.phone]: "3.5rem minmax(0, 1fr) 4rem 2.5rem",
		},
	},
	questionGrid: {
		gridTemplateColumns: {
			default: "1rem minmax(0, 1fr) 8rem 5.5rem",
			[breakpoint.phone]: "1rem minmax(0, 1fr) 4.5rem 3.5rem",
		},
	},
	muted: { color: color.textMuted },
})

function KeyGlyph(props: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<circle cx="7.5" cy="15.5" r="5.5" />
			<path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
		</svg>
	)
}

function PlusGlyph(props: SVGProps<SVGSVGElement> & { strokeWidth?: number }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<path d="M5 12h14M12 5v14" />
		</svg>
	)
}

const PHOTO =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#7a9cc6"/><stop offset="1" stop-color="#2f4a2e"/></linearGradient></defs><rect width="300" height="300" fill="url(#g)"/></svg>',
	)

const REPLY = `I've saved your rent cap as **25k**. Here are three options:

| Area | Rent | Commute |
| --- | ---: | --- |
| Da'an | 24k | 12 min |
| Zhongshan | 22k | 18 min |
| Banqiao | 17k | 35 min |`

const PAYLOAD = JSON.stringify({ url: "https://rent.example.com/list?max=25000", pages: 2 }, null, 2)

const STATUSES: CallStatus[] = ["listening", "user-speaking", "thinking", "speaking"]

function GroupDemo() {
	const [notify, setNotify] = useState(true)
	const [handoff, setHandoff] = useState(0.6)
	const [saves, setSaves] = useState(0)

	return (
		<Demo
			id="group"
			title="group"
			note="A grouped list for settings pages: a header, one layer3 card, a footer."
		>
			<div {...stylex.props(styles.column)}>
				<Group
					header="Handoff"
					footer="When context reaches this line, the agent writes its memories first, then hands off to the next model."
				>
					<GroupCell
						icon={<IconTile icon={KeyGlyph} />}
						label="Provider keys"
						value="2 keys"
						onPress={() => {}}
					/>
					<GroupCell
						icon={<LetterTile name="figma" />}
						label="Figma"
						detail="mcp.figma.com"
						value="Needs attention"
						warn
						onPress={() => {}}
					/>
					<GroupCell
						label="Notifications"
						control={<Switch checked={notify} onCheckedChange={setNotify} aria-label="Notifications" />}
					/>
					<SliderCell
						label="Handoff point"
						min={0.5}
						max={0.9}
						step={0.05}
						value={handoff}
						text={(v) => `${Math.round(v * 100)}%`}
						onChange={setHandoff}
						onValueCommit={() => setSaves((n) => n + 1)}
					/>
				</Group>
				<Label>SliderCell saved {saves} times: once per drag, once per arrow key</Label>
				<Group header="Pick one">
					<GroupCell label="Auto" checked onPress={() => {}} />
					<GroupCell label="Claude Opus" checked={false} onPress={() => {}} />
				</Group>
				<Group>
					<InputCell label="Name" placeholder="STRIPE_TEST_KEY" mono />
					<TextCell placeholder="What the agent should know about it" aria-label="Description" />
					<GroupCell icon={<ActionIcon icon={PlusGlyph} />} label="Save" tone="accent" onPress={() => {}} />
				</Group>
			</div>
		</Demo>
	)
}

function SettingsRowsDemo() {
	const [wake, setWake] = useState(true)

	return (
		<Demo
			id="settings-rows"
			title="settings-rows"
			note="One setting per 44px line: the name and one line of help on the left, the control on the right. The rows sit on one sunken surface with hairlines between them."
		>
			<SettingsRows>
				<SettingsRow label="Voice wake" help="Say “Anyknown” to start talking.">
					<Switch checked={wake} onCheckedChange={setWake} aria-label="Voice wake" />
				</SettingsRow>
				<SettingsRow label="Handoff threshold" help="Context used before the agent hands off.">
					<SettingsValue>50%</SettingsValue>
					<Ghost>Change</Ghost>
				</SettingsRow>
				<SettingsRow
					label={
						<>
							Anthropic key
							<Dot />
							<Help>expires in 6 days</Help>
						</>
					}
				>
					<SettingsValue>•••• 9b7c</SettingsValue>
					<Ghost>Replace</Ghost>
				</SettingsRow>
				<SettingsRow label="Delete workspace" help="Removes every thread, memory and file for all members.">
					<Ghost danger>Delete…</Ghost>
				</SettingsRow>
			</SettingsRows>
		</Demo>
	)
}

function StatusDemo() {
	return (
		<Demo
			id="status"
			title="status"
			note="Status is a dot and a word; StatusBadge is the pill for something running on its own."
		>
			<Row>
				<Status dot="filled" tone="success">
					Current
				</Status>
				<Status dot="hollow">Needs review</Status>
				<Status dot="filled" tone="warning">
					Unsure
				</Status>
				<Status dot="dashed" tone="danger">
					Stale
				</Status>
			</Row>
			<Row>
				<StatusBadge tone="live">Agent working</StatusBadge>
				<StatusBadge tone="warn">Needs attention</StatusBadge>
				<StatusBadge tone="plain">Done</StatusBadge>
			</Row>
		</Demo>
	)
}

function ListDemo() {
	const [order, setOrder] = useState("check")

	return (
		<Demo
			id="list"
			title="list"
			note="The caller sets column widths with sx. The sorted column's name darkens and gets a ↓."
		>
			<div>
				<ListHead sx={styles.memoryGrid}>
					<ListSort active={order === "check"} onClick={() => setOrder("check")}>
						Status
					</ListSort>
					<span>Memory</span>
					<span>Scope</span>
					<ListSort active={order === "recent"} onClick={() => setOrder("recent")}>
						Added
					</ListSort>
				</ListHead>
				<ListRow sx={styles.memoryGrid}>
					<Status dot="dashed" tone="danger">
						Stale
					</Status>
					<span>Rent cap is 25k</span>
					<span {...stylex.props(styles.muted)}>Personal</span>
					<span {...stylex.props(styles.muted)}>9/12</span>
				</ListRow>
				<ListRow sx={styles.memoryGrid}>
					<Status dot="filled" tone="success">
						Current
					</Status>
					<span>Commute under 20 minutes</span>
					<span {...stylex.props(styles.muted)}>Personal</span>
					<span {...stylex.props(styles.muted)}>9/20</span>
				</ListRow>
			</div>
			<div>
				<ListHead aria-hidden="true" sx={styles.questionGrid}>
					<span />
					<span>Question</span>
					<span>Agent suggests</span>
					<span>Runs on its own</span>
				</ListHead>
				<ListRow sx={styles.questionGrid}>
					<WeightDot weight="heavy" title="Your call; this never runs on its own" />
					<span>Sign the lease for the Da'an place?</span>
					<span {...stylex.props(styles.muted)}>See it first</span>
					<span {...stylex.props(styles.muted)}>—</span>
				</ListRow>
				<ListRow sx={styles.questionGrid}>
					<WeightDot weight="light" soon title="Runs as suggested if you don't answer" />
					<span>Book the viewing for Saturday afternoon?</span>
					<span {...stylex.props(styles.muted)}>Sat 14:00</span>
					<span {...stylex.props(styles.muted)}>In 2 hours</span>
				</ListRow>
			</div>
		</Demo>
	)
}

const LEDGER_COLUMNS = "3.5rem 4.5rem minmax(0, 1fr) 5rem 4rem 1.5rem"

const CALLS = [
	{ id: "c1", at: "14:32", tool: "shell", target: "pnpm test --filter desktop", ms: "8.1s" },
	{ id: "c2", at: "14:30", tool: "read", target: "apps/desktop/src/thread/tool-part.tsx", ms: "0.3s" },
	{
		id: "c3",
		at: "14:28",
		tool: "fetch",
		target: "rent.example.com/list?max=25000",
		ms: "12.0s",
		code: "429",
		detail: "Rate limited. The agent waited 3s, retried twice, and the third call went through.",
	},
	{ id: "c4", at: "14:21", tool: "write", target: "apps/desktop/src/thread/reducer.ts", ms: "0.1s" },
	{ id: "c5", at: "14:20", tool: "search", target: "parentCallID in packages/contract", ms: "2.4s" },
]

function TableDemo() {
	const [open, setOpen] = useState<string | null>("c3")
	const [tool, setTool] = useState<string | null>(null)
	const [shown, setShown] = useState(3)

	const rows = CALLS.filter((call) => tool === null || call.tool === tool)

	return (
		<Demo
			id="table"
			title="table"
			note="A ledger: a mono head on a sunken strip, 34px rows with hairlines, numbers on the right. On a phone the head goes and each row wraps to two lines in the order its cells give. Click a tool name to filter by it."
		>
			{tool !== null && (
				<Row>
					<Label>Showing {tool} calls</Label>
					<Ghost onClick={() => setTool(null)}>Clear filter</Ghost>
				</Row>
			)}
			<Table>
				<TableHead columns={LEDGER_COLUMNS}>
					<span>Time</span>
					<span>Tool</span>
					<span>Target</span>
					<span>Status</span>
					<TableCell num>Took</TableCell>
					<span />
				</TableHead>
				{rows.slice(0, shown).map((call) => (
					<Fragment key={call.id}>
						<Tr columns={LEDGER_COLUMNS} hover>
							<TableCell faint order={4}>
								{call.at}
							</TableCell>
							<Subject order={1} onPress={() => setTool(call.tool)}>
								{call.tool}
							</Subject>
							<TableCell mono order={6} prefixed grow>
								{call.target}
							</TableCell>
							<StatusCell warn={call.code !== undefined} order={2} pushed>
								{call.code ?? "ok"}
							</StatusCell>
							<TableCell num order={5} prefixed>
								{call.ms}
							</TableCell>
							{call.detail !== undefined ? (
								<Toggle
									order={3}
									open={open === call.id}
									onPress={() => setOpen(open === call.id ? null : call.id)}
									label={`Details for ${call.tool} at ${call.at}`}
									controls={`detail-${call.id}`}
								/>
							) : (
								<span />
							)}
							<Break order={3} />
						</Tr>
						{call.detail !== undefined && open === call.id && (
							<Detail id={`detail-${call.id}`}>
								<Hint>{call.detail}</Hint>
							</Detail>
						)}
					</Fragment>
				))}
				{shown < rows.length && (
					<MoreRow onPress={() => setShown(rows.length)}>Show {rows.length - shown} more</MoreRow>
				)}
			</Table>
		</Demo>
	)
}

const DAILY = [12, 18, 9, 22, 30, 26, 14, 8, 19, 33, 41, 28, 24, 37]

function PageDemo() {
	return (
		<Demo
			id="page"
			title="page"
			note="The words around a page's rows: PageHead (title, lead, summary, actions), SectionLabel, PageSub, Panel, StatLine with StatBar, Bars, Snippet, Hint and FootNote."
		>
			<PageHead
				title="Connections"
				lead={
					<>
						<PageNumber>3</PageNumber> connected · <PageNumber>49</PageNumber> tools
					</>
				}
				summary={
					<StatLine>
						Quota <StatBar percent={62} label="Monthly quota used" text="62% of the monthly quota" />
						<PageNumber>62%</PageNumber>
					</StatLine>
				}
				actions={<Button size="sm">Add connection</Button>}
			/>
			<PageSub>Tools the agent can call, and how often it called them.</PageSub>
			<SectionLabel first end="Last 14 days">
				Tool calls
			</SectionLabel>
			<Bars
				values={DAILY}
				tip={(value, index) => `Sep ${index + 1}: ${value} calls`}
				from="Sep 1"
				to="Sep 14"
			/>
			<SectionLabel end="1 of 3">Figma</SectionLabel>
			<Panel padded>
				<Hint>Paste this into your MCP client config to connect Figma.</Hint>
				<Snippet>{`{ "figma": { "url": "https://mcp.figma.com/sse" } }`}</Snippet>
			</Panel>
			<FootNote>Calls made during a handoff count toward the thread that started them.</FootNote>
		</Demo>
	)
}

function BubbleDemo() {
	return (
		<Demo
			id="bubble"
			title="bubble"
			note="What a person says shows as typed; replies are markdown, with ruled tables."
		>
			<div {...stylex.props(styles.column)}>
				<Bubble from="user">Find me places in Da'an, Zhongshan or Banqiao under 25k a month</Bubble>
				<Bubble from="assistant">{REPLY}</Bubble>
			</div>
		</Demo>
	)
}

function AttachmentDemo() {
	return (
		<Demo id="attachment" title="attachment">
			<AttachmentGrid>
				<AttachmentTile name="living-room.jpg" label="JPG" preview={PHOTO} />
				<AttachmentTile name="lease-draft.pdf" label="PDF" />
			</AttachmentGrid>
		</Demo>
	)
}

function PayloadBlockDemo() {
	return (
		<Demo
			id="payload-block"
			title="payload-block"
			note="No highlighting built in; the shell passes highlight(code) to colour it."
		>
			<div {...stylex.props(styles.column)}>
				<PayloadBlock code={PAYLOAD} />
			</div>
		</Demo>
	)
}

function ChatboxDemo() {
	const [files, setFiles] = useState([
		{ id: "1", name: "lease-draft.pdf" },
		{ id: "2", name: "living-room.jpg" },
	])

	return (
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
	)
}

function CallBarDemo() {
	const [status, setStatus] = useState<CallStatus>("listening")
	const [muted, setMuted] = useState(false)
	const [seconds, setSeconds] = useState(0)

	const tick = (node: HTMLDivElement | null) => {
		if (node === null) return
		const timer = setInterval(() => setSeconds((s) => s + 1), 1000)
		return () => clearInterval(timer)
	}

	return (
		<Demo
			id="call-bar"
			title="call-bar"
			note="Controlled: the call session supplies the status, the seconds and the muted state."
		>
			<div ref={tick} {...stylex.props(styles.column)}>
				<Segmented
					label="Call status"
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
	)
}

export const webDemos: DemoEntry[] = [
	{ id: "group", covers: ["group"], Component: GroupDemo },
	{ id: "settings-rows", covers: ["settings-rows"], Component: SettingsRowsDemo },
	{ id: "status", covers: ["status-badge"], Component: StatusDemo },
	{ id: "list", covers: ["list"], Component: ListDemo },
	{ id: "table", covers: ["table"], Component: TableDemo },
	{ id: "page", covers: ["page"], Component: PageDemo },
	{ id: "bubble", covers: ["bubble"], Component: BubbleDemo },
	{ id: "attachment", covers: ["attachment"], Component: AttachmentDemo },
	{ id: "payload-block", covers: ["payload-block"], Component: PayloadBlockDemo },
	{ id: "chatbox", covers: ["attach-button", "pending-files"], Component: ChatboxDemo },
	{ id: "call-bar", covers: ["call-bar"], Component: CallBarDemo },
]
