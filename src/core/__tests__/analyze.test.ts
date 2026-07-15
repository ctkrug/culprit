import { describe, expect, it } from "vitest";
import { analyze } from "../analyze";
import { toRequestRecords } from "../parseHar";
import { sampleHar } from "./fixtures/sample.har";

describe("analyze", () => {
  it("ranks the oversized hero image as the top offender", () => {
    const records = toRequestRecords(sampleHar);
    const report = analyze(records);

    expect(report.totalRequests).toBe(4);
    expect(report.offenders[0].kind).toBe("image");
    expect(report.offenders[0].url).toContain("hero.jpg");
    expect(report.offenders[0].fix).toMatch(/compress|lazy-load/i);
  });

  it("classifies a known analytics host as a tracker", () => {
    const records = toRequestRecords(sampleHar);
    const report = analyze(records);

    const tracker = report.offenders.find((o) => o.url.includes("google-analytics.com"));
    expect(tracker?.kind).toBe("tracker");
  });

  it("returns an empty report for no requests without throwing", () => {
    const report = analyze([]);
    expect(report.totalRequests).toBe(0);
    expect(report.offenders).toHaveLength(0);
  });
});
