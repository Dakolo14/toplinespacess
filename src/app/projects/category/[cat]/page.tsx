import { notFound } from "next/navigation";
import { categories } from "@/lib/content";
import WorkGrid from "../../WorkGrid";
import Footer from "@/components/Footer";

export function generateStaticParams() {
  return categories.map((c) => ({ cat: c.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const c = categories.find((x) => x.slug === cat);
  return { title: c ? `${c.label} · TopLine Spaces` : "Projects · TopLine Spaces" };
}
export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  if (!categories.some((c) => c.slug === cat)) notFound();
  return (
    <main className="page">
      <WorkGrid cat={cat} />
      <Footer />
    </main>
  );
}
