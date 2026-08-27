import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { RecoveryKey } from "./RecoveryKey"

const KEY = "K7PQ-WM2X-9RDF-H4TN"

describe("RecoveryKey", () => {
	test("renders the key in four-character groups", () => {
		render(<RecoveryKey value={KEY} />)
		for (const group of KEY.split("-")) expect(screen.getByText(group)).toBeInTheDocument()
	})

	test("the mask is a keyboard-operable button that says what it does", async () => {
		render(<RecoveryKey value={KEY} />)
		const veil = screen.getByRole("button", { name: "顯示復原金鑰" })
		expect(veil).toHaveAttribute("aria-pressed", "false")
		veil.focus()
		await userEvent.keyboard("{Enter}")
		expect(veil).toHaveAttribute("aria-pressed", "true")
		await userEvent.keyboard(" ")
		expect(veil).toHaveAttribute("aria-pressed", "false")
	})

	test("copy writes the full key with its dashes", async () => {
		const spy = vi.fn().mockResolvedValue(undefined)
		Object.assign(navigator, { clipboard: { writeText: spy } })
		render(<RecoveryKey value={KEY} />)
		await userEvent.click(screen.getByRole("button", { name: "複製" }))
		expect(spy).toHaveBeenCalledWith(KEY)
		expect(await screen.findByRole("button", { name: "✓ 已複製" })).toBeInTheDocument()
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
