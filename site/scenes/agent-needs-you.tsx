// The agent stopped on two things it will not do alone. The person answers each card in place;
// once both are answered the agent picks the run back up and finishes.
import {
	ActionBar,
	AssistantMessage,
	Composer,
	DecisionCard,
	LiveDot,
	PermissionCard,
	StatusBadge,
	TextPart,
	Thread,
	ToolGroup,
	UserMessage,
	toast,
	type DecisionAnswer,
	type DecisionOption,
	type PermissionReceipt,
	type PermissionReply,
} from "@anyknown/ui"
import { breakpoint, color, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useCallback, useState } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet, chat } from "./Sheet"

export const meta: SceneMeta = {
	id: "agent-needs-you",
	title: "Agent needs you",
	moment:
		"The agent reached two things it will not do on its own: publishing a package and picking a price. It stops and asks, and you can still type in the composer while the questions wait.",
	decisions: [
		"The permission card stops the thread, but the composer stays usable; what you send there lands in the thread while the cards wait.",
		"Each card asks for one thing: a verb and its exact command, or a single question with its options.",
		"The waiting badge is amber, not blue, because the agent is not working; blue comes back only when it picks the run up again.",
		"An answered card collapses to a one-line receipt, so the thread reads as a record of what you decided.",
	],
	uses: ["interaction-card", "message", "tool-group", "status-badge", "live-dot", "action-bar", "composer"],
}

const MOBILE = breakpoint.phone

const PACKAGE = "@anyknown/axis"
const COMMAND = "pnpm --filter @anyknown/axis publish --access public --tag latest"

const REQUEST = "Cut the 1.0 release of @anyknown/axis and put the Pro license on the pricing page."

const ASK =
	"1.0.0 is built, the tests pass and the changelog is written. Two things I won't do on my own: publishing to npm, and the price on the pricing page."

const PRICES: DecisionOption[] = [
	{
		value: "8",
		label: "$8 per month",
		description: "Below Storage Pro. Easier to say yes to, but it barely covers support.",
	},
	{
		value: "12",
		label: "$12 per month",
		description: "Same as Storage Pro. 31 of the 44 waitlist replies named $12 or more.",
		recommended: true,
	},
	{
		value: "96",
		label: "$96 per year, no monthly plan",
		description: "One price to explain. Fewer sign-ups, fewer refunds.",
	},
]

const priceLabel = (value: string) => PRICES.find((option) => option.value === value)?.label ?? value

function permissionReceipt(reply: PermissionReply): PermissionReceipt {
	if (reply === "once") return { text: "Allowed once" }
	if ("always" in reply) return { text: `Always allowed (${reply.always})` }
	return { text: "Denied", rejected: true }
}

function finalReply(published: boolean, price: string) {
	const page = `The pricing page now lists Pro at ${price.replace(", no monthly plan", "")}, and it is live.`
	return published
		? `Published ${PACKAGE} 1.0.0 to npm under the latest tag. ${page} I also tagged the release on GitHub with the changelog.`
		: `I did not publish, so npm still serves 0.9.4. ${page} The 1.0.0 build is ready; ask me to publish it when you want.`
}

const styles = stylex.create({
	sheet: { height: { default: "44rem", [MOBILE]: "40rem" } },
	now: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		minWidth: 0,
		fontSize: type.t2,
		color: color.textMuted,
	},
	nowText: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
	// The tile opens on the status and the permission card; the decision card runs off the bottom.
	still: { overflowY: "hidden" },
})

