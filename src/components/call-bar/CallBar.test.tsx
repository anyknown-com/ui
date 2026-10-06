import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, test, vi } from "vitest"
import { LocaleProvider } from "../../lib/i18n"
import { expectNoAxeViolations } from "../../test/axe"
import { CallBar, type CallStatus } from "./CallBar"

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
		const mute = screen.getByRole("button", { name: "靜音" })
		expect(mute).toHaveAttribute("aria-pressed", "false")
		await user.click(mute)
		expect(onMute).toHaveBeenLastCalledWith(true)

		rerender(<CallBar status="speaking" seconds={3} muted onMute={onMute} onHangUp={() => {}} />)
		expect(screen.getByText("已靜音")).toBeInTheDocument()
		// A toggle keeps its name; the state lives in aria-pressed (WAI-ARIA APG button pattern).
		expect(screen.getByRole("button", { name: "靜音", pressed: true })).toBeInTheDocument()
		await user.click(screen.getByRole("button", { name: "靜音" }))
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

	test.each<CallStatus>([
		"listening",
		"user-speaking",
		"transcribing",
		"holding",
		"thinking",
		"speaking",
		"interrupted",
	])("沒有 axe 違規:%s,開著或靜音", async (status) => {
		const { container, rerender } = render(
			<CallBar status={status} seconds={42} muted={false} onMute={() => {}} onHangUp={() => {}} />,
		)
		await expectNoAxeViolations(container)
		rerender(<CallBar status={status} seconds={42} muted onMute={() => {}} onHangUp={() => {}} />)
		await expectNoAxeViolations(container)
	})

	test("the mute button keeps its tooltip while muted", async () => {
		const user = userEvent.setup()
		render(<CallBar status="listening" seconds={0} muted onMute={() => {}} onHangUp={() => {}} />)
		await user.tab()
		expect(screen.getByRole("button", { name: "靜音", pressed: true })).toHaveFocus()
		expect(await screen.findByText("靜音", { selector: ":not(button)" })).toBeInTheDocument()
	})

	test("follow the LocaleProvider; labels still win", () => {
		render(
			<LocaleProvider locale="en">
				<CallBar
					status="thinking"
					seconds={0}
					muted
					onMute={() => {}}
					onHangUp={() => {}}
					labels={{ hangUp: "End call" }}
				/>
			</LocaleProvider>,
		)
		expect(screen.getByRole("group", { name: "Call" })).toHaveTextContent("Muted")
		expect(screen.getByRole("button", { name: "Mute", pressed: true })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "End call" })).toBeInTheDocument()
	})
})
