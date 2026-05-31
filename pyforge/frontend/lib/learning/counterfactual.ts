import type { ParsedError } from "@/lib/error-parser";

export interface SuggestedPatch {
  patchedCode: string;
  description: string;
}

/** Build a single-fix shadow copy for counterfactual run. */
export function buildCounterfactualPatch(code: string, error: ParsedError): SuggestedPatch | null {
  const lines = code.split("\n");
  const lineIdx = (error.line ?? 1) - 1;

  if (error.type.includes("Missing Quotes") && lineIdx >= 0 && lineIdx < lines.length) {
    const line = lines[lineIdx];
    const m = line.match(/print\s*\(\s*([^"'#\n)]+)\s*\)/);
    if (m) {
      const text = m[1].trim();
      const fixed = line.replace(m[0], `print("${text.replace(/"/g, '\\"')}")`);
      const patched = [...lines];
      patched[lineIdx] = fixed;
      return { patchedCode: patched.join("\n"), description: `Add quotes: print("${text}")` };
    }
  }

  if (error.type.includes("Name") && lineIdx >= 0) {
    const assignMatch = code.match(/(\w+)\s*=\s*.+/);
    if (assignMatch && lines.some((l) => l.includes(assignMatch[1]))) {
      const varName = assignMatch[1];
      const useLine = lines.findIndex((l, i) => i < lineIdx && l.includes(`print(${varName})`));
      if (useLine >= 0) {
        const patched = [...lines];
        const assignLine = lines.find((l) => l.match(new RegExp(`^\\s*${varName}\\s*=`)));
        if (assignLine) {
          patched.splice(useLine, 0, assignLine);
          patched.splice(useLine + 2, 1);
          return { patchedCode: patched.join("\n"), description: `Move assignment before use of ${varName}` };
        }
      }
    }
  }

  if (error.example) {
    const exampleLine = error.example.split("\n").find((l) => l.trim() && !l.trim().startsWith("#"));
    if (exampleLine && lineIdx >= 0) {
      const patched = [...lines];
      patched[lineIdx] = exampleLine;
      return { patchedCode: patched.join("\n"), description: "Apply suggested example line" };
    }
  }

  return null;
}
