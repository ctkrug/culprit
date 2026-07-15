import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  LinearScale,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
import type { WaterfallBar } from "./core/chartData";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const ACCENT = "#b3241c";
const NEUTRAL = "#2b4a3e";

let activeChart: Chart | null = null;

// Chart.js "floating bar" technique: each dataset value is a [start, end]
// pair rather than a single number, which is how a horizontal bar chart
// becomes a Gantt-style waterfall.
export function renderWaterfallChart(
  canvas: HTMLCanvasElement,
  bars: WaterfallBar[],
  highlightUrl?: string,
): Chart {
  activeChart?.destroy();

  const config: ChartConfiguration<"bar", [number, number][], string> = {
    type: "bar",
    data: {
      labels: bars.map((bar) => bar.label),
      datasets: [
        {
          data: bars.map((bar) => [bar.startMs, bar.endMs]),
          backgroundColor: bars.map((bar) => (bar.url === highlightUrl ? ACCENT : NEUTRAL)),
          borderRadius: 2,
          barThickness: 12,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const bar = bars[ctx.dataIndex];
              return bar ? `${Math.round(bar.endMs - bar.startMs)}ms` : "";
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: "ms since first request" } },
        y: { ticks: { autoSkip: false, font: { size: 10 } } },
      },
    },
  };

  activeChart = new Chart(canvas, config);
  return activeChart;
}

export function destroyWaterfallChart(): void {
  activeChart?.destroy();
  activeChart = null;
}
