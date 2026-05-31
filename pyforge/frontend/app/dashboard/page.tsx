"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Trophy, Code2, Terminal, ArrowRight, GraduationCap, Target, Clock, BookOpen } from "lucide-react";
import { useLearningStore } from "@/stores/learningStore";
import { currentMilestone, nextMilestone } from "@/lib/learning/career-path";
import { diffHighlights } from "@/lib/learning/snapshots";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.getDashboard>> | null>(null);
  const { user, accessToken } = useAuthStore();
  const router = useRouter();
  const xp = useLearningStore((s) => s.xp);
  const snapshots = useLearningStore((s) => s.snapshots);
  const getTopMistakes = useLearningStore((s) => s.getTopMistakes);
  const completedDrills = useLearningStore((s) => s.completedDrills);
  const milestone = currentMilestone(xp);
  const next = nextMilestone(xp);
  const topMistakes = getTopMistakes(3);

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
      return;
    }
    api.getDashboard(accessToken).then(setStats);
  }, [accessToken, router]);

  const recentSnapshots = [...snapshots].reverse().slice(0, 3);
  const timeTravelPraise =
    snapshots.length >= 2
      ? diffHighlights(snapshots[snapshots.length - 2].code, snapshots[snapshots.length - 1].code)
      : [];

  if (!stats || !user) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-muted">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 mesh-bg min-h-[calc(100vh-3.5rem)]">
      <h1 className="text-3xl font-bold mb-1">Welcome back, {user.display_name}!</h1>
      <p className="text-muted mb-8">Your Python coding workspace</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={Flame} label="Day Streak" value={stats.streak_days} color="text-orange-400" />
        <StatCard icon={Trophy} label="Runs" value={stats.total_submissions} color="text-emerald-400" />
        <StatCard icon={Code2} label="Account" value="Active" color="text-blue-400" isText />
      </div>

      <Card className="mb-6 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-accent" />
            Learning path — {milestone.title}
          </CardTitle>
          <CardDescription>{milestone.description}</CardDescription>
        </CardHeader>
        <div className="px-6 pb-4 space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <span>
              <strong className="text-accent">{xp}</strong> XP
            </span>
            <span>
              <strong>{completedDrills.length}</strong> drills completed
            </span>
            {next && (
              <span className="text-muted">
                {next.xpRequired - xp} XP until <strong>{next.title}</strong>
              </span>
            )}
          </div>
          {topMistakes.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase mb-2 flex items-center gap-1">
                <Target className="h-3.5 w-3.5" /> Practice these next
              </p>
              <ul className="text-sm space-y-1">
                {topMistakes.map((m) => (
                  <li key={m.type} className="text-muted">
                    {m.type} <span className="text-amber-400">({m.count}×)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {recentSnapshots.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-accent" />
              Time-travel diff
            </CardTitle>
            <CardDescription>How your code evolved across concept snapshots.</CardDescription>
          </CardHeader>
          <div className="px-6 pb-4 space-y-3">
            {timeTravelPraise.length > 0 && (
              <ul className="text-sm space-y-1">
                {timeTravelPraise.map((p) => (
                  <li key={p} className="text-accent">
                    ✓ {p}
                  </li>
                ))}
              </ul>
            )}
            {recentSnapshots.map((snap) => (
              <div key={snap.id} className="p-3 rounded-lg border border-border">
                <p className="text-xs font-medium capitalize flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-accent" />
                  {snap.concept} · {new Date(snap.at).toLocaleDateString()}
                </p>
                <pre className="text-[10px] font-mono text-muted mt-1 truncate">{snap.code.split("\n")[0]}</pre>
              </div>
            ))}
            <Link href={`/u/${slugify(user.display_name)}`}>
              <Button variant="outline" size="sm">
                View portfolio
              </Button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-accent" />
              Playground
            </CardTitle>
            <CardDescription>Counterfactual runs, syntax ghost, intent lens, and more.</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Link href="/playground">
              <Button variant="accent">
                Open IDE <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Challenge mutations</CardTitle>
            <CardDescription>Auto-graded exercises with mutating test cases.</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <Link href="/exercises">
              <Button variant="outline">
                Start challenges <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  isText,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
  isText?: boolean;
}) {
  return (
    <Card>
      <div className="p-6 flex items-center gap-4">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <div className="text-2xl font-bold">{isText ? value : value}</div>
          <div className="text-sm text-muted">{label}</div>
        </div>
      </div>
    </Card>
  );
}
