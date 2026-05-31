export interface PreRunWarning {
  id: string;
  severity: "error" | "warning" | "info";
  title: string;
  message: string;
  line?: number;
  concept?: string;
  fix?: string;
}

export function analyzeBeforeRun(code: string): PreRunWarning[] {
  const warnings: PreRunWarning[] = [];
  const lines = code.split("\n");

  lines.forEach((line, i) => {
    const lineNum = i + 1;

    // print(hello world) — unquoted text in print
    const printUnquoted = line.match(/print\s*\(\s*([^"'#\n)]+)\s*\)/);
    if (printUnquoted) {
      const inner = printUnquoted[1].trim();
      if (/^[a-zA-Z_][\w\s]*$/.test(inner) && !/^\d/.test(inner)) {
        warnings.push({
          id: `print-quotes-${lineNum}`,
          severity: "error",
          title: "Missing quotes in print()",
          message: `Line ${lineNum}: Python treats \`${inner.split(/\s+/)[0]}\` as a variable name, not text.`,
          line: lineNum,
          concept: "Strings must be wrapped in 'single' or \"double\" quotes.",
          fix: `print("${inner.replace(/"/g, '\\"')}")`,
        });
      }
    }

    // if without colon
    if (/^\s*if\s+.+[^:]\s*$/.test(line) && !line.trim().endsWith(":")) {
      warnings.push({
        id: `if-colon-${lineNum}`,
        severity: "warning",
        title: "Missing colon after if",
        message: `Line ${lineNum}: if statements need a colon at the end.`,
        line: lineNum,
        fix: line.trim() + ":",
      });
    }

    // def without colon
    if (/^\s*def\s+\w+\([^)]*\)\s*$/.test(line)) {
      warnings.push({
        id: `def-colon-${lineNum}`,
        severity: "warning",
        title: "Missing colon after def",
        message: `Line ${lineNum}: function definitions need a colon.`,
        line: lineNum,
      });
    }
  });

  // Tab characters mixed with spaces
  if (code.includes("\t") && /^( {1,3}[^ ]| {5,7}[^ ])/m.test(code)) {
    warnings.push({
      id: "tabs-mixed",
      severity: "warning",
      title: "Tabs and spaces mixed",
      message: "Use 4 spaces per indent level consistently — mixing tabs and spaces causes IndentationError.",
      concept: "Python 3 uses indentation instead of braces to define blocks.",
    });
  }

  // matplotlib without show/savefig
  if (/plt\.(plot|bar|scatter|hist)\s*\(/.test(code) && !/plt\.(show|savefig)\s*\(/.test(code)) {
    warnings.push({
      id: "plt-show",
      severity: "info",
      title: "Plot may not display",
      message: "You created a plot but didn't call plt.show() or plt.savefig(). In PyForge, plots are captured when you save them.",
      fix: "plt.savefig('plot.png')  # or plt.show() in interactive mode",
      concept: "Matplotlib draws lazily — you must show or save the figure.",
    });
  }

  if (/read_csv\s*\(\s*['"][^'"]+['"]\s*\)/.test(code)) {
    warnings.push({
      id: "data-ethics",
      severity: "info",
      title: "Data responsibility",
      message:
        "Loading external CSV data — ensure you have permission to use it and avoid uploading sensitive personal data to shared environments.",
      concept: "Ethics: only use datasets you are allowed to process.",
    });
  }

  // pandas read_csv without handling
  if (/read_csv\s*\(/.test(code) && !/\.head\s*\(|print\s*\(/.test(code)) {
    warnings.push({
      id: "csv-preview",
      severity: "info",
      title: "Preview your data",
      message: "After loading CSV data, use df.head() to inspect rows and catch wrong files early.",
      concept: "Always validate shape and columns before modeling.",
    });
  }

  // train_test_split without random_state
  if (/train_test_split\s*\(/.test(code) && !/random_state/.test(code)) {
    warnings.push({
      id: "ml-repro",
      severity: "info",
      title: "ML reproducibility",
      message: "Add random_state=42 to train_test_split for repeatable experiments.",
    });
  }

  return warnings;
}
