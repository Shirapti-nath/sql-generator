const SYSTEM_COPILOT = `You are PyForge Copilot — an expert Python assistant for data scientists, ML engineers, AI engineers, and professional Python developers.
- Suggest fixes for errors without giving away entire solutions unless asked.
- Recommend modern Python 3.10+ patterns (match/case, type hints, dataclasses).
- For ML code: mention reproducibility, vectorization, and library best practices.
- Keep responses concise. Use markdown code blocks for suggested code snippets.
- When improving code, explain WHY the change helps.`;

const SYSTEM_QUALITY = `You are a Python code reviewer for data science and ML professionals.
Return 3-5 bullet-point suggestions to improve code quality, performance, and readability.
Be specific to the user's code. Max 200 words.`;

export async function askCopilot(
  code: string,
  userMessage: string,
  errorContext?: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const prompt = errorContext
    ? `Current code:\n\`\`\`python\n${code}\n\`\`\`\n\nError:\n${errorContext}\n\nUser asks: ${userMessage}`
    : `Current code:\n\`\`\`python\n${code}\n\`\`\`\n\nUser asks: ${userMessage}`;

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: SYSTEM_COPILOT,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const block = data.content?.[0]?.text;
        if (block) return block;
      }
    } catch {
      /* fallback */
    }
  }

  return fallbackCopilot(code, userMessage, errorContext);
}

export async function askQualityReview(code: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          system: SYSTEM_QUALITY,
          messages: [{ role: "user", content: `Review this Python code:\n\`\`\`python\n${code}\n\`\`\`` }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const block = data.content?.[0]?.text;
        if (block) return block;
      }
    } catch {
      /* fallback */
    }
  }

  const { analyzeCodeQuality } = await import("@/lib/code-quality");
  const items = analyzeCodeQuality(code);
  return items.map((s) => `• **${s.title}**: ${s.message}`).join("\n");
}

function fallbackCopilot(code: string, userMessage: string, errorContext?: string): string {
  const lower = userMessage.toLowerCase();
  if (errorContext) {
    return `**Copilot (offline mode)**\n\nI see an error in your code. Try:\n1. Read the highlighted line in the editor\n2. Check the **Fix** tab for a plain-English explanation\n3. Verify variable names and indentation\n\n*Add \`ANTHROPIC_API_KEY\` to \`.env.local\` for full AI Copilot responses.*`;
  }
  if (lower.includes("fix") || lower.includes("error")) {
    return `**Copilot (offline mode)**\n\nRun your code first — if it fails, I'll use the error context to help. Common fixes:\n- Check imports are spelled correctly\n- Ensure consistent 4-space indentation\n- For ML: set \`random_state=42\` in splits\n\n*Set \`ANTHROPIC_API_KEY\` for intelligent code fixes.*`;
  }
  if (lower.includes("improve") || lower.includes("better")) {
    return `**Copilot (offline mode)**\n\nQuick improvements for your code:\n- Add type hints to function signatures\n- Use vectorized NumPy/Pandas instead of Python loops\n- Add docstrings to public functions\n\n*Enable AI Copilot with \`ANTHROPIC_API_KEY\` in \`.env.local\`.*`;
  }
  return `**PyForge Copilot**\n\nI can help fix errors, improve code, and explain Python/ML patterns. Try:\n- "Fix this error"\n- "Improve my code"\n- "Explain this function"\n\n*Configure \`ANTHROPIC_API_KEY\` for Claude-powered responses.*`;
}
