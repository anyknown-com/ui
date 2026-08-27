const UNITS = ["B", "KB", "MB", "GB", "TB"] as const

export function formatBytes(bytes: number): string {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
	let unit = Math.min(Math.max(0, Math.floor(Math.log(bytes) / Math.log(1024))), UNITS.length - 1)
	let value = bytes / 1024 ** unit
	// Pick the unit after rounding, or 1048575 renders as "1024 KB".
	if (value >= 1023.5 && unit < UNITS.length - 1) {
		unit += 1
		value /= 1024
	}
	return `${unit === 0 ? Math.round(value) : value.toFixed(value < 10 ? 1 : 0)} ${UNITS[unit]}`
}

export function formatDuration(ms: number): string {
	if (!Number.isFinite(ms) || ms < 0) return "0ms"
	if (ms < 1000) return `${Math.round(ms)}ms`
	// Round to whole seconds first, or 119500 renders as "1m 60s".
	const seconds = Math.round(ms / 1000)
	if (seconds < 60) return `${(ms / 1000).toFixed(1)}s`
	return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}
