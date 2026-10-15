// A personal vault in three states: locked (passphrase), open (file rows, one upload still
// encrypting), and a new-vault path that shows the recovery key once. Any passphrase unlocks.
import {
	Button,
	EmptyState,
	Field,
	FileList,
	FileRow,
	type FileItem,
	ICON_STROKE,
	PasswordInput,
	RecoveryKey,
	icon,
	toast,
} from "@anyknown/ui"
import { breakpoint, color, font, space, type } from "@anyknown/ui/tokens.stylex"
import * as stylex from "@stylexjs/stylex"
import { type FormEvent, type ReactNode, useCallback, useState } from "react"
import { Part } from "./Inspect"
import type { SceneMeta, SceneProps } from "./scene"
import { Sheet } from "./Sheet"

export const meta: SceneMeta = {
	id: "vault",
	title: "Open the vault",
	moment:
		"Your files are encrypted on your device before they upload. You unlock them with a passphrase, and when you set up a new vault, its recovery key is shown once.",
	decisions: [
		"File rows sit on one rest card with hairlines between them, not a frame around each row.",
		"A file that is still encrypting or uploading stays in the same list, so you never look in two places.",
		"The unlock error says what to do next instead of apologizing.",
		"The recovery key is shown once, blurred until you look, and the vault stays shut until you confirm you wrote it down.",
	],
	uses: ["file-row", "password-input", "recovery-key", "button", "label", "empty-state"],
}

const MOBILE = breakpoint.phone

const KEY = "K7PQ-WM2X-9RDF-H4TN-ZC8B-JE6V-A3YS-UG5L"

const FILES: FileItem[] = [
	{ kind: "folder", name: "Tax documents", mtime: "Oct 2" },
	{ kind: "folder", name: "Medical", mtime: "Sep 18" },
	{ kind: "file", name: "lease-agreement-2026.pdf", size: 860_000, mtime: "Sep 30" },
	{ kind: "file", name: "passport-scan.pdf", size: 2_400_000, mtime: "Aug 26" },
	{ kind: "file", name: "family-photo-2025.jpg", size: 11_800_000, mtime: "Aug 12" },
	{ kind: "file", name: "insurance-card.png", size: 1_300_000, mtime: "Jul 4" },
]

const UPLOAD: FileItem = { kind: "file", name: "car-registration.pdf", size: 540_000, mtime: "Just now" }

// The upload clock, in 100ms ticks: encrypt, then upload, then the row settles.
const T = { upload: 12, done: 40 }
const LOOP = 70

type Step = "locked" | "unlocking" | "open" | "create" | "key" | "fresh"

const styles = stylex.create({
	sheet: { minHeight: { default: "32rem", [MOBILE]: "30rem" } },
	header: {
		display: "flex",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "space-between",
		gap: space.sm,
		paddingBlock: space.md,
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	heading: { minWidth: 0 },
	name: {
		fontFamily: font.display,
		fontSize: type.t5,
		lineHeight: type.dense,
		fontWeight: 600,
		margin: 0,
	},
	sub: { fontSize: type.t2, lineHeight: type.body, color: color.textMuted, margin: 0 },
	actions: { display: "flex", gap: space.xs },
	body: {
		flexGrow: 1,
		paddingBlockEnd: space.lg,
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	// The locked and set-up screens: one narrow column in the middle of the sheet.
	gate: {
		flexGrow: 1,
		display: "grid",
		alignContent: "center",
		justifyItems: "stretch",
		paddingBlock: space.xl,
		paddingInline: { default: space.lg, [MOBILE]: space.md },
	},
	form: {
		display: "grid",
		gap: space.md,
		width: "100%",
		maxWidth: "26rem",
		marginInline: "auto",
	},
	wide: { maxWidth: "32rem" },
	lock: { color: color.textMuted },
	title: {
		fontFamily: font.display,
		fontSize: type.t5,
		lineHeight: type.dense,
		fontWeight: 600,
		margin: 0,
	},
	lead: { fontSize: type.t3, lineHeight: type.body, color: color.textMuted, margin: 0 },
	intro: { display: "grid", gap: space.xs },
	row: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: space.xs },
	end: { justifyContent: "flex-end" },
})

function Glyph({ children }: { children: ReactNode }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={ICON_STROKE}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...stylex.props(icon.md)}
		>
			{children}
		</svg>
	)
}

