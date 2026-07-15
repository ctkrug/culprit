import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { toRequestRecords } from "../parseHar";
import type { HarFile } from "../types";

// Any value a corrupt/hostile HAR might put where a number is expected —
// including ones that would produce NaN through naive coercion.
const arbitraryFieldValue = fc.oneof(
  fc.integer({ min: -1_000_000, max: 1_000_000 }),
  fc.double({ noNaN: false }),
  fc.string(),
  fc.constant(null),
  fc.constant(undefined),
  fc.boolean(),
  fc.array(fc.string()),
);

const arbitraryEntry = fc.record({
  startedDateTime: fc.constant("2026-01-01T00:00:00.000Z"),
  time: arbitraryFieldValue,
  request: fc.record({
    method: fc.constant("GET"),
    url: fc.oneof(fc.webUrl(), fc.string()),
  }),
  response: fc.record({
    status: fc.integer({ min: 100, max: 599 }),
    content: fc.record({
      size: arbitraryFieldValue,
      mimeType: fc.oneof(fc.constantFrom("image/png", "text/css", "application/javascript"), fc.string()),
    }),
    headersSize: fc.constant(0),
    bodySize: fc.constant(0),
  }),
});

describe("toRequestRecords — property: numeric fields never produce NaN or negatives", () => {
  it("always yields finite, non-negative bytes/timeMs regardless of input field shape", () => {
    fc.assert(
      fc.property(fc.array(arbitraryEntry, { minLength: 0, maxLength: 20 }), (entries) => {
        const har: HarFile = { log: { version: "1.2", entries: entries as HarFile["log"]["entries"] } };
        const records = toRequestRecords(har);

        for (const record of records) {
          expect(Number.isFinite(record.bytes)).toBe(true);
          expect(Number.isFinite(record.timeMs)).toBe(true);
          expect(record.bytes).toBeGreaterThanOrEqual(0);
          expect(record.timeMs).toBeGreaterThanOrEqual(0);
        }
      }),
    );
  });

  it("never produces more records than input entries (redirects only ever fold down)", () => {
    fc.assert(
      fc.property(fc.array(arbitraryEntry, { minLength: 0, maxLength: 20 }), (entries) => {
        const har: HarFile = { log: { version: "1.2", entries: entries as HarFile["log"]["entries"] } };
        const records = toRequestRecords(har);
        expect(records.length).toBeLessThanOrEqual(entries.length);
      }),
    );
  });
});
