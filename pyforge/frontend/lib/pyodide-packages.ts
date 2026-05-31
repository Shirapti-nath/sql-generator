import { getDetectedPackages } from "@/lib/execution-router";

/** Pyodide package names (may differ from import names). */
const PYODIDE_PACKAGE_MAP: Record<string, string> = {
  numpy: "numpy",
  pandas: "pandas",
  matplotlib: "matplotlib",
  scipy: "scipy",
  sklearn: "scikit-learn",
  "scikit-learn": "scikit-learn",
  seaborn: "seaborn",
  sympy: "sympy",
  plotly: "plotly",
};

/** Not available in browser — user sees a clear message. */
export const UNSUPPORTED_ON_BROWSER = new Set(["torch", "tensorflow"]);

export function pyodidePackagesForCode(code: string): {
  toLoad: string[];
  unsupported: string[];
} {
  const detected = getDetectedPackages(code);
  const unsupported: string[] = [];
  const toLoad = new Set<string>();

  for (const mod of detected) {
    if (UNSUPPORTED_ON_BROWSER.has(mod)) {
      unsupported.push(mod);
      continue;
    }
    const pkg = PYODIDE_PACKAGE_MAP[mod];
    if (pkg) toLoad.add(pkg);
  }

  return { toLoad: [...toLoad], unsupported };
}
