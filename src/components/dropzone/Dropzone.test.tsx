import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { Dropzone, type UploadJob, UploadList } from "./Dropzone"

function file(name: string, size: number, type = "text/plain") {
	const value = new File(["x"], name, { type })
	Object.defineProperty(value, "size", { value: size })
	return value
}

function drag(files: File[]) {
	return { dataTransfer: { files, types: ["Files"], dropEffect: "" } }
}

describe("Dropzone", () => {
	test("renders a real file-picker button, so drag is never the only way in", async () => {
		render(<Dropzone onFiles={() => {}} />)
		await userEvent.tab()
		expect(screen.getByRole("button", { name: "選擇檔案" })).toHaveFocus()
	})

	test("choosing files reports them and lets the same file be picked again", async () => {
		const onFiles = vi.fn()
		render(<Dropzone onFiles={onFiles} />)
		const input = document.querySelector("input[type='file']") as HTMLInputElement
		await userEvent.upload(input, file("a.txt", 10))
		expect(onFiles).toHaveBeenCalledTimes(1)
		expect(input.value).toBe("")
	})

	test("dropping files reports them and clears the highlight", () => {
		const onFiles = vi.fn()
		const { container } = render(<Dropzone onFiles={onFiles} />)
		const zone = container.firstElementChild as HTMLElement
		fireEvent.dragEnter(zone, drag([file("a.txt", 10)]))
		fireEvent.drop(zone, drag([file("a.txt", 10)]))
		expect(onFiles).toHaveBeenCalledTimes(1)
	})

	test("ignores drags that carry no files", () => {
		const onFiles = vi.fn()
		const { container } = render(<Dropzone onFiles={onFiles} />)
		const zone = container.firstElementChild as HTMLElement
		fireEvent.drop(zone, { dataTransfer: { files: [], types: ["text/plain"] } })
		expect(onFiles).not.toHaveBeenCalled()
	})

	test("oversize files are rejected without blocking the rest", () => {
		const onFiles = vi.fn()
		const onReject = vi.fn()
		const { container } = render(<Dropzone onFiles={onFiles} onReject={onReject} maxSize={100} />)
		const zone = container.firstElementChild as HTMLElement
		const small = file("small.txt", 10)
		const big = file("big.txt", 1000)
		fireEvent.drop(zone, drag([small, big]))
		expect(onFiles).toHaveBeenCalledWith([small])
		expect(onReject).toHaveBeenCalledWith([{ file: big, reason: "size" }])
	})

	// Drops bypass the input's own accept/multiple, so the zone enforces them.
	test("dropped files outside accept are rejected by type", () => {
		const onFiles = vi.fn()
		const onReject = vi.fn()
		const { container } = render(<Dropzone onFiles={onFiles} onReject={onReject} accept="image/*,.pdf" />)
		const image = file("photo.png", 10, "image/png")
		const pdf = file("Scan.PDF", 10, "application/pdf")
		const text = file("notes.txt", 10)
		fireEvent.drop(container.firstElementChild as HTMLElement, drag([image, pdf, text]))
		expect(onFiles).toHaveBeenCalledWith([image, pdf])
		expect(onReject).toHaveBeenCalledWith([{ file: text, reason: "type" }])
	})

	test("a single-file zone keeps the first dropped file and rejects the rest", () => {
		const onFiles = vi.fn()
		const onReject = vi.fn()
		const { container } = render(<Dropzone onFiles={onFiles} onReject={onReject} multiple={false} />)
		const first = file("a.txt", 10)
		const second = file("b.txt", 10)
		fireEvent.drop(container.firstElementChild as HTMLElement, drag([first, second]))
		expect(onFiles).toHaveBeenCalledWith([first])
		expect(onReject).toHaveBeenCalledWith([{ file: second, reason: "count" }])
	})

	test("the hidden file input is out of the accessibility tree", () => {
		render(<Dropzone onFiles={() => {}} />)
		const input = document.querySelector("input[type='file']") as HTMLInputElement
		expect(input).toHaveAttribute("aria-hidden", "true")
		expect(input).toHaveAttribute("tabindex", "-1")
		expect(screen.getAllByRole("button", { name: "選擇檔案" })).toHaveLength(1)
	})

	test("disabled ignores drops and disables the picker", () => {
		const onFiles = vi.fn()
		const { container } = render(<Dropzone onFiles={onFiles} disabled />)
		fireEvent.drop(container.firstElementChild as HTMLElement, drag([file("a.txt", 10)]))
		expect(onFiles).not.toHaveBeenCalled()
		expect(screen.getByRole("button", { name: "選擇檔案" })).toBeDisabled()
	})
})

