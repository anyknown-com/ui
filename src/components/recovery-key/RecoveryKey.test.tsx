import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { RecoveryKey } from "./RecoveryKey"

const KEY = "K7PQ-WM2X-9RDF-H4TN"

describe("RecoveryKey", () => {
	test("renders the key in four-character groups", () => {
		render(<RecoveryKey value={KEY} />)
		for (const group of KEY.split("-")) expect(screen.getByText(group)).toBeInTheDocument()
	})

	test("the reveal is a real button and the key stays readable to AT", async () => {
		render(<RecoveryKey value={KEY} />)
		const reveal = screen.getByRole("button", { name: "顯示復原金鑰" })
		expect(reveal).toHaveAttribute("aria-pressed", "false")
		// the key characters are plain text, not swallowed by a role="button" wrapper
		expect(screen.getByText("K7PQ")).toBeInTheDocument()
		reveal.focus()
		await userEvent.keyboard("{Enter}")
		expect(screen.getByRole("button", { name: "隱藏復原金鑰" })).toHaveAttribute("aria-pressed", "true")
		await userEvent.keyboard(" ")
		expect(screen.getByRole("button", { name: "顯示復原金鑰" })).toHaveAttribute("aria-pressed", "false")
	})

	test("selecting the rendered key by hand still yields the hyphens", () => {
		const { container } = render(<RecoveryKey value={KEY} />)
		const groups = container.querySelector("[class*='groups']") as HTMLElement
		expect(groups.textContent).toBe(KEY)
	})

	test("copy writes the full key with its dashes", async () => {
		const spy = vi.fn().mockResolvedValue(undefined)
		Object.assign(navigator, { clipboard: { writeText: spy } })
		render(<RecoveryKey value={KEY} />)
		await userEvent.click(screen.getByRole("button", { name: "複製" }))
		expect(spy).toHaveBeenCalledWith(KEY)
		expect(await screen.findByRole("button", { name: "已複製" })).toBeInTheDocument()
	})

	test("a copy is announced once through a status region that is mounted beforehand", async () => {
		Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
		render(<RecoveryKey value={KEY} />)
		const status = screen.getByRole("status")
		expect(status).toBeEmptyDOMElement()
		await userEvent.click(screen.getByRole("button", { name: "複製" }))
		expect(await screen.findByRole("status")).toHaveTextContent("已複製")
		expect(screen.getByRole("status")).toBe(status)
	})

	test("download builds a text blob with the given filename", async () => {
		const createObjectURL = vi.fn().mockReturnValue("blob:key")
		const revokeObjectURL = vi.fn()
		Object.assign(URL, { createObjectURL, revokeObjectURL })
		const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
		render(<RecoveryKey value={KEY} filename="my-key.txt" />)
		await userEvent.click(screen.getByRole("button", { name: "下載 .txt" }))
		expect(createObjectURL).toHaveBeenCalledTimes(1)
		expect(click).toHaveBeenCalledTimes(1)
		expect(revokeObjectURL).toHaveBeenCalledWith("blob:key")
		click.mockRestore()
	})

	test("the warning is a note", () => {
		render(<RecoveryKey value={KEY} />)
		expect(screen.getByRole("note")).toHaveTextContent("遺失就無法復原")
	})

	test("built-in words follow the locale; labels and single-word props win", () => {
		render(
			<LocaleProvider locale="en">
				<RecoveryKey value={KEY} labels={{ download: "Save as file" }} copyLabel="Copy key" />
			</LocaleProvider>,
		)
		expect(screen.getByRole("button", { name: "Show recovery key" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Copy key" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Save as file" })).toBeInTheDocument()
		expect(screen.getByRole("note")).toHaveTextContent("can't be recovered")
		expect(screen.getByRole("checkbox", { name: /stored it somewhere safe/ })).toBeInTheDocument()
	})

	test("the acknowledgement is a real checkbox the caller can gate on", async () => {
		function Flow() {
			const [ack, setAck] = useState(false)
			return (
				<>
					<RecoveryKey value={KEY} ack={ack} onAckChange={setAck} />
					<button type="button" disabled={!ack}>
						繼續建立 vault
					</button>
				</>
			)
		}
		render(<Flow />)
		expect(screen.getByRole("button", { name: "繼續建立 vault" })).toBeDisabled()
		await userEvent.click(screen.getByRole("checkbox", { name: /我已把復原金鑰抄下/ }))
		expect(screen.getByRole("button", { name: "繼續建立 vault" })).toBeEnabled()
	})
})
