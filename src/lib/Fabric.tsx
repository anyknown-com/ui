import * as stylex from "@stylexjs/stylex"
import { color } from "../tokens.stylex"

const styles = stylex.create({
	ground: { fill: color.accentSubtle },
	warp: { stroke: color.accent, strokeWidth: 0.9, opacity: 0.8 },
	weft: { stroke: color.accent, strokeWidth: 0.7, opacity: 0.45 },
})

export function FabricPattern({ id }: { id: string }) {
	return (
		<defs>
			<pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse">
				<rect width="5" height="5" {...stylex.props(styles.ground)} />
				<path d="M0,5 L5,0 M-1.2,1.2 L1.2,-1.2 M3.8,6.2 L6.2,3.8" {...stylex.props(styles.warp)} />
				<path d="M0,0 L5,5 M3.8,-1.2 L6.2,1.2 M-1.2,3.8 L1.2,6.2" {...stylex.props(styles.weft)} />
			</pattern>
		</defs>
	)
}
