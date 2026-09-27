import * as stylex from "@stylexjs/stylex"
import { useRef } from "react"
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

export type AttachButtonProps = {
	onFiles: (files: File[]) => void
	/** The button's name and tooltip. @default "附加檔案" */
	label?: string
	/** Which files the picker offers, as `<input accept>` reads it. */
	accept?: string
	/** @default true */
	multiple?: boolean
	disabled?: boolean
	sx?: stylex.StyleXStyles
}

export function AttachButton({
	onFiles,
	label = "附加檔案",
	accept,
	multiple = true,
	disabled = false,
	sx,
}: AttachButtonProps) {
	const input = useRef<HTMLInputElement>(null)

	return (
		<>
			<IconButton label={label} disabled={disabled} onClick={() => input.current?.click()} sx={sx}>
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
