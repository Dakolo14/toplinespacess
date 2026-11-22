import KeystaticApp from "./keystatic";

export const metadata = { title: "Admin · TopLine Spaces", robots: { index: false } };

// Online editing needs the one-time GitHub connection (see README). Until then the admin
// only runs on localhost, where it saves straight into src/content/projects.json.
const online = process.env.NODE_ENV === "development" || !!process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG;

export default function Layout() {
  if (!online) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
        <div style={{ maxWidth: 440 }}>
          <h1 style={{ fontSize: 28, letterSpacing: "-.04em", marginBottom: 12 }}>Admin is not switched on here yet</h1>
          <p style={{ color: "var(--ink-2)", lineHeight: 1.5 }}>
            Run the site on your computer with <code>npm run dev</code> and open <code>localhost:3000/keystatic</code> to edit project texts.
            Online editing needs a one-time GitHub connection, described in the README.
          </p>
        </div>
      </main>
    );
  }
  return <KeystaticApp />;
}
