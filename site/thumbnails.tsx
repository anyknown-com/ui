// One small live render per component family, for the catalog cards. Real components with
// static props. The stage is inert and hidden from assistive tech, so the card link around it
// stays the only focus stop. Overlays (dialog, popover, tooltip, toast, dropdown) portal to
// <body> when open, so their thumbnails show the real trigger and draw the open layer from the
// same tokens the overlay uses.
import {
	ActionBar,
	AssistantMessage,
	AttachButton,
	AttachmentGrid,
	AttachmentTile,
	Badge,
	Button,
	CallBar,
	Card,
	Checkbox,
	CodeBlock,
	Composer,
	DataTable,
	DiffViewer,
	DialogActions,
	DropdownMenu,
	Dropzone,
	EmptyState,
	Field,
	FileList,
	FileRow,
	Ghost,
	Group,
	GroupCell,
	HandoffReceipt,
	ICON_STROKE,
	IconButton,
	Input,
	Kbd,
	KbdGroup,
	ListHead,
	ListRow,
	LiveDot,
	Markdown,
	PageHead,
	PageNumber,
	PasswordInput,
	PayloadBlock,
	PendingFiles,
	PermissionCard,
	Pill,
	Popover,
	PopoverTrigger,
	Progress,
	ProgressRing,
	Radio,
	RadioGroup,
	ReasoningFold,
	RecoveryKey,
	Segmented,
	Select,
	SelectItem,
	SettingsRow,
	SettingsRows,
	SettingsValue,
	Skeleton,
	SkeletonGroup,
	Slider,
	Spin,
	Spinner,
	StatLine,
	StatBar,
	Status,
	StatusBadge,
	StatusChip,
	StatusCell,
	Subject,
	SubThreadRow,
	Switch,
	Table,
	TableCell,
	TableHead,
	Tabs,
	TabsList,
	TabsTab,
	Text,
	TextPart,
	Textarea,
	Thread,
	ToolGroup,
	Tr,
	UserMessage,
	VoiceIndicator,
	icon,
} from "@anyknown/ui"
import { color, corner, font, shadow, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import type { ComponentType, ReactNode } from "react"

const noop = () => {}

const styles = stylex.create({
	// The recessed frame (card corner) and the paper inside it (card corner minus the padding).
	frame: {
		aspectRatio: "16 / 10",
		boxSizing: "border-box",
		padding: space.xs,
		// The card link around the thumbnail carries the marker.
		// In dark the recessed steps sit too close to the sheet, so the frame takes layer4 there.
		backgroundColor: {
			default: `light-dark(${color.layer3}, ${color.layer4})`,
			[stylex.when.ancestor(":hover")]: `light-dark(${color.layer4}, ${color.layer5})`,
		},
		borderRadius: corner.card,
		display: "grid",
		minWidth: 0,
		pointerEvents: "none",
	},
	stage: {
		position: "relative",
		boxSizing: "border-box",
		padding: space.md,
		overflow: "clip",
		display: "grid",
		gridTemplateColumns: "minmax(0, 1fr)",
		gridTemplateRows: "minmax(0, 1fr)",
		// Unsafe so a canvas taller than the stage still centres; `fit` then scales it into view.
		placeItems: "unsafe center",
		minWidth: 0,
		minHeight: 0,
		backgroundColor: color.layer2,
		borderRadius: corner.small,
	},
	// What the thumbnail draws, at its own size; `fit` scales it down if it would not fit.
	canvas: {
		boxSizing: "border-box",
		width: "min(100%, 20rem)",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		gap: space.xs,
		transformOrigin: "center",
	},
	fill: { alignSelf: "stretch", display: "grid", gap: space.xs, minWidth: 0 },
	flush: { marginInlineStart: 0 },
	row: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "center",
		gap: space.xs,
	},
	muted: { fontSize: type.t2, color: color.textMuted },
	// The open layer of an overlay, drawn with the tokens the overlay itself uses.
	float: {
		display: "grid",
		gap: space.xxs,
		backgroundColor: color.surfaceRaised,
		color: color.text,
		borderRadius: corner.float,
		boxShadow: shadow.float,
		fontFamily: font.body,
		fontSize: type.t2,
		lineHeight: type.snug,
	},
	modal: {
		alignSelf: "stretch",
		display: "grid",
		gap: space.xxs,
		backgroundColor: color.surfaceRaised,
		borderRadius: corner.modal,
		boxShadow: shadow.modal,
		padding: space.md,
	},
	sheet: {
		alignSelf: "stretch",
		display: "grid",
		gap: space.xxs,
		backgroundColor: color.surfaceRaised,
		borderTopLeftRadius: corner.float,
		borderTopRightRadius: corner.float,
		boxShadow: shadow.modal,
		padding: space.xs,
		marginBottom: `calc(-1 * ${space.md})`,
	},
	grabber: {
		justifySelf: "center",
		width: "2.25rem",
		height: space.xxs,
		marginBottom: space.xs,
		borderRadius: corner.pill,
		backgroundColor: color.borderStrong,
	},
	menu: { minWidth: "11rem", padding: space.xxs },
	menuItem: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.xs,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		borderRadius: corner.control,
	},
	menuActive: { backgroundColor: color.accentSubtle },
	menuDanger: { color: color.danger },
	panel: { paddingBlock: space.sm, paddingInline: space.md, maxWidth: "14rem" },
	tip: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xs,
		borderRadius: corner.control,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
	},
	toast: {
		alignSelf: "stretch",
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.xs,
		paddingBlock: space.xs,
		paddingInlineStart: space.md,
		paddingInlineEnd: space.xs,
	},
	title: { fontWeight: 600, color: color.text },
	listGrid: { gridTemplateColumns: "4.5rem minmax(0, 1fr)" },
	// A reply skips rendering while off screen and stands in at 200px, so `fit` would shrink the
	// thumbnail to that guess. Thumbnails always render it at its real height.
	rendered: { contentVisibility: "visible" },
})

