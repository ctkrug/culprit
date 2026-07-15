import { describe, expect, it } from "vitest";
import { HarParseError, parseHar, toRequestRecords } from "../parseHar";
import { sampleHar } from "./fixtures/sample.har";

describe("parseHar", () => {
  it("parses valid HAR JSON", () => {
    const har = parseHar(JSON.stringify(sampleHar));
    expect(har.log.entries).toHaveLength(4);
  });

  it("rejects invalid JSON with a plain-English error", () => {
    expect(() => parseHar("not json")).toThrow(HarParseError);
  });

  it("rejects JSON that isn't a HAR file", () => {
    expect(() => parseHar(JSON.stringify({ foo: "bar" }))).toThrow(HarParseError);
  });
});

describe("toRequestRecords", () => {
  it("normalizes entries with origin-relative start times", () => {
    const records = toRequestRecords(sampleHar);
    expect(records).toHaveLength(4);
    expect(records[0].startMs).toBe(0);
    expect(records[1].startMs).toBeGreaterThan(0);
    expect(records[1].host).toBe("example.com");
  });
});
