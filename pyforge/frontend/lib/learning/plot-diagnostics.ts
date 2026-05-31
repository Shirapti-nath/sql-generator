export interface PlotDiagnostic {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning";
}

export function diagnosePlotCode(code: string, plotCount: number): PlotDiagnostic[] {
  const tips: PlotDiagnostic[] = [];

  if (/plt\.(plot|bar|scatter|hist|pie)\s*\(/.test(code) && plotCount === 0) {
    tips.push({
      id: "no-output",
      title: "No plot captured",
      message:
        "You called a plotting function but no image was saved. Use plt.savefig('chart.png') in the plots folder, or ensure the backend captures Agg output.",
      severity: "warning",
    });
  }

  if (/plt\.(plot|bar)\s*\(\s*\)/.test(code)) {
    tips.push({
      id: "empty-plot",
      title: "Empty plot call",
      message: "plt.plot() was called with no x/y data. Pass arrays: plt.plot(x, y).",
      severity: "warning",
    });
  }

  if (/subplots\s*\(/.test(code) && !/plt\.(tight_layout|show|savefig)/.test(code)) {
    tips.push({
      id: "layout",
      title: "Tight layout",
      message: "Multi-panel figures often need plt.tight_layout() before savefig to avoid clipped labels.",
      severity: "info",
    });
  }

  if (/seaborn|sns\./.test(code) && !/plt\.(savefig|show)/.test(code)) {
    tips.push({
      id: "sns-save",
      title: "Save Seaborn figures",
      message: "Seaborn uses Matplotlib under the hood — still call plt.savefig() to export.",
      severity: "info",
    });
  }

  return tips;
}
