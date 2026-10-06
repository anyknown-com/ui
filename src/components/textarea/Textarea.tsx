import * as stylex from "@stylexjs/stylex"
import { type ComponentProps, useCallback } from "react"
import { assignRef } from "../../lib/mergeRefs"
import { type StyleArg, styled } from "../../lib/styled"
import { clearTextLayoutCache, getTextLayoutEngine, measureTextHeight } from "../../lib/textLayout"
import { space, text } from "../../tokens.stylex"
import { controlStyles } from "../input/Input"
import { useFieldControl } from "../label/fieldContext"

const styles = stylex.create({
	base: {
		minHeight: "4.5rem",
		paddingBlock: space.xs,
		paddingInline: space.sm,
		lineHeight: text.leadingRelaxed,
		resize: "vertical",
	},
	// field-sizing 不支援時由 JS 量高度(見 fitHeight),所以一律不給拉把
	autoGrow: {
		fieldSizing: "content",
		resize: "none",
	},
	maxRows: (rows: number) => ({ maxHeight: `calc(${rows} * 1.6em + ${space.md})` }),
})

export type TextareaProps = ComponentProps<"textarea"> & {
	autoGrow?: boolean
	maxRows?: number
	invalid?: boolean
	sx?: StyleArg
}

type Sizing = "engine" | "scroll"

const px = (value: string) => Number.parseFloat(value) || 0

/** Sets the inline height to fit the content: Pretext when it can, otherwise scrollHeight. */
function fitHeight(area: HTMLTextAreaElement, sizing: Sizing, maxRows: number | undefined) {
	const css = getComputedStyle(area)
	const lineHeight = px(css.lineHeight) || px(css.fontSize) * 1.2
	const paddingY = px(css.paddingTop) + px(css.paddingBottom)
	const borderY = px(css.borderTopWidth) + px(css.borderBottomWidth)
	const frame = css.boxSizing === "border-box" ? paddingY + borderY : 0

	let height: number | null = null
	if (sizing === "engine") {
		// 空的 textarea 也佔一行;結尾的換行在 textarea 裡會多出一行空行,Pretext 照
		// block 的規則不算,補一個空白(pre-wrap 的行尾空白不佔寬)讓那行成立
		let content = area.value || area.placeholder
		if (content === "" || content.endsWith("\n")) content += " "
		const width = area.clientWidth - px(css.paddingLeft) - px(css.paddingRight)
		const font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`
		const measured = measureTextHeight(content, { font, width, lineHeight, whiteSpace: "pre-wrap" })
		if (measured != null) height = measured + frame
	}
	if (height == null) {
		area.style.height = "auto"
		height = area.scrollHeight + (css.boxSizing === "border-box" ? borderY : -paddingY)
	}
	if (maxRows != null) height = Math.min(height, maxRows * lineHeight + frame)
	area.style.height = `${height}px`
}

/**
 * Grows the textarea where `field-sizing: content` is missing. Returns the
 * cleanup, or nothing when CSS already does the job.
 */
export function autoGrow(area: HTMLTextAreaElement, maxRows: number | undefined) {
	if (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")) return
	const fonts = document.fonts as FontFaceSet | undefined
	// 字型還在載入時量出來的寬是 fallback 字型的,Pretext 會把它快取住;先用
	// scrollHeight 撐著,載完清快取再交給 Pretext
	let fontsReady = !fonts || fonts.status === "loaded"
	let disposed = false
	const resize = () => {
		if (disposed) return
		fitHeight(area, fontsReady && getTextLayoutEngine() ? "engine" : "scroll", maxRows)
	}
	const refresh = () => {
		fontsReady = true
		clearTextLayoutCache()
		resize()
	}

	resize()
	area.addEventListener("input", resize)
	let width = area.clientWidth
	let frame = 0
	const observer = new ResizeObserver(() => {
		if (area.clientWidth === width) return
		width = area.clientWidth
		// 在 callback 裡直接改高度會再觸發一次觀察,Safari 報 "ResizeObserver loop";下一幀再量
		cancelAnimationFrame(frame)
		frame = requestAnimationFrame(resize)
	})
	observer.observe(area)
	// 受控的 textarea 每打一個字就重接一次,只有字型真的在載時才等 ready
	if (!fontsReady) fonts?.ready.then(refresh)
	// unicode-range 切片的字型(Noto Sans TC)在打到那個字時才載,ready 之後還會來
	fonts?.addEventListener("loadingdone", refresh)

	return () => {
		disposed = true
		area.removeEventListener("input", resize)
		observer.disconnect()
		cancelAnimationFrame(frame)
		fonts?.removeEventListener("loadingdone", refresh)
	}
}

export function Textarea({ autoGrow: grow, maxRows, invalid, sx, ref, ...props }: TextareaProps) {
	const { invalid: fieldInvalid, ...field } = useFieldControl(props)
	const isInvalid = invalid ?? fieldInvalid
	const { value, placeholder } = props
	const attach = useCallback(
		(area: HTMLTextAreaElement | null) => {
			assignRef(ref, area)
			const cleanup = area && grow ? autoGrow(area, maxRows) : undefined
			return () => {
				cleanup?.()
				assignRef(ref, null)
			}
		},
		// 受控值從外面改(例如送出後清空)不會觸發 input 事件,ref callback 換一個才會重量
		// oxlint-disable-next-line react-hooks/exhaustive-deps, react/memo-dependencies -- value / placeholder re-measure
		[ref, grow, maxRows, value, placeholder],
	)
	return (
		<textarea
			{...props}
			{...field}
			ref={attach}
			aria-invalid={isInvalid || undefined}
			{...styled(
				props,
				controlStyles.base,
				styles.base,
				grow && styles.autoGrow,
				maxRows != null && styles.maxRows(maxRows),
				isInvalid && controlStyles.invalid,
				sx,
			)}
		/>
	)
}
