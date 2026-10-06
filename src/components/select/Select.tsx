import { Combobox } from "@base-ui/react/combobox"
import * as stylex from "@stylexjs/stylex"
import { Children, type ReactElement, type ReactNode, isValidElement, useId, useMemo, useState } from "react"
import { type StringsOf, defineStrings, useStrings } from "../../lib/i18n"
import { reset } from "../../lib/styled"
import { popupStyles, returnFocusOnExit } from "../../lib/popup"
import { breakpoint, color, corner, focusRing, font, space, type } from "../../tokens.stylex"
import { controlStyles } from "../input/Input"
import { useFieldControl } from "../label/fieldContext"

export type SelectItemProps = {
	/** The value `onValueChange` reports and the form submits. */
	value: string
	/** A muted note after the label, e.g. 「最強」. */
	hint?: string
	/** Shown but cannot be picked. */
	disabled?: boolean
	/** The text search and typeahead match; needed when `children` is not a plain string. */
	textValue?: string
	/** The option's label. */
	children: ReactNode
}

/** One option of a `Select`. It only describes the option; `Select` renders it. */
export function SelectItem(_props: SelectItemProps): null {
	return null
}

export type SelectGroupProps = {
	/** The group heading. */
	label: string
	/** The group's `SelectItem`s. */
	children: ReactNode
}

/** A labelled group of options in a `Select`. */
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

// Windows 高對比:顏色換成系統色;焦點環明確給 Highlight
const FORCED = "@media (forced-colors: active)"

const styles = stylex.create({
	// 外框、底色、focus 都是 input 的 controlStyles;這裡只補 trigger 自己的排法
	trigger: {
		display: "flex",
		alignItems: "center",
		gap: space.xxs,
		flexWrap: "wrap",
		cursor: { default: "pointer", ":disabled": "not-allowed" },
		textAlign: "start",
	},
	placeholder: { color: color.textFaint },
	caret: { marginInlineStart: "auto", color: color.textFaint, flex: "none" },
	chip: {
		display: "inline-flex",
		alignItems: "center",
		gap: space.xxs,
		backgroundColor: color.accentSubtle,
		color: color.text,
		borderRadius: corner.small,
		paddingBlock: "0.1rem",
		paddingInline: space.xxs,
		fontSize: type.t1,
	},
	chipRemove: {
		cursor: "pointer",
		color: color.textMuted,
		lineHeight: 1,
		outline: {
			default: "none",
			":focus-visible": {
				default: `${focusRing.width} solid ${color.focusRing}`,
				[FORCED]: `${focusRing.width} solid Highlight`,
			},
		},
		outlineOffset: 1,
		borderRadius: corner.small,
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
		flex: 1,
		fontFamily: font.body,
		fontSize: { default: type.t2, [breakpoint.phone]: type.phoneInput },
		color: color.text,
		// 打開就落在這裡,閃動的游標就是焦點;UA 的框會把搜尋列框成第二個輸入框
		outline: "none",
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
		fontSize: type.t1,
		fontWeight: 500,
		lineHeight: type.snug,
		color: color.textMuted,
		paddingBlock: space.xxs,
		paddingInline: space.xs,
	},
	option: {
		display: "flex",
		alignItems: "center",
		gap: space.xs,
		// 內角 = popup 的 16 − 4 padding
		borderRadius: corner.control,
		paddingBlock: "0.42rem",
		paddingInline: space.xs,
		fontSize: type.t2,
		cursor: "pointer",
		outline: "none",
		userSelect: "none",
	},
	optionHighlighted: {
		backgroundColor: color.accentSubtle,
		outline: `${focusRing.width} solid ${color.focusRing}`,
		outlineOffset: -2,
		"@media (forced-colors: active)": { outline: `${focusRing.width} solid Highlight` },
	},
	optionDisabled: { opacity: 0.5, cursor: "not-allowed" },
	hint: { color: color.textMuted, fontSize: type.t1 },
	tick: { marginInlineStart: "auto", color: color.accent, display: "flex" },
	empty: {
		// Empty 一直都在 DOM 裡;有結果時它是空的,不能留一段 padding
		paddingBlock: { default: space.md, ":empty": 0 },
		paddingInline: space.sm,
		fontSize: type.t1,
		color: color.textMuted,
		textAlign: "center",
	},
})

function CaretIcon() {
	return (
		<svg
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	)
}

function SearchIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
	)
}

