import {
	ActionBar,
	AssistantMessage,
	Button,
	CodeBlock,
	Composer,
	DecisionCard,
	HandoffReceipt,
	InlineCode,
	LiveDot,
	Markdown,
	PermissionCard,
	ReasoningFold,
	SubagentLine,
	SubagentSummary,
	SubagentText,
	SubagentThread,
	TextPart,
	Thread,
	ToolCard,
	ToolError,
	ToolInput,
	ToolOutput,
	UserMessage,
	VoiceIndicator,
	type VoiceState,
} from "@anyknown/ui"
import { useState } from "react"
import { type DemoEntry, Demo, Row } from "../shell"

const MARKDOWN = `## This is a message

The model writes **bold**, \`inline code\`, [links](https://anyknown.com), and whole blocks of code:

\`\`\`ts
export function pickModel(providers: ProviderConfig[]) {
	return providers[0]?.models[0] ?? null
}
\`\`\`

| provider | byok | platform |
| --- | :---: | ---: |
| anthropic | yes | yes |
| baseten | no | yes |

- [x] Tables scroll on their own instead of widening the message
- [ ] Lists and task lists
- Nested:
  1. First
  2. Second

> This is a quote.

Inline math $E = mc^2$, and a block of its own:

$$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$

Prices are not math: it went from $5 to $10.

交接時,agent 會把這條 thread 的重點寫成記憶,下一個 session 從這裡接著做,不用從頭再講一次。中文、English 與 \`code\` 混排時,行尾不會切在詞的中間。

<script>alert("This only ever shows up as text")</script>
`

const CODE = `export function useChildSession(callID: string) {
  return useThread((t) =>
    Object.values(t.sessions).find((s) => s.parentCallID === callID))
}`

const VOICE_STATES: VoiceState[] = ["idle", "listening", "thinking", "speaking"]

const SOURCES = [
	{ id: "f1", label: "packages/server/src/config-store.ts", kind: "file" },
	{ id: "l1", label: "Yesterday's handoff summary", kind: "ledger" },
	{ id: "m1", label: "Deploys to Cloudflare", kind: "memory" },
]

const PRICING = [
	{ value: "three", label: "Three tiers", description: "Free, Pro and Team.", recommended: true },
	{ value: "single", label: "One price", description: "Test willingness to pay first, split tiers later." },
	{ value: "none", label: "No pricing yet", description: "Collect a waitlist only." },
]

function MessageDemo() {
	return (
		<Demo
			id="message"
			title="message"
			note="Turns sit 24px apart, parts 8px. User messages are bubbles; assistant messages run full width. The second user message is Traditional Chinese to show CJK line breaking."
		>
			<Thread>
				<UserMessage>
					Can you look at the desktop thread reducer? For the same parentID, only the latest message should
					show.
				</UserMessage>
				<AssistantMessage>
					<TextPart>
						Sure. The rule lives in <InlineCode>selectVisibleMessages</InlineCode>: for the same parentID,
						only the newest assistant message stays.
					</TextPart>
					<TextPart>I've updated the selector and added reducer tests.</TextPart>
				</AssistantMessage>
				<UserMessage>
					接著把 session.retrying 折進 footer 狀態,重試中的時候讓使用者看得出來還在等。
				</UserMessage>
				<AssistantMessage streaming>
					<TextPart>
						Got it. I'll add the event type to the contract first, then fold session.retrying into that
						assistant message's footer in the reduc
					</TextPart>
				</AssistantMessage>
				<UserMessage>Check lint while you're at it.</UserMessage>
				<AssistantMessage pending />
			</Thread>
		</Demo>
	)
}

