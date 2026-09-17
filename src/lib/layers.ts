import { color } from "../tokens.stylex"

/** rail → main → 訊息 → fold → 列。數字越大越深,面與面靠深淺分,不靠邊框。 */
export type LayerName = "layer1" | "layer2" | "layer3" | "layer4" | "layer5"

/**
 * hover 升一階:一塊面的 hover 底色就是下一階。
 * layer5 已經是最深的一階,再深的那一階沒有名字,用 borderStrong。
 */
export const layerUp: Record<LayerName, string> = {
	layer1: color.layer2,
	layer2: color.layer3,
	layer3: color.layer4,
	layer4: color.layer5,
	layer5: color.borderStrong,
}
