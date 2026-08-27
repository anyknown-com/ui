import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { Composer, type SourceRef } from "./Composer"

const SOURCES: SourceRef[] = [
	{ id: "f1", label: "config-store.ts", kind: "檔案" },
	{ id: "l1", label: "昨天的換班摘要", kind: "ledger" },
	{ id: "m1", label: "部署走 Cloudflare", kind: "記憶" },
]

const sources = async (query: string) =>
	SOURCES.filter((source) => source.label.toLowerCase().includes(query.toLowerCase()))

describe("Composer", () => {
	test("the textarea is labelled and send starts disabled", () => {
		render(<Composer onSubmit={() => {}} />)
		expect(screen.getByRole("textbox", { name: "訊息" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "送出" })).toBeDisabled()
	})

	test("Enter submits, Shift+Enter adds a newline", async () => {
		const onSubmit = vi.fn()
		render(<Composer onSubmit={onSubmit} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		await userEvent.type(box, "第一行{Shift>}{Enter}{/Shift}第二行")
		expect(box).toHaveValue("第一行\n第二行")
		await userEvent.type(box, "{Enter}")
		expect(onSubmit).toHaveBeenCalledWith("第一行\n第二行", [])
		expect(box).toHaveValue("")
	})

	test("typing @ opens a source listbox filtered by the query", async () => {
		render(<Composer onSubmit={() => {}} sources={sources} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		await userEvent.type(box, "看一下 @config")
		const listbox = await screen.findByRole("listbox", { name: "@ 來源" })
		await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))
		expect(listbox).toHaveTextContent("config-store.ts")
		expect(box).toHaveAttribute("aria-controls", listbox.id)
		expect(screen.getByRole("button", { name: "加入來源(@)" })).toHaveAttribute("aria-expanded", "true")
	})

	test("arrow keys move the active option and Enter completes it", async () => {
		const onSubmit = vi.fn()
		render(<Composer onSubmit={onSubmit} sources={sources} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		await userEvent.type(box, "@")
		await screen.findByRole("listbox")
		await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3))
		await userEvent.keyboard("{ArrowDown}")
		expect(screen.getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true")
		await userEvent.keyboard("{Enter}")
		expect(box).toHaveValue("@昨天的換班摘要 ")
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
	})

	test("picked sources are handed to onSubmit", async () => {
		const onSubmit = vi.fn()
		render(<Composer onSubmit={onSubmit} sources={sources} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		await userEvent.type(box, "@config")
		await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))
		await userEvent.keyboard("{Enter}")
		await userEvent.type(box, "看一下{Enter}")
		expect(onSubmit).toHaveBeenCalledWith(expect.stringContaining("config-store.ts"), [SOURCES[0]])
	})

	test("typing / opens the command list", async () => {
		render(<Composer onSubmit={() => {}} commands={[{ id: "c1", label: "handoff" }]} />)
		await userEvent.type(screen.getByRole("textbox", { name: "訊息" }), "/")
		expect(await screen.findByRole("listbox", { name: "/ 指令" })).toHaveTextContent("handoff")
	})

	test("the @ button inserts the marker and reports expansion", async () => {
		render(<Composer onSubmit={() => {}} sources={sources} />)
		const at = screen.getByRole("button", { name: "加入來源(@)" })
		await userEvent.click(at)
		expect(screen.getByRole("textbox", { name: "訊息" })).toHaveValue("@")
		await waitFor(() => expect(at).toHaveAttribute("aria-expanded", "true"))
	})

	test("the mic button reports its pressed state", async () => {
		const onMicToggle = vi.fn()
		render(<Composer onSubmit={() => {}} micActive onMicToggle={onMicToggle} />)
		const mic = screen.getByRole("button", { name: "語音輸入" })
		expect(mic).toHaveAttribute("aria-pressed", "true")
		await userEvent.click(mic)
		expect(onMicToggle).toHaveBeenCalledTimes(1)
	})

	test("the model picker is a labelled select", async () => {
		const onModelChange = vi.fn()
		render(
			<Composer
				onSubmit={() => {}}
				models={["Fable 5", "Opus 5"]}
				model="Fable 5"
				onModelChange={onModelChange}
			/>,
		)
		await userEvent.selectOptions(screen.getByRole("combobox", { name: "模型" }), "Opus 5")
		expect(onModelChange).toHaveBeenCalledWith("Opus 5")
	})

	test("Escape closes the suggestion popup", async () => {
		render(<Composer onSubmit={() => {}} sources={sources} />)
		await userEvent.type(screen.getByRole("textbox", { name: "訊息" }), "@")
		await screen.findByRole("listbox")
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
	})
})
