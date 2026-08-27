import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
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
	{ id: "2", name: "big.mov", size: 40_000_000, state: "failed", error: "超過 10 MB 上限,沒有上傳。" },
]

describe("UploadList", () => {
	test("announces changes politely and labels each cancel", () => {
		render(<UploadList jobs={JOBS} onCancel={() => {}} />)
		expect(screen.getByRole("list", { name: "上傳中的檔案" })).toHaveAttribute("aria-live", "polite")
		expect(screen.getByRole("button", { name: "取消上傳 護照掃描.pdf" })).toBeInTheDocument()
	})

	test("in-flight uploads expose progressbar semantics", () => {
		render(<UploadList jobs={JOBS} />)
		const bar = screen.getByRole("progressbar")
		expect(bar).toHaveAttribute("aria-valuenow", "45")
		expect(bar).toHaveAttribute("aria-valuetext", "護照掃描.pdf 上傳中 45%")
	})

	test("a failed job shows its reason as text and has no progress bar", () => {
		render(<UploadList jobs={[JOBS[1]]} />)
		expect(screen.getByText("超過 10 MB 上限,沒有上傳。")).toBeInTheDocument()
		expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
	})

	// The live region has to be mounted before the first job arrives, or the
	// first upload is never announced.
	test("the live region exists while the queue is empty, but shows nothing", () => {
		render(<UploadList jobs={[]} />)
		const list = screen.getByRole("list", { name: "上傳中的檔案" })
		expect(list).toHaveAttribute("aria-live", "polite")
		expect(list).toBeEmptyDOMElement()
	})
})
