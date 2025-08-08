import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ensureEnv = () => {
  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "TO_EMAIL",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) throw new Error(`Missing env: ${missing.join(", ")}`);
};

const withTimeout = (p, ms) =>
  Promise.race([
    p,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Mail timeout")), ms)
    ),
  ]);

const brand = process.env.BRAND_NAME || "Your Site";

const ownerHtml = ({ name, email, subject, message }) => `
<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New contact</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f6f6f6; margin:0; padding:24px }
      .card { max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; border:1px solid #eee }
      h1 { font-size:18px; margin:0 0 12px }
      .meta { font-size:14px; color:#555; margin:4px 0 }
      .chip { display:inline-block; font-size:12px; background:#111; color:#fff; padding:4px 8px; border-radius:999px; margin-left:8px }
      pre { white-space:pre-wrap; word-wrap:break-word; font:14px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background:#fafafa; padding:12px; border:1px solid #eee; border-radius:8px }
      a { color:#2563eb; text-decoration:none }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>New contact on ${brand}</h1>
      <div class="meta"><strong>From</strong> ${name} &lt;<a href="mailto:${email}">${email}</a>&gt;</div>
      <div class="meta"><strong>Subject</strong> ${subject}</div>
      <div class="meta"><strong>Received</strong> ${new Date().toISOString()}</div>
      <h2 style="font-size:16px;margin:16px 0 8px">Message</h2>
      <pre>${message}</pre>
    </div>
  </body>
</html>
`;

const userHtml = ({ name }) => `
<!doctype html>
<html>
  <head>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Thanks for your message</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f6f6f6; margin:0; padding:24px }
      .card { max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; padding:24px; border:1px solid #eee }
      h1 { font-size:20px; margin:0 0 12px }
      p { font-size:14px; color:#333; margin:8px 0 }
      .footer { font-size:12px; color:#666; margin-top:24px }
      .btn { display:inline-block; background:#111; color:#fff !important; padding:10px 16px; border-radius:8px; text-decoration:none }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Thanks, ${name || "there"}.</h1>
      <p>Your message has been recieved. I will reply as soon as possible.</p>
      <p>If you need to add details, reply to this email.</p>
      <p style="margin-top:16px">
        <a class="btn" href="${process.env.SITE_URL || "#"}">Visit ${brand}</a>
      </p>
      <div class="footer">
        If you did not send this, you can ignore this email.
      </div>
    </div>
  </body>
</html>
`;

export async function POST(request) {
  try {
    const started = Date.now();
    const { name, email, subject, message, website } = await request.json();

    // Honeypot still sets cookie and exits quietly
    if (website && website.trim() !== "") {
      const res = NextResponse.json({ ok: true });
      res.cookies.set({
        name: "contact_sent",
        value: String(Date.now()),
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 5,
      });
      return res;
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );
    }

    ensureEnv();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 7000,
      socketTimeout: 15000,
    });

    // Send to you
    const ownerMail = transporter.sendMail({
      from: `"${brand} Contact" ${process.env.TO_EMAIL}`,
      replyTo: email,
      to: process.env.TO_EMAIL,
      subject: `[${brand}] ${String(subject).slice(0, 180)}`,
      text:
        `New contact on ${brand}\n\n` +
        `From: ${name} <${email}>\n` +
        `Subject: ${subject}\n\n` +
        `Message:\n${message}\n`,
      html: ownerHtml({ name, email, subject, message }),
    });

    // Send confirmation to the sender
    const userMail = transporter.sendMail({
      from: `"Alexander Hellstén" ${process.env.TO_EMAIL}`,
      to: email,
      replyTo: process.env.TO_EMAIL,
      subject: `Thanks for contacting ${brand}`,
      text:
        `Hi ${name || ""},\n\n` +
        `Thanks for your message. I will get back to you soon.\n\n` +
        `${process.env.SITE_URL || ""}\n`,
      html: userHtml({ name }),
    });

    await withTimeout(Promise.all([ownerMail, userMail]), 15000);

    const now = Date.now();
    const ms = now - started;
    console.log(`contactme sent in ${ms}ms`);

    const res = NextResponse.json({ ok: true, duration: ms });
    res.cookies.set({
      name: "contact_sent",
      value: String(now),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 5,
    });
    return res;
  } catch (err) {
    console.error("contactme error", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to send" },
      { status: 500 }
    );
  }
}
