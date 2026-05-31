export interface CodeSnapshot {
  id: string;
  concept: string;
  code: string;
  at: string;
}

export function detectConcept(code: string): string {
  if (/read_csv|DataFrame|pd\./.test(code)) return "pandas";
  if (/plt\.|matplotlib|seaborn/.test(code)) return "visualization";
  if (/train_test_split|sklearn|\.fit\(/.test(code)) return "ml";
  if (/^def\s+/m.test(code)) return "functions";
  if (/^for\s+|^while\s+/m.test(code)) return "loops";
  if (/^if\s+/m.test(code)) return "conditionals";
  return "basics";
}

export function diffHighlights(before: string, after: string): string[] {
  const praise: string[] = [];
  if (/except\s*:/.test(before) && !/except\s*:/.test(after)) {
    praise.push("You removed bare except — nice!");
  }
  if (!/random_state/.test(before) && /random_state/.test(after)) {
    praise.push("Added random_state for reproducible ML.");
  }
  if (before.split("\n").length > after.split("\n").length + 3) {
    praise.push("Code got shorter — likely simpler logic.");
  }
  if (!/->\s*\w+/.test(before) && /->\s*\w+/.test(after)) {
    praise.push("Added type hints — professional habit.");
  }
  return praise;
}
