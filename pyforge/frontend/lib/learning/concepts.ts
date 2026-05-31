export interface ConceptNode {
  id: string;
  title: string;
  description: string;
  relatedErrors: string[];
  nextSteps: string[];
}

export const CONCEPT_GRAPH: ConceptNode[] = [
  {
    id: "strings",
    title: "Strings & literals",
    description: "Text in Python is a str, written with quotes. Unquoted words are variable names.",
    relatedErrors: ["SyntaxError", "NameError"],
    nextSteps: ["Try f-strings: f\"Hello {name}\""],
  },
  {
    id: "variables",
    title: "Variables & names",
    description: "Names bind to values. They must be assigned before use and are case-sensitive.",
    relatedErrors: ["NameError"],
    nextSteps: ["Practice naming: snake_case for variables"],
  },
  {
    id: "indentation",
    title: "Indentation & blocks",
    description: "Colons start blocks; the next lines must be indented with 4 spaces.",
    relatedErrors: ["IndentationError", "SyntaxError"],
    nextSteps: ["Write a for loop over a list"],
  },
  {
    id: "types",
    title: "Types & operations",
    description: "int, float, str, list, dict — each supports different operations.",
    relatedErrors: ["TypeError", "ValueError"],
    nextSteps: ["Use type() to inspect values"],
  },
  {
    id: "collections",
    title: "Lists & dicts",
    description: "Lists use numeric indices from 0; dicts use keys.",
    relatedErrors: ["IndexError", "KeyError"],
    nextSteps: ["Loop with for item in my_list"],
  },
  {
    id: "pandas",
    title: "Pandas DataFrames",
    description: "Tabular data with labeled columns. Prefer .loc for assignment.",
    relatedErrors: ["KeyError", "AttributeError"],
    nextSteps: ["df.describe() and df.info()"],
  },
  {
    id: "matplotlib",
    title: "Visualization",
    description: "pyplot builds figures; save or show to render output.",
    relatedErrors: ["AttributeError"],
    nextSteps: ["plt.figure(); plt.plot(x,y); plt.savefig('out.png')"],
  },
  {
    id: "ml-basics",
    title: "ML workflows",
    description: "Split data, fit on train, evaluate on test — keep random_state fixed.",
    relatedErrors: ["ValueError"],
    nextSteps: ["from sklearn.model_selection import train_test_split"],
  },
];

export function conceptsForError(errorType: string): ConceptNode[] {
  const key = errorType.split("—")[0].trim().replace(/\s/g, "");
  return CONCEPT_GRAPH.filter(
    (c) =>
      c.relatedErrors.some((e) => key.includes(e.replace("Error", "")) || errorType.includes(e)) ||
      errorType.toLowerCase().includes(c.id)
  ).slice(0, 3);
}
