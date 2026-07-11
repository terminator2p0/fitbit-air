import { describe, expect, it } from "vitest";
import { activity, summaryMetrics, trendData } from "./health-data";

describe("health dashboard fixtures", () => {
  it("keeps trend data chronological and complete", () => {
    expect(trendData).toHaveLength(7);
    expect(trendData.at(-1)?.date).toBe("Today");
  });

  it("does not report progress above 100 percent", () => {
    const progress = Math.min(100, (activity.steps / activity.stepGoal) * 100);
    expect(progress).toBeLessThanOrEqual(100);
  });

  it("provides the four daily summary domains", () => {
    expect(summaryMetrics.map((metric) => metric.label)).toEqual([
      "Sleep",
      "Recovery",
      "Strain",
      "Nutrition",
    ]);
  });
});
