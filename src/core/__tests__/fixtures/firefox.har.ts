// A HAR shaped like Firefox's Network Monitor export: no serverIPAddress on
// most entries, a `cache` object and `_securityState` field Chrome doesn't
// emit, and a "HAR Export Trigger"-style creator block.
export const firefoxHar = {
  log: {
    version: "1.2",
    creator: { name: "Firefox", version: "128.0" },
    entries: [
      {
        startedDateTime: "2026-01-01T00:00:00.000Z",
        time: 210,
        request: { method: "GET", url: "https://example.com/" },
        response: {
          status: 200,
          content: { size: 3_100, mimeType: "text/html" },
          headersSize: 320,
          bodySize: 3_100,
        },
        timings: { blocked: 3, dns: 8, connect: 18, send: 1, wait: 130, receive: 50 },
        cache: {},
        _securityState: "secure",
      },
      {
        startedDateTime: "2026-01-01T00:00:00.220Z",
        time: 45,
        request: { method: "GET", url: "https://example.com/app.js" },
        response: {
          status: 200,
          content: { size: 12_500, mimeType: "application/javascript" },
          headersSize: 260,
          bodySize: 12_500,
        },
        timings: { send: 1, wait: 30, receive: 14 },
        cache: {},
      },
    ],
  },
};