function ToolCardDemo() {
	return (
		<Demo id="tool-card" title="tool-card">
			<ToolCard tool="search" state="running" subtitle="parentCallID" durationMs={2400}>
				<ToolInput json={{ pattern: "parentCallID", path: "packages/contract" }} />
			</ToolCard>
			<ToolCard
				tool="read"
				state="completed"
				subtitle="apps/desktop/src/thread/tool-part.tsx"
				durationMs={300}
			>
				<ToolInput json={{ filePath: "apps/desktop/src/thread/tool-part.tsx" }} />
				<ToolOutput text={"export function ToolPart({ part }) {\n  …\n}"} />
			</ToolCard>
			<ToolCard tool="shell" state="completed" subtitle="pnpm test --filter desktop" durationMs={8100}>
				<ToolOutput text={"Test Files  12 passed (12)\n     Tests  84 passed (84)\n  Duration  6.92s"} />
			</ToolCard>
			<ToolCard
				tool="shell"
				state="error"
				subtitle="pnpm build"
				durationMs={12000}
				retry={{ attempt: 2, max: 3, delayMs: 3000 }}
			>
				<ToolError text={"Error: ENOMEM: not enough memory\n    at ChildProcess.spawn"} />
			</ToolCard>
			<ToolCard
				tool="subagent"
				state="running"
				subtitle="Investigate missing retry events"
				durationLabel="01:24"
				secondLine={<SubagentLine model="sonnet-5" now="Searching for session.retrying" />}
			>
				<SubagentThread task="Find out why the runtime's automatic 429/5xx retries never reach the SSE stream.">
					<SubagentText>Starting with where retry.ts emits events…</SubagentText>
				</SubagentThread>
			</ToolCard>
			<ToolCard
				tool="subagent"
				state="completed"
				subtitle="Investigate missing retry events"
				durationLabel="03:41"
				secondLine={<SubagentLine model="sonnet-5" toolCount={7} />}
				footer={
					<SubagentSummary>
						The gap is in turn.ts: the retry loop only logs and never emits an event, and the contract's
						EVENTS has no session.retrying type.
					</SubagentSummary>
				}
			>
				<SubagentThread task="Find out why the runtime's automatic 429/5xx retries never reach the SSE stream.">
					<SubagentText>
						Conclusion: the session.retrying event and its contract type are missing.
					</SubagentText>
				</SubagentThread>
			</ToolCard>
		</Demo>
	)
}

function ReasoningFoldDemo() {
	return (
		<Demo id="reasoning-fold" title="reasoning-fold">
			<ReasoningFold durationSec={12}>
				The user wants only the newest assistant message per parentID. The reducer already groups messages by
				sessionID, so this belongs in the selector layer.
			</ReasoningFold>
			<ReasoningFold streaming>
				First, check whether the contract has a session.retrying type… withRetry in turn.ts only takes an
				onRetry callback.
			</ReasoningFold>
		</Demo>
	)
}

function ActionBarDemo() {
	return (
		<Demo
			id="action-bar"
			title="action-bar"
			note="Its height is always reserved and hover only changes opacity, so the turn rhythm never jumps."
		>
			<Thread>
				<UserMessage>Are the reducer tests done?</UserMessage>
				<AssistantMessage>
					<TextPart>
						Done. All three cases for replacing older cards with the same parentID pass. This is a middle
						message, so it only has Copy.
					</TextPart>
					<ActionBar>
						<ActionBar.Copy />
					</ActionBar>
				</AssistantMessage>
				<UserMessage>Good. Now run the full retry chain.</UserMessage>
				<AssistantMessage>
					<TextPart>This is the last message, so it also gets Regenerate.</TextPart>
					<ActionBar>
						<ActionBar.Copy />
						<ActionBar.Regenerate onRegenerate={() => {}} />
					</ActionBar>
				</AssistantMessage>
			</Thread>
		</Demo>
	)
}

function MarkdownDemo() {
	return (
		<Demo
			id="markdown"
			title="markdown"
			note="Headings, code, tables, task lists, quotes and math. The last paragraph is Traditional Chinese to show CJK line breaking, and the script tag renders as text."
		>
			<AssistantMessage>
				<Markdown>{MARKDOWN}</Markdown>
			</AssistantMessage>
		</Demo>
	)
}

function CodeBlockDemo() {
	return (
		<Demo id="code-block" title="code-block">
			<CodeBlock lang="ts" code={CODE} />
			<CodeBlock
				lang="bash"
				code="pnpm --filter @anyknown/desktop exec playwright test thread-retry.spec.ts --project=electron --reporter=line"
			/>
			<CodeBlock
				lang="ts"
				code={'bus.emit("session.retrying", {\n  sessionID, messageID,\n  attempt, delayMs'}
				streaming
			/>
		</Demo>
	)
}

