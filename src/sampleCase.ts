import type { HarFile } from "./core/types";

// A bundled example case for first-time users who don't have their own HAR
// handy yet. Deliberately exercises several distinct offender kinds (an
// oversized hero image, a tracker script, a render-blocking script, a
// redirect chain) so "try a sample case" produces a real, varied punch list.
export const sampleCaseHar: HarFile = {
  log: {
    version: "1.2",
    entries: [
      {
        startedDateTime: "2026-01-01T00:00:00.000Z",
        time: 60,
        request: { method: "GET", url: "https://shop.example.com/" },
        response: {
          status: 200,
          content: { size: 3_200, mimeType: "text/html" },
          headersSize: 200,
          bodySize: 3_200,
        },
        timings: { wait: 45, receive: 15 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.030Z",
        time: 220,
        request: { method: "GET", url: "https://shop.example.com/vendor-bundle.js" },
        response: {
          status: 200,
          content: { size: 180_000, mimeType: "application/javascript" },
          headersSize: 200,
          bodySize: 180_000,
        },
        timings: { wait: 190, receive: 30 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.120Z",
        time: 60,
        request: { method: "GET", url: "https://shop.example.com/old-catalog" },
        response: { status: 301, content: { size: 0, mimeType: "" }, headersSize: 150, bodySize: 0 },
        timings: { wait: 60 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.180Z",
        time: 40,
        request: { method: "GET", url: "https://shop.example.com/catalog" },
        response: {
          status: 200,
          content: { size: 6_500, mimeType: "text/html" },
          headersSize: 200,
          bodySize: 6_500,
        },
        timings: { wait: 30, receive: 10 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.200Z",
        time: 1_100,
        request: { method: "GET", url: "https://shop.example.com/hero-banner.png" },
        response: {
          status: 200,
          content: { size: 5_100_000, mimeType: "image/png" },
          headersSize: 200,
          bodySize: 5_100_000,
        },
        timings: { wait: 850, receive: 250 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.210Z",
        time: 260,
        request: { method: "GET", url: "https://www.googletagmanager.com/gtm.js" },
        response: {
          status: 200,
          content: { size: 62_000, mimeType: "application/javascript" },
          headersSize: 200,
          bodySize: 62_000,
        },
        timings: { wait: 220, receive: 40 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.260Z",
        time: 90,
        request: { method: "GET", url: "https://shop.example.com/styles.css" },
        response: {
          status: 200,
          content: { size: 34_000, mimeType: "text/css" },
          headersSize: 200,
          bodySize: 34_000,
        },
        timings: { wait: 70, receive: 20 },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.900Z",
        time: 35,
        request: { method: "GET", url: "https://shop.example.com/recommendations.js" },
        response: {
          status: 200,
          content: { size: 9_000, mimeType: "application/javascript" },
          headersSize: 200,
          bodySize: 9_000,
        },
        timings: { wait: 25, receive: 10 },
      },
    ],
  },
};
