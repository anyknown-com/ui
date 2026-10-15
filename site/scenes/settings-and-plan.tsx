// Stub: meta is final enough to build against; replace Scene with the composed screen.
import type { SceneMeta, SceneProps } from "./scene"
import { SceneStub } from "./Sheet"

export const meta: SceneMeta = {
	id: "settings-and-plan",
	title: "Settings and plan",
	moment:
		"You change how the app behaves and which plan you are on. Deleting the account asks you to confirm first.",
	decisions: [
		"Settings sit in groups on a recessed surface, one row per setting, control on the right.",
		"A switch applies at once; there is no save button to forget.",
		"Delete is the only red on the page, and it goes through a confirm dialog that names what is lost.",
	],
	uses: ["settings-rows", "group", "switch", "segmented", "select", "dialog", "button"],
}

export function Scene({ compact }: SceneProps) {
	return <SceneStub title={meta.title} compact={compact} />
}
