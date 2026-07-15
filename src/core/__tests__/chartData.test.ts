import { describe, expect, it } from "vitest";
import { shortLabel, toWaterfallBars } from "../chartData";
import { toRequestRecords } from "../parseHar";
import { sampleHar } from "./fixtures/sample.har";

describe("shortLabel", () => {
  it("shortens a URL to host + last path segment", () => {
    expect(shortLabel("https://example.com/assets/hero.jpg")).toBe("example.com/hero.jpg");
  });

  it("falls back to the host alone when there's no path", () => {
    expect(shortLabel("https://example.com/")).toBe("example.com");
  });

  it("falls back to the raw string for an unparsable URL", () => {
    expect(shortLabel("not-a-url")).toBe("not-a-url");
  });

  it("falls back to a placeholder for an empty string", () => {
    expect(shortLabel("")).toBe("(unknown)");
  });
});

describe("toWaterfallBars", () => {
  it("returns one bar per request with start/end offsets", () => {
    const records = toRequestRecords(sampleHar);
    const bars = toWaterfallBars(records);

    expect(bars).toHaveLength(4);
    expect(bars[0].startMs).toBe(0);
    expect(bars[0].endMs).toBe(records[0].startMs + records[0].timeMs);
  });

  it("returns an empty array for no records", () => {
    expect(toWaterfallBars([])).toEqual([]);
  });
});
