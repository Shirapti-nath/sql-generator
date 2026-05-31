"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Code2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLearningStore } from "@/stores/learningStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function PortfolioPage() {
  const params = useParams();
  const username = (params.username as string) ?? "";
  const user = useAuthStore((s) => s.user);
  const snapshots = useLearningStore((s) => s.snapshots);
  const portfolioPublic = useSettingsStore((s) => s.portfolioPublic);
  const setPortfolioPublic = useSettingsStore((s) => s.setPortfolioPublic);
  const xp = useLearningStore((s) => s.xp);

  const isOwner = user && slugify(user.display_name) === username.toLowerCase();
  const canView = isOwner || portfolioPublic;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 mesh-bg min-h-[calc(100vh-3.5rem)]">
      <Link href="/dashboard" className="text-sm text-muted hover:text-accent flex items-center gap-1 mb-6">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <Code2 className="h-8 w-8 text-accent" />
        <h1 className="text-3xl font-bold">@{username}</h1>
      </div>
      <p className="text-muted mb-8">Forge Portfolio — concept snapshots from your learning journey.</p>

      {isOwner && (
        <div className="mb-6 p-4 rounded-lg border border-border bg-card/50 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Public portfolio</p>
            <p className="text-xs text-muted">When on, anyone with this link can see your snapshots.</p>
          </div>
          <Button
            variant={portfolioPublic ? "accent" : "outline"}
            size="sm"
            onClick={() => setPortfolioPublic(!portfolioPublic)}
          >
            {portfolioPublic ? "Public" : "Private"}
          </Button>
        </div>
      )}

      {!canView ? (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio is private</CardTitle>
            <CardDescription>This learner has not made their portfolio public yet.</CardDescription>
          </CardHeader>
        </Card>
      ) : snapshots.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No snapshots yet</CardTitle>
            <CardDescription>
              Run code in the playground — PyForge saves concept snapshots when you master basics, loops, pandas, and ML.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted mb-4">
            <strong className="text-accent">{xp}</strong> XP · {snapshots.length} concept snapshot
            {snapshots.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            {snapshots.map((snap) => (
              <Card key={snap.id}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 capitalize">
                    <BookOpen className="h-4 w-4 text-accent" />
                    {snap.concept}
                  </CardTitle>
                  <CardDescription>{new Date(snap.at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <pre className="mx-6 mb-6 p-3 rounded-lg bg-background border border-border text-xs font-mono overflow-x-auto">
                  {snap.code.slice(0, 600)}
                  {snap.code.length > 600 ? "\n…" : ""}
                </pre>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