function InteractionCardDemo() {
	const [permission, setPermission] = useState<string | null>(null)
	const [decision, setDecision] = useState<string | null>(null)

	return (
		<Demo id="interaction-card" title="interaction-card">
			<PermissionCard
				verb="Run command"
				subject="pnpm publish --access public"
				policyHint="The agent only stops to ask when something costs money, publishes, or touches security. “Always allow” becomes a rule and still applies after a handoff."
				onReply={(reply) =>
					setPermission(
						reply === "once"
							? "Allowed once"
							: "always" in reply
								? "Always allowed (this command)"
								: "Denied",
					)
				}
				resolved={permission ? { text: permission, rejected: permission === "Denied" } : undefined}
			/>
			<DecisionCard
				blocking
				title="Which pricing section should the landing page ship first?"
				blocks={[
					{
						kind: "options",
						id: "variant",
						required: true,
						options: PRICING,
					},
					{ kind: "text", id: "note", label: "Notes", placeholder: "Anything to add? (optional)" },
				]}
				onAnswer={(answer) =>
					setDecision(
						`Decided · you chose “${PRICING.find((option) => option.value === answer.variant)?.label ?? ""}”`,
					)
				}
				resolved={decision ? { text: decision } : undefined}
			/>
		</Demo>
	)
}

function HandoffReceiptDemo() {
	return (
		<Demo
			id="handoff-receipt"
			title="handoff-receipt"
			note="A pill in the middle of a divider; open it to read the handoff summary."
		>
			<HandoffReceipt
				at="14:32"
				ctxPercent={50}
				memory={{ count: 3, items: ["Prefers pnpm", "Deploys to Cloudflare", "Desktop ships first"] }}
				ledgerCount={42}
				handoffSummary="The landing page's three-tier pricing table is written; the FAQ is next."
			/>
			<HandoffReceipt
				at="09:05"
				ctxPercent={80}
				reason="hard-limit"
				memory={{ count: 1 }}
				ledgerCount={117}
				handoffSummary="The large refactor has reached the store layer; 3 tests are failing."
			/>
		</Demo>
	)
}

function ComposerDemo() {
	const [model, setModel] = useState("Fable 5")
	const [sent, setSent] = useState<string | null>(null)

	return (
		<Demo id="composer" title="composer" note="Type @ for source suggestions. ⏎ sends, ⇧⏎ adds a new line.">
			<Composer
				placeholder="Message the agent. It only stops to ask when something costs money, publishes, or touches security."
				models={["Fable 5", "Opus 5", "Sonnet 5", "GPT-5.4"]}
				model={model}
				onModelChange={setModel}
				sources={async (query) =>
					SOURCES.filter((source) => source.label.toLowerCase().includes(query.toLowerCase()))
				}
				commands={[
					{ id: "handoff", label: "handoff", kind: "command" },
					{ id: "memory", label: "memory", kind: "command" },
				]}
				onMicToggle={() => {}}
				onSubmit={(value) => setSent(value)}
				hint={sent ? `Sent: ${sent}` : "⏎ to send · ⇧⏎ for a new line"}
			/>
		</Demo>
	)
}

function VoiceIndicatorDemo() {
	const [voice, setVoice] = useState<VoiceState>("listening")

	return (
		<Demo
			id="voice-indicator"
			title="voice-indicator"
			note="One waveform, four states: idle is grey; listening, thinking and speaking are signal blue."
		>
			<VoiceIndicator state={voice} />
			<Row>
				{VOICE_STATES.map((state) => (
					<Button
						key={state}
						size="sm"
						variant={state === voice ? "primary" : "secondary"}
						onClick={() => setVoice(state)}
					>
						{state}
					</Button>
				))}
			</Row>
		</Demo>
	)
}

function LiveDotDemo() {
	return (
		<Demo
			id="live-dot"
			title="live-dot"
			note="A breathing dot that says “still running”. Under reduced motion it holds still instead of disappearing."
		>
			<Row>
				<LiveDot label="Still running" />
				<span>Reading packages/runtime/src/loop.ts</span>
			</Row>
		</Demo>
	)
}

export const desktopDemos: DemoEntry[] = [
	{ id: "message", covers: ["message"], Component: MessageDemo },
	{ id: "tool-card", covers: ["tool-card"], Component: ToolCardDemo },
	{ id: "reasoning-fold", covers: ["reasoning-fold"], Component: ReasoningFoldDemo },
	{ id: "action-bar", covers: ["action-bar"], Component: ActionBarDemo },
	{ id: "markdown", covers: ["markdown"], Component: MarkdownDemo },
	{ id: "code-block", covers: ["code-block"], Component: CodeBlockDemo },
	{ id: "interaction-card", covers: ["interaction-card"], Component: InteractionCardDemo },
	{ id: "handoff-receipt", covers: ["handoff-receipt"], Component: HandoffReceiptDemo },
	{ id: "composer", covers: ["composer"], Component: ComposerDemo },
	{ id: "voice-indicator", covers: ["voice-indicator"], Component: VoiceIndicatorDemo },
	{ id: "live-dot", covers: ["live-dot"], Component: LiveDotDemo },
]
