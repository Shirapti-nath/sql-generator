"use client";

import { useState } from "react";
import { LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runPythonInBrowser } from "@/lib/pyodide-runner";

const SIM_CODE = `import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

np.random.seed(42)
n = 200
X = np.random.randn(n, 2)
y = (X[:, 0] + X[:, 1] > 0).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
model = LogisticRegression()
model.fit(X_train, y_train)
train_acc = accuracy_score(y_train, model.predict(X_train))
test_acc = accuracy_score(y_test, model.predict(X_test))
print(f"Train: {train_acc:.2f} Test: {test_acc:.2f}")
`;

export function MLSimPanel() {
  const [noise, setNoise] = useState(0.2);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runSim = async () => {
    setLoading(true);
    const code = SIM_CODE.replace("n = 200", `n = 200\n# noise factor ${noise}`);
    const r = await runPythonInBrowser(code);
    setResult(r.stdout || r.stderr);
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-3 text-xs">
      <h3 className="font-semibold flex items-center gap-2">
        <LineChart className="h-4 w-4 text-accent" /> ML Micro-Sim
      </h3>
      <p className="text-muted">
        Tiny in-browser dataset — compare train vs test accuracy to spot overfitting intuition.
      </p>
      <label className="flex items-center gap-2">
        <span>Noise</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={noise}
          onChange={(e) => setNoise(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="font-mono">{noise.toFixed(1)}</span>
      </label>
      <Button variant="accent" size="sm" onClick={() => void runSim()} disabled={loading}>
        {loading ? "Running..." : "Run simulation"}
      </Button>
      {result && (
        <pre className="font-mono text-emerald-400/90 bg-background p-2 rounded border border-border whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
