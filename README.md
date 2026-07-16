# Culprit

**▶ Live demo: [apps.charliekrug.com/waterfall-autopsy](https://apps.charliekrug.com/waterfall-autopsy/)**

[![CI](https://github.com/ctkrug/waterfall-autopsy/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/waterfall-autopsy/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-B3241C.svg)](LICENSE)

Find what's slowing your page.

Culprit reads a `.har` network export and names the specific images, scripts, and third-party
trackers costing you load time. It ranks them worst-first and writes a one-line fix for each, in
plain English. Everything runs in your browser, so the file never leaves your machine.

## Who it's for

A web developer, or a PM handed a HAR file after a "the site feels slow" complaint, who wants the
answer in under a minute instead of a chart to research. You do not need to know what TTFB or LCP
mean to read the result.

## The problem

Every browser and performance tool hands you a network waterfall: rows of colored bars, one per
request. It is accurate and useless on its own, because you still have to eyeball 150 rows,
cross-reference sizes against timings, and guess which handful is worth fixing. Lighthouse tells
you the LCP is 4.1s; a waterfall shows you a wall of bars. Neither says, in one line, "this 4.9MB
hero image and these tracker scripts are most of your load time, fix these first." That synthesis
is the whole point of Culprit.

## What you get

Drop a `.har` file (or click **Try a sample case**) and you get a ranked punch list. Here is the
real output from the bundled example, as produced by the **Copy punch list** button:

```
Culprit — punch list (7 requests)

1. **image** — Compress or lazy-load this 4980KB image — it's larger than most full pages. (4.9MB, 1100ms)
2. **render-blocking-script** — Add async or defer to this 176KB script — it's blocking first paint. (175.8KB, 220ms)
3. **tracker** — Load this third-party tracker async or drop it if it isn't essential. (60.5KB, 260ms)
4. **stylesheet** — Split or defer this 33KB stylesheet — inline only the critical CSS. (33.2KB, 90ms)
5. **other** — Investigate why this 6KB request is on the critical path. (6.3KB, 100ms)
```

Each entry names the request kind, a fix that references its actual size, and its byte and time cost.

## Features

- **Ranked punch list.** Every request is classified as an oversized image, a known
  analytics/ads tracker (24 documented hosts), a render-blocking script, an async/deferred script,
  a font, or a stylesheet, each with a plain-English fix that names its real size.
- **Cost scoring that isn't bytes-only.** Requests rank by a blend of byte share and time share,
  so a small-but-slow request can outrank a large-but-cached one.
- **Redirect-chain aware.** A 3xx chain's time is folded into the request that actually resolves
  it, instead of listing each hop as its own falsely-cheap entry.
- **First-party vs third-party breakdown.** Byte and time share split by party, plus the single
  largest contributing host.
- **Supporting waterfall chart.** A Chart.js timeline of every request's start and duration; click
  a punch-list card to highlight its bar.
- **Copy the punch list.** One click puts a ranked Markdown version on your clipboard, ready to
  paste into a ticket.
- **Client-side only.** A HAR can carry internal URLs and header data, so the file is parsed in
  your browser and never uploaded. Large HARs (1,000+ entries) show a loading state and analyze in
  well under a second.
- **Clear errors, never a blank screen.** A non-JSON file, a non-HAR JSON file, or a HAR with zero
  entries each produce a plain-English message.

## Try it

Two ways to feed it a case:

1. **Your own HAR.** In Chrome or Edge, open DevTools, go to the Network tab, reload the page, then
   right-click any request and choose "Save all as HAR." Firefox and Safari have the same export.
   Drop the file onto the page.
2. **The sample case.** No HAR handy? Click "Try a sample case" for a full report built from a
   bundled example.

## Stack

TypeScript, [Chart.js](https://www.chartjs.org/) for the waterfall, [Vite](https://vitejs.dev/)
for the build, [Vitest](https://vitest.dev/) for tests. Ships as a static site with no server-side
component.

## Development

```bash
npm install
npm run dev       # local dev server
npm test          # run the test suite
npm run build     # production build to dist/
```

See [`docs/VISION.md`](docs/VISION.md) for the design rationale,
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for a module map, and
[`docs/BACKLOG.md`](docs/BACKLOG.md) for the delivered scope.

## License

MIT, see [LICENSE](LICENSE).

---

More of Charlie's projects → [apps.charliekrug.com](https://apps.charliekrug.com)