const LEDGER = "3rem minmax(0, 1fr) 3rem"

function Glyph({ d, size = "md" }: { d: string; size?: keyof typeof icon }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={ICON_STROKE}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...stylex.props(icon[size])}
		>
			<path d={d} />
		</svg>
	)
}

const SEARCH = "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3"
const BELL = "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9m4.3 13a1.94 1.94 0 0 0 3.4 0"
const PLUS = "M5 12h14M12 5v14"
const PENCIL = "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
const INBOX =
	"M22 12h-6l-2 3h-4l-2-3H2m3.45-6.89L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"

const Fill = ({ children }: { children: ReactNode }) => <div {...stylex.props(styles.fill)}>{children}</div>
const Row = ({ children }: { children: ReactNode }) => <div {...stylex.props(styles.row)}>{children}</div>

type Memory = { key: string; memory: string }
const MEMORIES: Memory[] = [
	{ key: "pkg", memory: "Prefers pnpm" },
	{ key: "deploy", memory: "Deploys to Cloudflare" },
	{ key: "ship", memory: "Desktop ships first" },
]

/** Folder name → its thumbnail. The smoke test checks every grouped folder has one. */
export const THUMBNAILS: Record<string, ComponentType> = {
	button: () => (
		<Row>
			<Button variant="secondary">Cancel</Button>
			<Button>Send</Button>
		</Row>
	),
	"icon-button": () => (
		<Row>
			<IconButton label="Search threads">
				<Glyph d={SEARCH} />
			</IconButton>
			<IconButton label="Notifications" badge={3}>
				<Glyph d={BELL} />
			</IconButton>
			<IconButton label="New thread" current>
				<Glyph d={PLUS} />
			</IconButton>
		</Row>
	),
	ghost: () => (
		<Row>
			<Ghost>Edit</Ghost>
			<Ghost>Copy link</Ghost>
			<Ghost danger>Revoke key</Ghost>
		</Row>
	),
	card: () => (
		<Card>
			<Text as="p" variant="title">
				Workspace
			</Text>
			<Text as="p" variant="caption">
				142 threads, last handoff at 14:32.
			</Text>
		</Card>
	),
	text: () => (
		<Fill>
			<Text as="p" variant="title">
				Memory
			</Text>
			<Text as="p">Important things travel with every handoff.</Text>
			<Text as="p" variant="caption">
				Last synced 14:32
			</Text>
		</Fill>
	),
	icon: () => (
		<Row>
			{(["xs", "sm", "md", "base", "lg"] as const).map((size) => (
				<Glyph key={size} d={PENCIL} size={size} />
			))}
		</Row>
	),
	kbd: () => (
		<Row>
			<KbdGroup keys={["⌘", "K"]} />
			<Kbd>Esc</Kbd>
		</Row>
	),
	badge: () => (
		<Row>
			<Badge>Draft</Badge>
			<Badge variant="accent">New</Badge>
			<Badge variant="success">Synced</Badge>
			<Badge dot="danger" count={3}>
				Stale
			</Badge>
		</Row>
	),
	"status-badge": () => (
		<Row>
			<StatusBadge tone="live">AI is operating</StatusBadge>
			<StatusBadge tone="warn">Needs your input</StatusBadge>
			<StatusBadge tone="plain">Done</StatusBadge>
		</Row>
	),
	"status-chip": () => (
		<>
			<Row>
				<StatusChip variant="r">read</StatusChip>
				<StatusChip variant="w">write</StatusChip>
				<StatusChip variant="d">delete</StatusChip>
				<StatusChip variant="a">running</StatusChip>
			</Row>
			<Pill status="live">researching</Pill>
		</>
	),
	"live-dot": () => (
		<Row>
			<LiveDot label="Still running" />
			<span {...stylex.props(styles.muted)}>Reading loop.ts</span>
		</Row>
	),
	"empty-state": () => (
		<Fill>
			<EmptyState
				icon={<Glyph d={INBOX} />}
				title="No memories yet"
				action={<Button size="sm">Start a thread</Button>}
			/>
		</Fill>
	),

	input: () => (
		<Fill>
			<Input defaultValue="Anyknown" aria-label="Workspace name" />
			<Input placeholder="Search memories" aria-label="Search" />
		</Fill>
	),
	textarea: () => (
		<Fill>
			<Textarea defaultValue="Hand off when the context is half full." rows={3} aria-label="Note" />
		</Fill>
	),
	label: () => (
		<Fill>
			<Field label="Workspace name" help="Everyone in it sees this." required>
				<Input defaultValue="Anyknown" />
			</Field>
		</Fill>
	),
	checkbox: () => (
		<Fill>
			<Checkbox label="Notify me at every handoff" defaultChecked />
			<Checkbox label="Send a weekly summary" />
		</Fill>
	),
	radio: () => (
		<Fill>
			<RadioGroup legend="Handoff threshold" defaultValue="50">
				<Radio value="50" label="50%" />
				<Radio value="75" label="75%" />
			</RadioGroup>
		</Fill>
	),
	switch: () => (
		<Fill>
			<Switch label="Voice wake" defaultChecked />
			<Switch label="Sounds" />
		</Fill>
	),
	slider: () => (
		<Fill>
			<Slider label="Thinking" defaultValue={0.6} />
		</Fill>
	),
	select: () => (
		<Fill>
			<Select defaultValue="fable-5" aria-label="Model">
				<SelectItem value="fable-5">Fable 5</SelectItem>
				<SelectItem value="sonnet-5">Sonnet 5</SelectItem>
			</Select>
		</Fill>
	),
	segmented: () => (
		<Segmented
			label="Memory scope"
			defaultValue="personal"
			options={[
				{ value: "personal", label: "Personal" },
				{ value: "team", label: "Team" },
				{ value: "all", label: "All" },
			]}
		/>
	),
	dropdown: () => (
		<>
			<DropdownMenu trigger={<Button variant="secondary">Actions</Button>}>{null}</DropdownMenu>
			<div {...stylex.props(styles.float, styles.menu)}>
				<span {...stylex.props(styles.menuItem, styles.menuActive)}>
					Rename <Kbd>R</Kbd>
				</span>
				<span {...stylex.props(styles.menuItem)}>Duplicate</span>
				<span {...stylex.props(styles.menuItem, styles.menuDanger)}>Delete</span>
			</div>
		</>
	),
	"password-input": () => (
		<Fill>
			<PasswordInput defaultValue="correct horse battery" meter aria-label="Passphrase" />
		</Fill>
	),

	dialog: () => (
		<div {...stylex.props(styles.modal)}>
			<span {...stylex.props(styles.title)}>Delete this thread?</span>
			<span {...stylex.props(styles.muted)}>Its memories stay in the vault.</span>
			<DialogActions>
				<Button size="sm" variant="secondary">
					Cancel
				</Button>
				<Button size="sm" variant="danger">
					Delete
				</Button>
			</DialogActions>
		</div>
	),
	sheet: () => (
		<div {...stylex.props(styles.sheet)}>
			<span {...stylex.props(styles.grabber)} />
			<span {...stylex.props(styles.title, styles.menuItem)}>Opus 5.5 · Your subscription</span>
			<span {...stylex.props(styles.menuItem, styles.menuActive)}>Opus 5.5</span>
			<span {...stylex.props(styles.menuItem)}>Sonnet 5</span>
		</div>
	),
	popover: () => (
		<>
			<Popover>
				<PopoverTrigger>
					<Button size="sm" variant="secondary">
						Prefers pnpm
					</Button>
				</PopoverTrigger>
			</Popover>
			<div {...stylex.props(styles.float, styles.panel)}>
				<span {...stylex.props(styles.title)}>Prefers pnpm</span>
				<span {...stylex.props(styles.muted)}>Learned on Aug 20 from a handoff.</span>
			</div>
		</>
	),
	tooltip: () => (
		<>
			<span {...stylex.props(styles.float, styles.tip)}>
				Search threads <KbdGroup keys={["⌘", "K"]} />
			</span>
			<IconButton label="Search threads">
				<Glyph d={SEARCH} />
			</IconButton>
		</>
	),
	toast: () => (
		<div {...stylex.props(styles.float, styles.toast)}>
			<span>Deleted “prefers pnpm”</span>
			<Ghost>Undo</Ghost>
		</div>
	),
	tabs: () => (
		<Tabs defaultValue="chat">
			<TabsList aria-label="Thread view">
				<TabsTab value="chat">Chat</TabsTab>
				<TabsTab value="memory">Memory</TabsTab>
				<TabsTab value="files">Files</TabsTab>
			</TabsList>
		</Tabs>
	),

	progress: () => (
		<Fill>
			<Progress value={64} aria-label="Sync thread" valueText="64% · handing off 3 messages" />
			<Row>
				<ProgressRing value={42} aria-label="Context use" valueText="42% of context used" />
				<Spinner />
			</Row>
		</Fill>
	),
	spin: () => (
		<Row>
			<Spin />
			<span {...stylex.props(styles.muted)}>Syncing</span>
		</Row>
	),
	skeleton: () => (
		<Fill>
			<SkeletonGroup label="Loading memory">
				<Skeleton shape="circle" size="2rem" />
				<Skeleton />
				<Skeleton width="61%" />
			</SkeletonGroup>
		</Fill>
	),

	message: () => (
		<Fill>
			<Thread>
				<UserMessage>Are the reducer tests done?</UserMessage>
				<AssistantMessage sx={styles.rendered}>
					<TextPart>Done. All three cases pass.</TextPart>
				</AssistantMessage>
			</Thread>
		</Fill>
	),
	markdown: () => (
		<Fill>
			<Markdown>{"**Two** places fit:\n\n- Da'an, 23k\n- Zhongshan, 24k"}</Markdown>
		</Fill>
	),
	"code-block": () => (
		<Fill>
			<CodeBlock lang="ts" code={"const retry = await withRetry(call)\nemit(retry)"} />
		</Fill>
	),
	"payload-block": () => (
		<Fill>
			<PayloadBlock code={'{\n  "filePath": "src/turn.ts",\n  "limit": 200\n}'} />
		</Fill>
	),
	"tool-group": () => (
		<Fill>
			<ToolGroup
				calls={[
					{ id: "r", tool: "read", summary: "src/thread/reducer.ts" },
					{ id: "s", tool: "shell", summary: "pnpm test" },
				]}
			/>
		</Fill>
	),
	"sub-thread": () => (
		<Fill>
			<SubThreadRow title="Trace retries" status="running" onOpenRun={noop} sx={styles.flush} />
			<SubThreadRow title="Check events" status="done" onOpenRun={noop} sx={styles.flush} />
		</Fill>
	),
	"reasoning-fold": () => <ReasoningFold durationSec={12}>Search for the event name first.</ReasoningFold>,
	"action-bar": () => (
		<Fill>
			<Thread>
				<AssistantMessage sx={styles.rendered}>
					<TextPart>The retry now reaches the footer.</TextPart>
					<ActionBar visible>
						<ActionBar.Copy />
						<ActionBar.Regenerate onRegenerate={noop} />
					</ActionBar>
				</AssistantMessage>
			</Thread>
		</Fill>
	),
	"interaction-card": () => (
		<Fill>
			<PermissionCard verb="Run command" subject="pnpm publish" />
		</Fill>
	),
	"handoff-receipt": () => (
		<Fill>
			<HandoffReceipt at="14:32" ctxPercent={50} memory={{ count: 3 }} ledgerCount={42} />
		</Fill>
	),
	composer: () => (
		<Fill>
			<Composer placeholder="Message the agent" onSubmit={noop} />
		</Fill>
	),
	"attach-button": () => <AttachButton onFiles={noop} />,
	"pending-files": () => (
		<PendingFiles
			files={[
				{ id: "1", name: "lease-draft.pdf" },
				{ id: "2", name: "living-room.jpg" },
			]}
			onRemove={noop}
		/>
	),
	attachment: () => (
		<AttachmentGrid>
			<AttachmentTile name="lease-draft.pdf" label="PDF" />
		</AttachmentGrid>
	),
	"voice-indicator": () => (
		<>
			<VoiceIndicator state="listening" />
			<VoiceIndicator state="idle" />
		</>
	),
	"call-bar": () => (
		<Fill>
			<CallBar status="listening" seconds={83} muted={false} onMute={noop} onHangUp={noop} />
		</Fill>
	),

	"data-table": () => (
		<Fill>
			<DataTable
				label="Memories"
				rows={MEMORIES}
				rowKey={(row) => row.key}
				columns={[
					{ id: "key", header: "key", mono: true, value: (row) => row.key },
					{ id: "memory", header: "Memory", value: (row) => row.memory },
				]}
			/>
		</Fill>
	),
	table: () => (
		<Fill>
			<Table>
				<TableHead columns={LEDGER}>
					<span>Time</span>
					<span>Tool</span>
					<TableCell num>Took</TableCell>
				</TableHead>
				<Tr columns={LEDGER}>
					<TableCell faint>14:32</TableCell>
					<Subject onPress={noop}>shell</Subject>
					<TableCell num>8.1s</TableCell>
				</Tr>
				<Tr columns={LEDGER}>
					<TableCell faint>14:28</TableCell>
					<StatusCell warn>fetch 429</StatusCell>
					<TableCell num>12.0s</TableCell>
				</Tr>
			</Table>
		</Fill>
	),
	list: () => (
		<Fill>
			<ListHead sx={styles.listGrid}>
				<span>Status</span>
				<span>Memory</span>
			</ListHead>
			<ListRow sx={styles.listGrid}>
				<Status dot="dashed" tone="danger">
					Stale
				</Status>
				<span>Rent cap is 25k</span>
			</ListRow>
			<ListRow sx={styles.listGrid}>
				<Status dot="filled" tone="success">
					Current
				</Status>
				<span>Commute under 20 min</span>
			</ListRow>
		</Fill>
	),
	"file-row": () => (
		<Fill>
			<FileList label="Files">
				<FileRow item={{ kind: "folder", name: "Tax documents", mtime: "Aug 20" }} />
				<FileRow item={{ kind: "file", name: "passport-scan.pdf", size: 2_400_000, mtime: "Aug 26" }} />
			</FileList>
		</Fill>
	),
	dropzone: () => (
		<Fill>
			<Dropzone onFiles={noop} />
		</Fill>
	),
	"diff-viewer": () => (
		<Fill>
			<DiffViewer
				file={{
					path: "src/turn.ts",
					before: "onRetry: log,\nmaxTries: 3,",
					after: "onRetry: emit,\nmaxTries: 3,",
				}}
			/>
		</Fill>
	),
	"recovery-key": () => (
		<Fill>
			<RecoveryKey
				value="K7PQ-WM2X-9RDF-H4TN-ZC8B"
				intro="Shown only this once."
				revealLabel="Show"
				warning="We don't keep a copy."
				ackLabel="I saved it"
			/>
		</Fill>
	),

	group: () => (
		<Fill>
			<Group header="Model">
				<GroupCell label="Auto" checked onPress={noop} />
				<GroupCell label="Fable 5" checked={false} onPress={noop} />
			</Group>
		</Fill>
	),
	"settings-rows": () => (
		<Fill>
			<SettingsRows>
				<SettingsRow label="Voice wake" help="Say “Anyknown” to talk.">
					<Switch defaultChecked aria-label="Voice wake" />
				</SettingsRow>
				<SettingsRow label="Handoff threshold">
					<SettingsValue>50%</SettingsValue>
				</SettingsRow>
			</SettingsRows>
		</Fill>
	),
	page: () => (
		<Fill>
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
			/>
		</Fill>
	),
}

