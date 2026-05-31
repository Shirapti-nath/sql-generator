export interface Exercise {
  id: string;
  title: string;
  prompt: string;
  starterCode: string;
  /** Base test — mutation varies args at runtime */
  testTemplate: {
    function: string;
    mutate?: (attempt: number) => unknown[];
    baseArgs: unknown[];
    expectedFn: (args: unknown[], attempt: number) => unknown;
  };
}

export const EXERCISES: Exercise[] = [
  {
    id: "sum-list",
    title: "Sum a list",
    prompt: "Write sum_list(nums) that returns the sum of all numbers.",
    starterCode: "def sum_list(nums):\n    # your code\n    pass\n",
    testTemplate: {
      function: "sum_list",
      baseArgs: [[1, 2, 3]],
      mutate: (a) => [[a * 2, a + 1, a], [10, -5, 5]][a % 2],
      expectedFn: (args) => (args[0] as number[]).reduce((s, n) => s + n, 0),
    },
  },
  {
    id: "reverse-string",
    title: "Reverse a string",
    prompt: "Write reverse_text(s) that returns s reversed.",
    starterCode: 'def reverse_text(s):\n    return ""\n',
    testTemplate: {
      function: "reverse_text",
      baseArgs: ["hello"],
      mutate: (a) => [["python", "forge", "abc"][a % 3]],
      expectedFn: (args) => (args[0] as string).split("").reverse().join(""),
    },
  },
  {
    id: "is-even",
    title: "Is even?",
    prompt: "Write is_even(n) returning True if n is divisible by 2.",
    starterCode: "def is_even(n):\n    pass\n",
    testTemplate: {
      function: "is_even",
      baseArgs: [4],
      mutate: (a) => [[a * 2, a * 2 + 1][a % 2]],
      expectedFn: (args) => (args[0] as number) % 2 === 0,
    },
  },
];

export function mutateTestCase(exercise: Exercise, attempt: number) {
  const t = exercise.testTemplate;
  const args = t.mutate ? t.mutate(attempt) : t.baseArgs;
  const expected = t.expectedFn(args, attempt);
  return { function: t.function, args, expected };
}

/** Client-side grader via Pyodide eval pattern */
export function buildExerciseHarness(studentCode: string, fn: string, args: unknown[], expected: unknown): string {
  return `
${studentCode}
import json
try:
    result = ${fn}(*${JSON.stringify(args)})
    expected = ${JSON.stringify(expected)}
    passed = result == expected
    print("__PYFORGE_TEST__" + json.dumps({"passed": passed, "actual": str(result), "expected": str(expected)}))
except Exception as e:
    print("__PYFORGE_TEST__" + json.dumps({"passed": False, "error": str(e)}))
`;
}
