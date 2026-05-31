export interface IntentAlignment {
  line: number;
  code: string;
  aligned: boolean;
  reason: string;
}

const GOAL_KEYWORDS: Record<string, string[]> = {
  print: ["print", "output", "display", "show"],
  csv: ["csv", "read", "load", "file", "data", "pandas", "dataframe"],
  loop: ["loop", "for", "each", "iterate", "every"],
  list: ["list", "array", "items"],
  plot: ["plot", "chart", "graph", "visual", "matplotlib"],
  function: ["function", "def", "define"],
  variable: ["variable", "assign", "store", "set"],
};

export function analyzeIntentAlignment(goal: string, code: string): IntentAlignment[] {
  if (!goal.trim()) return [];

  const goalLower = goal.toLowerCase();
  const activeCategories = new Set<string>();
  for (const [cat, words] of Object.entries(GOAL_KEYWORDS)) {
    if (words.some((w) => goalLower.includes(w))) activeCategories.add(cat);
  }
  if (activeCategories.size === 0) activeCategories.add("print");

  const lines = code.split("\n");
  const results: IntentAlignment[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    let aligned = false;
    let reason = "Orphan line — may not serve your stated goal";

    if (/^print\s*\(/.test(trimmed) && activeCategories.has("print")) {
      aligned = true;
      reason = "Prints output — matches display goal";
    } else if (/read_csv|pd\.read/.test(trimmed) && activeCategories.has("csv")) {
      aligned = true;
      reason = "Loads data — matches CSV goal";
    } else if (/^for\s+/.test(trimmed) && activeCategories.has("loop")) {
      aligned = true;
      reason = "Loop — matches iteration goal";
    } else if (/^def\s+/.test(trimmed) && activeCategories.has("function")) {
      aligned = true;
      reason = "Defines function — matches structure goal";
    } else if (/plt\.|matplotlib|\.plot\(/.test(trimmed) && activeCategories.has("plot")) {
      aligned = true;
      reason = "Plotting — matches visualization goal";
    } else if (/=\s*/.test(trimmed) && !/==/.test(trimmed) && activeCategories.has("variable")) {
      aligned = true;
      reason = "Assignment — matches variable goal";
    } else if (/\.head\s*\(|df\[/.test(trimmed) && activeCategories.has("csv")) {
      aligned = true;
      reason = "Explores DataFrame — matches data goal";
    } else if (activeCategories.size === 1 && activeCategories.has("print") && /^import\s/.test(trimmed)) {
      aligned = true;
      reason = "Import supports later print statements";
    }

    results.push({ line: i + 1, code: trimmed, aligned, reason });
  });

  return results;
}
