import { Chart, type ChartProps } from "./Chart"

export type LineChartProps = ChartProps

/**
 * One ink line through the values on three faint ticks, with the labels under the points. The
 * ticks cover the values only, not zero. Hover, tap or keyboard focus shows one point and its
 * value; screen readers get a table of every number. Native `<div>` props pass through;
 * `aria-label` names the chart.
 */
export function LineChart(props: LineChartProps) {
	return <Chart kind="line" {...props} />
}
