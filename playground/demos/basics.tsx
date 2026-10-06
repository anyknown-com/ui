import {
	Badge,
	Button,
	Card,
	Chip,
	ConfirmDialog,
	Dialog,
	DialogActions,
	DialogClose,
	DialogContent,
	DialogTrigger,
	EmptyState,
	Ghost,
	GhostLink,
	IconButton,
	Kbd,
	KbdGroup,
	Pill,
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
	Progress,
	ProgressBall,
	ProgressRing,
	Segmented,
	Select,
	SelectItem,
	Skeleton,
	SkeletonGroup,
	Spin,
	Spinner,
	StatusChip,
	Tabs,
	TabsList,
	TabsPanel,
	TabsTab,
	Text,
	ThreadSkeleton,
	Tooltip,
	icon,
	useDialog,
	useToast,
	ICON_STROKE,
} from "@anyknown/ui"
import * as stylex from "@stylexjs/stylex"
import { color, radius, space } from "@anyknown/ui/tokens.stylex"
import { type ReactNode, useEffect, useState } from "react"
import { type DemoEntry, Demo, Label, Row } from "../shell"

const styles = stylex.create({
	pane: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		backgroundColor: color.surface,
		padding: space.md,
		overflowY: "auto",
		height: "11rem",
		scrollbarGutter: "stable",
	},
	wide: { width: "52rem" },
	both: {
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: color.border,
		borderRadius: radius.lg,
		backgroundColor: color.surface,
		overflow: "auto",
		height: "9rem",
	},
	ringRow: { display: "flex", gap: space.lg, alignItems: "center" },
	wideDialog: { width: "min(44rem, calc(100vw - 2rem))", height: "calc(100vh - 2rem)" },
	stack: { display: "grid", gap: space.xs },
	cards: {
		display: "grid",
		gap: space.md,
		gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 16rem), 1fr))",
	},
	iconCell: { display: "grid", justifyItems: "center", gap: space.xxs },
})

function MemoryIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={ICON_STROKE}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M11 12a1.5 1.5 0 1 0 1.5-1.5A4 4 0 1 0 16.5 15 6.5 6.5 0 1 1 10 5.6" />
			<path d="M10 5.6C7.5 5 5.5 5.8 4 7.5" />
			<path d="M16.5 15c1.8.3 3.3 1.5 4.5 3.5" />
		</svg>
	)
}

/** A 24-unit glyph drawn the package's way: stroke ICON_STROKE, round caps, currentColor. */
function Glyph({ size = "md", children }: { size?: keyof typeof icon; children: ReactNode }) {
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
			{children}
		</svg>
	)
}

const SEARCH = (
	<>
		<circle cx="11" cy="11" r="7" />
		<path d="m20 20-3.5-3.5" />
	</>
)
const BELL = (
	<>
		<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
		<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
	</>
)
const PLUS = <path d="M5 12h14M12 5v14" />
const SETTINGS = (
	<>
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
	</>
)

function wait(ms: number, ok: boolean) {
	return new Promise<void>((resolve, reject) =>
		setTimeout(() => (ok ? resolve() : reject(new Error("the vault is offline"))), ms),
	)
}

function useDemoProgress() {
	const [percent, setPercent] = useState(0)
	useEffect(() => {
		const id = setInterval(() => setPercent((p) => (p >= 100 ? 0 : p + 2)), 90)
		return () => clearInterval(id)
	}, [])
	return percent
}

function StackedSettings() {
	const { dialog } = useDialog()
	const { toast } = useToast()
	return (
		<DialogActions>
			<Button
				variant="dangerGhost"
				onClick={async () => {
					const ok = await dialog.confirm({
						title: "Delete this workspace?",
						description: "This sits on top of settings; Esc closes only this layer.",
						confirmLabel: "Delete workspace",
						tone: "danger",
					})
					toast(ok ? "Workspace deleted" : "Workspace kept")
				}}
			>
				Delete workspace…
			</Button>
			<DialogClose>
				<Button variant="ghost">Close</Button>
			</DialogClose>
		</DialogActions>
	)
}

