import { site } from "@/lib/content";

// Shows the real logo once `site.logo` is set; until then a clearly marked placeholder mark + name.
export default function Logo({ size = 22 }: { size?: number }) {
  if (site.logo) return <img src={site.logo} alt={site.name} style={{ height: size * 1.25, width: "auto", display: "block" }} />;
  return (
    <span className="logo-ph" style={{ fontSize: size }}>
      <span className="logo-ph-mark" aria-hidden title="Logo placeholder">
        <svg viewBox="0 0 24 24" width="100%" height="100%"><path d="M4 20 L20 4" stroke="currentColor" strokeWidth="1" opacity=".35" /></svg>
      </span>
      <span className="logo-ph-name">{site.name}</span>
      <style>{`.logo-ph{display:inline-flex;align-items:center;gap:.36em;font-weight:600;letter-spacing:-.05em;line-height:1}
.logo-ph-mark{display:inline-block;width:1.05em;height:1.05em;border:1.5px dashed currentColor;border-radius:.18em;opacity:.55}
.logo-ph-name{white-space:nowrap}`}</style>
    </span>
  );
}
