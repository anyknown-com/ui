// Stub: meta is final enough to build against; replace Scene with the composed screen.
import type { SceneMeta, SceneProps } from "./scene"
import { SceneStub } from "./Sheet"

export const meta: SceneMeta = {
	id: "vault",
	title: "Open the vault",
	moment:
		"Your files are encrypted before they leave your device. You unlock them with a password, and the recovery key is shown once, when you set the vault up.",
	decisions: [
		"File rows are paper on paper: tone and a rest shadow, no frame around each row.",
		"The password field says how to fix a wrong password instead of apologizing.",
		"The recovery key is shown once, in monospace, with a copy action; it is never shown again.",
	],
	uses: ["file-row", "list", "password-input", "recovery-key"],
}

export function Scene({ compact }: SceneProps) {
	return <SceneStub title={meta.title} compact={compact} />
}
