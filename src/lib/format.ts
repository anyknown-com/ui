const UNITS = ["B", "KB", "MB", "GB", "TB"] as const

export function formatBytes(bytes: number): string {
	if (bytes <= 0) return "0 B"
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1)
	const value = bytes / 1024 ** i
	return `${i === 0 ? value : value.toFixed(value < 10 ? 1 : 0)} ${UNITS[i]}`
}

export function formatDuration(ms: number): string {
	if (ms < 1000) return `${Math.round(ms)}ms`
	if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
	const m = Math.floor(ms / 60_000)
	return `${m}m ${Math.round((ms % 60_000) / 1000)}s`
}
