// Stub: meta is final enough to build against; replace Scene with the composed screen.
import type { SceneMeta, SceneProps } from "./scene"
import { SceneStub } from "./Sheet"

export const meta: SceneMeta = {
	id: "voice-call",
	title: "Voice call",
	moment:
		"You switch to talking. The composer turns into a call bar, and what you and the agent say lands in the thread as text.",
	decisions: [
		"The call bar takes the composer's place, so the controls stay where your hands already are.",
		"One waveform shows four states: gray while idle, blue while listening, thinking or speaking.",
		"The transcript is ordinary bubbles, so a call reads like the rest of the thread afterwards.",
	],
	uses: ["call-bar", "voice-indicator", "bubble", "composer"],
}

export function Scene({ compact }: SceneProps) {
	return <SceneStub title={meta.title} compact={compact} />
}