const JOBS: UploadJob[] = [
	{ id: "1", name: "護照掃描.pdf", size: 2_400_000, state: "uploading", progress: 45 },
	{ id: "2", name: "big.mov", size: 40_000_000, state: "failed", limit: 10 * 1024 * 1024 },
]

describe("UploadList", () => {
	test("labels the list and each cancel", () => {
		render(<UploadList jobs={JOBS} onCancel={() => {}} />)
		expect(screen.getByRole("list", { name: "上傳中的檔案" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "取消上傳 護照掃描.pdf" })).toBeInTheDocument()
	})

	test("in-flight uploads expose progressbar semantics", () => {
		render(<UploadList jobs={JOBS} />)
		const bar = screen.getByRole("progressbar")
		expect(bar).toHaveAttribute("aria-valuenow", "45")
		expect(bar).toHaveAttribute("aria-valuetext", "護照掃描.pdf 上傳中 45%")
	})

	test("a size rejection names the real limit, not the file's size", () => {
		render(<UploadList jobs={[JOBS[1]]} />)
		const list = screen.getByRole("list")
		expect(list).toHaveTextContent("超過 10 MB 上限，沒有上傳。換一個小於 10 MB 的檔案。")
		expect(list).not.toHaveTextContent("38 MB")
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
	})

	test("any other failure says so without blaming the size", () => {
		render(<UploadList jobs={[{ id: "3", name: "notes.exe", size: 1200, state: "failed" }]} />)
		expect(screen.getByRole("list")).toHaveTextContent("上傳失敗。再試一次，或換一個檔案。")
		expect(screen.getByRole("list")).not.toHaveTextContent("上限")
	})

	test("the caller's own error wins", () => {
		render(
			<UploadList jobs={[{ id: "4", name: "a.txt", size: 10, state: "failed", error: "伺服器忙線。" }]} />,
		)
		expect(screen.getByRole("list")).toHaveTextContent("伺服器忙線。")
	})

	// The live region has to be mounted before the first job arrives, or the
	// first upload is never announced. It holds status words only: no buttons
	// inside it, so nothing interactive is exposed while a modal is open.
	test("a separate status region announces states and holds no controls", () => {
		const { rerender } = render(<UploadList jobs={[]} onCancel={() => {}} />)
		const status = screen.getByRole("status")
		expect(status).toBeEmptyDOMElement()
		expect(screen.getByRole("list", { name: "上傳中的檔案" })).not.toHaveAttribute("aria-live")
		rerender(<UploadList jobs={JOBS} onCancel={() => {}} />)
		expect(status).toHaveTextContent("護照掃描.pdf:上傳中。")
		expect(status).toHaveTextContent("big.mov:超過 10 MB 上限")
		expect(status.querySelector("button")).toBeNull()
	})
})

describe("Dropzone and UploadList words", () => {
	test("follow the LocaleProvider; labels and content props override", () => {
		render(
			<LocaleProvider locale="en">
				<Dropzone onFiles={() => {}} labels={{ pick: "Browse" }} />
				<UploadList jobs={JOBS} onCancel={() => {}} />
			</LocaleProvider>,
		)
		expect(screen.getByText("Drop files here to upload")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Browse" })).toBeInTheDocument()
		expect(screen.getByRole("list", { name: "Uploads" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Cancel upload of 護照掃描.pdf" })).toBeInTheDocument()
		expect(screen.getByRole("status")).toHaveTextContent("護照掃描.pdf: Uploading.")
		expect(screen.getByRole("list")).toHaveTextContent("Over the 10 MB limit")
	})

	test("title, hint and pickLabel still win over the locale", () => {
		render(<Dropzone onFiles={() => {}} title="拖進來" hint="最多 10 MB" pickLabel="挑檔案" />)
		expect(screen.getByText("拖進來")).toBeInTheDocument()
		expect(screen.getByText("最多 10 MB")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "挑檔案" })).toBeInTheDocument()
	})

	test("axe: zone idle and disabled, a list with progress, failure and cancel", async () => {
		const { container } = render(
			<>
				<Dropzone onFiles={() => {}} />
				<Dropzone onFiles={() => {}} disabled />
				<UploadList jobs={JOBS} onCancel={() => {}} />
			</>,
		)
		await expectNoAxeViolations(container)
	})
})
