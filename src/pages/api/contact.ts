/**
 * POST /api/contact
 * Receives inquiry form submissions and sends email via Resend.
 *
 * Required environment variables (set in Cloudflare Pages dashboard):
 *   RESEND_API_KEY   — Resend API key
 *   CONTACT_TO_EMAIL — recipient email address
 */
import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;

interface InquiryPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  service?: string;
  message?: string;
  budget?: string;
  timing?: string;
  website?: string;
  turnstile_token?: string;
}

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const SERVICE_LABELS: Record<string, string> = {
  product: "Product Development",
  brand: "Branding",
  tech: "Technology Consulting",
};

export const POST: APIRoute = async ({ request }) => {
  const apiKey = (import.meta.env.RESEND_API_KEY ?? "") as string;
  const toEmail = (import.meta.env.CONTACT_TO_EMAIL ?? "") as string;
  const turnstileSecret = (import.meta.env.TURNSTILE_SECRET_KEY ?? "") as string;

  if (!apiKey || !toEmail || !turnstileSecret) {
    console.error("[contact] Missing RESEND_API_KEY, CONTACT_TO_EMAIL, or TURNSTILE_SECRET_KEY env var.");
    return new Response(
      JSON.stringify({ error: "Server configuration error." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: InquiryPayload;
  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid request body." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { name, email, phone, company, service, message, budget, timing, website, turnstile_token } = body;

  /* Honeypot — silently accept but do not send */
  if (website) {
    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  /* Turnstile verification */
  if (!turnstile_token) {
    return new Response(
      JSON.stringify({ error: "Verification challenge is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const tsForm = new URLSearchParams();
    tsForm.append("secret", turnstileSecret);
    tsForm.append("response", turnstile_token);

    const tsRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: tsForm,
    });
    const tsResult = (await tsRes.json()) as { success: boolean; "error-codes"?: string[] };

    if (!tsResult.success) {
      console.error("[contact] Turnstile verification failed:", tsResult["error-codes"]);
      return new Response(
        JSON.stringify({ error: "Verification failed. Please try again." }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    console.error("[contact] Turnstile verification error:", err);
    return new Response(
      JSON.stringify({ error: "Verification service unavailable. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!name || !email) {
    return new Response(
      JSON.stringify({ error: "Name and email are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const serviceLabel = service ? (SERVICE_LABELS[service] ?? service) : "Not specified";

  const htmlBody = `
    <h2>New inquiry from ${name}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Name</td><td>${name}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Phone</td><td>${phone || "—"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Company</td><td>${company || "—"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Service</td><td>${serviceLabel}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Message</td><td>${message || "—"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Budget</td><td>${budget || "—"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Timing</td><td>${timing || "—"}</td></tr>
    </table>
  `;

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: "Fresh Phantom <no-reply@msg.freshphantom.com>",
      to: [toEmail],
      replyTo: email,
      subject: `Inquiry from ${name}${company ? ` (${company})` : ""}`,
      html: htmlBody,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to send. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
