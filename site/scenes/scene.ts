// The contract every scene file follows. A scene file exports `meta` and `Scene`; index.ts
// lists them in order. Nothing else is shared, so scene files can be written in parallel.
import type { ComponentType } from "react"

export type SceneMeta = {
	/** Route id: `#/situations/<id>`. Same as the file name. */
	id: string
	/** Sentence case, a few words. */
	title: string
	/** One or two sentences on what is happening to the person. */
	moment: string
	/** Three to five decisions, one sentence each. */
	decisions: string[]
	/** Component folders under src/components, in the order they matter. The smoke test checks them. */
	uses: string[]
}

export type SceneProps = {
	/**
	 * Hero and tile size. The scene fills its container's height (the container sets the size),
	 * and anything animated loops. Without it the scene sets its own height and must read at 375px.
	 */
	compact?: boolean
}

export type SceneEntry = { meta: SceneMeta; Scene: ComponentType<SceneProps> }
