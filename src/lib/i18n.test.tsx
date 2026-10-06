import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { LocaleProvider, type StringsOf, defineStrings, resolveStrings, useLocale, useStrings } from "./i18n"

const strings = defineStrings({
	"zh-TW": { close: "關閉", count: (n: number) => `${n} 則` },
	en: { close: "Close", count: (n: number) => `${n} items` },
	ja: { close: "閉じる" },
})

function Probe({ labels }: { labels?: Partial<StringsOf<typeof strings>> }) {
	const t = useStrings(strings, labels)
	return (
		<p>
			{useLocale()} / {t.close} / {t.count(3)}
		</p>
	)
}

describe("i18n", () => {
	test("without a provider the words are zh-TW", () => {
		render(<Probe />)
		expect(screen.getByText("zh-TW / 關閉 / 3 則")).toBeInTheDocument()
	})

	test("the provider picks the locale", () => {
		render(
			<LocaleProvider locale="en">
				<Probe />
			</LocaleProvider>,
		)
		expect(screen.getByText("en / Close / 3 items")).toBeInTheDocument()
	})

	test("the nearest provider wins", () => {
		render(
			<LocaleProvider locale="en">
				<LocaleProvider locale="zh-TW">
					<Probe />
				</LocaleProvider>
			</LocaleProvider>,
		)
		expect(screen.getByText("zh-TW / 關閉 / 3 則")).toBeInTheDocument()
	})

	test("an unknown locale falls back to en", () => {
		render(
			<LocaleProvider locale="fr">
				<Probe />
			</LocaleProvider>,
		)
		expect(screen.getByText("fr / Close / 3 items")).toBeInTheDocument()
	})

	test("a partial table fills the gaps from en", () => {
		expect(resolveStrings(strings, "ja").close).toBe("閉じる")
		expect(resolveStrings(strings, "ja").count(2)).toBe("2 items")
	})

	test("labels override one word and leave the rest to the locale", () => {
		render(
			<LocaleProvider locale="en">
				<Probe labels={{ close: "Dismiss", count: undefined }} />
			</LocaleProvider>,
		)
		expect(screen.getByText("en / Dismiss / 3 items")).toBeInTheDocument()
	})

	test("en must carry every zh-TW word", () => {
		// @ts-expect-error -- en is missing `b`
		const partial = defineStrings({ "zh-TW": { a: "甲", b: "乙" }, en: { a: "A" } })
		expect(partial.en.a).toBe("A")
	})

	test("a function label interpolates", () => {
		render(<Probe labels={{ count: (n) => `共 ${n} 筆` }} />)
		expect(screen.getByText("zh-TW / 關閉 / 共 3 筆")).toBeInTheDocument()
	})
})
