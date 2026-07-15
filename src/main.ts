import "./app.css";
import { analyze, type AutopsyReport } from "./core/analyze";
import { HarParseError, parseHar, toRequestRecords } from "./core/parseHar";

const app = document.querySelector<HTMLDivElement>("#app")!;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function render(state: { report?: AutopsyReport; error?: string }) {
  app.innerHTML = `
    <header class="masthead">
      <span class="wordmark">Waterfall<em>Autopsy</em></span>
      <span class="tagline">the offenders, not the chart</span>
    </header>
    <main class="layout">
      <section class="case-panel" aria-label="Case file summary">
        ${
          state.report
            ? `<dl class="stats">
                <div><dt>Requests</dt><dd>${state.report.totalRequests}</dd></div>
                <div><dt>Total size</dt><dd>${formatBytes(state.report.totalBytes)}</dd></div>
                <div><dt>Total time</dt><dd>${Math.round(state.report.totalTimeMs)}ms</dd></div>
              </dl>`
            : `<label class="dropzone" for="har-input">
                <span>DROP .HAR TO OPEN CASE</span>
                <input id="har-input" type="file" accept=".har,application/json" />
              </label>`
        }
        ${state.error ? `<p class="error" role="alert">${state.error}</p>` : ""}
      </section>
      <section class="punch-list" aria-label="Offender punch list">
        ${
          state.report
            ? state.report.offenders
                .map(
                  (o, i) => `
                <article class="offender-card ${i === 0 ? "top-offender" : ""}">
                  ${i === 0 ? `<span class="stamp">TOP OFFENDER</span>` : ""}
                  <span class="kind">${o.kind}</span>
                  <p class="url">${o.url}</p>
                  <p class="fix">${o.fix}</p>
                  <p class="meta">${formatBytes(o.bytes)} · ${Math.round(o.timeMs)}ms</p>
                </article>`,
                )
                .join("")
            : `<p class="empty-hint">No case open yet. Drop a HAR file to generate the punch list.</p>`
        }
      </section>
    </main>
  `;

  const input = document.querySelector<HTMLInputElement>("#har-input");
  input?.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const har = parseHar(text);
      const records = toRequestRecords(har);
      render({ report: analyze(records) });
    } catch (err) {
      render({ error: err instanceof HarParseError ? err.message : "Couldn't read that file." });
    }
  });
}

render({});
