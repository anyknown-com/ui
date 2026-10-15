// An account settings page: general settings that apply at once, the plan with this month's
// usage, and signed-in devices, where revoking one goes through a confirm dialog and a toast.
import {
	Button,
	ConfirmDialog,
	Ghost,
	Group,
	GroupCell,
	PageHead,
	PageNumber,
	SectionLabel,
	Segmented,
	Select,
	SelectItem,
	SettingsRow,
	SettingsRows,
	SettingsValue,
	StatBar,
	Switch,
	toast,
} from "@anyknown/ui"
import { breakpoint, space } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { useState } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet } from "./Sheet"

export const meta: SceneMeta = {
	id: "settings-and-plan",
	title: "Settings and plan",
	moment:
		"You change how the app behaves, check how much of your plan is left this month, and sign out a laptop you no longer use.",
	decisions: [
		"Settings sit on recessed surfaces, one row per setting, the name on the left and the control on the right.",
		"A switch applies at once; there is no save button to forget.",
		"Usage is a thin ink reading with the numbers in words, not a blue loading bar: nothing is running.",
		"Revoke is the only red on the page, and its confirm dialog says what the device loses and how to get it back.",
	],
	uses: ["page", "settings-rows", "segmented", "select", "switch", "group", "button", "dialog"],
}

const MOBILE = breakpoint.phone

type Device = { id: string; name: string; detail: string; current?: boolean }

const DEVICES: Device[] = [
	{ id: "mbp", name: "MacBook Pro 14", detail: "Anyknown Desktop on macOS · active now", current: true },
	{ id: "iphone", name: "iPhone 17", detail: "Anyknown for iOS · last seen 2 hours ago" },
	{ id: "thinkpad", name: "ThinkPad X1", detail: "Anyknown Desktop on Windows · last seen Aug 3" },
]

const THEMES = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
]

const styles = stylex.create({
	sheet: { minHeight: "40rem" },
	scroll: {
		flexGrow: 1,
		minHeight: 0,
		overflowY: "auto",
		paddingBlock: { default: space.lg, [MOBILE]: space.md },
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	column: { maxWidth: "42rem", marginInline: "auto", display: "grid" },
	// Too long next to the segmented control on a phone.
	wide: { display: { default: "inline", [MOBILE]: "none" } },
	select: { width: { default: "11rem", [MOBILE]: "8.5rem" } },
})

export function Scene({ compact }: SceneProps) {
	const [theme, setTheme] = useState("system")
	const [model, setModel] = useState("opus-5")
	const [login, setLogin] = useState(true)
	const [needsYou, setNeedsYou] = useState(true)
	const [digest, setDigest] = useState(false)
	const [devices, setDevices] = useState(DEVICES)

	const revoke = (device: Device) => {
		setDevices((current) => current.filter((d) => d.id !== device.id))
		toast.success(`${device.name} revoked`, {
			description: "It is signed out and can no longer open your vault.",
		})
	}

	return (
		<Sheet fill={compact} sx={!compact && styles.sheet}>
			<div {...stylex.props(styles.scroll)}>
				<div {...stylex.props(styles.column)}>
					<Part name="page">
						<PageHead title="Settings" lead="mei.chen@example.com" />
					</Part>

					<SectionLabel first>General</SectionLabel>
					<Part name="settings-rows">
						<SettingsRows>
							<SettingsRow
								label="Appearance"
								help={
									compact ? undefined : (
										<span {...stylex.props(styles.wide)}>Follow your system, or keep one look.</span>
									)
								}
							>
								<Part name="segmented" inline>
									<Segmented label="Appearance" value={theme} onValueChange={setTheme} options={THEMES} />
								</Part>
							</SettingsRow>
							{compact ? null : (
								<SettingsRow label="Default model" help="Used for new threads.">
									<Part name="select" inline>
										<div {...stylex.props(styles.select)}>
											<Select
												aria-label="Default model"
												value={model}
												onValueChange={(next: string) => setModel(next)}
											>
												<SelectItem value="fable-5" hint="Strongest">
													Fable 5
												</SelectItem>
												<SelectItem value="opus-5">Opus 5</SelectItem>
												<SelectItem value="sonnet-5" hint="Fast">
													Sonnet 5
												</SelectItem>
											</Select>
										</div>
									</Part>
								</SettingsRow>
							)}
							{compact ? null : (
								<SettingsRow label="Open at login" help="Start Anyknown when you sign in to this computer.">
									<Part name="switch" inline>
										<Switch checked={login} onCheckedChange={setLogin} aria-label="Open at login" />
									</Part>
								</SettingsRow>
							)}
							<SettingsRow
								label="When the agent needs you"
								help="Notify me when a question or permission waits."
							>
								<Switch
									checked={needsYou}
									onCheckedChange={setNeedsYou}
									aria-label="When the agent needs you"
								/>
							</SettingsRow>
							{compact ? null : (
								<SettingsRow label="Weekly summary" help="An email every Monday with what your agents did.">
									<Switch checked={digest} onCheckedChange={setDigest} aria-label="Weekly summary" />
								</SettingsRow>
							)}
						</SettingsRows>
					</Part>

					<SectionLabel>Plan and usage</SectionLabel>
					<Part name="group">
						<Group
							footer={
								compact
									? undefined
									: "Usage resets on Nov 1. If you reach a limit, agents pause until then; nothing is charged without asking you."
							}
						>
							<GroupCell
								label="Pro"
								detail="$20 a month · renews Nov 1"
								control={
									<Part name="button" inline>
										<Button
											variant="secondary"
											size="sm"
											onClick={() =>
												toast("Plans are a demo here", {
													description: "Nothing is billed from ui.anyknown.com.",
												})
											}
										>
											Change plan
										</Button>
									</Part>
								}
							/>
							<GroupCell
								label="Agent hours"
								detail="31 of 40 hours used"
								control={<StatBar percent={78} label="Agent hours used" text="31 of 40 hours" />}
							/>
							{compact ? null : (
								<GroupCell
									label="Vault storage"
									detail="12.4 of 50 GB used"
									control={<StatBar percent={25} label="Vault storage used" text="12.4 of 50 GB" />}
								/>
							)}
						</Group>
					</Part>

					{compact ? null : (
						<>
							<SectionLabel end={<PageNumber>{devices.length}</PageNumber>}>Signed-in devices</SectionLabel>
							<SettingsRows>
								{devices.map((device) => (
									<SettingsRow key={device.id} label={device.name} help={device.detail}>
										{device.current ? (
											<SettingsValue>This device</SettingsValue>
										) : (
											<Part name="dialog" inline>
												<ConfirmDialog
													trigger={
														<Ghost danger aria-label={`Revoke ${device.name}`}>
															Revoke…
														</Ghost>
													}
													title={`Revoke ${device.name}?`}
													description="It is signed out at once and can no longer open your vault. To use it again, sign in on it and enter your recovery key."
													danger
													confirmLabel="Revoke device"
													onConfirm={() => revoke(device)}
												/>
											</Part>
										)}
									</SettingsRow>
								))}
							</SettingsRows>
						</>
					)}
				</div>
			</div>
		</Sheet>
	)
}
