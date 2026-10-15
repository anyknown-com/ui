// The agent finished a task. The thread is on one sheet, what it changed is on a second sheet
// beside it, and the person reads the diffs before deciding to commit.
import {
	ActionBar,
	AssistantMessage,
	Button,
	DiffViewer,
	HandoffReceipt,
	StatusBadge,
	TextPart,
	Thread,
	ToolCard,
	ToolOutput,
	UserMessage,
	toast,
	type DiffFile,
} from "@anyknown/ui"
import { breakpoint, color, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet } from "./Sheet"

export const meta: SceneMeta = {
	id: "review-changes",
	title: "Review the changes",
	moment:
		"The agent says it is done. Before anything ships, you read what it changed, file by file, and decide what happens next.",
	decisions: [
		"The diff uses red and green only for removed and added lines; color means change and nothing else.",
		"The changes sit on their own sheet next to the thread, so you read the code and the agent's account of it side by side.",
		"Unchanged lines fold away, and a fold opens in place when you need the context.",
		"The action bar keeps its row reserved, so the thread never jumps when you hover a reply.",
		"The handoff receipt marks where the work moved to a fresh context, and opens to show what was kept.",
	],
	uses: ["diff-viewer", "button", "message", "action-bar", "handoff-receipt", "tool-card", "status-badge"],
}

const MOBILE = breakpoint.phone
const STACKED = breakpoint.tablet

const REQUEST =
	"Rate-limit share link creation to 10 a minute per person, and show a clear message in the app when someone hits it."

const EARLY_REPLY =
	"Starting on the API side: a small limiter in lib/, keyed by user and route, stored in KV with a one-minute window."

const REPLY =
	"Done. Creating a share link now allows 10 requests a minute per person; the 11th gets a 429 with Retry-After. The share dialog reads that and says how long to wait instead of “Something went wrong”. Three files changed, and the API tests pass, including two new ones for the limit."

const DIALOG_BEFORE = `export function ShareDialog({ file, onClose }: ShareDialogProps) {
	const [expiresIn, setExpiresIn] = useState<Expiry>("7d")
	const [link, setLink] = useState<ShareLink | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)

	async function create() {
		setBusy(true)
		setError(null)
		const res = await api.post("/share", { fileId: file.id, expiresIn })
		setBusy(false)
		if (!res.ok) {
			setError("Something went wrong. Try again.")
			return
		}
		setLink(await res.json())
	}

	return (
		<Dialog title={\`Share \${file.name}\`} onClose={onClose}>
			<ExpiryPicker value={expiresIn} onChange={setExpiresIn} />
			{error && <Callout tone="danger">{error}</Callout>}
			{link ? <CopyField value={link.url} /> : null}
			<Button onClick={create} loading={busy}>Create link</Button>
		</Dialog>
	)
}
`

const DIALOG_AFTER = `export function ShareDialog({ file, onClose }: ShareDialogProps) {
	const [expiresIn, setExpiresIn] = useState<Expiry>("7d")
	const [link, setLink] = useState<ShareLink | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [busy, setBusy] = useState(false)

	async function create() {
		setBusy(true)
		setError(null)
		const res = await api.post("/share", { fileId: file.id, expiresIn })
		setBusy(false)
		if (res.status === 429) {
			const { retryAfter } = await res.json<{ retryAfter: number }>()
			setError(\`You made 10 links in the last minute. Try again in \${retryAfter} s.\`)
			return
		}
		if (!res.ok) {
			setError("The link was not created. Check your connection and try again.")
			return
		}
		setLink(await res.json())
	}

	return (
		<Dialog title={\`Share \${file.name}\`} onClose={onClose}>
			<ExpiryPicker value={expiresIn} onChange={setExpiresIn} />
			{error && <Callout tone="danger">{error}</Callout>}
			{link ? <CopyField value={link.url} /> : null}
			<Button onClick={create} loading={busy}>Create link</Button>
		</Dialog>
	)
}
`

const ROUTE_BEFORE = `import { Hono } from "hono"
import { requireUser } from "../lib/auth"
import { createShareLink, revokeShareLink } from "../lib/share"

export const share = new Hono<Env>()

share.use("*", requireUser)

share.post("/", async (c) => {
	const { fileId, expiresIn } = await c.req.json<ShareRequest>()
	const link = await createShareLink(c.env, c.get("userId"), fileId, expiresIn)
	return c.json(link, 201)
})

share.delete("/:id", async (c) => {
	await revokeShareLink(c.env, c.get("userId"), c.req.param("id"))
	return c.body(null, 204)
})
`

