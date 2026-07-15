import type { HarFile } from "../../types";

// A tiny synthetic HAR: one HTML doc, one oversized hero image, one tracker
// script, and one small stylesheet. Enough to exercise every classifier
// branch without shipping a real (and much larger) HAR capture.
export const sampleHar: HarFile = {
  log: {
    version: "1.2",
    entries: [
      {
        startedDateTime: "2026-01-01T00:00:00.000Z",
        time: 120,
        request: { method: "GET", url: "https://example.com/" },
        response: {
          status: 200,
          content: { size: 2_000, mimeType: "text/html" },
          headersSize: 200,
          bodySize: 2_000,
        },
        timings: { wait: 100, receive: 20 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.150Z",
        time: 900,
        request: { method: "GET", url: "https://example.com/hero.jpg" },
        response: {
          status: 200,
          content: { size: 4_200_000, mimeType: "image/jpeg" },
          headersSize: 200,
          bodySize: 4_200_000,
        },
        timings: { wait: 700, receive: 200 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.200Z",
        time: 300,
        request: { method: "GET", url: "https://www.google-analytics.com/analytics.js" },
        response: {
          status: 200,
          content: { size: 45_000, mimeType: "application/javascript" },
          headersSize: 200,
          bodySize: 45_000,
        },
        timings: { wait: 250, receive: 50 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.250Z",
        time: 40,
        request: { method: "GET", url: "https://example.com/styles.css" },
        response: {
          status: 200,
          content: { size: 8_000, mimeType: "text/css" },
          headersSize: 200,
          bodySize: 8_000,
        },
        timings: { wait: 30, receive: 10 },
      },
    ],
  },
};
