import WorkGrid from "./WorkGrid";
import Footer from "@/components/Footer";
export const metadata = { title: "Projects · TopLine Spaces" };
export default function WorkPage() {
  return (
    <main className="page">
      <WorkGrid />
      <Footer />
    </main>
  );
}
