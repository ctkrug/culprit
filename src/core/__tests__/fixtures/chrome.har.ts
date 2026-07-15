// A HAR shaped like Chrome DevTools' "Save all as HAR" export: full timings,
// a populated serverIPAddress, and Chrome-specific `_initiator`/`connection`
// fields the analyzer never reads but must tolerate.
export const chromeHar = {
  log: {
    version: "1.2",
    creator: { name: "WebInspector", version: "1.0" },
    entries: [
      {
        startedDateTime: "2026-01-01T00:00:00.000Z",
        time: 180,
        request: { method: "GET", url: "https://example.com/" },
        response: {
          status: 200,
          content: { size: 3_000, mimeType: "text/html; charset=utf-8" },
          headersSize: 300,
          bodySize: 3_000,
        },
        timings: { blocked: 5, dns: 10, connect: 20, ssl: 15, send: 1, wait: 100, receive: 44 },
        serverIPAddress: "93.184.216.34",
        connection: "80",
        _initiator: { type: "other" },
      },
      {
        startedDateTime: "2026-01-01T00:00:00.200Z",
        time: 60,
        request: { method: "GET", url: "https://example.com/app.js" },
        response: {
          status: 200,
          content: { size: 12_000, mimeType: "application/javascript" },
          headersSize: 250,
          bodySize: 12_000,
        },
        timings: { blocked: 2, send: 1, wait: 40, receive: 17 },
        serverIPAddress: "93.184.216.34",
      },
    ],
  },
};
