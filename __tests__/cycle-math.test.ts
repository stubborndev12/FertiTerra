import { describe, expect, it } from "vitest"

import {
  averageCycleLength,
  buildCycleInsights,
  cycleLength,
  cycleRegularity,
  estimateFertileWindow,
  estimateNextPeriod,
} from "@/lib/cycle-math"

describe("cycleLength", () => {
  it("counts whole days between a start and an end date", () => {
    expect(cycleLength("2026-01-01", "2026-01-29")).toBe(28)
  })

  it("handles a cycle that crosses a month boundary", () => {
    expect(cycleLength("2026-01-25", "2026-02-22")).toBe(28)
  })

  it("handles a cycle that crosses a year boundary", () => {
    expect(cycleLength("2025-12-20", "2026-01-17")).toBe(28)
  })
})

describe("averageCycleLength", () => {
  it("returns null when there are no completed cycles", () => {
    expect(averageCycleLength([])).toBeNull()
  })

  it("rounds the mean of the recorded lengths", () => {
    expect(averageCycleLength([28, 30, 29])).toBe(29)
  })

  it("averages only the lengths it is given, not the number of attempts", () => {
    expect(averageCycleLength([28, 30])).toBe(29)
  })
})

describe("cycleRegularity", () => {
  it("needs at least two cycles", () => {
    expect(cycleRegularity([28])).toBeNull()
  })

  it("reports one decimal place of population standard deviation", () => {
    expect(cycleRegularity([28, 28, 28])).toBe(0)
    expect(cycleRegularity([26, 30])).toBe(2)
  })
})

describe("estimateNextPeriod", () => {
  it("adds one average cycle to the last start date", () => {
    expect(estimateNextPeriod("2026-03-01", 28)).toBe("2026-03-29")
  })

  it("returns null without an average", () => {
    expect(estimateNextPeriod("2026-03-01", null)).toBeNull()
  })
})

describe("estimateFertileWindow", () => {
  it("places the window inside a standard 28 day cycle", () => {
    expect(estimateFertileWindow("2026-03-01", 28)).toEqual({
      start: "2026-03-12",
      end: "2026-03-18",
    })
  })

  it("never starts before day 8 on a short cycle", () => {
    expect(estimateFertileWindow("2026-03-01", 20)).toEqual({
      start: "2026-03-09",
      end: "2026-03-11",
    })
  })

  it("returns null without an average", () => {
    expect(estimateFertileWindow("2026-03-01", null)).toBeNull()
  })
})

describe("buildCycleInsights", () => {
  it("ignores cycles that have not been closed", () => {
    const insights = buildCycleInsights([
      { cycle_start_date: "2026-02-26", cycle_end_date: null },
      { cycle_start_date: "2026-01-29", cycle_end_date: "2026-02-26" },
      { cycle_start_date: "2026-01-01", cycle_end_date: "2026-01-29" },
    ])

    expect(insights.averageCycleLength).toBe(28)
    expect(insights.estimatedNextPeriod).toBe("2026-02-26")
  })

  it("averages completed cycles only, so an open cycle cannot skew the mean", () => {
    const insights = buildCycleInsights([
      { cycle_start_date: "2026-02-27", cycle_end_date: null },
      { cycle_start_date: "2026-01-30", cycle_end_date: "2026-02-27" },
      { cycle_start_date: "2026-01-01", cycle_end_date: "2026-01-31" },
    ])

    expect(insights.averageCycleLength).toBe(29)
    expect(insights.cycleRegularity).toBe(1)
  })

  it("returns an empty insight set when nothing is complete", () => {
    expect(buildCycleInsights([{ cycle_start_date: "2026-03-01", cycle_end_date: null }])).toEqual({
      averageCycleLength: null,
      cycleRegularity: null,
      estimatedFertileWindow: null,
      estimatedNextPeriod: null,
    })
  })
})
