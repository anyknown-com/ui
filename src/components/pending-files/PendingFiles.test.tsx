import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { PendingFiles } from "./PendingFiles"

describe("PendingFiles", () => {
	test("每個檔案一個 chip,× 拿掉那一個", async () => {
		const onRemove = vi.fn()
		const user = userEvent.setup()
		render(
			<PendingFiles
				files={[
					{ id: "a", name: "receipt.pdf" },
					{ id: "b", name: "photo.png" },
				]}
				onRemove={onRemove}
			/>,
		)
		expect(screen.getByText("receipt.pdf")).toBeInTheDocument()
		await user.click(screen.getByRole("button", { name: "移除 photo.png" }))
		expect(onRemove).toHaveBeenCalledWith("b")
	})

	test("× 的名字可以換語言", () => {
		render(
			<PendingFiles
				files={[{ id: "a", name: "receipt.pdf" }]}
				onRemove={() => {}}
				removeLabel={(name) => `Remove ${name}`}
			/>,
		)
		expect(screen.getByRole("button", { name: "Remove receipt.pdf" })).toBeInTheDocument()
	})

	test("reads English under an en LocaleProvider, and labels override the table", () => {
		render(
			<LocaleProvider locale="en">
				<PendingFiles files={[{ id: "a", name: "receipt.pdf" }]} onRemove={() => {}} />
				<PendingFiles
					files={[{ id: "b", name: "photo.png" }]}
					onRemove={() => {}}
					labels={{ remove: (name) => `Drop ${name}` }}
				/>
			</LocaleProvider>,
		)
		expect(screen.getByRole("button", { name: "Remove receipt.pdf" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Drop photo.png" })).toBeInTheDocument()
	})
})
