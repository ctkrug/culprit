import { describe, expect, it } from "vitest";
import { isTrackerHost, TRACKER_HOSTS } from "../trackers";

describe("isTrackerHost", () => {
  it("tracks at least 15 known analytics/ads/session-replay hosts", () => {
    expect(TRACKER_HOSTS.length).toBeGreaterThanOrEqual(15);
  });

  it("matches known hosts and their subdomains", () => {
    expect(isTrackerHost("google-analytics.com")).toBe(true);
    expect(isTrackerHost("www.google-analytics.com")).toBe(true);
    expect(isTrackerHost("region1.hs-analytics.net")).toBe(true);
  });

  it("does not match an unrelated host that merely shares a suffix", () => {
    expect(isTrackerHost("notgoogle-analytics.com")).toBe(false);
    expect(isTrackerHost("example.com")).toBe(false);
  });

  it("returns false for an empty host", () => {
    expect(isTrackerHost("")).toBe(false);
  });
});
