export interface CognitiveLoadResult {
  score: number;
  level: "low" | "medium" | "high";
  tips: string[];
}

export function analyzeCognitiveLoad(code: string): CognitiveLoadResult {
  const lines = code.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  let score = 1;
  const tips: string[] = [];

  let maxDepth = 0;
  let depth = 0;
  for (const line of lines) {
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    depth = Math.floor(indent / 4);
    maxDepth = Math.max(maxDepth, depth);
  }
  if (maxDepth >= 3) {
    score += 2;
    tips.push("Deep nesting (3+ levels) — extract inner blocks into functions.");
  } else if (maxDepth >= 2) score += 1;

  const branches = (code.match(/\b(if|elif|for|while|except)\b/g) || []).length;
  if (branches > 5) {
    score += 2;
    tips.push("Many branches — consider simplifying control flow.");
  } else if (branches > 2) score += 1;

  const longLines = lines.filter((l) => l.length > 80).length;
  if (longLines > 2) {
    score += 1;
    tips.push("Long lines — break complex expressions across lines.");
  }

  const funcs = code.match(/^def\s+\w+/gm) || [];
  if (funcs.length === 0 && lines.length > 15) {
    score += 1;
    tips.push("Long script without functions — group logic into def blocks.");
  }

  score = Math.min(10, Math.max(1, score));
  const level = score <= 3 ? "low" : score <= 6 ? "medium" : "high";

  if (tips.length === 0) {
    tips.push(level === "low" ? "Code structure looks manageable." : "Consider one simplification before adding more.");
  }

  return { score, level, tips };
}
