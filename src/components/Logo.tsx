import { site } from "@/lib/content";

// Shows the real logo once `site.logo` is set; until then the name as a wordmark.
export default function Logo({ size = 22 }: { size?: number }) {
  if (site.logo) return <img src={site.logo} alt={site.name} style={{ height: size * 1.25, width: "auto", display: "block" }} />;
  return (
    <span className="logo-ph" style={{ fontSize: size }}>
      <span className="logo-ph-name">{site.name}</span>
      <style>{`.logo-ph{display:inline-flex;align-items:center;gap:.36em;font-weight:600;letter-spacing:-.05em;line-height:1}
.logo-ph-name{white-space:nowrap}`}</style>
    </span>
  );
}
