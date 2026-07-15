import type { RequestRecord } from "./types";
import { isTrackerHost } from "./trackers";

export type OffenderKind =
  "image" | "render-blocking-script" | "script" | "tracker" | "font" | "stylesheet" | "other";

export interface Offender {
  kind: OffenderKind;
  url: string;
  host: string;
  bytes: number;
  timeMs: number;
  fix: string;
}

export interface HostContribution {
  host: string;
  bytes: number;
}

export interface AutopsyReport {
  totalRequests: number;
  totalBytes: number;
  totalTimeMs: number;
  firstPartyBytes: number;
  thirdPartyBytes: number;
  firstPartyTimeMs: number;
  thirdPartyTimeMs: number;
  largestHostContributor: HostContribution | null;
  offenders: Offender[];
}

function isScriptMime(mimeType: string): boolean {
  return mimeType.includes("javascript") || mimeType.includes("ecmascript");
}

function isVisualAssetMime(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType.includes("font") || mimeType.includes("css");
}

// A HAR has no direct signal for a <script>'s async/defer attributes, so
// render-blocking is inferred from timing position: a script that starts at
// or before the first visual asset (image/font/stylesheet) is presumed on
// the critical path — the parser hadn't yet moved on to fetch page content.
// The document request itself is deliberately excluded from this baseline
// (it always starts first and would make the threshold meaningless). If a
// page has no visual assets at all, every script is treated as blocking.
function firstVisualAssetStartMs(records: RequestRecord[]): number {
  const starts = records.filter((r) => isVisualAssetMime(r.mimeType)).map((r) => r.startMs);
  return starts.length > 0 ? Math.min(...starts) : Infinity;
}

function classify(record: RequestRecord, renderBlockingThresholdMs: number): OffenderKind {
  if (isTrackerHost(record.host)) return "tracker";
  if (record.mimeType.startsWith("image/")) return "image";
  if (isScriptMime(record.mimeType)) {
    return record.startMs <= renderBlockingThresholdMs ? "render-blocking-script" : "script";
  }
  if (record.mimeType.includes("font") || record.url.match(/\.(woff2?|ttf|otf|eot)(\?|$)/)) return "font";
  if (record.mimeType.includes("css")) return "stylesheet";
  return "other";
}

function fixFor(kind: OffenderKind, record: RequestRecord): string {
  const kb = Math.round(record.bytes / 1024);
  switch (kind) {
    case "image":
      return `Compress or lazy-load this ${kb}KB image — it's larger than most full pages.`;
    case "render-blocking-script":
      return `Add async or defer to this ${kb}KB script — it's blocking first paint.`;
    case "script":
      return `Code-split this ${kb}KB script so it isn't loaded on every page.`;
    case "tracker":
      return `Load this third-party tracker async or drop it if it isn't essential.`;
    case "font":
      return `Subset or preload this font to cut render-blocking wait time.`;
    case "stylesheet":
      return `Split or defer this ${kb}KB stylesheet — inline only the critical CSS.`;
    default:
      return `Investigate why this ${kb}KB request is on the critical path.`;
  }
}

// Naive base-domain check (last two dot-separated labels) rather than a full
// public-suffix-list lookup — good enough to tell "cdn.example.com" apart
// from "doubleclick.net", the case that actually matters for this report.
// Known limitation: mis-splits multi-part TLDs like "example.co.uk".
function baseDomain(host: string): string {
  const parts = host.split(".").filter(Boolean);
  return parts.length <= 2 ? host : parts.slice(-2).join(".");
}

// The first request chronologically is assumed to be the page's own
// document — every other request is first-party if it shares that
// document's base domain, third-party otherwise.
function partyBreakdown(records: RequestRecord[]) {
  const siteHost = records[0]?.host ?? "";
  let firstPartyBytes = 0;
  let thirdPartyBytes = 0;
  let firstPartyTimeMs = 0;
  let thirdPartyTimeMs = 0;

  for (const record of records) {
    if (baseDomain(record.host) === baseDomain(siteHost)) {
      firstPartyBytes += record.bytes;
      firstPartyTimeMs += record.timeMs;
    } else {
      thirdPartyBytes += record.bytes;
      thirdPartyTimeMs += record.timeMs;
    }
  }

  return { firstPartyBytes, thirdPartyBytes, firstPartyTimeMs, thirdPartyTimeMs };
}

function largestHostContributor(records: RequestRecord[]): HostContribution | null {
  const bytesByHost = new Map<string, number>();
  for (const record of records) {
    if (!record.host) continue;
    bytesByHost.set(record.host, (bytesByHost.get(record.host) ?? 0) + record.bytes);
  }

  let largest: HostContribution | null = null;
  for (const [host, bytes] of bytesByHost) {
    if (!largest || bytes > largest.bytes) largest = { host, bytes };
  }
  return largest;
}

// Cost blends bytes and time so a huge-but-cached asset and a small-but-slow
// one can both surface — pure byte size alone misses render-blocking scripts.
function costOf(record: RequestRecord, totalBytes: number, totalTimeMs: number): number {
  const byteShare = totalBytes > 0 ? record.bytes / totalBytes : 0;
  const timeShare = totalTimeMs > 0 ? record.timeMs / totalTimeMs : 0;
  return byteShare * 0.6 + timeShare * 0.4;
}

export function analyze(records: RequestRecord[], topN = 10): AutopsyReport {
  const totalBytes = records.reduce((sum, r) => sum + r.bytes, 0);
  const totalTimeMs = records.reduce((sum, r) => sum + r.timeMs, 0);
  const renderBlockingThresholdMs = firstVisualAssetStartMs(records);

  const offenders = records
    .map((record) => ({
      record,
      kind: classify(record, renderBlockingThresholdMs),
      cost: costOf(record, totalBytes, totalTimeMs),
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, topN)
    .map(({ record, kind }) => ({
      kind,
      url: record.url,
      host: record.host,
      bytes: record.bytes,
      timeMs: record.timeMs,
      fix: fixFor(kind, record),
    }));

  const { firstPartyBytes, thirdPartyBytes, firstPartyTimeMs, thirdPartyTimeMs } = partyBreakdown(records);

  return {
    totalRequests: records.length,
    totalBytes,
    totalTimeMs,
    firstPartyBytes,
    thirdPartyBytes,
    firstPartyTimeMs,
    thirdPartyTimeMs,
    largestHostContributor: largestHostContributor(records),
    offenders,
  };
}
