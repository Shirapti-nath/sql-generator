export interface ErrorEvent {
  type: string;
  at: string;
  line: number | null;
}

export interface ErrorTransition {
  from: string;
  to: string;
  count: number;
}

export function buildTransitions(events: ErrorEvent[]): ErrorTransition[] {
  const map = new Map<string, number>();
  for (let i = 1; i < events.length; i++) {
    const key = `${events[i - 1].type}→${events[i].type}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([key, count]) => {
      const [from, to] = key.split("→");
      return { from, to, count };
    })
    .sort((a, b) => b.count - a.count);
}

export function timelineSummary(events: ErrorEvent[]): string[] {
  if (events.length === 0) return ["No errors recorded yet — run some code!"];
  const recent = events.slice(-8);
  return recent.map((e) => {
    const t = new Date(e.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${t}: ${e.type}${e.line ? ` (line ${e.line})` : ""}`;
  });
}
