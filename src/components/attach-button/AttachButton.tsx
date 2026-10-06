import * as stylex from "@stylexjs/stylex"
import { useRef } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { IconButton } from "../icon-button/IconButton"
import { PlusGlyph } from "../icon/glyphs"
import { ICON_STROKE } from "../icon/icon"

/**
 * The `+` in a chatbox that opens the file picker. The button is the control a keyboard and a
 * screen reader reach; the file input behind it is hidden and never takes focus.
 */

const styles = stylex.create({
	icon: { flexShrink: 0, height: 18, pointerEvents: "none", width: 18 },
})

const strings = defineStrings({
	"zh-TW": { attach: "附加檔案" },
	en: { attach: "Attach files" },
})

/** The AttachButton's built-in words (follow `<LocaleProvider>`); override any with `labels`. */
export type AttachButtonLabels = StringsOf<typeof strings>

export type AttachButtonProps = {
	onFiles: (files: File[]) => void
	/** The button's name and tooltip. Wins over `labels.attach`. */
	label?: string
	/** Overrides for the built-in words; the rest follow `<LocaleProvider>`. */
	labels?: Partial<AttachButtonLabels>
	/** Which files the picker offers, as `<input accept>` reads it. */
	accept?: string
	/** @default true */
	multiple?: boolean
	disabled?: boolean
	sx?: stylex.StyleXStyles
}

export function AttachButton({
	onFiles,
	label,
	labels,
	accept,
	multiple = true,
	disabled = false,
	sx,
}: AttachButtonProps) {
	const t = useStrings(strings, labels)
	const input = useRef<HTMLInputElement>(null)

	return (
		<>
			<IconButton
				label={label ?? t.attach}
				disabled={disabled}
				onClick={() => input.current?.click()}
				sx={sx}
			>
				<PlusGlyph {...stylex.props(styles.icon)} strokeWidth={ICON_STROKE} />
			</IconButton>
			<input
				ref={input}
				type="file"
				hidden
				tabIndex={-1}
				multiple={multiple}
				accept={accept}
				disabled={disabled}
				onChange={(event) => {
					onFiles([...(event.currentTarget.files ?? [])])
					event.currentTarget.value = ""
				}}
			/>
		</>
	)
}
