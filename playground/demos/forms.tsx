import {
	Button,
	Checkbox,
	DropdownCheckboxItem,
	DropdownGroup,
	DropdownItem,
	DropdownMenu,
	DropdownSeparator,
	DropdownSub,
	Field,
	Input,
	Label,
	Radio,
	RadioGroup,
	Select,
	SelectGroup,
	SelectItem,
	Slider,
	Switch,
	Textarea,
	setTextLayoutEngine,
} from "@anyknown/ui"
import * as pretext from "@chenglou/pretext"
import { useState } from "react"
import { type DemoEntry, Demo, Row } from "../shell"

// Browsers without field-sizing measure autoGrow height with Pretext
setTextLayoutEngine(pretext)

const growPath =
	typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")
		? "This browser supports field-sizing, so CSS grows the height."
		: "This browser has no field-sizing, so Pretext measures the height."

const effortLabel = (f: number) =>
	f < 0.03 ? "Auto" : f < 0.3 ? "Low" : f < 0.6 ? "Medium" : f < 0.85 ? "High" : "Max"

function SearchIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
	)
}

function InputDemo() {
	return (
		<Demo id="input" title="input">
			<Field label="Workspace name" help="You can change this later in settings.">
				<Input placeholder="e.g. anyknown" />
			</Field>
			<Input size="sm" aria-label="Search memories" placeholder="Search memories…" />
			<Input aria-label="Search threads" placeholder="Search threads…" leadingIcon={<SearchIcon />} />
			<Field label="Email" error="This email is missing a domain.">
				<Input defaultValue="admin@anyknown" />
			</Field>
			<Input aria-label="Disabled" disabled defaultValue="senlima@anyknown.com" />
		</Demo>
	)
}

function TextareaDemo() {
	const [note, setNote] = useState(
		"Paste this into the next session at handoff.\n\nSecond paragraph: a controlled value. Press Clear and the height shrinks back.",
	)

	return (
		<Demo id="textarea" title="textarea" note={growPath}>
			<Field label="Report a problem">
				<Textarea placeholder="What happened?" />
			</Field>
			<Textarea
				aria-label="Auto-growing"
				autoGrow
				maxRows={8}
				defaultValue="The height follows the text as you type, and a scrollbar appears once it reaches the limit."
				placeholder="Message this thread…"
			/>
			<Textarea
				aria-label="Controlled auto-growing"
				autoGrow
				maxRows={6}
				value={note}
				onChange={(event) => setNote(event.target.value)}
			/>
			<Button variant="secondary" size="sm" onClick={() => setNote("")}>
				Clear
			</Button>
			<Field label="Handoff note" error="200 characters at most; this one has 214.">
				<Textarea defaultValue="This note runs past the 200-character limit." />
			</Field>
		</Demo>
	)
}

function LabelDemo() {
	return (
		<Demo id="label" title="label / field">
			<Label htmlFor="pg-name">Display name</Label>
			<Input id="pg-name" />
			<Field label="Email" required>
				<Input />
			</Field>
			<Field label="Invite code" optional help="With an invite code you join an existing workspace.">
				<Input />
			</Field>
			<Field label="Device name" disabled help="Detected by the system; you can't change it.">
				<Input defaultValue="Senlima's MacBook" />
			</Field>
		</Demo>
	)
}

function CheckboxDemo() {
	return (
		<Demo
			id="checkbox"
			title="checkbox"
			note="Unchecked is a grey ring; checked fills with ink and draws the tick in one stroke."
		>
			<Checkbox defaultChecked label="Remember this device" />
			<Checkbox label="Notify me at handoff" description="Get a desktop notification for every handoff." />
			<Checkbox indeterminate label="Select all memories (3 of 7)" />
			<Checkbox defaultChecked disabled label="End-to-end encryption" description="Always on." />
		</Demo>
	)
}

function RadioDemo() {
	const [threshold, setThreshold] = useState("50")
	const [source, setSource] = useState("claude")

	return (
		<Demo
			id="radio"
			title="radio"
			note="Unselected is a grey ring; selected fills with ink around a light centre dot."
		>
			<RadioGroup legend="Handoff threshold" value={threshold} onValueChange={setThreshold}>
				<Radio
					value="50"
					label="50% (recommended)"
					description="Hand off when half the context is used. The most stable quality."
				/>
				<Radio value="75" label="75%" />
				<Radio
					value="90"
					label="90%"
					description="Hand off close to the limit. The longest single session."
				/>
			</RadioGroup>
			<RadioGroup legend="Subscription" variant="card" value={source} onValueChange={setSource}>
				<Radio value="claude" label="Claude" description="Use your existing Claude subscription." />
				<Radio value="chatgpt" label="ChatGPT" description="Use your existing ChatGPT subscription." />
			</RadioGroup>
		</Demo>
	)
}

