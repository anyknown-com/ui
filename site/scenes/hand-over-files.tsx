// Stub: meta is final enough to build against; replace Scene with the composed screen.
import type { SceneMeta, SceneProps } from "./scene"
import { SceneStub } from "./Sheet"

export const meta: SceneMeta = {
	id: "hand-over-files",
	title: "Hand over files",
	moment:
		"You drop a few files on the thread so the agent can read them. They wait in the composer until you send, then travel with your message.",
	decisions: [
		"The drop target only shows while something is being dragged; the rest of the time the thread is clean.",
		"Pending files sit in the composer, where you can still remove them before sending.",
		"Upload progress is blue because it is work in progress; it disappears when the file is in.",
	],
	uses: ["dropzone", "pending-files", "attachment", "attach-button", "progress", "composer"],
}

export function Scene({ compact }: SceneProps) {
	return <SceneStub title={meta.title} compact={compact} />
}
