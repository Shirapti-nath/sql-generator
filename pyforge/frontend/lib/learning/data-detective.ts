/** Probe script appended after user code to inspect pandas DataFrames. */
export function buildDataProbeScript(userCode: string): string | null {
  if (!/read_csv|DataFrame\s*\(|pd\.read/.test(userCode)) return null;

  return `
${userCode}

# --- PyForge Data Detective probe ---
try:
    import json
    _dfs = [v for v in dir() if not v.startswith("_")]
    _df = None
    for _n in _dfs:
        _v = eval(_n) if _n in dir() else None
        if _v is not None and type(_v).__name__ == "DataFrame":
            _df = _v
            break
    if _df is not None:
        _info = {
            "rows": int(len(_df)),
            "cols": list(_df.columns.astype(str)),
            "dtypes": {str(k): str(v) for k, v in _df.dtypes.items()},
            "nulls": {str(k): int(_df[k].isna().sum()) for k in _df.columns},
            "head": _df.head(3).to_dict(orient="records"),
        }
        print("__PYFORGE_DF__" + json.dumps(_info))
except Exception as _e:
    print("__PYFORGE_DF_ERR__" + str(_e))
`;
}

export interface DataFrameInsight {
  rows: number;
  cols: string[];
  dtypes: Record<string, string>;
  nulls: Record<string, number>;
  head: Record<string, unknown>[];
}

export function parseDataProbeOutput(stdout: string): DataFrameInsight | null {
  const line = stdout.split("\n").find((l) => l.includes("__PYFORGE_DF__"));
  if (!line) return null;
  try {
    const json = line.split("__PYFORGE_DF__")[1];
    return JSON.parse(json) as DataFrameInsight;
  } catch {
    return null;
  }
}
