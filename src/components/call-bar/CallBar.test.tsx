import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { CallBar } from "./CallBar"

describe("CallBar", () => {
	test("說出通話在做什麼、跑了多久", () => {
		const { rerender } = render(
			<CallBar status="listening" seconds={75} muted={false} onMute={() => {}} onHangUp={() => {}} />,
		)
		expect(screen.getByRole("group", { name: "通話" })).toHaveTextContent("通話中01:15")

		rerender(<CallBar status="thinking" seconds={76} muted={false} onMute={() => {}} onHangUp={() => {}} />)
		expect(screen.getByText("思考中")).toBeInTheDocument()
		expect(screen.getByText("01:16")).toBeInTheDocument()
	})

	test("靜音蓋過狀態;按鈕交出要切到的靜音狀態", async () => {
		const onMute = vi.fn()
		const user = userEvent.setup()
		const { rerender } = render(
			<CallBar status="speaking" seconds={3} muted={false} onMute={onMute} onHangUp={() => {}} />,
		)
		await user.click(screen.getByRole("button", { name: "靜音" }))
		expect(onMute).toHaveBeenLastCalledWith(true)

		rerender(<CallBar status="speaking" seconds={3} muted onMute={onMute} onHangUp={() => {}} />)
		expect(screen.getByText("已靜音")).toBeInTheDocument()
		await user.click(screen.getByRole("button", { name: "取消靜音" }))
		expect(onMute).toHaveBeenLastCalledWith(false)
	})

	test("掛斷", async () => {
		const onHangUp = vi.fn()
		const user = userEvent.setup()
		render(<CallBar status="listening" seconds={0} muted={false} onMute={() => {}} onHangUp={onHangUp} />)
		await user.click(screen.getByRole("button", { name: "掛斷" }))
		expect(onHangUp).toHaveBeenCalledOnce()
	})

	test("字可以換語言,沒換的留預設", () => {
		render(
			<CallBar
				status="listening"
				seconds={0}
				muted={false}
				onMute={() => {}}
				onHangUp={() => {}}
				labels={{ listening: "On a call", hangUp: "Hang up" }}
			/>,
		)
		expect(screen.getByText("On a call")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Hang up" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "靜音" })).toBeInTheDocument()
	})
})