export function Scene({ compact }: SceneProps) {
	const [run, setRun] = useState(0)
	const [permission, setPermission] = useState<PermissionReceipt | null>(null)
	const [price, setPrice] = useState<string | null>(null)
	const [resumed, setResumed] = useState(false)
	const [notes, setNotes] = useState<string[]>([])
	const [model, setModel] = useState("Opus 5")

	const answered = permission != null && price != null
	const waiting = (permission == null ? 1 : 0) + (price == null ? 1 : 0)
	const working = answered && !resumed

	// While the agent works after the last answer, it finishes on a short timer.
	const resume = useCallback((node: HTMLElement | null) => {
		if (node == null) return
		const id = setTimeout(() => setResumed(true), 2200)
		return () => clearTimeout(id)
	}, [])

	// On first paint, line the thread up on the agent's question and the cards under it.
	const lineUp = useCallback((box: HTMLElement | null) => {
		const card = box?.querySelector(`[role="group"][aria-label$="${COMMAND}"]`)
		const ask = card?.previousElementSibling ?? card
		if (box == null || ask == null) return
		box.scrollTop += ask.getBoundingClientRect().top - box.getBoundingClientRect().top - 16
	}, [])

	// After something new lands at the end of the thread, show it. The marker below is keyed on
	// what can land there, so this runs once per new arrival, not on every render.
	const showEnd = useCallback((node: HTMLElement | null) => {
		const box = node?.parentElement
		if (box != null) box.scrollTop = box.scrollHeight
	}, [])

	function startOver() {
		setPermission(null)
		setPrice(null)
		setResumed(false)
		setNotes([])
		setRun((n) => n + 1)
	}

	function onDecide(answer: DecisionAnswer) {
		const value = typeof answer.price === "string" ? answer.price : ""
		const note = typeof answer.note === "string" ? answer.note.trim() : ""
		setPrice(note === "" ? priceLabel(value) : `${priceLabel(value)} · “${note}”`)
	}

	const status = working ? (
		<>
			<Part name="live-dot" inline align="start">
				<LiveDot />
			</Part>
			<span {...stylex.props(styles.nowText)}>
				{permission?.rejected ? "Updating the pricing page" : `Publishing ${PACKAGE} 1.0.0`}
			</span>
		</>
	) : (
		<span {...stylex.props(styles.nowText)}>
			{resumed ? "Finished" : waiting === 2 ? "2 questions waiting" : "1 question waiting"}
		</span>
	)

	return (
		<Sheet fill={compact} sx={!compact && styles.sheet}>
			<div {...stylex.props(chat.header)}>
				<div {...stylex.props(chat.column, chat.headerRow)}>
					<span {...stylex.props(styles.now)}>{status}</span>
					<Part name="status-badge" inline>
						{working ? (
							<StatusBadge tone="live">Agent working</StatusBadge>
						) : resumed ? (
							<StatusBadge tone="plain">Done</StatusBadge>
						) : (
							<StatusBadge tone="warn">Needs your input</StatusBadge>
						)}
					</Part>
				</div>
			</div>
			<div
				key={run}
				ref={compact ? undefined : lineUp}
				{...stylex.props(chat.scroll, compact && styles.still)}
			>
				<div {...stylex.props(chat.column)}>
					<Part name="message">
						<Thread>
							{!compact && <UserMessage>{REQUEST}</UserMessage>}
							<AssistantMessage>
								{!compact && (
									<Part name="tool-group">
										<ToolGroup
											calls={[
												{
													id: "build",
													tool: "shell",
													summary: "pnpm build && pnpm test",
													input: { command: "pnpm build && pnpm test" },
													output:
														"Test Files  14 passed (14)\n     Tests  128 passed (128)\n  Duration  5.92s",
												},
												{
													id: "changelog",
													tool: "edit",
													summary: "packages/axis/CHANGELOG.md",
													input: { filePath: "packages/axis/CHANGELOG.md" },
												},
											]}
										/>
									</Part>
								)}
								{!compact && <TextPart>{ASK}</TextPart>}
								<Part name="interaction-card">
									<PermissionCard
										verb="Run command"
										subject={COMMAND}
										scope="publishing this package"
										policyHint="The agent always asks before it spends money, publishes, or touches security."
										onReply={(reply) => setPermission(permissionReceipt(reply))}
										resolved={permission ?? undefined}
									/>
								</Part>
								<DecisionCard
									title="What should the Pro license cost?"
									blocks={[
										{
											kind: "markdown",
											id: "context",
											text: "The price goes live with the release. You can change it later; people who already bought keep theirs.",
										},
										{ kind: "options", id: "price", required: true, options: PRICES },
										{
											kind: "text",
											id: "note",
											label: "Note",
											placeholder: "Anything for the pricing page? (optional)",
										},
									]}
									onAnswer={onDecide}
									resolved={price == null ? undefined : { text: price }}
								/>
							</AssistantMessage>
							{notes.map((note, index) => (
								<UserMessage key={index}>{note}</UserMessage>
							))}
							{working && <AssistantMessage pending />}
							{resumed && (
								<AssistantMessage>
									<TextPart>{finalReply(!permission?.rejected, price ?? "")}</TextPart>
									<Part name="action-bar">
										<ActionBar>
											<ActionBar.Copy />
											<ActionBar.Regenerate label="Start over" onRegenerate={startOver} />
										</ActionBar>
									</Part>
								</AssistantMessage>
							)}
						</Thread>
					</Part>
					{working && <div ref={resume} />}
				</div>
				{!compact && <div key={`${notes.length}:${String(answered)}:${String(resumed)}`} ref={showEnd} />}
			</div>
			{!compact && (
				<div {...stylex.props(chat.dock)}>
					<div {...stylex.props(chat.column)}>
						<Part name="composer">
							<Composer
								placeholder={answered ? "Message the agent" : "Reply while the questions wait"}
								models={["Opus 5", "Sonnet 5", "Fable 5"]}
								model={model}
								onModelChange={setModel}
								onSubmit={(text) => {
									if (resumed) {
										toast("This is a recorded run", { description: "Nothing is sent from ui.anyknown.com." })
									} else {
										setNotes((list) => [...list, text])
									}
								}}
							/>
						</Part>
					</div>
				</div>
			)}
		</Sheet>
	)
}
