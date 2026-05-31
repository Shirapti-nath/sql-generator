export interface StoryboardStep {
  line: number;
  code: string;
  kind: "run" | "skip" | "comment" | "blank" | "import" | "def";
  note?: string;
}

/** Lightweight static trace for teaching — not a full debugger. */
export function buildExecutionStoryboard(code: string): StoryboardStep[] {
  const lines = code.split("\n");
  const steps: StoryboardStep[] = [];

  lines.forEach((raw, i) => {
    const lineNum = i + 1;
    const trimmed = raw.trim();

    if (!trimmed) {
      steps.push({ line: lineNum, code: raw, kind: "blank" });
      return;
    }
    if (trimmed.startsWith("#")) {
      steps.push({ line: lineNum, code: raw, kind: "comment", note: "Comment — not executed" });
      return;
    }
    if (trimmed.startsWith("import ") || trimmed.startsWith("from ")) {
      steps.push({ line: lineNum, code: raw, kind: "import", note: "Loads module into memory" });
      return;
    }
    if (trimmed.startsWith("def ")) {
      steps.push({ line: lineNum, code: raw, kind: "def", note: "Defines function (body runs when called)" });
      return;
    }
    if (trimmed.startsWith("@") || (trimmed.endsWith(":") && /^(if|for|while|elif|else|try|except|with|class)\b/.test(trimmed))) {
      steps.push({ line: lineNum, code: raw, kind: "skip", note: "Block header — controls flow" });
      return;
    }

    let note: string | undefined;
    if (/^print\s*\(/.test(trimmed)) note = "Writes to stdout";
    else if (/=\s*/.test(trimmed) && !trimmed.includes("==")) note = "Assigns a value to a name";
    else if (/\.fit\s*\(/.test(trimmed)) note = "Trains a model";
    else if (/\.head\s*\(/.test(trimmed)) note = "Shows first rows of a DataFrame";

    steps.push({ line: lineNum, code: raw, kind: "run", note });
  });

  return steps;
}
