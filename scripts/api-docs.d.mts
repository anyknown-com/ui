export type ApiProp = {
	name: string
	type: string
	required: boolean
	default: string | null
	description: string
	deprecated: string | boolean
}

export type ApiComponent = {
	name: string
	folder: string
	file: string
	aliasOf?: string
	description: string
	deprecated: string | boolean
	extends?: string[]
	props: ApiProp[]
}

export type TokenEntry = {
	key: string
	value?: string | number
	light?: string
	dark?: string
	description: string
	deprecated: string | boolean
}

export type TokenGroup = {
	name: string
	kind: "vars" | "consts"
	description: string
	deprecated: string | boolean
	tokens: TokenEntry[]
}

export function apiDocs(): { generatedFrom: string; components: ApiComponent[] }
export function tokenDocs(): { generatedFrom: string; groups: TokenGroup[] }
