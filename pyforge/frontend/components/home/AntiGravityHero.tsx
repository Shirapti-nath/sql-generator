"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowRight, Code2, Brain, Database, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const FLOATING_SNIPPETS = [
  { code: "import numpy as np", x: "8%", y: "18%", delay: 0, rotate: -6 },
  { code: "df = pd.read_csv(...)", x: "72%", y: "12%", delay: 0.4, rotate: 4 },
  { code: "model.fit(X, y)", x: "78%", y: "55%", delay: 0.8, rotate: -3 },
  { code: "match status:\n  case 200:", x: "5%", y: "62%", delay: 1.2, rotate: 5 },
  { code: "@dataclass", x: "85%", y: "78%", delay: 0.6, rotate: -8 },
  { code: "plt.savefig()", x: "15%", y: "82%", delay: 1, rotate: 3 },
];

const ROLES = [
  { icon: Database, label: "Data Scientists" },
  { icon: Brain, label: "ML Engineers" },
  { icon: LineChart, label: "AI Engineers" },
  { icon: Code2, label: "Python Developers" },
];

export function AntiGravityHero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden flex items-center justify-center">
      {/* Gradient mesh */}
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_70%)]" />

      {/* Floating code cards — anti-gravity */}
      {FLOATING_SNIPPETS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute hidden md:block pointer-events-none select-none"
          style={{ left: s.x, top: s.y, rotate: s.rotate }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            y: [0, -18, 0, -12, 0],
            x: [0, 6, -4, 3, 0],
          }}
          transition={{
            duration: 6 + i * 0.5,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        >
          <div className="glass rounded-lg px-3 py-2 font-mono text-[11px] text-emerald-400/80 border border-accent/20 shadow-lg shadow-accent/5">
            {s.code}
          </div>
        </motion.div>
      ))}

      {/* Orbiting dots */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1 h-1 rounded-full bg-accent/40"
          style={{
            left: "50%",
            top: "50%",
          }}
          animate={{
            x: [0, Math.cos((i / 12) * Math.PI * 2) * 280],
            y: [0, Math.sin((i / 12) * Math.PI * 2) * 180],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 8 + i * 0.3,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent text-sm mb-8"
          >
            <Code2 className="h-4 w-4" />
            Python 3.12+ · Community Edition
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            The Python IDE for
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-300 to-cyan-400">
              serious builders
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            PyForge combines a professional runtime, Tab autocomplete, AI Copilot, and
            instant error intelligence — built for data science, ML, and AI engineering.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {ROLES.map((r, i) => (
              <motion.span
                key={r.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted"
              >
                <r.icon className="h-3.5 w-3.5 text-accent" />
                {r.label}
              </motion.span>
            ))}
          </div>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link href="/playground">
              <Button variant="accent" size="lg" className="run-pulse text-base px-10 h-12">
                <Play className="h-5 w-5 mr-2 fill-current" />
                Launch IDE
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="text-base px-10 h-12">
                Join Community <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Central floating IDE preview */}
        <motion.div
          className="mt-16 max-w-2xl mx-auto"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="rounded-2xl border border-accent/30 glass overflow-hidden shadow-2xl shadow-accent/10">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-card/30">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-[10px] text-muted font-mono">analysis.py</span>
            </div>
            <pre className="p-4 text-left text-xs font-mono text-emerald-400/90 leading-relaxed">
{`import pandas as pd
import numpy as np

df = pd.read_csv("data.csv")
print(df.describe())  # Tab → autocomplete`}
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
