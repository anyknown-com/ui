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
	SubThreadRow,
	TextPart,
	Thread,
	ToolGroup,
	type ToolGroupCall,
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

const CALLS: ToolGroupCall[] = [
	{
		id: "c1",
		tool: "read",
		summary: "packages/runtime/src/turn.ts",
		input: { path: "packages/runtime/src/turn.ts" },
		output: "export async function runTurn(session, input) {\n  …\n}",
	},
	{
		id: "c2",
		tool: "read",
		summary: "packages/contract/src/events.ts",
		input: { path: "packages/contract/src/events.ts" },
	},
	{
		id: "c3",
		tool: "shell",
		summary: "pnpm test --filter runtime",
		input: { command: "pnpm test --filter runtime" },
		output: "Test Files  12 passed (12)\n     Tests  84 passed (84)",
		duration: "18 s",
	},
	{
		id: "c4",
		tool: "mcp_call",
		summary: "stripe/charges_create",
		input: { tool: "stripe/charges_create", amount: 2500, currency: "usd" },
		risk: ["Spends money", "Deletes"],
		failed: true,
		duration: "0.3 s",
	},
]

function ToolGroupDemo() {
	const [open, setOpen] = useState(false)

	return (
		<Demo
			id="tool-group"
			title="tool-group"
			note="The header is one muted line that counts the calls and names each tool once, or shows a title; Enter or Space hides or shows the list. Each row is a button that opens the call's input and output. The last row failed (a red ✕) and declares risks, drawn muted after the summary; durations sit at the row's end. The second group is controlled: open and onOpenChange belong to the page."
		>
			<ToolGroup calls={CALLS} />
			<Row>
				<Button size="sm" variant="secondary" onClick={() => setOpen(!open)}>
					{open ? "Hide the lint call" : "Show the lint call"}
				</Button>
			</Row>
			<ToolGroup
				calls={[{ id: "l1", tool: "shell", summary: "pnpm lint", output: "Found 0 warnings and 0 errors." }]}
				open={open}
				onOpenChange={setOpen}
			/>
		</Demo>
	)
}

function SubThreadDemo() {
	return (
		<Demo
			id="sub-thread"
			title="sub-thread"
			note="A sub agent's run is its own row, not a call in a group: a title with a chevron after it, the status as a coloured word under it. The whole row opens the run. While the run is not over, what it is doing shows indented one step under it; once done, failed or cancelled, only the row stays."
		>
			<SubThreadRow title="Investigate missing retry events" status="running" onOpenRun={() => {}}>
				Reading packages/runtime/src/retry.ts for where retries emit events…
			</SubThreadRow>
			<SubThreadRow title="Wait for the deploy approval" status="waiting" onOpenRun={() => {}} />
			<SubThreadRow title="Push the release tag" status="blocked" onOpenRun={() => {}} />
			<SubThreadRow title="Summarise yesterday's handoffs" status="done" onOpenRun={() => {}} />
			<SubThreadRow title="Rebuild the search index" status="failed" onOpenRun={() => {}} />
			<SubThreadRow title="Draft the changelog" status="cancelled" onOpenRun={() => {}} />
		</Demo>
	)
}

function ReasoningFoldDemo() {
	return (
		<Demo
			id="reasoning-fold"
			title="reasoning-fold"
			note="The row is a button: Enter or Space opens and closes it. While streaming it shimmers and opens; a second after streaming ends it folds itself, unless you toggled it."
		>
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
			note="Its height is always reserved and hover only changes opacity, so the turn rhythm never jumps. It is a toolbar with one tab stop: Tab lands on its last-used button, ← and → move between buttons and wrap (mirrored right to left), Home and End jump to either end."
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
		<Demo
			id="interaction-card"
			title="interaction-card"
			note="PermissionCard: Enter activates the focused reply, ⌘/Ctrl+Enter always allows, Escape rejects. DecisionCard: the options are a radio group; once answered, each ask collapses to a grey label, the grey question and one muted line."
		>
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
			note="One muted line with a chevron after it. It is a button: click it, or press Enter or Space, to read what was kept and handed over."
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
	const [draft, setDraft] = useState("")
	const [sent, setSent] = useState<string | null>(null)

	return (
		<Demo
			id="composer"
			title="composer"
			note="Type @ for sources or / for commands; ↑↓ move through the list, Enter picks, Escape closes it. Enter sends, Shift+Enter adds a new line, and Enter that ends an IME composition never sends. Controlled here: value and onValueChange belong to the page, which gets an empty string after a send."
		>
			<Row>
				<Button size="sm" variant="secondary" onClick={() => setDraft("Summarise today's handoffs")}>
					Fill a draft
				</Button>
			</Row>
			<Composer
				value={draft}
				onValueChange={setDraft}
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
				hint={sent ? `Sent: ${sent}` : `${draft.length} characters · ⏎ to send · ⇧⏎ for a new line`}
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
	{ id: "tool-group", covers: ["tool-group"], Component: ToolGroupDemo },
	{ id: "sub-thread", covers: ["sub-thread"], Component: SubThreadDemo },
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
