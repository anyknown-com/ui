// The reference scene: one recorded run of the agent fixing a bug, replayed on a 100ms clock.
// Every part of the screen is derived from the clock `t`, so the run is a pure function of time.
import {
	ActionBar,
	AssistantMessage,
	Composer,
	LiveDot,
	ReasoningFold,
	StatusBadge,
	SubagentLine,
	SubagentSummary,
	SubagentText,
	SubagentThread,
	TextPart,
	Thread,
	ToolCard,
	ToolInput,
	ToolOutput,
	UserMessage,
	toast,
} from "@anyknown/ui"
import { breakpoint, color, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useCallback, useRef, useState } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet } from "./Sheet"

export const meta: SceneMeta = {
	id: "agent-working",
	title: "Agent at work",
	moment:
		"You asked the agent to fix a bug and went back to your own work. It reads code, runs tools and sends a helper off to dig, and a glance tells you how far it got.",
	decisions: [
		"Blue marks only what is running right now: the live tool card, the dot and the badge. A finished card goes back to gray.",
		"Reasoning streams open, then folds itself a second after it ends, so thinking never pushes the answer down.",
		"A subagent runs inside its parent's tool card, so you follow one thread, not two.",
		"The agent's reply runs full width with no bubble; only your own messages are bubbles.",
		"The composer stays usable the whole time; an agent at work never locks you out.",
	],
	uses: ["message", "reasoning-fold", "tool-card", "live-dot", "status-badge", "action-bar", "composer"],
}

const MOBILE = breakpoint.phone

const REQUEST = "The desktop never shows when the runtime retries after a 429. Find out why and fix it."

const REASONING =
	"The desktop only hears about retries through the SSE stream. Either the runtime never emits a retry event, or the contract drops it before the reducer sees it. Search for the event name first, then read the retry loop."

const SUBAGENT_TASK =
	"Follow one 429 from withRetry in turn.ts to the desktop reducer and report where the event is lost."

const REPLY =
	"Found it. The retry loop in turn.ts only logged each attempt, and the contract had no session.retrying type, so nothing reached the stream. I added the type to the contract and emit it from withRetry with the attempt and the delay. The desktop reducer already handled it, so the footer now shows “Retrying (2 of 3)” while it waits. Runtime tests pass."

// The clock, in 100ms ticks.
const T = {
	reasoning: 6,
	reasoningEnd: 26,
	search: 28,
	read: 40,
	subagent: 47,
	subagentEnd: 95,
	edit: 97,
	shell: 110,
	reply: 134,
}
const REPLY_PER_TICK = 6
const END = T.reply + Math.ceil(REPLY.length / REPLY_PER_TICK)
const PAUSE = { full: 90, compact: 50 }

const SUBAGENT_STEPS = [
	{
		at: T.subagent,
		now: "Reading packages/runtime/src/retry.ts",
		text: "Starting where withRetry is called…",
	},
	{
		at: T.subagent + 16,
		now: "Searching for session.retrying",
		text: "withRetry takes an onRetry callback; turn.ts passes one that only logs.",
	},
	{
		at: T.subagent + 32,
		now: "Checking EVENTS in the contract",
		text: "The contract's EVENTS has no session.retrying type, so the stream would drop it anyway.",
	},
]

type Phase = "queued" | "running" | "done"
const phase = (t: number, start: number, end: number): Phase =>
	t < start ? "queued" : t < end ? "running" : "done"
const toolState = (p: Phase) => (p === "running" ? "running" : "completed")
const streamed = (text: string, t: number, start: number, perTick: number) =>
	text.slice(0, Math.max(0, (t - start) * perTick))

/** What the header says the agent is doing. */
function nowLine(t: number) {
	if (t < T.reasoning) return "Reading your message"
	if (t < T.search) return "Thinking"
	if (t < T.read) return "Searching for session.retrying"
	if (t < T.subagent) return "Reading packages/runtime/src/turn.ts"
	if (t < T.subagentEnd) return "A subagent is tracing retry events"
	if (t < T.shell) return "Editing packages/runtime/src/turn.ts"
	if (t < T.reply) return "Running the runtime tests"
	return "Writing the reply"
}

const styles = stylex.create({
	sheet: { height: { default: "40rem", [MOBILE]: "36rem" } },
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
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		minWidth: 0,
		fontSize: type.t2,
		color: color.textMuted,
	},
	nowText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	scroll: {
		flexGrow: 1,
		minHeight: 0,
		overflowY: "auto",
		overscrollBehavior: "contain",
		paddingBlock: space.xs,
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	column: { maxWidth: "44rem", marginInline: "auto" },
	dock: {
		paddingBlock: space.sm,
		paddingInline: { default: space.lg, [MOBILE]: space.sm },
	},
})

