import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
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

	test("a clipped name keeps the full name on hover", () => {
		render(<FileRow item={FILE} />)
		expect(screen.getByText("護照掃描.pdf")).toHaveAttribute("title", "護照掃描.pdf")
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

	test("uncontrolled: defaultSelected starts it and clicks toggle it", async () => {
		const onSelectedChange = vi.fn()
		render(<FileRow item={FILE} defaultSelected onSelectedChange={onSelectedChange} />)
		const row = screen.getByRole("row")
		expect(row).toHaveAttribute("aria-selected", "true")
		await userEvent.click(row)
		expect(row).toHaveAttribute("aria-selected", "false")
		expect(onSelectedChange).toHaveBeenCalledExactlyOnceWith(false)
		await userEvent.click(screen.getByRole("checkbox"))
		expect(row).toHaveAttribute("aria-selected", "true")
	})

	test("controlled: onSelectedChange asks, the parent decides", async () => {
		const onSelectedChange = vi.fn()
		render(<FileRow item={FILE} selected={false} onSelectedChange={onSelectedChange} />)
		await userEvent.click(screen.getByRole("row"))
		expect(onSelectedChange).toHaveBeenCalledWith(true)
		expect(screen.getByRole("row")).toHaveAttribute("aria-selected", "false")
	})

	test("the checkbox's 24px label toggles the row exactly once", async () => {
		const onSelectedChange = vi.fn()
		render(<FileRow item={FILE} onSelectedChange={onSelectedChange} />)
		const hit = screen.getByRole("checkbox").closest("label") as HTMLElement
		expect(hit).toHaveStyle({ minWidth: "24px", minHeight: "24px" })
		await userEvent.click(hit)
		expect(onSelectedChange).toHaveBeenCalledExactlyOnceWith(true)
		expect(screen.getByRole("row")).toHaveAttribute("aria-selected", "true")
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

	test("words follow the LocaleProvider; labels and the deprecated props override", () => {
		render(
			<LocaleProvider locale="en">
				<FileList label="Files" selectedCount={2}>
					<FileRow item={FILE} />
					<FileRow item={FOLDER} labels={{ select: (name) => `Tick ${name}` }} />
					<FileRow item={FILE} state="encrypting" />
					<FileRow item={{ ...FILE, name: "a.txt" }} state="uploading" progress={12.4} />
				</FileList>
			</LocaleProvider>,
		)
		expect(screen.getByRole("checkbox", { name: "Select 護照掃描.pdf" })).toBeInTheDocument()
		expect(screen.getByRole("checkbox", { name: "Tick 稅務文件" })).toBeInTheDocument()
		expect(screen.getByText("Encrypting")).toBeInTheDocument()
		expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "Uploading a.txt, 12%")
		expect(screen.getByText("2 selected")).toBeInTheDocument()
	})

	test("the deprecated selectedLabel still words the count", () => {
		render(
			<FileList label="檔案" selectedCount={3} selectedLabel={(count) => `${count} 個`}>
				<FileRow item={FILE} />
			</FileList>,
		)
		expect(screen.getByText("3 個")).toBeInTheDocument()
	})

	test("axe: idle, selected, encrypting, uploading rows in a list", async () => {
		const { container } = render(
			<FileList label="檔案" selectedCount={1}>
				<FileRow item={FILE} defaultSelected actions={[{ icon: <svg />, label: "刪除", onAction() {} }]} />
				<FileRow item={FOLDER} />
				<FileRow item={FILE} state="encrypting" />
				<FileRow item={FILE} state="uploading" progress={40} />
			</FileList>,
		)
		await expectNoAxeViolations(container)
	})

	test("an uploading row exposes progress", () => {
		render(<FileRow item={FILE} state="uploading" progress={45} />)
		const bar = screen.getByRole("progressbar")
		expect(bar).toHaveAttribute("aria-valuenow", "45")
		expect(bar).toHaveAttribute("aria-valuetext", "護照掃描.pdf 上傳中 45%")
	})
})
