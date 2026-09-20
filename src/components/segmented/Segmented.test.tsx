import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { expect, test, vi } from "vitest"
import { Row } from "../group/Group"
import { Segmented } from "./Segmented"

test("a segmented control presses one word", async () => {
	const onChange = vi.fn<(value: string) => void>()
	render(
		<Segmented
			value="en"
			options={[
				{ value: "en", label: "English" },
				{ value: "zh", label: "繁體中文" },
			]}
			onChange={onChange}
			label="語言"
		/>,
	)
	expect(screen.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true")
	await userEvent.click(screen.getByRole("button", { name: "繁體中文" }))
	expect(onChange).toHaveBeenCalledWith("zh")
})

test("a row's press is the whole line", async () => {
	const onPress = vi.fn<() => void>()
	render(
		<Row name="Notion" onPress={onPress} chevron>
			12 支工具
		</Row>,
	)
	await userEvent.click(screen.getByRole("button", { name: /Notion/ }))
	expect(onPress).toHaveBeenCalledOnce()
})
