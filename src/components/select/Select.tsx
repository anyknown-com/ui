import { Combobox } from "@base-ui/react/combobox"
import * as stylex from "@stylexjs/stylex"
import { Children, type ReactElement, type ReactNode, isValidElement, useId, useMemo, useState } from "react"
import { popupStyles } from "../../lib/popup"
import { color, font, motion, radius, space, text } from "../../tokens.stylex"

const REDUCED = "@media (prefers-reduced-motion: reduce)"

export type SelectItemProps = {
	value: string
	hint?: string
	disabled?: boolean
	textValue?: string
	children: ReactNode
}

export function SelectItem(_props: SelectItemProps): null {
	return null
}

export type SelectGroupProps = {
	label: string
	children: ReactNode
}

export function SelectGroup(_props: SelectGroupProps): null {
	return null
}

type Option = { value: string; label: ReactNode; text: string; hint?: string; disabled?: boolean }
type Group = { value: string; items: Option[] }

function toOption(element: ReactElement<SelectItemProps>): Option {
	const { value, hint, disabled, textValue, children } = element.props
	return {
		value,
		label: children,
		text: textValue ?? (typeof children === "string" ? children : value),
		hint,
		disabled,
	}
}

function collect(children: ReactNode): { options: Option[]; groups: Group[] } {
	const options: Option[] = []
	const groups: Group[] = []
	for (const child of Children.toArray(children)) {
		if (!isValidElement(child)) continue
		if (child.type === SelectGroup) {
			const group = child as ReactElement<SelectGroupProps>
			const items = Children.toArray(group.props.children)
				.filter((c): c is ReactElement<SelectItemProps> => isValidElement(c) && c.type === SelectItem)
				.map(toOption)
			groups.push({ value: group.props.label, items })
			options.push(...items)
		} else if (child.type === SelectItem) {
			options.push(toOption(child as ReactElement<SelectItemProps>))
		}
	}
	return { options, groups }
}

const styles = stylex.create({
	trigger: {
		width: "100%",
		minHeight: "2.25rem",
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		flexWrap: "wrap",
		backgroundColor: color.surface,
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: { default: color.border, ":hover": color.borderStrong },
		borderRadius: radius.md,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
		fontFamily: font.body,
		fontSize: text.sm,
		color: color.text,
		cursor: "pointer",
		textAlign: "start",
		transitionProperty: "border-color",
		transitionDuration: { default: motion.fast, [REDUCED]: "0s" },
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: -1,
	},
	placeholder: { color: color.textFaint },
	caret: { marginInlineStart: "auto", color: color.textFaint, flex: "none" },
	chip: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		backgroundColor: color.accentSubtle,
		color: color.text,
		borderRadius: radius.sm,
		paddingBlock: "0.1rem",
		paddingInline: space.xxs,
		fontSize: text.xs,
	},
	chipRemove: {
		all: "unset",
		cursor: "pointer",
		color: color.textMuted,
		lineHeight: 1,
		outline: { default: "none", ":focus-visible": `2px solid ${color.focusRing}` },
		outlineOffset: 1,
		borderRadius: radius.sm,
	},
	search: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		borderBottomWidth: 1,
		borderBottomStyle: "solid",
		borderBottomColor: color.border,
		paddingBlock: space.xs,
		paddingInline: space.sm,
	},
	searchIcon: { color: color.textFaint, flex: "none" },
	searchInput: {
		all: "unset",
		flex: 1,
		fontFamily: font.body,
		fontSize: text.sm,
		color: color.text,
		"::placeholder": { color: color.textFaint },
	},
	srOnly: {
		position: "absolute",
		width: 1,
		height: 1,
		padding: 0,
		margin: -1,
		overflow: "hidden",
		clipPath: "inset(50%)",
		whiteSpace: "nowrap",
	},
	list: { maxHeight: "14rem", overflowY: "auto", padding: space.xxs, margin: 0 },
	groupLabel: {
		fontFamily: font.mono,
		fontSize: "0.65rem",
		fontWeight: 600,
		lineHeight: 1,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		color: color.textFaint,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
	},
	option: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		borderRadius: radius.sm,
		paddingBlock: "0.42rem",
		paddingInline: space.xs,
		fontSize: text.sm,
		cursor: "pointer",
		outline: "none",
		userSelect: "none",
	},
	optionHighlighted: {
		backgroundColor: color.accentSubtle,
		outline: `2px solid ${color.focusRing}`,
		outlineOffset: -2,
		"@media (forced-colors: active)": { outline: "2px solid Highlight" },
	},
	optionDisabled: { opacity: 0.5, cursor: "not-allowed" },
	hint: { color: color.textFaint, fontSize: "0.72rem" },
	tick: { marginInlineStart: "auto", color: color.accent, display: "flex" },
	empty: { paddingBlock: space.md, paddingInline: space.sm, fontSize: text.xs, color: color.textMuted, textAlign: "center" },
})

function CaretIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<path d="m6 9 6 6 6-6" />
		</svg>
	)
}

function SearchIcon() {
	return (
		<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
	)
}

function TickIcon() {
	return (
		<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
			<path d="m2.5 8.5 4 4 7-9" />
		</svg>
	)
}

function OptionRow({ option }: { option: Option }) {
	return (
		<Combobox.Item
			value={option}
			disabled={option.disabled}
			className={(state) =>
				stylex.props(
					styles.option,
					state.highlighted && styles.optionHighlighted,
					state.disabled && styles.optionDisabled,
				).className ?? ""
			}
		>
			<span>{option.label}</span>
			{option.hint != null && <small {...stylex.props(styles.hint)}>{option.hint}</small>}
			<Combobox.ItemIndicator {...stylex.props(styles.tick)}>
				<TickIcon />
			</Combobox.ItemIndicator>
		</Combobox.Item>
	)
}

