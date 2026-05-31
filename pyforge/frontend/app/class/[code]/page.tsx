"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, Flame, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PulseData {
  heatmap: Record<string, number>;
  total: number;
  updatedAt: string;
}

export default function ClassroomPulsePage() {
  const params = useParams();
  const code = (params.code as string)?.toUpperCase() ?? "";
  const [data, setData] = useState<PulseData | null>(null);

  useEffect(() => {
    if (!code) return;
    const fetchPulse = () => {
      fetch(`/api/class/${code}/pulse`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => setData(null));
    };
    fetchPulse();
    const id = setInterval(fetchPulse, 5000);
    return () => clearInterval(id);
  }, [code]);

  const entries = data ? Object.entries(data.heatmap).sort((a, b) => b[1] - a[1]) : [];
  const maxCount = entries[0]?.[1] ?? 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 mesh-bg min-h-[calc(100vh-3.5rem)]">
      <Link href="/playground" className="text-sm text-muted hover:text-accent flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to playground
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Users className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold">Classroom Pulse</h1>
      </div>
      <p className="text-muted mb-8">
        Session <span className="font-mono text-accent">{code}</span> — live error heatmap from connected learners.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            Error heatmap
          </CardTitle>
          <CardDescription>
            {data ? `${data.total} errors reported · updated ${new Date(data.updatedAt).toLocaleTimeString()}` : "Loading..."}
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6 space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-muted">No errors yet — learners join by entering session code in the playground.</p>
          ) : (
            entries.map(([type, count]) => (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{type}</span>
                  <span className="text-muted">{count}×</span>
                </div>
                <div className="h-2 rounded-full bg-background overflow-hidden">
                  <div
                    className="h-full bg-red-500/70 transition-all"
                    style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <p className="text-xs text-muted">
        Teachers: share this URL with students. In the playground Learn tab, students enter session code{" "}
        <span className="font-mono">{code}</span> to report errors anonymously.
      </p>
    </div>
  );
}
