import Footer from "@/components/Footer";
import JournalList from "./JournalList";
export const metadata = { title: "Journal · TopLine Spaces" };
export default function Journal() {
  return (<main className="page"><JournalList /><Footer /></main>);
}
