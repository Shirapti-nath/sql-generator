/** Same-origin Next.js API routes — works without external backend */

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = err.detail || err.message || "Request failed";
    throw new ApiError(res.status, typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json();
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  plots: string[];
  exit_code: number;
  duration_ms: number;
  status: string;
  mode: string;
}

export const api = {
  register: (email: string, password: string, display_name: string) =>
    request<{ access_token: string; refresh_token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, display_name }),
    }),

  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) =>
    request<{ id: string; email: string; display_name: string }>("/api/auth/me", {}, token),

  execute: (code: string, stdin = "") =>
    request<ExecuteResult>("/api/execute", {
      method: "POST",
      body: JSON.stringify({ code, stdin }),
    }),

  getDashboard: (token: string) =>
    request<{
      streak_days: number;
      lessons_completed: number;
      exercises_passed: number;
      total_submissions: number;
      recent_runs: Array<{ execution_mode: string; duration_ms: number; ran_at: string }>;
      recent_snippets: Array<{ share_id: string; title: string; code: string }>;
      course_progress: Array<{ slug: string; title: string; percent: number; completed: number; total: number }>;
    }>("/api/dashboard/stats", {}, token).catch(() => ({
      streak_days: 0,
      lessons_completed: 0,
      exercises_passed: 0,
      total_submissions: 0,
      recent_runs: [],
      recent_snippets: [],
      course_progress: [],
    })),
};
