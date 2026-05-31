import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendWelcomeEmail(to: string, displayName: string): Promise<boolean> {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@pyforge.dev";
  const transporter = getTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Inter, system-ui, sans-serif; background:#0a0e1a; color:#e8edf5; padding:32px;">
  <div style="max-width:520px; margin:0 auto; background:#111827; border-radius:16px; border:1px solid #1e293b; overflow:hidden;">
    <div style="background:linear-gradient(135deg,#22c55e22,#3b82f622); padding:32px; text-align:center;">
      <h1 style="margin:0; font-size:28px;">Welcome to <span style="color:#22c55e;">PyForge</span></h1>
      <p style="margin:8px 0 0; color:#94a3b8; font-size:14px;">Community Edition</p>
    </div>
    <div style="padding:32px;">
      <p>Hi <strong>${displayName}</strong>,</p>
      <p>Thank you for signing up for <strong>PyForge Community Edition</strong>!</p>
      <p>You're now part of a workspace built for data scientists, ML engineers, AI engineers, and Python professionals.</p>
      <ul style="color:#94a3b8; line-height:1.8;">
        <li>Run Python with NumPy, Pandas, Matplotlib & more</li>
        <li>Tab autocomplete & AI Copilot assistance</li>
        <li>Smart error explanations when code breaks</li>
      </ul>
      <p style="text-align:center; margin-top:28px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/playground"
           style="display:inline-block; background:#22c55e; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600;">
          Open Playground
        </a>
      </p>
      <p style="margin-top:32px; font-size:12px; color:#64748b; text-align:center;">
        Happy coding,<br>The PyForge Team
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = `Hi ${displayName},\n\nThank you for signing up for PyForge Community Edition!\n\nOpen the playground: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/playground\n\nHappy coding,\nThe PyForge Team`;

  if (!transporter) {
    console.log("[PyForge Email] SMTP not configured. Welcome email would be sent to:", to);
    console.log("[PyForge Email] Subject: Welcome to PyForge Community Edition");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"PyForge" <${from}>`,
      to,
      subject: "Welcome to PyForge Community Edition 🐍",
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error("[PyForge Email] Failed to send:", err);
    return false;
  }
}
