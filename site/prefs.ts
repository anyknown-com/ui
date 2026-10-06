// Visitor preferences (theme, component language) and the hash route, as external stores read
// with `useStore` — no effects. Each preference is remembered in localStorage when it can be;
// private mode or blocked storage just means it lasts for this visit.
import { createStore, useStore, type Locale } from "@anyknown/ui"
import { dark, light } from "@anyknown/ui/themes.stylex"
import * as stylex from "@stylexjs/stylex"

function load<T extends string>(key: string, allowed: readonly T[]): T | null {
	try {
		const saved = localStorage.getItem(key)
		return allowed.find((v) => v === saved) ?? null
	} catch {
		return null
	}
}

function save(key: string, value: string | null) {
	try {
		if (value == null) localStorage.removeItem(key)
		else localStorage.setItem(key, value)
	} catch {
		/* storage blocked: the choice still holds for this visit */
	}
}

export type ThemeMode = "system" | "light" | "dark"
export const THEME_KEY = "ak-site-theme"
const THEMES = { light, dark }
const themeStore = createStore<ThemeMode>(load(THEME_KEY, ["light", "dark"] as const) ?? "system")
let themeClasses: string[] = []

// Dialogs and toasts portal to <body>, so the theme class goes on <html> to reach them;
// data-theme is for the tokens.css consumers (body, .prose, scrollbars).
function applyTheme(mode: ThemeMode) {
	const root = document.documentElement
	root.classList.remove(...themeClasses)
	themeClasses = mode === "system" ? [] : (stylex.props(...THEMES[mode]).className?.split(" ") ?? [])
	root.classList.add(...themeClasses)
	if (mode === "system") delete root.dataset.theme
	else root.dataset.theme = mode
}

applyTheme(themeStore.getSnapshot())

export function setTheme(mode: ThemeMode) {
	themeStore.set(mode)
	applyTheme(mode)
	save(THEME_KEY, mode === "system" ? null : mode)
}

export const useTheme = () => useStore(themeStore)

/** The language of the components' built-in words. The site's own text is English. */
export const LOCALES: { locale: Locale; label: string; lang: string }[] = [
	{ locale: "en", label: "English", lang: "en" },
	{ locale: "zh-TW", label: "繁體中文", lang: "zh-Hant" },
]
export const LOCALE_KEY = "ak-site-locale"
const localeStore = createStore<Locale>(load(LOCALE_KEY, ["en", "zh-TW"] as const) ?? "en")

export function setLocale(locale: Locale) {
	localeStore.set(locale)
	save(LOCALE_KEY, locale)
}

export const useSiteLocale = () => useStore(localeStore)

const hashStore = {
	getSnapshot: () => location.hash,
	subscribe(listener: () => void) {
		window.addEventListener("hashchange", listener)
		return () => window.removeEventListener("hashchange", listener)
	},
}

export const useHash = () => useStore(hashStore)
