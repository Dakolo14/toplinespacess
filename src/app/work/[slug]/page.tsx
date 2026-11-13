import { notFound } from "next/navigation";
import { works } from "@/lib/content";
import Project from "./Project";

export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = works.find((x) => x.slug === slug);
  return { title: w ? `${w.title} · TopLine Spaces` : "TopLine Spaces" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = works.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  return <Project work={works[i]} next={works[(i + 1) % works.length]} />;
}
