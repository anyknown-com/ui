import type { TokenizerAndRendererExtension, Tokens } from "marked"

// 數學是 marked 沒有的語法,所以走 extension 自己 tokenize。兩種寫法都收:$…$ / $$…$$ 是
// TeX 的慣例,\( … \) / \[ … \] 是 LaTeX 自己的,兩種模型都會吐。
//
// `$` 的難處在它同時是錢:「$5 到 $10」不是公式。所以開頭的 `$` 後面不能是空白,結尾的
// `$` 前面不能是空白、後面不能接數字——GitHub 與 KaTeX 的 auto-render 用的是同一組條件。
const INLINE_DOLLAR = /^\$(?![\s$])((?:\\.|[^\n$\\])+?)(?<!\s)\$(?!\d)/
const INLINE_PAREN = /^\\\(([\s\S]+?)\\\)/
const BLOCK_DOLLAR = /^\$\$([\s\S]+?)\$\$/
const BLOCK_BRACKET = /^\\\[([\s\S]+?)\\\]/

export type MathToken = Tokens.Generic & { type: "math"; text: string; display: boolean }

function first(src: string, ...patterns: RegExp[]): RegExpExecArray | null {
	for (const pattern of patterns) {
		const match = pattern.exec(src)
		if (match) return match
	}
	return null
}

/**
 * Where the next real match starts.
 *
 * This has to be exact, not merely "the next `$`". marked splits the surrounding text token at
 * whatever index `start` names, and with `breaks: true` a fragment that is left as trailing
 * whitespace before the split becomes a `<br>` — so pointing at a `$` that turns out to be a
 * dollar sign inserted line breaks into "從 $5 漲到 $10".
 */
function startWith(...patterns: RegExp[]) {
	return (src: string): number | undefined => {
		let at = src.search(/[$\\]/)
		while (at !== -1) {
			if (first(src.slice(at), ...patterns)) return at
			const next = src.slice(at + 1).search(/[$\\]/)
			if (next === -1) return undefined
			at += 1 + next
		}
		return undefined
	}
}

// The block hint must ignore inline maths. `start` is where marked *cuts*, and a block-level
// extension cuts the paragraph itself — so pointing at the `$` in "行內數學 $E = mc^2$" split that
// sentence in half and left the two pieces as separate lines.
const startBlock = startWith(BLOCK_DOLLAR, BLOCK_BRACKET)
const startInline = startWith(BLOCK_DOLLAR, BLOCK_BRACKET, INLINE_DOLLAR, INLINE_PAREN)

export const mathExtensions: TokenizerAndRendererExtension[] = [
	{
		name: "math",
		level: "block",
		start: startBlock,
		tokenizer(src) {
			const match = first(src, BLOCK_DOLLAR, BLOCK_BRACKET)
			if (!match) return undefined
			const token: MathToken = {
				type: "math",
				raw: match[0],
				text: (match[1] ?? "").trim(),
				display: true,
			}
			return token
		},
	},
	{
		name: "inlineMath",
		level: "inline",
		start: startInline,
		tokenizer(src) {
			// A `$$…$$` that sits inside a paragraph is still display maths; the block tokenizer
			// only ever sees it when it starts its own line.
			const block = first(src, BLOCK_DOLLAR, BLOCK_BRACKET)
			const match = block ?? first(src, INLINE_DOLLAR, INLINE_PAREN)
			if (!match) return undefined
			const token: MathToken = {
				type: "math",
				raw: match[0],
				text: (match[1] ?? "").trim(),
				display: block !== null,
			}
			return token
		},
	},
]

export function isMathToken(token: { type: string }): token is MathToken {
	return token.type === "math"
}
