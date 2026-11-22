"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/content";
import { Fade, Lines } from "@/components/ui/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;
const NEEDS = ["Stage design", "TV set", "Corporate event", "Party or event", "Radio studio", "Interior or kiosk", "Something else"];
const BUDGETS = ["Under ₦5m", "₦5m to ₦20m", "₦20m to ₦50m", "Over ₦50m", "Not sure yet"]; // PLACEHOLDER ranges

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span>&nbsp;</span>;
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: site.timeZone, hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false });
  const parts = Object.fromEntries(f.formatToParts(now).map((p) => [p.type, p.value]));
  const h = Number(parts.hour);
  const open = !["Sat", "Sun"].includes(parts.weekday) && h >= 9 && h < 18;
  return <span className="ct-clock"><i data-open={open || undefined} />{parts.hour}:{parts.minute} at {site.city}, {open ? "open now" : "closed now"}</span>;
}

export default function ContactForm() {
  const [need, setNeed] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const sent = status === "sent";
  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (status === "sending") return;
    const f = new FormData(ev.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    setStatus("sending");
    try {
      const res = await fetch("/api/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: get("name"), email: get("email"), phone: get("phone"), company: get("company"),
          start: get("start"), message: get("message"), website: get("website"),
          needs: need, budget, page: window.location.href,
        }),
      });
      const data = await res.json().catch(() => ({}));
      setStatus(res.ok && data.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };
  const btn = status === "sending" ? "Sending…" : sent ? "Sent, thank you" : "Send it";
  const toggle = (n: string) => setNeed((a) => (a.includes(n) ? a.filter((x) => x !== n) : [...a, n]));
  return (
    <section className="ct wrap">
      <header className="pg-head">
        <h1 className="pg-label">Contact</h1>
        <span className="label">{site.name}, since {site.since}</span>
      </header>
      <div className="ct-top">
        <Lines as="h2" className="ct-h display" lines={["Start a project"]} />
        <Fade delay={0.2} className="ct-sub">Tell us what you’re making. We answer every brief within two working days.</Fade>
      </div>
      <Fade delay={0.1}>
        <form className="ct-form" onSubmit={submit}>
          <input className="ct-hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
          <div className="ct-row two">
            <label><span>Your name</span><input name="name" required autoComplete="name" placeholder="Your name" /></label>
            <label><span>Email</span><input name="email" required type="email" autoComplete="email" placeholder="you@company.com" /></label>
          </div>
          <div className="ct-row two">
            <label><span>Phone or WhatsApp</span><input name="phone" type="tel" autoComplete="tel" placeholder="Optional" /></label>
            <label><span>Company or brand</span><input name="company" autoComplete="organization" placeholder="Optional" /></label>
          </div>
          <div className="ct-row">
            <label><span>Event or shoot date</span><input name="start" placeholder="e.g. March 2027" /></label>
          </div>
          <div className="ct-row">
            <span className="ct-l">What do you need</span>
            <div className="ct-chips">{NEEDS.map((n) => <Chip key={n} on={need.includes(n)} onClick={() => toggle(n)}>{n}</Chip>)}</div>
          </div>
          <div className="ct-row">
            <span className="ct-l">Budget</span>
            <div className="ct-chips">{BUDGETS.map((n) => <Chip key={n} on={budget === n} onClick={() => setBudget(n)}>{n}</Chip>)}</div>
          </div>
          <div className="ct-row">
            <label><span>Tell us about it</span><textarea name="message" rows={3} placeholder="The venue, the audience, the look you want" /></label>
          </div>
          <div className="ct-row ct-send">
            <button type="submit" className="ct-btn" disabled={status === "sending" || sent}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={btn} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: 0.45, ease: EASE }}>
                  {btn}
                </motion.span>
              </AnimatePresence>
            </button>
            <span className="label" role="status">
              {status === "error" ? (
                <span className="ct-err">That didn’t go through. Please email us at <a href={`mailto:${site.email}`}>{site.email}</a>.</span>
              ) : sent ? (
                `Your brief is with us at ${site.email}. We’ll reply within two working days.`
              ) : (
                `Goes straight to ${site.email}. We answer within two working days.`
              )}
            </span>
          </div>
        </form>
      </Fade>
      <div className="ct-info">
        <Fade><span className="label">Write to us</span><a href={`mailto:${site.email}`}>{site.email}</a></Fade>
        <Fade delay={0.05}><span className="label">Hours</span><span>{site.hoursLong}</span><Clock /></Fade>
      </div>
      <style>{css}</style>
    </section>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className="ct-chip" data-on={on || undefined} onClick={onClick}>
      <i>{on && <motion.b layoutId={undefined} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 30 }} />}</i>
      {children}
    </button>
  );
}

