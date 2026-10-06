import { AlertDialog } from "@base-ui/react/alert-dialog"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import * as stylex from "@stylexjs/stylex"
import { createContext, type ReactElement, type ReactNode, useContext, useRef, useState } from "react"
import { layerStyles, returnFocusOnExit } from "../../lib/popup"
import { createStore, useStore } from "../../lib/store"
import type { StyleArg } from "../../lib/styled"
import { color, corner, font, motion, shadow, space, text } from "../../tokens.stylex"
import { Button } from "../button/Button"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

// 退場:Base UI 關的時候先掛 data-ending-style,等 transition 跑完才拆 —— 淡到 0,dialog 再縮到 0.98
const ENDING = ":is([data-ending-style])"

const grow = stylex.keyframes({
	from: { opacity: 0, scale: 0.96 },
	to: { opacity: 1, scale: 1 },
})

const styles = stylex.create({
	// 中性墨 32%,不加 blur:backdrop-filter 是 DESIGN.md 的反模式
	backdrop: {
		position: "fixed",
		inset: 0,
		backgroundColor: color.scrim,
		opacity: { default: 1, [ENDING]: 0 },
		transitionProperty: "opacity",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
	viewport: {
		position: "fixed",
		inset: 0,
		display: "grid",
		placeItems: "center",
		padding: space.md,
	},
	// modal 階:浮得最高、最圓。透明的框只為了 forced-colors(那裡陰影會消失)
	popup: {
		backgroundColor: color.surfaceRaised,
		color: color.text,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "transparent",
		borderRadius: corner.modal,
		boxShadow: shadow.modal,
		// 28px
		padding: `calc(${space.lg} + ${space.xxs})`,
		boxSizing: "border-box",
		width: "min(28rem, calc(100vw - 2rem))",
		maxHeight: "calc(100vh - 2rem)",
		overflowY: "auto",
		fontFamily: font.body,
		animationName: { default: grow, [REDUCED]: "none" },
		animationDuration: "160ms",
		animationTimingFunction: "ease-out",
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -2,
		opacity: { default: 1, [ENDING]: 0 },
		scale: { default: 1, [ENDING]: 0.98 },
		transitionProperty: "opacity, scale",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		transitionTimingFunction: "ease-out",
	},
	md: { width: "min(44rem, calc(100vw - 2rem))" },
	full: {
		width: "min(68rem, calc(100vw - 2rem))",
		height: "min(46rem, calc(100vh - 2rem))",
	},
	// 有 body 就換成「標頭釘住、只有 body 捲」:popup 自己不再捲
	split: { display: "flex", flexDirection: "column", overflowY: "hidden" },
	body: { flexGrow: 1, minHeight: 0, overflowY: "auto" },
	title: {
		fontFamily: font.display,
		fontSize: text.lg,
		fontWeight: 600,
		lineHeight: text.leadingSnug,
		margin: 0,
		marginBottom: space.xs,
	},
	description: {
		fontSize: text.sm,
		lineHeight: text.leadingRelaxed,
		color: color.textMuted,
		margin: 0,
		marginBottom: space.md,
	},
	actions: { display: "flex", justifyContent: "flex-end", gap: space.xs, marginTop: space.lg },
})

export type DialogProps = {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	children: ReactNode
}

export function Dialog({ children, ...props }: DialogProps) {
	return <BaseDialog.Root {...props}>{children}</BaseDialog.Root>
}

export function DialogTrigger({ children }: { children: ReactElement }) {
	return <BaseDialog.Trigger render={children} />
}

export function DialogClose({ children }: { children: ReactElement }) {
	return <BaseDialog.Close render={children} />
}

export function DialogActions({ children }: { children: ReactNode }) {
	return <div {...stylex.props(styles.actions)}>{children}</div>
}

export type DialogContentProps = {
	title: ReactNode
	description?: ReactNode
	children?: ReactNode
	/** 寬度階;`full` 是沉浸式(整個視窗那麼高)。 @default "sm" */
	size?: "sm" | "md" | "full"
	/** 會捲的那一段 —— 標頭與 children 釘住,只有這裡捲。 */
	body?: ReactNode
	bodySx?: StyleArg
	/** 寬高是 popup 自己的事,但要蓋得掉 —— 三欄選擇器那種得自己給 width / maxHeight */
	sx?: StyleArg
}

export function DialogContent({
	title,
	description,
	children,
	size = "sm",
	body,
	bodySx,
	sx,
}: DialogContentProps) {
	return (
		<BaseDialog.Portal>
			<BaseDialog.Backdrop {...stylex.props(layerStyles.dialogBackdrop, styles.backdrop)} />
			<BaseDialog.Viewport {...stylex.props(layerStyles.dialog, styles.viewport)}>
				<BaseDialog.Popup
					ref={returnFocusOnExit}
					{...stylex.props(
						styles.popup,
						size === "md" && styles.md,
						size === "full" && styles.full,
						body != null && styles.split,
						sx,
					)}
				>
					<BaseDialog.Title {...stylex.props(styles.title)}>{title}</BaseDialog.Title>
					{description != null && (
						<BaseDialog.Description {...stylex.props(styles.description)}>
							{description}
						</BaseDialog.Description>
					)}
					{children}
					{body != null && <div {...stylex.props(styles.body, bodySx)}>{body}</div>}
				</BaseDialog.Popup>
			</BaseDialog.Viewport>
		</BaseDialog.Portal>
	)
}

export type ConfirmDialogProps = {
	open?: boolean
	defaultOpen?: boolean
	onOpenChange?: (open: boolean) => void
	trigger?: ReactElement
	title: ReactNode
	description?: ReactNode
	danger?: boolean
	/** Verb first and names the consequence: 「刪除記憶」, not 「確認」. No default. */
	confirmLabel: string
	cancelLabel?: string
	onConfirm: () => void
}

export function ConfirmDialog({
	trigger,
	title,
	description,
	danger = false,
	confirmLabel,
	cancelLabel = "取消",
	onConfirm,
	...props
}: ConfirmDialogProps) {
	return (
		<AlertDialog.Root {...props}>
			{trigger != null && <AlertDialog.Trigger render={trigger} />}
			<ConfirmContent
				title={title}
				description={description}
				danger={danger}
				confirmLabel={confirmLabel}
				cancelLabel={cancelLabel}
				onConfirm={onConfirm}
			/>
		</AlertDialog.Root>
	)
}

type ConfirmContentProps = {
	title: ReactNode
	description?: ReactNode
	danger: boolean
	confirmLabel: string
	/** null = 只有一顆按鈕(alert) */
	cancelLabel: string | null
	onConfirm: () => void
	onCancel?: () => void
}

/** ConfirmDialog 與 `dialog.confirm` / `dialog.alert` 共用的那張卡;要放在 AlertDialog.Root 裡。 */
function ConfirmContent({
	title,
	description,
	danger,
	confirmLabel,
	cancelLabel,
	onConfirm,
	onCancel,
}: ConfirmContentProps) {
	const cancelRef = useRef<HTMLButtonElement>(null)
	return (
		<AlertDialog.Portal>
			<AlertDialog.Backdrop {...stylex.props(layerStyles.dialogBackdrop, styles.backdrop)} />
			<AlertDialog.Viewport {...stylex.props(layerStyles.dialog, styles.viewport)}>
				<AlertDialog.Popup
					ref={returnFocusOnExit}
					initialFocus={danger && cancelLabel != null ? cancelRef : undefined}
					{...stylex.props(styles.popup)}
				>
					<AlertDialog.Title {...stylex.props(styles.title)}>{title}</AlertDialog.Title>
					{description != null && (
						<AlertDialog.Description {...stylex.props(styles.description)}>
							{description}
						</AlertDialog.Description>
					)}
					<div {...stylex.props(styles.actions)}>
						{cancelLabel != null && (
							<AlertDialog.Close render={<Button ref={cancelRef} variant="secondary" />} onClick={onCancel}>
								{cancelLabel}
							</AlertDialog.Close>
						)}
						<AlertDialog.Close
							render={<Button variant={danger ? "danger" : "primary"} />}
							onClick={onConfirm}
						>
							{confirmLabel}
						</AlertDialog.Close>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Viewport>
		</AlertDialog.Portal>
	)
}

// ---------------------------------------------------------------------------
// 命令式:dialog.open / confirm / alert,狀態在 lib/store,畫面由 <Dialogs /> 掛

export type DialogControls<T = unknown> = { close: (result?: T) => void }

export type DialogRender<T = unknown> = (controls: DialogControls<T>) => ReactNode

export type DialogOptions = {
	/** `alertdialog`:要使用者明確回答;點 backdrop 不會關,Esc 仍會。 @default "dialog" */
	role?: "dialog" | "alertdialog"
}

export type DialogHandle<T = unknown> = {
	id: string
	close: (result?: T) => void
	/** 關掉時落定;Esc / backdrop / `closeAll` 關掉的是 `undefined`(confirm 是 `false`)。 */
	result: Promise<T | undefined>
}

export type DialogEntry = {
	id: string
	render: DialogRender<never>
	role: "dialog" | "alertdialog"
}

export type ConfirmOptions = {
	title: ReactNode
	description?: ReactNode
	/** Verb first and names the consequence: 「封存 thread」, not 「確認」. No default. */
	confirmLabel: string
	/** @default "取消" */
	cancelLabel?: string
	/** `danger`:紅色確認鈕,焦點先落在取消。 @default "default" */
	tone?: "default" | "danger"
}

export type AlertOptions = {
	title: ReactNode
	description?: ReactNode
	/** @default "知道了" */
	confirmLabel?: string
	tone?: "default" | "danger"
}

export type DialogManager = {
	open: <T = unknown>(render: DialogRender<T>, options?: DialogOptions) => DialogHandle<T>
	/** 連同疊在它上面的 dialog 一起關。 */
	close: (id: string, result?: unknown) => void
	closeAll: () => void
	/** 確認 → true;取消、Esc → false。 */
	confirm: (options: ConfirmOptions) => Promise<boolean>
	alert: (options: AlertOptions) => Promise<void>
	subscribe: (listener: () => void) => () => void
	getSnapshot: () => readonly DialogEntry[]
}

let dialogSeq = 0

export function createDialogManager(): DialogManager {
	const store = createStore<readonly DialogEntry[]>([])
	// 結果的出口不放進 snapshot:畫面用不到
	const settle = new Map<string, { resolve: (value: unknown) => void; dismiss: unknown }>()

	function push<T>(render: DialogRender<T>, role: DialogEntry["role"], dismiss: unknown): DialogHandle<T> {
		dialogSeq += 1
		const id = `dialog-${dialogSeq}`
		const result = new Promise<T | undefined>((resolve) => {
			settle.set(id, { resolve: resolve as (value: unknown) => void, dismiss })
		})
		store.set((entries) => [...entries, { id, render: render as DialogRender<never>, role }])
		return { id, close: (value) => close(id, value), result }
	}

	function close(id: string, result?: unknown) {
		const entries = store.getSnapshot()
		const index = entries.findIndex((entry) => entry.id === id)
		if (index === -1) return
		store.set(entries.slice(0, index))
		// 由上往下落定:疊在上面的先用各自的 dismiss 值
		for (let i = entries.length - 1; i >= index; i -= 1) {
			const entryId = entries[i].id
			const pending = settle.get(entryId)
			settle.delete(entryId)
			pending?.resolve(entryId === id && result !== undefined ? result : pending.dismiss)
		}
	}

	return {
		open: (render, options = {}) => push(render, options.role ?? "dialog", undefined),
		close,
		closeAll() {
			const [first] = store.getSnapshot()
			if (first != null) close(first.id)
		},
		confirm({ title, description, confirmLabel, cancelLabel = "取消", tone = "default" }) {
			const handle = push<boolean>(
				({ close: done }) => (
					<ConfirmContent
						title={title}
						description={description}
						danger={tone === "danger"}
						confirmLabel={confirmLabel}
						cancelLabel={cancelLabel}
						onConfirm={() => done(true)}
						onCancel={() => done(false)}
					/>
				),
				"alertdialog",
				false,
			)
			return handle.result.then((value) => value === true)
		},
		alert({ title, description, confirmLabel = "知道了", tone = "default" }) {
			const handle = push<void>(
				({ close: done }) => (
					<ConfirmContent
						title={title}
						description={description}
						danger={tone === "danger"}
						confirmLabel={confirmLabel}
						cancelLabel={null}
						onConfirm={() => done()}
					/>
				),
				"alertdialog",
				undefined,
			)
			return handle.result.then(() => undefined)
		},
		subscribe: store.subscribe,
		getSnapshot: store.getSnapshot,
	}
}

/** 只有一個 <Dialogs/> 的 app 用這個:直接 import `dialog` 就能用。 */
export const dialogManager = createDialogManager()

export const dialog: DialogManager = dialogManager

const DialogManagerContext = createContext<DialogManager | null>(null)

/** 在 `<Dialogs manager>` 底下拿到那個 manager,否則是預設的 `dialog`。 */
export function useDialog() {
	const scoped = useContext(DialogManagerContext)
	return { dialog: scoped ?? dialog }
}

export type DialogsProps = {
	/** Pass a manager from `createDialogManager()` to scope this host. 一個 manager 只掛一個 host。 */
	manager?: DialogManager
	/** 包在裡面的 `useDialog()` 拿到的是這個 host 的 manager。 */
	children?: ReactNode
}

export function Dialogs({ manager, children }: DialogsProps) {
	const [own] = useState(() => manager ?? dialogManager)
	const entries = useStore(own)
	const first = entries[0]
	return (
		<DialogManagerContext value={own}>
			{children}
			{first != null && <StackedDialog key={first.id} entries={entries} index={0} manager={own} />}
		</DialogManagerContext>
	)
}

type StackedDialogProps = { entries: readonly DialogEntry[]; index: number; manager: DialogManager }

/**
 * 上一層的 Root 包住下一層,Base UI 才知道它們是巢狀的:Esc 只關最上面那個、
 * 底下那個的 backdrop 不會吃掉上面那個的點擊。
 *
 * 下一層要等這一層開好(`onOpenChangeComplete(true)`)才掛:兩層在同一個 commit 掛上時,
 * React 先跑子層的 effect,上一層隨後把「自己以外」全標成 aria-hidden,連上面那層一起蓋掉。
 * 所以 `render` 要回傳 DialogContent(或 Base UI Dialog 的 Popup),不然下一層永遠不會出現。
 */
function StackedDialog({ entries, index, manager }: StackedDialogProps) {
	const [ready, setReady] = useState(false)
	const entry = entries[index]
	const next = ready ? entries[index + 1] : undefined
	const close = (result?: unknown) => manager.close(entry.id, result)
	const onOpenChange = (open: boolean) => {
		if (!open) manager.close(entry.id)
	}
	const onOpenChangeComplete = (open: boolean) => {
		if (open) setReady(true)
	}
	const body = (
		<>
			{(entry.render as DialogRender)({ close })}
			{next != null && <StackedDialog key={next.id} entries={entries} index={index + 1} manager={manager} />}
		</>
	)
	return entry.role === "alertdialog" ? (
		<AlertDialog.Root open onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
			{body}
		</AlertDialog.Root>
	) : (
		<BaseDialog.Root open onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
			{body}
		</BaseDialog.Root>
	)
}
