import type { languages } from "monaco-editor";

type CompletionSnippet = Omit<languages.CompletionItem, "range">;

/** Python 3.12+ & DS/ML/AI engineering completions */
export const PYTHON_COMPLETIONS: CompletionSnippet[] = [
  // Stdlib & modern Python
  { label: "print", kind: 1, insertText: 'print(${1})', insertTextRules: 4, detail: "Built-in", documentation: "Print to stdout" },
  { label: "def", kind: 15, insertText: "def ${1:name}(${2:params}):\n    ${3:pass}", insertTextRules: 4, detail: "Function" },
  { label: "class", kind: 7, insertText: "class ${1:Name}:\n    def __init__(self${2:, args}):\n        ${3:pass}", insertTextRules: 4, detail: "Class" },
  { label: "if", kind: 15, insertText: "if ${1:condition}:\n    ${2:pass}", insertTextRules: 4 },
  { label: "elif", kind: 15, insertText: "elif ${1:condition}:\n    ${2:pass}", insertTextRules: 4 },
  { label: "else", kind: 15, insertText: "else:\n    ${1:pass}", insertTextRules: 4 },
  { label: "for", kind: 15, insertText: "for ${1:item} in ${2:iterable}:\n    ${3:pass}", insertTextRules: 4 },
  { label: "while", kind: 15, insertText: "while ${1:condition}:\n    ${2:pass}", insertTextRules: 4 },
  { label: "with", kind: 15, insertText: "with ${1:expr} as ${2:var}:\n    ${3:pass}", insertTextRules: 4 },
  { label: "try", kind: 15, insertText: "try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:pass}", insertTextRules: 4 },
  { label: "match", kind: 15, insertText: "match ${1:value}:\n    case ${2:pattern}:\n        ${3:pass}", insertTextRules: 4, detail: "Python 3.10+ pattern matching" },
  { label: "lambda", kind: 15, insertText: "lambda ${1:args}: ${2:expr}", insertTextRules: 4 },
  { label: "import", kind: 9, insertText: "import ${1:module}", insertTextRules: 4 },
  { label: "from", kind: 9, insertText: "from ${1:module} import ${2:name}", insertTextRules: 4 },
  { label: "async def", kind: 15, insertText: "async def ${1:name}(${2:params}):\n    ${3:pass}", insertTextRules: 4 },
  { label: "await", kind: 14, insertText: "await ${1:coro}", insertTextRules: 4 },
  { label: "type", kind: 15, insertText: "type ${1:Alias} = ${2:hint}", insertTextRules: 4, detail: "Python 3.12+ type alias" },
  { label: "list", kind: 1, insertText: "list[${1:T}]", insertTextRules: 4, detail: "Generic list hint" },
  { label: "dict", kind: 1, insertText: "dict[${1:K}, ${2:V}]", insertTextRules: 4 },
  { label: "f-string", kind: 15, insertText: 'f"${1:text}"', insertTextRules: 4 },
  { label: "main", kind: 15, insertText: 'if __name__ == "__main__":\n    ${1:main()}', insertTextRules: 4 },

  // NumPy
  { label: "import numpy", kind: 9, insertText: "import numpy as np", insertTextRules: 4, detail: "NumPy" },
  { label: "np.array", kind: 2, insertText: "np.array(${1:data})", insertTextRules: 4 },
  { label: "np.zeros", kind: 2, insertText: "np.zeros((${1:shape}))", insertTextRules: 4 },
  { label: "np.ones", kind: 2, insertText: "np.ones((${1:shape}))", insertTextRules: 4 },
  { label: "np.linspace", kind: 2, insertText: "np.linspace(${1:start}, ${2:stop}, ${3:num})", insertTextRules: 4 },
  { label: "np.mean", kind: 2, insertText: "np.mean(${1:arr})", insertTextRules: 4 },

  // Pandas
  { label: "import pandas", kind: 9, insertText: "import pandas as pd", insertTextRules: 4, detail: "Pandas" },
  { label: "pd.DataFrame", kind: 7, insertText: "pd.DataFrame(${1:data})", insertTextRules: 4 },
  { label: "pd.read_csv", kind: 2, insertText: 'pd.read_csv("${1:path.csv}")', insertTextRules: 4 },
  { label: "df.head", kind: 2, insertText: "df.head(${1:5})", insertTextRules: 4 },
  { label: "df.describe", kind: 2, insertText: "df.describe()", insertTextRules: 4 },
  { label: "df.groupby", kind: 2, insertText: 'df.groupby("${1:col}")', insertTextRules: 4 },

  // Matplotlib / Seaborn
  { label: "import matplotlib", kind: 9, insertText: "import matplotlib.pyplot as plt", insertTextRules: 4 },
  { label: "plt.plot", kind: 2, insertText: "plt.plot(${1:x}, ${2:y})", insertTextRules: 4 },
  { label: "plt.show", kind: 2, insertText: "plt.show()", insertTextRules: 4 },
  { label: "import seaborn", kind: 9, insertText: "import seaborn as sns", insertTextRules: 4 },

  // Scikit-learn
  { label: "import sklearn", kind: 9, insertText: "from sklearn.model_selection import train_test_split", insertTextRules: 4 },
  { label: "train_test_split", kind: 2, insertText: "train_test_split(${1:X}, ${2:y}, test_size=${3:0.2}, random_state=${4:42})", insertTextRules: 4 },
  { label: "StandardScaler", kind: 7, insertText: "from sklearn.preprocessing import StandardScaler\nscaler = StandardScaler()", insertTextRules: 4 },
  { label: "RandomForestClassifier", kind: 7, insertText: "from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier()", insertTextRules: 4 },

  // PyTorch / TensorFlow
  { label: "import torch", kind: 9, insertText: "import torch\nimport torch.nn as nn", insertTextRules: 4, detail: "PyTorch" },
  { label: "nn.Module", kind: 7, insertText: "class ${1:Net}(nn.Module):\n    def __init__(self):\n        super().__init__()\n        ${2:pass}\n    def forward(self, x):\n        return x", insertTextRules: 4 },
  { label: "import tensorflow", kind: 9, insertText: "import tensorflow as tf", insertTextRules: 4, detail: "TensorFlow" },

  // Typing & dataclasses
  { label: "dataclass", kind: 7, insertText: "from dataclasses import dataclass\n\n@dataclass\nclass ${1:Name}:\n    ${2:field}: ${3:type}", insertTextRules: 4 },
  { label: "Optional", kind: 7, insertText: "from typing import Optional", insertTextRules: 4 },
  { label: "Annotated", kind: 7, insertText: "from typing import Annotated", insertTextRules: 4, detail: "Python 3.9+" },
];

export function registerPythonCompletions(monaco: typeof import("monaco-editor")): { dispose: () => void } {
  return monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: [".", " ", "(", ",", "'"],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };
      const prefix = word.word.toLowerCase();
      const items = PYTHON_COMPLETIONS.filter(
        (c) => !prefix || c.label.toString().toLowerCase().includes(prefix)
      ).map((c) => ({ ...c, range }));
      return { suggestions: items };
    },
  });
}
