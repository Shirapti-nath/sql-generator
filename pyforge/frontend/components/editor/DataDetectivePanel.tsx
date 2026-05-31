"use client";

import { Database } from "lucide-react";
import { useEliteFeaturesStore } from "@/stores/eliteFeaturesStore";

export function DataDetectivePanel() {
  const insight = useEliteFeaturesStore((s) => s.dataInsight);

  if (!insight) {
    return (
      <div className="p-4 text-xs text-muted">
        <Database className="h-4 w-4 mb-2 text-accent" />
        Run code with <code className="font-mono">read_csv</code> or a DataFrame — auto-inspection appears here.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 text-xs overflow-y-auto">
      <h3 className="font-semibold flex items-center gap-2">
        <Database className="h-4 w-4 text-accent" /> Data Detective
      </h3>
      <p>
        <strong>{insight.rows}</strong> rows · <strong>{insight.cols.length}</strong> columns
      </p>
      <div>
        <p className="text-muted mb-1">Columns</p>
        <p className="font-mono text-[10px] break-all">{insight.cols.join(", ")}</p>
      </div>
      <div>
        <p className="text-muted mb-1">Missing values</p>
        <ul className="space-y-0.5">
          {Object.entries(insight.nulls).map(([col, n]) =>
            n > 0 ? (
              <li key={col} className="text-amber-400">
                {col}: {n}
              </li>
            ) : null
          )}
        </ul>
      </div>
    </div>
  );
}
