// Label that rolls up to a duplicate of itself on hover (parent .roll-host or itself).
export default function Roll({ children }: { children: React.ReactNode }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}
