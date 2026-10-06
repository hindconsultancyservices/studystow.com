// existing imports
import nodemailer from "nodemailer";

// existing config + transporter + sendEmail
// existing functions:
// sendContactEmail
// sendOrderConfirmationEmail
// sendPasswordResetEmail

// NOTE: sendEmail is expected to exist in this module; if it is missing,
// define a minimal fallback implementation here.
async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP config is missing. Skipping email send.");
    return { messageId: "mock" };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: (process.env.SMTP_PORT || "587") === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
}

// ============================================================
// ADMIN INVITATION EMAIL
// ============================================================

interface AdminInvitationEmailData {
  name: string;
  email: string;
  roleName: string;
  inviteUrl: string;
  expiresAt: string | Date;
}

export async function sendAdminInvitationEmail({
  name,
  email,
  roleName,
  inviteUrl,
  expiresAt,
}: AdminInvitationEmailData) {
  const formattedExpiry = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(expiresAt));

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>StudyStow Admin Invitation</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f5f7fb;
          font-family: Arial, Helvetica, sans-serif;
        "
      >
        <div
          style="
            max-width: 620px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            overflow: hidden;
          "
        >
          <div
            style="
              padding: 26px;
              background: #111827;
              color: #ffffff;
            "
          >
            <h1 style="margin:0;font-size:24px;">StudyStow</h1>
            <p style="margin:8px 0 0;color:#d1d5db;font-size:14px;">
              Administrator Invitation
            </p>
          </div>

          <div style="padding:30px;">
            <h2 style="margin:0;color:#111827;font-size:22px;">
              You have been invited
            </h2>

            <p style="margin:20px 0 0;color:#374151;line-height:1.7;">
              Hello ${escapeHtml(name)},
            </p>

            <p style="margin:12px 0 0;color:#374151;line-height:1.7;">
              You have been invited to access the StudyStow Admin Panel.
            </p>

            <div
              style="
                margin:24px 0;
                padding:18px;
                background:#f9fafb;
                border:1px solid #e5e7eb;
                border-radius:10px;
              "
            >
              <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;">
                Assigned Role
              </p>

              <p style="margin:6px 0 0;color:#111827;font-size:17px;font-weight:700;">
                ${escapeHtml(roleName)}
              </p>
            </div>

            <div style="margin:30px 0;">
              <a
                href="${escapeHtml(inviteUrl)}"
                style="
                  display:inline-block;
                  padding:13px 22px;
                  background:#111827;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-size:14px;
                  font-weight:700;
                "
              >
                Accept Invitation
              </a>
            </div>

            <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.7;">
              This invitation expires on
              <strong>${escapeHtml(formattedExpiry)}</strong>.
            </p>

            <p
              style="
                margin-top:24px;
                color:#9ca3af;
                font-size:12px;
                line-height:1.7;
              "
            >
              If you were not expecting this invitation,
              you can safely ignore this email.
            </p>
          </div>

          <div
            style="
              padding:18px 30px;
              border-top:1px solid #e5e7eb;
              color:#6b7280;
              font-size:12px;
            "
          >
            StudyStow Team
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "You have been invited to the StudyStow Admin Panel",
    html,
    text: `
Hello ${name},

You have been invited to access the StudyStow Admin Panel.

Assigned Role: ${roleName}

Accept your invitation:
${inviteUrl}

This invitation expires on:
${formattedExpiry}

If you were not expecting this invitation, you can safely ignore this email.

StudyStow Team
    `.trim(),
  });
}


// ============================================================
// KEEP YOUR EXISTING escapeHtml FUNCTION EXACTLY AS IT IS
// ============================================================

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}