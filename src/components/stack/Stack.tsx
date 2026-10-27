import * as stylex from "@stylexjs/stylex"
import type { ComponentProps } from "react"
import { type StyleArg, styled } from "../../lib/styled"
import { space } from "../../tokens.stylex"

const styles = stylex.create({
	base: { display: "flex", minWidth: 0 },
	column: { flexDirection: "column" },
	// row 窄了換行,不橫向溢出
	row: { flexDirection: "row", flexWrap: "wrap", alignItems: "baseline" },
	gapSm: { gap: space.xxs },
	gapMd: { gap: space.sm },
	gapLg: { gap: space.lg },
})

export type StackProps = ComponentProps<"div"> & {
	/** `column` stacks children top to bottom; `row` lays them side by side and wraps when narrow. @default "column" */
	direction?: "column" | "row"
	/** Space between children: `sm` 4px (inline), `md` 12px (within one turn), `lg` 24px (between speakers). @default "md" */
	gap?: "sm" | "md" | "lg"
	/** StyleX styles merged after the component's own. */
	sx?: StyleArg
}

const GAP = { sm: styles.gapSm, md: styles.gapMd, lg: styles.gapLg } as const

/** Lays children out in a column or a wrapping row with a token gap. Space is the only separator: no line, no fill. Native `<div>` props pass through. */
export function Stack({ direction = "column", gap = "md", sx, children, ...props }: StackProps) {
	return (
		<div {...props} {...styled(props, styles.base, styles[direction], GAP[gap], sx)}>
			{children}
		</div>
	)
}
