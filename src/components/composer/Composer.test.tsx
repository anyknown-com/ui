import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { afterEach, describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { Composer, type ComposerProps, type SourceRef } from "./Composer"

const SOURCES: SourceRef[] = [
	{ id: "f1", label: "config-store.ts", kind: "檔案" },
	{ id: "l1", label: "昨天的換班摘要", kind: "ledger" },
	{ id: "m1", label: "部署走 Cloudflare", kind: "記憶" },
]

const sources = async (query: string) =>
	SOURCES.filter((source) => source.label.toLowerCase().includes(query.toLowerCase()))

describe("Composer", () => {
	test("without suggestions it is a plain labelled textbox", () => {
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
		const box = screen.getByRole("combobox", { name: "訊息" })
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
		const box = screen.getByRole("combobox", { name: "訊息" })
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
		const box = screen.getByRole("combobox", { name: "訊息" })
		await userEvent.type(box, "@config")
		await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))
		await userEvent.keyboard("{Enter}")
		await userEvent.type(box, "看一下{Enter}")
		expect(onSubmit).toHaveBeenCalledWith(expect.stringContaining("config-store.ts"), [SOURCES[0]])
	})

	test("typing / opens the command list", async () => {
		render(<Composer onSubmit={() => {}} commands={[{ id: "c1", label: "handoff" }]} />)
		await userEvent.type(screen.getByRole("combobox", { name: "訊息" }), "/")
		expect(await screen.findByRole("listbox", { name: "/ 指令" })).toHaveTextContent("handoff")
	})

	test("the @ button inserts the marker and reports expansion", async () => {
		render(<Composer onSubmit={() => {}} sources={sources} />)
		const at = screen.getByRole("button", { name: "加入來源(@)" })
		await userEvent.click(at)
		expect(screen.getByRole("combobox", { name: "訊息" })).toHaveValue("@")
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

	test("Escape closes the command popup too, not only the source popup", async () => {
		render(<Composer onSubmit={() => {}} commands={[{ id: "c1", label: "handoff" }]} />)
		await userEvent.type(screen.getByRole("combobox", { name: "訊息" }), "/")
		await screen.findByRole("listbox")
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
	})

	test("the active option index is clamped when the list shrinks", async () => {
		render(
			<Composer
				onSubmit={() => {}}
				commands={[
					{ id: "a", label: "alpha" },
					{ id: "b", label: "beta" },
					{ id: "c", label: "beta-two" },
				]}
			/>,
		)
		const box = screen.getByRole("combobox", { name: "訊息" })
		await userEvent.type(box, "/")
		await screen.findByRole("listbox")
		await userEvent.keyboard("{ArrowDown}{ArrowDown}")
		expect(screen.getAllByRole("option")[2]).toHaveAttribute("aria-selected", "true")
		await userEvent.type(box, "alpha")
		expect(screen.getAllByRole("option")).toHaveLength(1)
		expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true")
		await userEvent.keyboard("{Enter}")
		expect(box).toHaveValue("/alpha ")
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
		await userEvent.type(screen.getByRole("combobox", { name: "訊息" }), "@")
		await screen.findByRole("listbox")
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
	})
})

describe("Composer regressions", () => {
	test("inserting @ mid-text leaves the DOM caret where the state caret is", async () => {
		render(<Composer onSubmit={() => {}} sources={sources} />)
		const box = screen.getByRole("combobox", { name: "訊息" }) as HTMLTextAreaElement
		await userEvent.type(box, "前段後段")
		box.setSelectionRange(2, 2)
		await userEvent.click(screen.getByRole("button", { name: "加入來源(@)" }))
		await waitFor(() => expect(box.selectionStart).toBe(box.value.indexOf("@") + 1))
	})

	test("a label containing $& is inserted literally", async () => {
		render(<Composer onSubmit={() => {}} commands={[{ id: "c", label: "a$&b" }]} />)
		const box = screen.getByRole("combobox", { name: "訊息" })
		await userEvent.type(box, "/a")
		await screen.findByRole("listbox")
		await userEvent.keyboard("{Enter}")
		expect(box).toHaveValue("/a$&b ")
	})

	test("Enter during IME composition does not submit", async () => {
		const onSubmit = vi.fn()
		render(<Composer onSubmit={onSubmit} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		await userEvent.type(box, "ㄋㄧ")
		fireEvent.keyDown(box, { key: "Enter", isComposing: true })
		expect(onSubmit).not.toHaveBeenCalled()
		fireEvent.keyDown(box, { key: "Enter" })
		expect(onSubmit).toHaveBeenCalledTimes(1)
	})

	test("a source the user deleted again is not reported as a ref", async () => {
		const onSubmit = vi.fn()
		render(<Composer onSubmit={onSubmit} sources={sources} />)
		const box = screen.getByRole("combobox", { name: "訊息" })
		await userEvent.type(box, "@config")
		await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))
		await userEvent.keyboard("{Enter}")
		await userEvent.clear(box)
		await userEvent.type(box, "無關{Enter}")
		expect(onSubmit).toHaveBeenCalledWith("無關", [])
	})

	test("Escape dismisses once; typing more re-opens the popup", async () => {
		render(<Composer onSubmit={() => {}} commands={[{ id: "c1", label: "handoff" }]} />)
		const box = screen.getByRole("combobox", { name: "訊息" })
		await userEvent.type(box, "/ha")
		await screen.findByRole("listbox")
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
		await userEvent.type(box, "n")
		expect(await screen.findByRole("listbox")).toBeInTheDocument()
		await userEvent.keyboard("{Backspace}")
		expect(await screen.findByRole("listbox")).toBeInTheDocument()
	})

	test("a rejecting sources function does not leave a stale list", async () => {
		render(<Composer onSubmit={() => {}} sources={async () => Promise.reject(new Error("offline"))} />)
		await userEvent.type(screen.getByRole("combobox", { name: "訊息" }), "@x")
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
	})
})

