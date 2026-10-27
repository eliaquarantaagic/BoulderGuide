export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.ceil(total))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
