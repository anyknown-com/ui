export interface ThemedVar {
	key: string
	light: string
	dark: string
}
export interface ThemedGroup {
	name: string
	vars: ThemedVar[]
}
export function readThemedGroups(): ThemedGroup[]
export function renderThemes(groups: ThemedGroup[]): string
export function generate(): string
