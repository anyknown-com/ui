// The situations, in the order the site shows them. Each file owns its own meta and Scene.
import * as agentNeedsYou from "./agent-needs-you"
import * as agentWorking from "./agent-working"
import * as dataEditing from "./data-editing"
import * as handOverFiles from "./hand-over-files"
import * as reviewChanges from "./review-changes"
import type { SceneEntry } from "./scene"
import * as settingsAndPlan from "./settings-and-plan"
import * as vault from "./vault"
import * as voiceCall from "./voice-call"

export const SCENES: SceneEntry[] = [
	agentWorking,
	agentNeedsYou,
	reviewChanges,
	handOverFiles,
	voiceCall,
	vault,
	settingsAndPlan,
	dataEditing,
]

export const sceneById = (id: string) => SCENES.find((scene) => scene.meta.id === id)

export type { SceneEntry, SceneMeta, SceneProps } from "./scene"
