import Link from "next/link";
import { AntiGravityHero } from "@/components/home/AntiGravityHero";
import {
  Zap,
  Bot,
  Brain,
  GitBranch,
  Target,
  Shield,
  Terminal,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Cognitive Load Meter",
    desc: "Real-time complexity score with tips before you hit run — learn to simplify, not just fix.",
  },
  {
    icon: GitBranch,
    title: "Counterfactual Run",
    desc: "See what would happen if you applied the suggested fix — without overwriting your code.",
  },
  {
    icon: Target,
    title: "Intent Lens",
    desc: "Align your code with your stated learning goal — spot orphan lines that don't serve the mission.",
  },
  {
    icon: Sparkles,
    title: "Syntax Ghost",
    desc: "Unquoted identifiers glow before run — catch print(hello world) before Python does.",
  },
  {
    icon: Bot,
    title: "Socratic Copilot",
    desc: "Hints and questions instead of copy-paste fixes — build real problem-solving muscle.",
  },
  {
    icon: Shield,
    title: "Ethics Gate",
    desc: "Pre-run checks for network calls and sensitive data — responsible data science by default.",
  },
  {
    icon: Zap,
    title: "Error Genealogy",
    desc: "Track how one mistake leads to the next — patterns teachers wish they could see.",
  },
  {
    icon: Terminal,
    title: "Browser Python + NumPy",
    desc: "Full Pyodide runtime in the browser — deploy globally on Vercel, no backend required.",
  },
  {
    icon: Users,
    title: "Classroom Pulse",
    desc: "Live error heatmaps for instructors — students join with a session code.",
  },
];

export default function HomePage() {
  return (
    <div>
      <AntiGravityHero />

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Learning-first, not just another IDE</h2>
        <p className="text-muted text-center mb-12 max-w-2xl mx-auto">
          PyForge teaches you to think like a Python engineer — counterfactual debugging, mistake memory,
          spaced-repetition drills, and AI that asks questions instead of handing you answers.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card/40 p-6 hover:border-accent/40 hover:-translate-y-1 transition-all duration-300"
            >
              <f.icon className="h-7 w-7 text-accent mb-4" />
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-16 text-center mesh-bg">
        <h2 className="text-2xl font-bold mb-4">Ready to forge your Python skills?</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
          >
            Open the IDE <Terminal className="h-4 w-4" />
          </Link>
          <Link href="/exercises" className="inline-flex items-center gap-2 text-muted hover:text-accent font-medium">
            Try challenge mutations
          </Link>
        </div>
      </section>
    </div>
  );
}
