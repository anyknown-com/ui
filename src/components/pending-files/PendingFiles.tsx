import * as stylex from "@stylexjs/stylex"
import { color, type } from "../../tokens.stylex"
import { Chip } from "../badge/Badge"

/** The files picked for the next message and not sent yet, each a chip that can be taken off. */

const styles = stylex.create({
	row: {
		color: color.text,
		display: "flex",
		flexWrap: "wrap",
		fontSize: type.t2,
		gap: 6,
		lineHeight: type.tight,
	},
})

export type PendingFile = { id: string; name: string }

export type PendingFilesProps = {
	files: PendingFile[]
	onRemove: (id: string) => void
	/** What the × on a chip is called. @default (name) => `移除 ${name}` */
	removeLabel?: (name: string) => string
	sx?: stylex.StyleXStyles
}

export function PendingFiles({
	files,
	onRemove,
	removeLabel = (name) => `移除 ${name}`,
	sx,
}: PendingFilesProps) {
	return (
		<div {...stylex.props(styles.row, sx)}>
			{files.map(({ id, name }) => (
				<Chip key={id} variant="outline" removeLabel={removeLabel(name)} onRemove={() => onRemove(id)}>
					{name}
				</Chip>
			))}
		</div>
	)
}
