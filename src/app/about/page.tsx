import Footer from "@/components/Footer";
import { Hanging, Expertise, Approach, Testimonials, Clients, Story, Bench, Awards, Faq } from "./sections";
export const metadata = { title: "About · TopLine Spaces" };
export default function About() {
  return (
    <main className="ab">
      <Hanging />
      <Expertise />
      <Approach />
      <Testimonials />
      <Clients />
      <Story />
      <Bench />
      <Awards />
      <Faq />
      <Footer />
    </main>
  );
}
