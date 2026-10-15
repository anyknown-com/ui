// Stub: meta is final enough to build against; replace Scene with the composed screen.
import type { SceneMeta, SceneProps } from "./scene"
import { SceneStub } from "./Sheet"

export const meta: SceneMeta = {
	id: "agent-needs-you",
	title: "Agent needs you",
	moment:
		"The agent reached two things it will not do on its own: publishing a package and picking a price. It stops and asks, and you can still type in the composer while the questions wait.",
	decisions: [
		"The permission card stops the thread, but the composer stays usable.",
		"Each card asks for one thing: a verb and its subject, or a single question with its options.",
		"An answered card collapses to a one-line receipt, so the thread reads as a record of what you decided.",
	],
	uses: ["interaction-card", "message", "composer"],
}

export function Scene({ compact }: SceneProps) {
	return <SceneStub title={meta.title} compact={compact} />
}