const css = `
.ct-top{display:flex;justify-content:space-between;align-items:flex-end;margin:40px 0 46px}
.ct-h{font-size:clamp(48px,5vw,70px)}
.ct-sub{max-width:360px;font-size:13px;color:var(--ink-2);font-weight:500}
.ct-form{border:1px solid #e3e3e3}
.ct-row{border-bottom:1px solid #e3e3e3;padding:26px 28px}
.ct-row:last-child{border-bottom:0}
.ct-row.two{display:grid;grid-template-columns:1fr 1fr;padding:0}
.ct-row.two label{padding:26px 28px}
.ct-row.two label+label{border-left:1px solid #e3e3e3}
.ct-row label{display:flex;flex-direction:column;gap:12px}
.ct-row label span,.ct-l{font-size:13px;color:var(--ink-2);font-weight:500}
.ct-row input,.ct-row textarea{border:0;outline:0;background:none;font-size:30px;font-weight:500;letter-spacing:-.04em;resize:none}
.ct-row input::placeholder,.ct-row textarea::placeholder{color:#b8b8b8;transition:color .4s}
.ct-row input:focus::placeholder,.ct-row textarea:focus::placeholder{color:#dcdcdc}
.ct-row:focus-within,.ct-row.two label:focus-within{background:#fbfbfa}
.ct-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.ct-chip{display:inline-flex;align-items:center;gap:8px;height:42px;padding:0 18px 0 14px;border:1px solid #d9d9d9;border-radius:999px;font-size:14px;font-weight:600;color:var(--ink);background:transparent;transition:border-color .3s,background-color .3s,color .3s,transform .4s var(--ease-out),box-shadow .4s var(--ease-out)}
.ct-chip:hover{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,transparent);transform:translateY(-2px);box-shadow:0 8px 18px -12px color-mix(in srgb,var(--accent) 80%,transparent)}
.ct-chip:active{transform:translateY(0) scale(.97);transition-duration:.12s}
.ct-chip:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.ct-chip[data-on]{border-color:var(--accent);background:var(--accent);color:var(--on-accent)}
.ct-chip[data-on]:hover{background:var(--accent-deep);border-color:var(--accent-deep)}
.ct-chip i{width:10px;height:10px;border-radius:50%;border:1px solid #c9c9c9;display:grid;place-items:center;transition:border-color .3s,transform .4s var(--ease-out)}
.ct-chip:hover i{border-color:var(--accent);transform:scale(1.15)}
.ct-chip[data-on] i{border-color:#fff}
.ct-chip b{width:6px;height:6px;border-radius:50%;background:#fff}
@media (hover:none){.ct-chip:hover{transform:none;box-shadow:none}.ct-chip:not([data-on]):hover{background:transparent;border-color:#d9d9d9}}
@media (prefers-reduced-motion:reduce){.ct-chip,.ct-chip i{transition:none}.ct-chip:hover{transform:none}}
.ct-send{display:flex;justify-content:space-between;align-items:center}
.ct-btn{position:relative;display:inline-flex;overflow:hidden;padding:0 0 6px 18px;font-size:24px;font-weight:600;letter-spacing:-.04em;height:40px}
.ct-btn::before{content:"";position:absolute;left:0;top:13px;width:8px;height:8px;border-radius:50%;background:var(--accent)}
.ct-btn::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:var(--ink);transform-origin:0 50%;transition:transform .6s var(--ease-out)}
.ct-btn:hover::after{transform:scaleX(.3)}
.ct-btn span{display:block}
.ct-btn:disabled{cursor:default}
.ct-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
.ct-err{color:#b3261e}.ct-err a{text-decoration:underline}
.ct-form{position:relative}
.ct-info{display:grid;grid-template-columns:repeat(2,1fr);margin-top:60px;padding-top:28px;border-top:1px solid #e3e3e3;font-size:13px;font-weight:600}
.ct-info>div{display:flex;flex-direction:column;gap:8px}
.ct-clock{display:flex;align-items:center;gap:8px;font-weight:500}
.ct-clock i{width:6px;height:6px;border-radius:50%;border:1px solid var(--accent)}
.ct-clock i[data-open]{background:#2bb24c;border-color:#2bb24c}
@media (max-width:809px){.ct-top{flex-direction:column;align-items:flex-start;gap:14px}.ct-row.two{grid-template-columns:1fr}.ct-row.two label+label{border-left:0;border-top:1px solid #e3e3e3}.ct-row input,.ct-row textarea{font-size:22px}.ct-info{grid-template-columns:1fr;gap:24px}.ct-send{flex-direction:column;align-items:flex-start;gap:14px}}
`;
