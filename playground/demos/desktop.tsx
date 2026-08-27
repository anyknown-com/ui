import {
	ActionBar,
	AssistantMessage,
	Button,
	CodeBlock,
	Composer,
	DecisionCard,
	HandoffReceipt,
	InlineCode,
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
import { Demo, Row } from "../shell"

const CODE = `export function useChildSession(callID: string) {
  return useThread((t) =>
    Object.values(t.sessions).find((s) => s.parentCallID === callID))
}`

const VOICE_STATES: VoiceState[] = ["idle", "listening", "thinking", "speaking"]

const SOURCES = [
	{ id: "f1", label: "packages/server/src/config-store.ts", kind: "檔案" },
	{ id: "l1", label: "昨天的換班摘要", kind: "ledger" },
	{ id: "m1", label: "部署走 Cloudflare", kind: "記憶" },
]

export function DesktopDemos() {
	const [voice, setVoice] = useState<VoiceState>("listening")
	const [permission, setPermission] = useState<string | null>(null)
	const [decision, setDecision] = useState<string | null>(null)
	const [model, setModel] = useState("Fable 5")
	const [sent, setSent] = useState<string | null>(null)

	return (
		<>
			<Demo id="message" title="message" note="turn 24px / part 8px,user 氣泡、assistant 全寬。">
				<Thread>
					<UserMessage>幫我看一下 desktop 的 thread reducer,同 parentID 只顯示最新一則。</UserMessage>
					<AssistantMessage>
						<TextPart>
							好,規則在 <InlineCode>selectVisibleMessages</InlineCode>:同 parentID 的 assistant 只留最新那則。
						</TextPart>
						<TextPart>我已經改好 selector 並補了 reducer 測試。</TextPart>
					</AssistantMessage>
					<UserMessage>接著把 session.retrying 折進 footer 狀態。</UserMessage>
					<AssistantMessage streaming>
						<TextPart>
							收到,我先在 contract 補上事件型別,然後在 reducer 把 session.retrying 折進該 assistant 的 footer
							狀
						</TextPart>
					</AssistantMessage>
					<UserMessage>順便看一下 lint。</UserMessage>
					<AssistantMessage pending />
				</Thread>
			</Demo>

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
					subtitle="調查 retry 事件缺漏"
					durationLabel="01:24"
					secondLine={<SubagentLine model="sonnet-5" now="搜尋 session.retrying" />}
				>
					<SubagentThread task="找出 runtime 裡 429/5xx 自動重試的事件為什麼沒進 SSE。">
						<SubagentText>先看 retry.ts 的事件發送點…</SubagentText>
					</SubagentThread>
				</ToolCard>
				<ToolCard
					tool="subagent"
					state="completed"
					subtitle="調查 retry 事件缺漏"
					durationLabel="03:41"
					secondLine={<SubagentLine model="sonnet-5" toolCount={7} />}
					footer={
						<SubagentSummary>
							缺口在 turn.ts:retry 迴圈只 log 不發事件,contract 的 EVENTS 也沒有 session.retrying 型別。
						</SubagentSummary>
					}
				>
					<SubagentThread task="找出 runtime 裡 429/5xx 自動重試的事件為什麼沒進 SSE。">
						<SubagentText>結論:缺 session.retrying 事件與 contract 型別。</SubagentText>
					</SubagentThread>
				</ToolCard>
			</Demo>

			<Demo id="reasoning-fold" title="reasoning-fold">
				<ReasoningFold durationSec={12}>
					使用者要的是同 parentID 只顯示最新 assistant。reducer 已經按 sessionID 收好 messages,所以這應該做在
					selector 層。
				</ReasoningFold>
				<ReasoningFold streaming>
					先確認 contract 有沒有 session.retrying 的型別… turn.ts 的 withRetry 只吃 onRetry callback。
				</ReasoningFold>
			</Demo>

			<Demo id="action-bar" title="action-bar" note="高度永遠保留,hover 只切 opacity —— turn 節奏零跳動。">
				<Thread>
					<UserMessage>reducer 的測試補好了嗎?</UserMessage>
					<AssistantMessage>
						<TextPart>補好了,同 parentID 蓋舊卡的三個 case 都綠。這是中間訊息,只有「複製」。</TextPart>
						<ActionBar>
							<ActionBar.Copy />
						</ActionBar>
					</AssistantMessage>
					<UserMessage>好,那接著跑 retry 全鏈。</UserMessage>
					<AssistantMessage>
						<TextPart>這是最後一則,所以多了「重新生成」。</TextPart>
						<ActionBar>
							<ActionBar.Copy />
							<ActionBar.Regenerate onRegenerate={() => {}} />
						</ActionBar>
					</AssistantMessage>
				</Thread>
			</Demo>

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

			<Demo id="interaction-card" title="interaction-card">
				<PermissionCard
					verb="執行指令"
					subject="pnpm publish --access public"
					policyHint="只在花錢、發佈、動到安全的時候停下來問你。「總是允許」會寫進規則,換班後仍有效。"
					onReply={(reply) =>
						setPermission(
							reply === "once" ? "已允許一次" : "always" in reply ? "已總是允許(這個指令)" : "已拒絕",
						)
					}
					resolved={permission ? { text: permission, rejected: permission === "已拒絕" } : undefined}
				/>
				<DecisionCard
					blocking
					title="landing 的定價區塊,先出哪一版?"
					blocks={[
						{
							kind: "options",
							id: "variant",
							required: true,
							options: [
								{ value: "three", label: "三檔方案", description: "Free / Pro / Team。", recommended: true },
								{ value: "single", label: "單一價", description: "先驗證願付,之後再拆檔。" },
								{ value: "none", label: "先不放定價", description: "只收 waitlist。" },
							],
						},
						{ kind: "text", id: "note", label: "補充", placeholder: "想補充什麼,寫在這裡(選填)…" },
					]}
					onAnswer={(answer) => setDecision(`已決定 · 你選了 ${answer.variant}`)}
					resolved={decision ? { text: decision } : undefined}
				/>
			</Demo>

			<Demo id="handoff-receipt" title="handoff-receipt" note="展開時左右兩段線接上,中間打一個結。">
				<HandoffReceipt
					at="14:32"
					ctxPercent={50}
					memory={{ count: 3, items: ["偏好 pnpm", "部署走 Cloudflare", "先出 desktop"] }}
					ledgerCount={42}
					handoffSummary="landing 定價區塊寫到三檔方案的表格,下一步接 FAQ。"
				/>
				<HandoffReceipt
					at="09:05"
					ctxPercent={80}
					reason="hard-limit"
					memory={{ count: 1 }}
					ledgerCount={117}
					handoffSummary="大型 refactor 進行到 store 層,測試 3 紅。"
				/>
			</Demo>

			<Demo id="composer" title="composer" note="打「@」看來源建議;⏎ 送出、⇧⏎ 換行。">
				<Composer
					placeholder="跟 agent 說話——它只在花錢、發佈、動到安全的時候停下來問你"
					models={["Fable 5", "Opus 5", "Sonnet 5", "GPT-5.4"]}
					model={model}
					onModelChange={setModel}
					sources={async (query) =>
						SOURCES.filter((source) => source.label.toLowerCase().includes(query.toLowerCase()))
					}
					commands={[
						{ id: "handoff", label: "handoff" },
						{ id: "memory", label: "memory" },
					]}
					onMicToggle={() => {}}
					onSubmit={(value) => setSent(value)}
					hint={sent ? `已送出:${sent}` : "⏎ 送出 · ⇧⏎ 換行"}
				/>
			</Demo>

			<Demo id="voice-indicator" title="voice-indicator" note="同一條纖維的四種狀態。">
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
		</>
	)
}