function LoadingButton() {
	const [loading, setLoading] = useState(false)
	return (
		<Button
			loading={loading}
			onClick={() => {
				setLoading(true)
				setTimeout(() => setLoading(false), 1500)
			}}
		>
			Save handoff note
		</Button>
	)
}

function ButtonDemo() {
	return (
		<Demo
			id="button"
			title="button"
			note="A pill, 40px tall by default. The primary action is solid ink, one per page; secondary is a sunken grey, ghost only shows a fill on hover. Pressing scales it to 0.98, except under reduced motion. loading swaps the label for a spinner and sets aria-busy; the button keeps focus but ignores clicks and form submits until it is done."
		>
			<Row>
				<Button>New thread</Button>
				<Button variant="secondary">Rename</Button>
				<Button variant="ghost">Cancel</Button>
				<Button variant="dangerGhost">Decline</Button>
				<Button variant="danger">Delete memory</Button>
			</Row>
			<Row>
				<Button size="sm">New thread</Button>
				<Button size="sm" variant="secondary">
					Rename
				</Button>
				<Button size="sm" variant="ghost">
					Cancel
				</Button>
				<Button size="sm" variant="danger">
					Delete memory
				</Button>
			</Row>
			<Row>
				<Button disabled>Disabled</Button>
				<Button variant="secondary" disabled>
					Disabled
				</Button>
				<Button>
					<MemoryIcon />
					With icon
				</Button>
				<Button variant="secondary">A very long button label, to check it never breaks the pill</Button>
			</Row>
			<Row>
				<LoadingButton />
				<Label>Click it: it loads for 1.5 seconds</Label>
			</Row>
		</Demo>
	)
}

function GhostDemo() {
	return (
		<Demo
			id="ghost"
			title="ghost"
			note="A word that is a button: 28px, muted until the pointer is on it. danger is for warnings. GhostLink is the same word as a link."
		>
			<Row>
				<Ghost>Edit</Ghost>
				<Ghost>Copy link</Ghost>
				<Ghost danger>Revoke key</Ghost>
				<Ghost disabled>Archived</Ghost>
			</Row>
			<Row>
				<GhostLink href="#/demo/ghost">View the handoff log</GhostLink>
				<GhostLink href="https://anyknown.com" external>
					Open anyknown.com
				</GhostLink>
			</Row>
		</Demo>
	)
}

function IconButtonDemo() {
	return (
		<Demo
			id="icon-button"
			title="icon-button"
			note="A circle around one glyph. Nothing at rest, an ink wash on hover, the name in a tooltip and as the accessible name. A badge in the corner when it counts something."
		>
			<Row>
				<IconButton label="Search threads">
					<Glyph>{SEARCH}</Glyph>
				</IconButton>
				<IconButton label="Notifications" badge={3}>
					<Glyph>{BELL}</Glyph>
				</IconButton>
				<IconButton label="Settings" current>
					<Glyph>{SETTINGS}</Glyph>
				</IconButton>
				<IconButton label="New thread" open>
					<Glyph>{PLUS}</Glyph>
				</IconButton>
			</Row>
			<Row>
				<IconButton label="Search threads (md)" side="bottom">
					<Glyph>{SEARCH}</Glyph>
				</IconButton>
				<IconButton label="Search threads (sm)" size="sm" side="bottom">
					<Glyph size="sm">{SEARCH}</Glyph>
				</IconButton>
				<IconButton label="Search threads (xs)" size="xs" side="bottom">
					<Glyph size="xs">{SEARCH}</Glyph>
				</IconButton>
			</Row>
			<Label>current marks the page that is open; open is pressed while its popover shows (no tooltip)</Label>
		</Demo>
	)
}

const SCOPES = [
	{ value: "personal", label: "Personal" },
	{ value: "workspace", label: "Workspace" },
	{ value: "all", label: "All" },
] as const

