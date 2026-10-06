import { color } from "../tokens.stylex"

/** rail → main → message → fold → row. A higher number is deeper; surfaces separate by depth, not borders. */
export type LayerName = "layer1" | "layer2" | "layer3" | "layer4" | "layer5"

/**
 * Hover goes up one step: a surface's hover background is the next layer.
 * layer5 is already the deepest; the step past it has no name, so it uses borderStrong.
 */
export const layerUp: Record<LayerName, string> = {
	layer1: color.layer2,
	layer2: color.layer3,
	layer3: color.layer4,
	layer4: color.layer5,
	layer5: color.borderStrong,
}