const ROUTE_AFTER = `import { Hono } from "hono"
import { requireUser } from "../lib/auth"
import { rateLimit } from "../lib/rate-limit"
import { createShareLink, revokeShareLink } from "../lib/share"

export const share = new Hono<Env>()

share.use("*", requireUser)

share.post("/", rateLimit({ limit: 10, windowMs: 60_000 }), async (c) => {
	const { fileId, expiresIn } = await c.req.json<ShareRequest>()
	const link = await createShareLink(c.env, c.get("userId"), fileId, expiresIn)
	return c.json(link, 201)
})

share.delete("/:id", async (c) => {
	await revokeShareLink(c.env, c.get("userId"), c.req.param("id"))
	return c.body(null, 204)
})
`

const LIMITER = `import type { Context, Next } from "hono"

/** Allows \`limit\` requests per user in each window; past that, answers 429 with Retry-After. */
export function rateLimit({ limit, windowMs }: { limit: number; windowMs: number }) {
	return async (c: Context<Env>, next: Next) => {
		const window = Math.floor(Date.now() / windowMs)
		const key = \`rl:\${c.req.routePath}:\${c.get("userId")}:\${window}\`
		const count = Number((await c.env.LIMITS.get(key)) ?? 0) + 1
		await c.env.LIMITS.put(key, String(count), { expirationTtl: Math.ceil(windowMs / 1000) + 1 })
		if (count > limit) {
			const retryAfter = Math.ceil((windowMs - (Date.now() % windowMs)) / 1000)
			c.header("Retry-After", String(retryAfter))
			return c.json({ error: "rate_limited", retryAfter }, 429)
		}
		await next()
	}
}
`

// The sources are written with tabs; the diff shows them two spaces wide.
const twoSpace = (source: string) => source.replaceAll("\t", "  ")

const FILES: DiffFile[] = [
	{
		path: "apps/web/src/share/ShareDialog.tsx",
		before: twoSpace(DIALOG_BEFORE),
		after: twoSpace(DIALOG_AFTER),
	},
	{ path: "apps/api/src/routes/share.ts", before: twoSpace(ROUTE_BEFORE), after: twoSpace(ROUTE_AFTER) },
	{ path: "apps/api/src/lib/rate-limit.ts", after: twoSpace(LIMITER) },
]

const recorded = () =>
	toast("This is a recorded run", { description: "Nothing is sent from ui.anyknown.com." })

const styles = stylex.create({
	layout: {
		display: "grid",
		gridTemplateColumns: { default: "minmax(0, 5fr) minmax(0, 6fr)", [STACKED]: "minmax(0, 1fr)" },
		gap: space.xs,
	},
	sheet: { height: { default: "40rem", [STACKED]: "34rem", [MOBILE]: "32rem" } },
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.sm,
		paddingBlock: space.sm,
		paddingInline: { default: space.lg, [MOBILE]: space.md },
		minHeight: "3.5rem",
		boxSizing: "border-box",
	},
	now: {
		minWidth: 0,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
		fontSize: type.t2,
		color: color.textMuted,
	},
	title: {
		margin: 0,
		minWidth: 0,
		fontFamily: font.display,
		fontSize: type.t3,
		fontWeight: 600,
		color: color.text,
	},
	count: { fontSize: type.t2, fontWeight: 400, color: color.textMuted },
	scroll: {
		flexGrow: 1,
		minHeight: 0,
		overflowY: "auto",
		overscrollBehavior: "contain",
		paddingBlock: space.xs,
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	diffs: {
		flexGrow: 1,
		minHeight: 0,
		overflowY: "auto",
		overscrollBehavior: "contain",
		display: "grid",
		alignContent: "start",
		// Each diff keeps its full height; the sheet scrolls, not the diffs.
		gridAutoRows: "max-content",
		gridTemplateColumns: "minmax(0, 1fr)",
		gap: space.sm,
		paddingBlockEnd: space.md,
		paddingInline: { default: space.md, [MOBILE]: space.xs },
	},
	column: { maxWidth: "44rem", marginInline: "auto" },
	footer: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "flex-end",
		gap: space.xs,
		paddingBlock: space.sm,
		paddingInline: { default: space.md, [MOBILE]: space.sm },
		backgroundColor: color.surface,
	},
	footerNote: {
		marginInlineEnd: "auto",
		fontSize: type.t2,
		color: color.textMuted,
		minWidth: 0,
	},
	buttons: { display: "flex", gap: space.xs },
	mono: { fontFamily: font.mono },
})