function SegmentedDemo() {
	const [scope, setScope] = useState<(typeof SCOPES)[number]["value"]>("workspace")

	return (
		<Demo
			id="segmented"
			title="segmented"
			note="A few words on a sunken track; the chosen one is a sheet of paper raised on it. It is a radio group: Tab lands on the chosen option, the arrow keys move the choice and wrap (mirrored right to left), Home and End go to either end, and disabled options are skipped."
		>
			<Segmented label="Memory scope" value={scope} onValueChange={setScope} options={[...SCOPES]} />
			<Label>Showing {scope} memories</Label>
			<Segmented
				label="Sync"
				defaultValue="hourly"
				options={[
					{ value: "live", label: "Live", disabled: true },
					{ value: "hourly", label: "Hourly" },
					{ value: "daily", label: "Daily" },
				]}
			/>
			<Label>Uncontrolled, with Live disabled</Label>
		</Demo>
	)
}

function DialogDemo() {
	const { toast } = useToast()
	const { dialog } = useDialog()

	return (
		<Demo
			id="dialog"
			title="dialog"
			note="Focus stays inside an open dialog, Escape closes only the top one, and focus returns to what opened it. The second row uses the imperative dialog store, which needs one <Dialogs /> mounted in the app; its promise settles as the dialog starts to fade out. labels renames the built-in Cancel button."
		>
			<Row>
				<Dialog>
					<DialogTrigger>
						<Button variant="secondary">Rename workspace</Button>
					</DialogTrigger>
					<DialogContent
						title="Rename workspace"
						description="The new name syncs to every member's sidebar and vault path."
					>
						<DialogActions>
							<DialogClose>
								<Button variant="ghost">Cancel</Button>
							</DialogClose>
							<DialogClose>
								<Button>Save</Button>
							</DialogClose>
						</DialogActions>
					</DialogContent>
				</Dialog>
				<Dialog>
					<DialogTrigger>
						<Button variant="secondary">Popup inside a dialog</Button>
					</DialogTrigger>
					<DialogContent
						title="New run"
						description="The select menu has to stack above the dialog, not under it."
					>
						<Select aria-label="Model" placeholder="Choose a model…">
							<SelectItem value="fable-5">Fable 5</SelectItem>
							<SelectItem value="opus-5">Opus 5</SelectItem>
						</Select>
						<DialogActions>
							<DialogClose>
								<Button variant="ghost">Cancel</Button>
							</DialogClose>
							<DialogClose>
								<Button>Start</Button>
							</DialogClose>
						</DialogActions>
					</DialogContent>
				</Dialog>
				<Dialog>
					<DialogTrigger>
						<Button variant="secondary">Custom size</Button>
					</DialogTrigger>
					<DialogContent
						title="Choose a model"
						description="sx overrides the popup's default width and maxHeight so a three-column picker fits."
						sx={styles.wideDialog}
					>
						<DialogActions>
							<DialogClose>
								<Button variant="ghost">Close</Button>
							</DialogClose>
						</DialogActions>
					</DialogContent>
				</Dialog>
				<ConfirmDialog
					trigger={<Button variant="secondary">Delete memory</Button>}
					title="Delete this memory?"
					description="“Deploys to Cloudflare” will be removed from the workspace. You can't undo this."
					danger
					confirmLabel="Delete memory"
					labels={{ cancel: "Keep it" }}
					onConfirm={() =>
						toast("Deleted “Deploys to Cloudflare”", { action: { label: "Undo", onClick: () => {} } })
					}
				/>
			</Row>
			<Row>
				<Button
					variant="secondary"
					onClick={async () => {
						const name = await dialog.open<string>(({ close }) => (
							<DialogContent
								title="Rename thread"
								description="The result of dialog.open resolves with the value passed to close."
							>
								<DialogActions>
									<DialogClose>
										<Button variant="ghost">Cancel</Button>
									</DialogClose>
									<Button onClick={() => close("Deploy notes")}>Rename to “Deploy notes”</Button>
								</DialogActions>
							</DialogContent>
						)).result
						toast(name == null ? "Name unchanged" : `Renamed to “${name}”`)
					}}
				>
					dialog.open
				</Button>
				<Button
					variant="secondary"
					onClick={async () => {
						const ok = await dialog.confirm({
							title: "Archive this thread?",
							description: "You can still find it in the sidebar.",
							confirmLabel: "Archive thread",
						})
						toast(ok ? "Thread archived" : "Not archived")
					}}
				>
					dialog.confirm
				</Button>
				<Button
					variant="secondary"
					onClick={() =>
						dialog.alert({
							title: "Workspace limit reached",
							description: "The free plan includes up to 3 workspaces.",
						})
					}
				>
					dialog.alert
				</Button>
				<Button
					variant="secondary"
					onClick={() =>
						dialog.open(() => (
							<DialogContent
								title="Workspace settings"
								description="Open a confirm from here to stack two layers."
							>
								<StackedSettings />
							</DialogContent>
						))
					}
				>
					Stacked
				</Button>
			</Row>
		</Demo>
	)
}