/** An app that owns the draft and can put a saved one back. */
function DraftHost({
	restore,
	...props
}: { restore: string } & Omit<ComposerProps, "value" | "onValueChange">) {
	const [draft, setDraft] = useState("")
	return (
		<>
			<button type="button" onClick={() => setDraft(restore)}>
				還原
			</button>
			<Composer value={draft} onValueChange={setDraft} {...props} />
		</>
	)
}

describe("Composer value", () => {
	test("defaultValue prefills the box and still clears after sending", async () => {
		const onSubmit = vi.fn()
		render(<Composer onSubmit={onSubmit} defaultValue="草稿" />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		expect(box).toHaveValue("草稿")
		expect(screen.getByRole("button", { name: "送出" })).toBeEnabled()
		await userEvent.type(box, "{Enter}")
		expect(onSubmit).toHaveBeenCalledWith("草稿", [])
		expect(box).toHaveValue("")
	})

	test("onValueChange reports every edit", async () => {
		const onValueChange = vi.fn()
		render(<Composer onSubmit={() => {}} onValueChange={onValueChange} />)
		await userEvent.type(screen.getByRole("textbox", { name: "訊息" }), "嗨")
		expect(onValueChange).toHaveBeenLastCalledWith("嗨")
	})

	test("a controlled value follows the parent, and send asks the parent to clear it", async () => {
		const onSubmit = vi.fn()
		render(<DraftHost restore="還原的草稿" onSubmit={onSubmit} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		await userEvent.click(screen.getByRole("button", { name: "還原" }))
		expect(box).toHaveValue("還原的草稿")
		await userEvent.type(box, "!{Enter}")
		expect(onSubmit).toHaveBeenCalledWith("還原的草稿!", [])
		expect(box).toHaveValue("")
	})

	test("a controlled value the parent does not clear stays", async () => {
		const onValueChange = vi.fn()
		render(<Composer value="固定" onValueChange={onValueChange} onSubmit={() => {}} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		await userEvent.type(box, "{Enter}")
		expect(onValueChange).toHaveBeenLastCalledWith("")
		expect(box).toHaveValue("固定")
	})

	test("a value set from outside opens no popup until the user types", async () => {
		render(<DraftHost restore="/" onSubmit={() => {}} commands={[{ id: "c1", label: "handoff" }]} />)
		const box = screen.getByRole("combobox", { name: "訊息" })
		await userEvent.type(box, "hi")
		fireEvent.click(screen.getByRole("button", { name: "還原" }))
		expect(box).toHaveValue("/")
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
		await userEvent.type(box, "h")
		expect(await screen.findByRole("listbox", { name: "/ 指令" })).toHaveTextContent("handoff")
	})
})

describe("Composer autoGrow", () => {
	afterEach(() => vi.restoreAllMocks())

	test("without field-sizing it sizes like Textarea, and shrinks back after sending", async () => {
		let scrollHeight = 24
		vi.spyOn(CSS, "supports").mockReturnValue(false)
		vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => scrollHeight)
		render(<Composer onSubmit={() => {}} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		expect(box.style.height).toBe("24px")
		scrollHeight = 72
		await userEvent.type(box, "一{Shift>}{Enter}{/Shift}二{Shift>}{Enter}{/Shift}三")
		expect(box.style.height).toBe("72px")
		scrollHeight = 24
		await userEvent.type(box, "{Enter}")
		expect(box.style.height).toBe("24px")
	})

	test("a controlled value set from outside re-measures the height", () => {
		let scrollHeight = 24
		vi.spyOn(CSS, "supports").mockReturnValue(false)
		vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => scrollHeight)
		const { rerender } = render(<Composer value="" onSubmit={() => {}} />)
		const box = screen.getByRole("textbox", { name: "訊息" })
		expect(box.style.height).toBe("24px")
		scrollHeight = 72
		rerender(<Composer value={"一\n二\n三"} onSubmit={() => {}} />)
		expect(box.style.height).toBe("72px")
		scrollHeight = 24
		rerender(<Composer value="" onSubmit={() => {}} />)
		expect(box.style.height).toBe("24px")
	})
})

describe("Composer words", () => {
	test("follow the LocaleProvider; labels and the shorthand props override them", async () => {
		render(
			<LocaleProvider locale="en">
				<Composer
					onSubmit={() => {}}
					commands={[{ id: "c1", label: "handoff" }]}
					onMicToggle={() => {}}
					models={["Fable 5"]}
					labels={{ send: "Go", label: "Ignored" }}
					label="Chat"
				/>
			</LocaleProvider>,
		)
		const box = screen.getByRole("combobox", { name: "Chat" })
		expect(box).toHaveAttribute("placeholder", "Talk to the agent")
		expect(screen.getByRole("button", { name: "Go" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Add a source (@)" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Command (/)" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Voice input" })).toBeInTheDocument()
		expect(screen.getByRole("combobox", { name: "Model" })).toBeInTheDocument()
		await userEvent.type(box, "/")
		const list = await screen.findByRole("listbox", { name: "/ Commands" })
		expect(list).toHaveTextContent("handoffCommand")
	})
})
