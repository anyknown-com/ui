import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { AttachButton } from "./AttachButton"

function picker(container: HTMLElement) {
	const input = container.querySelector<HTMLInputElement>("input[type=file]")
	if (input === null) throw new Error("no file input")
	return input
}

describe("AttachButton", () => {
	test("按鈕打開檔案選擇器,選到的檔案交出去,同一個檔案可以再選一次", async () => {
		const onFiles = vi.fn()
		const user = userEvent.setup()
		const { container } = render(<AttachButton onFiles={onFiles} />)
		const input = picker(container)
		const click = vi.spyOn(input, "click")

		await user.click(screen.getByRole("button", { name: "附加檔案" }))
		expect(click).toHaveBeenCalledOnce()

		const file = new File(["收據"], "receipt.pdf", { type: "application/pdf" })
		await user.upload(input, file)
		expect(onFiles).toHaveBeenCalledWith([file])
		expect(input.value).toBe("")
	})

	test("檔案輸入藏起來、不進 tab 序;鍵盤只摸得到按鈕", async () => {
		const user = userEvent.setup()
		const { container } = render(<AttachButton onFiles={() => {}} accept="image/*" multiple={false} />)
		const input = picker(container)
		expect(input).not.toBeVisible()
		expect(input).toHaveAttribute("accept", "image/*")
		expect(input.multiple).toBe(false)

		await user.tab()
		expect(screen.getByRole("button", { name: "附加檔案" })).toHaveFocus()
		await user.tab()
		expect(input).not.toHaveFocus()
	})

	test("停用時按鈕與輸入都停用", () => {
		const { container } = render(<AttachButton onFiles={() => {}} disabled />)
		expect(screen.getByRole("button", { name: "附加檔案" })).toBeDisabled()
		expect(picker(container)).toBeDisabled()
	})

	test("reads English under an en LocaleProvider; label wins over labels", () => {
		render(
			<LocaleProvider locale="en">
				<AttachButton onFiles={() => {}} />
				<AttachButton onFiles={() => {}} label="Prop" labels={{ attach: "Labels" }} />
			</LocaleProvider>,
		)
		expect(screen.getByRole("button", { name: "Attach files" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Prop" })).toBeInTheDocument()
	})
})