function ToastDemo() {
	const { toast } = useToast()

	return (
		<Demo
			id="toast"
			title="toast"
			note="The thin pill along the bottom is the countdown; hover, focus or switching tabs pauses it, and it is hidden under reduced motion. Danger toasts, toasts with an action and loading toasts wait to be dismissed. F8 moves focus to the toasts and Escape sends it back. The same key updates in place and counts repeats."
		>
			<Row>
				<Button variant="secondary" onClick={() => toast("Handoff summary copied")}>
					default
				</Button>
				<Button
					variant="secondary"
					onClick={() =>
						toast.success("Handoff complete", { description: "3 memories carried into the new thread" })
					}
				>
					success
				</Button>
				<Button
					variant="secondary"
					onClick={() => toast.danger("Can't reach the vault", { description: "Retrying shortly" })}
				>
					danger
				</Button>
				<Button
					variant="secondary"
					onClick={() => toast.warning("Context at 45%", { description: "A handoff starts at 50%" })}
				>
					warning
				</Button>
				<Button
					variant="secondary"
					onClick={() => toast.info("Opus 5 is now the default", { description: "Change it in settings" })}
				>
					info
				</Button>
				<Button
					variant="secondary"
					onClick={() => toast("Deleted “Prefers pnpm”", { action: { label: "Undo", onClick: () => {} } })}
				>
					with action
				</Button>
			</Row>
			<Row>
				<Button
					variant="secondary"
					onClick={() =>
						toast.promise(wait(1600, true), {
							loading: "Syncing the vault…",
							success: { title: "Vault synced", description: "12 memories up to date" },
							error: "Sync failed",
						})
					}
				>
					promise resolves
				</Button>
				<Button
					variant="secondary"
					onClick={() =>
						toast
							.promise(wait(1600, false), {
								loading: "Uploading 3 files…",
								success: "Uploaded",
								error: (error) => `Upload failed: ${(error as Error).message}`,
							})
							.catch(() => {})
					}
				>
					promise rejects
				</Button>
				<Button variant="secondary" onClick={() => toast("Link copied", { key: "copy-link" })}>
					same key (×N)
				</Button>
				<Button
					variant="secondary"
					onClick={() => {
						const id = toast("Handing off…", { timeout: 0 })
						setTimeout(
							() => toast.update(id, { title: "Handoff complete", type: "success", timeout: 4000 }),
							1200,
						)
					}}
				>
					update
				</Button>
				<Button
					variant="secondary"
					onClick={() =>
						toast.info("Handing off when this closes", {
							timeout: 3000,
							onAutoClose: () => toast.success("Handed off to a new session"),
						})
					}
				>
					onAutoClose
				</Button>
				<Button variant="secondary" onClick={() => toast.closeAll()}>
					closeAll
				</Button>
			</Row>
		</Demo>
	)
}

function TooltipDemo() {
	return (
		<Demo
			id="tooltip"
			title="tooltip"
			note="Hover a button for 400ms, or tab to it. Escape or moving away hides it. It describes the trigger; it is never the trigger's only name."
		>
			<Row>
				<Tooltip content="Pin this memory">
					<Button variant="secondary">top</Button>
				</Tooltip>
				<Tooltip content="Archive thread" side="bottom">
					<Button variant="secondary">bottom</Button>
				</Tooltip>
				<Tooltip content="Back to workspace" side="left">
					<Button variant="secondary">left</Button>
				</Tooltip>
				<Tooltip content="Open the vault" side="right">
					<Button variant="secondary">right</Button>
				</Tooltip>
				<Tooltip content="Write a handoff summary" shortcut={<KbdGroup keys={["⌘", "⇧", "H"]} />}>
					<Button variant="secondary">Start handoff</Button>
				</Tooltip>
			</Row>
		</Demo>
	)
}

