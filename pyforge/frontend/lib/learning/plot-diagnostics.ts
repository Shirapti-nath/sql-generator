export interface PlotDiagnostic {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning";
  fixSnippet?: string;
}

export function diagnosePlotCode(code: string, plotCount: number): PlotDiagnostic[] {
  const tips: PlotDiagnostic[] = [];

  if (/plt\.(plot|bar|scatter|hist|pie)\s*\(/.test(code) && plotCount === 0) {
    tips.push({
      id: "no-output",
      title: "Plot Autopsy: nothing captured",
      message:
        "Matplotlib built a figure in memory but nothing was saved. In browser mode, call plt.savefig('out.png') after plotting.",
      severity: "warning",
      fixSnippet: "\nplt.savefig('out.png')\n",
    });
  }

  if (/plt\.(plot|bar)\s*\(\s*\)/.test(code)) {
    tips.push({
      id: "empty-plot",
      title: "Empty plot call",
      message: "plt.plot() needs data: plt.plot(x, y). Check your variables exist and have values.",
      severity: "warning",
      fixSnippet: "x = [1, 2, 3]\ny = [2, 4, 1]\nplt.plot(x, y)",
    });
  }

  if (/figsize|subplots/.test(code) && !/plt\.(tight_layout|savefig)/.test(code)) {
    tips.push({
      id: "layout",
      title: "Labels may clip",
      message: "Add plt.tight_layout() before savefig for multi-panel figures.",
      severity: "info",
      fixSnippet: "\nplt.tight_layout()\nplt.savefig('out.png')\n",
    });
  }

  if (/seaborn|sns\./.test(code) && !/plt\.(savefig|show)/.test(code)) {
    tips.push({
      id: "sns-save",
      title: "Seaborn → save via pyplot",
      message: "Seaborn draws on the active Matplotlib figure — still call plt.savefig().",
      severity: "info",
      fixSnippet: "\nplt.savefig('out.png')\n",
    });
  }

  if (/plt\.plot\([^)]+\)/.test(code) && !/x\s*=|range\(|\[/.test(code)) {
    tips.push({
      id: "var-check",
      title: "Check plot variables",
      message: "Ensure x and y arrays are defined and the same length before plt.plot(x, y).",
      severity: "info",
    });
  }

  return tips;
}
