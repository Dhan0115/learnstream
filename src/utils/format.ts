// Display formatters shared by video/subject surfaces.

const MONTH_IN_DAYS = 30
const YEAR_IN_DAYS = 365
const DAY_MS = 86_400_000

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

function trimDecimal(value: number): string {
  return value >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '')
}

/** 754 -> "12:34", 3754 -> "1:02:34". */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(rest)}`
    : `${minutes}:${pad(rest)}`
}

/** 1 -> "1 view", 1284 -> "1.3K views", 2400000 -> "2.4M views". */
export function formatViews(views: number): string {
  const count = Math.max(0, Math.round(views))
  const noun = count === 1 ? 'view' : 'views'

  if (count < 1000) return `${count} ${noun}`
  if (count < 1_000_000) return `${trimDecimal(count / 1000)}K ${noun}`
  return `${trimDecimal(count / 1_000_000)}M ${noun}`
}

/** Count only, without the unit — e.g. for action buttons. */
export function formatCount(count: number): string {
  const value = Math.max(0, Math.round(count))
  if (value < 1000) return value.toString()
  if (value < 1_000_000) return `${trimDecimal(value / 1000)}K`
  return `${trimDecimal(value / 1_000_000)}M`
}

/** ISO date -> "Today", "Yesterday", "3 days ago", "2 months ago", "1 year ago". */
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
  const then = new Date(iso)
  if (Number.isNaN(then.getTime())) return ''

  const days = Math.floor((now.getTime() - then.getTime()) / DAY_MS)

  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`

  if (days < MONTH_IN_DAYS) {
    const weeks = Math.floor(days / 7)
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
  }

  if (days < YEAR_IN_DAYS) {
    const months = Math.floor(days / MONTH_IN_DAYS)
    return months === 1 ? '1 month ago' : `${months} months ago`
  }

  const years = Math.floor(days / YEAR_IN_DAYS)
  return years === 1 ? '1 year ago' : `${years} years ago`
}
