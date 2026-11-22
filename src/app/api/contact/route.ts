import nodemailer from "nodemailer";
import { site } from "@/lib/content";
import { enquiryHtml, enquirySubject, enquiryText, type Enquiry } from "@/lib/enquiry-email";

// Sends contact-form briefs to the studio inbox (info@toplinespaces.com).
// Mail goes out over SMTP, so any provider works: the domain's own mailbox, Zoho, Google Workspace, or Resend.
// Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS on Vercel (see README). CONTACT_TO overrides the inbox.

export const runtime = "nodejs";

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Bots fill every field, including the hidden one. Pretend it worked.
  if (clip(body.website, 200)) return Response.json({ ok: true });

  const e: Enquiry = {
    name: clip(body.name, 120),
    email: clip(body.email, 200),
    phone: clip(body.phone, 40),
    company: clip(body.company, 160),
    start: clip(body.start, 120),
    needs: Array.isArray(body.needs) ? body.needs.map((n) => clip(n, 60)).filter(Boolean).slice(0, 10) : [],
    budget: clip(body.budget, 60),
    message: clip(body.message, 5000),
    page: clip(body.page, 300),
  };
  if (!e.name || !EMAIL.test(e.email)) return Response.json({ ok: false, error: "missing_fields" }, { status: 400 });

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("[contact] SMTP is not configured; enquiry not sent:", enquirySubject(e));
    return Response.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const port = Number(SMTP_PORT || 465);
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  const to = process.env.CONTACT_TO || site.email;
  const from = process.env.CONTACT_FROM || `TopLine Spaces Website <${SMTP_USER.includes("@") ? SMTP_USER : site.email}>`;

  try {
    await transport.sendMail({
      from,
      to,
      replyTo: { name: e.name, address: e.email },
      subject: enquirySubject(e),
      text: enquiryText(e),
      html: enquiryHtml(e),
    });
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[contact] send failed", err);
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
