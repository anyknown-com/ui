import { Chart, type ChartProps } from "./Chart"

export type BarChartProps = ChartProps

/**
 * One ink bar per value on three faint ticks, with the labels under the bars. Hover, tap or
 * keyboard focus shows one value; screen readers get a table of every number. Native `<div>`
 * props pass through; `aria-label` names the chart.
 */
export function BarChart(props: BarChartProps) {
	return <Chart kind="bar" {...props} />
}
