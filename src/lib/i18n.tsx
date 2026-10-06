import { type ReactNode, createContext, use } from "react"

/**
 * Built-in words (aria-labels, screen-reader prefixes, button text a component owns) in more
 * than one language. Each component keeps its own table in its own file; the app picks the
 * language once with `<LocaleProvider>`, and any single instance can still override a word
 * with its `labels` prop.
 *
 * ```tsx
 * // in a component file
 * const strings = defineStrings({
 *   "zh-TW": { close: "關閉", count: (n: number) => `${n} 則` },
 *   en: { close: "Close", count: (n: number) => `${n} items` },
 * })
 * export type ThingLabels = StringsOf<typeof strings>
 *
 * function Thing({ labels }: { labels?: Partial<ThingLabels> }) {
 *   const t = useStrings(strings, labels)
 *   return <button aria-label={t.close}>{t.count(3)}</button>
 * }
 *
 * // in the app
 * <LocaleProvider locale="en">…</LocaleProvider>
 * ```
 */

/** A BCP 47 tag. The two the package ships words for are listed; any other tag falls back to `en`. */
export type Locale = "zh-TW" | "en" | (string & {})

/** With no provider: the primary users read Traditional Chinese. */
export const DEFAULT_LOCALE: Locale = "zh-TW"
/** What a locale with no table of its own reads. */
export const FALLBACK_LOCALE = "en"

/** A word is a string, or a function when it has a number or a name in it. */
export type Word = string | ((...args: never[]) => string)
export type StringTable = Record<string, Word>

/** A component's words in every language: `zh-TW` and `en` are required, others may be partial. */
export type LocaleStrings<T extends StringTable> = {
	"zh-TW": T
	en: T
	[locale: string]: Partial<T>
}

/** The word table type of a `defineStrings` result: `type ToastLabels = StringsOf<typeof strings>`. */
export type StringsOf<S> = S extends LocaleStrings<infer T> ? T : never

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE)

export type LocaleProviderProps = { locale: Locale; children?: ReactNode }

/** Sets the language of every built-in word below it. Portalled popups, dialogs and toasts follow it too. */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
	return <LocaleContext value={locale}>{children}</LocaleContext>
}

/** The nearest `<LocaleProvider>`'s locale, or `"zh-TW"` without one. */
export function useLocale(): Locale {
	return use(LocaleContext)
}

/**
 * Declares a component's words. `zh-TW` sets the shape; `en` must have the same keys and
 * types; any other locale may fill in only some words (the rest read `en`).
 */
export function defineStrings<T extends StringTable>(
	tables: { "zh-TW": T; en: NoInfer<T> } & { [locale: string]: Partial<NoInfer<T>> },
): LocaleStrings<T> {
	return tables as LocaleStrings<T>
}

/**
 * The words for `locale`: that locale's table over `en`, with `labels` over both. An unknown
 * locale reads `en`. Usable outside React; components call `useStrings`.
 */
export function resolveStrings<T extends StringTable>(
	strings: LocaleStrings<T>,
	locale: Locale,
	labels?: Partial<T>,
): T {
	const words: StringTable = { ...strings.en }
	// `undefined` in a partial table or in labels means "not set", not "blank"
	for (const layer of [locale === FALLBACK_LOCALE ? undefined : strings[locale], labels])
		for (const [key, word] of Object.entries(layer ?? {})) if (word !== undefined) words[key] = word
	return words as T
}

/** The words for the current locale, with this instance's `labels` overrides on top. */
export function useStrings<T extends StringTable>(strings: LocaleStrings<T>, labels?: Partial<T>): T {
	return resolveStrings(strings, useLocale(), labels)
}
