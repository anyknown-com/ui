import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"
import { Bubble } from "./Bubble"

describe("Bubble", () => {
	test("人說的話照打的樣子顯示,不當 markdown", () => {
		render(<Bubble from="user">{"**先**看記憶"}</Bubble>)
		expect(screen.getByText("**先**看記憶")).toBeInTheDocument()
	})

	test("回覆是 markdown,表格是 ruled 的", () => {
		render(<Bubble from="assistant">{"**好**\n\n| 項目 |\n| --- |\n| 房租 |"}</Bubble>)
		expect(screen.getByText("好").tagName).toBe("STRONG")
		expect(screen.getByRole("columnheader", { name: "項目" })).toHaveStyle({ fontWeight: "500" })
		expect(screen.getByRole("cell", { name: "房租" })).toHaveStyle({ borderBottomWidth: "0px" })
	})
})