export function Scene({ compact }: SceneProps) {
	const [t, setT] = useState(0)
	const [model, setModel] = useState("Opus 5")
	const last = END + (compact ? PAUSE.compact : PAUSE.full)
	const clock = useCallback(
		(node: HTMLElement | null) => {
			if (node == null) return
			const id = setInterval(() => setT((now) => (now >= last ? 0 : now + 1)), 100)
			return () => clearInterval(id)
		},
		[last],
	)

	// Keep the newest line in view, unless the person scrolled up to read.
	const pinned = useRef(true)
	const followBottom = (node: HTMLElement | null) => {
		const box = node?.parentElement
		if (box != null && pinned.current) box.scrollTop = box.scrollHeight
	}

	const working = t < END
	const reasoning = phase(t, T.reasoning, T.reasoningEnd)
	const search = phase(t, T.search, T.read)
	const read = phase(t, T.read, T.subagent)
	const subagent = phase(t, T.subagent, T.subagentEnd)
	const edit = phase(t, T.edit, T.shell)
	const shell = phase(t, T.shell, T.reply)
	const steps = SUBAGENT_STEPS.filter((step) => t >= step.at)
	const reply = streamed(REPLY, t, T.reply, REPLY_PER_TICK)

	return (
		<Sheet fill={compact} sx={!compact && styles.sheet}>
			<div ref={clock} {...stylex.props(styles.header)}>
				<span {...stylex.props(styles.now)}>
					{working ? (
						<Part name="live-dot" inline align="start">
							<LiveDot />
						</Part>
					) : null}
					<span {...stylex.props(styles.nowText)}>
						{working ? nowLine(t) : `Finished in ${Math.round(END / 10)} s`}
					</span>
				</span>
				<Part name="status-badge" inline>
					<StatusBadge tone={working ? "live" : "plain"}>{working ? "Agent working" : "Done"}</StatusBadge>
				</Part>
			</div>
			<div
				onScroll={(event) => {
					const box = event.currentTarget
					pinned.current = box.scrollHeight - box.scrollTop - box.clientHeight < 48
				}}
				{...stylex.props(styles.scroll)}
			>
				<div {...stylex.props(styles.column)}>
					<Part name="message">
						<Thread>
							<UserMessage>{REQUEST}</UserMessage>
							{t < T.reasoning ? (
								<AssistantMessage pending />
							) : (
								<AssistantMessage streaming={working}>
									<Part name="reasoning-fold">
										<ReasoningFold
											streaming={reasoning === "running"}
											durationSec={reasoning === "done" ? 2 : undefined}
										>
											{streamed(REASONING, t, T.reasoning, 12)}
										</ReasoningFold>
									</Part>
									{search !== "queued" && (
										<Part name="tool-card">
											<ToolCard
												tool="search"
												state={toolState(search)}
												subtitle="session.retrying"
												durationMs={search === "done" ? 1100 : undefined}
											>
												<ToolInput json={{ pattern: "session.retrying", path: "packages" }} />
												{search === "done" && (
													<ToolOutput
														text={
															'apps/desktop/src/thread/reducer.ts:88  case "session.retrying":\npackages/runtime/src/turn.ts:41  // TODO: surface retries'
														}
													/>
												)}
											</ToolCard>
										</Part>
									)}
									{read !== "queued" && (
										<ToolCard
											tool="read"
											state={toolState(read)}
											subtitle="packages/runtime/src/turn.ts"
											durationMs={read === "done" ? 300 : undefined}
										>
											<ToolInput json={{ filePath: "packages/runtime/src/turn.ts" }} />
										</ToolCard>
									)}
									{subagent !== "queued" && (
										<ToolCard
											tool="subagent"
											state={toolState(subagent)}
											subtitle="Trace retry events end to end"
											durationLabel={subagent === "done" ? "00:48" : undefined}
											secondLine={
												subagent === "running" ? (
													<SubagentLine model="sonnet-5" now={steps.at(-1)?.now} />
												) : (
													<SubagentLine model="sonnet-5" toolCount={6} />
												)
											}
											footer={
												subagent === "done" ? (
													<SubagentSummary>
														withRetry only logs. It never emits, and the contract's EVENTS has no
														session.retrying type, so the reducer's case for it never runs.
													</SubagentSummary>
												) : undefined
											}
										>
											<SubagentThread task={SUBAGENT_TASK}>
												{steps.map((step) => (
													<SubagentText key={step.at}>{step.text}</SubagentText>
												))}
											</SubagentThread>
										</ToolCard>
									)}
									{edit !== "queued" && (
										<ToolCard
											tool="edit"
											state={toolState(edit)}
											subtitle="packages/runtime/src/turn.ts"
											durationMs={edit === "done" ? 400 : undefined}
										>
											<ToolInput
												json={{
													filePath: "packages/runtime/src/turn.ts",
													oldString: "onRetry: (e) => log.warn('retrying', e)",
													newString:
														"onRetry: (e) => bus.emit('session.retrying', { sessionID, attempt: e.attempt, delayMs: e.delayMs })",
												}}
											/>
										</ToolCard>
									)}
									{shell !== "queued" && (
										<ToolCard
											tool="shell"
											state={toolState(shell)}
											subtitle="pnpm test --filter runtime"
											durationMs={shell === "done" ? 4200 : undefined}
										>
											{shell === "done" && (
												<ToolOutput
													text={"Test Files  9 passed (9)\n     Tests  61 passed (61)\n  Duration  4.18s"}
												/>
											)}
										</ToolCard>
									)}
									{reply !== "" && <TextPart>{reply}</TextPart>}
									{!working && (
										<Part name="action-bar">
											<ActionBar>
												<ActionBar.Copy />
												<ActionBar.Regenerate onRegenerate={() => setT(0)} />
											</ActionBar>
										</Part>
									)}
								</AssistantMessage>
							)}
						</Thread>
					</Part>
				</div>
				<div ref={followBottom} />
			</div>
			<div {...stylex.props(styles.dock)}>
				<div {...stylex.props(styles.column)}>
					<Part name="composer">
						<Composer
							placeholder="Message the agent"
							models={["Opus 5", "Sonnet 5", "Fable 5"]}
							model={model}
							onModelChange={setModel}
							onSubmit={() =>
								toast("This is a recorded run", {
									description: "Nothing is sent from ui.anyknown.com.",
								})
							}
						/>
					</Part>
				</div>
			</div>
		</Sheet>
	)
}
