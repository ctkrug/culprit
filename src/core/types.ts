// Minimal HAR 1.2 shape — only the fields the analyzer actually reads.
// See http://www.softwareishard.com/blog/har-12-spec/ for the full spec.

export interface HarTimings {
  blocked?: number;
  dns?: number;
  connect?: number;
  send?: number;
  wait?: number;
  receive?: number;
  ssl?: number;
}

export interface HarContent {
  size: number;
  mimeType: string;
  compression?: number;
}

export interface HarEntry {
  startedDateTime: string;
  time: number;
  request: {
    method: string;
    url: string;
  };
  response: {
    status: number;
    content: HarContent;
    headersSize: number;
    bodySize: number;
  };
  timings: HarTimings;
  serverIPAddress?: string;
}

export interface HarLog {
  version: string;
  entries: HarEntry[];
}

export interface HarFile {
  log: HarLog;
}

// A HarEntry normalized into the shape the analysis engine reasons about.
export interface RequestRecord {
  url: string;
  host: string;
  method: string;
  status: number;
  mimeType: string;
  bytes: number;
  timeMs: number;
  startMs: number;
}
