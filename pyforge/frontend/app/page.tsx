import Link from "next/link";
import { AntiGravityHero } from "@/components/home/AntiGravityHero";
import { Zap, Bot, Keyboard, Mail, Terminal, Sparkles } from "lucide-react";

const features = [
  {
    icon: Keyboard,
    title: "Tab Autocomplete",
    desc: "Python 3.12+, NumPy, Pandas, scikit-learn, PyTorch snippets — press Tab to complete.",
  },
  {
    icon: Bot,
    title: "AI Copilot",
    desc: "Like GitHub Copilot: fix errors, improve code, and get recommendations in real time.",
  },
  {
    icon: Sparkles,
    title: "Code Quality",
    desc: "Side-panel linting and AI review tuned for data science & ML workflows.",
  },
  {
    icon: Terminal,
    title: "Full Python Runtime",
    desc: "Run production libraries on a real Python 3 interpreter — not a toy sandbox.",
  },
  {
    icon: Zap,
    title: "Smart Error Fix",
    desc: "SyntaxError, KeyError, and more — explained on the exact line with fixes.",
  },
  {
    icon: Mail,
    title: "Community Edition",
    desc: "Sign up free and get a welcome email when you join the PyForge community.",
  },
];

export default function HomePage() {
  return (
    <div>
      <AntiGravityHero />

      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-3">Built for Python professionals</h2>
        <p className="text-muted text-center mb-12 max-w-xl mx-auto">
          Whether you train models, build pipelines, or ship AI products — PyForge is your browser IDE.
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
        <h2 className="text-2xl font-bold mb-4">Ready to code like a pro?</h2>
        <Link
          href="/playground"
          className="inline-flex items-center gap-2 text-accent hover:underline font-medium"
        >
          Open the IDE <Terminal className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
