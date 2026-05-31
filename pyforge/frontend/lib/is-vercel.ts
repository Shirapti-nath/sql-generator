/** True on Vercel builds — server-side Python is unavailable; use Pyodide in the browser. */
export function isVercelDeployment(): boolean {
  return process.env.NEXT_PUBLIC_FORCE_BROWSER === "1";
}
