"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Trophy, Code2, Terminal, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

export default function DashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof api.getDashboard>> | null>(null);
  const { user, accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push("/login");
      return;
    }
    api.getDashboard(accessToken).then(setStats);
  }, [accessToken, router]);

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

      <Card className="border-accent/30 bg-accent/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-accent" />
            Ready to code?
          </CardTitle>
          <CardDescription>
            Open the playground to run Python with full library support and smart error explanations.
          </CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <Link href="/playground">
            <Button variant="accent">
              Open Playground <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </Card>
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
