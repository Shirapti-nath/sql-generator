"use client";

import { useState } from "react";
import { Bot, Send, Sparkles, Wand2, Trash2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopilotStore } from "@/stores/copilotStore";
import { useErrorAssistantStore } from "@/stores/errorAssistantStore";
import { useEditorStore } from "@/stores/editorStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

export function CopilotPanel() {
  const [input, setInput] = useState("");
  const { messages, loading, addMessage, setLoading, clear } = useCopilotStore();
  const error = useErrorAssistantStore((s) => s.error);
  const getActiveContent = useEditorStore((s) => s.getActiveContent);
  const updateFile = useEditorStore((s) => s.updateFile);
  const activeFile = useEditorStore((s) => s.activeFile);
  const socraticMode = useSettingsStore((s) => s.socraticMode);
  const toggleSocratic = useSettingsStore((s) => s.toggleSocratic);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const code = getActiveContent();
    addMessage({ role: "user", content: text });
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          message: text,
          error_context: error?.raw,
          socratic_mode: socraticMode,
        }),
      });
      const data = await res.json();
      addMessage({ role: "assistant", content: data.reply || data.detail || "No response" });
    } catch {
      addMessage({ role: "assistant", content: "Could not reach Copilot. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const extractCode = (content: string): string | null => {
    const match = content.match(/```python\n([\s\S]*?)```/);
    return match ? match[1].trim() : null;
  };

  const applyLastSuggestion = () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    const code = extractCode(last.content);
    if (code) updateFile(activeFile, code);
  };

  const quickActions = [
    { label: "Fix error", icon: Wand2, msg: "Fix the error in my code and explain what was wrong." },
    { label: "Improve code", icon: Sparkles, msg: "Improve this code for a professional data science workflow." },
    { label: "Explain", icon: Bot, msg: "Explain what this code does line by line." },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">AI Copilot</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleSocratic}
            title="Socratic mode — hints only, no full solutions"
            className={cn(
              "flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors",
              socraticMode ? "bg-accent/20 text-accent" : "bg-background text-muted hover:text-foreground"
            )}
          >
            <GraduationCap className="h-3 w-3" /> Socratic
          </button>
          <Button variant="ghost" size="sm" onClick={clear} title="Clear chat">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 p-2 border-b border-border">
        {quickActions.map((a) => (
          <button
            key={a.label}
            onClick={() => send(a.msg)}
            disabled={loading}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <a.icon className="h-3 w-3" /> {a.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-xs rounded-lg p-2.5 ${
              m.role === "user"
                ? "bg-accent/15 text-foreground ml-4"
                : "bg-background border border-border mr-2"
            }`}
          >
            <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap [&_code]:text-emerald-400">
              {m.content.split(/(```[\s\S]*?```)/g).map((part, j) =>
                part.startsWith("```") ? (
                  <pre key={j} className="bg-card p-2 rounded mt-1 overflow-x-auto text-[10px]">
                    {part.replace(/```python?\n?|```/g, "")}
                  </pre>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-muted animate-pulse px-2">Copilot is thinking...</div>
        )}
      </div>

      {messages.some((m) => m.role === "assistant" && m.content.includes("```")) && (
        <div className="px-2 pb-1">
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={applyLastSuggestion}>
            <Wand2 className="h-3 w-3 mr-1" /> Apply suggested code
          </Button>
        </div>
      )}

      <div className="p-2 border-t border-border">
        <div className="flex gap-1">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send(input))}
            placeholder="Ask Copilot..."
            className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <Button variant="accent" size="sm" onClick={() => send(input)} disabled={loading}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-[10px] text-muted mt-1 text-center">Tab to autocomplete · ⌘↵ to run</p>
      </div>
    </div>
  );
}
