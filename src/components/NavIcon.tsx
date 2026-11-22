// Small line icons for the navigation. Each part has a class so the hover CSS in Nav.tsx
// can move it on its own: the roof lifts, the grid spreads, the envelope flap opens.
export type IconName = "home" | "work" | "about" | "journal" | "contact";

export function NavIcon({ name, big }: { name: IconName; big?: boolean }) {
  const cls = `ni ni-${name}${big ? " ni-big" : ""}`;
  switch (name) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 16 16" aria-hidden>
          <path className="roof" d="M1.5 7.5 8 2l6.5 5.5" />
          <path d="M3.5 6.5V14h9V6.5" />
          <path className="door" d="M6.5 14v-4h3v4" />
        </svg>
      );
    case "work":
      return (
        <svg className={cls} viewBox="0 0 16 16" aria-hidden>
          <rect className="a" x="2" y="2" width="5" height="5" />
          <rect className="b" x="9" y="2" width="5" height="5" />
          <rect className="c" x="2" y="9" width="5" height="5" />
          <rect className="d" x="9" y="9" width="5" height="5" />
        </svg>
      );
    case "about":
      return (
        <svg className={cls} viewBox="0 0 16 16" aria-hidden>
          <circle className="head" cx="8" cy="5" r="2.8" />
          <path className="body" d="M2.5 14.5c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
        </svg>
      );
    case "journal":
      return (
        <svg className={cls} viewBox="0 0 16 16" aria-hidden>
          <path className="page" d="M3 1.8h7.5L13 4.3v9.9H3z" />
          <path className="lines" d="M5.5 7h5M5.5 9.5h5M5.5 12h3" />
        </svg>
      );
    case "contact":
      return (
        <svg className={cls} viewBox="0 0 16 16" aria-hidden>
          <rect className="env" x="1.5" y="3.5" width="13" height="9.5" rx="1" />
          <path className="flap" d="m2 4.5 6 4.5 6-4.5" />
        </svg>
      );
  }
}
