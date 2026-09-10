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

  const summaryTable = `
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Name</td><td>${name}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Phone</td><td>${phone || "\u2014"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Company</td><td>${company || "\u2014"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Service</td><td>${serviceLabel}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Message</td><td>${message || "\u2014"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Budget</td><td>${budget || "\u2014"}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-weight:bold;">Timing</td><td>${timing || "\u2014"}</td></tr>
    </table>`;

  /* Email to Fresh Phantom (internal notification) */
  const internalHtml = `
    <h2>New inquiry from ${name}</h2>
    ${summaryTable}
  `;

  /* Email to submitter (confirmation copy) */
  const confirmationHtml = `
    <div style="font-family:sans-serif;font-size:14px;color:#0A0A0A;max-width:560px;">
      <h2 style="margin:0 0 16px;">Hi ${name},</h2>
      <p style="line-height:1.6;margin:0 0 20px;">
        Thank you for reaching out to Fresh Phantom Labs. We\u2019ve received your inquiry and a member of our team will follow up within <strong>72 hours</strong>.
      </p>
      <p style="line-height:1.6;margin:0 0 24px;">
        Here\u2019s a copy of what you submitted for your records:
      </p>
      ${summaryTable}
      <hr style="border:none;border-top:1px solid #E0E0E0;margin:28px 0;" />
      <p style="font-size:12px;line-height:1.5;color:#63686D;margin:0;">
        This is an automated confirmation. Please do not reply to this email. If you need to reach us directly, email <a href="mailto:admin@freshphantom.com" style="color:#63686D;">admin@freshphantom.com</a>.
      </p>
    </div>
  `;

  const resend = new Resend(apiKey);

  try {
    /* Send internal notification */
    const { error: internalError } = await resend.emails.send({
      from: "Fresh Phantom <no-reply@msg.freshphantom.com>",
      to: [toEmail],
      replyTo: email,
      subject: `Inquiry from ${name}${company ? ` (${company})` : ""}`,
      html: internalHtml,
    });

    if (internalError) {
      console.error("[contact] Resend internal email error:", internalError);
      return new Response(
        JSON.stringify({ error: "Failed to send. Please try again." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    /* Send confirmation to submitter */
    const { error: confirmError } = await resend.emails.send({
      from: "Fresh Phantom <no-reply@msg.freshphantom.com>",
      to: [email],
      subject: "We received your inquiry \u2014 Fresh Phantom Labs",
      html: confirmationHtml,
    });

    if (confirmError) {
      console.error("[contact] Resend confirmation email error:", confirmError);
      /* Internal email succeeded, so don't fail the whole request —
         log the confirmation failure but return success to the user. */
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
