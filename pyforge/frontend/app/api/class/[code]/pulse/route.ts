import { NextResponse } from "next/server";

interface PulseEvent {
  errorType: string;
  at: string;
}

interface PulseStore {
  events: PulseEvent[];
  updatedAt: string;
}

const memoryStore = new Map<string, PulseStore>();

async function load(code: string): Promise<PulseStore> {
  const key = `pyforge:pulse:${code}`;

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import("@vercel/kv");
      const data = await kv.get<PulseStore>(key);
      if (data) return data;
    } catch {
      /* fall through */
    }
  }

  return memoryStore.get(code) ?? { events: [], updatedAt: new Date().toISOString() };
}

async function save(code: string, data: PulseStore): Promise<void> {
  const key = `pyforge:pulse:${code}`;
  memoryStore.set(code, data);

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const { kv } = await import("@vercel/kv");
      await kv.set(key, data, { ex: 86400 });
    } catch {
      /* ignore */
    }
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalized = code.toUpperCase();
  const store = await load(normalized);
  const heatmap: Record<string, number> = {};
  for (const e of store.events) {
    heatmap[e.errorType] = (heatmap[e.errorType] ?? 0) + 1;
  }
  return NextResponse.json({
    heatmap,
    total: store.events.length,
    updatedAt: store.updatedAt,
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const normalized = code.toUpperCase();
  const { errorType } = await req.json();
  if (!errorType || typeof errorType !== "string") {
    return NextResponse.json({ detail: "errorType required" }, { status: 400 });
  }

  const store = await load(normalized);
  store.events.push({ errorType: errorType.split("—")[0].trim(), at: new Date().toISOString() });
  if (store.events.length > 500) store.events = store.events.slice(-500);
  store.updatedAt = new Date().toISOString();
  await save(normalized, store);

  return NextResponse.json({ ok: true });
}
