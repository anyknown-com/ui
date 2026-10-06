export interface TokenVar {
	key: string
	light: string
	dark?: string
}
export interface TokenGroup {
	name: string
	vars: TokenVar[]
}
export function readGroups(source?: string): TokenGroup[]
export function varName(group: string, key: string): string
export function expected(groups?: TokenGroup[]): { light: Map<string, string>; dark: Map<string, string> }
export function generate(groups?: TokenGroup[]): string
export function declarations(css: string, selector: string): Map<string, string>
