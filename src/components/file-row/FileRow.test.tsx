import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { FileList, FileRow } from "./FileRow"

const FILE = { kind: "file" as const, name: "護照掃描.pdf", size: 2_400_000, mtime: "8月26日" }
const FOLDER = { kind: "folder" as const, name: "稅務文件", mtime: "8月20日" }

describe("FileRow", () => {
	test("a list is a grid and each row reports its selection state", () => {
		render(
			<FileList label="檔案">
				<FileRow item={FILE} />
			</FileList>,
		)
		expect(screen.getByRole("grid", { name: "檔案" })).toBeInTheDocument()
		expect(screen.getByRole("row")).toHaveAttribute("aria-selected", "false")
	})

	test("the checkbox names what it selects", () => {
		render(<FileRow item={FILE} />)
		expect(screen.getByRole("checkbox", { name: "選取 護照掃描.pdf" })).toBeInTheDocument()
	})

	test("clicking the row toggles selection; the checkbox does not double-toggle", async () => {
		function Row() {
			const [selected, setSelected] = useState(false)
			return <FileRow item={FILE} selected={selected} onSelectChange={setSelected} />
		}
		render(<Row />)
		await userEvent.click(screen.getByRole("row"))
		expect(screen.getByRole("row")).toHaveAttribute("aria-selected", "true")
		await userEvent.click(screen.getByRole("checkbox"))
		expect(screen.getByRole("row")).toHaveAttribute("aria-selected", "false")
	})

	test("double-click opens without undoing the first click's selection", async () => {
		const onOpen = vi.fn()
		function Row() {
			const [selected, setSelected] = useState(false)
			return <FileRow item={FOLDER} selected={selected} onSelectChange={setSelected} onOpen={onOpen} />
		}
		render(<Row />)
		await userEvent.dblClick(screen.getByRole("row"))
		expect(screen.getByRole("row")).toHaveAttribute("aria-selected", "true")
		expect(onOpen).toHaveBeenCalledTimes(1)
	})

	test("Space selects and Enter opens", async () => {
		const onSelectChange = vi.fn()
		const onOpen = vi.fn()
		render(<FileRow item={FOLDER} onSelectChange={onSelectChange} onOpen={onOpen} />)
		screen.getByRole("row").focus()
		await userEvent.keyboard(" ")
		expect(onSelectChange).toHaveBeenCalledWith(true)
		await userEvent.keyboard("{Enter}")
		expect(onOpen).toHaveBeenCalledTimes(1)
	})

	test("actions name the file and do not select the row", async () => {
		const onAction = vi.fn()
		const onSelectChange = vi.fn()
		render(
			<FileRow
				item={FILE}
				onSelectChange={onSelectChange}
				actions={[{ icon: <svg />, label: "刪除 護照掃描.pdf", onAction }]}
			/>,
		)
		await userEvent.click(screen.getByRole("button", { name: "刪除 護照掃描.pdf" }))
		expect(onAction).toHaveBeenCalledTimes(1)
		expect(onSelectChange).not.toHaveBeenCalled()
	})

	test("folders show a dash instead of a size", () => {
		render(<FileRow item={FOLDER} />)
		expect(screen.getByText("—")).toBeInTheDocument()
	})

	test("files show a formatted size", () => {
		render(<FileRow item={FILE} />)
		expect(screen.getByText("2.3 MB")).toBeInTheDocument()
	})

	test("a busy row is aria-busy with no checkbox or actions", () => {
		render(
			<FileRow
				item={FILE}
				state="encrypting"
				actions={[{ icon: <svg />, label: "刪除", onAction: () => {} }]}
			/>,
		)
		const row = screen.getByRole("row")
		expect(row).toHaveAttribute("aria-busy", "true")
		expect(row).toHaveAttribute("tabindex", "0")
		expect(row).toHaveAttribute("aria-selected", "false")
		expect(screen.queryByRole("checkbox")).not.toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	test("an uploading row exposes progress", () => {
		render(<FileRow item={FILE} state="uploading" progress={45} />)
		const bar = screen.getByRole("progressbar")
		expect(bar).toHaveAttribute("aria-valuenow", "45")
		expect(bar).toHaveAttribute("aria-valuetext", "護照掃描.pdf 上傳中 45%")
	})
})
