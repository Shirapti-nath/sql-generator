export interface QualitySuggestion {
  id: string;
  severity: "info" | "warning" | "tip";
  title: string;
  message: string;
  line?: number;
  category: string;
}

export function analyzeCodeQuality(code: string): QualitySuggestion[] {
  const suggestions: QualitySuggestion[] = [];
  const lines = code.split("\n");

  if (code.trim().length === 0) {
    return [{ id: "empty", severity: "info", title: "Empty file", message: "Start typing or pick a template from the toolbar.", category: "general" }];
  }

  // PEP 8: line length
  lines.forEach((line, i) => {
    if (line.length > 88) {
      suggestions.push({
        id: `len-${i}`,
        severity: "warning",
        title: "Line too long",
        message: `Line ${i + 1} exceeds 88 characters (PEP 8). Consider breaking it up.`,
        line: i + 1,
        category: "style",
      });
    }
  });

  // Trailing whitespace
  lines.forEach((line, i) => {
    if (line.endsWith(" ") || line.endsWith("\t")) {
      suggestions.push({
        id: `trail-${i}`,
        severity: "info",
        title: "Trailing whitespace",
        message: `Remove trailing spaces on line ${i + 1}.`,
        line: i + 1,
        category: "style",
      });
    }
  });

  // Bare except
  if (/except\s*:/.test(code)) {
    suggestions.push({
      id: "bare-except",
      severity: "warning",
      title: "Bare except",
      message: "Catch specific exceptions (e.g. except ValueError:) instead of bare except:.",
      category: "best-practice",
    });
  }

  // print in production ML scripts - tip only
  const printCount = (code.match(/^\s*print\(/gm) || []).length;
  if (printCount > 5) {
    suggestions.push({
      id: "many-prints",
      severity: "tip",
      title: "Many print statements",
      message: "For production ML pipelines, consider logging (import logging) instead of many prints.",
      category: "ml",
    });
  }

  // Missing main guard for scripts
  if (lines.length > 10 && !code.includes('if __name__ == "__main__"') && /def main\(/.test(code)) {
    suggestions.push({
      id: "main-guard",
      severity: "tip",
      title: "Add main guard",
      message: 'Wrap entry point with if __name__ == "__main__": for reusable modules.',
      category: "best-practice",
    });
  }

  // Pandas: chained assignment smell
  if (/df\[[^\]]+\]\s*=[^=]/.test(code) && !code.includes(".loc[")) {
    suggestions.push({
      id: "pandas-chain",
      severity: "warning",
      title: "Pandas chained assignment",
      message: "Use df.loc[row, col] = value to avoid SettingWithCopyWarning.",
      category: "pandas",
    });
  }

  // ML: train without random_state
  if (/train_test_split\(/.test(code) && !/random_state/.test(code)) {
    suggestions.push({
      id: "random-state",
      severity: "tip",
      title: "Set random_state",
      message: "Add random_state=42 to train_test_split for reproducible ML experiments.",
      category: "ml",
    });
  }

  // Type hints for functions
  const funcWithoutHints = code.match(/def\s+\w+\([^)]*\)\s*:/g);
  if (funcWithoutHints && funcWithoutHints.length > 0 && !code.includes("->")) {
    suggestions.push({
      id: "type-hints",
      severity: "tip",
      title: "Add return type hints",
      message: "Professional Python uses type hints: def fn(x: int) -> str:",
      category: "typing",
    });
  }

  // Positive feedback
  if (suggestions.length === 0) {
    suggestions.push({
      id: "looks-good",
      severity: "info",
      title: "Looking good",
      message: "No major style issues detected. Run Copilot for deeper AI review.",
      category: "general",
    });
  }

  return suggestions;
}
