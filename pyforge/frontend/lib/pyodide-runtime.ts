/* Load Pyodide from CDN — avoids Turbopack "expression is too dynamic" bundling errors */

type PyodideInterface = {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdout: (opts: { batched: (msg: string) => void }) => void;
  setStderr: (opts: { batched: (msg: string) => void }) => void;
};

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";

let pyodideInstance: PyodideInterface | null = null;
let loading: Promise<PyodideInterface> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export async function getPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;
  if (!loading) {
    loading = (async () => {
      await loadScript(`${PYODIDE_CDN}pyodide.js`);
      if (!window.loadPyodide) {
        throw new Error("Pyodide failed to initialize");
      }
      pyodideInstance = await window.loadPyodide({ indexURL: PYODIDE_CDN });
      return pyodideInstance;
    })();
  }
  return loading;
}
