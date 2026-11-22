// Builds the email the studio receives when someone sends the contact form.
// Table layout and inline styles so it renders the same in Gmail, Outlook and Apple Mail.

export type Enquiry = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  start?: string;
  needs: string[];
  budget?: string;
  message?: string;
  page?: string;
};

const ORANGE = "#ff7a52";
const INK = "#161412";
const MUTED = "#6b6661";
const LINE = "#e7e3df";
const PAPER = "#f4f1ee";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const lagosTime = (d: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d) + " (Lagos)";

export function enquirySubject(e: Enquiry) {
  const what = e.needs.length ? e.needs.join(", ") : "New project";
  return `New enquiry: ${what} from ${e.name}${e.company ? ` (${e.company})` : ""}`;
}

export function enquiryText(e: Enquiry, at = new Date()) {
  const rows: [string, string | undefined][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Phone", e.phone],
    ["Company", e.company],
    ["What they need", e.needs.join(", ") || undefined],
    ["Budget", e.budget],
    ["Event or shoot date", e.start],
  ];
  return [
    "NEW PROJECT ENQUIRY · TopLine Spaces website",
    "",
    ...rows.map(([k, v]) => `${k}: ${v?.trim() || "Not given"}`),
    "",
    "Their message:",
    e.message?.trim() || "(no message)",
    "",
    `Sent ${lagosTime(at)}${e.page ? ` from ${e.page}` : ""}`,
    "Reply to this email to answer them directly.",
  ].join("\n");
}

export function enquiryHtml(e: Enquiry, at = new Date()) {
  const row = (label: string, value?: string, html?: string) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid ${LINE};width:150px;vertical-align:top;font-size:13px;color:${MUTED};">${label}</td>
      <td style="padding:14px 0;border-bottom:1px solid ${LINE};vertical-align:top;font-size:15px;font-weight:600;color:${INK};">${
        html ?? (value?.trim() ? esc(value.trim()) : `<span style="color:#b3ada7;font-weight:400;">Not given</span>`)
      }</td>
    </tr>`;

  const chips = e.needs.length
    ? e.needs
        .map((n) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 10px;background:${PAPER};border:1px solid ${LINE};font-size:13px;font-weight:600;color:${INK};">${esc(n)}</span>`)
        .join("")
    : undefined;

  const mail = esc(e.email);
  const phone = e.phone?.trim();
  const tel = phone ? phone.replace(/[^\d+]/g, "") : "";
  const wa = tel.replace(/^\+/, "").replace(/^0/, "234");
  const first = esc(e.name.trim().split(/\s+/)[0] || e.name);
  const replyHref = `mailto:${encodeURIComponent(e.email)}?subject=${encodeURIComponent("Re: your project with TopLine Spaces")}`;
  const message = e.message?.trim() ? esc(e.message.trim()).replace(/\n/g, "<br>") : `<span style="color:#b3ada7;">No message, just the details above.</span>`;

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(enquirySubject(e))}</title></head>
<body style="margin:0;padding:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">
  <div style="display:none;max-height:0;overflow:hidden;">${esc(e.name)} wants to talk about ${esc(e.needs.join(", ") || "a project")}${e.budget ? `, budget ${esc(e.budget)}` : ""}.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINE};">
        <tr><td style="height:6px;background:${ORANGE};line-height:6px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 32px 8px;">
          <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em;">TopLine Spaces</div>
          <div style="margin-top:2px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">Website enquiry</div>
        </td></tr>
        <tr><td style="padding:20px 32px 4px;">
          <div style="font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.03em;">${esc(e.name)} wants to build something.</div>
          <div style="margin-top:10px;font-size:14px;color:${MUTED};">Sent ${esc(lagosTime(at))}${e.company?.trim() ? ` · ${esc(e.company.trim())}` : ""}</div>
        </td></tr>
        <tr><td style="padding:20px 32px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="background:${ORANGE};"><a href="${replyHref}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:700;color:${INK};text-decoration:none;">Reply to ${first} →</a></td>
            ${tel ? `<td style="width:8px;"></td><td style="border:1px solid ${INK};"><a href="tel:${esc(tel)}" style="display:inline-block;padding:11px 18px;font-size:14px;font-weight:700;color:${INK};text-decoration:none;">Call</a></td>
            <td style="width:8px;"></td><td style="border:1px solid ${INK};"><a href="https://wa.me/${esc(wa)}" style="display:inline-block;padding:11px 18px;font-size:14px;font-weight:700;color:${INK};text-decoration:none;">WhatsApp</a></td>` : ""}
          </tr></table>
        </td></tr>
        <tr><td style="padding:28px 32px 0;">
          <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};margin-bottom:4px;">The brief</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid ${INK};">
            ${row("Name", e.name)}
            ${row("Email", undefined, `<a href="mailto:${mail}" style="color:${INK};">${mail}</a>`)}
            ${row("Phone", undefined, phone ? `<a href="tel:${esc(tel)}" style="color:${INK};">${esc(phone)}</a>` : undefined)}
            ${row("Company", e.company)}
            ${row("What they need", undefined, chips)}
            ${row("Budget", e.budget)}
            ${row("Event date", e.start)}
          </table>
        </td></tr>
        <tr><td style="padding:28px 32px 0;">
          <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};margin-bottom:10px;">In their words</div>
          <div style="padding:18px 20px;background:${PAPER};border-left:4px solid ${ORANGE};font-size:15px;line-height:1.6;">${message}</div>
        </td></tr>
        <tr><td style="padding:28px 32px 30px;font-size:12px;line-height:1.6;color:${MUTED};">
          Hitting Reply answers ${first} directly. We promise every brief an answer within two working days.<br>
          Sent from the contact form${e.page ? ` at ${esc(e.page)}` : ""}.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