function TickIcon() {
	return (
		<svg
			width="13"
			height="13"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden="true"
		>
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

const strings = defineStrings({
	"zh-TW": {
		placeholder: "選擇…",
		searchPlaceholder: "搜尋…",
		searchLabel: "搜尋選項",
		remove: (item: string) => `移除 ${item}`,
		empty: (query: string) => `找不到「${query}」。`,
	},
	en: {
		placeholder: "Select…",
		searchPlaceholder: "Search…",
		searchLabel: "Search options",
		remove: (item: string) => `Remove ${item}`,
		empty: (query: string) => `No results for “${query}”.`,
	},
})

/**
 * The Select's built-in words (follow `<LocaleProvider>`): the placeholder, the search box's
 * placeholder and name, a chip's remove button (`remove(itemText)`) and the empty state
 * (`empty(query)`). Override any with `<Select labels={…}>`.
 */
export type SelectLabels = StringsOf<typeof strings>

export type SelectProps = {
	/** The selected value (a string, or an array with `multiple`). Controlled. */
	value?: string | string[]
	/** The initial value when uncontrolled. */
	defaultValue?: string | string[]
	/** Called with the new value: a string, or a string array with `multiple`. */
	onValueChange?: (value: never) => void
	/** Shown in the trigger while nothing is selected. @default the locale's `placeholder` */
	placeholder?: string
	/** The search box's placeholder. @default the locale's `searchPlaceholder` */
	searchPlaceholder?: string
	/** The search box's accessible name. @default the locale's `searchLabel` */
	searchLabel?: string
	/** What the list shows when the search matches nothing. @default the locale's `empty(query)` */
	emptyLabel?: (query: string) => ReactNode
	/** Pick any number of options; they show as removable chips. @default false */
	multiple?: boolean
	/** Show a search box at the top of the list. @default true */
	searchable?: boolean
	/** Disables the trigger. Inside a `Field`, defaults to the Field's `disabled`. */
	disabled?: boolean
	/** A value must be chosen before the form submits. Inside a `Field`, defaults to the Field's `required`. */
	required?: boolean
	/** Marks the trigger invalid (danger border, `aria-invalid`). Inside a `Field`, defaults to whether it has an `error`. */
	invalid?: boolean
	/** The form field name; the value is submitted with the form. */
	name?: string
	/** The trigger's name when there is no visible label. */
	"aria-label"?: string
	/** The id of a visible label that names the trigger. */
	"aria-labelledby"?: string
	/** Ids of elements that describe the trigger. Inside a `Field`, defaults to its help and error. */
	"aria-describedby"?: string
	/** Override built-in words for this instance; the rest follow `<LocaleProvider>`. */
	labels?: Partial<SelectLabels>
	/** `SelectItem` and `SelectGroup` elements. */
	children: ReactNode
}

/**
 * A single or multiple choice from a searchable list, with the APG select-only combobox semantics.
 * Inside a `Field`, the Field's label names the trigger and its help and error describe it.
 */
export function Select({
	value,
	defaultValue,
	onValueChange,
	placeholder: placeholderProp,
	searchPlaceholder,
	searchLabel: searchLabelProp,
	emptyLabel,
	multiple = false,
	searchable = true,
	disabled,
	required,
	invalid,
	name,
	labels,
	children,
	"aria-label": ariaLabel,
	"aria-labelledby": ariaLabelledBy,
	"aria-describedby": ariaDescribedBy,
}: SelectProps) {
	const field = useFieldControl({ "aria-describedby": ariaDescribedBy, required, disabled })
	const isInvalid = invalid ?? field.invalid
	const t = useStrings(strings, labels)
	const placeholder = placeholderProp ?? t.placeholder
	const searchLabel = searchLabelProp ?? t.searchLabel
	const base = useId()
	const labelId = `${base}label`
	// Inside a Field the trigger takes the Field's control id, so its `<label for>` names it.
	const triggerId = field.id ?? `${base}trigger`
	const nameId = ariaLabelledBy ?? (ariaLabel != null ? labelId : undefined)
	const triggerLabelledBy = nameId ? `${nameId} ${triggerId}` : undefined
	const { options, groups } = useMemo(() => collect(children), [children])
	const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options])

	const isControlled = value !== undefined
	const [internal, setInternal] = useState<string | string[]>(defaultValue ?? (multiple ? [] : ""))
	const current = isControlled ? value : internal
	const selectedList = useMemo(
		() =>
			(Array.isArray(current) ? current : [])
				.map((v) => byValue.get(v))
				.filter((o): o is Option => o != null),
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
			disabled={field.disabled}
			required={field.required}
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
				aria-describedby={field["aria-describedby"]}
				aria-invalid={isInvalid || undefined}
				aria-required={field.required || undefined}
				nativeButton={!multiple}
				render={multiple ? <div /> : undefined}
				{...stylex.props(
					controlStyles.base,
					controlStyles.md,
					styles.trigger,
					isInvalid && controlStyles.invalid,
				)}
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
									aria-label={t.remove(option.text)}
									onPointerDown={(event) => event.stopPropagation()}
									onMouseDown={(event) => event.stopPropagation()}
									onClick={(event) => {
										event.stopPropagation()
										emit(selectedList.filter((o) => o.value !== option.value).map((o) => o.value))
									}}
									{...stylex.props(reset.control, styles.chipRemove)}
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
						ref={returnFocusOnExit}
						aria-labelledby={nameId}
						{...stylex.props(popupStyles.surface, popupStyles.anchorWidth)}
					>
						{searchable ? (
							<div {...stylex.props(styles.search)}>
								<span {...stylex.props(styles.searchIcon)}>
									<SearchIcon />
								</span>
								<Combobox.Input
									placeholder={searchPlaceholder ?? t.searchPlaceholder}
									aria-label={searchLabel}
									{...stylex.props(reset.control, styles.searchInput)}
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
							{emptyLabel ? emptyLabel(query) : t.empty(query)}
						</Combobox.Empty>
					</Combobox.Popup>
				</Combobox.Positioner>
			</Combobox.Portal>
		</Combobox.Root>
	)
}
