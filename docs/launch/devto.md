---
title: "Culprit: turning a HAR file into a punch list instead of another waterfall chart"
published: false
tags: webperf, javascript, typescript, webdev
---

Every browser can export a `.har` file of a page load in two clicks, and almost nothing useful
happens with it after that. You open it in a viewer, get the same waterfall of colored bars you
already saw in DevTools, and you are still the one who has to figure out which requests actually
matter. I built [Culprit](https://apps.charliekrug.com/waterfall-autopsy/) to skip that step: drop
a HAR, get a ranked list of the specific requests slowing the page down, each with a one-line fix.

The interesting part was not the chart. It was the two heuristics that let a pure-frontend tool say
something opinionated about a file it has never seen before.

## Scoring by more than bytes

The obvious way to rank offenders is by size. It is also wrong. A 4MB hero image and a 40KB script
that blocks first paint are both real problems, but a bytes-only sort buries the script. So the cost
of each request is a blend:

```ts
const byteShare = totalBytes > 0 ? record.bytes / totalBytes : 0;
const timeShare = totalTimeMs > 0 ? record.timeMs / totalTimeMs : 0;
return byteShare * 0.6 + timeShare * 0.4;
```

The 0.6/0.4 split leans toward size, because size is what you have the most direct control over, but
it keeps a small-and-slow request from disappearing. There is a regression test that asserts exactly
that: a high-time, low-byte request has to be able to outrank a large cached one, so the score can
never quietly collapse back into a byte sort.

## Guessing which scripts are render-blocking

A HAR has no field that says "this script had `async` on it." So how do you flag render-blocking
scripts? You infer it from timing. A script that starts at or before the first visual asset
(image, font, stylesheet) was almost certainly on the critical path, because the parser had not yet
moved on to fetching page content. Anything that starts later is treated as an async or deferred
script and gets a gentler fix.

It is a heuristic, not a certainty, and I wrote it down as one in the code comments rather than
pretending it is exact. But it is right often enough to be useful, and it costs nothing beyond data
the HAR already contains.

## The unglamorous part: not trusting the file

The thing that took the most iterations was input handling. HAR exports are not schema-validated, and
the three major browsers disagree in small ways. Safari reports `-1` for `content.size` when it does
not know, Firefox omits fields Chrome includes, and a corrupt or hostile file can put a string where
a number should be. `Math.max(NaN, 0)` is `NaN`, and a single `NaN` poisons every downstream sum and
sort, so one bad field can blank the whole report.

The fix is one small guard that every numeric field passes through:

```ts
function safeNonNegative(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? Math.max(n, 0) : 0;
}
```

It absorbs the missing-field case, the negative-sentinel case, and the non-numeric case without any
browser-specific branching. I ended up adding property-based tests with fast-check that throw
arbitrary and malformed entries at the parser to prove it never produces `NaN` or throws on garbage.

## What I would do differently

The base-domain check for first-party vs third-party is naive: it takes the last two dot-separated
labels, which mis-splits multi-part suffixes like `example.co.uk`. A real public-suffix-list lookup
would fix it, at the cost of shipping a large table to a tool whose whole appeal is that it is small
and runs locally. For now the comment says exactly where it breaks, which I would rather have than a
silent wrong answer.

Culprit is TypeScript, Chart.js, and Vite, MIT licensed, and runs entirely in the browser. Code and
the live demo are here:

- Live: https://apps.charliekrug.com/waterfall-autopsy/
- Source: https://github.com/ctkrug/waterfall-autopsy

If you try it on a real HAR and it mislabels something, I would genuinely like to know which request
and why.