export type SelectProps = {
	value?: string | string[]
	defaultValue?: string | string[]
	onValueChange?: (value: never) => void
	placeholder?: string
	searchPlaceholder?: string
	searchLabel?: string
	emptyLabel?: (query: string) => ReactNode
	multiple?: boolean
	searchable?: boolean
	disabled?: boolean
	name?: string
	"aria-label"?: string
	"aria-labelledby"?: string
	children: ReactNode
}

export function Select({
	value,
	defaultValue,
	onValueChange,
	placeholder = "選擇…",
	searchPlaceholder = "搜尋…",
	searchLabel = "搜尋選項",
	emptyLabel,
	multiple = false,
	searchable = true,
	disabled,
	name,
	children,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
}: SelectProps) {
	const base = useId()
	const labelId = `${base}label`
	const triggerId = `${base}trigger`
	const nameId = ariaLabelledBy ?? (ariaLabel != null ? labelId : undefined)
	const triggerLabelledBy = nameId ? `${nameId} ${triggerId}` : undefined
	const { options, groups } = useMemo(() => collect(children), [children])
	const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options])

	const isControlled = value !== undefined
	const [internal, setInternal] = useState<string | string[]>(defaultValue ?? (multiple ? [] : ""))
	const current = isControlled ? value : internal
	const selectedList = useMemo(
		() => (Array.isArray(current) ? current : []).map((v) => byValue.get(v)).filter((o): o is Option => o != null),
		[current, byValue],
	)
	const selectedOne = typeof current === "string" && current !== "" ? (byValue.get(current) ?? null) : null
	const selected = multiple ? selectedList : selectedOne
	const [query, setQuery] = useState("")

	const notify = onValueChange as ((next: string | string[]) => void) | undefined
	const emit = (next: string | string[]) => {
		if (!isControlled) setInternal(next)
		notify?.(next)
	}

	const items = groups.length > 0 ? groups : options

	return (
		<Combobox.Root
			items={items}
			multiple={multiple as never}
			value={selected as never}
			disabled={disabled}
			name={name}
			filter={searchable ? undefined : null}
			itemToStringLabel={(item: Option) => item.text}
			itemToStringValue={(item: Option) => item.value}
			onInputValueChange={setQuery}
			onValueChange={(next: Option | Option[] | null) => {
				if (multiple) emit(((next as Option[]) ?? []).map((o) => o.value))
				else emit((next as Option | null)?.value ?? "")
			}}
		>
			{ariaLabel != null && ariaLabelledBy == null && (
				<span id={labelId} hidden>
					{ariaLabel}
				</span>
			)}
			<Combobox.Trigger
				id={triggerId}
				aria-labelledby={triggerLabelledBy}
				nativeButton={!multiple}
				render={multiple ? <div /> : undefined}
				{...stylex.props(styles.trigger)}
			>
				{multiple ? (
					selectedList.length === 0 ? (
						<span {...stylex.props(styles.placeholder)}>{placeholder}</span>
					) : (
						selectedList.map((option) => (
							<span key={option.value} {...stylex.props(styles.chip)}>
								{option.label}
								<button
									type="button"
									aria-label={`移除 ${option.text}`}
									onPointerDown={(event) => event.stopPropagation()}
									onMouseDown={(event) => event.stopPropagation()}
									onClick={(event) => {
										event.stopPropagation()
										emit(selectedList.filter((o) => o.value !== option.value).map((o) => o.value))
									}}
									{...stylex.props(styles.chipRemove)}
								>
									×
								</button>
							</span>
						))
					)
				) : (
					<Combobox.Value>
						{(v: Option | null) =>
							v ? <span>{v.label}</span> : <span {...stylex.props(styles.placeholder)}>{placeholder}</span>
						}
					</Combobox.Value>
				)}
				<Combobox.Icon {...stylex.props(styles.caret)}>
					<CaretIcon />
				</Combobox.Icon>
			</Combobox.Trigger>

			<Combobox.Portal>
				<Combobox.Positioner align="start" sideOffset={6} {...stylex.props(popupStyles.positioner)}>
					<Combobox.Popup
						aria-labelledby={nameId}
						{...stylex.props(popupStyles.surface, popupStyles.anchorWidth)}
					>
						{searchable ? (
							<div {...stylex.props(styles.search)}>
								<span {...stylex.props(styles.searchIcon)}>
									<SearchIcon />
								</span>
								<Combobox.Input
									placeholder={searchPlaceholder}
									aria-label={searchLabel}
									{...stylex.props(styles.searchInput)}
								/>
							</div>
						) : (
							<Combobox.Input
								aria-labelledby={nameId}
								aria-label={nameId ? undefined : searchLabel}
								{...stylex.props(styles.srOnly)}
							/>
						)}
						<Combobox.List {...stylex.props(styles.list)}>
							{groups.length > 0
								? (group: Group) => (
										<Combobox.Group key={group.value} items={group.items}>
											<Combobox.GroupLabel {...stylex.props(styles.groupLabel)}>
												{group.value}
											</Combobox.GroupLabel>
											<Combobox.Collection>
												{(option: Option) => <OptionRow key={option.value} option={option} />}
											</Combobox.Collection>
										</Combobox.Group>
									)
								: (option: Option) => <OptionRow key={option.value} option={option} />}
						</Combobox.List>
						<Combobox.Empty {...stylex.props(styles.empty)}>
							{emptyLabel ? emptyLabel(query) : `找不到「${query}」。`}
						</Combobox.Empty>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	)
}