function PopoverDemo() {
	return (
		<Demo
			id="popover"
			title="popover"
			note="A non-modal panel anchored to its trigger. Escape or a click outside closes it, and focus returns to the trigger."
		>
			<Row>
				<Popover>
					<PopoverTrigger>
						<Button variant="secondary">Deploys to Cloudflare</Button>
					</PopoverTrigger>
					<PopoverContent side="bottom" titled>
						<PopoverTitle>Deploys to Cloudflare</PopoverTitle>
						<PopoverDescription>
							Saved by a handoff on Aug 12, 2026. New threads pick this up automatically.
						</PopoverDescription>
						<Row>
							<Button size="sm" variant="secondary">
								Edit
							</Button>
							<Button size="sm" variant="ghost">
								Delete
							</Button>
						</Row>
					</PopoverContent>
				</Popover>
			</Row>
		</Demo>
	)
}

function TabsDemo() {
	return (
		<Demo id="tabs" title="tabs">
			<Tabs defaultValue="chat">
				<TabsList aria-label="Thread view">
					<TabsTab value="chat">Chat</TabsTab>
					<TabsTab value="memory">Memories</TabsTab>
					<TabsTab value="handoff">Handoffs</TabsTab>
					<TabsTab value="files" disabled>
						Files
					</TabsTab>
				</TabsList>
				<TabsPanel value="chat">This thread has 12 messages.</TabsPanel>
				<TabsPanel value="memory">This workspace has kept 7 memories so far.</TabsPanel>
				<TabsPanel value="handoff">Fable handed off to Opus yesterday at 18:00.</TabsPanel>
				<TabsPanel value="files">Not available yet.</TabsPanel>
			</Tabs>
			<Tabs defaultValue="today" variant="pills">
				<TabsList aria-label="Time range">
					<TabsTab value="today">Today</TabsTab>
					<TabsTab value="week">This week</TabsTab>
					<TabsTab value="all">All</TabsTab>
				</TabsList>
				<TabsPanel value="today">3 threads updated today.</TabsPanel>
				<TabsPanel value="week">18 threads this week.</TabsPanel>
				<TabsPanel value="all">142 threads in this workspace.</TabsPanel>
			</Tabs>
		</Demo>
	)
}

function BadgeDemo() {
	return (
		<Demo
			id="badge"
			title="badge"
			note="Badges are labels. A Chip is a badge you act on: onRemove adds a × button, and pressed or defaultPressed makes it a toggle button read out with aria-pressed."
		>
			<Row>
				<Badge>Draft</Badge>
				<Badge variant="accent">In progress</Badge>
				<Badge variant="success">Handed off</Badge>
				<Badge variant="danger">Interrupted</Badge>
				<Badge variant="outline">Read-only</Badge>
			</Row>
			<Row>
				<Badge variant="accent" count={3}>
					Waiting on you ·{" "}
				</Badge>
				<Badge count={12}>Read · </Badge>
				<Badge variant="mono">128k · 42%</Badge>
			</Row>
			<Row>
				<Badge dot="accent">Fable online</Badge>
				<Badge dot="faint">Handing off</Badge>
				<Badge dot="danger">Disconnected</Badge>
			</Row>
			<Row>
				<Chip onRemove={() => {}} removeLabel="Remove filter: workspace anyknown">
					Workspace: anyknown
				</Chip>
				<Chip onRemove={() => {}} removeLabel="Remove filter: this week">
					This week
				</Chip>
				<Chip defaultPressed>Pinned only</Chip>
				<Chip defaultPressed={false}>Show archived</Chip>
			</Row>
		</Demo>
	)
}

function StatusChipDemo() {
	return (
		<Demo
			id="status-chip"
			title="status-chip"
			note="StatusChip is a mono word in a 16px pill: r reads, w writes, d destroys, n is unmarked, a is running (signal blue, spinning), f failed, plain is the catalogue's auth chip. Pill is the 22px mono pill a fold's first line is made of."
		>
			<Row>
				<StatusChip variant="r">read</StatusChip>
				<StatusChip variant="w">write</StatusChip>
				<StatusChip variant="d">delete</StatusChip>
				<StatusChip variant="n">fetch</StatusChip>
				<StatusChip variant="a">running</StatusChip>
				<StatusChip variant="f">failed</StatusChip>
				<StatusChip variant="plain">OAuth</StatusChip>
			</Row>
			<Row>
				<Pill status="live">researching</Pill>
				<Pill status="paused">waiting on you</Pill>
				<Pill status="done">done</Pill>
				<Pill>sonnet-5</Pill>
				<Pill title>Find why retry events never reach the stream</Pill>
			</Row>
		</Demo>
	)
}

