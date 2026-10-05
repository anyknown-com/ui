/**
 * Optional text layout engine. The package never imports one: the app registers
 * Pretext (`@chenglou/pretext`, an optional peer dependency) once, and components
 * that need text height without DOM reflow use it when it is there.
 *
 * ```ts
 * import * as pretext from "@chenglou/pretext"
 * setTextLayoutEngine(pretext)
 * ```
 *
 * `TextLayoutEngine` is the subset of the Pretext API this package calls. A Pretext
 * API change touches only this file.
 */

export type TextWhiteSpace = "normal" | "pre-wrap"

export type TextLayoutEngine<Prepared = unknown> = {
	prepare(text: string, font: string, options?: { whiteSpace?: TextWhiteSpace }): Prepared
	layout(prepared: Prepared, maxWidth: number, lineHeight: number): { height: number; lineCount: number }
	/** Drops the engine's own measurement caches (Pretext caches widths per font string). */
	clearCache?(): void
}

export type MeasureTextOptions = {
	/** Canvas font shorthand, e.g. `500 14px "Geist Variable"`. */
	font: string
	/** Content-box width in px. */
	width: number
	/** Line height in px. */
	lineHeight: number
	whiteSpace?: TextWhiteSpace
}

/** Prepared handles to keep. A textarea makes a new one per keystroke. */
const CACHE_SIZE = 256

let engine: TextLayoutEngine | null = null
const prepared = new Map<string, unknown>()

/** Registers the engine (the Pretext module namespace), or removes it with `null`. */
export function setTextLayoutEngine<Prepared>(next: TextLayoutEngine<Prepared> | null): void {
	engine = next as TextLayoutEngine | null
	prepared.clear()
}

export function getTextLayoutEngine(): TextLayoutEngine | null {
	return engine
}

/**
 * Forgets every prepared text and the engine's width cache. Call it after a web
 * font finishes loading: widths measured with the fallback font are wrong.
 */
export function clearTextLayoutCache(): void {
	prepared.clear()
	engine?.clearCache?.()
}

/**
 * Height in px of `text` laid out at `width`, or `null` when no engine is
 * registered. `prepare` results are cached per (text, font, whiteSpace).
 */
export function measureTextHeight(
	text: string,
	{ font, width, lineHeight, whiteSpace = "normal" }: MeasureTextOptions,
): number | null {
	if (!engine) return null
	const key = `${whiteSpace}\u0000${font}\u0000${text}`
	let handle = prepared.get(key)
	if (handle === undefined) {
		handle = engine.prepare(text, font, { whiteSpace })
		if (prepared.size >= CACHE_SIZE) prepared.delete(prepared.keys().next().value!)
	} else {
		prepared.delete(key)
	}
	prepared.set(key, handle)
	return engine.layout(handle, width, lineHeight).height
}
