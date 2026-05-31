export interface ParsedError {
  type: string;
  message: string;
  line: number | null;
  column: number | null;
  raw: string;
  explanation: string;
  howToFix: string;
  example?: string;
  suggestions?: string[];
  conceptTags?: string[];
  suggestedPatch?: string;
}

const ERROR_GUIDE: Record<
  string,
  { title: string; explanation: string; howToFix: string; example?: string }
> = {
  SyntaxError: {
    title: "Syntax Error",
    explanation: "Python could not understand your code structure. Something is misspelled, missing, or in the wrong place.",
    howToFix: "Check for missing colons (:), parentheses (), quotes \"'\", and commas. Make sure every if/for/def line ends with a colon.",
    example: "if x > 0:  # colon required\n    print(x)",
  },
  IndentationError: {
    title: "Indentation Error",
    explanation: "Python uses indentation (spaces) to group code blocks. Your spacing is inconsistent.",
    howToFix: "Use 4 spaces per level. Don't mix tabs and spaces. Every line inside if/for/def must be indented.",
  },
  NameError: {
    title: "Name Error",
    explanation: "You're using a variable or function name that Python doesn't recognize yet.",
    howToFix: "Define the variable before using it, or fix a typo in the name. Names are case-sensitive: `count` ≠ `Count`.",
  },
  TypeError: {
    title: "Type Error",
    explanation: "An operation was applied to the wrong type of value (e.g. adding a string to a number).",
    howToFix: "Convert types explicitly: int(), str(), float(). Check function arguments match expected types.",
  },
  IndexError: {
    title: "Index Error",
    explanation: "You tried to access a list index that doesn't exist.",
    howToFix: "Remember indices start at 0. For a list of length n, valid indices are 0 to n-1.",
  },
  KeyError: {
    title: "Key Error",
    explanation: "You tried to access a dictionary key that doesn't exist.",
    howToFix: "Use .get('key', default) for safe access, or check `if key in my_dict` first.",
  },
  ZeroDivisionError: {
    title: "Zero Division Error",
    explanation: "You divided a number by zero, which is undefined in mathematics.",
    howToFix: "Add a check: if divisor != 0: before dividing.",
  },
  ValueError: {
    title: "Value Error",
    explanation: "A function got the right type but an invalid value.",
    howToFix: "Check inputs — e.g. int('abc') fails, or math.sqrt(-1) is invalid.",
  },
  AttributeError: {
    title: "Attribute Error",
    explanation: "The object doesn't have the method or property you're trying to use.",
    howToFix: "Check the object's type and available methods. Typos in method names are common.",
  },
  ModuleNotFoundError: {
    title: "Module Not Found",
    explanation: "Python couldn't find the package you tried to import.",
    howToFix: "On PyForge server mode, NumPy/Pandas work automatically. Check spelling: `import numpy` not `import numppy`.",
  },
  ImportError: {
    title: "Import Error",
    explanation: "A package import failed — it may not be installed or the name is wrong.",
    howToFix: "Verify the package name and that it's supported in your run environment.",
  },
  FileNotFoundError: {
    title: "File Not Found",
    explanation: "Your code tried to open a file that doesn't exist at that path.",
    howToFix: "Check the file path. Use relative paths carefully or verify the file exists.",
  },
};

function detectErrorType(raw: string): string {
  for (const type of Object.keys(ERROR_GUIDE)) {
    if (raw.includes(type)) return type;
  }
  if (raw.toLowerCase().includes("syntax")) return "SyntaxError";
  if (raw.toLowerCase().includes("indent")) return "IndentationError";
  return "PythonError";
}