const LOCK = (
	<>
		<rect x="4" y="11" width="16" height="10" rx="2" />
		<path d="M8 11V7a4 4 0 0 1 8 0v4" />
	</>
)
const IMAGE = (
	<>
		<rect x="3" y="3" width="18" height="18" rx="2" />
		<circle cx="9" cy="9" r="2" />
		<path d="m21 15-5-5L5 21" />
	</>
)
const DOWNLOAD = <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16" />
const DELETE = (
	<path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
)

const isImage = (name: string) => /\.(jpe?g|png|heic)$/.test(name)

function LockedGate({
	busy,
	onUnlock,
	onCreate,
}: {
	busy: boolean
	onUnlock: () => void
	onCreate: () => void
}) {
	const [passphrase, setPassphrase] = useState("")
	const [error, setError] = useState<string>()
	const submit = (event: FormEvent) => {
		event.preventDefault()
		if (passphrase === "") {
			setError("Enter your passphrase, then press Unlock. Any passphrase opens this demo.")
			return
		}
		onUnlock()
	}
	return (
		<form onSubmit={submit} {...stylex.props(styles.form)}>
			<div {...stylex.props(styles.intro)}>
				<span {...stylex.props(styles.lock)}>
					<Glyph>{LOCK}</Glyph>
				</span>
				<h2 {...stylex.props(styles.title)}>Personal vault is locked</h2>
				<p {...stylex.props(styles.lead)}>
					Your files are decrypted only on this device. Enter your passphrase to open them.
				</p>
			</div>
			<Part name="label">
				<Field label="Passphrase" error={error}>
					<Part name="password-input">
						<PasswordInput
							autoComplete="current-password"
							value={passphrase}
							onValueChange={(next) => {
								setPassphrase(next)
								setError(undefined)
							}}
						/>
					</Part>
				</Field>
			</Part>
			<div {...stylex.props(styles.row)}>
				<Button variant="ghost" onClick={onCreate}>
					Set up a new vault
				</Button>
				<Part name="button" inline>
					<Button type="submit" loading={busy}>
						Unlock
					</Button>
				</Part>
			</div>
		</form>
	)
}

function CreateGate({ onBack, onCreate }: { onBack: () => void; onCreate: () => void }) {
	const [passphrase, setPassphrase] = useState("")
	const [repeat, setRepeat] = useState("")
	const ready = passphrase.length >= 12 && repeat === passphrase
	return (
		<form
			onSubmit={(event) => {
				event.preventDefault()
				if (ready) onCreate()
			}}
			{...stylex.props(styles.form)}
		>
			<div {...stylex.props(styles.intro)}>
				<h2 {...stylex.props(styles.title)}>Set up a new vault</h2>
				<p {...stylex.props(styles.lead)}>
					Your passphrase never leaves this device, so nobody can reset it for you, us included.
				</p>
			</div>
			<Field label="Passphrase" help="At least 12 characters. A short sentence is easy to remember.">
				<Part name="password-input">
					<PasswordInput meter value={passphrase} onValueChange={setPassphrase} />
				</Part>
			</Field>
			<Field label="Enter the passphrase again">
				<PasswordInput confirmOf={passphrase} value={repeat} onValueChange={setRepeat} />
			</Field>
			<div {...stylex.props(styles.row)}>
				<Button variant="ghost" onClick={onBack}>
					Back
				</Button>
				<Button type="submit" disabled={!ready}>
					Create vault
				</Button>
			</div>
		</form>
	)
}

function KeyGate({ onDone }: { onDone: () => void }) {
	const [ack, setAck] = useState(false)
	return (
		<div {...stylex.props(styles.form, styles.wide)}>
			<h2 {...stylex.props(styles.title)}>Save your recovery key</h2>
			<Part name="recovery-key">
				<RecoveryKey value={KEY} ack={ack} onAckChange={setAck} />
			</Part>
			<div {...stylex.props(styles.row, styles.end)}>
				<Button disabled={!ack} onClick={onDone}>
					Open vault
				</Button>
			</div>
		</div>
	)
}