/** The second sheet: every file the agent changed, and the one decision about them. */
function Changes({
	compact,
	committed,
	onCommit,
}: {
	compact?: boolean
	committed: boolean
	onCommit: () => void
}) {
	return (
		<Sheet fill={compact} sx={!compact && styles.sheet}>
			<div {...stylex.props(styles.header)}>
				<h2 {...stylex.props(styles.title)}>
					Changes <span {...stylex.props(styles.count)}>· {FILES.length} files</span>
				</h2>
			</div>
			<div {...stylex.props(styles.diffs)}>
				{FILES.map((file, index) =>
					index === 0 ? (
						<Part key={file.path} name="diff-viewer">
							<DiffViewer file={file} collapseContext={2} />
						</Part>
					) : (
						<DiffViewer key={file.path} file={file} collapseContext={2} />
					),
				)}
			</div>
			{!compact && (
				<div {...stylex.props(styles.footer)}>
					{committed ? (
						<span {...stylex.props(styles.footerNote)}>
							Committed as <span {...stylex.props(styles.mono)}>a3f9c21</span> on main
						</span>
					) : (
						<>
							<span {...stylex.props(styles.footerNote)}>Not committed yet</span>
							<Part name="button">
								<div {...stylex.props(styles.buttons)}>
									<Button variant="secondary" size="sm" onClick={recorded}>
										Discard
									</Button>
									<Button size="sm" onClick={onCommit}>
										Commit {FILES.length} files
									</Button>
								</div>
							</Part>
						</>
					)}
				</div>
			)}
		</Sheet>
	)
}

export function Scene({ compact }: SceneProps) {
	const [committed, setCommitted] = useState(false)
	const [handoffOpen, setHandoffOpen] = useState(false)

	function commit() {
		setCommitted(true)
		toast("Committed 3 files", { description: "feat(share): rate-limit share link creation" })
	}

	// The tile shows only the diffs: that is the moment.
	if (compact) return <Changes compact committed={false} onCommit={commit} />

	return (
		<div {...stylex.props(styles.layout)}>
			<Sheet sx={styles.sheet}>
				<div {...stylex.props(styles.header)}>
					<span {...stylex.props(styles.now)}>
						{committed ? "Committed to main" : "Finished in 2 min 14 s · waiting for your review"}
					</span>
					<Part name="status-badge" inline>
						<StatusBadge tone="plain">Done</StatusBadge>
					</Part>
				</div>
				<div {...stylex.props(styles.scroll)}>
					<div {...stylex.props(styles.column)}>
						<Part name="message">
							<Thread>
								<UserMessage>{REQUEST}</UserMessage>
								<AssistantMessage>
									<TextPart>{EARLY_REPLY}</TextPart>
								</AssistantMessage>
								<Part name="handoff-receipt">
									<HandoffReceipt
										at="14:32"
										ctxPercent={50}
										memory={{
											count: 3,
											items: ["Prefers pnpm", "API runs on Cloudflare Workers", "Errors say how to fix"],
										}}
										ledgerCount={38}
										handoffSummary="The limiter and its two tests are written and pass. Next: wire it into POST /share and handle the 429 in ShareDialog."
										open={handoffOpen}
										onOpenChange={setHandoffOpen}
									/>
								</Part>
								<AssistantMessage>
									<Part name="tool-card">
										<ToolCard
											tool="shell"
											state="completed"
											subtitle="pnpm test --filter api"
											durationMs={3800}
											defaultOpen={false}
										>
											<ToolOutput
												text={"Test Files  12 passed (12)\n     Tests  87 passed (87)\n  Duration  3.71s"}
											/>
										</ToolCard>
									</Part>
									<TextPart>{REPLY}</TextPart>
									<Part name="action-bar">
										<ActionBar>
											<ActionBar.Copy />
											<ActionBar.Regenerate onRegenerate={recorded} />
										</ActionBar>
									</Part>
								</AssistantMessage>
							</Thread>
						</Part>
					</div>
				</div>
			</Sheet>
			<Changes committed={committed} onCommit={commit} />
		</div>
	)
}