function extractLineColumn(raw: string): { line: number | null; column: number | null } {
  const lineMatch = raw.match(/user_code\.py", line (\d+)/i) || raw.match(/line (\d+)/i);
  const colMatch = raw.match(/column (\d+)/i) || raw.match(/char (\d+)/i);
  return {
    line: lineMatch ? parseInt(lineMatch[1], 10) : null,
    column: colMatch ? parseInt(colMatch[1], 10) : null,
  };
}

function extractMessage(raw: string, type: string): string {
  const lines = raw.split("\n").filter(Boolean);
  const errorLine = lines.find((l) => l.includes(type)) || lines[lines.length - 1] || raw;
  const colonIdx = errorLine.indexOf(":");
  if (colonIdx > 0 && errorLine.startsWith(type)) {
    return errorLine.slice(colonIdx + 1).trim();
  }
  return errorLine.trim();
}

function syntaxHintForUnquotedStrings(raw: string, codeContext?: string): Partial<ParsedError> | null {
  const isSyntax = raw.includes("SyntaxError") || raw.toLowerCase().includes("invalid syntax");
  if (!isSyntax) return null;

  const likelyMissingQuotes =
    /print\s*\([^"'][^)]*\)/.test(codeContext || raw) ||
    (/invalid syntax/i.test(raw) && /print\s*\(/.test(codeContext || ""));

  if (likelyMissingQuotes) {
    return {
      type: "Syntax Error — Missing Quotes",
      explanation:
        "In Python, text (strings) must be wrapped in quotes. Without quotes, Python thinks `hello` and `world` are variable names, which creates invalid syntax inside print().",
      howToFix:
        'Wrap text in single or double quotes: print("hello world") or print(\'hello world\'). Only variable names go unquoted.',
      example: 'print("hello world")  # correct\n# print(hello world)  # wrong — missing quotes',
      message: "Text inside print() needs quotation marks around it.",
    };
  }
  return null;
}

export function parsePythonError(raw: string, codeContext?: string): ParsedError {
  const type = detectErrorType(raw);
  const custom = syntaxHintForUnquotedStrings(raw, codeContext);
  const guide = ERROR_GUIDE[type] || {
    title: "Runtime Error",
    explanation: "Your program stopped because of an unexpected problem.",
    howToFix: "Read the traceback from bottom to top. The last line usually tells you what went wrong.",
  };
  const { line, column } = extractLineColumn(raw);
  const message = extractMessage(raw, type);

  const resolvedType = custom?.type ?? guide.title;
  const suggestions = buildSuggestions(resolvedType, custom, codeContext);
  const patchLine = custom?.example?.split("\n").find((l) => l.trim() && !l.startsWith("#"));

  return {
    type: resolvedType,
    message: custom?.message ?? message,
    line,
    column,
    raw,
    explanation: custom?.explanation ?? guide.explanation,
    howToFix: custom?.howToFix ?? guide.howToFix,
    example: custom?.example ?? guide.example,
    suggestions,
    conceptTags: conceptTagsForType(type, custom),
    suggestedPatch: patchLine,
  };
}

function buildSuggestions(
  resolvedType: string,
  custom: Partial<ParsedError> | null,
  codeContext?: string
): string[] {
  const tips: string[] = [];
  if (custom?.type?.includes("Quotes")) {
    tips.push("Use double quotes for text: print(\"hello\")");
    tips.push("Variables need no quotes; strings always do.");
    tips.push("Try the Fix drill in the Learn tab to practice.");
  }
  if (resolvedType.includes("Name")) {
    tips.push("Assign the variable on a line above where you use it.");
    tips.push("Check spelling and capitalization.");
  }
  if (resolvedType.includes("Syntax")) {
    tips.push("Read the error line number in the editor highlight.");
    tips.push("Match opening and closing parentheses.");
  }
  if (resolvedType.includes("Indent")) {
    tips.push("Select all and convert tabs to 4 spaces in your editor.");
  }
  if (codeContext?.includes("pandas") && resolvedType.includes("Key")) {
    tips.push("Print df.columns to see available column names.");
  }
  if (tips.length === 0) {
    tips.push("Run again after each small fix — one change at a time.");
    tips.push("Open the Learn tab for a practice drill on this error type.");
  }
  return tips.slice(0, 4);
}

function conceptTagsForType(type: string, custom: Partial<ParsedError> | null): string[] {
  if (custom?.type?.includes("Quotes")) return ["strings", "syntax"];
  if (type.includes("Name")) return ["variables"];
  if (type.includes("Indent")) return ["indentation"];
  if (type.includes("Type")) return ["types"];
  if (type.includes("Index")) return ["collections"];
  if (type.includes("Key")) return ["collections", "pandas"];
  return ["python-basics"];
}

export function friendlyError(traceback: string): string {
  const parsed = parsePythonError(traceback);
  return `${parsed.type}: ${parsed.message}\n\n💡 ${parsed.howToFix}`;
}
