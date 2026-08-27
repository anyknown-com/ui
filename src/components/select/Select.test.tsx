import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, test, vi } from "vitest"
import { Select, SelectGroup, SelectItem } from "./Select"

function Models({ onValueChange }: { onValueChange?: (v: string) => void }) {
	const [value, setValue] = useState("")
	return (
		<Select
			aria-label="選擇模型"
			value={value}
			placeholder="選擇模型…"
			searchPlaceholder="搜尋模型…"
			onValueChange={
				((v: string) => {
					setValue(v)
					onValueChange?.(v)
				}) as never
			}
		>
			<SelectGroup label="Anthropic">
				<SelectItem value="fable-5" hint="最強">
					Fable 5
				</SelectItem>
				<SelectItem value="opus-5">Opus 5</SelectItem>
			</SelectGroup>
			<SelectGroup label="OpenAI">
				<SelectItem value="gpt-5.4">GPT-5.4</SelectItem>
			</SelectGroup>
		</Select>
	)
}

function Memories({ onValueChange }: { onValueChange?: (v: string[]) => void }) {
	const [value, setValue] = useState<string[]>([])
	return (
		<Select
			aria-label="選擇記憶"
			multiple
			value={value}
			placeholder="選擇要帶進交接的記憶…"
			onValueChange={
				((v: string[]) => {
					setValue(v)
					onValueChange?.(v)
				}) as never
			}
		>
			<SelectItem value="pnpm">偏好 pnpm</SelectItem>
			<SelectItem value="cf">部署走 Cloudflare</SelectItem>
		</Select>
	)
}

describe("Select", () => {
	test("renders a collapsed trigger showing the placeholder", () => {
		render(<Models />)
		expect(screen.getByRole("combobox", { name: "選擇模型" })).toBeInTheDocument()
		expect(screen.getByText("選擇模型…")).toBeInTheDocument()
	})

	test("opens on click and lists grouped options", async () => {
		render(<Models />)
		await userEvent.click(screen.getByRole("combobox", { name: "選擇模型" }))
		const listbox = await screen.findByRole("listbox")
		expect(within(listbox).getAllByRole("option")).toHaveLength(3)
		expect(screen.getByText("Anthropic")).toBeInTheDocument()
		expect(screen.getByText("OpenAI")).toBeInTheDocument()
	})

	test("filters by the search box and shows the query in the empty state", async () => {
		render(<Models />)
		await userEvent.click(screen.getByRole("combobox", { name: "選擇模型" }))
		const search = await screen.findByRole("combobox", { name: "搜尋選項" })
		await userEvent.type(search, "opus")
		await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1))
		await userEvent.clear(search)
		await userEvent.type(search, "zzz")
		expect(await screen.findByText(/zzz/)).toBeInTheDocument()
	})

	test("selects with the keyboard and closes", async () => {
		const onValueChange = vi.fn()
		render(<Models onValueChange={onValueChange} />)
		const trigger = screen.getByRole("combobox", { name: "選擇模型" })
		trigger.focus()
		await userEvent.keyboard("{Enter}")
		await screen.findByRole("listbox")
		await userEvent.keyboard("{ArrowDown}{Enter}")
		await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("fable-5"))
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
	})

	test("Escape closes the popup", async () => {
		render(<Models />)
		await userEvent.click(screen.getByRole("combobox", { name: "選擇模型" }))
		await screen.findByRole("listbox")
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
	})

	test("multiple keeps the popup open and renders removable chips", async () => {
		const onValueChange = vi.fn()
		render(<Memories onValueChange={onValueChange} />)
		await userEvent.click(screen.getByRole("combobox", { name: "選擇記憶" }))
		await userEvent.click(await screen.findByRole("option", { name: /偏好 pnpm/ }))
		await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(["pnpm"]))
		expect(screen.getByRole("listbox")).toBeInTheDocument()
		await userEvent.click(screen.getByRole("button", { name: "移除 偏好 pnpm" }))
		await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith([]))
	})
})

describe("Select uncontrolled", () => {
	test("updates the trigger without a value prop", async () => {
		render(
			<Select aria-label="無控" placeholder="選擇模型…">
				<SelectItem value="opus-5">Opus 5</SelectItem>
			</Select>,
		)
		await userEvent.click(screen.getByRole("combobox", { name: "無控" }))
		await userEvent.click(await screen.findByRole("option", { name: "Opus 5" }))
		await waitFor(() => expect(screen.getByRole("combobox", { name: "無控" })).toHaveTextContent("Opus 5"))
	})
})

describe("Select accessibility", () => {
	// role="combobox" forbids name-from-content, so the value is exposed with the APG
	// select-only pattern: aria-labelledby = "<label> <trigger itself>".
	test("the trigger's name references both its label and its own value", async () => {
		render(
			<Select aria-label="模型" placeholder="選擇模型…">
				<SelectItem value="fable-5">Fable 5</SelectItem>
			</Select>,
		)
		const trigger = screen.getByRole("combobox", { name: "模型" })
		const [labelRef, selfRef] = (trigger.getAttribute("aria-labelledby") ?? "").split(" ")
		expect(document.getElementById(labelRef)).toHaveTextContent("模型")
		expect(selfRef).toBe(trigger.id)
		expect(trigger).toHaveTextContent("選擇模型…")
		await userEvent.click(trigger)
		await userEvent.click(await screen.findByRole("option", { name: "Fable 5" }))
		await waitFor(() => expect(trigger).toHaveTextContent("Fable 5"))
	})

	test("removing a chip does not open the popup", async () => {
		render(<Memories />)
		await userEvent.click(screen.getByRole("combobox", { name: "選擇記憶" }))
		await userEvent.click(await screen.findByRole("option", { name: /偏好 pnpm/ }))
		await userEvent.keyboard("{Escape}")
		await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
		await userEvent.click(screen.getByRole("button", { name: "移除 偏好 pnpm" }))
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
	})
})