/** Scales the canvas down until it fits the stage, so no thumbnail is ever cut off. */
function fit(stage: HTMLDivElement | null) {
	const canvas = stage?.firstElementChild
	if (stage == null || !(canvas instanceof HTMLElement)) return
	const measure = () => {
		const style = getComputedStyle(stage)
		const height = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
		const scale = Math.min(1, height / canvas.offsetHeight, canvas.clientWidth / canvas.scrollWidth)
		canvas.style.transform = scale < 1 ? `scale(${scale})` : ""
	}
	const observer = new ResizeObserver(measure)
	observer.observe(stage)
	observer.observe(canvas)
	return () => observer.disconnect()
}

/** The inert stage a catalog card shows: the family's thumbnail, or nothing for an unknown name. */
export function Thumbnail({ name }: { name: string }) {
	const Render = THUMBNAILS[name]
	return (
		<div aria-hidden="true" inert {...stylex.props(styles.frame)}>
			<div ref={fit} {...stylex.props(styles.stage)}>
				<div {...stylex.props(styles.canvas)}>{Render != null && <Render />}</div>
			</div>
		</div>
	)
}

/** One line per family for its catalog card: what it is for, short enough never to be cut. */
export const BLURBS: Record<string, string> = {
	button: "Pill buttons, from the one ink action to quiet options.",
	"icon-button": "A round button with one glyph and a tooltip name.",
	ghost: "A word that acts as a button, with no fill until hover.",
	card: "A raised sheet of paper for one standalone object.",
	text: "Text in one of the library's type styles, as any element.",
	icon: "Size and stroke helpers so your icons match the library.",
	kbd: "Key caps for keyboard shortcuts.",
	badge: "Small pill labels with an optional dot or count.",
	"status-badge": "A state pill for something that runs on its own.",
	"status-chip": "Mono chips that mark what a tool call did.",
	"live-dot": "A breathing blue dot that says it is still running.",
	"empty-state": "An invitation to act where there is nothing yet.",
	input: "A single-line text field, sunken into the page.",
	textarea: "A multi-line text field that grows with its content.",
	label: "Form labels and a field wrapper with help and errors.",
	checkbox: "An on/off choice that applies when the form is sent.",
	radio: "One choice from a short list, under a legend.",
	switch: "An on/off toggle that takes effect at once.",
	slider: "One continuous amount, with no tick marks.",
	select: "A field that opens a searchable floating list.",
	segmented: "A few short options on a sunken track.",
	dropdown: "A menu of actions that opens from a button.",
	"password-input": "A passphrase field with show/hide and a strength meter.",
	dialog: "A modal dialog, with a confirm variant for deletes.",
	popover: "A floating card anchored to a trigger.",
	tooltip: "A one-line hint on hover or keyboard focus.",
	toast: "Non-blocking notices that stack in a corner.",
	tabs: "Switches between panels at the same level.",
	progress: "Bars for agent work, rings for readings.",
	spin: "A small spinning ring for a button or chip that waits.",
	skeleton: "Placeholders shaped like the content to come.",
	message: "The thread layout: your bubbles, the agent's full-width replies.",
	bubble: "One message as a sunken bubble on either side.",
	markdown: "Renders a message's markdown as React elements.",
	"code-block": "Monospace code with a language label and copy.",
	"payload-block": "What a tool was called with or gave back.",
	"tool-group": "A run of tool calls under one counting header.",
	"sub-thread": "A sub agent's run as one pill in the thread.",
	"reasoning-fold": "A pill that folds away the agent's thinking.",
	"action-bar": "Quiet actions under a reply: copy, regenerate.",
	"interaction-card": "Cards for when the agent waits on the person.",
	"handoff-receipt": "A divider that marks a session handoff.",
	composer: "The prompt bar at the bottom of a conversation.",
	"attach-button": "A round + button that opens the file picker.",
	"pending-files": "Chips for files picked for the next message.",
	attachment: "The files a sent message carries, as tiles.",
	"voice-indicator": "Shows if the voice agent listens, thinks or speaks.",
	"call-bar": "The bar a composer turns into during a call.",
	"data-table": "A table with sorting, filtering and inline edits.",
	table: "Low-level parts for a mono ledger.",
	list: "Rows of things you open, with no frame.",
	"file-row": "One row of a file browser.",
	dropzone: "A drop area for uploads, with a button too.",
	"diff-viewer": "A unified diff of one file, changed words marked.",
	"recovery-key": "Shows a vault's recovery key once, blurred until revealed.",
	group: "A grouped settings list in one sunken region.",
	"settings-rows": "Settings rows with a name, help and a control.",
	page: "The heading and surfaces around a settings page.",
}
