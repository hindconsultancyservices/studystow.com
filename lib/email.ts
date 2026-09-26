import nodemailer from "nodemailer";

// ============================================================
// EMAIL CONFIGURATION
// ============================================================

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const EMAIL_FROM =
  process.env.EMAIL_FROM || "StudyStow <support@studystow.com>";

const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || "support@studystow.com";


// ============================================================
// SMTP TRANSPORTER
// ============================================================

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error(
      "Email configuration is missing. Please check SMTP_HOST, SMTP_USER and SMTP_PASSWORD in .env.local"
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,

    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });
}


// ============================================================
// EMAIL TYPES
// ============================================================

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}


// ============================================================
// SEND EMAIL
// ============================================================

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailOptions) {
  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    text,
    replyTo,
  });

  return {
    success: true,
    messageId: info.messageId,
  };
}


// ============================================================
// CONTACT EMAIL
// ============================================================

interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}


export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: ContactEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>New Contact Message</title>
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
            max-width: 650px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
          "
        >
          <div
            style="
              padding: 24px;
              background: #111827;
              color: #ffffff;
            "
          >
            <h1
              style="
                margin: 0;
                font-size: 24px;
              "
            >
              StudyStow
            </h1>

            <p
              style="
                margin: 8px 0 0;
                color: #d1d5db;
              "
            >
              New Contact Message
            </p>
          </div>

          <div style="padding: 28px;">
            <div style="margin-bottom: 20px;">
              <strong>Name</strong>

              <p style="margin: 6px 0; color: #374151;">
                ${escapeHtml(name)}
              </p>
            </div>

            <div style="margin-bottom: 20px;">
              <strong>Email</strong>

              <p style="margin: 6px 0; color: #374151;">
                ${escapeHtml(email)}
              </p>
            </div>

            <div style="margin-bottom: 20px;">
              <strong>Subject</strong>

              <p style="margin: 6px 0; color: #374151;">
                ${escapeHtml(subject)}
              </p>
            </div>

            <div>
              <strong>Message</strong>

              <div
                style="
                  margin-top: 8px;
                  padding: 16px;
                  background: #f9fafb;
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  color: #374151;
                  line-height: 1.6;
                  white-space: pre-wrap;
                "
              >
                ${escapeHtml(message)}
              </div>
            </div>
          </div>

          <div
            style="
              padding: 18px 28px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 13px;
            "
          >
            This message was submitted through the StudyStow contact form.
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: SUPPORT_EMAIL,
    subject: `StudyStow Contact: ${subject}`,
    html,
    text: `
New StudyStow Contact Message

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `.trim(),
    replyTo: email,
  });
}


// ============================================================
// ORDER CONFIRMATION EMAIL
// ============================================================

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  total: number;
}


export async function sendOrderConfirmationEmail({
  customerName,
  customerEmail,
  orderNumber,
  total,
}: OrderEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
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
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
          "
        >
          <div
            style="
              padding: 24px;
              background: #111827;
              color: #ffffff;
            "
          >
            <h1 style="margin: 0;">
              StudyStow
            </h1>

            <p style="margin: 8px 0 0; color: #d1d5db;">
              Order Confirmation
            </p>
          </div>

          <div style="padding: 28px;">
            <p>
              Hello ${escapeHtml(customerName)},
            </p>

            <p>
              Thank you for your order. We have received your order
              successfully.
            </p>

            <div
              style="
                margin: 24px 0;
                padding: 18px;
                background: #f9fafb;
                border-radius: 8px;
              "
            >
              <p style="margin: 0 0 8px;">
                <strong>Order Number:</strong>
                ${escapeHtml(orderNumber)}
              </p>

              <p style="margin: 0;">
                <strong>Total:</strong>
                ₹${Number(total).toLocaleString("en-IN")}
              </p>
            </div>

            <p>
              We will notify you when your order is shipped.
            </p>

            <p>
              Regards,<br />
              StudyStow Team
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmation - ${orderNumber}`,
    html,
    text: `
Hello ${customerName},

Thank you for your order.

Order Number: ${orderNumber}
Total: ₹${Number(total).toLocaleString("en-IN")}

We will notify you when your order is shipped.

StudyStow Team
    `.trim(),
  });
}


// ============================================================
// PASSWORD RESET EMAIL
// ============================================================

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
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
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
          "
        >
          <h1 style="margin-top: 0;">
            Reset Your StudyStow Password
          </h1>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            Click the button below to create a new password.
          </p>

          <p style="margin: 30px 0;">
            <a
              href="${escapeHtml(resetUrl)}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background: #111827;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
              "
            >
              Reset Password
            </a>
          </p>

          <p style="color: #6b7280; font-size: 14px;">
            If you did not request this password reset, you can safely
            ignore this email.
          </p>

          <p>
            StudyStow Team
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your StudyStow Password",
    html,
    text: `
We received a request to reset your StudyStow password.

Reset your password using this link:
${resetUrl}

If you did not request this, you can ignore this email.

StudyStow Team
    `.trim(),
  });
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