function KbdDemo() {
	return (
		<Demo id="kbd" title="kbd">
			<Row>
				<Kbd>⌘</Kbd>
				<Kbd>⇧</Kbd>
				<Kbd>Esc</Kbd>
				<Kbd>Enter</Kbd>
				<KbdGroup keys={["⌘", "N"]} />
				<KbdGroup keys={["⌘", "⇧", "P"]} />
				<KbdGroup keys={["g", "t"]} separator="then" />
			</Row>
			<Text variant="caption">
				Press <KbdGroup keys={["⌘", "⇧", "H"]} /> before a handoff to preview the memories it carries.
			</Text>
		</Demo>
	)
}

function CardDemo() {
	return (
		<Demo
			id="card"
			title="card"
			note="A card on the sheet: rest elevation, and its shadow ring is the only edge."
		>
			<div {...stylex.props(styles.cards)}>
				<Card>
					<div {...stylex.props(styles.stack)}>
						<Text variant="title">Pricing page</Text>
						<Text variant="caption">Handed off at 14:32 · 3 memories</Text>
						<Text>The three-tier table is drafted. Next up: the FAQ under it.</Text>
					</div>
				</Card>
				<Card>
					<div {...stylex.props(styles.stack)}>
						<Text variant="title">Store refactor</Text>
						<Text variant="caption">Handed off at 09:05 · hit the context limit</Text>
						<Text>Halfway through the store layer; 3 tests are still failing.</Text>
					</div>
				</Card>
			</div>
		</Demo>
	)
}

function TextDemo() {
	return (
		<Demo
			id="text"
			title="text"
			note="Five variants. display and title use the display face; body is 15px at line height 1.6; caption is muted; mono is for identifiers."
		>
			<Text variant="display">Your agent remembers</Text>
			<Text variant="title">Handoff summary</Text>
			<Text variant="body">
				When a session reaches the handoff threshold, the agent writes down what matters and passes the work
				to a fresh session, so the thread keeps going without losing its place.
			</Text>
			<Text variant="caption">Last handoff 14:32 · context 50%</Text>
			<Text variant="mono">thread_01JAH6Q3V8 · opus-5</Text>
			<Text as="span" variant="caption">
				as=&quot;span&quot; renders the same style on another element.
			</Text>
		</Demo>
	)
}

function SkeletonDemo() {
	return (
		<Demo id="skeleton" title="skeleton">
			<SkeletonGroup label="Loading">
				<Skeleton />
				<Skeleton width="92%" />
				<Skeleton width="61%" />
			</SkeletonGroup>
			<ThreadSkeleton messages={1} />
		</Demo>
	)
}

const TIDY_STAGES = ["Scanning the thread", "Picking what to keep", "Merging duplicates", "Saving memories"]

function ProgressDemo() {
	const percent = useDemoProgress()

	return (
		<Demo
			id="progress"
			title="progress"
			note="A sunken track with a signal-blue fill: the agent is working. Indeterminate, the fill sweeps across the track and the stage under it cycles. The ring and the ball are readings, not work, so they stay ink."
		>
			<Progress
				value={percent}
				aria-label="Syncing thread"
				valueText={`${percent}% · handing off 3 messages`}
			/>
			<Row>
				<Spinner size="sm" />
				<Spinner size="md" />
				<Spinner size="lg" />
			</Row>
			<Row>
				<ProgressBall value={percent} aria-label="Downloading model" valueText={`${percent}% downloaded`} />
				<Badge variant="mono">{`${percent}%`}</Badge>
			</Row>
			<Progress aria-label="Tidying memories" valueText="Tidying memories" stages={TIDY_STAGES} />
			<div {...stylex.props(styles.ringRow)}>
				<ProgressRing value={42} aria-label="Context used" valueText="42% of 128k context used" />
			</div>
		</Demo>
	)
}

