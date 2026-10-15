// Stub: meta is final enough to build against; replace Scene with the composed screen.
import type { SceneMeta, SceneProps } from "./scene"
import { SceneStub } from "./Sheet"

export const meta: SceneMeta = {
	id: "review-changes",
	title: "Review the changes",
	moment:
		"The agent says it is done. Before anything ships, you read what it changed, file by file, and decide what happens next.",
	decisions: [
		"The diff uses red and green only for removed and added lines; color means change and nothing else.",
		"The action bar keeps its row reserved, so the thread never jumps when you hover a reply.",
		"The handoff receipt marks where the work moved to a fresh context, and opens to show what was kept.",
	],
	uses: ["diff-viewer", "action-bar", "handoff-receipt", "message"],
}

export function Scene({ compact }: SceneProps) {
	return <SceneStub title={meta.title} compact={compact} />
}
