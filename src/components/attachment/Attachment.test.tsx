import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { AttachmentGrid, AttachmentTile } from "./Attachment"

describe("AttachmentTile", () => {
	test("圖片鋪滿格子,說明是它的名字", () => {
		const { container } = render(
			<AttachmentGrid>
				<AttachmentTile name="收據.png" label="PNG" preview="blob:receipt" />
				<AttachmentTile name="合約.pdf" label="PDF" />
			</AttachmentGrid>,
		)
		const [photo, file] = screen.getAllByRole("figure")
		expect(photo?.querySelector("img")).toHaveAttribute("src", "blob:receipt")
		expect(photo).toHaveTextContent("收據.pngPNG")
		expect(file?.querySelector("img")).toBeNull()
		expect(file?.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
		expect(container.firstElementChild?.children).toHaveLength(2)
	})
})