function SpinDemo() {
	return (
		<Demo
			id="spin"
			title="spin"
			note="A 12px ring (9px when small): the one thing on a button that moves while it waits. It stops under reduced motion and is hidden from screen readers, so say what is happening in text."
		>
			<Row>
				<Spin />
				<Spin small />
				<Button variant="secondary" disabled>
					<Spin />
					Syncing…
				</Button>
				<Ghost disabled>
					<Spin small />
					Saving
				</Ghost>
			</Row>
		</Demo>
	)
}

function EmptyStateDemo() {
	return (
		<Demo id="empty-state" title="empty-state">
			<EmptyState
				icon={<MemoryIcon />}
				title="No memories yet"
				description="Start your first thread. What matters gets kept automatically and travels with every handoff."
				action={<Button>Start your first thread</Button>}
			/>
			<EmptyState
				title="No matching threads"
				description="Nothing matches “deploy process”. Try another keyword, or clear the filters and search again."
				action={<Button variant="ghost">Clear filters</Button>}
			/>
		</Demo>
	)
}

function IconDemo() {
	const sizes = ["xs", "sm", "md", "base", "lg"] as const

	return (
		<Demo
			id="icon"
			title="icon"
			note="Not a component: icon is a set of StyleX size styles (xs to lg) for any 24-unit SVG drawn with ICON_STROKE and currentColor."
		>
			<Row>
				{sizes.map((size) => (
					<span key={size} {...stylex.props(styles.iconCell)}>
						<Glyph size={size}>{BELL}</Glyph>
						<Label>{size}</Label>
					</span>
				))}
			</Row>
		</Demo>
	)
}

function ScrollbarDemo() {
	return (
		<Demo id="scrollbar" title="scrollbar" note="Global CSS, not a component: @anyknown/ui/scrollbar.css.">
			<div {...stylex.props(styles.pane)} tabIndex={0}>
				{Array.from({ length: 9 }, (_, i) => (
					<Text key={i} variant="caption">
						Handoff complete · 14:32 · ctx 50% → new session (row {i + 1})
					</Text>
				))}
			</div>
			<div {...stylex.props(styles.both)} tabIndex={0}>
				<Card {...stylex.props(styles.wide)}>
					<Text variant="caption">
						This box scrolls both ways. The corner at the bottom right is transparent, so no grey patch shows
						up.
					</Text>
				</Card>
			</div>
		</Demo>
	)
}

export const basicsDemos: DemoEntry[] = [
	{ id: "button", covers: ["button"], Component: ButtonDemo },
	{ id: "ghost", covers: ["ghost"], Component: GhostDemo },
	{ id: "icon-button", covers: ["icon-button"], Component: IconButtonDemo },
	{ id: "segmented", covers: ["segmented"], Component: SegmentedDemo },
	{ id: "dialog", covers: ["dialog"], Component: DialogDemo },
	{ id: "toast", covers: ["toast"], Component: ToastDemo },
	{ id: "tooltip", covers: ["tooltip"], Component: TooltipDemo },
	{ id: "popover", covers: ["popover"], Component: PopoverDemo },
	{ id: "tabs", covers: ["tabs"], Component: TabsDemo },
	{ id: "badge", covers: ["badge"], Component: BadgeDemo },
	{ id: "status-chip", covers: ["status-chip"], Component: StatusChipDemo },
	{ id: "kbd", covers: ["kbd"], Component: KbdDemo },
	{ id: "card", covers: ["card"], Component: CardDemo },
	{ id: "text", covers: ["text"], Component: TextDemo },
	{ id: "skeleton", covers: ["skeleton"], Component: SkeletonDemo },
	{ id: "progress", covers: ["progress"], Component: ProgressDemo },
	{ id: "spin", covers: ["spin"], Component: SpinDemo },
	{ id: "empty-state", covers: ["empty-state"], Component: EmptyStateDemo },
	{ id: "icon", covers: ["icon"], Component: IconDemo },
	{ id: "scrollbar", covers: [], Component: ScrollbarDemo },
]
