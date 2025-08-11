/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { readFile } from "fs/promises";

import ownerHtml from "./owner.html";
import userHtml from "./user.html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ensures that the enviroment is valid
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

// Simple variable replacement: {{name}}, {{email}}, etc.
function injectVars(template, vars) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] || "");
}

// Read HTML templates
const [ownerTemplate, userTemplate] = await Promise.all([
  readFile(new URL("./owner.html", import.meta.url), "utf8"),
  readFile(new URL("./user.html", import.meta.url), "utf8"),
]);

// The mail that will be sent to the owner
const ownerHtml = ({ name, email, subject, message }) => {
  return injectVars(ownerTemplate, {
    name,
    email,
    subject,
    message,
    brand,
    date: new Date().toISOString(),
  });
};

// The mail that will be sent to the user
const userHtml = ({ name }) => {
  return injectVars(userTemplate, {
    name,
    brand,
    site_url: process.env.SITE_URL || "#",
  });
};

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

    // Validates the inputs
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

    // Sets the cookie for when the mail was sent. Prevents spamming.
    const now = Date.now();
    const ms = now - started;

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
    console.error("Error sending mail", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to send" },
      { status: 500 }
    );
  }
}