export function Scene({ compact }: SceneProps) {
	const [step, setStep] = useState<Step>(compact ? "open" : "locked")
	const [files, setFiles] = useState(FILES)
	const [selected, setSelected] = useState<Set<string>>(() => new Set(compact ? ["passport-scan.pdf"] : []))
	const [t, setT] = useState(0)

	// The upload clock runs while the vault is open. The tile loops it; the page plays it once.
	const clock = useCallback(
		(node: HTMLElement | null) => {
			if (node == null) return
			const id = setInterval(
				() => setT((now) => (compact ? (now >= LOOP ? 0 : now + 1) : Math.min(now + 1, T.done))),
				100,
			)
			return () => clearInterval(id)
		},
		[compact],
	)

	// Unlocking takes a moment to derive the key; the timer lives only while it is pending.
	const unlocking = useCallback((node: HTMLElement | null) => {
		if (node == null) return
		const id = setTimeout(() => {
			setT(0)
			setStep("open")
		}, 900)
		return () => clearTimeout(id)
	}, [])

	const lock = () => {
		setSelected(new Set())
		setStep("locked")
	}

	const remove = (item: FileItem) => {
		const before = files
		setFiles(files.filter((file) => file.name !== item.name))
		setSelected((current) => {
			const next = new Set(current)
			next.delete(item.name)
			return next
		})
		toast(`Deleted “${item.name}”`, { action: { label: "Undo", onClick: () => setFiles(before) } })
	}

	const uploadState = t < T.upload ? "encrypting" : t < T.done ? "uploading" : "idle"
	const rows = uploadState === "idle" ? [UPLOAD, ...files] : files
	const count = files.length + 1
	const progress = Math.max(0, Math.round(((t - T.upload) / (T.done - T.upload)) * 100))

	if (step === "locked" || step === "unlocking") {
		return (
			<Sheet fill={compact} sx={!compact && styles.sheet}>
				<div {...stylex.props(styles.gate)}>
					<LockedGate
						busy={step === "unlocking"}
						onUnlock={() => setStep("unlocking")}
						onCreate={() => setStep("create")}
					/>
					{step === "unlocking" ? <span ref={unlocking} hidden /> : null}
				</div>
			</Sheet>
		)
	}

	if (step === "create" || step === "key") {
		return (
			<Sheet sx={styles.sheet}>
				<div {...stylex.props(styles.gate)}>
					{step === "create" ? (
						<CreateGate onBack={() => setStep("locked")} onCreate={() => setStep("key")} />
					) : (
						<KeyGate onDone={() => setStep("fresh")} />
					)}
				</div>
			</Sheet>
		)
	}

	const fresh = step === "fresh"

	return (
		<Sheet fill={compact} sx={!compact && styles.sheet}>
			<div {...stylex.props(styles.header)}>
				<div {...stylex.props(styles.heading)}>
					<h2 {...stylex.props(styles.name)}>{fresh ? "New vault" : "Personal vault"}</h2>
					<p {...stylex.props(styles.sub)}>
						{fresh ? "Encrypted on this device · Empty" : `Encrypted on this device · ${count} items`}
					</p>
				</div>
				<div {...stylex.props(styles.actions)}>
					<Button variant="secondary" size="sm" onClick={lock}>
						Lock
					</Button>
					<Part name="button" inline>
						<Button
							size="sm"
							onClick={() =>
								toast("This vault is a demo", { description: "Nothing uploads from ui.anyknown.com." })
							}
						>
							Upload
						</Button>
					</Part>
				</div>
			</div>
			<div ref={fresh ? undefined : clock} {...stylex.props(styles.body)}>
				{fresh ? (
					<Part name="empty-state">
						<EmptyState
							icon={<Glyph>{LOCK}</Glyph>}
							title="Nothing in this vault yet"
							description="Upload files or drop them here. They are encrypted before they leave this device."
							headingLevel={3}
						/>
					</Part>
				) : (
					<Part name="file-row">
						<FileList label="Files in Personal vault" selectedCount={selected.size}>
							{uploadState === "idle" ? null : (
								<FileRow item={{ kind: "file", name: UPLOAD.name }} state={uploadState} progress={progress} />
							)}
							{rows.map((item) => (
								<FileRow
									key={item.name}
									item={item}
									icon={isImage(item.name) ? <Glyph>{IMAGE}</Glyph> : undefined}
									selected={selected.has(item.name)}
									onSelectedChange={(on) =>
										setSelected((current) => {
											const next = new Set(current)
											if (on) next.add(item.name)
											else next.delete(item.name)
											return next
										})
									}
									actions={[
										...(item.kind === "file"
											? [
													{
														icon: <Glyph>{DOWNLOAD}</Glyph>,
														label: `Download ${item.name}`,
														onAction: () =>
															toast(`Decrypted ${item.name}`, { description: "Saved to Downloads." }),
													},
												]
											: []),
										{
											icon: <Glyph>{DELETE}</Glyph>,
											label: `Delete ${item.name}`,
											onAction: () => remove(item),
										},
									]}
								/>
							))}
						</FileList>
					</Part>
				)}
			</div>
		</Sheet>
	)
}
