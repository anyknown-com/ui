import * as stylex from "@stylexjs/stylex"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
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

const strings = defineStrings({
	"zh-TW": { remove: (name: string) => `移除 ${name}` },
	en: { remove: (name: string) => `Remove ${name}` },
})

/** The PendingFiles' built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type PendingFilesLabels = StringsOf<typeof strings>

export type PendingFile = { id: string; name: string }

export type PendingFilesProps = {
	files: PendingFile[]
	onRemove: (id: string) => void
	/** What the × on a chip is called. Wins over `labels.remove`. */
	removeLabel?: (name: string) => string
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<PendingFilesLabels>
	sx?: stylex.StyleXStyles
}

export function PendingFiles({ files, onRemove, removeLabel, labels, sx }: PendingFilesProps) {
	const t = useStrings(strings, labels)
	const nameOf = removeLabel ?? t.remove
	return (
		<div {...stylex.props(styles.row, sx)}>
			{files.map(({ id, name }) => (
				<Chip key={id} variant="outline" removeLabel={nameOf(name)} onRemove={() => onRemove(id)}>
					{name}
				</Chip>
			))}
		</div>
	)
}
