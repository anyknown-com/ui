import { Marked } from "marked"
import { GUIDES, REPO } from "./content"

// Repo files that have a page of their own on the site.
const ROUTES: Record<string, string> = Object.fromEntries(GUIDES.map((g) => [g.file, `#/guide/${g.key}`]))

/**
 * Where a link written for GitHub should go on the site. `from` is the repo path of the file
 * the link is in, so `../dialog/README.md` in a component README resolves like it does on
 * GitHub. Pages the site has become hash routes; other repo files go to GitHub.
 */
export function siteHref(href: string, from: string): string {
	if (/^(?:[a-z]+:|#|\/\/)/i.test(href)) return href
	const path = new URL(href, `https://repo.invalid/${from}`).pathname.slice(1)
	const file = decodeURIComponent(path)
	if (ROUTES[file] != null) return ROUTES[file]
	const component = file.match(/^src\/components\/([^/]+)\/README\.md$/)
	if (component) return `#/components/${component[1]}`
	if (file === "DESIGN.md") return "https://ui.anyknown.com/design.md"
	return `${REPO}/blob/main/${file}`
}

export function renderMarkdown(body: string, from: string): string {
	const marked = new Marked({
		walkTokens(token) {
			if (token.type === "link" || token.type === "image") token.href = siteHref(token.href, from)
		},
	})
	return marked.parse(body, { async: false })
}

export function Markdown({ body, from }: { body: string; from: string }) {
	return <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(body, from) }} />
}
