/**
 * Pure cycle calculations used by the fertility insight views.
 *
 * Kept free of Supabase and React so the rules can be tested directly.
 * Dates are ISO date strings (YYYY-MM-DD) so results do not shift with the
 * caller's timezone.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24

export type DateRange = {
  start: string
  end: string
}

/** Whole days between two ISO dates, rounded to the nearest day. */
export function cycleLength(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY)
}

/**
 * Mean cycle length in whole days.
 * Divides only by the cycles that produced a length, so incomplete records
 * never drag the average down.
 */
export function averageCycleLength(lengths: number[]): number | null {
  if (lengths.length === 0) return null
  const total = lengths.reduce((sum, length) => sum + length, 0)
  return Math.round(total / lengths.length)
}

/** Population standard deviation of cycle lengths, to one decimal place. */
export function cycleRegularity(lengths: number[]): number | null {
  if (lengths.length < 2) return null
  const mean = lengths.reduce((sum, length) => sum + length, 0) / lengths.length
  const variance = lengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) / lengths.length
  return Math.round(Math.sqrt(variance) * 10) / 10
}

/** Next period start, one average cycle after the last recorded start. */
export function estimateNextPeriod(lastCycleStart: string, averageLength: number | null): string | null {
  if (!averageLength) return null
  const next = new Date(lastCycleStart)
  next.setDate(next.getDate() + averageLength)
  return next.toISOString().split("T")[0]
}

/**
 * Fertile window estimate: roughly days 11 to 17 of a 28 day cycle, scaled to
 * the observed cycle length, never earlier than day 8 and never later than 10
 * days before the next period.
 */
export function estimateFertileWindow(lastCycleStart: string, averageLength: number | null): DateRange | null {
  if (!averageLength) return null

  const startDay = Math.max(Math.round(averageLength * 0.39), 8)
  const endDay = Math.min(Math.round(averageLength * 0.61), averageLength - 10)
  if (endDay < startDay) return null

  const start = new Date(lastCycleStart)
  start.setDate(start.getDate() + startDay)

  const end = new Date(lastCycleStart)
  end.setDate(end.getDate() + endDay)

  return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] }
}

export type CycleInsights = {
  averageCycleLength: number | null
  cycleRegularity: number | null
  estimatedFertileWindow: DateRange | null
  estimatedNextPeriod: string | null
}

type CycleLike = {
  cycle_start_date: string | null
  cycle_end_date: string | null
}

/**
 * Full insight set from the completed cycles, most recent first.
 * Only cycles with both a start and an end date are used.
 */
export function buildCycleInsights(cycles: CycleLike[]): CycleInsights {
  const completed = cycles.filter(
    (cycle): cycle is { cycle_start_date: string; cycle_end_date: string } =>
      Boolean(cycle.cycle_start_date && cycle.cycle_end_date),
  )

  const lengths = completed.map((cycle) => cycleLength(cycle.cycle_start_date, cycle.cycle_end_date))
  const average = averageCycleLength(lengths)
  const lastStart = completed[0]?.cycle_start_date ?? null

  return {
    averageCycleLength: average,
    cycleRegularity: cycleRegularity(lengths),
    estimatedFertileWindow: lastStart ? estimateFertileWindow(lastStart, average) : null,
    estimatedNextPeriod: lastStart ? estimateNextPeriod(lastStart, average) : null,
  }
}
