export interface Drill {
  id: string;
  errorType: string;
  title: string;
  prompt: string;
  starterCode: string;
  solution: string;
  hint: string;
}

export const DRILLS: Drill[] = [
  {
    id: "syntax-quotes",
    errorType: "SyntaxError",
    title: "Fix the print statement",
    prompt: "Make this print the text hello world (not variable names).",
    starterCode: 'print(hello world)',
    solution: 'print("hello world")',
    hint: "Wrap the text in double quotes.",
  },
  {
    id: "name-undefined",
    errorType: "NameError",
    title: "Define before use",
    prompt: "Fix the code so it prints 42.",
    starterCode: 'print(total)\ntotal = 42',
    solution: 'total = 42\nprint(total)',
    hint: "Assign total before printing it.",
  },
  {
    id: "index-bounds",
    errorType: "IndexError",
    title: "Valid list index",
    prompt: "Print the last item of the list using a valid index.",
    starterCode: 'items = ["a", "b", "c"]\nprint(items[3])',
    solution: 'items = ["a", "b", "c"]\nprint(items[2])',
    hint: "Last index is length minus 1.",
  },
  {
    id: "type-concat",
    errorType: "TypeError",
    title: "Combine number and text",
    prompt: "Print: Age: 25 (as one string).",
    starterCode: 'age = 25\nprint("Age: " + age)',
    solution: 'age = 25\nprint("Age: " + str(age))',
    hint: "Convert the int with str().",
  },
  {
    id: "indent-if",
    errorType: "IndentationError",
    title: "Indent the block",
    prompt: "Print positive when x > 0.",
    starterCode: "x = 5\nif x > 0:\nprint('positive')",
    solution: "x = 5\nif x > 0:\n    print('positive')",
    hint: "Indent the line inside if with 4 spaces.",
  },
];

export function drillsForErrorType(errorType: string): Drill[] {
  const base = errorType.includes("Syntax") || errorType.includes("Quotes")
    ? "SyntaxError"
    : errorType.split(" ")[0].replace(/—.*/, "");
  return DRILLS.filter((d) => d.errorType === base || errorType.includes(d.errorType)).slice(0, 2);
}

export function normalizeCode(s: string): string {
  return s
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function checkDrillSolution(userCode: string, drill: Drill): boolean {
  return normalizeCode(userCode) === normalizeCode(drill.solution);
}
