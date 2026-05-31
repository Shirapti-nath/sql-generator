export interface GhostMark {
  line: number;
  startColumn: number;
  endColumn: number;
  kind: "identifier" | "literal";
  label: string;
}

/** Visual semantics: unquoted tokens inside print() are names, not strings. */
export function analyzeSyntaxGhost(code: string): GhostMark[] {
  const marks: GhostMark[] = [];
  const lines = code.split("\n");

  lines.forEach((line, i) => {
    const lineNum = i + 1;
    const printMatch = line.match(/print\s*\(\s*([^"'][^)]*)\s*\)/);
    if (!printMatch) return;

    const inner = printMatch[1];
    const offset = line.indexOf(inner, line.indexOf("print"));
    if (offset < 0) return;

    const tokens = inner.split(/\s+/).filter(Boolean);
    let col = offset;
    for (const tok of tokens) {
      if (/^[a-zA-Z_]\w*$/.test(tok)) {
        marks.push({
          line: lineNum,
          startColumn: col + 1,
          endColumn: col + tok.length + 1,
          kind: "identifier",
          label: `"${tok}" is a name (variable), not text — add quotes for strings`,
        });
      }
      col = line.indexOf(tok, col) + tok.length + 1;
    }
  });

  return marks;
}