function SwitchDemo() {
	return (
		<Demo
			id="switch"
			title="switch"
			note="Off is a grey track, on is an ink track; the knob slides to the other end."
		>
			<Switch defaultChecked label="Voice wake" description="Say “Anyknown” to start talking." />
			<Switch label="Open at login" />
			<Switch
				defaultChecked
				disabled
				label="Local storage"
				description="Always on. Your data never leaves this computer."
			/>
		</Demo>
	)
}

function SelectDemo() {
	const [model, setModel] = useState("")
	const [memories, setMemories] = useState<string[]>([])

	return (
		<Demo id="select" title="select">
			<Select
				aria-label="Choose a model"
				value={model}
				onValueChange={setModel as never}
				placeholder="Choose a model…"
				searchPlaceholder="Search models…"
			>
				<SelectGroup label="Anthropic">
					<SelectItem value="fable-5" hint="Strongest">
						Fable 5
					</SelectItem>
					<SelectItem value="opus-5">Opus 5</SelectItem>
					<SelectItem value="sonnet-5" hint="Fast">
						Sonnet 5
					</SelectItem>
				</SelectGroup>
				<SelectGroup label="OpenAI">
					<SelectItem value="gpt-5.4">GPT-5.4</SelectItem>
					<SelectItem value="gpt-5.4-mini">GPT-5.4 mini</SelectItem>
				</SelectGroup>
			</Select>
			<Select
				aria-label="Choose memories"
				multiple
				value={memories}
				onValueChange={setMemories as never}
				placeholder="Choose memories to carry into the handoff…"
				searchPlaceholder="Search memories…"
			>
				<SelectGroup label="Preferences">
					<SelectItem value="pnpm">Prefers pnpm</SelectItem>
					<SelectItem value="no-comment">Keep comments short</SelectItem>
				</SelectGroup>
				<SelectGroup label="Project">
					<SelectItem value="cf">Deploys to Cloudflare</SelectItem>
					<SelectItem value="desktop-first">Desktop ships first</SelectItem>
				</SelectGroup>
			</Select>
		</Demo>
	)
}

function SliderDemo() {
	const [effort, setEffort] = useState(0)

	return (
		<Demo
			id="slider"
			title="slider"
			note="Continuous, with no stops. Arrow keys move 5%; Home and End jump to either end."
		>
			<Slider
				value={effort}
				onChange={setEffort}
				label={`Thinking · ${effortLabel(effort)}`}
				valueText={() => effortLabel(effort)}
			/>
			<Slider value={0.4} onChange={() => {}} disabled aria-label="Thinking effort (disabled)" />
		</Demo>
	)
}

function DropdownDemo() {
	const [receipts, setReceipts] = useState(false)

	return (
		<Demo id="dropdown" title="dropdown">
			<Row>
				<DropdownMenu trigger={<Button variant="secondary">Thread actions</Button>}>
					<DropdownGroup label="This thread">
						<DropdownItem shortcut="⌘N">Add a handoff note</DropdownItem>
						<DropdownItem shortcut="⌘F">Search this day</DropdownItem>
						<DropdownSub label="Export">
							<DropdownItem>Markdown</DropdownItem>
							<DropdownItem>JSON</DropdownItem>
							<DropdownSub label="Range…">
								<DropdownItem>Today only</DropdownItem>
								<DropdownItem>Whole thread</DropdownItem>
							</DropdownSub>
						</DropdownSub>
					</DropdownGroup>
					<DropdownSeparator />
					<DropdownCheckboxItem checked={receipts} onCheckedChange={setReceipts}>
						Show handoff receipts
					</DropdownCheckboxItem>
					<DropdownItem variant="danger">Delete this day's history</DropdownItem>
				</DropdownMenu>
			</Row>
		</Demo>
	)
}

export const formsDemos: DemoEntry[] = [
	{ id: "input", covers: ["input"], Component: InputDemo },
	{ id: "textarea", covers: ["textarea"], Component: TextareaDemo },
	{ id: "label", covers: ["label"], Component: LabelDemo },
	{ id: "checkbox", covers: ["checkbox"], Component: CheckboxDemo },
	{ id: "radio", covers: ["radio"], Component: RadioDemo },
	{ id: "switch", covers: ["switch"], Component: SwitchDemo },
	{ id: "select", covers: ["select"], Component: SelectDemo },
	{ id: "slider", covers: ["slider"], Component: SliderDemo },
	{ id: "dropdown", covers: ["dropdown"], Component: DropdownDemo },
]
