const SERVER_PACKAGES = [
  "numpy", "pandas", "matplotlib", "scipy", "sklearn", "scikit-learn",
  "seaborn", "plotly", "sympy", "torch", "tensorflow",
];

const IMPORT_REGEX = /^\s*(?:import\s+(\S+)|from\s+(\S+)\s+import)/gm;

export type ExecutionMode = "browser" | "server";

export function detectExecutionMode(code: string, forceBrowser = false): ExecutionMode {
  if (forceBrowser) return "browser";
  const matches = [...code.matchAll(IMPORT_REGEX)];
  for (const match of matches) {
    const moduleName = (match[1] || match[2] || "").split(".")[0].toLowerCase();
    if (SERVER_PACKAGES.includes(moduleName)) {
      return "server";
    }
  }
  return "browser";
}

export function getDetectedPackages(code: string): string[] {
  const found = new Set<string>();
  const matches = [...code.matchAll(IMPORT_REGEX)];
  for (const match of matches) {
    const moduleName = (match[1] || match[2] || "").split(".")[0].toLowerCase();
    if (SERVER_PACKAGES.includes(moduleName)) {
      found.add(moduleName);
    }
  }
  return [...found];
}
