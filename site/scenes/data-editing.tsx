// Stub: meta is final enough to build against; replace Scene with the composed screen.
import type { SceneMeta, SceneProps } from "./scene"
import { SceneStub } from "./Sheet"

export const meta: SceneMeta = {
	id: "data-editing",
	title: "Edit data",
	moment:
		"You correct records in a table: sort, filter, fix a value in place, then select a few rows and act on them together.",
	decisions: [
		"The sorted column says so in words and with an arrow, not only with color.",
		"A value is edited where it stands; there is no separate edit page.",
		"The bulk action appears only while rows are selected, and says how many it will touch.",
		"When the filter matches nothing, an empty state says what to change.",
	],
	uses: ["data-table", "empty-state", "checkbox", "button"],
}

export function Scene({ compact }: SceneProps) {
	return <SceneStub title={meta.title} compact={compact} />
}
