import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { describe, expect, test, vi } from "vitest"
import { expectNoAxeViolations } from "../../test/axe"
import { Ghost, GhostLink } from "./Ghost"

describe("Ghost", () => {
	test("is a type=button that clicks", async () => {
		const onClick = vi.fn()
		render(<Ghost onClick={onClick}>編輯</Ghost>)
		const button = screen.getByRole("button", { name: "編輯" })
		expect(button).toHaveAttribute("type", "button")
		await userEvent.click(button)
		expect(onClick).toHaveBeenCalledOnce()
	})

	test("disabled does not click; danger draws differently", async () => {
		const onClick = vi.fn()
		render(
			<>
				<Ghost disabled onClick={onClick}>
					停用
				</Ghost>
				<Ghost>一般</Ghost>
				<Ghost danger>刪除</Ghost>
			</>,
		)
		await userEvent.click(screen.getByRole("button", { name: "停用" }))
		expect(onClick).not.toHaveBeenCalled()
		expect(screen.getByRole("button", { name: "刪除" }).className).not.toBe(
			screen.getByRole("button", { name: "一般" }).className,
		)
	})

	test("forwards its ref", () => {
		const ref = createRef<HTMLButtonElement>()
		render(<Ghost ref={ref}>編輯</Ghost>)
		expect(ref.current).toBe(screen.getByRole("button"))
	})
})

describe("GhostLink", () => {
	test("a plain link stays in the tab", () => {
		render(<GhostLink href="/docs">文件</GhostLink>)
		const link = screen.getByRole("link", { name: "文件" })
		expect(link).toHaveAttribute("href", "/docs")
		expect(link).not.toHaveAttribute("target")
	})

	test("external opens a new tab without the opener", () => {
		render(
			<GhostLink href="https://anyknown.com" external>
				官網
			</GhostLink>,
		)
		const link = screen.getByRole("link", { name: "官網" })
		expect(link).toHaveAttribute("target", "_blank")
		expect(link).toHaveAttribute("rel", "noreferrer")
	})
})

test("axe: ghost, danger, disabled and a link", async () => {
	const { container } = render(
		<>
			<Ghost>編輯</Ghost>
			<Ghost danger>刪除</Ghost>
			<Ghost disabled>停用</Ghost>
			<GhostLink href="/docs">文件</GhostLink>
		</>,
	)
	await expectNoAxeViolations(container)
})
